const express = require('express');
const router = express.Router();

const Joi = require('joi');
const schema = Joi.object().keys({
    token: Joi.string().length(36).required(),
    userID: Joi.string().min(1).max(30).required(),
    itemlist: Joi.array().required()
});

const admin = require('../firebase/admin');
const firestore = admin.firestore;
const uuid = require('uuid');
const Apriori = require('../ml/models/apriori/');
const Rules = require('../ml/models/apriori/rules');

router.get('/', (req, res, next) => {
    res.json({ message: '👋 Welcome to our API! Reference: ____' });
});

router.post('/app', (req, res, next) => {
    /** get a token */
    const token = uuid.v4();
    /** save token in database */
    firestore.collection('apps').doc(token).set({
        createdTimestamp: Date.now(),
        algorithm: 'APRIORI', /** KNN, best (model validation) */
        realTime: false, /** true */
        token: token
    })
    /** send message back to client */
    res.status(200);
    res.json({
        message: '🍭 Here you have your token!',
        token: token
    });
});

router.post('/items/:token', (req, res, next) => {

    console.log('new request');

    /** validate */
    Object.assign(req.query, req.params);
    req.query.itemlist = (req.query.itemlist.indexOf(',') != -1) ? req.query.itemlist.split(',') : [req.query.itemlist];
    const result = Joi.validate(req.query, schema);
    if(result.error) {
        next(new Error(result.error));
        return;
    }
    /** check if app exists */
    firestore.collection('apps').doc(req.query.token).get().then(doc => {
        if(doc.exists) {
            /** v0.0.1 -> just for statistics and other stuff */
            /*
            firestore.collection('apps').doc(req.query.token).collection('users').doc(req.query.userID).collection('items')
                .add({
                    transaction: Date.now(),
                    action: 'basic',
                    items: req.query.itemlist
                });
            */
            /** v0.0.2 -> for the model */
            firestore.collection('apps').doc(req.query.token).collection('users').doc(req.query.userID).get()
                .then(doc => {
                    if(doc.exists) {
                        firestore.collection('apps').doc(req.query.token).collection('users').doc(req.query.userID)
                            .update({
                                lastUpdate: Date.now(),
                                itemlist: admin.admin.firestore.FieldValue.arrayUnion(...req.query.itemlist)
                            }).then(() => {
                                res.json({
                                    message: '✅ Stored user action',
                                    userID: req.query.userID
                                });
                            })
                    } else {
                        firestore.collection('apps').doc(req.query.token).collection('users').doc(req.query.userID)
                            .set({
                                lastUpdate: Date.now(),
                                itemlist: req.query.itemlist
                            }).then(() => {
                                res.json({
                                    message: '✅ Stored user action',
                                    userID: req.query.userID
                                });
                            })
                    }
                })
        } else 
            sendErrorMessage(res, '🔴 App does not exist!', 404);
    }).catch(err => {
        next(new Error(err));
        return;
    })
});

router.post('/models/train/:token', async (req, res, next) => {

    console.log('✅ here')

    /** check if app exists -> query the app */
    const doc = await firestore.collection('apps').doc(req.params.token).get();
    if(doc.exists) {
        /** query all users */
        const users = await firestore.collection('apps').doc(req.params.token).collection('users').get();
        if(users.empty) {
            sendErrorMessage(res, '🔴 App has no users associated with it!', 404);
            return;
        }
        let dataPromises = [];
        users.forEach(user => {
            dataPromises.push(firestore.collection('apps').doc(req.params.token).collection('users').doc(user.id).get());
        });
        Promise.all(dataPromises).then(async resolved => {
            let data = [];
            for(let i of resolved) {
                data.push(i.data().itemlist)   
            }
            
            /** do ML */
            /** perform apriori */
            let model = new Apriori(data, 0.1, 0.6);

            let frequenItemsets = await model.expand();
            console.log(frequenItemsets);


            model.getRules()
                .then(rules => {
                    for(let i = 0; i < rules.length; i++) {
                        /** save model */
                        firestore.collection('apps').doc(req.params.token).collection('associationRules').doc(`_${i}`).set({ a: rules[i].rule[0], b: rules[i].rule[1], confidence: rules[i].confidence })
                    }
                    res.json({ message: `✅ successfully created model at /apps/${req.params.token}/rules` })
                })
                .catch(err => console.log(err));
        });

    } else 
        sendErrorMessage(res, '🔴 App does not exist!', 404);
});

router.get('/models/recommend/:token/:userID', async (req, res, next) => {
    const token = req.params.token;
    const userID = req.params.userID;
    if(!token|| !userID) {
        sendErrorMessage(res, '🔴 Please specify the token of your App and the userID of the user!', 400);
        return;
    }

    /** check if user exists */
    let check = await firestore.collection('apps').doc(token).collection('users').doc(userID).get();
    if(!check.exists) {
        sendErrorMessage(res, `🔴 User ${userID} is not associated with the app ${token}!`, 404);
        return;
    }

    /** get user's items */
    const items = await firestore.collection('apps').doc(token).collection('users').doc(userID).get();
    const itemlist = items.data().itemlist;

    /** query all rules */
    const rulesGet = await firestore.collection('apps').doc(token).collection('associationRules').orderBy('confidence', 'desc').get();
    let rules = [];
    rulesGet.forEach(rule => {
        rules.push(rule.data());
    })

    /** initialize the rules object */
    let rulesModel = new Rules(rules);

    /** apply user's itemlist to rules object */
    const recommendations = rulesModel.applyAll(itemlist);

    /** send it back to the client */
    res.json({
        message: `✅ Recommendations for user ${userID} are given!`,
        recommendations: recommendations
    })

    /** store that query has been made */
    firestore.collection('apps').doc(token).collection('recomQueries').add({
        timestamp: Date.now(),
        userID: userID
    });

});

router.get('/app/:token', async (req, res, next) => {
    if(!req.params.token) {
        sendErrorMessage(res, '🔴 Token not specified!', 400);
        return;
    }
    let check = await firestore.collection('apps').doc(req.params.token).get();
    if(check.exists) {
        res.json({
            message: '✅ App exists. This endpoint contains no further information!'
        })
    } else
        sendErrorMessage(res, '🔴 App does not exist!', 404);
})

function sendErrorMessage(res, err, statusCode) {
    res.status(statusCode || 500);
    res.json({
        status: 'error',
        error: err || '🔴 Internal Server Error!'
    });
}

module.exports = router;
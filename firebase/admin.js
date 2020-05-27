const admin = require('firebase-admin');

const serviceAccount = require('./credentials/creds.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://reconengine-6123d.firebaseio.com'
});

module.exports = { 
    admin: admin,
    db: admin.database(),
    firestore: admin.firestore()
};
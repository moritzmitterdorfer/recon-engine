const APP = 'http://reconengine.herokuapp.com';
// production: const APP = 'http://127.0.0.1:3000';

class ReconClient {

    constructor(options, callback) {
        if(!options.token)
            throw new Error('token not specified!');
        fetch(`${APP}/api/v1/app/${options.token}`)
            .then(res => res.json())
            .then(json => {
                if(json.error)
                    throw new Error('There was an error loading your app. The app might not exist!');
                this.token = options.token;
                this.connected = true;
                console.log('🍭 Successfully connected...');
                if(callback)
                    callback(this.token);
            })
            .catch(err => {
                // todo
            })
    }

    addItem(itemID) {
        if(!itemID)
            throw new Error('ItemID is not valid!');
        let currentCookies = Cookies.get('items');
        if(currentCookies)
            Cookies.set('items', `${currentCookies},${itemID}`);
        else
            Cookies.set('items', itemID);
    }

    getItems() {
        return Cookies.get('items').split(',');
    }

    setUserID() {
        if(!Cookies.get('userID')) {
            let userID = `anonymous_${uuid(20)}`;
            Cookies.set('userID', userID);
            return userID;
        }
        else return Cookies.get('userID');
    }

    getUserID() {
        return Cookies.get('userID');
    }

    async userMultipleActions(userID, itemlist) {
        const params = new URLSearchParams({ userID, itemlist })
        const res = await fetch(`${APP}/api/v1/items/${this.token}?${params}`, { method: 'POST' });
        return await res.json();
    }

    async userAction(userID, item) {
        const params = new URLSearchParams({ userID: userID, itemlist: [item] })
        const res = await fetch(`${APP}/api/v1/items/${this.token}?${params}`, { method: 'POST' });
        return await res.json();
    }

    async trainModel() {
        let ret = await fetch(`${APP}/api/v1/models/train/${this.token}`, { method: 'POST' });
        return await ret.json();
    }

    async recommend(userID) {
        let ret = await fetch(`${APP}/api/v1/models/recommend/${this.token}/${userID}`);
        let json = await ret.json();
        if(json.error)
            throw new Error(json.error);
        return json.recommendations;
    }

    recommendAnonymously(item_list, callback) {
        let userID = `anonymous_${uuid(20)}`
        this.userMultipleActions(userID, item_list).then(res => {
            this.recommend(userID).then(res => callback(res))
        }).catch(err => {
            if(err) throw err;
        })
    }

    recommendAnonymouslyByStorage(callback) {
        let items = this.getItems();
        if(items) {
            let userID = this.setUserID();
            this.userMultipleActions(userID, items).then(res => {
                this.recommend(userID).then(res => callback(res))
            }).catch(err => {
                if(err) throw err;
            })
        }
        else
            throw new Error('Items are not defined. Use addItem() to add an item.');
    }

}

class Cookies {

    static set(key, val) {
        document.cookie = `${key}=${val}`;
    }

    static get(key) {
        let pairs = document.cookie.split('; ');
        for(let i of pairs) {
            let sides = i.split('=');
            if(key == sides[0])
                return sides[1];
        }
    }

}

function uuid(length) {
    let ret = '';
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    for(let i = 0; i < length; i++) {
        ret += chars[Math.floor(Math.random() * (chars.length-1))];
    }   
    return ret;
}
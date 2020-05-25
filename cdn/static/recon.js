const APP = 'localhost:3000';

class ReconClient {

    constructor(token, options) {
        if(!token)
            throw new Error('token not specified!');
        this.token = token;
    }

    async userAction(userID, itemlist, userAction) {
        const params = new URLSearchParams({ userID, itemlist })
        const res = fetch(`${APP}/api/v1/items/${token}?${params}`, { method: 'POST' });
        return await res.json();
    }

    async trainModel() {
        return;
    }

}

module.exports = { ReconClient, APP };
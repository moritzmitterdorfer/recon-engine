class Rules {

    constructor(rules_array) {
        /** not overriding something! */
        this.rules = {};
        for(let i of rules_array) {
            let obj = { item: i.b, confidence: i.confidence };
            if(!this.rules[i.a]) 
                this.rules[i.a] = [obj];
            else
                this.rules[i.a].push(obj);
        }
    }

    apply(item) {
        if(!this.rules[item])
            return false;
        return this.rules[item].sort((a, b) => {
            if(a.confidence > b.confidence)
                return -1;
            return 1;
        });
    }
    
    applyNoSort(item) {
        if(!this.rules[item])
            return false;
        return this.rules[item];
    }

    applyAll(item_array) {
        let ret = [];
        for(let i of item_array) {
            let pred = this.applyNoSort(i);
            if(pred)
                ret.push(...pred);
        }
        /** filter them (no rule twice) */
        for(let i = 0; i < ret.length; i++) {
            for(let j = ret.length-1; j >= 0; j--) {
                if(i != j && (ret[i].item == ret[j].item)) {
                    ret[i] = -1;
                }
            }
        }
        ret = ret.filter(v => v != -1);
        ret = ret.filter(val => {
            for(let i of item_array) {
                if(i == val.item)
                    return false;
            }
            return true;
        });
        /** order them desc */
        return ret.sort((a, b) => {
            if(a.confidence > b.confidence)
                return -1;
            return 1;
        });
    }

}

module.exports = Rules;
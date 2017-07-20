class GlobalState {
    instanceExists = false;
    store = {
        places: [],
    };
    
    constructor() {
        if (!this.instanceExists) {
            this.instanceExists = true;
        }
        else {
            throw Error('GlobalState is already instantiated.')
        }
    }

    get(key) {
        this.assertKeyExists(key);
        return this.store[key];
    }

    set(newStore) {
        Object.keys(newStore).forEach(key => {
            this.assertKeyExists(key);
            this.store[key] = newStore[key];
        });
    }

    clear() {
        this.store = {};
    }

    assertKeyExists(key) {
        if (!this.store.hasOwnProperty(key)) {
            throw Error(`Property ${key} does not exist on GlobalState store.`);
        }
    }
}

module.exports = new GlobalState();
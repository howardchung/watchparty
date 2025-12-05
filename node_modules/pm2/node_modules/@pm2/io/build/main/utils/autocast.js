"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Autocast {
    constructor() {
        this.commonStrings = {
            'true': true,
            'false': false,
            'undefined': undefined,
            'null': null,
            'NaN': NaN
        };
    }
    process(key, value, o) {
        if (typeof (value) === 'object')
            return;
        o[key] = this._cast(value);
    }
    traverse(o, func) {
        for (let i in o) {
            func.apply(this, [i, o[i], o]);
            if (o[i] !== null && typeof (o[i]) === 'object') {
                this.traverse(o[i], func);
            }
        }
    }
    autocast(s) {
        if (typeof (s) === 'object') {
            this.traverse(s, this.process);
            return s;
        }
        return this._cast(s);
    }
    _cast(s) {
        let key;
        if (s instanceof Date)
            return s;
        if (typeof s === 'boolean')
            return s;
        if (!isNaN(s))
            return Number(s);
        for (key in this.commonStrings) {
            if (s === key)
                return this.commonStrings[key];
        }
        return s;
    }
}
exports.default = Autocast;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Counter {
    constructor(opts) {
        this.used = false;
        opts = opts || {};
        this._count = opts.count || 0;
    }
    val() {
        return this._count;
    }
    inc(n) {
        this.used = true;
        this._count += (n || 1);
    }
    dec(n) {
        this.used = true;
        this._count -= (n || 1);
    }
    reset(count) {
        this._count = count || 0;
    }
    isUsed() {
        return this.used;
    }
}
exports.default = Counter;

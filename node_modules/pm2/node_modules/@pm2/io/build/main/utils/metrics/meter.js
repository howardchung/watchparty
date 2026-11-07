"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EWMA_1 = require("../EWMA");
const units_1 = require("../units");
class Meter {
    constructor(opts) {
        this.used = false;
        this.mark = function (n = 1) {
            this.used = true;
            this._rate.update(n);
        };
        this.val = function () {
            return Math.round(this._rate.rate(this._samples * units_1.default.SECONDS) * 100) / 100;
        };
        const self = this;
        if (typeof opts !== 'object') {
            opts = {};
        }
        this._samples = opts.samples || opts.seconds || 1;
        this._timeframe = opts.timeframe || 60;
        this._tickInterval = opts.tickInterval || 5 * units_1.default.SECONDS;
        this._rate = new EWMA_1.default(this._timeframe * units_1.default.SECONDS, this._tickInterval);
        if (opts.debug && opts.debug === true) {
            return;
        }
        this._interval = setInterval(function () {
            self._rate.tick();
        }, this._tickInterval);
        this._interval.unref();
    }
    isUsed() {
        return this.used;
    }
}
exports.default = Meter;

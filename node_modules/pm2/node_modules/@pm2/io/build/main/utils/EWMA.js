"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const units_1 = require("./units");
class ExponentiallyWeightedMovingAverage {
    constructor(timePeriod, tickInterval) {
        this._count = 0;
        this._rate = 0;
        this.TICK_INTERVAL = 5 * units_1.default.SECONDS;
        this._timePeriod = timePeriod || 1 * units_1.default.MINUTES;
        this._tickInterval = tickInterval || this.TICK_INTERVAL;
        this._alpha = 1 - Math.exp(-this._tickInterval / this._timePeriod);
    }
    update(n) {
        this._count += n;
    }
    tick() {
        const instantRate = this._count / this._tickInterval;
        this._count = 0;
        this._rate += (this._alpha * (instantRate - this._rate));
    }
    rate(timeUnit) {
        return (this._rate || 0) * timeUnit;
    }
}
exports.default = ExponentiallyWeightedMovingAverage;

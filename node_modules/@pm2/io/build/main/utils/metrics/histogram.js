"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EDS_1 = require("../EDS");
class Histogram {
    constructor(opts) {
        this._sample = new EDS_1.default();
        this._count = 0;
        this._sum = 0;
        this._varianceM = 0;
        this._varianceS = 0;
        this._ema = 0;
        this.used = false;
        opts = opts || {};
        this._measurement = opts.measurement;
        this._callFn = null;
        const methods = {
            min: this.getMin,
            max: this.getMax,
            sum: this.getSum,
            count: this.getCount,
            variance: this._calculateVariance,
            mean: this._calculateMean,
            ema: this.getEma()
        };
        if (methods.hasOwnProperty(this._measurement)) {
            this._callFn = methods[this._measurement];
        }
        else {
            this._callFn = function () {
                const percentiles = this.percentiles([0.5, 0.75, 0.95, 0.99, 0.999]);
                const medians = {
                    median: percentiles[0.5],
                    p75: percentiles[0.75],
                    p95: percentiles[0.95],
                    p99: percentiles[0.99],
                    p999: percentiles[0.999]
                };
                return medians[this._measurement];
            };
        }
    }
    update(value) {
        this.used = true;
        this._count++;
        this._sum += value;
        this._sample.update(value);
        this._updateMin(value);
        this._updateMax(value);
        this._updateVariance(value);
        this._updateEma(value);
    }
    percentiles(percentiles) {
        const values = this._sample
            .toArray()
            .sort(function (a, b) {
            return (a === b)
                ? 0
                : a - b;
        });
        const results = {};
        for (let i = 0; i < percentiles.length; i++) {
            const percentile = percentiles[i];
            if (!values.length) {
                results[percentile] = null;
                continue;
            }
            const pos = percentile * (values.length + 1);
            if (pos < 1) {
                results[percentile] = values[0];
            }
            else if (pos >= values.length) {
                results[percentile] = values[values.length - 1];
            }
            else {
                const lower = values[Math.floor(pos) - 1];
                const upper = values[Math.ceil(pos) - 1];
                results[percentile] = lower + (pos - Math.floor(pos)) * (upper - lower);
            }
        }
        return results;
    }
    val() {
        if (typeof (this._callFn) === 'function') {
            return this._callFn();
        }
        else {
            return this._callFn;
        }
    }
    getMin() {
        return this._min;
    }
    getMax() {
        return this._max;
    }
    getSum() {
        return this._sum;
    }
    getCount() {
        return this._count;
    }
    getEma() {
        return this._ema;
    }
    fullResults() {
        const percentiles = this.percentiles([0.5, 0.75, 0.95, 0.99, 0.999]);
        return {
            min: this._min,
            max: this._max,
            sum: this._sum,
            variance: this._calculateVariance(),
            mean: this._calculateMean(),
            count: this._count,
            median: percentiles[0.5],
            p75: percentiles[0.75],
            p95: percentiles[0.95],
            p99: percentiles[0.99],
            p999: percentiles[0.999],
            ema: this._ema
        };
    }
    _updateMin(value) {
        if (this._min === undefined || value < this._min) {
            this._min = value;
        }
    }
    _updateMax(value) {
        if (this._max === undefined || value > this._max) {
            this._max = value;
        }
    }
    _updateVariance(value) {
        if (this._count === 1)
            return this._varianceM = value;
        const oldM = this._varianceM;
        this._varianceM += ((value - oldM) / this._count);
        this._varianceS += ((value - oldM) * (value - this._varianceM));
    }
    _updateEma(value) {
        if (this._count <= 1)
            return this._ema = this._calculateMean();
        const alpha = 2 / (1 + this._count);
        this._ema = value * alpha + this._ema * (1 - alpha);
    }
    _calculateMean() {
        return (this._count === 0)
            ? 0
            : this._sum / this._count;
    }
    _calculateVariance() {
        return (this._count <= 1)
            ? null
            : this._varianceS / (this._count - 1);
    }
    isUsed() {
        return this.used;
    }
}
exports.default = Histogram;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9ncmFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWxzL21ldHJpY3MvaGlzdG9ncmFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsZ0NBQXdCO0FBRXhCLE1BQXFCLFNBQVM7SUFrQjVCLFlBQWEsSUFBSztRQWRWLFlBQU8sR0FBRyxJQUFJLGFBQUcsRUFBRSxDQUFBO1FBR25CLFdBQU0sR0FBVyxDQUFDLENBQUE7UUFDbEIsU0FBSSxHQUFXLENBQUMsQ0FBQTtRQUloQixlQUFVLEdBQVcsQ0FBQyxDQUFBO1FBQ3RCLGVBQVUsR0FBVyxDQUFDLENBQUE7UUFDdEIsU0FBSSxHQUFXLENBQUMsQ0FBQTtRQUVoQixTQUFJLEdBQVksS0FBSyxDQUFBO1FBRzNCLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFBO1FBRWpCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQTtRQUNwQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtRQUVuQixNQUFNLE9BQU8sR0FBRztZQUNkLEdBQUcsRUFBUSxJQUFJLENBQUMsTUFBTTtZQUN0QixHQUFHLEVBQVEsSUFBSSxDQUFDLE1BQU07WUFDdEIsR0FBRyxFQUFRLElBQUksQ0FBQyxNQUFNO1lBQ3RCLEtBQUssRUFBTSxJQUFJLENBQUMsUUFBUTtZQUN4QixRQUFRLEVBQUcsSUFBSSxDQUFDLGtCQUFrQjtZQUNsQyxJQUFJLEVBQU8sSUFBSSxDQUFDLGNBQWM7WUFFOUIsR0FBRyxFQUFRLElBQUksQ0FBQyxNQUFNLEVBQUU7U0FDekIsQ0FBQTtRQUVELElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDN0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO1NBQzFDO2FBQU07WUFDTCxJQUFJLENBQUMsT0FBTyxHQUFHO2dCQUNi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
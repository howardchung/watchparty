'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricService = exports.HistogramOptions = exports.MetricBulk = exports.Metric = exports.MetricMeasurements = exports.MetricType = void 0;
const meter_1 = require("../utils/metrics/meter");
const counter_1 = require("../utils/metrics/counter");
const histogram_1 = require("../utils/metrics/histogram");
const serviceManager_1 = require("../serviceManager");
const constants_1 = require("../constants");
const Debug = require("debug");
const gauge_1 = require("../utils/metrics/gauge");
var MetricType;
(function (MetricType) {
    MetricType["meter"] = "meter";
    MetricType["histogram"] = "histogram";
    MetricType["counter"] = "counter";
    MetricType["gauge"] = "gauge";
    MetricType["metric"] = "metric";
})(MetricType = exports.MetricType || (exports.MetricType = {}));
var MetricMeasurements;
(function (MetricMeasurements) {
    MetricMeasurements["min"] = "min";
    MetricMeasurements["max"] = "max";
    MetricMeasurements["sum"] = "sum";
    MetricMeasurements["count"] = "count";
    MetricMeasurements["variance"] = "variance";
    MetricMeasurements["mean"] = "mean";
    MetricMeasurements["stddev"] = "stddev";
    MetricMeasurements["median"] = "median";
    MetricMeasurements["p75"] = "p75";
    MetricMeasurements["p95"] = "p95";
    MetricMeasurements["p99"] = "p99";
    MetricMeasurements["p999"] = "p999";
})(MetricMeasurements = exports.MetricMeasurements || (exports.MetricMeasurements = {}));
class Metric {
}
exports.Metric = Metric;
class MetricBulk extends Metric {
}
exports.MetricBulk = MetricBulk;
class HistogramOptions extends Metric {
}
exports.HistogramOptions = HistogramOptions;
class MetricService {
    constructor() {
        this.metrics = new Map();
        this.timer = null;
        this.transport = null;
        this.logger = Debug('axm:services:metrics');
    }
    init() {
        this.transport = serviceManager_1.ServiceManager.get('transport');
        if (this.transport === null)
            return this.logger('Failed to init metrics service cause no transporter');
        this.logger('init');
        this.timer = setInterval(() => {
            if (this.transport === null)
                return this.logger('Abort metrics update since transport is not available');
            this.logger('refreshing metrics value');
            for (let metric of this.metrics.values()) {
                metric.value = metric.handler();
            }
            this.logger('sending update metrics value to transporter');
            const metricsToSend = Array.from(this.metrics.values())
                .filter(metric => {
                if (metric === null || metric === undefined)
                    return false;
                if (metric.value === undefined || metric.value === null)
                    return false;
                const isNumber = typeof metric.value === 'number';
                const isString = typeof metric.value === 'string';
                const isBoolean = typeof metric.value === 'boolean';
                const isValidNumber = !isNaN(metric.value);
                return isString || isBoolean || (isNumber && isValidNumber);
            });
            this.transport.setMetrics(metricsToSend);
        }, constants_1.default.METRIC_INTERVAL);
        this.timer.unref();
    }
    registerMetric(metric) {
        if (typeof metric.name !== 'string') {
            console.error(`Invalid metric name declared: ${metric.name}`);
            return console.trace();
        }
        else if (typeof metric.type !== 'string') {
            console.error(`Invalid metric type declared: ${metric.type}`);
            return console.trace();
        }
        else if (typeof metric.handler !== 'function') {
            console.error(`Invalid metric handler declared: ${metric.handler}`);
            return console.trace();
        }
        if (typeof metric.historic !== 'boolean') {
            metric.historic = true;
        }
        this.logger(`Registering new metric: ${metric.name}`);
        this.metrics.set(metric.name, metric);
    }
    meter(opts) {
        const metric = {
            name: opts.name,
            type: MetricType.meter,
            id: opts.id,
            historic: opts.historic,
            implementation: new meter_1.default(opts),
            unit: opts.unit,
            handler: function () {
                return this.implementation.isUsed() ? this.implementation.val() : NaN;
            }
        };
        this.registerMetric(metric);
        return metric.implementation;
    }
    counter(opts) {
        const metric = {
            name: opts.name,
            type: MetricType.counter,
            id: opts.id,
            historic: opts.historic,
            implementation: new counter_1.default(opts),
            unit: opts.unit,
            handler: function () {
                return this.implementation.isUsed() ? this.implementation.val() : NaN;
            }
        };
        this.registerMetric(metric);
        return metric.implementation;
    }
    histogram(opts) {
        if (opts.measurement === undefined || opts.measurement === null) {
            opts.measurement = MetricMeasurements.mean;
        }
        const metric = {
            name: opts.name,
            type: MetricType.histogram,
            id: opts.id,
            historic: opts.historic,
            implementation: new histogram_1.default(opts),
            unit: opts.unit,
            handler: function () {
                return this.implementation.isUsed() ?
                    (Math.round(this.implementation.val() * 100) / 100) : NaN;
            }
        };
        this.registerMetric(metric);
        return metric.implementation;
    }
    metric(opts) {
        let metric;
        if (typeof opts.value === 'function') {
            metric = {
                name: opts.name,
                type: MetricType.gauge,
                id: opts.id,
                implementation: undefined,
                historic: opts.historic,
                unit: opts.unit,
                handler: opts.value
            };
        }
        else {
            metric = {
                name: opts.name,
                type: MetricType.gauge,
                id: opts.id,
                historic: opts.historic,
                implementation: new gauge_1.default(),
                unit: opts.unit,
                handler: function () {
                    return this.implementation.isUsed() ? this.implementation.val() : NaN;
                }
            };
        }
        this.registerMetric(metric);
        return metric.implementation;
    }
    deleteMetric(name) {
        return this.metrics.delete(name);
    }
    destroy() {
        if (this.timer !== null) {
            clearInterval(this.timer);
        }
        this.metrics.clear();
    }
}
exports.MetricService = MetricService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2aWNlcy9tZXRyaWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTs7O0FBRVosa0RBQTBDO0FBQzFDLHNEQUE4QztBQUM5QywwREFBa0Q7QUFDbEQsc0RBQTJEO0FBQzNELDRDQUFvQztBQUVwQywrQkFBOEI7QUFDOUIsa0RBQTBDO0FBRTFDLElBQVksVUFNWDtBQU5ELFdBQVksVUFBVTtJQUNwQiw2QkFBaUIsQ0FBQTtJQUNqQixxQ0FBeUIsQ0FBQTtJQUN6QixpQ0FBcUIsQ0FBQTtJQUNyQiw2QkFBaUIsQ0FBQTtJQUNqQiwrQkFBbUIsQ0FBQTtBQUNyQixDQUFDLEVBTlcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFNckI7QUFFRCxJQUFZLGtCQWFYO0FBYkQsV0FBWSxrQkFBa0I7SUFDNUIsaUNBQWEsQ0FBQTtJQUNiLGlDQUFhLENBQUE7SUFDYixpQ0FBYSxDQUFBO0lBQ2IscUNBQWlCLENBQUE7SUFDakIsMkNBQXVCLENBQUE7SUFDdkIsbUNBQWUsQ0FBQTtJQUNmLHVDQUFtQixDQUFBO0lBQ25CLHVDQUFtQixDQUFBO0lBQ25CLGlDQUFhLENBQUE7SUFDYixpQ0FBYSxDQUFBO0lBQ2IsaUNBQWEsQ0FBQTtJQUNiLG1DQUFlLENBQUE7QUFDakIsQ0FBQyxFQWJXLGtCQUFrQixHQUFsQiwwQkFBa0IsS0FBbEIsMEJBQWtCLFFBYTdCO0FBdUNELE1BQWEsTUFBTTtDQTBCbEI7QUExQkQsd0JBMEJDO0FBRUQsTUFBYSxVQUFXLFNBQVEsTUFBTTtDQUVyQztBQUZELGdDQUVDO0FBRUQsTUFBYSxnQkFBaUIsU0FBUSxNQUFNO0NBRTNDO0FBRkQsNENBRUM7QUFFRCxNQUFhLGFBQWE7SUFBMUI7UUFFVSxZQUFPLEdBQWdDLElBQUksR0FBRyxFQUFFLENBQUE7UUFDaEQsVUFBSyxHQUF3QixJQUFJLENBQUE7UUFDakMsY0FB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
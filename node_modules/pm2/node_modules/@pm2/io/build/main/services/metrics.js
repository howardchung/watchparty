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
})(MetricType || (exports.MetricType = MetricType = {}));
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
})(MetricMeasurements || (exports.MetricMeasurements = MetricMeasurements = {}));
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

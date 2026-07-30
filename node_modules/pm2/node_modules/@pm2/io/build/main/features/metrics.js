"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsFeature = exports.MetricConfig = exports.defaultMetricConf = void 0;
const debug_1 = require("debug");
const featureManager_1 = require("../featureManager");
const eventLoopMetrics_1 = require("../metrics/eventLoopMetrics");
const network_1 = require("../metrics/network");
const httpMetrics_1 = require("../metrics/httpMetrics");
const v8_1 = require("../metrics/v8");
const runtime_1 = require("../metrics/runtime");
exports.defaultMetricConf = {
    eventLoop: true,
    network: false,
    http: true,
    runtime: true,
    v8: true
};
class MetricConfig {
}
exports.MetricConfig = MetricConfig;
class AvailableMetric {
}
const availableMetrics = [
    {
        name: 'eventloop',
        module: eventLoopMetrics_1.default,
        optionsPath: 'eventLoop'
    },
    {
        name: 'http',
        module: httpMetrics_1.default,
        optionsPath: 'http'
    },
    {
        name: 'network',
        module: network_1.default,
        optionsPath: 'network'
    },
    {
        name: 'v8',
        module: v8_1.default,
        optionsPath: 'v8'
    },
    {
        name: 'runtime',
        module: runtime_1.default,
        optionsPath: 'runtime'
    }
];
class MetricsFeature {
    constructor() {
        this.logger = (0, debug_1.default)('axm:features:metrics');
    }
    init(options) {
        if (typeof options !== 'object')
            options = {};
        this.logger('init');
        for (let availableMetric of availableMetrics) {
            const metric = new availableMetric.module();
            let config = undefined;
            if (typeof availableMetric.optionsPath !== 'string') {
                config = {};
            }
            else if (availableMetric.optionsPath === '.') {
                config = options;
            }
            else {
                config = (0, featureManager_1.getObjectAtPath)(options, availableMetric.optionsPath);
            }
            metric.init(config);
            availableMetric.instance = metric;
        }
    }
    get(name) {
        const metric = availableMetrics.find(metric => metric.name === name);
        if (metric === undefined)
            return undefined;
        return metric.instance;
    }
    destroy() {
        this.logger('destroy');
        for (let availableMetric of availableMetrics) {
            if (availableMetric.instance === undefined)
                continue;
            availableMetric.instance.destroy();
        }
    }
}
exports.MetricsFeature = MetricsFeature;

'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = exports.IOConfig = void 0;
const configuration_1 = require("./configuration");
const debug_1 = require("debug");
const serviceManager_1 = require("./serviceManager");
const transport_1 = require("./services/transport");
const featureManager_1 = require("./featureManager");
const actions_1 = require("./services/actions");
const metrics_1 = require("./services/metrics");
const constants_1 = require("./constants");
const runtimeStats_1 = require("./services/runtimeStats");
const entrypoint_1 = require("./features/entrypoint");
class IOConfig {
    constructor() {
        this.catchExceptions = true;
        this.profiling = true;
        this.standalone = false;
    }
}
exports.IOConfig = IOConfig;
exports.defaultConfig = {
    catchExceptions: true,
    profiling: true,
    metrics: {
        v8: true,
        network: false,
        eventLoop: true,
        runtime: true,
        http: true
    },
    standalone: false,
    apmOptions: undefined,
};
class PMX {
    constructor() {
        this.featureManager = new featureManager_1.FeatureManager();
        this.transport = null;
        this.actionService = null;
        this.metricService = null;
        this.runtimeStatsService = null;
        this.logger = (0, debug_1.default)('axm:main');
        this.initialized = false;
        this.Entrypoint = entrypoint_1.Entrypoint;
    }
    init(config) {
        const callsite = (new Error().stack || '').split('\n')[2];
        if (callsite && callsite.length > 0) {
            this.logger(`init from ${callsite}`);
        }
        if (this.initialized === true) {
            this.logger(`Calling init but was already the case, destroying and recreating`);
            this.destroy();
        }
        if (config === undefined) {
            config = exports.defaultConfig;
        }
        if (!config.standalone) {
            const autoStandalone = process.env.PM2_SECRET_KEY && process.env.PM2_PUBLIC_KEY && process.env.PM2_APP_NAME;
            config.standalone = !!autoStandalone;
            config.apmOptions = autoStandalone ? {
                secretKey: process.env.PM2_SECRET_KEY,
                publicKey: process.env.PM2_PUBLIC_KEY,
                appName: process.env.PM2_APP_NAME
            } : undefined;
        }
        this.transport = (0, transport_1.createTransport)(config.standalone === true ? 'websocket' : 'ipc', config.apmOptions);
        serviceManager_1.ServiceManager.set('transport', this.transport);
        if ((0, constants_1.canUseInspector)()) {
            const Inspector = require('./services/inspector');
            const inspectorService = new Inspector();
            inspectorService.init();
            serviceManager_1.ServiceManager.set('inspector', inspectorService);
        }
        this.actionService = new actions_1.ActionService();
        this.actionService.init();
        serviceManager_1.ServiceManager.set('actions', this.actionService);
        this.metricService = new metrics_1.MetricService();
        this.metricService.init();
        serviceManager_1.ServiceManager.set('metrics', this.metricService);
        this.runtimeStatsService = new runtimeStats_1.RuntimeStatsService();
        this.runtimeStatsService.init();
        if (this.runtimeStatsService.isEnabled()) {
            serviceManager_1.ServiceManager.set('runtimeStats', this.runtimeStatsService);
        }
        this.featureManager.init(config);
        configuration_1.default.init(config);
        this.initialConfig = config;
        this.initialized = true;
        return this;
    }
    destroy() {
        this.logger('destroy');
        this.featureManager.destroy();
        if (this.actionService !== null) {
            this.actionService.destroy();
        }
        if (this.transport !== null) {
            this.transport.destroy();
        }
        if (this.metricService !== null) {
            this.metricService.destroy();
        }
        if (this.runtimeStatsService !== null) {
            this.runtimeStatsService.destroy();
        }
        const inspectorService = serviceManager_1.ServiceManager.get('inspector');
        if (inspectorService !== undefined) {
            inspectorService.destroy();
        }
    }
    getConfig() {
        return this.initialConfig;
    }
    notifyError(error, context) {
        const notify = this.featureManager.get('notify');
        return notify.notifyError(error, context);
    }
    metrics(metric) {
        const res = [];
        if (metric === undefined || metric === null) {
            console.error(`Received empty metric to create`);
            console.trace();
            return [];
        }
        let metrics = !Array.isArray(metric) ? [metric] : metric;
        for (let metric of metrics) {
            if (typeof metric.name !== 'string') {
                console.error(`Trying to create a metrics without a name`, metric);
                console.trace();
                res.push({});
                continue;
            }
            if (metric.type === undefined) {
                metric.type = metrics_1.MetricType.gauge;
            }
            switch (metric.type) {
                case metrics_1.MetricType.counter: {
                    res.push(this.counter(metric));
                    continue;
                }
                case metrics_1.MetricType.gauge: {
                    res.push(this.gauge(metric));
                    continue;
                }
                case metrics_1.MetricType.histogram: {
                    res.push(this.histogram(metric));
                    continue;
                }
                case metrics_1.MetricType.meter: {
                    res.push(this.meter(metric));
                    continue;
                }
                case metrics_1.MetricType.metric: {
                    res.push(this.gauge(metric));
                    continue;
                }
                default: {
                    console.error(`Invalid metric type ${metric.type} for metric ${metric.name}`);
                    console.trace();
                    res.push({});
                    continue;
                }
            }
        }
        return res;
    }
    histogram(config) {
        if (typeof config === 'string') {
            config = {
                name: config,
                measurement: metrics_1.MetricMeasurements.mean
            };
        }
        if (this.metricService === null) {
            return console.trace(`Tried to register a metric without initializing @pm2/io`);
        }
        return this.metricService.histogram(config);
    }
    metric(config) {
        if (typeof config === 'string') {
            config = {
                name: config
            };
        }
        if (this.metricService === null) {
            return console.trace(`Tried to register a metric without initializing @pm2/io`);
        }
        return this.metricService.metric(config);
    }
    gauge(config) {
        if (typeof config === 'string') {
            config = {
                name: config
            };
        }
        if (this.metricService === null) {
            return console.trace(`Tried to register a metric without initializing @pm2/io`);
        }
        return this.metricService.metric(config);
    }
    counter(config) {
        if (typeof config === 'string') {
            config = {
                name: config
            };
        }
        if (this.metricService === null) {
            return console.trace(`Tried to register a metric without initializing @pm2/io`);
        }
        return this.metricService.counter(config);
    }
    meter(config) {
        if (typeof config === 'string') {
            config = {
                name: config
            };
        }
        if (this.metricService === null) {
            return console.trace(`Tried to register a metric without initializing @pm2/io`);
        }
        return this.metricService.meter(config);
    }
    action(name, opts, fn) {
        if (typeof name === 'object') {
            const tmp = name;
            name = tmp.name;
            opts = tmp.options;
            fn = tmp.action;
        }
        if (this.actionService === null) {
            return console.trace(`Tried to register a action without initializing @pm2/io`);
        }
        return this.actionService.registerAction(name, opts, fn);
    }
    onExit(callback) {
        if (typeof callback === 'function') {
            const onExit = require('signal-exit');
            return onExit(callback);
        }
    }
    emit(name, data) {
        const events = this.featureManager.get('events');
        return events.emit(name, data);
    }
    initModule(opts, cb) {
        if (!opts)
            opts = {};
        if (opts.reference) {
            opts.name = opts.reference;
            delete opts.reference;
        }
        opts = Object.assign({
            widget: {}
        }, opts);
        opts.widget = Object.assign({
            type: 'generic',
            logo: 'https://app.keymetrics.io/img/logo/keymetrics-300.png',
            theme: ['#111111', '#1B2228', '#807C7C', '#807C7C']
        }, opts.widget);
        opts.isModule = true;
        opts = configuration_1.default.init(opts);
        return typeof cb === 'function' ? cb(null, opts) : opts;
    }
    expressErrorHandler() {
        const notify = this.featureManager.get('notify');
        return notify.expressErrorHandler();
    }
    koaErrorHandler() {
        const notify = this.featureManager.get('notify');
        return notify.koaErrorHandler();
    }
}
exports.default = PMX;

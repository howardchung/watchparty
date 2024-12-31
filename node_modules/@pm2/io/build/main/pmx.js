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
        this.tracing = false;
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
    tracing: {
        enabled: false,
        outbound: false
    }
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
    getTracer() {
        const tracing = this.featureManager.get('tracing');
        return tracing.getTracer();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG14LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BteC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7OztBQUVaLG1EQUEyQztBQUMzQyxpQ0FBeUI7QUFDekIscURBQWlEO0FBQ2pELG9EQUFrRjtBQUNsRixxREFBaUQ7QUFDakQsZ0RBQWtEO0FBRWxELGdEQUF3SDtBQVF4SCwyQ0FBNkM7QUFHN0MsMERBQTZEO0FBQzdELHNEQUFrRDtBQUdsRCxNQUFhLFFBQVE7SUFBckI7UUFJRSxvQkFBZSxHQUFhLElBQUksQ0FBQTtRQWNoQyxjQUFTLEdBQStCLElBQUksQ0FBQTtRQUk1QyxZQUFPLEdBQTZCLEtBQUssQ0FBQTtRQUt6QyxlQUFVLEdBQWEsS0FBSyxDQUFBO0lBSzlCLENBQUM7Q0FBQTtBQWhDRCw0QkFnQ0M7QUFFWSxRQUFBLGFBQWEsR0FBYTtJQUNyQyxlQUFlLEVBQUUsSUFBSTtJQUNyQixTQUFTLEVBQUUsSUFBSTtJQUNmLE9BQU8sRUFBRTtRQUNQLEVBQUUsRUFBRSxJQUFJO1FBQ1IsT0FBTyxFQUFFLEtBQUs7UUFDZCxTQUFTLEVBQUUsSUFBSTtRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsSUFBSSxFQUFFLElBQUk7S0FDWDtJQUNELFVBQVUsRUFBRSxLQUFLO0lBQ2pCLFVBQVUsRUFBRSxTQUFTO0lBQ3JCLE9BQU8sRUFBRTtRQUNQLE9BQU8sRUFBRSxLQUFLO1FBQ2QsUUFBUSxFQUFFLEtBQUs7S0FDaEI7Q0FDRixDQUFBO0FBRUQsTUFBcUIsR0FBRztJQUF4QjtRQUdVLG1CQUFjLEdBQW1CLElBQUksK0JBQWMsRUFBRSxDQUFBO1FBQ3JELGNBQVMsR0FBcUIsSUFBSSxDQUFBO1FBQ2xDLGtCQUFhLEdBQXlCLElBQUksQ0FBQTtRQUMxQyxrQkFBYSxHQUF5QixJQUFJLENBQUE7UUFDMUMsd0JBQW1CLEdBQStCLElBQUksQ0FBQTtRQUN0RCxXQUFNLEdBQWEsSUFBQSxlQUFLLEVBQUMs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
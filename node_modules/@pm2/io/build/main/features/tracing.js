"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TracingFeature = void 0;
const Debug = require("debug");
const configuration_1 = require("../configuration");
const path_1 = require("path");
const httpMethodToIgnore = [
    'options',
    'head'
];
const defaultTracingConfig = {
    enabled: false,
    outbound: false,
    samplingRate: 0,
    ignoreIncomingPaths: [],
    ignoreOutgoingUrls: [],
    detailedDatabasesCalls: false,
    createSpanWithNet: false
};
const enabledTracingConfig = {
    enabled: true,
    outbound: false,
    samplingRate: 0.5,
    ignoreIncomingPaths: [
        (url, request) => {
            const method = (request.method || 'GET').toLowerCase();
            return httpMethodToIgnore.indexOf(method) > -1;
        },
        /(.*).js/,
        /(.*).css/,
        /(.*).png/,
        /(.*).ico/,
        /(.*).svg/,
        /webpack/
    ],
    ignoreOutgoingUrls: [],
    detailedDatabasesCalls: false,
    createSpanWithNet: false
};
class TracingFeature {
    constructor() {
        this.logger = Debug('axm:tracing');
    }
    init(config) {
        this.logger('init tracing');
        if (config.tracing === undefined) {
            config.tracing = defaultTracingConfig;
        }
        else if (config.tracing === true) {
            config.tracing = enabledTracingConfig;
        }
        else if (config.tracing === false) {
            config.tracing = defaultTracingConfig;
        }
        if (config.tracing.enabled === false) {
            return this.logger('tracing disabled');
        }
        this.options = Object.assign(enabledTracingConfig, config.tracing);
        if (typeof config.apmOptions === 'object' && typeof config.apmOptions.appName === 'string') {
            this.options.serviceName = config.apmOptions.appName;
        }
        else if (typeof process.env.name === 'string') {
            this.options.serviceName = process.env.name;
        }
        if (config.tracing.ignoreOutgoingUrls === undefined) {
            config.tracing.ignoreOutgoingUrls = enabledTracingConfig.ignoreOutgoingUrls;
        }
        if (config.tracing.ignoreIncomingPaths === undefined) {
            config.tracing.ignoreIncomingPaths = enabledTracingConfig.ignoreIncomingPaths;
        }
        const B3Format = require('@opencensus/propagation-b3').B3Format;
        const CustomCensusExporter = require('../census/exporter').CustomCensusExporter;
        const Tracing = require('../census/tracer').Tracing;
        this.exporter = new CustomCensusExporter(this.options);
        if (this.tracer && this.tracer.active) {
            throw new Error(`Tracing was already enabled`);
        }
        this.logger('start census tracer');
        const tracer = Tracing.instance;
        const plugins = {
            'http': {
                module: (0, path_1.resolve)(__dirname, '../census/plugins/http'),
                config: config.tracing
            },
            'http2': (0, path_1.resolve)(__dirname, '../census/plugins/http2'),
            'https': (0, path_1.resolve)(__dirname, '../census/plugins/https'),
            'mongodb-core': {
                module: (0, path_1.resolve)(__dirname, '../census/plugins/mongodb'),
                config: { detailedCommands: config.tracing.detailedDatabasesCalls }
            },
            'mysql': {
                module: (0, path_1.resolve)(__dirname, '../census/plugins/mysql'),
                config: { detailedCommands: config.tracing.detailedDatabasesCalls }
            },
            'mysql2': {
                module: (0, path_1.resolve)(__dirname, '../census/plugins/mysql2'),
                config: { detailedCommands: config.tracing.detailedDatabasesCalls }
            },
            'redis': {
                module: (0, path_1.resolve)(__dirname, '../census/plugins/redis'),
                config: { detailedCommands: config.tracing.detailedDatabasesCalls }
            },
            'ioredis': {
                module: (0, path_1.resolve)(__dirname, '../census/plugins/ioredis'),
                config: { detailedCommands: config.tracing.detailedDatabasesCalls }
            },
            'pg': {
                module: (0, path_1.resolve)(__dirname, '../census/plugins/pg'),
                config: { detailedCommands: config.tracing.detailedDatabasesCalls }
            },
            'vue-server-renderer': {
                module: (0, path_1.resolve)(__dirname, '../census/plugins/vue'),
                config: {}
            }
        };
        if (this.options.createSpanWithNet === true) {
            plugins['net'] = {
                module: (0, path_1.resolve)(__dirname, '../census/plugins/net')
            };
        }
        this.tracer = tracer.start({
            exporter: this.exporter,
            plugins,
            propagation: new B3Format(),
            samplingRate: this.options.samplingRate || 0.5,
            logLevel: this.isDebugEnabled() ? 4 : 1
        });
        configuration_1.default.configureModule({
            census_tracing: true
        });
    }
    isDebugEnabled() {
        return typeof process.env.DEBUG === 'string' &&
            (process.env.DEBUG.indexOf('axm:*') >= 0 || process.env.DEBUG.indexOf('axm:tracing') >= 0);
    }
    getTracer() {
        return this.tracer ? this.tracer.tracer : undefined;
    }
    destroy() {
        if (!this.tracer)
            return;
        this.logger('stop census tracer');
        configuration_1.default.configureModule({
            census_tracing: false
        });
        this.tracer.stop();
    }
}
exports.TracingFeature = TracingFeature;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy90cmFjaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtCQUE4QjtBQUM5QixvREFBNEM7QUFFNUMsK0JBQThCO0FBNEM5QixNQUFNLGtCQUFrQixHQUFHO0lBQ3pCLFNBQVM7SUFDVCxNQUFNO0NBQ1AsQ0FBQTtBQUNELE1BQU0sb0JBQW9CLEdBQWtCO0lBQzFDLE9BQU8sRUFBRSxLQUFLO0lBQ2QsUUFBUSxFQUFFLEtBQUs7SUFDZixZQUFZLEVBQUUsQ0FBQztJQUNmLG1CQUFtQixFQUFFLEVBQUU7SUFDdkIsa0JBQWtCLEVBQUUsRUFBRTtJQUN0QixzQkFBc0IsRUFBRSxLQUFLO0lBQzdCLGlCQUFpQixFQUFFLEtBQUs7Q0FDekIsQ0FBQTtBQUVELE1BQU0sb0JBQW9CLEdBQWtCO0lBQzFDLE9BQU8sRUFBRSxJQUFJO0lBQ2IsUUFBUSxFQUFFLEtBQUs7SUFDZixZQUFZLEVBQUUsR0FBRztJQUNqQixtQkFBbUIsRUFBRTtRQUNuQixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUNmLE1BQU0sTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtZQUN0RCxPQUFPLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUNoRCxDQUFDO1FBQ0QsU0FBUztRQUNULFVBQVU7UUFDVixVQUFVO1FBQ1YsVUFBVTtRQUNWLFVBQVU7UUFDVixTQUFTO0tBQ1Y7SUFDRCxrQkFBa0IsRUFBRSxFQUFFO0lBQ3RCLHNCQUFzQixFQUFFLEtBQUs7SUFDN0IsaUJBQWlCLEVBQUUsS0FBSztDQUN6QixDQUFBO0FBRUQsTUFBYSxjQUFjO0lBQTNCO1FBSVUsV0FBTSxHQUFhLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQThHakQs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
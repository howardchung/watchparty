'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpMetricsConfig = void 0;
const shimmer = require("shimmer");
const debug_1 = require("debug");
const configuration_1 = require("../configuration");
const serviceManager_1 = require("../serviceManager");
const histogram_1 = require("../utils/metrics/histogram");
const requireMiddle = require("require-in-the-middle");
const metrics_1 = require("../services/metrics");
class HttpMetricsConfig {
}
exports.HttpMetricsConfig = HttpMetricsConfig;
class HttpMetrics {
    constructor() {
        this.defaultConf = {
            http: true
        };
        this.metrics = new Map();
        this.logger = (0, debug_1.default)('axm:features:metrics:http');
        this.modules = {};
    }
    init(config) {
        if (config === false)
            return;
        if (config === undefined) {
            config = this.defaultConf;
        }
        if (typeof config !== 'object') {
            config = this.defaultConf;
        }
        this.logger('init');
        configuration_1.default.configureModule({
            latency: true
        });
        this.metricService = serviceManager_1.ServiceManager.get('metrics');
        if (this.metricService === undefined)
            return this.logger(`Failed to load metric service`);
        this.logger('hooking to require');
        this.hookRequire();
    }
    registerHttpMetric() {
        if (this.metricService === undefined)
            return this.logger(`Failed to load metric service`);
        const histogram = new histogram_1.default();
        const p50 = {
            name: `HTTP Mean Latency`,
            id: 'internal/http/builtin/latency/p50',
            type: metrics_1.MetricType.histogram,
            historic: true,
            implementation: histogram,
            unit: 'ms',
            handler: () => {
                const percentiles = histogram.percentiles([0.5]);
                return percentiles[0.5];
            }
        };
        const p95 = {
            name: `HTTP P95 Latency`,
            id: 'internal/http/builtin/latency/p95',
            type: metrics_1.MetricType.histogram,
            historic: true,
            implementation: histogram,
            handler: () => {
                const percentiles = histogram.percentiles([0.95]);
                return percentiles[0.95];
            },
            unit: 'ms'
        };
        const meter = {
            name: 'HTTP',
            historic: true,
            id: 'internal/http/builtin/reqs',
            unit: 'req/min'
        };
        this.metricService.registerMetric(p50);
        this.metricService.registerMetric(p95);
        this.metrics.set('http.latency', histogram);
        this.metrics.set('http.meter', this.metricService.meter(meter));
    }
    registerHttpsMetric() {
        if (this.metricService === undefined)
            return this.logger(`Failed to load metric service`);
        const histogram = new histogram_1.default();
        const p50 = {
            name: `HTTPS Mean Latency`,
            id: 'internal/https/builtin/latency/p50',
            type: metrics_1.MetricType.histogram,
            historic: true,
            implementation: histogram,
            unit: 'ms',
            handler: () => {
                const percentiles = histogram.percentiles([0.5]);
                return percentiles[0.5];
            }
        };
        const p95 = {
            name: `HTTPS P95 Latency`,
            id: 'internal/https/builtin/latency/p95',
            type: metrics_1.MetricType.histogram,
            historic: true,
            implementation: histogram,
            handler: () => {
                const percentiles = histogram.percentiles([0.95]);
                return percentiles[0.95];
            },
            unit: 'ms'
        };
        const meter = {
            name: 'HTTPS',
            historic: true,
            id: 'internal/https/builtin/reqs',
            unit: 'req/min'
        };
        this.metricService.registerMetric(p50);
        this.metricService.registerMetric(p95);
        this.metrics.set('https.latency', histogram);
        this.metrics.set('https.meter', this.metricService.meter(meter));
    }
    destroy() {
        if (this.modules.http !== undefined) {
            this.logger('unwraping http module');
            shimmer.unwrap(this.modules.http, 'emit');
            this.modules.http = undefined;
        }
        if (this.modules.https !== undefined) {
            this.logger('unwraping https module');
            shimmer.unwrap(this.modules.https, 'emit');
            this.modules.https = undefined;
        }
        if (this.hooks) {
            this.hooks.unhook();
        }
        this.logger('destroy');
    }
    hookHttp(nodule, name) {
        if (nodule.Server === undefined || nodule.Server.prototype === undefined)
            return;
        if (this.modules[name] !== undefined)
            return this.logger(`Module ${name} already hooked`);
        this.logger(`Hooking to ${name} module`);
        this.modules[name] = nodule.Server.prototype;
        if (name === 'http') {
            this.registerHttpMetric();
        }
        else if (name === 'https') {
            this.registerHttpsMetric();
        }
        const self = this;
        shimmer.wrap(nodule.Server.prototype, 'emit', (original) => {
            return function (event, req, res) {
                if (event !== 'request')
                    return original.apply(this, arguments);
                const meter = self.metrics.get(`${name}.meter`);
                if (meter !== undefined) {
                    meter.mark();
                }
                const latency = self.metrics.get(`${name}.latency`);
                if (latency === undefined)
                    return original.apply(this, arguments);
                if (res === undefined || res === null)
                    return original.apply(this, arguments);
                const startTime = Date.now();
                res.once('finish', _ => {
                    latency.update(Date.now() - startTime);
                });
                return original.apply(this, arguments);
            };
        });
    }
    hookRequire() {
        this.hooks = requireMiddle(['http', 'https'], (exports, name) => {
            this.hookHttp(exports, name);
            return exports;
        });
    }
}
exports.default = HttpMetrics;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cE1ldHJpY3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWV0cmljcy9odHRwTWV0cmljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7OztBQUVaLG1DQUFrQztBQUNsQyxpQ0FBeUI7QUFDekIsb0RBQTRDO0FBRTVDLHNEQUFrRDtBQUVsRCwwREFBa0Q7QUFDbEQsdURBQXNEO0FBRXRELGlEQUs0QjtBQUU1QixNQUFhLGlCQUFpQjtDQUU3QjtBQUZELDhDQUVDO0FBRUQsTUFBcUIsV0FBVztJQUFoQztRQUVVLGdCQUFXLEdBQXNCO1lBQ3ZDLElBQUksRUFBRSxJQUFJO1NBQ1gsQ0FBQTtRQUNPLFlBQU8sR0FBcUIsSUFBSSxHQUFHLEVBQWUsQ0FBQTtRQUNsRCxXQUFNLEdBQVEsSUFBQSxlQUFLLEVBQUMsMkJBQTJCLENBQUMsQ0FBQTtRQUVoRCxZQUFPLEdBQVEsRUFBRSxDQUFBO0lBaUszQixDQUFDO0lBOUpDLElBQUksQ0FBRSxNQUFvQztRQUN4QyxJQUFJLE1BQU0sS0FBSyxLQUFLO1lBQUUsT0FBTTtRQUM1QixJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDeEIsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUE7U0FDMUI7UUFDRCxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtZQUM5QixNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQTtTQUMxQjtRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDbkIsdUJBQWEsQ0FBQyxlQUFlLENBQUM7WUFDNUIsT0FBTyxFQUFFLElBQUk7U0FDZCxDQUFDLENBQUE7UUFDRixJQUFJLENBQUMsYUFBYSxHQUFHLCtCQUFjLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ2xELElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTO1lBQUUsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLCtC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
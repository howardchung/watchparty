'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventLoopMetricOption = void 0;
const metrics_1 = require("../services/metrics");
const serviceManager_1 = require("../serviceManager");
const Debug = require("debug");
const histogram_1 = require("../utils/metrics/histogram");
class EventLoopMetricOption {
}
exports.EventLoopMetricOption = EventLoopMetricOption;
const defaultOptions = {
    eventLoopActive: true,
    eventLoopDelay: true
};
class EventLoopHandlesRequestsMetric {
    constructor() {
        this.logger = Debug('axm:features:metrics:eventloop');
        this.delayLoopInterval = 1000;
    }
    init(config) {
        if (config === false)
            return;
        if (config === undefined) {
            config = defaultOptions;
        }
        if (config === true) {
            config = defaultOptions;
        }
        this.metricService = serviceManager_1.ServiceManager.get('metrics');
        if (this.metricService === undefined)
            return this.logger('Failed to load metric service');
        this.logger('init');
        if (typeof process._getActiveRequests === 'function' && config.eventLoopActive === true) {
            const requestMetric = this.metricService.metric({
                name: 'Active requests',
                id: 'internal/libuv/requests',
                historic: true
            });
            this.requestTimer = setInterval(_ => {
                requestMetric.set(process._getActiveRequests().length);
            }, 1000);
            this.requestTimer.unref();
        }
        if (typeof process._getActiveHandles === 'function' && config.eventLoopActive === true) {
            const handleMetric = this.metricService.metric({
                name: 'Active handles',
                id: 'internal/libuv/handles',
                historic: true
            });
            this.handleTimer = setInterval(_ => {
                handleMetric.set(process._getActiveHandles().length);
            }, 1000);
            this.handleTimer.unref();
        }
        if (config.eventLoopDelay === false)
            return;
        const histogram = new histogram_1.default();
        const uvLatencyp50 = {
            name: 'Event Loop Latency',
            id: 'internal/libuv/latency/p50',
            type: metrics_1.MetricType.histogram,
            historic: true,
            implementation: histogram,
            handler: function () {
                const percentiles = this.implementation.percentiles([0.5]);
                if (percentiles[0.5] === null)
                    return null;
                return percentiles[0.5].toFixed(2);
            },
            unit: 'ms'
        };
        const uvLatencyp95 = {
            name: 'Event Loop Latency p95',
            id: 'internal/libuv/latency/p95',
            type: metrics_1.MetricType.histogram,
            historic: true,
            implementation: histogram,
            handler: function () {
                const percentiles = this.implementation.percentiles([0.95]);
                if (percentiles[0.95] === null)
                    return null;
                return percentiles[0.95].toFixed(2);
            },
            unit: 'ms'
        };
        this.metricService.registerMetric(uvLatencyp50);
        this.metricService.registerMetric(uvLatencyp95);
        this.runtimeStatsService = serviceManager_1.ServiceManager.get('runtimeStats');
        if (this.runtimeStatsService === undefined) {
            this.logger('runtimeStats module not found, fallbacking into pure js method');
            let oldTime = process.hrtime();
            this.delayTimer = setInterval(() => {
                const newTime = process.hrtime();
                const delay = (newTime[0] - oldTime[0]) * 1e3 + (newTime[1] - oldTime[1]) / 1e6 - this.delayLoopInterval;
                oldTime = newTime;
                histogram.update(delay);
            }, this.delayLoopInterval);
            this.delayTimer.unref();
        }
        else {
            this.logger('using runtimeStats module as data source for event loop latency');
            this.handle = (stats) => {
                if (typeof stats !== 'object' || !Array.isArray(stats.ticks))
                    return;
                stats.ticks.forEach((tick) => {
                    histogram.update(tick);
                });
            };
            this.runtimeStatsService.on('data', this.handle);
        }
    }
    destroy() {
        if (this.requestTimer !== undefined) {
            clearInterval(this.requestTimer);
        }
        if (this.handleTimer !== undefined) {
            clearInterval(this.handleTimer);
        }
        if (this.delayTimer !== undefined) {
            clearInterval(this.delayTimer);
        }
        if (this.runtimeStatsService !== undefined) {
            this.runtimeStatsService.removeListener('data', this.handle);
        }
        this.logger('destroy');
    }
}
exports.default = EventLoopHandlesRequestsMetric;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRMb29wTWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tZXRyaWNzL2V2ZW50TG9vcE1ldHJpY3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOzs7QUFFWixpREFBK0U7QUFDL0Usc0RBQWtEO0FBQ2xELCtCQUE4QjtBQUU5QiwwREFBa0Q7QUFHbEQsTUFBYSxxQkFBcUI7Q0FXakM7QUFYRCxzREFXQztBQUVELE1BQU0sY0FBYyxHQUEwQjtJQUM1QyxlQUFlLEVBQUUsSUFBSTtJQUNyQixjQUFjLEVBQUUsSUFBSTtDQUNyQixDQUFBO0FBRUQsTUFBcUIsOEJBQThCO0lBQW5EO1FBR1UsV0FBTSxHQUFRLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFBO1FBSXJELHNCQUFpQixHQUFXLElBQUksQ0FBQTtJQWlIMUMsQ0FBQztJQTdHQyxJQUFJLENBQUUsTUFBd0M7UUFDNUMsSUFBSSxNQUFNLEtBQUssS0FBSztZQUFFLE9BQU07UUFDNUIsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO1lBQ3hCLE1BQU0sR0FBRyxjQUFjLENBQUE7U0FDeEI7UUFDRCxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7WUFDbkIsTUFBTSxHQUFHLGNBQWMsQ0FBQTtTQUN4QjtRQUNELElBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQWMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDbEQsSUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLFNBQVM7WUFBRSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsK0JBQStCLENBQUMsQ0FBQTtRQUV6RixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ25CLElBQUksT0FBUSxPQUFlLENBQUMsa0JBQWtCLEtBQUssVUFBVSxJQUFJLE1BQU0sQ0FBQyxlQUFlLEtBQUssSUFBSSxFQUFFO1lBQ2hHLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFh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
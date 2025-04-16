'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeMetricsOptions = void 0;
const metrics_1 = require("../services/metrics");
const serviceManager_1 = require("../serviceManager");
const Debug = require("debug");
const histogram_1 = require("../utils/metrics/histogram");
class RuntimeMetricsOptions {
}
exports.RuntimeMetricsOptions = RuntimeMetricsOptions;
const defaultOptions = {
    gcNewPause: true,
    gcOldPause: true,
    pageFaults: true,
    contextSwitchs: true
};
class RuntimeMetrics {
    constructor() {
        this.logger = Debug('axm:features:metrics:runtime');
        this.metrics = new Map();
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
        this.runtimeStatsService = serviceManager_1.ServiceManager.get('runtimeStats');
        if (this.runtimeStatsService === undefined)
            return this.logger('Failed to load runtime stats service');
        this.logger('init');
        const newHistogram = new histogram_1.default();
        if (config.gcNewPause === true) {
            this.metricService.registerMetric({
                name: 'GC New Space Pause',
                id: 'internal/v8/gc/new/pause/p50',
                type: metrics_1.MetricType.histogram,
                historic: true,
                implementation: newHistogram,
                unit: 'ms',
                handler: function () {
                    const percentiles = this.implementation.percentiles([0.5]);
                    return percentiles[0.5];
                }
            });
            this.metricService.registerMetric({
                name: 'GC New Space Pause p95',
                id: 'internal/v8/gc/new/pause/p95',
                type: metrics_1.MetricType.histogram,
                historic: true,
                implementation: newHistogram,
                unit: 'ms',
                handler: function () {
                    const percentiles = this.implementation.percentiles([0.95]);
                    return percentiles[0.95];
                }
            });
        }
        const oldHistogram = new histogram_1.default();
        if (config.gcOldPause === true) {
            this.metricService.registerMetric({
                name: 'GC Old Space Pause',
                id: 'internal/v8/gc/old/pause/p50',
                type: metrics_1.MetricType.histogram,
                historic: true,
                implementation: oldHistogram,
                unit: 'ms',
                handler: function () {
                    const percentiles = this.implementation.percentiles([0.5]);
                    return percentiles[0.5];
                }
            });
            this.metricService.registerMetric({
                name: 'GC Old Space Pause p95',
                id: 'internal/v8/gc/old/pause/p95',
                type: metrics_1.MetricType.histogram,
                historic: true,
                implementation: oldHistogram,
                unit: 'ms',
                handler: function () {
                    const percentiles = this.implementation.percentiles([0.95]);
                    return percentiles[0.95];
                }
            });
        }
        if (config.contextSwitchs === true) {
            const volontarySwitchs = this.metricService.histogram({
                name: 'Volontary CPU Context Switch',
                id: 'internal/uv/cpu/contextswitch/volontary',
                measurement: metrics_1.MetricMeasurements.mean
            });
            const inVolontarySwitchs = this.metricService.histogram({
                name: 'Involuntary CPU Context Switch',
                id: 'internal/uv/cpu/contextswitch/involontary',
                measurement: metrics_1.MetricMeasurements.mean
            });
            this.metrics.set('inVolontarySwitchs', inVolontarySwitchs);
            this.metrics.set('volontarySwitchs', volontarySwitchs);
        }
        if (config.pageFaults === true) {
            const softPageFault = this.metricService.histogram({
                name: 'Minor Page Fault',
                id: 'internal/uv/memory/pagefault/minor',
                measurement: metrics_1.MetricMeasurements.mean
            });
            const hardPageFault = this.metricService.histogram({
                name: 'Major Page Fault',
                id: 'internal/uv/memory/pagefault/major',
                measurement: metrics_1.MetricMeasurements.mean
            });
            this.metrics.set('softPageFault', softPageFault);
            this.metrics.set('hardPageFault', hardPageFault);
        }
        this.handle = (stats) => {
            if (typeof stats !== 'object' || typeof stats.gc !== 'object')
                return;
            newHistogram.update(stats.gc.newPause);
            oldHistogram.update(stats.gc.oldPause);
            if (typeof stats.usage !== 'object')
                return;
            const volontarySwitchs = this.metrics.get('volontarySwitchs');
            if (volontarySwitchs !== undefined) {
                volontarySwitchs.update(stats.usage.ru_nvcsw);
            }
            const inVolontarySwitchs = this.metrics.get('inVolontarySwitchs');
            if (inVolontarySwitchs !== undefined) {
                inVolontarySwitchs.update(stats.usage.ru_nivcsw);
            }
            const softPageFault = this.metrics.get('softPageFault');
            if (softPageFault !== undefined) {
                softPageFault.update(stats.usage.ru_minflt);
            }
            const hardPageFault = this.metrics.get('hardPageFault');
            if (hardPageFault !== undefined) {
                hardPageFault.update(stats.usage.ru_majflt);
            }
        };
        this.runtimeStatsService.on('data', this.handle);
    }
    destroy() {
        if (this.runtimeStatsService !== undefined) {
            this.runtimeStatsService.removeListener('data', this.handle);
        }
        this.logger('destroy');
    }
}
exports.default = RuntimeMetrics;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tZXRyaWNzL3J1bnRpbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOzs7QUFFWixpREFBbUY7QUFDbkYsc0RBQWtEO0FBQ2xELCtCQUE4QjtBQUU5QiwwREFBa0Q7QUFHbEQsTUFBYSxxQkFBcUI7Q0FhakM7QUFiRCxzREFhQztBQUVELE1BQU0sY0FBYyxHQUEwQjtJQUM1QyxVQUFVLEVBQUUsSUFBSTtJQUNoQixVQUFVLEVBQUUsSUFBSTtJQUNoQixVQUFVLEVBQUUsSUFBSTtJQUNoQixjQUFjLEVBQUUsSUFBSTtDQUNyQixDQUFBO0FBRUQsTUFBcUIsY0FBYztJQUFuQztRQUdVLFdBQU0sR0FBUSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQTtRQUduRCxZQUFPLEdBQTJCLElBQUksR0FBRyxFQUFxQixDQUFBO0lBeUl4RSxDQUFDO0lBdklDLElBQUksQ0FBRSxNQUF3QztRQUM1QyxJQUFJLE1BQU0sS0FBSyxLQUFLO1lBQUUsT0FBTTtRQUM1QixJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDeEIsTUFBTSxHQUFHLGNBQWMsQ0FBQTtTQUN4QjtRQUNELElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtZQUNuQixNQUFNLEdBQUcsY0FBYyxDQUFBO1NBQ3hCO1FBRUQsSUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBYyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUNsRCxJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssU0FBUztZQUFFLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQywrQkFBK0IsQ0FBQyxDQUFBO1FBRXpGLElBQUksQ0FBQyxtQkFBbUIsR0FBRywrQkFBYyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtRQUM3RCxJQUFJLElBQUksQ0FBQyxtQkFBbUIsS0FBSyxTQUFTO1lBQUUsT0FBTyxJQUFJLENBQUMs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
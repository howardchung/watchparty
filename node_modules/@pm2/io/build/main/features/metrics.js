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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9tZXRyaWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUF5QjtBQUN6QixzREFBNEQ7QUFDNUQsa0VBQW1HO0FBQ25HLGdEQUF3RTtBQUN4RSx3REFBdUU7QUFDdkUsc0NBQXlEO0FBQ3pELGdEQUEwRTtBQUU3RCxRQUFBLGlCQUFpQixHQUFpQjtJQUM3QyxTQUFTLEVBQUUsSUFBSTtJQUNmLE9BQU8sRUFBRSxLQUFLO0lBQ2QsSUFBSSxFQUFFLElBQUk7SUFDVixPQUFPLEVBQUUsSUFBSTtJQUNiLEVBQUUsRUFBRSxJQUFJO0NBQ1QsQ0FBQTtBQUVELE1BQWEsWUFBWTtDQXVCeEI7QUF2QkQsb0NBdUJDO0FBRUQsTUFBTSxlQUFlO0NBcUJwQjtBQUVELE1BQU0sZ0JBQWdCLEdBQXNCO0lBQzFDO1FBQ0UsSUFBSSxFQUFFLFdBQVc7UUFDakIsTUFBTSxFQUFFLDBCQUE4QjtRQUN0QyxXQUFXLEVBQUUsV0FBVztLQUN6QjtJQUNEO1FBQ0UsSUFBSSxFQUFFLE1BQU07UUFDWixNQUFNLEVBQUUscUJBQVc7UUFDbkIsV0FBVyxFQUFFLE1BQU07S0FDcEI7SUFDRDtRQUNFLElBQUksRUFBRSxTQUFTO1FBQ2YsTUFBTSxFQUFFLGlCQUFhO1FBQ3JCLFdBQVcsRUFBRSxTQUFTO0tBQ3ZCO0lBQ0Q7UUFDRSxJQUFJLEVBQUUsSUFBSTtRQUNWLE1BQU0sRUFBRSxZQUFRO1FBQ2hCLFdBQVcsRUFBRSxJQUFJO0tBQ2xCO0lBQ0Q7UUFDRSxJQUFJLEVBQUUsU0FBUztRQUNmLE1BQU0sRUFBRSxpQkFBYztRQUN0QixXQUFXLEVBQUUsU0FBUztLQUN2QjtDQUNGLENBQUE7QUFPRCxNQUFhLGNBQWM7SUFBM0I7UUFFVSxXQUFNLEdBQWEsSUFBQSxlQUFLLEVBQUMsc0JBQXNCLENBQUMsQ0FBQTtJQXFDMUQsQ0FBQztJQW5DQyxJQUFJLENBQUUsT0FBZ0I7UUFDcEIsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRO1lBQUUsT0FBTyxHQUFHLEVBQUUsQ0FBQTtRQUM3QyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBRW5CLEtBQUssSUFBSSxlQUFlLElBQUksZ0JBQWdCLEVBQUU7WUFDNUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUE7WUFDM0MsSUFBSSxNQUFNLEdBQVEsU0FBUyxDQUFBO1lBQzNCLElBQUksT0FBTyxlQUFlLENBQUMsV0FBVyxLQUFLLFFBQVEsRUFBRTtnQkFDbkQsTUFBTSxHQUFHLEVBQUUsQ0FBQTthQUNaO2lCQUFNLElBQUksZUFBZSxDQUFDLFdBQVcsS0FBSyxHQUFHLEVBQUU7Z0JBQzlDLE1BQU0sR0FBRyxPQUFPLENBQUE7YUFDakI7aUJBQU07Z0JBQ0wsTUFBTSxHQUFHLElBQUEsZ0NBQWUsRUFBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFBO2FBQy9EO1lBSUQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUNuQixlQUFlLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQTtTQUNsQztJQUNILENBQUM7SUFFRCxHQUFHLENBQUUsSUFBWTtRQUNmLE1BQU0sTUFBTSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUE7UUFDcEUsSUFBSSxNQUFNLEtBQUssU0FBUztZQUFFLE9BQU8sU0FBUyxDQUFBO1FBQzFDLE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQTtJQUN4QixDQUFDO0lBRUQsT0FBTztRQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDdEIsS0FBSyxJQUFJLGVBQWUsSUFBSSxnQkFBZ0IsRUFBRTtZQUM1QyxJQUFJLGVBQWUsQ0FBQyxRQUFRLEtBQUssU0FBUztnQkFBRSxTQUFRO1lBQ3BELGVBQWUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUE7U0FDbkM7SUFDSCxDQUFDO0NBQ0Y7QUF2Q0Qsd0NBdUNDIn0=
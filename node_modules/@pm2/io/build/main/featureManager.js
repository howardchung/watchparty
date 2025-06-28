"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureConfig = exports.FeatureManager = exports.getObjectAtPath = void 0;
const notify_1 = require("./features/notify");
const profiling_1 = require("./features/profiling");
const events_1 = require("./features/events");
const metrics_1 = require("./features/metrics");
const tracing_1 = require("./features/tracing");
const dependencies_1 = require("./features/dependencies");
const Debug = require("debug");
function getObjectAtPath(context, path) {
    if (path.indexOf('.') === -1 && path.indexOf('[') === -1) {
        return context[path];
    }
    let crumbs = path.split(/\.|\[|\]/g);
    let i = -1;
    let len = crumbs.length;
    let result;
    while (++i < len) {
        if (i === 0)
            result = context;
        if (!crumbs[i])
            continue;
        if (result === undefined)
            break;
        result = result[crumbs[i]];
    }
    return result;
}
exports.getObjectAtPath = getObjectAtPath;
class AvailableFeature {
}
const availablesFeatures = [
    {
        name: 'notify',
        optionsPath: '.',
        module: notify_1.NotifyFeature
    },
    {
        name: 'profiler',
        optionsPath: 'profiling',
        module: profiling_1.ProfilingFeature
    },
    {
        name: 'events',
        module: events_1.EventsFeature
    },
    {
        name: 'metrics',
        optionsPath: 'metrics',
        module: metrics_1.MetricsFeature
    },
    {
        name: 'tracing',
        optionsPath: '.',
        module: tracing_1.TracingFeature
    },
    {
        name: 'dependencies',
        module: dependencies_1.DependenciesFeature
    }
];
class FeatureManager {
    constructor() {
        this.logger = Debug('axm:features');
    }
    init(options) {
        for (let availableFeature of availablesFeatures) {
            this.logger(`Creating feature ${availableFeature.name}`);
            const feature = new availableFeature.module();
            let config = undefined;
            if (typeof availableFeature.optionsPath !== 'string') {
                config = {};
            }
            else if (availableFeature.optionsPath === '.') {
                config = options;
            }
            else {
                config = getObjectAtPath(options, availableFeature.optionsPath);
            }
            this.logger(`Init feature ${availableFeature.name}`);
            feature.init(config);
            availableFeature.instance = feature;
        }
    }
    get(name) {
        const feature = availablesFeatures.find(feature => feature.name === name);
        if (feature === undefined || feature.instance === undefined) {
            throw new Error(`Tried to call feature ${name} which doesn't exist or wasn't initiated`);
        }
        return feature.instance;
    }
    destroy() {
        for (let availableFeature of availablesFeatures) {
            if (availableFeature.instance === undefined)
                continue;
            this.logger(`Destroy feature ${availableFeature.name}`);
            availableFeature.instance.destroy();
        }
    }
}
exports.FeatureManager = FeatureManager;
class FeatureConfig {
}
exports.FeatureConfig = FeatureConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmVhdHVyZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmVhdHVyZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsOENBQWlEO0FBQ2pELG9EQUF1RDtBQUN2RCw4Q0FBaUQ7QUFFakQsZ0RBQW1EO0FBQ25ELGdEQUFtRDtBQUNuRCwwREFBNkQ7QUFDN0QsK0JBQThCO0FBRTlCLFNBQWdCLGVBQWUsQ0FBRSxPQUFlLEVBQUUsSUFBWTtJQUM1RCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUN4RCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUNyQjtJQUVELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDVixJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFBO0lBQ3ZCLElBQUksTUFBTSxDQUFBO0lBRVYsT0FBTyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUU7UUFDaEIsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUFFLE1BQU0sR0FBRyxPQUFPLENBQUE7UUFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFBRSxTQUFRO1FBQ3hCLElBQUksTUFBTSxLQUFLLFNBQVM7WUFBRSxNQUFLO1FBQy9CLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDM0I7SUFFRCxPQUFPLE1BQU0sQ0FBQTtBQUNmLENBQUM7QUFsQkQsMENBa0JDO0FBRUQsTUFBTSxnQkFBZ0I7Q0FxQnJCO0FBRUQsTUFBTSxrQkFBa0IsR0FBdUI7SUFDN0M7UUFDRSxJQUFJLEVBQUUsUUFB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
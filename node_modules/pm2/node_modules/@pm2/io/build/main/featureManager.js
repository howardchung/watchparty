"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureConfig = exports.FeatureManager = void 0;
exports.getObjectAtPath = getObjectAtPath;
const notify_1 = require("./features/notify");
const profiling_1 = require("./features/profiling");
const events_1 = require("./features/events");
const metrics_1 = require("./features/metrics");
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

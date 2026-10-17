"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilingFeature = exports.ProfilingConfig = void 0;
const addonProfiler_1 = require("../profilers/addonProfiler");
const inspectorProfiler_1 = require("../profilers/inspectorProfiler");
const constants_1 = require("../constants");
const Debug = require("debug");
class ProfilingConfig {
}
exports.ProfilingConfig = ProfilingConfig;
const defaultProfilingConfig = {
    cpuJS: true,
    heapSnapshot: true,
    heapSampling: true,
    implementation: 'both'
};
const disabledProfilingConfig = {
    cpuJS: false,
    heapSnapshot: false,
    heapSampling: false,
    implementation: 'none'
};
class ProfilingFeature {
    constructor() {
        this.logger = Debug('axm:features:profiling');
    }
    init(config) {
        if (config === true) {
            config = defaultProfilingConfig;
        }
        else if (config === false) {
            config = disabledProfilingConfig;
        }
        else if (config === undefined) {
            config = defaultProfilingConfig;
        }
        if (process.env.PM2_PROFILING_FORCE_FALLBACK === 'true') {
            config.implementation = 'addon';
        }
        if (config.implementation === undefined || config.implementation === 'both') {
            config.implementation = (0, constants_1.canUseInspector)() === true ? 'inspector' : 'addon';
        }
        switch (config.implementation) {
            case 'inspector': {
                this.logger('using inspector implementation');
                this.profiler = new inspectorProfiler_1.default();
                break;
            }
            case 'addon': {
                this.logger('using addon implementation');
                this.profiler = new addonProfiler_1.default();
                break;
            }
            default: {
                return this.logger(`Invalid profiler implementation choosen: ${config.implementation}`);
            }
        }
        this.logger('init');
        this.profiler.init();
    }
    destroy() {
        this.logger('destroy');
        if (this.profiler === undefined)
            return;
        this.profiler.destroy();
    }
}
exports.ProfilingFeature = ProfilingFeature;

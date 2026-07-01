"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const module_1 = require("../utils/module");
const configuration_1 = require("../configuration");
const serviceManager_1 = require("../serviceManager");
const miscellaneous_1 = require("../utils/miscellaneous");
const Debug = require("debug");
class CurrentProfile {
}
class AddonProfiler {
    constructor() {
        this.profiler = null;
        this.modules = ['v8-profiler-node8', 'v8-profiler'];
        this.currentProfile = null;
        this.logger = Debug('axm:features:profiling:addon');
    }
    init() {
        for (const moduleName of this.modules) {
            let path = module_1.default.detectModule(moduleName);
            if (path === null)
                continue;
            let profiler = module_1.default.loadModule(moduleName);
            if (profiler instanceof Error)
                continue;
            this.profiler = profiler;
            break;
        }
        if (this.profiler === null) {
            configuration_1.default.configureModule({
                heapdump: false,
                'feature.profiler.heap_snapshot': false,
                'feature.profiler.heap_sampling': false,
                'feature.profiler.cpu_js': false
            });
            return this.logger(`Failed to require the profiler via addon, disabling profiling ...`);
        }
        this.logger('init');
        this.actionService = serviceManager_1.ServiceManager.get('actions');
        if (this.actionService === undefined) {
            return this.logger(`Fail to get action service`);
        }
        this.transport = serviceManager_1.ServiceManager.get('transport');
        if (this.transport === undefined) {
            return this.logger(`Fail to get transport service`);
        }
        configuration_1.default.configureModule({
            heapdump: true,
            'feature.profiler.heapsnapshot': true,
            'feature.profiler.heapsampling': false,
            'feature.profiler.cpu_js': true
        });
        this.register();
    }
    register() {
        if (this.actionService === undefined) {
            return this.logger(`Fail to get action service`);
        }
        this.logger('register');
        this.actionService.registerAction('km:heapdump', this.onHeapdump.bind(this));
        this.actionService.registerAction('km:cpu:profiling:start', this.onCPUProfileStart.bind(this));
        this.actionService.registerAction('km:cpu:profiling:stop', this.onCPUProfileStop.bind(this));
    }
    destroy() {
        this.logger('Addon Profiler destroyed !');
        if (this.profiler === null)
            return;
        this.profiler.deleteAllProfiles();
    }
    onCPUProfileStart(opts, cb) {
        if (typeof cb !== 'function') {
            cb = opts;
            opts = {};
        }
        if (typeof opts !== 'object' || opts === null) {
            opts = {};
        }
        if (this.currentProfile !== null) {
            return cb({
                err: 'A profiling is already running',
                success: false
            });
        }
        this.currentProfile = new CurrentProfile();
        this.currentProfile.uuid = miscellaneous_1.default.generateUUID();
        this.currentProfile.startTime = Date.now();
        this.currentProfile.initiated = typeof opts.initiated === 'string'
            ? opts.initiated : 'manual';
        cb({ success: true, uuid: this.currentProfile.uuid });
        this.profiler.startProfiling();
        if (isNaN(parseInt(opts.timeout, 10)))
            return;
        const duration = parseInt(opts.timeout, 10);
        setTimeout(_ => {
            this.onCPUProfileStop(_ => {
                return;
            });
        }, duration);
    }
    onCPUProfileStop(cb) {
        if (this.currentProfile === null) {
            return cb({
                err: 'No profiling are already running',
                success: false
            });
        }
        if (this.transport === undefined) {
            return cb({
                err: 'No profiling are already running',
                success: false
            });
        }
        const profile = this.profiler.stopProfiling();
        const data = JSON.stringify(profile);
        cb({ success: true, uuid: this.currentProfile.uuid });
        this.transport.send('profilings', {
            uuid: this.currentProfile.uuid,
            duration: Date.now() - this.currentProfile.startTime,
            at: this.currentProfile.startTime,
            data,
            dump_file_size: data.length,
            success: true,
            initiated: this.currentProfile.initiated,
            type: 'cpuprofile',
            cpuprofile: true
        });
        this.currentProfile = null;
    }
    onHeapdump(opts, cb) {
        if (typeof cb !== 'function') {
            cb = opts;
            opts = {};
        }
        if (typeof opts !== 'object' || opts === null) {
            opts = {};
        }
        cb({ success: true });
        setTimeout(() => {
            const startTime = Date.now();
            this.takeSnapshot()
                .then((data) => {
                return this.transport.send('profilings', {
                    data,
                    at: startTime,
                    initiated: typeof opts.initiated === 'string' ? opts.initiated : 'manual',
                    duration: Date.now() - startTime,
                    type: 'heapdump'
                });
            }).catch(err => {
                return cb({
                    success: err.message,
                    err: err
                });
            });
        }, 200);
    }
    takeSnapshot() {
        return new Promise((resolve, reject) => {
            const snapshot = this.profiler.takeSnapshot();
            snapshot.export((err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
                snapshot.delete();
            });
        });
    }
}
exports.default = AddonProfiler;

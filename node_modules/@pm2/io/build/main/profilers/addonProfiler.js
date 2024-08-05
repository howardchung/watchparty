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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkb25Qcm9maWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcm9maWxlcnMvYWRkb25Qcm9maWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDRDQUFtQztBQUNuQyxvREFBNEM7QUFDNUMsc0RBQWtEO0FBR2xELDBEQUE4QztBQUM5QywrQkFBOEI7QUFFOUIsTUFBTSxjQUFjO0NBSW5CO0FBRUQsTUFBcUIsYUFBYTtJQUFsQztRQUVVLGFBQVEsR0FBUSxJQUFJLENBQUE7UUFNcEIsWUFBTyxHQUFHLENBQUUsbUJBQW1CLEVBQUUsYUFBYSxDQUFFLENBQUE7UUFHaEQsbUJBQWMsR0FBMEIsSUFBSSxDQUFBO1FBQzVDLFdBQU0sR0FBYSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQTtJQW9MbEUsQ0FBQztJQWxMQyxJQUFJO1FBQ0YsS0FBSyxNQUFNLFVBQVUsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ3JDLElBQUksSUFBSSxHQUFHLGdCQUFLLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1lBRXpDLElBQUksSUFBSSxLQUFLLElBQUk7Z0JBQUUsU0FBUTtZQUMzQixJQUFJLFFBQVEsR0FBRyxnQkFBSyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQTtZQUUzQyxJQUFJLFFBQVEsWUFBWSxLQUFLO2dCQUFFLFNBQVE7WUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7WUFDeEIsTUFBSztTQUNOO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtZQUMxQix1QkFBYSxDQUFDLGVBQWUsQ0FBQztnQkFDNUIsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsZ0NBQWdDLEVBQUUsS0FBSztnQkFDdkMsZ0NBQWdDLEVBQUUsS0FBSztnQkFDdkMseUJBQXlCLEVBQUUsS0FBSzthQUNqQyxDQUFDLENBQUE7WUFDRixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMs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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const configuration_1 = require("../configuration");
const serviceManager_1 = require("../serviceManager");
const miscellaneous_1 = require("../utils/miscellaneous");
const Debug = require("debug");
const semver = require("semver");
class CurrentProfile {
}
class InspectorProfiler {
    constructor() {
        this.profiler = undefined;
        this.currentProfile = null;
        this.logger = Debug('axm:features:profiling:inspector');
        this.isNode11 = semver.satisfies(semver.clean(process.version), '>11.x');
    }
    init() {
        this.profiler = serviceManager_1.ServiceManager.get('inspector');
        if (this.profiler === undefined) {
            configuration_1.default.configureModule({
                heapdump: false,
                'feature.profiler.heap_snapshot': false,
                'feature.profiler.heap_sampling': false,
                'feature.profiler.cpu_js': false
            });
            return console.error(`Failed to require the profiler via inspector, disabling profiling ...`);
        }
        this.profiler.getSession().post('Profiler.enable');
        this.profiler.getSession().post('HeapProfiler.enable');
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
            'feature.profiler.heapsnapshot': !this.isNode11,
            'feature.profiler.heapsampling': true,
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
        this.actionService.registerAction('km:heap:sampling:start', this.onHeapProfileStart.bind(this));
        this.actionService.registerAction('km:heap:sampling:stop', this.onHeapProfileStop.bind(this));
    }
    destroy() {
        this.logger('Inspector Profiler destroyed !');
        if (this.profiler === undefined)
            return;
        this.profiler.getSession().post('Profiler.disable');
        this.profiler.getSession().post('HeapProfiler.disable');
    }
    onHeapProfileStart(opts, cb) {
        if (typeof cb !== 'function') {
            cb = opts;
            opts = {};
        }
        if (typeof opts !== 'object' || opts === null) {
            opts = {};
        }
        if (this.profiler === undefined) {
            return cb({
                err: 'Profiler not available',
                success: false
            });
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
        const defaultSamplingInterval = 16384;
        this.profiler.getSession().post('HeapProfiler.startSampling', {
            samplingInterval: typeof opts.samplingInterval === 'number'
                ? opts.samplingInterval : defaultSamplingInterval
        });
        if (isNaN(parseInt(opts.timeout, 10)))
            return;
        const duration = parseInt(opts.timeout, 10);
        setTimeout(_ => {
            this.onHeapProfileStop(_ => {
                return;
            });
        }, duration);
    }
    onHeapProfileStop(cb) {
        if (this.currentProfile === null) {
            return cb({
                err: 'No profiling are already running',
                success: false
            });
        }
        if (this.profiler === undefined) {
            return cb({
                err: 'Profiler not available',
                success: false
            });
        }
        cb({ success: true, uuid: this.currentProfile.uuid });
        this.profiler.getSession().post('HeapProfiler.stopSampling', (_, { profile }) => {
            if (this.currentProfile === null)
                return;
            if (this.transport === undefined)
                return;
            const data = JSON.stringify(profile);
            this.transport.send('profilings', {
                uuid: this.currentProfile.uuid,
                duration: Date.now() - this.currentProfile.startTime,
                at: this.currentProfile.startTime,
                data,
                success: true,
                initiated: this.currentProfile.initiated,
                type: 'heapprofile',
                heapprofile: true
            });
            this.currentProfile = null;
        });
    }
    onCPUProfileStart(opts, cb) {
        if (typeof cb !== 'function') {
            cb = opts;
            opts = {};
        }
        if (typeof opts !== 'object' || opts === null) {
            opts = {};
        }
        if (this.profiler === undefined) {
            return cb({
                err: 'Profiler not available',
                success: false
            });
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
        if (process.hasOwnProperty('_startProfilerIdleNotifier') === true) {
            process._startProfilerIdleNotifier();
        }
        this.profiler.getSession().post('Profiler.start');
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
        if (this.profiler === undefined) {
            return cb({
                err: 'Profiler not available',
                success: false
            });
        }
        cb({ success: true, uuid: this.currentProfile.uuid });
        if (process.hasOwnProperty('_stopProfilerIdleNotifier') === true) {
            process._stopProfilerIdleNotifier();
        }
        this.profiler.getSession().post('Profiler.stop', (_, res) => {
            if (this.currentProfile === null)
                return;
            if (this.transport === undefined)
                return;
            const profile = res.profile;
            const data = JSON.stringify(profile);
            this.transport.send('profilings', {
                uuid: this.currentProfile.uuid,
                duration: Date.now() - this.currentProfile.startTime,
                at: this.currentProfile.startTime,
                data,
                success: true,
                initiated: this.currentProfile.initiated,
                type: 'cpuprofile',
                cpuprofile: true
            });
            this.currentProfile = null;
        });
    }
    onHeapdump(opts, cb) {
        if (typeof cb !== 'function') {
            cb = opts;
            opts = {};
        }
        if (typeof opts !== 'object' || opts === null) {
            opts = {};
        }
        if (this.profiler === undefined) {
            return cb({
                err: 'Profiler not available',
                success: false
            });
        }
        cb({ success: true });
        setTimeout(() => {
            const startTime = Date.now();
            this.takeSnapshot()
                .then(data => {
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
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.profiler === undefined)
                return reject(new Error(`Profiler not available`));
            const chunks = [];
            const chunkHandler = (raw) => {
                const data = raw.params;
                chunks.push(data.chunk);
            };
            this.profiler.getSession().on('HeapProfiler.addHeapSnapshotChunk', chunkHandler);
            yield this.profiler.getSession().post('HeapProfiler.takeHeapSnapshot', {
                reportProgress: false
            });
            this.profiler.getSession().removeListener('HeapProfiler.addHeapSnapshotChunk', chunkHandler);
            return resolve(chunks.join(''));
        }));
    }
}
exports.default = InspectorProfiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zcGVjdG9yUHJvZmlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcHJvZmlsZXJzL2luc3BlY3RvclByb2ZpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLG9EQUE0QztBQUM1QyxzREFBa0Q7QUFHbEQsMERBQThDO0FBRzlDLCtCQUE4QjtBQUM5QixpQ0FBZ0M7QUFFaEMsTUFBTSxjQUFjO0NBSW5CO0FBRUQsTUFBcUIsaUJBQWlCO0lBQXRDO1FBRVUsYUFBUSxHQUFpQyxTQUFTLENBQUE7UUFHbEQsbUJBQWMsR0FBMEIsSUFBSSxDQUFBO1FBQzVDLFdBQU0sR0FBYSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQTtRQUM1RCxhQUFRLEdBQVksTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQTtJQWdUdEYsQ0FBQztJQTlTQyxJQUFJO1FBQ0YsSUFBSSxDQUFDLFFBQVEsR0FBRywrQkFBYyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUMvQyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO1lBQy9CLHVCQUFhLENBQUMsZUFBZSxDQUFDO2dCQUM1QixRQUFRLEVBQUUsS0FBSztnQkFDZixnQ0FBZ0MsRUFBRSxLQUFLO2dCQUN2QyxnQ0FBZ0MsRUFBRSxLQUFLO2dCQUN2Qyx5QkFBeUIsRUFBRSxLQUFLO2FBQ2pDLENBQUMsQ0FBQTtZQUNGLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyx1RUFBdUUsQ0FBQyxDQUFBO1NBQzlGO1FBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtRQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO1FBQ3RE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
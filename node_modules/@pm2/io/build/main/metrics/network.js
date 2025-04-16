"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkTrafficConfig = void 0;
const netModule = require("net");
const metrics_1 = require("../services/metrics");
const Debug = require("debug");
const meter_1 = require("../utils/metrics/meter");
const shimmer = require("shimmer");
const serviceManager_1 = require("../serviceManager");
class NetworkTrafficConfig {
}
exports.NetworkTrafficConfig = NetworkTrafficConfig;
const defaultConfig = {
    upload: false,
    download: false
};
const allEnabled = {
    upload: true,
    download: true
};
class NetworkMetric {
    constructor() {
        this.logger = Debug('axm:features:metrics:network');
    }
    init(config) {
        if (config === false)
            return;
        if (config === true) {
            config = allEnabled;
        }
        if (config === undefined) {
            config = defaultConfig;
        }
        this.metricService = serviceManager_1.ServiceManager.get('metrics');
        if (this.metricService === undefined) {
            return this.logger(`Failed to load metric service`);
        }
        if (config.download === true) {
            this.catchDownload();
        }
        if (config.upload === true) {
            this.catchUpload();
        }
        this.logger('init');
    }
    destroy() {
        if (this.timer !== undefined) {
            clearTimeout(this.timer);
        }
        if (this.socketProto !== undefined && this.socketProto !== null) {
            shimmer.unwrap(this.socketProto, 'read');
            shimmer.unwrap(this.socketProto, 'write');
        }
        this.logger('destroy');
    }
    catchDownload() {
        if (this.metricService === undefined)
            return this.logger(`Failed to load metric service`);
        const downloadMeter = new meter_1.default({});
        this.metricService.registerMetric({
            name: 'Network In',
            id: 'internal/network/in',
            historic: true,
            type: metrics_1.MetricType.meter,
            implementation: downloadMeter,
            unit: 'kb/s',
            handler: function () {
                return Math.floor(this.implementation.val() / 1024 * 1000) / 1000;
            }
        });
        setTimeout(() => {
            const property = netModule.Socket.prototype.read;
            const isWrapped = property && property.__wrapped === true;
            if (isWrapped) {
                return this.logger(`Already patched socket read, canceling`);
            }
            shimmer.wrap(netModule.Socket.prototype, 'read', function (original) {
                return function () {
                    this.on('data', (data) => {
                        if (typeof data.length === 'number') {
                            downloadMeter.mark(data.length);
                        }
                    });
                    return original.apply(this, arguments);
                };
            });
        }, 500);
    }
    catchUpload() {
        if (this.metricService === undefined)
            return this.logger(`Failed to load metric service`);
        const uploadMeter = new meter_1.default();
        this.metricService.registerMetric({
            name: 'Network Out',
            id: 'internal/network/out',
            type: metrics_1.MetricType.meter,
            historic: true,
            implementation: uploadMeter,
            unit: 'kb/s',
            handler: function () {
                return Math.floor(this.implementation.val() / 1024 * 1000) / 1000;
            }
        });
        setTimeout(() => {
            const property = netModule.Socket.prototype.write;
            const isWrapped = property && property.__wrapped === true;
            if (isWrapped) {
                return this.logger(`Already patched socket write, canceling`);
            }
            shimmer.wrap(netModule.Socket.prototype, 'write', function (original) {
                return function (data) {
                    if (typeof data.length === 'number') {
                        uploadMeter.mark(data.length);
                    }
                    return original.apply(this, arguments);
                };
            });
        }, 500);
    }
}
exports.default = NetworkMetric;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29yay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tZXRyaWNzL25ldHdvcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQWdDO0FBQ2hDLGlEQUErRDtBQUUvRCwrQkFBOEI7QUFDOUIsa0RBQTBDO0FBQzFDLG1DQUFrQztBQUNsQyxzREFBa0Q7QUFFbEQsTUFBYSxvQkFBb0I7Q0FHaEM7QUFIRCxvREFHQztBQUVELE1BQU0sYUFBYSxHQUF5QjtJQUMxQyxNQUFNLEVBQUUsS0FBSztJQUNiLFFBQVEsRUFBRSxLQUFLO0NBQ2hCLENBQUE7QUFFRCxNQUFNLFVBQVUsR0FBeUI7SUFDdkMsTUFBTSxFQUFFLElBQUk7SUFDWixRQUFRLEVBQUUsSUFBSTtDQUNmLENBQUE7QUFFRCxNQUFxQixhQUFhO0lBQWxDO1FBR1UsV0FBTSxHQUFhLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO0lBMkdsRSxDQUFDO0lBeEdDLElBQUksQ0FBRSxNQUF1QztRQUMzQyxJQUFJLE1BQU0sS0FBSyxLQUFLO1lBQUUsT0FBTTtRQUM1QixJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7WUFDbkIsTUFBTSxHQUFHLFVBQVUsQ0FBQTtTQUNwQjtRQUNELElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUN4QixNQUFNLEdBQUcsYUFBYSxDQUFBO1NBQ3ZCO1FBRUQsSUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBYyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUNsRCxJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssU0FBUyxFQUFFO1lBQ3BDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQywrQkFBK0IsQ0FBQyxDQUFBO1NBQ3BEO1FBRUQsSUFBSSxNQUFNLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtZQUM1QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUE7U0FDckI7UUFDRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUss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
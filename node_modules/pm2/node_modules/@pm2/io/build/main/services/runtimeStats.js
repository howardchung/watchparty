'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeStatsService = void 0;
const debug_1 = require("debug");
const module_1 = require("../utils/module");
const eventemitter2_1 = require("eventemitter2");
class RuntimeStatsService extends eventemitter2_1.EventEmitter2 {
    constructor() {
        super(...arguments);
        this.logger = (0, debug_1.default)('axm:services:runtimeStats');
        this.enabled = false;
    }
    init() {
        this.logger('init');
        if (process.env.PM2_APM_DISABLE_RUNTIME_STATS === 'true') {
            return this.logger('disabling service because of the environment flag');
        }
        const modulePath = module_1.default.detectModule('@pm2/node-runtime-stats');
        if (typeof modulePath !== 'string')
            return;
        const RuntimeStats = module_1.default.loadModule(modulePath);
        if (RuntimeStats instanceof Error) {
            return this.logger(`Failed to require module @pm2/node-runtime-stats: ${RuntimeStats.message}`);
        }
        this.noduleInstance = new RuntimeStats({
            delay: 1000
        });
        this.logger('starting runtime stats');
        this.noduleInstance.start();
        this.handle = (data) => {
            this.logger('received runtime stats', data);
            this.emit('data', data);
        };
        this.noduleInstance.on('sense', this.handle);
        this.enabled = true;
    }
    isEnabled() {
        return this.enabled;
    }
    destroy() {
        if (this.noduleInstance !== undefined && this.noduleInstance !== null) {
            this.logger('removing listener on runtime stats service');
            this.noduleInstance.removeListener('sense', this.handle);
            this.noduleInstance.stop();
        }
        this.logger('destroy');
    }
}
exports.RuntimeStatsService = RuntimeStatsService;

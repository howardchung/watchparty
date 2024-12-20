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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZVN0YXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL3J1bnRpbWVTdGF0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7OztBQUVaLGlDQUF5QjtBQUN6Qiw0Q0FBbUM7QUFDbkMsaURBQTZDO0FBRTdDLE1BQWEsbUJBQW9CLFNBQVEsNkJBQWE7SUFBdEQ7O1FBRVUsV0FBTSxHQUFRLElBQUEsZUFBSyxFQUFDLDJCQUEyQixDQUFDLENBQUE7UUFHaEQsWUFBTyxHQUFZLEtBQUssQ0FBQTtJQTZDbEMsQ0FBQztJQTNDQyxJQUFJO1FBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNuQixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEtBQUssTUFBTSxFQUFFO1lBQ3hELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxtREFBbUQsQ0FBQyxDQUFBO1NBQ3hFO1FBRUQsTUFBTSxVQUFVLEdBQUcsZ0JBQUssQ0FBQyxZQUFZLENBQUMseUJBQXlCLENBQUMsQ0FBQTtRQUNoRSxJQUFJLE9BQU8sVUFBVSxLQUFLLFFBQVE7WUFBRSxPQUFNO1FBRTFDLE1BQU0sWUFBWSxHQUFHLGdCQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQ2pELElBQUksWUFBWSxZQUFZLEtBQUssRUFBRTtZQUNqQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMscURBQXFELFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO1NBQ2hHO1FBQ0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLFlBQVksQ0FBQztZQUNyQyxLQUFLLEVBQUUsSUFBSTtTQUNaLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtRQUNyQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxDQUFBO1lBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFBO1FBQ3pCLENBQUMsQ0FBQTtRQUdELElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDNUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7SUFDckIsQ0FBQztJQUtELFNBQVM7UUFDUCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUE7SUFDckIsQ0FBQztJQUVELE9BQU87UUFDTCxJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssSUFBSSxFQUFFO1lBQ3JFLElBQUksQ0FBQyxNQUFNLENBQUMsNENBQTRDLENBQUMsQ0FBQTtZQUN6RCxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQ3hELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUE7U0FDM0I7UUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3hCLENBQUM7Q0FDRjtBQWxERCxrREFrREMifQ==
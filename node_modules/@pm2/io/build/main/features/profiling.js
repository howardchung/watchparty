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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ZlYXR1cmVzL3Byb2ZpbGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw4REFBc0Q7QUFDdEQsc0VBQThEO0FBQzlELDRDQUE4QztBQUM5QywrQkFBOEI7QUFROUIsTUFBYSxlQUFlO0NBSzNCO0FBTEQsMENBS0M7QUFFRCxNQUFNLHNCQUFzQixHQUFvQjtJQUM5QyxLQUFLLEVBQUUsSUFBSTtJQUNYLFlBQVksRUFBRSxJQUFJO0lBQ2xCLFlBQVksRUFBRSxJQUFJO0lBQ2xCLGNBQWMsRUFBRSxNQUFNO0NBQ3ZCLENBQUE7QUFFRCxNQUFNLHVCQUF1QixHQUFvQjtJQUMvQyxLQUFLLEVBQUUsS0FBSztJQUNaLFlBQVksRUFBRSxLQUFLO0lBQ25CLFlBQVksRUFBRSxLQUFLO0lBQ25CLGNBQWMsRUFBRSxNQUFNO0NBQ3ZCLENBQUE7QUFFRCxNQUFhLGdCQUFnQjtJQUE3QjtRQUdVLFdBQU0sR0FBYSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtJQTRDNUQsQ0FBQztJQTFDQyxJQUFJLENBQUUsTUFBa0M7UUFDdEMsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO1lBQ25CLE1BQU0sR0FBRyxzQkFBc0IsQ0FBQTtTQUNoQzthQUFNLElBQUksTUFBTSxLQUFLLEtBQUssRUFBRTtZQUMzQixNQUFNLEdBQUcsdUJBQXVCLENBQUE7U0FDakM7YUFBTSxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDL0IsTUFBTSxHQUFHLHNCQUFzQixDQUFBO1NBQ2hDO1FBR0QsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixLQUFLLE1BQU0sRUFBRTtZQUN2RCxNQUFNLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQTtTQUNoQztRQUVELElBQUksTUFBTSxDQUFDLGNBQWMsS0FBSyxTQUFTLElBQUksTUFBTSxDQUFDLGNBQWMsS0FBSyxNQUFNLEVBQUU7WUFDM0UsTUFBTSxDQUFDLGNBQWMsR0FBRyxJQUFBLDJCQUFlLEdBQUUsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFBO1NBQzNFO1FBRUQsUUFBUSxNQUFNLENBQUMsY0FBYyxFQUFFO1lBQzdCLEtBQUssV0FBVyxDQUFDLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsZ0NBQWdDLENBQUMsQ0FBQTtnQkFDN0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLDJCQUFpQixFQUFFLENBQUE7Z0JBQ3ZDLE1BQUs7YUFDTjtZQUNELEtBQUssT0FBTyxDQUFDLENBQUM7Z0JBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFBO2dCQUN6QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQWEsRUFBRSxDQUFBO2dCQUNuQyxNQUFLO2FBQ047WUFDRCxPQUFPLENBQUMsQ0FBQztnQkFDUCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsNENBQTRDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFBO2FBQ3hGO1NBQ0Y7UUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDdEIsQ0FBQztJQUVELE9BQU87UUFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ3RCLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTO1lBQUUsT0FBTTtRQUN2QyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ3pCLENBQUM7Q0FDRjtBQS9DRCw0Q0ErQ0MifQ==
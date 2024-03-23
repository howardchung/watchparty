"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracing = void 0;
const core = require("@opencensus/core");
const default_config_1 = require("./config/default-config");
const constants_1 = require("./constants");
const plugin_loader_1 = require("./instrumentation/plugin-loader");
class Tracing {
    constructor() {
        this.configLocal = {};
        this.tracer = new core.CoreTracer();
        this.defaultPlugins = plugin_loader_1.PluginLoader.defaultPluginsFromArray(constants_1.Constants.DEFAULT_INSTRUMENTATION_MODULES);
    }
    static get instance() {
        return this.singletonInstance || (this.singletonInstance = new this());
    }
    get active() {
        return this.activeLocal;
    }
    get config() {
        return this.configLocal;
    }
    start(userConfig) {
        this.configLocal = Object.assign(default_config_1.defaultConfig, { plugins: this.defaultPlugins }, userConfig);
        this.logger =
            this.configLocal.logger || core.logger.logger(this.configLocal.logLevel);
        this.configLocal.logger = this.logger;
        this.logger.debug('config: %o', this.configLocal);
        this.pluginLoader = new plugin_loader_1.PluginLoader(this.logger, this.tracer);
        this.pluginLoader.loadPlugins(this.configLocal.plugins);
        if (!this.configLocal.exporter) {
            const exporter = new core.ConsoleExporter(this.configLocal);
            this.registerExporter(exporter);
        }
        else {
            this.registerExporter(this.configLocal.exporter);
        }
        this.activeLocal = true;
        this.tracer.start(this.configLocal);
        return this;
    }
    stop() {
        this.activeLocal = false;
        this.tracer.stop();
        this.pluginLoader.unloadPlugins();
        this.configLocal = {};
    }
    get exporter() {
        return this.configLocal.exporter;
    }
    registerExporter(exporter) {
        if (this.configLocal.exporter) {
            this.unregisterExporter(this.configLocal.exporter);
        }
        if (exporter) {
            this.configLocal.exporter = exporter;
            this.tracer.registerSpanEventListener(exporter);
        }
        return this;
    }
    unregisterExporter(exporter) {
        this.tracer.unregisterSpanEventListener(exporter);
        this.configLocal.exporter = undefined;
        return this;
    }
}
exports.Tracing = Tracing;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NlbnN1cy90cmFjZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBZUEseUNBQXdDO0FBRXhDLDREQUF1RDtBQUN2RCwyQ0FBdUM7QUFDdkMsbUVBQThEO0FBRzlELE1BQWEsT0FBTztJQWlCbEI7UUFUUSxnQkFBVyxHQUFnQixFQUFFLENBQUE7UUFVbkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUNuQyxJQUFJLENBQUMsY0FBYyxHQUFHLDRCQUFZLENBQUMsdUJBQXVCLENBQ3RELHFCQUFTLENBQUMsK0JBQStCLENBQUMsQ0FBQTtJQUNoRCxDQUFDO0lBR0QsTUFBTSxLQUFLLFFBQVE7UUFDakIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0lBQ3hFLENBQUM7SUFHRCxJQUFJLE1BQU07UUFDUixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUE7SUFDekIsQ0FBQztJQUdELElBQUksTUFBTTtRQUNSLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQTtJQUN6QixDQUFDO0lBT0QsS0FBSyxDQUFFLFVBQXdCO1FBQzdCLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyw4QkFBYSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQTtRQUU3RixJQUFJLENBQUMsTUFBTTtZQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDNUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQTtRQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ2pELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSw0QkFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQzlELElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBMkIsQ0FBQyxDQUFBO1FBRTNFLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRTtZQUM5QixNQUFNLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1lBQzNELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQTtTQUNoQzthQUFNO1lBQ0wsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUE7U0FDakQ7UUFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtRQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDbkMsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBR0QsSUFBSTtRQUNGLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFBO1FBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDbEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUNqQyxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQTtJQUN2QixDQUFDO0lBR0QsSUFBSSxRQUFRO1FBRVYsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQTtJQUNsQyxDQUFDO0lBTUQsZ0JBQWdCLENBQUUsUUFBdUI7UUFDdkMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRTtZQUM3QixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtTQUNuRDtRQUNELElBQUksUUFBUSxFQUFFO1lBQ1osSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1lBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLENBQUE7U0FDaEQ7UUFDRCxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7SUFNRCxrQkFBa0IsQ0FBRSxRQUF1QjtRQUN6QyxJQUFJLENBQUMsTUFBTSxDQUFDLDJCQUEyQixDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQTtRQUNyQyxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7Q0FDRjtBQXRHRCwwQkFzR0MifQ==
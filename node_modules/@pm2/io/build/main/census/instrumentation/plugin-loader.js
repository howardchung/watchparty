"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginLoader = void 0;
const fs = require("fs");
const path = require("path");
const hook = require("require-in-the-middle");
const constants_1 = require("../constants");
var HookState;
(function (HookState) {
    HookState[HookState["UNINITIALIZED"] = 0] = "UNINITIALIZED";
    HookState[HookState["ENABLED"] = 1] = "ENABLED";
    HookState[HookState["DISABLED"] = 2] = "DISABLED";
})(HookState || (HookState = {}));
class PluginLoader {
    constructor(logger, tracer) {
        this.plugins = [];
        this.hookState = HookState.UNINITIALIZED;
        this.tracer = tracer;
        this.logger = logger;
    }
    static defaultPackageName(moduleName) {
        return `${constants_1.Constants.OPENCENSUS_SCOPE}/${constants_1.Constants.DEFAULT_PLUGIN_PACKAGE_NAME_PREFIX}-${moduleName}`;
    }
    static defaultPluginsFromArray(modulesToPatch) {
        const plugins = modulesToPatch.reduce((plugins, moduleName) => {
            plugins[moduleName] = PluginLoader.defaultPackageName(moduleName);
            return plugins;
        }, {});
        return plugins;
    }
    getPackageVersion(name, basedir) {
        let version = '';
        if (basedir) {
            const pkgJson = path.join(basedir, 'package.json');
            try {
                version = JSON.parse(fs.readFileSync(pkgJson).toString()).version;
            }
            catch (e) {
                this.logger.error('could not get version of %s module: %s', name, e.message);
            }
        }
        else {
            version = process.versions.node;
        }
        return version;
    }
    loadPlugins(pluginList) {
        if (this.hookState === HookState.UNINITIALIZED) {
            hook(Object.keys(pluginList), (exports, name, basedir) => {
                if (this.hookState !== HookState.ENABLED) {
                    return exports;
                }
                const plugin = pluginList[name];
                const version = this.getPackageVersion(name, basedir);
                this.logger.info('trying loading %s.%s', name, version);
                if (!version) {
                    return exports;
                }
                this.logger.debug('applying patch to %s@%s module', name, version);
                let moduleName;
                let moduleConfig = {};
                if (typeof plugin === 'string') {
                    moduleName = plugin;
                }
                else {
                    moduleConfig = plugin.config;
                    moduleName = plugin.module;
                }
                this.logger.debug('using package %s to patch %s', moduleName, name);
                try {
                    const plugin = require(moduleName).plugin;
                    this.plugins.push(plugin);
                    return plugin.enable(exports, this.tracer, version, moduleConfig, basedir);
                }
                catch (e) {
                    this.logger.error('could not load plugin %s of module %s. Error: %s', moduleName, name, e.message);
                    return exports;
                }
            });
        }
        this.hookState = HookState.ENABLED;
    }
    unloadPlugins() {
        for (const plugin of this.plugins) {
            plugin.disable();
        }
        this.plugins = [];
        this.hookState = HookState.DISABLED;
    }
    static set searchPathForTest(searchPath) {
        module.paths.push(searchPath);
    }
}
exports.PluginLoader = PluginLoader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLWxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jZW5zdXMvaW5zdHJ1bWVudGF0aW9uL3BsdWdpbi1sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBaUJBLHlCQUF3QjtBQUN4Qiw2QkFBNEI7QUFDNUIsOENBQTZDO0FBRTdDLDRDQUF3QztBQUV4QyxJQUFLLFNBSUo7QUFKRCxXQUFLLFNBQVM7SUFDWiwyREFBYSxDQUFBO0lBQ2IsK0NBQU8sQ0FBQTtJQUNQLGlEQUFRLENBQUE7QUFDVixDQUFDLEVBSkksU0FBUyxLQUFULFNBQVMsUUFJYjtBQU9ELE1BQWEsWUFBWTtJQWlCdkIsWUFBYSxNQUFjLEVBQUUsTUFBYztRQVgzQyxZQUFPLEdBQWEsRUFBRSxDQUFBO1FBS2QsY0FBUyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUE7UUFPekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7UUFDcEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7SUFDdEIsQ0FBQztJQVFPLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBRSxVQUFrQjtRQUNuRCxPQUFPLEdBQUcscUJBQVMsQ0FBQyxnQkFBZ0IsSUFDaEMscUJBQVMsQ0FBQyxrQ0FBa0MsSUFBSSxVQUFVLEVBQUUsQ0FBQTtJQUNsRSxDQUFDO0lBUUQsTUFBTSxDQUFDLHVCQUF1QixDQUFFLGNBQXdCO1FBQ3RELE1BQU0sT0FBTyxHQUNULGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFvQixFQUFFLFVBQWtCLEVBQUUsRUFBRTtZQUNqRSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFBO1lBQ2pFLE9BQU8sT0FBTyxDQUFBO1FBQ2hCLENBQUMsRUFBRSxFQUFpQixDQUFDLENBQUE7UUFDekIsT0FBTyxPQUFPLENBQUE7SUFDaEIsQ0FBQztJQU9PLGlCQUFpQixDQUFF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
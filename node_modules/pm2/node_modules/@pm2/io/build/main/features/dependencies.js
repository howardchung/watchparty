"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependenciesFeature = void 0;
const serviceManager_1 = require("../serviceManager");
const Debug = require("debug");
const configuration_1 = require("../configuration");
const fs_1 = require("fs");
class DependenciesFeature {
    constructor() {
        this.logger = Debug('axm:features:dependencies');
    }
    init() {
        this.transport = serviceManager_1.ServiceManager.get('transport');
        this.logger('init');
        const pkgPath = configuration_1.default.findPackageJson();
        if (typeof pkgPath !== 'string')
            return this.logger('failed to found pkg.json path');
        this.logger(`found pkg.json in ${pkgPath}`);
        (0, fs_1.readFile)(pkgPath, (err, data) => {
            if (err)
                return this.logger(`failed to read pkg.json`, err);
            try {
                const pkg = JSON.parse(data.toString());
                if (typeof pkg.dependencies !== 'object') {
                    return this.logger(`failed to find deps in pkg.json`);
                }
                const dependencies = Object.keys(pkg.dependencies)
                    .reduce((list, name) => {
                    list[name] = { version: pkg.dependencies[name] };
                    return list;
                }, {});
                this.logger(`collected ${Object.keys(dependencies).length} dependencies`);
                this.transport.send('application:dependencies', dependencies);
                this.logger('sent dependencies list');
            }
            catch (err) {
                return this.logger(`failed to parse pkg.json`, err);
            }
        });
    }
    destroy() {
        this.logger('destroy');
    }
}
exports.DependenciesFeature = DependenciesFeature;

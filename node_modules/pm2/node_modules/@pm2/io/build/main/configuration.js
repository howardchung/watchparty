"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = require("debug");
const debug = (0, debug_1.default)('axm:configuration');
const serviceManager_1 = require("./serviceManager");
const autocast_1 = require("./utils/autocast");
const path = require("path");
const fs = require("fs");
class Configuration {
    static configureModule(opts) {
        if (serviceManager_1.ServiceManager.get('transport'))
            serviceManager_1.ServiceManager.get('transport').setOptions(opts);
    }
    static findPackageJson() {
        try {
            require.main = Configuration.getMain();
        }
        catch (_e) {
        }
        if (!require.main) {
            return;
        }
        if (!require.main.paths) {
            return;
        }
        let pkgPath = path.resolve(path.dirname(require.main.filename), 'package.json');
        try {
            fs.statSync(pkgPath);
        }
        catch (e) {
            try {
                pkgPath = path.resolve(path.dirname(require.main.filename), '..', 'package.json');
                fs.statSync(pkgPath);
            }
            catch (e) {
                debug('Cannot find package.json');
                try {
                    pkgPath = path.resolve(path.dirname(require.main.filename), '..', '..', 'package.json');
                    fs.statSync(pkgPath);
                }
                catch (e) {
                    debug('Cannot find package.json');
                    return null;
                }
            }
            return pkgPath;
        }
        return pkgPath;
    }
    static init(conf, doNotTellPm2) {
        const packageFilepath = Configuration.findPackageJson();
        let packageJson;
        if (!conf.module_conf) {
            conf.module_conf = {};
        }
        conf.apm = {
            type: 'node',
            version: null
        };
        try {
            const prefix = __dirname.replace(/\\/g, '/').indexOf('/build/') >= 0 ? '../../' : '../';
            const pkg = require(prefix + 'package.json');
            conf.apm.version = pkg.version || null;
        }
        catch (err) {
            debug('Failed to fetch current apm version: ', err.message);
        }
        if (conf.isModule === true) {
            try {
                packageJson = require(packageFilepath || '');
                conf.module_version = packageJson.version;
                conf.module_name = packageJson.name;
                conf.description = packageJson.description;
                if (packageJson.config) {
                    conf = Object.assign(conf, packageJson.config);
                    conf.module_conf = packageJson.config;
                }
            }
            catch (e) {
                throw new Error(e);
            }
        }
        else {
            conf.module_name = process.env.name || 'outside-pm2';
            try {
                packageJson = require(packageFilepath || '');
                conf.module_version = packageJson.version;
                if (packageJson.config) {
                    conf = Object.assign(conf, packageJson.config);
                    conf.module_conf = packageJson.config;
                }
            }
            catch (e) {
                debug(e.message);
            }
        }
        try {
            if (process.env[conf.module_name]) {
                const castedConf = new autocast_1.default().autocast(JSON.parse(process.env[conf.module_name] || ''));
                conf = Object.assign(conf, castedConf);
                delete castedConf.probes;
                conf.module_conf = JSON.parse(JSON.stringify(Object.assign(conf.module_conf, castedConf)));
                Object.keys(conf.module_conf).forEach(function (key) {
                    if ((key === 'password' || key === 'passwd') &&
                        conf.module_conf[key].length >= 1) {
                        conf.module_conf[key] = 'Password hidden';
                    }
                });
            }
        }
        catch (e) {
            debug(e);
        }
        if (doNotTellPm2 === true)
            return conf;
        Configuration.configureModule(conf);
        return conf;
    }
    static getMain() {
        return require.main || { filename: './somefile.js' };
    }
}
exports.default = Configuration;

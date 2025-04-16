"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = require("debug");
const debug = (0, debug_1.default)('axm:configuration');
const serviceManager_1 = require("./serviceManager");
const autocast_1 = require("./utils/autocast");
const path = require("path");
const fs = require("fs");
const util = require("util");
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
                    conf = util['_extend'](conf, packageJson.config);
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
                    conf = util['_extend'](conf, packageJson.config);
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
                conf = util['_extend'](conf, castedConf);
                delete castedConf.probes;
                conf.module_conf = JSON.parse(JSON.stringify(util['_extend'](conf.module_conf, castedConf)));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQXlCO0FBQ3pCLE1BQU0sS0FBSyxHQUFHLElBQUEsZUFBSyxFQUFDLG1CQUFtQixDQUFDLENBQUE7QUFFeEMscURBQWlEO0FBQ2pELCtDQUF1QztBQUN2Qyw2QkFBNEI7QUFDNUIseUJBQXdCO0FBQ3hCLDZCQUE0QjtBQUU1QixNQUFxQixhQUFhO0lBRWhDLE1BQU0sQ0FBQyxlQUFlLENBQUUsSUFBSTtRQUMxQixJQUFJLCtCQUFjLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztZQUFFLCtCQUFjLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN2RixDQUFDO0lBRUQsTUFBTSxDQUFDLGVBQWU7UUFDcEIsSUFBSTtZQUNGLE9BQU8sQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO1NBQ3ZDO1FBQUMsT0FBTyxFQUFFLEVBQUU7U0FFWjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFO1lBQ2pCLE9BQU07U0FDUDtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUN2QixPQUFNO1NBQ1A7UUFFRCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQTtRQUMvRSxJQUFJO1lBQ0YsRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsSUFBSTtnQkFDRixPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8s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
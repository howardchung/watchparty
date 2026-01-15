"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Debug = require("debug");
const path = require("path");
const debug = Debug('axm:utils:module');
class ModuleUtils {
    static loadModule(modulePath, args) {
        let nodule;
        try {
            if (args) {
                nodule = require(modulePath).apply(this, args);
            }
            else {
                nodule = require(modulePath);
            }
            debug(`Succesfully required module at path ${modulePath}`);
            return nodule;
        }
        catch (err) {
            debug(`Failed to load module at path ${modulePath}: ${err.message}`);
            return err;
        }
    }
    static detectModule(moduleName) {
        const fakePath = ['./node_modules', '/node_modules'];
        if (!require.main) {
            return null;
        }
        const paths = typeof require.main.paths === 'undefined' ? fakePath : require.main.paths;
        const requirePaths = paths.slice();
        return ModuleUtils._lookForModule(requirePaths, moduleName);
    }
    static _lookForModule(requirePaths, moduleName) {
        const fsConstants = fs.constants || fs;
        for (let requirePath of requirePaths) {
            const completePath = path.join(requirePath, moduleName);
            debug(`Looking for module ${moduleName} in ${completePath}`);
            try {
                fs.accessSync(completePath, fsConstants.R_OK);
                debug(`Found module ${moduleName} in path ${completePath}`);
                return completePath;
            }
            catch (err) {
                debug(`module ${moduleName} not found in path ${completePath}`);
                continue;
            }
        }
        return null;
    }
}
exports.default = ModuleUtils;

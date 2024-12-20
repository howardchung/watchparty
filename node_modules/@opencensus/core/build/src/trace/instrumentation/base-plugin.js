"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright 2018, OpenCensus Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const path = require("path");
const semver = require("semver");
/** This class represent the base to patch plugin. */
class BasePlugin {
    /**
     * Constructs a new BasePlugin instance.
     * @param moduleName The module name.
     */
    constructor(moduleName) {
        this.moduleName = moduleName;
    }
    /**
     * Sets modified plugin to the context.
     * @param moduleExports nodejs module exports to set as context
     * @param tracer tracer relating to context
     * @param version module version description
     * @param options plugin options
     * @param basedir module absolute path
     */
    setPluginContext(
    // tslint:disable-next-line:no-any
    moduleExports, tracer, version, options, basedir) {
        this.moduleExports = moduleExports;
        this.tracer = tracer;
        this.version = version;
        this.basedir = basedir;
        this.logger = tracer.logger;
        this.options = options;
        this.internalFilesExports = this.loadInternalFiles();
    }
    /**
     * Method that enables the instrumentation patch.
     *
     * This method implements the GoF Template Method Pattern
     * 'enable' is the invariant part of the pattern and
     * 'applyPatch' the variant.
     *
     * @param moduleExports nodejs module exports from the module to patch
     * @param tracer a tracer instance
     * @param version version of the current instaled module to patch
     * @param options plugin options
     * @param basedir module absolute path
     */
    enable(
    // tslint:disable-next-line:no-any
    moduleExports, tracer, version, options, basedir) {
        this.setPluginContext(moduleExports, tracer, version, options, basedir);
        return this.applyPatch();
    }
    /** Method to disable the instrumentation  */
    disable() {
        this.applyUnpatch();
    }
    /**
     * Load internal files according to version range
     */
    loadInternalFiles() {
        let result = null;
        if (this.internalFileList) {
            this.logger.debug('loadInternalFiles %o', this.internalFileList);
            Object.keys(this.internalFileList).forEach(versionRange => {
                if (semver.satisfies(this.version, versionRange)) {
                    if (result) {
                        this.logger.warn('Plugin for %s@%s, has overlap version range (%s) for internal files: %o', this.moduleName, this.version, versionRange, this.internalFileList);
                    }
                    result = this.loadInternalModuleFiles(this.internalFileList[versionRange], this.basedir);
                }
            });
            if (!result) {
                this.logger.debug('No internal file could be loaded for %s@%s', this.moduleName, this.version);
            }
        }
        return result;
    }
    /**
     * Load internal files from a module and  set internalFilesExports
     */
    loadInternalModuleFiles(extraModulesList, basedir) {
        const extraModules = {};
        if (extraModulesList) {
            Object.keys(extraModulesList).forEach(moduleName => {
                try {
                    this.logger.debug('loading File %s', extraModulesList[moduleName]);
                    extraModules[moduleName] =
                        require(path.join(basedir, extraModulesList[moduleName]));
                }
                catch (e) {
                    this.logger.error('Could not load internal file %s of module %s. Error: %s', path.join(basedir, extraModulesList[moduleName]), this.moduleName, e.message);
                }
            });
        }
        return extraModules;
    }
}
exports.BasePlugin = BasePlugin;
//# sourceMappingURL=base-plugin.js.map
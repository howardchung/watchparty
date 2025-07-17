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
import { Tracer } from '../model/types';
/** Interface Plugin to apply patch. */
export interface Plugin {
    /**
     * Method that enables the instrumentation patch.
     *
     * @param moduleExports nodejs module exports from the module to patch
     * @param tracer a tracer instance
     * @param version version of the current instaled module to patch
     * @param options plugin options
     * @param basedir module absolute path
     */
    enable(moduleExports: any, tracer: Tracer, version: string, options: PluginConfig, basedir?: string): any;
    /** Method to disable the instrumentation  */
    disable(): void;
}
export declare type PluginConfig = {
    [key: string]: any;
};
export declare type NamedPluginConfig = {
    module: string;
    config: PluginConfig;
};
/**
 * Type PluginNames: each key should be the name of the module to trace,
 * and its value should be the name of the package  which has the
 * plugin implementation.
 */
export declare type PluginNames = {
    [pluginName: string]: string | NamedPluginConfig;
};
export declare type PluginInternalFilesVersion = {
    [pluginName: string]: string;
};
/**
 * Each key should be the name of the module to trace, and its value
 * a mapping of a property name to a internal plugin file name.
 */
export declare type PluginInternalFiles = {
    [versions: string]: PluginInternalFilesVersion;
};

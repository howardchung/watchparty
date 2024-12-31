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
import * as types from './types';
/**
 * This class implements a console logger.
 */
export declare class ConsoleLogger implements types.Logger {
    private logger;
    static LEVELS: string[];
    level: string;
    /**
     * Constructs a new ConsoleLogger instance
     * @param options A logger configuration object.
     */
    constructor(options?: types.LoggerOptions | string | number);
    /**
     * Logger error function.
     * @param message menssage erro to log in console
     * @param args arguments to log in console
     */
    error(message: any, ...args: any[]): void;
    /**
     * Logger warning function.
     * @param message menssage warning to log in console
     * @param args arguments to log in console
     */
    warn(message: any, ...args: any[]): void;
    /**
     * Logger info function.
     * @param message menssage info to log in console
     * @param args arguments to log in console
     */
    info(message: any, ...args: any[]): void;
    /**
     * Logger debug function.
     * @param message menssage debug to log in console
     * @param args arguments to log in console
     */
    debug(message: any, ...args: any[]): void;
}
/**
 * Function logger exported to others classes. Inspired by:
 * https://github.com/cainus/logdriver/blob/bba1761737ca72f04d6b445629848538d038484a/index.js#L50
 * @param options A logger options or strig to logger in console
 */
declare const logger: (options?: string | number | types.LoggerOptions) => types.Logger;
export { logger };

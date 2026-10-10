/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { EventEmitter } from './misc.js';
/**
 * Controls how much information Mediabunny prints to the console. Higher levels include all lower levels.
 *
 * @group Logging
 * @public
 */
export var LogLevel;
(function (LogLevel) {
    /** Nothing is printed to the console. */
    LogLevel[LogLevel["Silent"] = 0] = "Silent";
    /** Only errors are printed. */
    LogLevel[LogLevel["Errors"] = 1] = "Errors";
    /** Errors and warnings are printed. */
    LogLevel[LogLevel["Warnings"] = 2] = "Warnings";
    /** Errors, warnings, and informational messages are printed. */
    LogLevel[LogLevel["Info"] = 3] = "Info";
})(LogLevel || (LogLevel = {}));
/**
 * Mediabunny's central logging singleton. Use {@link Logging.level} to control how much is printed to the console,
 * and subscribe to log events using {@link Logging.on}.
 *
 * Having manual control over logging is useful for command-line applications where you want full say over the output.
 *
 * @group Logging
 * @public
 */
export class Logging {
    constructor() { }
    /** The current log level. Defaults to {@link LogLevel.Info}. */
    static get level() {
        return Logging._level;
    }
    static set level(value) {
        if (value !== LogLevel.Silent
            && value !== LogLevel.Errors
            && value !== LogLevel.Warnings
            && value !== LogLevel.Info) {
            throw new TypeError('Invalid log level. Use one of the values of the LogLevel enum.');
        }
        Logging._level = value;
    }
    /** @internal */
    static get _emitter() {
        // Created lazily to avoid touching the EventEmitter binding at module-eval time
        return Logging._emitterInstance ??= new EventEmitter();
    }
    /** Registers a listener for a log event. Returns a function that, when called, removes the listener again. */
    static on(event, listener, options) {
        return Logging._emitter.on(event, listener, options);
    }
    /** @internal */
    static _error(...args) {
        Logging._emitter._emit('error', args);
        if (Logging._level >= LogLevel.Errors) {
            console.error(...args);
        }
    }
    /** @internal */
    static _warn(...args) {
        Logging._emitter._emit('warn', args);
        if (Logging._level >= LogLevel.Warnings) {
            console.warn(...args);
        }
    }
    /** @internal */
    static _info(...args) {
        Logging._emitter._emit('info', args);
        if (Logging._level >= LogLevel.Info) {
            console.info(...args);
        }
    }
}
/** @internal */
Logging._level = LogLevel.Info;
/** @internal */
Logging._emitterInstance = null;

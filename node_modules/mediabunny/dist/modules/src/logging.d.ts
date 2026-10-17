/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { type EventListenerOptions } from './misc.js';
/**
 * Controls how much information Mediabunny prints to the console. Higher levels include all lower levels.
 *
 * @group Logging
 * @public
 */
export declare enum LogLevel {
    /** Nothing is printed to the console. */
    Silent = 0,
    /** Only errors are printed. */
    Errors = 1,
    /** Errors and warnings are printed. */
    Warnings = 2,
    /** Errors, warnings, and informational messages are printed. */
    Info = 3
}
/**
 * The events emitted by {@link Logging}. Each event carries the same arguments that were passed to the corresponding
 * log call.
 *
 * @group Logging
 * @public
 */
export type LoggingEvents = {
    /** Emitted before an error is logged. */
    error: unknown[];
    /** Emitted before a warning is logged. */
    warn: unknown[];
    /** Emitted before an informational message is logged. */
    info: unknown[];
};
/**
 * Mediabunny's central logging singleton. Use {@link Logging.level} to control how much is printed to the console,
 * and subscribe to log events using {@link Logging.on}.
 *
 * Having manual control over logging is useful for command-line applications where you want full say over the output.
 *
 * @group Logging
 * @public
 */
export declare class Logging {
    private constructor();
    /** The current log level. Defaults to {@link LogLevel.Info}. */
    static get level(): LogLevel;
    static set level(value: LogLevel);
    /** Registers a listener for a log event. Returns a function that, when called, removes the listener again. */
    static on<K extends keyof LoggingEvents>(event: K, listener: (data: LoggingEvents[K]) => unknown, options?: EventListenerOptions): () => void;
}
//# sourceMappingURL=logging.d.ts.map
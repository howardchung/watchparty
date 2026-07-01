"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwaitQueueRemovedTaskError = exports.AwaitQueueStoppedError = void 0;
/**
 * Custom Error derived class used to reject pending tasks once stop() method
 * has been called.
 */
class AwaitQueueStoppedError extends Error {
    constructor(message) {
        super(message ?? 'queue stopped');
        this.name = 'AwaitQueueStoppedError';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, AwaitQueueStoppedError);
        }
    }
}
exports.AwaitQueueStoppedError = AwaitQueueStoppedError;
/**
 * Custom Error derived class used to reject pending tasks once removeTask()
 * method has been called.
 */
class AwaitQueueRemovedTaskError extends Error {
    constructor(message) {
        super(message ?? 'queue task removed');
        this.name = 'AwaitQueueRemovedTaskError';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, AwaitQueueRemovedTaskError);
        }
    }
}
exports.AwaitQueueRemovedTaskError = AwaitQueueRemovedTaskError;

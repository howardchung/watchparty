/**
 * Custom Error derived class used to reject pending tasks once stop() method
 * has been called.
 */
export declare class AwaitQueueStoppedError extends Error {
    constructor(message?: string);
}
/**
 * Custom Error derived class used to reject pending tasks once removeTask()
 * method has been called.
 */
export declare class AwaitQueueRemovedTaskError extends Error {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map
import type { AwaitQueuePushOptions, AwaitQueueTask, AwaitQueueTaskDump } from './types';
export declare class AwaitQueue {
    private readonly pendingTasks;
    private nextTaskId;
    constructor();
    get size(): number;
    push<T>(task: AwaitQueueTask<T>, name?: string, options?: AwaitQueuePushOptions): Promise<T>;
    stop(): void;
    remove(taskIdx: number): void;
    dump(): AwaitQueueTaskDump[];
    private execute;
}
//# sourceMappingURL=AwaitQueue.d.ts.map
import { EventEmitter, type Listener } from 'events-alias';
type Events = Record<string, any[]>;
export declare class EnhancedEventEmitter<E extends Events = Events> extends EventEmitter {
    constructor();
    /**
     * Empties all stored event listeners.
     */
    close(): void;
    emit<K extends keyof E & string>(eventName: K, ...args: E[K]): boolean;
    /**
     * Special addition to the EventEmitter API.
     */
    safeEmit<K extends keyof E & string>(eventName: K, ...args: E[K]): boolean;
    on<K extends keyof E & string>(eventName: K, listener: (...args: E[K]) => void): this;
    off<K extends keyof E & string>(eventName: K, listener: (...args: E[K]) => void): this;
    addListener<K extends keyof E & string>(eventName: K, listener: (...args: E[K]) => void): this;
    prependListener<K extends keyof E & string>(eventName: K, listener: (...args: E[K]) => void): this;
    once<K extends keyof E & string>(eventName: K, listener: (...args: E[K]) => void): this;
    prependOnceListener<K extends keyof E & string>(eventName: K, listener: (...args: E[K]) => void): this;
    removeListener<K extends keyof E & string>(eventName: K, listener: (...args: E[K]) => void): this;
    removeAllListeners<K extends keyof E & string>(eventName?: K): this;
    listenerCount<K extends keyof E & string>(eventName: K): number;
    listeners<K extends keyof E & string>(eventName: K): Listener[];
    rawListeners<K extends keyof E & string>(eventName: K): Listener[];
}
export {};
//# sourceMappingURL=enhancedEvents.d.ts.map
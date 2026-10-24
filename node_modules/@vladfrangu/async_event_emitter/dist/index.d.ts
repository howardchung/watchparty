type InternalGetAsyncEventEmitterEventParameters<EE extends AsyncEventEmitter<any>, EventName extends PropertyKey, Events extends Record<PropertyKey, unknown[]> = EE extends AsyncEventEmitter<infer Events> ? Events : Record<PropertyKey, unknown[]>> = EventName extends keyof AsyncEventEmitterPredefinedEvents ? EventName extends keyof Events ? AsyncEventEmitterPredefinedEvents[EventName] | (Events & Record<PropertyKey, unknown[]>)[EventName] : AsyncEventEmitterPredefinedEvents[EventName] : EventName extends keyof Events ? (Events & Record<PropertyKey, unknown[]>)[EventName] : any[];
type GetAsyncEventEmitterEventParameters<EE extends AsyncEventEmitter<any>, EventName extends PropertyKey | keyof AsyncEventEmitterPredefinedEvents> = InternalGetAsyncEventEmitterEventParameters<EE, EventName>;
type InternalAsyncEventEmitterInternalListenerForEvent<EE extends AsyncEventEmitter<any>, EventName extends PropertyKey, Events extends Record<PropertyKey, unknown[]> = EE extends AsyncEventEmitter<infer Events> ? Events : Record<PropertyKey, unknown[]>> = EventName extends keyof AsyncEventEmitterPredefinedEvents ? EventName extends keyof Events ? Listener<AsyncEventEmitterPredefinedEvents[EventName] | (Events & Record<PropertyKey, unknown[]>)[EventName]> : Listener<AsyncEventEmitterPredefinedEvents[EventName]> : EventName extends keyof Events ? Listener<(Events & Record<PropertyKey, unknown[]>)[EventName]> : Listener<any[]>;
type AsyncEventEmitterInternalListenerForEvent<EE extends AsyncEventEmitter<any>, EventName extends PropertyKey | keyof AsyncEventEmitterPredefinedEvents> = InternalAsyncEventEmitterInternalListenerForEvent<EE, EventName>;
type AsyncEventEmitterListenerForEvent<EE extends AsyncEventEmitter<any>, EventName extends PropertyKey | keyof AsyncEventEmitterPredefinedEvents> = Exclude<AsyncEventEmitterInternalListenerForEvent<EE, EventName>['listener'], undefined>;
declare const brandSymbol: unique symbol;
declare const kCapturePromiseRejections: unique symbol;
declare class AsyncEventEmitter<Events extends {} = {}> {
    /**
     * This field doesn't actually exist, it's just a way to make TS properly infer the events from classes that extend AsyncEventEmitter
     */
    protected readonly [brandSymbol]: Events;
    private _events;
    private _eventCount;
    private _maxListeners;
    private _internalPromiseMap;
    private _wrapperId;
    private [kCapturePromiseRejections];
    addListener<K extends keyof Events | keyof AsyncEventEmitterPredefinedEvents>(eventName: K, listener: AsyncEventEmitterListenerForEvent<AsyncEventEmitter<Events>, K>): this;
    addListener<K extends string | symbol>(eventName: K, listener: AsyncEventEmitterListenerForEvent<AsyncEventEmitter<Events>, K>): this;
    on<K extends keyof Events | keyof AsyncEventEmitterPredefinedEvents>(eventName: K, listener: AsyncEventEmitterListenerForEvent<AsyncEventEmitter<Events>, K>): this;
    on<K extends string | symbol>(eventName: K, listener: AsyncEventEmitterListenerForEvent<AsyncEventEmitter<Events>, K>): this;
    once<K extends keyof Events | keyof AsyncEventEmitterPredefinedEvents>(eventName: K, listener: AsyncEventEmitterListenerForEvent<AsyncEventEmitter<Events>, K>): this;
    once<K extends string | symbol>(eventName: K, listener: AsyncEventEmitterListenerForEvent<AsyncEventEmitter<Events>, K>): this;
    removeListener<K extends keyof Events | keyof AsyncEventEmitterPredefinedEvents>(eventName: K, listener: AsyncEventEmitterListenerForEvent<AsyncEventEmitter<Events>, K>): this;
    removeListener<K extends string | symbol>(eventName: K, listener: AsyncEventEmitterListenerForEvent<AsyncEventEmitter<Events>, K>): this;
    off<K extends keyof Events | keyof AsyncEventEmitterPredefinedEvents>(eventName: K, listener: AsyncEventEmitterListenerForEvent<AsyncEventEmitter<Events>, K>): this;
    off<K extends string | symbol>(eventName: K, listener: AsyncEventEmitterListenerForEvent<AsyncEventEmitter<Events>, K>): this;
    removeAllListeners<K extends keyof Events | keyof AsyncEventEmitterPredefinedEvents>(event: K): this;
    removeAllListeners<K extends keyof Events | keyof AsyncEventEmitterPredefinedEvents>(event?: K | undefined): this;
    removeAllListeners(event: string | symbol): this;
    removeAllListeners(event?: string | symbol | undefined): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners<K extends keyof Events | keyof AsyncEventEmitterPredefinedEvents>(eventName: K): AsyncEventEmitterListenerForEvent<AsyncEventEmitter<Events>, K>[];
    listeners<K extends string | symbol>(eventName: K): AsyncEventEmitterListenerForEvent<AsyncEventEmitter<Events>, K>[];
    rawListeners<K extends keyof Events | keyof AsyncEventEmitterPredefinedEvents>(eventName: K): AsyncEventEmitterInternalListenerForEvent<AsyncEventEmitter<Events>, K>[];
    rawListeners<K extends string | symbol>(eventName: K): AsyncEventEmitterInternalListenerForEvent<AsyncEventEmitter<Events>, K>[];
    emit<K extends keyof Events | keyof AsyncEventEmitterPredefinedEvents>(eventName: K, ...args: GetAsyncEventEmitterEventParameters<AsyncEventEmitter<Events>, K>): boolean;
    emit<K extends string | symbol>(eventName: K, ...args: GetAsyncEventEmitterEventParameters<AsyncEventEmitter<Events>, K>): boolean;
    listenerCount<K extends keyof Events | keyof AsyncEventEmitterPredefinedEvents>(eventName: K): number;
    listenerCount(eventName: string | symbol): number;
    prependListener<K extends keyof Events | keyof AsyncEventEmitterPredefinedEvents>(eventName: K, listener: AsyncEventEmitterListenerForEvent<AsyncEventEmitter<Events>, K>): this;
    prependListener<K extends string | symbol>(eventName: K, listener: AsyncEventEmitterListenerForEvent<AsyncEventEmitter<Events>, K>): this;
    prependOnceListener<K extends keyof Events | keyof AsyncEventEmitterPredefinedEvents>(eventName: K, listener: AsyncEventEmitterListenerForEvent<AsyncEventEmitter<Events>, K>): this;
    prependOnceListener<K extends string | symbol>(eventName: K, listener: AsyncEventEmitterListenerForEvent<AsyncEventEmitter<Events>, K>): this;
    eventNames(): (string | symbol)[] & (keyof AsyncEventEmitterPredefinedEvents)[] & (keyof Events)[];
    waitForAllListenersToComplete(): Promise<boolean>;
    private _addListener;
    private _wrapListener;
    static listenerCount<EventMap extends {}, EventName extends PropertyKey = keyof EventMap | keyof AsyncEventEmitterPredefinedEvents>(emitter: AsyncEventEmitter<EventMap>, eventName: EventName | keyof AsyncEventEmitterPredefinedEvents): number;
    static listenerCount(emitter: AsyncEventEmitter<any>, eventName: string | symbol): number;
    static once<EventMap extends {}, EventName extends PropertyKey = keyof EventMap | keyof AsyncEventEmitterPredefinedEvents>(emitter: AsyncEventEmitter<EventMap>, eventName: EventName, options?: AbortableMethods): Promise<GetAsyncEventEmitterEventParameters<AsyncEventEmitter<EventMap>, EventName>>;
    static once(emitter: AsyncEventEmitter<any>, eventName: string | symbol, options?: AbortableMethods): Promise<any[]>;
    static on<EventMap extends {}, EventName extends PropertyKey = keyof EventMap | keyof AsyncEventEmitterPredefinedEvents>(emitter: AsyncEventEmitter<EventMap>, eventName: EventName, options?: AbortableMethods): AsyncGenerator<GetAsyncEventEmitterEventParameters<AsyncEventEmitter<EventMap>, EventName>, void>;
    static on(emitter: AsyncEventEmitter<any>, eventName: string | symbol, options?: AbortableMethods): AsyncGenerator<any[], void>;
}
interface AsyncEventEmitterPredefinedEvents {
    newListener: [eventName: string | symbol, listener: (...args: any[]) => void];
    removeListener: [eventName: string | symbol, listener: (...args: any[]) => void];
}
interface Listener<Args extends any[] = any[]> {
    (...args: Args): void;
    listener?: (...args: Args) => void;
}
interface AbortableMethods {
    signal?: AbortSignal;
}
interface AbortErrorOptions {
    cause?: unknown;
}
declare class AbortError extends Error {
    readonly code = "ABORT_ERR";
    readonly name = "AbortError";
    constructor(message?: string, options?: AbortErrorOptions | undefined);
}

export { AbortError, type AbortErrorOptions, type AbortableMethods, AsyncEventEmitter, type AsyncEventEmitterInternalListenerForEvent, type AsyncEventEmitterListenerForEvent, type AsyncEventEmitterPredefinedEvents, type GetAsyncEventEmitterEventParameters, type Listener };

/// <reference types="node" />
import { EventEmitter } from 'events';
import { OverloadedParameters } from './overloaded-parameters';
export type FirstParameter<T> = T extends [infer R, ...any[]] ? R : never;
export type EventListener<F, T extends string | symbol> = F extends [
    T,
    infer R,
    ...any[]
] ? R : never;
export type EventParameters<Emitter extends EventEmitter> = OverloadedParameters<Emitter['on']>;
export type EventNames<Emitter extends EventEmitter> = FirstParameter<EventParameters<Emitter>>;
export type EventListenerParameters<Emitter extends EventEmitter, Event extends EventNames<Emitter>> = WithDefault<Parameters<EventListener<EventParameters<Emitter>, Event>>, unknown[]>;
export type WithDefault<T, D> = [T] extends [never] ? D : T;
export interface AbortSignal {
    aborted: boolean;
    addEventListener: (name: string, listener: (...args: any[]) => any) => void;
    removeEventListener: (name: string, listener: (...args: any[]) => any) => void;
}

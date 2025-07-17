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
/// <reference types="node" />
import * as loggerTypes from '../../common/types';
import * as configTypes from '../config/types';
import { TraceParams } from '../config/types';
import { Propagation } from '../propagation/types';
import * as samplerTypes from '../sampler/types';
import * as types from './types';
/**
 * This class represent a tracer.
 */
export declare class CoreTracer implements types.Tracer {
    /** Indicates if the tracer is active */
    private activeLocal;
    /** Manage context automatic propagation */
    private contextManager;
    /** A configuration for starting the tracer */
    private config;
    /** A list of end span event listeners */
    private eventListenersLocal;
    /** A list of ended root spans */
    private endedTraces;
    /** Bit to represent whether trace is sampled or not. */
    private readonly IS_SAMPLED;
    /** A sampler used to make sample decisions */
    sampler: samplerTypes.Sampler;
    /** A configuration for starting the tracer */
    logger: loggerTypes.Logger;
    /** A configuration object for trace parameters */
    activeTraceParams: TraceParams;
    /** Constructs a new TraceImpl instance. */
    constructor();
    /** Gets the current root span. */
    /** Sets the current root span. */
    currentRootSpan: types.RootSpan;
    /** A propagation instance */
    readonly propagation: Propagation;
    /**
     * Starts a tracer.
     * @param config A tracer configuration object to start a tracer.
     */
    start(config: configTypes.TracerConfig): types.Tracer;
    /** Stops the tracer. */
    stop(): types.Tracer;
    /** Gets the list of event listeners. */
    readonly eventListeners: types.SpanEventListener[];
    /** Indicates if the tracer is active or not. */
    readonly active: boolean;
    /**
     * Starts a root span.
     * @param options A TraceOptions object to start a root span.
     * @param fn A callback function to run after starting a root span.
     */
    startRootSpan<T>(options: types.TraceOptions, fn: (root: types.RootSpan) => T): T;
    onStartSpan(root: types.RootSpan): void;
    /**
     * Is called when a span is ended.
     * @param root The ended span.
     */
    onEndSpan(root: types.RootSpan): void;
    /**
     * Registers an end span event listener.
     * @param listener The listener to register.
     */
    registerSpanEventListener(listener: types.SpanEventListener): void;
    /**
     * Unregisters an end span event listener.
     * @param listener The listener to unregister.
     */
    unregisterSpanEventListener(listener: types.SpanEventListener): void;
    private notifyStartSpan;
    private notifyEndSpan;
    /** Clears the current root span. */
    clearCurrentTrace(): void;
    /**
     * Starts a span.
     * @param name The span name.
     * @param kind optional The span kind.
     * @param parentSpanId The parent span ID.
     */
    startChildSpan(name?: string, kind?: types.SpanKind): types.Span;
    /**
     * Binds the trace context to the given function.
     * This is necessary in order to create child spans correctly in functions
     * that are called asynchronously (for example, in a network response
     * handler).
     * @param fn A function to which to bind the trace context.
     */
    wrap<T>(fn: types.Func<T>): types.Func<T>;
    /**
     * Binds the trace context to the given event emitter.
     * This is necessary in order to create child spans correctly in event
     * handlers.
     * @param emitter An event emitter whose handlers should have
     * the trace context binded to them.
     */
    wrapEmitter(emitter: NodeJS.EventEmitter): void;
}

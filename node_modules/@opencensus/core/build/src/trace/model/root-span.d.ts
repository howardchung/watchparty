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
import { SpanBase } from './span-base';
import * as types from './types';
/** Defines a root span */
export declare class RootSpan extends SpanBase implements types.RootSpan {
    /** A tracer object */
    private tracer;
    /** A list of child spans. */
    private spansLocal;
    /** Its trace ID. */
    private traceIdLocal;
    /** Its trace state. */
    private traceStateLocal;
    /** set isRootSpan = true */
    readonly isRootSpan: boolean;
    /**
     * Constructs a new RootSpanImpl instance.
     * @param tracer A tracer object.
     * @param context A trace options object to build the root span.
     */
    constructor(tracer: types.Tracer, context?: types.TraceOptions);
    /** Gets span list from rootspan instance. */
    readonly spans: types.Span[];
    /** Gets trace id from rootspan instance. */
    readonly traceId: string;
    /** Gets trace state from rootspan instance */
    readonly traceState: types.TraceState;
    /** Starts a rootspan instance. */
    start(): void;
    /** Ends a rootspan instance. */
    end(): void;
    /**
     * Starts a new child span in the root span.
     * @param name Span name.
     * @param kind Span kind.
     * @param parentSpanId Span parent ID.
     */
    startChildSpan(name: string, kind: types.SpanKind, parentSpanId?: string): types.Span;
}

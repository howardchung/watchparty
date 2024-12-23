"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid");
const logger = require("../../common/console-logger");
const span_1 = require("./span");
const span_base_1 = require("./span-base");
const types = require("./types");
/** Defines a root span */
class RootSpan extends span_base_1.SpanBase {
    /**
     * Constructs a new RootSpanImpl instance.
     * @param tracer A tracer object.
     * @param context A trace options object to build the root span.
     */
    constructor(tracer, context) {
        super();
        /** set isRootSpan = true */
        this.isRootSpan = true;
        this.tracer = tracer;
        this.traceIdLocal =
            context && context.spanContext && context.spanContext.traceId ?
                context.spanContext.traceId :
                (uuid.v4().split('-').join(''));
        this.name = context && context.name ? context.name : 'undefined';
        if (context && context.spanContext) {
            this.parentSpanId = context.spanContext.spanId || '';
            this.traceStateLocal = context.spanContext.traceState;
        }
        this.spansLocal = [];
        this.kind =
            context && context.kind ? context.kind : types.SpanKind.UNSPECIFIED;
        this.logger = tracer.logger || logger.logger();
        this.activeTraceParams = tracer.activeTraceParams;
    }
    /** Gets span list from rootspan instance. */
    get spans() {
        return this.spansLocal;
    }
    /** Gets trace id from rootspan instance. */
    get traceId() {
        return this.traceIdLocal;
    }
    /** Gets trace state from rootspan instance */
    get traceState() {
        return this.traceStateLocal;
    }
    /** Starts a rootspan instance. */
    start() {
        super.start();
        this.logger.debug('starting %s  %o', this.className, {
            traceId: this.traceId,
            id: this.id,
            parentSpanId: this.parentSpanId,
            traceState: this.traceState
        });
        this.tracer.onStartSpan(this);
    }
    /** Ends a rootspan instance. */
    end() {
        super.end();
        for (const span of this.spansLocal) {
            if (!span.ended && span.started) {
                span.truncate();
            }
        }
        this.tracer.onEndSpan(this);
    }
    /**
     * Starts a new child span in the root span.
     * @param name Span name.
     * @param kind Span kind.
     * @param parentSpanId Span parent ID.
     */
    startChildSpan(name, kind, parentSpanId) {
        if (this.ended) {
            this.logger.debug('calling %s.startSpan() on ended %s %o', this.className, this.className, { id: this.id, name: this.name, kind: this.kind });
            return null;
        }
        if (!this.started) {
            this.logger.debug('calling %s.startSpan() on un-started %s %o', this.className, this.className, { id: this.id, name: this.name, kind: this.kind });
            return null;
        }
        const newSpan = new span_1.Span(this);
        if (name) {
            newSpan.name = name;
        }
        if (kind) {
            newSpan.kind = kind;
        }
        newSpan.start();
        this.spansLocal.push(newSpan);
        return newSpan;
    }
}
exports.RootSpan = RootSpan;
//# sourceMappingURL=root-span.js.map
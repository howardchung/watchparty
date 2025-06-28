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
import { HeaderGetter, HeaderSetter, Propagation, SpanContext } from '@opencensus/core';
/** Propagates span context through B3 Format propagation. */
export declare class B3Format implements Propagation {
    /**
     * Gets the trace context from a request headers. If there is no trace context
     * in the headers, null is returned.
     * @param getter
     */
    extract(getter: HeaderGetter): SpanContext;
    /**
     * Adds a trace context in a request headers.
     * @param setter
     * @param spanContext
     */
    inject(setter: HeaderSetter, spanContext: SpanContext): void;
    /**
     * Generate SpanContexts
     */
    generate(): SpanContext;
}

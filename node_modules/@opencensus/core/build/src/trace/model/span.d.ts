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
/** Defines a Span. */
export declare class Span extends SpanBase implements types.Span {
    private root;
    /** set isRootSpan = true */
    readonly isRootSpan: boolean;
    /**
     * Constructs a new SpanImpl instance.
     * @param root
     */
    constructor(root: types.RootSpan);
    /** Gets trace id of span. */
    readonly traceId: string;
    readonly traceState: string;
    /** Starts the span instance. */
    start(): void;
    /** Ends the span. */
    end(): void;
}

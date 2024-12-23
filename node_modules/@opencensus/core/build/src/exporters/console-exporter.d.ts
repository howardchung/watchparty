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
import * as loggerTypes from '../common/types';
import { Measurement, View } from '../stats/types';
import { TagKey, TagValue } from '../tags/types';
import * as modelTypes from '../trace/model/types';
import * as types from './types';
/** Do not send span data */
export declare class NoopExporter implements types.Exporter {
    logger: loggerTypes.Logger;
    onStartSpan(root: modelTypes.RootSpan): void;
    onEndSpan(root: modelTypes.RootSpan): void;
    publish(rootSpans: modelTypes.RootSpan[]): Promise<void>;
}
/** Format and sends span data to the console. */
export declare class ConsoleExporter implements types.Exporter {
    /** Buffer object to store the spans. */
    private logger;
    private buffer;
    /**
     * Constructs a new ConsoleLogExporter instance.
     * @param config Exporter configuration object to create a console log
     * exporter.
     */
    constructor(config: types.ExporterConfig);
    onStartSpan(root: modelTypes.RootSpan): void;
    /**
     * Event called when a span is ended.
     * @param root Ended span.
     */
    onEndSpan(root: modelTypes.RootSpan): void;
    /**
     * Sends the spans information to the console.
     * @param rootSpans
     */
    publish(rootSpans: modelTypes.RootSpan[]): Promise<void>;
}
/** Exporter that receives stats data and shows in the log console. */
export declare class ConsoleStatsExporter implements types.StatsEventListener {
    /**
     * Event called when a view is registered
     * @param view registered view
     * @param measure registered measure
     */
    onRegisterView(view: View): void;
    /**
     * Event called when a measurement is recorded
     * @param view recorded view from measurement
     * @param measurement recorded measurement
     */
    onRecord(views: View[], measurement: Measurement, tags: Map<TagKey, TagValue>): void;
    /**
     * Starts the Console exporter that polls Metric from Metrics library and
     * shows in the log console..
     */
    start(): void;
}

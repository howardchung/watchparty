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
import * as defaultLogger from '../common/console-logger';
import { Metric } from '../metrics/export/types';
import { TagMap } from '../tags/tag-map';
import { TagKey, TagValue } from '../tags/types';
import { AggregationData, AggregationType, Measure, Measurement, View } from './types';
export declare class BaseView implements View {
    /**
     * A string by which the View will be referred to, e.g. "rpc_latency". Names
     * MUST be unique within the library.
     */
    readonly name: string;
    /** Describes the view, e.g. "RPC latency distribution" */
    readonly description: string;
    /** The Measure to which this view is applied. */
    readonly measure: Measure;
    /**
     * A map of stringified tags representing columns labels or tag keys, concept
     * similar to dimensions on multidimensional modeling, to AggregationData.
     * If no Tags are provided, then, all data is recorded in a single
     * aggregation.
     */
    private tagValueAggregationMap;
    /**
     * A list of tag keys that represents the possible column labels
     */
    private columns;
    /**
     * An Aggregation describes how data collected is aggregated.
     * There are four aggregation types: count, sum, lastValue and distirbution.
     */
    readonly aggregation: AggregationType;
    /** The start time for this view */
    readonly startTime: number;
    /** The bucket boundaries in a Distribution Aggregation */
    private bucketBoundaries;
    /**
     * Cache a MetricDescriptor to avoid converting View to MetricDescriptor
     * in the future.
     */
    private metricDescriptor;
    /**
     * The end time for this view - represents the last time a value was recorded
     */
    endTime: number;
    /** true if the view was registered */
    registered: boolean;
    /** An object to log information to */
    private logger;
    /**
     * Creates a new View instance. This constructor is used by Stats. User should
     * prefer using Stats.createView() instead.
     * @param name The view name
     * @param measure The view measure
     * @param aggregation The view aggregation type
     * @param tagsKeys The Tags' keys that view will have
     * @param description The view description
     * @param bucketBoundaries The view bucket boundaries for a distribution
     * aggregation type
     * @param logger
     */
    constructor(name: string, measure: Measure, aggregation: AggregationType, tagsKeys: TagKey[], description: string, bucketBoundaries?: number[], logger?: typeof defaultLogger);
    /** Gets the view's tag keys */
    getColumns(): TagKey[];
    /**
     * Records a measurement in the proper view's row. This method is used by
     * Stats. User should prefer using Stats.record() instead.
     *
     * Measurements with measurement type INT64 will have its value truncated.
     * @param measurement The measurement to record
     * @param tags The tags to which the value is applied
     */
    recordMeasurement(measurement: Measurement, tags: TagMap): void;
    /**
     * Encodes a TagValue object into a value sorted string.
     * @param tagValues The tagValues to encode
     */
    private encodeTagValues;
    /**
     * Creates an empty aggregation data for a given tags.
     * @param tagValues The tags for that aggregation data
     */
    private createAggregationData;
    /**
     * Gets view`s metric
     * @param start The start timestamp in epoch milliseconds
     * @returns {Metric}
     */
    getMetric(start: number): Metric;
    /**
     * Converts snapshot to point
     * @param timestamp The timestamp
     * @param data The aggregated data
     * @returns {Point}
     */
    private toPoint;
    /**
     * Returns a snapshot of an AggregationData for that tags/labels values.
     * @param tags The desired data's tags
     * @returns {AggregationData}
     */
    getSnapshot(tagValues: TagValue[]): AggregationData;
    /** Determines whether the given TagKeys are valid. */
    private validateTagKeys;
}

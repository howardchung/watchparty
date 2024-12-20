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
import { LabelKey, LabelValue, Metric, MetricDescriptorType, TimeSeries, Timestamp } from '../export/types';
import * as types from '../gauges/types';
/**
 * Gauge metric
 */
export declare class Gauge implements types.Meter {
    readonly labelKeys: LabelKey[];
    private readonly metricDescriptor;
    private labelKeysLength;
    private defaultLabelValues;
    private registeredPoints;
    private static readonly LABEL_VALUE;
    private static readonly LABEL_VALUES;
    private static readonly ERROR_MESSAGE_INVALID_SIZE;
    /**
     * Constructs a new Gauge instance.
     *
     * @param {string} name The name of the metric.
     * @param {string} description The description of the metric.
     * @param {string} unit The unit of the metric.
     * @param {MetricDescriptorType} type The type of metric.
     * @param {LabelKey[]} labelKeys The list of the label keys.
     */
    constructor(name: string, description: string, unit: string, type: MetricDescriptorType, labelKeys: LabelKey[]);
    /**
     * Creates a TimeSeries and returns a Point if the specified
     * labelValues is not already associated with this gauge, else returns an
     * existing Point.
     *
     * It is recommended to keep a reference to the Point instead of always
     * calling this method for manual operations.
     *
     * @param {LabelValue[]} labelValues The list of the label values.
     * @returns {types.Point} The value of single gauge.
     */
    getOrCreateTimeSeries(labelValues: LabelValue[]): types.Point;
    /**
     * Returns a Point for a gauge with all labels not set, or default
     * labels.
     *
     * @returns {types.Point} The value of single gauge.
     */
    getDefaultTimeSeries(): types.Point;
    /**
     * Removes the TimeSeries from the gauge metric, if it is present. i.e.
     * references to previous Point objects are invalid (not part of the
     * metric).
     *
     * @param {LabelValue[]} labelValues The list of label values.
     */
    removeTimeSeries(labelValues: LabelValue[]): void;
    /**
     * Removes all TimeSeries from the gauge metric. i.e. references to all
     * previous Point objects are invalid (not part of the metric).
     */
    clear(): void;
    /**
     * Registers a TimeSeries and returns a Point if the specified
     * labelValues is not already associated with this gauge, else returns an
     * existing Point.
     *
     * @param {LabelValue[]} labelValues The list of the label values.
     * @returns {types.Point} The value of single gauge.
     */
    private registerTimeSeries;
    /**
     * Provides a Metric with one or more TimeSeries.
     *
     * @returns {Metric} The Metric.
     */
    getMetric(): Metric;
}
/**
 * The value of a single point in the Gauge.TimeSeries.
 */
export declare class PointEntry implements types.Point {
    private readonly labelValues;
    private value;
    constructor(labelValues: LabelValue[]);
    /**
     * Adds the given value to the current value. The values can be negative.
     *
     * @param {number} amt The value to add.
     */
    add(amt: number): void;
    /**
     * Sets the given value.
     *
     * @param {number} val The new value.
     */
    set(val: number): void;
    /**
     * Returns the TimeSeries with one or more Point.
     *
     * @param {Timestamp} timestamp The time at which the gauge is recorded.
     * @returns {TimeSeries} The TimeSeries.
     */
    getTimeSeries(timestamp: Timestamp): TimeSeries;
}

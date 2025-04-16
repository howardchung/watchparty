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
import { LabelKey, LabelValue, Metric, MetricDescriptorType } from '../export/types';
import * as types from '../gauges/types';
/**
 * Interface for objects with "length()" method.
 */
export interface LengthMethodInterface {
    length(): number;
}
/**
 * Interface for objects with "length" attribute (e.g. Array).
 */
export interface LengthAttributeInterface {
    length: number;
}
/**
 * Interface for objects with "size" method.
 */
export interface SizeMethodInterface {
    size(): number;
}
/**
 * Interface for objects with "size" attribute (e.g. Map, Set).
 */
export interface SizeAttributeInterface {
    size: number;
}
/**
 * Interface for objects with "getValue" method.
 */
export interface ToValueInterface {
    getValue(): number;
}
export declare type AccessorInterface = LengthAttributeInterface | LengthMethodInterface | SizeAttributeInterface | SizeMethodInterface | ToValueInterface;
/**
 * DerivedGauge metric
 */
export declare class DerivedGauge implements types.Meter {
    private metricDescriptor;
    private labelKeysLength;
    private registeredPoints;
    private extractor;
    private static readonly LABEL_VALUE;
    private static readonly LABEL_VALUES;
    private static readonly OBJECT;
    private static readonly NUMBER;
    private static readonly FUNCTION;
    private static readonly ERROR_MESSAGE_INVALID_SIZE;
    private static readonly ERROR_MESSAGE_DUPLICATE_TIME_SERIES;
    private static readonly ERROR_MESSAGE_UNKNOWN_INTERFACE;
    /**
     * Constructs a new DerivedGauge instance.
     *
     * @param {string} name The name of the metric.
     * @param {string} description The description of the metric.
     * @param {string} unit The unit of the metric.
     * @param {MetricDescriptorType} type The type of metric.
     * @param {LabelKey[]} labelKeys The list of the label keys.
     */
    constructor(name: string, description: string, unit: string, type: MetricDescriptorType, labelKeys: LabelKey[]);
    protected static isLengthAttributeInterface(obj: any): obj is LengthAttributeInterface;
    protected static isLengthMethodInterface(obj: any): obj is LengthMethodInterface;
    protected static isSizeAttributeInterface(obj: any): obj is SizeAttributeInterface;
    protected static isSizeMethodInterface(obj: any): obj is SizeMethodInterface;
    protected static isToValueInterface(obj: any): obj is ToValueInterface;
    /**
     * Creates a TimeSeries. The value of a single point in the TimeSeries is
     * observed from a obj. The ValueExtractor is invoked whenever
     * metrics are collected, meaning the reported value is up-to-date.
     *
     * @param {LabelValue[]} labelValues The list of the label values.
     * @param obj The obj to get the size or length or value from. If multiple
     *    options are available, the value (ToValueInterface) takes precedence
     *    first, followed by length and size. e.g value -> length -> size.
     */
    createTimeSeries(labelValues: LabelValue[], obj: AccessorInterface): void;
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
     * Provides a Metric with one or more TimeSeries.
     *
     * @returns {Metric} The Metric.
     */
    getMetric(): Metric;
}

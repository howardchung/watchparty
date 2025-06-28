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
const time_util_1 = require("../../common/time-util");
const validations_1 = require("../../common/validations");
const utils_1 = require("../utils");
/**
 * DerivedGauge metric
 */
class DerivedGauge {
    /**
     * Constructs a new DerivedGauge instance.
     *
     * @param {string} name The name of the metric.
     * @param {string} description The description of the metric.
     * @param {string} unit The unit of the metric.
     * @param {MetricDescriptorType} type The type of metric.
     * @param {LabelKey[]} labelKeys The list of the label keys.
     */
    constructor(name, description, unit, type, labelKeys) {
        this.registeredPoints = new Map();
        this.metricDescriptor = { name, description, unit, type, labelKeys };
        this.labelKeysLength = labelKeys.length;
    }
    // Checks if the specified collection is a LengthAttributeInterface.
    // tslint:disable-next-line:no-any
    static isLengthAttributeInterface(obj) {
        return obj && typeof obj.length === DerivedGauge.NUMBER;
    }
    // Checks if the specified collection is a LengthMethodInterface.
    // tslint:disable-next-line:no-any
    static isLengthMethodInterface(obj) {
        return obj && typeof obj.length === DerivedGauge.FUNCTION;
    }
    // Checks if the specified collection is a SizeAttributeInterface.
    // tslint:disable-next-line:no-any
    static isSizeAttributeInterface(obj) {
        return obj && typeof obj.size === DerivedGauge.NUMBER;
    }
    // Checks if the specified collection is a SizeMethodInterface.
    // tslint:disable-next-line:no-any
    static isSizeMethodInterface(obj) {
        return obj && typeof obj.size === DerivedGauge.FUNCTION;
    }
    // Checks if the specified callbackFn is a ToValueInterface.
    // tslint:disable-next-line:no-any
    static isToValueInterface(obj) {
        return obj && typeof obj.getValue === DerivedGauge.FUNCTION;
    }
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
    createTimeSeries(labelValues, obj) {
        validations_1.validateArrayElementsNotNull(validations_1.validateNotNull(labelValues, DerivedGauge.LABEL_VALUES), DerivedGauge.LABEL_VALUE);
        validations_1.validateNotNull(obj, DerivedGauge.OBJECT);
        const hash = utils_1.hashLabelValues(labelValues);
        if (this.registeredPoints.has(hash)) {
            throw new Error(DerivedGauge.ERROR_MESSAGE_DUPLICATE_TIME_SERIES);
        }
        if (this.labelKeysLength !== labelValues.length) {
            throw new Error(DerivedGauge.ERROR_MESSAGE_INVALID_SIZE);
        }
        if (DerivedGauge.isToValueInterface(obj)) {
            this.extractor = () => obj.getValue();
        }
        else if (DerivedGauge.isLengthAttributeInterface(obj)) {
            this.extractor = () => obj.length;
        }
        else if (DerivedGauge.isLengthMethodInterface(obj)) {
            this.extractor = () => obj.length();
        }
        else if (DerivedGauge.isSizeAttributeInterface(obj)) {
            this.extractor = () => obj.size;
        }
        else if (DerivedGauge.isSizeMethodInterface(obj)) {
            this.extractor = () => obj.size();
        }
        else {
            throw new Error(DerivedGauge.ERROR_MESSAGE_UNKNOWN_INTERFACE);
        }
        this.registeredPoints.set(hash, { labelValues, extractor: this.extractor });
    }
    /**
     * Removes the TimeSeries from the gauge metric, if it is present. i.e.
     * references to previous Point objects are invalid (not part of the
     * metric).
     *
     * @param {LabelValue[]} labelValues The list of label values.
     */
    removeTimeSeries(labelValues) {
        validations_1.validateNotNull(labelValues, DerivedGauge.LABEL_VALUES);
        this.registeredPoints.delete(utils_1.hashLabelValues(labelValues));
    }
    /**
     * Removes all TimeSeries from the gauge metric. i.e. references to all
     * previous Point objects are invalid (not part of the metric).
     */
    clear() {
        this.registeredPoints.clear();
    }
    /**
     * Provides a Metric with one or more TimeSeries.
     *
     * @returns {Metric} The Metric.
     */
    getMetric() {
        if (this.registeredPoints.size === 0) {
            return null;
        }
        const timestamp = time_util_1.getTimestampWithProcessHRTime();
        return {
            descriptor: this.metricDescriptor,
            timeseries: Array.from(this.registeredPoints, ([_, gaugeEntry]) => ({
                labelValues: gaugeEntry.labelValues,
                points: [{ value: gaugeEntry.extractor(), timestamp }]
            }))
        };
    }
}
DerivedGauge.LABEL_VALUE = 'labelValue';
DerivedGauge.LABEL_VALUES = 'labelValues';
DerivedGauge.OBJECT = 'obj';
DerivedGauge.NUMBER = 'number';
DerivedGauge.FUNCTION = 'function';
DerivedGauge.ERROR_MESSAGE_INVALID_SIZE = 'Label Keys and Label Values don\'t have same size';
DerivedGauge.ERROR_MESSAGE_DUPLICATE_TIME_SERIES = 'A different time series with the same labels already exists.';
DerivedGauge.ERROR_MESSAGE_UNKNOWN_INTERFACE = 'Unknown interface/object type';
exports.DerivedGauge = DerivedGauge;
//# sourceMappingURL=derived-gauge.js.map
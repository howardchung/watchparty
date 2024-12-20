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
const validations_1 = require("../common/validations");
const base_metric_producer_1 = require("./export/base-metric-producer");
const types_1 = require("./export/types");
const derived_gauge_1 = require("./gauges/derived-gauge");
const gauge_1 = require("./gauges/gauge");
/**
 * Creates and manages application's set of metrics.
 */
class MetricRegistry {
    constructor() {
        this.registeredMetrics = new Map();
        this.metricProducer = new MetricProducerForRegistry(this.registeredMetrics);
    }
    /**
     * Builds a new Int64 gauge to be added to the registry. This is more
     * convenient form when you want to manually increase and decrease values as
     * per your service requirements.
     *
     * @param {string} name The name of the metric.
     * @param {string} description The description of the metric.
     * @param {MeasureUnit} unit The unit of the metric.
     * @param {LabelKey[]} labelKeys The list of the label keys.
     * @returns {Gauge} A Int64 Gauge metric.
     */
    addInt64Gauge(name, description, unit, labelKeys) {
        validations_1.validateArrayElementsNotNull(validations_1.validateNotNull(labelKeys, MetricRegistry.LABEL_KEYS), MetricRegistry.LABEL_KEY);
        const labelKeysCopy = Object.assign([], labelKeys);
        const int64Gauge = new gauge_1.Gauge(validations_1.validateNotNull(name, MetricRegistry.NAME), validations_1.validateNotNull(description, MetricRegistry.DESCRIPTION), validations_1.validateNotNull(unit, MetricRegistry.UNIT), types_1.MetricDescriptorType.GAUGE_INT64, labelKeysCopy);
        this.registerMetric(name, int64Gauge);
        return int64Gauge;
    }
    /**
     * Builds a new double gauge to be added to the registry. This is more
     * convenient form when you want to manually increase and decrease values as
     * per your service requirements.
     *
     * @param {string} name The name of the metric.
     * @param {string} description The description of the metric.
     * @param {MeasureUnit} unit The unit of the metric.
     * @param {LabelKey[]} labelKeys The list of the label keys.
     * @returns {Gauge} A Double Gauge metric.
     */
    addDoubleGauge(name, description, unit, labelKeys) {
        validations_1.validateArrayElementsNotNull(validations_1.validateNotNull(labelKeys, MetricRegistry.LABEL_KEYS), MetricRegistry.LABEL_KEY);
        const labelKeysCopy = Object.assign([], labelKeys);
        const doubleGauge = new gauge_1.Gauge(validations_1.validateNotNull(name, MetricRegistry.NAME), validations_1.validateNotNull(description, MetricRegistry.DESCRIPTION), validations_1.validateNotNull(unit, MetricRegistry.UNIT), types_1.MetricDescriptorType.GAUGE_DOUBLE, labelKeysCopy);
        this.registerMetric(name, doubleGauge);
        return doubleGauge;
    }
    /**
     * Builds a new derived Int64 gauge to be added to the registry. This is more
     * convenient form when you want to manually increase and decrease values as
     * per your service requirements.
     *
     * @param {string} name The name of the metric.
     * @param {string} description The description of the metric.
     * @param {MeasureUnit} unit The unit of the metric.
     * @param {LabelKey[]} labelKeys The list of the label keys.
     * @returns {DerivedGauge} A Int64 DerivedGauge metric.
     */
    addDerivedInt64Gauge(name, description, unit, labelKeys) {
        validations_1.validateArrayElementsNotNull(validations_1.validateNotNull(labelKeys, MetricRegistry.LABEL_KEYS), MetricRegistry.LABEL_KEY);
        const labelKeysCopy = Object.assign([], labelKeys);
        const derivedInt64Gauge = new derived_gauge_1.DerivedGauge(validations_1.validateNotNull(name, MetricRegistry.NAME), validations_1.validateNotNull(description, MetricRegistry.DESCRIPTION), validations_1.validateNotNull(unit, MetricRegistry.UNIT), types_1.MetricDescriptorType.GAUGE_INT64, labelKeysCopy);
        this.registerMetric(name, derivedInt64Gauge);
        return derivedInt64Gauge;
    }
    /**
     * Builds a new derived double gauge to be added to the registry. This is more
     * convenient form when you want to manually increase and decrease values as
     * per your service requirements.
     *
     * @param {string} name The name of the metric.
     * @param {string} description The description of the metric.
     * @param {MeasureUnit} unit The unit of the metric.
     * @param {LabelKey[]} labelKeys The list of the label keys.
     * @returns {DerivedGauge} A Double DerivedGauge metric.
     */
    addDerivedDoubleGauge(name, description, unit, labelKeys) {
        validations_1.validateArrayElementsNotNull(validations_1.validateNotNull(labelKeys, MetricRegistry.LABEL_KEYS), MetricRegistry.LABEL_KEY);
        const labelKeysCopy = Object.assign([], labelKeys);
        const derivedDoubleGauge = new derived_gauge_1.DerivedGauge(validations_1.validateNotNull(name, MetricRegistry.NAME), validations_1.validateNotNull(description, MetricRegistry.DESCRIPTION), validations_1.validateNotNull(unit, MetricRegistry.UNIT), types_1.MetricDescriptorType.GAUGE_DOUBLE, labelKeysCopy);
        this.registerMetric(name, derivedDoubleGauge);
        return derivedDoubleGauge;
    }
    /**
     * Registers metric to register.
     *
     * @param {string} name The name of the metric.
     * @param {Meter} meter The metric to register.
     */
    registerMetric(name, meter) {
        if (this.registeredMetrics.has(name)) {
            throw new Error(`A metric with the name ${name} has already been registered.`);
        }
        this.registeredMetrics.set(name, meter);
    }
    /**
     * Gets a metric producer for registry.
     *
     * @returns {MetricProducer} The metric producer.
     */
    getMetricProducer() {
        return this.metricProducer;
    }
}
MetricRegistry.NAME = 'name';
MetricRegistry.DESCRIPTION = 'description';
MetricRegistry.UNIT = 'unit';
MetricRegistry.LABEL_KEY = 'labelKey';
MetricRegistry.LABEL_KEYS = 'labelKeys';
exports.MetricRegistry = MetricRegistry;
/**
 * A MetricProducerForRegistry is a producer that can be registered for
 * exporting using MetricProducerManager.
 *
 * TODO (mayurkale): Add MetricProducerManager, that Keeps a set of
 *  MetricProducer that is used by exporters to determine the metrics that
 *  need to be exported.
 */
class MetricProducerForRegistry extends base_metric_producer_1.BaseMetricProducer {
    constructor(registeredMetrics) {
        super();
        this.registeredMetrics = registeredMetrics;
    }
    /**
     * Gets a collection of produced Metric`s to be exported.
     *
     * @returns {Metric[]} The list of metrics.
     */
    getMetrics() {
        return Array.from(this.registeredMetrics, ([_, meter]) => meter.getMetric());
    }
}
//# sourceMappingURL=metric-registry.js.map
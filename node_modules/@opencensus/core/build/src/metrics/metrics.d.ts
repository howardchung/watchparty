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
import { MetricProducerManager } from './export/types';
import { MetricRegistry } from './metric-registry';
/**
 * Class for accessing the default MetricsComponent.
 */
export declare class Metrics {
    private static readonly METRIC_COMPONENT;
    /** @return {MetricProducerManager} The global MetricProducerManager. */
    static getMetricProducerManager(): MetricProducerManager;
    /** @return {MetricRegistry} The global MetricRegistry. */
    static getMetricRegistry(): MetricRegistry;
}

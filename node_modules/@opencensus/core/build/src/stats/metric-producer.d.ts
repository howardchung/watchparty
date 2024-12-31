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
import { BaseMetricProducer } from '../metrics/export/base-metric-producer';
import { Metric } from '../metrics/export/types';
import { Stats } from './types';
/**
 * A MetricProducer producer that can be registered for exporting using
 * MetricProducerManager.
 */
export declare class MetricProducerForStats extends BaseMetricProducer {
    private statsManager;
    /**
     * @param statsManager The stats
     */
    constructor(statsManager: Stats);
    /**
     * Gets a collection of produced Metric`s to be exported.
     * @returns {Metric[]} List of metrics
     */
    getMetrics(): Metric[];
}

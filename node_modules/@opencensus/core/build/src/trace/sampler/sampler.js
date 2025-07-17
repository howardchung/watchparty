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
// We use 52-bits as our max number because it remains a javascript "safe
// integer" for arithmetic and parsing while using the full hex range for
// comparison to the lower order bytes on a traceId.
const MAX_NUMBER = 0xfffffffffffff;
const LOWER_BYTE_COUNT = 13;
/**  Sampler that samples every trace. */
class AlwaysSampler {
    constructor() {
        this.description = 'always';
    }
    shouldSample(traceId) {
        return true;
    }
}
exports.AlwaysSampler = AlwaysSampler;
/** Sampler that samples no traces. */
class NeverSampler {
    constructor() {
        this.description = 'never';
    }
    shouldSample(traceId) {
        return false;
    }
}
exports.NeverSampler = NeverSampler;
/** Sampler that samples a given fraction of traces. */
class ProbabilitySampler {
    /**
     * Constructs a new Probability Sampler instance.
     */
    constructor(probability) {
        this.description = `probability.(${probability})`;
        this.idUpperBound = probability * MAX_NUMBER;
    }
    /**
     * Checks if trace belong the sample.
     * @param traceId Used to check the probability
     * @returns a boolean. True if the traceId is in probability
     * False if the traceId is not in probability.
     */
    shouldSample(traceId) {
        const LOWER_BYTES = traceId ? ('0000000000000' + traceId).slice(-LOWER_BYTE_COUNT) : '0';
        // tslint:disable-next-line:ban Needed to parse hexadecimal.
        const LOWER_LONG = parseInt(LOWER_BYTES, 16);
        if (LOWER_LONG <= this.idUpperBound) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.ProbabilitySampler = ProbabilitySampler;
/** Builder class of Samplers */
class SamplerBuilder {
    /**
     * If probability parameter is bigger then 1 return AlwaysSampler instance.
     * If probability parameter is less than 0 returns NeverSampler instance.
     * Else returns a Probability Sampler
     *
     * @param probability probability between 0 and 1
     * @returns a Sampler object
     */
    static getSampler(probability) {
        if (probability >= 1.0) {
            return SamplerBuilder.ALWAYS;
        }
        else if (probability <= 0) {
            return SamplerBuilder.NEVER;
        }
        return new ProbabilitySampler(probability);
    }
}
SamplerBuilder.ALWAYS = new AlwaysSampler();
SamplerBuilder.NEVER = new NeverSampler();
exports.SamplerBuilder = SamplerBuilder;
/** Default Limit for Annotations per span */
exports.DEFAULT_SPAN_MAX_NUM_ANNOTATIONS = 32;
/** Default limit for Message events per span */
exports.DEFAULT_SPAN_MAX_NUM_MESSAGE_EVENTS = 128;
/** Default limit for Attributes per span */
exports.DEFAULT_SPAN_MAX_NUM_ATTRIBUTES = 32;
/** Default limit for Links per span */
exports.DEFAULT_SPAN_MAX_NUM_LINKS = 32;
/** Builder Class of TraceParams */
class TraceParamsBuilder {
    static getNumberOfAnnotationEventsPerSpan(traceParameters) {
        return traceParameters.numberOfAnnontationEventsPerSpan >
            exports.DEFAULT_SPAN_MAX_NUM_ANNOTATIONS ?
            exports.DEFAULT_SPAN_MAX_NUM_ANNOTATIONS :
            traceParameters.numberOfAnnontationEventsPerSpan;
    }
    static getNumberOfAttributesPerSpan(traceParameters) {
        return traceParameters.numberOfAttributesPerSpan >
            exports.DEFAULT_SPAN_MAX_NUM_ATTRIBUTES ?
            exports.DEFAULT_SPAN_MAX_NUM_ATTRIBUTES :
            traceParameters.numberOfAttributesPerSpan;
    }
    static getNumberOfMessageEventsPerSpan(traceParameters) {
        return traceParameters.numberOfMessageEventsPerSpan >
            exports.DEFAULT_SPAN_MAX_NUM_MESSAGE_EVENTS ?
            exports.DEFAULT_SPAN_MAX_NUM_MESSAGE_EVENTS :
            traceParameters.numberOfMessageEventsPerSpan;
    }
    static getNumberOfLinksPerSpan(traceParameters) {
        return traceParameters.numberOfLinksPerSpan > exports.DEFAULT_SPAN_MAX_NUM_LINKS ?
            exports.DEFAULT_SPAN_MAX_NUM_LINKS :
            traceParameters.numberOfLinksPerSpan;
    }
}
exports.TraceParamsBuilder = TraceParamsBuilder;
//# sourceMappingURL=sampler.js.map
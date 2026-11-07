"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSampleRate = getSampleRate;
/**
 * @internal
 *
 * Get sample rate (audio).
 *
 * @param adaptationSet - AdaptationSet to try to get the sampleRate from
 * @param representation - Representation to try to get the sampleRate from
 * @returns Sample rate. In case it is not presents, it returns 0.
 */
function getSampleRate(adaptationSet, representation) {
    var _a, _b;
    const sampleRate = +((_b = (_a = representation.$.audioSamplingRate) !== null && _a !== void 0 ? _a : adaptationSet.$.audioSamplingRate) !== null && _b !== void 0 ? _b : 0);
    if (!sampleRate) {
        console.error(`Representation ${representation.$.id} has no audioSamplingRate`);
    }
    return sampleRate;
}
//# sourceMappingURL=getSampleRate.js.map
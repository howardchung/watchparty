import type { AdaptationSet } from '../../../../types/mapper/dash/AdaptationSet.js';
import type { Representation } from '../../../../types/mapper/dash/Representation.js';
/**
 * @internal
 *
 * Get sample rate (audio).
 *
 * @param adaptationSet - AdaptationSet to try to get the sampleRate from
 * @param representation - Representation to try to get the sampleRate from
 * @returns Sample rate. In case it is not presents, it returns 0.
 */
export declare function getSampleRate(adaptationSet: AdaptationSet, representation: Representation): number;
//# sourceMappingURL=getSampleRate.d.ts.map
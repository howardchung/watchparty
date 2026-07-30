import type { AdaptationSet } from '../../../../types/mapper/dash/AdaptationSet.js';
import type { Representation } from '../../../../types/mapper/dash/Representation.js';
/**
 * @internal
 *
 * Get the codec value (video and audio). It can be present on adaptationSet or representation.
 *
 * @param adaptationSet - AdaptationSet to try to get the codec from
 * @param representation - Representation to try to get the codec from
 * @returns Content codec
 */
export declare function getCodec(adaptationSet: AdaptationSet, representation: Representation): string;
//# sourceMappingURL=getCodec.d.ts.map
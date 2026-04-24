import type { AdaptationSet } from '../../../../types/mapper/dash/AdaptationSet.js';
import type { Representation } from '../../../../types/mapper/dash/Representation.js';
/**
 * @internal
 *
 * Get the sar value. It can be present on adaptationSet or representation.
 *
 * @param adaptationSet - AdaptationSet to try to get the sar from
 * @param representation - AdaptationSet to try to get the sar from
 * @returns sar value. In case it is not present, returns empty string.
 */
export declare function getSar(adaptationSet: AdaptationSet, representation: Representation): string;
//# sourceMappingURL=getSar.d.ts.map
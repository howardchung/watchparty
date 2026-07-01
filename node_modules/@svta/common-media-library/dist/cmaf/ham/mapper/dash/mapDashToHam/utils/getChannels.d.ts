import type { AdaptationSet } from '../../../../types/mapper/dash/AdaptationSet.js';
import type { Representation } from '../../../../types/mapper/dash/Representation.js';
/**
 * @internal
 *
 * Get the channels value (audio). It can be present on adaptationSet or representation.
 *
 * @param adaptationSet - AdaptationSet to try to get the channels from
 * @param representation - Representation to try to get the channels from
 * @returns Channels value
 */
export declare function getChannels(adaptationSet: AdaptationSet, representation: Representation): number;
//# sourceMappingURL=getChannels.d.ts.map
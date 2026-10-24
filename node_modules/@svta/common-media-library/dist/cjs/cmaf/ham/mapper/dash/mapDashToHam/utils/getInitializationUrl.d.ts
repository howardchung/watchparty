import type { AdaptationSet } from '../../../../types/mapper/dash/AdaptationSet.js';
import type { Representation } from '../../../../types/mapper/dash/Representation.js';
/**
 * @internal
 *
 * Get the initialization url. It can be present on AdaptationSet or Representation.
 *
 * Url initialization is present on segments.
 *
 * @param adaptationSet - AdaptationSet to try to get the initialization url from
 * @param representation - Representation to try to get the initialization url from
 */
export declare function getInitializationUrl(adaptationSet: AdaptationSet, representation: Representation): string | undefined;
//# sourceMappingURL=getInitializationUrl.d.ts.map
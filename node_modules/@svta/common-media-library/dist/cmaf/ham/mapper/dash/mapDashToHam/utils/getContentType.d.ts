import type { AdaptationSet } from '../../../../types/mapper/dash/AdaptationSet.js';
import type { Representation } from '../../../../types/mapper/dash/Representation.js';
/**
 * @internal
 *
 * Get the type of the content. It can be obtained directly from AdaptationSet or Representation
 * or can be inferred with the existing properties.
 *
 * @param adaptationSet - AdaptationSet to get the type from
 * @param representation - Representation to get the type from
 * @returns type of the content
 */
export declare function getContentType(adaptationSet: AdaptationSet, representation?: Representation): string;
//# sourceMappingURL=getContentType.d.ts.map
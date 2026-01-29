import type { AdaptationSet } from '../../../types/mapper/dash/AdaptationSet.js';
import type { Representation } from '../../../types/mapper/dash/Representation.js';
import type { Segment } from '../../../types/model/Segment.js';
/**
 * @internal
 *
 * Maps dash segments to ham segment.
 *
 * Checks the type of dash segments used to map them accordingly.
 * @see mapSegmentBase
 * @see mapSegmentList
 * @see mapSegmentTemplate
 *
 * @param adaptationSet - AdaptationSet to get the segments from
 * @param representation - Representation to get the segments from
 * @param duration - Duration of the segments
 * @returns list of ham segments
 */
export declare function mapSegments(adaptationSet: AdaptationSet, representation: Representation, duration: number): Segment[];
//# sourceMappingURL=mapSegments.d.ts.map
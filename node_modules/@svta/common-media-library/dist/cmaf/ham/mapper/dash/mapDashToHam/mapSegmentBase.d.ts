import type { Representation } from '../../../types/mapper/dash/Representation.js';
import type { Segment } from '../../../types/model/Segment.js';
/**
 * @internal
 *
 * Maps SegmentBase from dash to Segment list from ham.
 *
 * @param representation - Representation to get the SegmentBase from
 * @param duration - Duration of the segment
 * @returns list of ham segments
 */
export declare function mapSegmentBase(representation: Representation, duration: number): Segment[];
//# sourceMappingURL=mapSegmentBase.d.ts.map
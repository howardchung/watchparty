import type { Representation } from '../../../types/mapper/dash/Representation.js';
import type { SegmentTemplate } from '../../../types/mapper/dash/SegmentTemplate.js';
import type { Segment } from '../../../types/model/Segment.js';
/**
 * @internal
 *
 * Maps SegmentTemplate from dash to Segment list from ham.
 *
 * @param representation - Representation to generate the urls
 * @param duration - Duration of the segments
 * @param segmentTemplate - SegmentTemplate to get the properties from
 * @returns list of ham segments
 */
export declare function mapSegmentTemplate(representation: Representation, duration: number, segmentTemplate: SegmentTemplate): Segment[];
//# sourceMappingURL=mapSegmentTemplate.d.ts.map
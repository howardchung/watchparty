import type { SegmentTemplate } from '../../../../types/mapper/dash/SegmentTemplate.js';
/**
 * @internal
 *
 * Calculates the number of segments that a track has to use SegmentTemplate.
 *
 * Equation used:
 * segments = total duration / (segment duration / timescale)
 *
 * **This equation might be wrong, please double-check it**
 *
 * @param segmentTemplate - SegmentTemplate object
 * @param duration - Total duration of the content
 * @returns Number of segments
 */
export declare function getNumberOfSegments(segmentTemplate: SegmentTemplate, duration: number): number;
//# sourceMappingURL=getNumberOfSegments.d.ts.map
import type { Segment } from '../../../../types/model/Segment.js';
/**
 * @internal
 *
 * Calculate the duration of a track.
 *
 * This is calculated using the sum of the duration of all the segments from the
 * track.
 *
 * An alternative to this could be number of segments * duration of a segment.
 *
 * @param segments - Segments to calculate the sum of the durations
 * @returns Duration of the track
 */
export declare function getTrackDuration(segments: Segment[]): number;
//# sourceMappingURL=getTrackDuration.d.ts.map
import type { Ham } from './Ham.js';
import type { Segment } from './Segment.js';
import type { TrackType } from './TrackType.js';
/**
 * CMAF-HAM Track type
 * Used as a base for the audio, video and text tracks
 *
 * type - The TrackType
 * fileName - File name of the track.
 * codec - Codec of the track.
 * duration - Duration of the track in seconds
 * language - Language of the track.
 * bandwidth - Bandwidth of the track.
 * byteRange - Byte range of the track.
 * segments - List of segments of the track.
 *
 * @group CMAF
 * @alpha
 */
export type Track = Ham & {
    /** Track type */
    type: TrackType;
    fileName?: string;
    codec: string;
    duration: number;
    language: string;
    bandwidth: number;
    byteRange?: string;
    /** URL of the initialization segment */
    urlInitialization?: string;
    segments: Segment[];
};
//# sourceMappingURL=Track.d.ts.map
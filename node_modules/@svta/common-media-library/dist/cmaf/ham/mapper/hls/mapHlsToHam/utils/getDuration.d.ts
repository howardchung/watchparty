import type { HlsManifest } from '../../../../types/mapper/hls/HlsManifest.js';
import type { SegmentHls } from '../../../../types/mapper/hls/SegmentHls.js';
/**
 * @internal
 *
 * Calculate the duration of a track.
 *
 * `target duration * number of segments`
 *
 * @param manifest - Manifest of the track
 * @param segments - Array of segments in a track
 * @returns duration of a track
 *
 * @group CMAF
 * @alpha
 */
export declare function getDuration(manifest: HlsManifest, segments: SegmentHls[]): number | null;
//# sourceMappingURL=getDuration.d.ts.map
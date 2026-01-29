import type { AudioTrack } from '../../../../types/model/AudioTrack.js';
import type { VideoTrack } from '../../../../types/model/VideoTrack.js';
/**
 * @internal
 *
 * Get the byterange in hls format from ham track.
 *
 * @param track - Track to get the byterange from
 * @returns string containing the byterange in the hls format
 *
 * @group CMAF
 * @alpha
 */
export declare function getByterange(track: VideoTrack | AudioTrack): string;
//# sourceMappingURL=getByterange.d.ts.map
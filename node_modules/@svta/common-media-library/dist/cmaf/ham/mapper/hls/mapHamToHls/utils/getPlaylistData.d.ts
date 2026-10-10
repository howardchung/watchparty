import type { AudioTrack } from '../../../../types/model/AudioTrack.js';
import type { VideoTrack } from '../../../../types/model/VideoTrack.js';
/**
 * @internal
 *
 * Get the playlist data in hls format from ham track.
 *
 * @param track - Track to get the playlist data from
 * @returns string containing the playlist data in the hls format
 *
 * @group CMAF
 * @alpha
 */
export declare function getPlaylistData(track: AudioTrack | VideoTrack): string;
//# sourceMappingURL=getPlaylistData.d.ts.map
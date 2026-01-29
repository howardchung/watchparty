import { getByterange } from './getByterange.js';
import { getUrlInitialization } from './getUrlInitialization.js';
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
export function getPlaylistData(track) {
    return `#EXT-X-MAP:URI="${getUrlInitialization(track)}",${getByterange(track)}\n`;
}
//# sourceMappingURL=getPlaylistData.js.map
import type { MediaGroups } from './MediaGroups.js';
import type { PlayList } from './Playlist.js';
import type { SegmentHls } from './SegmentHls.js';
/**
 * HLS manifest
 *
 * @group CMAF
 * @alpha
 */
export type HlsManifest = {
    playlists: PlayList[];
    mediaGroups: MediaGroups;
    segments: SegmentHls[];
    targetDuration?: number;
};
//# sourceMappingURL=HlsManifest.d.ts.map
import type { AudioTrack } from '../../../../types/model/AudioTrack.js';
import type { VideoTrack } from '../../../../types/model/VideoTrack.js';
/**
 * @internal
 *
 * Get url initialization from ham track.
 *
 * @param track - Track to get the url initialization from
 * @returns string containing the url initialization in the hls format
 *
 * @group CMAF
 * @alpha
 */
export declare function getUrlInitialization(track: VideoTrack | AudioTrack): string;
//# sourceMappingURL=getUrlInitialization.d.ts.map
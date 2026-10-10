import type { Track } from '../../../../types/model/Track.js';
/**
 * @internal
 *
 * Get the framerate from a track.
 *
 * If frameRate numerator is not present, it uses 30 as default.
 *
 * @param track - to get the framerate from
 * @returns frame rate as a string formatted as `numerator/denominator`
 */
export declare function getFrameRate(track: Track): string | undefined;
//# sourceMappingURL=getFrameRate.d.ts.map
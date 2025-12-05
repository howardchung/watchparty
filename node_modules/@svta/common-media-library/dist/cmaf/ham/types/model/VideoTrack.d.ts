import type { FrameRate } from './FrameRate.js';
import type { Track } from './Track.js';
/**
 * CMAF-HAM Track type
 *
 * width - Video width in pixels.
 * height - Video height in pixels.
 * frameRate - Video framerate in FrameRate type;
 * par - Pixel Aspect Ratio of the video track as string.
 * sar - Sample Aspect Ratio of the video track in string.
 * scanType - The method used to display the video track.
 *
 * @group CMAF
 * @alpha
 */
export type VideoTrack = Track & {
    width: number;
    height: number;
    frameRate: FrameRate;
    par: string;
    sar: string;
    scanType: string;
};
//# sourceMappingURL=VideoTrack.d.ts.map
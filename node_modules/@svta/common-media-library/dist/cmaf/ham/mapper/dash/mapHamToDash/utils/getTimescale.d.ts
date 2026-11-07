import type { Track } from '../../../../types/model/Track.js';
/**
 * @internal
 *
 * This function tries to recreate the timescale value.
 *
 * This value is not stored on the ham object, so it is not possible (for now)
 * to get the original one.
 *
 * Just the audio tracks have this value stored on the `sampleRate` key.
 *
 * @param track - Track to get the timescale from
 * @returns Timescale in numbers
 */
export declare function getTimescale(track: Track): number;
//# sourceMappingURL=getTimescale.d.ts.map
import { TEXT_SAMPLE_RATE, TIMESCALE_48000, VIDEO_SAMPLE_RATE, } from '../../../../utils/constants.js';
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
export function getTimescale(track) {
    if ((track === null || track === void 0 ? void 0 : track.type) === 'audio') {
        const audioTrack = track;
        return audioTrack.sampleRate !== 0
            ? audioTrack.sampleRate
            : TIMESCALE_48000;
    }
    if ((track === null || track === void 0 ? void 0 : track.type) === 'video') {
        return VIDEO_SAMPLE_RATE;
    }
    if ((track === null || track === void 0 ? void 0 : track.type) === 'text') {
        return TEXT_SAMPLE_RATE;
    }
    return VIDEO_SAMPLE_RATE;
}
//# sourceMappingURL=getTimescale.js.map
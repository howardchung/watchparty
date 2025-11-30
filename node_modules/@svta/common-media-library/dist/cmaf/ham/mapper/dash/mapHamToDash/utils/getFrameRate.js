import { FRAME_RATE_NUMERATOR_30, ZERO, } from '../../../../utils/constants.js';
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
export function getFrameRate(track) {
    var _a;
    let frameRate = undefined;
    if ((track === null || track === void 0 ? void 0 : track.type) === 'video') {
        const videoTrack = track;
        frameRate = `${(_a = videoTrack.frameRate.frameRateNumerator) !== null && _a !== void 0 ? _a : FRAME_RATE_NUMERATOR_30}`;
        frameRate =
            videoTrack.frameRate.frameRateDenominator !== ZERO
                ? `${frameRate}/${videoTrack.frameRate.frameRateDenominator}`
                : frameRate;
    }
    return frameRate;
}
//# sourceMappingURL=getFrameRate.js.map
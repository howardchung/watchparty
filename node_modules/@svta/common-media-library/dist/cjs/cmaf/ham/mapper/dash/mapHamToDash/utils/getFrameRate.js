"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFrameRate = getFrameRate;
const constants_js_1 = require("../../../../utils/constants.js");
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
function getFrameRate(track) {
    var _a;
    let frameRate = undefined;
    if ((track === null || track === void 0 ? void 0 : track.type) === 'video') {
        const videoTrack = track;
        frameRate = `${(_a = videoTrack.frameRate.frameRateNumerator) !== null && _a !== void 0 ? _a : constants_js_1.FRAME_RATE_NUMERATOR_30}`;
        frameRate =
            videoTrack.frameRate.frameRateDenominator !== constants_js_1.ZERO
                ? `${frameRate}/${videoTrack.frameRate.frameRateDenominator}`
                : frameRate;
    }
    return frameRate;
}
//# sourceMappingURL=getFrameRate.js.map
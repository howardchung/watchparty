"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFrameRate = getFrameRate;
const constants_js_1 = require("../../../../utils/constants.js");
/**
 * @internal
 *
 * Get the frame rate from a dash manifest.
 *
 * This functions assumes the adaptationSet and representation set are type video
 *
 * @param adaptationSet - To try to get the frameRate from
 * @param representation - To try to get the frameRate from
 * @returns object containing numerator and denominator
 */
function getFrameRate(adaptationSet, representation) {
    var _a, _b, _c, _d;
    const frameRateDash = (_b = (_a = representation.$.frameRate) !== null && _a !== void 0 ? _a : adaptationSet.$.frameRate) !== null && _b !== void 0 ? _b : '';
    if (!frameRateDash) {
        console.error(`Representation ${representation.$.id} has no frame rate`);
    }
    const frameRate = frameRateDash.split(constants_js_1.FRAME_RATE_SEPARATOR);
    const frameRateNumerator = parseInt((_c = frameRate.at(constants_js_1.NUMERATOR)) !== null && _c !== void 0 ? _c : '');
    const frameRateDenominator = parseInt((_d = frameRate.at(constants_js_1.DENOMINATOR)) !== null && _d !== void 0 ? _d : '');
    return {
        frameRateNumerator: isNaN(frameRateNumerator)
            ? constants_js_1.FRAME_RATE_NUMERATOR_30
            : frameRateNumerator,
        frameRateDenominator: isNaN(frameRateDenominator)
            ? constants_js_1.ZERO
            : frameRateDenominator,
    };
}
//# sourceMappingURL=getFrameRate.js.map
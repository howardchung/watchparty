import { DENOMINATOR, FRAME_RATE_NUMERATOR_30, FRAME_RATE_SEPARATOR, NUMERATOR, ZERO, } from '../../../../utils/constants.js';
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
export function getFrameRate(adaptationSet, representation) {
    var _a, _b, _c, _d;
    const frameRateDash = (_b = (_a = representation.$.frameRate) !== null && _a !== void 0 ? _a : adaptationSet.$.frameRate) !== null && _b !== void 0 ? _b : '';
    if (!frameRateDash) {
        console.error(`Representation ${representation.$.id} has no frame rate`);
    }
    const frameRate = frameRateDash.split(FRAME_RATE_SEPARATOR);
    const frameRateNumerator = parseInt((_c = frameRate.at(NUMERATOR)) !== null && _c !== void 0 ? _c : '');
    const frameRateDenominator = parseInt((_d = frameRate.at(DENOMINATOR)) !== null && _d !== void 0 ? _d : '');
    return {
        frameRateNumerator: isNaN(frameRateNumerator)
            ? FRAME_RATE_NUMERATOR_30
            : frameRateNumerator,
        frameRateDenominator: isNaN(frameRateDenominator)
            ? ZERO
            : frameRateDenominator,
    };
}
//# sourceMappingURL=getFrameRate.js.map
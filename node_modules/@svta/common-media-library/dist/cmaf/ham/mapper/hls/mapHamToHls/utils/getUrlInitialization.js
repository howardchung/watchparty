import { WHITE_SPACE, WHITE_SPACE_ENCODED, } from '../../../../utils/constants.js';
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
export function getUrlInitialization(track) {
    var _a, _b;
    return ((_b = (_a = track.urlInitialization) === null || _a === void 0 ? void 0 : _a.replaceAll(WHITE_SPACE, WHITE_SPACE_ENCODED)) !== null && _b !== void 0 ? _b : '');
}
//# sourceMappingURL=getUrlInitialization.js.map
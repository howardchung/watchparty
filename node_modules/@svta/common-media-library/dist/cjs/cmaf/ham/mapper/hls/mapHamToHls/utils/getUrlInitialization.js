"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUrlInitialization = getUrlInitialization;
const constants_js_1 = require("../../../../utils/constants.js");
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
function getUrlInitialization(track) {
    var _a, _b;
    return ((_b = (_a = track.urlInitialization) === null || _a === void 0 ? void 0 : _a.replaceAll(constants_js_1.WHITE_SPACE, constants_js_1.WHITE_SPACE_ENCODED)) !== null && _b !== void 0 ? _b : '');
}
//# sourceMappingURL=getUrlInitialization.js.map
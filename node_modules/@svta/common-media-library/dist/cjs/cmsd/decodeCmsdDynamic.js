"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeCmsdDynamic = decodeCmsdDynamic;
const decodeSfList_js_1 = require("../structuredfield/decodeSfList.js");
/**
 * Decode a CMSD dynamic string to an object.
 *
 * @param cmsd - The CMSD string to decode.
 *
 * @returns The decoded CMSD object.
 *
 * @group CMSD
 *
 * @beta
 */
function decodeCmsdDynamic(cmsd) {
    if (!cmsd) {
        return [];
    }
    const sfDict = (0, decodeSfList_js_1.decodeSfList)(cmsd);
    return sfDict;
}
//# sourceMappingURL=decodeCmsdDynamic.js.map
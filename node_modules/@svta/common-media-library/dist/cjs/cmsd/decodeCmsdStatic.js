"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeCmsdStatic = decodeCmsdStatic;
const symbolToStr_js_1 = require("../cta/utils/symbolToStr.js");
const decodeSfDict_js_1 = require("../structuredfield/decodeSfDict.js");
/**
 * Decode a CMSD Static dict string to an object.
 *
 * @param cmsd - The CMSD string to decode.
 *
 * @returns The decoded CMSD object.
 *
 * @group CMSD
 *
 * @beta
 */
function decodeCmsdStatic(cmsd) {
    if (!cmsd) {
        return {};
    }
    return Object
        .entries((0, decodeSfDict_js_1.decodeSfDict)(cmsd))
        .reduce((acc, [key, item]) => {
        const { value } = item;
        acc[key] = (typeof value === 'symbol' ? (0, symbolToStr_js_1.symbolToStr)(value) : value);
        return acc;
    }, {});
}
//# sourceMappingURL=decodeCmsdStatic.js.map
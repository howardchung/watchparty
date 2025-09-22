"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeCmcd = decodeCmcd;
const symbolToStr_js_1 = require("../cta/utils/symbolToStr.js");
const decodeSfDict_js_1 = require("../structuredfield/decodeSfDict.js");
/**
 * Decode a CMCD string to an object.
 *
 * @param cmcd - The CMCD string to decode.
 *
 * @returns The decoded CMCD object.
 *
 * @group CMCD
 *
 * @beta
 */
function decodeCmcd(cmcd) {
    if (!cmcd) {
        return {};
    }
    const sfDict = (0, decodeSfDict_js_1.decodeSfDict)(decodeURIComponent(cmcd.replace(/^CMCD=/, '')));
    return Object
        .entries(sfDict)
        .reduce((acc, [key, item]) => {
        const { value } = item;
        // TODO: Find a better way to type this
        acc[key] = (typeof value === 'symbol' ? (0, symbolToStr_js_1.symbolToStr)(value) : item.value);
        return acc;
    }, {});
}
//# sourceMappingURL=decodeCmcd.js.map
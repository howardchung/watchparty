"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCmcd = encodeCmcd;
const encodeSfDict_js_1 = require("../structuredfield/encodeSfDict.js");
const processCmcd_js_1 = require("./utils/processCmcd.js");
/**
 * Encode a CMCD object to a string.
 *
 * @param cmcd - The CMCD object to encode.
 * @param options - Options for encoding.
 *
 * @returns The encoded CMCD string.
 *
 * @group CMCD
 *
 * @beta
 */
function encodeCmcd(cmcd, options = {}) {
    if (!cmcd) {
        return '';
    }
    return (0, encodeSfDict_js_1.encodeSfDict)((0, processCmcd_js_1.processCmcd)(cmcd, options), Object.assign({ whitespace: false }, options));
}
//# sourceMappingURL=encodeCmcd.js.map
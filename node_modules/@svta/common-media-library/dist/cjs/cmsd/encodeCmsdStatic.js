"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCmsdStatic = encodeCmsdStatic;
const encodeSfDict_js_1 = require("../structuredfield/encodeSfDict.js");
const processCmsd_js_1 = require("./utils/processCmsd.js");
/**
 * Encode a CMSD Static object.
 *
 * @param cmsd - The CMSD object to encode.
 * @param options - Encoding options
 *
 * @returns The encoded CMSD string.
 *
 * @group CMSD
 *
 * @beta
 */
function encodeCmsdStatic(cmsd, options) {
    if (!cmsd) {
        return '';
    }
    return (0, encodeSfDict_js_1.encodeSfDict)((0, processCmsd_js_1.processCmsd)(cmsd, options), { whitespace: false });
}
//# sourceMappingURL=encodeCmsdStatic.js.map
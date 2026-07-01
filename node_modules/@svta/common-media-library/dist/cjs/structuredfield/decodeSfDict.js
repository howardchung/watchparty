"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeSfDict = decodeSfDict;
const parseDict_js_1 = require("./parse/parseDict.js");
const parseError_js_1 = require("./parse/parseError.js");
const DICT_js_1 = require("./utils/DICT.js");
/**
 * Decode a structured field string into a structured field dictionary
 *
 * @param input - The structured field string to decode
 * @returns The structured field dictionary
 *
 * @group Structured Field
 *
 * @beta
 */
function decodeSfDict(input, options) {
    try {
        const { src, value } = (0, parseDict_js_1.parseDict)(input.trim(), options);
        if (src !== '') {
            throw (0, parseError_js_1.parseError)(src, DICT_js_1.DICT);
        }
        return value;
    }
    catch (cause) {
        throw (0, parseError_js_1.parseError)(input, DICT_js_1.DICT, cause);
    }
}
//# sourceMappingURL=decodeSfDict.js.map
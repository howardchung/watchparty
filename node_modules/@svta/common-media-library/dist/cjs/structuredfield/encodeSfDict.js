"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeSfDict = encodeSfDict;
const serializeDict_js_1 = require("./serialize/serializeDict.js");
/**
 * Encode an object into a structured field dictionary
 *
 * @param value - The structured field dictionary to encode
 * @param options - Encoding options
 *
 * @returns The structured field string
 *
 * @group Structured Field
 *
 * @beta
 */
function encodeSfDict(value, options) {
    return (0, serializeDict_js_1.serializeDict)(value, options);
}
//# sourceMappingURL=encodeSfDict.js.map
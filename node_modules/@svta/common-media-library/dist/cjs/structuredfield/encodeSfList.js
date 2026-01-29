"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeSfList = encodeSfList;
const serializeList_js_1 = require("./serialize/serializeList.js");
/**
 * Encode a list into a structured field dictionary
 *
 * @param value - The structured field list to encode
 * @param options - Encoding options
 *
 * @returns The structured field string
 *
 * @group Structured Field
 *
 * @beta
 */
function encodeSfList(value, options) {
    return (0, serializeList_js_1.serializeList)(value, options);
}
//# sourceMappingURL=encodeSfList.js.map
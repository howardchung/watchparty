"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeSfList = decodeSfList;
const parseError_js_1 = require("./parse/parseError.js");
const parseList_js_1 = require("./parse/parseList.js");
const LIST_js_1 = require("./utils/LIST.js");
/**
 * Decode a structured field string into a structured field list
 *
 * @param input - The structured field string to decode
 * @returns The structured field list
 *
 * @group Structured Field
 *
 * @beta
 */
function decodeSfList(input, options) {
    try {
        const { src, value } = (0, parseList_js_1.parseList)(input.trim(), options);
        if (src !== '') {
            throw (0, parseError_js_1.parseError)(src, LIST_js_1.LIST);
        }
        return value;
    }
    catch (cause) {
        throw (0, parseError_js_1.parseError)(input, LIST_js_1.LIST, cause);
    }
}
//# sourceMappingURL=decodeSfList.js.map
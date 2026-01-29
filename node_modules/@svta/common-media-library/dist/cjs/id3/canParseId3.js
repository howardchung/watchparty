"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canParseId3 = canParseId3;
const isId3Header_js_1 = require("./util/isId3Header.js");
const readId3Size_js_1 = require("./util/readId3Size.js");
/**
 * Checks if the given data contains an ID3 tag.
 *
 * @param data - The data to check
 * @param offset - The offset at which to start checking
 *
 * @returns `true` if an ID3 tag is found
 *
 * @group ID3
 *
 * @beta
 */
function canParseId3(data, offset) {
    return ((0, isId3Header_js_1.isId3Header)(data, offset) &&
        (0, readId3Size_js_1.readId3Size)(data, offset + 6) + 10 <= data.length - offset);
}
//# sourceMappingURL=canParseId3.js.map
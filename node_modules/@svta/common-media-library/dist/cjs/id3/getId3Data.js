"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getId3Data = getId3Data;
const isId3Footer_js_1 = require("./util/isId3Footer.js");
const isId3Header_js_1 = require("./util/isId3Header.js");
const readId3Size_js_1 = require("./util/readId3Size.js");
/**
 * Returns any adjacent ID3 tags found in data starting at offset, as one block of data
 *
 * @param data - The data to search in
 * @param offset - The offset at which to start searching
 *
 * @returns The block of data containing any ID3 tags found
 * or `undefined` if no header is found at the starting offset
 *
 * @internal
 *
 * @group ID3
 */
function getId3Data(data, offset) {
    const front = offset;
    let length = 0;
    while ((0, isId3Header_js_1.isId3Header)(data, offset)) {
        // ID3 header is 10 bytes
        length += 10;
        const size = (0, readId3Size_js_1.readId3Size)(data, offset + 6);
        length += size;
        if ((0, isId3Footer_js_1.isId3Footer)(data, offset + 10)) {
            // ID3 footer is 10 bytes
            length += 10;
        }
        offset += length;
    }
    if (length > 0) {
        return data.subarray(front, front + length);
    }
    return undefined;
}
//# sourceMappingURL=getId3Data.js.map
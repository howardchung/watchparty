"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readId3Size = readId3Size;
/**
 * Read ID3 size
 *
 * @param data - The data to read from
 * @param offset - The offset at which to start reading
 *
 * @returns The size
 *
 * @internal
 *
 * @group ID3
 */
function readId3Size(data, offset) {
    let size = 0;
    size = (data[offset] & 0x7f) << 21;
    size |= (data[offset + 1] & 0x7f) << 14;
    size |= (data[offset + 2] & 0x7f) << 7;
    size |= data[offset + 3] & 0x7f;
    return size;
}
//# sourceMappingURL=readId3Size.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isId3Header = isId3Header;
/**
 * Returns true if an ID3 header can be found at offset in data
 *
 * @param data - The data to search in
 * @param offset - The offset at which to start searching
 *
 * @returns `true` if an ID3 header is found
 *
 * @internal
 *
 * @group ID3
 */
function isId3Header(data, offset) {
    /*
     * http://id3.org/id3v2.3.0
     * [0]     = 'I'
     * [1]     = 'D'
     * [2]     = '3'
     * [3,4]   = {Version}
     * [5]     = {Flags}
     * [6-9]   = {ID3 Size}
     *
     * An ID3v2 tag can be detected with the following pattern:
     *  $49 44 33 yy yy xx zz zz zz zz
     * Where yy is less than $FF, xx is the 'flags' byte and zz is less than $80
     */
    if (offset + 10 <= data.length) {
        // look for 'ID3' identifier
        if (data[offset] === 0x49 &&
            data[offset + 1] === 0x44 &&
            data[offset + 2] === 0x33) {
            // check version is within range
            if (data[offset + 3] < 0xff && data[offset + 4] < 0xff) {
                // check size is within range
                if (data[offset + 6] < 0x80 &&
                    data[offset + 7] < 0x80 &&
                    data[offset + 8] < 0x80 &&
                    data[offset + 9] < 0x80) {
                    return true;
                }
            }
        }
    }
    return false;
}
//# sourceMappingURL=isId3Header.js.map
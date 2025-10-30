/**
 * Returns true if an ID3 footer can be found at offset in data
 *
 * @param data - The data to search in
 * @param offset - The offset at which to start searching
 *
 * @returns `true` if an ID3 footer is found
 *
 * @internal
 *
 * @group ID3
 */
export function isId3Footer(data, offset) {
    /*
     * The footer is a copy of the header, but with a different identifier
     */
    if (offset + 10 <= data.length) {
        // look for '3DI' identifier
        if (data[offset] === 0x33 &&
            data[offset + 1] === 0x44 &&
            data[offset + 2] === 0x49) {
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
//# sourceMappingURL=isId3Footer.js.map
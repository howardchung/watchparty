import { isId3Footer } from './util/isId3Footer.js';
import { isId3Header } from './util/isId3Header.js';
import { readId3Size } from './util/readId3Size.js';
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
export function getId3Data(data, offset) {
    const front = offset;
    let length = 0;
    while (isId3Header(data, offset)) {
        // ID3 header is 10 bytes
        length += 10;
        const size = readId3Size(data, offset + 6);
        length += size;
        if (isId3Footer(data, offset + 10)) {
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
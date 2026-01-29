import { isId3Header } from './util/isId3Header.js';
import { readId3Size } from './util/readId3Size.js';
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
export function canParseId3(data, offset) {
    return (isId3Header(data, offset) &&
        readId3Size(data, offset + 6) + 10 <= data.length - offset);
}
//# sourceMappingURL=canParseId3.js.map
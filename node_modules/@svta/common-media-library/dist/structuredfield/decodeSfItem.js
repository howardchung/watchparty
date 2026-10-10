import { parseError } from './parse/parseError.js';
import { parseItem } from './parse/parseItem.js';
import { ITEM } from './utils/ITEM.js';
// 4.2.  Parsing Structured Fields
//
// 1.  Convert input_bytes into an ASCII string input_string; if
//     conversion fails, fail parsing.
//
// 2.  Discard any leading SP characters from input_string.
//
// 3.  If field_type is "list", let output be the result of running
//     Parsing a List (Section 4.2.1) with input_string.
//
// 4.  If field_type is "dictionary", let output be the result of
//     running Parsing a Dictionary (Section 4.2.2) with input_string.
//
// 5.  If field_type is "item", let output be the result of running
//     Parsing an Item (Section 4.2.3) with input_string.
//
// 6.  Discard any leading SP characters from input_string.
//
// 7.  If input_string is not empty, fail parsing.
//
// 8.  Otherwise, return output.
/**
 * Decode a structured field string into a structured field item
 *
 * @param input - The structured field string to decode
 * @returns The structured field item
 *
 * @group Structured Field
 *
 * @beta
 */
export function decodeSfItem(input, options) {
    try {
        const { src, value } = parseItem(input.trim(), options);
        if (src !== '') {
            throw parseError(src, ITEM);
        }
        return value;
    }
    catch (cause) {
        throw parseError(input, ITEM, cause);
    }
}
//# sourceMappingURL=decodeSfItem.js.map
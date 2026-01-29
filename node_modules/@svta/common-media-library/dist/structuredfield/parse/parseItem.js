import { SfItem } from '../SfItem.js';
import { parsedValue } from './ParsedValue.js';
import { parseBareItem } from './parseBareItem.js';
import { parseParameters } from './parseParameters.js';
// 4.2.3.  Parsing an Item
//
// Given an ASCII string as input_string, return a (bare_item,
// parameters) tuple. input_string is modified to remove the parsed
// value.
//
// 1.  Let bare_item be the result of running Parsing a Bare Item
//     (Section 4.2.3.1) with input_string.
//
// 2.  Let parameters be the result of running Parsing Parameters
//     (Section 4.2.3.2) with input_string.
//
// 3.  Return the tuple (bare_item, parameters).
export function parseItem(src, options) {
    const parsedBareItem = parseBareItem(src, options);
    src = parsedBareItem.src;
    const parsedParameters = parseParameters(src, options);
    src = parsedParameters.src;
    return parsedValue(new SfItem(parsedBareItem.value, parsedParameters.value), src);
}
//# sourceMappingURL=parseItem.js.map
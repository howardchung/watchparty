import { SfToken } from '../SfToken.js';
import { TOKEN } from '../utils/TOKEN.js';
import { parsedValue } from './ParsedValue.js';
import { parseError } from './parseError.js';
// 4.2.6.  Parsing a Token
//
// Given an ASCII string as input_string, return a Token. input_string
// is modified to remove the parsed value.
//
// 1.  If the first character of input_string is not ALPHA or "*", fail
//     parsing.
//
// 2.  Let output_string be an empty string.
//
// 3.  While input_string is not empty:
//
//     1.  If the first character of input_string is not in tchar, ":"
//         or "/", return output_string.
//
//     2.  Let char be the result of consuming the first character of
//         input_string.
//
//     3.  Append char to output_string.
//
// 4.  Return output_string.
export function parseToken(src, options) {
    if (/^[a-zA-Z*]$/.test(src[0]) === false) {
        throw parseError(src, TOKEN);
    }
    const re = /^([!#$%&'*+\-.^_`|~\w:/]+)/g;
    const value = re.exec(src)[1];
    src = src.substring(re.lastIndex);
    return parsedValue((options === null || options === void 0 ? void 0 : options.useSymbol) === false ? new SfToken(value) : Symbol.for(value), src);
}
//# sourceMappingURL=parseToken.js.map
// http://stackoverflow.com/questions/8936984/uint8array-to-string-in-javascript/22373197
// http://www.onicos.com/staff/iz/amuse/javascript/expert/utf.txt
/* utf.js - UTF-8 <=> UTF-16 convertion
 *
 * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0
 * LastModified: Dec 25 1999
 * This library is free.  You can redistribute it and/or modify it.
 */
/**
 * Converts a UTF-8 array to a string.
 *
 * @param array - The UTF-8 array to convert
 *
 * @returns The string
 *
 * @group Utils
 *
 * @beta
 */
export function utf8ArrayToStr(array, exitOnNull = false) {
    if (typeof TextDecoder !== 'undefined') {
        const decoder = new TextDecoder('utf-8');
        const decoded = decoder.decode(array);
        if (exitOnNull) {
            // grab up to the first null
            const idx = decoded.indexOf('\0');
            return idx !== -1 ? decoded.substring(0, idx) : decoded;
        }
        // remove any null characters
        return decoded.replace(/\0/g, '');
    }
    const len = array.length;
    let c;
    let char2;
    let char3;
    let out = '';
    let i = 0;
    while (i < len) {
        c = array[i++];
        if (c === 0x00 && exitOnNull) {
            return out;
        }
        else if (c === 0x00 || c === 0x03) {
            // If the character is 3 (END_OF_TEXT) or 0 (NULL) then skip it
            continue;
        }
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12:
            case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0));
                break;
            default:
        }
    }
    return out;
}
//# sourceMappingURL=utf8ArrayToStr.js.map
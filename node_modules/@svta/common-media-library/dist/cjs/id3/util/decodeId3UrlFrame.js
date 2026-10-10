"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeId3UrlFrame = decodeId3UrlFrame;
const utf8ArrayToStr_js_1 = require("../../utils/utf8ArrayToStr.js");
/**
 * Decode a URL frame
 *
 * @param frame - the ID3 URL frame
 *
 * @returns The decoded ID3 URL frame
 *
 * @internal
 *
 * @group ID3
 */
function decodeId3UrlFrame(frame) {
    if (frame.type === 'WXXX') {
        /*
        Format:
        [0]   = {Text Encoding}
        [1-?] = {Description}\0{URL}
        */
        if (frame.size < 2) {
            return undefined;
        }
        let index = 1;
        const description = (0, utf8ArrayToStr_js_1.utf8ArrayToStr)(frame.data.subarray(index), true);
        index += description.length + 1;
        const value = (0, utf8ArrayToStr_js_1.utf8ArrayToStr)(frame.data.subarray(index));
        return { key: frame.type, info: description, data: value };
    }
    /*
    Format:
    [0-?] = {URL}
    */
    const url = (0, utf8ArrayToStr_js_1.utf8ArrayToStr)(frame.data);
    return { key: frame.type, info: '', data: url };
}
//# sourceMappingURL=decodeId3UrlFrame.js.map
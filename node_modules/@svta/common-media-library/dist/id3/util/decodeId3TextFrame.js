import { utf8ArrayToStr } from '../../utils/utf8ArrayToStr.js';
/**
 * Decodes an ID3 text frame
 *
 * @param frame - the ID3 text frame
 *
 * @returns The decoded ID3 text frame
 *
 * @internal
 *
 * @group ID3
 */
export function decodeId3TextFrame(frame) {
    if (frame.size < 2) {
        return undefined;
    }
    if (frame.type === 'TXXX') {
        /*
        Format:
        [0]   = {Text Encoding}
        [1-?] = {Description}\0{Value}
        */
        let index = 1;
        const description = utf8ArrayToStr(frame.data.subarray(index), true);
        index += description.length + 1;
        const value = utf8ArrayToStr(frame.data.subarray(index));
        return { key: frame.type, info: description, data: value };
    }
    /*
    Format:
    [0]   = {Text Encoding}
    [1-?] = {Value}
    */
    const text = utf8ArrayToStr(frame.data.subarray(1));
    return { key: frame.type, info: '', data: text };
}
//# sourceMappingURL=decodeId3TextFrame.js.map
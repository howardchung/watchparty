"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeId3PrivFrame = decodeId3PrivFrame;
const utf8ArrayToStr_js_1 = require("../../utils/utf8ArrayToStr.js");
/**
 * Decode an ID3 PRIV frame.
 *
 * @param frame - the ID3 PRIV frame
 *
 * @returns The decoded ID3 PRIV frame
 *
 * @internal
 *
 * @group ID3
 */
function decodeId3PrivFrame(frame) {
    /*
    Format: <text string>\0<binary data>
    */
    if (frame.size < 2) {
        return undefined;
    }
    const owner = (0, utf8ArrayToStr_js_1.utf8ArrayToStr)(frame.data, true);
    const privateData = new Uint8Array(frame.data.subarray(owner.length + 1));
    return { key: frame.type, info: owner, data: privateData.buffer };
}
//# sourceMappingURL=decodeId3PrivFrame.js.map
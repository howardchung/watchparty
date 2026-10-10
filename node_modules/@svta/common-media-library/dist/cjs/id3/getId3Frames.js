"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getId3Frames = getId3Frames;
const decodeId3Frame_js_1 = require("./util/decodeId3Frame.js");
const getId3FrameData_js_1 = require("./util/getId3FrameData.js");
const isId3Footer_js_1 = require("./util/isId3Footer.js");
const isId3Header_js_1 = require("./util/isId3Header.js");
const readId3Size_js_1 = require("./util/readId3Size.js");
const HEADER_FOOTER_SIZE = 10;
const FRAME_SIZE = 10;
/**
 * Returns an array of ID3 frames found in all the ID3 tags in the id3Data
 *
 * @param id3Data - The ID3 data containing one or more ID3 tags
 *
 * @returns Array of ID3 frame objects
 *
 * @group ID3
 *
 * @beta
 */
function getId3Frames(id3Data) {
    let offset = 0;
    const frames = [];
    while ((0, isId3Header_js_1.isId3Header)(id3Data, offset)) {
        const size = (0, readId3Size_js_1.readId3Size)(id3Data, offset + 6);
        if ((id3Data[offset + 5] >> 6) & 1) {
            // skip extended header
            offset += HEADER_FOOTER_SIZE;
        }
        // skip past ID3 header
        offset += HEADER_FOOTER_SIZE;
        const end = offset + size;
        // loop through frames in the ID3 tag
        while (offset + FRAME_SIZE < end) {
            const frameData = (0, getId3FrameData_js_1.getId3FrameData)(id3Data.subarray(offset));
            const frame = (0, decodeId3Frame_js_1.decodeId3Frame)(frameData);
            if (frame) {
                frames.push(frame);
            }
            // skip frame header and frame data
            offset += frameData.size + HEADER_FOOTER_SIZE;
        }
        if ((0, isId3Footer_js_1.isId3Footer)(id3Data, offset)) {
            offset += HEADER_FOOTER_SIZE;
        }
    }
    return frames;
}
//# sourceMappingURL=getId3Frames.js.map
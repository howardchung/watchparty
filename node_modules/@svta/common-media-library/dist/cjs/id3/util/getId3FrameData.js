"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getId3FrameData = getId3FrameData;
const readId3Size_js_1 = require("./readId3Size.js");
/**
 * Returns the data of an ID3 frame.
 *
 * @param data - The data to read from
 *
 * @returns The data of the ID3 frame
 *
 * @internal
 *
 * @group ID3
 */
function getId3FrameData(data) {
    /*
    Frame ID       $xx xx xx xx (four characters)
    Size           $xx xx xx xx
    Flags          $xx xx
    */
    const type = String.fromCharCode(data[0], data[1], data[2], data[3]);
    const size = (0, readId3Size_js_1.readId3Size)(data, 4);
    // skip frame id, size, and flags
    const offset = 10;
    return { type, size, data: data.subarray(offset, offset + size) };
}
//# sourceMappingURL=getId3FrameData.js.map
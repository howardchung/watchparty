"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getId3Timestamp = getId3Timestamp;
const getId3Frames_js_1 = require("./getId3Frames.js");
const isId3TimestampFrame_js_1 = require("./isId3TimestampFrame.js");
const readId3Timestamp_js_1 = require("./util/readId3Timestamp.js");
/**
 * Searches for the Elementary Stream timestamp found in the ID3 data chunk
 *
 * @param data - Block of data containing one or more ID3 tags
 *
 * @returns The timestamp
 *
 * @group ID3
 *
 * @beta
 */
function getId3Timestamp(data) {
    const frames = (0, getId3Frames_js_1.getId3Frames)(data);
    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        if ((0, isId3TimestampFrame_js_1.isId3TimestampFrame)(frame)) {
            return (0, readId3Timestamp_js_1.readId3Timestamp)(frame);
        }
    }
    return undefined;
}
//# sourceMappingURL=getId3Timestamp.js.map
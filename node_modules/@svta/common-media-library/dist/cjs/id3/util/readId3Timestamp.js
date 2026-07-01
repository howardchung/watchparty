"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readId3Timestamp = readId3Timestamp;
/**
 * Read a 33 bit timestamp from an ID3 frame.
 *
 * @param timeStampFrame - the ID3 frame
 *
 * @returns The timestamp
 *
 * @internal
 *
 * @group ID3
 */
function readId3Timestamp(timeStampFrame) {
    if (timeStampFrame.data.byteLength === 8) {
        const data = new Uint8Array(timeStampFrame.data);
        // timestamp is 33 bit expressed as a big-endian eight-octet number,
        // with the upper 31 bits set to zero.
        const pts33Bit = data[3] & 0x1;
        let timestamp = (data[4] << 23) + (data[5] << 15) + (data[6] << 7) + data[7];
        timestamp /= 45;
        if (pts33Bit) {
            timestamp += 47721858.84;
        } // 2^32 / 90
        return Math.round(timestamp);
    }
    return undefined;
}
//# sourceMappingURL=readId3Timestamp.js.map
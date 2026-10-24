"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isId3TimestampFrame = isId3TimestampFrame;
/**
 * Returns true if the ID3 frame is an Elementary Stream timestamp frame
 *
 * @param frame - the ID3 frame
 *
 * @returns `true` if the ID3 frame is an Elementary Stream timestamp frame
 *
 * @internal
 *
 * @group ID3
 */
function isId3TimestampFrame(frame) {
    return (frame &&
        frame.key === 'PRIV' &&
        frame.info === 'com.apple.streaming.transportStreamTimestamp');
}
//# sourceMappingURL=isId3TimestampFrame.js.map
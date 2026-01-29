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
export function isId3TimestampFrame(frame) {
    return (frame &&
        frame.key === 'PRIV' &&
        frame.info === 'com.apple.streaming.transportStreamTimestamp');
}
//# sourceMappingURL=isId3TimestampFrame.js.map
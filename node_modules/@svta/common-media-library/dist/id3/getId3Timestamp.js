import { getId3Frames } from './getId3Frames.js';
import { isId3TimestampFrame } from './isId3TimestampFrame.js';
import { readId3Timestamp } from './util/readId3Timestamp.js';
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
export function getId3Timestamp(data) {
    const frames = getId3Frames(data);
    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        if (isId3TimestampFrame(frame)) {
            return readId3Timestamp(frame);
        }
    }
    return undefined;
}
//# sourceMappingURL=getId3Timestamp.js.map
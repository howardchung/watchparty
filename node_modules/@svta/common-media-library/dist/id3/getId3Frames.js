import { decodeId3Frame } from './util/decodeId3Frame.js';
import { getId3FrameData } from './util/getId3FrameData.js';
import { isId3Footer } from './util/isId3Footer.js';
import { isId3Header } from './util/isId3Header.js';
import { readId3Size } from './util/readId3Size.js';
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
export function getId3Frames(id3Data) {
    let offset = 0;
    const frames = [];
    while (isId3Header(id3Data, offset)) {
        const size = readId3Size(id3Data, offset + 6);
        if ((id3Data[offset + 5] >> 6) & 1) {
            // skip extended header
            offset += HEADER_FOOTER_SIZE;
        }
        // skip past ID3 header
        offset += HEADER_FOOTER_SIZE;
        const end = offset + size;
        // loop through frames in the ID3 tag
        while (offset + FRAME_SIZE < end) {
            const frameData = getId3FrameData(id3Data.subarray(offset));
            const frame = decodeId3Frame(frameData);
            if (frame) {
                frames.push(frame);
            }
            // skip frame header and frame data
            offset += frameData.size + HEADER_FOOTER_SIZE;
        }
        if (isId3Footer(id3Data, offset)) {
            offset += HEADER_FOOTER_SIZE;
        }
    }
    return frames;
}
//# sourceMappingURL=getId3Frames.js.map
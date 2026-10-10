import type { Id3Frame } from '../Id3Frame.js';
import type { RawId3Frame } from './RawFrame.js';
/**
 * Decode an ID3 frame.
 *
 * @param frame - the ID3 frame
 *
 * @returns The decoded ID3 frame
 *
 * @internal
 *
 * @group ID3
 */
export declare function decodeId3Frame(frame: RawId3Frame): Id3Frame | undefined;
//# sourceMappingURL=decodeId3Frame.d.ts.map
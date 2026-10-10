import type { DecodedId3Frame } from '../DecodedId3Frame.js';
import type { RawId3Frame } from './RawFrame.js';
/**
 * Decodes an ID3 text frame
 *
 * @param frame - the ID3 text frame
 *
 * @returns The decoded ID3 text frame
 *
 * @internal
 *
 * @group ID3
 */
export declare function decodeId3TextFrame(frame: RawId3Frame): DecodedId3Frame<string> | undefined;
//# sourceMappingURL=decodeId3TextFrame.d.ts.map
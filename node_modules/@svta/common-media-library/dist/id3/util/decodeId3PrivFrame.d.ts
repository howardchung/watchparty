import type { DecodedId3Frame } from '../DecodedId3Frame.js';
import type { RawId3Frame } from './RawFrame.js';
/**
 * Decode an ID3 PRIV frame.
 *
 * @param frame - the ID3 PRIV frame
 *
 * @returns The decoded ID3 PRIV frame
 *
 * @internal
 *
 * @group ID3
 */
export declare function decodeId3PrivFrame(frame: RawId3Frame): DecodedId3Frame<ArrayBuffer> | undefined;
//# sourceMappingURL=decodeId3PrivFrame.d.ts.map
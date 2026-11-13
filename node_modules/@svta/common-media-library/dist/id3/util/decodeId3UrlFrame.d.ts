import type { DecodedId3Frame } from '../DecodedId3Frame.js';
import type { RawId3Frame } from './RawFrame.js';
/**
 * Decode a URL frame
 *
 * @param frame - the ID3 URL frame
 *
 * @returns The decoded ID3 URL frame
 *
 * @internal
 *
 * @group ID3
 */
export declare function decodeId3UrlFrame(frame: RawId3Frame): DecodedId3Frame<string> | undefined;
//# sourceMappingURL=decodeId3UrlFrame.d.ts.map
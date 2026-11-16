import type { DecodedId3Frame } from '../DecodedId3Frame.js';
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
export declare function readId3Timestamp(timeStampFrame: DecodedId3Frame<ArrayBuffer>): number | undefined;
//# sourceMappingURL=readId3Timestamp.d.ts.map
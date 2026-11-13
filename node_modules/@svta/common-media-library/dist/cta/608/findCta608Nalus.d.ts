/**
 * Find CTA-608 NAL units in a video stream
 *
 * @param raw - The DataView to extract the data from
 * @param startPos - The start position of the data
 * @param size - The size of the data
 * @returns The extracted CTA-608 NAL units
 *
 * @group CTA-608
 * @beta
 */
export declare function findCta608Nalus(raw: DataView, startPos: number, size: number): Array<Array<number>>;
//# sourceMappingURL=findCta608Nalus.d.ts.map
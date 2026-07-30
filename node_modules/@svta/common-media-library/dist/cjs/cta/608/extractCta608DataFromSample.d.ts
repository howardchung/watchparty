/**
 * Extracts CEA-608 data from a given sample.
 *
 * @param raw - The DataView with media data
 * @param startPos - The start position within the DataView
 * @param sampleSize - The size of the sample in bytes
 * @returns fieldData array containing field 1 and field 2 data arrays
 *
 * @group CTA-608
 * @beta
 */
export declare function extractCta608DataFromSample(raw: DataView, startPos: number, sampleSize: number): number[][];
//# sourceMappingURL=extractCta608DataFromSample.d.ts.map
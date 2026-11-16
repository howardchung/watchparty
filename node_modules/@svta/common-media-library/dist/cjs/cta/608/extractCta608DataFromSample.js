"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCta608DataFromSample = extractCta608DataFromSample;
const seiHelpers_js_1 = require("./utils/seiHelpers.js");
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
function extractCta608DataFromSample(raw, startPos, sampleSize) {
    let nalSize = 0;
    let nalType = 0;
    const fieldData = [[], []];
    for (let cursor = startPos; cursor < startPos + sampleSize - 5; cursor++) {
        nalSize = raw.getUint32(cursor);
        nalType = raw.getUint8(cursor + 4) & 0x1F;
        // Make sure that we don't go out of bounds
        if (cursor + 5 + nalSize > startPos + sampleSize) {
            break;
        }
        // Only process Supplemental Enhancement Information (SEI) NAL units
        if ((0, seiHelpers_js_1.isSeiNalUnitType)(nalType)) {
            if (cursor + 5 + nalSize <= raw.byteLength) {
                const seiData = (0, seiHelpers_js_1.getSeiData)(raw, cursor + 5, cursor + 5 + nalSize);
                (0, seiHelpers_js_1.parseCta608DataFromSei)(seiData, fieldData);
            }
        }
        // Jump to the next NAL unit
        cursor += nalSize + 3;
    }
    return fieldData;
}
//# sourceMappingURL=extractCta608DataFromSample.js.map
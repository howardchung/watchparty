"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByterange = getByterange;
/**
 * @internal
 *
 * Get byterange from HLS Manifest.
 *
 * @param byteRange - Byterange object containning length and offset
 * @returns string containing the byterange. If byterange is undefined, it returns undefined
 *
 * @group CMAF
 * @alpha
 */
function getByterange(byteRange) {
    if (!byteRange) {
        return '';
    }
    return `${byteRange.length}@${byteRange.offset}`;
}
//# sourceMappingURL=getByterange.js.map
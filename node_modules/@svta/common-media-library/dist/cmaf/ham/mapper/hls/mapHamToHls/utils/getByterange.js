import { AT_SEPARATOR, HYPHEN_MINUS_SEPARATOR, } from '../../../../utils/constants.js';
/**
 * @internal
 *
 * Get the byterange in hls format from ham track.
 *
 * @param track - Track to get the byterange from
 * @returns string containing the byterange in the hls format
 *
 * @group CMAF
 * @alpha
 */
export function getByterange(track) {
    var _a, _b, _c, _d;
    if (track.byteRange) {
        return `BYTERANGE:${track.byteRange.replace(HYPHEN_MINUS_SEPARATOR, AT_SEPARATOR)}\n`;
    }
    else if ((_b = (_a = track.segments) === null || _a === void 0 ? void 0 : _a.at(0)) === null || _b === void 0 ? void 0 : _b.byteRange) {
        return `BYTERANGE:0@${Number((_d = (_c = track.segments.at(0)) === null || _c === void 0 ? void 0 : _c.byteRange) === null || _d === void 0 ? void 0 : _d.replace(HYPHEN_MINUS_SEPARATOR, AT_SEPARATOR).split(AT_SEPARATOR)[0]) - 1}\n`;
    }
    return '';
}
//# sourceMappingURL=getByterange.js.map
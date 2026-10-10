"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSegments = getSegments;
const constants_js_1 = require("../../../../utils/constants.js");
/**
 * @internal
 *
 * Format the ham segments to hls.
 *
 * @param segments - Segments to be formatted
 * @returns string containing the segments in the hls format
 *
 * @group CMAF
 * @alpha
 */
function getSegments(segments) {
    return segments
        .map((segment) => {
        const byteRange = segment.byteRange
            ? `#EXT-X-BYTERANGE:${segment.byteRange.replace(constants_js_1.HYPHEN_MINUS_SEPARATOR, constants_js_1.AT_SEPARATOR)}\n`
            : '';
        const url = segment.url.replaceAll(constants_js_1.WHITE_SPACE, constants_js_1.WHITE_SPACE_ENCODED);
        return `#EXTINF:${segment.duration},\n${byteRange}\n${url}`;
    })
        .join('\n');
}
//# sourceMappingURL=getSegments.js.map
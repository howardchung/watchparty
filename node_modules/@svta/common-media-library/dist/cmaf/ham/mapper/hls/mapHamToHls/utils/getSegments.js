import { AT_SEPARATOR, HYPHEN_MINUS_SEPARATOR, WHITE_SPACE, WHITE_SPACE_ENCODED, } from '../../../../utils/constants.js';
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
export function getSegments(segments) {
    return segments
        .map((segment) => {
        const byteRange = segment.byteRange
            ? `#EXT-X-BYTERANGE:${segment.byteRange.replace(HYPHEN_MINUS_SEPARATOR, AT_SEPARATOR)}\n`
            : '';
        const url = segment.url.replaceAll(WHITE_SPACE, WHITE_SPACE_ENCODED);
        return `#EXTINF:${segment.duration},\n${byteRange}\n${url}`;
    })
        .join('\n');
}
//# sourceMappingURL=getSegments.js.map
import { getByterange } from './getByterange.js';
/**
 * @internal
 *
 * Format the hls segments into the ham segments.
 *
 * @param segments - List of HLS segments
 * @returns ham formatted list of segments
 *
 * @group CMAF
 * @alpha
 */
export function formatSegments(segments) {
    var _a;
    return ((_a = segments === null || segments === void 0 ? void 0 : segments.map((segment) => {
        const byteRange = getByterange(segment === null || segment === void 0 ? void 0 : segment.byterange);
        return {
            duration: segment.duration,
            url: segment.uri,
            ...(byteRange && { byteRange }),
        };
    })) !== null && _a !== void 0 ? _a : []);
}
//# sourceMappingURL=formatSegments.js.map
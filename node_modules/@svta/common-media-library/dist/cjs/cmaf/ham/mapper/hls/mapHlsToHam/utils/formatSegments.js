"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatSegments = formatSegments;
const getByterange_js_1 = require("./getByterange.js");
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
function formatSegments(segments) {
    var _a;
    return ((_a = segments === null || segments === void 0 ? void 0 : segments.map((segment) => {
        const byteRange = (0, getByterange_js_1.getByterange)(segment === null || segment === void 0 ? void 0 : segment.byterange);
        return {
            duration: segment.duration,
            url: segment.uri,
            ...(byteRange && { byteRange }),
        };
    })) !== null && _a !== void 0 ? _a : []);
}
//# sourceMappingURL=formatSegments.js.map
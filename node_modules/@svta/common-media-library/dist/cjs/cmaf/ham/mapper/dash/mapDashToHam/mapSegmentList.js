"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSegmentList = mapSegmentList;
const calculateDuration_js_1 = require("./utils/calculateDuration.js");
/**
 * @internal
 *
 * Maps SegmentList from dash to Segment list from ham.
 *
 * @param segmentList - SegmentList list from dash
 * @returns list of ham segments
 */
function mapSegmentList(segmentList) {
    const segments = [];
    segmentList.map((segment) => {
        if (segment.SegmentURL) {
            return segment.SegmentURL.forEach((segmentURL) => {
                var _a;
                segments.push({
                    duration: (0, calculateDuration_js_1.calculateDuration)(segment.$.duration, segment.$.timescale),
                    url: (_a = segmentURL.$.media) !== null && _a !== void 0 ? _a : '',
                });
            });
        }
    });
    return segments;
}
//# sourceMappingURL=mapSegmentList.js.map
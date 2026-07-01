"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNumberOfSegments = getNumberOfSegments;
const calculateDuration_js_1 = require("./calculateDuration.js");
/**
 * @internal
 *
 * Calculates the number of segments that a track has to use SegmentTemplate.
 *
 * Equation used:
 * segments = total duration / (segment duration / timescale)
 *
 * **This equation might be wrong, please double-check it**
 *
 * @param segmentTemplate - SegmentTemplate object
 * @param duration - Total duration of the content
 * @returns Number of segments
 */
function getNumberOfSegments(segmentTemplate, duration) {
    // FIXME: This equation may be wrong
    return Math.round(duration /
        (0, calculateDuration_js_1.calculateDuration)(segmentTemplate.$.duration, segmentTemplate.$.timescale));
}
//# sourceMappingURL=getNumberOfSegments.js.map
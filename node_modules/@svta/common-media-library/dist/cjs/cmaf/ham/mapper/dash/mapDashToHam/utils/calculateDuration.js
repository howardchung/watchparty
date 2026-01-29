"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDuration = calculateDuration;
/**
 * @internal
 *
 * Calculates the duration of a segment.
 *
 * segmentDuration = duration / timescale
 *
 * @param duration - Duration of the segment
 * @param timescale - Timescale of the segment
 * @returns Segment duration
 */
function calculateDuration(duration, timescale) {
    if (!duration || !timescale) {
        return 1;
    }
    return +(duration !== null && duration !== void 0 ? duration : 1) / +(timescale !== null && timescale !== void 0 ? timescale : 1);
}
//# sourceMappingURL=calculateDuration.js.map
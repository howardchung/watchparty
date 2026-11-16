/**
 * @internal
 *
 * Maps SegmentBase from dash to Segment list from ham.
 *
 * @param representation - Representation to get the SegmentBase from
 * @param duration - Duration of the segment
 * @returns list of ham segments
 */
export function mapSegmentBase(representation, duration) {
    return representation.SegmentBase.map((segment) => {
        var _a;
        return {
            duration,
            url: (_a = representation.BaseURL[0]) !== null && _a !== void 0 ? _a : '',
            byteRange: segment.$.indexRange,
        };
    });
}
//# sourceMappingURL=mapSegmentBase.js.map
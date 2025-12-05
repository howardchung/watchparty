import { calculateDuration } from './utils/calculateDuration.js';
import { getNumberOfSegments } from './utils/getNumberOfSegments.js';
import { getUrlFromTemplate } from './utils/getUrlFromTemplate.js';
/**
 * @internal
 *
 * Maps SegmentTemplate from dash to Segment list from ham.
 *
 * @param representation - Representation to generate the urls
 * @param duration - Duration of the segments
 * @param segmentTemplate - SegmentTemplate to get the properties from
 * @returns list of ham segments
 */
export function mapSegmentTemplate(representation, duration, segmentTemplate) {
    var _a;
    const numberOfSegments = getNumberOfSegments(segmentTemplate, duration);
    const init = +((_a = segmentTemplate.$.startNumber) !== null && _a !== void 0 ? _a : 0);
    const segments = [];
    for (let id = init; id < numberOfSegments + init; id++) {
        segments.push({
            duration: calculateDuration(segmentTemplate.$.duration, segmentTemplate.$.timescale),
            url: getUrlFromTemplate(representation, segmentTemplate, id),
        });
    }
    return segments;
}
//# sourceMappingURL=mapSegmentTemplate.js.map
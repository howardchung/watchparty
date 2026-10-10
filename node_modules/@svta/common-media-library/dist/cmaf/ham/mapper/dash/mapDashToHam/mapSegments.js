import { mapSegmentBase } from './mapSegmentBase.js';
import { mapSegmentList } from './mapSegmentList.js';
import { mapSegmentTemplate } from './mapSegmentTemplate.js';
/**
 * @internal
 *
 * Maps dash segments to ham segment.
 *
 * Checks the type of dash segments used to map them accordingly.
 * @see mapSegmentBase
 * @see mapSegmentList
 * @see mapSegmentTemplate
 *
 * @param adaptationSet - AdaptationSet to get the segments from
 * @param representation - Representation to get the segments from
 * @param duration - Duration of the segments
 * @returns list of ham segments
 */
export function mapSegments(adaptationSet, representation, duration) {
    var _a, _b, _c, _d;
    const segmentTemplate = (_b = (_a = adaptationSet.SegmentTemplate) === null || _a === void 0 ? void 0 : _a.at(0)) !== null && _b !== void 0 ? _b : (_c = representation.SegmentTemplate) === null || _c === void 0 ? void 0 : _c.at(0);
    const segmentList = (_d = adaptationSet.SegmentList) !== null && _d !== void 0 ? _d : representation.SegmentList;
    if (representation.SegmentBase) {
        return mapSegmentBase(representation, duration);
    }
    else if (segmentList) {
        return mapSegmentList(segmentList);
    }
    else if (segmentTemplate) {
        return mapSegmentTemplate(representation, duration, segmentTemplate);
    }
    else {
        console.error(`Representation ${representation.$.id} has no segments`);
        return [];
    }
}
//# sourceMappingURL=mapSegments.js.map
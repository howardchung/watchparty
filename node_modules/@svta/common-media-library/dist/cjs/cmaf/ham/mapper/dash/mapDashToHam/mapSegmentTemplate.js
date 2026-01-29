"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSegmentTemplate = mapSegmentTemplate;
const calculateDuration_js_1 = require("./utils/calculateDuration.js");
const getNumberOfSegments_js_1 = require("./utils/getNumberOfSegments.js");
const getUrlFromTemplate_js_1 = require("./utils/getUrlFromTemplate.js");
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
function mapSegmentTemplate(representation, duration, segmentTemplate) {
    var _a;
    const numberOfSegments = (0, getNumberOfSegments_js_1.getNumberOfSegments)(segmentTemplate, duration);
    const init = +((_a = segmentTemplate.$.startNumber) !== null && _a !== void 0 ? _a : 0);
    const segments = [];
    for (let id = init; id < numberOfSegments + init; id++) {
        segments.push({
            duration: (0, calculateDuration_js_1.calculateDuration)(segmentTemplate.$.duration, segmentTemplate.$.timescale),
            url: (0, getUrlFromTemplate_js_1.getUrlFromTemplate)(representation, segmentTemplate, id),
        });
    }
    return segments;
}
//# sourceMappingURL=mapSegmentTemplate.js.map
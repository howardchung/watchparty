"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUrlFromTemplate = getUrlFromTemplate;
/**
 * @internal
 *
 * Create the url from a segment template.
 *
 * Searches for substrings with the format `$value$` and replaces it with the correct value.
 * - RepresentationID: id of the representation
 * - Number: id of the segment. `%0Xd` defines the number `X` of digits it needs to have
 *
 * @param representation - Representation of the template
 * @param segmentTemplate - Segment template
 * @param segmentId - Segment id
 * @returns url from the segment template
 */
function getUrlFromTemplate(representation, segmentTemplate, segmentId) {
    const regexTemplate = /\$(.*?)\$/g;
    return segmentTemplate.$.media.replace(regexTemplate, (match) => {
        if (match.includes('RepresentationID')) {
            return representation.$.id;
        }
        /**
         * Number with 4 digits e.g: 0001
         */
        if (match.includes('Number%04d')) {
            return segmentId.toString().padStart(4, '0');
        }
        if (match.includes('Number')) {
            return segmentId;
        }
        console.error(`Unknown property ${match} from the SegmentTemplate on representation ${representation.$.id}`);
        return match;
    });
}
//# sourceMappingURL=getUrlFromTemplate.js.map
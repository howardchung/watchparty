"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSegments = validateSegments;
const validateSegment_js_1 = require("./validateSegment.js");
/**
 * Validate a list of segments.
 *
 * @example
 * ```ts
 * import cmaf, { Segment } from '@svta/common-media-library/cmaf-ham';
 * ...
 *
 * // const segments: Segment[] = ...;
 *
 * const validation = cmaf.validateSegments(segments);
 * ```
 *
 * Example output: `{ status: true|false, errorMessages: [...] }`
 *
 * @param segments - List of Segment from cmaf ham model
 * @param trackId - Optional: parent track id
 * @param prevValidation - Optional: validation object from parent previous validate method call
 * @returns Validation
 *
 * @group CMAF
 * @alpha
 *
 */
function validateSegments(segments, trackId, prevValidation) {
    const validation = prevValidation !== null && prevValidation !== void 0 ? prevValidation : {
        status: true,
        errorMessages: [],
    };
    segments.forEach((segment) => {
        (0, validateSegment_js_1.validateSegment)(segment, trackId, validation);
    });
    return validation;
}
//# sourceMappingURL=validateSegments.js.map
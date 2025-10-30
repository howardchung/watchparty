/**
 * Validate a segment.
 *
 * Validations:
 * - segment has duration
 * - segment has url
 *
 * @param segment - Segment from cmaf ham model
 * @param trackId - Optional: parent track id
 * @param prevValidation - Optional: validation object from parent previous validate method call
 * @returns Validation
 *
 * @group CMAF
 * @alpha
 */
export function validateSegment(segment, trackId, prevValidation) {
    const validation = prevValidation !== null && prevValidation !== void 0 ? prevValidation : {
        status: true,
        errorMessages: [],
    };
    const moreInformation = trackId
        ? ` in the track with id = ${trackId}`
        : '.';
    if (!segment.duration) {
        validation.status = false;
        validation.errorMessages.push(`Segment duration is undefined${moreInformation}`);
    }
    if (!segment.url) {
        validation.status = false;
        validation.errorMessages.push(`Segment url is undefined${moreInformation}`);
    }
    return validation;
}
//# sourceMappingURL=validateSegment.js.map
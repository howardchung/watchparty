"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePresentation = validatePresentation;
const validateSelectionSets_js_1 = require("./validateSelectionSets.js");
/**
 * Validate a presentation.
 * It validates in cascade, calling each child validation method.
 *
 * Validations:
 * - Presentation has id
 *
 * @example
 * ```ts
 * import cmaf, { Presentation } from '@svta/common-media-library/cmaf-ham';
 * ...
 *
 * // const presentation: Presentation = ...;
 *
 * const validation = cmaf.validatePresentation(presentation);
 * ```
 *
 * Example output: `{ status: true|false, errorMessages: [...] }`
 *
 * @param presentation - Presentation from cmaf ham model
 * @returns Validation
 *
 * @group CMAF
 * @alpha
 *
 */
function validatePresentation(presentation) {
    const validation = { status: true, errorMessages: [] };
    if (!presentation.id) {
        validation.status = false;
        validation.errorMessages.push('Presentation id is undefined');
    }
    (0, validateSelectionSets_js_1.validateSelectionSets)(presentation.selectionSets, presentation.id, validation);
    return validation;
}
//# sourceMappingURL=validatePresentation.js.map
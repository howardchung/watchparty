"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSelectionSets = validateSelectionSets;
const validateSelectionSet_js_1 = require("./validateSelectionSet.js");
/**
 * Validate a list of selection set.
 * It validates in cascade, calling each child validation method.
 *
 * @example
 * ```ts
 * import cmaf, { SelectionSet } from '@svta/common-media-library/cmaf-ham';
 * ...
 *
 * // const selectionSets: SelectionSet[] = ...;
 *
 * const validation = cmaf.validateSelectionSets(selectionSets);
 * ```
 *
 * Example output: `{ status: true|false, errorMessages: [...] }`
 *
 * @param selectionSets - List of SelectionSet from cmaf ham model
 * @param presentationId - Optional: parent presentation id
 * @param prevValidation - Optional: validation object from parent previous validate method call
 * @returns Validation
 *
 * @group CMAF
 * @alpha
 *
 */
function validateSelectionSets(selectionSets, presentationId, prevValidation) {
    const validation = prevValidation !== null && prevValidation !== void 0 ? prevValidation : {
        status: true,
        errorMessages: [],
    };
    selectionSets.forEach((selectionSet) => {
        (0, validateSelectionSet_js_1.validateSelectionSet)(selectionSet, presentationId, validation);
    });
    return validation;
}
//# sourceMappingURL=validateSelectionSets.js.map
import { validateSwitchingSets } from './validateSwitchingSets.js';
/**
 * Validate a selection set.
 * It validates in cascade, calling each child validation method.
 *
 * Validations:
 * - SelectionSet has id
 *
 * @example
 * ```ts
 * import cmaf, { SelectionSet } from '@svta/common-media-library/cmaf-ham';
 * ...
 *
 * // const selectionSet: SelectionSet = ...;
 *
 * const validation = cmaf.validateSelectionSet(selectionSet);
 * ```
 *
 * Example output: `{ status: true|false, errorMessages: [...] }`
 *
 * @param selectionSet - SelectionSet from cmaf ham model
 * @param presentationId - Optional: parent presentation id
 * @param prevValidation - Optional: validation object from parent previous validate method call
 * @returns Validation
 *
 * @group CMAF
 * @alpha
 *
 */
export function validateSelectionSet(selectionSet, presentationId, prevValidation) {
    const validation = prevValidation !== null && prevValidation !== void 0 ? prevValidation : {
        status: true,
        errorMessages: [],
    };
    const moreInformation = presentationId
        ? ` in the presentation with id = ${presentationId}`
        : '.';
    if (!selectionSet.id) {
        validation.status = false;
        validation.errorMessages.push(`SelectionSet id is undefined${moreInformation}`);
    }
    validateSwitchingSets(selectionSet.switchingSets, selectionSet.id, validation);
    return validation;
}
//# sourceMappingURL=validateSelectionSet.js.map
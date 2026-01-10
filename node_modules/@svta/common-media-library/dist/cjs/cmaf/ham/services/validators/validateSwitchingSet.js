"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSwitchingSet = validateSwitchingSet;
const validateTracks_js_1 = require("./validateTracks.js");
/**
 * Validate a switching set.
 * It validates in cascade, calling each child validation method.
 *
 * Validations:
 * - SwitchingSet has id
 *
 * @example
 * ```ts
 * import cmaf, { SwitchingSet } from '@svta/common-media-library/cmaf-ham';
 * ...
 *
 * // const switchingSet: SwitchingSet = ...;
 *
 * const validation = cmaf.validateSwitchingSet(switchingSet);
 * ```
 *
 * Example output: `{ status: true|false, errorMessages: [...] }`
 *
 * @param switchingSet - SwitchingSet from cmaf ham model
 * @param selectionSetId - Optional: parent selection set id
 * @param prevValidation - Optional: validation object from parent previous validate method call
 * @returns Validation
 *
 * @group CMAF
 * @alpha
 *
 */
function validateSwitchingSet(switchingSet, selectionSetId, prevValidation) {
    const validation = prevValidation !== null && prevValidation !== void 0 ? prevValidation : {
        status: true,
        errorMessages: [],
    };
    const moreInformation = selectionSetId
        ? ` in the selection set with id = ${selectionSetId}`
        : '.';
    if (!switchingSet.id) {
        validation.status = false;
        validation.errorMessages.push(`SwitchingSet id is undefined${moreInformation}`);
    }
    (0, validateTracks_js_1.validateTracks)(switchingSet.tracks, switchingSet.id, validation);
    return validation;
}
//# sourceMappingURL=validateSwitchingSet.js.map
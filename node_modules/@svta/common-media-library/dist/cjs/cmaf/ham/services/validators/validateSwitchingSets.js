"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSwitchingSets = validateSwitchingSets;
const validateSwitchingSet_js_1 = require("./validateSwitchingSet.js");
/**
 * Validate a list of switching set.
 * It validates in cascade, calling each child validation method.
 *
 * @example
 * ```ts
 * import cmaf, { SwitchingSet } from '@svta/common-media-library/cmaf-ham';
 * ...
 *
 * // const switchingSets: SwitchingSet[] = ...;
 *
 * const validation = cmaf.validateSwitchingSets(switchingSets);
 * ```
 *
 * Example output: `{ status: true|false, errorMessages: [...] }`
 *
 * @param switchingSets - List of SwitchingSets from cmaf ham model
 * @param selectionSetId - Optional: parent selection set id
 * @param prevValidation - Optional: validation object from parent previous validate method call
 * @returns Validation
 *
 * @group CMAF
 * @alpha
 *
 */
function validateSwitchingSets(switchingSets, selectionSetId, prevValidation) {
    const validation = prevValidation !== null && prevValidation !== void 0 ? prevValidation : {
        status: true,
        errorMessages: [],
    };
    switchingSets.forEach((switchingSet) => {
        (0, validateSwitchingSet_js_1.validateSwitchingSet)(switchingSet, selectionSetId, validation);
    });
    return validation;
}
//# sourceMappingURL=validateSwitchingSets.js.map
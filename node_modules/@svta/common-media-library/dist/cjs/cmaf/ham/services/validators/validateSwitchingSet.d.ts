import type { SwitchingSet } from '../../types/model/SwitchingSet.js';
import type { Validation } from '../../types/Validation.js';
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
export declare function validateSwitchingSet(switchingSet: SwitchingSet, selectionSetId?: string, prevValidation?: Validation): Validation;
//# sourceMappingURL=validateSwitchingSet.d.ts.map
import type { SwitchingSet } from '../../types/model/SwitchingSet.js';
import type { Validation } from '../../types/Validation.js';
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
export declare function validateSwitchingSets(switchingSets: SwitchingSet[], selectionSetId?: string, prevValidation?: Validation): Validation;
//# sourceMappingURL=validateSwitchingSets.d.ts.map
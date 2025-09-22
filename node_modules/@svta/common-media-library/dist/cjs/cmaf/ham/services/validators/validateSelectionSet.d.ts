import type { SelectionSet } from '../../types/model/SelectionSet.js';
import type { Validation } from '../../types/Validation.js';
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
export declare function validateSelectionSet(selectionSet: SelectionSet, presentationId?: string, prevValidation?: Validation): Validation;
//# sourceMappingURL=validateSelectionSet.d.ts.map
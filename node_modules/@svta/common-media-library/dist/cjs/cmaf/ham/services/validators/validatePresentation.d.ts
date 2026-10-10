import type { Validation } from '../../types/Validation.js';
import type { Presentation } from '../../types/model/Presentation.js';
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
export declare function validatePresentation(presentation: Presentation): Validation;
//# sourceMappingURL=validatePresentation.d.ts.map
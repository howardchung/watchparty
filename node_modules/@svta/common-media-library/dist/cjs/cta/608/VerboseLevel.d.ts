import type { ValueOf } from '../../utils/ValueOf.js';
/**
 * Logging levels for the CTA-608 parser.
 *
 * @group CTA-608
 *
 * @enum
 *
 * @beta
 */
export declare const VerboseLevel: {
    readonly ERROR: 0;
    readonly TEXT: 1;
    readonly WARNING: 2;
    readonly INFO: 2;
    readonly DEBUG: 3;
    readonly DATA: 3;
};
/**
 * @beta
 */
export type VerboseLevel = ValueOf<typeof VerboseLevel>;
//# sourceMappingURL=VerboseLevel.d.ts.map
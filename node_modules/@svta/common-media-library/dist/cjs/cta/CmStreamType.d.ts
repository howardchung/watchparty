import type { ValueOf } from '../utils/ValueOf.js';
/**
 * Common Media Stream Type
 *
 * @internal
 */
export declare const CmStreamType: {
    /**
     *  All segments are available – e.g., VOD
     */
    readonly VOD: "v";
    /**
     * Segments become available over time – e.g., LIVE
     */
    readonly LIVE: "l";
};
/**
 * Common Media Stream Type
 *
 * @internal
 * @see {@link CmcdEncoding}
 */
export type CmStreamType = ValueOf<typeof CmStreamType>;
//# sourceMappingURL=CmStreamType.d.ts.map
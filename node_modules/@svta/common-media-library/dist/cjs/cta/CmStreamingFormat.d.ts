import type { ValueOf } from '../utils/ValueOf.js';
/**
 * Common Media Streaming Format
 *
 * @internal
 */
export declare const CmStreamingFormat: {
    /**
     * MPEG DASH
     */
    readonly DASH: "d";
    /**
     * HTTP Live Streaming (HLS)
     */
    readonly HLS: "h";
    /**
     * Smooth Streaming
     */
    readonly SMOOTH: "s";
    /**
     * Other
     */
    readonly OTHER: "o";
};
/**
 * Common Media Streaming Format
 *
 * @see {@link CmcdEncoding}
 * @internal
 */
export type CmStreamingFormat = ValueOf<typeof CmStreamingFormat>;
//# sourceMappingURL=CmStreamingFormat.d.ts.map
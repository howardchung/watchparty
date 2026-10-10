import type { ValueOf } from '../utils/ValueOf.js';
/**
 * Common Media Object Type
 *
 * @internal
 */
export declare const CmObjectType: {
    /**
     * text file, such as a manifest or playlist
     */
    readonly MANIFEST: "m";
    /**
     * audio only
     */
    readonly AUDIO: "a";
    /**
     * video only
     */
    readonly VIDEO: "v";
    /**
     * muxed audio and video
     */
    readonly MUXED: "av";
    /**
     * init segment
     */
    readonly INIT: "i";
    /**
     * caption or subtitle
     */
    readonly CAPTION: "c";
    /**
     * ISOBMFF timed text track
     */
    readonly TIMED_TEXT: "tt";
    /**
     * cryptographic key, license or certificate.
     */
    readonly KEY: "k";
    /**
     * other
     */
    readonly OTHER: "o";
};
/**
 * Common Media Object Type
 *
 * @see {@link CmcdEncoding}
 * @internal
 */
export type CmObjectType = ValueOf<typeof CmObjectType>;
//# sourceMappingURL=CmObjectType.d.ts.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmObjectType = void 0;
/**
 * Common Media Object Type
 *
 * @internal
 */
exports.CmObjectType = {
    /**
     * text file, such as a manifest or playlist
     */
    MANIFEST: 'm',
    /**
     * audio only
     */
    AUDIO: 'a',
    /**
     * video only
     */
    VIDEO: 'v',
    /**
     * muxed audio and video
     */
    MUXED: 'av',
    /**
     * init segment
     */
    INIT: 'i',
    /**
     * caption or subtitle
     */
    CAPTION: 'c',
    /**
     * ISOBMFF timed text track
     */
    TIMED_TEXT: 'tt',
    /**
     * cryptographic key, license or certificate.
     */
    KEY: 'k',
    /**
     * other
     */
    OTHER: 'o',
};
//# sourceMappingURL=CmObjectType.js.map
/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
export declare const buildIsobmffMimeType: (info: {
    isQuickTime: boolean;
    hasVideo: boolean;
    hasAudio: boolean;
    codecStrings: string[];
}) => string;
/**
 * Represents a Protection System Specific Header box as used by ISOBMFF Common Encryption. Contains
 * DRM system-specific data that can be used to obtain a decryption key.
 *
 * @group Miscellaneous
 * @public
 */
export type PsshBox = {
    /** The system ID as a 32-bit lowercase hex string. */
    systemId: string;
    /**
     * The list of key IDs (32-bit lowercase hex strings) this box applies to, or `null` if it applies to all key IDs.
     */
    keyIds: string[] | null;
    /** The content protection system-specific data. */
    data: Uint8Array;
};
export declare const parsePsshBoxContents: (contents: Uint8Array) => PsshBox;
export declare const psshBoxesAreEqual: (a: PsshBox, b: PsshBox) => boolean;
//# sourceMappingURL=isobmff-misc.d.ts.map
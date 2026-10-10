/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
export declare const OGGS = 1399285583;
export declare const computeOggPageCrc: (bytes: Uint8Array) => number;
export type OggCodecInfo = {
    codec: 'vorbis' | 'opus' | null;
    vorbisInfo: {
        blocksizes: number[];
        modeBlockflags: number[];
    } | null;
    opusInfo: {
        preSkip: number;
    } | null;
};
export declare const extractSampleMetadata: (data: Uint8Array, codecInfo: OggCodecInfo, vorbisLastBlocksize: number | null) => {
    durationInSamples: number;
    vorbisBlockSize: number | null;
};
export declare const buildOggMimeType: (info: {
    codecStrings: string[];
}) => string;
//# sourceMappingURL=ogg-misc.d.ts.map
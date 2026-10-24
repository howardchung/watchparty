/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { FileSlice } from '../reader.js';
export declare const MIN_ADTS_FRAME_HEADER_SIZE = 7;
export declare const MAX_ADTS_FRAME_HEADER_SIZE = 9;
export type AdtsFrameHeader = {
    objectType: number;
    samplingFrequencyIndex: number;
    channelConfiguration: number;
    frameLength: number;
    numberOfAacFrames: number;
    crcCheck: number | null;
    startPos: number;
};
export declare const readAdtsFrameHeader: (slice: FileSlice) => AdtsFrameHeader | null;
//# sourceMappingURL=adts-reader.d.ts.map
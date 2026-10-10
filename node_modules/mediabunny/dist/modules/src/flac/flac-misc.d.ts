/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { FileSlice } from '../reader.js';
type BlockSizeOrUncommon = number | 'uncommon-u16' | 'uncommon-u8';
type SampleRateOrUncommon = number | 'uncommon-u8' | 'uncommon-u16' | 'uncommon-u16-10';
export declare const getBlockSizeOrUncommon: (bits: number) => BlockSizeOrUncommon | null;
export declare const getSampleRateOrUncommon: (sampleRateBits: number, streamInfoSampleRate: number) => SampleRateOrUncommon | null;
export declare const readCodedNumber: (fileSlice: FileSlice) => number;
export declare const readBlockSize: (slice: FileSlice, blockSizeBits: BlockSizeOrUncommon) => number;
export declare const readSampleRate: (slice: FileSlice, sampleRateOrUncommon: SampleRateOrUncommon) => number | null;
export declare const calculateCrc8: (data: Uint8Array) => number;
export {};
//# sourceMappingURL=flac-misc.d.ts.map
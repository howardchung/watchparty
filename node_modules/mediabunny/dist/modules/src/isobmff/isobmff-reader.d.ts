/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { RichImageData } from '../metadata.js';
import { FileSlice } from '../reader.js';
export declare const MIN_BOX_HEADER_SIZE = 8;
export declare const MAX_BOX_HEADER_SIZE = 16;
export declare const readBoxHeader: (slice: FileSlice) => {
    name: string;
    totalSize: number;
    headerSize: number;
    contentSize: number;
} | null;
export declare const readFixed_16_16: (slice: FileSlice) => number;
export declare const readFixed_2_30: (slice: FileSlice) => number;
export declare const readIsomVariableInteger: (slice: FileSlice) => number;
export declare const readMetadataStringShort: (slice: FileSlice) => string;
export declare const readDataBox: (slice: FileSlice) => string | Uint8Array<ArrayBufferLike> | RichImageData | null;
//# sourceMappingURL=isobmff-reader.d.ts.map
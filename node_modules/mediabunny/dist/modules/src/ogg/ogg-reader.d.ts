/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { FileSlice } from '../reader.js';
export declare const MIN_PAGE_HEADER_SIZE = 27;
export declare const MAX_PAGE_HEADER_SIZE: number;
export declare const MAX_PAGE_SIZE: number;
export type Page = {
    headerStartPos: number;
    totalSize: number;
    dataStartPos: number;
    dataSize: number;
    headerType: number;
    granulePosition: number;
    serialNumber: number;
    sequenceNumber: number;
    checksum: number;
    lacingValues: Uint8Array;
};
export declare const readPageHeader: (slice: FileSlice) => Page | null;
export declare const findNextPageHeader: (slice: FileSlice, until: number) => boolean;
//# sourceMappingURL=ogg-reader.d.ts.map
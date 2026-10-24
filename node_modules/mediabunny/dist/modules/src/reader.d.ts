/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { MaybePromise } from './misc.js';
import { Source } from './source.js';
export declare class Reader {
    source: Source;
    constructor(source: Source);
    get fileSize(): number | null;
    get fileSizeNonStrict(): number | null;
    requestSlice(start: number, length: number): MaybePromise<FileSlice | null>;
    requestSliceRange(start: number, minLength: number, maxLength: number): MaybePromise<FileSlice | null>;
    requestEntireFile(): MaybePromise<FileSlice | null>;
}
export declare class FileSlice {
    /** The underlying bytes backing this slice. Avoid using this directly and prefer reader functions instead. */
    readonly bytes: Uint8Array;
    /** A view into the bytes backing this slice. Avoid using this directly and prefer reader functions instead. */
    readonly view: DataView;
    /** The offset in "file bytes" at which `bytes` begins in the file. */
    private readonly offset;
    /** The offset in "file bytes" where this slice begins. */
    readonly start: number;
    /** The offset in "file bytes" where this slice ends (exclusive). */
    readonly end: number;
    /** The current position in the backing buffer. Do not modify directly, prefer `.skip()` instead. */
    bufferPos: number;
    constructor(
    /** The underlying bytes backing this slice. Avoid using this directly and prefer reader functions instead. */
    bytes: Uint8Array, 
    /** A view into the bytes backing this slice. Avoid using this directly and prefer reader functions instead. */
    view: DataView, 
    /** The offset in "file bytes" at which `bytes` begins in the file. */
    offset: number, 
    /** The offset in "file bytes" where this slice begins. */
    start: number, 
    /** The offset in "file bytes" where this slice ends (exclusive). */
    end: number);
    static tempFromBytes(bytes: Uint8Array): FileSlice;
    get length(): number;
    get filePos(): number;
    set filePos(value: number);
    /** The number of bytes left from the current pos to the end of the slice. */
    get remainingLength(): number;
    skip(byteCount: number): void;
    /** Creates a new subslice of this slice whose byte range must be contained within this slice. */
    slice(filePos: number, length?: number): FileSlice;
}
export declare const readBytes: (slice: FileSlice, length: number) => Uint8Array<ArrayBufferLike>;
export declare const readU8: (slice: FileSlice) => number;
export declare const readU16: (slice: FileSlice, littleEndian: boolean) => number;
export declare const readU16Be: (slice: FileSlice) => number;
export declare const readU24Be: (slice: FileSlice) => number;
export declare const readI16Be: (slice: FileSlice) => number;
export declare const readU32: (slice: FileSlice, littleEndian: boolean) => number;
export declare const readU32Be: (slice: FileSlice) => number;
export declare const readU32Le: (slice: FileSlice) => number;
export declare const readI32Be: (slice: FileSlice) => number;
export declare const readI32Le: (slice: FileSlice) => number;
export declare const readU64: (slice: FileSlice, littleEndian: boolean) => number;
export declare const readU64Be: (slice: FileSlice) => number;
export declare const readI64Be: (slice: FileSlice) => number;
export declare const readI64Le: (slice: FileSlice) => number;
export declare const readF32Be: (slice: FileSlice) => number;
export declare const readF64Be: (slice: FileSlice) => number;
export declare const readAscii: (slice: FileSlice, length: number) => string;
export declare const readAllLines: (slice: FileSlice, length: number, options?: {
    ignore?: (line: string) => boolean;
}) => string[];
//# sourceMappingURL=reader.d.ts.map
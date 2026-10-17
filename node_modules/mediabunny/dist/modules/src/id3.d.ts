/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { MetadataTags } from './metadata.js';
import { FileSlice } from './reader.js';
import { Writer } from './writer.js';
export type Id3V2Header = {
    majorVersion: number;
    revision: number;
    flags: number;
    size: number;
};
export declare enum Id3V2HeaderFlags {
    Unsynchronisation = 128,
    ExtendedHeader = 64,
    ExperimentalIndicator = 32,
    Footer = 16
}
export declare enum Id3V2TextEncoding {
    ISO_8859_1 = 0,
    UTF_16_WITH_BOM = 1,
    UTF_16_BE_NO_BOM = 2,
    UTF_8 = 3
}
export declare const ID3_V1_TAG_SIZE = 128;
export declare const ID3_V2_HEADER_SIZE = 10;
export declare const ID3_V1_GENRES: string[];
export declare const parseId3V1Tag: (slice: FileSlice, tags: MetadataTags) => void;
export declare const readId3V1String: (slice: FileSlice, length: number) => string;
export declare const readId3V2Header: (slice: FileSlice) => Id3V2Header | null;
export declare const parseId3V2Tag: (slice: FileSlice, header: Id3V2Header, tags: MetadataTags) => void;
export declare class Id3V2Reader {
    header: Id3V2Header;
    bytes: Uint8Array;
    pos: number;
    view: DataView;
    constructor(header: Id3V2Header, bytes: Uint8Array);
    frameHeaderSize(): 6 | 10;
    ununsynchronizeAll(): void;
    ununsynchronizeRegion(start: number, end: number): void;
    readBytes(length: number): Uint8Array<ArrayBufferLike>;
    readU8(): number;
    readU16(): number;
    readU24(): number;
    readU32(): number;
    readAscii(length: number): string;
    readId3V2Frame(): {
        id: string;
        size: number;
        flags: number;
    } | null;
    readId3V2TextEncoding(): Id3V2TextEncoding;
    readId3V2Text(encoding: Id3V2TextEncoding, until: number): string;
    readId3V2EncodingAndText(until: number): string;
}
export declare class Id3V2Writer {
    writer: Writer;
    helper: Uint8Array<ArrayBuffer>;
    helperView: DataView<ArrayBufferLike>;
    constructor(writer: Writer);
    writeId3V2Tag(metadata: MetadataTags): number;
    writeU8(value: number): void;
    writeU16(value: number): void;
    writeU32(value: number): void;
    writeAscii(text: string): void;
    writeSynchsafeU32(value: number): void;
    writeIsoString(text: string): void;
    writeUtf8String(text: string): void;
    writeId3V2TextFrame(frameId: string, text: string): void;
    writeId3V2LyricsFrame(lyrics: string): void;
    writeId3V2CommentFrame(comment: string): void;
    writeId3V2ApicFrame(mimeType: string, pictureType: number, description: string, imageData: Uint8Array): void;
}
//# sourceMappingURL=id3.d.ts.map
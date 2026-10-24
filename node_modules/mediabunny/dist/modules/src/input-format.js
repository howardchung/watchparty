/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { IsobmffDemuxer } from './isobmff/isobmff-demuxer.js';
import { EBMLId, MAX_HEADER_SIZE, MIN_HEADER_SIZE, readAsciiString, readElementHeader, readElementSize, readUnsignedInt, readVarIntSize, } from './matroska/ebml.js';
import { MatroskaDemuxer } from './matroska/matroska-demuxer.js';
import { Mp3Demuxer } from './mp3/mp3-demuxer.js';
import { MP3_FRAME_HEADER_SIZE, getXingOffset, INFO, XING } from '../shared/mp3-misc.js';
import { ID3_V2_HEADER_SIZE, readId3V2Header } from './id3.js';
import { readNextMp3FrameHeader } from './mp3/mp3-reader.js';
import { OggDemuxer } from './ogg/ogg-demuxer.js';
import { WaveDemuxer } from './wave/wave-demuxer.js';
import { MAX_ADTS_FRAME_HEADER_SIZE, MIN_ADTS_FRAME_HEADER_SIZE, readAdtsFrameHeader } from './adts/adts-reader.js';
import { AdtsDemuxer } from './adts/adts-demuxer.js';
import { readAscii, readBytes, readU32Be, readU64Be } from './reader.js';
import { FlacDemuxer } from './flac/flac-demuxer.js';
import { MpegTsDemuxer } from './mpeg-ts/mpeg-ts-demuxer.js';
import { TS_PACKET_SIZE } from './mpeg-ts/mpeg-ts-misc.js';
import { HlsDemuxer } from './hls/hls-demuxer.js';
import { HLS_MIME_TYPE } from './hls/hls-misc.js';
import { PathedSource } from './source.js';
import { isThenable } from './misc.js';
/**
 * Base class representing an input media file format.
 * @group Input formats
 * @public
 */
export class InputFormat {
    constructor() {
        /**
         * Provided for tree-shakable checking.
         * @internal
         */
        this._isIsobmff = false;
    }
}
/**
 * Format representing files compatible with the ISO base media file format (ISOBMFF), like MP4 or MOV files.
 *
 * This format can make use of {@link InputOptions.initInput}. When the file contents are fragmented but no track
 * initialization info is provided (no `moov` atom), then it must be provided via `initInput`.
 *
 * @group Input formats
 * @public
 */
export class IsobmffInputFormat extends InputFormat {
    constructor() {
        super(...arguments);
        /** @internal */
        this._isIsobmff = true;
    }
    /** @internal */
    async _getMajorBrand(input) {
        let slice = input._reader.requestSlice(0, 12);
        if (isThenable(slice))
            slice = await slice;
        if (!slice)
            return null;
        slice.skip(4);
        const fourCc = readAscii(slice, 4);
        if (fourCc !== 'ftyp'
            && fourCc !== 'styp' // Segment
        ) {
            return null;
        }
        return readAscii(slice, 4);
    }
    /** @internal */
    _createDemuxer(input) {
        return new IsobmffDemuxer(input);
    }
}
/**
 * MPEG-4 Part 14 (MP4) file format.
 *
 * Do not instantiate this class; use the {@link MP4} singleton instead.
 *
 * @group Input formats
 * @public
 */
export class Mp4InputFormat extends IsobmffInputFormat {
    /** @internal */
    async _canReadInput(input) {
        const majorBrand = await this._getMajorBrand(input);
        if (majorBrand !== null) {
            return majorBrand !== 'qt  ';
        }
        let pos = 0;
        for (let iter = 0; iter < 10; iter++) { // Bounded loop
            let slice = input._reader.requestSlice(pos, 8);
            if (isThenable(slice))
                slice = await slice;
            if (!slice)
                return false;
            let size = readU32Be(slice);
            let headerSize = 8;
            if (size === 1) {
                let sizeExtensionSlice = input._reader.requestSlice(pos + 8, 8);
                if (isThenable(sizeExtensionSlice))
                    sizeExtensionSlice = await sizeExtensionSlice;
                if (!sizeExtensionSlice)
                    return false;
                size = readU64Be(sizeExtensionSlice);
                headerSize = 16;
            }
            if (size < headerSize) {
                return false; // Hardly a box is it
            }
            const fourCc = readAscii(slice, 4);
            if (fourCc === 'moof' || fourCc === 'sidx') { // Seen in HLS for example
                return true;
            }
            else if (fourCc === 'emsg' || fourCc === 'prft' || fourCc === 'free') {
                // These are boxes that can appear before the first moof in DASH Media Segments. They're a strong signal
                // that this is indeed an fMP4 segment, but just to be sure, let's walk the box structure to make sure
                // it stays sane.
                pos += size;
            }
            else {
                return false;
            }
        }
        return false;
    }
    get name() {
        return 'MP4';
    }
    get mimeType() {
        return 'video/mp4';
    }
}
/**
 * QuickTime File Format (QTFF), often called MOV.
 *
 * Do not instantiate this class; use the {@link QTFF} singleton instead.
 *
 * @group Input formats
 * @public
 */
export class QuickTimeInputFormat extends IsobmffInputFormat {
    /** @internal */
    async _canReadInput(input) {
        const majorBrand = await this._getMajorBrand(input);
        return majorBrand === 'qt  ';
    }
    get name() {
        return 'QuickTime File Format';
    }
    get mimeType() {
        return 'video/quicktime';
    }
}
/**
 * Matroska file format.
 *
 * Do not instantiate this class; use the {@link MATROSKA} singleton instead.
 *
 * @group Input formats
 * @public
 */
export class MatroskaInputFormat extends InputFormat {
    /** @internal */
    async isSupportedEBMLOfDocType(input, desiredDocType) {
        let headerSlice = input._reader.requestSlice(0, MAX_HEADER_SIZE);
        if (isThenable(headerSlice))
            headerSlice = await headerSlice;
        if (!headerSlice)
            return false;
        const varIntSize = readVarIntSize(headerSlice);
        if (varIntSize === null) {
            return false;
        }
        if (varIntSize < 1 || varIntSize > 8) {
            return false;
        }
        const id = readUnsignedInt(headerSlice, varIntSize);
        if (id !== EBMLId.EBML) {
            return false;
        }
        const dataSize = readElementSize(headerSlice);
        if (typeof dataSize !== 'number') {
            return false; // Miss me with that shit
        }
        let dataSlice = input._reader.requestSlice(headerSlice.filePos, dataSize);
        if (isThenable(dataSlice))
            dataSlice = await dataSlice;
        if (!dataSlice)
            return false;
        const startPos = headerSlice.filePos;
        while (dataSlice.filePos <= startPos + dataSize - MIN_HEADER_SIZE) {
            const header = readElementHeader(dataSlice);
            if (!header)
                break;
            const { id, size } = header;
            const dataStartPos = dataSlice.filePos;
            if (size === undefined)
                return false;
            switch (id) {
                case EBMLId.EBMLVersion:
                    {
                        const ebmlVersion = readUnsignedInt(dataSlice, size);
                        if (ebmlVersion !== 1) {
                            return false;
                        }
                    }
                    ;
                    break;
                case EBMLId.EBMLReadVersion:
                    {
                        const ebmlReadVersion = readUnsignedInt(dataSlice, size);
                        if (ebmlReadVersion !== 1) {
                            return false;
                        }
                    }
                    ;
                    break;
                case EBMLId.DocType:
                    {
                        const docType = readAsciiString(dataSlice, size);
                        if (docType !== desiredDocType) {
                            return false;
                        }
                    }
                    ;
                    break;
                case EBMLId.DocTypeVersion:
                    {
                        const docTypeVersion = readUnsignedInt(dataSlice, size);
                        if (docTypeVersion > 4) { // Support up to Matroska v4
                            return false;
                        }
                    }
                    ;
                    break;
            }
            dataSlice.filePos = dataStartPos + size;
        }
        return true;
    }
    /** @internal */
    _canReadInput(input) {
        return this.isSupportedEBMLOfDocType(input, 'matroska');
    }
    /** @internal */
    _createDemuxer(input) {
        return new MatroskaDemuxer(input);
    }
    get name() {
        return 'Matroska';
    }
    get mimeType() {
        return 'video/x-matroska';
    }
}
/**
 * WebM file format, based on Matroska.
 *
 * Do not instantiate this class; use the {@link WEBM} singleton instead.
 *
 * @group Input formats
 * @public
 */
export class WebMInputFormat extends MatroskaInputFormat {
    /** @internal */
    _canReadInput(input) {
        return this.isSupportedEBMLOfDocType(input, 'webm');
    }
    get name() {
        return 'WebM';
    }
    get mimeType() {
        return 'video/webm';
    }
}
/**
 * MP3 file format.
 *
 * Do not instantiate this class; use the {@link MP3} singleton instead.
 *
 * @group Input formats
 * @public
 */
export class Mp3InputFormat extends InputFormat {
    /** @internal */
    async _canReadInput(input) {
        let currentPos = 0;
        while (true) {
            let slice = input._reader.requestSlice(currentPos, ID3_V2_HEADER_SIZE);
            if (isThenable(slice))
                slice = await slice;
            if (!slice)
                break;
            const id3V2Header = readId3V2Header(slice);
            if (!id3V2Header) {
                break;
            }
            currentPos = slice.filePos + id3V2Header.size;
        }
        const firstResult = await readNextMp3FrameHeader(input._reader, currentPos, currentPos + 4096);
        if (!firstResult) {
            return false;
        }
        const firstHeader = firstResult.header;
        const xingOffset = getXingOffset(firstHeader.mpegVersionId, firstHeader.channel);
        let slice = input._reader.requestSlice(firstResult.startPos + xingOffset, 4);
        if (isThenable(slice))
            slice = await slice;
        if (!slice)
            return false;
        const word = readU32Be(slice);
        const isXing = word === XING || word === INFO;
        if (isXing) {
            // Gotta be MP3
            return true;
        }
        currentPos = firstResult.startPos + firstResult.header.totalSize;
        // Fine, we found one frame header, but we're still not entirely sure this is MP3. Let's check if we can find
        // another header right after it:
        const secondResult = await readNextMp3FrameHeader(input._reader, currentPos, currentPos + MP3_FRAME_HEADER_SIZE);
        if (!secondResult) {
            return false;
        }
        const secondHeader = secondResult.header;
        // In a well-formed MP3 file, we'd expect these two frames to share some similarities:
        if (firstHeader.channel !== secondHeader.channel || firstHeader.sampleRate !== secondHeader.sampleRate) {
            return false;
        }
        // We have found two matching consecutive MP3 frames, a strong indicator that this is an MP3 file
        return true;
    }
    /** @internal */
    _createDemuxer(input) {
        return new Mp3Demuxer(input);
    }
    get name() {
        return 'MP3';
    }
    get mimeType() {
        return 'audio/mpeg';
    }
}
/**
 * WAVE file format, based on RIFF.
 *
 * Do not instantiate this class; use the {@link WAVE} singleton instead.
 *
 * @group Input formats
 * @public
 */
export class WaveInputFormat extends InputFormat {
    /** @internal */
    async _canReadInput(input) {
        let slice = input._reader.requestSlice(0, 12);
        if (isThenable(slice))
            slice = await slice;
        if (!slice)
            return false;
        const riffType = readAscii(slice, 4);
        if (riffType !== 'RIFF' && riffType !== 'RIFX' && riffType !== 'RF64') {
            return false;
        }
        slice.skip(4);
        const format = readAscii(slice, 4);
        return format === 'WAVE';
    }
    /** @internal */
    _createDemuxer(input) {
        return new WaveDemuxer(input);
    }
    get name() {
        return 'WAVE';
    }
    get mimeType() {
        return 'audio/wav';
    }
}
/**
 * Ogg file format.
 *
 * Do not instantiate this class; use the {@link OGG} singleton instead.
 *
 * @group Input formats
 * @public
 */
export class OggInputFormat extends InputFormat {
    /** @internal */
    async _canReadInput(input) {
        let slice = input._reader.requestSlice(0, 4);
        if (isThenable(slice))
            slice = await slice;
        if (!slice)
            return false;
        return readAscii(slice, 4) === 'OggS';
    }
    /** @internal */
    _createDemuxer(input) {
        return new OggDemuxer(input);
    }
    get name() {
        return 'Ogg';
    }
    get mimeType() {
        return 'application/ogg';
    }
}
/**
 * FLAC file format.
 *
 * Do not instantiate this class; use the {@link FLAC} singleton instead.
 *
 * @group Input formats
 * @public
 */
export class FlacInputFormat extends InputFormat {
    /** @internal */
    async _canReadInput(input) {
        let currentPos = 0;
        // There might be ID3v2 headers at the start, skip 'em
        while (true) {
            let slice = input._reader.requestSlice(currentPos, ID3_V2_HEADER_SIZE);
            if (isThenable(slice))
                slice = await slice;
            if (!slice)
                break;
            const id3V2Header = readId3V2Header(slice);
            if (!id3V2Header) {
                break;
            }
            currentPos = slice.filePos + id3V2Header.size;
        }
        let slice = input._reader.requestSlice(currentPos, 4);
        if (isThenable(slice))
            slice = await slice;
        if (!slice)
            return false;
        return readAscii(slice, 4) === 'fLaC';
    }
    get name() {
        return 'FLAC';
    }
    get mimeType() {
        return 'audio/flac';
    }
    /** @internal */
    _createDemuxer(input) {
        return new FlacDemuxer(input);
    }
}
/**
 * ADTS file format.
 *
 * Do not instantiate this class; use the {@link ADTS} singleton instead.
 *
 * @group Input formats
 * @public
 */
export class AdtsInputFormat extends InputFormat {
    /** @internal */
    async _canReadInput(input) {
        let currentPos = 0;
        while (true) {
            let slice = input._reader.requestSlice(currentPos, ID3_V2_HEADER_SIZE);
            if (isThenable(slice))
                slice = await slice;
            if (!slice)
                break;
            const id3V2Header = readId3V2Header(slice);
            if (!id3V2Header) {
                break;
            }
            currentPos = slice.filePos + id3V2Header.size;
        }
        let slice = input._reader.requestSliceRange(currentPos, MIN_ADTS_FRAME_HEADER_SIZE, MAX_ADTS_FRAME_HEADER_SIZE);
        if (isThenable(slice))
            slice = await slice;
        if (!slice)
            return false;
        const firstHeader = readAdtsFrameHeader(slice);
        if (!firstHeader) {
            return false;
        }
        currentPos += firstHeader.frameLength;
        slice = input._reader.requestSliceRange(currentPos, MIN_ADTS_FRAME_HEADER_SIZE, MAX_ADTS_FRAME_HEADER_SIZE);
        if (isThenable(slice))
            slice = await slice;
        if (!slice)
            return false;
        const secondHeader = readAdtsFrameHeader(slice);
        if (!secondHeader) {
            return false;
        }
        return firstHeader.objectType === secondHeader.objectType
            && firstHeader.samplingFrequencyIndex === secondHeader.samplingFrequencyIndex
            && firstHeader.channelConfiguration === secondHeader.channelConfiguration;
    }
    /** @internal */
    _createDemuxer(input) {
        return new AdtsDemuxer(input);
    }
    get name() {
        return 'ADTS';
    }
    get mimeType() {
        return 'audio/aac';
    }
}
/**
 * MPEG Transport Stream (MPEG-TS) file format.
 *
 * This format can make use of {@link InputOptions.initInput} to initialize track information even when no
 * initialization information is provided for the track, for example because it has no key frames. In this case, tracks
 * are matched to each other based on their PID.
 *
 * Do not instantiate this class; use the {@link MPEG_TS} singleton instead.
 *
 * @group Input formats
 * @public
 */
export class MpegTsInputFormat extends InputFormat {
    /** @internal */
    async _canReadInput(input) {
        const lengthToCheck = TS_PACKET_SIZE + 16 + 1;
        let slice = input._reader.requestSlice(0, lengthToCheck);
        if (isThenable(slice))
            slice = await slice;
        if (!slice)
            return false;
        const bytes = readBytes(slice, lengthToCheck);
        if (bytes[0] === 0x47 && bytes[TS_PACKET_SIZE] === 0x47) {
            // Regular MPEG-TS
            return true;
        }
        else if (bytes[0] === 0x47 && bytes[TS_PACKET_SIZE + 16] === 0x47) {
            // MPEG-TS with Forward Error Correction
            return true;
        }
        else if (bytes[4] === 0x47 && bytes[4 + TS_PACKET_SIZE + 4] === 0x47) {
            // MPEG-2-TS (DVHS)
            return true;
        }
        return false;
    }
    /** @internal */
    _createDemuxer(input) {
        return new MpegTsDemuxer(input);
    }
    get name() {
        return 'MPEG Transport Stream';
    }
    get mimeType() {
        return 'video/MP2T';
    }
}
/**
 * Media described using the HTTP Live Streaming (HLS) protocol, with playlists in the M3U8 format.
 *
 * Do not instantiate this class; use the {@link HLS} singleton instead.
 *
 * @group Input formats
 * @public
 */
export class HlsInputFormat extends InputFormat {
    /** @internal */
    async _canReadInput(input) {
        let slice = input._reader.requestSlice(0, 7);
        if (isThenable(slice))
            slice = await slice;
        if (!slice)
            return false;
        const isM3u8 = readAscii(slice, 7) === '#EXTM3U';
        if (!isM3u8) {
            return false;
        }
        if (!(input._rootSource instanceof PathedSource)) {
            throw new TypeError('HLS inputs require `InputOptions.source` to be a PathedSource or a ref to one.');
        }
        input._rootSource._usedForHls = true;
        return true;
    }
    /** @internal */
    _createDemuxer(input) {
        return new HlsDemuxer(input);
    }
    get name() {
        return 'HTTP Live Streaming (HLS)';
    }
    get mimeType() {
        return HLS_MIME_TYPE;
    }
}
/**
 * MP4 input format singleton.
 * @group Input formats
 * @public
 */
export const MP4 = /* #__PURE__ */ new Mp4InputFormat();
/**
 * QuickTime File Format input format singleton.
 * @group Input formats
 * @public
 */
export const QTFF = /* #__PURE__ */ new QuickTimeInputFormat();
/**
 * Matroska input format singleton.
 * @group Input formats
 * @public
 */
export const MATROSKA = /* #__PURE__ */ new MatroskaInputFormat();
/**
 * WebM input format singleton.
 * @group Input formats
 * @public
 */
export const WEBM = /* #__PURE__ */ new WebMInputFormat();
/**
 * MP3 input format singleton.
 * @group Input formats
 * @public
 */
export const MP3 = /* #__PURE__ */ new Mp3InputFormat();
/**
 * WAVE input format singleton.
 * @group Input formats
 * @public
 */
export const WAVE = /* #__PURE__ */ new WaveInputFormat();
/**
 * Ogg input format singleton.
 * @group Input formats
 * @public
 */
export const OGG = /* #__PURE__ */ new OggInputFormat();
/**
 * ADTS input format singleton.
 * @group Input formats
 * @public
 */
export const ADTS = /* #__PURE__ */ new AdtsInputFormat();
/**
 * FLAC input format singleton.
 * @group Input formats
 * @public
 */
export const FLAC = /* #__PURE__ */ new FlacInputFormat();
/**
 * MPEG-TS input format singleton.
 * @group Input formats
 * @public
 */
export const MPEG_TS = /* #__PURE__ */ new MpegTsInputFormat();
/**
 * HLS input format singleton.
 * @group Input formats
 * @public
 */
export const HLS = /* #__PURE__ */ new HlsInputFormat();
/**
 * List of all input format singletons. If you don't need to support all input formats, you should specify the
 * formats individually for better tree shaking.
 * @group Input formats
 * @public
 */
export const ALL_FORMATS = [HLS, MP4, QTFF, MATROSKA, WEBM, WAVE, OGG, FLAC, MP3, ADTS, MPEG_TS];
/**
 * List of input formats required for playback of typical HLS manifests. Includes HLS itself as well as the typical
 * segment formats: MPEG Transport Stream (.ts), MP4 (CMAF), ADTS (.aac) and MP3.
 * @group Input formats
 * @public
 */
export const HLS_FORMATS = [HLS, MP4, QTFF, MP3, ADTS, MPEG_TS];
export const validateInputFormatOptions = (options, prefix) => {
    if (!options || typeof options !== 'object') {
        throw new TypeError(`${prefix}, when provided, must be an object.`);
    }
    if (options.isobmff !== undefined) {
        if (!options.isobmff || typeof options.isobmff !== 'object') {
            throw new TypeError(`${prefix}.isobmff, when provided, must be an object.`);
        }
        if (options.isobmff.resolveKeyId !== undefined && typeof options.isobmff.resolveKeyId !== 'function') {
            throw new TypeError(`${prefix}.isobmff.resolveKeyId, when provided, must be a function.`);
        }
    }
    if (options.hls !== undefined) {
        if (!options.hls || typeof options.hls !== 'object') {
            throw new TypeError(`${prefix}.hls, when provided, must be an object.`);
        }
        if (options.hls.offsetTimestampsByDateTime !== undefined
            && typeof options.hls.offsetTimestampsByDateTime !== 'boolean') {
            throw new TypeError(`${prefix}.hls.offsetTimestampsByDateTime, when provided, must be a boolean.`);
        }
    }
};

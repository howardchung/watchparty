/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { AacCodecInfo, AudioCodec, DtsFourCc, VideoCodec } from '../codec.js';
import { AvcDecoderConfigurationRecord, HevcDecoderConfigurationRecord } from '../codec-data.js';
import { Demuxer } from '../demuxer.js';
import { Input } from '../input.js';
import { InputTrackBacking } from '../input-track.js';
import { MetadataTags } from '../metadata.js';
import { Reader } from '../reader.js';
type ElementaryStream = {
    demuxer: MpegTsDemuxer;
    pid: number;
    streamType: number;
    initialized: boolean;
    firstSection: Section | null;
    /**
     * Some muxers suck ass and don't correctly label key frames, meaning we'll need to use our skill to
     * compensate for another programmer's skill issue.
     */
    canBeTrustedWithKeyPackets: boolean;
    info: {
        type: 'video';
        codec: VideoCodec;
        decoderConfig: VideoDecoderConfig | null;
        avcCodecInfo: AvcDecoderConfigurationRecord | null;
        hevcCodecInfo: HevcDecoderConfigurationRecord | null;
        colorSpace: VideoColorSpaceInit;
        width: number;
        height: number;
        squarePixelWidth: number;
        squarePixelHeight: number;
        reorderSize: number;
    } | {
        type: 'audio';
        codec: AudioCodec;
        decoderConfig: AudioDecoderConfig | null;
        aacCodecInfo: AacCodecInfo | null;
        dtsFormat: DtsFourCc | null;
        numberOfChannels: number;
        sampleRate: number;
    };
    /**
     * Reference PES packets, spread throughout the file, to be used to speed up repeated random access. Sorted by both
     * byte offset and PTS.
     */
    referencePesPackets: TimestampedPesPacketHeader[];
};
type TsPacketHeader = {
    payloadUnitStartIndicator: number;
    pid: number;
    adaptationFieldControl: number;
};
type TsPacket = TsPacketHeader & {
    body: Uint8Array<ArrayBufferLike>;
};
type Section = {
    startPos: number;
    endPos: number | null;
    pid: number;
    payload: Uint8Array<ArrayBufferLike>;
    randomAccessIndicator: number;
};
export declare class MpegTsDemuxer extends Demuxer {
    reader: Reader;
    metadataPromise: Promise<void> | null;
    elementaryStreams: ElementaryStream[];
    trackBackingEntries: InputTrackBacking[];
    packetOffset: number;
    packetStride: number;
    sectionEndPositions: number[];
    seekChunkSize: number;
    minReferencePointByteDistance: number;
    timestampWrapInfo: {
        reference: number;
        offset: number;
    } | null;
    constructor(input: Input);
    readMetadata(): Promise<void>;
    getTrackBackings(): Promise<InputTrackBacking[]>;
    getMetadataTags(): Promise<MetadataTags>;
    getMimeType(): Promise<string>;
    readSection(startPos: number, full: boolean, contiguous?: boolean): Promise<Section | null>;
    readPacketHeader(pos: number): Promise<TsPacketHeader | null>;
    readPacket(pos: number): Promise<TsPacket | null>;
    normalizeTimestamp(timestamp: number): number;
}
type PesPacketHeader = {
    sectionStartPos: number;
    sectionEndPos: number | null;
    pts: number | null;
    randomAccessIndicator: number;
};
type TimestampedPesPacketHeader = PesPacketHeader & {
    pts: number;
};
export {};
//# sourceMappingURL=mpeg-ts-demuxer.d.ts.map
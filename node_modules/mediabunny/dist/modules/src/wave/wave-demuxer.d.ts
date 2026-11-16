/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { AudioCodec } from '../codec.js';
import { Demuxer } from '../demuxer.js';
import { Input } from '../input.js';
import { InputAudioTrackBacking } from '../input-track.js';
import { PacketRetrievalOptions } from '../media-sink.js';
import { MetadataTags } from '../metadata.js';
import { EncodedPacket } from '../packet.js';
import { Reader } from '../reader.js';
export declare enum WaveFormat {
    PCM = 1,
    IEEE_FLOAT = 3,
    ALAW = 6,
    MULAW = 7,
    EXTENSIBLE = 65534
}
export declare class WaveDemuxer extends Demuxer {
    reader: Reader;
    metadataPromise: Promise<void> | null;
    dataStart: number;
    dataSize: number;
    audioInfo: {
        format: number;
        numberOfChannels: number;
        sampleRate: number;
        sampleSizeInBytes: number;
        blockSizeInBytes: number;
    } | null;
    trackBackings: WaveAudioTrackBacking[];
    lastKnownPacketIndex: number;
    metadataTags: MetadataTags;
    constructor(input: Input);
    readMetadata(): Promise<void>;
    private parseFmtChunk;
    private parseListChunk;
    private parseId3Chunk;
    getCodec(): AudioCodec | null;
    getMimeType(): Promise<string>;
    getTrackBackings(): Promise<WaveAudioTrackBacking[]>;
    getMetadataTags(): Promise<MetadataTags>;
}
declare class WaveAudioTrackBacking implements InputAudioTrackBacking {
    demuxer: WaveDemuxer;
    constructor(demuxer: WaveDemuxer);
    getType(): "audio";
    getId(): number;
    getNumber(): number;
    getCodec(): "vorbis" | "pcm-s16" | "pcm-s16be" | "pcm-s24" | "pcm-s24be" | "pcm-s32" | "pcm-s32be" | "pcm-f32" | "pcm-f32be" | "pcm-f64" | "pcm-f64be" | "pcm-u8" | "pcm-s8" | "ulaw" | "alaw" | "aac" | "opus" | "mp3" | "flac" | "ac3" | "eac3" | "dts" | null;
    getInternalCodecId(): number;
    getDecoderConfig(): Promise<AudioDecoderConfig | null>;
    getNumberOfChannels(): number;
    getSampleRate(): number;
    getTimeResolution(): number;
    isRelativeToUnixEpoch(): boolean;
    getUnixTimeForTimestamp(): null;
    getPairingMask(): bigint;
    getBitrate(): null;
    getAverageBitrate(): null;
    getDurationFromMetadata(): Promise<number>;
    getLiveRefreshInterval(): Promise<null>;
    getName(): null;
    getLanguageCode(): string;
    getDisposition(): {
        default: boolean;
        primary: boolean;
        forced: boolean;
        original: boolean;
        commentary: boolean;
        hearingImpaired: boolean;
        visuallyImpaired: boolean;
    };
    private getPacketAtIndex;
    getFirstPacket(options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    getPacket(timestamp: number, options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    getNextPacket(packet: EncodedPacket, options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    getKeyPacket(timestamp: number, options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    getNextKeyPacket(packet: EncodedPacket, options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
}
export {};
//# sourceMappingURL=wave-demuxer.d.ts.map
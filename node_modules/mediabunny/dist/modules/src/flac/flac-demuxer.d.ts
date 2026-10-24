/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Demuxer } from '../demuxer.js';
import { Input } from '../input.js';
import { InputAudioTrackBacking } from '../input-track.js';
import { PacketRetrievalOptions } from '../media-sink.js';
import { AsyncMutex } from '../misc.js';
import { EncodedPacket } from '../packet.js';
import { FileSlice, Reader } from '../reader.js';
import { MetadataTags } from '../metadata.js';
type FlacAudioInfo = {
    numberOfChannels: number;
    sampleRate: number;
    totalSamples: number;
    minimumBlockSize: number;
    maximumBlockSize: number;
    minimumFrameSize: number;
    maximumFrameSize: number;
    description: Uint8Array;
};
type Sample = {
    blockOffset: number;
    blockSize: number;
    byteOffset: number;
    byteSize: number;
};
type NextFlacFrameResult = {
    num: number;
    blockSize: number;
    sampleRate: number;
    size: number;
    isLastFrame: boolean;
};
export declare class FlacDemuxer extends Demuxer {
    reader: Reader;
    loadedSamples: Sample[];
    metadataPromise: Promise<void> | null;
    trackBacking: FlacAudioTrackBacking | null;
    metadataTags: MetadataTags;
    audioInfo: FlacAudioInfo | null;
    lastLoadedPos: number | null;
    blockingBit: number | null;
    readingMutex: AsyncMutex;
    lastSampleLoaded: boolean;
    constructor(input: Input);
    getMetadataTags(): Promise<MetadataTags>;
    getTrackBackings(): Promise<FlacAudioTrackBacking[]>;
    getMimeType(): Promise<string>;
    readMetadata(): Promise<void>;
    readNextFlacFrame({ startPos, isFirstPacket, }: {
        startPos: number;
        isFirstPacket: boolean;
    }): Promise<NextFlacFrameResult | null>;
    readFlacFrameHeader({ slice, isFirstPacket, }: {
        slice: FileSlice;
        isFirstPacket: boolean;
    }): {
        num: number;
        blockSize: number;
        sampleRate: number;
    } | null;
    advanceReader(): Promise<void>;
}
declare class FlacAudioTrackBacking implements InputAudioTrackBacking {
    demuxer: FlacDemuxer;
    constructor(demuxer: FlacDemuxer);
    getType(): "audio";
    getId(): number;
    getNumber(): number;
    getCodec(): "flac";
    getInternalCodecId(): string | number | Uint8Array | null;
    getNumberOfChannels(): number;
    getSampleRate(): number;
    getName(): string | null;
    getLanguageCode(): string;
    getTimeResolution(): number;
    isRelativeToUnixEpoch(): boolean;
    getUnixTimeForTimestamp(): null;
    getPairingMask(): bigint;
    getBitrate(): null;
    getAverageBitrate(): null;
    getDurationFromMetadata(): Promise<number | null>;
    getLiveRefreshInterval(): Promise<null>;
    getDisposition(): {
        default: boolean;
        primary: boolean;
        forced: boolean;
        original: boolean;
        commentary: boolean;
        hearingImpaired: boolean;
        visuallyImpaired: boolean;
    };
    getDecoderConfig(): Promise<AudioDecoderConfig | null>;
    getPacket(timestamp: number, options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    getNextPacket(packet: EncodedPacket, options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    getKeyPacket(timestamp: number, options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    getNextKeyPacket(packet: EncodedPacket, options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    getPacketAtIndex(sampleIndex: number, options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    getFirstPacket(options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
}
export {};
//# sourceMappingURL=flac-demuxer.d.ts.map
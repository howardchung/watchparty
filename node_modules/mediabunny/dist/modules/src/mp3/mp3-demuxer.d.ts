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
import { MetadataTags } from '../metadata.js';
import { PacketRetrievalOptions } from '../media-sink.js';
import { AsyncMutex } from '../misc.js';
import { EncodedPacket } from '../packet.js';
import { Mp3FrameHeader } from '../../shared/mp3-misc.js';
import { Reader } from '../reader.js';
type Sample = {
    timestamp: number;
    duration: number;
    dataStart: number;
    dataSize: number;
};
export declare class Mp3Demuxer extends Demuxer {
    reader: Reader;
    metadataPromise: Promise<void> | null;
    firstFrameHeader: Mp3FrameHeader | null;
    firstFrameHeaderPos: number | null;
    xingFrameHeader: Mp3FrameHeader | null;
    xingFrameHeaderPos: number | null;
    loadedSamples: Sample[];
    metadataTags: MetadataTags | null;
    xingData: {
        frameCount: number | null;
        fileSize: number | null;
    } | null;
    trackBackings: Mp3AudioTrackBacking[];
    readingMutex: AsyncMutex;
    lastSampleLoaded: boolean;
    lastLoadedPos: number;
    nextTimestampInSamples: number;
    constructor(input: Input);
    readMetadata(): Promise<void>;
    advanceReader(): Promise<void>;
    getMimeType(): Promise<string>;
    getTrackBackings(): Promise<Mp3AudioTrackBacking[]>;
    getMetadataTags(): Promise<MetadataTags>;
}
declare class Mp3AudioTrackBacking implements InputAudioTrackBacking {
    demuxer: Mp3Demuxer;
    constructor(demuxer: Mp3Demuxer);
    getType(): "audio";
    getId(): number;
    getNumber(): number;
    getTimeResolution(): number;
    isRelativeToUnixEpoch(): boolean;
    getUnixTimeForTimestamp(): null;
    getPairingMask(): bigint;
    getBitrate(): null;
    getAverageBitrate(): null;
    getDurationFromMetadata(): Promise<number | null>;
    getLiveRefreshInterval(): Promise<null>;
    getName(): null;
    getLanguageCode(): string;
    getCodec(): AudioCodec;
    getInternalCodecId(): null;
    getNumberOfChannels(): 1 | 2;
    getSampleRate(): number;
    getDisposition(): {
        default: boolean;
        primary: boolean;
        forced: boolean;
        original: boolean;
        commentary: boolean;
        hearingImpaired: boolean;
        visuallyImpaired: boolean;
    };
    getDecoderConfig(): Promise<AudioDecoderConfig>;
    getPacketAtIndex(sampleIndex: number, options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    getFirstPacket(options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    getNextPacket(packet: EncodedPacket, options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    getPacket(timestamp: number, options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    getKeyPacket(timestamp: number, options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    getNextKeyPacket(packet: EncodedPacket, options: PacketRetrievalOptions): Promise<EncodedPacket | null>;
}
export {};
//# sourceMappingURL=mp3-demuxer.d.ts.map
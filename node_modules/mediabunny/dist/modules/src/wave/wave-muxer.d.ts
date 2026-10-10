/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Muxer } from '../muxer.js';
import { Output, OutputAudioTrack } from '../output.js';
import { EncodedPacket } from '../packet.js';
import { WavOutputFormat } from '../output-format.js';
export declare class WaveMuxer extends Muxer {
    private format;
    private isRf64;
    private writer;
    private riffWriter;
    private headerWritten;
    private dataSize;
    private sampleRate;
    private sampleCount;
    private riffSizePos;
    private dataSizePos;
    private ds64RiffSizePos;
    private ds64DataSizePos;
    private ds64SampleCountPos;
    constructor(output: Output, format: WavOutputFormat);
    start(): Promise<void>;
    getMimeType(): Promise<string>;
    addEncodedVideoPacket(): Promise<void>;
    addEncodedAudioPacket(track: OutputAudioTrack, packet: EncodedPacket, meta?: EncodedAudioChunkMetadata): Promise<void>;
    addSubtitleCue(): Promise<void>;
    private writeHeader;
    private writeInfoChunk;
    private writeId3Chunk;
    finalize(): Promise<void>;
}
//# sourceMappingURL=wave-muxer.d.ts.map
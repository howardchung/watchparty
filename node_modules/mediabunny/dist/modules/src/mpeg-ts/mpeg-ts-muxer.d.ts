/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Muxer } from '../muxer.js';
import { Output, OutputAudioTrack, OutputTrack, OutputVideoTrack } from '../output.js';
import { MpegTsOutputFormat } from '../output-format.js';
import { EncodedPacket } from '../packet.js';
export declare class MpegTsMuxer extends Muxer {
    private format;
    private writer;
    private trackDatas;
    private tablesWritten;
    private continuityCounters;
    private packetBuffer;
    private packetView;
    private allTracksKnown;
    private videoTrackIndex;
    private audioTrackIndex;
    private adaptationFieldBuffer;
    private payloadBuffer;
    constructor(output: Output, format: MpegTsOutputFormat);
    start(): Promise<void>;
    getMimeType(): Promise<string>;
    private getVideoTrackData;
    private getAudioTrackData;
    addEncodedVideoPacket(track: OutputVideoTrack, packet: EncodedPacket, meta?: EncodedVideoChunkMetadata): Promise<void>;
    addEncodedAudioPacket(track: OutputAudioTrack, packet: EncodedPacket, meta?: EncodedAudioChunkMetadata): Promise<void>;
    addSubtitleCue(): Promise<void>;
    private prepareVideoPacket;
    private prepareAnnexBVideoPacket;
    private prepareLengthPrefixedVideoPacket;
    private prepareAudioPacket;
    private allTracksAreKnown;
    private flushTimestampQueue;
    private interleavePackets;
    private writeTables;
    private writePsiSection;
    private writePesPacket;
    private writeTsPacket;
    onTrackClose(track: OutputTrack): Promise<void>;
    finalize(): Promise<void>;
}
//# sourceMappingURL=mpeg-ts-muxer.d.ts.map
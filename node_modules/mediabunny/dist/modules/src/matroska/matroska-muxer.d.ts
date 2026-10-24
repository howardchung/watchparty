/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { MkvOutputFormat } from '../output-format.js';
import { Output, OutputAudioTrack, OutputSubtitleTrack, OutputTrack, OutputVideoTrack } from '../output.js';
import { SubtitleCue, SubtitleMetadata } from '../subtitles.js';
import { Muxer } from '../muxer.js';
import { EncodedPacket } from '../packet.js';
export declare class MatroskaMuxer extends Muxer {
    private writer;
    private ebmlWriter;
    private format;
    private trackDatas;
    private allTracksKnown;
    private segment;
    private segmentInfo;
    private seekHead;
    private tracksElement;
    private tagsElement;
    private attachmentsElement;
    private segmentDuration;
    private cues;
    private currentCluster;
    private currentClusterStartMsTimestamp;
    private currentClusterMaxMsTimestamp;
    private trackDatasInCurrentCluster;
    private startTimestamp;
    private endTimestamp;
    private warnedAboutTooNegativeTimestamp;
    constructor(output: Output, format: MkvOutputFormat);
    start(): Promise<void>;
    private writeEBMLHeader;
    /**
     * Creates a SeekHead element which is positioned near the start of the file and allows the media player to seek to
     * relevant sections more easily. Since we don't know the positions of those sections yet, we'll set them later.
     */
    private maybeCreateSeekHead;
    private createSegmentInfo;
    private createTracks;
    private videoSpecificTrackInfo;
    private audioSpecificTrackInfo;
    private subtitleSpecificTrackInfo;
    private maybeCreateTags;
    private maybeCreateAttachments;
    private createSegment;
    private createCues;
    private get segmentDataOffset();
    private allTracksAreKnown;
    getMimeType(): Promise<string>;
    private getVideoTrackData;
    private getAudioTrackData;
    private getSubtitleTrackData;
    addEncodedVideoPacket(track: OutputVideoTrack, packet: EncodedPacket, meta?: EncodedVideoChunkMetadata): Promise<void>;
    addEncodedAudioPacket(track: OutputAudioTrack, packet: EncodedPacket, meta?: EncodedAudioChunkMetadata): Promise<void>;
    addSubtitleCue(track: OutputSubtitleTrack, cue: SubtitleCue, meta?: SubtitleMetadata): Promise<void>;
    private interleaveChunks;
    /**
     * Due to [a bug in Chromium](https://bugs.chromium.org/p/chromium/issues/detail?id=1377842), VP9 streams often
     * lack color space information. This method patches in that information.
     */
    private fixVP9ColorSpace;
    /** Converts a read-only external chunk into an internal one for easier use. */
    private createInternalChunk;
    /** Writes a block containing media data to the file. */
    private writeBlock;
    /** Creates a new Cluster element to contain media chunks. */
    private createNewCluster;
    private finalizeCurrentCluster;
    onTrackClose(track: OutputTrack): Promise<void>;
    /** Finalizes the file, making it ready for use. Must be called after all media chunks have been added. */
    finalize(): Promise<void>;
}
//# sourceMappingURL=matroska-muxer.d.ts.map
/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { TrackType } from './output.js';
import { MediaCodec } from './codec.js';
import { DurationMetadataRequestOptions } from './demuxer.js';
import { Input } from './input.js';
import { InputTrackBacking } from './input-track.js';
export type SegmentedInputMetadata = {
    name: string | null;
    bitrate: number | null;
    averageBitrate: number | null;
    codecs: MediaCodec[];
    codecStrings: string[];
    resolution: {
        width: number;
        height: number;
    } | null;
    frameRate: number | null;
    isKeyFrameOnly: boolean;
};
export type AssociatedGroup = {
    id: string;
    type: 'video' | 'audio' | 'subtitles' | 'closed-captions';
};
export type Segment = {
    timestamp: number;
    duration: number;
    /**
     * The Unix time (in seconds) corresponding to this segment's start timestamp, or null if unknown. This is computed
     * whenever the source provides wall-clock information (e.g. HLS program date time), even if the segment timestamps
     * themselves are not shifted into Unix time space.
     */
    unixEpochTimestamp: number | null;
    firstSegment: Segment | null;
};
export type SegmentRetrievalOptions = {
    skipLiveWait?: boolean;
};
export type SegmentedInputTrackDeclaration = {
    id: number;
    type: TrackType;
};
export declare abstract class SegmentedInput {
    input: Input;
    path: string;
    trackDeclarations: SegmentedInputTrackDeclaration[] | null;
    nextInputCacheAge: number;
    inputCache: {
        segment: Segment;
        input: Input;
        age: number;
    }[];
    trackBackingsPromise: Promise<InputTrackBacking[]> | null;
    firstSegment: Segment | null;
    firstSegmentFirstTimestamps: WeakMap<Segment, number>;
    firstTimestampCache: WeakMap<Input<import("./source.js").Source>, number>;
    constructor(input: Input, path: string, trackDeclarations: SegmentedInputTrackDeclaration[] | null);
    abstract getFirstSegment(options: SegmentRetrievalOptions): Promise<Segment | null>;
    abstract getSegmentAt(timestamp: number, options: SegmentRetrievalOptions): Promise<Segment | null>;
    abstract getNextSegment(segment: Segment, options: SegmentRetrievalOptions): Promise<Segment | null>;
    abstract getPreviousSegment(segment: Segment, options: SegmentRetrievalOptions): Promise<Segment | null>;
    abstract getInputForSegment(segment: Segment): Input;
    abstract getLiveRefreshInterval(): Promise<number | null>;
    getDurationFromMetadata(options: DurationMetadataRequestOptions): Promise<number | null>;
    getUnixTimeForTimestamp(timestamp: number): Promise<number | null>;
    getTrackBackings(): Promise<InputTrackBacking[]>;
    getFirstTimestampForInput(input: Input): Promise<number>;
    getMediaOffset(segment: Segment, input: Input): Promise<number>;
    dispose(): void;
}
//# sourceMappingURL=segmented-input.d.ts.map
/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Input } from '../input.js';
import { Segment, SegmentedInput, SegmentedInputTrackDeclaration, SegmentRetrievalOptions } from '../segmented-input.js';
import { HlsDemuxer } from './hls-demuxer.js';
import { type PsshBox } from '../isobmff/isobmff-misc.js';
export type HlsSegment = Segment & {
    sequenceNumber: number | null;
    location: HlsSegmentLocation;
    encryption: HlsEncryptionInfo | null;
    firstSegment: HlsSegment | null;
    initSegment: HlsSegment | null;
    lastProgramDateTimeSeconds: number | null;
};
export type HlsEncryptionInfo = {
    method: 'AES-128';
    keyUri: string;
    iv: Uint8Array | null;
    keyFormat: string;
} | {
    method: 'SAMPLE-AES' | 'SAMPLE-AES-CTR';
    psshBox: PsshBox | null;
};
export type HlsSegmentLocation = {
    path: string;
    offset: number;
    length: number | null;
};
export declare class HlsSegmentedInput extends SegmentedInput {
    rootPath: string;
    demuxer: HlsDemuxer;
    segments: HlsSegment[];
    nextLines: string[] | null;
    currentUpdateSegmentsPromise: Promise<void> | null;
    streamHasEnded: boolean;
    lastSegmentUpdateTime: number;
    refreshInterval: number;
    constructor(demuxer: HlsDemuxer, path: string, trackDeclarations: SegmentedInputTrackDeclaration[] | null, lines: string[] | null);
    runUpdateSegments(): Promise<void>;
    getRemainingWaitTimeMs(): number;
    /**
     * Reads and parses the segment info from the playlist file. When called more than one, it updates the existing
     * segments by appending the new ones. Existing segments are never removed.
     */
    updateSegments(): Promise<void>;
    getFirstSegment(): Promise<HlsSegment | null>;
    getSegmentAt(timestamp: number, options: SegmentRetrievalOptions): Promise<HlsSegment | null>;
    getNextSegment(segment: Segment, options: SegmentRetrievalOptions): Promise<HlsSegment | null>;
    getPreviousSegment(segment: Segment): Promise<HlsSegment | null>;
    getInputForSegment(segment: Segment): Input;
    getLiveRefreshInterval(): Promise<number | null>;
}
//# sourceMappingURL=hls-segmented-input.d.ts.map
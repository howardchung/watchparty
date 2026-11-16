/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
export declare const MP3_FRAME_HEADER_SIZE = 4;
export declare const SAMPLING_RATES: number[];
export declare const KILOBIT_RATES: number[];
/** 'Xing' */
export declare const XING = 1483304551;
/** 'Info' */
export declare const INFO = 1231971951;
export type Mp3FrameHeader = {
    totalSize: number;
    mpegVersionId: number;
    lowSamplingFrequency: number;
    layer: number;
    bitrate: number;
    frequencyIndex: number;
    sampleRate: number;
    channel: number;
    modeExtension: number;
    copyright: number;
    original: number;
    emphasis: number;
    audioSamplesInFrame: number;
};
export declare const computeMp3FrameSize: (lowSamplingFrequency: number, layer: number, bitrate: number, sampleRate: number, padding: number) => number;
export declare const computeAverageMp3FrameSize: (lowSamplingFrequency: number, layer: number, bitrate: number, sampleRate: number) => number;
export declare const getXingOffset: (mpegVersionId: number, channel: number) => 13 | 21 | 36;
export declare const readMp3FrameHeader: (word: number, remainingBytes: number | null) => {
    header: Mp3FrameHeader | null;
    bytesAdvanced: number;
};
export declare const encodeSynchsafe: (unsynchsafed: number) => number;
export declare const decodeSynchsafe: (synchsafed: number) => number;
export declare enum XingFlags {
    FrameCount = 1,
    FileSize = 2,
    Toc = 4
}
export declare const getMp3ChannelCount: (channel: number) => 1 | 2;
//# sourceMappingURL=mp3-misc.d.ts.map
/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { AudioSample } from './sample.js';
/**
 * Utility class to handle audio resampling, handling both sample rate resampling as well as channel up/downmixing.
 * The advantage over doing this manually rather than using OfflineAudioContext to do it for us is the artifact-free
 * handling of putting multiple resampled audio samples back to back, which produces flaky results using
 * OfflineAudioContext.
 */
export declare class AudioResampler {
    sourceSampleRate: number | null;
    targetSampleRate: number;
    sourceNumberOfChannels: number | null;
    targetNumberOfChannels: number;
    startTime: number | null;
    onSample: (sample: AudioSample) => Promise<void>;
    bufferSizeInFrames: number;
    bufferSizeInSamples: number;
    bufferCapacityInFrames: number;
    outputBuffer: Float32Array;
    /** Start frame of current buffer */
    bufferStartFrame: number;
    /** The highest index written to in the current buffer */
    maxWrittenFrame: number | null;
    channelMixer: (sourceData: Float32Array, sourceFrameIndex: number, targetChannelIndex: number) => number;
    tempSourceBuffer: Float32Array;
    constructor(options: {
        targetSampleRate: number;
        targetNumberOfChannels: number;
        onSample: (sample: AudioSample) => Promise<void>;
    });
    /**
     * Sets up the channel mixer to handle up/downmixing in the case where input and output channel counts don't match.
     */
    doChannelMixerSetup(): void;
    ensureTempBufferSize(requiredSamples: number): void;
    add(audioSample: AudioSample): Promise<void>;
    finalizeCurrentBuffer(): Promise<void>;
    finalize(): Promise<void>;
}
//# sourceMappingURL=resample.d.ts.map
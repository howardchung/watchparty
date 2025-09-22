import type { Track } from './Track.js';
/**
 * CMAF-HAM Audio Track type
 *
 * sampleRate - The sample rate of the audio track. It defines the number of samples per second in the audio.
 *              For example, if the sample rate is 44100, it means there are 44100 samples in each second of the audio.
 *
 * channels - The number of channels in the audio track. It defines the number of separate audio signals that are encoded in the audio.
 *            For example, if the channels is 2, it means the audio is stereo with a separate signal for left and right.
 *
 * @group CMAF
 * @alpha
 */
export type AudioTrack = Track & {
    sampleRate: number;
    channels: number;
};
//# sourceMappingURL=AudioTrack.d.ts.map
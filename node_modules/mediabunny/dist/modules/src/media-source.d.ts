/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { AudioCodec, SubtitleCodec, VideoCodec } from './codec.js';
import { EncodedPacket } from './packet.js';
import { AudioSample, VideoSample } from './sample.js';
import { AudioEncodingConfig, VideoEncodingConfig } from './encode.js';
/**
 * Base class for media sources. Media sources are used to add media samples to an output file.
 * @group Media sources
 * @public
 */
export declare abstract class MediaSource {
    /**
     * Closes this source. This prevents future samples from being added and signals to the output file that no further
     * samples will come in for this track. Calling `.close()` is optional but recommended after adding the
     * last sample - for improved performance and reduced memory usage.
     */
    close(): void;
}
/**
 * Base class for video sources - sources for video tracks.
 * @group Media sources
 * @public
 */
export declare abstract class VideoSource extends MediaSource {
    /** Internal constructor. */
    constructor(codec: VideoCodec);
}
/**
 * The most basic video source; can be used to directly pipe encoded packets into the output file.
 * @group Media sources
 * @public
 */
export declare class EncodedVideoPacketSource extends VideoSource {
    /** Creates a new {@link EncodedVideoPacketSource} whose packets are encoded using `codec`. */
    constructor(codec: VideoCodec);
    /**
     * Adds an encoded packet to the output video track. Packets must be added in *decode order*, while a packet's
     * timestamp must be its *presentation timestamp*. B-frames are handled automatically.
     *
     * @param meta - Additional metadata from the encoder. You should pass this for the first call, including a valid
     * decoder config.
     *
     * @returns A Promise that resolves once the output is ready to receive more samples. You should await this Promise
     * to respect writer and encoder backpressure.
     */
    add(packet: EncodedPacket, meta?: EncodedVideoChunkMetadata): Promise<void>;
}
/** Utility class for splitting a composite frame into separate color and alpha parts on the CPU in a worker. */
export declare class ColorAlphaSplitter {
    private worker;
    private pendingRequests;
    private nextRequestId;
    split(sourceFrame: VideoFrame): Promise<{
        colorFrame: VideoFrame;
        alphaFrame: VideoFrame;
    }>;
    close(): void;
}
/**
 * This source can be used to add raw, unencoded video samples (frames) to an output video track. These frames will
 * automatically be encoded and then piped into the output.
 * @group Media sources
 * @public
 */
export declare class VideoSampleSource extends VideoSource {
    /**
     * Creates a new {@link VideoSampleSource} whose samples are encoded according to the specified
     * {@link VideoEncodingConfig}.
     */
    constructor(encodingConfig: VideoEncodingConfig);
    /**
     * Encodes a video sample (frame) and then adds it to the output.
     *
     * @returns A Promise that resolves once the output is ready to receive more samples. You should await this Promise
     * to respect writer and encoder backpressure.
     */
    add(videoSample: VideoSample, encodeOptions?: VideoEncoderEncodeOptions): Promise<void>;
}
/**
 * This source can be used to add video frames to the output track from a fixed canvas element. Since canvases are often
 * used for rendering, this source provides a convenient wrapper around {@link VideoSampleSource}.
 * @group Media sources
 * @public
 */
export declare class CanvasSource extends VideoSource {
    /**
     * Creates a new {@link CanvasSource} from a canvas element or `OffscreenCanvas` whose samples are encoded
     * according to the specified {@link VideoEncodingConfig}.
     */
    constructor(canvas: HTMLCanvasElement | OffscreenCanvas, encodingConfig: VideoEncodingConfig);
    /**
     * Captures the current canvas state as a video sample (frame), encodes it and adds it to the output.
     *
     * @param timestamp - The timestamp of the sample, in seconds.
     * @param duration - The duration of the sample, in seconds.
     *
     * @returns A Promise that resolves once the output is ready to receive more samples. You should await this Promise
     * to respect writer and encoder backpressure.
     */
    add(timestamp: number, duration?: number, encodeOptions?: VideoEncoderEncodeOptions): Promise<void>;
}
/**
 * Options for {@link MediaStreamVideoTrackSource}.
 * @group Media sources
 * @public
 */
export type MediaStreamVideoTrackSourceOptions = {
    /**
     * The frame rate at which the underlying video track is sampled. Defaults to the frame rate specified in the
     * track's [`MediaTrackSettings`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings). Set to
     * `null` to only add a frame whenever the underlying track pushes one - this minimizes frame count but can
     * lead to wildly irregular FPS.
     */
    frameRate?: number | null;
    /**
     * Controls the basis (zero point) for video frame timestamps.
     *
     * When set to `'synced-zero'`, timestamps will be relative to the first chunk of media from a `MediaStreamTrack`
     * added to the {@link Output}.
     *
     * When set to `'zero'`, timestamps will be relative to the first video frame emitted by this source.
     *
     * When set to `'unix'`, timestamps will be relative to the Unix epoch, so clearly associated with a distinct point
     * in time. Here, pausing via {@link MediaStreamVideoTrackSource.pause} will also create gaps in timestamps. Be sure
     * to pair this mode with {@link BaseTrackMetadata.isRelativeToUnixEpoch}.
     *
     * Defaults to `'synced-zero'`.
     */
    timestampBase?: 'synced-zero' | 'zero' | 'unix';
};
/**
 * Video source that encodes the frames of a
 * [`MediaStreamVideoTrack`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) and pipes them into the
 * output. This is useful for capturing live or real-time data such as webcams or screen captures. Frames will
 * automatically start being captured once the connected {@link Output} is started, and will keep being captured until
 * the {@link Output} is finalized or this source is closed.
 * @group Media sources
 * @public
 */
export declare class MediaStreamVideoTrackSource extends VideoSource {
    /** A promise that rejects upon any error within this source. This promise never resolves. */
    get errorPromise(): Promise<void>;
    /** Whether this source is currently paused as a result of calling `.pause()`. */
    get paused(): boolean;
    /**
     * Creates a new {@link MediaStreamVideoTrackSource} from a
     * [`MediaStreamVideoTrack`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack), which will pull
     * video samples from the stream in real time and encode them according to {@link VideoEncodingConfig}.
     */
    constructor(track: MediaStreamVideoTrack, encodingConfig: VideoEncodingConfig, options?: MediaStreamVideoTrackSourceOptions);
    /**
     * Pauses the capture of video frames - any video frames emitted by the underlying media stream will be ignored
     * while paused. This does *not* close the underlying `MediaStreamVideoTrack`, it just ignores its output.
     */
    pause(): void;
    /** Resumes the capture of video frames after being paused. */
    resume(): void;
}
/**
 * Base class for audio sources - sources for audio tracks.
 * @group Media sources
 * @public
 */
export declare abstract class AudioSource extends MediaSource {
    /** Internal constructor. */
    constructor(codec: AudioCodec);
}
/**
 * The most basic audio source; can be used to directly pipe encoded packets into the output file.
 * @group Media sources
 * @public
 */
export declare class EncodedAudioPacketSource extends AudioSource {
    /** Creates a new {@link EncodedAudioPacketSource} whose packets are encoded using `codec`. */
    constructor(codec: AudioCodec);
    /**
     * Adds an encoded packet to the output audio track. Packets must be added in *decode order*.
     *
     * @param meta - Additional metadata from the encoder. You should pass this for the first call, including a valid
     * decoder config.
     *
     * @returns A Promise that resolves once the output is ready to receive more samples. You should await this Promise
     * to respect writer and encoder backpressure.
     */
    add(packet: EncodedPacket, meta?: EncodedAudioChunkMetadata): Promise<void>;
}
/**
 * This source can be used to add raw, unencoded audio samples to an output audio track. These samples will
 * automatically be encoded and then piped into the output.
 * @group Media sources
 * @public
 */
export declare class AudioSampleSource extends AudioSource {
    /**
     * Creates a new {@link AudioSampleSource} whose samples are encoded according to the specified
     * {@link AudioEncodingConfig}.
     */
    constructor(encodingConfig: AudioEncodingConfig);
    /**
     * Encodes an audio sample and then adds it to the output.
     *
     * @returns A Promise that resolves once the output is ready to receive more samples. You should await this Promise
     * to respect writer and encoder backpressure.
     */
    add(audioSample: AudioSample): Promise<void>;
}
/**
 * Options for {@link AudioBufferSource}.
 * @group Media sources
 * @public
 */
export type AudioBufferSourceOptions = {
    /**
     * The timestamp of the first `AudioBuffer`, in seconds. Subsequent buffers are placed directly after the previous
     * one. Defaults to 0.
     */
    startTimestamp?: number;
};
/**
 * This source can be used to add audio data from an AudioBuffer to the output track. This is useful when working with
 * the Web Audio API.
 * @group Media sources
 * @public
 */
export declare class AudioBufferSource extends AudioSource {
    /**
     * Creates a new {@link AudioBufferSource} whose `AudioBuffer` instances are encoded according to the specified
     * {@link AudioEncodingConfig} and {@link AudioBufferSourceOptions}.
     */
    constructor(encodingConfig: AudioEncodingConfig, options?: AudioBufferSourceOptions);
    /**
     * Converts an AudioBuffer to audio samples, encodes them and adds them to the output. The first `AudioBuffer` will
     * be played at the configured start timestamp (the default is 0), and each subsequent `AudioBuffer` will be placed
     * directly after the previous one.
     *
     * @returns A Promise that resolves once the output is ready to receive more samples. You should await this Promise
     * to respect writer and encoder backpressure.
     */
    add(audioBuffer: AudioBuffer): Promise<void>;
}
/**
 * Options for {@link MediaStreamAudioTrackSource}.
 * @group Media sources
 * @public
 */
export type MediaStreamAudioTrackSourceOptions = {
    /**
     * Controls the basis (zero point) for audio sample timestamps.
     *
     * When set to `'synced-zero'`, timestamps will be relative to the first chunk of media from a `MediaStreamTrack`
     * added to the {@link Output}.
     *
     * When set to `'zero'`, timestamps will be relative to the first audio sample emitted by this source.
     *
     * When set to `'unix'`, timestamps will be relative to the Unix epoch, so clearly associated with a distinct point
     * in time. Here, pausing via {@link MediaStreamAudioTrackSource.pause} will also create gaps in timestamps. Be sure
     * to pair this mode with {@link BaseTrackMetadata.isRelativeToUnixEpoch}.
     *
     * Defaults to `'synced-zero'`.
     */
    timestampBase?: 'synced-zero' | 'zero' | 'unix';
};
/**
 * Audio source that encodes the data of a
 * [`MediaStreamAudioTrack`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) and pipes it into the
 * output. This is useful for capturing live or real-time audio such as microphones or audio from other media elements.
 * Audio will automatically start being captured once the connected {@link Output} is started, and will keep being
 * captured until the {@link Output} is finalized or this source is closed.
 * @group Media sources
 * @public
 */
export declare class MediaStreamAudioTrackSource extends AudioSource {
    /** A promise that rejects upon any error within this source. This promise never resolves. */
    get errorPromise(): Promise<void>;
    /** Whether this source is currently paused as a result of calling `.pause()`. */
    get paused(): boolean;
    /**
     * Creates a new {@link MediaStreamAudioTrackSource} from a `MediaStreamAudioTrack`, which will pull audio samples
     * from the stream in real time and encode them according to {@link AudioEncodingConfig}.
     */
    constructor(track: MediaStreamAudioTrack, encodingConfig: AudioEncodingConfig, options?: MediaStreamAudioTrackSourceOptions);
    /**
     * Pauses the capture of audio data - any audio data emitted by the underlying media stream will be ignored
     * while paused. This does *not* close the underlying `MediaStreamAudioTrack`, it just ignores its output.
     */
    pause(): void;
    /** Resumes the capture of audio data after being paused. */
    resume(): void;
}
/**
 * Base class for subtitle sources - sources for subtitle tracks.
 * @group Media sources
 * @public
 */
export declare abstract class SubtitleSource extends MediaSource {
    /** Internal constructor. */
    constructor(codec: SubtitleCodec);
}
/**
 * This source can be used to add subtitles from a subtitle text file.
 * @group Media sources
 * @public
 */
export declare class TextSubtitleSource extends SubtitleSource {
    /** Creates a new {@link TextSubtitleSource} where added text chunks are in the specified `codec`. */
    constructor(codec: SubtitleCodec);
    /**
     * Parses the subtitle text according to the specified codec and adds it to the output track. You don't have to
     * add the entire subtitle file at once here; you can provide it in chunks.
     *
     * @returns A Promise that resolves once the output is ready to receive more samples. You should await this Promise
     * to respect writer and encoder backpressure.
     */
    add(text: string): Promise<void>;
}
//# sourceMappingURL=media-source.d.ts.map
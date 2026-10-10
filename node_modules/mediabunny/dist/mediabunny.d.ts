/// <reference types="dom-mediacapture-transform" />
/// <reference types="dom-webcodecs" />

/**
 * ADTS input format singleton.
 * @group Input formats
 * @public
 */
export declare const ADTS: AdtsInputFormat;

/**
 * ADTS file format.
 *
 * Do not instantiate this class; use the {@link ADTS} singleton instead.
 *
 * @group Input formats
 * @public
 */
export declare class AdtsInputFormat extends InputFormat {
    get name(): string;
    get mimeType(): string;
}

/**
 * ADTS file format.
 * @group Output formats
 * @public
 */
export declare class AdtsOutputFormat extends OutputFormat {
    /** Creates a new {@link AdtsOutputFormat} configured with the specified `options`. */
    constructor(options?: AdtsOutputFormatOptions);
    getSupportedTrackCounts(): TrackCountLimits;
    get fileExtension(): string;
    get mimeType(): string;
    getSupportedCodecs(): MediaCodec[];
    get supportsVideoTransformationMetadata(): boolean;
    get supportsTimestampedMediaData(): boolean;
    get negativeTimestampSupport(): null;
}

/**
 * ADTS-specific output options.
 * @group Output formats
 * @public
 */
export declare type AdtsOutputFormatOptions = {
    /**
     * Will be called for each ADTS frame that is written.
     *
     * @param data - The raw bytes.
     * @param position - The byte offset of the data in the file.
     */
    onFrame?: (data: Uint8Array, position: number) => unknown;
};

/**
 * List of all input format singletons. If you don't need to support all input formats, you should specify the
 * formats individually for better tree shaking.
 * @group Input formats
 * @public
 */
export declare const ALL_FORMATS: InputFormat[];

/**
 * List of all track types.
 * @group Miscellaneous
 * @public
 */
export declare const ALL_TRACK_TYPES: readonly ["video", "audio", "subtitle"];

/**
 * Sync or async iterable.
 * @group Miscellaneous
 * @public
 */
export declare type AnyIterable<T> = Iterable<T> | AsyncIterable<T>;

/**
 * This target writes to a `WritableStream<Uint8Array>`, meaning all writes are necessarily append-only and involve no
 * seeking. Great for streaming data to a source that can only accept sequential data, like an HTTP server processing
 * an incoming upload.
 *
 * Note that using this target *requires* that the underlying format write data sequentially. Not all formats do this,
 * and this target will throw for the formats that don't. Check the guide for more.
 *
 * @group Output targets
 * @public
 */
export declare class AppendOnlyStreamTarget extends Target {
    constructor(writable: WritableStream<Uint8Array>);
}

/**
 * Helper function for use in {@link InputTrackQuery.sortBy}, used to describe sorting tracks by a numeric property in
 * ascending order. `null` and `undefined` are accepted too and are last in the order (sorted to the end).
 *
 * @group Input files & tracks
 * @public
 */
export declare const asc: (value: number | null | undefined) => number;

/**
 * A file attached to a media file.
 *
 * @group Metadata tags
 * @public
 */
export declare class AttachedFile {
    /** The raw file data. */
    data: Uint8Array;
    /** An RFC 6838 MIME type (e.g. image/jpeg, image/png, font/ttf, etc.) */
    mimeType?: string | undefined;
    /** The name of the file. */
    name?: string | undefined;
    /** A description of the file. */
    description?: string | undefined;
    /** Creates a new {@link AttachedFile}. */
    constructor(
    /** The raw file data. */
    data: Uint8Array, 
    /** An RFC 6838 MIME type (e.g. image/jpeg, image/png, font/ttf, etc.) */
    mimeType?: string | undefined, 
    /** The name of the file. */
    name?: string | undefined, 
    /** A description of the file. */
    description?: string | undefined);
}

/**
 * An embedded image such as cover art, booklet scan, artwork or preview frame.
 *
 * @group Metadata tags
 * @public
 */
export declare type AttachedImage = {
    /** The raw image data. */
    data: Uint8Array;
    /** An RFC 6838 MIME type (e.g. image/jpeg, image/png, etc.) */
    mimeType: string;
    /** The kind or purpose of the image. */
    kind: 'coverFront' | 'coverBack' | 'unknown';
    /** The name of the image file. */
    name?: string;
    /** A description of the image. */
    description?: string;
};

/**
 * List of known audio codecs, ordered by encoding preference.
 * @group Codecs
 * @public
 */
export declare const AUDIO_CODECS: readonly ["aac", "opus", "mp3", "vorbis", "flac", "ac3", "eac3", "dts", "pcm-s16", "pcm-s16be", "pcm-s24", "pcm-s24be", "pcm-s32", "pcm-s32be", "pcm-f32", "pcm-f32be", "pcm-f64", "pcm-f64be", "pcm-u8", "pcm-s8", "ulaw", "alaw"];

/**
 * A sink that retrieves decoded audio samples from an audio track and converts them to `AudioBuffer` instances. This is
 * often more useful than directly retrieving audio samples, as audio buffers can be directly used with the
 * Web Audio API.
 * @group Media sinks
 * @public
 */
export declare class AudioBufferSink {
    /** Creates a new {@link AudioBufferSink} for the given {@link InputAudioTrack}. */
    constructor(audioTrack: InputAudioTrack);
    /**
     * Retrieves the audio buffer corresponding to the given timestamp, in seconds. More specifically, returns
     * the last audio buffer (in presentation order) with a start timestamp less than or equal to the given timestamp.
     * Returns null if the timestamp is before the track's first timestamp.
     *
     * @param timestamp - The timestamp used for retrieval, in seconds.
     * @param options - Options used for the underlying packet retrieval.
     */
    getBuffer(timestamp: number, options?: PacketRetrievalOptions): Promise<WrappedAudioBuffer | null>;
    /**
     * Creates an async iterator that yields audio buffers of this track in presentation order. This method
     * will intelligently pre-decode a few buffers ahead to enable fast iteration.
     *
     * @param startTimestamp - The timestamp in seconds at which to start yielding buffers (inclusive).
     * @param endTimestamp - The timestamp in seconds at which to stop yielding buffers (exclusive).
     * @param options - Options used for the underlying packet retrieval.
     */
    buffers(startTimestamp?: number, endTimestamp?: number, options?: PacketRetrievalOptions): AsyncGenerator<WrappedAudioBuffer, void, unknown>;
    /**
     * Creates an async iterator that yields an audio buffer for each timestamp in the argument. This method
     * uses an optimized decoding pipeline if these timestamps are monotonically sorted, decoding each packet at most
     * once, and is therefore more efficient than manually getting the buffer for every timestamp. The iterator may
     * yield null if no buffer is available for a given timestamp.
     *
     * @param timestamps - An iterable or async iterable of timestamps in seconds.
     * @param options - Options used for the underlying packet retrieval.
     */
    buffersAtTimestamps(timestamps: AnyIterable<number>, options?: PacketRetrievalOptions): AsyncGenerator<WrappedAudioBuffer | null, void, unknown>;
}

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
    constructor(encodingConfig: AudioEncodingConfig, options?: AudioBufferSourceOptions_2);
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
 * Options for {@link AudioBufferSource}.
 * @group Media sources
 * @public
 */
declare type AudioBufferSourceOptions_2 = {
    /**
     * The timestamp of the first `AudioBuffer`, in seconds. Subsequent buffers are placed directly after the previous
     * one. Defaults to 0.
     */
    startTimestamp?: number;
};
export { AudioBufferSourceOptions_2 as AudioBufferSourceOptions }

/**
 * Union type of known audio codecs.
 * @group Codecs
 * @public
 */
export declare type AudioCodec = typeof AUDIO_CODECS[number];

/**
 * Additional options that control audio encoding.
 * @group Encoding
 * @public
 */
export declare type AudioEncodingAdditionalOptions = {
    /**
     * Configures the bitrate mode. A bitrate mode set directly on a {@link Quality} takes precedence over this field.
     * @deprecated Specify the bitrate mode in the {@link Quality} instead.
     */
    bitrateMode?: 'constant' | 'variable';
    /**
     * The full codec string as specified in the Mediabunny Codec Registry. This string must match the codec
     * specified in `codec`. When not set, a fitting codec string will be constructed automatically by the library.
     */
    fullCodecString?: string;
};

/**
 * Configuration object that controls audio encoding. Can be used to set codec, quality, and more.
 * @group Encoding
 * @public
 */
export declare type AudioEncodingConfig = {
    /** The audio codec that should be used for encoding the audio samples. */
    codec: AudioCodec;
    /**
     * The desired quality of the encoded audio. Required for compressed audio codecs, unused for PCM codecs.
     */
    quality?: Quality;
    /**
     * The target bitrate for the encoded audio, in bits per second. Alternatively, a {@link Quality} can be provided.
     * @deprecated Use `quality` instead.
     */
    bitrate?: number | Quality;
    /**
     * Optional transformations to apply to the audio samples before they are passed to the encoder.
     */
    transform?: AudioTransformOptions;
    /** Called for each successfully encoded packet. Both the packet and the encoding metadata are passed. */
    onEncodedPacket?: (packet: EncodedPacket, meta: EncodedAudioChunkMetadata | undefined) => unknown;
    /**
     * Called when the internal [encoder config](https://www.w3.org/TR/webcodecs/#audio-encoder-config), as used by the
     * WebCodecs API, is created.
     */
    onEncoderConfig?: (config: AudioEncoderConfig) => unknown;
    /** Called right before a sample is passed to the encoder. */
    onEncodedSample?: (sample: AudioSample) => unknown;
} & AudioEncodingAdditionalOptions;

/**
 * Represents a raw, unencoded audio sample. Mainly used as an expressive wrapper around WebCodecs API's
 * [`AudioData`](https://developer.mozilla.org/en-US/docs/Web/API/AudioData), but can also be used standalone.
 * @group Samples
 * @public
 */
export declare class AudioSample implements Disposable {
    /**
     * The audio sample format.
     * [See sample formats](https://developer.mozilla.org/en-US/docs/Web/API/AudioData/format)
     */
    readonly format: AudioSampleFormat;
    /** The audio sample rate in hertz. */
    readonly sampleRate: number;
    /**
     * The number of audio frames in the sample, per channel. In other words, the length of this audio sample in frames.
     */
    readonly numberOfFrames: number;
    /** The number of audio channels. */
    readonly numberOfChannels: number;
    /** The duration of the sample in seconds. */
    readonly duration: number;
    /**
     * The presentation timestamp of the sample in seconds. May be negative. Samples with negative end timestamps should
     * not be presented.
     */
    readonly timestamp: number;
    /** The presentation timestamp of the sample in microseconds. */
    get microsecondTimestamp(): number;
    /** The duration of the sample in microseconds. */
    get microsecondDuration(): number;
    /**
     * Creates a new {@link AudioSample}, either from an existing
     * [`AudioData`](https://developer.mozilla.org/en-US/docs/Web/API/AudioData) or from raw bytes specified in
     * {@link AudioSampleInit}.
     */
    constructor(init: AudioData | AudioSampleInit | AudioSampleResource);
    /** Returns the number of bytes required to hold the audio sample's data as specified by the given options. */
    allocationSize(options: AudioSampleCopyToOptions): number;
    /** Copies the audio sample's data to an ArrayBuffer or ArrayBufferView as specified by the given options. */
    copyTo(destination: AllowSharedBufferSource, options: AudioSampleCopyToOptions): void;
    /** Clones this audio sample. */
    clone(): AudioSample;
    /**
     * Returns a new {@link AudioSample} containing only the frames in the range [startFrame, endFrame). Both bounds
     * must lie within this sample's range of frames. The returned sample's timestamp is shifted to match the start of
     * the trimmed section.
     */
    trim(startFrame: number, endFrame?: number): AudioSample;
    /**
     * Closes this audio sample, releasing held resources. Audio samples should be closed as soon as they are not
     * needed anymore.
     */
    close(): void;
    /**
     * Converts this audio sample to an AudioData for use with the WebCodecs API. The AudioData returned by this
     * method *must* be closed separately from this audio sample.
     */
    toAudioData(): AudioData;
    /** Convert this audio sample to an AudioBuffer for use with the Web Audio API. */
    toAudioBuffer(): AudioBuffer;
    /** Sets the presentation timestamp of this audio sample, in seconds. */
    setTimestamp(newTimestamp: number): void;
    /** Calls `.close()`. */
    [Symbol.dispose](): void;
    /**
     * Creates AudioSamples from an AudioBuffer, starting at the given timestamp in seconds. Typically creates exactly
     * one sample, but may create multiple if the AudioBuffer is exceedingly large.
     */
    static fromAudioBuffer(audioBuffer: AudioBuffer, timestamp: number): AudioSample[];
}

/**
 * Options used for copying audio sample data.
 * @group Samples
 * @public
 */
export declare type AudioSampleCopyToOptions = {
    /**
     * The index identifying the plane to copy from. This must be 0 if using a non-planar (interleaved) output format.
     */
    planeIndex: number;
    /**
     * The output format for the destination data. Defaults to the AudioSample's format.
     * [See sample formats](https://developer.mozilla.org/en-US/docs/Web/API/AudioData/format)
     */
    format?: AudioSampleFormat;
    /** An offset into the source plane data indicating which frame to begin copying from. Defaults to 0. */
    frameOffset?: number;
    /**
     * The number of frames to copy. If not provided, the copy will include all frames in the plane beginning
     * with frameOffset.
     */
    frameCount?: number;
};

/**
 * Metadata used for AudioSample initialization.
 * @group Samples
 * @public
 */
export declare type AudioSampleInit = {
    /** The audio data for this sample. */
    data: AllowSharedBufferSource;
    /**
     * The audio sample format. [See sample formats](https://developer.mozilla.org/en-US/docs/Web/API/AudioData/format)
     */
    format: AudioSampleFormat;
    /** The number of audio channels. */
    numberOfChannels: number;
    /** The audio sample rate in hertz. */
    sampleRate: number;
    /** The presentation timestamp of the sample in seconds. */
    timestamp: number;
};

/**
 * Abstract base class for custom audio sample resources. Implement this class to provide custom backing
 * for AudioSample instances.
 * @group Samples
 * @public
 */
export declare abstract class AudioSampleResource {
    /**
     * Returns the audio sample format.
     * [See sample formats](https://developer.mozilla.org/en-US/docs/Web/API/AudioData/format)
     */
    abstract getFormat(): AudioSampleFormat;
    /** Returns the audio sample rate in hertz. */
    abstract getSampleRate(): number;
    /** Returns the number of audio frames in the sample, per channel. */
    abstract getNumberOfFrames(): number;
    /** Returns the number of audio channels. */
    abstract getNumberOfChannels(): number;
    /** Returns the presentation timestamp of the sample in seconds. */
    abstract getTimestamp(): number;
    /**
     * Closes this resource, releasing held resources. Called automatically when the last {@link AudioSample} using this
     * resource is closed.
     */
    abstract close(): void;
    /**
     * Returns the audio sample data for the plane given by `planeIndex`. The audio data must be in the format returned
     * by `getFormat()`. For interleaved formats, there is only one plane.
     */
    abstract getDataPlane(planeIndex: number): Uint8Array;
}

/**
 * Sink for retrieving decoded audio samples from an audio track.
 * @group Media sinks
 * @public
 */
export declare class AudioSampleSink extends BaseMediaSampleSink<AudioSample> {
    /** Creates a new {@link AudioSampleSink} for the given {@link InputAudioTrack}. */
    constructor(audioTrack: InputAudioTrack);
    /**
     * Retrieves the audio sample corresponding to the given timestamp, in seconds. More specifically, returns
     * the last audio sample (in presentation order) with a start timestamp less than or equal to the given timestamp.
     * Returns null if the timestamp is before the track's first timestamp.
     *
     * @param timestamp - The timestamp used for retrieval, in seconds.
     * @param options - Options used for the underlying packet retrieval.
     */
    getSample(timestamp: number, options?: PacketRetrievalOptions): Promise<AudioSample | null>;
    /**
     * Creates an async iterator that yields the audio samples of this track in presentation order. This method
     * will intelligently pre-decode a few samples ahead to enable fast iteration.
     *
     * @param startTimestamp - The timestamp in seconds at which to start yielding samples (inclusive).
     * @param endTimestamp - The timestamp in seconds at which to stop yielding samples (exclusive).
     * @param options - Options used for the underlying packet retrieval.
     */
    samples(startTimestamp?: number, endTimestamp?: number, options?: PacketRetrievalOptions): AsyncGenerator<AudioSample, void, unknown>;
    /**
     * Creates an async iterator that yields an audio sample for each timestamp in the argument. This method
     * uses an optimized decoding pipeline if these timestamps are monotonically sorted, decoding each packet at most
     * once, and is therefore more efficient than manually getting the sample for every timestamp. The iterator may
     * yield null if no sample is available for a given timestamp.
     *
     * This method is good for sparse access of media data. If you want primarily sequential media access, prefer
     * {@link AudioSampleSink.samples} instead.
     *
     * @param timestamps - An iterable or async iterable of timestamps in seconds.
     * @param options - Options used for the underlying packet retrieval.
     */
    samplesAtTimestamps(timestamps: AnyIterable<number>, options?: PacketRetrievalOptions): AsyncGenerator<AudioSample | null, void, unknown>;
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
 * Base class for audio sources - sources for audio tracks.
 * @group Media sources
 * @public
 */
export declare abstract class AudioSource extends MediaSource_2 {
    /** Internal constructor. */
    constructor(codec: AudioCodec);
}

/**
 * Additional metadata for audio tracks.
 * @group Output files
 * @public
 */
export declare type AudioTrackMetadata = BaseTrackMetadata & {
    /**
     * The decoder config for this audio track, provided ahead of time. This is provided automatically when media data
     * added to the track, but by specifying it here, you give the muxer additional information that it can make use of.
     * Zero-packet tracks become possible to write when this field is set.
     */
    decoderConfig?: AudioDecoderConfig;
    /**
     * Can be provided in addition to {@link AudioTrackMetadata.decoderConfig} to provide additional track information
     * not included in the decoder config. This packet will not be added to the media data.
     */
    primingPacket?: EncodedPacket;
};

/**
 * Options for transforming audio samples before encoding.
 * @group Encoding
 * @public
 */
export declare type AudioTransformOptions = {
    /** The desired number of output channels to up/downmix to. */
    numberOfChannels?: number;
    /** The desired output sample rate in hertz to resample to. */
    sampleRate?: number;
    /**
     * The desired sample format (and therefore bit depth) of the audio samples before they are passed to the encoder.
     * Can be used to control bit depth with certain output codecs such as FLAC.
     */
    sampleFormat?: 'u8' | 's16' | 's32' | 'f32';
    /**
     * Allows for custom user-defined processing of audio samples, e.g. for applying audio effects or timestamp
     * modifications. Called for each audio sample after resampling and remixing.
     *
     * Must return an {@link AudioSample}, an array of them, or `null` for dropping the sample.
     */
    process?: (sample: AudioSample) => MaybePromise<AudioSample | AudioSample[] | null>;
};

/**
 * Base class for decoded media sample sinks.
 * @group Media sinks
 * @public
 */
export declare abstract class BaseMediaSampleSink<MediaSample extends VideoSample | AudioSample> {
}

/**
 * Base track metadata, applicable to all tracks.
 * @group Output files
 * @public
 */
export declare type BaseTrackMetadata = {
    /** The three-letter, ISO 639-2/T language code specifying the language of this track. */
    languageCode?: string;
    /** A user-defined name for this track, like "English" or "Director Commentary". */
    name?: string;
    /** The track's disposition, i.e. information about its intended usage. */
    disposition?: Partial<TrackDisposition>;
    /**
     * The maximum amount of encoded packets that will be added to this track. Setting this field provides the muxer
     * with an additional signal that it can use to preallocate space in the file.
     *
     * When this field is set, it is an error to provide more packets than whatever this field specifies.
     *
     * Predicting the maximum packet count requires considering both the maximum duration as well as the codec.
     * - For video codecs, you can assume one packet per frame.
     * - For audio codecs, there is one packet for each "audio chunk", the duration of which depends on the codec. For
     * simplicity, you can assume each packet is roughly 10 ms or 512 samples long, whichever is shorter.
     * - For subtitles, assume each cue and each gap in the subtitles adds a packet.
     *
     * If you're not fully sure, make sure to add a buffer of around 33% to make sure you stay below the maximum.
     */
    maximumPacketCount?: number;
    /**
     * The peak bitrate of this track in bits per second. The muxer will use this value as a fallback when no better
     * value is available.
     */
    bitrate?: number;
    /**
     * The average bitrate of this track in bits per second. The muxer will use this value as a fallback when no better
     * value is available.
     */
    averageBitrate?: number;
    /**
     * Whether the timestamps of this track are relative to the Unix epoch (January 1, 1970, 00:00:00 UTC). When `true`,
     * each timestamp maps to a definitive point in time.
     */
    isRelativeToUnixEpoch?: boolean;
    /**
     * Defines the group(s) this track is a part of. Group assignment determines track pairability, determining which
     * tracks can be presented together with other tracks. This is needed for configuring things like HLS master
     * playlists.
     *
     * Two tracks are considered pairable if they are in the same group but are of different {@link TrackType}, or if
     * they are in two separate groups that have been paired with each other.
     *
     * If left blank, a track is automatically assigned to {@link Output.defaultTrackGroup}.
     */
    group?: OutputTrackGroup | OutputTrackGroup[];
};

/**
 * A source backed by a [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob). Since a
 * [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) is also a `Blob`, this is the source to use when
 * reading files off the disk.
 * @group Input sources
 * @public
 */
export declare class BlobSource extends Source {
    /**
     * Creates a new {@link BlobSource} backed by the specified
     * [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob).
     */
    constructor(blob: Blob, options?: BlobSourceOptions);
}

/**
 * Options for {@link BlobSource}.
 * @group Input sources
 * @public
 */
export declare type BlobSourceOptions = {
    /** The maximum number of bytes the cache is allowed to hold in memory. Defaults to 8 MiB. */
    maxCacheSize?: number;
    /**
     * Defaults to `true`. When `true`, Mediabunny will acquire a `ReadableStream` reader internally to efficiently read
     * data from the blob. Since this can lead to errors in some (very) rare cases due to browser bugs, you can set this
     * field to `false` to try a slower but more stable reading method.
     */
    useStreamReader?: boolean;
    /** Handles errors that occur while no read is pending. By default, these become unhandled rejections. */
    handleUnhandledError?: (error: unknown) => unknown;
};

/**
 * A source backed by an ArrayBuffer or ArrayBufferView, with the entire file held in memory.
 * @group Input sources
 * @public
 */
declare class BufferSource_2 extends Source {
    /**
     * Creates a new {@link BufferSource} backed by the specified `ArrayBuffer`, `SharedArrayBuffer`,
     * or `ArrayBufferView`.
     */
    constructor(buffer: AllowSharedBufferSource);
}
export { BufferSource_2 as BufferSource }

/**
 * A target that writes data directly into an ArrayBuffer in memory. Great for performance, but not suitable for very
 * large files. The buffer will be available once the output has been finalized.
 * @group Output targets
 * @public
 */
export declare class BufferTarget extends Target {
    /** Stores the final output buffer. Until the output is finalized, this will be `null`. */
    buffer: ArrayBuffer | null;
    /** Creates a new {@link BufferTarget}. The buffer holding the data will be created and managed internally. */
    constructor(options?: BufferTargetOptions);
}

/**
 * Options for {@link BufferTarget}.
 * @group Output targets
 * @public
 */
export declare type BufferTargetOptions = {
    /**
     * Called once the target has been finalized, with the complete output buffer. If you return a promise, it will be
     * used to apply backpressure internally.
     *
     * One use for this callback is for uploading to a server where the full buffer must be known before
     * sending (e.g. S3 PutObject) and stream-uploading is not an option.
     */
    onFinalize?: (buffer: ArrayBuffer) => MaybePromise<unknown>;
};

/**
 * Checks if the browser is able to decode the given codec.
 * @group Decoding
 * @public
 */
export declare const canDecode: (codec: MediaCodec) => false | Promise<boolean>;

/**
 * Checks if the browser is able to decode the given audio codec with the given parameters.
 * @group Decoding
 * @public
 */
export declare const canDecodeAudio: (codec: AudioCodec, options?: SetOptional<AudioDecoderConfig, "codec" | "numberOfChannels" | "sampleRate">) => Promise<boolean>;

/**
 * Checks if the browser is able to decode the given video codec with the given parameters.
 * @group Decoding
 * @public
 */
export declare const canDecodeVideo: (codec: VideoCodec, options?: SetOptional<VideoDecoderConfig, "codec">) => Promise<boolean>;

/**
 * Checks if the browser is able to encode the given codec.
 * @group Encoding
 * @public
 */
export declare const canEncode: (codec: MediaCodec) => Promise<boolean>;

/**
 * Checks if the browser is able to encode the given audio codec with the given parameters.
 * @group Encoding
 * @public
 */
export declare const canEncodeAudio: (codec: AudioCodec, options?: {
    /** The number of audio channels. */
    numberOfChannels?: number;
    /** The sample rate in hertz. */
    sampleRate?: number;
    /** The desired quality of the encoded audio. */
    quality?: Quality;
    /**
     * The target bitrate for the encoded audio, in bits per second. Alternatively, a {@link Quality} can
     * be provided.
     * @deprecated Use `quality` instead.
     */
    bitrate?: number | Quality;
} & AudioEncodingAdditionalOptions) => Promise<boolean>;

/**
 * Checks if the browser is able to encode the given subtitle codec.
 * @group Encoding
 * @public
 */
export declare const canEncodeSubtitles: (codec: SubtitleCodec) => Promise<boolean>;

/**
 * Checks if the browser is able to encode the given video codec with the given parameters.
 * @group Encoding
 * @public
 */
export declare const canEncodeVideo: (codec: VideoCodec, options?: {
    /** The width of the video in pixels. */
    width?: number;
    /** The height of the video in pixels. */
    height?: number;
    /** The desired quality of the encoded video. */
    quality?: Quality;
    /**
     * The target bitrate for the encoded video, in bits per second. Alternatively, a {@link Quality} can
     * be provided.
     * @deprecated Use `quality` instead.
     */
    bitrate?: number | Quality;
    /** The expected frame rate in frames per second, if known. */
    frameRate?: number;
} & VideoEncodingAdditionalOptions) => Promise<boolean>;

/**
 * A sink that renders video samples (frames) of the given video track to canvases. This is often more useful than
 * directly retrieving frames, as it comes with common preprocessing steps such as resizing or applying rotation and
 * flip metadata.
 *
 * This sink will yield `HTMLCanvasElement`s when in a DOM context, and `OffscreenCanvas`es otherwise.
 *
 * @group Media sinks
 * @public
 */
export declare class CanvasSink {
    /** Creates a new {@link CanvasSink} for the given {@link InputVideoTrack}. */
    constructor(videoTrack: InputVideoTrack, options?: CanvasSinkOptions);
    /**
     * Retrieves a canvas with the video frame corresponding to the given timestamp, in seconds. More specifically,
     * returns the last video frame (in presentation order) with a start timestamp less than or equal to the given
     * timestamp. Returns null if the timestamp is before the track's first timestamp.
     *
     * @param timestamp - The timestamp used for retrieval, in seconds.
     * @param options - Options used for the underlying packet retrieval.
     */
    getCanvas(timestamp: number, options?: PacketRetrievalOptions): Promise<WrappedCanvas | null>;
    /**
     * Creates an async iterator that yields canvases with the video frames of this track in presentation order. This
     * method will intelligently pre-decode a few frames ahead to enable fast iteration.
     *
     * @param startTimestamp - The timestamp in seconds at which to start yielding canvases (inclusive).
     * @param endTimestamp - The timestamp in seconds at which to stop yielding canvases (exclusive).
     * @param options - Options used for the underlying packet retrieval.
     */
    canvases(startTimestamp?: number, endTimestamp?: number, options?: PacketRetrievalOptions): AsyncGenerator<WrappedCanvas, void, unknown>;
    /**
     * Creates an async iterator that yields a canvas for each timestamp in the argument. This method uses an optimized
     * decoding pipeline if these timestamps are monotonically sorted, decoding each packet at most once, and is
     * therefore more efficient than manually getting the canvas for every timestamp. The iterator may yield null if
     * no frame is available for a given timestamp.
     *
     * This method is good for sparse access of media data. If you want primarily sequential media access, prefer
     * {@link CanvasSink.canvases} instead.
     *
     * @param timestamps - An iterable or async iterable of timestamps in seconds.
     * @param options - Options used for the underlying packet retrieval.
     */
    canvasesAtTimestamps(timestamps: AnyIterable<number>, options?: PacketRetrievalOptions): AsyncGenerator<WrappedCanvas | null, void, unknown>;
}

/**
 * Options for constructing a CanvasSink.
 * @group Media sinks
 * @public
 */
export declare type CanvasSinkOptions = {
    /**
     * Whether the output canvases should have transparency instead of a black background. Defaults to `false`. Set
     * this to `true` when using this sink to read transparent videos.
     */
    alpha?: boolean;
    /**
     * The width of the output canvas in pixels, defaulting to the display width of the video track. If height is not
     * set, it will be deduced automatically based on aspect ratio.
     */
    width?: number;
    /**
     * The height of the output canvas in pixels, defaulting to the display height of the video track. If width is not
     * set, it will be deduced automatically based on aspect ratio.
     */
    height?: number;
    /**
     * The fitting algorithm in case both width and height are set.
     *
     * - `'fill'` will stretch the image to fill the entire box, potentially altering aspect ratio.
     * - `'contain'` will contain the entire image within the box while preserving aspect ratio. This may lead to
     * letterboxing.
     * - `'cover'` will scale the image until the entire box is filled, while preserving aspect ratio.
     */
    fit?: 'fill' | 'contain' | 'cover';
    /**
     * The clockwise rotation by which to rotate the raw video frame. Defaults to the rotation set in the file metadata.
     * Rotation is applied before flipping.
     */
    rotation?: Rotation;
    /**
     * Whether to flip the raw video frame horizontally (about the vertical axis). Defaults to the flip set in the file
     * metadata. The flip is applied after rotation but before cropping and resizing.
     */
    flip?: boolean;
    /**
     * Specifies the rectangular region of the input video to crop to. The crop region will automatically be clamped to
     * the dimensions of the input video track. Cropping is performed after rotation and flip but before resizing. The
     * crop region is in the _display pixel space_ of the underlying video data.
     */
    crop?: CropRectangle;
    /**
     * When set, specifies the number of canvases in the pool. These canvases will be reused in a ring buffer /
     * round-robin type fashion. This keeps the amount of allocated VRAM constant and relieves the browser from
     * constantly allocating/deallocating canvases. A pool size of 0 or `undefined` disables the pool and means a new
     * canvas is created each time.
     */
    poolSize?: number;
    /** Additional preferences for the underlying video decoder. */
    decoderOptions?: VideoSinkDecoderOptions;
};

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
 * Creates a single Common Media Application Format (CMAF) segment. An init segment will be written to the
 * {@link Target} specified in {@link OutputOptions.initTarget}. Supports most codecs.
 * @group Output formats
 * @public
 */
export declare class CmafOutputFormat extends IsobmffOutputFormat {
    /** Creates a new {@link CmafOutputFormat} configured with the specified `options`. */
    constructor(options?: CmafOutputFormatOptions);
    get fileExtension(): string;
    get mimeType(): string;
    getSupportedCodecs(): MediaCodec[];
}

/**
 * CMAF-specific output options.
 * @group Output formats
 * @public
 */
export declare type CmafOutputFormatOptions = Omit<IsobmffOutputFormatOptions, 'fastStart'> & {
    /**
     * Controls the minimum duration of each fragment, in seconds. New fragments will only be created when the current
     * fragment is longer than this value. Defaults to `Infinity`, meaning the file will contain only one fragment.
     */
    minimumFragmentDuration?: number;
};

/**
 * Utility class for running async functions in parallel up to a certain level of parallelism. Can be used to apply
 * backpressure only if the concurrency level would be exceeded.
 *
 * @group Miscellaneous
 * @public
 */
export declare class ConcurrentRunner {
    /**
     * The maximum number of in-flight promises. You can also think of it as the "high water mark".
     * You can set this value to dynamically change the level of parallelism.
     */
    parallelism: number;
    constructor(parallelism: number);
    /** Whether any function has errored. The runner is effectively bricked if this is `true`, by design. */
    get errored(): boolean;
    /** The number of tasks currently running. */
    get inFlightCount(): number;
    /**
     * Schedules an async function to be run. If the maximum allowed level of parallelism has not yet been reached,
     * the function will be executed immediately and `run()` will resolve immediately. Otherwise, the function will be
     * called as soon as any currently-running function finishes, and `run()` will only resolve then.
     *
     * Throws if the runner is errored.
     */
    run(fn: () => Promise<unknown>): Promise<void>;
    /** Waits for all currently running functions to finish. Throws if the runner is errored. */
    flush(): Promise<void>;
}

/**
 * Represents a media file conversion process, used to convert one media file into another. In addition to conversion,
 * this class can be used to resize and rotate video, resample audio, drop tracks, or trim to a specific time range.
 * @group Conversion
 * @public
 */
export declare class Conversion {
    /** The input file. */
    readonly input: Input;
    /** The output file. */
    readonly output: Output;
    /**
     * A callback that is fired whenever the conversion progresses. Gets passed as first argument a number between
     * 0 and 1, indicating the completion of the conversion. Note that a progress of 1 doesn't necessarily mean the
     * conversion is complete; the conversion is complete once `execute()` resolves.
     *
     * As second argument, this callback receives the input time in seconds that has been processed.
     *
     * In order for progress to be computed, this property must be set before `execute` is called.
     */
    onProgress?: (progress: number, processedTime: number) => unknown;
    /**
     * Whether this conversion, as it has been configured, is valid and can be executed. If this field is `false`, check
     * the `discardedTracks` field for reasons. Composable conversions are always valid, even if they utilize
     * zero tracks.
     *
     * Note: a conversion having discarded tracks does not automatically mean it is invalid; if the remaining, utilized
     * tracks make for a valid output file, the conversion is still allowed.
     */
    isValid: boolean;
    /**
     * The list of tracks that are included in the output file. When fan-out is used, the same track appears in this
     * array multiple times.
     */
    readonly utilizedTracks: InputTrack[];
    /** The list of tracks from the input file that have been discarded, alongside the discard reason. */
    readonly discardedTracks: DiscardedTrack[];
    /**
     * The current state of the conversion.
     *
     * - `'idle'`: The conversion is not currently executing and isn't done; `execute` can be called.
     * - `'executing'`: A call to `execute` is currently running.
     * - `'canceled'`: The conversion has been canceled and can no longer be executed.
     * - `'done'`: The conversion has run to completion. Subsequent calls to `execute` do nothing.
     */
    get state(): "done" | "canceled" | "idle" | "executing";
    /** Initializes a new conversion process without starting the conversion. */
    static init(options: ConversionOptions): Promise<Conversion>;
    /** Creates a new Conversion instance (duh). */
    private constructor();
    /**
     * Executes the conversion process and resolves when the conversion is complete. When
     * {@link ConversionExecuteOptions.until} is provided, the conversion will be suspended once that output timestamp
     * is reached and can be resumed with another call to `execute`. An ongoing execution may also be suspended via
     * {@link ConversionExecuteOptions.pauseSignal}.
     *
     * Execution will throw if `isValid` is `false`.
     */
    execute(options?: ConversionExecuteOptions): Promise<void>;
    /**
     * Cancels the conversion process, causing any ongoing `execute` call to throw a `ConversionCanceledError`.
     * Does nothing if the conversion is already complete.
     */
    cancel(): Promise<void>;
}

/**
 * Audio-specific options.
 * @group Conversion
 * @public
 */
export declare type ConversionAudioOptions = {
    /** If `true`, all audio tracks will be discarded and will not be present in the output. */
    discard?: boolean;
    /** The desired channel count of the output audio. */
    numberOfChannels?: number;
    /** The desired sample rate of the output audio, in hertz. */
    sampleRate?: number;
    /**
     * The desired sample format (and therefore bit depth) of the audio samples before they are passed to the encoder.
     * Can be used to control bit depth with certain output codecs such as FLAC.
     *
     * Setting this field forces audio transcoding.
     */
    sampleFormat?: 'u8' | 's16' | 's32' | 'f32';
    /** The desired output audio codec. */
    codec?: AudioCodec;
    /** The desired quality of the output audio. */
    quality?: Quality;
    /**
     * The desired bitrate of the output audio.
     * @deprecated Use `quality` instead.
     */
    bitrate?: number | Quality;
    /** When `true`, audio will always be re-encoded instead of directly copying over the encoded packets. */
    forceTranscode?: boolean;
    /**
     * Allows for custom user-defined processing of audio samples, e.g. for applying audio effects, transformations, or
     * timestamp modifications. Will be called for each input audio sample after remixing and resampling.
     *
     * Must return an {@link AudioSample}, an array of them, or `null` for dropping the sample.
     *
     * This function can also be used to manually perform remixing or resampling. When doing so, you should signal the
     * post-process parameters using the `processedNumberOfChannels` and `processedSampleRate` fields, which enables the
     * encoder to better know what to expect. If these fields aren't set, Mediabunny will assume you won't perform
     * remixing or resampling.
     */
    process?: (sample: AudioSample) => MaybePromise<AudioSample | AudioSample[] | null>;
    /**
     * An optional hint specifying the channel count of audio samples returned by the `process` function, for better
     * encoder configuration.
     */
    processedNumberOfChannels?: number;
    /**
     * An optional hint specifying the sample rate of audio samples returned by the `process` function, for better
     * encoder configuration.
     */
    processedSampleRate?: number;
    /**
     * Defines the group(s) the output track is a part of. For more, see {@link BaseTrackMetadata.group}.
     *
     * If left blank, tracks will internally be assigned to groups such that the output track pairability graph exactly
     * matches the input track pairability graph.
     */
    group?: OutputTrackGroup | OutputTrackGroup[];
};

/**
 * Thrown when a conversion couldn't complete due to being canceled.
 * @group Conversion
 * @public
 */
export declare class ConversionCanceledError extends Error {
    /** Creates a new {@link ConversionCanceledError}. */
    constructor(message?: string);
}

/**
 * Options for copying encoded media during conversion.
 * @group Conversion
 * @public
 */
export declare type ConversionCopyOptions = {
    /**
     * Controls whether media copying is preferred or required. Defaults to `'preferred'`.
     *
     * - `'forced'`: Copy encoded media where possible and discard tracks that cannot possibly be copied.
     * - `'preferred'`: Copy encoded media when possible, and transcode tracks that cannot be copied.
     */
    mode?: 'forced' | 'preferred';
    /**
     * The maximum absolute shift, in seconds, that may be applied to the media to be able to copy it into the output
     * format. Defaults to `0`, which permits no additional shift. Set to `Infinity` to permit any shift.
     *
     * A shift of `0` gives you perfect _timeline sync_: output timestamps will match input timestamps exactly (only
     * offset by the trim region). Any non-zero shift will break this property but will still, under all circumstances,
     * maintain perfect cross-track and audio-video sync.
     */
    shiftTolerance?: number;
    /**
     * Controls which media region will be copied to satisfy the requested trim range. Defaults to `'expand'`.
     *
     * - `'expand'`: Include at least all media in the requested range. This may require expanding the media region due
     * to key frames and packet boundaries, and thus may include media outside of your trim range. The region is always
     * minimally expanded to satisfy the copy criteria.
     * - `'shrink'`: Only include media that lies entirely within the requested trim range. This may require shrinking
     * the media region due to key frames and packet boundaries, and thus may exclude media inside of your trim range.
     * The region is always minimally shrunk to satisfy the copy criteria.
     *
     * Use `expand` if you don't want to lose any media; use `shrink` to never expose any media outside of the
     * trim region.
     */
    boundaryPolicy?: 'expand' | 'shrink';
    /**
     * The maximum amount, in seconds, by which the copied media region may deviate from the requested trim range at
     * its start, as caused by {@link ConversionCopyOptions.boundaryPolicy}. Defaults to `Infinity`, which permits any
     * deviation.
     *
     * In other words, this field sets how many seconds of media the conversion is allowed to add/remove to make a copy
     * path possible.
     */
    boundaryTolerance?: number;
};

/**
 * Options for controlling a single call to {@link Conversion.execute}.
 * @group Conversion
 * @public
 */
export declare type ConversionExecuteOptions = {
    /**
     * The timestamp in seconds, in the output's timescale, until which the conversion should advance. Defaults to
     * `Infinity`, meaning the conversion runs until the end.
     *
     * This field is especially useful for composable conversions, as it allows you to advance the conversion in
     * lockstep with other media data sources.
     */
    until?: number;
    /**
     * A signal that, when triggered, pauses the conversion as soon as possible.
     */
    pauseSignal?: AbortSignal;
};

/**
 * The options for media file conversion.
 * @group Conversion
 * @public
 */
export declare type ConversionOptions = {
    /** The input file. */
    input: Input;
    /** The output file. */
    output: Output;
    /**
     * Defines which input tracks are used for conversion. Defaults to `'all'` unless the input is an HLS input, in
     * which case it defaults to `'primary'`.
     *
     * - `'all'`: All input tracks are eligible for conversion.
     * - `'primary'`: Only the primary video and audio track from the input are eligible for conversion.
     */
    tracks?: 'all' | 'primary';
    /**
     * Video-specific options. When passing an object, the same options are applied to all video tracks. When passing a
     * function, it will be invoked for each video track and is expected to return or resolve to the options
     * for that specific track. The function is passed an instance of {@link InputVideoTrack} as well as a number `n`,
     * which is the 1-based index of the track in the list of all video tracks. Using `n` is deprecated, prefer the
     * identical `track.number` instead.
     *
     * When passing an array of a function that returns an array, one output track per array element will be created,
     * allowing for "fan-out". Useful for creating multiple variants from a single track, for example with different
     * resolutions.
     */
    video?: ConversionVideoOptions | ConversionVideoOptions[] | ((track: InputVideoTrack, n: number) => MaybePromise<ConversionVideoOptions | ConversionVideoOptions[] | undefined>);
    /**
     * Audio-specific options. When passing an object, the same options are applied to all audio tracks. When passing a
     * function, it will be invoked for each audio track and is expected to return or resolve to the options
     * for that specific track. The function is passed an instance of {@link InputAudioTrack} as well as a number `n`,
     * which is the 1-based index of the track in the list of all audio tracks. Using `n` is deprecated, prefer the
     * identical `track.number` instead.
     *
     * When passing an array of a function that returns an array, one output track per array element will be created,
     * allowing for "fan-out". Useful for creating multiple variants from a single track, for example with different
     * bitrates.
     */
    audio?: ConversionAudioOptions | ConversionAudioOptions[] | ((track: InputAudioTrack, n: number) => MaybePromise<ConversionAudioOptions | ConversionAudioOptions[] | undefined>);
    /** Options to trim the input file. */
    trim?: {
        /**
         * The time in the input file in seconds at which the output file should start. Must be less than `end`.
         * When omitted, defaults to the earliest start timestamp of the non-discarded tracks, or to 0, whichever
         * is higher.
         */
        start?: number;
        /**
         * The time in the input file in seconds at which the output file should end. Must be greater than `start`.
         * Defaults to the duration of the input when omitted.
         */
        end?: number;
    };
    /**
     * Options for controlling when media is copied directly without transcoding it. Set to `false` to always transcode.
     * Defaults to `{}`, which will copy media whenever possible and otherwise transcode it while retaining precise
     * timestamps.
     */
    copy?: ConversionCopyOptions | false;
    /**
     * An object or a callback that returns or resolves to an object containing the descriptive metadata tags that
     * should be written to the output file. If a function is passed, it will be passed the tags of the input file as
     * its first argument, allowing you to modify, augment or extend them.
     *
     * If no function is set, the input's metadata tags will be copied to the output.
     */
    tags?: MetadataTags | ((inputTags: MetadataTags) => MaybePromise<MetadataTags>);
    /**
     * Whether to show potential console warnings about discarded tracks after calling `Conversion.init()`, defaults to
     * `true`. Set this to `false` if you're properly handling the `discardedTracks` and `isValid` fields already and
     * want to keep the console output clean.
     */
    showWarnings?: boolean;
    /**
     * Whether this conversion is composable, defaults to `false`. A non-composable conversion takes full ownership of
     * the output: it requires a fresh output and controls its entire lifecycle, meaning it starts it, writes its
     * metadata tags, and finalizes it.
     *
     * A composable conversion only adds tracks to the output and drives their media data; starting and finalizing
     * the output is an outside responsibility. This is useful when only some output tracks should be driven by a
     * conversion, and other are to be driven manually. Additionally, it can be used to have multiple conversions target
     * the same output.
     */
    composable?: boolean;
};

/**
 * Video-specific options.
 * @group Conversion
 * @public
 */
export declare type ConversionVideoOptions = {
    /** If `true`, all video tracks will be discarded and will not be present in the output. */
    discard?: boolean;
    /**
     * The desired width of the output video in pixels, defaulting to the video's natural display width. If height
     * is not set, it will be deduced automatically based on aspect ratio.
     */
    width?: number;
    /**
     * The desired height of the output video in pixels, defaulting to the video's natural display height. If width
     * is not set, it will be deduced automatically based on aspect ratio.
     */
    height?: number;
    /**
     * The fitting algorithm in case both width and height are set, or if the input video changes its size over time.
     *
     * - `'fill'` will stretch the image to fill the entire box, potentially altering aspect ratio.
     * - `'contain'` will contain the entire image within the box while preserving aspect ratio. This may lead to
     * letterboxing.
     * - `'cover'` will scale the image until the entire box is filled, while preserving aspect ratio.
     */
    fit?: 'fill' | 'contain' | 'cover';
    /**
     * The angle in degrees to rotate the input video by, clockwise. Rotation is applied before flipping, cropping and
     * resizing. This rotation is _in addition to_ the natural rotation of the input video as specified in input file's
     * metadata.
     */
    rotate?: Rotation;
    /**
     * Whether to flip the input video horizontally (about the vertical axis). The flip is applied after rotation but
     * before cropping and resizing. This flip is _in addition to_ the natural flip of the input video as specified in
     * the input file's metadata.
     */
    flip?: boolean;
    /**
     * Defaults to `true`. When enabled, Mediabunny will use the rotation and flip metadata in the output file to
     * perform video rotation and flipping whenever possible. Set this field to `false` if you want to ensure the output
     * file does not make use of such metadata and that any rotation and flip is baked into the video frames directly.
     */
    allowTransformationMetadata?: boolean;
    /**
     * Defaults to `true`. When enabled, Mediabunny will use the rotation metadata in the output file to perform video
     * rotation whenever possible.
     * @deprecated Use {@link ConversionVideoOptions.allowTransformationMetadata} instead.
     */
    allowRotationMetadata?: boolean;
    /**
     * Specifies the rectangular region of the input video to crop to. The crop region will automatically be clamped to
     * the dimensions of the input video track. Cropping is performed after rotation and flip but before resizing.
     */
    crop?: CropRectangle;
    /**
     * The desired frame rate of the output video, in hertz. If not specified, the original input frame rate will
     * be used (which may be variable).
     */
    frameRate?: number;
    /** The desired output video codec. */
    codec?: VideoCodec;
    /** The desired quality of the output video. */
    quality?: Quality;
    /**
     * The desired bitrate of the output video.
     * @deprecated Use `quality` instead.
     */
    bitrate?: number | Quality;
    /**
     * Whether to discard or keep the transparency information of the input video. The default is `'discard'`. Note that
     * for `'keep'` to produce a transparent video, you must use an output config that supports it, such as WebM with
     * VP9.
     */
    alpha?: 'discard' | 'keep';
    /**
     * The interval, in seconds, of how often frames are encoded as a key frame. The default is 5 seconds. Frequent key
     * frames improve seeking behavior but increase file size. When using multiple video tracks, you should give them
     * all the same key frame interval.
     *
     * Setting this fields forces a transcode.
     */
    keyFrameInterval?: number;
    /**
     * A hint that configures the hardware acceleration method used when transcoding. This is best left on
     * `'no-preference'`, the default.
     */
    hardwareAcceleration?: 'no-preference' | 'prefer-hardware' | 'prefer-software';
    /** When `true`, video will always be re-encoded instead of directly copying over the encoded packets. */
    forceTranscode?: boolean;
    /**
     * Allows for custom user-defined processing of video frames, e.g. for applying overlays, color transformations, or
     * timestamp modifications. Will be called for each input video sample after transformations and frame rate
     * corrections.
     *
     * Must return a {@link VideoSample}, a {@link VideoSampleResource} or a `CanvasImageSource`, an array of them, or
     * `null` for dropping the frame. When non-timestamped data is returned, the timestamp and duration from the source
     * sample will be used. Rotation and flip metadata of the returned sample will be ignored.
     *
     * This function can also be used to manually resize frames. When doing so, you should signal the post-process
     * dimensions using the `processedWidth` and `processedHeight` fields, which enables the encoder to better know what
     * to expect. If these fields aren't set, Mediabunny will assume you won't perform any resizing.
     */
    process?: (sample: VideoSample) => MaybePromise<CanvasImageSource | VideoSample | VideoSampleResource | (CanvasImageSource | VideoSample | VideoSampleResource)[] | null>;
    /**
     * An optional hint specifying the width of video samples returned by the `process` function, for better
     * encoder configuration.
     */
    processedWidth?: number;
    /**
     * An optional hint specifying the height of video samples returned by the `process` function, for better
     * encoder configuration.
     */
    processedHeight?: number;
    /**
     * Defines the group(s) the output track is a part of. For more, see {@link BaseTrackMetadata.group}.
     *
     * If left blank, tracks will internally be assigned to groups such that the output track pairability graph exactly
     * matches the input track pairability graph.
     */
    group?: OutputTrackGroup | OutputTrackGroup[];
};

/**
 * Specifies the rectangular cropping region.
 * @group Miscellaneous
 * @public
 */
export declare type CropRectangle = {
    /** The distance in pixels from the left edge of the source frame to the left edge of the crop rectangle. */
    left: number;
    /** The distance in pixels from the top edge of the source frame to the top edge of the crop rectangle. */
    top: number;
    /** The width in pixels of the crop rectangle. */
    width: number;
    /** The height in pixels of the crop rectangle. */
    height: number;
};

/**
 * Base class for custom audio decoders. To add your own custom audio decoder, extend this class, implement the
 * abstract methods and static `supports` method, and register the decoder using {@link registerDecoder}.
 * @group Custom coders
 * @public
 */
export declare abstract class CustomAudioDecoder {
    /** The input audio's codec. */
    readonly codec: AudioCodec;
    /** The input audio's decoder config. */
    readonly config: AudioDecoderConfig;
    /** The callback to call when a decoded AudioSample is available. */
    readonly onSample: (sample: AudioSample) => unknown;
    /** The callback to call to surface out-of-band errors that can't be surfaced through the main methods. */
    readonly onError: (error: unknown) => undefined;
    /** Returns true if and only if the decoder can decode the given codec configuration. */
    static supports(codec: AudioCodec, config: AudioDecoderConfig): boolean;
    /** Called after decoder creation; can be used for custom initialization logic. */
    abstract init(): MaybePromise<void>;
    /** Decodes the provided encoded packet. */
    abstract decode(packet: EncodedPacket): MaybePromise<void>;
    /** Decodes all remaining packets and then resolves. */
    abstract flush(): MaybePromise<void>;
    /** Called when the decoder is no longer needed and its resources can be freed. */
    abstract close(): MaybePromise<void>;
}

/**
 * Base class for custom audio encoders. To add your own custom audio encoder, extend this class, implement the
 * abstract methods and static `supports` method, and register the encoder using {@link registerEncoder}.
 * @group Custom coders
 * @public
 */
export declare abstract class CustomAudioEncoder {
    /** The codec with which to encode the audio. */
    readonly codec: AudioCodec;
    /** Config for the encoder. */
    readonly config: AudioEncoderConfig;
    /** The callback to call when an EncodedPacket is available. */
    readonly onPacket: (packet: EncodedPacket, meta?: EncodedAudioChunkMetadata) => unknown;
    /** The callback to call to surface out-of-band errors that can't be surfaced through the main methods. */
    readonly onError: (error: unknown) => undefined;
    /** Returns true if and only if the encoder can encode the given codec configuration. */
    static supports(codec: AudioCodec, config: AudioEncoderConfig): boolean;
    /** Called after encoder creation; can be used for custom initialization logic. */
    abstract init(): MaybePromise<void>;
    /** Encodes the provided audio sample. */
    abstract encode(audioSample: AudioSample): MaybePromise<void>;
    /** Encodes all remaining audio samples and then resolves. */
    abstract flush(): MaybePromise<void>;
    /** Called when the encoder is no longer needed and its resources can be freed. */
    abstract close(): MaybePromise<void>;
}

/**
 * A custom multi-file source where each file is uniquely identified by a {@link FilePath} and can be resolved to
 * an arbitrary {@link Source}.
 *
 * @public
 * @group Input sources
 */
export declare class CustomPathedSource extends PathedSource {
}

/**
 * A general-purpose, callback-driven source that can get its data from anywhere. Use this source to implement your own
 * custom source if the other sources don't cover your case.
 * @group Input sources
 * @public
 */
export declare class CustomSource extends Source {
    /** Creates a new {@link CustomSource} whose behavior is specified by `options`.  */
    constructor(options: CustomSourceOptions);
}

/**
 * Options for defining a {@link CustomSource}.
 * @group Input sources
 * @public
 */
export declare type CustomSourceOptions = {
    /**
     * Called when the size of the entire file is requested. Must return or resolve to the size in bytes. This function
     * is guaranteed to be called before `read`.
     */
    getSize: () => MaybePromise<number>;
    /**
     * Called when data is requested. Must return or resolve to the bytes from the specified byte range, or a stream
     * that yields these bytes.
     *
     * You are guaranteed that `0 <= start < end < fileSize`.
     */
    read: (start: number, end: number) => MaybePromise<Uint8Array | ReadableStream<Uint8Array>>;
    /**
     * Called when the {@link Input} driven by this source is disposed.
     */
    dispose?: () => unknown;
    /** The maximum number of bytes the cache is allowed to hold in memory. Defaults to 8 MiB. */
    maxCacheSize?: number;
    /**
     * Specifies the prefetch profile that the reader should use with this source. A prefetch profile specifies the
     * pattern with which bytes outside of the requested range are preloaded to reduce latency for future reads.
     *
     * - `'none'` (default): No prefetching; only the data needed in the moment is requested.
     * - `'fileSystem'`: File system-optimized prefetching: a small amount of data is prefetched bidirectionally,
     * aligned with page boundaries.
     * - `'network'`: Network-optimized prefetching, or more generally, prefetching optimized for any high-latency
     * environment: tries to minimize the amount of read calls and aggressively prefetches data when sequential access
     * patterns are detected.
     */
    prefetchProfile?: 'none' | 'fileSystem' | 'network';
    /** Handles errors that occur while no read is pending. By default, these become unhandled rejections. */
    handleUnhandledError?: (error: unknown) => unknown;
};

/**
 * Base class for custom video decoders. To add your own custom video decoder, extend this class, implement the
 * abstract methods and static `supports` method, and register the decoder using {@link registerDecoder}.
 * @group Custom coders
 * @public
 */
export declare abstract class CustomVideoDecoder {
    /** The input video's codec. */
    readonly codec: VideoCodec;
    /** The input video's decoder config. */
    readonly config: VideoDecoderConfig;
    /** The callback to call when a decoded VideoSample is available. */
    readonly onSample: (sample: VideoSample) => unknown;
    /** The callback to call to surface out-of-band errors that can't be surfaced through the main methods. */
    readonly onError: (error: unknown) => undefined;
    /** Returns true if and only if the decoder can decode the given codec configuration. */
    static supports(codec: VideoCodec, config: VideoDecoderConfig): boolean;
    /** Called after decoder creation; can be used for custom initialization logic. */
    abstract init(): MaybePromise<void>;
    /** Decodes the provided encoded packet. */
    abstract decode(packet: EncodedPacket): MaybePromise<void>;
    /** Decodes all remaining packets and then resolves. */
    abstract flush(): MaybePromise<void>;
    /** Called when the decoder is no longer needed and its resources can be freed. */
    abstract close(): MaybePromise<void>;
}

/**
 * Base class for custom video encoders. To add your own custom video encoder, extend this class, implement the
 * abstract methods and static `supports` method, and register the encoder using {@link registerEncoder}.
 * @group Custom coders
 * @public
 */
export declare abstract class CustomVideoEncoder {
    /** The codec with which to encode the video. */
    readonly codec: VideoCodec;
    /** Config for the encoder. */
    readonly config: VideoEncoderConfig;
    /** The callback to call when an EncodedPacket is available. */
    readonly onPacket: (packet: EncodedPacket, meta?: EncodedVideoChunkMetadata) => unknown;
    /** The callback to call to surface out-of-band errors that can't be surfaced through the main methods. */
    readonly onError: (error: unknown) => undefined;
    /** Returns true if and only if the encoder can encode the given codec configuration. */
    static supports(codec: VideoCodec, config: VideoEncoderConfig): boolean;
    /** Called after encoder creation; can be used for custom initialization logic. */
    abstract init(): MaybePromise<void>;
    /** Encodes the provided video sample. */
    abstract encode(videoSample: VideoSample, options: VideoEncoderEncodeOptions): MaybePromise<void>;
    /** Encodes all remaining video samples and then resolves. */
    abstract flush(): MaybePromise<void>;
    /** Called when the encoder is no longer needed and its resources can be freed. */
    abstract close(): MaybePromise<void>;
}

/**
 * Recursively makes all properties of T readonly.
 * @group Miscellaneous
 * @public
 */
export declare type DeepReadonly<T> = T extends object ? {
    readonly [K in keyof T]: DeepReadonly<T[K]>;
} : T;

/**
 * Helper function for use in {@link InputTrackQuery.sortBy}, used to describe sorting tracks by a numeric property in
 * descending order. `null` and `undefined` are accepted too and are last in the order (sorted to the end).
 *
 * @group Input files & tracks
 * @public
 */
export declare const desc: (value: number | null | undefined) => number;

/**
 * An input track that was discarded (excluded) from a {@link Conversion} alongside the discard reason.
 * @group Conversion
 * @public
 */
export declare type DiscardedTrack = {
    /** The track that was discarded. */
    track: InputTrack;
    /**
     * The reason for discarding the track.
     *
     * - `'discarded_by_user'`: You discarded this track by setting `discard: true`.
     * - `'max_track_count_reached'`: The output had no more room for another track.
     * - `'max_track_count_of_type_reached'`: The output had no more room for another track of this type, or the output
     * doesn't support this track type at all.
     * - `'unknown_source_codec'`: We don't know the codec of the input track and therefore don't know what to do
     * with it.
     * - `'undecodable_source_codec'`: The input track's codec is known, but we are unable to decode it.
     * - `'no_encodable_target_codec'`: We can't find a codec that we are able to encode and that can be contained
     * within the output format. This reason can be hit if the environment doesn't support the necessary encoders, or if
     * you requested a codec that cannot be contained within the output format.
     * - `'cannot_copy'`: {@link ConversionCopyOptions.mode} was set to `'forced'` but the track could not be copied
     * with the given copy configuration because it would require a transcode instead.
     */
    reason: 'discarded_by_user' | 'max_track_count_reached' | 'max_track_count_of_type_reached' | 'unknown_source_codec' | 'undecodable_source_codec' | 'no_encodable_target_codec' | 'cannot_copy';
    /** The options that were provided for this track, or `{}` if none were provided. */
    trackOptions: ConversionVideoOptions | ConversionAudioOptions;
};

/**
 * Options for retrieving media duration from metadata.
 * @group Input files & tracks
 * @public
 */
export declare type DurationMetadataRequestOptions = {
    /**
     * When the underlying media is live, querying the duration will, by default, wait until the live stream has ended.
     * Setting this field to `true` skips that wait and returns the current duration of the stream. When the media isn't
     * live, this field has no effect.
     *
     * See also {@link PacketRetrievalOptions.skipLiveWait}.
     */
    skipLiveWait?: boolean;
};

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
 * Represents an encoded chunk of media. Mainly used as an expressive wrapper around WebCodecs API's
 * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) and
 * [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk), but can also be used
 * standalone.
 * @group Packets
 * @public
 */
export declare class EncodedPacket {
    /**
     * The encoded data of this packet. For any given codec, this data must adhere to the format specified in the
     * Mediabunny Codec Registry.
     */
    readonly data: Uint8Array;
    /** The type of this packet. */
    readonly type: PacketType;
    /**
     * The presentation timestamp of this packet in seconds. May be negative. Samples with negative end timestamps
     * should not be presented.
     */
    readonly timestamp: number;
    /** The duration of this packet in seconds. */
    readonly duration: number;
    /**
     * The sequence number indicates the decode order of the packets. Packet A  must be decoded before packet B if A
     * has a lower sequence number than B. If two packets have the same sequence number, they are the same packet.
     * Otherwise, sequence numbers are arbitrary and are not guaranteed to have any meaning besides their relative
     * ordering. Negative sequence numbers mean the sequence number is undefined.
     */
    readonly sequenceNumber: number;
    /**
     * The actual byte length of the data in this packet. This field is useful for metadata-only packets where the
     * `data` field contains no bytes.
     */
    readonly byteLength: number;
    /** Additional data carried with this packet. */
    readonly sideData: EncodedPacketSideData;
    /** Creates a new {@link EncodedPacket} from raw bytes and timing information. */
    constructor(
    /**
     * The encoded data of this packet. For any given codec, this data must adhere to the format specified in the
     * Mediabunny Codec Registry.
     */
    data: Uint8Array, 
    /** The type of this packet. */
    type: PacketType, 
    /**
     * The presentation timestamp of this packet in seconds. May be negative. Samples with negative end timestamps
     * should not be presented.
     */
    timestamp: number, 
    /** The duration of this packet in seconds. */
    duration: number, 
    /**
     * The sequence number indicates the decode order of the packets. Packet A  must be decoded before packet B if A
     * has a lower sequence number than B. If two packets have the same sequence number, they are the same packet.
     * Otherwise, sequence numbers are arbitrary and are not guaranteed to have any meaning besides their relative
     * ordering. Negative sequence numbers mean the sequence number is undefined.
     */
    sequenceNumber?: number, byteLength?: number, sideData?: EncodedPacketSideData);
    /**
     * If this packet is a metadata-only packet. Metadata-only packets don't contain their packet data. They are the
     * result of retrieving packets with {@link PacketRetrievalOptions.metadataOnly} set to `true`.
     */
    get isMetadataOnly(): boolean;
    /** The timestamp of this packet in microseconds. */
    get microsecondTimestamp(): number;
    /** The duration of this packet in microseconds. */
    get microsecondDuration(): number;
    /** Converts this packet to an
     * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) for use with the
     * WebCodecs API. */
    toEncodedVideoChunk(): EncodedVideoChunk;
    /**
     * Converts this packet to an
     * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) for use with the
     * WebCodecs API, using the alpha side data instead of the color data. Throws if no alpha side data is defined.
     */
    alphaToEncodedVideoChunk(type?: PacketType): EncodedVideoChunk;
    /** Converts this packet to an
     * [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk) for use with the
     * WebCodecs API. */
    toEncodedAudioChunk(): EncodedAudioChunk;
    /**
     * Creates an {@link EncodedPacket} from an
     * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) or
     * [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk). This method is useful
     * for converting chunks from the WebCodecs API to `EncodedPacket` instances.
     */
    static fromEncodedChunk(chunk: EncodedVideoChunk | EncodedAudioChunk, sideData?: EncodedPacketSideData): EncodedPacket;
    /** Clones this packet while optionally modifying the new packet's data. */
    clone(options?: {
        /** The data of the cloned packet. */
        data?: Uint8Array;
        /** The type of the cloned packet. */
        type?: PacketType;
        /** The timestamp of the cloned packet in seconds. */
        timestamp?: number;
        /** The duration of the cloned packet in seconds. */
        duration?: number;
        /** The sequence number of the cloned packet. */
        sequenceNumber?: number;
        /** The side data of the cloned packet. */
        sideData?: EncodedPacketSideData;
    }): EncodedPacket;
}

/**
 * Holds additional data accompanying an {@link EncodedPacket}.
 * @group Packets
 * @public
 */
export declare type EncodedPacketSideData = {
    /**
     * An encoded alpha frame, encoded with the same codec as the packet. Typically used for transparent videos, where
     * the alpha information is stored separately from the color information.
     */
    alpha?: Uint8Array;
    /**
     * The actual byte length of the alpha data. This field is useful for metadata-only packets where the
     * `alpha` field contains no bytes.
     */
    alphaByteLength?: number;
};

/**
 * Sink for retrieving encoded packets from an input track.
 * @group Media sinks
 * @public
 */
export declare class EncodedPacketSink {
    /** Creates a new {@link EncodedPacketSink} for the given {@link InputTrack}. */
    constructor(track: InputTrack);
    /**
     * Retrieves the track's first packet (in decode order), or null if it has no packets. The first packet is very
     * likely to be a key packet, but it doesn't have to be.
     */
    getFirstPacket(options?: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    /** Retrieves the track's first key packet (in decode order), or null if it has no key packets. */
    getFirstKeyPacket(options?: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    /**
     * Retrieves the packet corresponding to the given timestamp, in seconds. More specifically, returns the last packet
     * (in presentation order) with a start timestamp less than or equal to the given timestamp. This method can be
     * used to retrieve a track's last packet using `getPacket(Infinity)`. The method returns null if the timestamp
     * is before the first packet in the track.
     *
     * @param timestamp - The timestamp used for retrieval, in seconds.
     */
    getPacket(timestamp: number, options?: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    /**
     * Retrieves the packet following the given packet (in decode order), or null if the given packet is the
     * last packet.
     */
    getNextPacket(packet: EncodedPacket, options?: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    /**
     * Retrieves the key packet corresponding to the given timestamp, in seconds. More specifically, returns the last
     * key packet (in presentation order) with a start timestamp less than or equal to the given timestamp. A key packet
     * is a packet that doesn't require previous packets to be decoded. This method can be used to retrieve a track's
     * last key packet using `getKeyPacket(Infinity)`. The method returns null if the timestamp is before the first
     * key packet in the track.
     *
     * To ensure that the returned packet is guaranteed to be a real key frame, enable `options.verifyKeyPackets`.
     *
     * @param timestamp - The timestamp used for retrieval, in seconds.
     */
    getKeyPacket(timestamp: number, options?: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    /**
     * Retrieves the key packet following the given packet (in decode order), or null if the given packet is the last
     * key packet.
     *
     * To ensure that the returned packet is guaranteed to be a real key frame, enable `options.verifyKeyPackets`.
     */
    getNextKeyPacket(packet: EncodedPacket, options?: PacketRetrievalOptions): Promise<EncodedPacket | null>;
    /**
     * Creates an async iterator that yields the packets in this track in decode order. To enable fast iteration, this
     * method will intelligently preload packets based on the speed of the consumer.
     *
     * @param startPacket - (optional) The packet from which iteration should begin. This packet will also be yielded.
     * @param endPacket - (optional) The packet at which iteration should end. This packet will _not_ be yielded.
     */
    packets(startPacket?: EncodedPacket, endPacket?: EncodedPacket, options?: PacketRetrievalOptions): AsyncGenerator<EncodedPacket, void, unknown>;
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

/**
 * A class that manages event listeners and dispatches events to them.
 *
 * @group Miscellaneous
 * @public
 */
export declare class EventEmitter<TEvents extends Record<string, unknown>> {
    /** Registers a listener for the given event. Returns a function that, when called, removes the listener again. */
    on<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => unknown, options?: EventListenerOptions_2): () => void;
}

/**
 * Options for {@link EventEmitter.on}.
 *
 * @group Miscellaneous
 * @public
 */
declare type EventListenerOptions_2 = {
    /** If `true`, the listener will be automatically removed after being called once. Defaults to `false`. */
    once?: boolean;
};
export { EventListenerOptions_2 as EventListenerOptions }

/**
 * A path to a file. File paths can be relative or absolute, and be local paths or full URLs. Paths must be POSIX-like,
 * using `/` as the separator.
 *
 * Examples of valid paths:
 * - `'video.mp4'`
 * - `'path/to/video.mp4'`
 * - `'./video.mp4'`
 * - `'../video.mp4'`
 * - `'/path/to/video.mp4'`
 * - `'https://example.com/video.mp4'`
 * - `'file:///home/user/video.mp4'`
 * - `'video.mp4?key=foo'`
 *
 * @group Miscellaneous
 * @public
 */
export declare type FilePath = string;

/**
 * A source backed by a path to a file. Intended for server-side usage in Node, Bun, or Deno.
 *
 * Make sure to call `.dispose()` on the corresponding {@link Input} when done to explicitly free the internal file
 * handle acquired by this source.
 * @group Input sources
 * @public
 */
export declare class FilePathSource extends PathedSource {
    /** Creates a new {@link FilePathSource} backed by the file at the specified file path. */
    constructor(filePath: string, options?: FilePathSourceOptions);
}

/**
 * Options for {@link FilePathSource}.
 * @group Input sources
 * @public
 */
export declare type FilePathSourceOptions = {
    /** The maximum number of bytes the cache is allowed to hold in memory. Defaults to 8 MiB. */
    maxCacheSize?: number;
    /** Handles errors that occur while no read is pending. By default, these become unhandled rejections. */
    handleUnhandledError?: (error: unknown) => unknown;
};

/**
 * A target that writes to a file at the specified path. Intended for server-side usage in Node, Bun, or Deno.
 *
 * Writing is chunked by default. The internally held file handle will be closed when `.finalize()` or `.cancel()` are
 * called on the corresponding {@link Output}.
 * @group Output targets
 * @public
 */
export declare class FilePathTarget extends Target {
    /** Creates a new {@link FilePathTarget} that writes to the file at the specified file path. */
    constructor(filePath: string, options?: FilePathTargetOptions);
}

/**
 * Options for {@link FilePathTarget}.
 * @group Output targets
 * @public
 */
export declare type FilePathTargetOptions = StreamTargetOptions;

/**
 * FLAC input format singleton.
 * @group Input formats
 * @public
 */
export declare const FLAC: FlacInputFormat;

/**
 * FLAC file format.
 *
 * Do not instantiate this class; use the {@link FLAC} singleton instead.
 *
 * @group Input formats
 * @public
 */
export declare class FlacInputFormat extends InputFormat {
    get name(): string;
    get mimeType(): string;
}

/**
 * FLAC file format.
 * @group Output formats
 * @public
 */
export declare class FlacOutputFormat extends OutputFormat {
    /** Creates a new {@link FlacOutputFormat} configured with the specified `options`. */
    constructor(options?: FlacOutputFormatOptions);
    getSupportedTrackCounts(): TrackCountLimits;
    get fileExtension(): string;
    get mimeType(): string;
    getSupportedCodecs(): MediaCodec[];
    get supportsVideoTransformationMetadata(): boolean;
    get supportsTimestampedMediaData(): boolean;
    get negativeTimestampSupport(): null;
}

/**
 * FLAC-specific output options.
 * @group Output formats
 * @public
 */
export declare type FlacOutputFormatOptions = {
    /**
     * Configures the output to only append new data at the end, useful for live-streaming the file as it's being
     * created. When enabled, the STREAMINFO block will not be finalized with accurate min/max block sizes, frame sizes,
     * or total sample count, so don't use this option when you want to write out a clean file for later use.
     */
    appendOnly?: boolean;
    /**
     * Will be called for each FLAC frame that is written.
     *
     * @param data - The raw bytes.
     * @param position - The byte offset of the data in the file.
     */
    onFrame?: (data: Uint8Array, position: number) => unknown;
};

/**
 * Computed metrics about the frame rate of a video track.
 * @group Input files & tracks
 * @public
 */
export declare type FrameRateMetrics = {
    /**
     * The true, underlying frame rate of the video that produced the frame timestamps. This value is heuristically
     * determined by examining the time differences between frames, excluding outliers, and then fitting them to
     * fractions. This algorithm is stable even when frames are dropped, as long as all frames lie roughly on one
     * uniform lattice.
     *
     * If this field is not `null`, Mediabunny is extremely confident in having found the actual frame rate of
     * the video.
     *
     * This field is `null` for videos where no consistent underlying frame rate was detected, indicating a variable
     * frame-rate (VFR) video.
     */
    underlyingFrameRate: number | null;
    /**
     * Mediabunny's best guess for the video's actual intended frame rate.
     *
     * This value is determined heuristically. If `underlyingFrameRate` exists, this field will be equal to it. If it
     * doesn't, Mediabunny will check if `medianFrameRate` is close to a "common" frame rate and if so, snap to it.
     * Otherwise, this field simply falls back to `medianFrameRate`.
     */
    bestGuessFrameRate: number;
    /**
     * The minimum frame rate of the video at any given point, based on the largest distance between two
     * consecutive frames.
     */
    minFrameRate: number;
    /**
     * The maximum frame rate of the video at any given point, based on the smallest distance between two
     * consecutive frames.
     */
    maxFrameRate: number;
    /**
     * The average frame rate across the duration of the probed packets. This value represents the average frames per
     * second; it is not the average of frame rates across the video.
     */
    averageFrameRate: number;
    /**
     * The median frame rate, as determined by the distance between any two consecutive frames. For variable frame-rate
     * (VFR) videos, this field gives you a good idea of the _de facto_ frame rate of the video.
     */
    medianFrameRate: number;
    /** Is `true` only when the underlying video is CFR (constant frame-rate) and no frames are skipped. */
    frameRateIsConstant: boolean;
    /**
     * The number of packets that were probed/inspected to estimate the frame rate. Probe at least 256 packets for a
     * reliable estimation of frame rate.
     */
    probedPacketCount: number;
};

/**
 * Options for controlling how a video track's {@link FrameRateMetrics} are computed.
 * @group Input files & tracks
 * @public
 */
export declare type FrameRateMetricsOptions = {
    /**
     * The target number of packets to inspect to compute the frame rate. Defaults to `256`. Pass `Infinity` to scan
     * the entire file.
     */
    targetPacketCount?: number;
};

/**
 * Returns the list of all audio codecs that can be decoded by the browser.
 * @group Decoding
 * @public
 */
export declare const getDecodableAudioCodecs: (checkedCodecs?: AudioCodec[], options?: SetOptional<AudioDecoderConfig, "codec" | "numberOfChannels" | "sampleRate">) => Promise<AudioCodec[]>;

/**
 * Returns the list of all media codecs that can be decoded by the browser.
 * @group Decoding
 * @public
 */
export declare const getDecodableCodecs: () => Promise<MediaCodec[]>;

/**
 * Returns the list of all video codecs that can be decoded by the browser.
 * @group Decoding
 * @public
 */
export declare const getDecodableVideoCodecs: (checkedCodecs?: VideoCodec[], options?: SetOptional<VideoDecoderConfig, "codec">) => Promise<VideoCodec[]>;

/**
 * Returns the list of all audio codecs that can be encoded by the browser.
 * @group Encoding
 * @public
 */
export declare const getEncodableAudioCodecs: (checkedCodecs?: AudioCodec[], options?: {
    /** The number of audio channels. */
    numberOfChannels?: number;
    /** The sample rate in hertz. */
    sampleRate?: number;
    /** The desired quality of the encoded audio. */
    quality?: Quality;
    /**
     * The target bitrate for the encoded audio, in bits per second. Alternatively, a {@link Quality} can
     * be provided.
     * @deprecated Use `quality` instead.
     */
    bitrate?: number | Quality;
}) => Promise<AudioCodec[]>;

/**
 * Returns the list of all media codecs that can be encoded by the browser.
 * @group Encoding
 * @public
 */
export declare const getEncodableCodecs: () => Promise<MediaCodec[]>;

/**
 * Returns the list of all subtitle codecs that can be encoded by the browser.
 * @group Encoding
 * @public
 */
export declare const getEncodableSubtitleCodecs: (checkedCodecs?: SubtitleCodec[]) => Promise<SubtitleCodec[]>;

/**
 * Returns the list of all video codecs that can be encoded by the browser.
 * @group Encoding
 * @public
 */
export declare const getEncodableVideoCodecs: (checkedCodecs?: VideoCodec[], options?: {
    /** The width of the video in pixels. */
    width?: number;
    /** The height of the video in pixels. */
    height?: number;
    /** The desired quality of the encoded video. */
    quality?: Quality;
    /**
     * The target bitrate for the encoded video, in bits per second. Alternatively, a {@link Quality} can
     * be provided.
     * @deprecated Use `quality` instead.
     */
    bitrate?: number | Quality;
    /** The expected frame rate in frames per second, if known. */
    frameRate?: number;
}) => Promise<VideoCodec[]>;

/**
 * Returns the first audio codec from the given list that can be encoded by the browser.
 * @group Encoding
 * @public
 */
export declare const getFirstEncodableAudioCodec: (checkedCodecs: AudioCodec[], options?: {
    /** The number of audio channels. */
    numberOfChannels?: number;
    /** The sample rate in hertz. */
    sampleRate?: number;
    /** The desired quality of the encoded audio. */
    quality?: Quality;
    /**
     * The target bitrate for the encoded audio, in bits per second. Alternatively, a {@link Quality} can
     * be provided.
     * @deprecated Use `quality` instead.
     */
    bitrate?: number | Quality;
}) => Promise<AudioCodec | null>;

/**
 * Returns the first subtitle codec from the given list that can be encoded by the browser.
 * @group Encoding
 * @public
 */
export declare const getFirstEncodableSubtitleCodec: (checkedCodecs: SubtitleCodec[]) => Promise<SubtitleCodec | null>;

/**
 * Returns the first video codec from the given list that can be encoded by the browser.
 * @group Encoding
 * @public
 */
export declare const getFirstEncodableVideoCodec: (checkedCodecs: VideoCodec[], options?: {
    /** The width of the video in pixels. */
    width?: number;
    /** The height of the video in pixels. */
    height?: number;
    /** The desired quality of the encoded video. */
    quality?: Quality;
    /**
     * The target bitrate for the encoded video, in bits per second. Alternatively, a {@link Quality} can
     * be provided.
     * @deprecated Use `quality` instead.
     */
    bitrate?: number | Quality;
    /** The expected frame rate in frames per second, if known. */
    frameRate?: number;
}) => Promise<VideoCodec | null>;

/**
 * HLS input format singleton.
 * @group Input formats
 * @public
 */
export declare const HLS: HlsInputFormat;

/**
 * List of input formats required for playback of typical HLS manifests. Includes HLS itself as well as the typical
 * segment formats: MPEG Transport Stream (.ts), MP4 (CMAF), ADTS (.aac) and MP3.
 * @group Input formats
 * @public
 */
export declare const HLS_FORMATS: InputFormat[];

/**
 * Media described using the HTTP Live Streaming (HLS) protocol, with playlists in the M3U8 format.
 *
 * Do not instantiate this class; use the {@link HLS} singleton instead.
 *
 * @group Input formats
 * @public
 */
export declare class HlsInputFormat extends InputFormat {
    get name(): string;
    get mimeType(): string;
}

/**
 * Additional HLS input configuration.
 * @group Input formats
 * @public
 */
export declare type HlsInputFormatOptions = {
    /**
     * Whether, in the presence of `#EXT-X-PROGRAM-DATE-TIME` tags, to offset track and packet timestamps to be relative
     * to the Unix epoch.
     *
     * Defaults to `true`, meaning packet timestamps map directly to wall-clock time. This guarantees AV sync across
     * multiple tracks, even with gaps present.
     *
     * When you don't want this mapping, you can set this value to `false`. In addition to timestamps not being Unix
     * timestamps anymore, any gaps in the playlist are also naturally removed. When `false`, you can still access the
     * wall-clock Unix timestamps via {@link InputTrack.getUnixTimeForTimestamp}.
     */
    offsetTimestampsByDateTime?: boolean;
};

/**
 * HTTP Live Streaming (HLS) output format. HLS media is represented by a set of .m3u8 playlist files and media segment
 * files, meaning this format writes out multiple files, requiring the use of a _pathed Output_
 * ({@link OutputOptions.target} must be a {@link PathedTarget}).
 *
 * This output format creates the following files:
 * - A master playlist .m3u8 file, containing the list of available playlists. A master playlist is always emitted,
 * written to the root path.
 * - One .m3u8 file for each playlist, each containing a list of media segments.
 * - Many media segments, containing the actual media data.
 *
 * To emit media playlists that use the `#EXT-X-PROGRAM-DATE-TIME` tag to map segment timestamps to real-world time,
 * set {@link BaseTrackMetadata.isRelativeToUnixEpoch} to `true` for all tracks.
 *
 * @group Output formats
 * @public
 */
export declare class HlsOutputFormat extends OutputFormat {
    /** Creates a new {@link HlsOutputFormat} configured with the specified `options`. */
    constructor(options: HlsOutputFormatOptions);
    get fileExtension(): string;
    get mimeType(): string;
    getSupportedCodecs(): MediaCodec[];
    getSupportedTrackCounts(): TrackCountLimits;
    get supportsVideoTransformationMetadata(): boolean;
    get supportsTimestampedMediaData(): boolean;
    get negativeTimestampSupport(): "none" | "full" | "prefer-non-negative" | null;
}

/**
 * HLS-specific output options.
 * @group Output formats
 * @public
 */
export declare type HlsOutputFormatOptions = {
    /**
     * Specifies the file format of each media segment. Not all formats are supported by all players; prefer sticking
     * to the most commonly used ones: {@link MpegTsOutputFormat}, {@link CmafOutputFormat}, {@link AdtsOutputFormat},
     * and {@link Mp3OutputFormat}.
     *
     * When an array of formats is specified, for each playlist, the first format that can contain all of the playlist's
     * tracks is chosen. This allows you to, for example, package audio into .aac files and video into .ts files.
     */
    segmentFormat: OutputFormat | OutputFormat[];
    /**
     * Specifies the target (max) duration in seconds for each media segment, defaulting to 2 seconds.
     *
     * Mediabunny will try not to emit media segments longer than the target duration, but it is forced to if key frames
     * are provided with a longer period than the target duration. Therefore, make sure to encode a key frame at least
     * every `targetDuration` seconds to guarantee segment length, controllable via
     * {@link VideoEncodingConfig.keyFrameInterval}.
     */
    targetDuration?: number;
    /**
     * Whether to bundle all media segments for a playlist into a single file. Individual segments are then extracted
     * via range requests.
     */
    singleFilePerPlaylist?: boolean;
    /**
     * If `true`, the muxer will be in "live mode", continuously emitting updated playlists as new segments are created.
     * The master playlist will be emitted as soon as all playlists have been emitted at least once, and will continue
     * to be emitted each time a segment is finalized to further refine the accuracy of the `BANDWIDTH` attribute.
     *
     * When `false` (the default), all playlists will only be emitted once, upon output finalization.
     */
    live?: boolean;
    /**
     * When in live mode, this controls the maximum number of segments contained in each playlist. Defaults to
     * `Infinity`, meaning playlists continually grow in size.
     */
    maxLiveSegmentCount?: number;
    /**
     * Returns the file path for a given media playlist. If the returned path is relative, it is relative to the root
     * path.
     *
     * Defaults to `'playlist-{n}.m3u8'`, where `n` is the 1-based index of the media playlist in the master playlist.
     */
    getPlaylistPath?: (info: HlsOutputPlaylistInfo) => MaybePromise<FilePath>;
    /**
     * Returns the file path for a given media segment. If the returned path is relative, it is relative to the path
     * of the containing playlist.
     *
     * Defaults to `'segment-{n}-{k}{ext}'`, where `n` is the 1-based index of the containing media playlist in the
     * master playlist, `k` is the 1-based index of the segment in its playlist, and `ext` is the file extension of the
     * segment format (including the leading dot).
     *
     * If {@link HlsOutputFormatOptions.singleFilePerPlaylist} is true, it defaults to `'segments-{n}{ext}'` instead.
     */
    getSegmentPath?: (info: HlsOutputSegmentInfo) => MaybePromise<FilePath>;
    /**
     * Returns the file path for a given media init segment. If the returned path is relative, it is relative to the
     * path of the containing playlist.
     *
     * Only necessary for segment formats that require an init file, such as {@link CmafOutputFormat}.
     *
     * Defaults to `'init-{n}{ext}'`, where `n` is the 1-based index of the containing media playlist in the master
     * playlist and `ext` is the file extension of the segment format (including the leading dot).
     */
    getInitPath?: (info: HlsOutputPlaylistInfo) => MaybePromise<FilePath>;
    /** Called whenever the master playlist is written. */
    onMaster?: (content: string) => unknown;
    /** Called whenever a media playlist is written. */
    onPlaylist?: (content: string, info: HlsOutputPlaylistInfo) => unknown;
    /**
     * Called whenever a media segment has been fully written. In single-file mode, this function will only be called
     * once when the playlist is finalized.
     */
    onSegment?: (target: Target, info: HlsOutputSegmentInfo) => unknown;
    /**
     * Called when a media playlist is initialized, before any segments have been written. In single-file mode, this
     * function is never called.
     */
    onInit?: (target: Target, info: HlsOutputPlaylistInfo) => unknown;
    /**
     * Called when a media segment is removed from the start of a media playlist due to
     * {@link HlsOutputFormatOptions.maxLiveSegmentCount}. Will not be called when
     * {@link HlsOutputFormatOptions.singleFilePerPlaylist} is `true`.
     */
    onSegmentPopped?: (path: string, info: HlsOutputSegmentInfo) => unknown;
};

/**
 * Info about an HLS media playlist.
 * @group Output formats
 * @public
 */
export declare type HlsOutputPlaylistInfo = {
    /** The 1-based index of the media playlist in the master playlist. */
    n: number;
    /** The output tracks contained in this playlist. */
    tracks: OutputTrack[];
    /** The format of the media segments in this playlist. */
    segmentFormat: OutputFormat;
};

/**
 * Info about an HLS media segment.
 * @group Output formats
 * @public
 */
export declare type HlsOutputSegmentInfo = {
    /** The 1-based index of the segment in the containing media playlist. */
    n: number;
    /** If the segment is a single file, meaning it is a single segment file that covers the entire playlist. */
    isSingleFile: boolean;
    /** The format of the media segment. */
    format: OutputFormat;
    /** The media playlist to which this segment belongs. */
    playlist: HlsOutputPlaylistInfo;
};

/**
 * Specifies an inclusive range of integers.
 * @group Miscellaneous
 * @public
 */
export declare type InclusiveIntegerRange = {
    /** The integer cannot be less than this. */
    min: number;
    /** The integer cannot be greater than this. */
    max: number;
};

/**
 * Represents input media, backed by a single file or multiple files depending on the format.
 *
 * This is the root object from which all media read operations start.
 * @group Input files & tracks
 * @public
 */
export declare class Input<S extends Source = Source> extends EventEmitter<InputEvents> implements Disposable {
    /** True if the input has been disposed. */
    get disposed(): boolean;
    /**
     * Creates a new input file from the specified options. No reading operations will be performed until methods are
     * called on this instance.
     */
    constructor(options: InputOptions<S>);
    /**
     * Returns the source from which this input file reads data for the root path.
     */
    get source(): S;
    /**
     * Returns the format of the input file. You can compare this result directly to the {@link InputFormat} singletons
     * or use `instanceof` checks for subset-aware logic (for example, `format instanceof MatroskaInputFormat` is true
     * for both MKV and WebM).
     */
    getFormat(): Promise<InputFormat>;
    /** Returns `true` if the format of the input file is known and the file can be read, `false` otherwise. */
    canRead(): Promise<boolean>;
    /**
     * Returns the timestamp at which the input file starts. More precisely, returns the smallest starting timestamp
     * among all tracks.
     *
     * Optionally, you can pass in the list of tracks for which you want to compute the starting timestamp.
     *
     * Note that this method is potentially expensive for inputs with many tracks (such as HLS manifests), since it
     * probes every track.
     */
    getFirstTimestamp(tracks?: InputTrack[]): Promise<number>;
    /**
     * Computes the duration of the input file, in seconds. More precisely, returns the largest end timestamp among
     * all tracks.
     *
     * Optionally, you can pass in the list of tracks for which you want to compute the duration.
     *
     * This method can be potentially expensive depending on the underlying file format, because it returns the most
     * accurate duration possible and must check all tracks. Use {@link Input.getDurationFromMetadata} for a faster but
     * less accurate estimate of duration.
     *
     * By default, when any track in the underlying media is live, this method will only resolve once the live stream
     * ends. If you want to query the current duration of the media, set {@link PacketRetrievalOptions.skipLiveWait}
     * to `true` in the options.
     */
    computeDuration(tracks?: InputTrack[], options?: PacketRetrievalOptions): Promise<number>;
    /**
     * Gets the duration (end timestamp) in seconds of the input file from metadata stored in the file. This value may
     * be approximate or diverge from the actual, precise duration returned by `.computeDuration()`, but compared to
     * that method, this method is cheaper. When the duration cannot be determined from the file metadata, `null`
     * is returned.
     *
     * Optionally, you can pass in the list of tracks for which you want to get the duration from metadata.
     *
     * By default, when the underlying media is live, this method will only resolve once the live stream
     * ends. If you want to query the current duration of the media, set
     * {@link DurationMetadataRequestOptions.skipLiveWait} to `true` in the options.
     */
    getDurationFromMetadata(tracks?: InputTrack[], options?: DurationMetadataRequestOptions): Promise<number | null>;
    /**
     * Returns the list of all tracks of this input file in the order in which they appear in the file. An optional
     * query can be provided.
     */
    getTracks(query?: InputTrackQuery<InputTrack>): Promise<InputTrack[]>;
    /** Returns the list of all video tracks of this input file. An optional query can be provided. */
    getVideoTracks(query?: InputTrackQuery<InputVideoTrack>): Promise<InputVideoTrack[]>;
    /** Returns the list of all audio tracks of this input file. An optional query can be provided. */
    getAudioTracks(query?: InputTrackQuery<InputAudioTrack>): Promise<InputAudioTrack[]>;
    /**
     * Returns the primary video track of this input file, or null if there are no video tracks.
     *
     * Multiple factors determine which track is considered primary, including its position in the file, disposition,
     * bitrate (higher bitrate is preferred), and if it can be paired with an audio track.
     */
    getPrimaryVideoTrack(query?: InputTrackQuery<InputVideoTrack>): Promise<InputVideoTrack | null>;
    /**
     * Returns the primary audio track of this input file, or null if there are no audio tracks.
     *
     * Multiple factors determine which track is considered primary, including its position in the file, disposition,
     * bitrate (higher bitrate is preferred), and if it can be paired with the primary video track.
     */
    getPrimaryAudioTrack(query?: InputTrackQuery<InputAudioTrack>): Promise<InputAudioTrack | null>;
    /** Returns the full MIME type of this input file, including track codecs. */
    getMimeType(): Promise<string>;
    /**
     * Returns descriptive metadata tags about the media file, such as title, author, date, cover art, or other
     * attached files.
     */
    getMetadataTags(): Promise<MetadataTags>;
    /**
     * Disposes this input and frees connected resources. When an input is disposed, ongoing read operations will be
     * canceled, all future read operations will fail, any open decoders will be closed, and all ongoing media sink
     * operations will be canceled. Disallowed and canceled operations will throw an {@link InputDisposedError}.
     *
     * You are expected not to use an input after disposing it. While some operations may still work, it is not
     * specified and may change in any future update.
     */
    dispose(): void;
    /**
     * Calls `.dispose()` on the input, implementing the `Disposable` interface for use with
     * JavaScript Explicit Resource Management features.
     */
    [Symbol.dispose](): void;
}

/**
 * Represents an audio track in an input file.
 * @group Input files & tracks
 * @public
 */
export declare class InputAudioTrack extends InputTrack {
    get type(): TrackType;
    /** The codec of the track's packets. */
    getCodec(): Promise<AudioCodec | null>;
    /**
     * The codec of the track's packets.
     * @deprecated Use {@link InputAudioTrack.getCodec} instead.
     */
    get codec(): AudioCodec | null;
    hasOnlyKeyPackets(): Promise<boolean>;
    /** Returns the number of audio channels in the track. */
    getNumberOfChannels(): Promise<number>;
    /**
     * The number of audio channels in the track.
     * @deprecated Use {@link InputAudioTrack.getNumberOfChannels} instead.
     */
    get numberOfChannels(): number;
    /** Returns the track's audio sample rate in hertz. */
    getSampleRate(): Promise<number>;
    /**
     * The track's audio sample rate in hertz.
     * @deprecated Use {@link InputAudioTrack.getSampleRate} instead.
     */
    get sampleRate(): number;
    /**
     * Returns the [decoder configuration](https://www.w3.org/TR/webcodecs/#audio-decoder-config) for decoding the
     * track's packets using an [`AudioDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/AudioDecoder). Returns
     * null if the track's codec is unknown.
     */
    getDecoderConfig(): Promise<AudioDecoderConfig | null>;
    getCodecParameterString(): Promise<string | null>;
    canDecode(): Promise<boolean>;
    determinePacketType(packet: EncodedPacket): Promise<PacketType | null>;
}

/**
 * Thrown when an operation was prevented because the corresponding {@link Input} has been disposed.
 * @group Input files & tracks
 * @public
 */
export declare class InputDisposedError extends Error {
    /** Creates a new {@link InputDisposedError}. */
    constructor(message?: string);
}

/**
 * Describes the events that an {@link Input} emits, with each key being an event name and its value being the
 * event data.
 *
 * @group Input files & tracks
 * @public
 */
export declare type InputEvents = {
    /** Emitted whenever a {@link Source} is loaded by the input. Useful to track reads. */
    source: {
        /** The loaded source. */
        source: Source;
        /** The request that led to loading this source, or `null` if the input is not pathed. */
        request: SourceRequest | null;
        /** Whether the source is the root file of the media. */
        isRoot: boolean;
    };
};

/**
 * Base class representing an input media file format.
 * @group Input formats
 * @public
 */
export declare abstract class InputFormat {
    /** Returns the name of the input format. */
    abstract get name(): string;
    /** Returns the typical base MIME type of the input format. */
    abstract get mimeType(): string;
}

/**
 * Additional per-format configuration.
 * @group Input formats
 * @public
 */
export declare type InputFormatOptions = {
    /** ISOBMFF-specific configuration. */
    isobmff?: IsobmffInputFormatOptions;
    /** HLS-specific configuration. */
    hls?: HlsInputFormatOptions;
};

/**
 * The options for creating an Input object.
 * @group Input files & tracks
 * @public
 */
export declare type InputOptions<S extends Source = Source> = {
    /** A list of supported formats. If the source file is not of one of these formats, then it cannot be read. */
    formats: InputFormat[];
    /** The source from which data will be read. */
    source: S | SourceRef<S>;
    /**
     * An optional, second {@link Input} instance that contains the necessary metadata to initialize the tracks of
     * this input. This is necessary in cases where track initialization info and media data are carried in separate
     * files, like is the case with segmented MP4 (CMAF) files.
     *
     * The use of this field depends on the input format.
     */
    initInput?: Input;
    /** Can be used to specify additional per-format configuration. */
    formatOptions?: InputFormatOptions;
};

/**
 * Represents a media track in an input file.
 * @group Input files & tracks
 * @public
 */
export declare abstract class InputTrack {
    /** The input file this track belongs to. */
    readonly input: Input;
    /** The type of the track. */
    abstract get type(): TrackType;
    /** Returns the codec of the track's packets. */
    abstract getCodec(): Promise<MediaCodec | null>;
    /**
     * The codec of the track's packets.
     * @deprecated Use {@link InputTrack.getCodec} instead.
     */
    abstract get codec(): MediaCodec | null;
    /** Returns the full codec parameter string for this track. */
    abstract getCodecParameterString(): Promise<string | null>;
    /** Checks if this track's packets can be decoded by the browser. */
    abstract canDecode(): Promise<boolean>;
    /**
     * For a given packet of this track, this method determines the actual type of this packet (key/delta) by looking
     * into its bitstream. Returns null if the type couldn't be determined.
     */
    abstract determinePacketType(packet: EncodedPacket): Promise<PacketType | null>;
    /**
     * Returns whether the track metadata says that this track only contains key packets. The actual packets may
     * differ.
     */
    abstract hasOnlyKeyPackets(): Promise<boolean>;
    /** Returns true if and only if this track is a video track. */
    isVideoTrack(): this is InputVideoTrack;
    /** Returns true if and only if this track is an audio track. */
    isAudioTrack(): this is InputAudioTrack;
    /** The unique ID of this track in the input file. */
    get id(): number;
    /**
     * The 1-based index of this track among all tracks of the same type in the input file. For example, the first
     * video track has number 1, the second video track has number 2, and so on. The index refers to the order in
     * which the tracks are returned by {@link Input.getTracks}.
     */
    get number(): number;
    /**
     * Returns the identifier of the codec used internally by the container. It is not homogenized by Mediabunny
     * and depends entirely on the container format.
     *
     * This method can be used to determine the codec of a track in case Mediabunny doesn't know that codec.
     *
     * - For ISOBMFF files, this resolves to the name of the Sample Description Box (e.g. `'avc1'`).
     * - For Matroska files, this resolves to the value of the `CodecID` element.
     * - For WAVE files, this resolves to the value of the format tag in the `'fmt '` chunk.
     * - For ADTS files, this resolves to the `MPEG-4 Audio Object Type`.
     * - For MPEG-TS files, this resolves to the `streamType` value from the Program Map Table.
     * - In all other cases, this resolves to `null`.
     */
    getInternalCodecId(): Promise<string | number | Uint8Array<ArrayBufferLike> | null>;
    /**
     * See {@link InputTrack.getInternalCodecId}.
     * @deprecated Use {@link InputTrack.getInternalCodecId} instead.
     */
    get internalCodecId(): string | number | Uint8Array<ArrayBufferLike> | null;
    /**
     * Returns the ISO 639-2/T language code for this track. If the language is unknown, this resolves to `'und'`
     * (undetermined).
     */
    getLanguageCode(): Promise<string>;
    /**
     * The ISO 639-2/T language code for this track. If the language is unknown, this field is `'und'` (undetermined).
     * @deprecated Use {@link InputTrack.getLanguageCode} instead.
     */
    get languageCode(): string;
    /** Returns the user-defined name for this track. */
    getName(): Promise<string | null>;
    /**
     * A user-defined name for this track.
     * @deprecated Use {@link InputTrack.getName} instead.
     */
    get name(): string | null;
    /**
     * Returns a positive number x such that all timestamps and durations of all packets of this track are
     * integer multiples of 1/x.
     */
    getTimeResolution(): Promise<number>;
    /**
     * A positive number x such that all timestamps and durations of all packets of this track are
     * integer multiples of 1/x.
     * @deprecated Use {@link InputTrack.getTimeResolution} instead.
     */
    get timeResolution(): number;
    /**
     * Returns whether the timestamps of this track are relative to the Unix epoch (January 1, 1970 00:00:00 UTC).
     * When `true`, each timestamp maps to a definitive point in time.
     */
    isRelativeToUnixEpoch(): Promise<boolean>;
    /**
     * Returns the Unix time (in seconds since January 1, 1970 00:00:00 UTC) that the given track timestamp (in seconds)
     * maps to, or `null` if there is no such mapping. This provides a piecewise-continuous mapping from this track's
     * timestamp space into wall-clock time. Such mapping exists, for example, for HLS playlists with
     * `#EXT-X-PROGRAM-DATE-TIME` tags present.
     *
     * This mapping can be available even when {@link InputTrack.isRelativeToUnixEpoch} is `false`, for example for HLS
     * streams with program date time information but with {@link HlsInputFormatOptions.offsetTimestampsByDateTime}
     * set to `false`.
     */
    getUnixTimeForTimestamp(timestamp: number): Promise<number | null>;
    /**
     * Whether the track's timestamps can be mapped to Unix wall clock time via
     * {@link InputTrack.getUnixTimeForTimestamp}.
     */
    hasUnixTimeMapping(): Promise<boolean>;
    /** Returns the track's disposition, i.e. information about its intended usage. */
    getDisposition(): Promise<TrackDisposition>;
    /**
     * The track's disposition, i.e. information about its intended usage.
     * @deprecated Use {@link InputTrack.getDisposition} instead.
     */
    get disposition(): TrackDisposition;
    /**
     * Returns the peak bitrate of the track in bits per second, as specified in the track's metadata. This might not
     * match the actual media data's bitrate.
     */
    getBitrate(): Promise<number | null>;
    /**
     * Returns the average bitrate of the track in bits per second, as specified in the track's metadata. This might
     * not match the actual media data's bitrate.
     */
    getAverageBitrate(): Promise<number | null>;
    /**
     * Returns the start timestamp of the first packet of this track, in seconds. While often near zero, this value
     * may be positive or even negative. A negative starting timestamp means the track's timing has been offset. Samples
     * with a negative timestamp should not be presented.
     */
    getFirstTimestamp(): Promise<number>;
    /**
     * Returns the end timestamp of the last packet of this track, in seconds.
     *
     * By default, when the underlying media is live, this method will only resolve once the live stream ends. If you
     * want to query the current end timestamp of the stream, set {@link PacketRetrievalOptions.skipLiveWait} to `true`
     * in the options.
     */
    computeDuration(options?: PacketRetrievalOptions): Promise<number>;
    /**
     * Gets the duration (end timestamp) in seconds of this track from metadata stored in the file. This value may be
     * approximate or diverge from the actual, precise duration returned by `.computeDuration()`, but compared to that
     * method, this method is cheaper. When the duration cannot be determined from the file metadata, `null`
     * is returned.
     *
     * By default, when the underlying media is live, this method will only resolve once the live stream
     * ends. If you want to query the current duration of the media, set
     * {@link DurationMetadataRequestOptions.skipLiveWait} to `true` in the options.
     */
    getDurationFromMetadata(options?: DurationMetadataRequestOptions): Promise<number | null>;
    /**
     * Computes aggregate packet statistics for this track, such as average packet rate or bitrate.
     *
     * @param targetPacketCount - This optional parameter sets a target for how many packets this method must have
     * looked at before it can return early; this means, you can use it to aggregate only a subset (prefix) of all
     * packets. This is very useful for getting a great estimate of video frame rate without having to scan through the
     * entire file.
     *
     * By default, when the underlying media is live and `targetPacketCount` is not set, this method will only resolve
     * once the live stream ends. If you want to query the current packet statistics of the stream, set
     * {@link PacketRetrievalOptions.skipLiveWait} to `true` in the options.
     */
    computePacketStats(targetPacketCount?: number, options?: PacketRetrievalOptions): Promise<PacketStats>;
    /**
     * Whether or not this track is currently live, meaning the media's end is still unknown.
     *
     * The value returned by this method may change over time as the track stops being live. To keep track of the
     * track's live status, poll this method at the track's refresh interval
     * via {@link InputTrack.getLiveRefreshInterval}.
     */
    isLive(): Promise<boolean>;
    /**
     * Returns the track's live refresh interval in seconds, or `null` if the track is not live. This interval describes
     * the time it takes, on average, for new live media data to become available.
     */
    getLiveRefreshInterval(): Promise<number | null>;
    /**
     * Returns `true` if this track can be paired with the given track. Two tracks being pairable means they can be
     * presented (displayed) together.
     *
     * Returns `false` if `other` equals `this`.
     */
    canBePairedWith(other: InputTrack): boolean;
    /**
     * Gets the list of other tracks that can be paired with this track. An optional query can be provided to narrow
     * down the results.
     */
    getPairableTracks(query?: InputTrackQuery<InputTrack>): Promise<InputTrack[]>;
    /**
     * Gets the list of other video tracks that can be paired with this track. An optional query can be provided to
     * narrow down the results.
     */
    getPairableVideoTracks(query?: InputTrackQuery<InputVideoTrack>): Promise<InputVideoTrack[]>;
    /**
     * Gets the list of other audio tracks that can be paired with this track. An optional query can be provided to
     * narrow down the results.
     */
    getPairableAudioTracks(query?: InputTrackQuery<InputAudioTrack>): Promise<InputAudioTrack[]>;
    /** Returns the primary track that can be paired with this track, optionally steered by the provided query. */
    getPrimaryPairableVideoTrack(query?: InputTrackQuery<InputVideoTrack>): Promise<InputVideoTrack | null>;
    /** Returns the primary track that can be paired with this track, optionally steered by the provided query. */
    getPrimaryPairableAudioTrack(query?: InputTrackQuery<InputAudioTrack>): Promise<InputAudioTrack | null>;
    /** Returns `true` if there is another track that can be paired with this track. */
    hasPairableTrack(predicate?: (track: InputTrack) => MaybePromise<boolean>): Promise<boolean>;
    /** Returns `true` if there is a video track that can be paired with this track. */
    hasPairableVideoTrack(predicate?: (track: InputVideoTrack) => MaybePromise<boolean>): Promise<boolean>;
    /** Returns `true` if there is an audio track that can be paired with this track. */
    hasPairableAudioTrack(predicate?: (track: InputAudioTrack) => MaybePromise<boolean>): Promise<boolean>;
}

/**
 * Defines a query for input tracks. Can be used to query tracks tersely and expressively, which is especially useful
 * for media inputs with many tracks, such as HLS manifests.
 *
 * @group Input files & tracks
 * @public
 */
export declare type InputTrackQuery<T extends InputTrack> = {
    /**
     * A filter predicate function called for every track. Returning or resolving to `false` excludes the track from
     * the result.
     */
    filter?: (track: T) => MaybePromise<boolean>;
    /**
     * A function called for every track, used to define a track ordering. Tracks are ordered in ascending order using
     * the value returned by this function. When the function returns an array of numbers `arr`, tracks will be sorted
     * by `arr[0]` unless they have the same value, in which case they will be sorted by `arr[1]`, and so on. This
     * allows you to construct a list of ordering criteria, sorted by importance.
     *
     * To help construct complex ordering criteria, the {@link asc}, {@link desc}, and {@link prefer} helper functions
     * can be used.
     */
    sortBy?: (track: T) => MaybePromise<number | number[]>;
};

/**
 * Represents a video track in an input file.
 * @group Input files & tracks
 * @public
 */
export declare class InputVideoTrack extends InputTrack {
    get type(): TrackType;
    /** The codec of the track's packets. */
    getCodec(): Promise<VideoCodec | null>;
    /**
     * The codec of the track's packets.
     * @deprecated Use {@link InputVideoTrack.getCodec} instead.
     */
    get codec(): VideoCodec | null;
    hasOnlyKeyPackets(): Promise<boolean>;
    /** Returns the width in pixels of the track's coded samples, before any transformations or rotations. */
    getCodedWidth(): Promise<number>;
    /**
     * The width in pixels of the track's coded samples, before any transformations or rotations.
     * @deprecated Use {@link InputVideoTrack.getCodedWidth} instead.
     */
    get codedWidth(): number;
    /** Returns the height in pixels of the track's coded samples, before any transformations or rotations. */
    getCodedHeight(): Promise<number>;
    /**
     * The height in pixels of the track's coded samples, before any transformations or rotations.
     * @deprecated Use {@link InputVideoTrack.getCodedHeight} instead.
     */
    get codedHeight(): number;
    /**
     * Returns the row-major 3x3 affine transformation matrix that is used to transform the raw video frames before they
     * are displayed. The raw frames are assumed to be placed with their top-left corner at the origin (0,0).
     *
     * Usually, this matrix models a rotation and a flip. Depending on the file, it may also contain a translation
     * component. When displaying video, you should typically ignore the translation component and display the center of
     * the transformed frame in the center of the viewport.
     */
    getTransformationMatrix(): Promise<TransformationMatrix>;
    /**
     * Returns the angle in degrees by which the track's frames should be rotated (clockwise). The rotation is
     * applied before flipping.
     */
    getRotation(): Promise<Rotation>;
    /**
     * The angle in degrees by which the track's frames should be rotated (clockwise).
     * @deprecated Use {@link InputVideoTrack.getRotation} instead.
     */
    get rotation(): Rotation;
    /**
     * Returns whether the track's frames should be flipped horizontally (about the vertical axis), after rotation.
     */
    getFlip(): Promise<boolean>;
    /**
     * Returns the width of the track's frames in square pixels, adjusted for pixel aspect ratio but before rotation.
     */
    getSquarePixelWidth(): Promise<number>;
    /**
     * The width of the track's frames in square pixels, adjusted for pixel aspect ratio but before rotation.
     * @deprecated Use {@link InputVideoTrack.getSquarePixelWidth} instead.
     */
    get squarePixelWidth(): number;
    /**
     * Returns the height of the track's frames in square pixels, adjusted for pixel aspect ratio but before rotation.
     */
    getSquarePixelHeight(): Promise<number>;
    /**
     * The height of the track's frames in square pixels, adjusted for pixel aspect ratio but before rotation.
     * @deprecated Use {@link InputVideoTrack.getSquarePixelHeight} instead.
     */
    get squarePixelHeight(): number;
    /**
     * Returns the pixel aspect ratio of the track's frames as a rational number in its reduced form. Most videos use
     * square pixels (1:1).
     */
    getPixelAspectRatio(): Promise<Rational>;
    /**
     * The pixel aspect ratio of the track's frames, as a rational number in its reduced form. Most videos use
     * square pixels (1:1).
     * @deprecated Use {@link InputVideoTrack.getPixelAspectRatio} instead.
     */
    get pixelAspectRatio(): Rational;
    /** Returns the display width of the track's frames in pixels, after aspect ratio adjustment and rotation. */
    getDisplayWidth(): Promise<number>;
    /**
     * The display width of the track's frames in pixels, after aspect ratio adjustment and rotation.
     * @deprecated Use {@link InputVideoTrack.getDisplayWidth} instead.
     */
    get displayWidth(): number;
    /** Returns the display height of the track's frames in pixels, after aspect ratio adjustment and rotation. */
    getDisplayHeight(): Promise<number>;
    /**
     * The display height of the track's frames in pixels, after aspect ratio adjustment and rotation.
     * @deprecated Use {@link InputVideoTrack.getDisplayHeight} instead.
     */
    get displayHeight(): number;
    /** Returns the color space of the track's samples. */
    getColorSpace(): Promise<VideoColorSpaceInit>;
    /** If this method returns true, the track's samples use a high dynamic range (HDR). */
    hasHighDynamicRange(): Promise<boolean>;
    /** Checks if this track may contain transparent samples with alpha data. */
    canBeTransparent(): Promise<boolean>;
    /**
     * Returns the [decoder configuration](https://www.w3.org/TR/webcodecs/#video-decoder-config) for decoding the
     * track's packets using a [`VideoDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/VideoDecoder). Returns
     * null if the track's codec is unknown.
     */
    getDecoderConfig(): Promise<VideoDecoderConfig | null>;
    getCodecParameterString(): Promise<string | null>;
    canDecode(): Promise<boolean>;
    determinePacketType(packet: EncodedPacket): Promise<PacketType | null>;
    /**
     * Computes frame rate metrics for this video track, i.e. estimates the video's frame rate. Frame rate is never
     * determined from file metadata (which is unreliable) but is always deduced directly from the actual frame
     * timestamps.
     */
    computeFrameRateMetrics(options?: FrameRateMetricsOptions): Promise<FrameRateMetrics>;
}

/**
 * Format representing files compatible with the ISO base media file format (ISOBMFF), like MP4 or MOV files.
 *
 * This format can make use of {@link InputOptions.initInput}. When the file contents are fragmented but no track
 * initialization info is provided (no `moov` atom), then it must be provided via `initInput`.
 *
 * @group Input formats
 * @public
 */
export declare abstract class IsobmffInputFormat extends InputFormat {
}

/**
 * Additional ISOBMFF input configuration.
 * @group Input formats
 * @public
 */
export declare type IsobmffInputFormatOptions = {
    /**
     * A callback that gets invoked for each key ID required for sample content decryption. The key ID is provided as a
     * 32-character lowercase hexadecimal string.
     *
     * Must return or resolve to a 32-character hexadecimal string or a 16-byte `Uint8Array`.
     */
    resolveKeyId?: (options: {
        /** The key ID that is to be resolved to a key. This is a 32-character lowercase hexadecimal string. */
        keyId: string;
        /**
         * Protection System Specific Header (pssh) boxes that apply to this key ID. Can be used to obtain a
         * description key from a DRM license server.
         */
        psshBoxes: PsshBox[];
    }) => MaybePromise<Uint8Array | string>;
};

/**
 * Format representing files compatible with the ISO base media file format (ISOBMFF), like MP4 or MOV files.
 * @group Output formats
 * @public
 */
export declare abstract class IsobmffOutputFormat extends OutputFormat {
    /** Internal constructor. */
    constructor(options?: IsobmffOutputFormatOptions);
    getSupportedTrackCounts(): TrackCountLimits;
    get supportsVideoTransformationMetadata(): boolean;
    get supportsTimestampedMediaData(): boolean;
    get negativeTimestampSupport(): "full";
}

/**
 * ISOBMFF-specific output options.
 * @group Output formats
 * @public
 */
export declare type IsobmffOutputFormatOptions = {
    /**
     * Controls the placement of metadata in the file. Placing metadata at the start of the file is known as "Fast
     * Start", which results in better playback at the cost of more required processing or memory.
     *
     * Use `false` to disable Fast Start, placing the metadata at the end of the file. Fastest and uses the least
     * memory.
     *
     * Use `'in-memory'` to produce a file with Fast Start by keeping all media chunks in memory until the file is
     * finalized. This produces a high-quality and compact output at the cost of a more expensive finalization step and
     * higher memory requirements. Data will be written monotonically (in order) when this option is set.
     *
     * Use `'reserve'` to reserve space at the start of the file into which the metadata will be written later.	This
     * produces a file with Fast Start but requires knowledge about the expected length of the file beforehand. When
     * using this option, you must set the {@link BaseTrackMetadata.maximumPacketCount} field in the track metadata
     * for all tracks.
     *
     * Use `'fragmented'` to place metadata at the start of the file by creating a fragmented file (fMP4). In a
     * fragmented file, chunks of media and their metadata are written to the file in "fragments", eliminating the need
     * to put all metadata in one place. Fragmented files are useful for streaming contexts, as each fragment can be
     * played individually without requiring knowledge of the other fragments. Furthermore, they remain lightweight to
     * create even for very large files, as they don't require all media to be kept in memory. However, fragmented files
     * are not as widely and wholly supported as regular MP4/MOV files. Data will be written monotonically (in order)
     * when this option is set.
     *
     * When this field is not defined, either `false` or `'in-memory'` will be used, automatically determined based on
     * the type of output target used.
     */
    fastStart?: false | 'in-memory' | 'reserve' | 'fragmented';
    /**
     * When using `fastStart: 'fragmented'`, this field controls the minimum duration of each fragment, in seconds.
     * New fragments will only be created when the current fragment is longer than this value. Defaults to 1 second.
     */
    minimumFragmentDuration?: number;
    /**
     * The metadata format to use for writing metadata tags.
     *
     * - `'auto'` (default): Behaves like `'mdir'` for MP4 and like `'udta'` for QuickTime, matching FFmpeg's default
     * behavior.
     * - `'mdir'`: Write tags into `moov/udta/meta` using the 'mdir' handler format.
     * - `'mdta'`: Write tags into `moov/udta/meta` using the 'mdta' handler format, equivalent to FFmpeg's
     * `use_metadata_tags` flag. This allows for custom keys of arbitrary length.
     * - `'udta'`: Write tags directly into `moov/udta`.
     */
    metadataFormat?: 'auto' | 'mdir' | 'mdta' | 'udta';
    /**
     * Will be called once the ftyp (File Type) box of the output file has been written.
     *
     * @param data - The raw bytes.
     * @param position - The byte offset of the data in the file.
     */
    onFtyp?: (data: Uint8Array, position: number) => unknown;
    /**
     * Will be called once the moov (Movie) box of the output file has been written.
     *
     * @param data - The raw bytes.
     * @param position - The byte offset of the data in the file.
     */
    onMoov?: (data: Uint8Array, position: number) => unknown;
    /**
     * Will be called for each finalized mdat (Media Data) box of the output file. Usage of this callback is not
     * recommended when not using `fastStart: 'fragmented'`, as there will be one monolithic mdat box which might
     * require large amounts of memory.
     *
     * @param data - The raw bytes.
     * @param position - The byte offset of the data in the file.
     */
    onMdat?: (data: Uint8Array, position: number) => unknown;
    /**
     * Will be called for each finalized moof (Movie Fragment) box of the output file.
     *
     * @param data - The raw bytes.
     * @param position - The byte offset of the data in the file.
     * @param timestamp - The start timestamp of the fragment in seconds.
     */
    onMoof?: (data: Uint8Array, position: number, timestamp: number) => unknown;
};

/**
 * Mediabunny's central logging singleton. Use {@link Logging.level} to control how much is printed to the console,
 * and subscribe to log events using {@link Logging.on}.
 *
 * Having manual control over logging is useful for command-line applications where you want full say over the output.
 *
 * @group Logging
 * @public
 */
export declare class Logging {
    private constructor();
    /** The current log level. Defaults to {@link LogLevel.Info}. */
    static get level(): LogLevel;
    static set level(value: LogLevel);
    /** Registers a listener for a log event. Returns a function that, when called, removes the listener again. */
    static on<K extends keyof LoggingEvents>(event: K, listener: (data: LoggingEvents[K]) => unknown, options?: EventListenerOptions_2): () => void;
}

/**
 * The events emitted by {@link Logging}. Each event carries the same arguments that were passed to the corresponding
 * log call.
 *
 * @group Logging
 * @public
 */
export declare type LoggingEvents = {
    /** Emitted before an error is logged. */
    error: unknown[];
    /** Emitted before a warning is logged. */
    warn: unknown[];
    /** Emitted before an informational message is logged. */
    info: unknown[];
};

/**
 * Controls how much information Mediabunny prints to the console. Higher levels include all lower levels.
 *
 * @group Logging
 * @public
 */
export declare enum LogLevel {
    /** Nothing is printed to the console. */
    Silent = 0,
    /** Only errors are printed. */
    Errors = 1,
    /** Errors and warnings are printed. */
    Warnings = 2,
    /** Errors, warnings, and informational messages are printed. */
    Info = 3
}

/**
 * Matroska input format singleton.
 * @group Input formats
 * @public
 */
export declare const MATROSKA: MatroskaInputFormat;

/**
 * Matroska file format.
 *
 * Do not instantiate this class; use the {@link MATROSKA} singleton instead.
 *
 * @group Input formats
 * @public
 */
export declare class MatroskaInputFormat extends InputFormat {
    get name(): string;
    get mimeType(): string;
}

/**
 * T or a promise that resolves to T.
 * @group Miscellaneous
 * @public
 */
export declare type MaybePromise<T> = T | Promise<T>;

/**
 * Union type of known media codecs.
 * @group Codecs
 * @public
 */
export declare type MediaCodec = VideoCodec | AudioCodec | SubtitleCodec;

/**
 * Base class for media sources. Media sources are used to add media samples to an output file.
 * @group Media sources
 * @public
 */
declare abstract class MediaSource_2 {
    /**
     * Closes this source. This prevents future samples from being added and signals to the output file that no further
     * samples will come in for this track. Calling `.close()` is optional but recommended after adding the
     * last sample - for improved performance and reduced memory usage.
     */
    close(): void;
}
export { MediaSource_2 as MediaSource }

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
 * Options for {@link MediaStreamAudioTrackSource}.
 * @group Media sources
 * @public
 */
export declare type MediaStreamAudioTrackSourceOptions = {
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
 * Options for {@link MediaStreamVideoTrackSource}.
 * @group Media sources
 * @public
 */
export declare type MediaStreamVideoTrackSourceOptions = {
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
 * Represents descriptive (non-technical) metadata about a media file, such as title, author, date, cover art, or other
 * attached files. Common tags are normalized by Mediabunny into a uniform format, while the `raw` field can be used to
 * directly read or write the underlying metadata tags (which differ by format).
 *
 * - For MP4/QuickTime files, the metadata refers to the data in `'moov'`-level `'udta'` and `'meta'` atoms.
 * - For WebM/Matroska files, the metadata refers to the Tags and Attachments elements whose target is 50 (MOVIE).
 * - For MP3 files, the metadata refers to the ID3v2 or ID3v1 tags.
 * - For Ogg files, there is no global metadata so instead, the metadata refers to the combined metadata of all tracks,
 * in Vorbis-style comment headers.
 * - For WAVE files, the metadata refers to the chunks within the RIFF INFO chunk.
 * - For ADTS files, the metadata refers to the ID3v2 tags.
 * - For FLAC files, the metadata lives in Vorbis style in the Vorbis comment block, or sometimes in ID3v2 tags at the
 * start of the file.
 * - For MPEG-TS files, metadata tags are currently not supported.
 *
 * @group Metadata tags
 * @public
 */
export declare type MetadataTags = {
    /** Title of the media (e.g. Gangnam Style, Titanic, etc.) */
    title?: string;
    /** Short description or subtitle of the media. */
    description?: string;
    /** Primary artist(s) or creator(s) of the work. */
    artist?: string;
    /** Album, collection, or compilation the media belongs to. */
    album?: string;
    /** Main credited artist for the album/collection as a whole. */
    albumArtist?: string;
    /** Position of this track within its album or collection (1-based). */
    trackNumber?: number;
    /** Total number of tracks in the album or collection. */
    tracksTotal?: number;
    /** Disc index if the release spans multiple discs (1-based). */
    discNumber?: number;
    /** Total number of discs in the release. */
    discsTotal?: number;
    /** The beats per minute (BPM) of the media. */
    beatsPerMinute?: number;
    /** Genre or category describing the media's style or content (e.g. Metal, Horror, etc.) */
    genre?: string;
    /** Release, recording or creation date of the media. */
    date?: Date;
    /** Full text lyrics or transcript associated with the media. */
    lyrics?: string;
    /** Freeform notes, remarks or commentary about the media. */
    comment?: string;
    /** Embedded images such as cover art, booklet scans, artwork or preview frames. */
    images?: AttachedImage[];
    /**
     * The raw, underlying metadata tags.
     *
     * This field can be used for both reading and writing. When reading, it represents the original tags that were used
     * to derive the normalized fields, and any additional metadata that Mediabunny doesn't understand. When writing, it
     * can be used to set arbitrary metadata tags in the output file.
     *
     * The format of these tags differs per format:
     * - MP4/QuickTime: By default, the keys refer to the names of the individual atoms in the `'ilst'` atom inside the
     * `'meta'` atom, and the values are derived from the content of the `'data'` atom inside them. When a `'keys'` atom
     * is also used, then the keys reflect the keys specified there (such as `'com.apple.quicktime.version'`).
     * Additionally, any atoms within the `'udta'` atom are dumped into here, however with unknown internal format
     * (`Uint8Array`).
     * - WebM/Matroska: `SimpleTag` elements whose target is 50 (MOVIE), either containing string or `Uint8Array`
     * values. Additionally, all attached files (such as font files) are included here, where the key corresponds to
     * the FileUID and the value is an {@link AttachedFile}.
     * - MP3: The ID3v2 tags, or a single `'TAG'` key with the contents of the ID3v1 tag. The ID3v2 `'TXXX'`
     * user-defined text frames are exposed as a `Record<string, string>`.
     * - ADTS: The ID3v2 tags, just like in MP3.
     * - Ogg: The key-value string pairs from the Vorbis-style comment header (see RFC 7845, Section 5.2).
     * Additionally, the `'vendor'` key refers to the vendor string within this header. If a key exists more than once,
     * a string array is used instead.
     * - WAVE: The individual metadata chunks within the RIFF INFO chunk. Values are always ISO 8859-1 strings.
     * - FLAC: The key-value string pairs from the vorbis metadata block (see RFC 9639, Section D.2.3).
     * Additionally, the `'vendor'` key refers to the vendor string within this header. If a key exists more than once,
     * a string array is used instead. If ID3v2 tags appear at the start of the file, their content is stored just like
     * for MP3.
     * - MPEG-TS: Not supported.
     */
    raw?: Record<string, string | string[] | Uint8Array | RichImageData | AttachedFile | Record<string, string> | null>;
};

/**
 * Matroska file format.
 *
 * Supports writing transparent video. For a video track to be marked as transparent, the first packet added must
 * contain alpha side data.
 *
 * @group Output formats
 * @public
 */
export declare class MkvOutputFormat extends OutputFormat {
    /** Creates a new {@link MkvOutputFormat} configured with the specified `options`. */
    constructor(options?: MkvOutputFormatOptions);
    getSupportedTrackCounts(): TrackCountLimits;
    get fileExtension(): string;
    get mimeType(): string;
    getSupportedCodecs(): MediaCodec[];
    get supportsVideoTransformationMetadata(): boolean;
    get supportsTimestampedMediaData(): boolean;
    get negativeTimestampSupport(): "prefer-non-negative";
}

/**
 * Matroska-specific output options.
 * @group Output formats
 * @public
 */
export declare type MkvOutputFormatOptions = {
    /**
     * Configures the output to only append new data at the end, useful for live-streaming the file as it's being
     * created. When enabled, some features such as storing duration and seeking will be disabled or impacted, so don't
     * use this option when you want to write out a clean file for later use.
     */
    appendOnly?: boolean;
    /**
     * This field controls the minimum duration of each Matroska cluster, in seconds. New clusters will only be created
     * when the current cluster is longer than this value. Defaults to 1 second.
     */
    minimumClusterDuration?: number;
    /**
     * Will be called once the EBML header of the output file has been written.
     *
     * @param data - The raw bytes.
     * @param position - The byte offset of the data in the file.
     */
    onEbmlHeader?: (data: Uint8Array, position: number) => void;
    /**
     * Will be called once the header part of the Matroska Segment element has been written. The header data includes
     * the Segment element and everything inside it, up to (but excluding) the first Matroska Cluster.
     *
     * @param data - The raw bytes.
     * @param position - The byte offset of the data in the file.
     */
    onSegmentHeader?: (data: Uint8Array, position: number) => unknown;
    /**
     * Will be called for each finalized Matroska Cluster of the output file.
     *
     * @param data - The raw bytes.
     * @param position - The byte offset of the data in the file.
     * @param timestamp - The start timestamp of the cluster in seconds.
     */
    onCluster?: (data: Uint8Array, position: number, timestamp: number) => unknown;
};

/**
 * QuickTime File Format (QTFF), often called MOV. Supports all video and audio codecs, but not subtitle codecs.
 * @group Output formats
 * @public
 */
export declare class MovOutputFormat extends IsobmffOutputFormat {
    /** Creates a new {@link MovOutputFormat} configured with the specified `options`. */
    constructor(options?: IsobmffOutputFormatOptions);
    get fileExtension(): string;
    get mimeType(): string;
    getSupportedCodecs(): MediaCodec[];
}

/**
 * MP3 input format singleton.
 * @group Input formats
 * @public
 */
export declare const MP3: Mp3InputFormat;

/**
 * MP3 file format.
 *
 * Do not instantiate this class; use the {@link MP3} singleton instead.
 *
 * @group Input formats
 * @public
 */
export declare class Mp3InputFormat extends InputFormat {
    get name(): string;
    get mimeType(): string;
}

/**
 * MP3 file format.
 * @group Output formats
 * @public
 */
export declare class Mp3OutputFormat extends OutputFormat {
    /** Creates a new {@link Mp3OutputFormat} configured with the specified `options`. */
    constructor(options?: Mp3OutputFormatOptions);
    getSupportedTrackCounts(): TrackCountLimits;
    get fileExtension(): string;
    get mimeType(): string;
    getSupportedCodecs(): MediaCodec[];
    get supportsVideoTransformationMetadata(): boolean;
    get supportsTimestampedMediaData(): boolean;
    get negativeTimestampSupport(): null;
}

/**
 * MP3-specific output options.
 * @group Output formats
 * @public
 */
export declare type Mp3OutputFormatOptions = {
    /**
     * Controls whether the Xing header, which contains additional metadata as well as an index, is written to the start
     * of the MP3 file. When disabled, the writing process becomes append-only. Defaults to `true`.
     */
    xingHeader?: boolean;
    /**
     * Will be called once the Xing metadata frame is finalized.
     *
     * @param data - The raw bytes.
     * @param position - The byte offset of the data in the file.
     */
    onXingFrame?: (data: Uint8Array, position: number) => unknown;
};

/**
 * MP4 input format singleton.
 * @group Input formats
 * @public
 */
export declare const MP4: Mp4InputFormat;

/**
 * MPEG-4 Part 14 (MP4) file format.
 *
 * Do not instantiate this class; use the {@link MP4} singleton instead.
 *
 * @group Input formats
 * @public
 */
export declare class Mp4InputFormat extends IsobmffInputFormat {
    get name(): string;
    get mimeType(): string;
}

/**
 * MPEG-4 Part 14 (MP4) file format. Supports most codecs.
 * @group Output formats
 * @public
 */
export declare class Mp4OutputFormat extends IsobmffOutputFormat {
    /** Creates a new {@link Mp4OutputFormat} configured with the specified `options`. */
    constructor(options?: IsobmffOutputFormatOptions);
    get fileExtension(): string;
    get mimeType(): string;
    getSupportedCodecs(): MediaCodec[];
}

/**
 * MPEG-TS input format singleton.
 * @group Input formats
 * @public
 */
export declare const MPEG_TS: MpegTsInputFormat;

/**
 * MPEG Transport Stream (MPEG-TS) file format.
 *
 * This format can make use of {@link InputOptions.initInput} to initialize track information even when no
 * initialization information is provided for the track, for example because it has no key frames. In this case, tracks
 * are matched to each other based on their PID.
 *
 * Do not instantiate this class; use the {@link MPEG_TS} singleton instead.
 *
 * @group Input formats
 * @public
 */
export declare class MpegTsInputFormat extends InputFormat {
    get name(): string;
    get mimeType(): string;
}

/**
 * MPEG Transport Stream file format.
 * @group Output formats
 * @public
 */
export declare class MpegTsOutputFormat extends OutputFormat {
    /** Creates a new {@link MpegTsOutputFormat} configured with the specified `options`. */
    constructor(options?: MpegTsOutputFormatOptions);
    getSupportedTrackCounts(): TrackCountLimits;
    get fileExtension(): string;
    get mimeType(): string;
    getSupportedCodecs(): MediaCodec[];
    get supportsVideoTransformationMetadata(): boolean;
    get supportsTimestampedMediaData(): boolean;
    get negativeTimestampSupport(): "prefer-non-negative";
}

/**
 * MPEG-TS-specific output options.
 * @group Output formats
 * @public
 */
export declare type MpegTsOutputFormatOptions = {
    /**
     * Will be called for each 188-byte Transport Stream packet that is written.
     *
     * @param data - The raw bytes.
     * @param position - The byte offset of the data in the file.
     */
    onPacket?: (data: Uint8Array, position: number) => unknown;
};

/**
 * List of known compressed audio codecs, ordered by encoding preference.
 * @group Codecs
 * @public
 */
export declare const NON_PCM_AUDIO_CODECS: readonly ["aac", "opus", "mp3", "vorbis", "flac", "ac3", "eac3", "dts"];

/**
 * This target just discards all incoming data. It is useful for when you need an {@link Output} but extract data from
 * it differently, for example through format-specific callbacks (`onMoof`, `onMdat`, ...) or encoder events.
 * @group Output targets
 * @public
 */
export declare class NullTarget extends Target {
}

/**
 * Ogg input format singleton.
 * @group Input formats
 * @public
 */
export declare const OGG: OggInputFormat;

/**
 * Ogg file format.
 *
 * Do not instantiate this class; use the {@link OGG} singleton instead.
 *
 * @group Input formats
 * @public
 */
export declare class OggInputFormat extends InputFormat {
    get name(): string;
    get mimeType(): string;
}

/**
 * Ogg file format.
 * @group Output formats
 * @public
 */
export declare class OggOutputFormat extends OutputFormat {
    /** Creates a new {@link OggOutputFormat} configured with the specified `options`. */
    constructor(options?: OggOutputFormatOptions);
    getSupportedTrackCounts(): TrackCountLimits;
    get fileExtension(): string;
    get mimeType(): string;
    getSupportedCodecs(): MediaCodec[];
    get supportsVideoTransformationMetadata(): boolean;
    get supportsTimestampedMediaData(): boolean;
    get negativeTimestampSupport(): "none";
}

/**
 * Ogg-specific output options.
 * @group Output formats
 * @public
 */
export declare type OggOutputFormatOptions = {
    /**
     * The maximum duration of each Ogg page, in seconds. This is useful for streaming contexts where more frequent page
     * output is desired. By default, pages are only flushed when they exceed a certain size.
     */
    maximumPageDuration?: number;
    /**
     * Will be called for each Ogg page that is written.
     *
     * @param data - The raw bytes.
     * @param position - The byte offset of the data in the file.
     * @param source - The {@link MediaSource} backing the page's logical bitstream (track).
     */
    onPage?: (data: Uint8Array, position: number, source: MediaSource_2) => unknown;
};

/**
 * Main class orchestrating the creation of new media files.
 * @group Output files
 * @public
 */
export declare class Output<F extends OutputFormat = OutputFormat, T extends Target = Target> extends EventEmitter<OutputEvents> {
    /** The format of the output file. */
    readonly format: F;
    /** The current state of the output. */
    state: 'pending' | 'started' | 'canceled' | 'finalizing' | 'finalized';
    /**
     * The {@link OutputTrackGroup} that all tracks are assigned to by default unless otherwise specified by
     * {@link BaseTrackMetadata.group}.
     */
    readonly defaultTrackGroup: OutputTrackGroup;
    /**
     * The tracks that have been added to this output. Treat it as a readonly field; to add tracks, use the methods.
     */
    readonly tracks: OutputTrack[];
    /**
     * The target to which the root file will be written. Throws when using {@link PathedTarget} with an async callback;
     * prefer the `'target'` event for those cases.
     */
    get target(): T;
    /**
     * Creates a new instance of {@link Output} which can then be used to create a new media file according to the
     * specified {@link OutputOptions}.
     */
    constructor(options: OutputOptions<F, T>);
    /** Adds a video track to the output with the given source. Can only be called before the output is started. */
    addVideoTrack(source: VideoSource, metadata?: VideoTrackMetadata): OutputVideoTrack;
    /** Adds an audio track to the output with the given source. Can only be called before the output is started. */
    addAudioTrack(source: AudioSource, metadata?: AudioTrackMetadata): OutputAudioTrack;
    /** Adds a subtitle track to the output with the given source. Can only be called before the output is started. */
    addSubtitleTrack(source: SubtitleSource, metadata?: SubtitleTrackMetadata): OutputSubtitleTrack;
    /**
     * Sets descriptive metadata tags about the media file, such as title, author, date, or cover art. When called
     * multiple times, only the metadata from the last call will be used.
     *
     * Can only be called before the output is started.
     */
    setMetadataTags(tags: MetadataTags): void;
    /**
     * Whether the output has enough tracks (of the correct type) to be started, based on the requirements of the output
     * format.
     */
    hasEnoughTracks(): boolean;
    /**
     * Starts the creation of the output file. This method should be called after all tracks have been added. Only after
     * the output has started can media samples be added to the tracks.
     *
     * @returns A promise that resolves when the output has successfully started and is ready to receive media samples.
     */
    start(): Promise<void>;
    /**
     * Resolves with the full MIME type of the output file, including track codecs.
     *
     * The returned promise will resolve only once the precise codec strings of all tracks are known.
     */
    getMimeType(): Promise<string>;
    /**
     * Cancels the creation of the output file, releasing internal resources like encoders and preventing further
     * samples from being added.
     *
     * @returns A promise that resolves once all internal resources have been released.
     */
    cancel(): Promise<void>;
    /**
     * Finalizes the output file. This method must be called after all media samples across all tracks have been added.
     * Once the Promise returned by this method completes, the output file is ready.
     */
    finalize(): Promise<void>;
}

/**
 * An {@link OutputTrack} providing audio data, created using {@link Output.addAudioTrack}.
 * @group Output files
 * @public
 */
export declare class OutputAudioTrack extends OutputTrack {
    readonly type: 'audio';
    readonly source: AudioSource;
    readonly metadata: AudioTrackMetadata;
}

/**
 * Describes the events that an {@link Output} emits, with each key being an event name and its value being the
 * event data.
 *
 * @group Output files
 * @public
 */
export declare type OutputEvents = {
    /** Emitted whenever a {@link Target} is obtained by the output. Useful to track writes. */
    target: {
        /** The target that was obtained. */
        target: Target;
        /** The request that led to the target being obtained, or `null` if the output is not pathed. */
        request: TargetRequest | null;
        /** Whether the target is the root file of the media. */
        isRoot: boolean;
    };
};

/**
 * Base class representing an output media file format.
 * @group Output formats
 * @public
 */
export declare abstract class OutputFormat {
    /** The file extension used by this output format, beginning with a dot. */
    abstract get fileExtension(): string;
    /** The base MIME type of the output format. */
    abstract get mimeType(): string;
    /** Returns a list of media codecs that this output format can contain. */
    abstract getSupportedCodecs(): MediaCodec[];
    /** Returns the number of tracks that this output format supports. */
    abstract getSupportedTrackCounts(): TrackCountLimits;
    /** Whether this output format supports video rotation and flip metadata. */
    abstract get supportsVideoTransformationMetadata(): boolean;
    /**
     * Whether this output format supports video rotation metadata.
     * @deprecated Use {@link OutputFormat.supportsVideoTransformationMetadata} instead.
     */
    get supportsVideoRotationMetadata(): boolean;
    /**
     * Whether this output format's tracks store timestamped media data. When `true`, the timestamps of added packets
     * will be respected, allowing things like gaps in media data or non-zero start times. When `false`, the format's
     * media data implicitly starts at zero and follows an implicit sequential timing from there, using the intrinsic
     * durations of the media data.
     */
    abstract get supportsTimestampedMediaData(): boolean;
    /**
     * The degree to which this output format supports writing media data with negative timestamps.
     * - `'full'` - Negative timestamps are fully supported.
     * - `'prefer-non-negative'` - Negative timestamps are technically supported, but their use is discouraged.
     * - `'none'` - Negative timestamps are not supported.
     * - `null` - Not applicable since the container doesn't support timestamped media at all.
     */
    abstract get negativeTimestampSupport(): 'full' | 'prefer-non-negative' | 'none' | null;
    /** Returns a list of video codecs that this output format can contain. */
    getSupportedVideoCodecs(): VideoCodec[];
    /** Returns a list of audio codecs that this output format can contain. */
    getSupportedAudioCodecs(): AudioCodec[];
    /** Returns a list of subtitle codecs that this output format can contain. */
    getSupportedSubtitleCodecs(): SubtitleCodec[];
}

/**
 * The options for creating an Output object.
 * @group Output files
 * @public
 */
export declare type OutputOptions<F extends OutputFormat = OutputFormat, T extends Target = Target> = {
    /** The format of the output file. */
    format: F;
    /** The target to which the file will be written. */
    target: T | PathedTarget<T>;
    /**
     * Optional; the target to which the track initialization data will be written. Most formats do not make use of
     * this, but some do, such as {@link CmafOutputFormat}.
     *
     * When this is a function, it will only be called if an init target is needed.
     */
    initTarget?: T | (() => MaybePromise<T>);
    /**
     * Optional; a callback to be called at the end of {@link Output.finalize}. Can be used to run logic once the
     * output has completed. If a promise is returned, it will be awaited internally by {@link Output.finalize}.
     */
    onFinalize?: () => MaybePromise<unknown>;
};

/**
 * An {@link OutputTrack} providing subtitle data, created using {@link Output.addSubtitleTrack}.
 * @group Output files
 * @public
 */
export declare class OutputSubtitleTrack extends OutputTrack {
    readonly type: 'subtitle';
    readonly source: SubtitleSource;
    readonly metadata: SubtitleTrackMetadata;
}

/**
 * Represents a track added to an {@link Output}.
 * @group Output files
 * @public
 */
export declare abstract class OutputTrack {
    /** The {@link Output} this track belongs to. */
    readonly output: Output;
    /** The type of this track. */
    readonly type: TrackType;
    /** The media source providing data for this track. */
    readonly source: MediaSource_2;
    /** The metadata associated with this track. */
    readonly metadata: BaseTrackMetadata;
    /** Returns true if and only if this track is a video track. */
    isVideoTrack(): this is OutputVideoTrack;
    /** Returns true if and only if this track is an audio track. */
    isAudioTrack(): this is OutputAudioTrack;
    /** Returns true if and only if this track is a subtitle track. */
    isSubtitleTrack(): this is OutputSubtitleTrack;
    /**
     * Returns true if and only if this track can be paired with the given other track. Pairability can be set using
     * the {@link BaseTrackMetadata.group} option.
     */
    canBePairedWith(other: OutputTrack): boolean;
}

/**
 * Used to define pairability between {@link OutputTrack} instances. First create the group, then assign tracks to it
 * via {@link BaseTrackMetadata.group}.
 *
 * Two tracks are considered _pairable_ if they are in the same group but have a different {@link TrackType}, or if they
 * are in different groups that are paired with each other. Groups can be paired with each other using the
 * {@link OutputTrackGroup.pairWith} method.
 *
 * @group Output files
 * @public
 */
export declare class OutputTrackGroup {
    /** Creates a new {@link OutputTrackGroup}. */
    constructor();
    /**
     * Marks this group as being pairable with another group, symmetrically. Output tracks where each track is assigned
     * to one half of a group pairing are then considered pairable.
     *
     * You cannot pair a group with itself.
     */
    pairWith(other: OutputTrackGroup): void;
}

/**
 * An {@link OutputTrack} providing video data, created using {@link Output.addVideoTrack}.
 * @group Output files
 * @public
 */
export declare class OutputVideoTrack extends OutputTrack {
    readonly type: 'video';
    readonly source: VideoSource;
    readonly metadata: VideoTrackMetadata;
}

/**
 * Additional options for controlling packet retrieval.
 * @group Media sinks
 * @public
 */
export declare type PacketRetrievalOptions = {
    /**
     * When set to `true`, only packet metadata (like timestamp) will be retrieved - the actual packet data will not
     * be loaded.
     */
    metadataOnly?: boolean;
    /**
     * When set to `true`, key packets will be verified upon retrieval by looking into the packet's bitstream.
     * If not enabled, the packet types will be determined solely by what's stored in the containing file and may be
     * incorrect, potentially leading to decoder errors. Since determining a packet's actual type requires looking into
     * its data, this option cannot be enabled together with `metadataOnly`.
     */
    verifyKeyPackets?: boolean;
    /**
     * When querying packets in live media that are in the future relative to the current live edge, Mediabunny will,
     * by default, wait for the stream to advance until the query can be satisfied. In a sense, Mediabunny simply treats
     * live streams as media files that are still being written, and any read that depends on future information will
     * wait until it can be fulfilled.
     *
     * If you want to query packets based only on the currently known information, set this field to `true` - this way,
     * Mediabunny will never wait for the live stream to catch up.
     *
     * For non-live media, this field has no effect.
     */
    skipLiveWait?: boolean;
};

/**
 * Contains aggregate statistics about the encoded packets of a track.
 * @group Input files & tracks
 * @public
 */
export declare type PacketStats = {
    /** The total number of packets. */
    packetCount: number;
    /** The average number of packets per second. For video tracks, this will equal the average frame rate (FPS). */
    averagePacketRate: number;
    /** The average number of bits per second. */
    averageBitrate: number;
};

/**
 * The type of a packet. Key packets can be decoded without previous packets, while delta packets depend on previous
 * packets.
 * @group Packets
 * @public
 */
export declare type PacketType = 'key' | 'delta';

/**
 * A source which can create new sources from file paths. Required for multi-file inputs such as HLS playlists.
 * @public
 * @group Input sources
 */
export declare abstract class PathedSource extends Source {
    /**
     * The path that points to the root file; the entry file of the media.
     *
     * This path may be modified by the source to indicate a redirect: an updated path to perform new requests
     * relative to.
     */
    rootPath: FilePath;
    /** The callback that is called for each requested file; must return a {@link Source} or {@link SourceRef}. */
    readonly requestHandler: (request: SourceRequest) => MaybePromise<Source | SourceRef>;
    constructor(
    /**
     * The path that points to the root file; the entry file of the media.
     *
     * This path may be modified by the source to indicate a redirect: an updated path to perform new requests
     * relative to.
     */
    rootPath: FilePath, 
    /** The callback that is called for each requested file; must return a {@link Source} or {@link SourceRef}. */
    requestHandler: (request: SourceRequest) => MaybePromise<Source | SourceRef>);
}

/**
 * A special target for writing multi-file media where each file is uniquely identified by a path.
 * @group Output targets
 * @public
 */
export declare class PathedTarget<T extends Target> {
    /** The path that points to the root file; the entry file of the media. */
    readonly rootPath: FilePath;
    /** The callback that is called for each file that needs to be written; must return a {@link Target}. */
    readonly getTarget: (request: TargetRequest) => MaybePromise<T>;
    /** Creates a new {@link PathedTarget} from a root path and a callback. */
    constructor(
    /** The path that points to the root file; the entry file of the media. */
    rootPath: FilePath, 
    /** The callback that is called for each file that needs to be written; must return a {@link Target}. */
    getTarget: (request: TargetRequest) => MaybePromise<T>);
}

/**
 * List of known PCM (uncompressed) audio codecs, ordered by encoding preference.
 * @group Codecs
 * @public
 */
export declare const PCM_AUDIO_CODECS: readonly ["pcm-s16", "pcm-s16be", "pcm-s24", "pcm-s24be", "pcm-s32", "pcm-s32be", "pcm-f32", "pcm-f32be", "pcm-f64", "pcm-f64be", "pcm-u8", "pcm-s8", "ulaw", "alaw"];

/**
 * Helper function for use in {@link InputTrackQuery.sortBy}, used to sort tracks by boolean properties. `true` is
 * sorted to the start, `false` to the end. Useful for expressing soft preferences (e.g., "I'd prefer 1080p, but other
 * resolutions are fine too") as opposed to {@link InputTrackQuery.filter} which expresses hard requirements for
 * tracks.
 *
 * @group Input files & tracks
 * @public
 */
export declare const prefer: (value: boolean) => number;

/**
 * Represents a Protection System Specific Header box as used by ISOBMFF Common Encryption. Contains
 * DRM system-specific data that can be used to obtain a decryption key.
 *
 * @group Miscellaneous
 * @public
 */
export declare type PsshBox = {
    /** The system ID as a 32-bit lowercase hex string. */
    systemId: string;
    /**
     * The list of key IDs (32-bit lowercase hex strings) this box applies to, or `null` if it applies to all key IDs.
     */
    keyIds: string[] | null;
    /** The content protection system-specific data. */
    data: Uint8Array;
};

/**
 * QuickTime File Format input format singleton.
 * @group Input formats
 * @public
 */
export declare const QTFF: QuickTimeInputFormat;

/**
 * Quality options expressing a qualitative (subjective) quality level.
 * @group Encoding
 * @public
 */
export declare type QualitativeQualityOptions = {
    /**
     * A qualitative quality level. Either a number ranging from 0 to 1, where 0 means worst and 1 means best quality,
     * or one of five named levels ('very-low', 'low', 'medium', 'high', 'very-high'), which map to 0, 0.25, 0.5, 0.75
     * and 1, respectively.
     *
     * Values outside the [0, 1] range are also allowed for extreme behavior, but might break on certain systems.
     *
     * Internally, either bitrate- or quantizer-driven encoding will be used, depending on availability and settings.
     */
    quality: number | QualityLevel;
    /**
     * When true, the quality level always maps to a bitrate, even if quantizer-based encoding is available. Useful
     * when a predictable output size matters more than constant quality.
     */
    preferBitrate?: boolean;
    /** The bitrate mode to use when encoding resolves to bitrate-based encoding. */
    bitrateMode?: 'constant' | 'variable';
};

/**
 * Represents a desired encoding quality. Can express a qualitative quality level, an explicit bitrate, an explicit
 * quantizer value, or a combination thereof.
 * @group Encoding
 * @public
 */
export declare class Quality {
    constructor(options: QualityOptions | number | QualityLevel);
}

/**
 * Represents a high media quality.
 * @deprecated Use `new Quality('high')` instead.
 * @group Encoding
 * @public
 */
export declare const QUALITY_HIGH: Quality;

/**
 * Represents a low media quality.
 * @deprecated Use `new Quality('low')` instead.
 * @group Encoding
 * @public
 */
export declare const QUALITY_LOW: Quality;

/**
 * Represents a medium media quality.
 * @deprecated Use `new Quality('medium')` instead.
 * @group Encoding
 * @public
 */
export declare const QUALITY_MEDIUM: Quality;

/**
 * Represents a very high media quality.
 * @deprecated Use `new Quality('very-high')` instead.
 * @group Encoding
 * @public
 */
export declare const QUALITY_VERY_HIGH: Quality;

/**
 * Represents a very low media quality.
 * @deprecated Use `new Quality('very-low')` instead.
 * @group Encoding
 * @public
 */
export declare const QUALITY_VERY_LOW: Quality;

/**
 * A named qualitative quality level.
 * @group Encoding
 * @public
 */
export declare type QualityLevel = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';

/**
 * Options describing a desired encoding quality.
 * @group Encoding
 * @public
 */
export declare type QualityOptions = QualitativeQualityOptions | QuantitativeQualityOptions;

/**
 * Quality options expressing quantitative rate control: an explicit bitrate, an explicit quantizer, or both.
 * @group Encoding
 * @public
 */
export declare type QuantitativeQualityOptions = {
    /**
     * An explicit bitrate in bits per second. When set, this bitrate is used for encoding. It also acts as the
     * fallback in case a specified quantizer cannot be used.
     */
    bitrate?: number;
    /** The bitrate mode to use when encoding resolves to bitrate-based encoding. */
    bitrateMode?: 'constant' | 'variable';
    /**
     * An explicit quantizer value used for quantizer-based video encoding; lower values mean higher quality. The valid
     * range depends on the codec and is defined in the
     * [Mediabunny Codec Registry](https://mediabunny.dev/codec-registry/overview). This option is like FFmpeg's
     * constant-rate factor (CRF).
     *
     * If the quantizer cannot be used due to missing support, then it will throw, unless `bitrate` is defined as a
     * fallback.
     */
    quantizer?: number;
};

/**
 * QuickTime File Format (QTFF), often called MOV.
 *
 * Do not instantiate this class; use the {@link QTFF} singleton instead.
 *
 * @group Input formats
 * @public
 */
export declare class QuickTimeInputFormat extends IsobmffInputFormat {
    get name(): string;
    get mimeType(): string;
}

/**
 * A source that covers a range (offset + length) of another source. Useful for reading files that are embedded within
 * larger files.
 *
 * @group Input sources
 * @public
 */
export declare class RangedSource extends Source {
    ref(): SourceRef<this>;
}

/**
 * A target that writes to a subrange (defined by an offset) of another, underlying target. Useful for writing a file
 * into a section of a larger file.
 * @group Output targets
 * @public
 */
export declare class RangedTarget extends Target {
}

/**
 * A rational number; a ratio of two integers.
 * @group Miscellaneous
 * @public
 */
export declare type Rational = {
    /** The numerator of the rational number. */
    num: number;
    /** The denominator of the rational number. */
    den: number;
};

/**
 * A source backed by a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) of
 * `Uint8Array`, representing an append-only byte stream of unknown length. This is the source to use for incrementally
 * streaming in input files that are still being constructed and whose size we don't yet know, like for example the
 * output chunks of [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder).
 *
 * This source is *unsized*, meaning calls to `.getSize()` will throw and readers are more limited due to the
 * lack of random file access. You should only use this source with sequential access patterns, such as reading all
 * packets from start to end. This source does not work well with random access patterns unless you increase its
 * max cache size.
 *
 * @group Input sources
 * @public
 */
export declare class ReadableStreamSource extends Source {
    /** Creates a new {@link ReadableStreamSource} backed by the specified `ReadableStream<Uint8Array>`. */
    constructor(stream: ReadableStream<Uint8Array>, options?: ReadableStreamSourceOptions);
}

/**
 * Options for {@link ReadableStreamSource}.
 * @group Input sources
 * @public
 */
export declare type ReadableStreamSourceOptions = {
    /** The maximum number of bytes the cache is allowed to hold in memory. Defaults to 32 MiB. */
    maxCacheSize?: number;
    /** Handles errors that occur while no read is pending. By default, these become unhandled rejections. */
    handleUnhandledError?: (error: unknown) => unknown;
};

/**
 * Specifies a rectangular region where all quantities must be non-negative integers.
 * @group Miscellaneous
 * @public
 */
export declare type Rectangle = {
    /** The distance in pixels to the left edge of the rectangle. */
    left: number;
    /** The distance in pixels to the top edge of the rectangle. */
    top: number;
    /** The width in pixels of the rectangle. */
    width: number;
    /** The height in pixels of the rectangle. */
    height: number;
};

/**
 * Registers a custom video or audio decoder. Registered decoders will automatically be used for decoding whenever
 * possible.
 * @group Custom coders
 * @public
 */
export declare const registerDecoder: (decoder: typeof CustomVideoDecoder | typeof CustomAudioDecoder) => void;

/**
 * Registers a custom video or audio encoder. Registered encoders will automatically be used for encoding whenever
 * possible.
 * @group Custom coders
 * @public
 */
export declare const registerEncoder: (encoder: typeof CustomVideoEncoder | typeof CustomAudioEncoder) => void;

/**
 * Registers a callback to handle the transformation of {@link VideoSample} instances. The callback can either return
 * the transformed sample, or `null` to indicate that it doesn't want to handle the given transformation task.
 * @group Samples
 * @public
 */
export declare const registerVideoSampleTransformer: (transformer: (sample: VideoSample, description: VideoSampleTransformationDescription) => MaybePromise<VideoSample | null>) => void;

/**
 * Image data with additional metadata.
 *
 * @group Metadata tags
 * @public
 */
export declare class RichImageData {
    /** The raw image data. */
    data: Uint8Array;
    /** An RFC 6838 MIME type (e.g. image/jpeg, image/png, etc.) */
    mimeType: string;
    /** Creates a new {@link RichImageData}. */
    constructor(
    /** The raw image data. */
    data: Uint8Array, 
    /** An RFC 6838 MIME type (e.g. image/jpeg, image/png, etc.) */
    mimeType: string);
}

/**
 * Represents a clockwise rotation in degrees.
 * @group Miscellaneous
 * @public
 */
export declare type Rotation = 0 | 90 | 180 | 270;

/**
 * Sets all keys K of T to be optional.
 * @group Miscellaneous
 * @public
 */
export declare type SetOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Sets all keys K of T to be required.
 * @group Miscellaneous
 * @public
 */
export declare type SetRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * The source base class, representing a resource from which bytes can be read.
 * @group Input sources
 * @public
 */
export declare abstract class Source extends EventEmitter<SourceEvents> {
    constructor();
    /**
     * Resolves with the total size of the file in bytes. This function is memoized, meaning only the first call
     * will retrieve the size.
     *
     * Returns null if the source is unsized.
     */
    getSizeOrNull(): Promise<number | null>;
    /**
     * Resolves with the total size of the file in bytes. This function is memoized, meaning only the first call
     * will retrieve the size.
     *
     * Throws an error if the source is unsized.
     */
    getSize(): Promise<number>;
    /**
     * Returns a new {@link RangedSource} that maps data onto this source using the given offset and length. If a length
     * is not provided, the ranged source spans until the end of this source's data.
     *
     * Useful for reading files that are embedded within larger files.
     */
    slice(offset: number, length?: number): RangedSource;
    /**
     * Called each time data is retrieved from the source. Will be called with the retrieved range (end exclusive).
     *
     * @deprecated Use `source.on('read', ({ start, end }) => ...)` instead.
     */
    onread: ((start: number, end: number) => unknown) | null;
    /**
     * Creates a new `SourceRef` pointing to this source. You are expected to call `.free()` on said `SourceRef` when
     * you're done with it.
     */
    ref(): SourceRef<this>;
}

/**
 * The events emitted by a {@link Source}, with each key being an event name and its value being the event data.
 * @group Input sources
 * @public
 */
export declare type SourceEvents = {
    /** Emitted each time data is retrieved from the source. */
    read: {
        /** The start of the retrieved range, inclusive. */
        start: number;
        /** The end of the retrieved range, exclusive. */
        end: number;
    };
};

/**
 * A reference to a {@link Source}, used to manage a source's lifecycle. Creating a `SourceRef` via {@link Source.ref}
 * increases that source's internal reference count. As long as a source has a non-zero reference count, it is assumed
 * to still be in use. Once all references are freed via {@link SourceRef.free}, the source gets disposed.
 *
 * @group Input sources
 * @public
 */
export declare class SourceRef<S extends Source = Source> implements Disposable {
    /** The {@link Source} this ref references. Accessing this field throws an error after having freed the ref. */
    get source(): S;
    /** Whether or not this reference has been freed via {@link SourceRef.free}. */
    get freed(): boolean;
    /**
     * Frees the ref, decrementing the source's internal reference count. If the source's internal reference count
     * reaches zero, it gets disposed. To catch bugs, this method throws if the ref is already freed.
     */
    free(): void;
    /**
     * Calls {@link SourceRef.free}.
     */
    [Symbol.dispose](): void;
}

/**
 * A request for a {@link Source} at the given path.
 * @group Input sources
 * @public
 */
export declare type SourceRequest = {
    /** The requested file path. */
    path: FilePath;
    /** Whether the requested file is the root file. */
    isRoot: boolean;
};

/**
 * An alias for {@link CustomSource}.
 * @deprecated This name is misleading and will be removed in a future release. Please use {@link CustomSource} instead.
 *
 * @group Input sources
 * @public
 */
export declare const StreamSource: typeof CustomSource;

/**
 * An alias for {@link CustomSourceOptions}.
 * @deprecated This name is misleading and will be removed in a future release. Please use
 * {@link CustomSourceOptions} instead.
 *
 * @group Input sources
 * @public
 */
export declare type StreamSourceOptions = CustomSourceOptions;

/**
 * This target writes data to a [`WritableStream`](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream),
 * making it a general-purpose target for writing data anywhere. It is also compatible with
 * [`FileSystemWritableFileStream`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream) for
 * use with the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API). The
 * `WritableStream` can also apply backpressure, which will propagate to the output and throttle the encoders.
 * @group Output targets
 * @public
 */
export declare class StreamTarget extends Target {
    /** Creates a new {@link StreamTarget} which writes to the specified `writable`. */
    constructor(writable: WritableStream<StreamTargetChunk>, options?: StreamTargetOptions);
}

/**
 * A data chunk for {@link StreamTarget}.
 * @group Output targets
 * @public
 */
export declare type StreamTargetChunk = {
    /** The operation type. */
    type: 'write';
    /** The data to write. */
    data: Uint8Array<ArrayBuffer>;
    /** The byte offset in the output file at which to write the data. */
    position: number;
};

/**
 * Options for {@link StreamTarget}.
 * @group Output targets
 * @public
 */
export declare type StreamTargetOptions = {
    /**
     * When setting this to true, data created by the output will first be accumulated and only written out
     * once it has reached sufficient size, using a default chunk size of 16 MiB. This is useful for reducing the total
     * amount of writes, at the cost of latency.
     */
    chunked?: boolean;
    /** When using `chunked: true`, this specifies the maximum size of each chunk. Defaults to 16 MiB. */
    chunkSize?: number;
};

/**
 * List of known subtitle codecs, ordered by encoding preference.
 * @group Codecs
 * @public
 */
export declare const SUBTITLE_CODECS: readonly ["webvtt"];

/**
 * Union type of known subtitle codecs.
 * @group Codecs
 * @public
 */
export declare type SubtitleCodec = typeof SUBTITLE_CODECS[number];

/**
 * Base class for subtitle sources - sources for subtitle tracks.
 * @group Media sources
 * @public
 */
export declare abstract class SubtitleSource extends MediaSource_2 {
    /** Internal constructor. */
    constructor(codec: SubtitleCodec);
}

/**
 * Additional metadata for subtitle tracks.
 * @group Output files
 * @public
 */
export declare type SubtitleTrackMetadata = BaseTrackMetadata & {};

/**
 * Base class for targets, specifying where output files are written.
 * @group Output targets
 * @public
 */
export declare abstract class Target extends EventEmitter<TargetEvents> {
    /**
     * Called each time data is written to the target. Will be called with the byte range into which data was written.
     *
     * Use this callback to track the size of the output file as it grows. But be warned, this function is chatty and
     * gets called *extremely* often.
     *
     * @deprecated Use `target.on('write', ({ start, end }) => ...)` instead.
     */
    onwrite: ((start: number, end: number) => unknown) | null;
    /**
     * Returns a new {@link RangedTarget} that writes data to this target using the given offset.
     *
     * Useful for writing a file into a section of a larger file.
     */
    slice(offset: number): RangedTarget;
}

/**
 * The events emitted by a {@link Target}.
 * @group Output targets
 * @public
 */
export declare type TargetEvents = {
    /** Emitted each time data is written to the target. */
    write: {
        /** The start of the written range, inclusive. */
        start: number;
        /** The end of the written range, exclusive. */
        end: number;
    };
    /** Emitted when the target is finalized. */
    finalized: void;
};

/**
 * A request for a {@link Target} at the given path.
 * @group Output targets
 * @public
 */
export declare type TargetRequest = {
    /** The requested file path. */
    path: FilePath;
    /** Whether the to-be-written file will be the root file. */
    isRoot: boolean;
    /** The MIME type of the to-be-written file. */
    mimeType: string;
};

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

/**
 * Specifies the number of tracks (for each track type and in total) that an output format supports.
 * @group Output formats
 * @public
 */
export declare type TrackCountLimits = {
    [K in TrackType]: InclusiveIntegerRange;
} & {
    /** Specifies the overall allowed range of track counts for the output format. */
    total: InclusiveIntegerRange;
};

/**
 * Specifies a track's disposition, i.e. information about its intended usage.
 * @public
 * @group Miscellaneous
 */
export declare type TrackDisposition = {
    /**
     * Indicates that this track is eligible for automatic selection by a player. Multiple tracks can be default tracks.
     */
    default: boolean;
    /** Indicates that the track is the primary track among other tracks of its type. */
    primary: boolean;
    /**
     * Indicates that players should always display this track by default, even if it goes against the user's default
     * preferences. For example, a subtitle track only containing translations of foreign-language audio.
     */
    forced: boolean;
    /** Indicates that this track is in the content's original language. */
    original: boolean;
    /** Indicates that this track contains commentary. */
    commentary: boolean;
    /** Indicates that this track is intended for hearing-impaired users. */
    hearingImpaired: boolean;
    /** Indicates that this track is intended for visually-impaired users. */
    visuallyImpaired: boolean;
};

/**
 * Union type of all track types.
 * @group Miscellaneous
 * @public
 */
export declare type TrackType = typeof ALL_TRACK_TYPES[number];

/**
 * Row-major 3x3 affine transformation matrix.
 * @group Miscellaneous
 * @public
 */
export declare type TransformationMatrix = [
a: number,
b: number,
u: number,
c: number,
d: number,
v: number,
x: number,
y: number,
w: number
];

/**
 * Thrown when trying to operate on an input that has an unsupported or unrecognizable format.
 * @group Input files & tracks
 * @public
 */
export declare class UnsupportedInputFormatError extends Error {
    /** Creates a new {@link UnsupportedInputFormatError}. */
    constructor(message?: string);
}

/**
 * A source backed by a URL. This is useful for reading data from the network. Requests will be made using an optimized
 * reading and prefetching pattern to minimize request count and latency. Works best with servers that support HTTP
 * range requests; otherwise, resources must be streamed and read sequentially.
 * @group Input sources
 * @public
 */
export declare class UrlSource extends PathedSource {
    /**
     * Creates a new {@link UrlSource} backed by the resource at the specified URL.
     *
     * When passing a `Request` instance, note that its `signal` will be overridden by Mediabunny; if you want to cancel
     * ongoing requests, use {@link Input.dispose}.
     */
    constructor(url: string | URL | Request, options?: UrlSourceOptions);
}

/**
 * Options for {@link UrlSource}.
 * @group Input sources
 * @public
 */
export declare type UrlSourceOptions = {
    /**
     * The [`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit) used by the Fetch API. Can be
     * used to further control the requests, such as setting custom headers.
     *
     * The `signal` field is not available, as Mediabunny controls request cancellation internally. If you want to
     * cancel ongoing requests, use {@link Input.dispose}.
     */
    requestInit?: Omit<RequestInit, 'signal'>;
    /**
     * A function that returns the delay (in seconds) before retrying a failed request. The function is called
     * with the number of previous, unsuccessful attempts, as well as with the error with which the previous request
     * failed. If the function returns `null`, no more retries will be made.
     *
     * By default, it uses an exponential backoff algorithm that never gives up unless
     * a CORS error is suspected (`fetch()` did reject, `navigator.onLine` is true and origin is different).
     */
    getRetryDelay?: (previousAttempts: number, error: unknown, url: string | URL | Request) => number | null;
    /** The maximum number of bytes the cache is allowed to hold in memory. Defaults to 64 MiB. */
    maxCacheSize?: number;
    /** The maximum number of parallel requests to use for fetching. Defaults to 2. */
    parallelism?: number;
    /**
     * A WHATWG-compatible fetch function. You can use this field to polyfill the `fetch` function, add missing
     * features, or use a custom implementation.
     */
    fetchFn?: typeof fetch;
    /** Handles errors that occur while no read is pending. By default, these become unhandled rejections. */
    handleUnhandledError?: (error: unknown) => unknown;
};

/**
 * List of known video codecs, ordered by encoding preference.
 * @group Codecs
 * @public
 */
export declare const VIDEO_CODECS: readonly ["avc", "hevc", "vp9", "av1", "vp8", "prores"];

/**
 * The list of {@link VideoSample} pixel formats.
 * @group Samples
 * @public
 */
export declare const VIDEO_SAMPLE_PIXEL_FORMATS: readonly ["I420", "I420P10", "I420P12", "I420A", "I420AP10", "I420AP12", "I422", "I422P10", "I422P12", "I422A", "I422AP10", "I422AP12", "I444", "I444P10", "I444P12", "I444A", "I444AP10", "I444AP12", "NV12", "RGBA", "RGBX", "BGRA", "BGRX"];

/**
 * Union type of known video codecs.
 * @group Codecs
 * @public
 */
export declare type VideoCodec = typeof VIDEO_CODECS[number];

/**
 * Describes a single data plane of a video frame.
 * @group Samples
 * @public
 */
export declare type VideoDataPlane = {
    /** The data of the plane. */
    data: Uint8Array;
    /** The stride of the plane, in bytes. This is the distance in bytes between the start of each row of pixels. */
    stride: number;
};

/**
 * Additional options that control video encoding.
 * @group Encoding
 * @public
 */
export declare type VideoEncodingAdditionalOptions = {
    /**
     * What to do with alpha data contained in the video samples.
     *
     * - `'discard'` (default): Only the samples' color data is kept; the video is opaque.
     * - `'keep'`: The samples' alpha data is also encoded. Depending on the codec, the alpha may be emitted as packet
     * side data or in-band alongside the main packet. For codecs that emit alpha side data, such as VP9, make sure to
     * pair this mode with a container format that supports transparency (such as WebM or Matroska).
     */
    alpha?: 'discard' | 'keep';
    /**
     * Configures the bitrate mode used for bitrate-based encoding; defaults to `'variable'`. A bitrate mode set
     * directly on a {@link Quality} takes precedence over this field.
     * @deprecated Specify the bitrate mode in the {@link Quality} instead.
     */
    bitrateMode?: 'constant' | 'variable';
    /**
     * The latency mode used by the encoder; controls the performance-quality tradeoff.
     *
     * - `'quality'` (default): The encoder prioritizes quality over latency, and no frames can be dropped.
     * - `'realtime'`: The encoder prioritizes low latency over quality, and may drop frames if the encoder becomes
     * overloaded to keep up with real-time requirements.
     */
    latencyMode?: 'quality' | 'realtime';
    /**
     * The full codec string as specified in the Mediabunny Codec Registry. This string must match the codec
     * specified in `codec`. When not set, a fitting codec string will be constructed automatically by the library.
     */
    fullCodecString?: string;
    /**
     * A hint that configures the hardware acceleration method of this codec. This is best left on `'no-preference'`,
     * the default.
     */
    hardwareAcceleration?: 'no-preference' | 'prefer-hardware' | 'prefer-software';
    /**
     * An encoding scalability mode identifier as defined by
     * [WebRTC-SVC](https://w3c.github.io/webrtc-svc/#scalabilitymodes*).
     */
    scalabilityMode?: string;
    /**
     * An encoding video content hint as defined by
     * [mst-content-hint](https://w3c.github.io/mst-content-hint/#video-content-hints).
     */
    contentHint?: string;
};

/**
 * Configuration object that controls video encoding. Can be used to set codec, quality, and more.
 * @group Encoding
 * @public
 */
export declare type VideoEncodingConfig = {
    /** The video codec that should be used for encoding the video samples (frames). */
    codec: VideoCodec;
    /** The desired quality of the encoded video. */
    quality?: Quality;
    /**
     * The target bitrate for the encoded video, in bits per second. Alternatively, a {@link Quality} can be provided.
     * @deprecated Use `quality` instead.
     */
    bitrate?: number | Quality;
    /**
     * The interval, in seconds, of how often frames are encoded as a key frame. The default is 2 seconds. Frequent key
     * frames improve seeking behavior but increase file size. When using multiple video tracks, you should give them
     * all the same key frame interval.
     */
    keyFrameInterval?: number;
    /**
     * Video frames may change size over time. This field controls the behavior in case this happens.
     *
     * - `'deny'` (default) will throw an error, requiring all frames to have the exact same dimensions.
     * - `'passThrough'` will allow the change and directly pass the frame to the encoder.
     * - `'fill'` will stretch the image to fill the entire original box, potentially altering aspect ratio.
     * - `'contain'` will contain the entire image within the original box while preserving aspect ratio. This may lead
     * to letterboxing.
     * - `'cover'` will scale the image until the entire original box is filled, while preserving aspect ratio.
     *
     * The "original box" refers to the dimensions of the first encoded frame.
     */
    sizeChangeBehavior?: 'deny' | 'passThrough' | 'fill' | 'contain' | 'cover';
    /**
     * Optional transformations to apply to the video frames before they are passed to the encoder.
     */
    transform?: VideoTransformOptions;
    /** Called for each successfully encoded packet. Both the packet and the encoding metadata are passed. */
    onEncodedPacket?: (packet: EncodedPacket, meta: EncodedVideoChunkMetadata | undefined) => unknown;
    /**
     * Called when the internal [encoder config](https://www.w3.org/TR/webcodecs/#video-encoder-config), as used by the
     * WebCodecs API, is created.
     */
    onEncoderConfig?: (config: VideoEncoderConfig) => unknown;
    /** Called right before a sample is passed to the encoder. */
    onEncodedSample?: (sample: VideoSample) => unknown;
} & VideoEncodingAdditionalOptions;

/**
 * Represents a raw, unencoded video sample (frame). Mainly used as an expressive wrapper around WebCodecs API's
 * [`VideoFrame`](https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame), but can also be used standalone.
 * @group Samples
 * @public
 */
export declare class VideoSample implements Disposable {
    /**
     * The internal pixel format in which the frame is stored. Will be `null` if it's using an arbitrary internal
     * format not representable by `VideoSamplePixelFormat`.
     * [See pixel formats](https://www.w3.org/TR/webcodecs/#pixel-format)
     */
    readonly format: VideoSamplePixelFormat | null;
    /** The visible region of the frame in the coded pixel grid. */
    readonly visibleRect: Rectangle;
    /**
     * The width of the frame in square pixels (respecting pixel aspect ratio), before rotation and flip are applied.
     */
    readonly squarePixelWidth: number;
    /**
     * The height of the frame in square pixels (respecting pixel aspect ratio), before rotation and flip are applied.
     */
    readonly squarePixelHeight: number;
    /** The rotation of the frame in degrees, clockwise. Rotation is applied before flipping. */
    readonly rotation: Rotation;
    /** Whether the frame is flipped horizontally (about the vertical axis), after rotation. */
    readonly flip: boolean;
    /**
     * The pixel aspect ratio of the frame, as a rational number in its reduced form. Most videos use
     * square pixels (1:1).
     */
    readonly pixelAspectRatio: Rational;
    /**
     * The presentation timestamp of the frame in seconds. May be negative. Frames with negative end timestamps should
     * not be presented.
     */
    readonly timestamp: number;
    /** The duration of the frame in seconds. */
    readonly duration: number;
    /** The color space of the frame. */
    readonly colorSpace: VideoSampleColorSpace;
    /** The encode options to use when this sample is passed to an encoder. */
    readonly encodeOptions: DeepReadonly<VideoEncoderEncodeOptions>;
    /** The width of the frame in pixels. */
    get codedWidth(): number;
    /** The height of the frame in pixels. */
    get codedHeight(): number;
    /** The display width of the frame in pixels, after aspect ratio adjustment, rotation and flip. */
    get displayWidth(): number;
    /** The display height of the frame in pixels, after aspect ratio adjustment, rotation and flip. */
    get displayHeight(): number;
    /** The presentation timestamp of the frame in microseconds. */
    get microsecondTimestamp(): number;
    /** The duration of the frame in microseconds. */
    get microsecondDuration(): number;
    /**
     * Whether this sample uses a pixel format that can hold transparency data. Note that this doesn't necessarily mean
     * that the sample is transparent.
     */
    get hasAlpha(): boolean | null;
    /**
     * Creates a new {@link VideoSample} from a
     * [`VideoFrame`](https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame). This is essentially a near zero-cost
     * wrapper around `VideoFrame`. The sample's metadata is optionally refined using the data specified in `init`.
     */
    constructor(data: VideoFrame, init?: VideoSampleInit);
    /**
     * Creates a new {@link VideoSample} from a
     * [`CanvasImageSource`](https://udn.realityripple.com/docs/Web/API/CanvasImageSource), similar to the
     * [`VideoFrame`](https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame) constructor. When `VideoFrame` is
     * available, this is simply a wrapper around its constructor. If not, it will copy the source's image data to an
     * internal canvas for later use.
     */
    constructor(data: CanvasImageSource, init: SetRequired<VideoSampleInit, 'timestamp'>);
    /**
     * Creates a new {@link VideoSample} from raw pixel data specified in `data`. Additional metadata must be provided
     * in `init`.
     */
    constructor(data: AllowSharedBufferSource, init: SetRequired<VideoSampleInit, 'format' | 'codedWidth' | 'codedHeight' | 'timestamp'>);
    /**
     * Creates a new {@link VideoSample} backed by a custom {@link VideoSampleResource}.
     */
    constructor(resource: VideoSampleResource, init: SetRequired<VideoSampleInit, 'timestamp'>);
    /** Clones this video sample. */
    clone(): VideoSample;
    /**
     * Closes this video sample, releasing held resources. Video samples should be closed as soon as they are not
     * needed anymore.
     */
    close(): void;
    /**
     * Returns the number of bytes required to hold this video sample's pixel data.
     */
    allocationSize(options?: VideoFrameCopyToOptions): number;
    /**
     * Copies this video sample's pixel data to an ArrayBuffer or ArrayBufferView.
     * @returns The byte layout of the planes of the copied data.
     */
    copyTo(destination: AllowSharedBufferSource, options?: VideoFrameCopyToOptions): Promise<PlaneLayout[]>;
    /**
     * Converts this video sample to a VideoFrame for use with the WebCodecs API. The VideoFrame returned by this
     * method *must* be closed separately from this video sample.
     */
    toVideoFrame(): VideoFrame;
    /**
     * Draws the video sample to a 2D canvas context. Rotation and flip metadata will be taken into account.
     *
     * @param dx - The x-coordinate in the destination canvas at which to place the top-left corner of the source image.
     * @param dy - The y-coordinate in the destination canvas at which to place the top-left corner of the source image.
     * @param dWidth - The width in pixels with which to draw the image in the destination canvas.
     * @param dHeight - The height in pixels with which to draw the image in the destination canvas.
     */
    draw(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, dx: number, dy: number, dWidth?: number, dHeight?: number): void;
    /**
     * Draws the video sample to a 2D canvas context. Rotation and flip metadata will be taken into account.
     *
     * @param sx - The x-coordinate of the top left corner of the sub-rectangle of the source image to draw into the
     * destination context.
     * @param sy - The y-coordinate of the top left corner of the sub-rectangle of the source image to draw into the
     * destination context.
     * @param sWidth - The width of the sub-rectangle of the source image to draw into the destination context.
     * @param sHeight - The height of the sub-rectangle of the source image to draw into the destination context.
     * @param dx - The x-coordinate in the destination canvas at which to place the top-left corner of the source image.
     * @param dy - The y-coordinate in the destination canvas at which to place the top-left corner of the source image.
     * @param dWidth - The width in pixels with which to draw the image in the destination canvas.
     * @param dHeight - The height in pixels with which to draw the image in the destination canvas.
     */
    draw(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, sx: number, sy: number, sWidth: number, sHeight: number, dx: number, dy: number, dWidth?: number, dHeight?: number): void;
    /**
     * Draws the sample in the middle of the canvas corresponding to the context with the specified fit behavior.
     */
    drawWithFit(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, options: {
        /**
         * Controls the fitting algorithm.
         *
         * - `'fill'` will stretch the image to fill the entire box, potentially altering aspect ratio.
         * - `'contain'` will contain the entire image within the box while preserving aspect ratio. This may lead to
         * letterboxing.
         * - `'cover'` will scale the image until the entire box is filled, while preserving aspect ratio.
         */
        fit: 'fill' | 'contain' | 'cover';
        /** A way to override rotation. Defaults to the rotation of the sample. Rotation is applied before flipping. */
        rotation?: Rotation;
        /**
         * A way to override the horizontal flip. Defaults to the flip of the sample. The flip is applied
         * after rotation.
         */
        flip?: boolean;
        /**
         * Specifies the rectangular region of the video sample to crop to. The crop region will automatically be
         * clamped to the dimensions of the video sample. Cropping is performed after rotation and flip but before
         * resizing. The crop region is in the _display pixel space_ of the underlying video data.
         */
        crop?: CropRectangle;
    }): void;
    /**
     * Converts this video sample to a
     * [`CanvasImageSource`](https://udn.realityripple.com/docs/Web/API/CanvasImageSource) for drawing to a canvas.
     *
     * You must use the value returned by this method immediately, as any VideoFrame created internally may
     * automatically be closed in the next microtask.
     */
    toCanvasImageSource(): OffscreenCanvas | VideoFrame;
    /**
     * Transform this video sample to a new video sample given the options. Can be used to resize, rotate, flip, and
     * crop the sample.
     *
     * In non-browser environments, this method will not work by default. To make it work, register a custom
     * transformer function via {@link registerVideoSampleTransformer}.
     */
    transform(options: VideoSampleTransformOptions): Promise<VideoSample>;
    /** Sets the rotation metadata of this video sample. */
    setRotation(newRotation: Rotation): void;
    /** Sets the flip metadata of this video sample. */
    setFlip(newFlip: boolean): void;
    /** Sets the presentation timestamp of this video sample, in seconds. */
    setTimestamp(newTimestamp: number): void;
    /** Sets the duration of this video sample, in seconds. */
    setDuration(newDuration: number): void;
    /** Sets the encode options used when this sample is passed to an encoder. */
    setEncodeOptions(newEncodeOptions: VideoEncoderEncodeOptions): void;
    /** Calls `.close()`. */
    [Symbol.dispose](): void;
}

/**
 * Describes the color space of a {@link VideoSample}. Corresponds to the WebCodecs API's VideoColorSpace.
 * @group Samples
 * @public
 */
export declare class VideoSampleColorSpace {
    /** The color primaries standard used. */
    readonly primaries: VideoColorPrimaries | null;
    /** The transfer characteristics used. */
    readonly transfer: VideoTransferCharacteristics | null;
    /** The color matrix coefficients used. */
    readonly matrix: VideoMatrixCoefficients | null;
    /** Whether the color values use the full range or limited range. */
    readonly fullRange: boolean | null;
    /** Creates a new VideoSampleColorSpace. */
    constructor(init?: VideoColorSpaceInit);
    /** Serializes the color space to a JSON object. */
    toJSON(): VideoColorSpaceInit;
}

/**
 * Metadata used for VideoSample initialization.
 * @group Samples
 * @public
 */
export declare type VideoSampleInit = {
    /**
     * The internal pixel format in which the frame is stored.
     * [See pixel formats](https://www.w3.org/TR/webcodecs/#pixel-format)
     */
    format?: VideoSamplePixelFormat;
    /** The width of the frame in pixels. */
    codedWidth?: number;
    /** The height of the frame in pixels. */
    codedHeight?: number;
    /** The rotation of the frame in degrees, clockwise. Rotation is applied before flipping. */
    rotation?: Rotation;
    /** Whether the frame is flipped horizontally (about the vertical axis), after rotation. */
    flip?: boolean;
    /** The presentation timestamp of the frame in seconds. */
    timestamp?: number;
    /** The duration of the frame in seconds. */
    duration?: number;
    /** The color space of the frame. */
    colorSpace?: VideoColorSpaceInit;
    /** The byte layout of the planes of the frame. */
    layout?: PlaneLayout[];
    /** Visible region in the coded frame. When omitted, the rect defaults to `(0, 0, codedWidth, codedHeight)`. */
    visibleRect?: Rectangle | undefined;
    /** Width of the frame in pixels after applying aspect ratio adjustments, rotation and flip. */
    displayWidth?: number | undefined;
    /** Height of the frame in pixels after applying aspect ratio adjustments, rotation and flip. */
    displayHeight?: number | undefined;
    /** The encode options to use when this sample is passed to an encoder. */
    encodeOptions?: DeepReadonly<VideoEncoderEncodeOptions>;
};

/**
 * The internal pixel format with which a {@link VideoSample} is stored.
 * [See pixel formats](https://www.w3.org/TR/webcodecs/#pixel-format) for more.
 * @group Samples
 * @public
 */
export declare type VideoSamplePixelFormat = typeof VIDEO_SAMPLE_PIXEL_FORMATS[number];

/**
 * Abstract base class for custom video sample resources. Implement this class to provide custom backing
 * for VideoSample instances.
 * @group Samples
 * @public
 */
export declare abstract class VideoSampleResource {
    /**
     * Returns the internal pixel format in which the frame is stored.
     * [See pixel formats](https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame/format)
     */
    abstract getFormat(): VideoSamplePixelFormat | null;
    /** Returns the width of the frame in pixels. */
    abstract getCodedWidth(): number;
    /** Returns the height of the frame in pixels. */
    abstract getCodedHeight(): number;
    /** Returns the width of the frame in square pixels, respecting pixel aspect ratio. */
    abstract getSquarePixelWidth(): number;
    /** Returns the height of the frame in square pixels, respecting pixel aspect ratio. */
    abstract getSquarePixelHeight(): number;
    /** Returns the color space of the frame. */
    abstract getColorSpace(): VideoSampleColorSpace;
    /**
     * Closes this resource, releasing held resources. Called automatically when the last {@link VideoSample} using this
     * resource is closed.
     */
    abstract close(): void;
    /**
     * Returns the data planes that hold the video data for this sample. The returned planes and data must be in the
     * format returned by `getFormat()`.
     */
    abstract getDataPlanes(): MaybePromise<VideoDataPlane[]>;
    /**
     * Returns a new RGB {@link VideoSample} that contains the same content as this sample. The provided `init` object
     * must be used to set the metadata of this new video sample. When converting from a non-RGB format to RGB, the
     * conversion must respect `colorSpace`.
     */
    abstract toRgbSample(init: SetRequired<VideoSampleInit, 'timestamp'>, colorSpace: PredefinedColorSpace): MaybePromise<VideoSample>;
}

/**
 * A sink that retrieves decoded video samples (video frames) from a video track.
 * @group Media sinks
 * @public
 */
export declare class VideoSampleSink extends BaseMediaSampleSink<VideoSample> {
    /** Creates a new {@link VideoSampleSink} for the given {@link InputVideoTrack}. */
    constructor(videoTrack: InputVideoTrack, decoderOptions?: VideoSinkDecoderOptions);
    /**
     * Retrieves the video sample (frame) corresponding to the given timestamp, in seconds. More specifically, returns
     * the last video sample (in presentation order) with a start timestamp less than or equal to the given timestamp.
     * Returns null if the timestamp is before the track's first timestamp.
     *
     * @param timestamp - The timestamp used for retrieval, in seconds.
     * @param options - Options used for the underlying packet retrieval.
     */
    getSample(timestamp: number, options?: PacketRetrievalOptions): Promise<VideoSample | null>;
    /**
     * Creates an async iterator that yields the video samples (frames) of this track in presentation order. This method
     * will intelligently pre-decode a few frames ahead to enable fast iteration.
     *
     * @param startTimestamp - The timestamp in seconds at which to start yielding samples (inclusive).
     * @param endTimestamp - The timestamp in seconds at which to stop yielding samples (exclusive).
     * @param options - Options used for the underlying packet retrieval.
     */
    samples(startTimestamp?: number, endTimestamp?: number, options?: PacketRetrievalOptions): AsyncGenerator<VideoSample, void, unknown>;
    /**
     * Creates an async iterator that yields a video sample (frame) for each timestamp in the argument. This method
     * uses an optimized decoding pipeline if these timestamps are monotonically sorted, decoding each packet at most
     * once, and is therefore more efficient than manually getting the sample for every timestamp. The iterator may
     * yield null if no frame is available for a given timestamp.
     *
     * This method is good for sparse access of media data. If you want primarily sequential media access, prefer
     * {@link VideoSampleSink.samples} instead.
     *
     * @param timestamps - An iterable or async iterable of timestamps in seconds.
     * @param options - Options used for the underlying packet retrieval.
     */
    samplesAtTimestamps(timestamps: AnyIterable<number>, options?: PacketRetrievalOptions): AsyncGenerator<VideoSample | null, void, unknown>;
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
 * A fully-resolved description of a video sample transformation, with all defaults and constraints baked in.
 *
 * The order of operations must be:
 * 1. Pixel aspect ratio normalization (always applied)
 * 2. Rotation
 * 3. Flip
 * 4. Crop
 * 5. Resize using fit
 * @group Samples
 * @public
 */
export declare type VideoSampleTransformationDescription = {
    /** The width in pixels to resize the frames to. */
    width: number;
    /** The height in pixels to resize the frames to. */
    height: number;
    /**
     * The fitting algorithm.
     *
     * - `'fill'` will stretch the image to fill the entire box, potentially altering aspect ratio.
     * - `'contain'` will contain the entire image within the box while preserving aspect ratio. This may lead to
     * letterboxing.
     * - `'cover'` will scale the image until the entire box is filled, while preserving aspect ratio.
     */
    fit: 'fill' | 'contain' | 'cover';
    /** The clockwise rotation by which to rotate the frames. Rotation is applied before flipping. */
    rotation: Rotation;
    /** Whether to flip the frames horizontally (about the vertical axis). The flip is applied after rotation. */
    flip: boolean;
    /**
     * The rectangular region of the frames to crop to, clamped to the dimensions of the frame. Cropping is
     * performed after rotation and flip but before resizing.
     */
    crop: CropRectangle;
    /** Whether to discard or keep the transparency information of the video sample. */
    alpha: 'keep' | 'discard';
};

/**
 * Options for transforming a {@link VideoSample}. The order of operations are:
 *
 * 1. Pixel aspect ratio normalization (always applied)
 * 2. Rotation
 * 3. Flip
 * 4. Crop
 * 5. Resize using fit
 * @group Samples
 * @public
 */
export declare type VideoSampleTransformOptions = {
    /**
     * The width in pixels to resize the frames to. If height is not set, it will be deduced
     * automatically based on aspect ratio.
     */
    width?: number;
    /**
     * The height in pixels to resize the frames to. If width is not set, it will be deduced
     * automatically based on aspect ratio.
     */
    height?: number;
    /**
     * A positive integer. When provided, both the width and height will be rounded to the nearest multiple of
     * this number.
     */
    roundDimensionsTo?: number;
    /**
     * The fitting algorithm in case both width and height are set.
     *
     * - `'fill'` will stretch the image to fill the entire box, potentially altering aspect ratio.
     * - `'contain'` will contain the entire image within the box while preserving aspect ratio. This may lead to
     * letterboxing.
     * - `'cover'` will scale the image until the entire box is filled, while preserving aspect ratio.
     */
    fit?: 'fill' | 'contain' | 'cover';
    /**
     * The clockwise rotation by which to rotate the frames, in addition to the sample's own rotation. Rotation is
     * applied before flipping.
     */
    rotate?: Rotation;
    /**
     * Whether to flip the frames horizontally (about the vertical axis), in addition to the sample's own flip. The
     * flip is applied after rotation but before cropping and resizing.
     */
    flip?: boolean;
    /**
     * Specifies the rectangular region of the frames to crop to. The crop region will automatically be
     * clamped to the dimensions of the frame. Cropping is performed after rotation and flip but before resizing.
     */
    crop?: CropRectangle;
    /**
     * Whether to discard or keep the transparency information of the video sample. The default is `'keep'`.
     */
    alpha?: 'keep' | 'discard';
};

/**
 * Describes additional decoder preferences for video sinks.
 * @group Media sinks
 * @public
 */
export declare type VideoSinkDecoderOptions = {
    /**
     * A hint that configures the hardware acceleration method of the decoder. This is best left on `'no-preference'`,
     * the default.
     */
    hardwareAcceleration?: 'no-preference' | 'prefer-hardware' | 'prefer-software';
    /**
     * Hint that the selected decoder should be configured to minimize the number of packets that have to be decoded
     * before video frames are output.
     */
    optimizeForLatency?: boolean;
};

/**
 * Base class for video sources - sources for video tracks.
 * @group Media sources
 * @public
 */
export declare abstract class VideoSource extends MediaSource_2 {
    /** Internal constructor. */
    constructor(codec: VideoCodec);
}

/**
 * Additional metadata for video tracks.
 * @group Output files
 * @public
 */
export declare type VideoTrackMetadata = BaseTrackMetadata & {
    /**
     * The angle in degrees by which the track's frames should be rotated (clockwise). Rotation is applied before any
     * flip.
     */
    rotation?: Rotation;
    /** Whether the track's frames should be flipped horizontally (about the vertical axis), after rotation. */
    flip?: boolean;
    /**
     * The full transformation matrix to apply to the track's frames for presentation. When set, this takes precedence
     * over `rotation` and `flip`. Formats that can't store an arbitrary matrix extract the closest rotation and
     * scale from it.
     */
    transformationMatrix?: TransformationMatrix;
    /**
     * The expected video frame rate in hertz. If set, all timestamps and durations of this track will be snapped to
     * this frame rate. You should avoid adding more frames than the rate allows, as this will lead to multiple frames
     * with the same timestamp.
     */
    frameRate?: number;
    /**
     * When true, this track is marked as being made only out of key frames (I-frames). It is an error to add a non-key
     * frame to this track.
     */
    hasOnlyKeyPackets?: boolean;
    /**
     * When `true`, this is a hint that the track may contain transparent data. Mediabunny can use this to better
     * prepare for writing packet alpha side data.
     */
    canBeTransparent?: boolean;
    /**
     * The decoder config for this video track, provided ahead of time. This is provided automatically when media data
     * added to the track, but by specifying it here, you give the muxer additional information that it can make use of.
     * Zero-packet tracks become possible to write when this field is set.
     */
    decoderConfig?: VideoDecoderConfig;
    /**
     * Can be provided in addition to {@link VideoTrackMetadata.decoderConfig} to provide additional track information
     * not included in the decoder config. This packet will not be added to the media data.
     */
    primingPacket?: EncodedPacket;
};

/**
 * Options for transforming video frames before encoding.
 * @group Encoding
 * @public
 */
export declare type VideoTransformOptions = {
    /**
     * The width in pixels to resize the frames to. If height is not set, it will be deduced
     * automatically based on aspect ratio.
     */
    width?: number;
    /**
     * The height in pixels to resize the frames to. If width is not set, it will be deduced
     * automatically based on aspect ratio.
     */
    height?: number;
    /**
     * The fitting algorithm in case both width and height are set.
     *
     * - `'fill'` will stretch the image to fill the entire box, potentially altering aspect ratio.
     * - `'contain'` will contain the entire image within the box while preserving aspect ratio. This may lead to
     * letterboxing.
     * - `'cover'` will scale the image until the entire box is filled, while preserving aspect ratio.
     *
     * To avoid ambiguity, this field must not be set when `sizeChangeBehavior` is `'fill'`, `'contain'` or
     * `'deny'`, since `sizeChangeBehavior` already determines the fitting algorithm.
     */
    fit?: 'fill' | 'contain' | 'cover';
    /**
     * The clockwise rotation by which to rotate the frames, in addition to each frame's own rotation. Rotation is
     * applied before flipping.
     */
    rotate?: Rotation;
    /**
     * Whether to flip the frames horizontally (about the vertical axis), in addition to each frame's own flip. The flip
     * is applied after rotation but before cropping and resizing.
     */
    flip?: boolean;
    /**
     * Specifies the rectangular region of the frames to crop to. The crop region will automatically be
     * clamped to the dimensions of the frame. Cropping is performed after rotation and flip but before resizing.
     */
    crop?: CropRectangle;
    /**
     * Whether to discard or keep the transparency information of the video samples. The default is `'keep'`.
     */
    alpha?: 'keep' | 'discard';
    /**
     * The frame rate in hertz to normalize the video frame stream to.
     */
    frameRate?: number;
    /**
     * Allows for custom user-defined processing of video frames, e.g. for applying overlays, color transformations,
     * or timestamp modifications. Will be called for each video frame after transformations and frame rate
     * corrections.
     *
     * Must return a {@link VideoSample}, a {@link VideoSampleResource} or a `CanvasImageSource`, an array of them, or
     * `null` for dropping the frame. When non-timestamped data is returned, the timestamp and duration from the input
     * sample will be used.
     */
    process?: (sample: VideoSample) => MaybePromise<CanvasImageSource | VideoSample | VideoSampleResource | (CanvasImageSource | VideoSample | VideoSampleResource)[] | null>;
    /**
     * Forces every video frame through the transformation step even if no transformation properties are defined.
     * This can be used, for example, to bake rotation and flip into the encoded video frames.
     */
    force?: boolean;
};

/**
 * WAVE input format singleton.
 * @group Input formats
 * @public
 */
export declare const WAVE: WaveInputFormat;

/**
 * WAVE file format, based on RIFF.
 *
 * Do not instantiate this class; use the {@link WAVE} singleton instead.
 *
 * @group Input formats
 * @public
 */
export declare class WaveInputFormat extends InputFormat {
    get name(): string;
    get mimeType(): string;
}

/**
 * WAVE file format, based on RIFF.
 * @group Output formats
 * @public
 */
export declare class WavOutputFormat extends OutputFormat {
    /** Creates a new {@link WavOutputFormat} configured with the specified `options`. */
    constructor(options?: WavOutputFormatOptions);
    getSupportedTrackCounts(): TrackCountLimits;
    get fileExtension(): string;
    get mimeType(): string;
    getSupportedCodecs(): MediaCodec[];
    get supportsVideoTransformationMetadata(): boolean;
    get supportsTimestampedMediaData(): boolean;
    get negativeTimestampSupport(): null;
}

/**
 * WAVE-specific output options.
 * @group Output formats
 * @public
 */
export declare type WavOutputFormatOptions = {
    /**
     * When enabled, an RF64 file will be written, allowing for file sizes to exceed 4 GiB, which is otherwise not
     * possible for regular WAVE files.
     */
    large?: boolean;
    /**
     * The metadata format to use for writing metadata tags.
     *
     * - `'info'` (default): Writes metadata into a RIFF INFO LIST chunk, the default way to contain metadata tags
     * within WAVE. Only allows for a limited subset of tags to be written.
     * - `'id3'`: Writes metadata into an ID3 chunk. Non-default, but used by many taggers in practice. Allows for a
     * much larger and richer set of tags to be written.
     */
    metadataFormat?: 'info' | 'id3';
    /**
     * Will be called once the file header is written. The header consists of the RIFF header, the format chunk,
     * metadata chunks, and the start of the data chunk (with a placeholder size of 0).
     */
    onHeader?: (data: Uint8Array, position: number) => unknown;
};

/**
 * WebM input format singleton.
 * @group Input formats
 * @public
 */
export declare const WEBM: WebMInputFormat;

/**
 * WebM file format, based on Matroska.
 *
 * Do not instantiate this class; use the {@link WEBM} singleton instead.
 *
 * @group Input formats
 * @public
 */
export declare class WebMInputFormat extends MatroskaInputFormat {
    get name(): string;
    get mimeType(): string;
}

/**
 * WebM file format, based on Matroska.
 *
 * Supports writing transparent video. For a video track to be marked as transparent, the first packet added must
 * contain alpha side data.
 *
 * @group Output formats
 * @public
 */
export declare class WebMOutputFormat extends MkvOutputFormat {
    /** Creates a new {@link WebMOutputFormat} configured with the specified `options`. */
    constructor(options?: MkvOutputFormatOptions);
    getSupportedCodecs(): MediaCodec[];
    get fileExtension(): string;
    get mimeType(): string;
}

/**
 * WebM-specific output options.
 * @group Output formats
 * @public
 */
export declare type WebMOutputFormatOptions = MkvOutputFormatOptions;

/**
 * An AudioBuffer with additional timing information (timestamp & duration).
 * @group Media sinks
 * @public
 */
export declare type WrappedAudioBuffer = {
    /** An AudioBuffer. */
    buffer: AudioBuffer;
    /** The timestamp of the corresponding audio sample, in seconds. */
    timestamp: number;
    /** The duration of the corresponding audio sample, in seconds. */
    duration: number;
};

/**
 * A canvas with additional timing information (timestamp & duration).
 * @group Media sinks
 * @public
 */
export declare type WrappedCanvas = {
    /** A canvas element or offscreen canvas. */
    canvas: HTMLCanvasElement | OffscreenCanvas;
    /** The timestamp of the corresponding video sample, in seconds. */
    timestamp: number;
    /** The duration of the corresponding video sample, in seconds. */
    duration: number;
};

export { }
export as namespace Mediabunny;

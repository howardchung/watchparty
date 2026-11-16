/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { InputAudioTrack, InputTrack, InputVideoTrack } from './input-track.js';
import { AnyIterable, Rotation } from './misc.js';
import { EncodedPacket } from './packet.js';
import { AudioSample, CropRectangle, VideoSample } from './sample.js';
/**
 * Additional options for controlling packet retrieval.
 * @group Media sinks
 * @public
 */
export type PacketRetrievalOptions = {
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
 * Base class for decoded media sample sinks.
 * @group Media sinks
 * @public
 */
export declare abstract class BaseMediaSampleSink<MediaSample extends VideoSample | AudioSample> {
}
/** Utility class that merges together color and alpha information on the CPU in a pool of workers. */
export declare class ColorAlphaMerger {
    private workers;
    private nextWorkerIndex;
    private pendingRequests;
    private nextRequestId;
    merge(color: VideoFrame, alpha: VideoFrame): Promise<VideoFrame>;
    close(): void;
}
/**
 * Describes additional decoder preferences for video sinks.
 * @group Media sinks
 * @public
 */
export type VideoSinkDecoderOptions = {
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
 * A canvas with additional timing information (timestamp & duration).
 * @group Media sinks
 * @public
 */
export type WrappedCanvas = {
    /** A canvas element or offscreen canvas. */
    canvas: HTMLCanvasElement | OffscreenCanvas;
    /** The timestamp of the corresponding video sample, in seconds. */
    timestamp: number;
    /** The duration of the corresponding video sample, in seconds. */
    duration: number;
};
/**
 * Options for constructing a CanvasSink.
 * @group Media sinks
 * @public
 */
export type CanvasSinkOptions = {
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
 * An AudioBuffer with additional timing information (timestamp & duration).
 * @group Media sinks
 * @public
 */
export type WrappedAudioBuffer = {
    /** An AudioBuffer. */
    buffer: AudioBuffer;
    /** The timestamp of the corresponding audio sample, in seconds. */
    timestamp: number;
    /** The duration of the corresponding audio sample, in seconds. */
    duration: number;
};
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
//# sourceMappingURL=media-sink.d.ts.map
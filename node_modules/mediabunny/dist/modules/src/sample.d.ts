/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Rotation, SetRequired, Rational, Rectangle, MaybePromise, DeepReadonly } from './misc.js';
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
 * Describes a single data plane of a video frame.
 * @group Samples
 * @public
 */
export type VideoDataPlane = {
    /** The data of the plane. */
    data: Uint8Array;
    /** The stride of the plane, in bytes. This is the distance in bytes between the start of each row of pixels. */
    stride: number;
};
/**
 * The list of {@link VideoSample} pixel formats.
 * @group Samples
 * @public
 */
export declare const VIDEO_SAMPLE_PIXEL_FORMATS: readonly ["I420", "I420P10", "I420P12", "I420A", "I420AP10", "I420AP12", "I422", "I422P10", "I422P12", "I422A", "I422AP10", "I422AP12", "I444", "I444P10", "I444P12", "I444A", "I444AP10", "I444AP12", "NV12", "RGBA", "RGBX", "BGRA", "BGRX"];
/**
 * The internal pixel format with which a {@link VideoSample} is stored.
 * [See pixel formats](https://www.w3.org/TR/webcodecs/#pixel-format) for more.
 * @group Samples
 * @public
 */
export type VideoSamplePixelFormat = typeof VIDEO_SAMPLE_PIXEL_FORMATS[number];
/**
 * Metadata used for VideoSample initialization.
 * @group Samples
 * @public
 */
export type VideoSampleInit = {
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
export type VideoSampleTransformOptions = {
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
export type VideoSampleTransformationDescription = {
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
 * Registers a callback to handle the transformation of {@link VideoSample} instances. The callback can either return
 * the transformed sample, or `null` to indicate that it doesn't want to handle the given transformation task.
 * @group Samples
 * @public
 */
export declare const registerVideoSampleTransformer: (transformer: (sample: VideoSample, description: VideoSampleTransformationDescription) => MaybePromise<VideoSample | null>) => void;
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
 * Specifies the rectangular cropping region.
 * @group Miscellaneous
 * @public
 */
export type CropRectangle = {
    /** The distance in pixels from the left edge of the source frame to the left edge of the crop rectangle. */
    left: number;
    /** The distance in pixels from the top edge of the source frame to the top edge of the crop rectangle. */
    top: number;
    /** The width in pixels of the crop rectangle. */
    width: number;
    /** The height in pixels of the crop rectangle. */
    height: number;
};
export declare const clampCropRectangle: (crop: CropRectangle, outerWidth: number, outerHeight: number) => CropRectangle;
export declare const validateCropRectangle: (crop: CropRectangle, prefix: string) => void;
type PlaneConfig = {
    sampleBytes: number;
    widthDivisor: number;
    heightDivisor: number;
};
/** Helper to retrieve plane configurations based on WebCodecs § 9.8 Pixel Format definitions. */
export declare const getPlaneConfigs: (format: VideoSamplePixelFormat) => PlaneConfig[];
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
 * Metadata used for AudioSample initialization.
 * @group Samples
 * @public
 */
export type AudioSampleInit = {
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
 * Options used for copying audio sample data.
 * @group Samples
 * @public
 */
export type AudioSampleCopyToOptions = {
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
export declare const getBytesPerSample: (format: AudioSampleFormat) => number;
export declare const toInterleavedAudioFormat: (format: AudioSampleFormat) => "u8" | "s16" | "s32" | "f32";
export declare const audioSampleToInterleavedFormat: (sample: AudioSample, format: "u8" | "s16" | "s32" | "f32") => AudioSample;
export {};
//# sourceMappingURL=sample.d.ts.map
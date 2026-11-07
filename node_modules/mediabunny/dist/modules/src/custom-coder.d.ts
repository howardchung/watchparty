/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { AudioCodec, VideoCodec } from './codec.js';
import { MaybePromise } from './misc.js';
import { EncodedPacket } from './packet.js';
import { AudioSample, VideoSample } from './sample.js';
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
export declare const customVideoDecoders: typeof CustomVideoDecoder[];
export declare const customAudioDecoders: typeof CustomAudioDecoder[];
export declare const customVideoEncoders: typeof CustomVideoEncoder[];
export declare const customAudioEncoders: typeof CustomAudioEncoder[];
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
//# sourceMappingURL=custom-coder.d.ts.map
/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { AudioCodec, MediaCodec, VideoCodec } from './codec.js';
import { SetOptional } from './misc.js';
export declare const canDecodeVideoMemo: Map<string, Promise<boolean>>;
export declare const canDecodeAudioMemo: Map<string, Promise<boolean>>;
/**
 * Checks if the browser is able to decode the given codec.
 * @group Decoding
 * @public
 */
export declare const canDecode: (codec: MediaCodec) => false | Promise<boolean>;
/**
 * Checks if the browser is able to decode the given video codec with the given parameters.
 * @group Decoding
 * @public
 */
export declare const canDecodeVideo: (codec: VideoCodec, options?: SetOptional<VideoDecoderConfig, "codec">) => Promise<boolean>;
/**
 * Checks if the browser is able to decode the given audio codec with the given parameters.
 * @group Decoding
 * @public
 */
export declare const canDecodeAudio: (codec: AudioCodec, options?: SetOptional<AudioDecoderConfig, "codec" | "numberOfChannels" | "sampleRate">) => Promise<boolean>;
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
 * Returns the list of all audio codecs that can be decoded by the browser.
 * @group Decoding
 * @public
 */
export declare const getDecodableAudioCodecs: (checkedCodecs?: AudioCodec[], options?: SetOptional<AudioDecoderConfig, "codec" | "numberOfChannels" | "sampleRate">) => Promise<AudioCodec[]>;
//# sourceMappingURL=decode.d.ts.map
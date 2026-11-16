/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { canDecodeAudioMemo, canDecodeVideoMemo } from './decode.js';
import { canEncodeAudioMemo, canEncodeVideoMemo } from './encode.js';
import { Logging } from './logging.js';
/**
 * Base class for custom video decoders. To add your own custom video decoder, extend this class, implement the
 * abstract methods and static `supports` method, and register the decoder using {@link registerDecoder}.
 * @group Custom coders
 * @public
 */
export class CustomVideoDecoder {
    /** Returns true if and only if the decoder can decode the given codec configuration. */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static supports(codec, config) {
        return false;
    }
}
/**
 * Base class for custom audio decoders. To add your own custom audio decoder, extend this class, implement the
 * abstract methods and static `supports` method, and register the decoder using {@link registerDecoder}.
 * @group Custom coders
 * @public
 */
export class CustomAudioDecoder {
    /** Returns true if and only if the decoder can decode the given codec configuration. */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static supports(codec, config) {
        return false;
    }
}
/**
 * Base class for custom video encoders. To add your own custom video encoder, extend this class, implement the
 * abstract methods and static `supports` method, and register the encoder using {@link registerEncoder}.
 * @group Custom coders
 * @public
 */
export class CustomVideoEncoder {
    /** Returns true if and only if the encoder can encode the given codec configuration. */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static supports(codec, config) {
        return false;
    }
}
/**
 * Base class for custom audio encoders. To add your own custom audio encoder, extend this class, implement the
 * abstract methods and static `supports` method, and register the encoder using {@link registerEncoder}.
 * @group Custom coders
 * @public
 */
export class CustomAudioEncoder {
    /** Returns true if and only if the encoder can encode the given codec configuration. */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static supports(codec, config) {
        return false;
    }
}
export const customVideoDecoders = [];
export const customAudioDecoders = [];
export const customVideoEncoders = [];
export const customAudioEncoders = [];
/**
 * Registers a custom video or audio decoder. Registered decoders will automatically be used for decoding whenever
 * possible.
 * @group Custom coders
 * @public
 */
export const registerDecoder = (decoder) => {
    if (decoder.prototype instanceof CustomVideoDecoder) {
        const casted = decoder;
        if (customVideoDecoders.includes(casted)) {
            Logging._warn('Video decoder already registered.');
            return;
        }
        customVideoDecoders.push(casted);
        canDecodeVideoMemo.clear();
    }
    else if (decoder.prototype instanceof CustomAudioDecoder) {
        const casted = decoder;
        if (customAudioDecoders.includes(casted)) {
            Logging._warn('Audio decoder already registered.');
            return;
        }
        customAudioDecoders.push(casted);
        canDecodeAudioMemo.clear();
    }
    else {
        throw new TypeError('Decoder must be a CustomVideoDecoder or CustomAudioDecoder.');
    }
};
/**
 * Registers a custom video or audio encoder. Registered encoders will automatically be used for encoding whenever
 * possible.
 * @group Custom coders
 * @public
 */
export const registerEncoder = (encoder) => {
    if (encoder.prototype instanceof CustomVideoEncoder) {
        const casted = encoder;
        if (customVideoEncoders.includes(casted)) {
            Logging._warn('Video encoder already registered.');
            return;
        }
        customVideoEncoders.push(casted);
        canEncodeVideoMemo.clear();
    }
    else if (encoder.prototype instanceof CustomAudioEncoder) {
        const casted = encoder;
        if (customAudioEncoders.includes(casted)) {
            Logging._warn('Audio encoder already registered.');
            return;
        }
        customAudioEncoders.push(casted);
        canEncodeAudioMemo.clear();
    }
    else {
        throw new TypeError('Encoder must be a CustomVideoEncoder or CustomAudioEncoder.');
    }
};

/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/// <reference types="dom-mediacapture-transform" preserve="true" />
/// <reference types="dom-webcodecs" preserve="true" />
import { Logging } from './logging.js';
const MEDIABUNNY_LOADED_SYMBOL = Symbol.for('mediabunny loaded');
if (globalThis[MEDIABUNNY_LOADED_SYMBOL]) {
    Logging._error('[WARNING]\nMediabunny was loaded twice.'
        + ' This will likely cause Mediabunny not to work correctly.'
        + ' Check if multiple dependencies are importing different versions of Mediabunny,'
        + ' or if something is being bundled incorrectly.');
}
globalThis[MEDIABUNNY_LOADED_SYMBOL] = true;
export { Output, OutputTrack, OutputVideoTrack, OutputAudioTrack, OutputSubtitleTrack, OutputTrackGroup, } from './output.js';
export { OutputFormat, AdtsOutputFormat, CmafOutputFormat, FlacOutputFormat, HlsOutputFormat, IsobmffOutputFormat, MkvOutputFormat, MovOutputFormat, Mp3OutputFormat, Mp4OutputFormat, MpegTsOutputFormat, OggOutputFormat, WavOutputFormat, WebMOutputFormat, } from './output-format.js';
export { MediaSource, VideoSource, AudioSource, SubtitleSource, AudioBufferSource, AudioSampleSource, CanvasSource, EncodedAudioPacketSource, EncodedVideoPacketSource, MediaStreamAudioTrackSource, MediaStreamVideoTrackSource, TextSubtitleSource, VideoSampleSource, } from './media-source.js';
export { VIDEO_CODECS, AUDIO_CODECS, PCM_AUDIO_CODECS, NON_PCM_AUDIO_CODECS, SUBTITLE_CODECS, } from './codec.js';
export { canDecode, canDecodeVideo, canDecodeAudio, getDecodableCodecs, getDecodableVideoCodecs, getDecodableAudioCodecs, } from './decode.js';
export { canEncode, canEncodeVideo, canEncodeAudio, canEncodeSubtitles, getEncodableCodecs, getEncodableVideoCodecs, getEncodableAudioCodecs, getEncodableSubtitleCodecs, getFirstEncodableVideoCodec, getFirstEncodableAudioCodec, getFirstEncodableSubtitleCodec, Quality, 
// eslint-disable-next-line @typescript-eslint/no-deprecated
QUALITY_VERY_LOW, 
// eslint-disable-next-line @typescript-eslint/no-deprecated
QUALITY_LOW, 
// eslint-disable-next-line @typescript-eslint/no-deprecated
QUALITY_MEDIUM, 
// eslint-disable-next-line @typescript-eslint/no-deprecated
QUALITY_HIGH, 
// eslint-disable-next-line @typescript-eslint/no-deprecated
QUALITY_VERY_HIGH, } from './encode.js';
export { Target, AppendOnlyStreamTarget, BufferTarget, FilePathTarget, NullTarget, PathedTarget, RangedTarget, StreamTarget, } from './target.js';
export { ConcurrentRunner, EventEmitter, } from './misc.js';
export { Logging, LogLevel, } from './logging.js';
export { ALL_TRACK_TYPES, } from './output.js';
export { Source, SourceRef, BlobSource, BufferSource, CustomPathedSource, CustomSource, FilePathSource, PathedSource, 
// eslint-disable-next-line @typescript-eslint/no-deprecated
StreamSource, RangedSource, ReadableStreamSource, UrlSource, } from './source.js';
export { InputFormat, AdtsInputFormat, FlacInputFormat, IsobmffInputFormat, HlsInputFormat, MatroskaInputFormat, Mp3InputFormat, Mp4InputFormat, MpegTsInputFormat, OggInputFormat, QuickTimeInputFormat, WaveInputFormat, WebMInputFormat, ALL_FORMATS, HLS_FORMATS, ADTS, FLAC, HLS, MATROSKA, MP3, MP4, MPEG_TS, OGG, QTFF, WAVE, WEBM, } from './input-format.js';
export { Input, InputDisposedError, UnsupportedInputFormatError, } from './input.js';
export { InputTrack, InputVideoTrack, InputAudioTrack, asc, desc, prefer, } from './input-track.js';
export { EncodedPacket, } from './packet.js';
export { AudioSample, AudioSampleResource, VideoSample, VideoSampleColorSpace, VideoSampleResource, VIDEO_SAMPLE_PIXEL_FORMATS, registerVideoSampleTransformer, } from './sample.js';
export { AudioBufferSink, AudioSampleSink, BaseMediaSampleSink, CanvasSink, EncodedPacketSink, VideoSampleSink, } from './media-sink.js';
export { Conversion, ConversionCanceledError, } from './conversion.js';
export { CustomVideoDecoder, CustomVideoEncoder, CustomAudioDecoder, CustomAudioEncoder, registerDecoder, registerEncoder, } from './custom-coder.js';
export { RichImageData, AttachedFile, } from './metadata.js';
// 🐡🦔

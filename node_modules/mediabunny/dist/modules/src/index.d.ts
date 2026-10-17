/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/// <reference types="dom-mediacapture-transform" preserve="true" />
/// <reference types="dom-webcodecs" preserve="true" />
export { Output, type OutputOptions, OutputTrack, OutputVideoTrack, OutputAudioTrack, OutputSubtitleTrack, OutputTrackGroup, type BaseTrackMetadata, type VideoTrackMetadata, type AudioTrackMetadata, type SubtitleTrackMetadata, type OutputEvents, } from './output.js';
export { OutputFormat, AdtsOutputFormat, type AdtsOutputFormatOptions, CmafOutputFormat, type CmafOutputFormatOptions, FlacOutputFormat, type FlacOutputFormatOptions, HlsOutputFormat, type HlsOutputFormatOptions, type HlsOutputPlaylistInfo, type HlsOutputSegmentInfo, IsobmffOutputFormat, type IsobmffOutputFormatOptions, MkvOutputFormat, type MkvOutputFormatOptions, MovOutputFormat, Mp3OutputFormat, type Mp3OutputFormatOptions, Mp4OutputFormat, MpegTsOutputFormat, type MpegTsOutputFormatOptions, OggOutputFormat, type OggOutputFormatOptions, WavOutputFormat, type WavOutputFormatOptions, WebMOutputFormat, type WebMOutputFormatOptions, type InclusiveIntegerRange, type TrackCountLimits, } from './output-format.js';
export { MediaSource, VideoSource, AudioSource, SubtitleSource, AudioBufferSource, type AudioBufferSourceOptions, AudioSampleSource, CanvasSource, EncodedAudioPacketSource, EncodedVideoPacketSource, MediaStreamAudioTrackSource, type MediaStreamAudioTrackSourceOptions, MediaStreamVideoTrackSource, type MediaStreamVideoTrackSourceOptions, TextSubtitleSource, VideoSampleSource, } from './media-source.js';
export { type MediaCodec, type VideoCodec, type AudioCodec, type SubtitleCodec, VIDEO_CODECS, AUDIO_CODECS, PCM_AUDIO_CODECS, NON_PCM_AUDIO_CODECS, SUBTITLE_CODECS, } from './codec.js';
export { canDecode, canDecodeVideo, canDecodeAudio, getDecodableCodecs, getDecodableVideoCodecs, getDecodableAudioCodecs, } from './decode.js';
export { type VideoEncodingConfig, type VideoEncodingAdditionalOptions, type VideoTransformOptions, type AudioEncodingConfig, type AudioEncodingAdditionalOptions, type AudioTransformOptions, canEncode, canEncodeVideo, canEncodeAudio, canEncodeSubtitles, getEncodableCodecs, getEncodableVideoCodecs, getEncodableAudioCodecs, getEncodableSubtitleCodecs, getFirstEncodableVideoCodec, getFirstEncodableAudioCodec, getFirstEncodableSubtitleCodec, Quality, type QualityOptions, type QualitativeQualityOptions, type QuantitativeQualityOptions, type QualityLevel, QUALITY_VERY_LOW, QUALITY_LOW, QUALITY_MEDIUM, QUALITY_HIGH, QUALITY_VERY_HIGH, } from './encode.js';
export { Target, type TargetEvents, type TargetRequest, AppendOnlyStreamTarget, BufferTarget, type BufferTargetOptions, FilePathTarget, type FilePathTargetOptions, NullTarget, PathedTarget, RangedTarget, StreamTarget, type StreamTargetOptions, type StreamTargetChunk, } from './target.js';
export { type AnyIterable, ConcurrentRunner, type DeepReadonly, EventEmitter, type EventListenerOptions, type FilePath, type MaybePromise, } from './misc.js';
export { Logging, LogLevel, type LoggingEvents, } from './logging.js';
export { type PsshBox, } from './isobmff/isobmff-misc.js';
export { type Rational, type Rectangle, type Rotation, type SetOptional, type SetRequired, type TransformationMatrix, } from './misc.js';
export { type TrackType, ALL_TRACK_TYPES, } from './output.js';
export { Source, type SourceEvents, SourceRef, type SourceRequest, BlobSource, type BlobSourceOptions, BufferSource, CustomPathedSource, CustomSource, type CustomSourceOptions, FilePathSource, type FilePathSourceOptions, PathedSource, StreamSource, type StreamSourceOptions, RangedSource, ReadableStreamSource, type ReadableStreamSourceOptions, UrlSource, type UrlSourceOptions, } from './source.js';
export { InputFormat, type InputFormatOptions, AdtsInputFormat, FlacInputFormat, IsobmffInputFormat, type IsobmffInputFormatOptions, HlsInputFormat, type HlsInputFormatOptions, MatroskaInputFormat, Mp3InputFormat, Mp4InputFormat, MpegTsInputFormat, OggInputFormat, QuickTimeInputFormat, WaveInputFormat, WebMInputFormat, ALL_FORMATS, HLS_FORMATS, ADTS, FLAC, HLS, MATROSKA, MP3, MP4, MPEG_TS, OGG, QTFF, WAVE, WEBM, } from './input-format.js';
export { Input, type InputOptions, type InputEvents, InputDisposedError, UnsupportedInputFormatError, } from './input.js';
export { type DurationMetadataRequestOptions, } from './demuxer.js';
export { InputTrack, InputVideoTrack, InputAudioTrack, type InputTrackQuery, type FrameRateMetrics, type FrameRateMetricsOptions, type PacketStats, asc, desc, prefer, } from './input-track.js';
export { EncodedPacket, type EncodedPacketSideData, type PacketType, } from './packet.js';
export { AudioSample, type AudioSampleInit, type AudioSampleCopyToOptions, AudioSampleResource, VideoSample, type VideoSampleInit, type VideoSamplePixelFormat, VideoSampleColorSpace, VideoSampleResource, type VideoSampleTransformOptions, type VideoSampleTransformationDescription, type CropRectangle, VIDEO_SAMPLE_PIXEL_FORMATS, type VideoDataPlane, registerVideoSampleTransformer, } from './sample.js';
export { AudioBufferSink, AudioSampleSink, BaseMediaSampleSink, CanvasSink, type CanvasSinkOptions, EncodedPacketSink, type PacketRetrievalOptions, VideoSampleSink, type VideoSinkDecoderOptions, type WrappedAudioBuffer, type WrappedCanvas, } from './media-sink.js';
export { Conversion, type ConversionOptions, type ConversionVideoOptions, type ConversionAudioOptions, type ConversionCopyOptions, type ConversionExecuteOptions, ConversionCanceledError, type DiscardedTrack, } from './conversion.js';
export { CustomVideoDecoder, CustomVideoEncoder, CustomAudioDecoder, CustomAudioEncoder, registerDecoder, registerEncoder, } from './custom-coder.js';
export { type MetadataTags, type AttachedImage, RichImageData, AttachedFile, type TrackDisposition, } from './metadata.js';
//# sourceMappingURL=index.d.ts.map
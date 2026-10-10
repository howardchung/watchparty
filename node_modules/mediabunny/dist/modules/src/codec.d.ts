/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Av1CodecInfo, AvcDecoderConfigurationRecord, HevcDecoderConfigurationRecord, ProresCodecInfo, Vp9CodecInfo } from './codec-data.js';
import { SubtitleMetadata } from './subtitles.js';
/**
 * List of known video codecs, ordered by encoding preference.
 * @group Codecs
 * @public
 */
export declare const VIDEO_CODECS: readonly ["avc", "hevc", "vp9", "av1", "vp8", "prores"];
/**
 * List of known PCM (uncompressed) audio codecs, ordered by encoding preference.
 * @group Codecs
 * @public
 */
export declare const PCM_AUDIO_CODECS: readonly ["pcm-s16", "pcm-s16be", "pcm-s24", "pcm-s24be", "pcm-s32", "pcm-s32be", "pcm-f32", "pcm-f32be", "pcm-f64", "pcm-f64be", "pcm-u8", "pcm-s8", "ulaw", "alaw"];
/**
 * List of known compressed audio codecs, ordered by encoding preference.
 * @group Codecs
 * @public
 */
export declare const NON_PCM_AUDIO_CODECS: readonly ["aac", "opus", "mp3", "vorbis", "flac", "ac3", "eac3", "dts"];
/**
 * List of known audio codecs, ordered by encoding preference.
 * @group Codecs
 * @public
 */
export declare const AUDIO_CODECS: readonly ["aac", "opus", "mp3", "vorbis", "flac", "ac3", "eac3", "dts", "pcm-s16", "pcm-s16be", "pcm-s24", "pcm-s24be", "pcm-s32", "pcm-s32be", "pcm-f32", "pcm-f32be", "pcm-f64", "pcm-f64be", "pcm-u8", "pcm-s8", "ulaw", "alaw"];
/**
 * List of known subtitle codecs, ordered by encoding preference.
 * @group Codecs
 * @public
 */
export declare const SUBTITLE_CODECS: readonly ["webvtt"];
/**
 * Union type of known video codecs.
 * @group Codecs
 * @public
 */
export type VideoCodec = typeof VIDEO_CODECS[number];
/**
 * Union type of known audio codecs.
 * @group Codecs
 * @public
 */
export type AudioCodec = typeof AUDIO_CODECS[number];
export type PcmAudioCodec = typeof PCM_AUDIO_CODECS[number];
/**
 * Union type of known subtitle codecs.
 * @group Codecs
 * @public
 */
export type SubtitleCodec = typeof SUBTITLE_CODECS[number];
/**
 * Union type of known media codecs.
 * @group Codecs
 * @public
 */
export type MediaCodec = VideoCodec | AudioCodec | SubtitleCodec;
export declare const AVC_LEVEL_TABLE: {
    maxMacroblocks: number;
    maxBitrate: number;
    maxDpbMbs: number;
    level: number;
}[];
export declare const VP9_LEVEL_TABLE: {
    maxPictureSize: number;
    maxBitrate: number;
    level: number;
}[];
export declare const PRORES_FOURCCS: readonly ["ap4x", "ap4h", "apch", "apcn", "apcs", "apco"];
export type ProresFourCc = typeof PRORES_FOURCCS[number];
export declare const DTS_FOURCCS: readonly ["dtsc", "dtsh", "dtsl", "dtse"];
export type DtsFourCc = typeof DTS_FOURCCS[number];
export declare const buildVideoCodecString: (codec: VideoCodec, width: number, height: number, bitrate: number, alpha: boolean) => string;
export declare const generateVp9CodecConfigurationFromCodecString: (codecString: string) => number[];
export declare const generateAv1CodecConfigurationFromCodecString: (codecString: string) => number[];
export declare const extractVideoCodecString: (trackInfo: {
    width: number;
    height: number;
    codec: VideoCodec | null;
    codecDescription: Uint8Array | null;
    colorSpace: VideoColorSpaceInit | null;
    avcType: 1 | 3 | null;
    avcCodecInfo: AvcDecoderConfigurationRecord | null;
    hevcCodecInfo: HevcDecoderConfigurationRecord | null;
    vp9CodecInfo: Vp9CodecInfo | null;
    av1CodecInfo: Av1CodecInfo | null;
    proresFormat: ProresFourCc | null;
}) => string;
export declare const extractColorSpace: (info: {
    codec: VideoCodec | null;
    codecDescription: Uint8Array | null;
    avcCodecInfo: AvcDecoderConfigurationRecord | null;
    hevcCodecInfo: HevcDecoderConfigurationRecord | null;
    vp9CodecInfo: Vp9CodecInfo | null;
    av1CodecInfo: Av1CodecInfo | null;
    proresCodecInfo: ProresCodecInfo | null;
}) => VideoColorSpaceInit;
export declare const buildAudioCodecString: (codec: AudioCodec, numberOfChannels: number, sampleRate: number) => "dtsc" | "vorbis" | "pcm-s16" | "pcm-s16be" | "pcm-s24" | "pcm-s24be" | "pcm-s32" | "pcm-s32be" | "pcm-f32" | "pcm-f32be" | "pcm-f64" | "pcm-f64be" | "pcm-u8" | "pcm-s8" | "ulaw" | "alaw" | "opus" | "mp3" | "flac" | "ac-3" | "ec-3" | "mp4a.40.29" | "mp4a.40.5" | "mp4a.40.2";
export type AacCodecInfo = {
    isMpeg2: boolean;
    objectType: number | null;
};
export declare const extractAudioCodecString: (trackInfo: {
    codec: AudioCodec | null;
    codecDescription: Uint8Array | null;
    aacCodecInfo: AacCodecInfo | null;
    dtsFormat: DtsFourCc | null;
}) => string;
export declare const guessDescriptionForVideo: (decoderConfig: VideoDecoderConfig) => Uint8Array | undefined;
export declare const guessDescriptionForAudio: (decoderConfig: AudioDecoderConfig) => Uint8Array | undefined | false;
export declare const OPUS_SAMPLE_RATE = 48000;
export declare const parsePcmCodec: (codec: PcmAudioCodec) => {
    dataType: "ulaw";
    sampleSize: 1;
    littleEndian: boolean;
    silentValue: number;
} | {
    dataType: "alaw";
    sampleSize: 1;
    littleEndian: boolean;
    silentValue: number;
} | {
    dataType: "unsigned" | "signed" | "float";
    sampleSize: 8 | 1 | 2 | 3 | 4;
    littleEndian: boolean;
    silentValue: number;
};
export declare const inferCodecFromCodecString: (codecString: string) => MediaCodec | null;
export declare const getVideoEncoderConfigExtension: (codec: VideoCodec) => {
    avc: {
        format: "avc";
    };
    hevc?: undefined;
} | {
    hevc: {
        format: "hevc";
    };
    avc?: undefined;
} | {
    avc?: undefined;
    hevc?: undefined;
};
export declare const getAudioEncoderConfigExtension: (codec: AudioCodec) => {
    aac: {
        format: "aac";
    };
    opus?: undefined;
} | {
    opus: {
        format: "opus";
    };
    aac?: undefined;
} | {
    aac?: undefined;
    opus?: undefined;
};
export declare const validateVideoChunkMetadata: (metadata: EncodedVideoChunkMetadata | undefined, trackCodec: VideoCodec | null) => void;
export declare const validateAudioChunkMetadata: (metadata: EncodedAudioChunkMetadata | undefined, trackCodec: AudioCodec | null) => void;
export declare const validateSubtitleMetadata: (metadata: SubtitleMetadata | undefined) => void;
//# sourceMappingURL=codec.d.ts.map
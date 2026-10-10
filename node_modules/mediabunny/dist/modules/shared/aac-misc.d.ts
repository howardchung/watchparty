/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Bitstream } from './bitstream.js';
export type AacAudioSpecificConfig = {
    objectType: number;
    coreObjectType: number;
    frequencyIndex: number;
    channelConfiguration: number;
    outputSampleRate: number | null;
    outputNumberOfChannels: number | null;
};
export declare const aacFrequencyTable: number[];
export declare const aacChannelMap: number[];
export declare const parseAacAudioSpecificConfig: (bytes: Uint8Array | null) => AacAudioSpecificConfig;
export declare const buildAacAudioSpecificConfig: (config: {
    objectType: number;
    outputSampleRate: number;
    outputNumberOfChannels: number;
}) => Uint8Array<ArrayBuffer>;
export type AdtsHeaderTemplate = {
    header: Uint8Array;
    bitstream: Bitstream;
};
export declare const buildAdtsHeaderTemplate: (config: AacAudioSpecificConfig) => AdtsHeaderTemplate;
export declare const writeAdtsFrameLength: (bitstream: Bitstream, frameLength: number) => void;
//# sourceMappingURL=aac-misc.d.ts.map
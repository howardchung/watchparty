/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Muxer } from '../muxer.js';
import { Output, OutputAudioTrack } from '../output.js';
import { AdtsOutputFormat } from '../output-format.js';
import { EncodedPacket } from '../packet.js';
export declare class AdtsMuxer extends Muxer {
    private format;
    private writer;
    private header;
    private headerBitstream;
    private inputIsAdts;
    constructor(output: Output, format: AdtsOutputFormat);
    start(): Promise<void>;
    getMimeType(): Promise<string>;
    addEncodedVideoPacket(): Promise<void>;
    addEncodedAudioPacket(track: OutputAudioTrack, packet: EncodedPacket, meta?: EncodedAudioChunkMetadata): Promise<void>;
    addSubtitleCue(): Promise<void>;
    finalize(): Promise<void>;
}
//# sourceMappingURL=adts-muxer.d.ts.map
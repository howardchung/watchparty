/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Writer } from '../writer.js';
export type XingFrameData = {
    mpegVersionId: number;
    layer: number;
    frequencyIndex: number;
    sampleRate: number;
    channel: number;
    modeExtension: number;
    copyright: number;
    original: number;
    emphasis: number;
    frameCount: number | null;
    fileSize: number | null;
    toc: Uint8Array | null;
};
export declare class Mp3Writer {
    private writer;
    private helper;
    private helperView;
    constructor(writer: Writer);
    writeU32(value: number): void;
    writeXingFrame(data: XingFrameData): void;
}
//# sourceMappingURL=mp3-writer.d.ts.map
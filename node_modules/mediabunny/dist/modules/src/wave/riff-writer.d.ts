/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Writer } from '../writer.js';
export declare class RiffWriter {
    private writer;
    private helper;
    private helperView;
    constructor(writer: Writer);
    writeU16(value: number): void;
    writeU32(value: number): void;
    writeU64(value: number): void;
    writeAscii(text: string): void;
}
//# sourceMappingURL=riff-writer.d.ts.map
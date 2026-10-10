/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Mp3FrameHeader } from '../../shared/mp3-misc.js';
import { Reader } from '../reader.js';
export declare const readNextMp3FrameHeader: (reader: Reader, startPos: number, until: number | null, ref?: Mp3FrameHeader | null) => Promise<{
    header: Mp3FrameHeader;
    startPos: number;
} | null>;
//# sourceMappingURL=mp3-reader.d.ts.map
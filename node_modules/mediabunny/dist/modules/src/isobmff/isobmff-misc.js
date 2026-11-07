/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { bytesToHexString, toDataView, uint8ArraysAreEqual } from '../misc.js';
export const buildIsobmffMimeType = (info) => {
    const base = info.hasVideo
        ? 'video/'
        : info.hasAudio
            ? 'audio/'
            : 'application/';
    let string = base + (info.isQuickTime ? 'quicktime' : 'mp4');
    if (info.codecStrings.length > 0) {
        const uniqueCodecMimeTypes = [...new Set(info.codecStrings)];
        string += `; codecs="${uniqueCodecMimeTypes.join(', ')}"`;
    }
    return string;
};
export const parsePsshBoxContents = (contents) => {
    const view = toDataView(contents);
    let pos = 0;
    const version = view.getUint8(pos);
    pos += 1;
    pos += 3; // Flags
    const systemId = bytesToHexString(contents.subarray(pos, pos + 16));
    pos += 16;
    let keyIds = null;
    if (version > 0) {
        const kidCount = view.getUint32(pos);
        pos += 4;
        if (kidCount > 0) {
            keyIds = [];
            for (let i = 0; i < kidCount; i++) {
                keyIds.push(bytesToHexString(contents.subarray(pos, pos + 16)));
                pos += 16;
            }
        }
    }
    const dataSize = view.getUint32(pos);
    pos += 4;
    return {
        systemId,
        keyIds,
        data: contents.slice(pos, pos + dataSize),
    };
};
export const psshBoxesAreEqual = (a, b) => (a.systemId === b.systemId
    && uint8ArraysAreEqual(a.data, b.data));

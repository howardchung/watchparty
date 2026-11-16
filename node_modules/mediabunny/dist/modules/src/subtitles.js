/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
const cueBlockHeaderRegex = /(?:(.+?)\n)?((?:\d{2}:)?\d{2}:\d{2}.\d{3})\s+-->\s+((?:\d{2}:)?\d{2}:\d{2}.\d{3})/g;
const preambleStartRegex = /^WEBVTT(.|\n)*?\n{2}/;
export const inlineTimestampRegex = /<(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})>/g;
export class SubtitleParser {
    constructor(options) {
        this.preambleText = null;
        this.preambleEmitted = false;
        this.options = options;
    }
    parse(text) {
        text = text.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
        cueBlockHeaderRegex.lastIndex = 0;
        let match;
        if (!this.preambleText) {
            if (!preambleStartRegex.test(text)) {
                throw new Error('WebVTT preamble incorrect.');
            }
            match = cueBlockHeaderRegex.exec(text);
            const preamble = text.slice(0, match?.index ?? text.length).trimEnd();
            if (!preamble) {
                throw new Error('No WebVTT preamble provided.');
            }
            this.preambleText = preamble;
            if (match) {
                text = text.slice(match.index);
                cueBlockHeaderRegex.lastIndex = 0;
            }
        }
        while ((match = cueBlockHeaderRegex.exec(text))) {
            const notes = text.slice(0, match.index);
            const cueIdentifier = match[1];
            const matchEnd = match.index + match[0].length;
            const bodyStart = text.indexOf('\n', matchEnd) + 1;
            const cueSettings = text.slice(matchEnd, bodyStart).trim();
            let bodyEnd = text.indexOf('\n\n', matchEnd);
            if (bodyEnd === -1)
                bodyEnd = text.length;
            const startTime = parseSubtitleTimestamp(match[2]);
            const endTime = parseSubtitleTimestamp(match[3]);
            const duration = endTime - startTime;
            const body = text.slice(bodyStart, bodyEnd).trim();
            text = text.slice(bodyEnd).trimStart();
            cueBlockHeaderRegex.lastIndex = 0;
            const cue = {
                timestamp: startTime / 1000,
                duration: duration / 1000,
                text: body,
                identifier: cueIdentifier,
                settings: cueSettings,
                notes,
            };
            const meta = {};
            if (!this.preambleEmitted) {
                meta.config = {
                    description: this.preambleText,
                };
                this.preambleEmitted = true;
            }
            this.options.output(cue, meta);
        }
    }
}
const timestampRegex = /(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})/;
export const parseSubtitleTimestamp = (string) => {
    const match = timestampRegex.exec(string);
    if (!match)
        throw new Error('Expected match.');
    return 60 * 60 * 1000 * Number(match[1] || '0')
        + 60 * 1000 * Number(match[2])
        + 1000 * Number(match[3])
        + Number(match[4]);
};
export const formatSubtitleTimestamp = (timestamp) => {
    const hours = Math.floor(timestamp / (60 * 60 * 1000));
    const minutes = Math.floor((timestamp % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((timestamp % (60 * 1000)) / 1000);
    const milliseconds = timestamp % 1000;
    return hours.toString().padStart(2, '0') + ':'
        + minutes.toString().padStart(2, '0') + ':'
        + seconds.toString().padStart(2, '0') + '.'
        + milliseconds.toString().padStart(3, '0');
};

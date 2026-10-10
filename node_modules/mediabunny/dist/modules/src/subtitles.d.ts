/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
export type SubtitleCue = {
    timestamp: number;
    duration: number;
    text: string;
    identifier?: string;
    settings?: string;
    notes?: string;
};
export type SubtitleConfig = {
    description: string;
};
export type SubtitleMetadata = {
    config?: SubtitleConfig;
};
type SubtitleParserOptions = {
    codec: 'webvtt';
    output: (cue: SubtitleCue, metadata: SubtitleMetadata) => unknown;
};
export declare const inlineTimestampRegex: RegExp;
export declare class SubtitleParser {
    private options;
    private preambleText;
    private preambleEmitted;
    constructor(options: SubtitleParserOptions);
    parse(text: string): void;
}
export declare const parseSubtitleTimestamp: (string: string) => number;
export declare const formatSubtitleTimestamp: (timestamp: number) => string;
export {};
//# sourceMappingURL=subtitles.d.ts.map
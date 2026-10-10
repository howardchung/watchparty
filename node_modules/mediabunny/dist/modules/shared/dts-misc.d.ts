/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/** Sample rates the core can be encoded at (Table 5-5) */
export declare const DTS_SAMPLE_RATES: number[];
/** Channel counts DTS has a speaker layout for; 3 and 7 have no mapping */
export declare const DTS_CHANNEL_COUNTS: number[];
/**
 * The DTS encoder needs each frame to be big enough to hold the per-channel side info and rejects the whole
 * configuration when it isn't, so this mirrors the check from FFmpeg's dcaenc.c.
 */
export declare const dtsBitrateFits: (bitrate: number, sampleRate: number, numberOfChannels: number) => boolean;
//# sourceMappingURL=dts-misc.d.ts.map
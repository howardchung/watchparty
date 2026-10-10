/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { AsyncMutex } from './misc.js';
export class Muxer {
    constructor(output) {
        this.mutex = new AsyncMutex();
        this.trackTimestampInfo = new WeakMap();
        this.output = output;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onTrackClose(track) { }
    validateTimestamp(track, timestampInSeconds, isKeyPacket) {
        let timestampInfo = this.trackTimestampInfo.get(track);
        if (!timestampInfo) {
            if (!isKeyPacket) {
                throw new Error('First packet must be a key packet.');
            }
            timestampInfo = {
                maxTimestamp: timestampInSeconds,
                maxTimestampBeforeLastKeyPacket: null,
            };
            this.trackTimestampInfo.set(track, timestampInfo);
        }
        else {
            if (isKeyPacket) {
                timestampInfo.maxTimestampBeforeLastKeyPacket = timestampInfo.maxTimestamp;
            }
            if (timestampInfo.maxTimestampBeforeLastKeyPacket !== null
                && timestampInSeconds < timestampInfo.maxTimestampBeforeLastKeyPacket) {
                throw new Error(`Timestamps cannot be smaller than the largest timestamp of the previous GOP (a GOP begins with a`
                    + ` key packet and ends right before the next key packet). Got ${timestampInSeconds}s, but largest`
                    + ` timestamp is ${timestampInfo.maxTimestampBeforeLastKeyPacket}s.`);
            }
            timestampInfo.maxTimestamp = Math.max(timestampInfo.maxTimestamp, timestampInSeconds);
        }
    }
}

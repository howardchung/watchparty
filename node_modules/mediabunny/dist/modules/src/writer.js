/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { assert } from './misc.js';
export class Writer {
    constructor(target, isMonotonic) {
        this.finalized = false;
        this.started = false;
        this.pos = 0;
        this.trackedWrites = null;
        this.trackedStart = -1;
        this.trackedEnd = -1;
        if (target._writerAcquired) {
            throw new Error('Can\'t have multiple Writers for the same Target.');
        }
        this.target = target;
        target._setMonotonicity(isMonotonic);
        target._writerAcquired = true;
    }
    start() {
        assert(!this.started);
        this.target._start();
        this.started = true;
    }
    /** Writes the given data to the target, at the current position. */
    write(data) {
        assert(this.started && !this.finalized);
        this.maybeTrackWrites(data);
        this.target._write(data, this.pos);
        this.pos += data.byteLength;
    }
    /** Sets the current position for future writes to a new one. */
    seek(newPos) {
        this.pos = newPos;
    }
    /** Returns the current position. */
    getPos() {
        return this.pos;
    }
    /** Signals to the writer that it may be time to flush. */
    async flush() {
        assert(this.started && !this.finalized);
        return this.target._flush();
    }
    /** Called after muxing has finished. */
    async finalize() {
        assert(this.started && !this.finalized);
        await this.target._finalize();
        this.finalized = true;
    }
    maybeTrackWrites(data) {
        if (!this.trackedWrites) {
            return;
        }
        // Handle negative relative write positions
        let pos = this.getPos();
        if (pos < this.trackedStart) {
            if (pos + data.byteLength <= this.trackedStart) {
                return;
            }
            data = data.subarray(this.trackedStart - pos);
            pos = 0;
        }
        const neededSize = pos + data.byteLength - this.trackedStart;
        let newLength = this.trackedWrites.byteLength;
        while (newLength < neededSize) {
            newLength *= 2;
        }
        // Check if we need to resize the buffer
        if (newLength !== this.trackedWrites.byteLength) {
            const copy = new Uint8Array(newLength);
            copy.set(this.trackedWrites, 0);
            this.trackedWrites = copy;
        }
        this.trackedWrites.set(data, pos - this.trackedStart);
        this.trackedEnd = Math.max(this.trackedEnd, pos + data.byteLength);
    }
    startTrackingWrites() {
        this.trackedWrites = new Uint8Array(2 ** 10);
        this.trackedStart = this.getPos();
        this.trackedEnd = this.trackedStart;
    }
    stopTrackingWrites() {
        if (!this.trackedWrites) {
            throw new Error('Internal error: Can\'t get tracked writes since nothing was tracked.');
        }
        const slice = this.trackedWrites.subarray(0, this.trackedEnd - this.trackedStart);
        const result = {
            data: slice,
            start: this.trackedStart,
            end: this.trackedEnd,
        };
        this.trackedWrites = null;
        return result;
    }
}

/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Target } from './target.js';
export declare class Writer {
    target: Target;
    finalized: boolean;
    started: boolean;
    private pos;
    constructor(target: Target, isMonotonic: boolean);
    start(): void;
    /** Writes the given data to the target, at the current position. */
    write(data: Uint8Array): void;
    /** Sets the current position for future writes to a new one. */
    seek(newPos: number): void;
    /** Returns the current position. */
    getPos(): number;
    /** Signals to the writer that it may be time to flush. */
    flush(): Promise<void>;
    /** Called after muxing has finished. */
    finalize(): Promise<void>;
    private trackedWrites;
    private trackedStart;
    private trackedEnd;
    private maybeTrackWrites;
    startTrackingWrites(): void;
    stopTrackingWrites(): {
        data: Uint8Array<ArrayBufferLike>;
        start: number;
        end: number;
    };
}
//# sourceMappingURL=writer.d.ts.map
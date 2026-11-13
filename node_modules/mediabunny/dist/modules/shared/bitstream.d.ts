/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
export declare class Bitstream {
    bytes: Uint8Array;
    /** Current offset in bits. */
    pos: number;
    constructor(bytes: Uint8Array);
    seekToByte(byteOffset: number): void;
    private readBit;
    readBits(n: number): number;
    writeBits(n: number, value: number): void;
    copyBits(n: number, other: Bitstream): void;
    readAlignedByte(): number;
    skipBits(n: number): void;
    getBitsLeft(): number;
    clone(): Bitstream;
}
//# sourceMappingURL=bitstream.d.ts.map
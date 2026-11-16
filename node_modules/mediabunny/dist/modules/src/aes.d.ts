/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { MaybePromise } from './misc.js';
import { Reader } from './reader.js';
export declare const AES_128_BLOCK_SIZE = 16;
export type Aes128CbcContextInit = {
    key: Uint8Array;
    iv: Uint8Array;
};
/** A context for doing AES-128-CBC operations. Better than the Web Crypto API since we can stream it. */
export declare class Aes128CbcContext {
    roundkey: Uint32Array<ArrayBuffer>;
    iv: Uint32Array<ArrayBuffer>;
    in: Uint8Array<ArrayBuffer>;
    out: Uint8Array<ArrayBuffer>;
    inView: DataView<ArrayBuffer>;
    outView: DataView<ArrayBuffer>;
    init({ key, iv }: Aes128CbcContextInit): void;
    decrypt(): void;
}
export declare const createAes128CbcDecryptStream: (reader: Reader, getInit: () => MaybePromise<Aes128CbcContextInit>, close: () => unknown) => ReadableStream<Uint8Array<ArrayBufferLike>>;
//# sourceMappingURL=aes.d.ts.map
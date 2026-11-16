/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { FilePath, MaybePromise, EventEmitter } from './misc.js';
export type ReadResult = {
    bytes: Uint8Array;
    view: DataView;
    /** The offset of the bytes in the file. */
    offset: number;
};
export declare const DEFAULT_MIN_READ_POSITION = 0;
export declare const DEFAULT_MAX_READ_POSITION: number;
/**
 * The events emitted by a {@link Source}, with each key being an event name and its value being the event data.
 * @group Input sources
 * @public
 */
export type SourceEvents = {
    /** Emitted each time data is retrieved from the source. */
    read: {
        /** The start of the retrieved range, inclusive. */
        start: number;
        /** The end of the retrieved range, exclusive. */
        end: number;
    };
};
/**
 * The source base class, representing a resource from which bytes can be read.
 * @group Input sources
 * @public
 */
export declare abstract class Source extends EventEmitter<SourceEvents> {
    constructor();
    /**
     * Resolves with the total size of the file in bytes. This function is memoized, meaning only the first call
     * will retrieve the size.
     *
     * Returns null if the source is unsized.
     */
    getSizeOrNull(): Promise<number | null>;
    /**
     * Resolves with the total size of the file in bytes. This function is memoized, meaning only the first call
     * will retrieve the size.
     *
     * Throws an error if the source is unsized.
     */
    getSize(): Promise<number>;
    /**
     * Returns a new {@link RangedSource} that maps data onto this source using the given offset and length. If a length
     * is not provided, the ranged source spans until the end of this source's data.
     *
     * Useful for reading files that are embedded within larger files.
     */
    slice(offset: number, length?: number): RangedSource;
    /**
     * Called each time data is retrieved from the source. Will be called with the retrieved range (end exclusive).
     *
     * @deprecated Use `source.on('read', ({ start, end }) => ...)` instead.
     */
    onread: ((start: number, end: number) => unknown) | null;
    /**
     * Creates a new `SourceRef` pointing to this source. You are expected to call `.free()` on said `SourceRef` when
     * you're done with it.
     */
    ref(): SourceRef<this>;
}
/**
 * A reference to a {@link Source}, used to manage a source's lifecycle. Creating a `SourceRef` via {@link Source.ref}
 * increases that source's internal reference count. As long as a source has a non-zero reference count, it is assumed
 * to still be in use. Once all references are freed via {@link SourceRef.free}, the source gets disposed.
 *
 * @group Input sources
 * @public
 */
export declare class SourceRef<S extends Source = Source> implements Disposable {
    /** The {@link Source} this ref references. Accessing this field throws an error after having freed the ref. */
    get source(): S;
    /** Whether or not this reference has been freed via {@link SourceRef.free}. */
    get freed(): boolean;
    /**
     * Frees the ref, decrementing the source's internal reference count. If the source's internal reference count
     * reaches zero, it gets disposed. To catch bugs, this method throws if the ref is already freed.
     */
    free(): void;
    /**
     * Calls {@link SourceRef.free}.
     */
    [Symbol.dispose](): void;
}
/**
 * A source which can create new sources from file paths. Required for multi-file inputs such as HLS playlists.
 * @public
 * @group Input sources
 */
export declare abstract class PathedSource extends Source {
    /**
     * The path that points to the root file; the entry file of the media.
     *
     * This path may be modified by the source to indicate a redirect: an updated path to perform new requests
     * relative to.
     */
    rootPath: FilePath;
    /** The callback that is called for each requested file; must return a {@link Source} or {@link SourceRef}. */
    readonly requestHandler: (request: SourceRequest) => MaybePromise<Source | SourceRef>;
    constructor(
    /**
     * The path that points to the root file; the entry file of the media.
     *
     * This path may be modified by the source to indicate a redirect: an updated path to perform new requests
     * relative to.
     */
    rootPath: FilePath, 
    /** The callback that is called for each requested file; must return a {@link Source} or {@link SourceRef}. */
    requestHandler: (request: SourceRequest) => MaybePromise<Source | SourceRef>);
}
/**
 * A request for a {@link Source} at the given path.
 * @group Input sources
 * @public
 */
export type SourceRequest = {
    /** The requested file path. */
    path: FilePath;
    /** Whether the requested file is the root file. */
    isRoot: boolean;
};
export declare const sourceRequestsAreEqual: (a: SourceRequest, b: SourceRequest) => boolean;
/**
 * A custom multi-file source where each file is uniquely identified by a {@link FilePath} and can be resolved to
 * an arbitrary {@link Source}.
 *
 * @public
 * @group Input sources
 */
export declare class CustomPathedSource extends PathedSource {
}
/**
 * A source backed by an ArrayBuffer or ArrayBufferView, with the entire file held in memory.
 * @group Input sources
 * @public
 */
export declare class BufferSource extends Source {
    /**
     * Creates a new {@link BufferSource} backed by the specified `ArrayBuffer`, `SharedArrayBuffer`,
     * or `ArrayBufferView`.
     */
    constructor(buffer: AllowSharedBufferSource);
}
/**
 * Options for {@link BlobSource}.
 * @group Input sources
 * @public
 */
export type BlobSourceOptions = {
    /** The maximum number of bytes the cache is allowed to hold in memory. Defaults to 8 MiB. */
    maxCacheSize?: number;
    /**
     * Defaults to `true`. When `true`, Mediabunny will acquire a `ReadableStream` reader internally to efficiently read
     * data from the blob. Since this can lead to errors in some (very) rare cases due to browser bugs, you can set this
     * field to `false` to try a slower but more stable reading method.
     */
    useStreamReader?: boolean;
    /** Handles errors that occur while no read is pending. By default, these become unhandled rejections. */
    handleUnhandledError?: (error: unknown) => unknown;
};
/**
 * A source backed by a [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob). Since a
 * [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) is also a `Blob`, this is the source to use when
 * reading files off the disk.
 * @group Input sources
 * @public
 */
export declare class BlobSource extends Source {
    /**
     * Creates a new {@link BlobSource} backed by the specified
     * [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob).
     */
    constructor(blob: Blob, options?: BlobSourceOptions);
}
/**
 * Options for {@link UrlSource}.
 * @group Input sources
 * @public
 */
export type UrlSourceOptions = {
    /**
     * The [`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit) used by the Fetch API. Can be
     * used to further control the requests, such as setting custom headers.
     *
     * The `signal` field is not available, as Mediabunny controls request cancellation internally. If you want to
     * cancel ongoing requests, use {@link Input.dispose}.
     */
    requestInit?: Omit<RequestInit, 'signal'>;
    /**
     * A function that returns the delay (in seconds) before retrying a failed request. The function is called
     * with the number of previous, unsuccessful attempts, as well as with the error with which the previous request
     * failed. If the function returns `null`, no more retries will be made.
     *
     * By default, it uses an exponential backoff algorithm that never gives up unless
     * a CORS error is suspected (`fetch()` did reject, `navigator.onLine` is true and origin is different).
     */
    getRetryDelay?: (previousAttempts: number, error: unknown, url: string | URL | Request) => number | null;
    /** The maximum number of bytes the cache is allowed to hold in memory. Defaults to 64 MiB. */
    maxCacheSize?: number;
    /** The maximum number of parallel requests to use for fetching. Defaults to 2. */
    parallelism?: number;
    /**
     * A WHATWG-compatible fetch function. You can use this field to polyfill the `fetch` function, add missing
     * features, or use a custom implementation.
     */
    fetchFn?: typeof fetch;
    /** Handles errors that occur while no read is pending. By default, these become unhandled rejections. */
    handleUnhandledError?: (error: unknown) => unknown;
};
/**
 * A source backed by a URL. This is useful for reading data from the network. Requests will be made using an optimized
 * reading and prefetching pattern to minimize request count and latency. Works best with servers that support HTTP
 * range requests; otherwise, resources must be streamed and read sequentially.
 * @group Input sources
 * @public
 */
export declare class UrlSource extends PathedSource {
    /**
     * Creates a new {@link UrlSource} backed by the resource at the specified URL.
     *
     * When passing a `Request` instance, note that its `signal` will be overridden by Mediabunny; if you want to cancel
     * ongoing requests, use {@link Input.dispose}.
     */
    constructor(url: string | URL | Request, options?: UrlSourceOptions);
}
/**
 * Options for {@link FilePathSource}.
 * @group Input sources
 * @public
 */
export type FilePathSourceOptions = {
    /** The maximum number of bytes the cache is allowed to hold in memory. Defaults to 8 MiB. */
    maxCacheSize?: number;
    /** Handles errors that occur while no read is pending. By default, these become unhandled rejections. */
    handleUnhandledError?: (error: unknown) => unknown;
};
/**
 * A source backed by a path to a file. Intended for server-side usage in Node, Bun, or Deno.
 *
 * Make sure to call `.dispose()` on the corresponding {@link Input} when done to explicitly free the internal file
 * handle acquired by this source.
 * @group Input sources
 * @public
 */
export declare class FilePathSource extends PathedSource {
    /** Creates a new {@link FilePathSource} backed by the file at the specified file path. */
    constructor(filePath: string, options?: FilePathSourceOptions);
}
/**
 * Options for defining a {@link CustomSource}.
 * @group Input sources
 * @public
 */
export type CustomSourceOptions = {
    /**
     * Called when the size of the entire file is requested. Must return or resolve to the size in bytes. This function
     * is guaranteed to be called before `read`.
     */
    getSize: () => MaybePromise<number>;
    /**
     * Called when data is requested. Must return or resolve to the bytes from the specified byte range, or a stream
     * that yields these bytes.
     *
     * You are guaranteed that `0 <= start < end < fileSize`.
     */
    read: (start: number, end: number) => MaybePromise<Uint8Array | ReadableStream<Uint8Array>>;
    /**
     * Called when the {@link Input} driven by this source is disposed.
     */
    dispose?: () => unknown;
    /** The maximum number of bytes the cache is allowed to hold in memory. Defaults to 8 MiB. */
    maxCacheSize?: number;
    /**
     * Specifies the prefetch profile that the reader should use with this source. A prefetch profile specifies the
     * pattern with which bytes outside of the requested range are preloaded to reduce latency for future reads.
     *
     * - `'none'` (default): No prefetching; only the data needed in the moment is requested.
     * - `'fileSystem'`: File system-optimized prefetching: a small amount of data is prefetched bidirectionally,
     * aligned with page boundaries.
     * - `'network'`: Network-optimized prefetching, or more generally, prefetching optimized for any high-latency
     * environment: tries to minimize the amount of read calls and aggressively prefetches data when sequential access
     * patterns are detected.
     */
    prefetchProfile?: 'none' | 'fileSystem' | 'network';
    /** Handles errors that occur while no read is pending. By default, these become unhandled rejections. */
    handleUnhandledError?: (error: unknown) => unknown;
};
/**
 * A general-purpose, callback-driven source that can get its data from anywhere. Use this source to implement your own
 * custom source if the other sources don't cover your case.
 * @group Input sources
 * @public
 */
export declare class CustomSource extends Source {
    /** Creates a new {@link CustomSource} whose behavior is specified by `options`.  */
    constructor(options: CustomSourceOptions);
}
/**
 * An alias for {@link CustomSource}.
 * @deprecated This name is misleading and will be removed in a future release. Please use {@link CustomSource} instead.
 *
 * @group Input sources
 * @public
 */
export declare const StreamSource: typeof CustomSource;
/**
 * An alias for {@link CustomSourceOptions}.
 * @deprecated This name is misleading and will be removed in a future release. Please use
 * {@link CustomSourceOptions} instead.
 *
 * @group Input sources
 * @public
 */
export type StreamSourceOptions = CustomSourceOptions;
/**
 * Options for {@link ReadableStreamSource}.
 * @group Input sources
 * @public
 */
export type ReadableStreamSourceOptions = {
    /** The maximum number of bytes the cache is allowed to hold in memory. Defaults to 32 MiB. */
    maxCacheSize?: number;
    /** Handles errors that occur while no read is pending. By default, these become unhandled rejections. */
    handleUnhandledError?: (error: unknown) => unknown;
};
/**
 * A source backed by a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) of
 * `Uint8Array`, representing an append-only byte stream of unknown length. This is the source to use for incrementally
 * streaming in input files that are still being constructed and whose size we don't yet know, like for example the
 * output chunks of [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder).
 *
 * This source is *unsized*, meaning calls to `.getSize()` will throw and readers are more limited due to the
 * lack of random file access. You should only use this source with sequential access patterns, such as reading all
 * packets from start to end. This source does not work well with random access patterns unless you increase its
 * max cache size.
 *
 * @group Input sources
 * @public
 */
export declare class ReadableStreamSource extends Source {
    /** Creates a new {@link ReadableStreamSource} backed by the specified `ReadableStream<Uint8Array>`. */
    constructor(stream: ReadableStream<Uint8Array>, options?: ReadableStreamSourceOptions);
}
/**
 * A dummy source from which no data can be read. Can be used in conjunction with input formats that get their data
 * from another source.
 */
export declare class NullSource extends Source {
    _getFileSize(): number | null;
    _read(): MaybePromise<ReadResult | null>;
    _dispose(): void;
}
/**
 * A source that covers a range (offset + length) of another source. Useful for reading files that are embedded within
 * larger files.
 *
 * @group Input sources
 * @public
 */
export declare class RangedSource extends Source {
    ref(): SourceRef<this>;
}
//# sourceMappingURL=source.d.ts.map
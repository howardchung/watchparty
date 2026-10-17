/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { DurationMetadataRequestOptions } from './demuxer.js';
import { InputFormat, InputFormatOptions } from './input-format.js';
import { InputAudioTrack, InputTrack, InputVideoTrack, InputTrackQuery } from './input-track.js';
import { PacketRetrievalOptions } from './media-sink.js';
import { EventEmitter } from './misc.js';
import { Source, SourceRef, SourceRequest } from './source.js';
export declare const DEFAULT_SOURCE_CACHE_GROUP = 1;
export declare const ENCRYPTION_KEY_CACHE_GROUP = 2;
/**
 * The options for creating an Input object.
 * @group Input files & tracks
 * @public
 */
export type InputOptions<S extends Source = Source> = {
    /** A list of supported formats. If the source file is not of one of these formats, then it cannot be read. */
    formats: InputFormat[];
    /** The source from which data will be read. */
    source: S | SourceRef<S>;
    /**
     * An optional, second {@link Input} instance that contains the necessary metadata to initialize the tracks of
     * this input. This is necessary in cases where track initialization info and media data are carried in separate
     * files, like is the case with segmented MP4 (CMAF) files.
     *
     * The use of this field depends on the input format.
     */
    initInput?: Input;
    /** Can be used to specify additional per-format configuration. */
    formatOptions?: InputFormatOptions;
};
/**
 * Describes the events that an {@link Input} emits, with each key being an event name and its value being the
 * event data.
 *
 * @group Input files & tracks
 * @public
 */
export type InputEvents = {
    /** Emitted whenever a {@link Source} is loaded by the input. Useful to track reads. */
    source: {
        /** The loaded source. */
        source: Source;
        /** The request that led to loading this source, or `null` if the input is not pathed. */
        request: SourceRequest | null;
        /** Whether the source is the root file of the media. */
        isRoot: boolean;
    };
};
/**
 * Represents input media, backed by a single file or multiple files depending on the format.
 *
 * This is the root object from which all media read operations start.
 * @group Input files & tracks
 * @public
 */
export declare class Input<S extends Source = Source> extends EventEmitter<InputEvents> implements Disposable {
    /** True if the input has been disposed. */
    get disposed(): boolean;
    /**
     * Creates a new input file from the specified options. No reading operations will be performed until methods are
     * called on this instance.
     */
    constructor(options: InputOptions<S>);
    /**
     * Returns the source from which this input file reads data for the root path.
     */
    get source(): S;
    /**
     * Returns the format of the input file. You can compare this result directly to the {@link InputFormat} singletons
     * or use `instanceof` checks for subset-aware logic (for example, `format instanceof MatroskaInputFormat` is true
     * for both MKV and WebM).
     */
    getFormat(): Promise<InputFormat>;
    /** Returns `true` if the format of the input file is known and the file can be read, `false` otherwise. */
    canRead(): Promise<boolean>;
    /**
     * Returns the timestamp at which the input file starts. More precisely, returns the smallest starting timestamp
     * among all tracks.
     *
     * Optionally, you can pass in the list of tracks for which you want to compute the starting timestamp.
     *
     * Note that this method is potentially expensive for inputs with many tracks (such as HLS manifests), since it
     * probes every track.
     */
    getFirstTimestamp(tracks?: InputTrack[]): Promise<number>;
    /**
     * Computes the duration of the input file, in seconds. More precisely, returns the largest end timestamp among
     * all tracks.
     *
     * Optionally, you can pass in the list of tracks for which you want to compute the duration.
     *
     * This method can be potentially expensive depending on the underlying file format, because it returns the most
     * accurate duration possible and must check all tracks. Use {@link Input.getDurationFromMetadata} for a faster but
     * less accurate estimate of duration.
     *
     * By default, when any track in the underlying media is live, this method will only resolve once the live stream
     * ends. If you want to query the current duration of the media, set {@link PacketRetrievalOptions.skipLiveWait}
     * to `true` in the options.
     */
    computeDuration(tracks?: InputTrack[], options?: PacketRetrievalOptions): Promise<number>;
    /**
     * Gets the duration (end timestamp) in seconds of the input file from metadata stored in the file. This value may
     * be approximate or diverge from the actual, precise duration returned by `.computeDuration()`, but compared to
     * that method, this method is cheaper. When the duration cannot be determined from the file metadata, `null`
     * is returned.
     *
     * Optionally, you can pass in the list of tracks for which you want to get the duration from metadata.
     *
     * By default, when the underlying media is live, this method will only resolve once the live stream
     * ends. If you want to query the current duration of the media, set
     * {@link DurationMetadataRequestOptions.skipLiveWait} to `true` in the options.
     */
    getDurationFromMetadata(tracks?: InputTrack[], options?: DurationMetadataRequestOptions): Promise<number | null>;
    /**
     * Returns the list of all tracks of this input file in the order in which they appear in the file. An optional
     * query can be provided.
     */
    getTracks(query?: InputTrackQuery<InputTrack>): Promise<InputTrack[]>;
    /** Returns the list of all video tracks of this input file. An optional query can be provided. */
    getVideoTracks(query?: InputTrackQuery<InputVideoTrack>): Promise<InputVideoTrack[]>;
    /** Returns the list of all audio tracks of this input file. An optional query can be provided. */
    getAudioTracks(query?: InputTrackQuery<InputAudioTrack>): Promise<InputAudioTrack[]>;
    /**
     * Returns the primary video track of this input file, or null if there are no video tracks.
     *
     * Multiple factors determine which track is considered primary, including its position in the file, disposition,
     * bitrate (higher bitrate is preferred), and if it can be paired with an audio track.
     */
    getPrimaryVideoTrack(query?: InputTrackQuery<InputVideoTrack>): Promise<InputVideoTrack | null>;
    /**
     * Returns the primary audio track of this input file, or null if there are no audio tracks.
     *
     * Multiple factors determine which track is considered primary, including its position in the file, disposition,
     * bitrate (higher bitrate is preferred), and if it can be paired with the primary video track.
     */
    getPrimaryAudioTrack(query?: InputTrackQuery<InputAudioTrack>): Promise<InputAudioTrack | null>;
    /** Returns the full MIME type of this input file, including track codecs. */
    getMimeType(): Promise<string>;
    /**
     * Returns descriptive metadata tags about the media file, such as title, author, date, cover art, or other
     * attached files.
     */
    getMetadataTags(): Promise<import("./metadata.js").MetadataTags>;
    /**
     * Disposes this input and frees connected resources. When an input is disposed, ongoing read operations will be
     * canceled, all future read operations will fail, any open decoders will be closed, and all ongoing media sink
     * operations will be canceled. Disallowed and canceled operations will throw an {@link InputDisposedError}.
     *
     * You are expected not to use an input after disposing it. While some operations may still work, it is not
     * specified and may change in any future update.
     */
    dispose(): void;
    /**
     * Calls `.dispose()` on the input, implementing the `Disposable` interface for use with
     * JavaScript Explicit Resource Management features.
     */
    [Symbol.dispose](): void;
}
/**
 * Thrown when trying to operate on an input that has an unsupported or unrecognizable format.
 * @group Input files & tracks
 * @public
 */
export declare class UnsupportedInputFormatError extends Error {
    /** Creates a new {@link UnsupportedInputFormatError}. */
    constructor(message?: string);
}
/**
 * Thrown when an operation was prevented because the corresponding {@link Input} has been disposed.
 * @group Input files & tracks
 * @public
 */
export declare class InputDisposedError extends Error {
    /** Creates a new {@link InputDisposedError}. */
    constructor(message?: string);
}
//# sourceMappingURL=input.d.ts.map
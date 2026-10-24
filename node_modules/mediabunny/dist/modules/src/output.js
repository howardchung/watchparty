/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { assert, AsyncMutex, EventEmitter, isIso639Dash2LanguageCode, isThenable, toArray, } from './misc.js';
import { validateMetadataTags, validateTrackDisposition } from './metadata.js';
import { OutputFormat } from './output-format.js';
import { AudioSource, SubtitleSource, VideoSource } from './media-source.js';
import { PathedTarget, Target } from './target.js';
import { Writer } from './writer.js';
import { Logging } from './logging.js';
import { EncodedPacket } from './packet.js';
import { validateAudioChunkMetadata, validateVideoChunkMetadata } from './codec.js';
/**
 * List of all track types.
 * @group Miscellaneous
 * @public
 */
export const ALL_TRACK_TYPES = ['video', 'audio', 'subtitle'];
/**
 * Represents a track added to an {@link Output}.
 * @group Output files
 * @public
 */
export class OutputTrack {
    /** @internal */
    constructor(id, output, type, source, metadata) {
        this.id = id;
        this.output = output;
        this.type = type;
        this.source = source;
        this.metadata = metadata;
    }
    /** Returns true if and only if this track is a video track. */
    isVideoTrack() {
        return this.type === 'video';
    }
    /** Returns true if and only if this track is an audio track. */
    isAudioTrack() {
        return this.type === 'audio';
    }
    /** Returns true if and only if this track is a subtitle track. */
    isSubtitleTrack() {
        return this.type === 'subtitle';
    }
    /**
     * Returns true if and only if this track can be paired with the given other track. Pairability can be set using
     * the {@link BaseTrackMetadata.group} option.
     */
    canBePairedWith(other) {
        if (!(other instanceof OutputTrack)) {
            throw new TypeError('other must be an OutputTrack.');
        }
        if (this === other) {
            return false;
        }
        const thisGroups = toArray(this.metadata.group);
        const otherGroups = toArray(other.metadata.group);
        for (const aGroup of thisGroups) {
            const pairableInSameGroup = this.type !== other.type && otherGroups.some(bGroup => aGroup === bGroup);
            if (pairableInSameGroup) {
                return true;
            }
            const pairableAcrossGroups = otherGroups.some(bGroup => aGroup._pairedGroups.has(bGroup));
            if (pairableAcrossGroups) {
                return true;
            }
        }
        return false;
    }
}
/**
 * An {@link OutputTrack} providing video data, created using {@link Output.addVideoTrack}.
 * @group Output files
 * @public
 */
export class OutputVideoTrack extends OutputTrack {
    /** @internal */
    constructor(id, output, source, metadata) {
        super(id, output, 'video', source, metadata);
    }
}
/**
 * An {@link OutputTrack} providing audio data, created using {@link Output.addAudioTrack}.
 * @group Output files
 * @public
 */
export class OutputAudioTrack extends OutputTrack {
    /** @internal */
    constructor(id, output, source, metadata) {
        super(id, output, 'audio', source, metadata);
    }
}
/**
 * An {@link OutputTrack} providing subtitle data, created using {@link Output.addSubtitleTrack}.
 * @group Output files
 * @public
 */
export class OutputSubtitleTrack extends OutputTrack {
    /** @internal */
    constructor(id, output, source, metadata) {
        super(id, output, 'subtitle', source, metadata);
    }
}
/**
 * Used to define pairability between {@link OutputTrack} instances. First create the group, then assign tracks to it
 * via {@link BaseTrackMetadata.group}.
 *
 * Two tracks are considered _pairable_ if they are in the same group but have a different {@link TrackType}, or if they
 * are in different groups that are paired with each other. Groups can be paired with each other using the
 * {@link OutputTrackGroup.pairWith} method.
 *
 * @group Output files
 * @public
 */
export class OutputTrackGroup {
    /** Creates a new {@link OutputTrackGroup}. */
    constructor() {
        /** @internal */
        this._pairedGroups = new Set();
        // The object's identity is the state
    }
    /**
     * Marks this group as being pairable with another group, symmetrically. Output tracks where each track is assigned
     * to one half of a group pairing are then considered pairable.
     *
     * You cannot pair a group with itself.
     */
    pairWith(other) {
        if (!(other instanceof OutputTrackGroup)) {
            throw new TypeError('other must be an OutputTrackGroup.');
        }
        if (this === other) {
            throw new TypeError('Cannot pair a group with itself.');
        }
        this._pairedGroups.add(other);
        other._pairedGroups.add(this);
    }
}
const validateBaseTrackMetadata = (metadata) => {
    if (!metadata || typeof metadata !== 'object') {
        throw new TypeError('metadata must be an object.');
    }
    if (metadata.languageCode !== undefined && !isIso639Dash2LanguageCode(metadata.languageCode)) {
        throw new TypeError('metadata.languageCode, when provided, must be a three-letter, ISO 639-2/T language code.');
    }
    if (metadata.name !== undefined && typeof metadata.name !== 'string') {
        throw new TypeError('metadata.name, when provided, must be a string.');
    }
    if (metadata.disposition !== undefined) {
        validateTrackDisposition(metadata.disposition);
    }
    if (metadata.maximumPacketCount !== undefined
        && (!Number.isInteger(metadata.maximumPacketCount) || metadata.maximumPacketCount < 0)) {
        throw new TypeError('metadata.maximumPacketCount, when provided, must be a non-negative integer.');
    }
    if (metadata.bitrate !== undefined && (!Number.isFinite(metadata.bitrate) || metadata.bitrate < 0)) {
        throw new TypeError('metadata.bitrate, when provided, must be a non-negative number.');
    }
    if (metadata.averageBitrate !== undefined
        && (!Number.isFinite(metadata.averageBitrate) || metadata.averageBitrate < 0)) {
        throw new TypeError('metadata.averageBitrate, when provided, must be a non-negative number.');
    }
    if (metadata.group !== undefined
        && !(metadata.group instanceof OutputTrackGroup)
        && (!Array.isArray(metadata.group) || metadata.group.some(group => !(group instanceof OutputTrackGroup)))) {
        throw new TypeError('metadata.group, when provided, must be an OutputTrackGroup instance or an array of'
            + ' OutputTrackGroup instances.');
    }
};
/**
 * Main class orchestrating the creation of new media files.
 * @group Output files
 * @public
 */
export class Output extends EventEmitter {
    /**
     * The target to which the root file will be written. Throws when using {@link PathedTarget} with an async callback;
     * prefer the `'target'` event for those cases.
     */
    get target() {
        const errorMessage = 'Output.target cannot be used when using PathedTarget with an async callback.'
            + ' Use the \'target\' event instead.';
        // We use this field to make sure we can reliably throw in the `target` getter whenever retrieving the target
        // requires awaiting a promise. We do this so there is no different behavior based on order: if the target has
        // already been retrieved via the normal internal operations, and then somebody calls the `target` getter, even
        // if the target is now available, the getter should still throw to be consistent in behavior and in definition.
        if (this._rootTargetPromise) {
            throw new TypeError(errorMessage);
        }
        const rootTargetResult = this._getRootTarget();
        if (isThenable(rootTargetResult)) {
            throw new TypeError(errorMessage);
        }
        return rootTargetResult;
    }
    /**
     * Creates a new instance of {@link Output} which can then be used to create a new media file according to the
     * specified {@link OutputOptions}.
     */
    constructor(options) {
        super();
        /** The current state of the output. */
        this.state = 'pending';
        /**
         * The {@link OutputTrackGroup} that all tracks are assigned to by default unless otherwise specified by
         * {@link BaseTrackMetadata.group}.
         */
        this.defaultTrackGroup = new OutputTrackGroup();
        /**
         * The tracks that have been added to this output. Treat it as a readonly field; to add tracks, use the methods.
         */
        this.tracks = [];
        /** @internal */
        this._onFinalize = null;
        /** @internal */
        this._unfinalizedTargets = new Set();
        /** @internal */
        this._rootWriterPromise = null;
        /** @internal */
        this._startPromise = null;
        /** @internal */
        this._cancelPromise = null;
        /** @internal */
        this._finalizePromise = null;
        /** @internal */
        this._mutex = new AsyncMutex();
        /** @internal */
        this._metadataTags = {};
        /** @internal */
        this._rootTarget = null;
        /** @internal */
        this._rootTargetPromise = null;
        /**
         * This field is used to synchronize multiple MediaStreamTracks. They use the same time coordinate system across
         * tracks, and to ensure correct audio-video sync, we must use the same offset for all of them. The reason an offset
         * is needed at all is because the timestamps typically don't start at zero.
         * @internal
         */
        this._firstMediaStreamTimestamp = null;
        if (!options || typeof options !== 'object') {
            throw new TypeError('options must be an object.');
        }
        if (!(options.format instanceof OutputFormat)) {
            throw new TypeError('options.format must be an OutputFormat.');
        }
        if (!(options.target instanceof Target || options.target instanceof PathedTarget)) {
            throw new TypeError('options.target must be a Target or a PathedTarget.');
        }
        if (options.target instanceof Target) {
            this._rememberTarget(options.target);
        }
        if (options.initTarget !== undefined
            && !(options.initTarget instanceof Target)
            && typeof options.initTarget !== 'function') {
            throw new Error('options.initTarget, when provided, must be a Target or a function that returns or resolves to'
                + ' a Target.');
        }
        if (options.onFinalize !== undefined && typeof options.onFinalize !== 'function') {
            throw new TypeError('options.onFinalize, when provided, must be a function.');
        }
        this.format = options.format;
        this._target = options.target;
        this._onFinalize = options.onFinalize ?? null;
        this._initTarget = options.initTarget ?? null;
        if (this._initTarget instanceof Target) {
            this._rememberTarget(this._initTarget);
        }
        this._muxer = options.format._createMuxer(this);
    }
    /** @internal */
    _getTargetValidated(request) {
        assert(this._target instanceof PathedTarget);
        const result = this._target.getTarget(request);
        const handleResult = (result) => {
            if (!(result instanceof Target)) {
                throw new TypeError('getTarget must return a Target.');
            }
            return result;
        };
        if (isThenable(result)) {
            return result.then(handleResult);
        }
        else {
            return handleResult(result);
        }
    }
    /** @internal */
    async _getTarget(request) {
        assert(this._target instanceof PathedTarget);
        const target = await this._getTargetValidated(request);
        this._emit('target', { target, request, isRoot: request.isRoot });
        if (this.state === 'canceled') {
            await target._close();
        }
        else {
            this._rememberTarget(target);
        }
        return target;
    }
    /** @internal */
    _rememberTarget(target) {
        this._unfinalizedTargets.add(target);
        target.on('finalized', () => this._unfinalizedTargets.delete(target), { once: true });
    }
    /** @internal */
    async _getInitTarget() {
        assert(this._initTarget !== null);
        if (this._initTarget instanceof Target) {
            return this._initTarget;
        }
        const target = await this._initTarget();
        if (this.state === 'canceled') {
            await target._close();
        }
        else {
            this._rememberTarget(target);
        }
        return target;
    }
    /** @internal */
    _hasInitTarget() {
        return this._initTarget !== null;
    }
    /** @internal */
    _getRootTarget() {
        if (this._rootTarget) {
            return this._rootTarget;
        }
        if (this._rootTargetPromise) {
            return this._rootTargetPromise;
        }
        if (this._target instanceof Target) {
            this._emit('target', { target: this._target, request: null, isRoot: true });
            this._rootTarget = this._target;
            return this._target;
        }
        const request = {
            path: this._target.rootPath,
            isRoot: true,
            mimeType: this.format.mimeType,
        };
        const result = this._getTargetValidated(request);
        const handleResult = (target) => {
            if (this.state === 'canceled') {
                // Promise thrown away here, but no way to surface it to the user really
                void target._close();
            }
            else {
                this._rememberTarget(target);
            }
            this._emit('target', { target, request, isRoot: true });
            this._rootTarget = target;
            return target;
        };
        if (isThenable(result)) {
            return this._rootTargetPromise = result.then(handleResult);
        }
        else {
            return handleResult(result);
        }
    }
    /** @internal */
    _getRootWriter(isMonotonic) {
        return this._rootWriterPromise ??= (async () => {
            const target = await this._getRootTarget();
            const writer = new Writer(target, typeof isMonotonic === 'boolean' ? isMonotonic : isMonotonic(target));
            writer.start();
            return writer;
        })();
    }
    /** Adds a video track to the output with the given source. Can only be called before the output is started. */
    addVideoTrack(source, metadata = {}) {
        if (!(source instanceof VideoSource)) {
            throw new TypeError('source must be a VideoSource.');
        }
        validateBaseTrackMetadata(metadata);
        if (metadata.rotation !== undefined && ![0, 90, 180, 270].includes(metadata.rotation)) {
            throw new TypeError(`Invalid video rotation: ${metadata.rotation}. Has to be 0, 90, 180 or 270.`);
        }
        if (metadata.flip !== undefined && typeof metadata.flip !== 'boolean') {
            throw new TypeError('metadata.flip, when provided, must be a boolean.');
        }
        if (metadata.transformationMatrix !== undefined
            && (!Array.isArray(metadata.transformationMatrix)
                || metadata.transformationMatrix.length !== 9
                || !metadata.transformationMatrix.every(x => Number.isFinite(x)))) {
            throw new TypeError('metadata.transformationMatrix, when provided, must be an array of 9 finite numbers.');
        }
        if (metadata.frameRate !== undefined
            && (!Number.isFinite(metadata.frameRate) || metadata.frameRate <= 0)) {
            throw new TypeError(`Invalid video frame rate: ${metadata.frameRate}. Must be a positive number.`);
        }
        if (metadata.hasOnlyKeyPackets !== undefined && typeof metadata.hasOnlyKeyPackets !== 'boolean') {
            throw new TypeError('metadata.hasOnlyKeyPackets, when provided, must be a boolean.');
        }
        if (metadata.canBeTransparent !== undefined && typeof metadata.canBeTransparent !== 'boolean') {
            throw new TypeError('metadata.canBeTransparent, when provided, must be a boolean.');
        }
        if (metadata.decoderConfig !== undefined) {
            validateVideoChunkMetadata({ decoderConfig: metadata.decoderConfig }, source._codec);
        }
        if (metadata.primingPacket !== undefined) {
            if (!(metadata.primingPacket instanceof EncodedPacket)) {
                throw new TypeError('metadata.primingPacket, when provided, must be an EncodedPacket.');
            }
            if (metadata.decoderConfig === undefined) {
                throw new TypeError('metadata.primingPacket can only be provided alongside metadata.decoderConfig.');
            }
        }
        const metadataCopy = { ...metadata };
        metadataCopy.group ??= this.defaultTrackGroup;
        return this._addTrack(new OutputVideoTrack(this.tracks.length + 1, this, source, metadataCopy));
    }
    /** Adds an audio track to the output with the given source. Can only be called before the output is started. */
    addAudioTrack(source, metadata = {}) {
        if (!(source instanceof AudioSource)) {
            throw new TypeError('source must be an AudioSource.');
        }
        validateBaseTrackMetadata(metadata);
        if (metadata.decoderConfig !== undefined) {
            validateAudioChunkMetadata({ decoderConfig: metadata.decoderConfig }, source._codec);
        }
        if (metadata.primingPacket !== undefined) {
            if (!(metadata.primingPacket instanceof EncodedPacket)) {
                throw new TypeError('metadata.primingPacket, when provided, must be an EncodedPacket.');
            }
            if (metadata.decoderConfig === undefined) {
                throw new TypeError('metadata.primingPacket can only be provided alongside metadata.decoderConfig.');
            }
        }
        const metadataCopy = { ...metadata };
        metadataCopy.group ??= this.defaultTrackGroup;
        return this._addTrack(new OutputAudioTrack(this.tracks.length + 1, this, source, metadataCopy));
    }
    /** Adds a subtitle track to the output with the given source. Can only be called before the output is started. */
    addSubtitleTrack(source, metadata = {}) {
        if (!(source instanceof SubtitleSource)) {
            throw new TypeError('source must be a SubtitleSource.');
        }
        validateBaseTrackMetadata(metadata);
        const metadataCopy = { ...metadata };
        metadataCopy.group ??= this.defaultTrackGroup;
        return this._addTrack(new OutputSubtitleTrack(this.tracks.length + 1, this, source, metadataCopy));
    }
    /**
     * Sets descriptive metadata tags about the media file, such as title, author, date, or cover art. When called
     * multiple times, only the metadata from the last call will be used.
     *
     * Can only be called before the output is started.
     */
    setMetadataTags(tags) {
        validateMetadataTags(tags);
        if (this.state !== 'pending') {
            throw new Error('Cannot set metadata tags after output has been started or canceled.');
        }
        this._metadataTags = tags;
    }
    /** @internal */
    _addTrack(track) {
        if (this.state !== 'pending') {
            throw new Error('Cannot add track after output has been started or canceled.');
        }
        if (track.source._connectedTrack) {
            throw new Error('Source is already used for a track.');
        }
        // Verify maximum track count constraints
        const supportedTrackCounts = this.format.getSupportedTrackCounts();
        const presentTracksOfThisType = this.tracks.reduce((count, t) => count + (t.type === track.type ? 1 : 0), 0);
        const maxCount = supportedTrackCounts[track.type].max;
        if (presentTracksOfThisType === maxCount) {
            throw new Error(maxCount === 0
                ? `${this.format._name} does not support ${track.type} tracks.`
                : (`${this.format._name} does not support more than ${maxCount} ${track.type} track`
                    + `${maxCount === 1 ? '' : 's'}.`));
        }
        const maxTotalCount = supportedTrackCounts.total.max;
        if (this.tracks.length === maxTotalCount) {
            throw new Error(`${this.format._name} does not support more than ${maxTotalCount} tracks`
                + `${maxTotalCount === 1 ? '' : 's'} in total.`);
        }
        if (track.isVideoTrack()) {
            const supportedVideoCodecs = this.format.getSupportedVideoCodecs();
            if (supportedVideoCodecs.length === 0) {
                throw new Error(`${this.format._name} does not support video tracks.`
                    + this.format._codecUnsupportedHint(track.source._codec));
            }
            else if (!supportedVideoCodecs.includes(track.source._codec)) {
                throw new Error(`Codec '${track.source._codec}' cannot be contained within ${this.format._name}. Supported`
                    + ` video codecs are: ${supportedVideoCodecs.map(codec => `'${codec}'`).join(', ')}.`
                    + this.format._codecUnsupportedHint(track.source._codec));
            }
        }
        else if (track.isAudioTrack()) {
            const supportedAudioCodecs = this.format.getSupportedAudioCodecs();
            if (supportedAudioCodecs.length === 0) {
                throw new Error(`${this.format._name} does not support audio tracks.`
                    + this.format._codecUnsupportedHint(track.source._codec));
            }
            else if (!supportedAudioCodecs.includes(track.source._codec)) {
                throw new Error(`Codec '${track.source._codec}' cannot be contained within ${this.format._name}. Supported`
                    + ` audio codecs are: ${supportedAudioCodecs.map(codec => `'${codec}'`).join(', ')}.`
                    + this.format._codecUnsupportedHint(track.source._codec));
            }
        }
        else if (track.isSubtitleTrack()) {
            const supportedSubtitleCodecs = this.format.getSupportedSubtitleCodecs();
            if (supportedSubtitleCodecs.length === 0) {
                throw new Error(`${this.format._name} does not support subtitle tracks.`
                    + this.format._codecUnsupportedHint(track.source._codec));
            }
            else if (!supportedSubtitleCodecs.includes(track.source._codec)) {
                throw new Error(`Codec '${track.source._codec}' cannot be contained within ${this.format._name}. Supported`
                    + ` subtitle codecs are: ${supportedSubtitleCodecs.map(codec => `'${codec}'`).join(', ')}.`
                    + this.format._codecUnsupportedHint(track.source._codec));
            }
        }
        this.tracks.push(track);
        track.source._connectedTrack = track;
        return track;
    }
    /**
     * Whether the output has enough tracks (of the correct type) to be started, based on the requirements of the output
     * format.
     */
    hasEnoughTracks() {
        const supportedTrackCounts = this.format.getSupportedTrackCounts();
        for (const trackType of ALL_TRACK_TYPES) {
            const presentTracksOfThisType = this.tracks.reduce((count, track) => count + (track.type === trackType ? 1 : 0), 0);
            const minCount = supportedTrackCounts[trackType].min;
            if (presentTracksOfThisType < minCount) {
                return false;
            }
        }
        const totalMinCount = supportedTrackCounts.total.min;
        if (this.tracks.length < totalMinCount) {
            return false;
        }
        return true;
    }
    /**
     * Starts the creation of the output file. This method should be called after all tracks have been added. Only after
     * the output has started can media samples be added to the tracks.
     *
     * @returns A promise that resolves when the output has successfully started and is ready to receive media samples.
     */
    async start() {
        // Verify minimum track count constraints
        const supportedTrackCounts = this.format.getSupportedTrackCounts();
        for (const trackType of ALL_TRACK_TYPES) {
            const presentTracksOfThisType = this.tracks.reduce((count, track) => count + (track.type === trackType ? 1 : 0), 0);
            const minCount = supportedTrackCounts[trackType].min;
            if (presentTracksOfThisType < minCount) {
                throw new Error(minCount === supportedTrackCounts[trackType].max
                    ? (`${this.format._name} requires exactly ${minCount} ${trackType}`
                        + ` track${minCount === 1 ? '' : 's'}.`)
                    : (`${this.format._name} requires at least ${minCount} ${trackType}`
                        + ` track${minCount === 1 ? '' : 's'}.`));
            }
        }
        const totalMinCount = supportedTrackCounts.total.min;
        if (this.tracks.length < totalMinCount) {
            throw new Error(totalMinCount === supportedTrackCounts.total.max
                ? (`${this.format._name} requires exactly ${totalMinCount} track`
                    + `${totalMinCount === 1 ? '' : 's'}.`)
                : (`${this.format._name} requires at least ${totalMinCount} track`
                    + `${totalMinCount === 1 ? '' : 's'}.`));
        }
        if (this.state === 'canceled') {
            throw new Error('Output has been canceled.');
        }
        if (this._startPromise) {
            Logging._warn('Output has already been started.');
            return this._startPromise;
        }
        return this._startPromise = (async () => {
            this.state = 'started';
            // We want to call muxer.start immediately, so we avoid using an await here
            const releasePromise = this._mutex.acquire();
            try {
                await this._muxer.start();
                const promises = this.tracks.map(track => track.source._start());
                await Promise.all(promises);
            }
            finally {
                (await releasePromise)();
            }
        })();
    }
    /**
     * Resolves with the full MIME type of the output file, including track codecs.
     *
     * The returned promise will resolve only once the precise codec strings of all tracks are known.
     */
    getMimeType() {
        return this._muxer.getMimeType();
    }
    /**
     * Cancels the creation of the output file, releasing internal resources like encoders and preventing further
     * samples from being added.
     *
     * @returns A promise that resolves once all internal resources have been released.
     */
    async cancel() {
        if (this.state === 'canceled') {
            return this._cancelPromise ?? undefined;
        }
        else if (this.state === 'finalizing' || this.state === 'finalized') {
            // Don't wanna warn when finalizing since that shows a warning when finalization fails and then cancel
            // is called
            if (this.state === 'finalized') {
                Logging._warn('Output has already been finalized.');
            }
            return;
        }
        return this._cancelPromise = (async () => {
            this.state = 'canceled';
            const release = await this._mutex.acquire();
            try {
                const promises = this.tracks.map(x => x.source._flushOrWaitForOngoingClose(true)); // Force close
                await Promise.all(promises);
                await Promise.all([...this._unfinalizedTargets].map(target => target._close()));
                this._unfinalizedTargets.clear();
            }
            finally {
                release();
            }
        })();
    }
    /**
     * Finalizes the output file. This method must be called after all media samples across all tracks have been added.
     * Once the Promise returned by this method completes, the output file is ready.
     */
    async finalize() {
        if (this.state === 'pending') {
            throw new Error('Cannot finalize before starting.');
        }
        if (this.state === 'canceled') {
            throw new Error('Cannot finalize after canceling.');
        }
        if (this._finalizePromise) {
            Logging._warn('Output has already been finalized.');
            return this._finalizePromise;
        }
        return this._finalizePromise = (async () => {
            this.state = 'finalizing';
            const release = await this._mutex.acquire();
            try {
                const promises = this.tracks.map(x => x.source._flushOrWaitForOngoingClose(false));
                await Promise.all(promises);
                await this._muxer.finalize();
                if (this._rootWriterPromise) {
                    const rootWriter = await this._rootWriterPromise;
                    if (!rootWriter.finalized) {
                        await rootWriter.flush();
                        await rootWriter.finalize();
                    }
                }
                if (this._onFinalize) {
                    await this._onFinalize();
                }
                this.state = 'finalized';
            }
            catch (error) {
                this.state = 'canceled';
                throw error;
            }
            finally {
                await Promise.all([...this._unfinalizedTargets].map(target => target._close().catch(() => { })));
                this._unfinalizedTargets.clear();
                release();
            }
        })();
    }
}

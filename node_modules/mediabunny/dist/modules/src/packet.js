/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { SECOND_TO_MICROSECOND_FACTOR } from './misc.js';
export const PLACEHOLDER_DATA = /* #__PURE__ */ new Uint8Array(0);
/**
 * Represents an encoded chunk of media. Mainly used as an expressive wrapper around WebCodecs API's
 * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) and
 * [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk), but can also be used
 * standalone.
 * @group Packets
 * @public
 */
export class EncodedPacket {
    /** Creates a new {@link EncodedPacket} from raw bytes and timing information. */
    constructor(
    /**
     * The encoded data of this packet. For any given codec, this data must adhere to the format specified in the
     * Mediabunny Codec Registry.
     */
    data, 
    /** The type of this packet. */
    type, 
    /**
     * The presentation timestamp of this packet in seconds. May be negative. Samples with negative end timestamps
     * should not be presented.
     */
    timestamp, 
    /** The duration of this packet in seconds. */
    duration, 
    /**
     * The sequence number indicates the decode order of the packets. Packet A  must be decoded before packet B if A
     * has a lower sequence number than B. If two packets have the same sequence number, they are the same packet.
     * Otherwise, sequence numbers are arbitrary and are not guaranteed to have any meaning besides their relative
     * ordering. Negative sequence numbers mean the sequence number is undefined.
     */
    sequenceNumber = -1, byteLength, sideData) {
        this.data = data;
        this.type = type;
        this.timestamp = timestamp;
        this.duration = duration;
        this.sequenceNumber = sequenceNumber;
        if (data === PLACEHOLDER_DATA && byteLength === undefined) {
            throw new Error('Internal error: byteLength must be explicitly provided when constructing metadata-only packets.');
        }
        if (byteLength === undefined) {
            byteLength = data.byteLength;
        }
        if (!(data instanceof Uint8Array)) {
            throw new TypeError('data must be a Uint8Array.');
        }
        if (type !== 'key' && type !== 'delta') {
            throw new TypeError('type must be either "key" or "delta".');
        }
        if (!Number.isFinite(timestamp)) {
            throw new TypeError('timestamp must be a number.');
        }
        if (!Number.isFinite(duration) || duration < 0) {
            throw new TypeError('duration must be a non-negative number.');
        }
        if (!Number.isFinite(sequenceNumber)) {
            throw new TypeError('sequenceNumber must be a number.');
        }
        if (!Number.isInteger(byteLength) || byteLength < 0) {
            throw new TypeError('byteLength must be a non-negative integer.');
        }
        if (sideData !== undefined && (typeof sideData !== 'object' || !sideData)) {
            throw new TypeError('sideData, when provided, must be an object.');
        }
        if (sideData?.alpha !== undefined && !(sideData.alpha instanceof Uint8Array)) {
            throw new TypeError('sideData.alpha, when provided, must be a Uint8Array.');
        }
        if (sideData?.alphaByteLength !== undefined
            && (!Number.isInteger(sideData.alphaByteLength) || sideData.alphaByteLength < 0)) {
            throw new TypeError('sideData.alphaByteLength, when provided, must be a non-negative integer.');
        }
        this.byteLength = byteLength;
        this.sideData = sideData ?? {};
        if (this.sideData.alpha && this.sideData.alphaByteLength === undefined) {
            this.sideData.alphaByteLength = this.sideData.alpha.byteLength;
        }
    }
    /**
     * If this packet is a metadata-only packet. Metadata-only packets don't contain their packet data. They are the
     * result of retrieving packets with {@link PacketRetrievalOptions.metadataOnly} set to `true`.
     */
    get isMetadataOnly() {
        return this.data === PLACEHOLDER_DATA;
    }
    /** The timestamp of this packet in microseconds. */
    get microsecondTimestamp() {
        return Math.trunc(SECOND_TO_MICROSECOND_FACTOR * this.timestamp);
    }
    /** The duration of this packet in microseconds. */
    get microsecondDuration() {
        return Math.trunc(SECOND_TO_MICROSECOND_FACTOR * this.duration);
    }
    /** Converts this packet to an
     * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) for use with the
     * WebCodecs API. */
    toEncodedVideoChunk() {
        if (this.isMetadataOnly) {
            throw new TypeError('Metadata-only packets cannot be converted to a video chunk.');
        }
        if (typeof EncodedVideoChunk === 'undefined') {
            throw new Error('EncodedVideoChunk is not available in this environment.');
        }
        return new EncodedVideoChunk({
            data: this.data,
            type: this.type,
            timestamp: this.microsecondTimestamp,
            duration: this.microsecondDuration,
        });
    }
    /**
     * Converts this packet to an
     * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) for use with the
     * WebCodecs API, using the alpha side data instead of the color data. Throws if no alpha side data is defined.
     */
    alphaToEncodedVideoChunk(type = this.type) {
        if (!this.sideData.alpha) {
            throw new TypeError('This packet does not contain alpha side data.');
        }
        if (this.isMetadataOnly) {
            throw new TypeError('Metadata-only packets cannot be converted to a video chunk.');
        }
        if (typeof EncodedVideoChunk === 'undefined') {
            throw new Error('EncodedVideoChunk is not available in this environment.');
        }
        return new EncodedVideoChunk({
            data: this.sideData.alpha,
            type,
            timestamp: this.microsecondTimestamp,
            duration: this.microsecondDuration,
        });
    }
    /** Converts this packet to an
     * [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk) for use with the
     * WebCodecs API. */
    toEncodedAudioChunk() {
        if (this.isMetadataOnly) {
            throw new TypeError('Metadata-only packets cannot be converted to an audio chunk.');
        }
        if (typeof EncodedAudioChunk === 'undefined') {
            throw new Error('EncodedAudioChunk is not available in this environment.');
        }
        return new EncodedAudioChunk({
            data: this.data,
            type: this.type,
            timestamp: this.microsecondTimestamp,
            duration: this.microsecondDuration,
        });
    }
    /**
     * Creates an {@link EncodedPacket} from an
     * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) or
     * [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk). This method is useful
     * for converting chunks from the WebCodecs API to `EncodedPacket` instances.
     */
    static fromEncodedChunk(chunk, sideData) {
        if (!(chunk instanceof EncodedVideoChunk || chunk instanceof EncodedAudioChunk)) {
            throw new TypeError('chunk must be an EncodedVideoChunk or EncodedAudioChunk.');
        }
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        return new EncodedPacket(data, chunk.type, chunk.timestamp / 1e6, (chunk.duration ?? 0) / 1e6, undefined, undefined, sideData);
    }
    /** Clones this packet while optionally modifying the new packet's data. */
    clone(options) {
        if (options !== undefined && (typeof options !== 'object' || options === null)) {
            throw new TypeError('options, when provided, must be an object.');
        }
        if (options?.data !== undefined && !(options.data instanceof Uint8Array)) {
            throw new TypeError('options.data, when provided, must be a Uint8Array.');
        }
        if (options?.type !== undefined && options.type !== 'key' && options.type !== 'delta') {
            throw new TypeError('options.type, when provided, must be either "key" or "delta".');
        }
        if (options?.timestamp !== undefined && !Number.isFinite(options.timestamp)) {
            throw new TypeError('options.timestamp, when provided, must be a number.');
        }
        if (options?.duration !== undefined && !Number.isFinite(options.duration)) {
            throw new TypeError('options.duration, when provided, must be a number.');
        }
        if (options?.sequenceNumber !== undefined && !Number.isFinite(options.sequenceNumber)) {
            throw new TypeError('options.sequenceNumber, when provided, must be a number.');
        }
        if (options?.sideData !== undefined && (typeof options.sideData !== 'object' || options.sideData === null)) {
            throw new TypeError('options.sideData, when provided, must be an object.');
        }
        return new EncodedPacket(options?.data ?? this.data, options?.type ?? this.type, options?.timestamp ?? this.timestamp, options?.duration ?? this.duration, options?.sequenceNumber ?? this.sequenceNumber, this.byteLength, options?.sideData ?? this.sideData);
    }
}

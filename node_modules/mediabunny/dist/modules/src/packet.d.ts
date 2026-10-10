/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
export declare const PLACEHOLDER_DATA: Uint8Array<ArrayBuffer>;
/**
 * The type of a packet. Key packets can be decoded without previous packets, while delta packets depend on previous
 * packets.
 * @group Packets
 * @public
 */
export type PacketType = 'key' | 'delta';
/**
 * Holds additional data accompanying an {@link EncodedPacket}.
 * @group Packets
 * @public
 */
export type EncodedPacketSideData = {
    /**
     * An encoded alpha frame, encoded with the same codec as the packet. Typically used for transparent videos, where
     * the alpha information is stored separately from the color information.
     */
    alpha?: Uint8Array;
    /**
     * The actual byte length of the alpha data. This field is useful for metadata-only packets where the
     * `alpha` field contains no bytes.
     */
    alphaByteLength?: number;
};
/**
 * Represents an encoded chunk of media. Mainly used as an expressive wrapper around WebCodecs API's
 * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) and
 * [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk), but can also be used
 * standalone.
 * @group Packets
 * @public
 */
export declare class EncodedPacket {
    /**
     * The encoded data of this packet. For any given codec, this data must adhere to the format specified in the
     * Mediabunny Codec Registry.
     */
    readonly data: Uint8Array;
    /** The type of this packet. */
    readonly type: PacketType;
    /**
     * The presentation timestamp of this packet in seconds. May be negative. Samples with negative end timestamps
     * should not be presented.
     */
    readonly timestamp: number;
    /** The duration of this packet in seconds. */
    readonly duration: number;
    /**
     * The sequence number indicates the decode order of the packets. Packet A  must be decoded before packet B if A
     * has a lower sequence number than B. If two packets have the same sequence number, they are the same packet.
     * Otherwise, sequence numbers are arbitrary and are not guaranteed to have any meaning besides their relative
     * ordering. Negative sequence numbers mean the sequence number is undefined.
     */
    readonly sequenceNumber: number;
    /**
     * The actual byte length of the data in this packet. This field is useful for metadata-only packets where the
     * `data` field contains no bytes.
     */
    readonly byteLength: number;
    /** Additional data carried with this packet. */
    readonly sideData: EncodedPacketSideData;
    /** Creates a new {@link EncodedPacket} from raw bytes and timing information. */
    constructor(
    /**
     * The encoded data of this packet. For any given codec, this data must adhere to the format specified in the
     * Mediabunny Codec Registry.
     */
    data: Uint8Array, 
    /** The type of this packet. */
    type: PacketType, 
    /**
     * The presentation timestamp of this packet in seconds. May be negative. Samples with negative end timestamps
     * should not be presented.
     */
    timestamp: number, 
    /** The duration of this packet in seconds. */
    duration: number, 
    /**
     * The sequence number indicates the decode order of the packets. Packet A  must be decoded before packet B if A
     * has a lower sequence number than B. If two packets have the same sequence number, they are the same packet.
     * Otherwise, sequence numbers are arbitrary and are not guaranteed to have any meaning besides their relative
     * ordering. Negative sequence numbers mean the sequence number is undefined.
     */
    sequenceNumber?: number, byteLength?: number, sideData?: EncodedPacketSideData);
    /**
     * If this packet is a metadata-only packet. Metadata-only packets don't contain their packet data. They are the
     * result of retrieving packets with {@link PacketRetrievalOptions.metadataOnly} set to `true`.
     */
    get isMetadataOnly(): boolean;
    /** The timestamp of this packet in microseconds. */
    get microsecondTimestamp(): number;
    /** The duration of this packet in microseconds. */
    get microsecondDuration(): number;
    /** Converts this packet to an
     * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) for use with the
     * WebCodecs API. */
    toEncodedVideoChunk(): EncodedVideoChunk;
    /**
     * Converts this packet to an
     * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) for use with the
     * WebCodecs API, using the alpha side data instead of the color data. Throws if no alpha side data is defined.
     */
    alphaToEncodedVideoChunk(type?: PacketType): EncodedVideoChunk;
    /** Converts this packet to an
     * [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk) for use with the
     * WebCodecs API. */
    toEncodedAudioChunk(): EncodedAudioChunk;
    /**
     * Creates an {@link EncodedPacket} from an
     * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) or
     * [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk). This method is useful
     * for converting chunks from the WebCodecs API to `EncodedPacket` instances.
     */
    static fromEncodedChunk(chunk: EncodedVideoChunk | EncodedAudioChunk, sideData?: EncodedPacketSideData): EncodedPacket;
    /** Clones this packet while optionally modifying the new packet's data. */
    clone(options?: {
        /** The data of the cloned packet. */
        data?: Uint8Array;
        /** The type of the cloned packet. */
        type?: PacketType;
        /** The timestamp of the cloned packet in seconds. */
        timestamp?: number;
        /** The duration of the cloned packet in seconds. */
        duration?: number;
        /** The sequence number of the cloned packet. */
        sequenceNumber?: number;
        /** The side data of the cloned packet. */
        sideData?: EncodedPacketSideData;
    }): EncodedPacket;
}
//# sourceMappingURL=packet.d.ts.map
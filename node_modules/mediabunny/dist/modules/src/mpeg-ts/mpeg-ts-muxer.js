/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { buildAdtsHeaderTemplate, parseAacAudioSpecificConfig, writeAdtsFrameLength } from '../../shared/aac-misc.js';
import { validateAudioChunkMetadata, validateVideoChunkMetadata } from '../codec.js';
import { AC3_REGISTRATION_DESCRIPTOR, AvcNalUnitType, concatNalUnitsInAnnexB, deserializeAvcDecoderConfigurationRecord, deserializeHevcDecoderConfigurationRecord, EAC3_REGISTRATION_DESCRIPTOR, extractNalUnitTypeForAvc, extractNalUnitTypeForHevc, HevcNalUnitType, iterateNalUnitsInAnnexB, iterateNalUnitsInLengthPrefixed, } from '../codec-data.js';
import { Bitstream } from '../../shared/bitstream.js';
import { assert, modEuclid, promiseWithResolvers, setUint24, toDataView, toUint8Array } from '../misc.js';
import { Muxer } from '../muxer.js';
import { buildMpegTsMimeType, TIMESCALE, TIMESTAMP_MODULUS, TS_PACKET_SIZE, } from './mpeg-ts-misc.js';
// Resources:
// ISO/IEC 13818-1
const PAT_PID = 0x0000;
const PMT_PID = 0x1000;
const FIRST_TRACK_PID = 0x0100;
const VIDEO_STREAM_ID_BASE = 0xE0;
const AUDIO_STREAM_ID_BASE = 0xC0;
const AVC_AUD_NAL = new Uint8Array([0x09, 0xF0]);
const HEVC_AUD_NAL = new Uint8Array([0x46, 0x01]);
export class MpegTsMuxer extends Muxer {
    constructor(output, format) {
        super(output);
        this.trackDatas = [];
        this.tablesWritten = false;
        this.continuityCounters = new Map();
        this.packetBuffer = new Uint8Array(TS_PACKET_SIZE);
        this.packetView = toDataView(this.packetBuffer);
        this.allTracksKnown = promiseWithResolvers();
        this.videoTrackIndex = 0;
        this.audioTrackIndex = 0;
        this.adaptationFieldBuffer = new Uint8Array(184);
        this.payloadBuffer = new Uint8Array(184);
        this.format = format;
    }
    async start() {
        const release = await this.mutex.acquire();
        this.writer = await this.output._getRootWriter(true);
        release();
    }
    async getMimeType() {
        await this.allTracksKnown.promise;
        return buildMpegTsMimeType(this.trackDatas.map(x => x.codecString));
    }
    getVideoTrackData(track, meta) {
        const existingTrackData = this.trackDatas.find(x => x.track === track);
        if (existingTrackData) {
            return existingTrackData;
        }
        validateVideoChunkMetadata(meta, track.source._codec);
        assert(meta?.decoderConfig);
        const codec = track.source._codec;
        assert(codec === 'avc' || codec === 'hevc');
        const streamType = codec === 'avc'
            ? 27 /* MpegTsStreamType.AVC */
            : 36 /* MpegTsStreamType.HEVC */;
        const pid = FIRST_TRACK_PID + this.trackDatas.length;
        const streamId = VIDEO_STREAM_ID_BASE + this.videoTrackIndex++;
        const newTrackData = {
            track,
            pid,
            streamType,
            streamId,
            codecString: meta.decoderConfig.codec,
            timestampProcessingQueue: [],
            packetQueue: [],
            inputIsAnnexB: null,
            inputIsAdts: null,
            avcDecoderConfig: null,
            hevcDecoderConfig: null,
            adtsHeader: null,
            adtsHeaderBitstream: null,
            firstPacketWritten: false,
            closed: false,
        };
        this.trackDatas.push(newTrackData);
        if (this.allTracksAreKnown()) {
            this.allTracksKnown.resolve();
        }
        return newTrackData;
    }
    getAudioTrackData(track, meta) {
        const existingTrackData = this.trackDatas.find(x => x.track === track);
        if (existingTrackData) {
            return existingTrackData;
        }
        validateAudioChunkMetadata(meta, track.source._codec);
        assert(meta?.decoderConfig);
        const codec = track.source._codec;
        assert(codec === 'aac' || codec === 'mp3' || codec === 'ac3' || codec === 'eac3' || codec === 'dts');
        let streamType;
        let streamId;
        switch (codec) {
            case 'aac':
                {
                    streamType = 15 /* MpegTsStreamType.AAC */;
                    streamId = AUDIO_STREAM_ID_BASE + this.audioTrackIndex++;
                }
                ;
                break;
            case 'mp3':
                {
                    streamType = 3 /* MpegTsStreamType.MP3_MPEG1 */;
                    streamId = AUDIO_STREAM_ID_BASE + this.audioTrackIndex++;
                }
                ;
                break;
            case 'ac3':
                {
                    streamType = 129 /* MpegTsStreamType.AC3_SYSTEM_A */;
                    streamId = 0xbd;
                }
                ;
                break;
            case 'eac3':
                {
                    streamType = 135 /* MpegTsStreamType.EAC3_SYSTEM_A */;
                    streamId = 0xbd;
                }
                ;
                break;
            case 'dts':
                {
                    streamType = 130 /* MpegTsStreamType.DTS */;
                    streamId = 0xbd;
                }
                ;
                break;
        }
        const pid = FIRST_TRACK_PID + this.trackDatas.length;
        const newTrackData = {
            track,
            pid,
            streamType,
            streamId,
            codecString: meta.decoderConfig.codec,
            timestampProcessingQueue: [],
            packetQueue: [],
            inputIsAnnexB: null,
            inputIsAdts: null,
            avcDecoderConfig: null,
            hevcDecoderConfig: null,
            adtsHeader: null,
            adtsHeaderBitstream: null,
            firstPacketWritten: false,
            closed: false,
        };
        this.trackDatas.push(newTrackData);
        if (this.allTracksAreKnown()) {
            this.allTracksKnown.resolve();
        }
        return newTrackData;
    }
    async addEncodedVideoPacket(track, packet, meta) {
        const release = await this.mutex.acquire();
        try {
            const trackData = this.getVideoTrackData(track, meta);
            this.validateTimestamp(trackData.track, packet.timestamp, packet.type === 'key');
            const preparedData = this.prepareVideoPacket(trackData, packet, meta);
            if (packet.type === 'key') {
                await this.flushTimestampQueue(trackData);
            }
            trackData.timestampProcessingQueue.push({
                data: preparedData,
                presentationTimestamp: packet.timestamp,
                decodeTimestamp: null,
                isKeyframe: packet.type === 'key',
            });
        }
        finally {
            release();
        }
    }
    async addEncodedAudioPacket(track, packet, meta) {
        const release = await this.mutex.acquire();
        try {
            const trackData = this.getAudioTrackData(track, meta);
            this.validateTimestamp(trackData.track, packet.timestamp, packet.type === 'key');
            const preparedData = this.prepareAudioPacket(trackData, packet, meta);
            if (packet.type === 'key') {
                await this.flushTimestampQueue(trackData);
            }
            trackData.timestampProcessingQueue.push({
                data: preparedData,
                presentationTimestamp: packet.timestamp,
                decodeTimestamp: null,
                isKeyframe: packet.type === 'key',
            });
        }
        finally {
            release();
        }
    }
    async addSubtitleCue() {
        throw new Error('MPEG-TS does not support subtitles.');
    }
    prepareVideoPacket(trackData, packet, meta) {
        const codec = trackData.track.source._codec;
        if (trackData.inputIsAnnexB === null) {
            // This is the first packet
            const description = meta?.decoderConfig?.description;
            trackData.inputIsAnnexB = !description;
            if (!trackData.inputIsAnnexB) {
                const bytes = toUint8Array(description);
                if (codec === 'avc') {
                    trackData.avcDecoderConfig = deserializeAvcDecoderConfigurationRecord(bytes);
                }
                else {
                    trackData.hevcDecoderConfig = deserializeHevcDecoderConfigurationRecord(bytes);
                }
            }
        }
        if (trackData.inputIsAnnexB) {
            return this.prepareAnnexBVideoPacket(packet.data, codec);
        }
        else {
            return this.prepareLengthPrefixedVideoPacket(trackData, packet, codec);
        }
    }
    prepareAnnexBVideoPacket(data, codec) {
        const nalUnits = [];
        for (const loc of iterateNalUnitsInAnnexB(data)) {
            const nalUnit = data.subarray(loc.offset, loc.offset + loc.length);
            const isAud = codec === 'avc'
                ? extractNalUnitTypeForAvc(nalUnit[0]) === AvcNalUnitType.AUD
                : extractNalUnitTypeForHevc(nalUnit[0]) === HevcNalUnitType.AUD_NUT;
            if (!isAud) {
                nalUnits.push(nalUnit);
            }
        }
        // Pretend the AUD
        const aud = codec === 'avc'
            ? AVC_AUD_NAL
            : HEVC_AUD_NAL;
        nalUnits.unshift(aud);
        return concatNalUnitsInAnnexB(nalUnits);
    }
    prepareLengthPrefixedVideoPacket(trackData, packet, codec) {
        const data = packet.data;
        const lengthSize = codec === 'avc'
            ? (trackData.avcDecoderConfig.lengthSizeMinusOne + 1)
            : (trackData.hevcDecoderConfig.lengthSizeMinusOne + 1);
        const nalUnits = [];
        for (const loc of iterateNalUnitsInLengthPrefixed(data, lengthSize)) {
            const nalUnit = data.subarray(loc.offset, loc.offset + loc.length);
            const isAud = codec === 'avc'
                ? extractNalUnitTypeForAvc(nalUnit[0]) === AvcNalUnitType.AUD
                : extractNalUnitTypeForHevc(nalUnit[0]) === HevcNalUnitType.AUD_NUT;
            if (!isAud) {
                nalUnits.push(nalUnit);
            }
        }
        if (packet.type === 'key') {
            // Add whichever NALUs are missing
            if (codec === 'avc') {
                const config = trackData.avcDecoderConfig;
                for (const pps of config.pictureParameterSets) {
                    nalUnits.unshift(pps);
                }
                for (const sps of config.sequenceParameterSets) {
                    nalUnits.unshift(sps);
                }
            }
            else {
                const config = trackData.hevcDecoderConfig;
                for (const arr of config.arrays) {
                    if (arr.nalUnitType === HevcNalUnitType.PPS_NUT) {
                        for (const nal of arr.nalUnits) {
                            nalUnits.unshift(nal);
                        }
                    }
                }
                for (const arr of config.arrays) {
                    if (arr.nalUnitType === HevcNalUnitType.SPS_NUT) {
                        for (const nal of arr.nalUnits) {
                            nalUnits.unshift(nal);
                        }
                    }
                }
                for (const arr of config.arrays) {
                    if (arr.nalUnitType === HevcNalUnitType.VPS_NUT) {
                        for (const nal of arr.nalUnits) {
                            nalUnits.unshift(nal);
                        }
                    }
                }
            }
        }
        // Prepend the AUD
        const aud = codec === 'avc'
            ? AVC_AUD_NAL
            : HEVC_AUD_NAL;
        nalUnits.unshift(aud);
        return concatNalUnitsInAnnexB(nalUnits);
    }
    prepareAudioPacket(trackData, packet, meta) {
        const codec = trackData.track.source._codec;
        if (codec === 'mp3' || codec === 'ac3' || codec === 'eac3' || codec === 'dts') {
            // We're good
            return packet.data;
        }
        if (trackData.inputIsAdts === null) {
            // It's the first packet
            const description = meta?.decoderConfig?.description;
            trackData.inputIsAdts = !description;
            if (!trackData.inputIsAdts) {
                const config = parseAacAudioSpecificConfig(toUint8Array(description));
                const template = buildAdtsHeaderTemplate(config);
                trackData.adtsHeader = template.header;
                trackData.adtsHeaderBitstream = template.bitstream;
            }
        }
        if (trackData.inputIsAdts) {
            return packet.data;
        }
        assert(trackData.adtsHeader);
        assert(trackData.adtsHeaderBitstream);
        const header = trackData.adtsHeader;
        const frameLength = packet.data.byteLength + header.byteLength;
        writeAdtsFrameLength(trackData.adtsHeaderBitstream, frameLength);
        const result = new Uint8Array(frameLength);
        result.set(header, 0);
        result.set(packet.data, header.byteLength);
        return result;
    }
    allTracksAreKnown() {
        for (const track of this.output.tracks) {
            if (!track.source._closed && !this.trackDatas.some(x => x.track === track)) {
                return false;
            }
        }
        return true;
    }
    async flushTimestampQueue(trackData, alsoInterleave = true) {
        if (trackData.timestampProcessingQueue.length === 0) {
            return;
        }
        const sortedTimestamps = trackData.timestampProcessingQueue
            .map(packet => packet.presentationTimestamp)
            .sort((a, b) => a - b);
        for (let i = 0; i < trackData.timestampProcessingQueue.length; i++) {
            const queuedPacket = trackData.timestampProcessingQueue[i];
            queuedPacket.decodeTimestamp = sortedTimestamps[i];
            trackData.packetQueue.push(queuedPacket);
        }
        trackData.timestampProcessingQueue.length = 0;
        if (alsoInterleave) {
            await this.interleavePackets();
        }
    }
    async interleavePackets(isFinalCall = false) {
        if (!this.tablesWritten) {
            if (!this.allTracksAreKnown() && !isFinalCall) {
                return;
            }
            this.writeTables();
        }
        outer: while (true) {
            let trackWithMinTimestamp = null;
            let minTimestamp = Infinity;
            for (const trackData of this.trackDatas) {
                if (!isFinalCall
                    && trackData.packetQueue.length === 0
                    && !trackData.closed) {
                    break outer;
                }
                if (trackData.packetQueue.length > 0
                    && trackData.packetQueue[0].presentationTimestamp < minTimestamp) {
                    trackWithMinTimestamp = trackData;
                    minTimestamp = trackData.packetQueue[0].presentationTimestamp;
                }
            }
            if (!trackWithMinTimestamp) {
                break;
            }
            const queuedPacket = trackWithMinTimestamp.packetQueue.shift();
            this.writePesPacket(trackWithMinTimestamp, queuedPacket);
        }
        if (!isFinalCall) {
            await this.writer.flush();
        }
    }
    writeTables() {
        assert(!this.tablesWritten);
        this.writePsiSection(PAT_PID, PAT_SECTION);
        this.writePsiSection(PMT_PID, buildPmt(this.trackDatas));
        this.tablesWritten = true;
    }
    writePsiSection(pid, section) {
        let offset = 0;
        let isFirst = true;
        // Long PSI sections might span more than one TS packet
        while (offset < section.length) {
            const pointerFieldSize = isFirst ? 1 : 0;
            const availablePayload = 184 - pointerFieldSize;
            const remainingData = section.length - offset;
            const chunkSize = Math.min(availablePayload, remainingData);
            let payload;
            if (isFirst) {
                payload = this.payloadBuffer.subarray(0, 1 + chunkSize);
                payload[0] = 0x00; // pointer_field
                payload.set(section.subarray(offset, offset + chunkSize), 1);
            }
            else {
                payload = section.subarray(offset, offset + chunkSize);
            }
            this.writeTsPacket(pid, isFirst, null, payload);
            offset += chunkSize;
            isFirst = false;
        }
    }
    writePesPacket(trackData, queuedPacket) {
        const includeDts = trackData.track.type === 'video';
        const headerDataLength = includeDts ? 10 : 5;
        const pesHeaderBuffer = new Uint8Array(9 + headerDataLength);
        const pesView = toDataView(pesHeaderBuffer);
        const ptsDtsBitstream = new Bitstream(pesHeaderBuffer.subarray(9));
        setUint24(pesView, 0, 0x000001, false); // packet_start_code_prefix
        pesHeaderBuffer[3] = trackData.streamId; // stream_id
        const pesPacketLength = trackData.track.type === 'video'
            ? 0 // Unbounded
            : Math.min(8 + queuedPacket.data.length, 0xFFFF); // Required for audio for some reason
        pesView.setUint16(4, pesPacketLength, false);
        // '10' marker, PES_scrambling_control=0, PES_priority=0,
        // data_alignment_indicator=1, copyright=0, original_or_copy=0
        pesView.setUint8(6, 0x84);
        pesView.setUint8(7, includeDts ? 0xC0 : 0x80); // PTS_DTS_flags, other flags=0
        pesView.setUint8(8, headerDataLength); // PES_header_data_length
        // This logic supports writing negative timestamps by simplying Euclid-modding them. It is then up to the
        // demuxer to interpret them as negative, if it wasnts to.
        const unwrappedPts = Math.round(queuedPacket.presentationTimestamp * TIMESCALE);
        const pts = modEuclid(unwrappedPts, TIMESTAMP_MODULUS);
        ptsDtsBitstream.pos = 0;
        ptsDtsBitstream.writeBits(4, includeDts ? 0b0011 : 0b0010); // marker
        ptsDtsBitstream.writeBits(3, Math.floor(pts / 2 ** 30)); // PTS[32:30]
        ptsDtsBitstream.writeBits(1, 1); // marker_bit
        ptsDtsBitstream.writeBits(15, Math.floor(pts / 2 ** 15) % 2 ** 15); // PTS[29:15]
        ptsDtsBitstream.writeBits(1, 1); // marker_bit
        ptsDtsBitstream.writeBits(15, pts % 2 ** 15); // PTS[14:0]
        ptsDtsBitstream.writeBits(1, 1); // marker_bit
        if (includeDts) {
            assert(queuedPacket.decodeTimestamp !== null);
            const unwrappedDts = Math.round(queuedPacket.decodeTimestamp * TIMESCALE);
            const dts = modEuclid(unwrappedDts, TIMESTAMP_MODULUS);
            ptsDtsBitstream.writeBits(4, 0b0001);
            ptsDtsBitstream.writeBits(3, Math.floor(dts / 2 ** 30)); // DTS[32:30]
            ptsDtsBitstream.writeBits(1, 1); // marker_bit
            ptsDtsBitstream.writeBits(15, Math.floor(dts / 2 ** 15) % 2 ** 15); // DTS[29:15]
            ptsDtsBitstream.writeBits(1, 1); // marker_bit
            ptsDtsBitstream.writeBits(15, dts % 2 ** 15); // DTS[14:0]
            ptsDtsBitstream.writeBits(1, 1); // marker_bit
        }
        const totalLength = pesHeaderBuffer.length + queuedPacket.data.length;
        let offset = 0;
        let isFirstTsPacket = true;
        while (offset < totalLength) {
            const pusi = isFirstTsPacket;
            const remainingData = totalLength - offset;
            const randomAccessIndicator = isFirstTsPacket && queuedPacket.isKeyframe;
            const discontinuityIndicator = isFirstTsPacket && !trackData.firstPacketWritten;
            const basePaddingNeeded = Math.max(0, 184 - remainingData);
            let adaptationFieldSize;
            if (randomAccessIndicator || discontinuityIndicator) {
                // We need at least two bytes
                adaptationFieldSize = Math.max(2, basePaddingNeeded);
            }
            else {
                adaptationFieldSize = basePaddingNeeded;
            }
            let adaptationField = null;
            if (adaptationFieldSize > 0) {
                const buf = this.adaptationFieldBuffer;
                if (adaptationFieldSize === 1) {
                    buf[0] = 0; // adaptation_field_length
                }
                else {
                    buf[0] = adaptationFieldSize - 1; // adaptation_field_length
                    buf[1]
                        = (Number(discontinuityIndicator) << 7) // discontinuity_indicator
                            | (Number(randomAccessIndicator) << 6); // random_access_indicator
                    buf.fill(0xFF, 2, adaptationFieldSize); // stuffing_bytes
                }
                adaptationField = buf.subarray(0, adaptationFieldSize);
            }
            const payloadSize = Math.min(184 - adaptationFieldSize, remainingData);
            const payload = this.payloadBuffer.subarray(0, payloadSize);
            let payloadOffset = 0;
            if (offset < pesHeaderBuffer.length) {
                const headerBytes = Math.min(pesHeaderBuffer.length - offset, payloadSize);
                payload.set(pesHeaderBuffer.subarray(offset, offset + headerBytes), 0);
                payloadOffset = headerBytes;
            }
            const dataStart = Math.max(0, offset - pesHeaderBuffer.length);
            const dataEnd = dataStart + (payloadSize - payloadOffset);
            if (payloadOffset < payloadSize) {
                payload.set(queuedPacket.data.subarray(dataStart, dataEnd), payloadOffset);
            }
            this.writeTsPacket(trackData.pid, pusi, adaptationField, payload);
            offset += payloadSize;
            isFirstTsPacket = false;
        }
        trackData.firstPacketWritten = true;
    }
    writeTsPacket(pid, pusi, adaptationField, payload) {
        const cc = this.continuityCounters.get(pid) ?? 0;
        const hasPayload = payload.length > 0;
        const adaptCtrl = adaptationField
            ? (hasPayload ? 0b11 : 0b10)
            : (hasPayload ? 0b01 : 0b00);
        this.packetBuffer[0] = 0x47; // sync_byte
        this.packetView.setUint16(1, (pusi ? 0x4000 : 0) | (pid & 0x1FFF), false); // TEI=0, PUSI, priority=0, PID
        // scrambling=0, adaptation_field_control, continuity_counter
        this.packetBuffer[3] = (adaptCtrl << 4) | (cc & 0x0F);
        if (hasPayload) {
            this.continuityCounters.set(pid, (cc + 1) & 0x0F);
        }
        let offset = 4;
        if (adaptationField) {
            this.packetBuffer.set(adaptationField, offset);
            offset += adaptationField.length;
        }
        this.packetBuffer.set(payload, offset);
        offset += payload.length;
        if (offset < TS_PACKET_SIZE) {
            this.packetBuffer.fill(0xFF, offset); // stuffing_bytes
        }
        const startPos = this.writer.getPos();
        this.writer.write(this.packetBuffer);
        if (this.format._options.onPacket) {
            this.format._options.onPacket(this.packetBuffer.slice(), startPos);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async onTrackClose(track) {
        const release = await this.mutex.acquire();
        const trackData = this.trackDatas.find(x => x.track === track);
        if (trackData) {
            trackData.closed = true;
            await this.flushTimestampQueue(trackData, false);
        }
        if (this.allTracksAreKnown()) {
            this.allTracksKnown.resolve();
        }
        await this.interleavePackets();
        release();
    }
    async finalize() {
        const release = await this.mutex.acquire();
        this.allTracksKnown.resolve();
        for (const trackData of this.trackDatas) {
            trackData.closed = true;
            await this.flushTimestampQueue(trackData, false);
        }
        await this.interleavePackets(true);
        release();
    }
}
// CRC-32 for MPEG-TS (polynomial 0x04C11DB7, initial value 0xFFFFFFFF)
const MPEG_TS_CRC_POLYNOMIAL = 0x04c11db7;
const MPEG_TS_CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
    let crc = n << 24;
    for (let k = 0; k < 8; k++) {
        crc = (crc & 0x80000000)
            ? ((crc << 1) ^ MPEG_TS_CRC_POLYNOMIAL)
            : (crc << 1);
    }
    MPEG_TS_CRC_TABLE[n] = (crc >>> 0) & 0xffffffff;
}
const computeMpegTsCrc32 = (data) => {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
        const byte = data[i];
        crc = ((crc << 8) ^ MPEG_TS_CRC_TABLE[(crc >>> 24) ^ byte]) >>> 0;
    }
    return crc;
};
const PAT_SECTION = new Uint8Array(16);
{
    const view = toDataView(PAT_SECTION);
    PAT_SECTION[0] = 0x00; // table_id
    view.setUint16(1, 0xB00D, false); // section_syntax_indicator=1, '0', reserved=11, section_length=13
    view.setUint16(3, 0x0001, false); // transport_stream_id
    PAT_SECTION[5] = 0xC1; // reserved=11, version_number=0, current_next_indicator=1
    PAT_SECTION[6] = 0x00; // section_number
    PAT_SECTION[7] = 0x00; // last_section_number
    view.setUint16(8, 0x0001, false); // program_number
    view.setUint16(10, 0xE000 | (PMT_PID & 0x1FFF), false); // reserved=111, program_map_PID
    view.setUint32(12, computeMpegTsCrc32(PAT_SECTION.subarray(0, 12)), false); // CRC_32
}
const buildPmt = (trackDatas) => {
    let totalEsBytes = 0;
    for (const trackData of trackDatas) {
        totalEsBytes += 5;
        if (trackData.streamType === 129 /* MpegTsStreamType.AC3_SYSTEM_A */) {
            totalEsBytes += AC3_REGISTRATION_DESCRIPTOR.length;
        }
        else if (trackData.streamType === 135 /* MpegTsStreamType.EAC3_SYSTEM_A */) {
            totalEsBytes += EAC3_REGISTRATION_DESCRIPTOR.length;
        }
    }
    const sectionLength = 9 + totalEsBytes + 4;
    const section = new Uint8Array(3 + sectionLength - 4);
    const view = toDataView(section);
    section[0] = 0x02; // table_id
    // section_syntax_indicator=1, '0', reserved=11, section_length
    view.setUint16(1, 0xB000 | (sectionLength & 0x0FFF), false);
    view.setUint16(3, 0x0001, false); // program_number
    section[5] = 0xC1; // reserved=11, version_number=0, current_next_indicator=1
    section[6] = 0x00; // section_number
    section[7] = 0x00; // last_section_number
    view.setUint16(8, 0xE000 | 0x1FFF, false); // reserved=111, PCR_PID=0x1FFF (none)
    view.setUint16(10, 0xF000, false); // reserved=1111, program_info_length=0
    let offset = 12;
    for (const trackData of trackDatas) {
        section[offset++] = trackData.streamType; // stream_type
        view.setUint16(offset, 0xE000 | (trackData.pid & 0x1FFF), false); // reserved=111, elementary_PID
        offset += 2;
        if (trackData.streamType === 129 /* MpegTsStreamType.AC3_SYSTEM_A */) {
            view.setUint16(offset, 0xF000 | AC3_REGISTRATION_DESCRIPTOR.length, false);
            offset += 2;
            section.set(AC3_REGISTRATION_DESCRIPTOR, offset);
            offset += AC3_REGISTRATION_DESCRIPTOR.length;
        }
        else if (trackData.streamType === 135 /* MpegTsStreamType.EAC3_SYSTEM_A */) {
            view.setUint16(offset, 0xF000 | EAC3_REGISTRATION_DESCRIPTOR.length, false);
            offset += 2;
            section.set(EAC3_REGISTRATION_DESCRIPTOR, offset);
            offset += EAC3_REGISTRATION_DESCRIPTOR.length;
        }
        else {
            view.setUint16(offset, 0xF000, false); // reserved=1111, ES_info_length=0
            offset += 2;
        }
    }
    const crc = computeMpegTsCrc32(section);
    const result = new Uint8Array(section.length + 4);
    result.set(section, 0);
    toDataView(result).setUint32(section.length, crc, false); // CRC_32
    return result;
};

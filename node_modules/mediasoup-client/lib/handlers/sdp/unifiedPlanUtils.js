"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRtpEncodings = getRtpEncodings;
exports.addLegacySimulcast = addLegacySimulcast;
function getRtpEncodings({ offerMediaObject, }) {
    const ssrcs = new Set();
    for (const line of offerMediaObject.ssrcs ?? []) {
        const ssrc = line.id;
        if (ssrc) {
            ssrcs.add(ssrc);
        }
    }
    if (ssrcs.size === 0) {
        throw new Error('no a=ssrc lines found');
    }
    const ssrcToRtxSsrc = new Map();
    // First assume RTX is used.
    for (const line of offerMediaObject.ssrcGroups ?? []) {
        if (line.semantics !== 'FID') {
            continue;
        }
        const ssrcsStr = line.ssrcs.split(/\s+/);
        const ssrc = Number(ssrcsStr[0]);
        const rtxSsrc = Number(ssrcsStr[1]);
        if (ssrcs.has(ssrc)) {
            // Remove both the SSRC and RTX SSRC from the set so later we know
            // that they are already handled.
            ssrcs.delete(ssrc);
            ssrcs.delete(rtxSsrc);
            // Add to the map.
            ssrcToRtxSsrc.set(ssrc, rtxSsrc);
        }
    }
    // If the set of SSRCs is not empty it means that RTX is not being used, so
    // take media SSRCs from there.
    for (const ssrc of ssrcs) {
        // Add to the map.
        ssrcToRtxSsrc.set(ssrc, undefined);
    }
    const encodings = [];
    for (const [ssrc, rtxSsrc] of ssrcToRtxSsrc) {
        const encoding = { ssrc };
        if (rtxSsrc) {
            encoding.rtx = { ssrc: rtxSsrc };
        }
        encodings.push(encoding);
    }
    return encodings;
}
/**
 * Adds multi-ssrc based simulcast into the given SDP media section offer.
 */
function addLegacySimulcast({ offerMediaObject, numStreams, }) {
    if (numStreams <= 1) {
        throw new TypeError('numStreams must be greater than 1');
    }
    // Get the SSRC.
    const ssrcMsidLine = (offerMediaObject.ssrcs ?? []).find(line => line.attribute === 'msid');
    if (!ssrcMsidLine) {
        throw new Error('a=ssrc line with msid information not found');
    }
    const [streamId, trackId] = ssrcMsidLine.value.split(' ');
    const firstSsrc = Number(ssrcMsidLine.id);
    let firstRtxSsrc;
    // Get the SSRC for RTX.
    (offerMediaObject.ssrcGroups ?? []).some(line => {
        if (line.semantics !== 'FID') {
            return false;
        }
        const ssrcs = line.ssrcs.split(/\s+/);
        if (Number(ssrcs[0]) === firstSsrc) {
            firstRtxSsrc = Number(ssrcs[1]);
            return true;
        }
        else {
            return false;
        }
    });
    const ssrcCnameLine = (offerMediaObject.ssrcs ?? []).find(line => line.attribute === 'cname');
    if (!ssrcCnameLine) {
        throw new Error('a=ssrc line with cname information not found');
    }
    const cname = ssrcCnameLine.value;
    const ssrcs = [];
    const rtxSsrcs = [];
    for (let i = 0; i < numStreams; ++i) {
        ssrcs.push(firstSsrc + i);
        if (firstRtxSsrc) {
            rtxSsrcs.push(firstRtxSsrc + i);
        }
    }
    offerMediaObject.ssrcGroups = [];
    offerMediaObject.ssrcs = [];
    offerMediaObject.ssrcGroups.push({
        semantics: 'SIM',
        ssrcs: ssrcs.join(' '),
    });
    for (const ssrc of ssrcs) {
        offerMediaObject.ssrcs.push({
            id: ssrc,
            attribute: 'cname',
            value: cname,
        });
        offerMediaObject.ssrcs.push({
            id: ssrc,
            attribute: 'msid',
            value: `${streamId} ${trackId}`,
        });
    }
    for (let i = 0; i < rtxSsrcs.length; ++i) {
        const ssrc = ssrcs[i];
        const rtxSsrc = rtxSsrcs[i];
        offerMediaObject.ssrcs.push({
            id: rtxSsrc,
            attribute: 'cname',
            value: cname,
        });
        offerMediaObject.ssrcs.push({
            id: rtxSsrc,
            attribute: 'msid',
            value: `${streamId} ${trackId}`,
        });
        offerMediaObject.ssrcGroups.push({
            semantics: 'FID',
            ssrcs: `${ssrc} ${rtxSsrc}`,
        });
    }
}

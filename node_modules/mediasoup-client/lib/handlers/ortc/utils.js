"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNackSupportForOpus = addNackSupportForOpus;
/**
 * This function adds RTCP NACK support for OPUS codec in given capabilities.
 */
function addNackSupportForOpus(rtpCapabilities) {
    for (const codec of rtpCapabilities.codecs ?? []) {
        if ((codec.mimeType.toLowerCase() === 'audio/opus' ||
            codec.mimeType.toLowerCase() === 'audio/multiopus') &&
            !codec.rtcpFeedback?.some(fb => fb.type === 'nack' && !fb.parameter)) {
            if (!codec.rtcpFeedback) {
                codec.rtcpFeedback = [];
            }
            codec.rtcpFeedback.push({ type: 'nack' });
        }
    }
}

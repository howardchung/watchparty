import RTCCertificate from './RTCCertificate.js';
import RTCDataChannel from './RTCDataChannel.js';
import RTCDtlsTransport from './RTCDtlsTransport.js';
import RTCIceCandidate from './RTCIceCandidate.js';
import RTCIceTransport from './RTCIceTransport.js';
import RTCPeerConnection from './RTCPeerConnection.js';
import RTCSctpTransport from './RTCSctpTransport.js';
import RTCSessionDescription from './RTCSessionDescription.js';
import { RTCDataChannelEvent, RTCPeerConnectionIceEvent } from './Events.js';

export {
    RTCCertificate,
    RTCDataChannel,
    RTCDtlsTransport,
    RTCIceCandidate,
    RTCIceTransport,
    RTCPeerConnection,
    RTCSctpTransport,
    RTCSessionDescription,
    RTCDataChannelEvent,
    RTCPeerConnectionIceEvent,
};

declare const _default: {
    RTCCertificate: typeof RTCCertificate;
    RTCDataChannel: typeof RTCDataChannel;
    RTCDtlsTransport: typeof RTCDtlsTransport;
    RTCIceCandidate: typeof RTCIceCandidate;
    RTCIceTransport: typeof RTCIceTransport;
    RTCPeerConnection: typeof RTCPeerConnection;
    RTCSctpTransport: typeof RTCSctpTransport;
    RTCSessionDescription: typeof RTCSessionDescription;
    RTCDataChannelEvent: typeof RTCDataChannelEvent;
    RTCPeerConnectionIceEvent: typeof RTCPeerConnectionIceEvent;
};

export default _default;

import nodeDataChannel from './node-datachannel.js';
import DataChannelStream from './datachannel-stream.js';
import WebSocketServer from './websocket-server.js';

const {
    initLogger,
    cleanup,
    preload,
    setSctpSettings,
    RtcpReceivingSession,
    Track,
    Video,
    Audio,
    DataChannel,
    PeerConnection,
    WebSocket,
} = nodeDataChannel;

export const DescriptionType = {
    Unspec: 'unspec',
    Offer: 'offer',
    Answer: 'answer',
    Pranswer: 'pranswer',
    Rollback: 'rollback',
};

export {
    initLogger,
    cleanup,
    preload,
    setSctpSettings,
    RtcpReceivingSession,
    Track,
    Video,
    Audio,
    DataChannel,
    PeerConnection,
    WebSocket,
    WebSocketServer,
    // Extra exports
    DataChannelStream,
};

export default {
    initLogger,
    cleanup,
    preload,
    setSctpSettings,
    RtcpReceivingSession,
    Track,
    Video,
    Audio,
    DataChannel,
    PeerConnection,
    WebSocket,
    WebSocketServer,
    DataChannelStream,
};

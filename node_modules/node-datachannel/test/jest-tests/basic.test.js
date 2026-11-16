import * as nodeDataChannel from '../../lib';

describe('Module Definition', () => {
    test('Module Defined', () => {
        expect(nodeDataChannel).toBeDefined();
        expect(nodeDataChannel.initLogger).toBeDefined();
        expect(nodeDataChannel.PeerConnection).toBeDefined();
        expect(typeof nodeDataChannel.PeerConnection).toBe('function');
        expect(nodeDataChannel.DataChannel).toBeDefined();
        expect(typeof nodeDataChannel.DataChannel).toBe('function');
    });
});

describe('PeerConnection Classes', () => {
    test('Create PeerConnection', () => {
        let peer = new nodeDataChannel.PeerConnection('Peer', { iceServers: ['stun:stun.l.google.com:19302'] });
        expect(peer).toBeDefined();
        expect(peer.onStateChange).toBeDefined();
        expect(peer.createDataChannel).toBeDefined();

        peer.close();
    });

    test('Create Data Channel', () => {
        let peer = new nodeDataChannel.PeerConnection('Peer', { iceServers: ['stun:stun.l.google.com:19302'] });
        let dc = peer.createDataChannel('test', { protocol: 'test-protocol' });
        expect(dc).toBeDefined();
        expect(dc.getId()).toBeDefined();
        expect(dc.getProtocol()).toBe('test-protocol');
        expect(dc.getLabel()).toBe('test');
        expect(dc.onOpen).toBeDefined();
        expect(dc.onMessage).toBeDefined();

        dc.close();
        peer.close();
    });
});

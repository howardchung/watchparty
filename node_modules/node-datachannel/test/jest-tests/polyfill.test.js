import { expect } from '@jest/globals';
import polyfill from '../../polyfill/index.js';

describe('polyfill', () => {
    test('generateCertificate should throw', () => {
        expect(async () => {
            await polyfill.RTCPeerConnection.generateCertificate({});
        }).rejects.toEqual(new DOMException('Not implemented'));
    });
});

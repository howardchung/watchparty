
> wpt-tests@1.0.0 run:test
> node index.js

# Running tests for Chrome...
Running test: /webrtc/getstats.html  
Running test: /webrtc/historical.html  
Running test: /webrtc/no-media-call.html  
Running test: /webrtc/promises-call.html  
Running test: /webrtc/receiver-track-live.https.html  
Running test: /webrtc/recvonly-transceiver-can-become-sendrecv.https.html  
Running test: /webrtc/RollbackEvents.https.html  
Running test: /webrtc/RTCCertificate.html  
Running test: /webrtc/RTCConfiguration-bundlePolicy.html  
Running test: /webrtc/RTCConfiguration-iceCandidatePoolSize.html  
Running test: /webrtc/RTCConfiguration-iceServers.html  
Running test: /webrtc/RTCConfiguration-iceTransportPolicy.html  
Running test: /webrtc/RTCConfiguration-rtcpMuxPolicy.html  
Running test: /webrtc/RTCConfiguration-validation.html  
Running test: /webrtc/RTCDataChannel-bufferedAmount.html  
Running test: /webrtc/RTCDataChannelEvent-constructor.html  
Running test: /webrtc/RTCDataChannel-iceRestart.html  
Running test: /webrtc/RTCDataChannel-id.html  
Running test: /webrtc/RTCDataChannel-send-blob-order.html  
Running test: /webrtc/RTCDtlsTransport-getRemoteCertificates.html  
Running test: /webrtc/RTCDtlsTransport-state.html  
Running test: /webrtc/RTCDTMFSender-insertDTMF.https.html  
Running test: /webrtc/RTCDTMFSender-ontonechange.https.html  
Running test: /webrtc/RTCDTMFSender-ontonechange-long.https.html  
Running test: /webrtc/RTCError.html  
Running test: /webrtc/RTCIceCandidate-constructor.html  
Running test: /webrtc/RTCIceConnectionState-candidate-pair.https.html  
Running test: /webrtc/RTCIceTransport.html  
Running test: /webrtc/RTCPeerConnection-addIceCandidate.html  
Running test: /webrtc/RTCPeerConnection-addTcpIceCandidate.html  

# Running tests for node-datachannel...
Running test: /webrtc/getstats.html  
Running test: /webrtc/historical.html  
Running test: /webrtc/no-media-call.html  
Running test: /webrtc/promises-call.html  
Running test: /webrtc/receiver-track-live.https.html  
Running test: /webrtc/recvonly-transceiver-can-become-sendrecv.https.html  
Running test: /webrtc/RollbackEvents.https.html  
Running test: /webrtc/RTCCertificate.html  
Running test: /webrtc/RTCConfiguration-bundlePolicy.html  
Running test: /webrtc/RTCConfiguration-iceCandidatePoolSize.html  
Running test: /webrtc/RTCConfiguration-iceServers.html  
Running test: /webrtc/RTCConfiguration-iceTransportPolicy.html  
Running test: /webrtc/RTCConfiguration-rtcpMuxPolicy.html  
Running test: /webrtc/RTCConfiguration-validation.html  
Running test: /webrtc/RTCDataChannel-bufferedAmount.html  
Running test: /webrtc/RTCDataChannelEvent-constructor.html  
Running test: /webrtc/RTCDataChannel-iceRestart.html  
Running test: /webrtc/RTCDataChannel-id.html  
Running test: /webrtc/RTCDataChannel-send-blob-order.html  
Running test: /webrtc/RTCDtlsTransport-getRemoteCertificates.html  
Running test: /webrtc/RTCDtlsTransport-state.html  
Running test: /webrtc/RTCDTMFSender-insertDTMF.https.html  
Running test: /webrtc/RTCDTMFSender-ontonechange.https.html  
Running test: /webrtc/RTCDTMFSender-ontonechange-long.https.html  
Running test: /webrtc/RTCError.html  
Running test: /webrtc/RTCIceCandidate-constructor.html  
Running test: /webrtc/RTCIceConnectionState-candidate-pair.https.html  
Running test: /webrtc/RTCIceTransport.html  
Running test: /webrtc/RTCPeerConnection-addIceCandidate.html  
Running test: /webrtc/RTCPeerConnection-addTcpIceCandidate.html  

# Tests Report
Total Tests [Chrome]:  398   
Total Tests [Library]:  398  (We expect this to be equal to Total Tests [Chrome])  
Passed Tests:  269   
Failed Tests (Chrome + Library):  41  (We don't care about these tests)  
Failed Tests:  88    

## Failed Tests
### /webrtc/historical.html
- name: RTCRtpTransceiver member setDirection should not exist  
  message: RTCRtpTransceiver is not defined  
### /webrtc/recvonly-transceiver-can-become-sendrecv.https.html
- name: [audio] recvonly transceiver can become sendrecv  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: [video] recvonly transceiver can become sendrecv  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
### /webrtc/RTCCertificate.html
- name: Constructing RTCPeerConnection with expired certificate should reject with InvalidAccessError  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: Calling setConfiguration with different set of certs should reject with InvalidModificationError  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: RTCCertificate should have at least one fingerprint  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: RTCPeerConnection({ certificates }) should generate offer SDP with fingerprint of provided certificate  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
### /webrtc/RTCConfiguration-bundlePolicy.html
- name: Default bundlePolicy should be balanced  
  message: assert_equals: expected (string) "balanced" but got (undefined) undefined  
- name: new RTCPeerConnection({ bundlePolicy: undefined }) should have bundlePolicy balanced  
  message: assert_equals: expected (string) "balanced" but got (undefined) undefined  
- name: new RTCPeerConnection({ bundlePolicy: null }) should throw TypeError  
  message: assert_throws_js: function "() =>
      new RTCPeerConnection({ bundlePolicy: null })" did not throw  
- name: new RTCPeerConnection({ bundlePolicy: 'invalid' }) should throw TypeError  
  message: assert_throws_js: function "() =>
      new RTCPeerConnection({ bundlePolicy: 'invalid' })" did not throw  
- name: setConfiguration({ bundlePolicy: 'max-compat' }) with initial bundlePolicy max-bundle should throw InvalidModificationError  
  message: assert_throws_dom: function "() =>
      pc.setConfiguration({ bundlePolicy: 'max-compat' })" did not throw  
- name: setConfiguration({}) with initial bundlePolicy max-bundle should throw InvalidModificationError  
  message: assert_throws_dom: function "() =>
      pc.setConfiguration({})" did not throw  
### /webrtc/RTCConfiguration-iceCandidatePoolSize.html
- name: Initialize a new RTCPeerConnection with no iceCandidatePoolSize  
  message: assert_equals: expected (number) 0 but got (undefined) undefined  
- name: Initialize a new RTCPeerConnection with iceCandidatePoolSize: -1 (Out Of Range)  
  message: assert_throws_js: function "() => {
    new RTCPeerConnection({
      iceCandidatePoolSize: -1
    });
  }" did not throw  
- name: Initialize a new RTCPeerConnection with iceCandidatePoolSize: 256 (Out Of Range)  
  message: assert_throws_js: function "() => {
    new RTCPeerConnection({
      iceCandidatePoolSize: 256
    });
  }" did not throw  
- name: Reconfigure RTCPeerConnection instance iceCandidatePoolSize to -1 (Out Of Range)  
  message: assert_throws_js: function "() => {
    pc.setConfiguration({
      iceCandidatePoolSize: -1
    });
  }" did not throw  
- name: Reconfigure RTCPeerConnection instance iceCandidatePoolSize to 256 (Out Of Range)  
  message: assert_throws_js: function "() => {
    pc.setConfiguration({
      iceCandidatePoolSize: 256
    });
  }" did not throw  
### /webrtc/RTCConfiguration-iceTransportPolicy.html
- name: new RTCPeerConnection(config) - with null iceTransportPolicy should throw TypeError  
  message: assert_throws_js: function "() =>
      makePc({ iceTransportPolicy: null })" threw object "SyntaxError: Invalid ICE transport policy, expected string" ("SyntaxError") expected instance of function "function TypeError() { [native code] }" ("TypeError")  
- name: setConfiguration(config) - with null iceTransportPolicy should throw TypeError  
  message: assert_throws_js: function "() =>
      makePc({ iceTransportPolicy: null })" did not throw  
- name: iceTransportPolicy "relay" on offerer should prevent candidate gathering  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: iceTransportPolicy "relay" on answerer should prevent candidate gathering  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: Changing iceTransportPolicy from "all" to "relay" causes an ICE restart which should fail, with no new candidates  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: Changing iceTransportPolicy from "relay" to "all" causes an ICE restart which should succeed  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: Changing iceTransportPolicy from "all" to "relay", and back to "all" prompts an ICE restart  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: Changing iceTransportPolicy from "all" to "relay" on the answerer has no effect on a subsequent offer/answer  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
### /webrtc/RTCConfiguration-rtcpMuxPolicy.html
- name: new RTCPeerConnection() should have default rtcpMuxPolicy require  
  message: assert_equals: expected (string) "require" but got (undefined) undefined  
- name: new RTCPeerConnection({ rtcpMuxPolicy: undefined }) should have default rtcpMuxPolicy require  
  message: assert_equals: expected (string) "require" but got (undefined) undefined  
- name: new RTCPeerConnection(config) - with { rtcpMuxPolicy: null } should throw TypeError  
  message: assert_throws_js: function "() =>
      makePc({ rtcpMuxPolicy: null })" did not throw  
- name: setConfiguration(config) - with { rtcpMuxPolicy: null } should throw TypeError  
  message: assert_throws_js: function "() =>
      makePc({ rtcpMuxPolicy: null })" did not throw  
- name: new RTCPeerConnection(config) - with { rtcpMuxPolicy: 'invalid' } should throw TypeError  
  message: assert_throws_js: function "() =>
      makePc({ rtcpMuxPolicy: 'invalid' })" did not throw  
- name: setConfiguration(config) - with { rtcpMuxPolicy: 'invalid' } should throw TypeError  
  message: assert_throws_js: function "() =>
      makePc({ rtcpMuxPolicy: 'invalid' })" did not throw  
- name: setConfiguration({ rtcpMuxPolicy: 'negotiate' }) with initial rtcpMuxPolicy require should throw InvalidModificationError  
  message: assert_throws_dom: function "() =>
      pc.setConfiguration({ rtcpMuxPolicy: 'negotiate' })" did not throw  
- name: setConfiguration({ rtcpMuxPolicy: 'require' }) with initial rtcpMuxPolicy negotiate should throw InvalidModificationError  
  message: assert_throws_dom: function "() =>
      pc.setConfiguration({ rtcpMuxPolicy: 'require' })" did not throw  
- name: setConfiguration({}) with initial rtcpMuxPolicy require should leave rtcpMuxPolicy to require  
  message: assert_equals: expected (string) "require" but got (undefined) undefined  
- name: setConfiguration({}) with initial rtcpMuxPolicy negotiate should throw InvalidModificationError  
  message: assert_throws_dom: function "() =>
      pc.setConfiguration({})" did not throw  
- name: setRemoteDescription throws InvalidAccessError when called with an offer without rtcp-mux and rtcpMuxPolicy is set to require  
  message: assert_unreached: Should have rejected: undefined Reached unreachable code  
### /webrtc/RTCDataChannel-bufferedAmount.html
- name: datachannel bufferedAmount should increase to byte length of encodedunicode string sent  
  message: assert_equals: Expect bufferedAmount to be the byte length of the unicode string expected 12 but got 0  
- name: datachannel bufferedAmount should increase to byte length of buffer sent  
  message: assert_equals: Expect bufferedAmount to increase to byte length of sent buffer expected 5 but got 0  
- name: datachannel bufferedAmount should not decrease immediately after initiating closure  
  message: assert_equals: Expect bufferedAmount to increase to byte length of sent buffer expected 5 but got 0  
- name: datachannel bufferedAmount should not decrease after closing the peer connection  
  message: assert_equals: Expect bufferedAmount to increase to byte length of sent buffer expected 5 but got 0  
### /webrtc/RTCDataChannel-iceRestart.html
- name: Data channel remains usable after ICE restart  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: Data channel remains usable at each step of an ICE restart  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
### /webrtc/RTCDataChannel-id.html
- name: DTLS client uses odd data channel IDs  
  message: promise_test: Unhandled rejection with value: object "Error: libdatachannel error while adding remote description: Got the local description as remote description"  
- name: DTLS server uses even data channel IDs  
  message: promise_test: Unhandled rejection with value: object "Error: libdatachannel error while adding remote description: Got the local description as remote description"  
- name: In-band negotiation with a specific ID should not work  
  message: assert_equals: expected (object) null but got (number) 42  
- name: Odd/even role should not be violated when mixing with negotiated channels  
  message: assert_equals: Channel id must be null before DTLS role has been determined expected (object) null but got (number) 65535  
### /webrtc/RTCDtlsTransport-getRemoteCertificates.html
- name: RTCDtlsTransport.prototype.getRemoteCertificates  
  message: AudioContext is not defined  
### /webrtc/RTCDtlsTransport-state.html
- name: DTLS transport goes to connected state  
  message: promise_test: Unhandled rejection with value: object "ReferenceError: AudioContext is not defined"  
- name: close() causes the other end's DTLS transport to close  
  message: promise_test: Unhandled rejection with value: object "ReferenceError: AudioContext is not defined"  
- name: stop bundled transceiver retains dtls transport state  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
### /webrtc/RTCDTMFSender-insertDTMF.https.html
- name: insertDTMF() should succeed if tones contains valid DTMF characters  
  message: promise_test: Unhandled rejection with value: object "TypeError: Cannot read properties of undefined (reading 'getUserMedia')"  
- name: insertDTMF() should throw InvalidCharacterError if tones contains invalid DTMF characters  
  message: promise_test: Unhandled rejection with value: object "TypeError: Cannot read properties of undefined (reading 'getUserMedia')"  
- name: insertDTMF() should throw InvalidStateError if transceiver is stopped  
  message: Not implemented  
- name: insertDTMF() should throw InvalidStateError if transceiver.currentDirection is recvonly  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: insertDTMF() should throw InvalidStateError if transceiver.currentDirection is inactive  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: insertDTMF() should set toneBuffer to provided tones normalized, with old tones overridden  
  message: promise_test: Unhandled rejection with value: object "TypeError: Cannot read properties of undefined (reading 'getUserMedia')"  
- name: insertDTMF() after remove and close should reject  
  message: promise_test: Unhandled rejection with value: object "TypeError: Cannot read properties of undefined (reading 'getUserMedia')"  
### /webrtc/RTCDTMFSender-ontonechange.https.html
- name: insertDTMF() with default duration and intertoneGap should fire tonechange events at the expected time  
  message: promise_test: Unhandled rejection with value: object "TypeError: Cannot read properties of undefined (reading 'getUserMedia')"  
- name: insertDTMF() with explicit duration and intertoneGap should fire tonechange events at the expected time  
  message: promise_test: Unhandled rejection with value: object "TypeError: Cannot read properties of undefined (reading 'getUserMedia')"  
- name: insertDTMF('') should not fire any tonechange event, including for '' tone  
  message: assert_unreached: Unexpected promise rejection: TypeError: Cannot read properties of undefined (reading 'getUserMedia') Reached unreachable code  
- name: insertDTMF() with duration less than 40 should be clamped to 40  
  message: promise_test: Unhandled rejection with value: object "TypeError: Cannot read properties of undefined (reading 'getUserMedia')"  
- name: insertDTMF() with interToneGap less than 30 should be clamped to 30  
  message: promise_test: Unhandled rejection with value: object "TypeError: Cannot read properties of undefined (reading 'getUserMedia')"  
- name: insertDTMF with comma should delay next tonechange event for a constant 2000ms  
  message: promise_test: Unhandled rejection with value: object "TypeError: Cannot read properties of undefined (reading 'getUserMedia')"  
- name: insertDTMF() with transceiver stopped in the middle should stop future tonechange events from firing  
  message: promise_test: Unhandled rejection with value: object "TypeError: Cannot read properties of undefined (reading 'getUserMedia')"  
- name: Calling insertDTMF() in the middle of tonechange events should cause future tonechanges to be updated to new tones  
  message: promise_test: Unhandled rejection with value: object "TypeError: Cannot read properties of undefined (reading 'getUserMedia')"  
- name: Calling insertDTMF() multiple times in the middle of tonechange events should cause future tonechanges to be updated the last provided tones  
  message: promise_test: Unhandled rejection with value: object "TypeError: Cannot read properties of undefined (reading 'getUserMedia')"  
- name: Calling insertDTMF('') in the middle of tonechange events should stop future tonechange events from firing  
  message: promise_test: Unhandled rejection with value: object "TypeError: Cannot read properties of undefined (reading 'getUserMedia')"  
- name: Setting transceiver.currentDirection to recvonly in the middle of tonechange events should stop future tonechange events from firing  
  message: promise_test: Unhandled rejection with value: object "TypeError: Cannot read properties of undefined (reading 'getUserMedia')"  
- name: Tone change event constructor works  
  message: RTCDTMFToneChangeEvent is not defined  
- name: Tone change event with unexpected name should not crash  
  message: RTCDTMFToneChangeEvent is not defined  
### /webrtc/RTCDTMFSender-ontonechange-long.https.html
- name: insertDTMF with duration greater than 6000 should be clamped to 6000  
  message: promise_test: Unhandled rejection with value: object "TypeError: Cannot read properties of undefined (reading 'getUserMedia')"  
### /webrtc/RTCIceConnectionState-candidate-pair.https.html
- name: On ICE connected, getStats() contains a connected candidate-pair  
  message: promise_test: Unhandled rejection with value: object "TypeError: Cannot read properties of undefined (reading 'getUserMedia')"  
### /webrtc/RTCIceTransport.html
- name: RTCIceTransport should be in state "new" initially  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: RTCIceTransport should not transition to "checking" until after the answer is set _and_ the first remote candidate is received  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: RTCIceTransport should transition to "disconnected" if packets stop flowing  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: RTCIceTransport should transition to "disconnected" if packets stop flowing (DataChannel case)  
  message: assert_equals: expected "checking" but got "connected"  
- name: Local ICE restart should not result in a different ICE transport  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: Local ICE restart should not result in a different ICE transport (DataChannel case)  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: Remote ICE restart should not result in a different ICE transport  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: Remote ICE restart should not result in a different ICE transport (DataChannel case)  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: RTCIceTransport should transition to "closed" if the underlying transport is closed because the answer used bundle  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: RTCIceTransport should synchronously transition to "closed" with no event if the underlying transport is closed due to PC.close()  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
### /webrtc/RTCPeerConnection-addIceCandidate.html
- name: addIceCandidate with second sdpMid and sdpMLineIndex should add candidate to second media stream  
  message: assert_true: Expect candidate line to be found after media line m=video expected true got false  
- name: Adding multiple candidates should add candidates to their corresponding media stream  
  message: assert_true: Expect candidate line to be found after media line m=video expected true got false  
- name: Add candidate for media stream 2 with null usernameFragment should succeed  
  message: assert_true: Expect candidate line to be found after media line m=video expected true got false  
### /webrtc/RTCPeerConnection-addTcpIceCandidate.html
- name: TCP candidate aimed at port 8001 accepted  
  message: promise_test: Unhandled rejection with value: undefined  
- name: TCP addIceCandidate aimed at port 8001 accepted  
  message: promise_test: Unhandled rejection with value: object "OperationError: Invalid sdpMid format"  
End of tests

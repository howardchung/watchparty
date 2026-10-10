# WebRTC Polyfills

WebRTC polyfills to be used for libraries like `simple-peer`.

# web-platform-tests

Please check actual situation [here](/test/wpt-tests/)

## Example Usage

> For a native usage example please check test folder.

`simple-peer` usage example

```js
import Peer from 'simple-peer';
import nodeDatachannelPolyfill from 'node-datachannel/polyfill';

var peer1 = new Peer({ initiator: true, wrtc: nodeDatachannelPolyfill });
var peer2 = new Peer({ wrtc: nodeDatachannelPolyfill });

peer1.on('signal', (data) => {
    // when peer1 has signaling data, give it to peer2 somehow
    peer2.signal(data);
});

peer2.on('signal', (data) => {
    // when peer2 has signaling data, give it to peer1 somehow
    peer1.signal(data);
});

peer1.on('connect', () => {
    // wait for 'connect' event before using the data channel
    peer1.send('hey peer2, how is it going?');
});

peer2.on('data', (data) => {
    // got a data channel message
    console.log('got a message from peer1: ' + data);
});
```

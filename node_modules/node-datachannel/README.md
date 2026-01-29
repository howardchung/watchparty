# WebRTC For Node.js and Electron ( with WebSocket)

![Linux CI Build](https://github.com/murat-dogan/node-datachannel/workflows/Build%20-%20Linux/badge.svg) ![Windows CI Build](https://github.com/murat-dogan/node-datachannel/workflows/Build%20-%20Win/badge.svg) ![Mac x64 CI Build](https://github.com/murat-dogan/node-datachannel/workflows/Build%20-%20Mac%20x64/badge.svg) ![Mac M1 CI Build](https://github.com/murat-dogan/node-datachannel/workflows/Build%20-%20Mac%20M1/badge.svg)

-   Lightweight
    -   No need to deal with WebRTC stack!
    -   Small binary sizes (~8MB for Linux x64)
-   Type infos for Typescript
-   Integrated WebSocket Client & Server Implementation

This project is Node.js bindings for [libdatachannel](https://github.com/paullouisageneau/libdatachannel) library.

## Install

```sh
npm install node-datachannel
```

## Supported Platforms

`node-datachannel` targets N-API version 8 and supports Node.js v16 and above. It is tested on Linux, Windows and MacOS. For N-API compatibility please check [here](https://nodejs.org/api/n-api.html#n_api_n_api_version_matrix).

|                           | Linux [x64,armv7,arm64] (1) | Windows [x86,x64] | Mac [M1,x64] |
| ------------------------- | :-------------------------: | :---------------: | :----------: |
| N-API v8 (>= Node.js v16) |              +              |         +         |      +       |

**(1)** For Linux musl + libc

## Electron

`node-datachannel` supports Electron.

Please check [electron demo](/examples/electron-demo)

## WebRTC Polyfills

WebRTC polyfills to be used for libraries like `simple-peer`.

Please check [here for more](/polyfill)

### web-platform-tests

Please check actual situation [here](/test/wpt-tests/)

## WebSocket Client & Server

Integrated WebSocket Client & Server is available, which can be used separately or for signaling.

For an example usage, [check here](/examples/websocket)

## Example Usage

```js
import nodeDataChannel from 'node-datachannel';

// Log Level
nodeDataChannel.initLogger('Debug');

// Integrated WebSocket available and can be used for signaling etc
// const ws = new nodeDataChannel.WebSocket();

let dc1 = null;
let dc2 = null;

let peer1 = new nodeDataChannel.PeerConnection('Peer1', { iceServers: ['stun:stun.l.google.com:19302'] });

peer1.onLocalDescription((sdp, type) => {
    peer2.setRemoteDescription(sdp, type);
});
peer1.onLocalCandidate((candidate, mid) => {
    peer2.addRemoteCandidate(candidate, mid);
});

let peer2 = new nodeDataChannel.PeerConnection('Peer2', { iceServers: ['stun:stun.l.google.com:19302'] });

peer2.onLocalDescription((sdp, type) => {
    peer1.setRemoteDescription(sdp, type);
});
peer2.onLocalCandidate((candidate, mid) => {
    peer1.addRemoteCandidate(candidate, mid);
});
peer2.onDataChannel((dc) => {
    dc2 = dc;
    dc2.onMessage((msg) => {
        console.log('Peer2 Received Msg:', msg);
    });
    dc2.sendMessage('Hello From Peer2');
});

dc1 = peer1.createDataChannel('test');

dc1.onOpen(() => {
    dc1.sendMessage('Hello from Peer1');
});

dc1.onMessage((msg) => {
    console.log('Peer1 Received Msg:', msg);
});
```

## Examples

Please check [examples](/examples/) folder

## Test

```sh
npm run test                  # Unit tests
node test/connectivity.js     # Connectivity
```

## Build

Please check [here](/BULDING.md)

## API Docs

Please check [docs](/API.md) page

## Contributing

Contributions are welcome!

## Thanks

Thanks to [Streamr](https://streamr.network/) for supporting this project by being a Sponsor!

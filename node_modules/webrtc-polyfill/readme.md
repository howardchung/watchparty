<h1 align="center">
  <img height="120px" src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img height="120px" src="https://webrtc.github.io/webrtc-org/assets/images/webrtc-logo-vert-retro-dist.svg" />
</h1>

webrtc-polyfill is a Node.js Native Addon that provides bindings to [libdatachannel](https://github.com/paullouisageneau/libdatachannel). This project aims for spec-compliance and is tested using the W3C's [web-platform-tests](https://github.com/web-platform-tests/wpt) project, but doesn't pass all of its tests, instead focuses on the important ones, like close, error and data events, states, while offering performance better than any alternative. A number of [nonstandard APIs](docs/nonstandard-apis.md) for testing are also included.

Notably most of the core WebRTC functionality is async in contrast to how web handles it. Notable examples are:
```js
datachannel.send(new Blob([new Uint8Array([1,2,3,4])]))
datachannel.send(new Uint8Array([1,2,3,4])) // this will arrive before the blob, as blob internals are asynchronous
```
and
```js
datachannel.send(new Uint8Array([1,2,3,4]))
datachannel.bufferedAmount // not always 4, as the thread that runs it is async and might flush instantly!
```

Install
-------

```
pnpm install webrtc-polyfill
```
Supported Platforms
-------------------

For supported platforms see the [node-channel bindings compatibility table](https://github.com/murat-dogan/node-datachannel/#supported-platforms). Note that node versions under 14 require a global EventTarget and Event polyfill.

Testing
-------
Requirements: Python, Node.js

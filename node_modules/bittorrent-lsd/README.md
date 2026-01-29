# bittorrent-lsd [![ci][ci-image]][ci-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[ci-image]: https://github.com/webtorrent/bittorrent-lsd/actions/workflows/ci.yml/badge.svg?branch=master
[ci-url]: https://github.com/webtorrent/bittorrent-lsd/actions/workflows/ci.yml
[npm-image]: https://img.shields.io/npm/v/bittorrent-lsd.svg
[npm-url]: https://npmjs.org/package/bittorrent-lsd
[downloads-image]: https://img.shields.io/npm/dm/bittorrent-lsd.svg
[downloads-url]: https://npmjs.org/package/bittorrent-lsd
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

### Local Service Discovery (BEP14) implementation.

Local Service Discovery (LSD) provides a SSDP-like (http over udp-multicast) mechanism to announce the presence in specific swarms to local neighbors.

This module is used by [WebTorrent](http://webtorrent.io).

## install

```
npm install bittorrent-lsd
```

## example

```
const opts = {
  peerId: new Buffer('01234567890123456789'), // hex string or Buffer
  infoHash: new Buffer('01234567890123456789'), // hex string or Buffer
  port: common.randomPort() // torrent client port
}

const lsd = new LSD(opts)

// start getting peers from local network
lsd.start()

lsd.on('peer', (peerAddress, infoHash) => {
  console.log('found a peer: ' + peerAddress)
})

lsd.destroy()
```

## api

### `lsd = new LSD([opts])`
Create a new `lsd` instance.

### `lsd.start()`
Start listening and sending (every 5 minutes) for local network announces.

### `lsd.destroy([callback])`
Destroy the LSD. Closes the socket and cleans up resources.

## events

### `lsd.on('peer', (peerAddress, infoHash) => { ... })`
Emitted when a potential peer is found. `peerAddress` is of the form `host:port`. `infoHash` is the torrent info hash.

### `lsd.on('warning', (err) => { ... })`
Emitted when the LSD gets an unexpected message.

### `lsd.on('error', (err) => { ... })`
Emitted when the LSD has a fatal error.

## license

MIT. Copyright (c) [Julen Garcia Leunda](https://github.com/hicom150) and [WebTorrent, LLC](https://webtorrent.io).

# ut_metadata [![ci][ci-image]][ci-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[ci-image]: https://github.com/webtorrent/ut_metadata/actions/workflows/ci.yml/badge.svg?branch=master
[ci-url]: https://github.com/webtorrent/ut_metadata/actions/workflows/ci.yml
[npm-image]: https://img.shields.io/npm/v/ut_metadata.svg
[npm-url]: https://npmjs.org/package/ut_metadata
[downloads-image]: https://img.shields.io/npm/dm/ut_metadata.svg
[downloads-url]: https://npmjs.org/package/ut_metadata
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

### BitTorrent Extension for Peers to Send Metadata Files (BEP 9)

JavaScript implementation of the [Extension for Peers to Send Metadata Files (BEP 9)](http://www.bittorrent.org/beps/bep_0009.html). Use with [bittorrent-protocol](https://www.npmjs.com/package/bittorrent-protocol).

The purpose of this extension is to allow clients to join a swarm and complete a download without the need of downloading a .torrent file first. This extension instead allows clients to download the metadata from peers. It makes it possible to support magnet links, a link on a web page only containing enough information to join the swarm (the info hash).

Works in the browser with [browserify](http://browserify.org/)! This module is used by [WebTorrent](http://webtorrent.io).

### install

```
npm install ut_metadata
```

### usage

This package should be used with [bittorrent-protocol](https://www.npmjs.com/package/bittorrent-protocol), which supports a plugin-like system for extending the protocol with additional functionality.

Say you're already using `bittorrent-protocol`. Your code might look something like this:

```js
import Protocol from 'bittorrent-protocol'
import net from 'net'

net.createServer(socket => {
  var wire = new Protocol()
  socket.pipe(wire).pipe(socket)

  // handle handshake
  wire.on('handshake', (infoHash, peerId) => {
    wire.handshake(new Buffer('my info hash'), new Buffer('my peer id'))
  })

}).listen(6881)
```

To add support for BEP 9, simply modify your code like this:

```js
import Protocol from 'bittorrent-protocol'
import net from 'net'
import ut_metadata from 'ut_metadata'

net.createServer(socket => {
  const wire = new Protocol()
  socket.pipe(wire).pipe(socket)

  // initialize the extension
  wire.use(ut_metadata())

  // all `ut_metadata` functionality can now be accessed at wire.ut_metadata

  // ask the peer to send us metadata
  wire.ut_metadata.fetch()

  // 'metadata' event will fire when the metadata arrives and is verified to be correct!
  wire.ut_metadata.on('metadata', metadata => {
    // got metadata!

    // Note: the event will not fire if the peer does not support ut_metadata, if they
    // don't have metadata yet either, if they repeatedly send invalid data, or if they
    // simply don't respond.
  })

  // optionally, listen to the 'warning' event if you want to know that metadata is
  // probably not going to arrive for one of the above reasons.
  wire.ut_metadata.on('warning', err => {
    console.log(err.message)
  })

  // handle handshake
  wire.on('handshake', (infoHash, peerId) => {
    wire.handshake(new Buffer('my info hash'), new Buffer('my peer id'))
  })

}).listen(6881)
```

### api

#### `ut_metadata([metadata])`

Initialize the extension. If you have the torrent metadata (Buffer), pass it into the
`ut_metadata` constructor so it's made available to the peer.

```js
const metadata = fs.readFileSync(__dirname + '/file.torrent')
wire.use(ut_metadata(metadata))
```

#### `ut_metadata.fetch()`

Ask the peer to send metadata.

#### `ut_metadata.cancel()`

Stop asking the peer to send metadata.

#### `ut_metadata.setMetadata(metadata)`

Set the metadata. If you didn't have the metadata at the time `ut_metadata` was
initialized, but you end up getting it from another peer (or somewhere else), you should
call `setMetadata` so the metadata will be available to the peer.

#### `ut_metadata.on('metadata', function (metadata) {})`

Fired when metadata is available and verified to be correct. Called with a single
parameter of type Buffer.

```js
wire.ut_metadata.on('metadata', metadata => {
  console.log(Buffer.isBuffer(metadata)) // true
})
```

Note: the event will not fire if the peer does not support ut_metadata, if they
don't have metadata yet either, if they repeatedly send invalid data, or if they
simply don't respond.

#### `ut_metadata.on('warning', function (err) {})`

Fired if:
 - the peer does not support ut_metadata
 - the peer doesn't have metadata yet
 - the peer repeatedly sent invalid data

```js
wire.ut_metadata.on('warning', err => {
  console.log(err.message)
})
```

### license

MIT. Copyright (c) [Feross Aboukhadijeh](https://feross.org) and [WebTorrent, LLC](https://webtorrent.io).

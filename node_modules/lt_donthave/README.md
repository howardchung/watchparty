# lt_donthave [![ci][ci-image]][ci-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[ci-image]: https://github.com/webtorrent/lt_donthave/actions/workflows/ci.yml/badge.svg?branch=master
[ci-url]: https://github.com/webtorrent/lt_donthave/actions
[npm-image]: https://img.shields.io/npm/v/lt_donthave.svg
[npm-url]: https://npmjs.org/package/lt_donthave
[downloads-image]: https://img.shields.io/npm/dm/lt_donthave.svg
[downloads-url]: https://npmjs.org/package/lt_donthave
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

### The BitTorrent lt_donthave extension (BEP 54)

JavaScript implementation of the [The BitTorrent lt_donthave extension (BEP 54)](https://www.bittorrent.org/beps/bep_0054.html). Use with [bittorrent-protocol](https://www.npmjs.com/package/bittorrent-protocol).

The purpose of this extension is to allow peers to indicate that they no longer have a piece. It provides a single `donthave` message that means the opposite of the standard `have` message. In addition, when a client receives `donthave`, it knows that all requests for the matching piece have failed.

Works in the browser with [browserify](http://browserify.org/)! This module is used by [WebTorrent](http://webtorrent.io).

### install

```
npm install lt_donthave
```

### usage

This package should be used with [bittorrent-protocol](https://www.npmjs.com/package/bittorrent-protocol), which supports a plugin-like system for extending the protocol with additional functionality.

Say you're already using `bittorrent-protocol`. Your code might look something like this:

```js
import BitField from 'bitfield'
import Protocol from 'bittorrent-protocol'
import net from 'net'

net.createServer(socket => {
  var wire = new Protocol()
  socket.pipe(wire).pipe(socket)

  // handle handshake
  wire.on('handshake', (infoHash, peerId) => {
    wire.handshake(Buffer.from('my info hash'), Buffer.from('my peer id'))

    // advertise that we have all 10 pieces of the torrent
    const bitfield = new BitField(10)
    for (let i = 0; i <= 10; i++) {
      bitfield.set(i, true)
    }
    wire.bitfield(bitfield)
  })

}).listen(6881)
```

To add support for BEP 54, simply modify your code like this:

```js
import BitField from 'bitfield'
import Protocol from 'bittorrent-protocol'
import net from 'net'
import lt_donthave from 'lt_donthave'

net.createServer(socket => {
  const wire = new Protocol()
  socket.pipe(wire).pipe(socket)

  // initialize the extension
  wire.use(lt_donthave())

  // all `lt_donthave` functionality can now be accessed at wire.lt_donthave

  wire.on('request', (pieceIndex, offset, length, cb) => {
    // whoops, turns out we don't have any pieces after all
    wire.lt_donthave.donthave(pieceIndex)
    cb(new Error('not found'))
  })

  // 'donthave' event will fire when the remote peer indicates it no longer has a piece
  wire.lt_donthave.on('donthave', index => {
    // remote peer no longer has piece `index`
  })

  // handle handshake
  wire.on('handshake', (infoHash, peerId) => {
    wire.handshake(Buffer.from('my info hash'), Buffer.from('my peer id'))

    // advertise that we have all 10 pieces of the torrent
    const bitfield = new BitField(10)
    for (let i = 0; i <= 10; i++) {
      bitfield.set(i, true)
    }
    wire.bitfield(bitfield)
  })

}).listen(6881)
```

### api

#### `lt_donthave()`

Initialize the extension.

```js
wire.use(lt_donthave())
```

#### `lt_donthave.donthave(index)`

Tell the remote peer that this peer no longer has the piece with the specified `index`.

Opposite of `wire.have`.

#### `lt_donthave.on('donthave', index => {})`

Fired when the remote peer no longer has the piece with the specified `index`.

Opposite of `wire.on('have', index => ())`

After this is fired, all outstanding requests to the remote peer for that piece will automatically fail.

### license

MIT. Copyright (c) John Hiesey and [WebTorrent, LLC](https://webtorrent.io).

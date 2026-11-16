# torrent-discovery [![ci][ci-image]][ci-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[ci-image]: https://github.com/webtorrent/torrent-discovery/actions/workflows/ci.yml/badge.svg
[ci-url]: https://github.com/webtorrent/torrent-discovery/actions/workflows/ci.yml
[npm-image]: https://img.shields.io/npm/v/torrent-discovery.svg
[npm-url]: https://npmjs.org/package/torrent-discovery
[downloads-image]: https://img.shields.io/npm/dm/torrent-discovery.svg
[downloads-url]: https://npmjs.org/package/torrent-discovery
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

### Discover BitTorrent and WebTorrent peers

This module bundles [bittorrent-tracker](https://www.npmjs.com/package/bittorrent-tracker), [bittorrent-dht](https://www.npmjs.com/package/bittorrent-dht), and [bittorrent-lsd](https://www.npmjs.com/package/bittorrent-lsd) clients and exposes a single API for discovering BitTorrent peers.

## features

- simple API
- find peers from trackers, DHT, and LSD
- automatically announces, so other peers can discover us
- can start finding peers with just an info hash, before full metadata is available

This module also **works in the browser** with [browserify](http://browserify.org). In
that context, it discovers [WebTorrent](http://webtorrent.io) (WebRTC) peers.

## install

```
npm install torrent-discovery
```

## api

### `discovery = new Discovery(opts)`

Create a new peer discovery instance. Required options are:

```js
{
  infoHash: '', // as hex string or Buffer
  peerId: '',   // as hex string or Buffer
  port: 0       // torrent client port (only required in node)
}
```

Optional options are:

```js
{
  announce: [],  // force list of announce urls to use (from magnet uri)
  dht: true,     // use dht? optionally, this can be an `opts` object, or a DHT instance to use (can be reused for multiple torrents)
  dhtPort: 0,    // custom listen port for the DHT instance (not used if DHT instance is given via `opts.dht`)
  userAgent: '', // User-Agent header for http requests
  tracker: true, // use trackers? optionally, this can be an `opts` object
  lsd: true      // use lsd?
}
```

See the documentation for [bittorrent-tracker](https://www.npmjs.com/package/bittorrent-tracker), [bittorrent-dht](https://www.npmjs.com/package/bittorrent-dht), and [bittorrant-lsd](https://www.npmjs.com/package/bittorrent-lsd) for information on what options are available via the `opts` object.

**This module automatically handles announcing on intervals, for maximum peer discovery.**

### `discovery.updatePort(port)`

When the port that the torrent client is listening on changes, call this method to
reannounce to the tracker and DHT with the new port.

### `discovery.complete([opts])`

Announce that download has completed (and the client is now a seeder). This is only
used by trackers, for statistical purposes. If trackers are not in use, then
this method is a no-op.

Optional `opts` object with the following options:

```
{number=} opts.uploaded
{number=} opts.downloaded
{number=} opts.numwant
{number=} opts.left (if not set, calculated automatically)
```

### `discovery.destroy()`

Destroy and cleanup the tracker, DHT, and LSD instances.

### events

### `discovery.on('peer', (peer, source) => {})`

Emitted whenever a new peer is discovered. Source is either `'tracker'`, `'dht'`, or `'lsd'` based on peer source.

**In node**, `peer` is a string in the form `ip:port`, e.g. `12.34.56.78:4000`.

**In the browser**, `peer` is an instance of
[`simple-peer`](https://www.npmjs.com/package/simple-peer), a small wrapper around a WebRTC
peer connection.

### `discovery.on('dhtAnnounce', () => {})`

Emitted whenever an `announce` message has been sent to the DHT.

### `discovery.on('warning', err => {})`

Emitted when there is a **non-fatal** tracker, DHT, or LSD error. For example, an
inaccessible tracker server would be considered a warning. Useful for logging.

### `discovery.on('error', err => {})`

Emitted when there is a fatal tracker, DHT, or LSD error. This is unrecoverable
and the `discovery` object will be destroyed if this event is emitted.

## license

MIT. Copyright (c) [Feross Aboukhadijeh](https://feross.org) and [WebTorrent, LLC](https://webtorrent.io).

# ip-set [![travis](https://img.shields.io/travis/transitive-bullshit/ip-set.svg)](https://travis-ci.org/transitive-bullshit/ip-set) [![npm](https://img.shields.io/npm/v/ip-set.svg)](https://npmjs.org/package/ip-set)

### IP Address Set

Efficient mutable set data structure optimized for use with IPv4 and IPv6 addresses. The primary use case is for working with potentially large IP blacklists.

Works in the browser with [browserify](http://browserify.org/)! This module is used by [WebTorrent](http://webtorrent.io).

## install

```
npm install ip-set
```

## usage

```js
const IPSet = require('ip-set')

const ipSet = new IPSet(/* optionally pass an array of IP addresses to seed the set with */)
ipSet.add(exampleBlockedIP1)
ipSet.add(exampleBlockedIP2)
let isBlocked = ipSet.contains(exampleBlockedIP2) // isBlocked will be true
```

CIDR ip's are also supported

```js
ipSet.add(`192.168.1.0/24`);
let isBlockedInList = ipSet.contains('192.168.1.0');// isBlockedInList will be true
isBlockedInList = ipSet.contains('192.168.1.255');// isBlockedInList will be true
```


## todo
(prioritized highest to lowest)

- [x] Port IPv4 implementation from `torrent-stream`
- [x] Add basic tests
- [x] Support CIDR notation
- [ ] Support IPv6
- [ ] Investigate potential use of [node-iptrie](https://github.com/postwait/node-iptrie)

## credits

Original interval-tree written by [galedric](https://github.com/galedric) for [torrent-stream](https://github.com/mafintosh/torrent-stream). Ported to an isolated npm module by [transitive-bullshit](https://github.com/transitive-bullshit) for [webtorrent](http://webtorrent.io).

## license

MIT. Copyright (c) Travis Fischer

Support my OSS work by <a href="https://twitter.com/transitive_bs">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a>

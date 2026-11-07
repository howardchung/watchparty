# piece-length
piece-length finds the optimal piece length for a given number of bytes. Optimal for what exactly? BitTorrent. [VuzeWiki](http://wiki.vuze.com/w/Torrent_Piece_Size) and [TorrentFreak](http://torrentfreak.com/how-to-make-the-best-torrents-081121/) have both released some examples of ideal piece lengths, and this algorithm will reproduce them.

[![build status](https://travis-ci.org/michaelrhodes/piece-length.png?branch=master)](https://travis-ci.org/michaelrhodes/piece-length)

## install
```
npm install piece-length
```
note: you may need to polyfill [`Math.log2`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log2#Browser_compatibility)

### use
``` js
var optimum = require('piece-length')

// 350mb should be 256kb
optimum(367001600) // => 262144
```

### obey
[MIT](http://opensource.org/licenses/MIT)

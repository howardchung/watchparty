# immediate-chunk-store [![ci][ci-image]][ci-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[ci-image]: https://img.shields.io/github/workflow/status/feross/immediate-chunk-store/ci/master
[ci-url]: https://github.com/feross/immediate-chunk-store/actions
[npm-image]: https://img.shields.io/npm/v/immediate-chunk-store.svg
[npm-url]: https://npmjs.org/package/immediate-chunk-store
[downloads-image]: https://img.shields.io/npm/dm/immediate-chunk-store.svg
[downloads-url]: https://npmjs.org/package/immediate-chunk-store
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

#### Immediate put/get for [abstract-chunk-store](https://github.com/mafintosh/abstract-chunk-store) compliant stores

[![abstract chunk store](https://cdn.rawgit.com/mafintosh/abstract-chunk-store/master/badge.svg)](https://github.com/mafintosh/abstract-chunk-store)

Makes `store.put()` chunks immediately available for `store.get()`, even before the
`store.put()` callback is called. Data is stored in memory until the `store.put()`
is complete.

## Install

```
npm install immediate-chunk-store
```

## Usage

``` js
var ImmediateChunkStore = require('immediate-chunk-store')
var FSChunkStore = require('fs-chunk-store') // any chunk store will work

var store = new ImmediateChunkStore(new FSChunkStore(10))

store.put(0, Buffer.from('abc'), function () { /* yolo */ })

// And now, get the same chunk out BEFORE the put is complete
store.get(0, function (err, data) {
  if (err) throw err
  console.log(data.toString()) // 'abc'
})
```

## License

MIT. Copyright (c) [Feross Aboukhadijeh](http://feross.org).

# memory-chunk-store [![build status](http://img.shields.io/travis/mafintosh/memory-chunk-store.svg)](http://travis-ci.org/mafintosh/memory-chunk-store)

#### In memory chunk store that is [abstract-chunk-store](https://github.com/mafintosh/abstract-chunk-store) compliant

[![abstract chunk store](https://cdn.rawgit.com/mafintosh/abstract-chunk-store/master/badge.svg)](https://github.com/mafintosh/abstract-chunk-store)

## Install

```
npm install memory-chunk-store
```

## Usage

``` js
var mem = require('memory-chunk-store')
var chunks = mem(10)

chunks.put(0, new Buffer('01234567890'), function (err) {
  if (err) throw err
  chunks.get(0, function (err, chunk) {
    if (err) throw err
    console.log(chunk) // '01234567890' as a buffer
  })
})
```

## License

MIT

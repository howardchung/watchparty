# fs-chunk-store [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[travis-image]: https://img.shields.io/travis/feross/fs-chunk-store/master.svg
[travis-url]: https://travis-ci.org/feross/fs-chunk-store
[npm-image]: https://img.shields.io/npm/v/fs-chunk-store.svg
[npm-url]: https://npmjs.org/package/fs-chunk-store
[downloads-image]: https://img.shields.io/npm/dm/fs-chunk-store.svg
[downloads-url]: https://npmjs.org/package/fs-chunk-store
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

#### Filesystem (fs) chunk store that is [abstract-chunk-store](https://github.com/mafintosh/abstract-chunk-store) compliant

[![abstract chunk store](https://cdn.rawgit.com/mafintosh/abstract-chunk-store/master/badge.svg)](https://github.com/mafintosh/abstract-chunk-store)

## Install

```
npm install fs-chunk-store
```

## Usage

### Back the store with a single file

``` js
var FSChunkStore = require('fs-chunk-store')

var chunks = new FSChunkStore(10, {
  path: '/tmp/my_file', // optional: path to file (default: temp file will be used)
  length: 100 // optional: file length in bytes (default: file expands based on `put`s)
})
```

### Back the store with multiple files

``` js
var FSChunkStore = require('fs-chunk-store')

var chunks = new FSChunkStore(10, {
  files: [
    { path: 'folder/file1.txt', length: 12 },
    { path: 'folder/file2.txt', length: 8 },
    { path: 'folder/file3.txt', length: 30 }
  ],
  path: 'C:/user/' // optional: if specified the file paths will be treated as relative, not absolute
})
```
Specifying a path to the store will create a folder in that path, and on destroy, will delete the folder along with all it's contents

### put, get, close, destroy

```js
chunks.put(0, Buffer.from('0123456789'), function (err) {
  if (err) throw err

  chunks.get(0, function (err, chunk) {
    if (err) throw err
    console.log(chunk) // '0123456789' as a buffer

    chunks.close(function (err) {
      if (err) throw err
      console.log('/tmp/my_file file descriptor is closed')

      chunks.destroy(function (err) {
        if (err) throw err
        console.log('/tmp/my_file file is deleted')
      })
    })
  })
})
```

## License

MIT. Copyright (c) [Feross Aboukhadijeh](http://feross.org).

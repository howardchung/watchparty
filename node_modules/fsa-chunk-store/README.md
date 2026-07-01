# fsa-chunk-store

#### [File System Access API](https://web.dev/file-system-access/) chunk store that is [abstract-chunk-store](https://github.com/mafintosh/abstract-chunk-store) compliant

[![abstract chunk store](https://cdn.rawgit.com/mafintosh/abstract-chunk-store/master/badge.svg)](https://github.com/mafintosh/abstract-chunk-store)

## Install

```
npm install https://github.com/ThaUnknown/fsa-chunk-store
```

## Usage

```js
const FSAChunkStore = require('fsa-chunk-store')
const chunks = FSAChunkStore(10)

chunks.put(0, new Buffer('01234567890'), function (err) {
  if (err) throw err
  chunks.get(0, function (err, chunk) {
    if (err) throw err
    console.log(chunk) // '01234567890' as a buffer
  })
})
```

## Options

- `length`: Total size of the chunk store (optional, default: `Infinity`)
- `name`: Top-level directory to create for this store (optional, default: `default`)
- `rootDir`: Root directory handle (optional, default: `navigator.storage.getDirectory()`)
- `files`: Array of File objects (optional, `{ path, length }`)

## About

Originally based on https://github.com/SocketDev/fs-access-chunk-store but improved to support filesystem-like folder structures, to allow external user manipulation of files.

## License

MIT.

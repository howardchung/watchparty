# chunk-store-iterator [![javascript style guide][standard-image]][standard-url]

[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

#### Convert an [abstract-chunk-store](https://github.com/mafintosh/abstract-chunk-store) store into an async iterator, or write to using an async iterator.

[![abstract chunk store](https://cdn.rawgit.com/mafintosh/abstract-chunk-store/master/badge.svg)](https://github.com/mafintosh/abstract-chunk-store)

A majorly simplified version of [chunk-store-stream](https://github.com/feross/chunk-store-stream). Dependency free and very fast.

Read/write data from/to a chunk store, with iterators.

## Install

```
npm install chunk-store-iterator
```

## Usage

### Create a read iterator

``` js
import { chunkStoreRead } from 'chunk-store-iterator'
import FSChunkStore from 'fs-chunk-store' // any chunk store will work
import { Readable } from 'streamx'

const chunkLength = 3
const store = new FSChunkStore(chunkLength)

// ... put some data in the store

const asyncIterator = chunkStoreRead(store, { length: 1200, zeroPadding: true })
const stream = Readable.from(asyncIterator)

stream.pipe(process.stdout)

// or

for await (const chunk of chunkStoreRead(store, { length: 1200 })) {
  console.log(chunk)
}
```

### Write using an iterator

```js
import { chunkStoreWrite } from 'chunk-store-iterator'
import FSChunkStore from 'fs-chunk-store' // any chunk store will work
import fs from 'fs'

const chunkLength = 3
const store = new FSChunkStore(chunkLength)

const stream = fs.createReadStream('file.txt')
await chunkStoreWrite(store, stream)
```

## License

MIT.

# join-async-iterator

### An async iterator that joins multiple other async iterators in order, one after another.

A majorly simplified version of [multistream](https://www.npmjs.com/package/multistream). Dependency free and very fast. When the first interator ends, the next one starts, and so on, until all iterators are consumed. This accepts anything with an async iterator, be that node streams or anything else.

## Usage
`join-async-iterator` accepts any iterator which yields async/sync iterables, so for example an array or streams:
```js
import join from 'join-async-iterator'
import fs from 'fs'
import { Readable } from 'streamx'

const streams = [
  fs.createReadStream(__dirname + '/numbers/1.txt'),
  fs.createReadStream(__dirname + '/numbers/2.txt'),
  fs.createReadStream(__dirname + '/numbers/3.txt')
]

const asyncIterator = join(streams)
const stream = Readable.from(asyncIterator)

stream.pipe(process.stdout) // => 123

// or

let string = ''
for await (const number of join(streams)) { // top level await
  string += number
}
console.log(string) // 123
```
To lazily create the streams, wrap them in a function:
```js
const streams = [
  fs.createReadStream(__dirname + '/numbers/1.txt'),
  function () { // will be executed when the stream is active
    return fs.createReadStream(__dirname + '/numbers/2.txt')
  },
  new Uint8Array([3, 4]), // you can mix and match
  [5, 6], // any form of iterable
  '78' // even sync ones
]

Readable.from(join(streams)).pipe(process.stdout) // => 123
```
Alternatively, streams may be created by a "factory" function:
```js
function factory * (directory) {
  for (let i = 1; i < 4, ++i) {
    yield fs.createReadStream(directory + '/numbers/' + i + '.txt')
  }
}

Readable.from(join(factory(__dirname))).pipe(process.stdout) // => 123
```
Also works in browsers without needing node stream:
```js
import 'fast-readable-async-iterator'
import join from 'join-async-iterator'

fileinput.onchange = async ({ target }) => {
  const streams = target.files.map(file => file.stream())
  for await (const data of join(streams)) {
    console.log('Read data from disk!', data)
  }
  console.log('Finished reading!')
}
```

import CacheChunkStore from 'cache-chunk-store'
import concat from 'simple-concat'
import FSChunkStore from 'fs-chunk-store'
import ImmediateChunkStore from 'immediate-chunk-store'
import MemoryChunkStore from 'memory-chunk-store'
import test from 'tape'
import { Readable, PassThrough } from 'stream'
import { chunkStoreRead, chunkStoreWrite } from './index.js'

function str (buffer) {
  const s = new PassThrough()
  s.end(buffer)
  return s
}
runTests('FS', function (chunkLength) {
  return new FSChunkStore(chunkLength)
})

runTests('Memory', function (chunkLength) {
  return new MemoryChunkStore(chunkLength)
})

runTests('Cache(FS)', function (chunkLength) {
  return new CacheChunkStore(new FSChunkStore(chunkLength))
})

runTests('Cache(Memory)', function (chunkLength) {
  return new CacheChunkStore(new MemoryChunkStore(chunkLength))
})

runTests('Immediate(FS)', function (chunkLength) {
  return new ImmediateChunkStore(new FSChunkStore(chunkLength))
})

runTests('Immediate(Memory)', function (chunkLength) {
  return new ImmediateChunkStore(new MemoryChunkStore(chunkLength))
})

runTests('Cache(Immediate(FS)', function (chunkLength) {
  return new CacheChunkStore(new ImmediateChunkStore(new FSChunkStore(chunkLength)))
})

runTests('Cache(Immediate(Memory)', function (chunkLength) {
  return new CacheChunkStore(new ImmediateChunkStore(new MemoryChunkStore(chunkLength)))
})

function runTests (name, Store) {
  test(`${name}: readable stream`, t => {
    t.plan(4)

    const store = new Store(3)

    store.put(0, Buffer.from('abc'), err => {
      t.error(err)
      store.put(1, Buffer.from('def'), err => {
        t.error(err)

        const iterator = chunkStoreRead(store, { length: 6 })
        const stream = Readable.from(iterator)
        stream.on('error', err => { t.fail(err) })

        concat(stream, (err, buf) => {
          t.error(err)
          t.deepEqual(buf, Buffer.from('abcdef'))
        })
      })
    })
  })

  test(`${name}: readable stream with slicing`, t => {
    t.plan(4)

    const store = new Store(3)

    store.put(0, Buffer.from('abc'), err => {
      t.error(err)
      store.put(1, Buffer.from('def'), err => {
        t.error(err)

        const iterator = chunkStoreRead(store, { length: 3, offset: 2 })
        const stream = Readable.from(iterator)
        stream.on('error', err => { t.fail(err) })

        concat(stream, (err, buf) => {
          t.error(err)
          t.deepEqual(buf, Buffer.from('cde'))
        })
      })
    })
  })

  test(`${name}: writable stream`, t => {
    t.plan(4)

    const store = new Store(3)

    const stream = str('abcdef')

    stream.on('error', err => { t.fail(err) })

    chunkStoreWrite(store, stream).then(() => {
      store.get(0, (err, buf) => {
        t.error(err)
        t.deepEqual(Buffer.from(buf), Buffer.from('abc'))
        store.get(1, (err, buf) => {
          t.error(err)
          t.deepEqual(Buffer.from(buf), Buffer.from('def'))
        })
      })
    })
  })

  test(`${name}: writable stream with zero padding`, t => {
    t.plan(4)

    const store = new Store(3)

    const stream = str('abcd')
    stream.on('error', err => { t.fail(err) })

    chunkStoreWrite(store, stream, { zeroPadding: true }).then(() => {
      store.get(0, (err, buf) => {
        t.error(err)
        t.deepEqual(Buffer.from(buf), Buffer.from('abc'))
        store.get(1, (err, buf) => {
          t.error(err)
          t.deepEqual(Buffer.from(buf), Buffer.from('d\0\0'))
        })
      })
    })
  })
}

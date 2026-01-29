/*! cache-chunk-store. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
const LRU = require('lru')
const queueMicrotask = require('queue-microtask')

class CacheStore {
  constructor (store, opts) {
    this.store = store
    this.chunkLength = store.chunkLength
    this.inProgressGets = new Map() // Map from chunk index to info on callbacks waiting for that chunk

    if (!this.store || !this.store.get || !this.store.put) {
      throw new Error('First argument must be abstract-chunk-store compliant')
    }

    this.cache = new LRU(opts)
  }

  put (index, buf, cb = () => {}) {
    if (!this.cache) {
      return queueMicrotask(() => cb(new Error('CacheStore closed')))
    }

    this.cache.remove(index)
    this.store.put(index, buf, cb)
  }

  get (index, opts, cb = () => {}) {
    if (typeof opts === 'function') return this.get(index, null, opts)

    if (!this.cache) {
      return queueMicrotask(() => cb(new Error('CacheStore closed')))
    }

    if (!opts) opts = {}

    let buf = this.cache.get(index)
    if (buf) {
      const offset = opts.offset || 0
      const len = opts.length || (buf.length - offset)
      if (offset !== 0 || len !== buf.length) {
        buf = buf.slice(offset, len + offset)
      }
      return queueMicrotask(() => cb(null, buf))
    }

    // See if a get for this index has already started
    let waiters = this.inProgressGets.get(index)
    const getAlreadyStarted = !!waiters
    if (!waiters) {
      waiters = []
      this.inProgressGets.set(index, waiters)
    }

    waiters.push({
      opts,
      cb
    })

    if (!getAlreadyStarted) {
      this.store.get(index, (err, buf) => {
        if (!err && this.cache != null) this.cache.set(index, buf)

        const inProgressEntry = this.inProgressGets.get(index)
        this.inProgressGets.delete(index)

        for (const { opts, cb } of inProgressEntry) {
          if (err) {
            cb(err)
          } else {
            const offset = opts.offset || 0
            const len = opts.length || (buf.length - offset)
            let slicedBuf = buf
            if (offset !== 0 || len !== buf.length) {
              slicedBuf = buf.slice(offset, len + offset)
            }
            cb(null, slicedBuf)
          }
        }
      })
    }
  }

  close (cb = () => {}) {
    if (!this.cache) {
      return queueMicrotask(() => cb(new Error('CacheStore closed')))
    }

    this.cache = null
    this.store.close(cb)
  }

  destroy (cb = () => {}) {
    if (!this.cache) {
      return queueMicrotask(() => cb(new Error('CacheStore closed')))
    }

    this.cache = null
    this.store.destroy(cb)
  }
}

module.exports = CacheStore

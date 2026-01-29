/*! immediate-chunk-store. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
// TODO: remove when window.queueMicrotask() is well supported
const queueMicrotask = require('queue-microtask')

class ImmediateStore {
  constructor (store) {
    this.store = store
    this.chunkLength = store.chunkLength

    if (!this.store || !this.store.get || !this.store.put) {
      throw new Error('First argument must be abstract-chunk-store compliant')
    }

    this.mem = []
  }

  put (index, buf, cb = () => {}) {
    this.mem[index] = buf
    this.store.put(index, buf, err => {
      this.mem[index] = null
      cb(err)
    })
  }

  get (index, opts, cb = () => {}) {
    if (typeof opts === 'function') return this.get(index, null, opts)

    let buf = this.mem[index]

    // if the chunk isn't in the immediate memory cache
    if (!buf) {
      return this.store.get(index, opts, cb)
    }

    if (!opts) opts = {}

    const offset = opts.offset || 0
    const len = opts.length || (buf.length - offset)

    if (offset !== 0 || len !== buf.length) {
      buf = buf.slice(offset, len + offset)
    }
    queueMicrotask(() => cb(null, buf))
  }

  close (cb = () => {}) {
    this.store.close(cb)
  }

  destroy (cb = () => {}) {
    this.store.destroy(cb)
  }
}

module.exports = ImmediateStore

module.exports = Storage

const queueMicrotask = require('queue-microtask')

function Storage (chunkLength, opts) {
  if (!(this instanceof Storage)) return new Storage(chunkLength, opts)
  if (!opts) opts = {}

  this.chunkLength = Number(chunkLength)
  if (!this.chunkLength) throw new Error('First argument must be a chunk length')

  this.chunks = []
  this.closed = false
  this.length = Number(opts.length) || Infinity

  if (this.length !== Infinity) {
    this.lastChunkLength = (this.length % this.chunkLength) || this.chunkLength
    this.lastChunkIndex = Math.ceil(this.length / this.chunkLength) - 1
  }
}

Storage.prototype.put = function (index, buf, cb = () => {}) {
  if (this.closed) return queueMicrotask(() => cb(new Error('Storage is closed')))

  const isLastChunk = (index === this.lastChunkIndex)
  if (isLastChunk && buf.length !== this.lastChunkLength) {
    return queueMicrotask(() => cb(new Error('Last chunk length must be ' + this.lastChunkLength)))
  }
  if (!isLastChunk && buf.length !== this.chunkLength) {
    return queueMicrotask(() => cb(new Error('Chunk length must be ' + this.chunkLength)))
  }
  this.chunks[index] = buf
  queueMicrotask(() => cb(null))
}

Storage.prototype.get = function (index, opts, cb = () => {}) {
  if (typeof opts === 'function') return this.get(index, null, opts)
  if (this.closed) return queueMicrotask(() => cb(new Error('Storage is closed')))

  let buf = this.chunks[index]

  if (!buf) {
    const err = new Error('Chunk not found')
    err.notFound = true
    return queueMicrotask(() => cb(err))
  }

  if (!opts) opts = {}

  const offset = opts.offset || 0
  const len = opts.length || (buf.length - offset)

  if (offset !== 0 || len !== buf.length) {
    buf = buf.slice(offset, len + offset)
  }

  queueMicrotask(() => cb(null, buf))
}

Storage.prototype.close = Storage.prototype.destroy = function (cb = () => {}) {
  if (this.closed) return queueMicrotask(() => cb(new Error('Storage is closed')))
  this.closed = true
  this.chunks = null
  queueMicrotask(() => cb(null))
}

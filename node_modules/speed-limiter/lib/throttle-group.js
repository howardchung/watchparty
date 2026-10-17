const { TokenBucket } = require('limiter')
const Throttle = require('./throttle')

class ThrottleGroup {
  constructor (opts = {}) {
    if (typeof opts !== 'object') throw new Error('Options must be an object')

    this.throttles = []
    this.setEnabled(opts.enabled)
    this.setRate(opts.rate, opts.chunksize)
  }

  getEnabled () {
    return this._enabled
  }

  getRate () {
    // Note: bucketSize === tokensPerInterval
    return this.bucket.tokensPerInterval
  }

  getChunksize () {
    return this.chunksize
  }

  setEnabled (val = true) {
    if (typeof val !== 'boolean') throw new Error('Enabled must be a boolean')

    this._enabled = val
    for (const throttle of this.throttles) {
      throttle.setEnabled(val)
    }
  }

  setRate (rate, chunksize = null) {
    // Note: rate = 0, means we should stop processing chunks
    if (!Number.isInteger(rate) || rate < 0) throw new Error('Rate must be an integer bigger than zero')
    rate = parseInt(rate)

    if (chunksize && (typeof chunksize !== 'number' || chunksize <= 0)) throw new Error('Chunksize must be bigger than zero')
    chunksize = chunksize || Math.max(parseInt(rate / 10), 1)
    chunksize = parseInt(chunksize)
    if (rate > 0 && chunksize > rate) throw new Error('Chunk size must be smaller than rate')

    if (!this.bucket) this.bucket = new TokenBucket(rate, rate, 'second', null)

    this.bucket.bucketSize = rate
    this.bucket.tokensPerInterval = rate
    this.chunksize = chunksize
  }

  setChunksize (chunksize) {
    if (!Number.isInteger(chunksize) || chunksize <= 0) throw new Error('Chunk size must be an integer bigger than zero')
    const rate = this.getRate()
    chunksize = parseInt(chunksize)
    if (rate > 0 && chunksize > rate) throw new Error('Chunk size must be smaller than rate')
    this.chunksize = chunksize
  }

  throttle (opts = {}) {
    if (typeof opts !== 'object') throw new Error('Options must be an object')

    const newThrottle = new Throttle({
      ...opts,
      group: this
    })

    return newThrottle
  }

  destroy () {
    for (const throttle of this.throttles) {
      throttle.destroy()
    }

    this.throttles = []
  }

  _addThrottle (throttle) {
    if (!(throttle instanceof Throttle)) throw new Error('Throttle must be an instance of Throttle')

    this.throttles.push(throttle)
  }

  _removeThrottle (throttle) {
    const index = this.throttles.indexOf(throttle)
    if (index > -1) this.throttles.splice(index, 1)
  }
}

module.exports = ThrottleGroup

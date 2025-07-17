const { EventEmitter } = require('events')
const { Transform } = require('streamx')
const { wait } = require('./utils')

class Throttle extends Transform {
  constructor (opts = {}) {
    super()

    if (typeof opts !== 'object') throw new Error('Options must be an object')

    const params = Object.assign({}, opts)

    if (params.group && !(params.group instanceof ThrottleGroup)) throw new Error('Group must be an instanece of ThrottleGroup')
    else if (!params.group) params.group = new ThrottleGroup(params)

    this._setEnabled(params.enabled || params.group.enabled)
    this._group = params.group
    this._emitter = new EventEmitter()
    this._destroyed = false

    this._group._addThrottle(this)
  }

  getEnabled () {
    return this._enabled
  }

  getGroup () {
    return this._group
  }

  _setEnabled (val = true) {
    if (typeof val !== 'boolean') throw new Error('Enabled must be a boolean')
    this._enabled = val
  }

  setEnabled (val) {
    this._setEnabled(val)
    if (this._enabled) this._emitter.emit('enabled')
    else this._emitter.emit('disabled')
  }

  _transform (chunk, done) {
    this._processChunk(chunk, done)
  }

  /* async _waitForPositiveRate () {
    // Stop pushing chunks if rate is zero
    while (this._group.getRate() === 0 && !this._destroyed && this._areBothEnabled()) {
      await wait(1 * 1000) // wait 1 second
    }
  } */

  async _waitForTokens (amount) {
    // Wait for enabled, destroyed or tokens
    return new Promise((resolve, reject) => {
      let done = false
      const self = this
      function isDone (err) {
        self._emitter.removeListener('disabled', isDone)
        self._emitter.removeListener('destroyed', isDone)

        if (done) return
        done = true
        if (err) return reject(err)
        resolve()
      }
      this._emitter.once('disabled', isDone)
      this._emitter.once('destroyed', isDone)
      // TODO: next version remove lisener in "isDone"
      this._group.bucket.removeTokens(amount, isDone)
    })
  }

  _areBothEnabled () {
    return this._enabled && this._group.getEnabled()
  }

  /* async _throttleChunk (size) {
    // Stop pushing chunks if rate is zero
    await this._waitForPositiveRate()
    if (this._destroyed) return
    if (!this._areBothEnabled()) return

    // Get tokens from bucket
    await this._waitForTokens(size)
  } */

  async _processChunk (chunk, done) {
    if (!this._areBothEnabled()) return done(null, chunk)

    let pos = 0
    let chunksize = this._group.getChunksize()
    let slice = chunk.slice(pos, pos + chunksize)
    while (slice.length > 0) {
      // Check here again because we might be in the middle of a big chunk
      // with a lot of small slices
      if (this._areBothEnabled()) {
        try {
          // WAIT FOR POSITIVE RATE
          // Stop pushing chunks if rate is zero
          while (this._group.getRate() === 0 && !this._destroyed && this._areBothEnabled()) {
            await wait(1000) // wait 1 second
            if (this._destroyed) return
          }

          // WAIT FOR TOKENS
          if (this._areBothEnabled() && !this._group.bucket.tryRemoveTokens(slice.length)) {
            await this._waitForTokens(slice.length)
            if (this._destroyed) return
          }
        } catch (err) {
          return done(err)
        }
      }

      this.push(slice)
      pos += chunksize

      // Calculate params for next slice
      chunksize = (this._areBothEnabled())
        ? this._group.getChunksize() // Chunksize might have changed
        : chunk.length - pos // Get the rest of the chunk
      slice = chunk.slice(pos, pos + chunksize)
    }

    return done()
  }

  destroy (...args) {
    this._group._removeThrottle(this)

    this._destroyed = true
    this._emitter.emit('destroyed')

    super.destroy(...args)
  }
}

module.exports = Throttle

// Fix circular dependency
const ThrottleGroup = require('./throttle-group')

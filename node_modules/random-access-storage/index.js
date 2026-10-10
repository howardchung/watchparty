const EventEmitter = require('events')
const queueTick = require('queue-tick')

const NOT_READABLE = defaultImpl(new Error('Not readable'))
const NOT_WRITABLE = defaultImpl(new Error('Not writable'))
const NOT_DELETABLE = defaultImpl(new Error('Not deletable'))
const NOT_STATABLE = defaultImpl(new Error('Not statable'))

const DEFAULT_OPEN = defaultImpl(null)
const DEFAULT_CLOSE = defaultImpl(null)
const DEFAULT_UNLINK = defaultImpl(null)

// NON_BLOCKING_OPS
const READ_OP = 0
const WRITE_OP = 1
const DEL_OP = 2
const TRUNCATE_OP = 3
const STAT_OP = 4

// BLOCKING_OPS
const OPEN_OP = 5
const SUSPEND_OP = 6
const CLOSE_OP = 7
const UNLINK_OP = 8

module.exports = class RandomAccessStorage extends EventEmitter {
  constructor (opts) {
    super()

    this._queued = []
    this._pending = 0
    this._needsOpen = true

    this.opened = false
    this.suspended = false
    this.closed = false
    this.unlinked = false
    this.writing = false

    if (opts) {
      if (opts.open) this._open = opts.open
      if (opts.read) this._read = opts.read
      if (opts.write) this._write = opts.write
      if (opts.del) this._del = opts.del
      if (opts.truncate) this._truncate = opts.truncate
      if (opts.stat) this._stat = opts.stat
      if (opts.suspend) this._suspend = opts.suspend
      if (opts.close) this._close = opts.close
      if (opts.unlink) this._unlink = opts.unlink
    }

    this.readable = this._read !== RandomAccessStorage.prototype._read
    this.writable = this._write !== RandomAccessStorage.prototype._write
    this.deletable = this._del !== RandomAccessStorage.prototype._del
    this.truncatable = this._truncate !== RandomAccessStorage.prototype._truncate || this.deletable
    this.statable = this._stat !== RandomAccessStorage.prototype._stat
  }

  read (offset, size, cb) {
    this.run(new Request(this, READ_OP, offset, size, null, cb), false)
  }

  _read (req) {
    return NOT_READABLE(req)
  }

  write (offset, data, cb) {
    if (!cb) cb = noop
    this.run(new Request(this, WRITE_OP, offset, data.length, data, cb), true)
  }

  _write (req) {
    return NOT_WRITABLE(req)
  }

  del (offset, size, cb) {
    if (!cb) cb = noop
    this.run(new Request(this, DEL_OP, offset, size, null, cb), true)
  }

  _del (req) {
    return NOT_DELETABLE(req)
  }

  truncate (offset, cb) {
    if (!cb) cb = noop
    this.run(new Request(this, TRUNCATE_OP, offset, 0, null, cb), true)
  }

  _truncate (req) {
    req.size = Infinity
    this._del(req)
  }

  stat (cb) {
    this.run(new Request(this, STAT_OP, 0, 0, null, cb), false)
  }

  _stat (req) {
    return NOT_STATABLE(req)
  }

  open (cb) {
    if (!cb) cb = noop
    if (this.opened && !this._needsOpen) return nextTickCallback(cb)
    this._needsOpen = false
    queueAndRun(this, new Request(this, OPEN_OP, 0, 0, null, cb))
  }

  _open (req) {
    return DEFAULT_OPEN(req)
  }

  suspend (cb) {
    if (!cb) cb = noop
    if (this.closed || this.suspended) return nextTickCallback(cb)
    this._needsOpen = true
    queueAndRun(this, new Request(this, SUSPEND_OP, 0, 0, null, cb))
  }

  _suspend (req) {
    this._close(req)
  }

  close (cb) {
    if (!cb) cb = noop
    if (this.closed) return nextTickCallback(cb)
    queueAndRun(this, new Request(this, CLOSE_OP, 0, 0, null, cb))
  }

  _close (req) {
    return DEFAULT_CLOSE(req)
  }

  unlink (cb) {
    if (!cb) cb = noop
    if (!this.closed) this.close(noop)
    queueAndRun(this, new Request(this, UNLINK_OP, 0, 0, null, cb))
  }

  _unlink (req) {
    return DEFAULT_UNLINK(req)
  }

  run (req, writing) {
    if (writing && !this.writing) {
      this.writing = true
      this._needsOpen = true
    }

    if (this._needsOpen) this.open(noop)
    if (this._queued.length) this._queued.push(req)
    else req._run()
  }
}

class Request {
  constructor (self, type, offset, size, data, cb) {
    this.type = type
    this.offset = offset
    this.size = size
    this.data = data
    this.storage = self

    this._sync = false
    this._callback = cb
    this._openError = null
  }

  _maybeOpenError (err) {
    if (this.type !== OPEN_OP) return
    const queued = this.storage._queued
    for (let i = 1; i < queued.length; i++) {
      const q = queued[i]
      if (q.type === OPEN_OP) break
      q._openError = err
    }
  }

  _unqueue (err) {
    const ra = this.storage
    const queued = ra._queued

    if (err) {
      this._maybeOpenError(err)
    } else if (this.type > 4) {
      switch (this.type) {
        case OPEN_OP:
          if (ra.suspended) {
            ra.suspended = false
            ra.emit('unsuspend')
          }
          if (!ra.opened) {
            ra.opened = true
            ra.emit('open')
          }
          break

        case SUSPEND_OP:
          if (!ra.suspended) {
            ra.suspended = true
            ra.emit('suspend')
          }
          break

        case CLOSE_OP:
          if (!ra.closed) {
            ra.closed = true
            ra.emit('close')
          }
          break

        case UNLINK_OP:
          if (!ra.unlinked) {
            ra.unlinked = true
            ra.emit('unlink')
          }
          break
      }
    }

    if (queued.length && queued[0] === this) queued.shift()

    if (!--ra._pending) drainQueue(ra)
  }

  callback (err, val) {
    if (this._sync) return nextTick(this, err, val)
    this._unqueue(err)
    this._callback(err, val)
  }

  _openAndNotClosed () {
    const ra = this.storage
    if (ra.opened && !ra.closed && !ra.suspended) return true
    if (!ra.opened || ra.suspended) nextTick(this, this._openError || new Error('Not opened'))
    else if (ra.closed) nextTick(this, new Error('Closed'))
    return false
  }

  _open () {
    const ra = this.storage

    if (ra.opened && !ra.suspended) return nextTick(this, null)
    if (ra.closed) return nextTick(this, new Error('Closed'))

    ra._open(this)
  }

  _run () {
    const ra = this.storage
    ra._pending++

    this._sync = true

    switch (this.type) {
      case READ_OP:
        if (this._openAndNotClosed()) ra._read(this)
        break

      case WRITE_OP:
        if (this._openAndNotClosed()) ra._write(this)
        break

      case DEL_OP:
        if (this._openAndNotClosed()) ra._del(this)
        break

      case TRUNCATE_OP:
        if (this._openAndNotClosed()) ra._truncate(this)
        break

      case STAT_OP:
        if (this._openAndNotClosed()) ra._stat(this)
        break

      case OPEN_OP:
        this._open()
        break

      case SUSPEND_OP:
        if (ra.closed || !ra.opened || ra.suspended) nextTick(this, null)
        else ra._suspend(this)
        break

      case CLOSE_OP:
        if (ra.closed || !ra.opened || ra.suspended) nextTick(this, null)
        else ra._close(this)
        break

      case UNLINK_OP:
        if (ra.unlinked) nextTick(this, null)
        else ra._unlink(this)
        break
    }

    this._sync = false
  }
}

function queueAndRun (self, req) {
  self._queued.push(req)
  if (!self._pending) req._run()
}

function drainQueue (self) {
  const queued = self._queued

  while (queued.length > 0) {
    const blocking = queued[0].type > 4
    if (!blocking || !self._pending) queued[0]._run()
    if (blocking) return
    queued.shift()
  }
}

function defaultImpl (err) {
  return overridable

  function overridable (req) {
    nextTick(req, err)
  }
}

function nextTick (req, err, val) {
  queueTick(() => req.callback(err, val))
}

function nextTickCallback (cb) {
  queueTick(() => cb(null))
}

function noop () {}

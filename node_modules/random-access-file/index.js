const RandomAccessStorage = require('random-access-storage')
const fs = require('fs')
const path = require('path')
const constants = fs.constants || require('constants') // eslint-disable-line n/no-deprecated-api

let fsext = null
try {
  fsext = require('fs-native-extensions')
} catch {
  try { // tmp workaround for places where fsctl is bundled...
    fsext = {
      tryLock: require('fsctl').lock,
      sparse: () => Promise.resolve()
    }
  } catch {}
}

const RDWR = constants.O_RDWR
const RDONLY = constants.O_RDONLY
const WRONLY = constants.O_WRONLY
const CREAT = constants.O_CREAT

class Pool {
  constructor (maxSize) {
    this.maxSize = maxSize
    this.active = []
  }

  _onactive (file) {
    // suspend a random one when the pool
    if (this.active.length >= this.maxSize) {
      const r = Math.floor(Math.random() * this.active.length)
      this.active[r].suspend()
    }

    file._pi = this.active.push(file) - 1
  }

  _oninactive (file) {
    const head = this.active.pop()
    if (head !== file) {
      head._pi = file._pi
      this.active[head._pi] = head
    }
  }
}

module.exports = class RandomAccessFile extends RandomAccessStorage {
  constructor (filename, opts = {}) {
    const size = opts.size || (opts.truncate ? 0 : -1)

    super()

    if (opts.directory) filename = path.join(opts.directory, path.resolve('/', filename).replace(/^\w+:\\/, ''))

    this.directory = opts.directory || null
    this.filename = filename
    this.fd = 0

    const {
      readable = true,
      writable = true
    } = opts

    this.mode = readable && writable ? RDWR : (readable ? RDONLY : WRONLY)

    this._pi = 0 // pool index
    this._pool = opts.pool || null
    this._size = size
    this._rmdir = !!opts.rmdir
    this._lock = opts.lock === true
    this._sparse = opts.sparse === true
    this._alloc = opts.alloc || Buffer.allocUnsafe
    this._alwaysCreate = size >= 0
  }

  static createPool (maxSize) {
    return new Pool(maxSize)
  }

  _open (req) {
    const create = this._alwaysCreate || this.writing // .writing comes from RAS
    const self = this
    const mode = this.mode | (create ? CREAT : 0)

    if (create) fs.mkdir(path.dirname(this.filename), { recursive: true }, ondir)
    else ondir(null)

    function ondir (err) {
      if (err) return req.callback(err)
      fs.open(self.filename, mode, onopen)
    }

    function onopen (err, fd) {
      if (err) return onerror(err)

      self.fd = fd

      if (!self._lock || !fsext) return onlock(null)

      // Should we aquire a read lock?
      const shared = self.mode === RDONLY

      if (fsext.tryLock(self.fd, { shared })) onlock(null)
      else onlock(createLockError(self.filename))
    }

    function onlock (err) {
      if (err) return onerrorafteropen(err)

      if (!self._sparse || !fsext || self.mode === RDONLY) return onsparse(null)

      fsext.sparse(self.fd).then(onsparse, onsparse)
    }

    function onsparse (err) {
      if (err) return onerrorafteropen(err)

      if (self._size < 0) return ontruncate(null)

      fs.ftruncate(self.fd, self._size, ontruncate)
    }

    function ontruncate (err) {
      if (err) return onerrorafteropen(err)
      if (self._pool !== null) self._pool._onactive(self)
      req.callback(null)
    }

    function onerror (err) {
      req.callback(err)
    }

    function onerrorafteropen (err) {
      fs.close(self.fd, function () {
        self.fd = 0
        onerror(err)
      })
    }
  }

  _write (req) {
    const data = req.data
    const fd = this.fd

    fs.write(fd, data, 0, req.size, req.offset, onwrite)

    function onwrite (err, wrote) {
      if (err) return req.callback(err)

      req.size -= wrote
      req.offset += wrote

      if (!req.size) return req.callback(null)
      fs.write(fd, data, data.length - req.size, req.size, req.offset, onwrite)
    }
  }

  _read (req) {
    const self = this
    const data = req.data || this._alloc(req.size)
    const fd = this.fd

    if (!req.size) return process.nextTick(readEmpty, req)
    fs.read(fd, data, 0, req.size, req.offset, onread)

    function onread (err, read) {
      if (err) return req.callback(err)
      if (!read) return req.callback(createReadError(self.filename, req.offset, req.size))

      req.size -= read
      req.offset += read

      if (!req.size) return req.callback(null, data)
      fs.read(fd, data, data.length - req.size, req.size, req.offset, onread)
    }
  }

  _del (req) {
    if (req.size === Infinity) return this._truncate(req) // TODO: remove this when all callsites use truncate

    if (!fsext) return req.callback(null)

    fsext.trim(this.fd, req.offset, req.size).then(ontrim, ontrim)

    function ontrim (err) {
      req.callback(err)
    }
  }

  _truncate (req) {
    fs.ftruncate(this.fd, req.offset, ontruncate)

    function ontruncate (err) {
      req.callback(err)
    }
  }

  _stat (req) {
    fs.fstat(this.fd, onstat)

    function onstat (err, st) {
      req.callback(err, st)
    }
  }

  _close (req) {
    const self = this

    fs.close(this.fd, onclose)

    function onclose (err) {
      if (err) return req.callback(err)
      if (self._pool !== null) self._pool._oninactive(self)
      self.fd = 0
      req.callback(null)
    }
  }

  _unlink (req) {
    const self = this

    const root = this.directory && path.resolve(path.join(this.directory, '.'))
    let dir = path.resolve(path.dirname(this.filename))

    fs.unlink(this.filename, onunlink)

    function onunlink (err) {
      // if the file isn't there, its already unlinked, ignore
      if (err && err.code === 'ENOENT') err = null

      if (err || !self._rmdir || !root || dir === root) return req.callback(err)
      fs.rmdir(dir, onrmdir)
    }

    function onrmdir (err) {
      dir = path.join(dir, '..')
      if (err || dir === root) return req.callback(null)
      fs.rmdir(dir, onrmdir)
    }
  }
}

function readEmpty (req) {
  req.callback(null, Buffer.alloc(0))
}

function createLockError (path) {
  const err = new Error('ELOCKED: File is locked')
  err.code = 'ELOCKED'
  err.path = path
  return err
}

function createReadError (path, offset, size) {
  const err = new Error('EPARTIALREAD: Could not satisfy length')
  err.code = 'EPARTIALREAD'
  err.path = path
  err.offset = offset
  err.size = size
  return err
}

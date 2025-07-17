const binding = require('./binding')
const stream = require('readable-stream')
const util = require('util')
const unordered = require('unordered-set')
const dns = require('dns')
const timeout = require('timeout-refresh')

const EMPTY = Buffer.alloc(0)
const UTP_ERRORS = [
  'UTP_ECONNREFUSED',
  'UTP_ECONNRESET',
  'UTP_ETIMEDOUT',
  'UTP_UNKNOWN'
]

module.exports = Connection

function Connection (utp, port, address, handle, halfOpen) {
  stream.Duplex.call(this)

  this.remoteAddress = address
  this.remoteFamily = 'IPv4'
  this.remotePort = port
  this.destroyed = false

  this._index = -1
  this._utp = utp
  this._handle = handle || Buffer.alloc(binding.sizeof_utp_napi_connection_t)
  this._buffer = Buffer.allocUnsafe(65536 * 2)
  this._offset = 0
  this._view = new Uint32Array(this._handle.buffer, this._handle.byteOffset, 2)
  this._callback = null
  this._writing = null
  this._error = null
  this._connected = false
  this._needsConnect = !handle
  this._timeout = null
  this._contentSize = 0
  this._allowOpen = halfOpen ? 2 : 1

  this.on('finish', this._shutdown)

  binding.utp_napi_connection_init(this._handle, this, this._buffer,
    this._onread,
    this._ondrain,
    this._onend,
    this._onerror,
    this._onclose,
    this._onconnect,
    this._realloc
  )

  unordered.add(utp.connections, this)
  if (utp.maxConnections && utp.connections.length >= utp.maxConnections) {
    utp.firewall(true)
  }
}

util.inherits(Connection, stream.Duplex)

Connection.prototype.setTimeout = function (ms, ontimeout) {
  if (ontimeout) this.once('timeout', ontimeout)
  if (this._timeout) this._timeout.destroy()
  this._timeout = timeout(ms, this._ontimeout, this)
}

Connection.prototype._ontimeout = function () {
  this.emit('timeout')
}

Connection.prototype.setInteractive = function (interactive) {
  this.setPacketSize(this.interactive ? 0 : 65536)
}

Connection.prototype.setContentSize = function (size) {
  this._view[0] = size < 65536 ? (size >= 0 ? size : 0) : 65536
  this._contentSize = size
}

Connection.prototype.setPacketSize = function (size) {
  if (size > 65536) size = 65536
  this._view[0] = size
  this._contentSize = 0
}

Connection.prototype.address = function () {
  if (this.destroyed) return null
  return this._utp.address()
}

Connection.prototype._read = function () {
  // TODO: backpressure
}

Connection.prototype._write = function (data, enc, cb) {
  if (this.destroyed) return

  if (!this._connected || !binding.utp_napi_connection_write(this._handle, data)) {
    this._callback = cb
    this._writing = new Array(1)
    this._writing[0] = data
    return
  }

  cb(null)
}

Connection.prototype._writev = function (datas, cb) {
  if (this.destroyed) return

  const bufs = new Array(datas.length)
  for (var i = 0; i < datas.length; i++) bufs[i] = datas[i].chunk

  if (bufs.length > 256) return this._write(Buffer.concat(bufs), null, cb)

  if (!binding.utp_napi_connection_writev(this._handle, bufs)) {
    this._callback = cb
    this._writing = bufs
    return
  }

  cb(null)
}

Connection.prototype._realloc = function () {
  this._buffer = Buffer.allocUnsafe(this._buffer.length)
  this._offset = 0
  return this._buffer
}

Connection.prototype._onread = function (size) {
  if (!this._connected) this._onconnect() // makes the server wait for reads before writes
  if (this._timeout) this._timeout.refresh()

  const buf = this._buffer.slice(this._offset, this._offset += size)

  if (this._contentSize) {
    if (size > this._contentSize) size = this._contentSize
    this._contentSize -= size
    if (this._contentSize < 65536) this._view[0] = this._contentSize
  }

  this.push(buf)

  // 64kb + 4kb as max package buffer is 64kb and we wanna make sure we have room for that
  // plus the next udp package
  if (this._buffer.length - this._offset <= 69632) {
    this._buffer = Buffer.allocUnsafe(this._buffer.length)
    this._offset = 0
    return this._buffer
  }

  return EMPTY
}

Connection.prototype._ondrain = function () {
  this._writing = null
  const cb = this._callback
  this._callback = null
  cb(null)
}

Connection.prototype._onclose = function () {
  unordered.remove(this._utp.connections, this)
  if (!this._utp.maxConnections || this._utp.connections.length < this._utp.maxConnections) {
    this._utp.firewall(false)
  }
  this._handle = null
  if (this._error) this.emit('error', this._error)
  this.emit('close')
  this._utp._closeMaybe()
}

Connection.prototype._onerror = function (status) {
  this.destroy(createUTPError(status))
}

Connection.prototype._onend = function () {
  if (this._timeout) this._timeout.destroy()
  this.push(null)
  this._destroyMaybe()
}

Connection.prototype._resolveAndConnect = function (port, host) {
  const self = this
  dns.lookup(host, function (err, ip) {
    if (err) return self.destroy(err)
    if (!ip) return self.destroy(new Error('Could not resolve ' + host))
    self._connect(port, ip)
  })
}

Connection.prototype._connect = function (port, ip) {
  if (this.destroyed) return
  this._needsConnect = false
  this.remoteAddress = ip
  binding.utp_napi_connect(this._utp._handle, this._handle, port, ip)
}

Connection.prototype._onconnect = function () {
  if (this._timeout) this._timeout.refresh()

  this._connected = true
  if (this._writing) {
    const cb = this._callback
    const data = this._writing[0]
    this._callback = null
    this._writing = null
    this._write(data, null, cb)
  }
  this.emit('connect')
}

Connection.prototype.destroy = function (err) {
  if (this.destroyed) return
  this.destroyed = true
  if (err) this._error = err
  if (this._needsConnect) return process.nextTick(onbindingclose, this)
  binding.utp_napi_connection_close(this._handle)
}

Connection.prototype._destroyMaybe = function () {
  if (this._allowOpen && !--this._allowOpen) this.destroy()
}

Connection.prototype._shutdown = function () {
  if (this.destroyed) return
  binding.utp_napi_connection_shutdown(this._handle)
  this._destroyMaybe()
}

function onbindingclose (self) {
  binding.utp_napi_connection_on_close(self._handle)
}

function createUTPError (code) {
  const str = UTP_ERRORS[code < 0 ? 3 : code]
  const err = new Error(str)
  err.code = str
  err.errno = code
  return err
}

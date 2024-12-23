var dgram = require('dgram')
var bencode = require('bencode')
var isIP = require('net').isIP
var dns = require('dns')
var util = require('util')
var events = require('events')

var ETIMEDOUT = new Error('Query timed out')
ETIMEDOUT.code = 'ETIMEDOUT'

var EUNEXPECTEDNODE = new Error('Unexpected node id')
EUNEXPECTEDNODE.code = 'EUNEXPECTEDNODE'

module.exports = RPC

function RPC (opts) {
  if (!(this instanceof RPC)) return new RPC(opts)
  if (!opts) opts = {}

  var self = this

  this.timeout = opts.timeout || 2000
  this.inflight = 0
  this.destroyed = false
  this.isIP = opts.isIP || isIP
  this.socket = opts.socket || dgram.createSocket('udp4')
  this.socket.on('message', onmessage)
  this.socket.on('error', onerror)
  this.socket.on('listening', onlistening)

  this._tick = 0
  this._ids = []
  this._reqs = []
  this._timer = setInterval(check, Math.floor(this.timeout / 4))

  events.EventEmitter.call(this)

  function check () {
    var missing = self.inflight
    if (!missing) return
    for (var i = 0; i < self._reqs.length; i++) {
      var req = self._reqs[i]
      if (!req) continue
      if (req.ttl) req.ttl--
      else self._cancel(i, ETIMEDOUT)
      if (!--missing) return
    }
  }

  function onlistening () {
    self.emit('listening')
  }

  function onerror (err) {
    if (err.code === 'EACCES' || err.code === 'EADDRINUSE') self.emit('error', err)
    else self.emit('warning', err)
  }

  function onmessage (buf, rinfo) {
    if (self.destroyed) return
    if (!rinfo.port) return // seems like a node bug that this is nessesary?

    try {
      var message = bencode.decode(buf)
    } catch (e) {
      return self.emit('warning', e)
    }

    var type = message && message.y && message.y.toString()

    if (type === 'r' || type === 'e') {
      if (!Buffer.isBuffer(message.t)) return

      try {
        var tid = message.t.readUInt16BE(0)
      } catch (err) {
        return self.emit('warning', err)
      }

      var index = self._ids.indexOf(tid)
      if (index === -1 || tid === 0) {
        self.emit('response', message, rinfo)
        self.emit('warning', new Error('Unexpected transaction id: ' + tid))
        return
      }

      var req = self._reqs[index]
      if (req.peer.host !== rinfo.address) {
        self.emit('response', message, rinfo)
        self.emit('warning', new Error('Out of order response'))
        return
      }

      self._ids[index] = 0
      self._reqs[index] = null
      self.inflight--

      if (type === 'e') {
        var isArray = Array.isArray(message.e)
        var err = new Error(isArray ? message.e.join(' ') : 'Unknown error')
        err.code = isArray && message.e.length && typeof message.e[0] === 'number' ? message.e[0] : 0
        req.callback(err, message, rinfo, req.message)
        self.emit('update')
        self.emit('postupdate')
        return
      }

      var rid = message.r && message.r.id
      if (req.peer && req.peer.id && rid && !req.peer.id.equals(rid)) {
        req.callback(EUNEXPECTEDNODE, null, rinfo)
        self.emit('update')
        self.emit('postupdate')
        return
      }

      req.callback(null, message, rinfo, req.message)
      self.emit('update')
      self.emit('postupdate')
      self.emit('response', message, rinfo)
    } else if (type === 'q') {
      self.emit('query', message, rinfo)
    } else {
      self.emit('warning', new Error('Unknown type: ' + type))
    }
  }
}

util.inherits(RPC, events.EventEmitter)

RPC.prototype.address = function () {
  return this.socket.address()
}

RPC.prototype.response = function (peer, req, res, cb) {
  this.send(peer, { t: req.t, y: 'r', r: res }, cb)
}

RPC.prototype.error = function (peer, req, error, cb) {
  this.send(peer, { t: req.t, y: 'e', e: [].concat(error.message || error) }, cb)
}

RPC.prototype.send = function (peer, message, cb) {
  var buf = bencode.encode(message)
  this.socket.send(buf, 0, buf.length, peer.port, peer.address || peer.host, cb || noop)
}

// bind([port], [address], [callback])
RPC.prototype.bind = function () {
  this.socket.bind.apply(this.socket, arguments)
}

RPC.prototype.destroy = function (cb) {
  this.destroyed = true
  clearInterval(this._timer)
  if (cb) this.socket.on('close', cb)
  for (var i = 0; i < this._ids.length; i++) this._cancel(i)
  this.socket.close()
}

RPC.prototype.query = function (peer, query, cb) {
  if (!cb) cb = noop
  if (!this.isIP(peer.host)) return this._resolveAndQuery(peer, query, cb)

  var message = {
    t: Buffer.allocUnsafe(2),
    y: 'q',
    q: query.q,
    a: query.a
  }

  var req = {
    ttl: 4,
    peer: peer,
    message: message,
    callback: cb
  }

  if (this._tick === 65535) this._tick = 0
  var tid = ++this._tick

  var free = this._ids.indexOf(0)
  if (free === -1) free = this._ids.push(0) - 1
  this._ids[free] = tid
  while (this._reqs.length < free) this._reqs.push(null)
  this._reqs[free] = req

  this.inflight++
  message.t.writeUInt16BE(tid, 0)
  this.send(peer, message)
  return tid
}

RPC.prototype.cancel = function (tid, err) {
  var index = this._ids.indexOf(tid)
  if (index > -1) this._cancel(index, err)
}

RPC.prototype._cancel = function (index, err) {
  var req = this._reqs[index]
  this._ids[index] = 0
  this._reqs[index] = null
  if (req) {
    this.inflight--
    req.callback(err || new Error('Query was cancelled'), null, req.peer)
    this.emit('update')
    this.emit('postupdate')
  }
}

RPC.prototype._resolveAndQuery = function (peer, query, cb) {
  var self = this

  dns.lookup(peer.host, function (err, ip) {
    if (err) return cb(err)
    if (self.destroyed) return cb(new Error('k-rpc-socket is destroyed'))
    self.query({ host: ip, port: peer.port }, query, cb)
  })
}

function noop () {}

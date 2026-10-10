import dgram from 'dgram'
import Debug from 'debug'
import { EventEmitter } from 'events'

const debug = Debug('nat-pmp')

// Ports defined by draft
const CLIENT_PORT = 5350
const SERVER_PORT = 5351

// Opcodes
const OP_EXTERNAL_IP = 0
const OP_MAP_UDP = 1
const OP_MAP_TCP = 2
const SERVER_DELTA = 128

// Resulit codes
const RESULT_CODES = {
  0: 'Success',
  1: 'Unsupported Version',
  2: 'Not Authorized/Refused (gateway may have NAT-PMP disabled)',
  3: 'Network Failure (gateway may have not obtained a DHCP lease)',
  4: 'Out of Resources (no ports left)',
  5: 'Unsupported opcode'
}

export default class Client extends EventEmitter {
  constructor (gateway) {
    super()

    if (!gateway) throw new Error('gateway is not defined')

    this.gateway = gateway

    this._queue = []
    this._connecting = false
    this._listening = false
    this._req = null
    this._reqActive = false

    // Create socket
    this.socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })
    this.socket.on('listening', this.onListening.bind(this))
    this.socket.on('message', this.onMessage.bind(this))
    this.socket.on('close', this.onClose.bind(this))
    this.socket.on('error', this.onError.bind(this))

    // Try to connect
    this.connect()
  }

  connect () {
    debug('Client#connect()')
    if (this._connecting) return
    this._connecting = true
    this.socket.bind(CLIENT_PORT)
  }

  async portMapping (opts) {
    debug('Client#portMapping()')
    let opcode
    switch (String(opts.type || 'tcp').toLowerCase()) {
      case 'tcp':
        opcode = OP_MAP_TCP
        break
      case 'udp':
        opcode = OP_MAP_UDP
        break
      default:
        throw new Error('"type" must be either "tcp" or "udp"')
    }
    return this._request(opcode, opts)
  }

  portUnmapping (opts) {
    debug('Client#portUnmapping()')
    opts.ttl = 0
    return this.portMapping(opts)
  }

  async externalIp () {
    debug('Client#externalIp()')
    const { ip } = await this._request(OP_EXTERNAL_IP)
    if (ip) {
      return ip.join('.')
    } else {
      throw new Error('no external IP address returned')
    }
  }

  async close () {
    debug('Client#close()')
    if (this.socket) {
      await new Promise(resolve => {
        try {
          this.socket.close(resolve)
        } catch (error) {
          resolve()
          // Discard Error
        }
      })
    }
    this.socket = null

    this._queue = []
    this._connecting = false
    this._listening = false
    this._req = null
    this._reqActive = false
  }

  /**
   * Queues a UDP request to be send to the gateway device.
   */

  _request (op, obj) {
    return new Promise((resolve, reject) => {
      debug('Client#request()', [op, obj])

      let buf
      let size
      let pos = 0

      let internal
      let external
      let ttl

      switch (op) {
        case OP_MAP_UDP:
        case OP_MAP_TCP:
          if (!obj) reject(new Error('mapping a port requires an "options" object'))

          internal = +(obj.private || obj.internal || 0)
          if (internal !== (internal | 0) || internal < 0) {
            reject(new Error('the "private" port must be a whole integer >= 0'))
          }

          external = +(obj.public || obj.external || 0)
          if (external !== (external | 0) || external < 0) {
            reject(new Error('the "public" port must be a whole integer >= 0'))
          }

          ttl = +(obj.ttl)
          if (ttl !== (ttl | 0)) {
            // The RECOMMENDED Port Mapping Lifetime is 7200 seconds (two hours)
            ttl = 7200
          }

          size = 12
          buf = Buffer.alloc(size)
          buf.writeUInt8(0, pos)
          pos++ // Vers = 0
          buf.writeUInt8(op, pos)
          pos++ // OP = x
          buf.writeUInt16BE(0, pos)
          pos += 2 // Reserved (MUST be zero)
          buf.writeUInt16BE(internal, pos)
          pos += 2 // Internal Port
          buf.writeUInt16BE(external, pos)
          pos += 2 // Requested External Port
          buf.writeUInt32BE(ttl, pos)
          pos += 4 // Requested Port Mapping Lifetime in Seconds
          break
        case OP_EXTERNAL_IP:
          size = 2
          buf = Buffer.alloc(size)
          // Vers = 0
          buf.writeUInt8(0, 0)
          pos++
          // OP = x
          buf.writeUInt8(op, 1)
          pos++
          break
        default:
          throw new Error('Invalid opcode: ', op)
      }
      // assert.equal(pos, size, 'buffer not fully written!')

      // Add it to queue
      this._queue.push({ buf, resolve, reject, op })

      // Try to send next message
      this._next()
    })
  }

  /**
   * Processes the next request if the socket is listening.
   */

  _next () {
    debug('Client#_next()')

    const req = this._queue[0]

    if (!req) {
      debug('_next: nothing to process')
      return
    }
    if (!this.socket) {
      debug('_next: client is closed')
      return
    }
    if (!this._listening) {
      debug('_next: not "listening" yet, cannot send out request yet')
      if (!this._connecting) this.connect()
      return
    }
    if (this._reqActive) {
      debug('_next: already an active request so wait...')
      return
    }

    this._reqActive = true
    this._req = req

    const buf = req.buf

    debug('_next: sending request', buf, this.gateway)
    this.socket.send(buf, 0, buf.length, SERVER_PORT, this.gateway)
  }

  onListening () {
    debug('Client#onListening()')
    this._listening = true
    this._connecting = false

    // Try to send next message
    this._next()
  }

  onMessage (msg, rinfo) {
    // Ignore message if we're not expecting it
    if (this._queue.length === 0) return

    debug('Client#onMessage()', [msg, rinfo])

    const cb = (err, ...args) => {
      this._req = null
      this._reqActive = false

      if (err) {
        if (req.reject) {
          req.reject.call(this, err)
        } else {
          this.emit('error', err)
        }
      } else if (req.resolve) {
        req.resolve.apply(this, args)
      }

      // Try to send next message
      this._next()
    }

    const req = this._queue[0]
    const parsed = { msg }
    parsed.vers = msg.readUInt8(0)
    parsed.op = msg.readUInt8(1)

    if (parsed.op - SERVER_DELTA !== req.op) {
      debug('WARN: ignoring unexpected message opcode', parsed.op)
      return
    }

    // if we got here, then we're gonna invoke the request's callback,
    // so shift this request off of the queue.
    debug('removing "req" off of the queue')
    this._queue.shift()

    if (parsed.vers !== 0) {
      cb(new Error('"vers" must be 0. Got: ' + parsed.vers))
      return
    }

    // Common fields
    parsed.resultCode = msg.readUInt16BE(2)
    parsed.resultMessage = RESULT_CODES[parsed.resultCode]
    parsed.epoch = msg.readUInt32BE(4)

    // Error
    if (parsed.resultCode !== 0) {
      const err = new Error(parsed.resultMessage)
      err.code = parsed.resultCode
      return cb(err)
    }

    // Success
    switch (req.op) {
      case OP_MAP_UDP:
      case OP_MAP_TCP:
        parsed.private = parsed.internal = msg.readUInt16BE(8)
        parsed.public = parsed.external = msg.readUInt16BE(10)
        parsed.ttl = msg.readUInt32BE(12)
        parsed.type = (req.op === OP_MAP_UDP) ? 'udp' : 'tcp'
        break
      case OP_EXTERNAL_IP:
        parsed.ip = []
        parsed.ip.push(msg.readUInt8(8))
        parsed.ip.push(msg.readUInt8(9))
        parsed.ip.push(msg.readUInt8(10))
        parsed.ip.push(msg.readUInt8(11))
        break
      default:
        return cb(new Error('Unknown opcode: ' + req.op))
    }

    cb(null, parsed)
  }

  onClose () {
    debug('Client#onClose()')
    this._listening = false
    this._connecting = false
    this.socket = null
  }

  onError (err) {
    debug('Client#onError()', [err])
    if (this._req && this._req.cb) {
      this._req.cb(err)
    } else {
      this.emit('error', err)
    }

    if (this.socket) {
      this.socket.close()
      // Force close - close() does not guarantee to trigger onClose()
      this.onClose()
    }
  }
}

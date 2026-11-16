/*! lt_donthave. MIT License. WebTorrent LLC <https://webtorrent.io/opensource> */
import arrayRemove from 'unordered-array-remove'
import { EventEmitter } from 'events'
import debugFactory from 'debug'

const debug = debugFactory('lt_donthave')

export default () => {
  class ltDontHave extends EventEmitter {
    constructor (wire) {
      super()

      this._peerSupports = false
      this._wire = wire
    }

    onExtendedHandshake () {
      this._peerSupports = true
    }

    onMessage (buf) {
      let index
      try {
        const view = new DataView(buf.buffer)
        index = view.getUint32(0)
      } catch (err) {
        // drop invalid messages
        return
      }

      if (!this._wire.peerPieces.get(index)) return
      debug('got donthave %d', index)
      this._wire.peerPieces.set(index, false)

      this.emit('donthave', index)
      this._failRequests(index)
    }

    donthave (index) {
      if (!this._peerSupports) return

      debug('donthave %d', index)
      const buf = new Uint8Array(4)
      const view = new DataView(buf.buffer)
      view.setUint32(0, index)

      this._wire.extended('lt_donthave', buf)
    }

    _failRequests (index) {
      const requests = this._wire.requests
      for (let i = 0; i < requests.length; i++) {
        const req = requests[i]
        if (req.piece === index) {
          arrayRemove(requests, i)
          i -= 1 // Check the new value at the same slot
          this._wire._callback(req, new Error('peer sent donthave'), null)
        }
      }
    }
  }

  // Name of the bittorrent-protocol extension
  ltDontHave.prototype.name = 'lt_donthave'

  return ltDontHave
}

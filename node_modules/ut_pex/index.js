/*! ut_pex. MIT License. WebTorrent LLC <https://webtorrent.io/opensource> */

import { EventEmitter } from 'events'
import compact2string from 'compact2string'
import string2compact from 'string2compact'
import bencode from 'bencode'

const PEX_INTERVAL = 65000 // just over one minute
const PEX_MAX_PEERS = 50 // max number of peers to advertise per PEX message
const PEX_MIN_ALLOWED_INTERVAL = 60000 // should not receive messages below this interval

const FLAGS = {
  prefersEncryption: 0x01,
  isSender: 0x02,
  supportsUtp: 0x04,
  supportsUtHolepunch: 0x08,
  isReachable: 0x10
}

export default () => {
  class utPex extends EventEmitter {
    constructor (wire) {
      super()

      this._wire = wire
      this._intervalId = null
      this._lastMessageTimestamp = 0

      this.reset()
    }

    /**
     * Start sending regular PEX updates to remote peer.
     */
    start () {
      clearInterval(this._intervalId)
      this._intervalId = setInterval(() => this._sendMessage(), PEX_INTERVAL)
      if (this._intervalId.unref) this._intervalId.unref()
    }

    /**
     * Stop sending PEX updates to the remote peer.
     */
    stop () {
      clearInterval(this._intervalId)
      this._intervalId = null
    }

    /**
     * Stops sending updates to the remote peer and resets internal state of peers seen.
     */
    reset () {
      this._remoteAddedPeers = {}
      this._remoteDroppedPeers = {}
      this._localAddedPeers = {}
      this._localDroppedPeers = {}
      this.stop()
    }

    /**
     * Adds a IPv4 peer to the locally discovered peer list for the next PEX message.
     */
    addPeer (peer, flags = {}) {
      this._addPeer(peer, this._encodeFlags(flags), 4)
    }

    /**
     * Adds a IPv6 peer to the locally discovered peer list for the next PEX message.
     */
    addPeer6 (peer, flags = {}) {
      this._addPeer(peer, this._encodeFlags(flags), 6)
    }

    _addPeer (peer, flags, version) {
      if (!peer.includes(':')) return // disregard invalid peers
      if (peer in this._remoteAddedPeers) return // never advertise peer the remote wire already sent us
      if (peer in this._localDroppedPeers) delete this._localDroppedPeers[peer]
      this._localAddedPeers[peer] = { ip: version, flags }
    }

    /**
     * Adds a IPv4 peer to the locally dropped peer list for the next PEX message.
     */
    dropPeer (peer) {
      this._dropPeer(peer, 4)
    }

    /**
     * Adds a IPv6 peer to the locally dropped peer list for the next PEX message.
     */
    dropPeer6 (peer) {
      this._dropPeer(peer, 6)
    }

    _dropPeer (peer, version) {
      if (!peer.includes(':')) return // disregard invalid peers
      if (peer in this._remoteDroppedPeers) return // never advertise peer the remote wire already sent us
      if (peer in this._localAddedPeers) delete this._localAddedPeers[peer]
      this._localDroppedPeers[peer] = { ip: version }
    }

    onExtendedHandshake (handshake) {
      if (!handshake.m || !handshake.m.ut_pex) {
        return this.emit('warning', new Error('Peer does not support ut_pex'))
      }
    }

    /**
     * PEX messages are bencoded dictionaries with the following keys:
     * 'added'     : array of peers met since last PEX message
     * 'added.f'   : array of flags per peer
     * 'dropped'   : array of peers locally dropped from swarm since last PEX message
     * 'added6'    : ipv6 version of 'added'
     * 'added6.f'  : ipv6 version of 'added.f'
     * 'dropped6'  : ipv6 version of 'dropped'
     *
     * @param {Buffer} buf bencoded PEX dictionary
     */
    onMessage (buf) {
      // check message rate
      const currentMessageTimestamp = Date.now()

      if (currentMessageTimestamp - this._lastMessageTimestamp < PEX_MIN_ALLOWED_INTERVAL) {
        this.reset()
        this._wire.destroy()
        return this.emit('warning', new Error('Peer disconnected for sending PEX messages too frequently'))
      } else {
        this._lastMessageTimestamp = currentMessageTimestamp
      }

      let message

      try {
        message = bencode.decode(buf)

        if (message.added) {
          compact2string.multi(Buffer.from(message.added)).forEach((peer, idx) => {
            delete this._remoteDroppedPeers[peer]
            if (!(peer in this._remoteAddedPeers)) {
              const flags = message['added.f'][idx]
              this._remoteAddedPeers[peer] = { ip: 4, flags }
              this.emit('peer', peer, this._decodeFlags(flags))
            }
          })
        }

        if (message.added6) {
          compact2string.multi6(Buffer.from(message.added6)).forEach((peer, idx) => {
            delete this._remoteDroppedPeers[peer]
            if (!(peer in this._remoteAddedPeers)) {
              const flags = message['added6.f'][idx]
              this._remoteAddedPeers[peer] = { ip: 6, flags }
              this.emit('peer', peer, this._decodeFlags(flags))
            }
          })
        }

        if (message.dropped) {
          compact2string.multi(Buffer.from(message.dropped)).forEach(peer => {
            delete this._remoteAddedPeers[peer]
            if (!(peer in this._remoteDroppedPeers)) {
              this._remoteDroppedPeers[peer] = { ip: 4 }
              this.emit('dropped', peer)
            }
          })
        }

        if (message.dropped6) {
          compact2string.multi6(Buffer.from(message.dropped6)).forEach(peer => {
            delete this._remoteAddedPeers[peer]
            if (!(peer in this._remoteDroppedPeers)) {
              this._remoteDroppedPeers[peer] = { ip: 6 }
              this.emit('dropped', peer)
            }
          })
        }
      } catch (err) {
        // drop invalid messages
      }
    }

    /**
     * Decode PEX bit-flags
     * @param {Number} flags one byte number
     * @returns {Object} based on boolean properties
     */
    _decodeFlags (flags) {
      return {
        prefersEncryption: !!(flags & FLAGS.prefersEncryption),
        isSender: !!(flags & FLAGS.isSender),
        supportsUtp: !!(flags & FLAGS.supportsUtp),
        supportsUtHolepunch: !!(flags & FLAGS.supportsUtHolepunch),
        isReachable: !!(flags & FLAGS.isReachable)
      }
    }

    /**
     * Emcode PEX bit-flags
     * @param {Object} flags  based on boolean properties
     * @returns {Number} one byte number
     */
    _encodeFlags (flags) {
      return Object.keys(flags).reduce((acc, cur) => (flags[cur] === true)
        ? acc | FLAGS[cur]
        : acc, 0x00)
    }

    /**
     * Sends a PEX message to the remote peer including information about any locally
     * added / dropped peers.
     */
    _sendMessage () {
      const localAdded = Object.keys(this._localAddedPeers).slice(0, PEX_MAX_PEERS)
      const localDropped = Object.keys(this._localDroppedPeers).slice(0, PEX_MAX_PEERS)

      const _isIPv4 = (peers, addr) => peers[addr].ip === 4
      const _isIPv6 = (peers, addr) => peers[addr].ip === 6
      const _flags = (peers, addr) => peers[addr].flags

      const added = string2compact(
        localAdded.filter(k => _isIPv4(this._localAddedPeers, k))
      )

      const added6 = string2compact(
        localAdded.filter(k => _isIPv6(this._localAddedPeers, k))
      )

      const dropped = string2compact(
        localDropped.filter(k => _isIPv4(this._localDroppedPeers, k))
      )

      const dropped6 = string2compact(
        localDropped.filter(k => _isIPv6(this._localDroppedPeers, k))
      )

      const addedFlags = Buffer.from(
        localAdded.filter(k => _isIPv4(this._localAddedPeers, k)).map(k => _flags(this._localAddedPeers, k))
      )

      const added6Flags = Buffer.from(
        localAdded.filter(k => _isIPv6(this._localAddedPeers, k)).map(k => _flags(this._localAddedPeers, k))
      )

      // update local deltas
      localAdded.forEach(peer => delete this._localAddedPeers[peer])
      localDropped.forEach(peer => delete this._localDroppedPeers[peer])

      // send PEX message
      this._wire.extended('ut_pex', {
        added,
        'added.f': addedFlags,
        dropped,
        added6,
        'added6.f': added6Flags,
        dropped6
      })
    }
  }

  utPex.prototype.name = 'ut_pex'

  return utPex
}

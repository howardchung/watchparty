/*! ut_metadata. MIT License. WebTorrent LLC <https://webtorrent.io/opensource> */
import { EventEmitter } from 'events'
import bencode from 'bencode'
import BitField from 'bitfield'
import Debug from 'debug'
import { hash, arr2text, concat } from 'uint8-util'

const debug = Debug('ut_metadata')

const MAX_METADATA_SIZE = 1E7 // 10 MB
const BITFIELD_GROW = 1E3
const PIECE_LENGTH = 1 << 14 // 16 KiB

export default metadata => {
  class utMetadata extends EventEmitter {
    constructor (wire) {
      super()

      this._wire = wire

      this._fetching = false
      this._metadataComplete = false
      this._metadataSize = null
      // how many reject messages to tolerate before quitting
      this._remainingRejects = null

      // The largest torrent file that I know of is ~1-2MB, which is ~100
      // pieces. Therefore, cap the bitfield to 10x that (1000 pieces) so a
      // malicious peer can't make it grow to fill all memory.
      this._bitfield = new BitField(0, { grow: BITFIELD_GROW })

      if (ArrayBuffer.isView(metadata)) {
        this.setMetadata(metadata)
      }
    }

    onHandshake (infoHash, peerId, extensions) {
      this._infoHash = infoHash
    }

    onExtendedHandshake (handshake) {
      if (!handshake.m || !handshake.m.ut_metadata) {
        return this.emit('warning', new Error('Peer does not support ut_metadata'))
      }
      if (!handshake.metadata_size) {
        return this.emit('warning', new Error('Peer does not have metadata'))
      }
      if (typeof handshake.metadata_size !== 'number' ||
          MAX_METADATA_SIZE < handshake.metadata_size ||
          handshake.metadata_size <= 0) {
        return this.emit('warning', new Error('Peer gave invalid metadata size'))
      }

      this._metadataSize = handshake.metadata_size
      this._numPieces = Math.ceil(this._metadataSize / PIECE_LENGTH)
      this._remainingRejects = this._numPieces * 2

      this._requestPieces()
    }

    onMessage (buf) {
      let dict
      let trailer
      try {
        const str = arr2text(buf)
        const trailerIndex = str.indexOf('ee') + 2
        dict = bencode.decode(str.substring(0, trailerIndex))
        trailer = buf.slice(trailerIndex)
      } catch (err) {
        // drop invalid messages
        return
      }

      switch (dict.msg_type) {
        case 0:
          // ut_metadata request (from peer)
          // example: { 'msg_type': 0, 'piece': 0 }
          this._onRequest(dict.piece)
          break
        case 1:
          // ut_metadata data (in response to our request)
          // example: { 'msg_type': 1, 'piece': 0, 'total_size': 3425 }
          this._onData(dict.piece, trailer, dict.total_size)
          break
        case 2:
          // ut_metadata reject (peer doesn't have piece we requested)
          // { 'msg_type': 2, 'piece': 0 }
          this._onReject(dict.piece)
          break
      }
    }

    /**
     * Ask the peer to send metadata.
     * @public
     */
    fetch () {
      if (this._metadataComplete) {
        return
      }
      this._fetching = true
      if (this._metadataSize) {
        this._requestPieces()
      }
    }

    /**
     * Stop asking the peer to send metadata.
     * @public
     */
    cancel () {
      this._fetching = false
    }

    async setMetadata (metadata) {
      if (this._metadataComplete) return true
      debug('set metadata')

      // if full torrent dictionary was passed in, pull out just `info` key
      try {
        const info = bencode.decode(metadata).info
        if (info) {
          metadata = bencode.encode(info)
        }
      } catch (err) {}

      // check hash
      if (this._infoHash && this._infoHash !== await hash(metadata, 'hex')) {
        return false
      }

      this.cancel()

      this.metadata = metadata
      this._metadataComplete = true
      this._metadataSize = this.metadata.length
      this._wire.extendedHandshake.metadata_size = this._metadataSize

      this.emit('metadata', bencode.encode({
        info: bencode.decode(this.metadata)
      }))

      return true
    }

    _send (dict, trailer) {
      let buf = bencode.encode(dict)
      if (ArrayBuffer.isView(trailer)) {
        buf = concat([buf, trailer])
      }
      this._wire.extended('ut_metadata', buf)
    }

    _request (piece) {
      this._send({ msg_type: 0, piece })
    }

    _data (piece, buf, totalSize) {
      const msg = { msg_type: 1, piece }
      if (typeof totalSize === 'number') {
        msg.total_size = totalSize
      }
      this._send(msg, buf)
    }

    _reject (piece) {
      this._send({ msg_type: 2, piece })
    }

    _onRequest (piece) {
      if (!this._metadataComplete) {
        this._reject(piece)
        return
      }
      const start = piece * PIECE_LENGTH
      let end = start + PIECE_LENGTH
      if (end > this._metadataSize) {
        end = this._metadataSize
      }
      const buf = this.metadata.slice(start, end)
      this._data(piece, buf, this._metadataSize)
    }

    _onData (piece, buf, totalSize) {
      if (buf.length > PIECE_LENGTH || !this._fetching) {
        return
      }
      this.metadata.set(buf, piece * PIECE_LENGTH)
      this._bitfield.set(piece)
      this._checkDone()
    }

    _onReject (piece) {
      if (this._remainingRejects > 0 && this._fetching) {
        // If we haven't been rejected too much,
        // then try to request the piece again
        this._request(piece)
        this._remainingRejects -= 1
      } else {
        this.emit('warning', new Error('Peer sent "reject" too much'))
      }
    }

    _requestPieces () {
      if (!this._fetching) return
      this.metadata = new Uint8Array(this._metadataSize)
      for (let piece = 0; piece < this._numPieces; piece++) {
        this._request(piece)
      }
    }

    async _checkDone () {
      let done = true
      for (let piece = 0; piece < this._numPieces; piece++) {
        if (!this._bitfield.get(piece)) {
          done = false
          break
        }
      }
      if (!done) return

      // attempt to set metadata -- may fail sha1 check
      const success = await this.setMetadata(this.metadata)

      if (!success) {
        this._failedMetadata()
      }
    }

    _failedMetadata () {
      // reset bitfield & try again
      this._bitfield = new BitField(0, { grow: BITFIELD_GROW })
      this._remainingRejects -= this._numPieces
      if (this._remainingRejects > 0) {
        this._requestPieces()
      } else {
        this.emit('warning', new Error('Peer sent invalid metadata'))
      }
    }
  }

  // Name of the bittorrent-protocol extension
  utMetadata.prototype.name = 'ut_metadata'

  return utMetadata
}

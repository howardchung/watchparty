import RTCIceTransport from './RTCIceTransport.js'

/**
 * @class
 * @implements {globalThis.RTCDtlsTransport}
 */
export default class RTCDtlsTransport extends EventTarget {
  #iceTransport
  /** @type {import('./RTCPeerConnection.js').default} */
  #pc

  onerror
  onstatechange

  constructor ({ pc }) {
    super()
    this.#pc = pc
    this.#iceTransport = new RTCIceTransport({ pc })
  }

  get iceTransport () {
    return this.#iceTransport
  }

  get state () {
    if (this.#pc.connectionState === 'disconnected') return 'closed'
    return this.#pc.connectionState
  }

  getRemoteCertificates () {
    // not supported by all browsers anyways
    return [new ArrayBuffer(0)]
  }
}

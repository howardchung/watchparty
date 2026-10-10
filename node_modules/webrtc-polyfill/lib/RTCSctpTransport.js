import RTCDtlsTransport from './RTCDtlsTransport.js'

/**
 * @class
 * @implements {globalThis.RTCSctpTransport}
 */
export default class RTCSctpTransport extends EventTarget {
  #maxChannels = null
  /** @type {import('./RTCPeerConnection.js').default} */
  #pc
  #transport

  onstatechange
  onerror

  constructor ({ pc }) {
    super()
    this.#pc = pc
    this.#transport = new RTCDtlsTransport({ pc })

    pc.addEventListener('connectionstatechange', () => {
      const e = new Event('statechange')
      this.dispatchEvent(e)
      this.onstatechange?.(e)
    })
  }

  get maxChannels () {
    if (this.state !== 'connected') return null
    return this.#pc.maxChannels
  }

  get maxMessageSize () {
    return this.#pc.maxMessageSize ?? 65536
  }

  get state () {
    const state = this.#pc.connectionState
    if (state === 'new' || state === 'connecting') {
      return 'connecting'
    } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
      return 'closed'
    }
    return state
  }

  get transport () {
    return this.#transport
  }
}

import RTCIceCandidate from './RTCIceCandidate.js'

/**
 * @class
 * @implements {globalThis.RTCIceTransport}
 */
export default class RTCIceTransport extends EventTarget {
  #component = null
  #role = null
  /** @type {import('./RTCPeerConnection.js').default} */
  #pc

  ongatheringstatechange
  // TODO: not implemented
  onselectedcandidatepairchange
  onstatechange

  constructor ({ pc }) {
    super()
    this.#pc = pc

    pc.addEventListener('icegatheringstatechange', () => {
      const e = new Event('gatheringstatechange')
      this.dispatchEvent(e)
      this.ongatheringstatechange?.(e)
    })
    pc.addEventListener('iceconnectionstatechange', () => {
      const e = new Event('statechange')
      this.dispatchEvent(e)
      this.onstatechange?.(e)
    })
  }

  get component () {
    const pair = this.getSelectedCandidatePair()
    if (!pair?.local) return null
    return pair.local.component
  }

  get role () {
    return this.#pc.localDescription.type === 'offer' ? 'controlling' : 'controlled'
  }

  get gatheringState () {
    return this.#pc.iceGatheringState
  }

  get state () {
    return this.#pc.iceConnectionState
  }

  getLocalCandidates () {
    return this.#pc.localCandidates
  }

  getRemoteCandidates () {
    return this.#pc.remoteCandidates
  }

  getLocalParameters () {
    return new RTCIceParameters(new RTCIceCandidate({ candidate: this.#pc.getSelectedCandidatePair().local.candidate, sdpMLineIndex: 0 }))
  }

  getRemoteParameters () {
    return new RTCIceParameters(new RTCIceCandidate({ candidate: this.#pc.getSelectedCandidatePair().remote.candidate, sdpMLineIndex: 0 }))
  }

  getSelectedCandidatePair () {
    const pair = this.#pc.getSelectedCandidatePair()
    if (!pair?.local || !pair?.remote) return null
    return {
      local: new RTCIceCandidate({
        candidate: pair.local.candidate,
        sdpMid: pair.local.mid
      }),
      remote: new RTCIceCandidate({
        candidate: pair.remote.candidate,
        sdpMid: pair.remote.mid
      })
    }
  }
}

export class RTCIceParameters {
  usernameFragment = ''
  password = ''
  constructor ({ usernameFragment, password = '' }) {
    this.usernameFragment = usernameFragment
    this.password = password
  }
}

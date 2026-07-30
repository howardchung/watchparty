/**
 * @class
 * @implements {globalThis.RTCSessionDescription}
 */
export default class RTCSessionDescription {
  #type
  sdp
  /**
   * @param {RTCSessionDescriptionInit | null | undefined | object}  init
   */
  constructor (init) {
    this.#type = init?.type
    this.sdp = init?.sdp ?? ''
  }

  get type () {
    return this.#type
  }

  set type (type) {
    if (type !== 'offer' && type !== 'answer' && type !== 'pranswer' && type !== 'rollback') {
      throw new TypeError(`Failed to set the 'type' property on 'RTCSessionDescription': The provided value '${type}' is not a valid enum value of type RTCSdpType.`)
    }
    this.#type = type
  }

  toJSON () {
    return {
      sdp: this.sdp,
      type: this.#type
    }
  }
}

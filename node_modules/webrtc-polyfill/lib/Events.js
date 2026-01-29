import { MediaStreamTrack } from './MediaStream.js'
import RTCDataChannel from './RTCDataChannel.js'
import { RTCRtpReceiver, RTCRtpTransceiver } from './RTCRtp.js'

/**
 * @class
 * @implements {globalThis.RTCPeerConnectionIceEvent}
 */
export class RTCPeerConnectionIceEvent extends Event {
  #candidate

  constructor (candidate) {
    super('icecandidate')

    this.#candidate = candidate
  }

  get candidate () {
    return this.#candidate
  }

  get url () {
    return '' // TODO ?
  }
}
/**
 * @class
 * @implements {globalThis.RTCDataChannelEvent}
 */
export class RTCDataChannelEvent extends Event {
  #channel

  constructor (type = 'datachannel', init) {
    if (arguments.length === 0) throw new TypeError(`Failed to construct 'RTCDataChannelEvent': 2 arguments required, but only ${arguments.length} present.`)
    if (typeof init !== 'object') throw new TypeError("Failed to construct 'RTCDataChannelEvent': The provided value is not of type 'RTCDataChannelEventInit'.")
    if (!init.channel) throw new TypeError("Failed to construct 'RTCDataChannelEvent': Failed to read the 'channel' property from 'RTCDataChannelEventInit': Required member is undefined.")
    if (init.channel.constructor !== RTCDataChannel) throw new TypeError("Failed to construct 'RTCDataChannelEvent': Failed to read the 'channel' property from 'RTCDataChannelEventInit': Failed to convert value to 'RTCDataChannel'.")
    super('datachannel')

    this.#channel = init.channel
  }

  get channel () {
    return this.#channel
  }
}
/**
 * @class
 * @implements {globalThis.RTCTrackEvent}
 */
export class RTCTrackEvent extends Event {
  #track
  #receiver
  #transceiver
  #streams

  constructor (type = 'track', init) {
    if (arguments.length === 0) throw new TypeError(`Failed to construct 'RTCTrackEvent': 2 arguments required, but only ${arguments.length} present.`)
    if (typeof init !== 'object') throw new TypeError("Failed to construct 'RTCTrackEvent': The provided value is not of type 'RTCTrackEventInit'.")
    if (!init.channel) throw new TypeError("Failed to construct 'RTCTrackEvent': Failed to read the 'channel' property from 'RTCTrackEventInit': Required member is undefined.")
    if (init.receiver.constructor !== RTCRtpReceiver) throw new TypeError("Failed to construct 'RTCTrackEvent': Failed to read the 'channel' property from 'RTCTrackEventInit': Failed to convert value to 'RTCRtpReceiver'.")
    if (init.track.constructor !== MediaStreamTrack) throw new TypeError("Failed to construct 'RTCTrackEvent': Failed to read the 'channel' property from 'RTCTrackEventInit': Failed to convert value to 'MediaStreamTrack'.")
    if (init.transceiver.constructor !== RTCRtpTransceiver) throw new TypeError("Failed to construct 'RTCTrackEvent': Failed to read the 'channel' property from 'RTCTrackEventInit': Failed to convert value to 'RTCRtpTransceiver'.")

    super('track')

    const { track, receiver, transceiver, streams } = init

    this.#track = track
    this.#receiver = receiver
    this.#transceiver = transceiver
    this.#streams = streams
  }

  get track () {
    return this.#track
  }

  get receiver () {
    return this.#receiver
  }

  get transceiver () {
    return this.#transceiver
  }

  get streams () {
    return this.#streams ?? []
  }
}
/**
 * @class
 * @implements {globalThis.MediaStreamTrackEvent}
 */
export class MediaStreamTrackEvent extends Event {
  #track

  constructor (type, init) {
    if (arguments.length === 0) throw new TypeError(`Failed to construct 'MediaStreamTrackEvent': 2 arguments required, but only ${arguments.length} present.`)
    if (typeof init !== 'object') throw new TypeError("Failed to construct 'MediaStreamTrackEvent': The provided value is not of type 'MediaStreamTrackEventInit'.")
    if (!init.track) throw new TypeError("Failed to construct 'MediaStreamTrackEvent': Failed to read the 'track' property from 'MediaStreamTrackEventInit': Required member is undefined.")
    if (init.track.constructor !== MediaStreamTrack) throw new TypeError("Failed to construct 'MediaStreamTrackEvent': Failed to read the 'channel' property from 'MediaStreamTrackEventInit': Failed to convert value to 'RTCDataChannel'.")

    super(type)

    this.#track = init.track
  }

  get track () {
    return this.#track
  }
}

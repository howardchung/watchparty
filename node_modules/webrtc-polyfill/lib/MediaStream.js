import { Readable } from 'node:stream'
import { MediaStreamTrackEvent } from './Events.js'

/**
 * @class
 * @implements {globalThis.MediaStreamTrack}
 */
export class MediaStreamTrack extends EventTarget {
  media
  track
  stream = new Readable({ read: () => {} })
  #kind
  #label
  #id = crypto.randomUUID()
  contentHint = ''

  onmute
  onunmute
  onended

  constructor ({ kind, label }) {
    super()
    if (!kind) throw new TypeError("Failed to construct 'MediaStreamTrack': Failed to read the 'kind' property from 'MediaStreamTrackInit': Required member is undefined.")
    this.#kind = kind
    this.#label = label

    this.addEventListener('ended', e => {
      this.onended?.(e)
      this.track?.close()
      this.stream.destroy()
    })
    this.stream.on('close', () => {
      this.stop()
    })
  }

  async applyConstraints () {
    console.warn('Constraints unsupported, ignored')
  }

  stop () {
    this.track?.close()
    this.stream.destroy()
    this.dispatchEvent(new Event('ended'))
  }

  getSettings () {
    console.warn('Settings upsupported, ignored')
    return {}
  }

  getConstraints () {
    console.warn('Constraints unsupported, ignored')
    return {}
  }

  getCapabilities () {
    console.warn('Capabilities unsupported, ignored')
    return {}
  }

  clone () {
    console.warn('Track clonning is unsupported, returned this instance')
    return this
  }

  get kind () {
    return this.#kind
  }

  get enabled () {
    return this.track?.isOpen()
  }

  set enabled (_) {
    console.warn('Track enabling and disabling is unsupported, ignored')
  }

  get muted () {
    return false
  }

  get id () {
    return this.#id
  }

  get label () {
    return this.#label
  }

  get readyState () {
    return this.track?.isClosed() ? 'ended' : 'live'
  }
}

/**
 * @class
 * @implements {globalThis.MediaStream}
 */
export class MediaStream extends EventTarget {
  #active = true
  #id = crypto.randomUUID()
  /** @type {Set<MediaStreamTrack>} */
  #tracks = new Set()
  onaddtrack
  onremovetrack
  onactive
  oninactive

  constructor (streamOrTracks) {
    super()
    if (streamOrTracks instanceof MediaStream) {
      for (const track of streamOrTracks.getTracks()) {
        this.addTrack(track)
      }
    } else if (Array.isArray(streamOrTracks)) {
      for (const track of streamOrTracks) {
        this.addTrack(track)
      }
    }
    this.addEventListener('active', e => {
      this.onactive?.(e)
    })
    this.addEventListener('inactive', e => {
      this.oninactive?.(e)
    })
    this.addEventListener('removetrack', e => {
      this.onremovetrack?.(e)
    })
    this.addEventListener('addtrack', e => {
      this.onaddtrack?.(e)
    })
    this.dispatchEvent(new Event('active'))
  }

  get active () {
    return this.#active
  }

  get id () {
    return this.#id
  }

  addTrack (track) {
    this.#tracks.add(track)
    this.dispatchEvent(new MediaStreamTrackEvent('addtrack', { track }))
  }

  getTracks () {
    return [...this.#tracks]
  }

  getVideoTracks () {
    return [...this.#tracks].filter(({ kind }) => kind === 'video')
  }

  getAudioTracks () {
    return [...this.#tracks].filter(({ kind }) => kind === 'audio')
  }

  getTrackById (id) {
    return [...this.#tracks].find(track => track.id === id) ?? null
  }

  removeTrack (track) {
    this.#tracks.delete(track)
    this.dispatchEvent(new MediaStreamTrackEvent('removetrack', { track }))
  }

  clone () {
    return new MediaStream([...this.getTracks()])
  }

  stop () {
    for (const track of this.getTracks()) {
      track.stop()
    }
    this.#active = false
    this.dispatchEvent(new Event('inactive'))
  }
}

import { logHandledException } from './sessionLog';
import { diagnosticEvent, diagnosticError } from './sessionLog'
import { io, type Socket } from 'socket.io-client'

export interface VoiceState {
  status: 'off' | 'connecting' | 'connected' | 'degraded' | 'reconnecting' | 'error'
  muted: boolean
  members: Record<string, { muted: boolean; speaking: boolean; connection?: 'connected' | 'reconnecting' | 'unavailable'; packetsReceived?: number; packetsLost?: number; candidateType?: string }>
  error?: string
}
interface Options {
  roomId: string
  request: <T>(path: string, body?: unknown) => Promise<T>
  token: (force?: boolean) => Promise<string>
  onState: (state: VoiceState) => void
}
interface Descriptor {
  mode: string; roomId: string; membershipId: string; voiceSessionId: string
  namespace: string; ticket?: string; iceServers: RTCIceServer[]; iceExpiresAt: string
}
interface Member { membershipId: string; voiceSessionId: string; muted: boolean; signalingConnected?: boolean }
interface Signal {
  negotiationId: string; generation: string; targetGeneration: string; peerGeneration: number; targetPeerGeneration: number
  sdp?: RTCSessionDescriptionInit; ice?: RTCIceCandidateInit; restart?: boolean; requestOffer?: boolean
}

/** Same peer-pair epoch fence as Android's PeerGenerationFence. */
export class PeerGenerationFence {
  remote?: number
  constructor(readonly local: number) {}
  accept(kind: 'offer' | 'answer' | 'ice' | 'restart', sender: number, target: number) {
    if (!Number.isSafeInteger(sender) || sender <= 0 || !Number.isSafeInteger(target) || target < 0) return false
    if (kind === 'restart') return target === this.local && sender === this.remote
    if (kind === 'answer') {
      if (target !== this.local || (this.remote !== undefined && sender !== this.remote)) return false
    } else {
      if (target !== 0 && target !== this.local) return false
      if (this.remote !== undefined && (kind === 'offer' ? sender <= this.remote : sender !== this.remote)) return false
    }
    if (kind === 'offer' || kind === 'answer') this.remote = sender
    return true
  }
}
export function audioOnlySdp(sdp: unknown): sdp is string {
  if (typeof sdp !== 'string' || new TextEncoder().encode(sdp).length > 60000) return false
  const media = sdp.split(/\r?\n/).filter(line => line.startsWith('m='))
  return media.length === 1 && /^m=audio\s/i.test(media[0])
}
interface Peer {
  member: Member; pc: RTCPeerConnection; fence: PeerGenerationFence; audio: HTMLAudioElement
  pending: { epoch: number; ice: RTCIceCandidateInit }[]; retries: number
  timer?: ReturnType<typeof setTimeout>; outgoing: Promise<void>; ready: boolean; localReady: boolean; localIce: RTCIceCandidateInit[]; retrying?: boolean; exhausted?: boolean
}
const permanent = new Set(['SESSION_REVOKED', 'INVALID_TOKEN', 'NOT_A_MEMBER', 'ROOM_ENDED', 'ROOM_NOT_FOUND'])
function code(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : ''
}

/** Microphone-only mesh; lifetime is independent of the movie player. */
export class MeshVoice {
  private diagnosticState = ''
  private state: VoiceState = { status: 'off', muted: true, members: {} }
  private descriptor?: Descriptor
  private socket?: Socket
  private stream?: MediaStream
  private localMeter?: { context: AudioContext; source: MediaStreamAudioSourceNode; analyser: AnalyserNode; samples: Float32Array<ArrayBuffer> }
  private peers = new Map<string, Peer>()
  private epochs = new Map<string, number>()
  private timers = new Set<ReturnType<typeof setTimeout>>()
  private serial: Promise<void> = Promise.resolve()
  private signalQueue: Promise<void> = Promise.resolve()
  private lastSignalAt = 0
  private muteSerial: Promise<void> = Promise.resolve()
  private muteIntent = true
  private muteRevision = 0
  private signalSequence = 0
  private received = new Set<string>()
  private offerRequestEpochs = new Map<string, number>()
  private active = false
  private run = 0
  private rosterReady = false
  private reconnecting = false
  private blockedAudio = false
  private authPaused = false
  private authRecoveryAttempts = 0
  private recoveryExhausted = false
  private pollBusy = false
  private cancelOpen?: () => void
  private cancelCapture?: () => void
  private activity = new Map<string, { hits: number; last: number }>()
  private energies = new Map<string, { energy: number; duration: number }>()
  constructor(private readonly options: Options) {}

  async join() {
    if (this.active) { await this.resumeAudio(); return }
    diagnosticEvent('voice.join')
    this.active = true
    const run = ++this.run
    const startup = this.later(() => { if (this.current(run) && !this.rosterReady) this.fail(new Error('Voice startup timed out. Join voice to retry.'), true) }, 30_000)
    this.state = { status: 'connecting', muted: true, members: {} }
    this.publish()
    try {
      // Capture can work even when Firefox settings/extensions disable WebRTC.
      // Test constructibility without opening a connection or requesting media.
      try { Reflect.construct(Object, [], globalThis.RTCPeerConnection) }
      catch (cause) { logHandledException('voice.capability', cause); throw new Error('WEBRTC_UNAVAILABLE', { cause }) }
      // Only this explicit opt-in operation requests capture; no camera is requested.
      const capture = navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      let discarded = false
      void capture.then(stream => { if (!this.current(run)) { discarded = true; stream.getTracks().forEach(track => track.stop()) } }).catch((handledError) => { logHandledException("voice.join.1", handledError); })
      const cancelled = new Promise<never>((_, reject) => { this.cancelCapture = () => reject(new Error('Voice capture cancelled')) })
      const stream = await Promise.race([capture, cancelled])
      this.cancelCapture = undefined
      stream.getAudioTracks().forEach(track => { track.enabled = false })
      if (!this.current(run)) { if (!discarded) stream.getTracks().forEach(track => track.stop()); return }
      diagnosticEvent('voice.microphone_acquired', { tracks: stream.getAudioTracks().length })
      this.stream = stream
      this.prepareLocalMeter()
      await this.open(run, false)
      if (!this.current(run)) return
      this.later(() => void this.refreshCredentials(run), 5 * 60_000)
      this.later(() => void this.poll(run), 200)
    } catch (error) { logHandledException("voice.join.2", error);  if (this.current(run)) { this.fail(error, true); throw error } }
    finally { clearTimeout(startup); this.timers.delete(startup) }
  }

  async setMuted(muted: boolean) {
    if (!this.active) return
    // Resume during the button gesture, before waiting for server authorization.
    if (!muted) this.prepareLocalMeter()
    diagnosticEvent('voice.mute_requested', { muted })
    this.muteIntent = muted
    const revision = ++this.muteRevision
    if (muted) {
      this.stream?.getAudioTracks().forEach(track => { track.enabled = false })
      this.state.muted = true; this.publish()
    }
    const run = this.run
    const operation = this.muteSerial.catch((handledError) => { logHandledException("voice.setMuted.operation.3", handledError); }).then(async () => {
      if (!this.current(run)) return
      try {
        const socket = this.socket
        await this.ack('voice.mute', { muted })
        if (!this.current(run) || revision !== this.muteRevision) return
        if (!muted && !this.canEnableCapture(run, revision, socket)) throw new Error('Voice authorization changed. Retry after reconnecting.')
        this.state.muted = muted
        this.stream?.getAudioTracks().forEach(track => { track.enabled = !muted })
        this.publish()
        if (this.blockedAudio) void this.resumeAudio().catch((handledError) => { logHandledException("voice.setMuted.operation.4", handledError); })
      } catch (error) {
        logHandledException("voice.setMuted.operation.5", error);
        if (!this.current(run)) return
        this.stream?.getAudioTracks().forEach(track => { track.enabled = false })
        this.state.muted = true
        this.fail(error)
        throw error
      }
    })
    this.muteSerial = operation
    return operation
  }

  private canEnableCapture(run: number, revision: number, socket: Socket | undefined) {
    return this.current(run) && revision === this.muteRevision && socket === this.socket && socket?.connected === true && this.rosterReady && !this.authPaused
  }

  /** Retry only unavailable links; established audio remains untouched. */
  retryConnections() {
    if (!this.active) return
    if (!this.reconnecting) { this.authRecoveryAttempts = 0; this.recoveryExhausted = false }
    if (this.authPaused || !this.socket?.connected || !this.rosterReady) { this.reconnect(this.run); return }
    this.retryFailedLinks()
  }
  private retryFailedLinks() {
    for (const peer of this.peers.values()) if (peer.pc.connectionState !== 'connected') {
      this.enqueue(() => this.manualRetry(peer))
    }
  }

  async refreshAuth(accessToken: string) {
    if (!this.active) return
    const run = this.run; const socket = this.socket
    try {
      await this.ack('auth.refresh', { accessToken })
      if (!this.current(run) || socket !== this.socket) return
      if (!this.reconnecting) this.authPaused = false
      this.updateStatus()
    } catch (error) {
      logHandledException("voice.refreshAuth.6", error);
      if (!this.current(run) || socket !== this.socket) return
      this.authPaused = true; this.fail(error, permanent.has(code(error))); throw error
    }
  }

  /** Call directly from a click when the browser blocks remote audio autoplay. */
  async resumeAudio() {
    const run = this.run
    const results = await Promise.allSettled([...this.peers.values()].filter(p => p.audio.srcObject).map(async peer => {
      let timer: ReturnType<typeof setTimeout> | undefined
      try { await Promise.race([peer.audio.play(), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Voice audio playback timed out')), 5000) })]) }
      finally { clearTimeout(timer) }
    }))
    if (!this.current(run)) return
    this.blockedAudio = results.some(result => result.status === 'rejected')
    if (this.blockedAudio) {
      this.fail(new Error('Audio playback was blocked. Tap Resume voice audio.'))
      throw new Error('Audio playback was blocked. Tap Resume voice audio.')
    }
    this.updateStatus()
  }

  disconnect() {
    this.active = false
    ++this.run; ++this.muteRevision
    this.cancelOpen?.(); this.cancelOpen = undefined
    this.cancelCapture?.(); this.cancelCapture = undefined
    this.timers.forEach(clearTimeout); this.timers.clear()
    const socket = this.socket; this.socket = undefined
    if (socket) {
      socket.removeAllListeners()
      if (socket.connected) {
        // Opt-out is distinct from a recoverable transport disconnect. Retire only
        // the captured socket; a late leave acknowledgement cannot close a new call.
        const deadline = setTimeout(() => socket.disconnect(), 1000)
        socket.timeout(1000).emit('voice.leave', {}, (error: Error | null, response: { ok?: boolean; code?: string } | undefined) => {
          clearTimeout(deadline)
          if (error || response?.ok !== true) console.debug('Voice leave was not acknowledged', response?.code || 'NETWORK')
          socket.disconnect()
        })
      } else socket.disconnect()
    }
    this.peers.forEach(peer => this.closePeer(peer)); this.peers.clear()
    this.closeLocalMeter()
    this.stream?.getTracks().forEach(track => track.stop()); this.stream = undefined
    this.pollBusy = false
    this.serial = Promise.resolve(); this.signalQueue = Promise.resolve(); this.muteSerial = Promise.resolve()
    this.descriptor = undefined; this.muteIntent = true; this.received.clear(); this.offerRequestEpochs.clear(); this.epochs.clear(); this.activity.clear(); this.energies.clear()
    this.rosterReady = false; this.reconnecting = false; this.blockedAudio = false; this.authPaused = false
    this.authRecoveryAttempts = 0; this.recoveryExhausted = false
    this.state = { status: 'off', muted: true, members: {} }; this.publish()
  }

  private current(run: number) { return this.active && this.run === run }
  private publish() {
    const diagnosticState = `${this.state.status}:${this.state.muted}:${this.peers.size}`
    if (this.diagnosticState !== diagnosticState) {
      this.diagnosticState = diagnosticState
      diagnosticEvent('voice.state', { status: this.state.status, muted: this.state.muted, peers: this.peers.size })
    }
    const selfId = this.descriptor?.membershipId
    const self = selfId ? this.state.members[selfId] : undefined
    if (self && selfId) {
      self.muted = this.state.muted
      if (self.muted) { self.speaking = false; this.activity.delete(selfId) }
    }
    const members = Object.fromEntries(Object.entries(this.state.members).map(([id, value]) => [id, { ...value }]))
    this.options.onState({ ...this.state, members })
  }
  private fail(error: unknown, fatal = false) {
    logHandledException('voice.failure', error)
    diagnosticEvent('voice.failure', { code: diagnosticError(error), fatal })
    const message = error instanceof Error ? error.message : code(error) || 'Voice connection failed. Retry voice.'
    if (fatal) this.disconnect()
    this.state = { ...this.state, status: !fatal && this.active && (this.rosterReady || this.reconnecting || this.peers.size > 0) ? this.reconnecting ? 'reconnecting' : 'degraded' : 'error', error: message }; this.publish()
  }
  private later(action: () => void, ms: number) {
    const timer = setTimeout(() => { this.timers.delete(timer); action() }, ms)
    this.timers.add(timer)
    return timer
  }
  private enqueue(action: () => Promise<void>) {
    const run = this.run
    this.serial = this.serial.then(async () => { if (this.current(run)) await action() }).catch(error => {
      logHandledException("voice.enqueue.7", error);
      if (this.current(run)) this.fail(error, permanent.has(code(error)))
    })
  }
  private async configuration(generation?: string, operation: 'join' | 'resume' | 'refresh' = generation ? 'resume' : 'join') {
    const result = await this.options.request<Descriptor>(`/v1/rooms/${this.options.roomId}/voice/config`, { operation, ...(generation ? { voiceSessionId: generation } : {}) })
    if (result.mode !== 'MESH' || result.roomId !== this.options.roomId || (!/^\/[a-z0-9-]{1,64}\/voice\/[^/]+$/.test(result.namespace) || !result.namespace.endsWith(`/voice/${this.options.roomId}`))) throw new Error('Unexpected voice configuration')
    return result
  }
  private async open(run: number, reconnect: boolean, owns = () => this.current(run)) {
    if (!owns()) return
    let descriptor: Descriptor
    if (reconnect && this.descriptor) {
      try { descriptor = await this.configuration(this.descriptor.voiceSessionId) }
      catch (error) {
        logHandledException("voice.open.8", error);
        if (code(error) !== 'VOICE_SESSION_EXPIRED') throw error
        if (!owns()) return
        descriptor = await this.configuration()
      }
    } else descriptor = await this.configuration()
    if (!owns()) return
    if (this.descriptor && descriptor.voiceSessionId !== this.descriptor.voiceSessionId) {
      this.peers.forEach(p => this.closePeer(p)); this.peers.clear(); this.epochs.clear(); this.offerRequestEpochs.clear()
    }
    this.descriptor = descriptor; this.rosterReady = false
    this.socket?.removeAllListeners(); this.socket?.disconnect()
    const origin = (import.meta.env.VITE_BACKEND_URL || window.location.origin).replace(/\/$/, '')
    const socket = io(`${origin}${descriptor.namespace}`, {
      path: '/socket.io/', transports: ['websocket'], reconnection: false, forceNew: true,
      autoConnect: false, auth: { ticket: descriptor.ticket, protocolVersion: 4 },
    })
    this.socket = socket
    await new Promise<void>((resolve, reject) => {
      let settled = false
      let muteReplayed = false
      const timer = this.later(() => finish(new Error('Voice roster timed out')), 10_000)
      const finish = (error?: unknown) => {
        if (settled) return
        settled = true; clearTimeout(timer); this.timers.delete(timer); this.cancelOpen = undefined
        if (error) reject(error); else resolve()
      }
      this.cancelOpen = () => finish(new Error('Voice connection cancelled'))
      socket.on('voice.roster', (payload: { members: Member[] }) => this.enqueue(async () => {
        if (!owns() || this.socket !== socket) return
        try { await this.applyRoster(payload.members) }
        catch (error) {
          logHandledException('voice.roster', error);
          // Settle startup now so join releases capture and preserves the cause.
          // Later roster failures still use the normal connected-call recovery.
          if (settled) throw error
          finish(error)
          return
        }
        if (!muteReplayed) {
          muteReplayed = true
          this.authPaused = false
          this.updateStatus()
          // Server installs its authorized handlers before publishing the roster.
          // The transport connect event can arrive while that setup is still pending.
          const replay = this.setMuted(this.muteIntent)
          if (reconnect) {
            void replay.then(() => finish(), error => { logHandledException('voice.mute', error); finish(error) })
          } else void replay.catch((handledError) => { logHandledException("voice.open.9", handledError); })
        }
        if (!reconnect) finish()
      }))
      socket.on('signal', (payload: { from: string; msg: string }) => this.enqueue(async () => {
        if (owns() && this.socket === socket) await this.receive(payload)
      }))
      socket.on('connect_error', (error: Error & { data?: unknown }) => {
        if (!owns() || this.socket !== socket) return
        logHandledException('voice.socket.connect', error)
        finish(error.data || error)
        if (settled && this.current(run)) this.reconnect(run)
      })
      socket.on('disconnect', () => { if (!owns() || this.socket !== socket) return; finish(new Error('Voice signaling disconnected')); this.reconnect(run) })
      socket.on('error', (error: unknown) => { if (owns() && this.socket === socket) this.fail(error, permanent.has(code(error))) })
      socket.connect()
    })
  }
  private reconnect(run: number) {
    if (!this.current(run) || this.reconnecting || this.recoveryExhausted) return
    this.reconnecting = true; this.rosterReady = false; this.updateStatus()
    let attempt = 0
    const retry = async () => {
      if (!this.current(run)) return
      if (this.authPaused && ++this.authRecoveryAttempts > 6) { this.recoveryUnavailable(); return }
      let valid = true
      const owns = () => valid && this.current(run)
      let deadline: ReturnType<typeof setTimeout> | undefined
      try {
        // Renew the guest token after an authorization rejection even if the
        // transport is connected. Re-admission supplies an authoritative roster.
        const opening = async () => {
          await this.options.token(this.authPaused)
          if (!owns()) return
          await this.open(run, true, owns)
        }
        await Promise.race([opening(), new Promise<never>((_, reject) => {
          deadline = this.later(() => {
            valid = false
            this.cancelOpen?.()
            reject(new Error('Voice authorization recovery timed out'))
          }, 30_000)
        })])
        if (!owns()) return
        if (this.authPaused || !this.rosterReady || !this.socket?.connected) throw new Error('Voice authorization changed during recovery')
        this.reconnecting = false; this.updateStatus()
        this.retryFailedLinks()
      } catch (error) {
        logHandledException("voice.reconnect.retry.10", error);
        valid = false
        if (!this.current(run)) return
        this.rosterReady = false
        if (permanent.has(code(error))) { this.reconnecting = false; this.fail(error, true); return }
        if (++attempt >= 6) {
          this.recoveryUnavailable()
          return
        }
        this.later(() => void retry(), Math.min(1000 * 2 ** attempt, 15_000))
      } finally {
        if (deadline) { clearTimeout(deadline); this.timers.delete(deadline) }
      }
    }
    this.later(() => void retry(), 1000)
  }
  private recoveryUnavailable() {
    this.reconnecting = false; this.recoveryExhausted = true
    this.state.error = 'Voice signaling is unavailable. Retry voice connections.'
    this.updateStatus()
  }
  private pauseAuthorization() {
    this.authPaused = true
    this.reconnect(this.run)
  }
  private ack(event: string, payload: unknown): Promise<unknown> {
    const socket = this.socket
    if (!socket?.connected) return Promise.reject(new Error('Voice signaling is offline'))
    return new Promise((resolve, reject) => {
      socket.timeout(8000).emit(event, payload, (error: Error | null, response: { code?: string; ok?: boolean; expiresAt?: string } | undefined) => {
        if (socket !== this.socket || !socket.connected) reject(new Error('Voice signaling was replaced'))
        else if (error) reject(error)
        else if (response?.code) {
          if (response.code === 'SESSION_EXPIRED' || response.code === 'AUTH_UNAVAILABLE') this.pauseAuthorization()
          reject(Object.assign(new Error(response.code), response))
        }
        else if (!response || (event === 'auth.refresh' ? typeof response.expiresAt !== 'string' : response.ok !== true)) reject(new Error('Invalid voice acknowledgement'))
        else {
          if (event === 'signal') this.authRecoveryAttempts = 0
          resolve(response)
        }
      })
    })
  }
  private async applyRoster(members: Member[]) {
    if (!Array.isArray(members) || members.length > 8 || members.some(m => typeof m.membershipId !== 'string' || typeof m.voiceSessionId !== 'string' || typeof m.muted !== 'boolean')) throw new Error('Invalid voice roster')
    const self = members.find(m => m.membershipId === this.descriptor!.membershipId)
    if (!self || self.voiceSessionId !== this.descriptor!.voiceSessionId) throw new Error('Voice session was replaced')
    const roster = new Map(members.map(member => [member.membershipId, member]))
    for (const [id, peer] of this.peers) {
      if (roster.get(id)?.voiceSessionId !== peer.member.voiceSessionId) { this.closePeer(peer); this.peers.delete(id); this.offerRequestEpochs.delete(`${id}:${peer.member.voiceSessionId}`) }
    }
    this.state.members = Object.fromEntries(members.map(m => [m.membershipId, { muted: m.muted, speaking: !m.muted && (this.state.members[m.membershipId]?.speaking ?? false), connection: m.membershipId === this.descriptor!.membershipId ? 'connected' as const : 'reconnecting' as const }]))
    for (const member of members) {
      if (member.membershipId === this.descriptor!.membershipId) continue
      const peer = this.peers.get(member.membershipId) ?? this.createPeer(member)
      peer.member = member; peer.audio.muted = member.muted
    }
    this.rosterReady = true; this.updateStatus()
  }
  private createPeer(member: Member, retries = 0, offer = true): Peer {
    const pc = new RTCPeerConnection({ iceServers: this.descriptor!.iceServers })
    const epoch = (this.epochs.get(member.membershipId) ?? 0) + 1
    this.epochs.set(member.membershipId, epoch)
    const audio = new Audio(); audio.autoplay = true; audio.muted = member.muted
    const peer: Peer = { member, pc, fence: new PeerGenerationFence(epoch), audio, pending: [], retries, outgoing: Promise.resolve(), ready: false, localReady: false, localIce: [] }
    this.peers.set(member.membershipId, peer)
    this.stream!.getAudioTracks().forEach(track => pc.addTrack(track, this.stream!))
    pc.ondatachannel = event => event.channel.close()
    pc.ontrack = event => {
      if (!this.live(peer)) return
      if (event.track.kind !== 'audio') { event.track.enabled = false; return }
      audio.srcObject = new MediaStream([event.track])
      void audio.play().catch((handledError) => { logHandledException("voice.createPeer.11", handledError);  if (this.peers.get(member.membershipId) === peer) { this.blockedAudio = true; this.fail(new Error('Audio playback was blocked. Tap Resume voice audio.')) } })
    }
    pc.onicecandidate = event => {
      if (!this.live(peer) || !event.candidate) return
      if (peer.localReady) this.send(peer, { ice: event.candidate.toJSON() })
      else if (peer.localIce.length < 64) peer.localIce.push(event.candidate.toJSON())
    }
    pc.onconnectionstatechange = () => {
      if (this.peers.get(member.membershipId) !== peer) return
      diagnosticEvent('voice.peer_state', { state: pc.connectionState, retries: peer.retries })
      if (pc.connectionState === 'connected') { clearTimeout(peer.timer); peer.retries = 0 }
      if (pc.connectionState === 'failed') this.enqueue(() => this.retry(peer, true))
      if (pc.connectionState === 'disconnected') this.later(() => {
        if (pc.connectionState === 'disconnected') this.enqueue(() => this.retry(peer, true))
      }, 5000)
      this.updateStatus()
    }
    peer.timer = this.later(() => { if (pc.connectionState !== 'connected') this.enqueue(() => this.retry(peer, true)) }, 10_000)
    if (offer && this.descriptor!.membershipId < member.membershipId) this.enqueue(() => this.offer(peer))
    return peer
  }
  private live(peer: Peer) { return this.active && this.peers.get(peer.member.membershipId) === peer }
  private async offer(peer: Peer) {
    if (!this.live(peer) || !this.rosterReady) return
    const description = await peer.pc.createOffer()
    if (!this.live(peer)) return
    await peer.pc.setLocalDescription(description)
    this.sendDescription(peer, description)
  }
  private sendDescription(peer: Peer, description: RTCSessionDescriptionInit) {
    this.send(peer, { sdp: description })
    peer.localReady = true
    for (const ice of peer.localIce.splice(0)) this.send(peer, { ice })
  }
  private send(peer: Peer, content: Pick<Signal, 'sdp' | 'ice' | 'restart' | 'requestOffer'>) {
    if (!this.live(peer) || !this.rosterReady || this.authPaused) return
    if (content.restart && peer.fence.remote === undefined) return
    const message: Signal = {
      negotiationId: `web:${this.run}:${++this.signalSequence}`, generation: this.descriptor!.voiceSessionId, targetGeneration: peer.member.voiceSessionId,
      peerGeneration: peer.fence.local, targetPeerGeneration: content.sdp?.type === 'offer' || content.requestOffer ? 0 : peer.fence.remote ?? 0, ...content,
    }
    if (content.sdp && !audioOnlySdp(content.sdp.sdp)) { this.fail(new Error('Only microphone audio is supported')); return }
    // Per-peer FIFO preserves SDP/candidate order. Server remains authoritative.
    const socket = this.socket
    peer.outgoing = peer.outgoing.then(async () => {
      if (!this.live(peer) || socket !== this.socket) return
      // The server budget is per member, shared by all seven peer links.
      // A per-peer FIFO alone bursts past that budget as a full mesh joins.
      this.signalQueue = this.signalQueue.catch((handledError) => { logHandledException("voice.send.13", handledError); }).then(async () => {
        const delay = Math.max(0, 60 - (Date.now() - this.lastSignalAt))
        if (delay) await new Promise(resolve => setTimeout(resolve, delay))
        if (!this.live(peer) || socket !== this.socket || this.authPaused || !this.rosterReady) return
        this.lastSignalAt = Date.now()
        for (let attempt = 0; ; attempt++) {
          try { await this.ack('signal', { to: peer.member.membershipId, msg: JSON.stringify(message) }); return }
          catch (error) {
            logHandledException("voice.send.14", error);
            if ((code(error) && code(error) !== 'RATE_LIMITED') || attempt >= 2) throw error
            await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)))
            if (!this.live(peer) || socket !== this.socket || this.authPaused || !this.rosterReady) return
            this.lastSignalAt = Date.now()
          }
        }
      })
      await this.signalQueue
    }).catch(error => {
      logHandledException("voice.send.12", error);
      if (!this.live(peer) || socket !== this.socket || code(error) === 'STALE_NEGOTIATION') return
      this.fail(error, permanent.has(code(error)))
    })
  }
  private async receive(payload: { from: string; msg: string }) {
    if (!payload || typeof payload.msg !== 'string' || new TextEncoder().encode(payload.msg).length > 65536) return
    let message: Signal
    try { message = JSON.parse(payload.msg) as Signal } catch (handledError) { logHandledException("voice.receive.15", handledError);  return }
    let peer = this.peers.get(payload.from)
    if (!peer || !message || message.generation !== peer.member.voiceSessionId || message.targetGeneration !== this.descriptor!.voiceSessionId) return
    if (typeof message.negotiationId !== 'string') return
    const receivedKey = `${payload.from}:${message.generation}:${message.negotiationId}`
    if (this.received.has(receivedKey)) return
    if (this.received.size >= 4096) this.received.delete(this.received.values().next().value!)
    this.received.add(receivedKey)
    if (Number(!!message.sdp) + Number(!!message.ice) + Number(message.restart === true) + Number(message.requestOffer === true) !== 1) return
    const sender = message.peerGeneration; const target = message.targetPeerGeneration
    if (message.requestOffer) {
      if (this.descriptor!.membershipId >= payload.from || !Number.isSafeInteger(sender) || sender <= 0 || !Number.isSafeInteger(target) || target < 0 || (target !== 0 && target !== peer.fence.local) || (peer.fence.remote !== undefined && sender < peer.fence.remote)) return
      const key = `${payload.from}:${peer.member.voiceSessionId}`
      if (sender <= (this.offerRequestEpochs.get(key) ?? 0)) return
      // This high-water mark survives replacement of the failed peer object.
      this.offerRequestEpochs.set(key, sender)
      if (peer.pc.connectionState === 'connected' && (peer.fence.remote === undefined || sender <= peer.fence.remote)) return
      const member = peer.member
      this.closePeer(peer); this.peers.delete(payload.from)
      this.createPeer(member, 0)
      this.updateStatus()
      return
    }
    if (message.sdp) {
      const { type, sdp } = message.sdp
      if ((type !== 'offer' && type !== 'answer') || !audioOnlySdp(sdp)) return
      const previous = peer.fence.remote
      if (type === 'offer' && this.descriptor!.membershipId < payload.from) return
      if (!peer.fence.accept(type, sender, target)) return
      if (type === 'offer' && previous !== undefined) {
        const member = peer.member; const retries = peer.retries
        this.closePeer(peer); this.peers.delete(payload.from)
        peer = this.createPeer(member, retries, false)
        if (!peer.fence.accept('offer', sender, target)) return
      }
      await peer.pc.setRemoteDescription({ type, sdp })
      if (!this.live(peer)) return
      peer.ready = true
      for (const candidate of peer.pending.splice(0)) if (candidate.epoch === peer.fence.remote) await peer.pc.addIceCandidate(candidate.ice)
      if (type === 'offer') {
        const answer = await peer.pc.createAnswer()
        if (!this.live(peer)) return
        await peer.pc.setLocalDescription(answer)
        this.sendDescription(peer, answer)
      }
    } else if (message.ice) {
      const ice = message.ice
      if (typeof ice.candidate !== 'string' || ice.candidate.length > 4096 || !peer.fence.accept('ice', sender, target)) return
      if (peer.ready) await peer.pc.addIceCandidate(ice)
      else if (peer.pending.length < 64) peer.pending.push({ epoch: sender, ice })
    } else if (message.restart && peer.fence.accept('restart', sender, target)) await this.retry(peer, false)
  }
  private async manualRetry(peer: Peer) {
    if (!this.live(peer) || peer.pc.connectionState === 'connected' || !this.rosterReady || !this.socket?.connected || this.authPaused) return
    const member = peer.member
    this.closePeer(peer); this.peers.delete(member.membershipId)
    const replacement = this.createPeer(member, 0)
    if (this.descriptor!.membershipId > member.membershipId) {
      // Recreate first, so every user request has a fresh requester epoch even
      // when no answer has ever established the automatic restart fence.
      this.send(replacement, { requestOffer: true })
      await replacement.outgoing
    }
    this.updateStatus()
  }

  private async retry(peer: Peer, notify: boolean) {
    if (!this.live(peer) || !this.rosterReady || !this.socket?.connected || this.authPaused) return
    if (peer.retrying || peer.exhausted) return
    if (peer.retries >= 3) { peer.exhausted = true; this.closePeer(peer); this.updateStatus(); return }
    peer.retrying = true
    await new Promise<void>(resolve => this.later(resolve, 200 + Math.random() * 300))
    if (!this.live(peer)) return
    if (this.authPaused || !this.rosterReady || !this.socket?.connected) { peer.retrying = false; return }
    if (notify && peer.fence.remote !== undefined) {
      this.send(peer, { restart: true }); await peer.outgoing
      if (!this.live(peer)) return
      if (this.authPaused || !this.rosterReady || !this.socket?.connected) { peer.retrying = false; return }
    }
    this.closePeer(peer); this.peers.delete(peer.member.membershipId)
    this.createPeer(peer.member, peer.retries + 1)
    this.updateStatus()
  }
  private closePeer(peer: Peer) {
    clearTimeout(peer.timer); if (peer.timer) this.timers.delete(peer.timer)
    peer.pc.onconnectionstatechange = null; peer.pc.onicecandidate = null; peer.pc.ontrack = null
    peer.pc.close(); peer.audio.pause(); peer.audio.srcObject = null; peer.pending.length = 0; peer.localIce.length = 0
    for (const key of this.energies.keys()) if (key.startsWith(`${peer.member.membershipId}:${peer.fence.local}:`)) this.energies.delete(key)
    this.activity.delete(peer.member.membershipId)
  }
  private updateStatus() {
    if (!this.active) return
    for (const peer of this.peers.values()) {
      const member = this.state.members[peer.member.membershipId]
      if (member) member.connection = peer.pc.connectionState === 'connected' ? 'connected' : peer.exhausted || this.recoveryExhausted ? 'unavailable' : 'reconnecting'
    }
    if (this.blockedAudio && !this.authPaused && !this.reconnecting && !this.recoveryExhausted) { this.publish(); return }
    const degraded = this.authPaused || this.recoveryExhausted || [...this.peers.values()].some(peer => peer.pc.connectionState !== 'connected')
    const status = this.reconnecting ? 'reconnecting'
      : !this.rosterReady ? this.state.error ? 'degraded' : 'connecting'
      : degraded ? 'degraded' : 'connected'
    this.state = { ...this.state, status, error: this.authPaused || this.recoveryExhausted || !this.rosterReady ? this.state.error : undefined }
    this.publish()
  }

  private async refreshCredentials(run: number) {
    if (!this.current(run) || !this.descriptor) return
    if (this.reconnecting || this.authPaused || this.recoveryExhausted) {
      this.later(() => void this.refreshCredentials(run), 30_000)
      return
    }
    const snapshot = this.descriptor; const socket = this.socket
    const ownsSnapshot = () => this.current(run) && !this.reconnecting && this.descriptor === snapshot && this.socket === socket
    let delay = 5 * 60_000
    try {
      const accessToken = await this.options.token()
      if (!ownsSnapshot()) { delay = 30_000; return }
      await this.refreshAuth(accessToken)
      if (!ownsSnapshot()) { delay = 30_000; return }
      const descriptor = await this.configuration(snapshot.voiceSessionId, 'refresh')
      if (!ownsSnapshot()) { delay = 30_000; return }
      if (descriptor.voiceSessionId !== snapshot.voiceSessionId || descriptor.membershipId !== snapshot.membershipId) throw Object.assign(new Error('Voice session was replaced'), { code: 'SESSION_REVOKED' })
      this.descriptor = { ...snapshot, ...descriptor }
      this.peers.forEach(peer => peer.pc.setConfiguration({ iceServers: descriptor.iceServers }))
      this.updateStatus()
    } catch (error) {
      logHandledException("voice.refreshCredentials.16", error);
      if (ownsSnapshot()) this.fail(error, permanent.has(code(error)))
      delay = 30_000
    } finally {
      // A stale response must not stop renewal for the replacement generation.
      if (this.current(run)) this.later(() => void this.refreshCredentials(run), delay)
    }
  }

  private prepareLocalMeter() {
    try {
      if (!this.localMeter && this.stream && typeof AudioContext !== 'undefined') {
        const context = new AudioContext()
        try {
          const source = context.createMediaStreamSource(this.stream)
          const analyser = context.createAnalyser()
          analyser.fftSize = 2048
          source.connect(analyser) // No speaker connection: never monitor the mic audibly.
          this.localMeter = { context, source, analyser, samples: new Float32Array(analyser.fftSize) }
        } catch (error) { logHandledException("voice.prepareLocalMeter.17", error);  void context.close().catch((handledError) => { logHandledException("voice.prepareLocalMeter.18", handledError); }); throw error }
      }
      if (this.localMeter?.context.state === 'suspended') void this.localMeter.context.resume().catch((handledError) => { logHandledException("voice.prepareLocalMeter.19", handledError); })
    } catch (handledError) { logHandledException("voice.prepareLocalMeter.20", handledError);  /* Optional metering must never prevent voice capture or transmission. */ }
  }

  private closeLocalMeter() {
    const meter = this.localMeter
    this.localMeter = undefined
    if (!meter) return
    meter.source.disconnect(); meter.analyser.disconnect()
    void meter.context.close().catch((handledError) => { logHandledException("voice.closeLocalMeter.21", handledError); })
  }

  private async poll(run: number) {
    if (!this.current(run)) return
    if (!this.pollBusy) {
      this.pollBusy = true
      const levels = new Map<string, number>()
      try {
        await Promise.allSettled([...this.peers.values()].map(async peer => {
          if (peer.pc.connectionState !== 'connected') return
          const stats = await peer.pc.getStats()
          if (!this.live(peer)) return
          stats.forEach(report => {
            const member = this.state.members[peer.member.membershipId]
            if (member && report.type === 'candidate-pair' && report.state === 'succeeded' && report.localCandidateId) member.candidateType = stats.get(report.localCandidateId)?.candidateType
            if (member && report.type === 'inbound-rtp') { member.packetsReceived = report.packetsReceived; member.packetsLost = report.packetsLost }
            if (report.kind !== 'audio' && report.mediaType !== 'audio') return
            const local = report.type === 'media-source'
            if (!local && report.type !== 'inbound-rtp') return
            const id = local ? this.descriptor!.membershipId : peer.member.membershipId
            let level = typeof report.audioLevel === 'number' ? report.audioLevel : 0
            if (typeof report.totalAudioEnergy === 'number' && typeof report.totalSamplesDuration === 'number') {
              const key = `${peer.member.membershipId}:${peer.fence.local}:${report.id}`
              const previous = this.energies.get(key)
              if (previous && report.totalSamplesDuration > previous.duration && report.totalAudioEnergy >= previous.energy) level = Math.max(level, Math.sqrt((report.totalAudioEnergy - previous.energy) / (report.totalSamplesDuration - previous.duration)))
              this.energies.set(key, { energy: report.totalAudioEnergy, duration: report.totalSamplesDuration })
            }
            levels.set(id, Math.max(levels.get(id) ?? 0, level))
          })
        }))
        if (!this.current(run)) return
        const meter = this.localMeter
        if (meter?.context.state === 'running' && this.descriptor) {
          meter.analyser.getFloatTimeDomainData(meter.samples)
          const rms = Math.sqrt(meter.samples.reduce((sum, value) => sum + value * value, 0) / meter.samples.length)
          levels.set(this.descriptor.membershipId, rms)
        }
        for (const [id, member] of Object.entries(this.state.members)) {
          const item = this.activity.get(id) ?? { hits: 0, last: 0 }
          const muted = member.muted || (id === this.descriptor?.membershipId && this.state.muted)
          if (!muted && (levels.get(id) ?? 0) >= 0.02) { item.hits++; item.last = Date.now() }
          else item.hits = 0
          member.speaking = !muted && (item.hits >= 2 || (member.speaking && Date.now() - item.last < 500))
          this.activity.set(id, item)
        }
        this.publish()
      } catch (handledError) { logHandledException("voice.poll.22", handledError);  /* A closed peer may reject an in-flight stats request. */ }
      finally { if (this.run === run) this.pollBusy = false }
    }
    if (this.current(run)) this.later(() => void this.poll(run), 200)
  }
}

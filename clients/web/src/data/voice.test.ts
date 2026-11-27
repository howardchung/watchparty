import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MeshVoice, PeerGenerationFence, audioOnlySdp, type VoiceState } from './voice'
import { sessionLog } from './sessionLog'

const sockets = vi.hoisted(() => [] as FakeSocket[])
vi.mock('socket.io-client', () => ({ io: () => { const socket = new FakeSocket(); sockets.push(socket); return socket } }))
class FakeSocket {
  connected = false
  events = new Map<string, (...args: any[]) => void>()
  sent: { event: string; payload: any }[] = []
  acknowledger?: (event: string, payload: any, ack: (...args: any[]) => void) => void
  on(event: string, handler: (...args: any[]) => void) { this.events.set(event, handler); return this }
  connect() { this.connected = true; this.events.get('connect')?.(); return this }
  disconnect() { this.connected = false; return this }
  removeAllListeners() { this.events.clear(); return this }
  timeout() { return this }
  emit(event: string, payload: any, ack: (...args: any[]) => void) { this.sent.push({ event, payload }); if (this.acknowledger) this.acknowledger(event, payload, ack); else ack(null, event === 'auth.refresh' ? { expiresAt: new Date(Date.now() + 600000).toISOString() } : { ok: true }); return this }
  deliver(event: string, payload: unknown) { this.events.get(event)?.(payload) }
}
const descriptor = { mode: 'MESH', roomId: 'room', membershipId: 'a', voiceSessionId: 'g1', namespace: '/watchparty/voice/room', ticket: 'secret', iceServers: [], iceExpiresAt: new Date(Date.now() + 600000).toISOString() }
const flush = async () => { for (let i = 0; i < 15; i++) await Promise.resolve() }
const clients: MeshVoice[] = []
function setup(selfId = 'a', generation = 'g1') {
  const track = { enabled: true, stop: vi.fn() }
  const stream = { getAudioTracks: () => [track], getTracks: () => [track] }
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) } })
  vi.stubGlobal('window', { location: { origin: 'https://example.test' } })
  const request = vi.fn().mockResolvedValue({ ...descriptor, membershipId: selfId, voiceSessionId: generation })
  const states: VoiceState[] = []
  const client = new MeshVoice({ roomId: 'room', request, token: async () => 'id-token', onState: state => states.push(state) })
  clients.push(client)
  return { client, request, track, states }
}
beforeEach(() => { vi.stubGlobal('RTCPeerConnection', FakePeer) })
afterEach(() => { FakePeer.autoConnect = false; clients.splice(0).forEach(client => client.disconnect()); sockets.length = 0; vi.unstubAllGlobals(); vi.useRealTimers() })

describe('Android-compatible peer epochs', () => {
  it('fences stale answers, candidates and restarts after replacement', () => {
    const fence = new PeerGenerationFence(3)
    expect(fence.accept('answer', 7, 2)).toBe(false)
    expect(fence.accept('ice', 7, 0)).toBe(true)
    expect(fence.remote).toBeUndefined()
    expect(fence.accept('answer', 7, 3)).toBe(true)
    expect(fence.accept('ice', 6, 3)).toBe(false)
    expect(fence.accept('restart', 7, 2)).toBe(false)
    expect(fence.accept('restart', 7, 3)).toBe(true)
  })
  it('only accepts newer offers and safe integer epochs', () => {
    const fence = new PeerGenerationFence(1)
    expect(fence.accept('offer', 2, 0)).toBe(true)
    expect(fence.accept('offer', 2, 0)).toBe(false)
    expect(fence.accept('offer', 1, 0)).toBe(false)
    expect(fence.accept('offer', 3, 0)).toBe(true)
    expect(fence.accept('ice', Number.MAX_SAFE_INTEGER + 1, 0)).toBe(false)
    expect(fence.accept('ice', 3, -1)).toBe(false)
  })
})
describe('microphone-only SDP', () => {
  it('rejects video, control data channels, duplicate media, and oversized SDP', () => {
    expect(audioOnlySdp('v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n')).toBe(true)
    for (const sdp of ['m=video 9 RTP/AVP 96', 'm=audio 9 RTP/AVP 111\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel', 'm=audio 9 x\nm=audio 9 x', 'm=audio ' + 'x'.repeat(60000)]) expect(audioOnlySdp(sdp)).toBe(false)
  })
})
describe('voice capture lifecycle', () => {
  it.each([undefined, null, {}, () => {}])('rejects unavailable WebRTC before microphone capture (%s)', async value => {
    const { client, request, states } = setup()
    vi.stubGlobal('RTCPeerConnection', value)
    await expect(client.join()).rejects.toThrow('WEBRTC_UNAVAILABLE')
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled()
    expect(request).not.toHaveBeenCalled()
    expect(sockets).toHaveLength(0)
    expect(states.at(-1)).toMatchObject({ status: 'error', muted: true, error: 'WEBRTC_UNAVAILABLE' })
    vi.stubGlobal('RTCPeerConnection', FakePeer)
    const joining = client.join(); await flush()
    sockets[0].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] })
    await joining
    expect(states.at(-1)?.status).toBe('connected')
  })

  it('retains the original handled peer-construction exception in the manual-report log', async () => {
    vi.useFakeTimers()
    const error = new TypeError('Peer construction failed credential=private-credential')
    vi.stubGlobal('RTCPeerConnection', class { constructor() { throw error } })
    const { client, states, track } = setup()
    const before = sessionLog().length
    const joining = expect(client.join()).rejects.toThrow('Peer construction failed'); await flush()
    sockets[0].deliver('voice.roster', { members: [
      { membershipId: 'a', voiceSessionId: 'g1', muted: true },
      { membershipId: 'b', voiceSessionId: 'g2', muted: true },
    ] })
    await flush()
    expect(states.at(-1)?.status).toBe('error')
    const saved = sessionLog().slice(before)
    expect(saved).not.toContain('Peer construction failed')
    expect(saved).toContain('TypeError')
    expect(saved).toContain('exception.handled')
    expect(saved).not.toContain('private-credential')
    await joining
    expect(track.stop).toHaveBeenCalledTimes(1)
    expect(sockets[0].connected).toBe(false)
  })
  it('opts in muted, waits for roster, updates auth without replacing media, and stops capture on leave', async () => {
    const { client, track, states, request } = setup()
    const joining = client.join(); await flush()
    expect(track.enabled).toBe(false)
    expect(states.at(-1)?.status).toBe('connecting')
    sockets[0].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] })
    await joining
    expect(states.at(-1)?.status).toBe('connected')
    await client.refreshAuth('new-access-token')
    expect(request).toHaveBeenCalledTimes(1)
    expect(sockets[0].sent).toContainEqual({ event: 'auth.refresh', payload: { accessToken: 'new-access-token' } })
    await client.setMuted(false); expect(track.enabled).toBe(true)
    await client.setMuted(true); expect(track.enabled).toBe(false)
    client.disconnect()
    expect(track.stop).toHaveBeenCalledTimes(1)
    expect(sockets[0].connected).toBe(false)
    expect(states.at(-1)?.status).toBe('off')
  })
  it('stops a late permission result after leave without creating a socket', async () => {
    const { client, track } = setup()
    let resolve!: (value: MediaStream) => void
    vi.mocked(navigator.mediaDevices.getUserMedia).mockImplementation(() => new Promise(done => { resolve = done }))
    const joining = client.join()
    client.disconnect()
    await joining
    resolve({ getAudioTracks: () => [track], getTracks: () => [track] } as unknown as MediaStream)
    await flush()
    expect(track.stop).toHaveBeenCalledTimes(1)
    expect(sockets).toHaveLength(0)
  })
  it('settles an in-flight join when disconnected before the roster', async () => {
    const { client, track } = setup()
    const joining = client.join(); await flush()
    client.disconnect()
    await joining
    expect(track.stop).toHaveBeenCalledTimes(1)
    expect(sockets[0].connected).toBe(false)
  })
  it('reports microphone denial and releases the session', async () => {
    const { client, states } = setup()
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValue(new Error('Microphone permission denied'))
    await expect(client.join()).rejects.toThrow('permission denied')
    expect(states.at(-1)?.status).toBe('error')
    expect(sockets).toHaveLength(0)
  })
})

class FakePeer {
  static peers: FakePeer[] = []
  static autoConnect = false
  connectionState = 'new'
  localDescription?: RTCSessionDescriptionInit
  ondatachannel?: (...args: any[]) => void
  ontrack?: (...args: any[]) => void
  onicecandidate?: (...args: any[]) => void
  onconnectionstatechange?: (...args: any[]) => void
  close = vi.fn(() => { this.connectionState = 'closed' })
  setRemoteDescription = vi.fn(async (description?: RTCSessionDescriptionInit) => { if (FakePeer.autoConnect && description?.type === 'answer') this.connect() })
  addIceCandidate = vi.fn(async () => {})
  constructor() { FakePeer.peers.push(this) }
  addTrack() {}
  createOffer = async () => ({ type: 'offer' as const, sdp: 'v=0\r\nm=audio 9 RTP/AVP 111\r\n' })
  createAnswer = async () => ({ type: 'answer' as const, sdp: 'v=0\r\nm=audio 9 RTP/AVP 111\r\n' })
  async setLocalDescription(value: RTCSessionDescriptionInit) { this.localDescription = value; this.onicecandidate?.({ candidate: { toJSON: () => ({ candidate: 'candidate:1' }) } }); if (FakePeer.autoConnect && value.type === 'answer') this.connect() }
  setConfiguration() {}
  getStats = async () => new Map()
  connect() { this.connectionState = 'connected'; this.onconnectionstatechange?.() }
}
async function joinedPeer(selfId = 'a') {
  FakePeer.peers = []
  vi.stubGlobal('RTCPeerConnection', FakePeer)
  vi.stubGlobal('Audio', class { autoplay = false; muted = true; srcObject = null; play = async () => {}; pause() {} })
  const context = setup(selfId)
  const joining = context.client.join(); await flush()
  sockets[0].deliver('voice.roster', { members: [{ membershipId: selfId, voiceSessionId: 'g1', muted: true }, { membershipId: selfId === 'a' ? 'b' : 'a', voiceSessionId: 'g2', muted: true }] })
  await joining; await flush()
  return context
}
describe('v4 recovery and authorization', () => {
  it('uses explicit join and refresh without replacing its ticket or media', async () => {
    vi.useFakeTimers()
    const { client, request } = setup()
    const joining = client.join(); await flush()
    sockets[0].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] }); await joining
    expect(request).toHaveBeenNthCalledWith(1, '/v1/rooms/room/voice/config', { operation: 'join' })
    await vi.advanceTimersByTimeAsync(300000)
    expect(request).toHaveBeenLastCalledWith('/v1/rooms/room/voice/config', { operation: 'refresh', voiceSessionId: 'g1' })
  })
  it('keeps capture disabled for rejected unmute acknowledgements', async () => {
    const { client, track } = setup()
    const joining = client.join(); await flush()
    sockets[0].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] }); await joining
    sockets[0].acknowledger = (_, __, ack) => ack(null, { code: 'FORBIDDEN' })
    await expect(client.setMuted(false)).rejects.toThrow('FORBIDDEN')
    expect(track.enabled).toBe(false)
  })
  it('does not enable capture from a delayed unmute after a later mute intent', async () => {
    const { client, track } = setup()
    const joining = client.join(); await flush()
    sockets[0].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] }); await joining; await flush()
    let acknowledge!: () => void
    sockets[0].acknowledger = (_, __, ack) => { acknowledge = () => ack(null, { ok: true }) }
    const unmute = client.setMuted(false); await flush()
    const mute = client.setMuted(true)
    expect(track.enabled).toBe(false)
    acknowledge(); await unmute; await flush()
    expect(track.enabled).toBe(false)
    acknowledge(); await mute
    expect(track.enabled).toBe(false)
  })
  it('orders SDP before ICE and retries a lost ACK with the same negotiation ID', async () => {
    vi.useFakeTimers()
    const { client } = await joinedPeer()
    await vi.advanceTimersByTimeAsync(100)
    const sent = sockets[0].sent.filter(item => item.event === 'signal')
    expect(JSON.parse(sent[0].payload.msg).sdp.type).toBe('offer')
    expect(JSON.parse(sent[1].payload.msg).ice.candidate).toBe('candidate:1')
    let attempts = 0
    sockets[0].acknowledger = (event, _, ack) => event === 'signal' && ++attempts === 1 ? ack(new Error('ACK timeout')) : ack(null, { ok: true })
    FakePeer.peers[0].onicecandidate?.({ candidate: { toJSON: () => ({ candidate: 'candidate:2' }) } })
    await vi.advanceTimersByTimeAsync(1000)
    const retried = sockets[0].sent.filter(item => item.event === 'signal').slice(-2)
    expect(retried[0].payload.msg).toBe(retried[1].payload.msg)
    expect(JSON.parse(retried[0].payload.msg).negotiationId).toMatch(/^web:/)
    client.disconnect()
  })
  it('preserves a connected link when another link exhausts retries', async () => {
    vi.useFakeTimers()
    const { client, states } = await joinedPeer()
    FakePeer.peers[0].connect()
    sockets[0].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }, { membershipId: 'b', voiceSessionId: 'g2', muted: true }, { membershipId: 'c', voiceSessionId: 'g3', muted: true }] })
    await flush()
    await vi.advanceTimersByTimeAsync(45000)
    expect(FakePeer.peers[0].close).not.toHaveBeenCalled()
    expect(states.at(-1)?.status).toBe('degraded')
    expect(states.at(-1)?.members.c.connection).toBe('unavailable')
    const count = FakePeer.peers.length
    client.retryConnections(); await vi.advanceTimersByTimeAsync(1000)
    expect(FakePeer.peers.length).toBeGreaterThan(count)
    expect(FakePeer.peers[0].close).not.toHaveBeenCalled()
  })
  it('resumes the generation after socket loss and retains its established peer', async () => {
    vi.useFakeTimers()
    const { client, request } = await joinedPeer()
    FakePeer.peers[0].connect()
    sockets[0].connected = false; sockets[0].deliver('disconnect', 'transport close')
    await vi.advanceTimersByTimeAsync(1000)
    expect(request).toHaveBeenLastCalledWith('/v1/rooms/room/voice/config', { operation: 'resume', voiceSessionId: 'g1' })
    sockets[1].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }, { membershipId: 'b', voiceSessionId: 'g2', muted: true }] }); await flush()
    expect(FakePeer.peers[0].close).not.toHaveBeenCalled()
    client.disconnect()
  })
})


describe('bounded and reusable startup', () => {
  it('settles startup at thirty seconds even when microphone permission never resolves', async () => {
    vi.useFakeTimers()
    const { client, states, track } = setup()
    let resolve!: (stream: MediaStream) => void
    vi.mocked(navigator.mediaDevices.getUserMedia).mockImplementation(() => new Promise(done => { resolve = done }))
    const joining = client.join()
    await vi.advanceTimersByTimeAsync(30000)
    await joining
    expect(states.at(-1)?.status).toBe('error')
    resolve({ getAudioTracks: () => [track], getTracks: () => [track] } as unknown as MediaStream)
    await flush()
    expect(track.stop).toHaveBeenCalledTimes(1)
    expect(sockets).toHaveLength(0)
  })
  it('starts a new owner queue after leave interrupts a pending peer retry', async () => {
    vi.useFakeTimers()
    const { client, states } = await joinedPeer()
    await vi.advanceTimersByTimeAsync(10000)
    client.disconnect()
    const joining = client.join(); await flush()
    sockets[1].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] })
    await joining
    expect(states.at(-1)?.status).toBe('connected')
  })
})

describe('stale asynchronous recovery', () => {
  it('ignores an old auth acknowledgement after a new call has started', async () => {
    const { client, states } = setup()
    let joining = client.join(); await flush()
    sockets[0].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] }); await joining
    let rejectOld!: () => void
    sockets[0].acknowledger = (event, __, ack) => { if (event === 'auth.refresh') rejectOld = () => ack(new Error('Lost acknowledgement')); else ack(null, { ok: true }) }
    const refreshing = client.refreshAuth('old')
    client.disconnect(); joining = client.join(); await flush()
    sockets[1].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] }); await joining
    rejectOld(); await refreshing
    expect(states.at(-1)?.status).toBe('connected')
    await client.setMuted(false)
    expect(states.at(-1)?.muted).toBe(false)
  })
  it('does not issue stale resume requests when token refresh finishes after leave', async () => {
    vi.useFakeTimers()
    const { client, request } = setup()
    let tokenDone!: (value: string) => void
    ;(client as any).options.token = () => new Promise(resolve => { tokenDone = resolve })
    let joining = client.join(); await flush()
    sockets[0].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] }); await joining
    sockets[0].connected = false; sockets[0].deliver('disconnect', 'transport close')
    await vi.advanceTimersByTimeAsync(1000)
    client.disconnect(); joining = client.join(); await flush()
    sockets[1].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] }); await joining
    tokenDone('refreshed'); await flush()
    expect(request).toHaveBeenCalledTimes(2)
  })
  it('settles mute authorization independently of remote autoplay readiness', async () => {
    const { client, track } = await joinedPeer()
    const peer = [...(client as any).peers.values()][0]
    peer.audio.srcObject = {}; peer.audio.play = () => new Promise(() => {})
    await client.setMuted(false)
    expect(track.enabled).toBe(true)
    client.disconnect()
  })
})


describe('authenticated roster readiness and explicit opt-out', () => {
  it('replays mute only after the first authenticated roster and only once per socket', async () => {
    const { client } = setup()
    const joining = client.join(); await flush()
    expect(sockets[0].sent.filter(item => item.event === 'voice.mute')).toHaveLength(0)
    const roster = { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] }
    sockets[0].deliver('voice.roster', roster); await joining; await flush()
    expect(sockets[0].sent.filter(item => item.event === 'voice.mute')).toHaveLength(1)
    sockets[0].deliver('voice.roster', roster); await flush()
    expect(sockets[0].sent.filter(item => item.event === 'voice.mute')).toHaveLength(1)
  })
  it('retires only the old socket when its leave acknowledgement arrives after rejoin', async () => {
    vi.useFakeTimers()
    const { client, track } = setup()
    let joining = client.join(); await flush()
    const roster = { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] }
    sockets[0].deliver('voice.roster', roster); await joining; await flush()
    let finishLeave!: () => void
    sockets[0].acknowledger = (event, _, ack) => { if (event === 'voice.leave') finishLeave = () => ack(null, { ok: true }); else ack(null, { ok: true }) }
    client.disconnect()
    expect(track.stop).toHaveBeenCalledTimes(1)
    expect(sockets[0].sent).toContainEqual({ event: 'voice.leave', payload: {} })
    joining = client.join(); await flush()
    sockets[1].deliver('voice.roster', roster); await joining
    finishLeave()
    expect(sockets[0].connected).toBe(false)
    expect(sockets[1].connected).toBe(true)
  })
})


describe('nonfatal signaling loss preserves the active call', () => {
  it('rejects offline unmute without converting a retained healthy link into a fresh-join error', async () => {
    const { client, states, track } = await joinedPeer()
    FakePeer.peers[0].connect()
    sockets[0].connected = false; sockets[0].deliver('disconnect', 'transport close')
    await expect(client.setMuted(false)).rejects.toThrow('offline')
    expect(track.enabled).toBe(false)
    expect(states.at(-1)?.status).toBe('reconnecting')
    expect(FakePeer.peers[0].close).not.toHaveBeenCalled()
  })
})


describe('manual recovery with a single designated offerer', () => {
  it('lets the higher member request the first offer after both automatic retry budgets are exhausted', async () => {
    vi.useFakeTimers()
    const { client } = await joinedPeer('b')
    const peer = [...(client as any).peers.values()][0]
    expect(peer.fence.remote).toBeUndefined()
    peer.retries = 3; peer.exhausted = true; peer.pc.connectionState = 'failed'
    client.retryConnections(); await vi.advanceTimersByTimeAsync(200)
    const signals = sockets[0].sent.filter(item => item.event === 'signal').map(item => JSON.parse(item.payload.msg))
    expect(signals).toHaveLength(1)
    expect(signals[0]).toMatchObject({ requestOffer: true, peerGeneration: 2, targetPeerGeneration: 0, generation: 'g1', targetGeneration: 'g2' })
    expect(signals[0].sdp).toBeUndefined()
    expect(FakePeer.peers[0].close).toHaveBeenCalledTimes(1)
    expect(FakePeer.peers).toHaveLength(2)
  })
  it('resets only the failed offerer link and ignores duplicated or stale requests across peer replacement', async () => {
    vi.useFakeTimers()
    const { client } = await joinedPeer()
    await vi.advanceTimersByTimeAsync(200)
    const original = [...(client as any).peers.values()][0]
    original.retries = 3; original.exhausted = true; original.pc.connectionState = 'failed'
    const request = { negotiationId: 'user-request-2', generation: 'g2', targetGeneration: 'g1', peerGeneration: 2, targetPeerGeneration: 0, requestOffer: true }
    sockets[0].deliver('signal', { from: 'b', msg: JSON.stringify(request) }); await vi.advanceTimersByTimeAsync(200)
    expect(FakePeer.peers).toHaveLength(2)
    const replacement = [...(client as any).peers.values()][0]
    expect(replacement.retries).toBe(0)
    sockets[0].deliver('signal', { from: 'b', msg: JSON.stringify(request) })
    sockets[0].deliver('signal', { from: 'b', msg: JSON.stringify({ ...request, negotiationId: 'same-epoch-new-id' }) }); await vi.advanceTimersByTimeAsync(200)
    expect(FakePeer.peers).toHaveLength(2)
    replacement.pc.connect(); replacement.fence.remote = 3
    sockets[0].deliver('signal', { from: 'b', msg: JSON.stringify({ ...request, negotiationId: 'healthy-link-request', peerGeneration: 3 }) }); await vi.advanceTimersByTimeAsync(200)
    expect(FakePeer.peers).toHaveLength(2)
    expect(replacement.pc.close).not.toHaveBeenCalled()
    replacement.pc.connectionState = 'failed'
    sockets[0].deliver('signal', { from: 'b', msg: JSON.stringify({ ...request, negotiationId: 'stale-after-healthy', peerGeneration: 3 }) }); await vi.advanceTimersByTimeAsync(200)
    expect(FakePeer.peers).toHaveLength(2)
    sockets[0].deliver('signal', { from: 'b', msg: JSON.stringify({ ...request, negotiationId: 'next-user-request', peerGeneration: 4 }) }); await vi.advanceTimersByTimeAsync(200)
    expect(FakePeer.peers).toHaveLength(3)
  })
})


it('recovers both exhausted mesh owners through a user request and exactly one designated offer', async () => {
  vi.useFakeTimers(); FakePeer.peers = []; FakePeer.autoConnect = true
  vi.stubGlobal('RTCPeerConnection', FakePeer)
  vi.stubGlobal('Audio', class { autoplay = false; muted = true; srcObject = null; play = async () => {}; pause() {} })
  const lower = setup('a', 'ga'); const higher = setup('b', 'gb')
  const joins = [lower.client.join(), higher.client.join()]; await flush()
  const roster = { members: [{ membershipId: 'a', voiceSessionId: 'ga', muted: true }, { membershipId: 'b', voiceSessionId: 'gb', muted: true }] }
  sockets[0].deliver('voice.roster', roster); sockets[1].deliver('voice.roster', roster)
  await Promise.all(joins); await vi.advanceTimersByTimeAsync(200)
  for (const client of [lower.client, higher.client]) {
    const peer = [...(client as any).peers.values()][0] as any
    peer.retries = 3; peer.exhausted = true; peer.pc.connectionState = 'failed'
    expect(peer.fence.remote).toBeUndefined()
  }
  for (let index = 0; index < 2; index++) sockets[index].acknowledger = (event, payload, ack) => {
    ack(null, { ok: true })
    if (event === 'signal') sockets[1 - index].deliver('signal', { from: index === 0 ? 'a' : 'b', msg: payload.msg })
  }
  const previousOffers = sockets[0].sent.filter(item => item.event === 'signal' && JSON.parse(item.payload.msg).sdp?.type === 'offer').length
  higher.client.retryConnections(); await vi.advanceTimersByTimeAsync(1000)
  expect(lower.states.at(-1)?.status).toBe('connected')
  expect(higher.states.at(-1)?.status).toBe('connected')
  const control = sockets[1].sent.find(item => item.event === 'signal' && JSON.parse(item.payload.msg).requestOffer)
  expect(control).toBeDefined()
  expect(sockets[0].sent.filter(item => item.event === 'signal' && JSON.parse(item.payload.msg).sdp?.type === 'offer')).toHaveLength(previousOffers + 1)
  sockets[0].deliver('signal', { from: 'b', msg: control!.payload.msg }); await vi.advanceTimersByTimeAsync(200)
  expect(sockets[0].sent.filter(item => item.event === 'signal' && JSON.parse(item.payload.msg).sdp?.type === 'offer')).toHaveLength(previousOffers + 1)
  FakePeer.autoConnect = false
})

it('replaces an apparently connected addressed peer when a newer remote epoch proves remote disposal', async () => {
  vi.useFakeTimers()
  const { client } = await joinedPeer()
  await vi.advanceTimersByTimeAsync(200)
  const peer = [...(client as any).peers.values()][0] as any
  peer.fence.remote = 1; peer.pc.connect()
  sockets[0].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }, { membershipId: 'b', voiceSessionId: 'g2', muted: true }, { membershipId: 'c', voiceSessionId: 'g3', muted: true }] }); await vi.advanceTimersByTimeAsync(200)
  const healthy = (client as any).peers.get('c'); healthy.pc.connect()
  sockets[0].deliver('signal', { from: 'b', msg: JSON.stringify({ negotiationId: 'asymmetric-recovery', generation: 'g2', targetGeneration: 'g1', peerGeneration: 2, targetPeerGeneration: 0, requestOffer: true }) }); await vi.advanceTimersByTimeAsync(200)
  expect(peer.pc.close).toHaveBeenCalledTimes(1)
  expect(healthy.pc.close).not.toHaveBeenCalled()
  expect((client as any).peers.get('b')).not.toBe(peer)
})


it('keeps recovery paused until a fresh authenticated socket roster even if old-socket auth succeeds', async () => {
  vi.useFakeTimers()
  const { client, states } = await joinedPeer()
  FakePeer.peers[0].connect()
  sockets[0].acknowledger = (event, _, ack) => ack(null, event === 'auth.refresh' ? { code: 'AUTH_UNAVAILABLE' } : { ok: true })
  await expect(client.refreshAuth('first')).rejects.toThrow('AUTH_UNAVAILABLE')
  expect(states.at(-1)?.status).toBe('reconnecting')
  sockets[0].acknowledger = (event, _, ack) => ack(null, event === 'auth.refresh' ? { expiresAt: new Date(Date.now() + 600000).toISOString() } : { ok: true })
  await client.refreshAuth('second')
  expect(states.at(-1)?.status).toBe('reconnecting')
  sockets[0].acknowledger = (event, _, ack) => ack(null, event === 'auth.refresh' ? { code: 'AUTH_UNAVAILABLE' } : { ok: true })
  await expect(client.refreshAuth('third')).rejects.toThrow('AUTH_UNAVAILABLE')
  sockets[0].connected = false; sockets[0].deliver('disconnect', 'transport close')
  await vi.advanceTimersByTimeAsync(1000)
  sockets[1].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }, { membershipId: 'b', voiceSessionId: 'g2', muted: true }] }); await flush()
  expect(states.at(-1)?.status).toBe('connected')
  expect(FakePeer.peers[0].close).not.toHaveBeenCalled()
})


it('keeps capture disabled through unmute-mute-unmute until the latest command acknowledgement', async () => {
  const { client, track } = setup()
  const joining = client.join(); await flush()
  sockets[0].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] }); await joining; await flush()
  const acknowledgements: (() => void)[] = []
  sockets[0].acknowledger = (event, _, ack) => { if (event === 'voice.mute') acknowledgements.push(() => ack(null, { ok: true })); else ack(null, { ok: true }) }
  const firstUnmute = client.setMuted(false); await flush()
  const mute = client.setMuted(true)
  const latestUnmute = client.setMuted(false)
  expect(track.enabled).toBe(false)
  acknowledgements[0](); await firstUnmute; await flush()
  expect(track.enabled).toBe(false)
  acknowledgements[1](); await mute; await flush()
  expect(track.enabled).toBe(false)
  acknowledgements[2](); await latestUnmute
  expect(track.enabled).toBe(true)
})


it('does not enable capture when signaling disconnects after ACK resolution but before continuation', async () => {
  const { client, track } = setup()
  const joining = client.join(); await flush()
  sockets[0].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] }); await joining; await flush()
  sockets[0].acknowledger = (event, _, ack) => { ack(null, { ok: true }); if (event === 'voice.mute') { sockets[0].connected = false; sockets[0].deliver('disconnect', 'transport close') } }
  await expect(client.setMuted(false)).rejects.toThrow('authorization changed')
  expect(track.enabled).toBe(false)
})

it('does not enable capture when authorization pauses in the ACK continuation gap', async () => {
  const { client, track } = setup()
  const joining = client.join(); await flush()
  sockets[0].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] }); await joining; await flush()
  sockets[0].acknowledger = (event, _, ack) => { ack(null, { ok: true }); if (event === 'voice.mute') (client as any).authPaused = true }
  await expect(client.setMuted(false)).rejects.toThrow('authorization changed')
  expect(track.enabled).toBe(false)
})


it('ignores credential HTTP results from before a same-run fresh voice generation and continues renewing the replacement', async () => {
  vi.useFakeTimers()
  const { client, request, states } = setup()
  const joining = client.join(); await flush()
  sockets[0].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] }); await joining; await flush()
  let resolveOld!: (value: unknown) => void
  let oldPending = true
  request.mockImplementation(async (_path: string, body: any) => {
    if (body.operation === 'resume') throw Object.assign(new Error('expired'), { code: 'VOICE_SESSION_EXPIRED' })
    if (body.operation === 'refresh' && oldPending) return new Promise(resolve => { resolveOld = resolve })
    return { ...descriptor, voiceSessionId: 'g2', ticket: 'replacement-ticket' }
  })
  const refreshing = (client as any).refreshCredentials((client as any).run)
  await flush()
  sockets[0].connected = false; sockets[0].deliver('disconnect', 'transport close')
  await vi.advanceTimersByTimeAsync(1000)
  sockets[1].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g2', muted: true }] }); await flush()
  oldPending = false; resolveOld({ ...descriptor, ticket: undefined })
  await refreshing
  expect(states.at(-1)?.status).toBe('connected')
  expect((client as any).descriptor.voiceSessionId).toBe('g2')
  expect((client as any).descriptor.ticket).toBe('replacement-ticket')
  await vi.advanceTimersByTimeAsync(30000)
  expect(request).toHaveBeenLastCalledWith('/v1/rooms/room/voice/config', { operation: 'refresh', voiceSessionId: 'g2' })
})

describe('local microphone speaking indicator', () => {
  function meter() {
    let level = 0.1
    const source = { connect: vi.fn(), disconnect: vi.fn() }
    const analyser = { fftSize: 2048, getFloatTimeDomainData: (samples: Float32Array) => samples.fill(level), disconnect: vi.fn() }
    const context = { state: 'suspended', createMediaStreamSource: vi.fn(() => source), createAnalyser: () => analyser,
      resume: vi.fn(async () => { context.state = 'running' }), close: vi.fn(async () => { context.state = 'closed' }) }
    vi.stubGlobal('AudioContext', class { constructor() { return context } })
    return { context, source, analyser, silence: () => { level = 0 } }
  }
  async function alone() {
    const result = setup()
    const joining = result.client.join(); await flush()
    sockets[0].deliver('voice.roster', { members: [{ membershipId: 'a', voiceSessionId: 'g1', muted: true }] })
    await joining; await flush()
    return result
  }
  it('detects speech alone, releases after silence, clears immediately on mute and releases the meter on leave', async () => {
    vi.useFakeTimers()
    const audio = meter()
    const { client, states } = await alone()
    await vi.advanceTimersByTimeAsync(600)
    expect(states.at(-1)?.members.a.speaking).toBe(false)
    await client.setMuted(false)
    expect(states.at(-1)?.members.a.muted).toBe(false)
    await vi.advanceTimersByTimeAsync(200)
    expect(states.at(-1)?.members.a.speaking).toBe(false)
    await vi.advanceTimersByTimeAsync(200)
    expect(states.at(-1)?.members.a.speaking).toBe(true)
    audio.silence()
    await vi.advanceTimersByTimeAsync(400)
    expect(states.at(-1)?.members.a.speaking).toBe(true)
    await vi.advanceTimersByTimeAsync(200)
    expect(states.at(-1)?.members.a.speaking).toBe(false)
    audio.analyser.getFloatTimeDomainData = samples => samples.fill(0.1)
    await vi.advanceTimersByTimeAsync(400)
    expect(states.at(-1)?.members.a.speaking).toBe(true)
    await client.setMuted(true)
    expect(states.at(-1)?.members.a.speaking).toBe(false)
    client.disconnect()
    expect(audio.source.disconnect).toHaveBeenCalledOnce()
    expect(audio.analyser.disconnect).toHaveBeenCalledOnce()
    expect(audio.context.close).toHaveBeenCalledOnce()
  })
  it('resumes during the unmute gesture without enabling capture before authorization', async () => {
    const audio = meter()
    const { client, track } = await alone()
    audio.context.state = 'suspended'; audio.context.resume.mockClear()
    let ack!: () => void
    sockets[0].acknowledger = (_, __, callback) => { ack = () => callback(null, { ok: true }) }
    const unmute = client.setMuted(false)
    expect(audio.context.resume).toHaveBeenCalledOnce()
    expect(track.enabled).toBe(false)
    await flush(); ack(); await unmute
    expect(track.enabled).toBe(true)
  })
  it('keeps local speech detection working when a connected peer rejects stats', async () => {
    vi.useFakeTimers(); meter()
    const { client, states } = await joinedPeer()
    FakePeer.peers[0].connect()
    FakePeer.peers[0].getStats = async () => { throw new Error('peer closed during stats') }
    await client.setMuted(false)
    await vi.advanceTimersByTimeAsync(400)
    expect(states.at(-1)?.members.a.speaking).toBe(true)
  })
  it('keeps voice usable when optional Web Audio initialization fails', async () => {
    vi.stubGlobal('AudioContext', class { constructor() { throw new Error('unavailable') } })
    const { client, track, states } = await alone()
    await client.setMuted(false)
    expect(track.enabled).toBe(true)
    expect(states.at(-1)?.status).toBe('connected')
  })
})


describe('expired signaling authorization recovery (H + G)', () => {
  const roster = (generation = 'g2') => ({ members: [
    { membershipId: 'a', voiceSessionId: 'g1', muted: true },
    { membershipId: 'b', voiceSessionId: generation, muted: true },
  ] })
  const ok = (event: string, ack: (...args: any[]) => void) => ack(null, event === 'auth.refresh' ? { expiresAt: new Date(Date.now() + 600000).toISOString() } : { ok: true })
  async function expire(context: Awaited<ReturnType<typeof joinedPeer>>) {
    await vi.advanceTimersByTimeAsync(200)
    sockets[0].acknowledger = (event, _, ack) => event === 'signal' ? ack(null, { code: 'SESSION_EXPIRED' }) : ok(event, ack)
    FakePeer.peers[0].onicecandidate?.({ candidate: { toJSON: () => ({ candidate: 'expired' }) } })
    await vi.advanceTimersByTimeAsync(100)
    expect(sockets[0].connected).toBe(true)
    expect(context.states.at(-1)?.status).toBe('reconnecting')
  }

  it('recovers a connected but expired socket, negotiates again, and publishes accurate member states', async () => {
    vi.useFakeTimers()
    const context = await joinedPeer()
    const token = vi.fn().mockResolvedValue('fresh-token'); (context.client as any).options.token = token
    await expire(context)
    await vi.advanceTimersByTimeAsync(1000)
    expect(token).toHaveBeenCalledExactlyOnceWith(true)
    expect(context.request).toHaveBeenLastCalledWith('/v1/rooms/room/voice/config', { operation: 'resume', voiceSessionId: 'g1' })
    sockets[1].deliver('voice.roster', roster()); await vi.advanceTimersByTimeAsync(200)
    expect(sockets[0].connected).toBe(false)
    expect(sockets[1].sent.some(item => item.event === 'signal' && JSON.parse(item.payload.msg).sdp?.type === 'offer')).toBe(true)
    expect(context.states.at(-1)?.members.b.connection).toBe('reconnecting')
    FakePeer.peers.at(-1)!.connect()
    expect(context.states.at(-1)).toMatchObject({ status: 'connected', error: undefined, members: { b: { connection: 'connected' } } })
  })

  it('serializes simultaneous expiry failures and manual Retry, and suppresses peer timers while paused', async () => {
    vi.useFakeTimers()
    const context = await joinedPeer()
    let resolve!: (value: string) => void
    const token = vi.fn(() => new Promise<string>(done => { resolve = done })); (context.client as any).options.token = token
    await expire(context)
    sockets[0].acknowledger = (_, __, ack) => ack(null, { code: 'SESSION_EXPIRED' })
    await expect(context.client.setMuted(false)).rejects.toThrow('SESSION_EXPIRED')
    context.client.retryConnections(); context.client.retryConnections()
    const count = FakePeer.peers.length
    await vi.advanceTimersByTimeAsync(12000)
    expect(token).toHaveBeenCalledTimes(1)
    expect(FakePeer.peers).toHaveLength(count)
    expect(sockets).toHaveLength(1)
    resolve('fresh-token'); await flush()
    sockets[1].deliver('voice.roster', roster()); await vi.advanceTimersByTimeAsync(200)
    expect(context.track.enabled).toBe(true) // Latest explicit intent replayed with fresh authorization.
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1)
  })

  it('makes Retry recover a paused connected socket even without a disconnect event', async () => {
    vi.useFakeTimers()
    const context = await joinedPeer()
    ;(context.client as any).authPaused = true
    const token = vi.fn().mockResolvedValue('fresh'); (context.client as any).options.token = token
    context.client.retryConnections()
    await vi.advanceTimersByTimeAsync(1000)
    expect(token).toHaveBeenCalledExactlyOnceWith(true)
    sockets[1].deliver('voice.roster', roster()); await vi.advanceTimersByTimeAsync(200)
    expect(sockets[1].sent.some(item => item.event === 'signal')).toBe(true)
  })

  it('fences a departed participant generation and restores only the latest roster after rejoin', async () => {
    vi.useFakeTimers()
    const context = await joinedPeer()
    await expire(context)
    const departed = FakePeer.peers[0]
    sockets[0].deliver('voice.roster', { members: roster().members.slice(0, 1) }); await flush()
    expect(context.states.at(-1)?.members.b).toBeUndefined()
    sockets[0].deliver('voice.roster', roster('g3')); await flush()
    expect(departed.close).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1000)
    sockets[1].deliver('voice.roster', roster('g3')); await vi.advanceTimersByTimeAsync(200)
    const current = FakePeer.peers.at(-1)!
    sockets[1].deliver('signal', { from: 'b', msg: JSON.stringify({ negotiationId: 'departed', generation: 'g2', targetGeneration: 'g1', peerGeneration: 1, targetPeerGeneration: 0, sdp: { type: 'answer', sdp: 'm=audio 9 RTP/AVP 111' } }) }); await flush()
    expect(current.setRemoteDescription).not.toHaveBeenCalled()
    const sent = sockets[1].sent.filter(item => item.event === 'signal')
    expect(sent.length).toBeGreaterThan(0)
    expect(sent.every(item => JSON.parse(item.payload.msg).targetGeneration === 'g3')).toBe(true)
  })

  it('retains healthy established audio while recovering another failed link', async () => {
    vi.useFakeTimers()
    const context = await joinedPeer()
    FakePeer.peers[0].connect()
    sockets[0].deliver('voice.roster', { members: [...roster().members, { membershipId: 'c', voiceSessionId: 'g3', muted: true }] })
    await vi.advanceTimersByTimeAsync(200)
    await expire(context)
    const healthy = FakePeer.peers[0]
    await vi.advanceTimersByTimeAsync(1000)
    sockets[1].deliver('voice.roster', { members: [...roster().members, { membershipId: 'c', voiceSessionId: 'g3', muted: true }] }); await vi.advanceTimersByTimeAsync(200)
    expect(healthy.close).not.toHaveBeenCalled()
    expect(context.states.at(-1)?.members.b.connection).toBe('connected')
    expect(sockets[1].sent.filter(item => item.event === 'signal').every(item => item.payload.to === 'c')).toBe(true)
  })

  it('ends failed recovery with actionable state and lets manual Retry start a fresh bounded operation', async () => {
    vi.useFakeTimers()
    const context = await joinedPeer()
    await expire(context)
    context.request.mockRejectedValue(Object.assign(new Error('Unavailable'), { code: 'AUTH_UNAVAILABLE' }))
    await vi.advanceTimersByTimeAsync(60000)
    expect(context.request).toHaveBeenCalledTimes(7) // Initial join + six bounded resumes.
    expect(context.states.at(-1)).toMatchObject({ status: 'degraded', error: 'Voice signaling is unavailable. Retry voice connections.', members: { b: { connection: 'unavailable' } } })
    await vi.advanceTimersByTimeAsync(300000)
    expect(context.request).toHaveBeenCalledTimes(7)
    context.request.mockResolvedValue(descriptor)
    context.client.retryConnections(); await vi.advanceTimersByTimeAsync(1000)
    sockets[1].deliver('voice.roster', roster()); await vi.advanceTimersByTimeAsync(200)
    FakePeer.peers.at(-1)!.connect()
    expect(context.states.at(-1)?.status).toBe('connected')
  })

  it.each(['token', 'configuration'])('does not resurrect a departed call when pending %s recovery resolves after rejoin', async stage => {
    vi.useFakeTimers()
    const context = await joinedPeer()
    let resolve!: (value: any) => void
    if (stage === 'token') (context.client as any).options.token = () => new Promise(done => { resolve = done })
    else context.request.mockImplementationOnce(() => new Promise(done => { resolve = done }))
    await expire(context); await vi.advanceTimersByTimeAsync(1000)
    context.client.disconnect()
    const joining = context.client.join(); await flush()
    sockets[1].deliver('voice.roster', { members: roster().members.slice(0, 1) }); await joining
    resolve(stage === 'token' ? 'stale' : descriptor); await flush()
    expect(sockets).toHaveLength(2)
    expect(context.states.at(-1)).toMatchObject({ status: 'connected', muted: true, members: { a: { connection: 'connected' } } })
    expect(context.states.at(-1)?.members.b).toBeUndefined()
    expect(context.track.enabled).toBe(false)
  })

  it('bounds hung admission and ignores its late response within the same call', async () => {
    vi.useFakeTimers()
    const context = await joinedPeer()
    let resolve!: (value: any) => void
    context.request.mockImplementationOnce(() => new Promise(done => { resolve = done }))
    await expire(context); await vi.advanceTimersByTimeAsync(33000)
    expect(context.request).toHaveBeenCalledTimes(3) // Timed-out first attempt, then retry.
    sockets[1].deliver('voice.roster', roster()); await vi.advanceTimersByTimeAsync(200)
    FakePeer.peers.at(-1)!.connect()
    resolve({ ...descriptor, voiceSessionId: 'stale' }); await flush()
    expect(sockets).toHaveLength(2)
    expect(context.states.at(-1)?.status).toBe('connected')
  })


  it('bounds repeated authorization rejections even when fresh admission keeps succeeding', async () => {
    vi.useFakeTimers()
    const context = await joinedPeer()
    await expire(context)
    await vi.advanceTimersByTimeAsync(1000)
    for (let index = 1; index <= 6; index++) {
      expect(sockets).toHaveLength(index + 1)
      sockets[index].acknowledger = (event, _, ack) => event === 'voice.mute' ? ack(null, { code: 'SESSION_EXPIRED' }) : ok(event, ack)
      sockets[index].deliver('voice.roster', roster())
      await vi.advanceTimersByTimeAsync(Math.min(1000 * 2 ** index, 15000))
    }
    await vi.advanceTimersByTimeAsync(60000)
    expect(sockets).toHaveLength(7)
    expect(context.states.at(-1)).toMatchObject({ status: 'degraded', error: 'Voice signaling is unavailable. Retry voice connections.' })
    expect(context.track.enabled).toBe(false)
  })

  it('does not accept a successful mute replay as recovery when a signal already rejected the new authorization', async () => {
    vi.useFakeTimers()
    const context = await joinedPeer()
    await expire(context); await vi.advanceTimersByTimeAsync(1000)
    let muteAck!: () => void
    sockets[1].acknowledger = (event, _, ack) => {
      if (event === 'voice.mute') muteAck = () => ack(null, { ok: true })
      else if (event === 'signal') ack(null, { code: 'SESSION_EXPIRED' })
      else ok(event, ack)
    }
    sockets[1].deliver('voice.roster', roster()); await vi.advanceTimersByTimeAsync(200)
    FakePeer.peers[0].onicecandidate?.({ candidate: { toJSON: () => ({ candidate: 'still-expired' }) } })
    await vi.advanceTimersByTimeAsync(100)
    muteAck(); await flush()
    expect(context.states.at(-1)?.status).toBe('reconnecting')
    await vi.advanceTimersByTimeAsync(2000)
    expect(sockets).toHaveLength(3)
    sockets[2].deliver('voice.roster', roster()); await vi.advanceTimersByTimeAsync(200)
    FakePeer.peers.at(-1)!.connect()
    expect(context.states.at(-1)?.status).toBe('connected')
  })

  it('bounds a token provider that never settles and ignores late renewal after exhaustion', async () => {
    vi.useFakeTimers()
    const context = await joinedPeer()
    const pending: ((value: string) => void)[] = []
    const token = vi.fn(() => new Promise<string>(resolve => pending.push(resolve))); (context.client as any).options.token = token
    await expire(context); await vi.advanceTimersByTimeAsync(250000)
    expect(token).toHaveBeenCalledTimes(6)
    expect(context.states.at(-1)).toMatchObject({ status: 'degraded', error: 'Voice signaling is unavailable. Retry voice connections.' })
    pending.forEach(resolve => resolve('late-token')); await flush()
    expect(context.request).toHaveBeenCalledTimes(1)
    expect(sockets).toHaveLength(1)
  })

  it('cannot enable capture from a recovered socket whose mute replay timed out', async () => {
    vi.useFakeTimers()
    const context = await joinedPeer()
    await expire(context); await vi.advanceTimersByTimeAsync(1000)
    ;(context.client as any).muteIntent = false
    let acknowledge!: () => void
    sockets[1].acknowledger = (event, _, ack) => { if (event === 'voice.mute') acknowledge = () => ack(null, { ok: true }); else ok(event, ack) }
    sockets[1].deliver('voice.roster', roster()); await flush()
    await vi.advanceTimersByTimeAsync(30000)
    acknowledge(); await flush()
    expect(context.track.enabled).toBe(false)
    expect(context.states.at(-1)?.status).toBe('reconnecting')
  })
  it('does not enable capture while a recovered socket is waiting for mute authorization', async () => {
    vi.useFakeTimers()
    const context = await joinedPeer()
    await expire(context)
    await vi.advanceTimersByTimeAsync(1000)
    let acknowledge!: () => void
    sockets[1].acknowledger = (event, _, ack) => { if (event === 'voice.mute') acknowledge = () => ack(null, { ok: true }); else ok(event, ack) }
    const unmute = context.client.setMuted(false); await flush()
    expect(context.track.enabled).toBe(false)
    acknowledge(); await expect(unmute).rejects.toThrow('authorization changed')
    sockets[1].deliver('voice.roster', roster()); await flush()
    expect(context.track.enabled).toBe(false)
    acknowledge(); await vi.advanceTimersByTimeAsync(200)
    expect(context.track.enabled).toBe(true)
  })
})

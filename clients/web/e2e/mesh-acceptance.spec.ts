import { writeFile, appendFile, mkdir } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

// Opt-in: this creates real local identities/rooms and consumes real WebRTC CPU.
// Direct smoke: RUN_MESH_ACCEPTANCE=1 MESH_MEMBERS=2 CHROME_PATH=/usr/bin/google-chrome npm run test:e2e -- e2e/mesh-acceptance.spec.ts
// Capacity: MESH_ROOMS=100 MESH_MEMBERS=8 MESH_SECONDS=7200 (use a dedicated test host).
// Relay: MESH_ICE_URL='turns:relay.example:443?transport=tcp' forces one advertised transport.
test('real browser mesh exchanges identifiable synthetic audio and preserves peers on signaling loss', async ({ browser }, testInfo) => {
  test.skip(process.env.RUN_MESH_ACCEPTANCE !== '1', 'Explicit real-backend acceptance opt-in required');
  const rooms = Number(process.env.MESH_ROOMS || 1);
  const members = Number(process.env.MESH_MEMBERS || 2);
  const seconds = Number(process.env.MESH_SECONDS || 5);
  const iceUrl = process.env.MESH_ICE_URL || '';
  const cycles = Number(process.env.MESH_CYCLES || 0);
  if (!Number.isInteger(rooms) || rooms < 1 || rooms > 100 || !Number.isInteger(members) || members < 2 || members > 8 || !Number.isFinite(seconds) || seconds < 1) throw new Error('Invalid mesh acceptance dimensions');
  test.setTimeout((600 + seconds + rooms * 30 + cycles * 10) * 1000);
  const contexts = [];
  const pages = [];
  const headerAudit: { httpSeen: number; httpMatched: number; websocketSeen: number; websocketMatched: number }[] = [];
  const started = Date.now();
  let completedCycles = 0;
  await mkdir(testInfo.outputDir, { recursive: true });
  try {
    for (let roomIndex = 0; roomIndex < rooms; roomIndex++) {
      let room: { id: string; code: string } | undefined;
      for (let memberIndex = 0; memberIndex < members; memberIndex++) {
        const context = await browser.newContext(process.env.MESH_SIMULATE_CLIENT_IPS === '1' ? { extraHTTPHeaders: { 'X-Forwarded-For': `198.18.${roomIndex}.${memberIndex + 1}` } } : {}); contexts.push(context);
        await context.addInitScript(({ frequency, iceUrl }) => {
          const state = window as any;
          state.meshPcs = []; state.meshPcSequence = 0; state.meshStates = [];
          state.meshReceived = [];
          state.meshEvents = []; state.meshHttpLog = [];
          const originalFetch = window.fetch.bind(window);
          window.fetch = async (input, init) => {
            const response = await originalFetch(input, init);
            const path = new URL(typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString(), location.origin).pathname;
            if (path.startsWith('/v1/')) { state.meshHttpLog.push({ at: new Date().toISOString(), path, status: response.status, retryAfter: response.headers.get('Retry-After') }); if (state.meshHttpLog.length > 100) state.meshHttpLog.shift(); }
            return response;
          };
          state.meshRecord = (entry: unknown) => { state.meshEvents.push({ at: new Date().toISOString(), ...entry as object }); if (state.meshEvents.length > 100) state.meshEvents.shift(); };
          const Original = window.RTCPeerConnection;
          window.RTCPeerConnection = class extends Original {
            constructor(config?: RTCConfiguration) {
              super({ ...config, ...(iceUrl ? { iceTransportPolicy: 'relay' } : {}) });
              state.meshPcs.push(this);
              (this as any).__meshPcId = ++state.meshPcSequence;
              this.addEventListener('connectionstatechange', () => { state.meshStates.push({ at: Date.now(), pcId: (this as any).__meshPcId, state: this.connectionState }); if (state.meshStates.length > 512) state.meshStates.shift(); });
              this.addEventListener('track', event => {
                // Do not retain an extra realtime DSP consumer for every remote
                // track. Tone analysis is attached briefly only after readiness.
                state.meshReceived.push({ track: event.track });
              });
            }
          };
          navigator.mediaDevices.getUserMedia = async () => {
            if (state.meshCapture) { state.meshCapture.source.stop(); }
            const audio: AudioContext = state.meshAudio ||= new AudioContext();
            const source = audio.createOscillator(); source.frequency.value = frequency;
            const gain = audio.createGain(); gain.gain.value = 0.15;
            const output = audio.createMediaStreamDestination();
            source.connect(gain).connect(output); source.start(); await audio.resume();
            state.meshCapture = { audio, source, stream: output.stream };
            return output.stream;
          };
        }, { frequency: 440 + memberIndex * 110, iceUrl });
        const page = await context.newPage(); pages.push(page);
        const expectedIp = `198.18.${roomIndex}.${memberIndex + 1}`;
        const audit = { httpSeen: 0, httpMatched: 0, websocketSeen: 0, websocketMatched: 0 }; headerAudit.push(audit);
        page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/v1/')) { audit.httpSeen++; if (request.headers()['x-forwarded-for'] === expectedIp) audit.httpMatched++; } });
        const cdp = await context.newCDPSession(page); await cdp.send('Network.enable');
        cdp.on('Network.webSocketWillSendHandshakeRequest', ({ request }) => { audit.websocketSeen++; if (Object.entries(request.headers).some(([name, value]) => name.toLowerCase() === 'x-forwarded-for' && value === expectedIp)) audit.websocketMatched++; });
        await page.goto('/e2e/mesh.html');
        const admission = await page.evaluate(async ({ room, iceUrl }) => {
          const scope = window as any;
          const { ensureSession, token, watchToken, canResetIdentity } = await import('/src/data/auth.ts');
          const { request } = await import('/src/data/api.ts');
          const { RoomConnection } = await import('/src/data/realtime.ts');
          const identity = await ensureSession({ name: 'Mesh acceptance', avatar: 'moon', language: 'en' });
          scope.meshIdentityId = identity.identity.id;
          scope.meshRequest = async (path: string, body: unknown = {}) => {
            const result = await request(path, body) as any;
            if (path.endsWith('/voice/config')) result.iceServers = iceUrl ? result.iceServers.map((server: RTCIceServer) => ({ ...server, urls: [iceUrl] })).filter((server: RTCIceServer) => server.username) : [];
            return result;
          };
          const admission = room ? await scope.meshRequest(`/v1/rooms/${room.code}/join`) : await scope.meshRequest('/v1/rooms', { title: 'Mesh acceptance' });
          await new Promise<void>((resolve, reject) => {
            const deadline = setTimeout(() => reject(new Error('Room startup timed out')), 30000);
            scope.meshRoomConnection = new RoomConnection({ roomId: admission.room.id,
              onSnapshot: () => { clearTimeout(deadline); resolve(); },
              onConnection: (connected: boolean) => { scope.meshRoomConnected = connected; scope.meshRecord({ event: 'room_connection', connected }); },
              onError: (error: { code?: string }) => scope.meshRecord({ event: 'room_error', code: error.code || 'NETWORK' }),
              onClosed: () => { scope.meshVoice?.disconnect(); scope.meshHarnessError = 'Room session ended'; clearTimeout(deadline); reject(new Error('Room session ended')); },
            });
            scope.meshRoomConnection.start();
          });
          scope.meshStopTokenWatch = watchToken(accessToken => {
            scope.meshAuthUpdate = Promise.all([scope.meshRoomConnection.refreshAuth(accessToken), scope.meshVoice?.refreshAuth(accessToken)]).catch((error: { code?: string }) => {
              scope.meshRecord({ event: 'namespace_auth_error', code: error.code || 'NETWORK' });
              if (canResetIdentity(error)) scope.meshHarnessError = 'Guest authorization ended';
            });
          }, error => { scope.meshRecord({ event: 'guest_refresh_error', code: (error as { code?: string }).code || 'NETWORK' }); if (canResetIdentity(error)) scope.meshHarnessError = 'Guest authorization ended'; });
          const { MeshVoice } = await import('/src/data/voice.ts');
          scope.meshVoice = new MeshVoice({ roomId: admission.room.id, request: scope.meshRequest, token, onState: (value: unknown) => { scope.meshState = value;
            if (scope.meshVoice?.socket && scope.meshObservedSocket !== scope.meshVoice.socket) {
              const observed = scope.meshObservedSocket = scope.meshVoice.socket;
              observed.on('disconnect', (reason: string) => scope.meshRecord({ event: 'socket_disconnect', reason }));
              observed.on('connect_error', (error: { data?: { code?: string } }) => scope.meshRecord({ event: 'socket_connect_error', code: error.data?.code || 'NETWORK' }));
              observed.on('signal', (payload: { from: string; msg: string }) => { const message = JSON.parse(payload.msg); if (message.requestOffer) { const peer = scope.meshVoice.peers.get(payload.from); scope.meshRecord({ event: 'request_offer_received', from: payload.from, requesterEpoch: message.peerGeneration, targetEpoch: message.targetPeerGeneration, localState: peer?.pc.connectionState, localEpoch: peer?.fence.local, remoteEpoch: peer?.fence.remote }); } });
            }
            (scope.meshHistory ||= []).push({ time: Date.now(), value }); if (scope.meshHistory.length > 100) scope.meshHistory.shift(); } });
          const originalAck = scope.meshVoice.ack.bind(scope.meshVoice);
          scope.meshVoice.ack = async (event: string, payload: unknown) => {
            let meta: Record<string, unknown> = {};
            if (event === 'signal') { const body = payload as { to: string; msg: string }; const signal = JSON.parse(body.msg); meta = { to: body.to, negotiationId: signal.negotiationId, kind: signal.sdp?.type || (signal.ice ? 'ice' : signal.requestOffer ? 'requestOffer' : 'restart'), peerGeneration: signal.peerGeneration, targetPeerGeneration: signal.targetPeerGeneration }; }
            try { const result = await originalAck(event, payload); if (event === 'signal') scope.meshRecord({ event: 'signal_ack', ...meta }); return result; } catch (error) { const value = error as { code?: string; message?: string }; scope.meshRecord({ event: 'ack_error', operation: event, ...meta, code: value.code || (/^[A-Z_]+$/.test(value.message || '') ? value.message : 'NETWORK') }); throw error; }
          };
          if (!scope.meshVoice.disconnect.toString().includes('this.serial = Promise.resolve()')) throw new Error('Stale adapter: queue reset missing');
          await scope.meshVoice.join();
          return admission.room;
        }, { room, iceUrl });
        room = admission;
        expect(await page.evaluate(() => (window as any).meshCapture.stream.getAudioTracks().every((track: MediaStreamTrack) => !track.enabled))).toBe(true);
      }
    }
    for (const page of pages) { try { await page.evaluate(() => (window as any).meshVoice.setMuted(false)); } catch (error) { await writeFile(testInfo.outputPath('failure-state.json'), JSON.stringify({ headerAudit, clients: await Promise.all(pages.map(page => page.evaluate(() => ({ state: (window as any).meshState, events: (window as any).meshEvents, http: (window as any).meshHttpLog, peerStates: (window as any).meshPcs.map((pc: RTCPeerConnection) => pc.connectionState) })))) }, null, 2)); throw error; } }
    // Fast readiness reads avoid FFT work; tone identity is checked once ready.
    const report = async (tones = false, details = false) => Promise.all(pages.map(page => page.evaluate(async ({ tones, details }) => {
      const scope = window as any;
      const peerValues = [...scope.meshVoice.peers.values()] as any[];
      const peerDetails = (peer: any) => ({ peerId: peer.member.membershipId, localEpoch: peer.fence.local, remoteEpoch: peer.fence.remote, retries: peer.retries, exhausted: Boolean(peer.exhausted), retrying: Boolean(peer.retrying), ready: peer.ready, localReady: peer.localReady, pendingIce: peer.pending.length, localIce: peer.localIce.length, remoteSignalingConnected: peer.member.signalingConnected, pcState: peer.pc.connectionState, signalingState: peer.pc.signalingState, iceState: peer.pc.iceConnectionState, localDescriptionType: peer.pc.localDescription?.type, remoteDescriptionType: peer.pc.remoteDescription?.type });
      const links = await Promise.all(peerValues.filter(peer => peer.pc.connectionState !== 'closed').map(async peer => {
        const pc: RTCPeerConnection = peer.pc;
        const stats = await pc.getStats();
        let received = 0, energy = 0, lost = 0;
        const rows = [...stats.values()];
        rows.forEach(item => { if (item.type === 'inbound-rtp' && item.kind === 'audio') { received += item.packetsReceived || 0; energy += item.totalAudioEnergy || 0; lost += item.packetsLost || 0; } });
        const transport = rows.find(item => item.type === 'transport' && item.selectedCandidatePairId);
        const pair = transport ? stats.get(transport.selectedCandidatePairId) : rows.find(item => item.type === 'candidate-pair' && item.nominated && item.state === 'succeeded');
        const local = pair && stats.get(pair.localCandidateId); const remote = pair && stats.get(pair.remoteCandidateId);
        // W3C WebRTC getSelectedCandidatePair gives the actual selected path even
        // while a getStats report omits the corresponding candidate identity.
        // https://w3c.github.io/webrtc-pc/#dom-rtcicetransport-getselectedcandidatepair
        const ice = pc.getSenders().find(sender => sender.transport)?.transport?.iceTransport;
        const selected = ice?.getSelectedCandidatePair?.();
        const localType = selected?.local.type || local?.candidateType;
        const remoteType = selected?.remote.type || remote?.candidateType;
        const candidateTypes = rows.filter(item => item.type === 'local-candidate').map(item => item.candidateType);
        return { peerId: peer.member.membershipId, pcId: (pc as any).__meshPcId as number, state: pc.connectionState, received, energy, lost, relay: localType === 'relay', selectedPairId: pair?.id, localCandidateType: localType, remoteCandidateType: remoteType, protocol: selected?.local.protocol || local?.protocol, relayProtocol: local?.relayProtocol, icePolicy: pc.getConfiguration().iceTransportPolicy, candidateTypes, ...(details ? peerDetails(peer) : {}) };
      }));
      let frequencies: number[] = [];
      if (tones) {
        const audio: AudioContext = scope.meshAudio;
        const analyses = peerValues.flatMap(peer => {
          const track = peer.audio.srcObject?.getAudioTracks()[0];
          if (!track) return [];
          const analyser = audio.createAnalyser(); analyser.fftSize = 8192;
          const source = audio.createMediaStreamSource(new MediaStream([track])); source.connect(analyser);
          return [{ analyser, source }];
        });
        try {
          await new Promise(resolve => setTimeout(resolve, 250));
          frequencies = analyses.map(({ analyser }) => {
            const bins = new Float32Array(analyser.frequencyBinCount); analyser.getFloatFrequencyData(bins);
            let peak = 0; for (let index = 1; index < bins.length; index++) if (bins[index] > bins[peak]) peak = index;
            return peak * audio.sampleRate / analyser.fftSize;
          });
        } finally { analyses.forEach(({ analyser, source }) => { source.disconnect(); analyser.disconnect(); }); }
      }
      scope.meshPcs = scope.meshPcs.filter((pc: RTCPeerConnection) => pc.connectionState !== 'closed');
      scope.meshReceived = scope.meshReceived.filter((item: { track: MediaStreamTrack }) => item.track.readyState !== 'ended');

      return { status: scope.meshState.status, harnessError: scope.meshHarnessError, roomConnected: scope.meshRoomConnected, stateEvents: scope.meshStates.splice(0), captureEnabled: scope.meshCapture.stream.getAudioTracks().some((track: MediaStreamTrack) => track.readyState === 'live' && track.enabled), muted: scope.meshState.muted, error: scope.meshState.error, members: scope.meshState.members, links, frequencies, ...(details ? { peers: peerValues.map(peerDetails), events: scope.meshEvents, http: scope.meshHttpLog } : {}) };
    }, { tones, details })));
    try {
      await expect.poll(async () => (await report()).every(item => item.links.length === members - 1 && item.links.every(link => link.state === 'connected' && link.received > 10 && link.energy > 0)), { timeout: 60000, intervals: [1000] }).toBe(true);
      if (iceUrl) await expect.poll(async () => (await report()).every(item => item.links.every(link => link.relay)), { timeout: 10000, intervals: [1000] }).toBe(true);
    } catch (error) { await writeFile(testInfo.outputPath('failure-media.json'), JSON.stringify(await report(false, true), null, 2)); throw error; }
    const identified = await report(true);
    for (let index = 0; index < pages.length; index++) {
      const current = identified[index];
      const expected = Array.from({ length: members }, (_, member) => 440 + member * 110).filter((_, member) => member !== index % members);
      expect(expected.every(frequency => current.frequencies.some(value => Math.abs(value - frequency) < 20))).toBe(true);
    }
    if (process.env.MESH_FORCE_AUTH_REFRESH === '1') {
      const authProof = await Promise.all(pages.map(page => page.evaluate(async () => {
        const scope = window as any;
        const { token, ensureSession } = await import('/src/data/auth.ts');
        scope.meshAuthPeers = [...scope.meshVoice.peers.values()].map((peer: any) => peer.pc);
        await token(true); await scope.meshAuthUpdate;
        const identity = await ensureSession({ name: 'Mesh acceptance', avatar: 'moon', language: 'en' });
        scope.meshRoomBefore = scope.meshRoomConnection.generation;
        scope.meshRoomConnection.socket.io.engine.close();
        return { identityKept: identity.identity.id === scope.meshIdentityId };
      })));
      await expect.poll(async () => (await Promise.all(pages.map(page => page.evaluate(() => { const scope = window as any; return scope.meshRoomConnected && scope.meshRoomConnection.generation > scope.meshRoomBefore && scope.meshAuthPeers.every((pc: RTCPeerConnection) => pc.connectionState === 'connected' && [...scope.meshVoice.peers.values()].some((peer: any) => peer.pc === pc)); })))).every(Boolean), { timeout: 15000, intervals: [1000] }).toBe(true);
      expect(authProof.every(value => value.identityKept)).toBe(true);
      const recovered = await Promise.all(pages.map(page => page.evaluate(() => { const scope = window as any; return { roomConnected: scope.meshRoomConnected, oldRoomGeneration: scope.meshRoomBefore, newRoomGeneration: scope.meshRoomConnection.generation, voicePeersPreserved: scope.meshAuthPeers.every((pc: RTCPeerConnection) => pc.connectionState === 'connected' && [...scope.meshVoice.peers.values()].some((peer: any) => peer.pc === pc)) }; })));
      await writeFile(testInfo.outputPath('auth-room-recovery-proof.json'), JSON.stringify(authProof.map((value, index) => ({ ...value, ...recovered[index] })), null, 2));
    }
    if (process.env.MESH_MANUAL_RETRY === '1') {
      if (members < 3 || rooms !== 1) throw new Error('Manual recovery proof requires one room with at least three members');
      const ids = await Promise.all(pages.map(page => page.evaluate(() => (window as any).meshVoice.descriptor.membershipId as string)));
      const higherIndex = ids[0] > ids[1] ? 0 : 1; const lowerIndex = 1 - higherIndex;
      for (const [index, target] of [[higherIndex, ids[lowerIndex]], [lowerIndex, ids[higherIndex]]] as const) await pages[index].evaluate(target => {
        const scope = window as any;
        scope.meshProtectedPeers = [...scope.meshVoice.peers.values()].filter((peer: any) => peer.member.membershipId !== target).map((peer: any) => ({ id: peer.member.membershipId, pc: peer.pc }));
        scope.meshAddressedBefore = scope.meshVoice.peers.get(target).pc;
      }, target);
      await pages[higherIndex].evaluate(target => { const scope = window as any; const peer = scope.meshVoice.peers.get(target); peer.pc.close(); peer.retries = 3; peer.exhausted = true; scope.meshVoice.retryConnections(); }, ids[lowerIndex]);
      await expect.poll(async () => (await report()).every(client => client.links.length === members - 1 && client.links.every(link => link.state === 'connected' && link.received > 10 && link.energy > 0)), { timeout: 30000, intervals: [1000] }).toBe(true);
      const proof = await Promise.all([higherIndex, lowerIndex].map(index => pages[index].evaluate(() => { const scope = window as any; return { self: scope.meshVoice.descriptor.membershipId, healthyPreserved: scope.meshProtectedPeers.every((before: any) => scope.meshVoice.peers.get(before.id)?.pc === before.pc && before.pc.connectionState === 'connected'), addressedReplaced: ![...scope.meshVoice.peers.values()].some((peer: any) => peer.pc === scope.meshAddressedBefore), events: scope.meshEvents }; })));
      expect(proof.every(side => side.healthyPreserved && side.addressedReplaced)).toBe(true);
      expect(proof.some(side => side.events.some((event: any) => event.event === 'signal_ack' && event.kind === 'requestOffer'))).toBe(true);
      await writeFile(testInfo.outputPath('manual-retry-proof.json'), JSON.stringify(proof, null, 2));
    }
    // Drop only one voice signaling transport; established peer objects must survive resume.
    await pages[0].evaluate(() => { const scope = window as any; scope.meshBefore = scope.meshPcs.filter((pc: RTCPeerConnection) => pc.connectionState === 'connected'); scope.meshVoice.socket.io.engine.close(); });
    await expect.poll(() => pages[0].evaluate(() => { const scope = window as any; return scope.meshState.status === 'connected' && scope.meshBefore.every((pc: RTCPeerConnection) => pc.connectionState === 'connected' && scope.meshPcs.includes(pc)); }), { timeout: 15000 }).toBe(true);
    for (let cycle = 0; cycle < cycles; cycle++) {
      await pages[0].waitForTimeout(Number(process.env.MESH_CYCLE_GAP_MS ?? 2500));
      await pages[0].evaluate(async () => {
        const scope = window as any;
        scope.meshVoice.disconnect();
        if (scope.meshPcs.some((pc: RTCPeerConnection) => pc.connectionState !== 'closed')) throw new Error('Peer leaked after disconnect');
        if (scope.meshCapture.stream.getTracks().some((track: MediaStreamTrack) => track.readyState !== 'ended')) throw new Error('Capture leaked after disconnect');
        let timeout: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.race([scope.meshVoice.join(), new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Cycle join exceeded thirty seconds')), 30000); })]);
        } finally { clearTimeout(timeout); }
        await scope.meshVoice.setMuted(false);
      });
      await expect.poll(async () => (await report()).every(item => item.links.length === members - 1 && item.links.every(link => link.state === 'connected' && link.received > 10 && link.energy > 0)), { timeout: 30000 }).toBe(true);
      completedCycles = cycle + 1;
      await appendFile(testInfo.outputPath('cycles-progress.jsonl'), JSON.stringify({ completed: completedCycles, total: cycles, at: new Date().toISOString() }) + '\n');
      if ((cycle + 1) % 10 === 0) console.log(JSON.stringify({ event: 'mesh_cycles', completed: cycle + 1, total: cycles, at: new Date().toISOString() }));
    }
    if (process.env.MESH_SIMULATE_CLIENT_IPS === '1') for (const audit of headerAudit) { expect(audit.httpSeen).toBeGreaterThan(0); expect(audit.httpMatched).toBe(audit.httpSeen); expect(audit.websocketSeen).toBeGreaterThanOrEqual(2); expect(audit.websocketMatched).toBe(audit.websocketSeen); }
    const holdUntil = Date.now() + seconds * 1000;
    let previous = await report();
    let previousAt = Date.now();
    const expectedPeers = previous.map(client => client.links.map(link => link.peerId));
    const outages = new Map<string, { at: number; reason: string; pcId?: number }>();
    const outageHistory: { event: string; at: string; client: number; peerId: string; reason?: string; durationMs?: number; oldPcId?: number; newPcId?: number }[] = [];
    let maxOutageMs = 0;
    while (Date.now() < holdUntil) {
      const remaining = holdUntil - Date.now();
      if (remaining < 1000) { await pages[0].waitForTimeout(Math.max(0, remaining)); break; }
      await pages[0].waitForTimeout(Math.min(5000, remaining));
      const current = await report(); const observedAt = Date.now();
      await appendFile(testInfo.outputPath('rtp-progress.jsonl'), JSON.stringify({ at: new Date(observedAt).toISOString(), elapsedMs: observedAt - started, clients: current }) + '\n');
      let progressingLinks = 0;
      const roomProgress = Array.from({ length: rooms }, () => 0);
      const roomReplacements = Array.from({ length: rooms }, () => 0);
      try {
        for (let index = 0; index < current.length; index++) {
          expect(current[index].harnessError).toBeUndefined();
          expect(current[index].muted && current[index].captureEnabled).toBe(false);
          for (const peerId of expectedPeers[index]) {
            const key = `${index}:${peerId}`;
            const link = current[index].links.find(item => item.peerId === peerId);
            const before = previous[index].links.find(item => item.peerId === peerId);
            const changed = Boolean(link && before && link.pcId !== before.pcId);
            const stateFailure = before && current[index].stateEvents.find((event: { pcId: number; state: string; at: number }) => event.pcId === before.pcId && ['failed', 'disconnected', 'closed'].includes(event.state));
            const mediaProgress = Boolean(link && link.state === 'connected' && link.received > 10 && link.energy > 0 && (changed || (before && link.received > before.received && link.energy > before.energy)));
            if (mediaProgress) { progressingLinks++; roomProgress[Math.floor(index / members)]++; }
            if (changed) roomReplacements[Math.floor(index / members)]++;
            const healthy = mediaProgress && (!iceUrl || link!.relay);
            if ((!healthy || changed || stateFailure) && !outages.has(key)) {
              const reason = stateFailure?.state || (changed ? 'peer-replaced-between-samples' : !link ? 'missing' : link.state !== 'connected' ? link.state : !mediaProgress ? 'known-tone-rtp-stalled' : 'selected-relay-proof-unavailable');
              const at = stateFailure?.at || previousAt;
              outages.set(key, { at, reason, pcId: before?.pcId });
              const entry = { event: 'outage', at: new Date(at).toISOString(), client: index, peerId, reason, oldPcId: before?.pcId, newPcId: link?.pcId };
              outageHistory.push(entry); await appendFile(testInfo.outputPath('outages.jsonl'), JSON.stringify(entry) + '\n');
            }
            const outage = outages.get(key);
            if (outage) {
              const durationMs = observedAt - outage.at; maxOutageMs = Math.max(maxOutageMs, durationMs);
              if (healthy) {
                const entry = { event: 'recovered', at: new Date(observedAt).toISOString(), client: index, peerId, durationMs, oldPcId: outage.pcId, newPcId: link?.pcId };
                outageHistory.push(entry); await appendFile(testInfo.outputPath('outages.jsonl'), JSON.stringify(entry) + '\n'); outages.delete(key);
              } else if (durationMs > 40000) throw new Error(`Voice peer recovery exceeded forty seconds: ${outage.reason}`);
            }
          }
        }
        if (progressingLinks === 0 || roomProgress.some(count => count === 0)) throw new Error('All synthetic voice paths in a room stopped progressing');
        if (roomReplacements.some(count => count === members * (members - 1))) throw new Error('Every established voice peer in a room was replaced simultaneously');
      } catch (error) { await writeFile(testInfo.outputPath('failure-soak.json'), JSON.stringify({ at: new Date(observedAt).toISOString(), clients: await report(false, true), previous, outageHistory }, null, 2)); throw error; }
      previous = current; previousAt = observedAt;
    }
    if (outages.size) throw new Error('Voice paths were still recovering when the soak finished');
    const final = await report(true);
    expect(final.every(item => !item.harnessError && item.links.every(link => link.state === 'connected' && link.received > 10))).toBe(true);
    if (process.env.MESH_SIMULATE_CLIENT_IPS === '1') for (const audit of headerAudit) { expect(audit.httpSeen).toBeGreaterThan(0); expect(audit.httpMatched).toBe(audit.httpSeen); expect(audit.websocketSeen).toBeGreaterThanOrEqual(2); expect(audit.websocketMatched).toBe(audit.websocketSeen); }
    const metricsPath = testInfo.outputPath('mesh-metrics.json');
    await writeFile(metricsPath, JSON.stringify({ rooms, members, seconds, cycles, completedCycles, forcedRelay: Boolean(iceUrl), elapsedMs: Date.now() - started, browser: browser.version(), headerAudit, outageHistory, maxOutageMs, clients: final }, null, 2));
    await testInfo.attach('mesh-metrics.json', { path: metricsPath, contentType: 'application/json' });
  } finally {
    await writeFile(testInfo.outputPath('run-progress.json'), JSON.stringify({ completedCycles, requestedCycles: cycles, elapsedMs: Date.now() - started, at: new Date().toISOString() }));
    for (const page of pages) await page.evaluate(() => { const scope = window as any; scope.meshStopTokenWatch?.(); scope.meshVoice?.disconnect(); scope.meshRoomConnection?.close(); scope.meshCapture?.source.stop(); void scope.meshAudio?.close(); }).catch(() => {});
    await Promise.all(contexts.map(context => context.close()));
  }
});

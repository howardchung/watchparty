import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { io, type Socket } from "socket.io-client";
import { config } from "../config.ts";
import { start } from "../main.ts";

const enabled = process.env.WATCHPARTY_INTEGRATION === "true";
const profile = { name: "Voice tester", avatar: "comet", language: "en" };
const waitEvent = <T>(socket: Socket, name: string) => new Promise<T>((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${name}`)), 5000);
  socket.once(name, (value) => { clearTimeout(timeout); resolve(value as T); });
});
const rpc = (socket: Socket, name: string, body: unknown) => new Promise<any>((resolve) => {
  if (name === "signal" && typeof (body as any)?.msg === "string") {
    try { const message = JSON.parse((body as any).msg); body = { ...(body as any), msg: JSON.stringify({ negotiationId: randomUUID(), ...message }) }; } catch {}
  }
  socket.emit(name, body, (result: unknown) => resolve(result));
});

test("voice configuration, ticket lifecycle, independent role, mute and scoped signaling", {
  skip: !enabled,
  timeout: 45000,
}, async () => {
  const baseConfig = config();
  const configuration = {
    ...baseConfig,
    port: 0,
    turnUrls: ["turn:127.0.0.1:3478?transport=udp", "turn:127.0.0.1:3478?transport=tcp"],
    turnSecret: "local-test-turn-shared-secret-32-bytes-minimum",
  };
  let running = await start(configuration);
  const base = `http://127.0.0.1:${(running.server!.address() as { port: number }).port}`;
  const sockets: Socket[] = [];
  const users: { token: string; uid: string }[] = [];
  try {
    const createUser = async () => {
      const data = await running.auth!.create(profile);
      const user = { token: data.accessToken, uid: data.identity.id };
      users.push(user);
      return user;
    };
    const request = async (user: (typeof users)[number], path: string, body: unknown = {}) => fetch(base + path, {
      method: "POST", headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const owner = await createUser();
    const created = await request(owner, "/v1/rooms", { title: "voice room" });
    assert.equal(created.status, 201);
    const room = (await created.json() as any).room;
    const guest = await createUser();
    assert.equal((await request(guest, `/v1/rooms/${room.code}/join`)).status, 200);
    const roomTicketResponse = await request(owner, `/v1/rooms/${room.id}/realtime-ticket`);
    const roomTicket = await roomTicketResponse.json() as any;
    const roomSocket = io(base + roomTicket.namespace, {
      transports: ["websocket"], reconnection: false, forceNew: true,
      auth: { ticket: roomTicket.ticket, protocolVersion: 3 },
    });
    sockets.push(roomSocket);
    await waitEvent(roomSocket, "snapshot");
    const nonmember = await createUser();
    const unavailable = await request(nonmember, `/v1/rooms/${room.id}/voice/config`);
    assert.equal(unavailable.status, 403);

    const ownerConfigResponse = await request(owner, `/v1/rooms/${room.id}/voice/config`);
    assert.equal(ownerConfigResponse.status, 200);
    const ownerConfig = await ownerConfigResponse.json() as any;
    assert.equal(ownerConfig.mode, "MESH");
    assert.equal(ownerConfig.namespace, `/watchparty/voice/${room.id}`);
    assert.ok(ownerConfig.iceExpiresAt);
    const turn = ownerConfig.iceServers.at(-1);
    const expires = Number(turn.username.split(":")[0]);
    assert.ok(expires >= Math.floor(Date.now() / 1000) + 599 && expires <= Math.floor(Date.now() / 1000) + 600);
    assert.equal(turn.credential, createHmac("sha1", configuration.turnSecret).update(turn.username).digest("base64"));
    const guestConfigResponse = await request(guest, `/v1/rooms/${room.id}/voice/config`);
    const guestConfig = await guestConfigResponse.json() as any;
    const rosterEvents = new Map<Socket, any[]>();
    const connect = async (user: (typeof users)[number], configValue: any) => {
      const socket = io(base + configValue.namespace, {
        transports: ["websocket"], reconnection: false, forceNew: true,
        auth: { ticket: configValue.ticket, protocolVersion: 4 },
      });
      sockets.push(socket);
      const seen: any[] = [];
      rosterEvents.set(socket, seen);
      socket.on("voice.roster", (value) => seen.push(value));
      await waitEvent(socket, "voice.roster");
      return socket;
    };
    const ownerSocket = await connect(owner, ownerConfig);
    const sameSessionResponse = await request(owner, `/v1/rooms/${room.id}/voice/config`, { voiceSessionId: ownerConfig.voiceSessionId });
    const sameSession = await sameSessionResponse.json() as any;
    assert.equal(sameSession.voiceSessionId, ownerConfig.voiceSessionId);
    assert.notEqual(sameSession.ticket, ownerConfig.ticket);
    const guestSocket = await connect(guest, guestConfig);
    // One initial roster per joining socket; the existing owner gets one update.
    assert.equal(rosterEvents.get(ownerSocket)?.length, 2);
    assert.equal(rosterEvents.get(guestSocket)?.length, 1);
    const roster = rosterEvents.get(ownerSocket)?.at(-1);
    assert.deepEqual(new Set(roster.members.map((member: any) => member.membershipId)), new Set([ownerConfig.membershipId, guestConfig.membershipId]));
    assert.ok(roster.members.every((member: any) => member.muted));
    const unmutedRosterEvent = waitEvent<any>(guestSocket, "voice.roster");
    assert.deepEqual(await rpc(ownerSocket, "voice.mute", { muted: false }), { ok: true });
    const unmutedRoster = await unmutedRosterEvent;
    assert.equal(unmutedRoster.members.find((member: any) => member.membershipId === ownerConfig.membershipId).muted, false);

    const ownerIsOfferer = ownerConfig.membershipId < guestConfig.membershipId;
    const offererSocket = ownerIsOfferer ? ownerSocket : guestSocket;
    const answererSocket = ownerIsOfferer ? guestSocket : ownerSocket;
    const offererConfig = ownerIsOfferer ? ownerConfig : guestConfig;
    const answererConfig = ownerIsOfferer ? guestConfig : ownerConfig;
    // Both clients may exhaust an initial negotiation before the answerer ever
    // learns the offerer epoch. Its explicit retry requests an offer, never SDP.
    const offerRequest = { negotiationId: randomUUID(), generation: answererConfig.voiceSessionId,
      targetGeneration: offererConfig.voiceSessionId, peerGeneration: 1, targetPeerGeneration: 0, requestOffer: true };
    const requested = waitEvent<any>(offererSocket, "signal");
    assert.deepEqual(await rpc(answererSocket, "signal", { to: offererConfig.membershipId, msg: JSON.stringify(offerRequest) }), { ok: true });
    assert.equal(JSON.parse((await requested).msg).requestOffer, true);
    let requestReplays = 0;
    const countOfferRequest = () => { requestReplays++; };
    offererSocket.on("signal", countOfferRequest);
    assert.deepEqual(await rpc(answererSocket, "signal", { to: offererConfig.membershipId, msg: JSON.stringify(offerRequest) }), { ok: true });
    assert.equal(requestReplays, 0);
    offererSocket.off("signal", countOfferRequest);
    assert.equal((await rpc(answererSocket, "signal", { to: offererConfig.membershipId, msg: JSON.stringify({ ...offerRequest, negotiationId: randomUUID() }) })).code, "STALE_NEGOTIATION");
    assert.equal((await rpc(offererSocket, "signal", { to: answererConfig.membershipId, msg: JSON.stringify({ ...offerRequest, generation: offererConfig.voiceSessionId, targetGeneration: answererConfig.voiceSessionId }) })).code, "STALE_NEGOTIATION");
    const signal = {
      generation: offererConfig.voiceSessionId,
      targetGeneration: answererConfig.voiceSessionId,
      peerGeneration: 1,
      targetPeerGeneration: 0,
      sdp: { type: "offer", sdp: "v=0\r\no=- 1 1 IN IP4 0.0.0.0\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n" },
    };
    const inbound = waitEvent<any>(answererSocket, "signal");
    assert.deepEqual(await rpc(offererSocket, "signal", { to: answererConfig.membershipId, msg: JSON.stringify(signal) }), { ok: true });
    const received = await inbound;
    assert.equal(received.from, offererConfig.membershipId);
    const receivedMessage = JSON.parse(received.msg);
    assert.equal(typeof receivedMessage.negotiationId, "string");
    delete receivedMessage.negotiationId;
    assert.deepEqual(receivedMessage, signal);
    // Lost ACK replay is successful but forwards exactly once; ID reuse with
    // different content never changes the pair epoch.
    const duplicate = { ...signal, negotiationId: JSON.parse(received.msg).negotiationId };
    let forwarded = 0;
    const countSignal = () => { forwarded++; };
    answererSocket.on("signal", countSignal);
    assert.deepEqual(await rpc(offererSocket, "signal", { to: answererConfig.membershipId, msg: received.msg }), { ok: true });
    assert.equal((await rpc(offererSocket, "signal", { to: answererConfig.membershipId, msg: JSON.stringify({ ...duplicate, peerGeneration: 3 }) })).code, "STALE_NEGOTIATION");
    assert.equal(forwarded, 0);
    answererSocket.off("signal", countSignal);
    const videoSdp = { ...signal, sdp: { type: "offer", sdp: "v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\n" } };
    assert.equal((await rpc(offererSocket, "signal", { to: answererConfig.membershipId, msg: JSON.stringify(videoSdp) })).code, "INVALID_JSON");
    const dataChannelSdp = { ...signal, sdp: { type: "offer", sdp: "v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\n" } };
    assert.equal((await rpc(offererSocket, "signal", { to: answererConfig.membershipId, msg: JSON.stringify(dataChannelSdp) })).code, "INVALID_JSON");
    const rollback = { ...signal, sdp: { type: "rollback", sdp: "v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n" } };
    assert.equal((await rpc(offererSocket, "signal", { to: answererConfig.membershipId, msg: JSON.stringify(rollback) })).code, "INVALID_JSON");
    assert.equal((await rpc(offererSocket, "signal", { to: answererConfig.membershipId, msg: JSON.stringify({ ...signal, peerGeneration: 1.5 }) })).code, "INVALID_JSON");
    assert.equal((await rpc(offererSocket, "signal", { to: answererConfig.membershipId, msg: JSON.stringify({ ...signal, peerGeneration: 1 }) })).code, "STALE_NEGOTIATION");
    const answer = { generation: answererConfig.voiceSessionId, targetGeneration: offererConfig.voiceSessionId, peerGeneration: 1, targetPeerGeneration: 1,
      sdp: { type: "answer", sdp: "v=0\r\no=- 2 2 IN IP4 0.0.0.0\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n" } };
    assert.deepEqual(await rpc(answererSocket, "signal", { to: offererConfig.membershipId, msg: JSON.stringify(answer) }), { ok: true });
    const restart = { generation: offererConfig.voiceSessionId, targetGeneration: answererConfig.voiceSessionId,
      peerGeneration: 1, targetPeerGeneration: 1, restart: true };
    assert.deepEqual(await rpc(offererSocket, "signal", { to: answererConfig.membershipId, msg: JSON.stringify(restart) }), { ok: true });
    const replacementOffer = { ...signal, peerGeneration: 2 };
    assert.deepEqual(await rpc(offererSocket, "signal", { to: answererConfig.membershipId, msg: JSON.stringify(replacementOffer) }), { ok: true });
    const staleIce = { generation: offererConfig.voiceSessionId, targetGeneration: answererConfig.voiceSessionId, peerGeneration: 1, targetPeerGeneration: 2,
      ice: { candidate: "candidate:1 1 UDP 1 127.0.0.1 9 typ host", sdpMid: "0", sdpMLineIndex: 0 } };
    assert.equal((await rpc(offererSocket, "signal", { to: answererConfig.membershipId, msg: JSON.stringify(staleIce) })).code, "STALE_NEGOTIATION");
    const replacementAnswer = { ...answer, peerGeneration: 2, targetPeerGeneration: 2 };
    assert.deepEqual(await rpc(answererSocket, "signal", { to: offererConfig.membershipId, msg: JSON.stringify(replacementAnswer) }), { ok: true });
    const freshOfferRequest = { ...offerRequest, negotiationId: randomUUID(), peerGeneration: 3, targetPeerGeneration: 2 };
    assert.deepEqual(await rpc(answererSocket, "signal", { to: offererConfig.membershipId, msg: JSON.stringify(freshOfferRequest) }), { ok: true });
    const retiredAnswererIce = { generation: answererConfig.voiceSessionId, targetGeneration: offererConfig.voiceSessionId,
      peerGeneration: 2, targetPeerGeneration: 0, ice: staleIce.ice };
    assert.equal((await rpc(answererSocket, "signal", { to: offererConfig.membershipId, msg: JSON.stringify(retiredAnswererIce) })).code, "STALE_NEGOTIATION");
    assert.equal((await rpc(answererSocket, "signal", { to: offererConfig.membershipId, msg: JSON.stringify({ ...offerRequest, negotiationId: randomUUID() }) })).code, "STALE_NEGOTIATION");
    assert.equal((await rpc(answererSocket, "signal", { to: offererConfig.membershipId, msg: JSON.stringify({ ...freshOfferRequest, negotiationId: randomUUID(), peerGeneration: 4, targetPeerGeneration: 1 }) })).code, "STALE_NEGOTIATION");
    assert.equal((await rpc(offererSocket, "signal", { to: answererConfig.membershipId, msg: JSON.stringify(restart) })).code, "STALE_NEGOTIATION");
    assert.equal((await rpc(answererSocket, "signal", { to: offererConfig.membershipId, msg: JSON.stringify({ ...signal, generation: answererConfig.voiceSessionId, targetGeneration: offererConfig.voiceSessionId }) })).code, "STALE_NEGOTIATION");
    assert.equal((await rpc(offererSocket, "signal", { to: answererConfig.membershipId, msg: JSON.stringify({ ...signal, targetGeneration: "00000000-0000-4000-8000-000000000000" }) })).code, "FORBIDDEN");
    assert.equal((await rpc(offererSocket, "signal", { to: answererConfig.membershipId, msg: "x".repeat(65537) })).code, "PAYLOAD_TOO_LARGE");
    assert.equal((await rpc(offererSocket, "signal", { to: offererConfig.membershipId, msg: JSON.stringify(signal) })).code, "FORBIDDEN");

    // Credential renewal leaves an unused resume ticket valid.
    const refreshResponse = await request(owner, `/v1/rooms/${room.id}/voice/config`, { operation: "refresh", voiceSessionId: ownerConfig.voiceSessionId });
    const refreshed = await refreshResponse.json() as any;
    assert.equal(refreshed.ticket, undefined);
    assert.equal(refreshed.voiceSessionId, ownerConfig.voiceSessionId);
    const oldLease = (await running.db.query("SELECT generation FROM role_leases WHERE membership_id=$1 AND role='voice'", [ownerConfig.membershipId])).rows[0].generation;
    const resumedSocket = await connect(owner, sameSession);
    assert.equal(ownerSocket.connected, false);
    const newLease = (await running.db.query("SELECT generation FROM role_leases WHERE membership_id=$1 AND role='voice'", [ownerConfig.membershipId])).rows[0].generation;
    assert.notEqual(oldLease, newLease);
    await running.rooms!.detach(owner.uid, room.id, ownerConfig.membershipId, "voice", oldLease);
    assert.deepEqual(await rpc(resumedSocket, "voice.mute", { muted: true }), { ok: true });
    const disconnectedRoster = waitEvent<any>(guestSocket, "voice.roster");
    resumedSocket.disconnect();
    const graceRoster = await disconnectedRoster;
    assert.equal(graceRoster.members.find((m: any) => m.membershipId === ownerConfig.membershipId).signalingConnected, false);
    const resumeResponse = await request(owner, `/v1/rooms/${room.id}/voice/config`, { operation: "resume", voiceSessionId: ownerConfig.voiceSessionId });
    assert.equal(resumeResponse.status, 200);
    const afterLoss = await resumeResponse.json() as any;
    assert.equal(afterLoss.voiceSessionId, ownerConfig.voiceSessionId);
    const afterLossSocket = await connect(owner, afterLoss);
    assert.deepEqual(await rpc(afterLossSocket, "voice.mute", { muted: false }), { ok: true });
    const expired = await request(owner, `/v1/rooms/${room.id}/voice/config`, { operation: "resume", voiceSessionId: randomUUID() });
    assert.equal(expired.status, 409);
    assert.equal((await expired.json() as any).code, "VOICE_SESSION_EXPIRED");
    // An authorization already in flight on the retired socket cannot publish
    // mute or overwrite session state after replacement.
    const originalVerify = running.auth!.verify.bind(running.auth);
    let releaseVerify!: () => void;
    let enteredVerify!: () => void;
    const entered = new Promise<void>(resolve => { enteredVerify = resolve; });
    const blocked = new Promise<void>(resolve => { releaseVerify = resolve; });
    let holdNext = true;
    running.auth!.verify = async token => {
      if (holdNext) { holdNext = false; enteredVerify(); await blocked; }
      return originalVerify(token);
    };
    const retiredConnection = running.voice!.connections.get(ownerConfig.membershipId)!;
    let delayedAck: any;
    const delayedRefresh = (running.voice as any).refresh(retiredConnection, { accessToken: owner.token }, (ack: any) => { delayedAck = ack; });
    await entered;
    const racingResume = await request(owner, `/v1/rooms/${room.id}/voice/config`, { operation: "resume", voiceSessionId: ownerConfig.voiceSessionId });
    const racingSocket = await connect(owner, await racingResume.json());
    releaseVerify();
    await delayedRefresh;
    assert.equal(delayedAck.code, "VOICE_SESSION_EXPIRED");
    let staleLeaveAck: any;
    await (running.voice as any).leave(retiredConnection, (ack: any) => { staleLeaveAck = ack; });
    assert.equal(staleLeaveAck.code, "VOICE_SESSION_EXPIRED");
    assert.deepEqual(await rpc(racingSocket, "voice.mute", { muted: true }), { ok: true });
    running.auth!.verify = originalVerify;


    // Replacing just the voice generation disconnects its old socket and preserves the room lease.
    const replacementResponse = await request(owner, `/v1/rooms/${room.id}/voice/config`);
    const replacement = await replacementResponse.json() as any;
    assert.notEqual(replacement.voiceSessionId, ownerConfig.voiceSessionId);
    const roomGenerationBefore = (await running.db.query("SELECT generation FROM role_leases WHERE membership_id=$1 AND role='room'", [ownerConfig.membershipId])).rows[0].generation;
    const replacementSocket = await connect(owner, replacement);
    assert.equal(ownerSocket.connected, false);
    const roles = await running.db.query("SELECT role,generation FROM role_leases WHERE membership_id=$1 ORDER BY role", [ownerConfig.membershipId]);
    assert.deepEqual(roles.rows.map((row) => row.role), ["room", "voice"]);
    assert.equal(roles.rows.find((row) => row.role === "room").generation, roomGenerationBefore);
    assert.ok((await rpc(replacementSocket, "auth.refresh", { accessToken: owner.token })).expiresAt);

    const emptyVoiceSession = await request(nonmember, `/v1/rooms/${room.id}/voice/config`, { voiceSessionId: guestConfig.voiceSessionId });
    assert.equal(emptyVoiceSession.status, 403);
    // A valid session in another room is never an authorized relay target.
    const isolatedRoom = (await (await request(nonmember, "/v1/rooms", { title: "isolated voice" })).json() as any).room;
    const isolatedConfig = await (await request(nonmember, `/v1/rooms/${isolatedRoom.id}/voice/config`)).json() as any;
    await connect(nonmember, isolatedConfig);
    assert.equal((await rpc(replacementSocket, "signal", { to: isolatedConfig.membershipId, msg: JSON.stringify({ ...signal, generation: replacement.voiceSessionId, targetGeneration: isolatedConfig.voiceSessionId }) })).code, "FORBIDDEN");
    assert.ok(running.voice!.metrics.resumes >= 3);
    assert.equal(running.voice!.metrics.signalReplayed, 2);
    const leaveRosterEvent = waitEvent<any>(guestSocket, "voice.roster");
    assert.deepEqual(await rpc(replacementSocket, "voice.leave", {}), { ok: true });
    const leaveRoster = await leaveRosterEvent;
    assert.equal(leaveRoster.members.some((m: any) => m.membershipId === replacement.membershipId), false);
    assert.deepEqual(await rpc(guestSocket, "voice.mute", { muted: true }), { ok: true });
    const leaveResume = await request(owner, `/v1/rooms/${room.id}/voice/config`, { operation: "resume", voiceSessionId: replacement.voiceSessionId });
    assert.equal(leaveResume.status, 409);
    // Process restart explicitly expires the in-memory voice generation. The
    // client must obtain a fresh join rather than retry stale resume forever.
    await running.stop();
    running = await start(configuration);
    const restartBase = `http://127.0.0.1:${(running.server!.address() as { port: number }).port}`;
    const restartRequest = (body: unknown) => fetch(`${restartBase}/v1/rooms/${room.id}/voice/config`, { method: "POST", headers: { Authorization: `Bearer ${owner.token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const staleResume = await restartRequest({ operation: "resume", voiceSessionId: replacement.voiceSessionId });
    assert.equal(staleResume.status, 409);
    assert.equal((await staleResume.json() as any).code, "VOICE_SESSION_EXPIRED");
    const freshJoin = await restartRequest({ operation: "join" });
    assert.equal(freshJoin.status, 200);
    assert.notEqual((await freshJoin.json() as any).voiceSessionId, replacement.voiceSessionId);

  } finally {
    sockets.forEach((socket) => socket.disconnect());
    await running.stop();
  }
});

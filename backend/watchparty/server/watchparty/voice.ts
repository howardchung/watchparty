import { logHandledException } from './diagnostics.ts';
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import type { Server, Socket } from "socket.io";
import type { AuthProvider, Session } from "./auth.ts";
import type { Config } from "./config.ts";
import { ApiError } from "./errors.ts";
import { SocketCloseDiagnostics } from "./socketDiagnostics.ts";
import type { Rooms } from "./rooms.ts";

interface Ticket {
  uid: string;
  session: Session;
  membershipId: string;
  roomId: string;
  generation: string;
  expires: number;
  lease: string;
}
interface VoiceConnection extends Ticket {
  socket: Socket;
  muted: boolean;
  tokens: number;
  tokenAt: number;
  verifiedAt: number;
  disconnectedUntil?: number;
  accepted: Map<string, string>;
}
interface IceServer {
  urls: string[];
  username?: string;
  credential?: string;
}

interface PeerPairEpoch {
  lowerMembershipId: string;
  lowerVoiceGeneration: string;
  higherMembershipId: string;
  higherVoiceGeneration: string;
  lowerPeerGeneration?: number;
  higherPeerGeneration?: number;
  higherOfferRequestGeneration?: number;
}

const jsonError = (error: unknown) => error instanceof ApiError
  ? { code: error.code, message: error.message }
  : { code: "INTERNAL_ERROR", message: "Internal server error" };

/** Mesh signaling and voice role leases. This deliberately owns no media. */
export class MeshVoice {
  readonly available: boolean;
  readonly socketDiagnostics = new SocketCloseDiagnostics();
  // Low-cardinality process counters; never include credentials, SDP or audio.
  readonly metrics = { joinDurationMs: 0, joins: 0, resumes: 0, credentialRefreshes: 0, signalAccepted: 0,
    signalReplayed: 0, acknowledgementsRejected: 0, negotiationFailures: 0, disconnects: 0, cleanedSessions: 0 };
  readonly tickets = new Map<string, Ticket>();
  readonly connections = new Map<string, VoiceConnection>();
  private readonly generations = new Map<string, string>();
  private readonly muted = new Map<string, boolean>();
  private readonly peerEpochs = new Map<string, PeerPairEpoch>();
  private closing = false;
  private locks = new Map<string, Promise<unknown>>();
  private admissionLeases = new Map<string, string>();
  private resumeUntil = new Map<string, number>();

  private async serialized<T>(key: string, action: () => Promise<T>): Promise<T> {
    const prior = this.locks.get(key) ?? Promise.resolve();
    const next = prior.catch((handledError) => {
      logHandledException("voice.serialized.next.1", handledError); }).then(action);
    this.locks.set(key, next);
    try { return await next; } finally { if (this.locks.get(key) === next) this.locks.delete(key); }
  }

  private assertAuthority(connection: VoiceConnection) {
    if (this.closing || !connection.socket.connected || this.connections.get(connection.membershipId) !== connection ||
        this.generations.get(connection.membershipId) !== connection.generation)
      throw new ApiError(401, "VOICE_SESSION_EXPIRED");
  }
  private pendingDetaches = new Set<Promise<unknown>>();
  private timer: ReturnType<typeof setInterval> | undefined;
  private metricsTimer: ReturnType<typeof setInterval> | undefined;
  private readonly metricsStartedAt = Date.now();

  /** Process aggregates only: safe for the ordinary structured service log. */
  private reportMetrics() {
    console.log(JSON.stringify({
      event: "voice_metrics",
      scope: "process_cumulative",
      elapsedMs: Date.now() - this.metricsStartedAt,
      ...this.metrics,
      activeSockets: [...this.connections.values()].filter(c => c.socket.connected).length,
      retainedSessions: this.connections.size,
      pendingTickets: this.tickets.size,
      pendingDetaches: this.pendingDetaches.size,
      peerPairs: this.peerEpochs.size,
    }));
  }
  private readonly io: Server;
  private readonly voicePrefix: string;
  private readonly rooms: Rooms;
  private readonly auth: AuthProvider;
  private readonly configuration: Config;
  private authFlights = new Map<VoiceConnection, Promise<void>>();

  constructor(
    io: Server,
    rooms: Rooms,
    auth: AuthProvider,
    configuration: Config,
  ) {
    this.io = io;
    this.voicePrefix = `/${configuration.namespacePrefix ?? "watchparty"}/voice/`;
    this.rooms = rooms;
    this.auth = auth;
    this.configuration = configuration;
    this.available = configuration.turnUrls.some((url) => /^turns?:/i.test(url)) &&
      !!configuration.turnSecret && Buffer.byteLength(configuration.turnSecret) >= 32;
    const beforeRemoved = rooms.onMembershipRemoved;
    rooms.onMembershipRemoved = (id) => {
      beforeRemoved?.(id);
      this.removeMembership(id);
    };
    const beforeClosed = rooms.onRoomClosed;
    rooms.onRoomClosed = (id) => {
      beforeClosed?.(id);
      this.removeRoom(id);
    };
    if (this.available) {
      const namespace = io.of(new RegExp(`^${this.voicePrefix}[0-9a-f-]{36}$`, "i"));
      namespace.use((socket, next) => void this.admit(socket, next));
      namespace.on("connection", (socket) => void this.connect(socket));
      this.timer = setInterval(() => void this.maintain().catch((handledError) => {
        logHandledException("voice.handler.2", handledError);
        console.error(JSON.stringify({ event: "voice_maintenance_failed" }));
      }), 10000);
      this.timer.unref();
      this.metricsTimer = setInterval(() => this.reportMetrics(), 60000);
      this.metricsTimer.unref();
    }
  }

  async issue(uid: string, session: Session, roomId: string, requested?: string, operation: "join" | "resume" | "refresh" = requested ? "resume" : "join") {
    if (this.closing || !this.available || !this.configuration.turnSecret)
      throw new ApiError(503, "VOICE_DISABLED");
    const turnSecret = this.configuration.turnSecret;
    const member = await this.rooms.ticketMembership(uid, roomId);
    const key = member.id;
    return this.serialized(`member:${key}`, async () => {
      if (this.closing) throw new ApiError(503, "VOICE_DISABLED");
      let generation = this.generations.get(key);
      if (operation !== "join") {
        const active = this.connections.get(key);
        if (!requested || !generation || generation !== requested ||
            !(active?.socket.connected || (this.resumeUntil.get(key) ?? 0) > Date.now()))
          throw new ApiError(409, "VOICE_SESSION_EXPIRED");
      } else {
        generation = randomUUID();
        this.generations.set(key, generation);
        this.resumeUntil.set(key, Date.now() + 30000);
        this.muted.set(key, true);
        this.clearPeerEpochsForMembership(key);
        const old = this.connections.get(key);
        this.connections.delete(key);
        if (old) {
          old.socket.disconnect(true);
          await this.rooms.detach(old.uid, old.roomId, key, "voice", old.lease);
        }
      }
      const ticket = randomBytes(32).toString("base64url");
      const expires = Date.now() + 30000;
      // Refresh never creates or invalidates admission tickets.
      if (operation !== "refresh") {
      // A membership can hold only its newest, short-lived credential.
      for (const [secret, existing] of this.tickets)
        if (existing.membershipId === key) this.tickets.delete(secret);
      if (this.tickets.size >= 10000) throw new ApiError(429, "RATE_LIMITED");
      const lease = randomUUID();
      this.admissionLeases.set(key, lease);
      this.tickets.set(ticket, {
        uid, session, membershipId: key, roomId, generation: generation!, expires, lease,
      });
      }
      if (operation === "join") this.metrics.joins++;
      else if (operation === "resume") this.metrics.resumes++;
      else this.metrics.credentialRefreshes++;
      const iceExpires = Math.floor(Date.now() / 1000) + 600;
      const username = `${iceExpires}:${createHmac("sha256", turnSecret)
        .update(`${key}:${generation}`).digest("hex").slice(0, 24)}`;
      const credential = createHmac("sha1", turnSecret)
        .update(username).digest("base64");
      const iceServers: IceServer[] = [{ urls: this.configuration.turnUrls.filter((url) => /^stun:/i.test(url)) }];
      if (!iceServers[0].urls.length) iceServers.pop();
      iceServers.push({ urls: this.configuration.turnUrls.filter((url) => /^turns?:/i.test(url)), username, credential });
      return {
        mode: "MESH",
        roomId,
        membershipId: key,
        voiceSessionId: generation,
        namespace: `${this.voicePrefix}${roomId}`,
        ...(operation === "refresh" ? {} : { ticket }),
        protocolVersion: 4,
        iceServers,
        iceExpiresAt: new Date(iceExpires * 1000).toISOString(),
      };
    });
  }

  private async admit(socket: Socket, next: (error?: Error) => void) {
    try {
      const packet = socket.handshake.auth;
      if (packet?.protocolVersion !== 4 || typeof packet.ticket !== "string")
        throw new ApiError(401, "INVALID_TICKET");
      const ticket = this.tickets.get(packet.ticket);
      this.tickets.delete(packet.ticket);
      const roomId = socket.nsp.name.slice(this.voicePrefix.length);
      if (!ticket || ticket.expires <= Date.now() || ticket.roomId !== roomId)
        throw new ApiError(401, "INVALID_TICKET");
      const session = await this.auth.verify(ticket.session.token);
      if (ticket.expires <= Date.now() || this.closing || session.uid !== ticket.uid || this.generations.get(ticket.membershipId) !== ticket.generation || this.admissionLeases.get(ticket.membershipId) !== ticket.lease)
        throw new ApiError(401, "INVALID_TICKET");
      socket.data.voiceTicket = { ...ticket, session } satisfies Ticket;
      next();
    } catch (error) {
      logHandledException("voice.admit.3", error);
      const data = jsonError(error);
      const rejected = new Error(data.code) as Error & { data?: unknown };
      rejected.data = data;
      next(rejected);
    }
  }

  private async connect(socket: Socket) {
    if (this.closing) return socket.disconnect(true);
    const ticket = socket.data.voiceTicket as Ticket;
    const key = ticket.membershipId;
    return this.serialized(`member:${key}`, async () => {
      const previous = this.connections.get(key);
      const connection: VoiceConnection = {
        ...ticket,
        socket,
        muted: this.muted.get(key) ?? true,
        tokens: previous?.tokens ?? 60,
        tokenAt: previous?.tokenAt ?? Date.now(),
        verifiedAt: Date.now(),
        accepted: new Map(this.connections.get(key)?.accepted),
      };
      try {
        if (this.closing || ticket.expires <= Date.now() || this.generations.get(key) !== ticket.generation || this.admissionLeases.get(key) !== ticket.lease || !socket.connected ||
            !this.connections.get(key)?.socket.connected && (this.resumeUntil.get(key) ?? 0) <= Date.now()) throw new ApiError(401, "VOICE_SESSION_EXPIRED");
        await this.rooms.attach(ticket.uid, ticket.roomId, key, "voice", ticket.lease);
        if (this.closing || this.generations.get(key) !== ticket.generation || !socket.connected)
          throw new ApiError(401, "SESSION_EXPIRED");
        this.connections.set(key, connection);
        this.resumeUntil.delete(key);
        this.metrics.joinDurationMs += Date.now() - (ticket.expires - 30000);
        const prior = socket.nsp.sockets;
        for (const peer of prior.values()) {
          const other = peer.data.voiceConnection as VoiceConnection | undefined;
          if (other?.membershipId === key && other !== connection) peer.disconnect(true);
        }
        socket.data.voiceConnection = connection;
        socket.on("disconnect", reason => {
          this.socketDiagnostics.record("namespace", "voice", reason);
          this.authFlights.delete(connection);
          if (this.connections.get(key) !== connection) return;
          this.metrics.disconnects++;
          connection.disconnectedUntil = Date.now() + 30000;
          this.resumeUntil.set(key, connection.disconnectedUntil);
          this.detach(ticket.uid, ticket.roomId, key, ticket.lease);
          this.broadcastRoster(ticket.roomId);
        });
        socket.on("voice.leave", (_body: unknown, ack?: (value: unknown) => void) =>
          void this.leave(connection, ack));
        socket.on("voice.mute", (body: unknown, ack?: (value: unknown) => void) =>
          void this.mute(connection, body, ack));
        socket.on("auth.refresh", (body: unknown, ack?: (value: unknown) => void) =>
          void this.refresh(connection, body, ack));
        socket.on("signal", (body: unknown, ack?: (value: unknown) => void) =>
          void this.signal(connection, body, ack));
        // Existing peers get one update; the newcomer gets one initial snapshot.
        socket.broadcast.emit("voice.roster", this.roster(ticket.roomId));
        socket.emit("voice.roster", this.roster(ticket.roomId));
      } catch (error) {
        logHandledException("voice.connect.4", error);
        await this.rooms.detach(ticket.uid, ticket.roomId, key, "voice", ticket.lease).catch((handledError) => {
          logHandledException("voice.connect.5", handledError); });
        socket.emit("error", jsonError(error));
        socket.disconnect(true);
      }
    });
  }

  private roster(roomId: string) {
    return { members: [...this.connections.values()]
      .filter((peer) => peer.roomId === roomId && (peer.socket.connected || (peer.disconnectedUntil ?? 0) > Date.now()))
      .map((peer) => ({ membershipId: peer.membershipId, voiceSessionId: peer.generation, muted: peer.muted, signalingConnected: peer.socket.connected })) };
  }
  private broadcastRoster(roomId: string) {
    this.io.of(`${this.voicePrefix}${roomId}`).emit("voice.roster", this.roster(roomId));
  }

  private async leave(connection: VoiceConnection, ack?: (value: unknown) => void) {
    return this.serialized(`member:${connection.membershipId}`, async () => {
      try {
        await this.authorize(connection);
        // Keep the transport open until the client receives its ACK and closes;
        // removing authority first prevents late callbacks from restoring grace.
        this.removeMembership(connection.membershipId, false);
        this.detach(connection.uid, connection.roomId, connection.membershipId, connection.lease);
        ack?.({ ok: true });
      } catch (error) {
        logHandledException("voice.leave.6", error);
        this.metrics.acknowledgementsRejected++;
        ack?.(jsonError(error));
      }
    });
  }

  private async mute(connection: VoiceConnection, body: unknown, ack?: (value: unknown) => void) {
    try {
      await this.authorize(connection);
      if (!body || typeof body !== "object" || typeof (body as any).muted !== "boolean")
        throw new ApiError(400, "INVALID_JSON");
      connection.muted = (body as any).muted;
      this.muted.set(connection.membershipId, connection.muted);
      this.broadcastRoster(connection.roomId);
      ack?.({ ok: true });
    } catch (error) {
      logHandledException("voice.mute.7", error);
      this.metrics.acknowledgementsRejected++;
      ack?.(jsonError(error));
    }
  }

  private async signal(connection: VoiceConnection, body: unknown, ack?: (value: unknown) => void) {
    const targetId = typeof (body as any)?.to === "string" ? (body as any).to : "invalid";
    const key = `pair:${connection.roomId}:${[connection.membershipId, targetId].sort().join(":")}`;
    return this.serialized(key, async () => {
      try {
        await this.authorize(connection);
        if (!body || typeof body !== "object" || typeof (body as any).to !== "string" || !/^[0-9a-f-]{36}$/i.test((body as any).to) || typeof (body as any).msg !== "string")
          throw new ApiError(400, "INVALID_JSON");
        const bytes = Buffer.byteLength((body as any).msg, "utf8");
        if (bytes > 65536) throw new ApiError(413, "PAYLOAD_TOO_LARGE");
        const now = Date.now();
        connection.tokens = Math.min(60, connection.tokens + Math.max(0, now - connection.tokenAt) * 0.02);
        connection.tokenAt = now;
        if (connection.tokens < 1) throw new ApiError(429, "RATE_LIMITED");
        connection.tokens -= 1;
        let message: any;
        try { message = JSON.parse((body as any).msg); } catch (handledError) { logHandledException("voice.signal.8", handledError);  throw new ApiError(400, "INVALID_JSON"); }
        if (!message || message.generation !== connection.generation || typeof message.targetGeneration !== "string")
          throw new ApiError(401, "SESSION_EXPIRED");
        const peerGeneration = message.peerGeneration;
        const targetPeerGeneration = message.targetPeerGeneration;
        if (!Number.isSafeInteger(peerGeneration) || peerGeneration <= 0 ||
            !Number.isSafeInteger(targetPeerGeneration) || targetPeerGeneration < 0)
          throw new ApiError(400, "INVALID_JSON");
        const content = message.sdp ?? message.ice;
        if (Number(!!message.sdp) + Number(!!message.ice) + Number(message.restart === true) + Number(message.requestOffer === true) !== 1)
          throw new ApiError(400, "INVALID_JSON");
        if (message.sdp) {
          if (typeof content.sdp !== "string" || Buffer.byteLength(content.sdp) > 60000 || !["offer", "answer"].includes(content.type))
            throw new ApiError(400, "INVALID_JSON");
          const mediaSections = content.sdp.split(/\r?\n/).filter((line: string) => line.startsWith("m="));
          // This endpoint carries microphone-only peer negotiation. Reject video,
          // data channels, and unknown media even if a non-Android client connects.
          if (mediaSections.length !== 1 || !/^m=audio\s/i.test(mediaSections[0]))
            throw new ApiError(400, "INVALID_JSON");
        }
        if (message.ice && (typeof content.candidate !== "string" || content.candidate.length > 4096 || (content.sdpMid !== null && typeof content.sdpMid !== "string") || (content.sdpMLineIndex !== null && !Number.isInteger(content.sdpMLineIndex))))
          throw new ApiError(400, "INVALID_JSON");
        if (!message.sdp && !message.ice && message.restart !== true && message.requestOffer !== true)
          throw new ApiError(400, "INVALID_JSON");
        const target = this.connections.get((body as any).to);
        if (!target || target.roomId !== connection.roomId || target.membershipId === connection.membershipId || target.generation !== message.targetGeneration)
          throw new ApiError(403, "FORBIDDEN");
        await this.rooms.active(connection.uid, connection.roomId, connection.membershipId, "voice", connection.lease);
        await this.rooms.active(target.uid, target.roomId, target.membershipId, "voice", target.lease);
        this.assertAuthority(connection);
        this.assertAuthority(target);
        const messageId = message.negotiationId;
        if (typeof messageId !== "string" || !/^[A-Za-z0-9:_-]{1,128}$/.test(messageId)) throw new ApiError(400, "INVALID_JSON");
        const replayKey = `${target.membershipId}:${messageId}`;
        const digest = createHmac("sha256", "voice-v4-replay").update((body as any).msg).digest("hex");
        const accepted = connection.accepted.get(replayKey);
        if (accepted) {
          if (accepted !== digest) throw new ApiError(409, "STALE_NEGOTIATION");
          this.metrics.signalReplayed++;
          ack?.({ ok: true });
          return;
        }
        const lower = connection.membershipId < target.membershipId ? connection : target;
        const higher = lower === connection ? target : connection;
        const pairKey = [connection.roomId, lower.membershipId, lower.generation, higher.membershipId, higher.generation].join(":");
        let epoch = this.peerEpochs.get(pairKey);
        if (!epoch) {
          epoch = {
            lowerMembershipId: lower.membershipId,
            lowerVoiceGeneration: lower.generation,
            higherMembershipId: higher.membershipId,
            higherVoiceGeneration: higher.generation,
          };
          this.peerEpochs.set(pairKey, epoch);
        }
        const senderIsLower = connection === lower;
        if (!senderIsLower && epoch.higherOfferRequestGeneration !== undefined && peerGeneration < epoch.higherOfferRequestGeneration)
          throw new ApiError(409, "STALE_NEGOTIATION");
        if (message.sdp?.type === "offer") {
          if (!senderIsLower || targetPeerGeneration !== 0 && targetPeerGeneration !== epoch.higherPeerGeneration ||
              epoch.lowerPeerGeneration !== undefined && peerGeneration <= epoch.lowerPeerGeneration)
            throw new ApiError(409, "STALE_NEGOTIATION");
          epoch.lowerPeerGeneration = peerGeneration;
        } else if (message.sdp?.type === "answer") {
          if (senderIsLower || epoch.lowerPeerGeneration === undefined || targetPeerGeneration !== epoch.lowerPeerGeneration ||
              epoch.higherPeerGeneration !== undefined && peerGeneration < epoch.higherPeerGeneration)
            throw new ApiError(409, "STALE_NEGOTIATION");
          epoch.higherPeerGeneration = peerGeneration;
        } else if (message.ice) {
          const currentSenderGeneration = senderIsLower ? epoch.lowerPeerGeneration : epoch.higherPeerGeneration;
          const currentTargetGeneration = senderIsLower ? epoch.higherPeerGeneration : epoch.lowerPeerGeneration;
          // ICE may precede its SDP on the wire. Permit only unbound candidates
          // to use target generation 0; bound candidates must match the current pair.
          if (currentSenderGeneration === undefined || peerGeneration !== currentSenderGeneration ||
              targetPeerGeneration !== 0 && targetPeerGeneration !== currentTargetGeneration)
            throw new ApiError(409, "STALE_NEGOTIATION");
        } else if (message.requestOffer === true) {
          // Explicit retry from the answerer can recover an initial negotiation
          // that never established both peer epochs. It cannot become an offerer,
          // reuse an older request epoch, or relax ordinary SDP/ICE/restart fences.
          if (senderIsLower ||
              epoch.higherPeerGeneration !== undefined && peerGeneration < epoch.higherPeerGeneration ||
              epoch.higherOfferRequestGeneration !== undefined && peerGeneration <= epoch.higherOfferRequestGeneration ||
              targetPeerGeneration !== 0 && targetPeerGeneration !== epoch.lowerPeerGeneration)
            throw new ApiError(409, "STALE_NEGOTIATION");
          epoch.higherOfferRequestGeneration = peerGeneration;
        } else if (message.restart === true) {
          const currentSenderGeneration = senderIsLower ? epoch.lowerPeerGeneration : epoch.higherPeerGeneration;
          const currentTargetGeneration = senderIsLower ? epoch.higherPeerGeneration : epoch.lowerPeerGeneration;
          if (currentSenderGeneration !== peerGeneration || currentTargetGeneration === undefined || targetPeerGeneration !== currentTargetGeneration)
            throw new ApiError(409, "STALE_NEGOTIATION");
        }
        this.metrics.signalAccepted++;
        connection.accepted.set(replayKey, digest);
        if (connection.accepted.size > 2048) connection.accepted.delete(connection.accepted.keys().next().value!);
        target.socket.emit("signal", { from: connection.membershipId, msg: (body as any).msg });
        ack?.({ ok: true });
      } catch (error) {
        logHandledException("voice.signal.9", error);
        this.metrics.acknowledgementsRejected++;
        this.metrics.negotiationFailures++;
        ack?.(jsonError(error));
      }
    });
  }

  private async authorize(connection: VoiceConnection) {
    this.assertAuthority(connection);
    if (connection.session.expiresAt <= Date.now()) throw new ApiError(401, "SESSION_EXPIRED");
    await this.verifyFresh(connection);
    await this.rooms.active(connection.uid, connection.roomId, connection.membershipId, "voice", connection.lease);
    this.assertAuthority(connection);
  }

  private async verifyFresh(connection: VoiceConnection) {
    if (Date.now() - connection.verifiedAt < 60000) return;
    let flight = this.authFlights.get(connection);
    if (!flight) {
      flight = (async () => {
        const session = await this.auth.verify(connection.session.token);
        if (session.uid !== connection.uid) throw new ApiError(401, "INVALID_TOKEN");
        this.assertAuthority(connection);
        connection.session = session;
        connection.verifiedAt = Date.now();
      })();
      this.authFlights.set(connection, flight);
    }
    try { await flight; } finally {
      if (this.authFlights.get(connection) === flight) this.authFlights.delete(connection);
    }
  }

  private detach(uid: string, roomId: string, membershipId: string, generation: string) {
    const task = this.rooms.detach(uid, roomId, membershipId, "voice", generation).catch((handledError) => {
      logHandledException("voice.detach.task.10", handledError); });
    this.pendingDetaches.add(task);
    void task.finally(() => this.pendingDetaches.delete(task));
  }

  private async refresh(connection: VoiceConnection, body: unknown, ack?: (value: unknown) => void) {
    try {
      if (this.closing || !connection.socket.connected || this.connections.get(connection.membershipId) !== connection)
        throw new ApiError(401, "SESSION_EXPIRED");
      if (!body || typeof body !== "object" || typeof (body as any).accessToken !== "string")
        throw new ApiError(401, "INVALID_TOKEN");
      const session = await this.auth.verify((body as any).accessToken);
      if (session.uid !== connection.uid) throw new ApiError(401, "INVALID_TOKEN");
      this.assertAuthority(connection);
      connection.session = session;
      connection.verifiedAt = Date.now();
      await this.rooms.active(connection.uid, connection.roomId, connection.membershipId, "voice", connection.lease);
      this.assertAuthority(connection);
      ack?.({ expiresAt: new Date(session.expiresAt).toISOString() });
    } catch (error) {
      logHandledException("voice.refresh.11", error);
      this.metrics.acknowledgementsRejected++;
      ack?.(jsonError(error));
    }
  }

  private async maintain() {
    if (this.closing) return;
    for (const [secret, ticket] of this.tickets) if (ticket.expires <= Date.now()) this.tickets.delete(secret);
    for (const [id, deadline] of this.resumeUntil) if (deadline <= Date.now()) {
      this.resumeUntil.delete(id);
      if (!this.connections.get(id)?.socket.connected) this.removeMembership(id);
    }
    const active = [...this.connections.values()].filter(c => c.socket.connected);
    if (!active.length) return;
    const renewed = await this.rooms.renewLeases(active.map((connection) => ({ membershipId: connection.membershipId, role: "voice" as const, generation: connection.lease })));
    for (const connection of active) {
      if (this.connections.get(connection.membershipId) !== connection) continue;
      if (!renewed.has(connection.membershipId)) connection.socket.disconnect(true);
      else if (Date.now() - connection.verifiedAt >= 60000) {
        try {
          await this.verifyFresh(connection);
        } catch (error) {
          logHandledException("voice.maintain.12", error);
          // Provider outages suspend protected signaling but do not tear down
          // already-negotiated media. Invalid/revoked credentials do disconnect.
          if (!(error instanceof ApiError && error.status === 503))
            connection.socket.disconnect(true);
        }
      }
    }
  }

  private removeMembership(id: string, disconnect = true) {
    if (this.generations.has(id)) this.metrics.cleanedSessions++;
    this.admissionLeases.delete(id);
    this.generations.delete(id);
    this.resumeUntil.delete(id);
    this.muted.delete(id);
    for (const [secret, ticket] of this.tickets) if (ticket.membershipId === id) this.tickets.delete(secret);
    const prior = this.connections.get(id);
    this.connections.delete(id);
    if (disconnect) prior?.socket.disconnect(true);
    if (prior) this.broadcastRoster(prior.roomId);
    this.clearPeerEpochsForMembership(id);
  }
  private clearPeerEpochsForMembership(id: string) {
    for (const [key, epoch] of this.peerEpochs)
      if (epoch.lowerMembershipId === id || epoch.higherMembershipId === id) this.peerEpochs.delete(key);
  }
  private removeRoom(roomId: string) {
    for (const [key] of this.peerEpochs) if (key.startsWith(`${roomId}:`)) this.peerEpochs.delete(key);
    const memberships = new Set<string>();
    for (const [secret, ticket] of this.tickets) {
      if (ticket.roomId === roomId) {
        memberships.add(ticket.membershipId);
        this.tickets.delete(secret);
      }
    }
    for (const connection of [...this.connections.values()]) {
      if (connection.roomId !== roomId) continue;
      memberships.add(connection.membershipId);
      connection.socket.disconnect(true);
    }
    for (const id of memberships) this.removeMembership(id);
  }
  revoke(uid: string) {
    for (const [secret, ticket] of this.tickets) if (ticket.uid === uid) this.tickets.delete(secret);
    for (const connection of this.connections.values()) if (connection.uid === uid) connection.socket.disconnect(true);
  }
  drain() {
    this.closing = true;
    if (this.timer) clearInterval(this.timer);
    if (this.metricsTimer) clearInterval(this.metricsTimer);
    this.tickets.clear();
    for (const connection of this.connections.values()) connection.socket.disconnect(true);
  }
  async close() {
    this.drain();
    for (const connection of this.connections.values()) connection.socket.disconnect(true);
    await Promise.allSettled([...this.pendingDetaches]);
    this.connections.clear();
    this.tickets.clear();
    this.reportMetrics();
  }
}

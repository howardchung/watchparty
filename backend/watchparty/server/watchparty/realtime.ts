import { logHandledException } from './diagnostics.ts';
import { Server, type Socket } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { randomBytes, randomUUID } from "node:crypto";
import type { AuthProvider, Session } from "./auth.ts";
import { GroupSync, type SyncContext } from "./groupSync.ts";
import { ApiError } from "./errors.ts";
import { SocketCloseDiagnostics } from "./socketDiagnostics.ts";
import { Rooms, type DurableEvent, type Row } from "./rooms.ts";
interface Ticket {
  uid: string;
  session: Session;
  membershipId: string;
  roomId: string;
  generation: string;
  expires: number;
}
interface Connection extends Ticket {
  socket: Socket;
  ready: boolean;
  pending: DurableEvent[];
  sequence: number;
  verifiedUntil: number;
  protected: boolean;
  authEpoch: number;
  lastReport: number;
  budget: { count: number; reset: number };
}
interface Report {
  roomId: string;
  membershipId: string;
  sessionId: string;
  position: number;
  playing: boolean;
  received: number;
}
export function failure(error: unknown) {
  const e =
    error instanceof ApiError ? error : new ApiError(500, "INTERNAL_ERROR");
  return { code: e.code, message: e.message };
}
export class Realtime {
  readonly io: Server;
  readonly socketDiagnostics = new SocketCloseDiagnostics();
  readonly rooms: Rooms;
  readonly auth: AuthProvider;
  readonly tickets = new Map<string, Ticket>();
  readonly connections = new Map<string, Connection>();
  readonly reports = new Map<string, Report>();
  private readonly startedSources = new Map<string, string>();
  readonly groupSync = new GroupSync((roomId, state) => {
    for (const conn of this.connections.values()) if (conn.roomId === roomId && conn.ready) conn.socket.emit("sync.state", { serverTimeMs: Date.now(), state });
  });
  private timer: ReturnType<typeof setTimeout> | undefined;
  private closing = false;
  private working: Promise<void> | undefined;
  private authWorking: Promise<void> | undefined;
  private maintenanceAt = 0;
  private leaseAt = 0;
  private verificationSlots = 8;
  private verificationWaiters: (() => void)[] = [];
  private verificationFlights = new Map<Connection, Promise<void>>();
  private failures = 0;
  private lastSuccessful = Date.now();
  private readonly roomPrefix: string;
  constructor(server: HttpServer, rooms: Rooms, auth: AuthProvider, namespacePrefix = "watchparty") {
    this.roomPrefix = `/${namespacePrefix}/rooms/`;
    this.rooms = rooms;
    this.auth = auth;
    this.io = new Server(server, {
      transports: ["websocket"],
      // Room commands enforce their own 8 KiB limit; voice SDP has a separate 64 KiB budget.
      maxHttpBufferSize: 72 * 1024,
      pingInterval: 10000,
      pingTimeout: 10000,
      serveClient: false,
      cleanupEmptyChildNamespaces: true,
    });
    this.io.engine.on("connection", transport => {
      transport.once("close", (reason: unknown) => this.socketDiagnostics.record("transport", "shared", reason));
    });
    this.io.of("/").use((socket, next) => next(new Error("INVALID_NAMESPACE")));
    const parent = this.io.of(new RegExp(`^${this.roomPrefix}[0-9a-f-]{36}$`, "i"));
    parent.use(async (socket, next) => {
      let ticket: Ticket | undefined;
      try {
        if (this.closing) throw new ApiError(503, "UNAVAILABLE");
        const packet = socket.handshake.auth;
        const secret = packet?.ticket;
        if (typeof secret !== "string" || packet.protocolVersion !== 3)
          throw new ApiError(401, "INVALID_TICKET");
        ticket = this.tickets.get(secret);
        this.tickets.delete(secret);
        if (
          !ticket ||
          ticket.expires <= Date.now() ||
          socket.nsp.name !== `${this.roomPrefix}${ticket.roomId}`
        )
          throw new ApiError(401, "INVALID_TICKET");
        const session = await auth.verify(ticket.session.token);
        if (this.closing) throw new ApiError(503, "UNAVAILABLE");
        if (session.uid !== ticket.uid)
          throw new ApiError(401, "INVALID_TICKET");
        socket.data.ticket = { ...ticket, session };
        next();
      } catch (e) {
        logHandledException("realtime.handler.1", e);
        const error = new Error(failure(e).code) as Error & { data?: unknown };
        error.data = failure(e);
        next(error);
      }
    });
    parent.on("connection", (socket) => void this.connect(socket));
    rooms.onMembershipRemoved = (id) => {
      this.removeMember(id);
    };
    rooms.onRoomClosed = (id) => {
      this.clearReports(id);
      this.groupSync.invalidate(id,"ROOM_CLOSED");
      for (const [secret, t] of this.tickets)
        if (t.roomId === id) this.tickets.delete(secret);
    };
    rooms.onStreamChanged = (id, stream) => {
      this.clearReports(id);
      const current = this.groupSync.state(id);
      // Outbox delivery can win the race with the HTTP post-commit callback.
      if (current && (stream.state !== "ACTIVE" || current.streamSessionId !== stream.sessionId || current.streamRevision !== stream.revision)) this.groupSync.invalidate(id);
    };
    this.schedule(0);
  }
  healthy() {
    return (
      !this.closing &&
      this.failures === 0 &&
      Date.now() - this.lastSuccessful < 30000
    );
  }
  async ticket(uid: string, session: Session, roomId: string) {
    const m = await this.rooms.ticketMembership(uid, roomId);
    if (this.tickets.size >= 10000) throw new ApiError(429, "RATE_LIMITED");
    // Keep at most one unconsumed room ticket per membership.
    for (const [key, t] of this.tickets)
      if (t.membershipId === m.id) this.tickets.delete(key);
    const secret = randomBytes(32).toString("base64url");
    const expires = Date.now() + 30000;
    this.tickets.set(secret, {
      uid,
      session,
      membershipId: m.id,
      roomId,
      generation: randomUUID(),
      expires,
    });
    return {
      ticket: secret,
      namespace: `${this.roomPrefix}${roomId}`,
      expiresAt: new Date(expires).toISOString(),
    };
  }
  private async connect(socket: Socket) {
    if (this.closing) {
      socket.disconnect();
      return;
    }
    const ticket = socket.data.ticket as Ticket;
    const key = ticket.membershipId;
    const conn: Connection = {
      ...ticket,
      socket,
      ready: false,
      pending: [],
      sequence: 0,
      verifiedUntil: Date.now() + 60000,
      protected: true,
      authEpoch: 0,
      lastReport: 0,
      budget: { count: 0, reset: Date.now() + 1000 },
    };
    // Register before awaiting snapshot; durable events are buffered until snapshot establishes its sequence.
    const old = this.connections.get(key);
    this.connections.set(key, conn);
    old?.socket.disconnect();
    socket.on("disconnect", reason => {
      this.socketDiagnostics.record("namespace", "room", reason);
      if (this.connections.get(key) === conn) {
        this.connections.delete(key);
        this.reports.delete(key);
        this.groupSync.disconnected(conn.roomId,key);
      }
      void this.rooms
        .detach(conn.uid, conn.roomId, key, "room", conn.generation)
        .catch((handledError) => {
          logHandledException("realtime.connect.2", handledError); });
    });
    socket.on(
      "auth.refresh",
      (body, ack) =>
        void this.command(
          conn,
          body,
          ack,
          async () => {
            if (typeof body?.accessToken !== "string")
              throw new ApiError(401, "INVALID_TOKEN");
            const session = await this.auth.verify(body.accessToken);
            if (session.uid !== conn.uid)
              throw new ApiError(401, "INVALID_TOKEN");
            conn.session = session;
            conn.verifiedUntil = Date.now() + 60000;
            conn.protected = true;
            conn.authEpoch++;
            return { expiresAt: new Date(session.expiresAt).toISOString() };
          },
          false,
        ),
    );
    socket.on(
      "playback.report",
      (body, ack) =>
        void this.command(conn, body, ack, async () => {
          await this.authorize(conn);
          this.validatePlayback(body);
          if (typeof body.playing !== "boolean")
            throw new ApiError(400, "INVALID_JSON");
          if (Date.now() - conn.lastReport < 250)
            throw new ApiError(429, "RATE_LIMITED"); // local changes allowed; normal client interval is 3s.
          const state = await this.rooms.active(
            conn.uid,
            conn.roomId,
            key,
            "room",
            conn.generation,
          );
          if (
            state.stream.state !== "ACTIVE" ||
            state.stream.sessionId !== body.streamSessionId
          )
            throw new ApiError(409, "STALE_STREAM_REVISION");
          conn.lastReport = Date.now();
          this.reports.set(key, {
            roomId: conn.roomId,
            membershipId: key,
            sessionId: body.streamSessionId,
            position: body.positionMs,
            playing: body.playing,
            received: Date.now(),
          });
          return { accepted: true };
        }),
    );
    socket.on(
      "sync.request",
      (body, ack) =>
        void this.command(conn, body, ack, async () => {
          await this.authorize(conn);
          this.validatePlayback(body);
          if (
            typeof body.requestId !== "string" ||
            !body.requestId ||
            body.requestId.length > 128
          )
            throw new ApiError(400, "INVALID_JSON");
          const state = await this.rooms.active(
            conn.uid,
            conn.roomId,
            key,
            "room",
            conn.generation,
          );
          const snapshot = await this.rooms.snapshot(conn.uid,conn.roomId);
          const owner = snapshot.members.find(m => m.isOwner && m.present);
          const report = owner ? this.reports.get(owner.membershipId) : undefined;
          const age = report ? Date.now()-report.received : Infinity;
          const available = state.stream.state === "ACTIVE" && state.stream.sessionId === body.streamSessionId && report?.sessionId === body.streamSessionId && age <= 15000;
          const result = { requestId:body.requestId, status:available?"APPLIED":"UNAVAILABLE", targetPositionMs:available?report!.position+(report!.playing?age:0):0, playing:available?report!.playing:false, serverTimeMs:Date.now() };
          socket.emit("sync.result", result);
          return result;
        }),
    );
    socket.on("sync.clock", (body, ack) => void this.command(conn, body, ack, async () => {await this.authorize(conn); return {serverTimeMs:Date.now()};}));
    for (const name of ["sync.invite","sync.respond","sync.commit","sync.cancel","sync.ready","sync.failed"]) {
      socket.on(name, (body, ack) => void this.command(conn,body,ack,async () => {
        await this.authorize(conn);
        if(!body || typeof body.requestId!=="string" || !body.requestId || body.requestId.length>128 || typeof body.streamSessionId!=="string")throw new ApiError(400,"INVALID_JSON");
        const active=await this.rooms.active(conn.uid,conn.roomId,key,"room",conn.generation);
        const snapshot=await this.rooms.snapshot(conn.uid,conn.roomId);
        if(!socket.connected || this.connections.get(key)!==conn)throw new ApiError(401,"SESSION_EXPIRED");
        if(active.stream.state!=="ACTIVE" || active.stream.sessionId!==body.streamSessionId || snapshot.stream.sessionId!==body.streamSessionId || snapshot.stream.revision!==active.stream.revision)throw new ApiError(409,"STALE_STREAM_REVISION");
        const ctx:SyncContext={roomId:conn.roomId,membershipId:key,isOwner:active.membership.isOwner,streamSessionId:body.streamSessionId,streamRevision:active.stream.revision,localFile:snapshot.stream.sourceKind==="LOCAL_FILE",members:snapshot.members.filter(m=>m.present && this.connections.get(m.membershipId)?.ready).map(m=>m.membershipId)};
        let value;
        if(name==="sync.invite"){this.validatePlayback(body);value=this.groupSync.invite(ctx,body.requestId,body.positionMs);}
        else if(name==="sync.respond")value=this.groupSync.respond(ctx,body.requestId,body.response);
        else if(name==="sync.commit")value=this.groupSync.commit(ctx,body.requestId);
        else if(name==="sync.cancel")value=this.groupSync.cancel(ctx,body.requestId);
        else value=this.groupSync.ready(ctx,body.requestId,name==="sync.failed"?false:body.ready,name==="sync.failed",typeof body.reason==="string"?body.reason.slice(0,80):"PLAYER_FAILED");
        return {ok:true,serverTimeMs:Date.now(),state:value};
      }));
    }
    socket.on(
      "ack",
      (body, ack) =>
        void this.command(conn, body, ack, async () => {
          await this.authorize(conn);
          if (typeof body?.eventId !== "string")
            throw new ApiError(400, "INVALID_JSON");
          return { accepted: true };
        }),
    );
    socket.onAny((name, ...args) => {
      if (
        !["auth.refresh", "playback.report", "sync.request", "sync.clock", "sync.invite", "sync.respond", "sync.commit", "sync.cancel", "sync.ready", "sync.failed", "ack"].includes(
          name,
        )
      ) {
        const ack = args.at(-1);
        void this.command(conn, args[0], ack, async () => {
          throw new ApiError(400, "UNSUPPORTED_COMMAND");
        });
      }
    });
    try {
      const attached = await this.rooms.attach(
        conn.uid,
        conn.roomId,
        key,
        "room",
        conn.generation,
      );
      if (!socket.connected || this.connections.get(key) !== conn) {
        await this.rooms.detach(
          conn.uid,
          conn.roomId,
          key,
          "room",
          conn.generation,
        );
        return;
      }
      conn.sequence = attached.snapshot.sequence;
      socket.emit("snapshot", attached.snapshot);
      conn.ready = true;
      socket.emit("sync.state", {serverTimeMs:Date.now(),state:this.groupSync.state(conn.roomId)});
      for (const event of conn.pending.sort((a, b) => a.sequence - b.sequence))
        this.deliver(conn, event);
      conn.pending = [];
    } catch (e) {
      logHandledException("realtime.connect.3", e);
      socket.emit("error", failure(e));
      socket.disconnect();
    }
  }
  private validatePlayback(body: Row) {
    if (
      !body ||
      typeof body.streamSessionId !== "string" ||
      !Number.isSafeInteger(body.positionMs) ||
      body.positionMs < 0 ||
      body.positionMs > Number.MAX_SAFE_INTEGER - 15000
    )
      throw new ApiError(400, "INVALID_JSON");
  }
  private async command(
    conn: Connection,
    body: unknown,
    ack: unknown,
    operation: () => Promise<unknown>,
    needsReady = true,
  ) {
    try {
      if (this.closing) throw new ApiError(503, "UNAVAILABLE");
      if (needsReady && !conn.ready) throw new ApiError(503, "UNAVAILABLE");
      if (
        this.connections.get(conn.membershipId) !== conn ||
        !conn.socket.connected
      )
        throw new ApiError(401, "SESSION_EXPIRED");
      const now = Date.now();
      if (conn.budget.reset <= now)
        conn.budget = { count: 0, reset: now + 1000 };
      if (++conn.budget.count > 20) {
        conn.socket.disconnect();
        throw new ApiError(429, "RATE_LIMITED");
      }
      if (Buffer.byteLength(JSON.stringify(body) ?? "") > 8192)
        throw new ApiError(413, "PAYLOAD_TOO_LARGE");
      const result = await operation();
      if (typeof ack === "function") ack(result);
    } catch (e) {
      logHandledException("realtime.command.4", e);
      const result = failure(e);
      conn.socket.emit("error", result);
      if (typeof ack === "function") ack(result);
      if (e instanceof ApiError && e.code === "SESSION_REVOKED")
        conn.socket.disconnect();
    }
  }
  private async authorize(conn: Connection) {
    if (conn.session.expiresAt <= Date.now())
      throw new ApiError(401, "SESSION_EXPIRED");
    if (!conn.protected || conn.verifiedUntil <= Date.now())
      await this.revalidate(conn);
  }
  private revalidate(conn: Connection): Promise<void> {
    const existing = this.verificationFlights.get(conn);
    if (existing) return existing;
    const result = this.boundedVerification(conn).finally(() =>
      this.verificationFlights.delete(conn),
    );
    this.verificationFlights.set(conn, result);
    return result;
  }
  private async boundedVerification(conn: Connection) {
    if (this.verificationSlots === 0)
      await new Promise<void>((resolve) =>
        this.verificationWaiters.push(resolve),
      );
    else this.verificationSlots--;
    try {
      await this.verifyConnection(conn);
    } finally {
      const next = this.verificationWaiters.shift();
      if (next) next();
      else this.verificationSlots++;
    }
  }
  private async verifyConnection(conn: Connection) {
    const epoch = conn.authEpoch;
    const token = conn.session.token;
    try {
      const session = await this.auth.verify(token);
      if (epoch !== conn.authEpoch) return;
      conn.session = session;
      conn.verifiedUntil = Date.now() + 60000;
      conn.protected = true;
    } catch (e) {
      logHandledException("realtime.verifyConnection.5", e);
      if (epoch === conn.authEpoch) {
        conn.protected = false;
        if (
          e instanceof ApiError &&
          e.status === 401 &&
          e.code !== "SESSION_EXPIRED"
        )
          conn.socket.disconnect();
      }
      throw e;
    }
  }
  private deliver(conn: Connection, event: DurableEvent) {
    if (event.sequence <= conn.sequence) return;
    const transport = conn.socket.conn.transport as unknown as {
      socket?: { bufferedAmount?: number };
    };
    if (
      (conn.socket.conn as unknown as { writeBuffer: unknown[] }).writeBuffer
        .length >= 256 ||
      (transport.socket?.bufferedAmount ?? 0) > 524288
    ) {
      conn.socket.disconnect();
      return;
    }
    conn.socket.emit("event", {
      topic: event.topic,
      eventId: event.eventId,
      sequence: event.sequence,
      payload: event.payload,
    });
    conn.sequence = event.sequence;
    if (event.topic === "room.closed") conn.socket.disconnect();
  }
  private async publish(event: DurableEvent) {
    if (event.topic === "room.closed") {
      this.clearReports(event.roomId);
      this.startedSources.delete(event.roomId);
      for (const [secret, ticket] of this.tickets)
        if (ticket.roomId === event.roomId) this.tickets.delete(secret);
    }
    for (const conn of this.connections.values())
      if (conn.roomId === event.roomId) {
        if (!conn.ready) {
          if (conn.pending.length >= 256) {
            conn.socket.disconnect();
            continue;
          }
          conn.pending.push(event);
        } else this.deliver(conn, event);
      }
    if (event.topic === "stream.started" && this.startedSources.get(event.roomId) !== event.payload.streamSessionId) {
      const connection = [...this.connections.values()].find(c => c.roomId === event.roomId && c.ready);
      if (!connection) return;
      let snapshot;
      try { snapshot = await this.rooms.snapshot(connection.uid, event.roomId); }
      catch (error) {
        logHandledException("room.leave", error);
        // A leave/room close may race dispatch of an already committed start.
        if (error instanceof ApiError && ["NOT_A_MEMBER", "ROOM_ENDED", "ROOM_NOT_FOUND"].includes(error.code)) return;
        throw error;
      }
      // The outbox can contain an older start followed by an abort/replacement.
      if (snapshot.stream.state !== "ACTIVE" || snapshot.stream.sessionId !== event.payload.streamSessionId || snapshot.stream.revision !== event.payload.revision) return;
      const members = snapshot.members.filter(m => m.present && this.connections.get(m.membershipId)?.ready);
      const owner = members.find(m => m.isOwner);
      if (!owner) return;
      this.startedSources.set(event.roomId, snapshot.stream.sessionId);
      this.groupSync.startStream({ roomId:event.roomId, membershipId:owner.membershipId, isOwner:true,
        streamSessionId:snapshot.stream.sessionId, streamRevision:snapshot.stream.revision, localFile:snapshot.stream.sourceKind==="LOCAL_FILE",
        members:members.map(m => m.membershipId) });
    }
  }
  private clearReports(roomId: string) {
    for (const [id, r] of this.reports)
      if (r.roomId === roomId) this.reports.delete(id);
  }
  removeMember(id: string) {
    this.reports.delete(id);
    for (const [secret, t] of this.tickets)
      if (t.membershipId === id) this.tickets.delete(secret);
    this.connections.get(id)?.socket.disconnect();
  }
  revoke(uid: string) {
    for (const [secret, t] of this.tickets)
      if (t.uid === uid) this.tickets.delete(secret);
    for (const c of this.connections.values())
      if (c.uid === uid) c.socket.disconnect();
  }
  private schedule(delay: number) {
    if (!this.closing) {
      this.timer = setTimeout(() => {
        this.working = this.tick().finally(() => {
          this.working = undefined;
          this.schedule(Math.min(5000, 200 * 2 ** Math.min(this.failures, 5)));
        });
      }, delay);
      this.timer.unref();
    }
  }
  private async tick() {
    if (this.closing) return;
    try {
      const now = Date.now();
      this.groupSync.tick();
      for (const [secret, t] of this.tickets)
        if (t.expires <= now) this.tickets.delete(secret);
      for (const [id, r] of this.reports)
        if (now - r.received > 15000 || !this.connections.has(id))
          this.reports.delete(id);
      if (now - this.maintenanceAt >= 1000) {
        const heartbeat = now - this.leaseAt >= 10000;
        if (!this.authWorking) {
          this.authWorking = this.authMaintenance().finally(() => {
            this.authWorking = undefined;
          });
        }
        if (heartbeat) {
          const eligible = [...this.connections.values()].filter(
            (conn) =>
              conn.protected && conn.session.expiresAt > now && conn.ready,
          );
          const renewed = await this.rooms.renewLeases(
            eligible.map((conn) => ({
              membershipId: conn.membershipId,
              role: "room",
              generation: conn.generation,
            })),
          );
          for (const conn of eligible)
            if (!renewed.has(conn.membershipId)) conn.socket.disconnect();
          this.leaseAt = now;
        }
        await this.rooms.sweep();
        this.maintenanceAt = now;
      }
      const rows = await this.rooms.db.query(
        "SELECT * FROM outbox_events WHERE published_at IS NULL ORDER BY room_id,sequence LIMIT 100",
      );
      for (const r of rows.rows) {
        if (this.closing) return;
        await this.publish({
          eventId: r.id,
          roomId: r.room_id,
          sequence: Number(r.sequence),
          topic: r.topic,
          payload: r.payload,
        });
        await this.rooms.db.query(
          "UPDATE outbox_events SET published_at=clock_timestamp() WHERE id=$1 AND published_at IS NULL",
          [r.id],
        );
      }
      this.failures = 0;
      this.lastSuccessful = Date.now();
    } catch (handledError) {
      logHandledException("realtime.tick.6", handledError);
      this.failures++;
      console.error(
        JSON.stringify({ event: "dispatcher_retry", attempt: this.failures }),
      );
    }
  }
  private async authMaintenance() {
    const due = [...this.connections.values()].filter(
      (c) => c.verifiedUntil <= Date.now(),
    );
    let index = 0;
    await Promise.all(
      Array.from({ length: Math.min(8, due.length) }, async () => {
        while (index < due.length && !this.closing) {
          const conn = due[index++];
          try {
            await this.revalidate(conn);
          } catch (e) {
            logHandledException("realtime.authMaintenance.7", e);
            conn.verifiedUntil = Date.now() + 5000;
            conn.socket.emit("error", failure(e));
          }
        }
      }),
    );
  }
  quiesce() {
    this.closing = true;
    if (this.timer) clearTimeout(this.timer);
    for (const connection of this.connections.values())
      connection.socket.disconnect();
    this.tickets.clear();
  }
  async close() {
    this.quiesce();
    await this.working;
    await this.authWorking;
    await new Promise<void>((resolve) => this.io.close(() => resolve()));
    this.tickets.clear();
    this.reports.clear();
    this.startedSources.clear();
    this.groupSync.clear();
  }
}

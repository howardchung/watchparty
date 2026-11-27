import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { io, type Socket } from "socket.io-client";
import { config } from "../config.ts";
import { start } from "../main.ts";
import { Rooms, normalizeCode } from "../rooms.ts";
const enabled = process.env.WATCHPARTY_INTEGRATION === "true";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(check: () => boolean | Promise<boolean>, timeout = 5000) {
  const end = Date.now() + timeout;
  while (!(await check())) {
    if (Date.now() > end) throw Error("Condition timed out");
    await delay(20);
  }
}
function event<T = any>(socket: Socket, name: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error(`Missing ${name}`)), 5000);
    socket.once(name, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}
const profile = { name: "Migration tester", avatar: "comet", language: "en" };
test("Crockford code normalization preserves internal separator and ambiguity rules", () => {
  assert.equal(normalizeCode(" ol-il_23-45 "), "01112345");
  assert.throws(() => normalizeCode("ABCD\tEFGH"));
  assert.throws(() => normalizeCode("ABCD\nEFGH"));
  assert.throws(() => normalizeCode("ABCDEFGU"));
});
test(
  "real PostgreSQL and Socket.IO room invariants, private sync, durable retries and restart",
  { skip: !enabled, timeout: 90000 },
  async () => {
    const configuration = config();
    const running = await start({ ...configuration, port: 0 });
    const base = `http://127.0.0.1:${(running.server!.address() as { port: number }).port}`;
    const db = running.db;
    const rooms = running.rooms!;
    const realtime = running.realtime!;
    const sockets: Socket[] = [];
    const users: { uid: string; token: string; identityId: string }[] = [];
    const created: string[] = [];
    const user = async () => {
      const data = await running.auth!.create(profile);
      const value = { uid: data.identity.id, token: data.accessToken, identityId: data.identity.id };
      users.push(value);
      return value;
    };
    const request = async (
      u: (typeof users)[number],
      path: string,
      method = "POST",
      body: unknown = {},
      key?: string,
    ) => {
      const result = await fetch(base + path, {
        method,
        headers: {
          Authorization: `Bearer ${u.token}`,
          "Content-Type": "application/json",
          ...(key ? { "Idempotency-Key": key } : {}),
        },
        ...(method === "GET" ? {} : { body: JSON.stringify(body) }),
      });
      return { status: result.status, body: await result.json() };
    };
    const connect = async (u: (typeof users)[number], roomId: string) => {
      const ticket = await request(u, `/v1/rooms/${roomId}/realtime-ticket`);
      assert.equal(ticket.status, 201);
      const socket = io(base + ticket.body.namespace, {
        transports: ["websocket"],
        reconnection: false,
        forceNew: true,
        auth: { ticket: ticket.body.ticket, protocolVersion: 3 },
      });
      sockets.push(socket);
      const snapshot = await event(socket, "snapshot");
      return { socket, snapshot, ticket: ticket.body };
    };
    const ack = (socket: Socket, name: string, body: unknown) =>
      new Promise<any>((resolve, reject) =>
        socket
          .timeout(5000)
          .emit(name, body, (err: Error, value: any) =>
            err ? reject(err) : resolve(value),
          ),
      );
    try {
      await until(() => realtime.healthy());
      const owner = await user();
      const key = randomUUID();
      const results = await Promise.all(
        Array.from({ length: 10 }, () =>
          rooms.create(owner.uid, "  movie night  ", key),
        ),
      );
      assert.equal(new Set(results.map((r) => r.body.room.id)).size, 1);
      const room = results[0].body.room;
      created.push(room.id);
      assert.equal(room.title, "movie night");
      assert.equal(
        (
          await db.query(
            "SELECT count(*)::int AS count FROM outbox_events WHERE room_id=$1 AND topic='room.created'",
            [room.id],
          )
        ).rows[0].count,
        1,
      );
      const second = new Rooms(db);
      assert.deepEqual(
        (await second.create(owner.uid, "  movie night  ", key)).body,
        results[0].body,
      );
      await assert.rejects(rooms.create(owner.uid, "different", key), {
        code: "IDEMPOTENCY_MISMATCH",
      });
      await assert.rejects(
        rooms.stream(owner.uid, room.id, "start", {
          url: "https://example.com/movie.mp4",
        }),
        { code: "OWNER_ABSENT" },
      );
      const first = await connect(owner, room.id);
      assert.equal(first.snapshot.stream.sessionId, "");
      assert.equal(first.snapshot.stream.roomId, room.id);
      assert.equal(first.snapshot.stream.state, "EMPTY");
      assert.equal(first.snapshot.members[0].present, true);
      assert.equal(
        (await request(owner, "/v1/capabilities", "GET")).body.voice.length,
        0,
      );
      const guests = await Promise.all(Array.from({ length: 8 }, () => user()));
      const race = await Promise.allSettled(
        guests.map((u) => rooms.join(u.uid, room.code)),
      );
      assert.equal(race.filter((r) => r.status === "fulfilled").length, 7);
      assert.equal(
        race.filter(
          (r) =>
            r.status === "rejected" && (r.reason as any).code === "ROOM_FULL",
        ).length,
        1,
      );
      const guest = guests[race.findIndex((r) => r.status === "fulfilled")];
      const guestConn = await connect(guest, room.id);
      const memberId = guestConn.snapshot.members.find(
        (m: any) => m.identityId === guest.identityId,
      ).membershipId;
      const guestEvents: any[] = [];
      guestConn.socket.on("event", (e) => guestEvents.push(e));
      const ownerEvents: any[] = [];
      first.socket.on("event", (e) => ownerEvents.push(e));
      const streamKey = randomUUID();
      const secondStreamKey = randomUUID();
      const starts = await Promise.allSettled([
        rooms.stream(
          owner.uid,
          room.id,
          "start",
          { url: "https://example.com/movie.mp4" },
          streamKey,
        ),
        rooms.stream(
          owner.uid,
          room.id,
          "start",
          { url: "https://example.com/other.mp4" },
          secondStreamKey,
        ),
      ]);
      assert.equal(starts.filter((r) => r.status === "fulfilled").length, 1);
      let stream = (await rooms.snapshot(owner.uid, room.id)).stream;
      assert.equal(stream.revision, 1);
      const successful = starts.find(
        (r) => r.status === "fulfilled",
      ) as PromiseFulfilledResult<any>;
      const successfulUrl = successful.value.body.stream.url;
      const replayKey = successfulUrl.endsWith("movie.mp4")
        ? streamKey
        : secondStreamKey;
      await until(() => guestEvents.some((e) => e.topic === "stream.started"));
      await ack(guestConn.socket, "playback.report", {streamSessionId:stream.sessionId,positionMs:30000,playing:false});
      const report = await ack(first.socket, "playback.report", {
        streamSessionId: stream.sessionId,
        positionMs: 12000,
        playing: false,
      });
      assert.equal(report.accepted, true);
      let leaked = false;
      first.socket.on("sync.result", () => {
        leaked = true;
      });
      const syncPromise = event<any>(guestConn.socket, "sync.result");
      await ack(guestConn.socket, "sync.request", {
        requestId: "catch-up",
        streamSessionId: stream.sessionId,
        positionMs: 3000,
      });
      const sync = await syncPromise;
      assert.equal(sync.status, "APPLIED");
      assert.equal(sync.targetPositionMs, 12000);
      assert.equal(leaked, false);
      const ahead = await ack(guestConn.socket, "sync.request", {
        requestId: "ahead",
        streamSessionId: stream.sessionId,
        positionMs: 20000,
      });
      assert.equal(ahead.status, "APPLIED");
      assert.equal(ahead.targetPositionMs, 12000);
      if (replayKey) {
        assert.deepEqual(
          (
            await second.stream(
              owner.uid,
              room.id,
              "start",
              { url: successfulUrl },
              replayKey,
            )
          ).body,
          successful.value.body,
        );
        assert.equal(
          realtime.reports.has(memberId),
          true,
          "idempotent replay cannot clear telemetry",
        );
      }
      await rooms.stream(owner.uid, room.id, "abort");
      const aborted = (await rooms.snapshot(owner.uid, room.id)).stream;
      assert.equal(aborted.sessionId, stream.sessionId);
      assert.equal(aborted.url, stream.url);
      assert.equal(aborted.id, stream.id);
      assert.equal(aborted.revision, 2);
      assert.equal(aborted.startedAt, stream.startedAt);
      stream = (
        await rooms.stream(owner.uid, room.id, "start", {
          url: "https://example.com/new.mp4",
        })
      ).body.stream;
      assert.equal(stream.revision, 3);
      assert.notEqual(stream.sessionId, aborted.sessionId);
      const raceRevision = stream.revision;
      const startAbort = await Promise.allSettled([
        rooms.stream(owner.uid, room.id, "start", {
          url: "https://example.com/race.mp4",
        }),
        rooms.stream(owner.uid, room.id, "abort", {}, randomUUID()),
      ]);
      stream = (await rooms.snapshot(owner.uid, room.id)).stream;
      assert.equal(
        stream.revision,
        raceRevision +
          startAbort.filter((result) => result.status === "fulfilled").length,
      );
      assert.ok(startAbort.some((result) => result.status === "fulfilled"));
      const unsupported = await ack(first.socket, "CMD:pause", {});
      assert.equal(unsupported.code, "UNSUPPORTED_COMMAND");
      const retrySocket = io(base + first.ticket.namespace, {
        transports: ["websocket"],
        reconnection: false,
        forceNew: true,
        auth: { ticket: first.ticket.ticket, protocolVersion: 3 },
      });
      sockets.push(retrySocket);
      const err = await event<any>(retrySocket, "connect_error");
      assert.equal(err.data.code, "INVALID_TICKET");
      retrySocket.close();
      const replacement = await connect(owner, room.id);
      await until(() => !first.socket.connected);
      assert.equal(
        (await rooms.snapshot(owner.uid, room.id)).members.find(
          (m) => m.identityId === owner.identityId,
        )?.present,
        true,
      );
      const refreshed = await ack(replacement.socket, "auth.refresh", {
        accessToken: owner.token,
      });
      assert.ok(refreshed.expiresAt);
      const mismatch = await ack(replacement.socket, "auth.refresh", {
        accessToken: guest.token,
      });
      assert.equal(mismatch.code, "INVALID_TOKEN");
      await rooms.leave(owner.uid, room.id);
      await until(() => !replacement.socket.connected);
      const preview = await rooms.preview(owner.uid, room.code);
      assert.equal(preview.ownerPresent, false);
      assert.equal(
        preview.availability,
        "OPEN",
        "reserved owner seat must be joinable through preview",
      );
      assert.equal(
        (await rooms.preview(guest.uid, room.code)).availability,
        "FULL",
      );
      const returned = await rooms.join(owner.uid, room.code);
      assert.equal(returned.body.membership.id, results[0].body.membership.id);
      assert.equal(returned.body.membership.isOwner, true);
      const ownerReturn = await connect(owner, room.id);
      await rooms.leave(guest.uid, room.id);
      await assert.rejects(rooms.snapshot(guest.uid, room.id), {
        code: "NOT_A_MEMBER",
      });
      const rejoined = await rooms.join(guest.uid, room.code);
      assert.equal(rejoined.body.membership.id, memberId);
      // Two independent stores, same identity, different target rooms: only one active seat wins.
      const anotherOwner = await user();
      const another = (await rooms.create(anotherOwner.uid, "second")).body
        .room;
      created.push(another.id);
      const challenger = await user();
      // Free one guest seat first, then race target rooms.
      await rooms.leave(guest.uid, room.id);
      const double = await Promise.allSettled([
        rooms.join(challenger.uid, room.code),
        second.join(challenger.uid, another.code),
      ]);
      assert.equal(double.filter((r) => r.status === "fulfilled").length, 1);
      assert.equal(
        double.filter(
          (r) =>
            r.status === "rejected" &&
            (r.reason as any).code === "ALREADY_IN_ROOM",
        ).length,
        1,
      );
      const conflict = double.find(r => r.status === "rejected") as PromiseRejectedResult;
      const winningIndex = double.findIndex(r => r.status === "fulfilled");
      const winningCode = winningIndex === 0 ? room.code : another.code;
      assert.equal(conflict.reason.activePartyCode, winningCode);
      const blockedCreate = await request(challenger, "/v1/rooms", "POST", {});
      assert.equal(blockedCreate.status, 409);
      assert.equal(blockedCreate.body.activePartyCode, winningCode);
      const returnToParty = await request(challenger, `/v1/rooms/${winningCode}/join`, "POST", {});
      assert.equal(returnToParty.status, 200);
      const winner = (
        double.find(
          (r) => r.status === "fulfilled",
        ) as PromiseFulfilledResult<any>
      ).value.body.room.id;
      await rooms.leave(challenger.uid, winner);
      // Fresh room, final explicit leave closes immediately; duplicate leave is harmless.
      await rooms.leave(anotherOwner.uid, another.id);
      assert.equal(
        (await rooms.preview(anotherOwner.uid, another.code)).availability,
        "ENDED",
      );
      assert.equal(
        (await rooms.leave(anotherOwner.uid, another.id)).roomClosed,
        true,
      );
      // Report retention pruning does not depend on a matching future sync request.
      realtime.reports.set("old", {
        roomId: room.id,
        membershipId: "old",
        sessionId: "old-session",
        position: 10,
        playing: false,
        received: Date.now() - 16000,
      });
      await until(() => !realtime.reports.has("old"));
      // Stale reports for a current connection disappear even when nobody asks to sync.
      realtime.reports.set(
        ownerReturn.snapshot.members.find(
          (m: any) => m.identityId === owner.identityId,
        ).membershipId,
        {
          roomId: room.id,
          membershipId: ownerReturn.snapshot.members.find(
            (m: any) => m.identityId === owner.identityId,
          ).membershipId,
          sessionId: "obsolete",
          position: 30,
          playing: false,
          received: Date.now() - 16000,
        },
      );
      await until(
        () =>
          ![...realtime.reports.values()].some(
            (r) => r.sessionId === "obsolete",
          ),
      );
      // A voice role keeps presence when the room socket disconnects; generation-specific detach cannot remove a replacement.
      const ownerMembership = ownerReturn.snapshot.members.find(
        (m: any) => m.identityId === owner.identityId,
      ).membershipId;
      const voiceGeneration = randomUUID();
      await rooms.attach(
        owner.uid,
        room.id,
        ownerMembership,
        "voice",
        voiceGeneration,
      );
      ownerReturn.socket.close();
      await delay(50);
      assert.equal(
        (await rooms.snapshot(owner.uid, room.id)).members.find(
          (m) => m.identityId === owner.identityId,
        )?.present,
        true,
      );
      const voiceReplacement = randomUUID();
      await rooms.attach(
        owner.uid,
        room.id,
        ownerMembership,
        "voice",
        voiceReplacement,
      );
      await rooms.detach(
        owner.uid,
        room.id,
        ownerMembership,
        "voice",
        voiceGeneration,
      );
      assert.equal(
        (await rooms.snapshot(owner.uid, room.id)).members.find(
          (m) => m.identityId === owner.identityId,
        )?.present,
        true,
      );
      await db.query(
        "UPDATE role_leases SET expires_at=clock_timestamp()-interval '1 second' WHERE membership_id=$1 AND role='voice'",
        [ownerMembership],
      );
      await rooms.sweep();
      assert.equal(
        (await rooms.snapshot(owner.uid, room.id)).members.find(
          (m) => m.identityId === owner.identityId,
        )?.present,
        false,
      );
      const pendingGrace = (
        await db.query(
          "SELECT grace_expires_at,left_at FROM memberships WHERE id=$1",
          [ownerMembership],
        )
      ).rows[0];
      assert.ok(pendingGrace.grace_expires_at.getTime() > Date.now());
      assert.equal(pendingGrace.left_at, null);
      assert.equal(
        (
          await db.query(
            "SELECT count(*)::int AS count FROM role_leases WHERE membership_id=$1",
            [ownerMembership],
          )
        ).rows[0].count,
        0,
      );
      const ownerLive = await connect(owner, room.id);
      // Dispatcher ordering is sequence-based even if transaction timestamps are reversed.
      const delivered: any[] = [];
      ownerLive.socket.on("event", (e) => delivered.push(e));
      const transaction = await db.connect();
      try {
        await transaction.query("BEGIN");
        await rooms.lockRoom(transaction, room.id);
        await rooms.event(transaction, room.id, "member.absent", {
          member: { membershipId: "order-first" },
        });
        await rooms.event(transaction, room.id, "member.returned", {
          member: { membershipId: "order-second" },
        });
        await transaction.query(
          "UPDATE outbox_events SET created_at=CASE WHEN payload->'member'->>'membershipId'='order-first' THEN clock_timestamp()+interval '1 hour' ELSE clock_timestamp()-interval '1 hour' END WHERE room_id=$1 AND payload->'member'->>'membershipId' IN ('order-first','order-second')",
          [room.id],
        );
        await transaction.query("COMMIT");
      } finally {
        transaction.release();
      }
      await until(
        () =>
          delivered.filter((e) =>
            e.payload.member?.membershipId?.startsWith("order-"),
          ).length === 2,
      );
      assert.deepEqual(
        delivered
          .filter((e) => e.payload.member?.membershipId?.startsWith("order-"))
          .map((e) => e.payload.member.membershipId),
        ["order-first", "order-second"],
      );
      // Explicit revoke invalidates roles and tickets while normal leave retains anonymous ownership.
      const revokee = await user();
      const revokedRoom = (await rooms.create(revokee.uid, "revoke")).body.room;
      created.push(revokedRoom.id);
      const revokedConn = await connect(revokee, revokedRoom.id);
      const unconsumed = await realtime.ticket(
        revokee.uid,
        await running.auth!.verify(revokee.token),
        revokedRoom.id,
      );
      const revokeResult = await fetch(base + "/v1/guest-sessions/revoke", {
        method: "POST",
        headers: { Authorization: `Bearer ${revokee.token}` },
      });
      assert.equal(revokeResult.status, 204);
      await until(() => !revokedConn.socket.connected);
      assert.equal(realtime.tickets.has(unconsumed.ticket), false);
      // A second runtime cannot erase active leases; the database owner guard survives app restart.
      await assert.rejects(
        start({ ...configuration, port: 0 }),
        /Only one watchparty runtime/,
      );
      assert.equal(
        (await rooms.snapshot(owner.uid, room.id)).members.find(
          (m) => m.identityId === owner.identityId,
        )?.present,
        true,
      );
      // Restart recovery clears every lease, tickets/telemetry are process-local, metadata remains durable.
      const stableSession = stream.sessionId;
      await rooms.recover();
      const recovered = await rooms.snapshot(owner.uid, room.id);
      assert.equal(recovered.stream.sessionId, stableSession);
      assert.equal(
        recovered.members.every((m) => !m.present),
        true,
      );
      assert.ok(
        (
          await db.query(
            "SELECT grace_expires_at FROM memberships WHERE room_id=$1 AND left_at IS NULL",
            [room.id],
          )
        ).rows.every((m) => m.grace_expires_at),
      );
      ownerReturn.socket.close();
      // Grace expiry and final tombstone purge use actual PG state.
      const isolated = await user();
      const solo = (await rooms.create(isolated.uid, "solo")).body.room;
      created.push(solo.id);
      await db.query(
        "UPDATE memberships SET grace_expires_at=clock_timestamp()-interval '1 second' WHERE room_id=$1",
        [solo.id],
      );
      await rooms.sweep();
      assert.equal(
        (await rooms.preview(isolated.uid, solo.code)).availability,
        "ENDED",
      );
      await db.query(
        "UPDATE rooms SET tombstone_until=clock_timestamp()-interval '1 second' WHERE id=$1",
        [solo.id],
      );
      await rooms.sweep();
      await assert.rejects(rooms.preview(isolated.uid, solo.code), {
        code: "ROOM_NOT_FOUND",
      });
      // Durable idempotency keys expire after ten minutes and can then represent a new logical operation.
      const retryOwner = await user();
      const expiringKey = randomUUID();
      const priorRetry = (
        await rooms.create(retryOwner.uid, "before expiry", expiringKey)
      ).body.room;
      created.push(priorRetry.id);
      await rooms.leave(retryOwner.uid, priorRetry.id);
      await db.query(
        "UPDATE idempotency_records SET expires_at=clock_timestamp()-interval '1 second' WHERE identity_id=$1 AND key=$2",
        [retryOwner.identityId, expiringKey],
      );
      const afterExpiry = (
        await rooms.create(retryOwner.uid, "after expiry", expiringKey)
      ).body.room;
      created.push(afterExpiry.id);
      assert.notEqual(afterExpiry.id, priorRetry.id);
      // Outbox events are monotonically sequenced; published duplicates never reach current connections twice.
      const sequences = guestEvents.map((e) => e.sequence);
      assert.deepEqual(
        sequences,
        [...new Set(sequences)].sort((a, b) => a - b),
      );
      assert.ok(ownerEvents.some((e) => e.topic === "stream.started"));
    } finally {
      for (const socket of sockets) socket.close();
      await running.stop();
    }
  },
);

test(
  "runtime drains immediately after PostgreSQL advisory-lock connection loss",
  { skip: !enabled, timeout: 20000 },
  async () => {
    const configuration = config();
    const running = await start({ ...configuration, port: 0 });
    const base = `http://127.0.0.1:${(running.server!.address() as { port: number }).port}`;
    try {
      await until(() => running.realtime!.healthy());
      const holder = await running.db.query(
        "SELECT pid FROM pg_locks WHERE locktype='advisory' AND objid=734782094 AND granted AND database=(SELECT oid FROM pg_database WHERE datname=current_database())",
      );
      assert.equal(holder.rowCount, 1);
      await running.db.query("SELECT pg_terminate_backend($1)", [
        holder.rows[0].pid,
      ]);
      await until(async () => {
        const result = await fetch(base + "/readyz");
        return result.status === 503;
      });
      assert.equal(running.realtime!.healthy(), false);
      const response = await fetch(base + "/v1/capabilities");
      assert.equal(response.status, 503);
    } finally {
      await running.stop();
    }
  },
);

test(
  "transient auth/publish/database faults recover without new ownership or a dead dispatcher",
  { skip: !enabled, timeout: 25000 },
  async () => {
    const configuration = config();
    const running = await start({ ...configuration, port: 0 });
    const rooms = running.rooms!;
    const rt = running.realtime!;
    const base = `http://127.0.0.1:${(running.server!.address() as { port: number }).port}`;
    const issued = await running.auth!.create(profile);
    const u = { localId: issued.identity.id, accessToken: issued.accessToken };
    const room = (await rooms.create(u.localId, "failure recovery")).body.room;
    const ticket = await rt.ticket(
      u.localId,
      await running.auth!.verify(u.accessToken),
      room.id,
    );
    const socket = io(base + ticket.namespace, {
      transports: ["websocket"],
      reconnection: false,
      forceNew: true,
      auth: { ticket: ticket.ticket, protocolVersion: 3 },
    });
    await event(socket, "snapshot");
    const originalVerify = running.auth!.verify.bind(running.auth!);
    const originalQuery = running.db.query.bind(running.db);
    const publisher = rt as unknown as { publish(e: unknown): void };
    const originalPublish = publisher.publish.bind(rt);
    try {
      await until(() => rt.healthy());
      const conn = [...rt.connections.values()][0];
      const identity = conn.membershipId;
      const created = (
        await rooms.stream(u.localId, room.id, "start", {
          url: "https://example.com/recovery.mp4",
        })
      ).body.stream;
      const payload = {
        streamSessionId: created.sessionId,
        positionMs: 1000,
        playing: false,
      };
      // Controlled provider outage is injected at the real integration's provider seam.
      running.auth!.verify = async () => {
        throw new (await import("../errors.ts")).ApiError(
          503,
          "AUTH_UNAVAILABLE",
        );
      };
      conn.verifiedUntil = 0;
      const failed = await new Promise<any>((resolve) =>
        socket.emit("playback.report", payload, resolve),
      );
      assert.equal(failed.code, "AUTH_UNAVAILABLE");
      assert.equal(socket.connected, true);
      assert.equal(conn.membershipId, identity);
      running.auth!.verify = originalVerify;
      const fresh = await new Promise<any>((resolve) =>
        socket.emit("auth.refresh", { accessToken: u.accessToken }, resolve),
      );
      assert.ok(fresh.expiresAt);
      const accepted = await new Promise<any>((resolve) =>
        socket.emit("playback.report", payload, resolve),
      );
      assert.equal(accepted.accepted, true);
      // Concurrent commands share one revocation verification instead of amplifying provider requests.
      let verifies = 0;
      running.auth!.verify = async (token) => {
        verifies++;
        await delay(50);
        return originalVerify(token);
      };
      conn.verifiedUntil = 0;
      const queries = await Promise.all(
        Array.from(
          { length: 8 },
          (_, n) =>
            new Promise<any>((resolve) =>
              socket.emit(
                "sync.request",
                {
                  requestId: `simultaneous-${n}`,
                  streamSessionId: created.sessionId,
                  positionMs: 0,
                },
                resolve,
              ),
            ),
        ),
      );
      assert.equal(verifies, 1);
      assert.ok(queries.every((r) => r.status === "APPLIED"));
      running.auth!.verify = originalVerify;
      // Publish then mark failure: duplicate replay is filtered by each socket's sequence.
      const delivered: any[] = [];
      socket.on("event", (e) => delivered.push(e));
      let failMark = true;
      running.db.query = ((...args: any[]) => {
        if (
          failMark &&
          String(args[0]).startsWith("UPDATE outbox_events SET published_at")
        ) {
          failMark = false;
          return Promise.reject(
            new Error("injected post-publish mark failure"),
          );
        }
        return (originalQuery as any)(...args);
      }) as typeof running.db.query;
      let failPublish = true;
      publisher.publish = (e) => {
        if (failPublish) {
          failPublish = false;
          throw Error("injected sink fault");
        }
        originalPublish(e);
      };
      await rooms.stream(u.localId, room.id, "abort");
      await until(() => !rt.healthy());
      assert.equal((await fetch(base + "/readyz")).status, 503);
      await until(() => delivered.some((e) => e.topic === "stream.aborted"));
      await until(() => rt.healthy());
      publisher.publish = originalPublish;
      assert.equal(failMark, false);
      assert.equal(
        delivered.filter((event) => event.topic === "stream.aborted").length,
        1,
        "publish-before-mark retry must not apply a duplicate",
      );
      running.db.query = originalQuery;
      // A transient SQL failure does not permanently exit dispatch; later state changes remain deliverable.
      await running.db.query(
        "ALTER TABLE outbox_events RENAME TO outbox_events_test_unavailable",
      );
      try {
        await until(() => !rt.healthy());
        assert.equal((await fetch(base + "/readyz")).status, 503);
      } finally {
        await running.db.query(
          "ALTER TABLE outbox_events_test_unavailable RENAME TO outbox_events",
        );
      }
      await until(() => rt.healthy());
      const latest = (
        await rooms.stream(u.localId, room.id, "start", {
          url: "https://example.com/after-fault.mp4",
        })
      ).body.stream;
      await until(() =>
        delivered.some(
          (e) =>
            e.topic === "stream.started" &&
            e.payload.streamSessionId === latest.sessionId,
        ),
      );
      const seq = delivered.map((e) => e.sequence);
      assert.deepEqual(
        seq,
        [...new Set(seq)].sort((a, b) => a - b),
      );
      // Periodic revocation check (deadline forced rather than waiting a minute) disconnects revoked identities.
      await running.auth!.revoke(u.localId);
      conn.verifiedUntil = 0;
      await until(() => !socket.connected);
    } finally {
      running.auth!.verify = originalVerify;
      running.db.query = originalQuery;
      publisher.publish = originalPublish;
      socket.close();
      await running.stop();
    }
  },
);

test(
  "snapshot bootstrap buffers newer committed events until its consistent sequence is installed",
  { skip: !enabled, timeout: 20000 },
  async () => {
    const configuration = config();
    const running = await start({ ...configuration, port: 0 });
    const rooms = running.rooms!;
    const base = `http://127.0.0.1:${(running.server!.address() as { port: number }).port}`;
    const issued = await running.auth!.create(profile);
    const u = { localId: issued.identity.id, accessToken: issued.accessToken };
    const room = (await rooms.create(u.localId, "snapshot race")).body.room;
    const ticket = await running.realtime!.ticket(
      u.localId,
      await running.auth!.verify(u.accessToken),
      room.id,
    );
    let snapshotReady = false;
    let release: () => void = () => {};
    const barrier = new Promise<void>((resolve) => (release = resolve));
    const originalAttach = rooms.attach.bind(rooms);
    rooms.attach = async (...args) => {
      const result = await originalAttach(...args);
      snapshotReady = true;
      await barrier;
      return result;
    };
    const socket = io(base + ticket.namespace, {
      transports: ["websocket"],
      reconnection: false,
      forceNew: true,
      auth: { ticket: ticket.ticket, protocolVersion: 3 },
    });
    const received: { name: string; value: any }[] = [];
    socket.on("snapshot", (value) =>
      received.push({ name: "snapshot", value }),
    );
    socket.on("event", (value) => received.push({ name: "event", value }));
    try {
      await until(() => snapshotReady);
      const started = (
        await rooms.stream(u.localId, room.id, "start", {
          url: "https://example.com/snapshot.mp4",
        })
      ).body.stream;
      await until(
        () =>
          [...running.realtime!.connections.values()][0]?.pending.some(
            (e) => e.topic === "stream.started",
          ) ?? false,
      );
      assert.equal(
        received.length,
        0,
        "newer events must not precede bootstrap snapshot",
      );
      release();
      await until(() =>
        received.some(
          (e) => e.name === "event" && e.value.topic === "stream.started",
        ),
      );
      assert.equal(received[0].name, "snapshot");
      assert.equal(received[0].value.stream.state, "EMPTY");
      const later = received.filter((e) => e.name === "event");
      assert.ok(
        later.every((e) => e.value.sequence > received[0].value.sequence),
      );
      assert.equal(
        later.find((e) => e.value.topic === "stream.started")?.value.payload
          .streamSessionId,
        started.sessionId,
      );
    } finally {
      release();
      rooms.attach = originalAttach;
      socket.close();
      await running.stop();
    }
  },
);

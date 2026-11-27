import { logHandledException } from './diagnostics.ts';
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { ApiError } from "./errors.ts";
import { chatPage } from './chat.ts';

export type Row = Record<string, any>;
export type Role = "room" | "voice";
export interface DurableEvent {
  eventId: string;
  roomId: string;
  sequence: number;
  topic: string;
  payload: Row;
}
export const uuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export function normalizeCode(raw: string): string {
  const code = raw
    .trim()
    .toUpperCase()
    .replace(/[ _-]/g, "")
    .replace(/[IL]/g, "1")
    .replace(/O/g, "0");
  if (code.length !== 8 || [...code].some((x) => !alphabet.includes(x)))
    throw new ApiError(404, "ROOM_NOT_FOUND");
  return code;
}
const iso = (v: Date | null) => v?.toISOString();
export function roomDto(r: Row) {
  return {
    id: r.id,
    code: r.code,
    title: r.title,
    ownerIdentityId: r.owner_identity_id,
    createdAt: iso(r.created_at),
    ...(r.ended_at
      ? { endedAt: iso(r.ended_at), tombstoneUntil: iso(r.tombstone_until) }
      : {}),
  };
}
export function summary(m: Row) {
  return {
    membershipId: m.id,
    identityId: m.identity_id,
    displayName: m.display_name,
    avatar: m.avatar,
    isOwner: m.is_owner,
    present: !!m.present && !m.left_at,
  };
}
export function membershipDto(m: Row) {
  return {
    id: m.id,
    roomId: m.room_id,
    identityId: m.identity_id,
    displayName: m.display_name,
    avatar: m.avatar,
    isOwner: m.is_owner,
    joinedAt: iso(m.joined_at),
    ...(m.left_at ? { leftAt: iso(m.left_at) } : {}),
    ...(m.grace_expires_at ? { graceExpiresAt: iso(m.grace_expires_at) } : {}),
    wsConnected: !!m.room_connected,
    voiceConnected: !!m.voice_connected,
  };
}
export function streamDto(s?: Row, roomId = "") {
  return s
    ? {
        id: s.id,
        roomId: s.room_id,
        sessionId: s.session_id,
        revision: Number(s.revision),
        state: s.state,
        url: s.url,
        sourceKind: s.source_kind ?? "URL",
        fileName: s.file_name ?? "",
        startedAt: iso(s.started_at),
        ...(s.aborted_at ? { abortedAt: iso(s.aborted_at) } : {}),
        updatedAt: iso(s.updated_at),
      }
    : {
        id: "",
        roomId,
        sessionId: "",
        revision: 0,
        state: "EMPTY",
        url: "",
        sourceKind: "URL",
        fileName: "",
        startedAt: undefined,
        updatedAt: "0001-01-01T00:00:00Z",
      };
}
// These queries derive presence from unexpired role leases, never persisted boolean flags.
const membersSql = `SELECT m.*, EXISTS(SELECT 1 FROM role_leases l WHERE l.membership_id=m.id AND l.expires_at>clock_timestamp()) AS present,
 EXISTS(SELECT 1 FROM role_leases l WHERE l.membership_id=m.id AND l.role='room' AND l.expires_at>clock_timestamp()) AS room_connected,
 EXISTS(SELECT 1 FROM role_leases l WHERE l.membership_id=m.id AND l.role='voice' AND l.expires_at>clock_timestamp()) AS voice_connected FROM memberships m`;
export class Rooms {
  readonly db: Pool;
  readonly instanceId = randomUUID();
  readonly graceMs: number;
  private available = true;
  drain() {
    this.available = false;
  }
  onMembershipRemoved?: (membershipId: string) => void;
  onRoomClosed?: (roomId: string) => void;
  onStreamChanged?: (roomId: string, stream: ReturnType<typeof streamDto>) => void;
  constructor(db: Pool, options: { graceMs?: number } = {}) {
    this.db = db;
    this.graceMs = options.graceMs ?? 30000;
  }
  async transaction<T>(
    uid: string,
    fn: (c: PoolClient, identity: Row) => Promise<T>,
  ): Promise<T> {
    if (!this.available) throw new ApiError(503, "UNAVAILABLE");
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      const i = await c.query(
        "SELECT * FROM identities WHERE id=$1 FOR UPDATE",
        [uid],
      );
      if (!i.rowCount) throw new ApiError(404, "IDENTITY_NOT_FOUND");
      const value = await fn(c, i.rows[0]);
      if (!this.available) throw new ApiError(503, "UNAVAILABLE");
      await c.query("COMMIT");
      return value;
    } catch (e) {
      logHandledException("rooms.transaction.1", e);
      await c.query("ROLLBACK");
      throw e;
    } finally {
      c.release();
    }
  }
  async lockRoom(c: PoolClient, id: string) {
    if (!uuid(id)) throw new ApiError(404, "ROOM_NOT_FOUND");
    const r = await c.query("SELECT * FROM rooms WHERE id=$1 FOR UPDATE", [id]);
    if (!r.rowCount) throw new ApiError(404, "ROOM_NOT_FOUND");
    return r.rows[0];
  }
  async members(c: PoolClient, roomId: string) {
    return (await c.query(membersSql + " WHERE m.room_id=$1", [roomId])).rows;
  }
  async member(c: PoolClient, r: Row, identityId: string, allowLeft = false) {
    const m = (await this.members(c, r.id)).find(
      (m) => m.identity_id === identityId,
    );
    if (!m || (!allowLeft && m.left_at))
      throw new ApiError(403, "NOT_A_MEMBER");
    if (!allowLeft && r.ended_at) throw new ApiError(409, "ROOM_ENDED");
    return m;
  }
  async event(c: PoolClient, roomId: string, topic: string, payload: Row) {
    const seq = await c.query(
      "UPDATE rooms SET event_sequence=event_sequence+1 WHERE id=$1 RETURNING event_sequence",
      [roomId],
    );
    await c.query(
      "INSERT INTO outbox_events(id,room_id,sequence,topic,payload) VALUES($1,$2,$3,$4,$5)",
      [randomUUID(), roomId, seq.rows[0].event_sequence, topic, payload],
    );
  }
  async ownerEvent(c: PoolClient, m: Row, present: boolean) {
    if (m.is_owner)
      await this.event(c, m.room_id, "owner.presence", {
        present,
        ownerName: m.display_name,
      });
  }
  async closeIfEmpty(c: PoolClient, r: Row): Promise<boolean> {
    const all = await this.members(c, r.id);
    for (const member of all) {
      if (
        !member.left_at &&
        !member.present &&
        member.grace_expires_at?.getTime() <= Date.now()
      )
        await this.remove(c, r, member);
    }
    const held = all.some(
      (member) =>
        !member.left_at &&
        (member.present || member.grace_expires_at?.getTime() > Date.now()),
    );
    if (held || r.ended_at) return !!r.ended_at;
    await c.query(
      "UPDATE rooms SET ended_at=clock_timestamp(),tombstone_until=clock_timestamp()+interval '24 hours' WHERE id=$1",
      [r.id],
    );
    await this.event(c, r.id, "room.closed", { roomId: r.id });
    return true;
  }
  async remove(c: PoolClient, r: Row, m: Row) {
    if (m.left_at) return;
    await c.query("DELETE FROM role_leases WHERE membership_id=$1", [m.id]);
    await c.query(
      "UPDATE memberships SET left_at=clock_timestamp(),grace_expires_at=NULL WHERE id=$1",
      [m.id],
    );
    await this.event(c, r.id, "member.left", {
      member: summary({ ...m, present: false, left_at: new Date() }),
    });
    await this.ownerEvent(c, m, false);
  }
  async expire(c: PoolClient, r: Row) {
    const members = await this.members(c, r.id);
    for (const m of members)
      if (
        !m.left_at &&
        !m.present &&
        m.grace_expires_at &&
        m.grace_expires_at.getTime() <= Date.now()
      )
        await this.remove(c, r, m);
    if (!r.ended_at && (await this.closeIfEmpty(c, r))) r.ended_at = new Date();
  }
  async releaseOld(c: PoolClient, identity: Row, target?: string) {
    const active = await c.query(
      "SELECT room_id FROM memberships WHERE identity_id=$1 AND left_at IS NULL",
      [identity.id],
    );
    if (!active.rowCount || active.rows[0].room_id === target) return;
    const old = await this.lockRoom(c, active.rows[0].room_id);
    const m = await this.member(c, old, identity.id, true);
    if (!m.present && m.grace_expires_at?.getTime() <= Date.now()) {
      await this.remove(c, old, m);
      await this.closeIfEmpty(c, old);
      return;
    }
    throw new ApiError(409, "ALREADY_IN_ROOM", "ALREADY_IN_ROOM", old.code);
  }
  async mutation(
    uid: string,
    operation: string,
    body: unknown,
    key: string | undefined,
    fn: (c: PoolClient, i: Row) => Promise<{ status: number; body: any }>,
  ) {
    if (key !== undefined && (!key || Buffer.byteLength(key) > 128))
      throw new ApiError(400, "INVALID_IDEMPOTENCY_KEY");
    const fingerprint = createHash("sha256")
      .update(JSON.stringify([operation, body]))
      .digest("hex");
    return this.transaction(uid, async (c, i) => {
      if (key) {
        const cached = await c.query(
          "SELECT * FROM idempotency_records WHERE identity_id=$1 AND key=$2 AND expires_at>clock_timestamp()",
          [i.id, key],
        );
        if (cached.rowCount) {
          if (cached.rows[0].fingerprint !== fingerprint)
            throw new ApiError(409, "IDEMPOTENCY_MISMATCH");
          return {
            status: cached.rows[0].status,
            body: cached.rows[0].response,
            replayed: true,
          };
        }
      }
      const response = await fn(c, i);
      if (key)
        await c.query(
          "INSERT INTO idempotency_records(identity_id,key,fingerprint,status,response,expires_at) VALUES($1,$2,$3,$4,$5,clock_timestamp()+interval '10 minutes') ON CONFLICT(identity_id,key) DO UPDATE SET fingerprint=EXCLUDED.fingerprint,status=EXCLUDED.status,response=EXCLUDED.response,expires_at=EXCLUDED.expires_at",
          [i.id, key, fingerprint, response.status, response.body],
        );
      return response;
    });
  }
  async create(uid: string, title: unknown, key?: string) {
    if (title !== undefined && typeof title !== "string")
      throw new ApiError(400, "INVALID_JSON");
    return this.mutation(
      uid,
      "create",
      { title: title ?? "" },
      key,
      async (c, i) => {
        await this.releaseOld(c, i);
        const id = randomUUID();
        let code = "";
        // Rejection-free unbiased 5-bit alphabet; DB uniqueness handles the rare collision.
        for (let attempt = 0; attempt < 10; attempt++) {
          code = [...randomBytes(8)].map((x) => alphabet[x & 31]).join("");
          const result = await c.query(
            "INSERT INTO rooms(id,code,title,owner_identity_id) VALUES($1,$2,$3,$4) ON CONFLICT(code) DO NOTHING RETURNING *",
            [
              id,
              code,
              (title as string | undefined)?.trim() ||
                (i.language === "fa" ? `دورهمی ${i.name.trim() || "مهمان"}` : `${i.name.trim() || "Guest"}\'s party`),
              i.id,
            ],
          );
          if (result.rowCount) break;
          if (attempt === 9) throw new ApiError(500, "INTERNAL_ERROR");
        }
        const r = await this.lockRoom(c, id);
        const m = await this.insertMember(c, r, i, true);
        await this.event(c, id, "room.created", {
          roomId: id,
          code,
          title: r.title,
          owner: summary(m),
        });
        return {
          status: 201,
          body: { room: roomDto(r), membership: membershipDto(m) },
        };
      },
    );
  }
  async insertMember(c: PoolClient, r: Row, i: Row, owner: boolean) {
    const result = await c.query(
      `INSERT INTO memberships(id,room_id,identity_id,display_name,avatar,is_owner,grace_expires_at) VALUES($1,$2,$3,$4,$5,$6,clock_timestamp()+$7*interval '1 millisecond')
  ON CONFLICT(room_id,identity_id) DO UPDATE SET display_name=EXCLUDED.display_name,avatar=EXCLUDED.avatar,left_at=NULL,joined_at=clock_timestamp(),grace_expires_at=EXCLUDED.grace_expires_at RETURNING *`,
      [randomUUID(), r.id, i.id, i.name, i.avatar, owner, this.graceMs],
    );
    return result.rows[0];
  }
  async join(uid: string, rawCode: string, key?: string) {
    const code = normalizeCode(rawCode);
    return this.mutation(uid, `join:${code}`, {}, key, async (c, i) => {
      const lookup = await c.query("SELECT id FROM rooms WHERE code=$1", [
        code,
      ]);
      if (!lookup.rowCount) throw new ApiError(404, "ROOM_NOT_FOUND");
      const roomId = lookup.rows[0].id;
      const held = await c.query(
        "SELECT room_id FROM memberships WHERE identity_id=$1 AND left_at IS NULL",
        [i.id],
      );
      await c.query(
        "SELECT id FROM rooms WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE",
        [[roomId, ...held.rows.map((m) => m.room_id)]],
      );
      await this.releaseOld(c, i, roomId);
      const r = await this.lockRoom(c, roomId);
      await this.expire(c, r);
      if (r.ended_at) throw new ApiError(409, "ROOM_ENDED");
      const all = await this.members(c, roomId);
      const existing = all.find((m) => m.identity_id === i.id && !m.left_at);
      if (existing)
        return {
          status: 200,
          body: { room: roomDto(r), membership: membershipDto(existing) },
        };
      if (
        i.id !== r.owner_identity_id &&
        all.filter((m) => !m.is_owner && !m.left_at).length >= 7
      )
        throw new ApiError(409, "ROOM_FULL");
      const m = await this.insertMember(c, r, i, i.id === r.owner_identity_id);
      await this.event(c, r.id, "member.joined", { member: summary(m) });
      return {
        status: 200,
        body: { room: roomDto(r), membership: membershipDto(m) },
      };
    });
  }
  async preview(uid: string, rawCode: string) {
    const code = normalizeCode(rawCode);
    return this.transaction(uid, async (c, i) => {
      const lookup = await c.query("SELECT id FROM rooms WHERE code=$1", [
        code,
      ]);
      if (!lookup.rowCount) throw new ApiError(404, "ROOM_NOT_FOUND");
      const r = await this.lockRoom(c, lookup.rows[0].id);
      await this.expire(c, r);
      const all = await this.members(c, r.id);
      const owner = all.find((m) => m.is_owner);
      const active = all.filter((m) => !m.left_at);
      const state = await c.query(
        "SELECT state FROM streams WHERE room_id=$1",
        [r.id],
      );
      return {
        code: r.code,
        title: r.title,
        ownerName: owner?.display_name ?? "",
        ownerPresent: !!owner?.present && !owner?.left_at,
        participantCount: active.length,
        availability: r.ended_at
          ? "ENDED"
          : i.id !== r.owner_identity_id &&
              active.filter((m) => !m.is_owner).length >= 7
            ? "FULL"
            : "OPEN",
        streamState: state.rows[0]?.state ?? "EMPTY",
      };
    });
  }
  async snapshot(uid: string, id: string) {
    return this.transaction(uid, async (c, i) => {
      const r = await this.lockRoom(c, id);
      await this.expire(c, r);
      await this.member(c, r, i.id);
      return this.snapshotLocked(c, r);
    });
  }
  async snapshotLocked(c: PoolClient, r: Row) {
    const all = await this.members(c, r.id);
    const s = await c.query("SELECT * FROM streams WHERE room_id=$1", [r.id]);
    const seq = await c.query("SELECT event_sequence FROM rooms WHERE id=$1", [
      r.id,
    ]);
    return {
      room: roomDto(r),
      members: all.filter((m) => !m.left_at).map(summary),
      stream: streamDto(s.rows[0], r.id),
      sequence: Number(seq.rows[0].event_sequence),
      chat: await chatPage(c, r.id),
    };
  }
  async leave(uid: string, id: string) {
    const result = await this.transaction(uid, async (c, i) => {
      const r = await this.lockRoom(c, id);
      const m = await this.member(c, r, i.id, true);
      await this.remove(c, r, m);
      const roomClosed = await this.closeIfEmpty(c, r);
      return { roomClosed, membershipId: m.id };
    });
    this.onMembershipRemoved?.(result.membershipId);
    if (result.roomClosed) this.onRoomClosed?.(id);
    return { roomClosed: result.roomClosed };
  }
  async stream(
    uid: string,
    id: string,
    action: "start" | "abort",
    body: Row = {},
    key?: string,
  ) {
    const local = body.sourceKind === "LOCAL_FILE";
    if (action === "start" && body.sourceKind !== undefined && !["URL", "LOCAL_FILE"].includes(body.sourceKind)) throw new ApiError(400, "INVALID_STREAM_SOURCE");
    if (action === "start" && local) {
      if (typeof body.fileName !== "string" || !body.fileName.trim() || Buffer.byteLength(body.fileName) > 512 || /[\\/\x00-\x1f\x7f]/.test(body.fileName) || body.url) throw new ApiError(400, "INVALID_FILE_NAME");
    }
    if (action === "start" && !local) {
      if (
        typeof body.url !== "string" ||
        Buffer.byteLength(body.url.trim()) > 2048
      )
        throw new ApiError(400, "INVALID_STREAM_URL");
      try {
        const url = new URL(body.url.trim());
        if (url.protocol !== "https:" || !url.hostname) throw 0;
      } catch (handledError) {
        logHandledException("rooms.stream.2", handledError);
        throw new ApiError(400, "INVALID_STREAM_URL");
      }
    }
    const result = await this.mutation(
      uid,
      `${action}:${id}`,
      body,
      key,
      async (c, i) => {
        const r = await this.lockRoom(c, id);
        await this.expire(c, r);
        const m = await this.member(c, r, i.id);
        if (!m.is_owner) throw new ApiError(403, "FORBIDDEN");
        if (!m.present) throw new ApiError(403, "OWNER_ABSENT");
        const prior = (
          await c.query("SELECT * FROM streams WHERE room_id=$1", [id])
        ).rows[0];
        if (
          body.revision !== undefined &&
          (!Number.isSafeInteger(body.revision) ||
            body.revision !== Number(prior?.revision ?? 0))
        )
          throw new ApiError(409, "STALE_STREAM_REVISION");
        if (action === "start" && prior?.state === "ACTIVE" && !(body.replace === true && body.revision === Number(prior.revision)))
          throw new ApiError(
            409,
            "STREAM_ACTIVE",
            "Abort the active stream before replacing it",
          );
        if (action === "abort" && prior?.state !== "ACTIVE")
          throw new ApiError(409, "NO_ACTIVE_STREAM");
        let s: Row;
        if (action === "start")
          s = (
            await c.query(
              `INSERT INTO streams(room_id,id,session_id,revision,state,url,source_kind,file_name,started_at,updated_at) VALUES($1,$2,$3,$4,'ACTIVE',$5,$6,$7,clock_timestamp(),clock_timestamp()) ON CONFLICT(room_id) DO UPDATE SET id=EXCLUDED.id,session_id=EXCLUDED.session_id,revision=EXCLUDED.revision,state='ACTIVE',url=EXCLUDED.url,source_kind=EXCLUDED.source_kind,file_name=EXCLUDED.file_name,started_at=EXCLUDED.started_at,aborted_at=NULL,updated_at=clock_timestamp() RETURNING *`,
              [
                id,
                randomUUID(),
                randomUUID(),
                Number(prior?.revision ?? 0) + 1,
                local ? "" : body.url.trim(),
                local ? "LOCAL_FILE" : "URL",
                local ? body.fileName.trim() : "",
              ],
            )
          ).rows[0];
        else
          s = (
            await c.query(
              "UPDATE streams SET state='ABORTED',revision=revision+1,aborted_at=clock_timestamp(),updated_at=clock_timestamp() WHERE room_id=$1 RETURNING *",
              [id],
            )
          ).rows[0];
        await this.event(
          c,
          id,
          `stream.${action === "start" ? "started" : "aborted"}`,
          {
            roomId: id,
            streamSessionId: s.session_id,
            revision: Number(s.revision),
            state: s.state,
            url: s.url,
            sourceKind: s.source_kind ?? "URL",
            fileName: s.file_name ?? "",
            ...(action === "start"
              ? { startedAt: iso(s.started_at) }
              : { abortedAt: iso(s.aborted_at) }),
          },
        );
        return {
          status: action === "start" ? 201 : 200,
          body: { stream: streamDto(s) },
        };
      },
    );
    if (!("replayed" in result)) this.onStreamChanged?.(id, result.body.stream);
    return result;
  }
  async attach(
    uid: string,
    roomId: string,
    membershipId: string,
    role: Role,
    generation: string,
  ) {
    return this.transaction(uid, async (c, i) => {
      const r = await this.lockRoom(c, roomId);
      await this.expire(c, r);
      const m = await this.member(c, r, i.id);
      if (m.id !== membershipId) throw new ApiError(401, "INVALID_TICKET");
      await c.query(
        `INSERT INTO role_leases(membership_id,role,generation,instance_id,expires_at) VALUES($1,$2,$3,$4,clock_timestamp()+interval '30 seconds') ON CONFLICT(membership_id,role) DO UPDATE SET generation=EXCLUDED.generation,instance_id=EXCLUDED.instance_id,expires_at=EXCLUDED.expires_at`,
        [m.id, role, generation, this.instanceId],
      );
      await c.query(
        "UPDATE memberships SET grace_expires_at=NULL WHERE id=$1",
        [m.id],
      );
      if (!m.present) {
        await this.event(c, roomId, "member.returned", {
          member: summary({ ...m, present: true }),
        });
        await this.ownerEvent(c, m, true);
      }
      return {
        membership: summary({ ...m, present: true }),
        snapshot: await this.snapshotLocked(c, r),
      };
    });
  }
  async detach(
    uid: string,
    roomId: string,
    membershipId: string,
    role: Role,
    generation: string,
  ) {
    return this.transaction(uid, async (c, i) => {
      const r = await this.lockRoom(c, roomId);
      const m = await this.member(c, r, i.id, true);
      const deleted = await c.query(
        "DELETE FROM role_leases WHERE membership_id=$1 AND role=$2 AND generation=$3 AND instance_id=$4 RETURNING *",
        [membershipId, role, generation, this.instanceId],
      );
      if (!deleted.rowCount || m.left_at) return;
      const current = await this.member(c, r, i.id, true);
      if (!current.present) {
        await c.query(
          "UPDATE memberships SET grace_expires_at=clock_timestamp()+$2*interval '1 millisecond' WHERE id=$1",
          [m.id, this.graceMs],
        );
        await this.event(c, roomId, "member.absent", {
          member: summary({ ...m, present: false }),
        });
        await this.ownerEvent(c, m, false);
      }
    });
  }
  async active(
    uid: string,
    roomId: string,
    membershipId: string,
    role: Role,
    generation: string,
  ) {
    return this.transaction(uid, async (c, i) => {
      const r = await this.lockRoom(c, roomId);
      const m = await this.member(c, r, i.id);
      if (m.id !== membershipId) throw new ApiError(403, "NOT_A_MEMBER");
      const lease = await c.query(
        "SELECT 1 FROM role_leases WHERE membership_id=$1 AND role=$2 AND generation=$3 AND instance_id=$4 AND expires_at>clock_timestamp()",
        [membershipId, role, generation, this.instanceId],
      );
      if (!lease.rowCount) throw new ApiError(401, "SESSION_EXPIRED");
      return {
        membership: summary(m),
        stream: streamDto(
          (await c.query("SELECT * FROM streams WHERE room_id=$1", [roomId]))
            .rows[0],
          roomId,
        ),
      };
    });
  }
  async refreshLease(membershipId: string, role: Role, generation: string) {
    const r = await this.db.query(
      "UPDATE role_leases SET expires_at=clock_timestamp()+interval '30 seconds' WHERE membership_id=$1 AND role=$2 AND generation=$3 AND instance_id=$4 AND expires_at>clock_timestamp() RETURNING membership_id",
      [membershipId, role, generation, this.instanceId],
    );
    return !!r.rowCount;
  }
  async renewLeases(
    leases: { membershipId: string; role: Role; generation: string }[],
  ): Promise<Set<string>> {
    if (!leases.length) return new Set();
    const result = await this.db.query(
      `UPDATE role_leases l SET expires_at=clock_timestamp()+interval '30 seconds'
      FROM jsonb_to_recordset($1::jsonb) AS desired("membershipId" uuid,role text,generation uuid)
      WHERE l.membership_id=desired."membershipId" AND l.role=desired.role AND l.generation=desired.generation
      AND l.instance_id=$2 AND l.expires_at>clock_timestamp() RETURNING l.membership_id`,
      [JSON.stringify(leases), this.instanceId],
    );
    return new Set(result.rows.map((row) => row.membership_id));
  }
  async ticketMembership(uid: string, roomId: string) {
    return this.transaction(uid, async (c, i) => {
      const r = await this.lockRoom(c, roomId);
      await this.expire(c, r);
      return this.member(c, r, i.id);
    });
  }
  async revoke(uid: string) {
    const active = await this.db.query(
      "SELECT m.room_id FROM memberships m JOIN identities i ON i.id=m.identity_id WHERE i.id=$1 AND m.left_at IS NULL",
      [uid],
    );
    for (const m of active.rows) await this.leave(uid, m.room_id);
  }
  // Single-node runtime startup discards every old role lease. It starts grace rather than restoring phantom presence.
  async recover() {
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      await c.query("DELETE FROM role_leases");
      await c.query(
        "UPDATE memberships SET grace_expires_at=clock_timestamp()+$1*interval '1 millisecond' WHERE left_at IS NULL AND grace_expires_at IS NULL",
        [this.graceMs],
      );
      await c.query("COMMIT");
    } catch (e) {
      logHandledException("rooms.recover.3", e);
      await c.query("ROLLBACK");
      throw e;
    } finally {
      c.release();
    }
  }
  async sweep() {
    if (!this.available) throw new ApiError(503, "UNAVAILABLE");
    const affected = await this.db.query(
      `SELECT DISTINCT i.id AS identity_id,m.room_id FROM memberships m JOIN identities i ON i.id=m.identity_id WHERE m.left_at IS NULL AND (m.grace_expires_at<=clock_timestamp() OR EXISTS(SELECT 1 FROM role_leases l WHERE l.membership_id=m.id AND l.expires_at<=clock_timestamp())) LIMIT 100`,
    );
    for (const a of affected.rows) {
      const removedId = await this.transaction(a.identity_id, async (c, i) => {
        const r = await this.lockRoom(c, a.room_id);
        const m = await this.member(c, r, i.id, true);
        const removed = await c.query(
          "DELETE FROM role_leases WHERE membership_id=$1 AND expires_at<=clock_timestamp() RETURNING *",
          [m.id],
        );
        const current = await this.member(c, r, i.id, true);
        if (removed.rowCount && !current.present && !m.left_at) {
          await c.query(
            "UPDATE memberships SET grace_expires_at=clock_timestamp()+$2*interval '1 millisecond' WHERE id=$1",
            [m.id, this.graceMs],
          );
          await this.event(c, r.id, "member.absent", {
            member: summary({ ...m, present: false }),
          });
          await this.ownerEvent(c, m, false);
          return;
        }
        if (
          !m.left_at &&
          !current.present &&
          m.grace_expires_at?.getTime() <= Date.now()
        ) {
          await this.remove(c, r, m);
          await this.closeIfEmpty(c, r);
          return m.id;
        }
      });
      if (removedId) this.onMembershipRemoved?.(removedId);
    }
    if (!this.available) throw new ApiError(503, "UNAVAILABLE");
    await this.db.query(
      "DELETE FROM idempotency_records WHERE expires_at<=clock_timestamp()",
    );
    await this.db.query(
      "DELETE FROM rooms WHERE tombstone_until<=clock_timestamp()",
    );
  }
}

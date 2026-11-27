import type { PoolClient } from 'pg';
import { ApiError } from './errors.ts';
import type { Rooms, Row } from './rooms.ts';

export function chatInput(body: unknown): { messageId: string; text: string } {
  const value = body as Record<string, unknown> | null;
  if (!value || typeof value.messageId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.messageId) || typeof value.text !== 'string')
    throw new ApiError(400, 'INVALID_CHAT_MESSAGE');
  const text = value.text.replace(/\r\n?/g, '\n').trim();
  if (!text || text.length > 500 || /[\u0000-\u0008\u000b-\u001f\u007f]/u.test(text) || !text.isWellFormed()) throw new ApiError(400, 'INVALID_CHAT_MESSAGE');
  return { messageId: value.messageId.toLowerCase(), text };
}
export function chatCursor(before: unknown): number | undefined {
  if (before === undefined) return undefined;
  if (typeof before !== 'string' || !/^[1-9][0-9]*$/.test(before) || !Number.isSafeInteger(Number(before))) throw new ApiError(400, 'INVALID_CHAT_CURSOR');
  return Number(before);
}
export function chatMessage(row: Row) {
  return { id: row.id, roomId: row.room_id, identityId: row.identity_id, membershipId: row.membership_id,
    displayName: row.display_name, avatar: row.avatar, text: row.text, createdAt: row.created_at.toISOString(), sequence: Number(row.sequence) };
}
export async function chatPage(c: PoolClient, roomId: string, before?: number) {
  const rows = await c.query('SELECT * FROM chat_messages WHERE room_id=$1 AND ($2::bigint IS NULL OR sequence<$2) ORDER BY sequence DESC LIMIT 51', [roomId, before ?? null]);
  return { messages: rows.rows.slice(0, 50).reverse().map(chatMessage), hasMore: rows.rows.length > 50 };
}
export async function readChat(rooms: Rooms, uid: string, roomId: string, before: unknown) {
  const cursor = chatCursor(before);
  return rooms.transaction(uid, async (c, identity) => {
    const room = await rooms.lockRoom(c, roomId);
    await rooms.expire(c, room);
    await rooms.member(c, room, identity.id);
    return chatPage(c, roomId, cursor);
  });
}
export async function sendChat(rooms: Rooms, uid: string, roomId: string, body: unknown) {
  const input = chatInput(body);
  return rooms.transaction(uid, async (c, identity) => {
    const room = await rooms.lockRoom(c, roomId);
    await rooms.expire(c, room);
    const member = await rooms.member(c, room, identity.id);
    const existing = await c.query('SELECT * FROM chat_messages WHERE room_id=$1 AND id=$2', [roomId, input.messageId]);
    if (existing.rowCount) {
      const row = existing.rows[0];
      if (row.identity_id !== identity.id || row.text !== input.text) throw new ApiError(409, 'CHAT_MESSAGE_CONFLICT');
      return { message: chatMessage(row) };
    }
    const recent = await c.query("SELECT count(*)::int AS count FROM chat_messages WHERE room_id=$1 AND identity_id=$2 AND created_at>clock_timestamp()-interval '10 seconds'", [roomId, identity.id]);
    if (recent.rows[0].count >= 10) throw new ApiError(429, 'RATE_LIMITED');
    // lockRoom serializes all sequence writers; the outbox event below allocates this same next sequence.
    // expire() may have emitted membership events after lockRoom captured its row.
    const current = await c.query('SELECT event_sequence FROM rooms WHERE id=$1', [roomId]);
    const sequence = Number(current.rows[0].event_sequence) + 1;
    if (!Number.isSafeInteger(sequence)) throw new ApiError(503, 'UNAVAILABLE');
    const inserted = await c.query('INSERT INTO chat_messages(room_id,id,identity_id,membership_id,display_name,avatar,text,sequence) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [roomId, input.messageId, identity.id, member.id, identity.name, identity.avatar, input.text, sequence]);
    const message = chatMessage(inserted.rows[0]);
    await rooms.event(c, roomId, 'chat.message', { message });
    return { message };
  });
}

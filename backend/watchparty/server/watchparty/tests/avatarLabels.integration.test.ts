import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { config } from '../config.ts';
import { pool, migrate } from '../db.ts';
import { createAuth } from '../auth.ts';
import { Rooms } from '../rooms.ts';
import { sendChat } from '../chat.ts';

test('character renames preserve saved avatars, credentials, ownership and historical messages', { skip: process.env.WATCHPARTY_INTEGRATION !== 'true' }, async () => {
  const db = pool(config(process.env).databaseUrl);
  try {
    await migrate(db);
    const auth = await createAuth(db);
    const rooms = new Rooms(db);
    const labels = [
      ['cloud', 'Gamer TV', 'TV Boy', 'پسر تلویزیونی'],
      ['ember', 'Alien Scientist', 'Alien Employee', 'کارمند فضایی'],
      ['orbit', 'Coffee Wolf', 'Wolf Barista', 'گرگ باریستا'],
    ];
    for (const [avatar, legacy, english, persian] of labels) for (const language of ['en', 'fa']) {
      const expected = language === 'fa' ? persian : english;
      const session = await auth.create({ name: 'Ignored', avatar, language });
      assert.equal(session.identity.name, expected);
      const admission = await rooms.create(session.identity.id, 'Character rename', randomUUID());
      const roomId = admission.body.room.id;
      const message = (await sendChat(rooms, session.identity.id, roomId, { messageId: randomUUID(), text: 'Saved history' })).message;
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        await client.query('UPDATE identities SET name=$2 WHERE id=$1', [session.identity.id, legacy]);
        await client.query('UPDATE memberships SET display_name=$2 WHERE identity_id=$1', [session.identity.id, legacy]);
        await client.query('UPDATE chat_messages SET display_name=$2 WHERE id=$1', [message.id, legacy]);
        await client.query(await readFile(new URL('../migrations/0009_avatar_character_labels.sql', import.meta.url), 'utf8'));
        const identity = (await client.query('SELECT * FROM identities WHERE id=$1', [session.identity.id])).rows[0];
        assert.equal(identity.avatar, avatar);
        assert.equal(identity.name, expected);
        const member = (await client.query('SELECT * FROM memberships WHERE id=$1', [message.membershipId])).rows[0];
        assert.equal(member.display_name, expected);
        assert.equal(member.identity_id, session.identity.id);
        assert.equal(member.is_owner, true);
        assert.equal((await client.query('SELECT display_name FROM chat_messages WHERE id=$1', [message.id])).rows[0].display_name, legacy);
      } finally { await client.query('ROLLBACK'); client.release(); }
      assert.equal((await auth.refresh(session.refreshToken)).identity.id, session.identity.id);
    }
  } finally { await db.end(); }
});

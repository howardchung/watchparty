import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { config } from '../config.ts';
import { pool, migrate, IdentityStore } from '../db.ts';
import { createAuth } from '../auth.ts';
import { Rooms } from '../rooms.ts';
import { sendChat } from '../chat.ts';

test('duplicate avatar names preserve distinct owners, memberships and senders; migration retains identity and historical chat', {skip: process.env.WATCHPARTY_INTEGRATION !== 'true'}, async () => {
  const db = pool(config(process.env).databaseUrl);
  try {
    await migrate(db);
    const auth = await createAuth(db);
    const store = new IdentityStore(db);
    const rooms = new Rooms(db);
    const a = await auth.create({name:'Ignored custom name',avatar:'MINT',language:'en'});
    const b = await auth.create({name:'Another custom name',avatar:'mint',language:'en'});
    const persian = await auth.create({name:'Ignored',avatar:'mint',language:'fa'});
    assert.equal(persian.identity.name,'قورباغهٔ جادوگر');
    const persianRoom = (await rooms.create(persian.identity.id,'',randomUUID())).body.room;
    assert.equal(persianRoom.title,'دورهمی قورباغهٔ جادوگر');
    assert.equal((await auth.refresh(persian.refreshToken)).identity.name,'قورباغهٔ جادوگر');
    assert.equal(a.identity.name,'Frog Wizard');
    assert.equal(a.identity.name,b.identity.name);
    assert.notEqual(a.identity.id,b.identity.id);
    assert.equal((await auth.verify(a.accessToken)).uid,a.identity.id);
    assert.equal((await auth.verify(b.accessToken)).uid,b.identity.id);
    const admission = await rooms.create(a.identity.id,'Duplicate names',randomUUID());
    const room = admission.body.room;
    assert.equal(room.title,'Duplicate names');
    await rooms.join(b.identity.id,room.code,randomUUID());
    const snapshot = await rooms.snapshot(b.identity.id,room.id);
    assert.equal(snapshot.members.length,2);
    assert.equal(new Set(snapshot.members.map(m=>m.membershipId)).size,2);
    assert.ok(snapshot.members.every(m=>m.displayName === 'Frog Wizard'));
    assert.equal(snapshot.members.find(m=>m.isOwner)?.identityId,a.identity.id);
    const first = (await sendChat(rooms,a.identity.id,room.id,{messageId:randomUUID(),text:'Owner'})).message;
    const second = (await sendChat(rooms,b.identity.id,room.id,{messageId:randomUUID(),text:'Guest'})).message;
    assert.equal(first.displayName,second.displayName);
    assert.notEqual(first.identityId,second.identityId);
    const updated = await store.update(b.identity.id,{name:'Ignored again',avatar:'berry',language:'fa'});
    assert.equal(updated.name,'کاپیتان اختاپوس');
    assert.equal(updated.id,b.identity.id);
    const restored = await store.update(b.identity.id,{name:'Ignored',avatar:'berry',language:'en'});
    assert.equal(restored.name,'Captain Octopus');
    assert.equal(restored.id,b.identity.id);
    // Simulate rows from before DD-054, then apply the exact migration in a rollback transaction.
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query("UPDATE identities SET name='Legacy name',avatar='MINT',language='fa' WHERE id=$1",[a.identity.id]);
      await client.query("UPDATE memberships SET display_name='Legacy name',avatar='MINT' WHERE identity_id=$1",[a.identity.id]);
      await client.query("UPDATE chat_messages SET display_name='Historical sender' WHERE room_id=$1 AND id=$2",[room.id,first.id]);
      await client.query(await readFile(new URL('../migrations/0007_avatar_names.sql',import.meta.url),'utf8'));
      await client.query(await readFile(new URL('../migrations/0008_localized_avatar_names.sql',import.meta.url),'utf8'));
      assert.equal((await client.query('SELECT name FROM identities WHERE id=$1',[a.identity.id])).rows[0].name,'قورباغهٔ جادوگر');
      const membership = (await client.query('SELECT * FROM memberships WHERE room_id=$1 AND identity_id=$2',[room.id,a.identity.id])).rows[0];
      assert.equal(membership.display_name,'قورباغهٔ جادوگر');
      assert.equal(membership.id,first.membershipId);
      assert.equal(membership.is_owner,true);
      assert.equal((await client.query('SELECT display_name FROM chat_messages WHERE room_id=$1 AND id=$2',[room.id,first.id])).rows[0].display_name,'Historical sender');
    } finally { await client.query('ROLLBACK'); client.release(); }
    assert.equal((await auth.refresh(a.refreshToken)).identity.id,a.identity.id);
    assert.equal((await auth.verify(b.accessToken)).uid,b.identity.id);
  } finally { await db.end(); }
});

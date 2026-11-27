import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { io, type Socket } from 'socket.io-client';
import { start } from '../main.ts';
import { config } from '../config.ts';
import { sendChat, readChat } from '../chat.ts';
import { Rooms } from '../rooms.ts';

test('chat HTTP durability, room isolation, ordered realtime, recovery pages, retries, rate limits and purge', {skip:process.env.WATCHPARTY_INTEGRATION !== 'true',timeout:30000}, async () => {
  const app = await start({...config(),port:0});
  const base = `http://127.0.0.1:${(app.server!.address() as {port:number}).port}`;
  const sockets: Socket[] = [];
  const roomIds: string[] = [];
  const connect = async (user: any, roomId: string) => {
    const ticket = await app.realtime!.ticket(user.identity.id,await app.auth!.verify(user.accessToken),roomId);
    const socket = io(base+ticket.namespace,{transports:['websocket'],reconnection:false,auth:{ticket:ticket.ticket,protocolVersion:3},forceNew:true});
    sockets.push(socket);
    await new Promise<void>((resolve,reject) => { socket.once('snapshot',()=>resolve());socket.once('connect_error',reject); });
    return socket;
  };
  try {
    const owner = await app.auth!.create({name:'Nika',avatar:'comet',language:'en'});
    const guest = await app.auth!.create({name:'Jo',avatar:'berry',language:'fa'});
    const outsider = await app.auth!.create({name:'Other',avatar:'mint',language:'en'});
    const room = (await app.rooms!.create(owner.identity.id,'Chat integration')).body.room;
    roomIds.push(room.id);
    await app.rooms!.join(guest.identity.id,room.code);
    const ownerSocket = await connect(owner,room.id);
    const guestSocket = await connect(guest,room.id);
    const events:any[]=[]; guestSocket.on('event',event=>events.push(event));
    const path=`/v1/rooms/${room.id}/chat/messages`;
    const request = (user:any,method='GET',body?:unknown,suffix='') => fetch(base+path+suffix,{method,headers:{Authorization:`Bearer ${user?.accessToken || 'invalid'}`,...(body ? {'Content-Type':'application/json'} : {})},body:body ? JSON.stringify(body) : undefined});
    assert.equal((await request(null)).status,401);
    assert.equal((await request(outsider)).status,403);
    const payload={messageId:randomUUID(),text:'سلام 🍿\nMovie night'};
    assert.equal((await request(outsider,'POST',payload)).status,403);
    const response=await request(owner,'POST',payload);
    assert.equal(response.status,201); assert.equal(response.headers.get('cache-control'),'no-store');
    const accepted=(await response.json()).message;
    assert.equal(accepted.displayName,'Ice Queen'); assert.equal(accepted.identityId,owner.identity.id);
    const until=async(check:()=>boolean)=>{for(let n=0;n<150;n++){if(check())return; await new Promise(r=>setTimeout(r,20));}assert.fail('event not delivered');};
    await until(()=>events.some(e=>e.topic==='chat.message'));
    const event=events.find(e=>e.topic==='chat.message');
    assert.equal(event.sequence,accepted.sequence); assert.deepEqual(event.payload.message,accepted);
    const duplicate=await Promise.all(Array.from({length:6},()=>sendChat(app.rooms!,owner.identity.id,room.id,payload)));
    assert.ok(duplicate.every(result=>JSON.stringify(result.message)===JSON.stringify(accepted)));
    assert.equal((await app.db.query("SELECT count(*)::int AS n FROM outbox_events WHERE room_id=$1 AND topic='chat.message'",[room.id])).rows[0].n,1);
    // A separately constructed service sees the durable retry, not a process cache.
    assert.deepEqual((await sendChat(new Rooms(app.db),owner.identity.id,room.id,payload)).message,accepted);
    assert.equal((await request(owner,'POST',{...payload,text:'changed'})).status,409);
    assert.equal((await request(guest,'POST',payload)).status,409);
    assert.equal((await request(owner,'POST',{messageId:randomUUID(),text:' '})).status,400);
    assert.equal((await request(owner,'GET',undefined,'?before=1e3')).status,400);
    // Event insertion failure must roll back both the message and room sequence.
    const original=app.rooms!.event.bind(app.rooms!);
    const rollbackId=randomUUID();
    app.rooms!.event=async()=>{throw new Error('injected outbox failure');};
    await assert.rejects(sendChat(app.rooms!,owner.identity.id,room.id,{messageId:rollbackId,text:'Rollback'}));
    app.rooms!.event=original;
    assert.equal((await app.db.query('SELECT 1 FROM chat_messages WHERE room_id=$1 AND id=$2',[room.id,rollbackId])).rowCount,0);
    for(let n=0;n<9;n++) await sendChat(app.rooms!,owner.identity.id,room.id,{messageId:randomUUID(),text:`Message ${n}`});
    await assert.rejects(sendChat(app.rooms!,owner.identity.id,room.id,{messageId:randomUUID(),text:'Over budget'}),{code:'RATE_LIMITED'});
    assert.deepEqual((await sendChat(app.rooms!,owner.identity.id,room.id,payload)).message,accepted);
    // Age only this test room's messages to seed more than a bootstrap page without sleeping.
    for(let n=0;n<46;n++){
      await app.db.query("UPDATE chat_messages SET created_at=clock_timestamp()-interval '20 seconds' WHERE room_id=$1",[room.id]);
      await sendChat(app.rooms!,owner.identity.id,room.id,{messageId:randomUUID(),text:`History ${n}`});
    }
    const snapshot=await app.rooms!.snapshot(guest.identity.id,room.id);
    assert.equal(snapshot.chat.messages.length,50);assert.equal(snapshot.chat.hasMore,true);
    assert.ok(snapshot.chat.messages.every(m=>m.sequence<=snapshot.sequence));
    const earlier=await readChat(app.rooms!,guest.identity.id,room.id,String(snapshot.chat.messages[0].sequence));
    assert.equal(earlier.messages.length,6);assert.equal(earlier.hasMore,false);
    assert.equal(new Set([...earlier.messages,...snapshot.chat.messages].map(m=>m.id)).size,56);
    // Expiring another member emits its own events before the chat sequence is allocated.
    await app.rooms!.join(outsider.identity.id,room.code);
    await app.db.query("UPDATE memberships SET grace_expires_at=clock_timestamp()-interval '1 second' WHERE room_id=$1 AND identity_id=$2",[room.id,outsider.identity.id]);
    const afterExpiry=(await sendChat(app.rooms!,guest.identity.id,room.id,{messageId:randomUUID(),text:'After membership expiry'})).message;
    const expiryEvent=(await app.db.query("SELECT sequence,payload FROM outbox_events WHERE room_id=$1 AND topic='chat.message' AND payload->'message'->>'id'=$2",[room.id,afterExpiry.id])).rows[0];
    assert.equal(Number(expiryEvent.sequence),afterExpiry.sequence);
    assert.equal(expiryEvent.payload.message.sequence,afterExpiry.sequence);
    // HTTP native-style send works with no stream and no voice session.
    assert.equal((await request(guest,'POST',{messageId:randomUUID(),text:'Hello from another client'})).status,201);
    await app.rooms!.leave(owner.identity.id,room.id);
    assert.equal((await request(owner)).status,403);
    assert.equal((await request(owner,'POST',payload)).status,403);
    assert.equal((await request(guest,'POST',{messageId:randomUUID(),text:'Owner away still chatting'})).status,201);
    await app.rooms!.leave(guest.identity.id,room.id);
    assert.equal((await request(guest)).status,403);
    ownerSocket.close();guestSocket.close();
    await app.db.query("UPDATE rooms SET tombstone_until=clock_timestamp()-interval '1 second' WHERE id=$1",[room.id]);
    await app.rooms!.sweep();
    assert.equal((await app.db.query('SELECT 1 FROM chat_messages WHERE room_id=$1',[room.id])).rowCount,0);
    assert.equal((await app.db.query('SELECT 1 FROM outbox_events WHERE room_id=$1',[room.id])).rowCount,0);
  } finally {
    sockets.forEach(s=>s.close());
    await app.db.query('DELETE FROM rooms WHERE id=ANY($1::uuid[])',[roomIds]);
    await app.stop();
  }
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { start } from '../main.ts';
import { config } from '../config.ts';

test('local descriptors persist without uploads and replacements require owner plus revision', {skip:process.env.WATCHPARTY_INTEGRATION!=='true'}, async()=>{
 const running=await start({...config(),port:0});const ids:string[]=[];let roomId="";
 try {
  const owner=await running.auth!.create({name:'Host',avatar:'comet',language:'en'});ids.push(owner.identity.id);
  const guest=await running.auth!.create({name:'Guest',avatar:'mint',language:'en'});ids.push(guest.identity.id);
  const admission=(await running.rooms!.create(owner.identity.id,'File night',randomUUID())).body;
  const room=admission.room;
  await running.rooms!.attach(owner.identity.id,room.id,admission.membership.id,'room',randomUUID());
  roomId=room.id;
  await running.rooms!.join(guest.identity.id,room.code,randomUUID());
  const begin=await running.rooms!.stream(owner.identity.id,room.id,'start',{sourceKind:'LOCAL_FILE',fileName:'فیلم من.mp4'},randomUUID());
  assert.equal(begin.body.stream.sourceKind,'LOCAL_FILE');assert.equal(begin.body.stream.url,'');
  assert.equal((await running.rooms!.snapshot(guest.identity.id,room.id)).stream.fileName,'فیلم من.mp4');
  await assert.rejects(running.rooms!.stream(guest.identity.id,room.id,'start',{sourceKind:'LOCAL_FILE',fileName:'Other.mp4',replace:true,revision:1}),/FORBIDDEN/);
  await assert.rejects(running.rooms!.stream(owner.identity.id,room.id,'start',{sourceKind:'LOCAL_FILE',fileName:'Other.mp4'}),(error:any)=>error.code==='STREAM_ACTIVE');
  await assert.rejects(running.rooms!.stream(owner.identity.id,room.id,'start',{sourceKind:'LOCAL_FILE',fileName:'Other.mp4',replace:true,revision:0}),/STALE_STREAM_REVISION/);
  for(const name of ['../movie.mp4','C:\\private\\movie.mp4','bad\nname.mp4','', 'a'.repeat(513)])await assert.rejects(running.rooms!.stream(owner.identity.id,room.id,'start',{sourceKind:'LOCAL_FILE',fileName:name}),/INVALID_FILE_NAME/);
  const replacement=await running.rooms!.stream(owner.identity.id,room.id,'start',{url:'https://example.org/film.mp4',replace:true,revision:1},randomUUID());
  assert.equal(replacement.body.stream.sourceKind,'URL');assert.equal(replacement.body.stream.fileName,'');assert.equal(replacement.body.stream.revision,2);
  assert.notEqual(begin.body.stream.sessionId,replacement.body.stream.sessionId);
 } finally {
  if(roomId)await running.db.query("DELETE FROM rooms WHERE id=$1",[roomId]);
  for(const id of ids) await running.db.query('DELETE FROM identities WHERE id=$1',[id]).catch(()=>{});
  await running.stop();
 }
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { io, type Socket } from 'socket.io-client';
import { start } from '../main.ts';
import { config } from '../config.ts';

test('real room sync: consent, private rewind to owner, commit barrier, cancellation and disconnect recovery', {skip:process.env.WATCHPARTY_INTEGRATION!=='true',timeout:45000}, async()=>{
 const app=await start({...config(),port:0});const base=`http://127.0.0.1:${(app.server!.address() as {port:number}).port}`;const sockets:Socket[]=[];let roomId='';
 const cmd=(s:Socket,name:string,body:unknown)=>new Promise<any>((resolve,reject)=>s.timeout(8000).emit(name,body,(error:unknown,value:any)=>error?reject(error):resolve(value)));
 const connect=async(user:any)=>{const ticket=await app.realtime!.ticket(user.identity.id,await app.auth!.verify(user.accessToken),roomId);const socket=io(base+ticket.namespace,{forceNew:true,transports:['websocket'],reconnection:false,auth:{ticket:ticket.ticket,protocolVersion:3}});sockets.push(socket);await new Promise<void>((resolve,reject)=>{socket.once('snapshot',()=>resolve());socket.once('connect_error',reject);});return socket;};
 try{
  const owner=await app.auth!.create({name:'Owner',avatar:'comet',language:'en'}),a=await app.auth!.create({name:'Viewer A',avatar:'berry',language:'en'}),b=await app.auth!.create({name:'Viewer B',avatar:'mint',language:'fa'});
  const room=(await app.rooms!.create(owner.identity.id,'Sync integration')).body.room;roomId=room.id;await app.rooms!.join(a.identity.id,room.code);await app.rooms!.join(b.identity.id,room.code);
  const os=await connect(owner),as=await connect(a),bs=await connect(b);
  const stream=(await app.rooms!.stream(owner.identity.id,roomId,'start',{url:'https://example.com/movie.mp4'})).body.stream;
  const sourceRequestId=`source-${stream.sessionId}`;
  for(let i=0;i<100&&app.realtime!.groupSync.state(roomId)?.requestId!==sourceRequestId;i++)await new Promise(r=>setTimeout(r,50));
  const automatic=app.realtime!.groupSync.state(roomId)!;assert.equal(automatic.phase,'PREPARING');assert.equal(automatic.targetPositionMs,0);assert.equal(automatic.participants.length,3);assert.ok(automatic.participants.every(p=>p.response==='ACCEPTED'));
  app.rooms!.onStreamChanged?.(roomId,stream);assert.equal(app.realtime!.groupSync.state(roomId)?.phase,'PREPARING');
  for(const socket of [os,as,bs])assert.equal((await cmd(socket,'sync.ready',{requestId:sourceRequestId,streamSessionId:stream.sessionId,ready:true})).ok,true);
  assert.equal(app.realtime!.groupSync.state(roomId)?.phase,'SCHEDULED');
  await new Promise(r=>setTimeout(r,4800));assert.equal(app.realtime!.groupSync.state(roomId)?.phase,'COMPLETED');
  const requestId=randomUUID();const body={requestId,streamSessionId:stream.sessionId};
  assert.equal((await cmd(as,'sync.invite',{...body,positionMs:1000})).code,'OWNER_ONLY');
  assert.equal((await cmd(os,'playback.report',{streamSessionId:stream.sessionId,positionMs:1000,playing:false})).accepted,true);
  const privateSync=await cmd(as,'sync.request',{...body,positionMs:30000});assert.equal(privateSync.status,'APPLIED');assert.equal(privateSync.targetPositionMs,1000);assert.equal(privateSync.playing,false);
  const invite=await cmd(os,'sync.invite',{...body,positionMs:1000});assert.equal(invite.state.phase,'INVITING');assert.equal(invite.state.participants.length,3);
  await cmd(as,'sync.respond',{...body,response:'ACCEPTED'});await cmd(as,'sync.respond',{...body,response:'WITHDRAWN'});await cmd(as,'sync.respond',{...body,response:'ACCEPTED'});await cmd(bs,'sync.respond',{...body,response:'DECLINED'});
  const committed=await cmd(os,'sync.commit',body);assert.equal(committed.state.participants.filter((p:any)=>p.response==='ACCEPTED').length,2);
  assert.equal((await cmd(bs,'sync.respond',{...body,response:'ACCEPTED'})).code,'SYNC_COMMITTED');assert.equal((await cmd(os,'sync.cancel',body)).code,'SYNC_COMMITTED');
  await cmd(os,'sync.ready',{...body,ready:true});const scheduled=await cmd(as,'sync.ready',{...body,ready:true});assert.equal(scheduled.state.phase,'SCHEDULED');assert.ok(scheduled.state.startAtMs-scheduled.serverTimeMs>=3400);
  const frames:any[]=[];os.on('sync.state',f=>frames.push(f));as.disconnect();await new Promise(r=>setTimeout(r,100));assert.ok(frames.some(f=>f.state?.participants.some((p:any)=>p.response==='EXCLUDED')));
  await new Promise(r=>setTimeout(r,4600));assert.equal(app.realtime!.groupSync.state(roomId)?.phase,'COMPLETED');
  const next={...body,requestId:randomUUID()};await cmd(os,'sync.invite',{...next,positionMs:2000});assert.equal((await cmd(os,'sync.cancel',next)).state.phase,'CANCELLED');
  const final={...body,requestId:randomUUID()};await cmd(os,'sync.invite',{...final,positionMs:3000});await cmd(os,'sync.commit',final);os.disconnect();await new Promise(r=>setTimeout(r,100));assert.equal(app.realtime!.groupSync.state(roomId)?.phase,'FAILED');
 }finally{sockets.forEach(s=>s.close());if(roomId)await app.db.query('DELETE FROM rooms WHERE id=$1',[roomId]);await app.stop();}
});

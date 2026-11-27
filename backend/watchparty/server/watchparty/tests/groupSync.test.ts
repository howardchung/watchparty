import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GroupSync, type SyncContext } from '../groupSync.ts';
const fixture=()=>{let now=1000;const sync=new GroupSync(()=>{},()=>now);const owner:SyncContext={roomId:'room',membershipId:'owner',isOwner:true,streamSessionId:'stream',streamRevision:1,members:['owner','a','b']};return {sync,owner,member:(id='a')=>({...owner,membershipId:id,isOwner:false}),advance:(ms:number)=>{now+=ms;sync.tick();}};};
test('consent remains revocable until commit, which locks participants and cancellation',()=>{const f=fixture();f.sync.invite(f.owner,'r',1);f.sync.respond(f.member(),'r','ACCEPTED');f.sync.respond(f.member(),'r','WITHDRAWN');f.sync.respond(f.member('b'),'r','DECLINED');const s=f.sync.commit(f.owner,'r');assert.equal(s.participants.filter(p=>p.response==='ACCEPTED').length,1);assert.throws(()=>f.sync.respond(f.member(),'r','ACCEPTED'),/SYNC_COMMITTED/);assert.throws(()=>f.sync.cancel(f.owner,'r'),/SYNC_COMMITTED/);});
test('ready barrier schedules one shared future start then completes and prunes',()=>{const f=fixture();f.sync.invite(f.owner,'r',1);f.sync.respond(f.member(),'r','ACCEPTED');f.sync.commit(f.owner,'r');f.sync.ready(f.owner,'r',true);assert.equal(f.sync.state('room')?.phase,'PREPARING');f.sync.ready(f.member(),'r',true);assert.equal(f.sync.state('room')?.startAtMs,4500);f.advance(4500);assert.equal(f.sync.state('room')?.phase,'COMPLETED');f.advance(30000);assert.equal(f.sync.state('room'),null);});
test('deadline excludes slow viewers but a missing ready owner fails',()=>{const f=fixture();f.sync.invite(f.owner,'r',1);f.sync.respond(f.member(),'r','ACCEPTED');f.sync.commit(f.owner,'r');f.sync.ready(f.owner,'r',true);f.advance(15000);assert.equal(f.sync.state('room')?.phase,'SCHEDULED');assert.equal(f.sync.state('room')?.participants[1].response,'EXCLUDED');const g=fixture();g.sync.invite(g.owner,'r',1);g.sync.commit(g.owner,'r');g.advance(15000);assert.equal(g.sync.state('room')?.phase,'FAILED');});
test('owner disconnect cancels invitations and fails committed attempts',()=>{const f=fixture();f.sync.invite(f.owner,'r',1);f.sync.disconnected('room','owner');assert.equal(f.sync.state('room')?.phase,'CANCELLED');f.sync.invite(f.owner,'s',2);f.sync.commit(f.owner,'s');f.sync.disconnected('room','owner');assert.equal(f.sync.state('room')?.phase,'FAILED');});
test('readiness loss excludes viewer without shifting the scheduled start',()=>{const f=fixture();f.sync.invite(f.owner,'r',1);f.sync.respond(f.member(),'r','ACCEPTED');f.sync.commit(f.owner,'r');f.sync.ready(f.owner,'r',true);f.sync.ready(f.member(),'r',true);const at=f.sync.state('room')?.startAtMs;f.sync.ready(f.member(),'r',false);assert.equal(f.sync.state('room')?.startAtMs,at);assert.equal(f.sync.state('room')?.participants[1].response,'EXCLUDED');});
test('owner checks and stream/request correlation reject unauthorized and stale commands',()=>{const f=fixture();assert.throws(()=>f.sync.invite(f.member(),'r',1),/OWNER_ONLY/);f.sync.invite(f.owner,'r',1);assert.throws(()=>f.sync.commit(f.member(),'r'),/OWNER_ONLY/);assert.throws(()=>f.sync.respond({...f.member(),streamSessionId:'other'},'r','ACCEPTED'),/STALE_SYNC/);assert.throws(()=>f.sync.respond(f.member(),'other','ACCEPTED'),/STALE_SYNC/);});
test('stream changes and invitation expiry release clients',()=>{const f=fixture();f.sync.invite(f.owner,'r',1);f.sync.invalidate('room');assert.equal(f.sync.state('room')?.phase,'FAILED');f.sync.invite(f.owner,'s',2);f.advance(120000);assert.equal(f.sync.state('room')?.phase,'CANCELLED');});
test('new stream automatically commits connected viewers and owner at zero',()=>{
 const frames:string[]=[];let now=1000;const sync=new GroupSync((_room,s)=>{if(s)frames.push(s.phase)},()=>now);
 const ctx:SyncContext={roomId:'room',membershipId:'owner',isOwner:true,streamSessionId:'new',streamRevision:3,members:['owner','a','b','a']};
 assert.throws(()=>sync.startStream({...ctx,isOwner:false}),/OWNER_ONLY/);
 const s=sync.startStream(ctx);assert.ok(s);assert.equal(s.phase,'PREPARING');assert.equal(s.targetPositionMs,0);assert.equal(s.participants.length,3);assert.ok(s.participants.every(p=>p.response==='ACCEPTED'&&!p.ready));assert.deepEqual(frames,['PREPARING']);
 sync.ready(ctx,s.requestId,true);sync.ready({...ctx,membershipId:'a',isOwner:false},s.requestId,true);assert.equal(sync.state('room')?.phase,'PREPARING');
 sync.ready({...ctx,membershipId:'b',isOwner:false},s.requestId,true);assert.equal(sync.state('room')?.phase,'SCHEDULED');assert.equal(sync.startStream(ctx)?.phase,'SCHEDULED');
 now=6000;sync.tick();assert.equal(sync.state('room')?.phase,'COMPLETED');
});

test('local source waits for file consent and fails the whole attempt on one bad copy',()=>{
 const sync=new GroupSync(()=>{});const local={...fixture().owner,localFile:true};
 const invite=sync.startStream(local);assert.ok(invite);assert.equal(invite.phase,'INVITING');assert.equal(invite.localFile,true);
 assert.deepEqual(invite.participants.map(p=>p.response),['ACCEPTED','PENDING','PENDING']);
 sync.respond({...local,membershipId:'a',isOwner:false},invite.requestId,'ACCEPTED');
 sync.respond({...local,membershipId:'b',isOwner:false},invite.requestId,'DECLINED');
 const committed=sync.commit(local,invite.requestId);assert.equal(committed.phase,'PREPARING');
 sync.ready(local,invite.requestId,true);
 const failed=sync.ready({...local,membershipId:'a',isOwner:false},invite.requestId,false,true,'UNREACHABLE_POSITION');
 assert.equal(failed.phase,'FAILED');assert.equal(failed.reason,'UNREACHABLE_POSITION');assert.equal(failed.participants.find(p=>p.membershipId==='b')?.response,'DECLINED');
});

for (const localFile of [false, true]) {
 test(`solo ${localFile ? 'file' : 'URL'} selection creates no readiness or countdown attempt`,()=>{
  const frames:unknown[]=[];const sync=new GroupSync((_room,state)=>frames.push(state));
  const ctx={...fixture().owner,localFile};
  for(const members of [[],['owner'],['owner','owner']]) {
   assert.equal(sync.startStream({...ctx,members}),null);
   assert.equal(sync.state('room'),null);
  }
  sync.tick();assert.deepEqual(frames,[]);
 });
 test(`solo ${localFile ? 'file' : 'URL'} replacement clears a previous group attempt`,()=>{
  const frames:unknown[]=[];const sync=new GroupSync((_room,state)=>frames.push(state));
  const ctx={...fixture().owner,localFile};
  assert.ok(sync.startStream(ctx));
  assert.equal(sync.startStream({...ctx,streamSessionId:'replacement',streamRevision:2,members:['owner']}),null);
  assert.equal(sync.state('room'),null);assert.equal(frames.at(-1),null);
  const rejoined=sync.startStream({...ctx,streamSessionId:'next',streamRevision:3});
  assert.ok(rejoined);assert.equal(rejoined.phase,localFile?'INVITING':'PREPARING');
 });
}

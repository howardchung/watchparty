import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useGroupSync } from '../../src/components/useGroupSync';
import type { RoomConnection } from '../../src/data/realtime';
import type { Snapshot } from '../../src/data/contracts';
import type { SyncStateFrame } from '../../src/data/groupSync';
import type { PlayerSyncInfo } from '../../src/components/playerSync';
import '../../src/styles.css';

const params=new URLSearchParams(location.search),owner=params.has('owner');
const snapshot:Snapshot={room:{id:'room',code:'ABCD1234',title:'Film',ownerIdentityId:'owner'},members:[{membershipId:'owner',identityId:'owner',displayName:'Host',avatar:'comet',isOwner:true,present:true},{membershipId:'guest',identityId:'guest',displayName:'Guest',avatar:'mint',isOwner:false,present:true}],stream:{sessionId:'stream',revision:1,state:'ACTIVE',url:'https://example.test/movie.mp4'},sequence:1};
const info:PlayerSyncInfo={positionMs:42000,durationMs:60000,playing:true,paused:false,seeking:false,ready:true,error:false,bufferedUntilMs:60000,seekable:true};
const calls:{action:string;body?:any}[]=[];
let result:any=params.has('unavailable')?{status:'UNAVAILABLE'}:{status:'APPLIED',targetPositionMs:12000,playing:false};
let release:((value:any)=>void)|null=null;
const fixture=window as any;
fixture.calls=calls;fixture.info=info;
fixture.setResult=(value:any)=>{result=value;};
fixture.release=()=>release?.({status:'APPLIED',targetPositionMs:9000,playing:true});
function App(){
 const [frame,setFrame]=useState<SyncStateFrame|null>(()=>params.has('waiting')?{serverTimeMs:Date.now(),state:{requestId:'source-stream',streamSessionId:'stream',streamRevision:1,ownerMembershipId:'owner',targetPositionMs:0,createdAtMs:1,revision:1,phase:'PREPARING',participants:[{membershipId:'guest',response:params.has('included')?'ACCEPTED':'PENDING',ready:false}],deadlineMs:Date.now()+15000}}:null);
 const [current,setCurrent]=useState(snapshot);
 fixture.frame=(phase:string,included=true)=>setFrame({serverTimeMs:Date.now(),state:{requestId:'source-stream',streamSessionId:'stream',streamRevision:1,ownerMembershipId:'owner',targetPositionMs:0,createdAtMs:1,revision:Date.now(),phase,participants:[{membershipId:owner?'owner':'guest',response:included?'ACCEPTED':'PENDING',ready:false}],startAtMs:phase==='SCHEDULED'?Date.now()+3500:undefined,deadlineMs:Date.now()+15000}} as SyncStateFrame);
 fixture.snapshot=()=>setCurrent({...snapshot,sequence:current.sequence+1});
 const connection=useRef({syncClock:{now:()=>Date.now()},sync:async()=>{calls.push({action:'sync'});return result==='pending'?new Promise(r=>release=r):result;},syncCommand:async(action:string,body:any)=>{calls.push({action,body});return frame?.state;}} as unknown as RoomConnection);
 const sync=useGroupSync({snapshot:current,identityId:owner?'owner':'guest',connected:true,connection,frame,notify:message=>calls.push({action:'notice',body:message})});
 sync.bridge.current={sessionId:'stream',info:()=>({...info}),pause:async()=>{info.paused=true;info.playing=false;calls.push({action:'pause'});},play:async()=>{info.paused=false;info.playing=true;calls.push({action:'play'});},seek:positionMs=>{info.positionMs=positionMs;calls.push({action:'seek',body:positionMs});},prepare:async(positionMs)=>{info.positionMs=positionMs;info.paused=true;info.playing=false;calls.push({action:'prepare',body:positionMs});}};
 return <><button onClick={sync.openSync}>Sync</button><output>{sync.locked?'locked':'free'}</output>{sync.overlay}{sync.dialog}</>;
}
createRoot(document.getElementById('root')!).render(<App/>);

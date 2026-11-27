import { logHandledException } from '../data/sessionLog';
import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { Snapshot } from '../data/contracts';
import type { RoomConnection } from '../data/realtime';
import { activeSync, type GroupSyncState, type SyncStateFrame } from '../data/groupSync';
import { GroupSyncDialog } from './GroupSyncDialog';
import { readyForSync, type PlayerSyncBridge, type PlayerSyncInfo } from './playerSync';
import { t } from '../i18n';
interface Options { localFile?: {fileName:string; selectedName:string; choose():void; loading:boolean; readySession:string; clear():void; cancelSource():Promise<void>}; snapshot:Snapshot|null;identityId:string;connected:boolean;connection:MutableRefObject<RoomConnection|null>;frame:SyncStateFrame|null;notify(message:string):void }
export function useGroupSync(o:Options) {
 const bridge=useRef<PlayerSyncBridge|null>(null);
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[tick,setTick]=useState(0);
 const [engaged,setEngaged]=useState(false);
 const saved=useRef<PlayerSyncInfo|null>(null),attempt=useRef(''),prepared=useRef(''),lastReady=useRef<boolean|null>(null),started=useRef(''),failed=useRef('');
 const stateRef=useRef<GroupSyncState|null>(null),applied=useRef(''),version=useRef(-1);
 const localRetryAt=useRef(0); const localAccepted=useRef(''); const terminalNotice=useRef('');
 const join=useRef({room:'',session:'',deadline:0,nextTry:0,inFlight:false,target:null as {positionMs:number;playing:boolean;receivedAt:number}|null});
 const [state,setState]=useState<GroupSyncState|null>(null);
 const self=o.snapshot?.members.find(x=>x.identityId===o.identityId);const owner=!!self?.isOwner;
 const session=o.snapshot?.stream.sessionId||'';const ownerName=o.snapshot?.members.find(x=>x.isOwner)?.displayName||o.snapshot?.ownerName||t('Host');
 const included=state?.participants.some(x=>x.membershipId===self?.membershipId&&x.response==='ACCEPTED')||false;
 const invoke=async(action:'invite'|'respond'|'commit'|'cancel'|'ready'|'failed',extra:Record<string,unknown>={})=>{
   if(!o.connection.current)throw Error('NETWORK');return o.connection.current.syncCommand(action,{requestId:stateRef.current?.requestId||attempt.current,...extra});
 };
 const restore=async(play?:boolean)=>{const player=bridge.current;const before=saved.current;saved.current=null;setEngaged(false);prepared.current='';lastReady.current=null;if(player&&before){player.seek(before.positionMs);if(play??before.playing)await player.play();else await player.pause();}};
 const fail=(message:string)=>{setEngaged(false);setOpen(false);if(o.snapshot?.stream.sourceKind==='LOCAL_FILE')void restore().catch(e=>logHandledException('localSync.restore',e));else saved.current=null;o.notify(message);};
 useEffect(()=>{
   const room=o.snapshot?.room.id||'';
   if(join.current.room===room)return;
   join.current={room,session:!owner&&o.snapshot?.stream.state==='ACTIVE'?session:'',deadline:0,nextTry:0,inFlight:false,target:null};
 },[o.snapshot?.room.id,owner,session]);
 useEffect(()=>{const timer=setInterval(()=>setTick(x=>x+1),100);return()=>clearInterval(timer);},[]);
 useEffect(()=>{
   stateRef.current=null;setState(null);setOpen(false);setEngaged(false);saved.current=null;attempt.current='';prepared.current='';applied.current='';version.current=-1;
 },[session,o.identityId]);
 useEffect(()=>{
   const frame=o.frame;if(!frame)return;const next=frame.state;
   if(next&&next.streamSessionId!==session)return;
   if(next&&stateRef.current&&next.requestId!==stateRef.current.requestId&&next.createdAtMs<stateRef.current.createdAtMs)return;
   if(next&&stateRef.current?.requestId===next.requestId&&next.revision<=version.current)return;
   version.current=next?.revision??-1;stateRef.current=next;setState(next);
   if(!next){if(saved.current)void restore().catch((handledError)=>{ logHandledException("useGroupSync.useGroupSync.1", handledError); });return;}
   if(applied.current!==next.requestId){applied.current=next.requestId;if(next.phase==='INVITING'||next.phase==='PREPARING'&&next.participants.some(p=>p.membershipId===self?.membershipId&&p.response==='ACCEPTED'))setOpen(true);}
   const mine=next.participants.find(x=>x.membershipId===self?.membershipId);
   if(activeSync(next)&&mine?.response==='ACCEPTED')join.current.session='';
   if(next.phase==='INVITING'&&mine?.response==='ACCEPTED'&& !saved.current && bridge.current&&bridge.current.sessionId===session){saved.current=bridge.current.info();void bridge.current.pause();setEngaged(true);}
   if(next.phase==='CANCELLED'){setOpen(false);void restore().catch((handledError)=>{ logHandledException("useGroupSync.useGroupSync.2", handledError); });o.notify(t('Sync cancelled'));}
   if(next.phase==='FAILED' && terminalNotice.current!==next.requestId){terminalNotice.current=next.requestId;if(next.localFile&&next.reason==='STREAM_CHANGED'){setOpen(false);setEngaged(false);saved.current=null;}else fail(t(next.localFile?'Couldn’t sync. Back to where you were.':'Sync stopped. You can keep watching.'));}
   if(mine?.response==='EXCLUDED'&&saved.current){fail(t('You couldn’t join this sync. You can keep watching.'));}
   if(next.phase==='SCHEDULED')setOpen(false);
   if(next.phase==='COMPLETED'&&next.localFile)saved.current=null;
   if(next.phase==='COMPLETED'&&!next.localFile&&owner&&next.participants.some(x=>x.response==='EXCLUDED'))o.notify(t('Started with ready viewers. Others can catch up.'));
 },[o.frame,session,self?.membershipId]);
 // Admission catches up once. Presence snapshots and reconnects never reset it.
 useEffect(()=>{
   const pending=join.current,player=bridge.current,s=stateRef.current;
   if(!pending.session)return;
   if(pending.session!==session||activeSync(s)&&s?.participants.some(p=>p.membershipId===self?.membershipId&&p.response==='ACCEPTED')){pending.session='';return;}
   if(s?.phase==='PREPARING'||s?.phase==='SCHEDULED'||!o.connected||!player||player.sessionId!==session)return;
   const info=player.info();if(info.seeking||info.error||(!info.localFileOpened&&(!info.ready||!info.seekable)))return;
   const now=performance.now();if(!pending.deadline)pending.deadline=now+30000;
   if(now>=pending.deadline){pending.session='';o.notify(t('Sync unavailable. Try again.'));return;}
   if(pending.inFlight)return;
   if(pending.target){const expected=pending.target.positionMs+(pending.target.playing?now-pending.target.receivedAt:0);if(Math.abs(info.positionMs-expected)<500&&info.playing===pending.target.playing){pending.session='';return;}}
   if(now<pending.nextTry)return;
   const connection=o.connection.current;if(!connection)return;
   pending.inFlight=true;pending.nextTry=now+3000;
   void connection.sync(info.positionMs).then(async result=>{
     if(join.current!==pending||pending.session!==session||bridge.current!==player||stateRef.current?.phase==='PREPARING'||stateRef.current?.phase==='SCHEDULED')return;
     if(result?.status!=='APPLIED')return;
     if(o.localFile && (result.targetPositionMs>=info.durationMs || result.targetPositionMs<0)){pending.session='';o.notify(t('Couldn’t sync. Back to where you were.'));return;}
     pending.target={positionMs:result.targetPositionMs,playing:!!result.playing,receivedAt:performance.now()};
     if(player.prepare)await player.prepare(result.targetPositionMs);else{await player.pause();player.seek(result.targetPositionMs);}
     if(join.current!==pending||pending.session!==session||bridge.current!==player||activeSync(stateRef.current)&&stateRef.current?.participants.some(p=>p.membershipId===self?.membershipId&&p.response==='ACCEPTED'))return;
     if(result.playing)await player.play();else await player.pause();
   }).catch(error=>{logHandledException('useGroupSync.join',error);if(pending.target&&join.current===pending){pending.session='';o.notify(t('Select Play to start the video on this device.'));}}).finally(()=>{pending.inFlight=false;});
 },[tick,session,self?.membershipId,o.connected]);
 // Real player readiness and local scheduling share the server-calibrated clock.
 useEffect(()=>{
   const s=stateRef.current,player=bridge.current;if(!s||!player||!included||!activeSync(s))return;
   if(s.phase!=='PREPARING'&&s.phase!=='SCHEDULED')return;
   if(prepared.current!==s.requestId){if(s.localFile&&!saved.current)saved.current=player.info();setEngaged(true);const initial=player.info();if(!initial.ready&&!initial.localFileOpened&&!initial.error)return;failed.current='';prepared.current=s.requestId;lastReady.current=null;setEngaged(true);if(player.prepare)void player.prepare(s.targetPositionMs).catch((handledError)=>{ logHandledException("useGroupSync.useGroupSync.3", handledError); void invoke('failed',{requestId:s.requestId,reason:'PREPARATION_FAILED'}).catch((handledError)=>{ logHandledException("useGroupSync.useGroupSync.4", handledError); });});else{void player.pause();player.seek(s.targetPositionMs);}}
   const info=player.info();
   // Source loading may resolve an earlier autoplay after preparation paused it.
   if(info.playing&&started.current!==s.requestId){void player.pause().catch(error=>logHandledException('useGroupSync.preparePause',error));return;}
   if(info.error||!Number.isNaN(info.durationMs)&&(!Number.isFinite(info.durationMs)||(info.ready&&info.durationMs<=0))){if(failed.current!==s.requestId){failed.current=s.requestId;void invoke('failed',{reason:'UNSUPPORTED_PLAYER'}).catch((handledError)=>{ logHandledException("useGroupSync.useGroupSync.5", handledError); });}return;}
   const ready=readyForSync(info,s.targetPositionMs);
   if(s.phase==='PREPARING'&&ready!==lastReady.current){lastReady.current=ready;void invoke('ready',{ready}).catch((handledError)=>{ logHandledException("useGroupSync.useGroupSync.6", handledError); lastReady.current=null;});}
   if(s.phase==='SCHEDULED'&&s.startAtMs){
     if(!o.connected){started.current=s.requestId;fail(t('Sync stopped. You can keep watching.'));return;}
     const remaining=s.startAtMs-(o.connection.current?.syncClock.now()??Date.now());
     if(!ready&&remaining>0){if(failed.current===s.requestId)return;failed.current=s.requestId;void invoke('failed',{reason:'READINESS_LOST'}).catch((handledError)=>{ logHandledException("useGroupSync.useGroupSync.7", handledError); });return;}
     if(remaining<=0&&started.current!==s.requestId){started.current=s.requestId;if(remaining< -750){void invoke('failed',{reason:'LATE_START'}).catch((handledError)=>{ logHandledException("useGroupSync.useGroupSync.8", handledError); });fail(t('Sync stopped. You can keep watching.'));return;}void player.play().then(()=>{if(!s.localFile)saved.current=null;setEngaged(false);}).catch((handledError)=>{ logHandledException("useGroupSync.useGroupSync.9", handledError); void invoke('failed',{reason:'PLAYBACK_DENIED'}).catch((handledError)=>{ logHandledException("useGroupSync.useGroupSync.10", handledError); });fail(t('Select Play to start the video on this device.'));});}
   }
 },[tick,included]);
 useEffect(()=>{
   if(!engaged)return;
   const wait=o.connected?Math.max(1000,(state?.deadlineMs??Date.now()+130000)-(o.connection.current?.syncClock.now()??Date.now())+5000):12000;
   const timeout=setTimeout(()=>{void restore().catch((handledError)=>{
     logHandledException("useGroupSync.useGroupSync.timeout.11", handledError); });setOpen(false);o.notify(t('Sync stopped. You can keep watching.'));},wait);
   return()=>clearTimeout(timeout);
 },[engaged,o.connected,state?.phase,state?.deadlineMs]);
 const run=async(operation:()=>Promise<void>)=>{if(busy)return;setBusy(true);try{await operation();}catch (handledError){ logHandledException("useGroupSync.useGroupSync.run.12", handledError); if(saved.current&&!activeSync(stateRef.current))await restore().catch((handledError)=>{ logHandledException("useGroupSync.useGroupSync.run.13", handledError); });o.notify(t('Sync unavailable. Try again.'));}finally{setBusy(false);}};
 const ask=()=>void run(async()=>{const p=bridge.current;if(!p)throw Error('PLAYER_UNAVAILABLE');saved.current=p.info();await p.pause();setEngaged(true);attempt.current=crypto.randomUUID();await invoke('invite',{requestId:attempt.current,positionMs:Math.round(p.info().positionMs)});});
 const respond=(response:'ACCEPTED'|'DECLINED'|'WITHDRAWN')=>void run(async()=>{
   if(response==='ACCEPTED'&&o.localFile&&!o.localFile.selectedName){o.localFile.choose();return;}
   if(response==='ACCEPTED'){const p=bridge.current;if(!p)throw Error('PLAYER_UNAVAILABLE');saved.current=p.info();await p.pause();setEngaged(true);}
   await invoke('respond',{response});if(response==='WITHDRAWN'){setOpen(false);await restore(o.localFile?false:true);if(o.localFile)o.localFile.clear();}if(response==='DECLINED'){setOpen(false);o.localFile?.clear();}
 });
 useEffect(()=>{
   const local=o.localFile,s=stateRef.current;
   if(!local?.selectedName){localAccepted.current='';return;}
   if(s?.participants.some(p=>p.membershipId===self?.membershipId&&p.response==='ACCEPTED')){localAccepted.current=session;return;}
   if(!local||owner||!local.selectedName||local.readySession!==session||busy||localAccepted.current===session||performance.now()<localRetryAt.current)return;
   const info=bridge.current?.info();if(!info||(!info.ready&&!info.localFileOpened)||info.error||!Number.isFinite(info.durationMs)||info.durationMs<=0)return;
   if(s?.phase==='INVITING') {const response=s.participants.find(p=>p.membershipId===self?.membershipId)?.response;if(response==='ACCEPTED'){localAccepted.current=session;return;}localRetryAt.current=performance.now()+3000;respond('ACCEPTED');}
   else if(!activeSync(s)){localAccepted.current=session;join.current={...join.current,session,deadline:0,nextTry:0,target:null};}
 },[o.localFile?.readySession,state?.phase,session,busy,tick]);
 const openSync=()=>{join.current.session='';if(o.localFile&&!o.localFile.selectedName){setOpen(true);return;}if(stateRef.current?.phase==='SCHEDULED')return;if(activeSync(stateRef.current)||owner){setOpen(true);return;}void run(async()=>{const p=bridge.current;if(!p||!o.connection.current)throw Error('PLAYER_UNAVAILABLE');const result=await o.connection.current.sync(p.info().positionMs);if(result?.status!=='APPLIED')throw Error('UNAVAILABLE');if(o.localFile&&(result.targetPositionMs>=p.info().durationMs||result.targetPositionMs<0)){o.notify(t('Couldn’t sync. Back to where you were.'));return;}if(p.prepare)await p.prepare(result.targetPositionMs);else{await p.pause();p.seek(result.targetPositionMs);}if(result.playing)await p.play();else await p.pause();o.notify(t('Caught up to {name}',{name:ownerName}));});};
 const remaining=state?.startAtMs?state.startAtMs-(o.connection.current?.syncClock.now()??Date.now()):0;
 const overlay=state?.phase==='SCHEDULED'&&included&&remaining>=-500?<div className="group-sync-countdown" role="status" aria-live="polite"><strong>{remaining>0?Math.min(3,Math.ceil(remaining/1000)):t('Action')}</strong></div>:null;
 return {bridge,locked:engaged,committed:state?.phase==='PREPARING'||state?.phase==='SCHEDULED',busy,openSync,overlay,dialog:<GroupSyncDialog localFile={o.localFile} open={open} owner={owner} ownerName={ownerName} selfId={self?.membershipId||''} state={state} positionMs={bridge.current?.info().positionMs||0} members={o.snapshot?.members||[]} busy={busy} connected={o.connected} close={()=>setOpen(false)} ask={ask} respond={respond} commit={()=>void run(async()=>{await invoke('commit');})} cancel={()=>void run(async()=>{const source=stateRef.current?.requestId.startsWith('source-');await invoke('cancel');if(source&&o.localFile)await o.localFile.cancelSource();})}/>};
}

export type GroupSyncUi = ReturnType<typeof useGroupSync>;

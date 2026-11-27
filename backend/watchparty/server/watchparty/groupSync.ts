import { ApiError } from './errors.ts';
export type SyncPhase = 'INVITING' | 'PREPARING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
export interface SyncParticipant { membershipId: string; response: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN' | 'EXCLUDED'; ready: boolean; reason?: string }
export interface SyncAttempt {
  requestId: string; streamSessionId: string; streamRevision: number; ownerMembershipId: string;
  targetPositionMs: number; createdAtMs: number; revision: number; phase: SyncPhase;
  localFile?: boolean; participants: SyncParticipant[]; deadlineMs?: number; startAtMs?: number; reason?: string;
}
export interface SyncContext { roomId: string; membershipId: string; isOwner: boolean; streamSessionId: string; streamRevision: number; localFile?: boolean; members: string[] }
const terminal = (phase: SyncPhase) => ['COMPLETED','CANCELLED','FAILED'].includes(phase);
/** Synchronous mutations provide the authoritative acceptance/commit ordering. */
export class GroupSync {
  readonly attempts = new Map<string, SyncAttempt>();
  private emit: (roomId: string, state: SyncAttempt | null) => void;
  private now: () => number;
  constructor(emit: (roomId: string, state: SyncAttempt | null) => void, now: () => number = Date.now) {this.emit=emit;this.now=now;}
  state(roomId: string) { return this.attempts.get(roomId) ?? null; }
  startStream(ctx: SyncContext) {
    this.owner(ctx);
    const requestId = `source-${ctx.streamSessionId}`;
    const old = this.state(ctx.roomId);
    if (old?.requestId === requestId) return structuredClone(old);
    // A solo source needs no consent or coordinated start. Clear any prior
    // source attempt so snapshots cannot keep clients in its readiness flow.
    if (!ctx.members.some(id => id !== ctx.membershipId)) {
      this.attempts.delete(ctx.roomId);
      if (old) this.emit(ctx.roomId, null);
      return null;
    }
    const s: SyncAttempt = {
      requestId, streamSessionId: ctx.streamSessionId, streamRevision: ctx.streamRevision,
      ownerMembershipId: ctx.membershipId, targetPositionMs: 0, createdAtMs: this.now(),
      revision: 0, localFile: ctx.localFile, phase: ctx.localFile ? 'INVITING' : 'PREPARING', deadlineMs: this.now() + (ctx.localFile ? 120000 : 15000),
      participants: [...new Set([ctx.membershipId, ...ctx.members])].map(membershipId => ({ membershipId, response: ctx.localFile && membershipId !== ctx.membershipId ? 'PENDING' : 'ACCEPTED', ready: false })),
    };
    this.attempts.set(ctx.roomId, s);
    return this.changed(ctx.roomId, s);
  }
  private changed(roomId: string, state: SyncAttempt) { state.revision++; this.emit(roomId, structuredClone(state)); return structuredClone(state); }
  private current(ctx: SyncContext, requestId: string) {
    const s = this.state(ctx.roomId);
    if (!s || s.requestId !== requestId || s.streamSessionId !== ctx.streamSessionId || s.streamRevision !== ctx.streamRevision) throw new ApiError(409, 'STALE_SYNC');
    return s;
  }
  private owner(ctx: SyncContext, s?: SyncAttempt) {
    if (!ctx.isOwner || (s && s.ownerMembershipId !== ctx.membershipId)) throw new ApiError(403,'OWNER_ONLY');
  }
  invite(ctx: SyncContext, requestId: string, positionMs: number) {
    this.owner(ctx);
    const old = this.state(ctx.roomId);
    if (old?.requestId === requestId && old.streamSessionId === ctx.streamSessionId) return structuredClone(old);
    if (old && !terminal(old.phase)) throw new ApiError(409,'SYNC_IN_PROGRESS');
    const s: SyncAttempt = { requestId, streamSessionId: ctx.streamSessionId, streamRevision: ctx.streamRevision, ownerMembershipId: ctx.membershipId, targetPositionMs: positionMs, createdAtMs: this.now(), revision: 0, localFile:ctx.localFile, phase:'INVITING', deadlineMs:this.now()+120000, participants:[...new Set([ctx.membershipId,...ctx.members])].map(membershipId=>({membershipId,response:membershipId===ctx.membershipId?'ACCEPTED':'PENDING',ready:false})) };
    this.attempts.set(ctx.roomId,s); return this.changed(ctx.roomId,s);
  }
  respond(ctx: SyncContext, requestId: string, response: unknown) {
    const s=this.current(ctx,requestId);
    if (ctx.isOwner) throw new ApiError(403,'OWNER_ONLY');
    if (s.phase!=='INVITING') throw new ApiError(409,'SYNC_COMMITTED');
    if (!['ACCEPTED','DECLINED','WITHDRAWN'].includes(String(response))) throw new ApiError(400,'INVALID_JSON');
    let p=s.participants.find(p=>p.membershipId===ctx.membershipId);
    if (!p) { p={membershipId:ctx.membershipId,response:'PENDING',ready:false}; s.participants.push(p); }
    p.response=response as SyncParticipant['response']; p.ready=false; delete p.reason;
    return this.changed(ctx.roomId,s);
  }
  commit(ctx: SyncContext, requestId: string) {
    const s=this.current(ctx,requestId); this.owner(ctx,s);
    if (s.phase==='PREPARING'||s.phase==='SCHEDULED') return structuredClone(s);
    if (s.phase!=='INVITING') throw new ApiError(409,'STALE_SYNC');
    for (const p of s.participants) if (p.response==='ACCEPTED' && !ctx.members.includes(p.membershipId) && p.membershipId!==ctx.membershipId) {p.response='EXCLUDED';p.reason='DISCONNECTED';}
    if(s.localFile && !s.participants.some(p=>p.membershipId!==s.ownerMembershipId&&p.response==='ACCEPTED'))throw new ApiError(409,'NO_READY_VIEWERS');
    s.phase='PREPARING';s.deadlineMs=this.now()+15000;
    return this.changed(ctx.roomId,s);
  }
  cancel(ctx: SyncContext, requestId: string) {
    const s=this.current(ctx,requestId);this.owner(ctx,s);
    if(s.phase==='CANCELLED')return structuredClone(s);
    if(s.phase!=='INVITING')throw new ApiError(409,'SYNC_COMMITTED');
    s.phase='CANCELLED';s.reason='OWNER_CANCELLED';s.deadlineMs=this.now()+30000;
    return this.changed(ctx.roomId,s);
  }
  ready(ctx: SyncContext, requestId: string, ready: unknown, failed = false, reason = 'PLAYER_FAILED') {
    const s=this.current(ctx,requestId);
    if (s.phase!=='PREPARING' && s.phase!=='SCHEDULED') throw new ApiError(409,'STALE_SYNC');
    const p=s.participants.find(p=>p.membershipId===ctx.membershipId && p.response==='ACCEPTED');
    if(!p)throw new ApiError(403,'NOT_INCLUDED');
    if(typeof ready!=='boolean')throw new ApiError(400,'INVALID_JSON');
    if(failed || (!ready && s.phase==='SCHEDULED')) this.exclude(s,p,reason);
    else p.ready=ready;
    this.schedule(s);return this.changed(ctx.roomId,s);
  }
  private exclude(s: SyncAttempt,p: SyncParticipant,reason:string) {
    p.ready=false;p.reason=reason;p.response='EXCLUDED';
    if(s.localFile || p.membershipId===s.ownerMembershipId){s.phase='FAILED';s.reason=reason;s.deadlineMs=this.now()+30000;}
  }
  private schedule(s: SyncAttempt) {
    if(s.phase!=='PREPARING')return;
    const included=s.participants.filter(p=>p.response==='ACCEPTED');
    if(included.length && included.every(p=>p.ready)) {s.phase='SCHEDULED';s.startAtMs=this.now()+3500;s.deadlineMs=s.startAtMs+1000;}
  }
  disconnected(roomId:string,membershipId:string) {
    const s=this.state(roomId);if(!s||terminal(s.phase))return;
    const p=s.participants.find(p=>p.membershipId===membershipId);if(!p)return;
    if(s.phase==='INVITING') {
      if(membershipId===s.ownerMembershipId){s.phase='CANCELLED';s.reason='OWNER_DISCONNECTED';s.deadlineMs=this.now()+30000;}
      else {p.response='WITHDRAWN';p.ready=false;}
    } else {if(p.response!=='ACCEPTED')return;this.exclude(s,p,'DISCONNECTED');this.schedule(s);}
    this.changed(roomId,s);
  }
  invalidate(roomId:string, reason='STREAM_CHANGED') {
    const s=this.state(roomId);if(!s||terminal(s.phase))return;
    s.phase='FAILED';s.reason=reason;s.deadlineMs=this.now()+30000;this.changed(roomId,s);
  }
  tick() {
    for(const [roomId,s] of this.attempts) {
      if(!s.deadlineMs || this.now()<s.deadlineMs)continue;
      if(terminal(s.phase)){this.attempts.delete(roomId);this.emit(roomId,null);continue;}
      if(s.phase==='INVITING'){s.phase='CANCELLED';s.reason='INVITATION_EXPIRED';s.deadlineMs=this.now()+30000;}
      else if(s.phase==='PREPARING') {
        for(const p of s.participants)if(p.response==='ACCEPTED'&&!p.ready)this.exclude(s,p,'PREPARATION_TIMEOUT');
        this.schedule(s);
      } else if(s.phase==='SCHEDULED'){s.phase='COMPLETED';s.deadlineMs=this.now()+30000;}
      this.changed(roomId,s);
    }
  }
  clear(){this.attempts.clear();}
}

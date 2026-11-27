export type SyncPhase = 'INVITING'|'PREPARING'|'SCHEDULED'|'COMPLETED'|'CANCELLED'|'FAILED';
export interface SyncParticipant { membershipId:string; response:'PENDING'|'ACCEPTED'|'DECLINED'|'WITHDRAWN'|'EXCLUDED'; ready:boolean; reason?:string }
export interface GroupSyncState { localFile?:boolean;requestId:string;streamSessionId:string;streamRevision:number;ownerMembershipId:string;targetPositionMs:number;createdAtMs:number;revision:number;phase:SyncPhase;participants:SyncParticipant[];deadlineMs?:number;startAtMs?:number;reason?:string }
export interface SyncStateFrame { serverTimeMs:number;state:GroupSyncState|null }
export const activeSync=(s:GroupSyncState|null|undefined)=>!!s&&['INVITING','PREPARING','SCHEDULED'].includes(s.phase);
/** Best RTT sample plus monotonic progression avoids changes to the device wall clock. */
export class SyncClock {
  private sampleAt=performance.now();private serverAt=Date.now();private best=Infinity;
  sample(serverMs:number,sent:number,received=performance.now()) {
    const rtt=received-sent;if(!Number.isFinite(serverMs)||rtt<0||rtt>this.best)return;
    this.best=rtt;this.serverAt=serverMs+rtt/2;this.sampleAt=received;
  }
  now(){return this.serverAt+performance.now()-this.sampleAt;}
}

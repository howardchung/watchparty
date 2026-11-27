import { logHandledException } from './sessionLog';
import { SyncClock, type GroupSyncState, type SyncStateFrame } from './groupSync';
import { diagnosticEvent, diagnosticError } from './sessionLog';
import { io, type Socket } from 'socket.io-client';
import { ApiError, backendUrl, request } from './api';
import type { ChatPage, RoomEvent, Snapshot, SyncResult } from './contracts';
import { reduceEvent } from './contracts';

interface Options { roomId: string; onSnapshot(value: Snapshot): void; onConnection(connected: boolean): void; onError(error: unknown): void; onClosed(reason?: string): void; onSyncState?(value: SyncStateFrame): void }
export class RoomConnection {
  private socket?: Socket;
  private closed = false;
  private timer?: ReturnType<typeof setTimeout>;
  private retry = 0;
  private generation = 0;
  private snapshot?: Snapshot;
  private recovery?: Promise<void>;
  private pendingEvents: RoomEvent[] = [];
  readonly syncClock = new SyncClock();
  private syncRequest = '';
  private authReady = false;
  private chatVersion = 0;
  private diagnosticState = '';
  private syncWaiters = new Map<string, { resolve: (value: SyncResult) => void; reject: (error: unknown) => void; timer: ReturnType<typeof setTimeout> }>();
  constructor(private options: Options) {}
  start() { void this.connect(); }
  private async connect() {
    const generation = ++this.generation;
    diagnosticEvent('room.connect', { generation, attempt: this.retry + 1 });
    try {
      const admission = await request<{ ticket: string; namespace: string }>(`/v1/rooms/${this.options.roomId}/realtime-ticket`, {});
      if (this.closed || generation !== this.generation) return;
      const socket = io(`${backendUrl || location.origin}${admission.namespace}`, { path: '/socket.io/', transports: ['websocket'], auth: { ticket: admission.ticket, protocolVersion: 3 }, reconnection: false, forceNew: true, autoConnect: false, timeout: 10000 });
      this.socket = socket;
      socket.on('snapshot', (value: Snapshot) => {
        if (generation !== this.generation || this.closed) return;
        diagnosticEvent('room.connected', { generation, sequence: value.sequence, members: value.members.length });
        this.retry = 0;
        this.authReady = true;
        this.applySnapshot(value, true);
        this.options.onConnection(true);
        void this.calibrateClock();
      });
      socket.on('event', (event: RoomEvent) => {
        if (generation !== this.generation || this.closed) return;
        socket.emit('ack', { eventId: event.eventId });
        if (event.topic === 'room.closed') { this.options.onClosed('ROOM_ENDED'); this.close(); return; }
        if (this.recovery) {
          this.pendingEvents.push(event);
          if (this.pendingEvents.length > 256) { socket.disconnect(); this.schedule(); }
          return;
        }
        if (!this.snapshot) return;
        const next = reduceEvent(this.snapshot, event);
        if (next) this.applySnapshot(next); else { this.pendingEvents.push(event); void this.recover().catch(e => { logHandledException("realtime.connect.1", e); return this.options.onError(e); }); }
      });
      socket.on('sync.state', (value: SyncStateFrame) => { if(generation===this.generation&&!this.closed) this.options.onSyncState?.(value); });
      socket.on('sync.result', (result: SyncResult) => {
        const waiter = this.syncWaiters.get(result.requestId);
        if (!waiter) return;
        diagnosticEvent('room.sync_result', { status: result.status, targetPositionMs: result.targetPositionMs });
        clearTimeout(waiter.timer); this.syncWaiters.delete(result.requestId); waiter.resolve(result);
      });
      socket.on('error', (error: { code: string }) => {
        logHandledException('realtime.socket.error', error);
        this.options.onError(new ApiError(error.code));
      });
      socket.on('disconnect', () => { diagnosticEvent('room.disconnected', { generation }); this.schedule(); });
      socket.on('connect_error', (error: Error & { data?: { code: string } }) => {
        logHandledException('realtime.socket.connect', error);
        diagnosticEvent('room.connect_failure', { generation, code: diagnosticError(new ApiError(error.data?.code || 'NETWORK')) });
        this.options.onError(new ApiError(error.data?.code || 'NETWORK'));
        this.schedule();
      });
      socket.connect();
    } catch (error) {
      logHandledException("realtime.connect.2", error);
      if (this.closed || generation !== this.generation) return;
      this.options.onError(error);
      if (error instanceof ApiError && ['NOT_A_MEMBER', 'ROOM_ENDED', 'ROOM_NOT_FOUND', 'SESSION_REVOKED'].includes(error.code)) { this.options.onClosed(error.code); this.close(); } else this.schedule();
    }
  }
  private schedule() {
    if (this.closed || this.timer) return;
    diagnosticEvent('room.retry_scheduled', { attempt: this.retry + 1, delayMs: Math.min(10000, 500 * 2 ** Math.min(this.retry, 5)) });
    this.authReady = false;
    this.options.onConnection(false);
    this.socket?.removeAllListeners(); this.socket?.disconnect(); this.socket = undefined;
    this.timer = setTimeout(() => { this.timer = undefined; void this.connect(); }, Math.min(10000, 500 * 2 ** Math.min(this.retry++, 5)));
  }
  applySnapshot(value: Snapshot, resetChat = false) {
    if (this.closed || (this.snapshot && value.sequence < this.snapshot.sequence)) return;
    if (this.snapshot && value.stream.revision < this.snapshot.stream.revision) return;
    const diagnosticState = `${value.stream.state}:${value.stream.revision}:${value.members.length}:${value.members.find(member => member.isOwner)?.present}`;
    if (diagnosticState !== this.diagnosticState) {
      this.diagnosticState = diagnosticState;
      diagnosticEvent('room.state', { stream: value.stream.state, revision: value.stream.revision, members: value.members.length, sequence: value.sequence });
    }
    if (resetChat) this.chatVersion++;
    if (this.snapshot?.stream.sessionId !== value.stream.sessionId) this.syncRequest = '';
    value = { ...value, ownerName: value.members.find(m => m.isOwner)?.displayName || value.ownerName || this.snapshot?.ownerName };
    this.snapshot = value;
    this.options.onSnapshot(value);
  }
  async recover() {
    if (this.recovery) return this.recovery;
    const generation = this.generation;
    diagnosticEvent('room.snapshot_recovery', { generation, sequence: this.snapshot?.sequence, pending: this.pendingEvents.length });
    this.recovery = request<Snapshot>(`/v1/rooms/${this.options.roomId}/snapshot`).then(value => {
      if (!this.closed && generation === this.generation) this.applySnapshot(value, true);
    }).finally(() => { this.recovery = undefined; });
    await this.recovery;
    if (this.closed || generation !== this.generation) { this.pendingEvents = []; return; }
    const events = this.pendingEvents.splice(0).sort((a, b) => a.sequence - b.sequence);
    for (const event of events) {
      if (!this.snapshot) break;
      const next = reduceEvent(this.snapshot, event);
      if (!next) { this.schedule(); break; }
      this.applySnapshot(next);
    }
  }
  async loadEarlierChat() {
    const chat = this.snapshot?.chat;
    const before = chat?.messages[0]?.sequence;
    if (!chat?.hasMore || !before || chat.messages.length >= 500) return;
    const version = this.chatVersion;
    const generation = this.generation;
    const page = await request<ChatPage>(`/v1/rooms/${this.options.roomId}/chat/messages?before=${before}`);
    if (this.closed || version !== this.chatVersion || generation !== this.generation || this.snapshot?.chat?.messages[0]?.sequence !== before) return;
    const messages = [...new Map([...page.messages, ...this.snapshot.chat.messages].map(m => [m.id, m])).values()].sort((a, b) => a.sequence - b.sequence);
    this.applySnapshot({ ...this.snapshot, chat: { messages: messages.slice(-500), hasMore: page.hasMore || messages.length > 500 } });
  }
  report(positionMs: number, playing: boolean) {
    const stream = this.snapshot?.stream;
    if (this.socket?.connected && this.authReady && stream?.state === 'ACTIVE') this.socket.volatile.emit('playback.report', { streamSessionId: stream.sessionId, positionMs: Math.max(0, Math.round(positionMs)), playing });
  }
  async sync(positionMs: number): Promise<SyncResult | undefined> {
    const stream = this.snapshot?.stream;
    if (!this.socket?.connected || !this.authReady || stream?.state !== 'ACTIVE') throw new ApiError('NETWORK');
    diagnosticEvent('room.sync_requested', { positionMs: Math.round(positionMs) });
    const requestId = crypto.randomUUID();
    const sessionId = stream.sessionId;
    this.syncRequest = requestId;
    const result = await new Promise<SyncResult>((resolve, reject) => {
      const timer = setTimeout(() => { this.syncWaiters.delete(requestId); diagnosticEvent('room.sync_timeout'); reject(new ApiError('NETWORK')); }, 10000);
      this.syncWaiters.set(requestId, { resolve, reject, timer });
      this.socket!.emit('sync.request', { requestId, streamSessionId: sessionId, positionMs: Math.max(0, Math.round(positionMs)) });
    });
    if (this.closed || this.syncRequest !== requestId || this.snapshot?.stream.sessionId !== sessionId || this.snapshot.stream.state !== 'ACTIVE') return;
    return result;
  }
  async syncCommand(action: 'invite'|'respond'|'commit'|'cancel'|'ready'|'failed', body: Record<string, unknown>): Promise<GroupSyncState> {
    if (!this.snapshot || this.snapshot.stream.state!=='ACTIVE') throw new ApiError('UNAVAILABLE');
    const result=await this.command('sync.'+action,{...body,streamSessionId:this.snapshot.stream.sessionId}) as SyncStateFrame;
    if(result.state)this.options.onSyncState?.(result);
    return result.state!;
  }
  private command(name:string,body:unknown):Promise<unknown> {
    if(!this.socket?.connected||!this.authReady)return Promise.reject(new ApiError('NETWORK'));
    return new Promise((resolve,reject)=>this.socket!.timeout(10000).emit(name,body,(error:Error|null,result:{code?:string})=>{
      if(error||result?.code)reject(error||new ApiError(result.code!));else resolve(result);
    }));
  }
  async calibrateClock() {
    for(let i=0;i<4;i++){const sent=performance.now();try{const result=await this.command('sync.clock',{}) as {serverTimeMs:number};this.syncClock.sample(result.serverTimeMs,sent);}catch (handledError){ logHandledException("realtime.calibrateClock.3", handledError); return;}}
  }
  async refreshAuth(accessToken: string) {
    const socket = this.socket;
    if (!socket?.connected) return;
    this.authReady = false;
    await new Promise<void>((resolve, reject) => socket.timeout(10000).emit('auth.refresh', { accessToken }, (error: Error | null, result: { code?: string }) => {
      if (error || result?.code) { this.schedule(); reject(error || new ApiError(result.code!)); } else { this.authReady = true; resolve(); }
    }));
  }
  close() {
    diagnosticEvent('room.close');
    this.closed = true; ++this.generation; this.syncRequest = '';
    clearTimeout(this.timer); this.timer = undefined;
    this.socket?.removeAllListeners(); this.socket?.disconnect();
    for (const w of this.syncWaiters.values()) { clearTimeout(w.timer); w.resolve({ requestId: '', status: 'UNAVAILABLE', targetPositionMs: 0 }); }
    this.syncWaiters.clear();
  }
}

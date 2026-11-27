import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoomConnection } from './realtime';
import type { Snapshot } from './contracts';
const mocks = vi.hoisted(() => ({ request: vi.fn(), sockets: [] as FakeSocket[] }));
vi.mock('./api', () => ({ request: mocks.request, backendUrl: '', ApiError: class extends Error { constructor(public code: string) {super(code);} } }));
vi.mock('socket.io-client', () => ({ io: (_: string, options: unknown) => { const socket = new FakeSocket(options); mocks.sockets.push(socket); return socket; } }));
class FakeSocket {
  connected = false;
  handlers = new Map<string, (...args: any[]) => void>();
  sent: { event: string; payload: any }[] = [];
  volatile = this;
  constructor(public options: any) {}
  on(event: string, handler: (...args: any[]) => void) {this.handlers.set(event,handler);return this;}
  connect() {this.connected=true;return this;}
  disconnect() {this.connected=false;return this;}
  removeAllListeners(){this.handlers.clear();return this;}
  emit(event: string,payload: unknown){this.sent.push({event,payload});return this;}
  timeout(){return this;}
  deliver(event: string,payload?:unknown){this.handlers.get(event)?.(payload);}
}
const initial: Snapshot = {room:{id:'room',code:'ABCD1234',title:'Film',ownerIdentityId:'owner'},members:[],stream:{sessionId:'s1',revision:1,state:'ACTIVE',url:'https://example.test/a.mp4'},sequence:2};
const clients: RoomConnection[]=[];
const flush = async () => {for(let i=0;i<12;i++)await Promise.resolve();};
function setup(){
  vi.stubGlobal('location',{origin:'http://localhost'});
  mocks.request.mockResolvedValue({namespace:'/watchparty/rooms/room',ticket:'ticket-1'});
  const onSnapshot=vi.fn();const onClosed=vi.fn();
  const client=new RoomConnection({roomId:'room',onSnapshot,onClosed,onConnection:vi.fn(),onError:vi.fn()});clients.push(client);client.start();
  return {client,onSnapshot,onClosed};
}
afterEach(()=>{clients.splice(0).forEach(c=>c.close());mocks.sockets.length=0;vi.resetAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});
describe('room session recovery',()=>{
  it('obtains a fresh single-use ticket for every reconnect',async()=>{
    vi.useFakeTimers();const {client}=setup();await flush();
    mocks.sockets[0].deliver('snapshot',initial);mocks.sockets[0].deliver('disconnect','transport close');
    mocks.request.mockResolvedValue({namespace:'/watchparty/rooms/room',ticket:'ticket-2'});
    await vi.advanceTimersByTimeAsync(500);await flush();
    expect(mocks.request).toHaveBeenCalledTimes(2);expect(mocks.sockets[1].options.auth.ticket).toBe('ticket-2');client.close();
  });
  it('buffers events during gap recovery and drops stale duplicate events',async()=>{
    const {onSnapshot}=setup();await flush();const socket=mocks.sockets[0];socket.deliver('snapshot',initial);
    let resolve!:(value:Snapshot)=>void;mocks.request.mockReturnValue(new Promise<Snapshot>(r=>{resolve=r;}));
    socket.deliver('event',{eventId:'e4',sequence:4,topic:'owner.presence',payload:{present:true,ownerName:'Mira'}});
    socket.deliver('event',{eventId:'e5',sequence:5,topic:'owner.presence',payload:{present:false,ownerName:'Mira'}});
    resolve({...initial,sequence:4});await flush();
    expect(onSnapshot.mock.lastCall?.[0].sequence).toBe(5);
    const calls=onSnapshot.mock.calls.length;socket.deliver('event',{eventId:'e4',sequence:4,topic:'owner.presence',payload:{present:true}});
    expect(onSnapshot.mock.lastCall?.[0].sequence).toBe(5);expect(onSnapshot.mock.calls.length).toBe(calls+1);
  });
  it('ignores sync replies from a previous stream',async()=>{
    const {client}=setup();await flush();const socket=mocks.sockets[0];socket.deliver('snapshot',initial);
    const syncing=client.sync(1000);const request=socket.sent.find(e=>e.event==='sync.request')!.payload;
    socket.deliver('snapshot',{...initial,sequence:3,stream:{...initial.stream,sessionId:'s2',revision:2}});
    socket.deliver('sync.result',{requestId:request.requestId,status:'APPLIED',targetPositionMs:5000});
    expect(await syncing).toBeUndefined();
  });
  it('never sends playback reports before the authoritative snapshot or while disconnected',async()=>{
    const {client}=setup();await flush();const socket=mocks.sockets[0];client.report(1000,true);expect(socket.sent).toHaveLength(0);
    socket.deliver('snapshot',initial);client.report(1234.5,false);expect(socket.sent.find(e=>e.event==='playback.report')).toEqual({event:'playback.report',payload:{streamSessionId:'s1',positionMs:1235,playing:false}});
    socket.deliver('disconnect');client.report(3000,true);expect(socket.sent.filter(e=>e.event==='playback.report')).toHaveLength(1);
  });
});

it('chat history requests cannot overwrite a newer reconnect snapshot',async()=>{
  const {client,onSnapshot}=setup();await flush();const socket=mocks.sockets[0];
  const message={id:'m5',roomId:'room',identityId:'guest',membershipId:'member',displayName:'Jo',avatar:'berry',text:'Hello',createdAt:'2026-11-12T06:00:00Z',sequence:5};
  socket.deliver('snapshot',{...initial,sequence:5,chat:{messages:[message],hasMore:true}});
  let resolve!:(value:unknown)=>void;mocks.request.mockReturnValue(new Promise(r=>{resolve=r;}));
  const loading=client.loadEarlierChat();
  socket.deliver('snapshot',{...initial,sequence:6,chat:{messages:[{...message,id:'m6',sequence:6}],hasMore:false}});
  resolve({messages:[{...message,id:'old',sequence:1}],hasMore:false});await loading;
  expect(onSnapshot.mock.lastCall?.[0].chat.messages.map((m:any)=>m.id)).toEqual(['m6']);
});

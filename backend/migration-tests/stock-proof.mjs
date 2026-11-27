import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { io } from '../watchparty/node_modules/socket.io-client/build/esm/index.js';
const base = process.env.STOCK_URL ?? 'http://127.0.0.1:18080';
const wait = (socket, event, predicate = () => true) => new Promise((resolve, reject) => {
 const timer = setTimeout(() => { socket.off(event, listener); reject(new Error(`Timeout: ${event}`)); }, 5000);
 const listener = data => { if (predicate(data)) { clearTimeout(timer); socket.off(event, listener); resolve(data); } };
 socket.on(event, listener);
});
assert.equal(await (await fetch(base + '/ping')).json(), 'pong');
const { name } = await (await fetch(base + '/createRoom', {method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).json();
const peers = [];
try {
 for (let n=0;n<8;n++) {
   const id = randomUUID();
   const socket = io(base + name, {transports:['websocket'],query:{clientId:id},autoConnect:false});
   const roster = wait(socket,'roster',r=>r.length === n+1);
   socket.connect(); await roster; peers.push({id,socket});
 }
 const [a,b] = peers;
 const names=wait(b.socket,'REC:nameMap',x=>x[a.id] === 'Alice'); a.socket.emit('CMD:name','Alice'); await names;
 const pictures=wait(b.socket,'REC:pictureMap',x=>x[a.id] === 'avatar'); a.socket.emit('CMD:picture','avatar'); await pictures;
 const host=wait(a.socket,'REC:host',x=>x.video === 'https://example.com/movie.mp4'); b.socket.emit('CMD:host','https://example.com/movie.mp4'); await host;
 for (const msg of ['offer','answer','ice']) { const signal=wait(b.socket,'signal'); a.socket.emit('signal',{to:b.id,msg}); assert.deepEqual(await signal,{from:a.id,msg}); }
 const voice=wait(b.socket,'roster',r=>r.find(x=>x.id===a.id)?.isVideoChat); a.socket.emit('CMD:joinVideo'); await voice;
 const ts=wait(b.socket,'REC:tsMap'); await ts;
 const leave=wait(b.socket,'roster',r=>r.length===7); a.socket.disconnect(); await leave;
 console.log(JSON.stringify({pass:true,peers:8,capabilities:['ping','createRoom','namespace/roster','name','avatar','URL receipt','targeted signaling','voice opt-in'],gaps:['unlocked guest hosted URL','immediate disconnect removal','shared timestamps'],mediaTested:false}));
} finally { for (const {socket} of peers) socket.disconnect(); }

import { cp, mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = resolve(root, 'public/vendor/avplayer/1.3.1-watchparty.1');
await mkdir(destination, { recursive: true });
// Remove obsolete generated versions without removing the active directory:
// Vite may be serving its files while a separate production build runs.
for (const entry of await readdir(resolve(root, 'public/vendor/avplayer'))) {
  if (entry !== '1.3.1-watchparty.1') await rm(resolve(root, 'public/vendor/avplayer', entry), { recursive: true, force: true });
}
const source = resolve(root, 'node_modules/@libmedia/avplayer/dist/umd');
for (const entry of await readdir(source)) {
  if (/^(?:avplayer|\d+\.avplayer)\.js$/.test(entry)) await cp(resolve(source, entry), resolve(destination, entry));
}
// Version-pinned equivalent of vendor-patches/avplayer-seek.patch. Fail closed
// when the upstream method changes, rather than silently shipping an unpatched build.
const filename = resolve(destination, 'avplayer.js');
const original = await readFile(filename, 'utf8');
const start = original.indexOf('async doSeek(');
const end = original.indexOf('async seek(', start);
const method = original.slice(start, end);
const head = 'async doSeek(e,t){';
const reset = 'this.subtitleRender&&(this.subtitleRender.reset(),this.subtitleRender.start())';
if (start < 0 || end < start || method.split(head).length !== 2 || method.split(reset).length !== 2) throw new Error('AVPlayer seek patch no longer matches the pinned upstream build');
const patched = method.replace(head, `${head}this.subtitleRender&&this.subtitleRender.reset();`).replace(reset, 'this.subtitleRender&&this.subtitleRender.start()');
// Expose selected streams' compressed packet horizon for the canvas renderer,
// which has no HTMLMediaElement.buffered. Names and packet offsets below are
// from the pinned DemuxPipeline.croppingAVPacketQueue implementation.
let bundle = original.slice(0, start) + patched + original.slice(end);
function replaceOnce(search, replacement) {
  if (bundle.split(search).length !== 2) throw new Error('AVPlayer packet-buffer patch no longer matches the pinned build');
  bundle = bundle.replace(search, replacement);
}
// Respect the current source’s opt-in even when a previous player populated
// libmedia’s global compiled-module cache.
replaceOnce('if(Ue.Resource.has(s))return Ue.Resource.get(s);const a=this.options.getWasm', 'const a=this.options.getWasm');
replaceOnce('/dist`,e,t);if(a){let e;', '/dist`,e,t);if(a){if(Ue.Resource.has(s))return Ue.Resource.get(s);let e;');
replaceOnce('async croppingAVPacketQueue(e,t){', `async getPacketHorizon(taskId, indexes) {
  const task = this.tasks.get(taskId);
  if (!task || !indexes.length) return 0;
  if (task.demuxEnded && task.watchpartyReachedEnd) return Infinity;
  return Math.min(...indexes.map(index => {
    const packets = task.cacheAVPackets.get(index);
    const packet = packets && packets[packets.length - 1];
    if (!packet || packet <= 0) return 0;
    return Number((0,u.Mr)(o.f[17](packet + 16), packet + 72, g.i0));
  }));
}async croppingAVPacketQueue(e,t){`);
replaceOnce('await this.doDemux(r,i)&&(r.demuxEnded=!0', '(r.watchpartyDemuxResult=await this.doDemux(r,i))&&(r.watchpartyReachedEnd=r.watchpartyDemuxResult===-1048576,r.demuxEnded=!0');
replaceOnce('getStats(){return this.GlobalData.stats}', `getPacketHorizon() {
  const indexes = [this.selectedVideoStream, this.selectedAudioStream].filter(Boolean).map(stream => stream.index);
  return Ue.DemuxerThread.getPacketHorizon(this.taskId, indexes);
}getStats(){return this.GlobalData.stats}`);
// File inputs normally retain only ten packets. Apply the existing duration-
// based preloader to local software playback as well, allowing a 2s reserve.
replaceOnce('let i=10;if(w.Yj(this.source)||this.source instanceof de.A)', 'let i=10;if(w.Yj(this.source)||this.source instanceof de.A||(!this.useMSE&&this.source instanceof File))');
await writeFile(filename, bundle);

// A queued audio/video mux tick can run after the browser detaches the track.
// Stop that loop before it can read buffered ranges or enqueue another packet.
const mseFilename = resolve(destination, '26.avplayer.js');
const mseChunk = await readFile(mseFilename, 'utf8');
const muxTick = 'createLoop(t,e){t.loop=new z.A((()=>{';
if (mseChunk.split(muxTick).length !== 2) throw new Error('AVPlayer MSE loop patch no longer matches the pinned build');
await writeFile(mseFilename, mseChunk.replace(muxTick, muxTick +
  'if(Array.prototype.indexOf.call(e.mediaSource.sourceBuffers,t.track.getSourceBuffer())<0)return!1;'));
await cp(resolve(root, 'vendor-patches/avplayer-mse-detach.patch'), resolve(destination, 'avplayer-mse-detach.patch'));
await cp(resolve(root, 'node_modules/@libmedia/cheap/dist/cheap-polyfill.js'), resolve(destination, 'cheap-polyfill.js'));
await cp(resolve(root, 'vendor-notices/avplayer.txt'), resolve(destination, 'NOTICE.txt'));
await cp(resolve(root, 'vendor-notices/COPYING.LGPLv3'), resolve(destination, 'COPYING.LGPLv3'));
await cp(resolve(root, 'vendor-notices/COPYING.GPLv3'), resolve(destination, 'COPYING.GPLv3'));
await cp(resolve(root, 'vendor-patches/avplayer-seek.patch'), resolve(destination, 'avplayer-seek.patch'));

await cp(resolve(root, 'node_modules/assjs/LICENSE'), resolve(destination, 'ASSJS-LICENSE'));
await cp(resolve(root, 'node_modules/ass-compiler/LICENSE'), resolve(destination, 'ASS-COMPILER-LICENSE'));

await cp(resolve(root, 'vendor-codecs/libmedia-1.3.1'), resolve(destination, 'codecs'), { recursive: true });
await cp(resolve(root, 'vendor-patches/avplayer-local-buffer.patch'), resolve(destination, 'avplayer-local-buffer.patch'));

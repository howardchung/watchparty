import { expect, test } from '@playwright/test';
for(const compact of [false,true])test(`new file prepares automatically and counts down (${compact?'compact RTL dark':'desktop'})`,async({page})=>{
 await page.setViewportSize({width:compact?390:1280,height:900});
 await page.goto('/e2e/automatic-sync.html?owner');
 await page.evaluate(compact=>{if(compact){document.documentElement.dir='rtl';document.documentElement.dataset.theme='dark';document.documentElement.style.fontSize='24px';}(window as any).info.ready=false;(window as any).info.durationMs=0;(window as any).frame('PREPARING');},compact);
 await expect(page.locator('output')).toHaveText('locked');
 expect(await page.evaluate(()=>(window as any).calls.filter((c:any)=>c.action==='prepare').length)).toBe(0);
 expect(await page.evaluate(()=>(window as any).calls.some((c:any)=>c.action==='failed'))).toBe(false);
 await page.evaluate(()=>{(window as any).info.ready=true;(window as any).info.durationMs=60000;});
 await expect.poll(()=>page.evaluate(()=>(window as any).calls.filter((c:any)=>c.action==='prepare').length)).toBe(1);
 await expect.poll(()=>page.evaluate(()=>(window as any).calls.some((c:any)=>c.action==='ready'&&c.body.ready))).toBe(true);
 await page.evaluate(()=>(window as any).frame('SCHEDULED'));
 await expect(page.locator('.group-sync-countdown')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>(window as any).calls.some((c:any)=>c.action==='play')),{timeout:6000}).toBe(true);
 expect(await page.evaluate(()=>(window as any).calls.some((c:any)=>['invite','respond','commit','sync'].includes(c.action)))).toBe(false);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('joining retries unavailable owner telemetry then privately seeks once with owner pause state',async({page})=>{
 await page.goto('/e2e/automatic-sync.html?unavailable');
 await expect.poll(()=>page.evaluate(()=>(window as any).calls.filter((c:any)=>c.action==='sync').length)).toBe(1);
 await page.evaluate(()=>(window as any).setResult({status:'APPLIED',targetPositionMs:12000,playing:false}));
 await expect.poll(()=>page.evaluate(()=>(window as any).calls.some((c:any)=>c.action==='prepare'&&c.body===12000)),{timeout:6000}).toBe(true);
 expect(await page.evaluate(()=>(window as any).info.paused)).toBe(true);
 await page.evaluate(()=>(window as any).snapshot());await page.waitForTimeout(3500);
 expect(await page.evaluate(()=>(window as any).calls.filter((c:any)=>c.action==='sync').length)).toBe(2);
});
test('joining during countdown waits; an included start replaces private catch-up',async({page})=>{
 await page.goto('/e2e/automatic-sync.html?waiting');await page.waitForTimeout(500);
 expect(await page.evaluate(()=>(window as any).calls.some((c:any)=>c.action==='sync'))).toBe(false);
 await page.evaluate(()=>(window as any).frame('COMPLETED',false));
 await expect.poll(()=>page.evaluate(()=>(window as any).calls.some((c:any)=>c.action==='prepare'&&c.body===12000))).toBe(true);
 await page.goto('/e2e/automatic-sync.html?waiting&included');await page.waitForTimeout(500);
 expect(await page.evaluate(()=>(window as any).calls.some((c:any)=>c.action==='sync'))).toBe(false);
});

test('fresh integrated playback prepares zero without flushing packets and tolerates encoder delay',async({page})=>{
 await page.route('**/adapter-test.html',r=>r.fulfill({contentType:'text/html',body:'<html><head></head><body></body></html>'}));
 await page.route('**/vendor/avplayer/**/*.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
 await page.goto('/adapter-test.html');
 const result=await page.evaluate(async()=>{
  const {AvMedia}=await import('/src/components/avPlayer.ts');
  const host=document.createElement('div');document.body.append(host);const seeks:number[]=[];
  class Player{
   currentTime=128n;
   constructor(options:{container:HTMLElement}){const video=document.createElement('video');options.container.append(video);Object.defineProperties(video,{currentTime:{value:.128,writable:true},readyState:{value:4},buffered:{value:{length:1,start:()=>.128,end:()=>3}},seeking:{value:false}});}
   async load(){} on(){} isLive(){return false;}getDuration(){return 120000n;}getStreams(){return [];}getSelectedAudioStreamId(){return -1;}getSelectedSubtitleStreamId(){return -1;}setVolume(){}async play(){}async pause(){}async destroy(){}async seek(value:bigint){seeks.push(Number(value));}
  }
  (window as any).AVPlayer=Player;
  const media=new AvMedia(host,'https://example.test/movie.mp4',{tracks(){},state(){},update(){},error(message){throw Error(message);}});
  await media.ready;await media.prepareForSync(0);const result={seeks,position:media.currentTime,paused:media.paused};await media.destroy();return result;
 });
 expect(result.seeks).toEqual([]);expect(result.position).toBe(.128);expect(result.paused).toBe(true);
});

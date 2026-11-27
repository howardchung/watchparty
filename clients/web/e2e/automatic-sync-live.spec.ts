import { readFile } from 'node:fs/promises';
import { expect, test, type BrowserContext } from '@playwright/test';

test('new source starts everyone; late joiners catch up without disturbing existing players',async({browser})=>{
 test.skip(process.env.WATCHPARTY_SYNC_E2E!=='1','Requires a local disposable backend.');test.setTimeout(120000);
 const contexts:BrowserContext[]=[];
 try{
  const media=await readFile('e2e/fixtures/player-mkv/sync-long.mp4');
  for(let i=0;i<4;i++){
   const context=await browser.newContext();contexts.push(context);
   await context.route('https://media.example.test/auto-sync.mp4',route=>{
    const range=/bytes=(\d+)-(\d*)/.exec(route.request().headers().range||'');const start=Number(range?.[1]||0),end=range?.[2]?Math.min(Number(range[2]),media.length-1):media.length-1;
    return route.fulfill({status:range?206:200,contentType:'video/mp4',headers:{'access-control-allow-origin':'*','content-length':String(end-start+1),'accept-ranges':'bytes',...(range?{'content-range':`bytes ${start}-${end}/${media.length}`}:{})},body:media.subarray(start,end+1)});
   });
  }
  const [owner,viewer,late,playingLate]=await Promise.all(contexts.map(c=>c.newPage()));
  const errors:string[]=[];for(const p of [owner,viewer,late,playingLate])p.on('pageerror',e=>errors.push(e.message));
  await owner.goto('/');await owner.getByRole('button',{name:'Start a party',exact:true}).click();await owner.getByRole('button',{name:'Start the party',exact:true}).click();
  await expect(owner.getByRole('textbox',{name:'Message the party',exact:true})).toBeEnabled();
  const code=await owner.evaluate(()=>sessionStorage.getItem('roomio-active-code'));
  const join=async(p:typeof viewer)=>{await p.goto(`/?invite=${code}`);await p.getByRole('button',{name:'Join party',exact:true}).click();await expect(p.getByRole('textbox',{name:'Message the party',exact:true})).toBeEnabled();};
  await join(viewer);
  await owner.getByRole('textbox',{name:'Direct video URL',exact:true}).fill('https://media.example.test/auto-sync.mp4');await owner.getByRole('button',{name:'Start stream',exact:true}).click();
  await Promise.all([owner,viewer].map(p=>expect(p.locator('.group-sync-countdown')).toBeVisible({timeout:25000})));
  for(const p of [owner,viewer])await expect.poll(()=>p.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>!v.paused),{timeout:8000}).toBe(true);
  const times=await Promise.all([owner,viewer].map(p=>p.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>v.currentTime)));expect(Math.abs(times[0]-times[1])).toBeLessThan(.4);
  await owner.waitForTimeout(1800);
  await owner.getByRole('button',{name:'Pause',exact:true}).click();
  await owner.getByRole('slider',{name:'Playback position',exact:true}).fill('12');
  await expect.poll(()=>owner.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>Math.abs(v.currentTime-12)),{timeout:10000}).toBeLessThan(.5);
  await owner.waitForTimeout(3500);
  await expect.poll(()=>owner.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
  const frozen=await owner.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>v.currentTime);
  await join(late);
  await expect.poll(()=>late.locator('video:not([hidden])').evaluate((v:HTMLVideoElement,frozen:number)=>Math.abs(v.currentTime-frozen),frozen),{timeout:15000}).toBeLessThan(.5);
  await expect.poll(()=>late.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>v.paused),{timeout:10000}).toBe(true);
  expect(await owner.locator('video:not([hidden])').evaluate((v:HTMLVideoElement,frozen:number)=>v.paused&&Math.abs(v.currentTime-frozen)<.05,frozen)).toBe(true);
  await playingLate.goto(`/?invite=${code}`);
  await owner.getByRole('slider',{name:'Playback position',exact:true}).fill('2');
  await expect.poll(()=>owner.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>Math.abs(v.currentTime-2)),{timeout:10000}).toBeLessThan(.5);
  await owner.getByRole('button',{name:'Play',exact:true}).click();await owner.waitForTimeout(3500);
  await playingLate.getByRole('button',{name:'Join party',exact:true}).click();
  await expect(playingLate.getByRole('textbox',{name:'Message the party',exact:true})).toBeEnabled();
  // Private catch-up includes owner telemetry and decoder scheduling jitter.
  await expect.poll(async()=>{const positions=await Promise.all([owner,playingLate].map(p=>p.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>v.currentTime)));return Math.abs(positions[0]-positions[1]);},{timeout:35000}).toBeLessThan(1);
  expect(await playingLate.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>v.paused)).toBe(false);
  await expect(owner.locator('.group-sync-countdown')).toHaveCount(0);
  expect(errors).toEqual([]);
 }finally{await Promise.all(contexts.map(c=>c.close()));}
});

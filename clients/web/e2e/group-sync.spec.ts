import { readFile } from 'node:fs/promises';
import { test, expect, type BrowserContext } from '@playwright/test';

for(const compact of [false,true])test(`live group sync: ${compact?'compact dark RTL large text':'desktop light'}`,  async ({browser},testInfo)=>{
 test.setTimeout(120000);
 test.skip(process.env.WATCHPARTY_SYNC_E2E!=='1','Requires the local fresh backend.');
 const contexts:BrowserContext[]=[];
 const errors:string[]=[];const forbiddenAuthHosts:string[]=[];
 try {
  const media=await readFile('e2e/fixtures/player-mkv/movie.mp4');
  for(let i=0;i<3;i++){
   const context=await browser.newContext({viewport:compact?{width:360,height:800}:{width:1280,height:800}});contexts.push(context);
   await context.route('https://media.example.test/sync.mp4',route=>{
    if(route.request().method()==='HEAD')return route.fulfill({status:200,headers:{'access-control-allow-origin':'*','accept-ranges':'bytes','content-length':String(media.length)}});
    const range=/bytes=(\d+)-(\d*)/.exec(route.request().headers().range||'');const start=Number(range?.[1]||0),end=range?.[2]?Math.min(Number(range[2]),media.length-1):media.length-1;
    return route.fulfill({status:range?206:200,contentType:'video/mp4',headers:{'access-control-allow-origin':'*','content-length':String(end-start+1),'Accept-Ranges':'bytes',...(range?{'Content-Range':`bytes ${start}-${end}/${media.length}`}:{})},body:media.subarray(start,end+1)});
   });
  }
  const [owner,guest,declined]=await Promise.all(contexts.map(c=>c.newPage()));
  for(const page of [owner,guest,declined]){page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{const host=new URL(request.url()).hostname;if(/firebase|identitytoolkit|securetoken/.test(host))forbiddenAuthHosts.push(host)});}
  await owner.goto(compact?'/?theme=dark&largeText=1&dir=rtl':'/');await owner.getByRole('button',{name:'Start a party',exact:true}).click();await owner.getByRole('button',{name:'Start the party',exact:true}).click();
  await expect(owner.getByRole('textbox',{name:'Message the party',exact:true})).toBeEnabled();
  const code=await owner.evaluate(()=>sessionStorage.getItem('roomio-active-code'));
  for(const p of [guest,declined]){await p.goto(`/?invite=${code}`);await p.getByRole('button',{name:'Join party',exact:true}).click();await expect(p.getByRole('textbox',{name:'Message the party',exact:true})).toBeEnabled();}
  await owner.getByRole('textbox',{name:'Direct video URL',exact:true}).fill('https://media.example.test/sync.mp4');await owner.getByRole('button',{name:'Start stream',exact:true}).click();
  for(const p of [owner,guest,declined])await expect.poll(()=>p.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>v.readyState),{timeout:25000}).toBeGreaterThanOrEqual(3);
  await owner.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>{v.currentTime=1;return v.play()});
  await owner.getByRole('button',{name:'Sync to room',exact:true}).first().click();
  await expect(owner.getByRole('dialog')).toContainText('Sync together');
  expect(await owner.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>v.paused)).toBe(false);
  await expect(owner.locator('.group-sync-person')).toHaveCount(0);
  await owner.getByRole('button',{name:'Ask everyone to sync',exact:true}).click();
  await expect(guest.getByRole('dialog')).toContainText('Sync request');
  await expect(owner.getByRole('button',{name:'Start with 0',exact:true})).toBeDisabled();
  expect(await owner.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
  const target=await owner.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>v.currentTime);
  await guest.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>{v.currentTime=4;return v.play()});
  await guest.getByRole('button',{name:'Accept & pause',exact:true}).click();
  await expect.poll(()=>guest.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
  await expect(owner.getByRole('button',{name:'Start with 1',exact:true})).toBeEnabled();
  await guest.getByRole('button',{name:'Change my mind & keep watching',exact:true}).click();
  await expect(owner.getByRole('button',{name:'Start with 0',exact:true})).toBeDisabled();
  await expect(guest.getByRole('dialog')).toHaveCount(0);
  await expect.poll(()=>guest.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>v.paused)).toBe(false);
  await guest.getByRole('button',{name:'Sync to room',exact:true}).first().click();await guest.getByRole('button',{name:'Accept & pause',exact:true}).click();
  await declined.getByRole('button',{name:'Not joining',exact:true}).click();
  await expect(owner.locator('.group-sync-person--accepted')).toHaveCount(1);await expect(owner.locator('.group-sync-person--declined')).toHaveCount(1);
  await owner.screenshot({path:testInfo.outputPath('owner-invitation.png')});
  await owner.getByRole('button',{name:'Start with 1',exact:true}).click();
  for(const p of [owner,guest])await expect(p.locator('.group-sync-countdown')).toBeVisible({timeout:20000});
  for(const p of [owner,guest])await expect.poll(()=>p.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>v.paused),{timeout:8000}).toBe(false);
  const times=await Promise.all([owner,guest].map(p=>p.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>v.currentTime)));
  expect(times[0]).toBeGreaterThanOrEqual(target);expect(Math.abs(times[0]-times[1])).toBeLessThan(.35);
  await owner.waitForTimeout(1500);
  await owner.getByRole('button',{name:'Pause',exact:true}).click();
  await owner.getByRole('slider',{name:'Playback position',exact:true}).fill('2');
  await expect.poll(()=>owner.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>Math.abs(v.currentTime-2)),{timeout:10000}).toBeLessThan(.5);
  await owner.waitForTimeout(1500);
  await guest.getByRole('button',{name:'Sync to room',exact:true}).first().click();
  await expect.poll(()=>guest.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>v.currentTime),{timeout:10000}).toBeLessThan(2.5);
  expect(await owner.locator('video:not([hidden])').evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
  expect(await owner.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);expect(forbiddenAuthHosts).toEqual([]);
 }finally{await Promise.all(contexts.map(c=>c.close()));}
});

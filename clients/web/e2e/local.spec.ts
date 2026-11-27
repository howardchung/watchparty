import { readFile } from 'node:fs/promises';
import { test, expect, type Page, type BrowserContext } from '@playwright/test';

async function openHome(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start a party', exact: true })).toBeVisible();
}
async function create(page: Page) {
  await page.getByRole('button', { name: 'Start a party', exact: true }).click();
  await page.getByRole('button', { name: 'Start the party', exact: true }).click();
  await expect(page.getByRole('textbox', {name:'Message the party',exact:true})).toBeEnabled({timeout:20000});
  await page.getByRole('button', { name: 'Invite friends', exact: true }).first().click();
  const code = await page.getByRole('dialog').getByRole('textbox', { name: 'Invite code', exact: true }).inputValue();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  return code;
}
async function join(page: Page, code: string) {
  await page.goto(`/?invite=${code}`);
  await expect(page.getByRole('heading', { name: 'Room preview', exact: true })).toBeVisible({timeout:20000});
  await page.getByRole('button', { name: 'Join party', exact: true }).click();
  await expect(page.getByRole('textbox', {name:'Message the party',exact:true})).toBeEnabled({timeout:20000});
}
async function leave(page: Page) {
  await page.getByRole('button', { name: 'Leave party', exact: true }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Leave party', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start a party', exact: true })).toBeVisible();
}

test('fixture previews make no API/Auth/Socket requests and omit directional sync', async ({ page }) => {
  const unexpected: string[] = [];
  page.on('request', request => { if (/\/v1\/|9099|identitytoolkit|securetoken|socket.io/.test(request.url())) unexpected.push(request.url()); });
  await page.goto('/?preview=player-playing&theme=dark&largeText=1&dir=rtl');
  await expect(page.getByRole('button', { name: 'Sync to room', exact: true })).toBeVisible();
  await expect(page.getByText('Bring everyone to me')).toHaveCount(0);
  await page.waitForTimeout(500);
  expect(unexpected).toEqual([]);
});

test('real services: persistent profile, preview/cancel, two identities, owner absence and rejoin', async ({ browser }) => {
  const contexts: BrowserContext[] = [];
  try {
    const ownerContext = await browser.newContext(); contexts.push(ownerContext);
    const guestContext = await browser.newContext(); contexts.push(guestContext);
    const owner = await ownerContext.newPage(); const guest = await guestContext.newPage();
    await openHome(owner);
    await owner.getByRole('button', { name: /settings|profile/i }).first().click();
    await owner.getByRole('radio', { name: 'Frog Wizard', exact: true }).click();
    await owner.getByRole('button', { name: 'Save changes', exact: true }).click();
    await owner.reload();
    await expect(owner.getByText('Browser host', { exact: true }).first()).toBeVisible();
    const code = await create(owner);
    expect(code).toMatch(/^[0-9A-Z]{8}$/);
    await guest.goto(`/?invite=${code}`);
    await expect(guest.getByRole('heading', { name: 'Room preview', exact: true })).toBeVisible();
    await guest.getByRole('button', { name: 'Not now' }).click();
    await expect(guest.getByLabel('Invite code')).toHaveValue(code);
    await guest.getByRole('button', { name: 'Take a look', exact: true }).click();
    await guest.getByRole('button', { name: 'Join party', exact: true }).click();
    await expect(guest.getByRole('textbox', {name:'Message the party',exact:true})).toBeEnabled({timeout:20000});
    await expect(owner.locator('.participant-list:visible').first().getByText('You', { exact: true })).toBeVisible();
    await expect(owner.locator('.participant-list:visible').first().locator('.participant')).toHaveCount(2);
    await leave(owner);
    await expect(guest.getByText('Browser host left the room')).toBeVisible();
    await owner.reload();
    await owner.getByRole('button', { name: /return|rejoin/i }).click();
    await expect(owner.getByRole('textbox', {name:'Message the party',exact:true})).toBeEnabled({timeout:20000});
    await expect(guest.getByText('Browser host left the room')).toHaveCount(0);
    await leave(guest); await leave(owner);
    await guest.goto(`/?invite=${code}`);
    await expect(guest.getByRole('button', { name: 'Join party', exact: true })).toBeDisabled();
    await expect(guest.getByText('This party has ended and is no longer accepting guests.')).toBeVisible();
  } finally { await Promise.all(contexts.map(context => context.close())); }
});

test('real video, independent controls, private owner sync, offline recovery, and stream abort', async ({ browser }) => {
  test.skip(!process.env.ROOMIO_TEST_VIDEO, 'Set ROOMIO_TEST_VIDEO to a local MP4 fixture.');
  const contexts: BrowserContext[] = [];
  try {
    const a = await browser.newContext(); const b = await browser.newContext(); contexts.push(a,b);
    const media = await readFile(process.env.ROOMIO_TEST_VIDEO!);
    for (const context of contexts) await context.route('https://media.example.test/flower.mp4', route => {
      const range = /bytes=(\d+)-(\d*)/.exec(route.request().headers()['range'] || '');
      const start = range ? Number(range[1]) : 0;
      const end = range && range[2] ? Math.min(Number(range[2]), media.length-1) : media.length-1;
      return route.fulfill({status:range ? 206 : 200,contentType:'video/mp4',headers:{'Accept-Ranges':'bytes',...(range ? {'Content-Range':`bytes ${start}-${end}/${media.length}`} : {})},body:media.subarray(start,end+1)});
    });
    const owner=await a.newPage();const guest=await b.newPage();
    await openHome(owner);const code=await create(owner);await join(guest,code);
    await owner.getByRole('textbox', {name:'Direct video URL',exact:true}).fill('https://media.example.test/flower.mp4');
    await owner.getByRole('button',{name:'Start stream',exact:true}).click();
    for (const page of [owner,guest]) await expect.poll(()=>page.locator('video').evaluate((v:HTMLVideoElement)=>v.readyState)).toBeGreaterThanOrEqual(2);
    await owner.locator('video').evaluate((v:HTMLVideoElement)=>{v.pause();v.currentTime=3;});
    await guest.locator('video').evaluate((v:HTMLVideoElement)=>{v.pause();v.currentTime=0.5;});
    await owner.waitForTimeout(1400);
    expect(await owner.locator('video').evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
    expect(await guest.locator('video').evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeLessThan(1);
    await guest.getByRole('button',{name:'Sync to room',exact:true}).click();
    await expect.poll(()=>guest.locator('video').evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThanOrEqual(2.9);
    await guest.locator('video').evaluate((v:HTMLVideoElement)=>{v.currentTime=4;});
    await guest.getByRole('button',{name:'Sync to room',exact:true}).click();
    expect(await guest.locator('video').evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeLessThan(3.3);
    await b.setOffline(true);await expect(guest.getByText('Reconnecting to room…')).toBeVisible();
    await b.setOffline(false);await expect(guest.getByText('Connected',{exact:true})).toBeVisible({timeout:20000});
    expect(await guest.locator('video').evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeLessThan(3.3);
    await owner.getByRole('button',{name:'End stream for everyone',exact:true}).click();
    await owner.getByRole('button',{name:'End for everyone',exact:true}).click();
    await expect(guest.locator('video')).toHaveCount(0);
    await leave(guest);await leave(owner);
  } finally {await Promise.all(contexts.map(c=>c.close()));}
});

test('mesh voice connects at two and four peers with real browser WebRTC', async ({browser})=>{
  test.setTimeout(120000);
  const contexts: BrowserContext[]=[];const pages:Page[]=[];
  let code='';
  try {
    for(let i=0;i<4;i++) {
      const context=await browser.newContext({permissions:['microphone'], reducedMotion:'reduce'});contexts.push(context);
      await context.addInitScript((relay)=>{
        const Native=window.RTCPeerConnection;
        const peers:RTCPeerConnection[]=[];
        (window as any).__roomioPeers=peers;
        window.RTCPeerConnection=class extends Native {
          constructor(config?:RTCConfiguration){super({...config,...(relay ? {iceTransportPolicy:'relay' as const} : {})});peers.push(this);}
        };
      },process.env.ROOMIO_TEST_RELAY==='1');
      const page=await context.newPage();pages.push(page);
      page.on('websocket', ws => ws.on('framereceived', frame => { const match=/\"code\":\"([^\"]+)\"/.exec(String(frame.payload)); if(match && ['RATE_LIMITED','STALE_NEGOTIATION','SESSION_EXPIRED','FORBIDDEN','AUTH_UNAVAILABLE'].includes(match[1])) console.log('voice server code',i,match[1]); }));
      if(i===0){await openHome(page);code=await create(page);}
      else await join(page,code);
      await page.getByRole('button',{name:'Join voice',exact:true}).click();
      if([1,3].includes(i)) {
        for(const peerPage of pages) await expect.poll(()=>peerPage.evaluate(()=>((window as any).__roomioPeers as RTCPeerConnection[]).filter(p=>p.connectionState==='connected').length),{timeout:45000}).toBe(i);
      }
    }
    for(const page of pages) await page.locator('.voice-panel').getByRole('button',{name:'Unmute',exact:true}).click();
    for(const page of pages) await expect.poll(()=>page.evaluate(async()=>{
      const peers=((window as any).__roomioPeers as RTCPeerConnection[]).filter(p=>p.connectionState==='connected');
      const received=await Promise.all(peers.map(async pc=>{const stats=await pc.getStats();return [...stats.values()].some(s=>s.type==='inbound-rtp'&&s.kind==='audio'&&s.bytesReceived>0);}));
      return received.filter(Boolean).length;
    }),{timeout:20000}).toBe(3);
    await pages[0].locator('.voice-panel').getByRole('button',{name:'Mute',exact:true}).click();
    expect(await pages[0].evaluate(()=>((window as any).__roomioPeers as RTCPeerConnection[]).flatMap(p=>p.getSenders()).filter(s=>s.track?.kind==='audio').every(s=>!s.track!.enabled))).toBe(true);
    if(process.env.ROOMIO_TEST_RELAY==='1') {
      expect(await pages[0].evaluate(async()=>{
        const stats=await ((window as any).__roomioPeers as RTCPeerConnection[]).find(p=>p.connectionState==='connected')!.getStats();
        const transport=[...stats.values()].find(s=>s.type==='transport'&&s.selectedCandidatePairId);
        const pair=transport && stats.get(transport.selectedCandidatePairId);
        return pair && stats.get(pair.localCandidateId)?.candidateType;
      })).toBe('relay');
    }
    for(const page of pages.reverse()) await leave(page);
  } catch(error) {
    for(let i=0;i<pages.length;i++) console.log('voice diagnostic',i,await pages[i].evaluate(()=>({ui:document.querySelector('.voice-panel')?.textContent,peers:((window as any).__roomioPeers as RTCPeerConnection[]).map(p=>({state:p.connectionState,ice:p.iceConnectionState,signaling:p.signalingState}))})).catch(()=>({closed:true})));
    throw error;
  } finally {await Promise.all(contexts.map(c=>c.close()));}
});

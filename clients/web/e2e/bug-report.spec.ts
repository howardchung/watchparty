import { test, expect, type Page } from '@playwright/test';

async function roomFixture(page: Page, home = false) {
  const sent: Record<string, unknown>[] = [];
  const paths: string[] = [];
  let fail = true;
  const room = { id:'12345678-1234-1234-1234-123456789012',code:'ABCD2345',title:'Friday night screening',ownerIdentityId:'owner' };
  await page.addInitScript(() => localStorage.setItem('roomio-auth-format','backend-v1'));
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/refresh')) return route.fulfill({json:{identity:{id:'owner',name:'Mira',avatar:'comet',language:'en'},accessToken:'test',accessExpiresAt:new Date(Date.now()+3600000).toISOString(),refreshExpiresAt:new Date(Date.now()+86400000).toISOString()}});
    if (path.endsWith('/preview')) return route.fulfill({json:{code:room.code,title:room.title,ownerName:'Mira',ownerPresent:true,participantCount:1,availability:'OPEN',streamState:'EMPTY'}});
    if (path.endsWith('/join')) return route.fulfill({json:{room,membership:{id:'member',identityId:'owner',isOwner:true}}});
    if (path.endsWith('/snapshot')) return route.fulfill({json:{room,members:[{membershipId:'member',identityId:'owner',displayName:'Mira',avatar:'comet',isOwner:true,present:true}],stream:{sessionId:'',revision:0,state:'EMPTY',url:''},sequence:1}});
    if (path.endsWith('/bug-reports')) {
      paths.push(path);
      sent.push(route.request().postDataJSON());
      return route.fulfill(fail ? {status:503,json:{code:'UNAVAILABLE'}} : {status:201,json:{reportId:sent.at(-1)!.reportId}});
    }
    return route.fulfill({status:503,json:{code:'UNAVAILABLE'}});
  });
  await page.goto(home ? '/' : '/?invite='+room.code);
  if (!home) await page.getByRole('button',{name:'Join party',exact:true}).click();
  await expect(page.getByRole('button',{name:'Report a bug',exact:true})).toBeVisible();
  return {sent, paths, succeed: () => {fail=false;}};
}
for (const variant of [
  {name:'desktop light',width:1280,height:800,dark:false,rtl:false},
  {name:'mobile dark large RTL',width:360,height:800,dark:true,rtl:true},
]) test(`room bug report retains draft, retries original snapshot and sends diagnostics: ${variant.name}`, async ({page,context},info) => {
  await page.setViewportSize(variant);
  const fixture = await roomFixture(page);
  await page.evaluate(({dark,rtl}) => {document.documentElement.dir=rtl?'rtl':'ltr';document.documentElement.style.fontSize=rtl?'22px':'16px';if(dark)document.documentElement.dataset.theme='dark';console.warn('earlier failure accessToken=do-not-send https://secret.example/movie?token=hidden');},variant);
  const bug = page.getByRole('button',{name:'Report a bug',exact:true});
  await bug.click();
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByRole('button',{name:'Send',exact:true})).toBeDisabled();
  await dialog.getByRole('textbox',{name:'What went wrong?'}).fill('Voice becomes quiet when I play the movie.');
  await page.keyboard.press('Escape');
  await bug.click();
  await expect(dialog.getByRole('textbox')).toHaveValue('Voice becomes quiet when I play the movie.');
  await context.setOffline(true);
  await expect(dialog.getByRole('button',{name:'Send',exact:true})).toBeDisabled();
  await context.setOffline(false);
  await dialog.getByRole('button',{name:'Send',exact:true}).click();
  await expect(dialog).toContainText('Report wasn’t sent');
  const payload=fixture.sent[0];
  expect(payload.description).toBe('Voice becomes quiet when I play the movie.');
  expect(payload.clientInfo).toMatchObject({platform:'browser'});
  expect(String(payload.log)).toContain('app.started');
  expect(String(payload.log)).toContain('console.warn');
  expect(String(payload.log)).not.toContain('earlier failure');
  for (const event of ['auth.start', 'auth.response', 'http.start', 'http.complete', 'room.connect', 'report.send']) expect(String(payload.log)).toContain(event);
  expect(String(payload.log)).not.toContain('ABCD2345');
  expect(String(payload.log)).not.toMatch(/do-not-send|secret.example|hidden/);
  expect(Date.parse(String(payload.sessionStartedAt))).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath('bug-dialog.png'),fullPage:true});
  const sendBounds = await dialog.getByRole('button',{name:'Send',exact:true}).boundingBox();
  expect(sendBounds!.y + sendBounds!.height).toBeLessThanOrEqual(800);
  fixture.succeed();
  await dialog.getByRole('button',{name:'Send',exact:true}).click();
  await expect(dialog).toHaveCount(0);
  expect(fixture.sent[1]).toEqual(payload);
  await bug.click();
  await expect(page.getByRole('dialog').getByRole('textbox')).toHaveValue('');
});

for (const variant of [
  {name:'desktop clipboard',width:1280,height:900,dark:false,rtl:false},
  {name:'compact clipboard',width:360,height:800,dark:true,rtl:true},
]) test(`screenshots select, paste, remove, retain and retry: ${variant.name}`, async ({page,context}, info) => {
  await page.setViewportSize(variant);
  const fixture = await roomFixture(page);
  await page.evaluate(({dark,rtl}) => {document.documentElement.dir=rtl?'rtl':'ltr'; document.documentElement.style.fontSize=rtl?'22px':'16px'; if(dark)document.documentElement.dataset.theme='dark';},variant);
  await page.getByRole('button',{name:'Report a bug',exact:true}).click();
  const dialog=page.getByRole('dialog');
  const text=dialog.getByRole('textbox',{name:'What went wrong?'});
  await text.fill('Screenshot shows the playback problem.');
  const png=await page.evaluate(async () => {
    const canvas=document.createElement('canvas');canvas.width=320;canvas.height=180;
    const ctx=canvas.getContext('2d')!;ctx.fillStyle='#504080';ctx.fillRect(0,0,320,180);ctx.fillStyle='white';ctx.font='20px sans-serif';ctx.fillText('Playback problem',30,90);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await dialog.locator('input[type=file]').setInputFiles({name:'screenshot.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
  await expect(dialog.getByRole('img',{name:'Screenshot 1',exact:true})).toBeVisible();
  // Exercise the same clipboard event delivered by Ctrl/Cmd+V, without requiring OS clipboard access.
  await text.evaluate((element, image) => {
    const bytes=Uint8Array.from(atob(image),c=>c.charCodeAt(0));
    const data=new DataTransfer();data.items.add(new File([bytes],'clipboard.png',{type:'image/png'}));
    element.dispatchEvent(new ClipboardEvent('paste',{clipboardData:data,bubbles:true,cancelable:true}));
  },png);
  await expect(dialog.getByRole('img',{name:'Screenshot 2',exact:true})).toBeVisible();
  await dialog.getByRole('button',{name:'Remove screenshot 1',exact:true}).click();
  await expect(dialog.getByRole('img')).toHaveCount(1);
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  // Use the real browser clipboard for the explicit Paste screenshot button.
  await page.evaluate(async image => {
    const blob=await (await fetch(`data:image/png;base64,${image}`)).blob();
    await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
  },png);
  await dialog.getByRole('button',{name:'Paste screenshot',exact:true}).click();
  await expect(dialog.getByRole('img')).toHaveCount(2);
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Report a bug',exact:true}).click();
  await expect(dialog.getByRole('img')).toHaveCount(2);
  await context.setOffline(true);
  await expect(dialog.getByRole('button',{name:'Send',exact:true})).toBeDisabled();
  await context.setOffline(false);
  await dialog.getByRole('button',{name:'Send',exact:true}).click();
  await expect(dialog).toContainText('Report wasn’t sent');
  const payload=fixture.sent[0];
  const images=payload.screenshots as {contentType:string;data:string}[];
  expect(images).toHaveLength(2);
  expect(images[0]).toEqual({contentType:'image/png',data:png});
  expect(images[1].contentType).toBe('image/png');
  // Chromium may re-encode clipboard PNG bytes; verify the pasted pixels.
  const normalized=await page.evaluate(async images => Promise.all(images.map(async image => {
    const bitmap=await createImageBitmap(await (await fetch(`data:${image.contentType};base64,${image.data}`)).blob());
    const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
    canvas.getContext('2d')!.drawImage(bitmap,0,0);bitmap.close();return canvas.toDataURL();
  })),images);
  expect(normalized[1]).toEqual(normalized[0]);
  await expect(dialog.getByRole('img')).toHaveCount(2);
  await page.screenshot({path:info.outputPath('screenshots.png'),fullPage:true});
  const bounds=await dialog.getByRole('button',{name:'Send',exact:true}).boundingBox();
  expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(variant.height);
  fixture.succeed();
  await dialog.getByRole('button',{name:'Send',exact:true}).click();
  await expect(dialog).toHaveCount(0);
  expect(fixture.sent[1]).toEqual(payload);
  await page.getByRole('button',{name:'Report a bug',exact:true}).click();
  await expect(dialog.getByRole('img')).toHaveCount(0);
  // Invalid selections have recovery without destroying the text draft.
  await dialog.locator('input[type=file]').setInputFiles({name:'notes.txt',mimeType:'text/plain',buffer:Buffer.from('text')});
  await expect(dialog.getByRole('alert')).toContainText('Choose a PNG');
  await expect(text).toHaveValue('');
  await dialog.locator('input[type=file]').setInputFiles(Array.from({length:4},(_,i)=>({name:`screen${i}.png`,mimeType:'image/png',buffer:Buffer.from(png,'base64')})));
  await expect(dialog.getByRole('alert')).toContainText('Choose up to 3');
});

test('editing screenshots after a failed report creates a new report ID', async ({page}) => {
 const fixture=await roomFixture(page);
 await page.getByRole('button',{name:'Report a bug',exact:true}).click();
 const dialog=page.getByRole('dialog');
 await dialog.getByRole('textbox').fill('Unclear playback controls');
 await dialog.getByRole('button',{name:'Send',exact:true}).click();
 await expect(dialog).toContainText('Report wasn’t sent');
 const data=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=1;canvas.height=1;return canvas.toDataURL().split(',')[1];});
 await dialog.locator('input[type=file]').setInputFiles({name:'screen.png',mimeType:'image/png',buffer:Buffer.from(data,'base64')});
 await expect(dialog.getByRole('img')).toHaveCount(1);
 fixture.succeed();
 await dialog.getByRole('button',{name:'Send',exact:true}).click();
 await expect(dialog).toHaveCount(0);
 expect(fixture.sent[1].reportId).not.toEqual(fixture.sent[0].reportId);
 expect(fixture.sent[1].screenshots).toEqual([{contentType:'image/png',data}]);
});

for (const variant of [
  {name:'desktop light',width:1280,height:800,rtl:false},
  {name:'compact dark large RTL',width:360,height:800,rtl:true},
]) test(`home reports without joining a room: ${variant.name}`, async ({page,context},info) => {
  await page.setViewportSize(variant);
  const fixture = await roomFixture(page, true);
  await page.evaluate(rtl => { document.documentElement.dir=rtl?'rtl':'ltr'; document.documentElement.style.fontSize=rtl?'22px':'16px'; document.documentElement.dataset.theme=rtl?'dark':'light'; }, variant.rtl);
  const bug = page.getByRole('button',{name:'Report a bug',exact:true});
  await bug.click();
  const dialog = page.getByRole('dialog');
  const editor = dialog.getByRole('textbox',{name:'What went wrong?'});
  await editor.fill('Home language changes when returning to the app.');
  await page.keyboard.press('Escape');
  await bug.click();
  await expect(editor).toHaveValue('Home language changes when returning to the app.');
  await context.setOffline(true);
  await expect(dialog.getByRole('button',{name:'Send',exact:true})).toBeDisabled();
  await context.setOffline(false);
  await dialog.getByRole('button',{name:'Send',exact:true}).click();
  await expect(dialog).toContainText('Report wasn’t sent');
  expect(fixture.paths).toEqual(['/v1/bug-reports']);
  expect(fixture.sent[0].log).toContain('app.started');
  expect(fixture.sent[0]).not.toHaveProperty('roomId');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath('home-report.png'),fullPage:true});
  fixture.succeed();
  await dialog.getByRole('button',{name:'Send',exact:true}).click();
  await expect(dialog).toHaveCount(0);
  expect(fixture.sent[1]).toEqual(fixture.sent[0]);
  await bug.click();
  await expect(editor).toHaveValue('');
});

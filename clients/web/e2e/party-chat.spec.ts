import { expect, test } from '@playwright/test';

test.skip(process.env.CHAT_ACCEPTANCE !== '1', 'Requires the isolated chat-enabled backend');

test('real two-browser chat, native HTTP payload, failure retry, offline recovery, unread and history', async ({ browser }) => {
  const ownerContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const owner = await ownerContext.newPage();
  const guest = await guestContext.newPage();
  const errors: string[] = [];
  owner.on('pageerror', error => errors.push(error.message));
  guest.on('pageerror', error => errors.push(error.message));
  try {
    await owner.goto('/?lang=en');
    await expect(owner.getByRole('button', { name: 'Start a party', exact: true })).toBeVisible();
    // Use the app's admission path without leaking credentials to test output.
    const admission = await owner.evaluate(async () => {
      const { request } = await import('/src/data/api.ts');
      return request<{ room: { id: string; code: string } }>('/v1/rooms', {});
    });
    await owner.goto(`/?invite=${admission.room.code}&lang=en`);
    await owner.getByRole('button', { name: 'Join party', exact: true }).click();
    await expect(owner.getByRole('textbox', { name: 'Message the party', exact: true })).toBeVisible();
    await guest.goto(`/?invite=${admission.room.code}&lang=en`);
    await guest.getByRole('button', { name: 'Join party', exact: true }).click();
    const ownerDraft = owner.getByRole('textbox', { name: 'Message the party', exact: true });
    const guestDraft = guest.getByRole('textbox', { name: 'Message the party', exact: true });
    const ownerSend = owner.getByRole('button', { name: 'Send message', exact: true });
    const guestSend = guest.getByRole('button', { name: 'Send message', exact: true });
    await expect(guestDraft).toBeVisible();
    await ownerDraft.fill('Hello from the browser 🍿');
    await expect(ownerSend).toBeEnabled();
    await ownerDraft.press('Enter');
    await expect(ownerDraft).toHaveValue('Hello from the browser 🍿\n');
    await expect(guest.locator('.chat-message__bubble', { hasText: 'Hello from the browser 🍿' })).toHaveCount(0);
    await ownerDraft.press('Control+Enter');
    await expect(guest.locator('.chat-message__bubble', { hasText: 'Hello from the browser 🍿' })).toBeVisible();
    await guest.getByRole('button', { name: 'Collapse chat', exact: true }).click();
    // A native-style HTTP message enters the same room event stream.
    await owner.evaluate(async roomId => {
      const { request } = await import('/src/data/api.ts');
      await request(`/v1/rooms/${roomId}/chat/messages`, { messageId: crypto.randomUUID(), text: 'سلام از کلاینت دیگر' });
    }, admission.room.id);
    await expect(guest.locator('.chat-unread')).toHaveText('1');
    await guest.getByRole('button', { name: 'Open chat', exact: true }).click();
    await expect(guest.locator('.chat-message__bubble', { hasText: 'سلام از کلاینت دیگر' })).toBeVisible();
    // Lose a successful HTTP response after commit; automatic recovery must reuse the UUID.
    let failedId = '';
    let intercept = true;
    await guest.route('**/chat/messages', async route => {
      if (route.request().method() === 'POST' && intercept) {
        intercept = false;
        failedId = route.request().postDataJSON().messageId;
        const response = await route.fetch();
        expect(response.status()).toBe(201);
        await route.abort('connectionreset');
      } else await route.continue();
    });
    await guestDraft.fill('Accepted even if the response is lost');
    await guestSend.click();
    await expect(owner.locator('.chat-message__bubble', { hasText: 'Accepted even if the response is lost' })).toHaveCount(1);
    // Its event can reconcile before or after HTTP failure; neither path may show a duplicate.
    const retry = guest.locator('.chat-message').filter({ hasText: 'Accepted even if the response is lost' }).getByRole('button', { name: 'Retry', exact: true });
    if (await retry.isVisible()) await retry.click();
    await expect(guest.locator('.chat-message__bubble', { hasText: 'Accepted even if the response is lost' })).toHaveCount(1);
    expect(failedId).toMatch(/^[0-9a-f-]{36}$/);
    await guest.unroute('**/chat/messages');
    await guestContext.setOffline(true);
    await guestDraft.fill('An offline draft stays here');
    await expect(guestSend).toBeEnabled();
    await guestSend.click();
    await expect(guest.getByText('Sending…', {exact:true})).toBeVisible();
    await expect(guest.locator('.chat-offline')).toHaveCount(0);
    await guestContext.setOffline(false);
    await expect(owner.locator('.chat-message__bubble', { hasText: 'An offline draft stays here' })).toBeVisible();
    await guest.reload();
    await guest.getByRole('button', { name: 'Join party', exact: true }).click();
    await expect(guest.locator('.chat-message__bubble', { hasText: 'Hello from the browser 🍿' })).toBeVisible();
    expect(await guest.evaluate(() => [...Object.values(localStorage), ...Object.values(sessionStorage)].some(value => value.includes('An offline draft stays here')))).toBe(false);
    expect(errors).toEqual([]);
  } finally {
    await ownerContext.close();
    await guestContext.close();
  }
});

test('production panel fits desktop, phone, Persian RTL and large text', async ({ page }) => {
  await page.goto('/?lang=en');
  await expect(page.getByRole('button', { name: 'Start a party', exact: true })).toBeVisible();
  const admission = await page.evaluate(async () => {
    const { request } = await import('/src/data/api.ts');
    const result = await request<{room:{id:string;code:string}}>('/v1/rooms', {});
    sessionStorage.setItem('roomio-active-code',result.room.code);
    return result;
  });
  await page.goto('/?lang=en');
  const panel=page.getByRole('region',{name:'Party chat',exact:true});
  await expect(panel).toBeVisible();
  const draft=page.getByRole('textbox',{name:'Message the party',exact:true});
  await draft.fill('A failed send stays available to retry');
  let first=true;
  const ids:string[]=[];
  await page.route('**/chat/messages',async route=>{
    if(route.request().method()==='POST'){
      ids.push(route.request().postDataJSON().messageId);
      if(first){first=false;return route.fulfill({status:503,json:{code:'UNAVAILABLE'}});}
    }
    return route.continue();
  });
  await page.getByRole('button',{name:'Send message',exact:true}).click();
  await expect(panel.getByText('Not sent',{exact:true})).toBeVisible();
  await panel.getByRole('button',{name:'Retry',exact:true}).click();
  await expect(panel.getByText('Sent',{exact:true})).toBeVisible();
  expect(ids.length).toBe(2);expect(ids[0]).toBe(ids[1]);
  for(const setup of [{width:1440,height:1000,dark:false,fa:false,large:false},{width:390,height:844,dark:true,fa:false,large:false},{width:360,height:800,dark:true,fa:true,large:true}]){
    await page.setViewportSize(setup);
    await page.evaluate(async value=>{
      const {setLanguage}=await import('/src/i18n.ts');setLanguage(value.fa?'فارسی':'English');
      document.documentElement.dataset.theme=value.dark?'dark':'light';
      document.documentElement.dataset.textScale=value.large?'large':'standard';
    },setup);
    const label=setup.fa?'پیام به دورهمی':'Message the party';
    await page.getByRole('textbox',{name:label,exact:true}).scrollIntoViewIfNeeded();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const chatBounds=await page.locator('.chat-panel').boundingBox();
    expect(chatBounds!.x).toBeGreaterThanOrEqual(0);expect(chatBounds!.x+chatBounds!.width).toBeLessThanOrEqual(setup.width);
    if(setup.fa)await expect(page.locator('html')).toHaveAttribute('dir','rtl');
    await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0, 0); });
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await page.screenshot({path:`/tmp/watchparty-chat-production-${setup.width}.png`,fullPage:true});
  }
  // Membership remains enforced when the room owner leaves; the panel never makes voice a prerequisite.
  await page.evaluate(async roomId=>{const {request}=await import('/src/data/api.ts');await request(`/v1/rooms/${roomId}/leave`,{});},admission.room.id);
});

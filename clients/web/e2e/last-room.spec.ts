import { test, expect, type Page } from '@playwright/test';

const room = { id: 'last-room', code: 'ABCD2345', title: 'Friday night screening', ownerIdentityId: 'owner' };
async function fixture(page: Page, identityId = 'guest', saved = false) {
  const state = { availability: 'OPEN', failPreview: false, joins: 0, closed: false };
  await page.addInitScript(({ identityId, saved, room }) => {
    localStorage.setItem('roomio-auth-format', 'backend-v1');
    if (saved && !localStorage.getItem('last-room-seeded')) {
      localStorage.setItem('roomio-last-room', JSON.stringify({ identityId, code: room.code, title: room.title }));
      localStorage.setItem('last-room-seeded', '1');
    }
  }, { identityId, saved, room });
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/v1/guest-sessions/refresh') return route.fulfill({ json: { identity: { id: identityId, name: 'Mira', avatar: 'comet', language: 'en' }, accessToken: 'test', accessExpiresAt: new Date(Date.now() + 3600000).toISOString(), refreshExpiresAt: new Date(Date.now() + 86400000).toISOString() } });
    if (path.endsWith('/preview')) return route.fulfill(state.failPreview ? { status: 503, json: { code: 'UNAVAILABLE' } } : { json: { code: room.code, title: room.title, ownerName: 'Nika', ownerPresent: false, participantCount: 2, availability: state.availability, streamState: 'EMPTY' } });
    if (path.endsWith('/join') || path === '/v1/rooms') {
      state.joins++;
      return route.fulfill({ json: { room, membership: { id: 'member', identityId, isOwner: identityId === 'owner' } } });
    }
    if (path.endsWith('/snapshot')) return route.fulfill({ json: { room, members: [{ membershipId: 'member', identityId, displayName: 'Mira', avatar: 'comet', isOwner: identityId === 'owner', present: true }], stream: { sessionId: '', revision: 0, state: 'EMPTY', url: '' }, sequence: 1 } });
    if (path.endsWith('/leave')) return route.fulfill({ json: { roomClosed: state.closed } });
    return route.fulfill({ status: 503, json: { code: 'UNAVAILABLE' } });
  });
  return state;
}

for (const identityId of ['owner', 'guest']) {
  test(`last room survives leaving and a new tab for ${identityId}`, async ({ page, context }) => {
    const state = await fixture(page, identityId);
    await page.goto('/?invite=' + room.code);
    await page.getByRole('button', { name: 'Join party', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Leave party', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Leave party', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Leave party', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Your last hangout', exact: true })).toContainText(room.title);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('roomio-last-room')!).identityId)).toBe(identityId);
    const other = await context.newPage();
    const otherState = await fixture(other, identityId);
    await other.goto('/');
    await other.getByRole('button', { name: 'Jump back in' }).click();
    await expect(other.getByRole('heading', { name: room.title })).toBeVisible();
    expect(otherState.joins).toBe(0);
    await other.getByRole('button', { name: 'Join party', exact: true }).click();
    await expect(other.getByRole('button', { name: 'Leave party', exact: true })).toBeVisible();
    expect(otherState.joins).toBe(1);
    if (identityId === 'owner') await expect(other.getByRole('button', { name: 'Start stream', exact: true })).toBeVisible();
    expect(state.joins).toBe(1);
  });
}

for (const variant of [
  { name: 'desktop light', width: 1280, height: 800, query: '' },
  { name: 'mobile dark large RTL', width: 360, height: 800, query: '?theme=dark&largeText=1&dir=rtl' },
]) test(`cached card retains retry on service failure: ${variant.name}`, async ({ page }, testInfo) => {
  const state = await fixture(page, 'guest', true);
  state.failPreview = true;
  await page.setViewportSize(variant);
  await page.goto('/' + variant.query);
  const button = page.getByRole('button', { name: 'Jump back in' });
  await expect(button).toBeVisible();
  await button.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.md-snackbar')).toContainText('The service is unavailable');
  await expect(button).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Dismiss', exact: true }).click();
  await page.screenshot({ path: testInfo.outputPath('last-room.png'), fullPage: true });
  state.failPreview = false;
  await button.click();
  await expect(page.getByRole('button', { name: 'Join party', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Not now', exact: true }).click();
  await expect(button).toBeVisible();
});

test('full room uses current preview without admitting, ended room removes saved shortcut', async ({ page }) => {
  const state = await fixture(page, 'guest', true);
  state.availability = 'FULL';
  await page.goto('/');
  await page.getByRole('button', { name: 'Jump back in' }).click();
  await expect(page.getByRole('button', { name: 'Join party', exact: true })).toBeDisabled();
  expect(state.joins).toBe(0);
  state.availability = 'ENDED';
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start a party', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Jump back in' })).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('roomio-last-room'))).toBeNull();
});

test('an unrelated guest identity cannot see the saved room', async ({ page }) => {
  await fixture(page, 'new-guest');
  await page.addInitScript(() => localStorage.setItem('roomio-last-room', JSON.stringify({ identityId: 'old-guest', code: 'ABCD2345', title: 'Old room' })));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start a party', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Jump back in' })).toHaveCount(0);
});

test('delayed startup preview cannot replace a more recently joined room', async ({ page }) => {
  await fixture(page, 'guest');
  await page.addInitScript(() => localStorage.setItem('roomio-last-room', JSON.stringify({ identityId: 'guest', code: 'OLD23456', title: 'Old room' })));
  let finishPreview!: () => void;
  const pendingPreview = new Promise<void>(resolve => { finishPreview = resolve; });
  let requested!: () => void;
  const requestStarted = new Promise<void>(resolve => { requested = resolve; });
  await page.route('**/v1/rooms/OLD23456/preview', async route => {
    requested();
    await pendingPreview;
    await route.fulfill({ json: { code: 'OLD23456', title: 'Old room', ownerName: 'Nika', ownerPresent: true, participantCount: 1, availability: 'OPEN', streamState: 'EMPTY' } });
  });
  await page.goto('/');
  await requestStarted;
  await page.getByRole('button', { name: 'Start a party', exact: true }).click();
  await page.getByRole('button', { name: 'Start the party', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Leave party', exact: true })).toBeVisible();
  const completed = page.waitForResponse('**/v1/rooms/OLD23456/preview');
  finishPreview();
  await completed;
  await page.getByRole('button', { name: 'Leave party', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Leave party', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Your last hangout', exact: true })).toContainText(room.title);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('roomio-last-room')!).code)).toBe(room.code);
});

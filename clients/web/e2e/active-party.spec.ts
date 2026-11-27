import { test, expect } from '@playwright/test';

for (const variant of [
  { name: 'desktop light', width: 1280, height: 800, query: '' },
  { name: 'mobile dark large RTL', width: 360, height: 800, query: '?theme=dark&largeText=1&dir=rtl' },
]) {
  test(`active-party snackbar returns through join: ${variant.name}`, async ({ page }) => {
    await page.setViewportSize(variant);
    const room = { id: 'existing-room', code: 'ABCD2345', title: 'Existing party', ownerIdentityId: 'owner' };
    let joined = false;
    await page.route('**/v1/**', async route => {
      const path = new URL(route.request().url()).pathname;
      let status = 200;
      let json: unknown;
      if (path === '/v1/guest-sessions/refresh') {
        json = { identity: { id: 'owner', name: 'Nika', avatar: 'comet', language: 'en' }, accessToken: 'test-token', accessExpiresAt: new Date(Date.now() + 3600000).toISOString(), refreshExpiresAt: new Date(Date.now() + 86400000).toISOString() };
      } else if (path === '/v1/rooms') {
        status = 409;
        json = { code: 'ALREADY_IN_ROOM', activePartyCode: room.code };
      } else if (path === `/v1/rooms/${room.code}/join`) {
        joined = true;
        json = { room, membership: { id: 'member', identityId: 'owner', isOwner: true } };
      } else if (path === '/v1/rooms/existing-room/snapshot') {
        json = { room, members: [{ membershipId: 'member', identityId: 'owner', displayName: 'Nika', avatar: 'comet', isOwner: true, present: true }], stream: { sessionId: '', revision: 0, state: 'EMPTY', url: '' }, sequence: 1 };
      } else {
        status = 503; json = { code: 'UNAVAILABLE' };
      }
      await route.fulfill({ status, json });
    });
    await page.goto('/' + variant.query);
    await page.getByRole('button', { name: 'Start a party', exact: true }).click();
    await page.getByRole('button', { name: 'Start the party', exact: true }).click();
    const action = page.getByRole('button', { name: 'Return to party', exact: true });
    await expect(action).toBeVisible();
    await page.waitForTimeout(5200);
    await expect(action).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await action.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Invite friends', exact: true }).first()).toBeVisible();
    expect(joined).toBe(true);
    await expect(action).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem('roomio-active-code'))).toBe(room.code);
  });
}

test('failed return reports the current error and removes the stale action', async ({ page }) => {
  await page.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/v1/guest-sessions/refresh') return route.fulfill({ json: { identity: { id: 'owner', name: 'Nika', avatar: 'comet', language: 'en' }, accessToken: 'test-token', accessExpiresAt: new Date(Date.now() + 3600000).toISOString(), refreshExpiresAt: new Date(Date.now() + 86400000).toISOString() } });
    return route.fulfill({ status: 409, json: path === '/v1/rooms' ? { code: 'ALREADY_IN_ROOM', activePartyCode: 'ABCD2345' } : { code: 'ROOM_ENDED' } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start a party', exact: true }).click();
  await page.getByRole('button', { name: 'Start the party', exact: true }).click();
  await page.getByRole('button', { name: 'Return to party', exact: true }).click();
  await expect(page.locator('.md-snackbar')).toContainText('This party has ended.');
  await expect(page.getByRole('button', { name: 'Return to party', exact: true })).toHaveCount(0);
});

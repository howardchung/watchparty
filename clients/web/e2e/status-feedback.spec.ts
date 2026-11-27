import { test, expect } from '@playwright/test';

for (const variant of [
  { name: 'desktop light', width: 1280, height: 900, query: '' },
  { name: 'mobile dark large RTL', width: 360, height: 800, query: '?theme=dark&largeText=1&dir=rtl' },
]) {
  test(`reload keeps room reconnection silent: ${variant.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize(variant);
    const room = { id: 'room', code: 'ABCD2345', title: 'Friday screening', ownerIdentityId: 'owner' };
    await page.route('**/v1/**', async route => {
      const path = new URL(route.request().url()).pathname;
      if (path === '/v1/guest-sessions/refresh') return route.fulfill({ json: { identity: { id: 'owner', name: 'Nika', avatar: 'comet', language: 'en' }, accessToken: 'test-token', accessExpiresAt: new Date(Date.now() + 3600000).toISOString(), refreshExpiresAt: new Date(Date.now() + 86400000).toISOString() } });
      if (path === '/v1/rooms' || path === '/v1/rooms/ABCD2345/join') return route.fulfill({ json: { room, membership: { id: 'member', identityId: 'owner', isOwner: true } } });
      if (path === '/v1/rooms/room/snapshot') return route.fulfill({ json: { room, members: [{ membershipId: 'member', identityId: 'owner', displayName: 'Nika', avatar: 'comet', isOwner: true, present: true }], stream: { sessionId: '', revision: 0, state: 'EMPTY', url: '' }, sequence: 1 } });
      return route.fulfill({ status: 503, json: { code: 'UNAVAILABLE' } });
    });
    await page.goto('/' + variant.query);
    await page.getByRole('button', { name: 'Start a party', exact: true }).click();
    await page.getByRole('button', { name: 'Start the party', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Direct video URL' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('textbox', { name: 'Direct video URL' })).toBeVisible();
    // Keep the transport unavailable beyond the former notice delay.
    await page.waitForTimeout(1200);
    await expect(page.getByText('Reconnecting to room', { exact: false })).toHaveCount(0);
    await expect(page.locator('.cinema-column > .md-status-card')).toHaveCount(0);
    await expect(page.locator('.connection-status')).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'Direct video URL' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('reconnect.png'), fullPage: true });
  });
}

test('profile failure keeps recovery actions inside an error card', async ({ page }) => {
  let failed = true;
  await page.route('**/v1/guest-sessions/refresh', route => failed
    ? route.fulfill({ status: 503, json: { code: 'UNAVAILABLE' } })
    : route.fulfill({ json: { identity: { id: 'owner', name: 'Nika', avatar: 'comet', language: 'en' }, accessToken: 'test-token', accessExpiresAt: new Date(Date.now() + 3600000).toISOString(), refreshExpiresAt: new Date(Date.now() + 86400000).toISOString() } }));
  await page.goto('/');
  const card = page.locator('.md-status-card--error');
  await expect(card.getByRole('alert')).toContainText('Unable to restore your profile');
  failed = false;
  await card.getByRole('button', { name: 'Retry connection' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Start a party', exact: true })).toBeVisible();
  await expect(card).toHaveCount(0);
});

import { test, expect } from '@playwright/test';

for (const query of ['', '?theme=dark&largeText=1&dir=rtl']) {
  test(`owner controls remain available before realtime presence connects ${query}`, async ({ page }) => {
    await page.setViewportSize({ width: query ? 360 : 1280, height: 800 });
    const room = { id: 'new-room', code: 'ABCD2345', title: '', ownerIdentityId: 'owner' };
    await page.route('**/v1/**', async route => {
      const path = new URL(route.request().url()).pathname;
      if (path === '/v1/guest-sessions/refresh') {
        return route.fulfill({ json: { identity: { id: 'owner', name: 'Nika', avatar: 'comet', language: 'en' }, accessToken: 'test-token', accessExpiresAt: new Date(Date.now() + 3600000).toISOString(), refreshExpiresAt: new Date(Date.now() + 86400000).toISOString() } });
      }
      if (path === '/v1/rooms') {
        return route.fulfill({ json: { room, membership: { id: 'member', identityId: 'owner', isOwner: true } } });
      }
      if (path === '/v1/rooms/new-room/snapshot') {
        return route.fulfill({ json: { room, members: [{ membershipId: 'member', identityId: 'owner', displayName: 'Nika', avatar: 'comet', isOwner: true, present: false }], stream: { sessionId: '', revision: 0, state: 'EMPTY', url: '' }, sequence: 1 } });
      }
      // Keep realtime unavailable to exercise the entire initial connection period.
      return route.fulfill({ status: 503, json: { code: 'UNAVAILABLE' } });
    });
    await page.goto('/' + query);
    await page.getByRole('button', { name: 'Start a party', exact: true }).click();
    await page.getByRole('button', { name: 'Start the party', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Direct video URL' })).toBeVisible();
    await expect(page.locator('.app-bar')).toContainText('Host');
    await expect(page.locator('.owner-away-banner')).toHaveCount(0);
    await expect(page.getByText('Waiting for Nika to return')).toHaveCount(0);
    await page.getByRole('textbox', { name: 'Direct video URL' }).fill('https://example.test/film.mp4');
    await expect(page.getByRole('button', { name: 'Start stream', exact: true })).toBeEnabled();
    await page.waitForTimeout(1500);
    await expect(page.locator('.owner-away-banner')).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'Direct video URL' })).toBeVisible();
  });
}

test('guests still see the owner departure notice', async ({ page }) => {
  await page.goto('/?preview=participant-owner-absent');
  await expect(page.locator('.owner-away-banner')).toContainText('Mira left the room');
  await expect(page.getByRole('textbox', { name: 'Direct video URL' })).toHaveCount(0);
});

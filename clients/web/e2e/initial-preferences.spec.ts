import { expect, test } from '@playwright/test';

test('new users get durable random preferences and keep manual selections after reload', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => .65; });
  let identity: { id: string; avatar: string; name: string; language: string } | undefined;
  await page.route(/\/v1\/guest-sessions(?:\/|$)/, async route => {
    const url = route.request().url();
    if (url.endsWith('/refresh')) {
      if (!identity) return route.fulfill({ status: 401, json: { code: 'UNAUTHENTICATED' } });
    } else if (route.request().method() === 'PATCH') {
      const profile = route.request().postDataJSON();
      expect(profile.name).toBe('TV Boy');
      identity = { ...identity!, ...profile };
      return route.fulfill({ json: { identity } });
    } else {
      const profile = route.request().postDataJSON();
      expect(profile.avatar).toBe('orbit');
      expect(profile.name).toBe('Wolf Barista');
      identity = { ...profile, id: 'random-user' };
    }
    return route.fulfill({ json: { identity, accessToken: 'test', accessExpiresAt: new Date(Date.now() + 3600000).toISOString(), refreshExpiresAt: new Date(Date.now() + 86400000).toISOString() } });
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme-color', 'lavender');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.locator('.profile-spotlight strong')).toHaveText('Wolf Barista');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme-color', 'lavender');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.locator('.profile-spotlight strong')).toHaveText('Wolf Barista');
  await page.getByRole('radio', { name: 'TV Boy', exact: true }).check();
  await page.getByRole('radio', { name: 'Cobalt', exact: true }).check();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme-color', 'cobalt');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.locator('.profile-spotlight strong')).toHaveText('TV Boy');
  await expect(page.getByRole('radio', { name: 'TV Boy', exact: true })).toBeChecked();
});

import { expect, test } from '@playwright/test';

test('avatar sets the saved name, discards drafts, and retains a failed save for retry', async ({ page }) => {
  let identity = { id: 'same-durable-guest', name: 'Ice Queen', avatar: 'comet', language: 'en' };
  let failSave = false;
  await page.route('**/v1/guest-sessions/**', async route => {
    if (route.request().method() === 'PATCH') {
      if (failSave) return route.fulfill({ status: 503, json: { code: 'UNAVAILABLE' } });
      const body = route.request().postDataJSON();
      expect(body).toMatchObject({ name: 'Frog Wizard', avatar: 'mint' });
      identity = { ...identity, ...body };
      return route.fulfill({ json: { identity } });
    }
    return route.fulfill({ json: { identity, accessToken: 'test', accessExpiresAt: new Date(Date.now() + 3600000).toISOString(), refreshExpiresAt: new Date(Date.now() + 86400000).toISOString() } });
  });
  await page.goto('/');
  const open = () => page.getByRole('button', { name: 'Settings', exact: true }).click();
  const frog = () => page.getByRole('radio', { name: 'Frog Wizard', exact: true });
  await open();
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await expect(page.locator('.spotlight-picker').getByRole('radio')).toHaveCount(12);
  await frog().click();
  await expect(page.locator('.profile-spotlight strong')).toHaveText('Frog Wizard');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await open();
  await expect(page.locator('.profile-spotlight strong')).toHaveText('Ice Queen');
  await frog().click();
  failSave = true;
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('.md-snackbar')).toContainText('The service is unavailable. Try again.');
  await expect(frog()).toBeChecked();
  failSave = false;
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Stream and chill' })).toBeVisible();
  await page.reload();
  await open();
  await expect(page.locator('.profile-spotlight strong')).toHaveText('Frog Wizard');
  expect(identity.id).toBe('same-durable-guest');
});

import { expect, test } from '@playwright/test';

for (const variant of ['side', 'dock', 'floating']) {
  test(`${variant}: compose, retry, offline draft, unread and keyboard dismissal`, async ({ page }) => {
    const requests: string[] = [];
    page.on('request', request => { if (request.url().includes('/v1/')) requests.push(request.url()); });
    await page.goto(`/?preview=chat&variant=${variant}&lang=en`);
    const panel = page.getByRole('region', { name: 'Party chat', exact: true });
    const draft = page.getByRole('textbox', { name: 'Message the party', exact: true });
    await expect(panel).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeDisabled();
    await draft.fill('A movie-night message');
    await draft.press('Enter');
    await expect(panel.getByText('A movie-night message', { exact: true })).toBeVisible();
    await expect(panel.locator('.chat-message').last()).toContainText('Sent');
    await page.getByLabel('Preview state', { exact: true }).selectOption('error');
    await panel.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(panel.locator('.chat-message').last()).toContainText('Sent');
    await page.getByLabel('Preview state', { exact: true }).selectOption('offline');
    await draft.fill('Keep this draft');
    await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeDisabled();
    await panel.getByRole('button', { name: 'Reconnect', exact: true }).click();
    await expect(draft).toHaveValue('Keep this draft');
    await draft.press('Escape');
    await expect(page.getByRole('button', { name: 'Open chat', exact: true })).toBeFocused();
    await page.getByRole('button', { name: '+ Incoming message', exact: true }).click();
    await expect(panel.locator('.chat-unread')).toHaveText('1');
    await page.getByRole('button', { name: 'Open chat', exact: true }).click();
    await expect(draft).toHaveValue('Keep this draft');
    await expect(panel.locator('.chat-unread')).toHaveCount(0);
    await page.getByLabel('Preview state', { exact: true }).selectOption('empty');
    await expect(panel.getByRole('heading', { name: 'First word is yours' })).toBeVisible();
    await page.getByLabel('Preview state', { exact: true }).selectOption('loading');
    await expect(draft).toBeDisabled();
    await panel.getByRole('button', { name: 'Finish loading' }).click();
    await page.getByRole('button', { name: 'Add emoji', exact: true }).click();
    await page.getByRole('button', { name: 'Add 🍿', exact: true }).click();
    await expect(draft).toHaveValue('Keep this draft🍿');
    expect(requests).toEqual([]);
  });
}

for (const config of [
  { width: 1440, height: 1050, theme: 'dark', lang: 'en', scale: 'normal' },
  { width: 390, height: 844, theme: 'light', lang: 'en', scale: 'normal' },
  { width: 360, height: 800, theme: 'dark', lang: 'fa', scale: 'large' },
]) {
  test(`all variations fit ${config.width}px ${config.theme} ${config.lang} ${config.scale}`, async ({ page }) => {
    await page.setViewportSize(config);
    for (const variant of ['side', 'dock', 'floating']) {
      await page.goto(`/?preview=chat&variant=${variant}&theme=${config.theme}&lang=${config.lang}&scale=${config.scale}`);
      await expect(page.locator('.chat-panel')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('.chat-panel').scrollIntoViewIfNeeded();
      const bounds = await page.locator('.chat-panel').boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(config.width);
      if (variant === 'floating') {
        expect(bounds!.y).toBeGreaterThanOrEqual(0);
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(config.height);
      }
      await page.screenshot({ path: `/tmp/watchparty-chat-${variant}-${config.width}.png`, fullPage: true });
      if (config.lang === 'fa') await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    }
  });
}

test('switching designs retains draft and messages and restores shareable variant', async ({ page }) => {
  await page.goto('/?preview=chat&lang=en');
  await page.getByRole('textbox', { name: 'Message the party', exact: true }).fill('Still drafting');
  await page.getByRole('button', { name: '02 Chat dock' }).click();
  await expect(page).toHaveURL(/variant=dock/);
  await expect(page.getByRole('textbox', { name: 'Message the party', exact: true })).toHaveValue('Still drafting');
  await page.getByRole('button', { name: '03 Floating chat' }).click();
  await expect(page.getByRole('textbox', { name: 'Message the party', exact: true })).toHaveValue('Still drafting');
  await page.reload();
  await expect(page.locator('.chat-panel--floating')).toBeVisible();
});

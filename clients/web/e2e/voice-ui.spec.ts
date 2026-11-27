import { test, expect } from '@playwright/test';

for (const variant of [
  { theme: 'light', dir: 'ltr', width: 1280, height: 900, large: '' },
  { theme: 'dark', dir: 'rtl', width: 390, height: 844, large: '1' },
]) {
  test(`Android voice controls ${variant.theme} ${variant.dir}`, async ({ page }, testInfo) => {
    await page.setViewportSize(variant);
    const url = new URLSearchParams({ theme: variant.theme, dir: variant.dir, large: variant.large, status: 'off', offline: '1' });
    await page.goto(`/e2e/voice.html?${url}`);
    const panel = page.getByRole('region', { name: /Talk with the room|Your mic is/ });
    await expect(page.getByRole('heading', { name: 'Hang out on voice' })).toBeVisible();
    const join = page.getByRole('button', { name: 'Join voice', exact: true });
    await expect(join).toBeEnabled();
    await join.focus(); await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Your mic is muted' })).toBeVisible();
    const unmute = panel.getByRole('button', { name: 'Unmute', exact: true });
    await expect(unmute).toHaveClass(/md-icon-button--tonal/);
    const mutedColor = await unmute.evaluate(el => getComputedStyle(el).backgroundColor);
    await unmute.click();
    await expect(page.getByRole('heading', { name: 'Your mic is on' })).toBeVisible();
    const mute = panel.getByRole('button', { name: 'Mute', exact: true });
    await page.mouse.move(0, 0);
    await expect.poll(() => mute.evaluate(el => getComputedStyle(el).backgroundColor)).toBe(mutedColor);
    await mute.click();
    await expect(unmute).toBeVisible();
    await expect(page.getByRole('button', { name: 'Disconnect voice' })).toHaveCount(0);

    url.delete('status');
    await page.goto(`/e2e/voice.html?${url}`);
    await expect(page.getByRole('heading', { name: 'Some voice connections need attention' })).toBeVisible();
    await expect(page.locator('.participant:visible').filter({ hasText: 'Mira' })).toContainText('Reconnecting voice');
    await expect(page.locator('.participant:visible').filter({ hasText: 'Jo' })).toContainText('Voice unavailable');
    const retry = page.getByRole('button', { name: 'Retry voice connections' });
    await expect(retry).toHaveClass(/md-button--outlined/);
    await retry.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-retried', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const screenshot = testInfo.outputPath('voice-state.png');
    await page.screenshot({ fullPage: true, path: screenshot });
    await testInfo.attach('voice-state.png', { path: screenshot, contentType: 'image/png' });
  });
}

test('joining, reconnecting, failed join and unavailable peers follow Android states', async ({ page }) => {
  await page.goto('/e2e/voice.html?status=connecting');
  await expect(page.getByRole('heading', { name: 'Joining voice…' })).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'Joining voice' })).toBeVisible();
  await expect(page.locator('.voice-panel button')).toHaveCount(0);
  await expect(page.locator('.md-status-card')).toHaveCount(0);

  await page.goto('/e2e/voice.html?status=reconnecting&offline=1');
  await expect(page.getByRole('heading', { name: 'Reconnecting voice signaling' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Unmute', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Retry voice connections' })).toHaveCount(0);

  for (const [error, message] of [
    ['NETWORK', 'Could not reach voice. Check your connection and try again.'],
    ['NotAllowedError', 'Could not join voice. Try again.'],
  ]) {
    await page.goto(`/e2e/voice.html?status=error&error=${error}`);
    await expect(page.getByRole('heading', { name: message, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry voice connections' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Join voice', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Your mic is muted' })).toBeVisible();
  }
  await page.goto('/e2e/voice.html?status=connected&unavailable=1');
  await expect(page.getByRole('button', { name: 'Retry voice connections' })).toBeVisible();
});

test('autoplay recovery remains available without duplicate voice cards', async ({ page }) => {
  await page.goto('/e2e/voice.html?status=connected&error=Voice%20playback%20was%20blocked');
  await page.getByRole('button', { name: 'Resume voice audio' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-resumed', 'true');
  await expect(page.locator('.md-status-card')).toHaveCount(0);
});

test('player microphone cannot join voice, including in fullscreen', async ({ page }) => {
  await page.route('https://media.example.test/**', () => {});
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = () => Promise.resolve();
    HTMLMediaElement.prototype.pause = () => {};
  });
  await page.goto('/e2e/voice.html?status=off&player=1');
  await page.locator('video').evaluate(video => {
    Object.defineProperties(video, {
      duration: { configurable: true, value: 120 },
      readyState: { configurable: true, value: 4 },
      paused: { configurable: true, value: false },
    });
    video.dispatchEvent(new Event('canplay'));
    video.dispatchEvent(new Event('playing'));
  });
  const playerMic = page.locator('.media-player').getByRole('button', { name: 'Unmute', exact: true });
  await test.step('player mic does not join', async () => {
    await playerMic.click({ timeout: 10000 });
    await expect(page.locator('html')).not.toHaveAttribute('data-joined');
  });
  await test.step('fullscreen mic does not join', async () => {
    await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click({ timeout: 10000 });
    await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
    await playerMic.click({ timeout: 10000 });
    await expect(page.locator('html')).not.toHaveAttribute('data-joined');
    await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).click({ timeout: 10000 });
    await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false);
  });
  await test.step('player mic toggles after explicit join', async () => {
    await page.getByRole('button', { name: 'Join voice', exact: true }).click({ timeout: 10000 });
    await playerMic.click({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Your mic is on' })).toBeVisible();
  });
});

for (const variant of [
  { theme: 'light', dir: 'ltr', width: 1280, height: 900, large: '', lang: 'en' },
  { theme: 'dark', dir: 'rtl', width: 390, height: 844, large: '1', lang: 'fa' },
]) {
  test(`unavailable WebRTC shows recovery instructions ${variant.lang}`, async ({ page }) => {
    await page.setViewportSize(variant);
    await page.goto(`/e2e/voice.html?${new URLSearchParams({ ...variant, width: String(variant.width), height: String(variant.height), status: 'error', error: 'WEBRTC_UNAVAILABLE' })}`);
    const heading = variant.lang === 'en' ? 'Voice calling is unavailable in this browser' : 'تماس صوتی در این مرورگر در دسترس نیست';
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(page.locator('.voice-panel p')).toContainText('WebRTC');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.voice-panel button').click();
    await expect(page.locator('.voice-panel p')).toHaveCount(0);
  });
}

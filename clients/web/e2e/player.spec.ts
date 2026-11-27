import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/vendor/avplayer/**/avplayer.js', route => route.abort());
  // Keep the source pending before metadata, as in the reported Firefox scan.
  await page.route('https://media.example.test/**', () => {});
  await page.addInitScript(() => {
    (window as any).playCalls = [];
    HTMLMediaElement.prototype.play = function () {
      (window as any).playCalls.push({ ready: this.readyState, preload: this.preload });
      return new Promise<void>(() => {});
    };
  });
});

test('requests playback before metadata and keeps a slow download alive until an explicit retry', async ({ page }) => {
  await page.clock.install();
  await page.goto('/e2e/player.html');
  await expect.poll(() => page.evaluate(() => (window as any).playCalls)).toEqual([{ ready: 0, preload: 'auto' }]);
  await expect(page.getByText('Loading video', { exact: true })).toBeVisible();
  await page.clock.fastForward(15_001);
  await expect(page.getByText(/The video source is taking longer/)).toBeVisible();
  expect(await page.locator('video').getAttribute('src')).toBe('https://media.example.test/movie.mp4');
  expect(await page.evaluate(() => (window as any).playCalls.length)).toBe(1);
  await page.getByRole('button', { name: 'Retry video' }).click();
  await expect.poll(() => page.evaluate(() => (window as any).playCalls.length)).toBe(2);
  await expect(page.getByText(/The video source is taking longer/)).toHaveCount(0);
  await page.locator('video').evaluate(v => v.dispatchEvent(new Event('loadedmetadata')));
  expect(await page.evaluate(() => (window as any).playCalls.length)).toBe(2);
});

test('autoplay refusal offers Play immediately, even before metadata is available', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('User gesture required', 'NotAllowedError'));
  });
  await page.goto('/e2e/player.html');
  await expect(page.getByText('Select Play to start the video on this device.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play video', exact: true })).toBeVisible();
  await expect(page.getByText('Loading video', { exact: true })).toHaveCount(0);
});

test('late media events cannot clear a load error', async ({ page }) => {
  await page.goto('/e2e/player.html');
  await page.locator('video').evaluate(v => {
    for (const name of ['error', 'pause', 'canplay', 'playing', 'waiting']) v.dispatchEvent(new Event(name));
  });
  await expect(page.getByRole('alert')).toContainText('Unable to load video');
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Retry video' })).toBeVisible();
});

test('slow native video guidance fits mobile RTL with large text', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 Firefox/153.0' });
  try {
    const page = await context.newPage();
    await page.route('https://media.example.test/**', () => {});
    await page.addInitScript(() => { HTMLMediaElement.prototype.play = () => new Promise<void>(() => {}); });
    await page.clock.install();
    await page.goto('/e2e/player.html?theme=dark&largeText=1&dir=rtl');
    await expect(page.getByText('Loading video', { exact: true })).toBeVisible();
    await page.clock.fastForward(15_001);
    await expect(page.getByText(/The video source is taking longer than usual/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Retry video' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'Retry video' })).toBeInViewport();
  } finally { await context.close(); }
});

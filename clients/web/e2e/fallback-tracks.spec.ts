import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const fa = JSON.parse(await readFile(new URL('../src/fa.json', import.meta.url), 'utf8'));

const url = 'https://media.example.test/japanese.mkv';
const bytes = await readFile(new URL('./fixtures/player-mkv/japanese.mkv', import.meta.url));
for (const lang of ['en', 'fa'] as const) {
  const text = (key: string) => lang === 'fa' ? (fa as Record<string, string>)[key] || key : key;
  for (const fallback of [false, true]) test(`${fallback ? 'fetch failure fallback and retry' : 'integrated discovery'} with Japanese metadata (${lang})`, async ({ page }) => {
    let failFetch = fallback;
    await page.route(url, async route => {
      if (failFetch && route.request().resourceType() !== 'media') return route.abort('failed');
      const start = Number(/bytes=(\d+)/.exec(route.request().headers().range || '')?.[1] || 0);
      await route.fulfill({ status: start ? 206 : 200, contentType: 'video/x-matroska', headers: { 'access-control-allow-origin': '*', 'accept-ranges': 'bytes', ...(start ? { 'content-range': `bytes ${start}-${bytes.length - 1}/${bytes.length}` } : {}) }, body: bytes.subarray(start) });
    });
    await page.goto(`/e2e/player.html?lang=${lang}&url=${encodeURIComponent(url)}`);
    if (fallback) {
      const video = page.locator('.cinema-player__visual > video:not([hidden])');
      await expect.poll(() => video.evaluate(v => v.currentTime), { timeout: 40_000 }).toBeGreaterThan(0.1);
      expect(await video.evaluate(v => (v as any).audioTracks?.length || 0)).toBe(0);
      await page.getByRole('button', { name: text('Subtitles'), exact: true }).click();
      await expect(page.getByRole('dialog')).toContainText(text('Some embedded tracks may be unavailable in browser playback.'));
      await expect(page.getByRole('dialog')).not.toContainText(text('No supported subtitle tracks are available from this source in your browser. You can choose a local subtitle file.'));
      await expect(page.getByRole('button', { name: text('Choose subtitle file'), exact: true })).toBeEnabled();
      await page.getByRole('button', { name: text('Done'), exact: true }).click();
      await page.getByRole('button', { name: text('Audio tracks'), exact: true }).click();
      await expect(page.getByRole('dialog')).toContainText(text('Some embedded tracks may be unavailable in browser playback.'));
      failFetch = false;
      await page.getByRole('button', { name: text('Try enhanced player'), exact: true }).click();
    }
    await expect(page.getByRole('button', { name: text('Pause'), exact: true })).toBeVisible();
    await page.getByRole('button', { name: text('Pause'), exact: true }).click();
    await page.getByRole('button', { name: text('Audio tracks'), exact: true }).click();
    const audio = page.getByRole('dialog');
    await expect(audio.getByRole('radio', { name: 'ja', exact: true })).toBeVisible();
    await expect(audio.getByRole('radio', { name: 'jpn', exact: true })).toBeVisible();
    await expect(audio.getByRole('radio')).toHaveCount(4);
    await audio.getByRole('radio', { name: 'jpn', exact: true }).check();
    await page.getByRole('button', { name: text('Subtitles'), exact: true }).click();
    const subtitles = page.getByRole('dialog');
    await expect(subtitles.getByRole('radio')).toHaveCount(4);
    await subtitles.getByRole('radio', { name: 'jpn', exact: true }).check();
    await page.getByRole('button', { name: text('Play'), exact: true }).click();
    await expect.poll(() => page.locator('.ASS-box').textContent()).toContain('日本語の字幕');
  });
}

test('a downloaded MKV restores embedded tracks when the host blocks enhanced playback', async ({ page }) => {
  await page.route(url, route => route.request().resourceType() === 'media'
    ? route.fulfill({ contentType: 'video/x-matroska', body: bytes })
    : route.abort('failed'));
  await page.goto(`/e2e/player.html?url=${encodeURIComponent(url)}`);
  await expect(page.getByText('Switched to browser playback.')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Subtitles', exact: true }).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Open downloaded MKV' }).click();
  await (await chooser).setFiles({ name: 'episode.mkv', mimeType: 'video/x-matroska', buffer: bytes });
  await page.getByRole('button', { name: 'Subtitles', exact: true }).click();
  await page.getByRole('radio', { name: 'jpn', exact: true }).check();
  await expect.poll(() => page.locator('.ASS-box').textContent()).toContain('日本語の字幕');
});

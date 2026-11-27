import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }, info) => {
  if (info.title.includes('default HLS')) return;
  await page.route('**/vendor/avplayer/**/avplayer.js', route => route.abort());
});

async function preparePlayer(page: Page, query = '') {
  await page.route('https://media.example.test/**', () => {});
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = () => Promise.resolve();
    HTMLMediaElement.prototype.pause = () => {};
  });
  await page.goto(`/e2e/player.html${query}`);
  await page.locator('video').evaluate(video => {
    Object.defineProperties(video, {
      duration: { configurable: true, value: 120 },
      readyState: { configurable: true, value: 4 },
      paused: { configurable: true, value: false },
    });
    video.dispatchEvent(new Event('canplay'));
    video.dispatchEvent(new Event('playing'));
  });
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeEnabled();
}

test('Android control actions and subtitle import stay local and work in fullscreen', async ({ page }) => {
  await preparePlayer(page);
  await page.getByRole('button', { name: 'Sync to room', exact: true }).click();
  await page.getByRole('button', { name: /Unmute microphone|Unmute$/ }).click();
  await expect.poll(() => page.evaluate(() => (window as any).playerActions)).toEqual(['sync', 'mic']);
  await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click();
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
  await page.getByRole('button', { name: 'Subtitles', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Subtitles', exact: true });
  await expect(dialog).toBeVisible();
  await page.getByLabel('Local subtitle file', { exact: true }).setInputFiles({ name: 'persian.srt', mimeType: 'application/x-subrip', buffer: Buffer.from('1\n00:00:01,000 --> 00:00:04,000\nسلام دنیا\n') });
  await expect.poll(() => page.locator('video track').getAttribute('label')).toBe('persian.srt');
  await expect.poll(() => page.locator('video').evaluate(video => Array.from(video.textTracks).some(track => track.mode === 'showing'))).toBe(true);
  await expect.poll(() => page.locator('video').evaluate(video => Array.from(video.textTracks).flatMap(track => Array.from(track.cues ?? []).map(cue => (cue as VTTCue).text)))).toContain('سلام دنیا');
  // The source stays direct; importing subtitles does not replace or reload it.
  await expect(page.locator('video')).toHaveAttribute('src', 'https://media.example.test/movie.mp4');
  if (await dialog.isVisible()) await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('button', { name: 'Subtitles', exact: true }).click();
  await dialog.getByRole('radio', { name: 'Off', exact: true }).check();
  await expect.poll(() => page.locator('video').evaluate(video => Array.from(video.textTracks).every(track => track.mode === 'disabled'))).toBe(true);
});

test('browser XML importer supports namespace, inherited timing, and rejects unsafe malformed input', async ({ page }) => {
  await preparePlayer(page);
  const results = await page.evaluate(async () => {
    const path = '/src/components/subtitles.ts';
    const { subtitleFileToVtt } = await import(path);
    const convert = (content: string, name = 'captions.ttml') => subtitleFileToVtt(new File([content], name));
    const normal = await convert('<tt xmlns="http://www.w3.org/ns/ttml"><body><div><p begin="1s" dur="2s">سلام <span>دنیا</span><br/>Hello &amp; goodbye</p></div></body></tt>');
    const nested = await convert('<tt xmlns="http://www.w3.org/ns/ttml"><body begin="2s"><div begin="3s"><p begin="1s" dur="2s">Nested</p></div></body></tt>');
    const timedSpan = await convert('<tt xmlns="http://www.w3.org/ns/ttml" xmlns:ttp="http://www.w3.org/ns/ttml#parameter" ttp:frameRate="25"><body begin="1s"><div begin="2s"><p begin="25f" dur="2s">سلام <span begin="500ms">world</span><br/>Next &amp; line</p></div></body></tt>');
    const rejected: boolean[] = [];
    for (const content of ['<!DOCTYPE tt [<!ENTITY x "test">]><tt><p begin="1s" end="2s">&x;</p></tt>', '<tt><p begin="1s" end="2s">Broken</tt>', '<tt><body><p>No timing</p></body></tt>']) {
      try { await convert(content); rejected.push(false); } catch { rejected.push(true); }
    }
    return { normal, nested, timedSpan, rejected };
  });
  expect(results.normal).toContain('00:00:01.000 --> 00:00:03.000');
  expect(results.normal).toContain('سلام دنیا\nHello &amp; goodbye');
  expect(results.nested).toContain('00:00:06.000 --> 00:00:08.000');
  expect(results.timedSpan).toContain('00:00:04.000 --> 00:00:04.500\nسلام \nNext &amp; line');
  expect(results.timedSpan).toContain('00:00:04.500 --> 00:00:06.000\nسلام world\nNext &amp; line');
  expect(results.rejected).toEqual([true, true, true]);
});

test('available browser audio and subtitle tracks have local radio selection and Automatic/Off', async ({ page }) => {
  await page.addInitScript(() => {
    const tracks = Object.assign(new EventTarget(), {
      0: { id: 'en', label: 'English', language: 'en', enabled: true },
      1: { id: 'fa', label: 'Persian', language: 'fa', enabled: false },
      length: 2,
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'audioTracks', { configurable: true, get: () => tracks });
  });
  await preparePlayer(page);
  await page.locator('video').evaluate(video => {
    video.dispatchEvent(new Event('loadedmetadata'));
    video.addTextTrack('subtitles', 'English captions', 'en');
    video.addTextTrack('subtitles', 'زیرنویس فارسی', 'fa');
  });
  await page.getByRole('button', { name: 'Audio tracks', exact: true }).click();
  let dialog = page.getByRole('dialog', { name: 'Audio tracks', exact: true });
  await expect(dialog.getByRole('radio', { name: 'Automatic', exact: true })).toBeChecked();
  await dialog.getByRole('radio', { name: 'Persian', exact: true }).check();
  await expect.poll(() => page.locator('video').evaluate(video => Array.from({ length: (video as any).audioTracks.length }, (_, index) => (video as any).audioTracks[index].enabled))).toEqual([false, true]);
  await page.getByRole('button', { name: 'Audio tracks', exact: true }).click();
  await dialog.getByRole('radio', { name: 'Automatic', exact: true }).check();
  await expect.poll(() => page.locator('video').evaluate(video => Array.from({ length: (video as any).audioTracks.length }, (_, index) => (video as any).audioTracks[index].enabled))).toEqual([true, false]);
  await page.getByRole('button', { name: 'Subtitles', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Subtitles', exact: true });
  await dialog.getByRole('radio', { name: 'زیرنویس فارسی', exact: true }).check();
  await expect.poll(() => page.locator('video').evaluate(video => Array.from(video.textTracks).map(track => track.mode))).toEqual(['disabled', 'showing']);
  expect(await page.evaluate(() => (window as any).playerActions)).toEqual([]);
});

test('fullscreen idle controls hide after three seconds and keyboard interaction reveals them', async ({ page }) => {
  await page.clock.install();
  await preparePlayer(page);
  await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Exit fullscreen', exact: true })).toBeVisible();
  await page.clock.fastForward(3_001);
  await expect(page.locator('.media-player')).toHaveClass(/controls-hidden/);
  await page.keyboard.press('Tab');
  await expect(page.locator('.media-player')).not.toHaveClass(/controls-hidden/);
  await page.getByRole('button', { name: 'Subtitles', exact: true }).focus();
  await page.clock.fastForward(3_001);
  await expect(page.getByRole('button', { name: 'Subtitles', exact: true })).toBeVisible();
  await expect(page.locator('.media-player')).not.toHaveClass(/controls-hidden/);
});

test('fullscreen controls hide after pointer use of the volume slider and reveal on movement', async ({ page }) => {
  await page.clock.install();
  await preparePlayer(page);
  await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click();
  const volume = page.getByRole('slider', { name: 'Volume', exact: true });
  // Range inputs retain visible focus after pointer use in Chromium.
  await volume.click();
  await expect(volume).toBeFocused();
  await page.clock.fastForward(3_001);
  await expect(page.locator('.player-controls')).toBeHidden();
  await page.mouse.move(100, 100);
  await expect(page.locator('.player-controls')).toBeVisible();
  await volume.focus();
  await page.keyboard.press('ArrowLeft');
  await page.clock.fastForward(3_001);
  await expect(page.locator('.player-controls')).toBeVisible();
  await volume.click();
  await page.clock.fastForward(3_001);
  await expect(page.locator('.player-controls')).toBeHidden();
});

for (const settings of [
  { width: 390, height: 844, query: '?theme=dark&largeText=1&dir=rtl', name: 'compact-dark-rtl-large' },
  { width: 1440, height: 900, query: '?theme=light', name: 'expanded-light' },
]) {
  test(`${settings.name}: controls and selection dialog fit; live omits seek controls`, async ({ page }) => {
    await page.setViewportSize({ width: settings.width, height: settings.height });
    await preparePlayer(page, settings.query);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Subtitles', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Subtitles', exact: true });
    await expect(dialog).toBeInViewport();
    await expect(dialog.getByRole('button', { name: 'Choose subtitle file', exact: true })).toBeInViewport();
    await page.screenshot({ path: `test-results/player-${settings.name}.png`, fullPage: true });
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Subtitles', exact: true })).toBeFocused();
    await page.locator('video').evaluate(video => {
      Object.defineProperty(video, 'duration', { configurable: true, value: Infinity });
      video.dispatchEvent(new Event('durationchange'));
    });
    await expect(page.locator('.player-live')).toBeVisible();
    await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Rewind 15 seconds', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Fast-forward 15 seconds', exact: true })).toHaveCount(0);
  });
}

for (const engine of ['browser', 'integrated']) test(`${engine === 'integrated' ? 'default HLS' : 'hls.js'} renditions switch audio and subtitles through real manifests`, async ({ page }) => {
  test.setTimeout(20_000);
  const requests: string[] = [];
  const videoSegment = await readFile(new URL('./fixtures/player-hls/video.mpegts', import.meta.url));
  const audioSegment = await readFile(new URL('./fixtures/player-hls/audio.mpegts', import.meta.url));
  await page.route('https://media.example.test/**', async route => {
    const path = new URL(route.request().url()).pathname;
    requests.push(path);
    const headers = { 'access-control-allow-origin': '*' };
    if (path === '/master.m3u8') {
      await route.fulfill({ headers, contentType: 'application/vnd.apple.mpegurl', body: '#EXTM3U\n#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="English",LANGUAGE="en",DEFAULT=YES,AUTOSELECT=YES,URI="en.m3u8"\n#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="Persian",LANGUAGE="fa",DEFAULT=NO,AUTOSELECT=YES,URI="fa.m3u8"\n#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="Persian subtitles",LANGUAGE="fa",DEFAULT=NO,AUTOSELECT=NO,FORCED=NO,URI="subs.m3u8"\n#EXT-X-STREAM-INF:BANDWIDTH=200000,CODECS="avc1.42e01e,mp4a.40.2",RESOLUTION=160x90,AUDIO="audio",SUBTITLES="subs"\nvideo.m3u8\n' });
    } else if (path.endsWith('.m3u8')) {
      await route.fulfill({ headers, contentType: 'application/vnd.apple.mpegurl', body: `#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXT-X-VERSION:3\n#EXT-X-MEDIA-SEQUENCE:0\n#EXTINF:10,\n${path === '/subs.m3u8' ? 'subtitles.vtt' : path.slice(1).replace('.m3u8', '.ts')}\n#EXT-X-ENDLIST\n` });
    } else if (path.endsWith('.vtt')) {
      await route.fulfill({ headers, contentType: 'text/vtt', body: 'WEBVTT\nX-TIMESTAMP-MAP=MPEGTS:324000000,LOCAL:00:00:00.000\n\n00:00:00.000 --> 00:00:09.000\nسلام HLS\n' });
    } else {
      await route.fulfill({ headers, contentType: 'video/mp2t', body: path === '/video.ts' ? videoSegment : audioSegment });
    }
  });
  await page.addInitScript(() => {
    const canPlayType = HTMLMediaElement.prototype.canPlayType;
    HTMLMediaElement.prototype.canPlayType = function (type) { return type === 'application/vnd.apple.mpegurl' ? '' : canPlayType.call(this, type); };
  });
  await page.goto('/e2e/player.html?url=https%3A%2F%2Fmedia.example.test%2Fmaster.m3u8');
  if (engine === 'integrated') await expect(page.getByTestId('player-notice')).toHaveText('Switched to browser playback.');
  await page.getByRole('button', { name: 'Audio tracks', exact: true }).click();
  await page.getByRole('dialog', { name: 'Audio tracks', exact: true }).getByRole('radio', { name: 'Persian', exact: true }).check();
  await expect.poll(() => requests).toContain('/fa.m3u8');
  await page.getByRole('button', { name: 'Audio tracks', exact: true }).click();
  await page.getByRole('dialog', { name: 'Audio tracks', exact: true }).getByRole('radio', { name: 'Automatic', exact: true }).check();
  await expect.poll(() => requests).toContain('/en.m3u8');
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.getByRole('button', { name: 'Subtitles', exact: true }).click();
    await page.getByRole('dialog', { name: 'Subtitles', exact: true }).getByRole('radio', { name: 'Persian subtitles', exact: true }).check();
    await expect(page.getByRole('button', { name: 'Subtitles', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => requests).toContain('/subs.m3u8');
    await expect.poll(() => page.locator('video:not([hidden])').evaluate(video => Array.from(video.textTracks).filter(track => track.mode === 'showing').flatMap(track => Array.from(track.cues ?? []).map(cue => (cue as VTTCue).text)))).toContain('سلام HLS');
    await page.getByRole('button', { name: 'Subtitles', exact: true }).click();
    await page.getByRole('dialog', { name: 'Subtitles', exact: true }).getByRole('radio', { name: 'Off', exact: true }).check();
    await expect(page.getByRole('button', { name: 'Subtitles', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(() => page.locator('video:not([hidden])').evaluate(video => Array.from(video.textTracks).every(track => track.mode !== 'showing'))).toBe(true);
  }
});

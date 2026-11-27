import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const url = 'https://media.example.test/integrated.mkv';
const source = readFile(new URL('./fixtures/player-mkv/movie.mkv', import.meta.url));
async function mediaSource(page: Page, mediaUrl = url, file = 'movie.mkv') {
  const bytes = file === 'movie.mkv' ? await source : await readFile(new URL(`./fixtures/player-mkv/${file}`, import.meta.url));
  const requests: string[] = [];
  await page.route(mediaUrl, async route => {
    const request = route.request();
    const range = request.headers().range;
    requests.push(`${request.method()} ${range ?? ''}`);
    const headers = { 'access-control-allow-origin': '*', 'accept-ranges': 'bytes' };
    if (request.method() === 'HEAD') return route.fulfill({ status: 200, headers: { ...headers, 'content-length': String(bytes.length) } });
    const match = /bytes=(\d+)-(\d*)/.exec(range ?? '');
    const start = Number(match?.[1] ?? 0);
    const end = Math.min(Number(match?.[2] || bytes.length - 1), bytes.length - 1);
    if (start >= bytes.length) return route.fulfill({ status: 416, headers: { ...headers, 'content-range': `bytes */${bytes.length}` } });
    const body = bytes.subarray(start, end + 1);
    await route.fulfill({ status: match ? 206 : 200, headers: { ...headers, 'content-length': String(body.length), ...(match ? { 'content-range': `bytes ${start}-${end}/${bytes.length}` } : {}) }, contentType: file.endsWith('.mp4') ? 'video/mp4' : file.endsWith('.webm') ? 'video/webm' : 'video/x-matroska', body });
  });
  return requests;
}
async function openPlayer(page: Page, settings = '') {
  await page.goto(`/e2e/player.html?url=${encodeURIComponent(url)}${settings}`);
  await expect.poll(() => page.locator('.integrated-player video').evaluateAll(videos => videos[0] ? (videos[0] as HTMLVideoElement).getVideoPlaybackQuality().totalVideoFrames : 0)).toBeGreaterThan(5);
}
async function seek(page: Page, value: number) {
  await page.getByRole('slider', { name: 'Playback position', exact: true }).evaluate((element, value) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, String(value));
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('skip buttons seek forward and backward during playback and while paused', async ({ page }) => {
  await mediaSource(page);
  await openPlayer(page);
  const video = page.locator('.integrated-player video');
  await page.getByRole('button', { name: 'Fast-forward 15 seconds', exact: true }).click();
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(15);
  await page.getByRole('button', { name: 'Rewind 15 seconds', exact: true }).click();
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeLessThan(8);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  await page.getByRole('button', { name: 'Fast-forward 15 seconds', exact: true }).click();
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(15);
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  await page.getByRole('button', { name: 'Rewind 15 seconds', exact: true }).click();
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeLessThan(8);
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('audio selection changes decoded sound without syncing and preserves pause', async ({ page }) => {
  await mediaSource(page);
  await openPlayer(page);
  const video = page.locator('.integrated-player video');
  // Track IDs alone missed this bug: measure the decoded 440/880 Hz tones.
  await video.evaluate(async video => {
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 8192;
    context.createMediaElementSource(video).connect(analyser);
    analyser.connect(context.destination);
    await context.resume();
    (window as any).audioFrequency = () => {
      const bins = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(bins);
      let peak = 0;
      for (let i = 1; i < bins.length; i++) if (bins[i] > bins[peak]) peak = i;
      return peak * context.sampleRate / analyser.fftSize;
    };
  });
  const frequency = () => page.evaluate(() => (window as any).audioFrequency() as number);
  const select = async (name: string) => {
    await page.getByRole('button', { name: 'Audio tracks', exact: true }).click();
    await page.getByRole('dialog', { name: 'Audio tracks', exact: true }).getByRole('radio', { name, exact: true }).check();
  };
  await expect.poll(frequency).toBeGreaterThan(420);
  await expect.poll(frequency).toBeLessThan(460);
  const before = await video.evaluate(v => v.currentTime);
  await select('English · eng');
  await expect.poll(frequency).toBeGreaterThan(850);
  await expect.poll(frequency).toBeLessThan(910);
  expect(await video.evaluate(v => v.currentTime)).toBeGreaterThanOrEqual(before - 0.1);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  const pausedAt = await video.evaluate(v => v.currentTime);
  await select('Automatic');
  // Observe command completion before testing that local pause was restored.
  await expect.poll(() => page.evaluate(() => (window as any).AVPlayer.Instances[0].getSelectedAudioStreamId())).toBe(1);
  await expect.poll(() => video.evaluate(v => v.paused && !v.seeking && v.readyState >= 2)).toBe(true);
  expect(await video.evaluate(v => v.currentTime)).toBeCloseTo(pausedAt, 0);
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect.poll(frequency).toBeGreaterThan(420);
  await expect.poll(frequency).toBeLessThan(460);
  expect(await page.evaluate(() => (window as any).playerActions)).toEqual([]);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByTestId('player-notice')).toHaveCount(0);
});

test('dragging the seek bar discards intermediate queued seeks', async ({ page }) => {
  await mediaSource(page);
  await openPlayer(page);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.evaluate(() => {
    const player = (window as any).AVPlayer.Instances[0];
    const seek = player.seek.bind(player);
    (window as any).seekRequests = [];
    player.seek = async (time: bigint) => {
      (window as any).seekRequests.push(Number(time));
      await new Promise(resolve => setTimeout(resolve, 100));
      return seek(time);
    };
  });
  await seek(page, 10);
  await expect.poll(() => page.evaluate(() => (window as any).seekRequests.length)).toBe(1);
  await page.getByRole('slider', { name: 'Playback position', exact: true }).evaluate(element => {
    for (let value = 11; value <= 23; value++) {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, String(value));
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await expect.poll(() => page.locator('.integrated-player video').evaluate(v => v.currentTime)).toBeGreaterThan(22.9);
  expect(await page.evaluate(() => (window as any).seekRequests)).toEqual([10000, 23000]);
  await expect.poll(() => page.locator('.integrated-player video').evaluate(v => v.paused)).toBe(true);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

for (const settings of [
  { name: 'desktop light', query: '&theme=light', viewport: { width: 1280, height: 900 } },
  { name: 'mobile dark large RTL', query: '&theme=dark&largeText=1&dir=rtl', viewport: { width: 390, height: 844 } },
]) test(`${settings.name}: real MKV decodes with embedded tracks, local controls and subtitle imports`, async ({ page }) => {
  await page.setViewportSize(settings.viewport);
  const requests = await mediaSource(page);
  await openPlayer(page, settings.query);
  const video = page.locator('.integrated-player video');
  await expect(video).toHaveAttribute('src', /^blob:/);
  await page.getByRole('button', { name: 'Subtitles', exact: true }).click();
  const subtitles = page.getByRole('dialog', { name: 'Subtitles', exact: true });
  await expect(subtitles.getByRole('radio', { name: 'Off', exact: true })).toBeChecked();
  await expect(page.locator('.ASS-box')).not.toBeVisible();
  await subtitles.getByRole('radio', { name: 'Persian · fas', exact: true }).check();
  await expect(page.locator('.ASS-box')).toContainText('سلام دنیا');
  await expect(page.locator('.ASS-box')).not.toContainText('<font');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  await seek(page, 21);
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(20);
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(page.locator('.ASS-box')).toContainText('زیرنویس دوم');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('button', { name: 'Audio tracks', exact: true }).click();
  const audio = page.getByRole('dialog', { name: 'Audio tracks', exact: true });
  await audio.getByRole('radio', { name: 'English · eng', exact: true }).check();
  await page.getByRole('button', { name: 'Audio tracks', exact: true }).click();
  await audio.getByRole('radio', { name: 'Automatic', exact: true }).check();
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  await page.getByRole('button', { name: 'Mute video', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Unmute video', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Unmute video', exact: true }).click();
  await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click();
  await page.getByRole('button', { name: 'Subtitles', exact: true }).click();
  await expect(subtitles).toBeInViewport();
  await expect(subtitles.getByRole('radio', { name: 'Persian · fas', exact: true })).toBeChecked();
  await page.getByLabel('Local subtitle file', { exact: true }).setInputFiles({ name: 'my.srt', mimeType: 'application/x-subrip', buffer: Buffer.from('1\n00:00:20,000 --> 00:00:31,000\nLocal caption\n') });
  await expect(subtitles).not.toBeVisible();
  await expect.poll(() => video.evaluate(v => Array.from(v.textTracks).flatMap(t => Array.from(t.activeCues ?? []).map(c => (c as VTTCue).text)))).toContain('Local caption');
  await page.getByRole('button', { name: 'Subtitles', exact: true }).click();
  await subtitles.getByRole('radio', { name: 'Off', exact: true }).check();
  await expect(page.locator('.ASS-box')).not.toBeVisible();
  expect(await page.evaluate(() => (window as any).playerActions)).toEqual([]);
  expect(requests.every(request => request.startsWith('HEAD') || request.includes('bytes='))).toBe(true);
  await page.screenshot({ path: `test-results/avplayer-${settings.name.replaceAll(' ', '-')}.png`, fullPage: true });
});

test('failed player assets automatically fall back and enhanced playback can be retried', async ({ page }) => {
  await mediaSource(page);
  await page.route('**/vendor/avplayer/**/avplayer.js', route => route.abort());
  await page.goto(`/e2e/player.html?url=${encodeURIComponent(url)}`);
  const video = page.locator('.cinema-player__visual > video:not([hidden])');
  await expect(video).toHaveAttribute('src', url);
  await expect.poll(() => video.evaluate(v => v.getVideoPlaybackQuality().totalVideoFrames)).toBeGreaterThan(5);
  await expect(page.getByTestId('player-notice')).toHaveText('Switched to browser playback.');
  await page.unroute('**/vendor/avplayer/**/avplayer.js');
  await page.getByRole('button', { name: 'Subtitles', exact: true }).click();
  await page.getByRole('button', { name: 'Try enhanced player', exact: true }).click();
  await expect.poll(() => page.locator('.integrated-player video').evaluateAll(videos => videos[0] ? (videos[0] as HTMLVideoElement).getVideoPlaybackQuality().totalVideoFrames : 0)).toBeGreaterThan(5);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

for (const extension of ['mp4', 'webm']) test(`${extension} starts with AVPlayer and recovers through browser playback when needed`, async ({ page }) => {
  await mediaSource(page);
  const replacement = `https://media.example.test/replaced.${extension}`;
  await mediaSource(page, replacement, `movie.${extension}`);
  await openPlayer(page);
  await page.evaluate(url => (window as any).replacePlayerSource(url), replacement);
  const video = page.locator(extension === 'webm' ? '.cinema-player__visual > video:not([hidden])' : '.integrated-player video');
  await expect.poll(() => video.evaluateAll(videos => videos[0] ? (videos[0] as HTMLVideoElement).getVideoPlaybackQuality().totalVideoFrames : 0)).toBeGreaterThan(5);
  await expect(video).toHaveAttribute('src', extension === 'webm' ? replacement : /^blob:/);
  await expect.poll(() => page.evaluate(() => (window as any).AVPlayer.Instances.length)).toBe(extension === 'webm' ? 0 : 1);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await seek(page, 18);
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(17.9);
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  await expect(page.getByRole('button', { name: 'Subtitles', exact: true })).toHaveAttribute('aria-pressed', 'false');
  if (extension === 'webm') await expect(page.getByTestId('player-notice')).toHaveText('Switched to browser playback.');
  else await expect(page.getByTestId('player-notice')).toHaveCount(0);
});

test('a playback failure preserves paused position, volume, mute and imported subtitles in browser fallback', async ({ page }) => {
  await mediaSource(page);
  await openPlayer(page);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await seek(page, 18);
  const enhanced = page.locator('.integrated-player video');
  await expect.poll(() => enhanced.evaluate(v => v.currentTime)).toBeGreaterThan(17.9);
  await expect.poll(() => enhanced.evaluate(v => v.paused)).toBe(true);
  await page.getByRole('slider', { name: 'Volume', exact: true }).fill('35');
  await page.getByRole('button', { name: 'Mute video', exact: true }).click();
  await page.getByLabel('Local subtitle file', { exact: true }).setInputFiles({ name: 'local.vtt', mimeType: 'text/vtt', buffer: Buffer.from('WEBVTT\n\n00:00:00.000 --> 00:00:31.000\nFallback caption\n') });
  await enhanced.evaluate(v => v.dispatchEvent(new Event('error')));
  const native = page.locator('.cinema-player__visual > video:not([hidden])');
  await expect(native).toHaveAttribute('src', url);
  await expect.poll(() => native.evaluate(v => v.currentTime)).toBeGreaterThan(17.9);
  await expect.poll(() => native.evaluate(v => v.paused && v.muted && Math.abs(v.volume - 0.35) < 0.01)).toBe(true);
  await expect.poll(() => native.evaluate(v => Array.from(v.textTracks).flatMap(t => t.mode === 'showing' ? Array.from(t.activeCues ?? []).map(c => (c as VTTCue).text) : []))).toContain('Fallback caption');
  await native.evaluate(v => v.dispatchEvent(new Event('error')));
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry video', exact: true })).toBeVisible();
  await expect(page.locator('.integrated-player video')).toHaveCount(0);
});

test('online startup stall falls back once after 30 seconds and ignores late engine completion', async ({ page }) => {
  await page.clock.install();
  await page.route('**/vendor/avplayer/**/avplayer.js', () => {});
  await mediaSource(page);
  await page.goto(`/e2e/player.html?url=${encodeURIComponent(url)}`);
  await page.clock.fastForward(30_001);
  await expect(page.locator('.cinema-player__visual > video:not([hidden])')).toHaveAttribute('src', url);
  await expect(page.getByTestId('player-notice')).toHaveText('Switched to browser playback.');
  await page.unroute('**/vendor/avplayer/**/avplayer.js');
  await page.clock.fastForward(60_000);
  await expect(page.locator('.integrated-player video')).toHaveCount(0);
});

test('offline startup failure keeps Retry without switching engines', async ({ page, context }) => {
  await page.route('**/vendor/avplayer/**/avplayer.js', async route => {
    await context.setOffline(true);
    await route.abort();
  });
  await page.goto(`/e2e/player.html?url=${encodeURIComponent(url)}`);
  await expect(page.getByRole('alert')).toContainText('offline');
  await expect(page.getByTestId('player-notice')).toHaveCount(0);
});

test('explicit synchronization applies forward and backward targets and reports actual playback', async ({ page }) => {
  await mediaSource(page);
  await openPlayer(page);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const video = page.locator('.integrated-player video');
  await page.evaluate(() => (window as any).syncPlayerTo(18000));
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(17.9);
  await expect.poll(() => page.evaluate(() => (window as any).playerReports.some((report: any) => report.positionMs >= 17900 && !report.playing))).toBe(true);
  // Nineteen seconds lies between this fixture's two-second keyframes.
  await page.evaluate(() => (window as any).syncPlayerTo(19000));
  await expect.poll(() => page.evaluate(() => (window as any).playerReports.some((report: any) => report.positionMs >= 18900 && !report.playing))).toBe(true);
  await page.evaluate(() => (window as any).syncPlayerTo(2000));
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeCloseTo(2, 0);
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  expect(await page.evaluate(() => (window as any).playerActions)).toEqual([]);
});

test('autoplay denial stays paused in reports and Play recovers', async ({ page }) => {
  await mediaSource(page);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.addInitScript(() => {
    // Deny both entry points: AVPlayer requests play and sets autoplay=true.
    const autoplay = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'autoplay')!;
    Object.defineProperty(HTMLMediaElement.prototype, 'autoplay', { ...autoplay, set() { autoplay.set!.call(this, false); } });
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (!(window as any).allowPlayback) return Promise.reject(new DOMException('User gesture required', 'NotAllowedError'));
      return play.call(this);
    };
  });
  await page.goto(`/e2e/player.html?url=${encodeURIComponent(url)}`);
  const blocked = page.getByText('Select Play to start the video on this device.');
  await expect(blocked).toBeVisible();
  expect(await page.evaluate(() => (window as any).playerReports.every((report: any) => !report.playing))).toBe(true);
  // Grant permission with the click, as a real user gesture would. Granting it
  // beforehand can resume pending autoplay and turn Play into Pause mid-click.
  await page.evaluate(() => document.addEventListener('click', () => { (window as any).allowPlayback = true; }, { capture: true, once: true }));
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await expect(blocked).toHaveCount(0);
  await expect.poll(() => page.locator('.integrated-player video').evaluate(v => v.muted)).toBe(false);
  expect(errors).toEqual([]);
});


test('HLS plays and seeks through AVPlayer by default', async ({ page }) => {
  const playlist = await readFile(new URL('./fixtures/player-hls/default/playlist.m3u8', import.meta.url), 'utf8');
  await page.route('https://media.example.test/default.m3u8', route => route.fulfill({
    contentType: 'application/vnd.apple.mpegurl', headers: { 'access-control-allow-origin': '*' },
    body: playlist,
  }));
  await page.route('https://media.example.test/playlist*.ts', async route => route.fulfill({ contentType: 'video/mp2t', headers: { 'access-control-allow-origin': '*' }, body: await readFile(new URL(`./fixtures/player-hls/default/${new URL(route.request().url()).pathname.slice(1)}`, import.meta.url)) }));
  await page.goto('/e2e/player.html?url=https%3A%2F%2Fmedia.example.test%2Fdefault.m3u8');
  const video = page.locator('.integrated-player video');
  await expect.poll(() => video.evaluateAll(videos => videos[0] ? (videos[0] as HTMLVideoElement).getVideoPlaybackQuality().totalVideoFrames : 0)).toBeGreaterThan(5);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await seek(page, 18);
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(17.9);
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  await expect(page.getByTestId('player-notice')).toHaveCount(0);
});


test('ordinary buffering after readiness does not switch engines at the startup deadline', async ({ page }) => {
  await page.clock.install();
  await mediaSource(page);
  await openPlayer(page);
  await page.locator('.integrated-player video').evaluate(video => {
    Object.defineProperty(video, 'readyState', { configurable: true, value: 1 });
    video.dispatchEvent(new Event('waiting'));
  });
  await page.clock.fastForward(30_001);
  await expect(page.locator('.integrated-player video')).toHaveCount(1);
  await expect(page.getByTestId('player-notice')).toHaveCount(0);
});

test('MSE timers tolerate a detached video before player teardown', async ({ page }) => {
  const errors: Error[] = [];
  page.on('pageerror', error => errors.push(error));
  const replacement = 'https://media.example.test/replacement.mkv';
  await mediaSource(page);
  await mediaSource(page, replacement);
  await openPlayer(page);

  // Reproduce the browser detaching both SourceBuffers while the old audio
  // and video mux timers are still active. Leave time for their pending ticks.
  const video = page.locator('.integrated-player video');
  await video.evaluate(async (element: HTMLVideoElement) => {
    if (!element.currentSrc.startsWith('blob:')) throw new Error('Expected MSE playback');
    element.removeAttribute('src');
    element.load();
    await new Promise(resolve => setTimeout(resolve, 500));
  });
  expect(errors.map(error => error.stack)).toEqual([]);

  await page.evaluate(url => (window as any).replacePlayerSource(url), replacement);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(1);
  expect(errors.map(error => error.stack)).toEqual([]);
});

test('retrying a buffering MKV resumes the same movie position', async ({ page }) => {
  await mediaSource(page);
  await openPlayer(page);
  const video = page.locator('.integrated-player video');
  await page.evaluate(() => (window as any).syncPlayerTo(18000));
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(17.9);
  await page.clock.install();
  await video.evaluate(v => {
    v.dataset.beforeRetry = 'true';
    v.dispatchEvent(new Event('waiting'));
  });
  await expect(page.getByText('Buffering', { exact: true })).toBeVisible();
  await page.clock.fastForward(15_001);
  const before = await video.evaluate(v => v.currentTime);
  await page.evaluate(() => { (window as any).playerReports.length = 0; });
  await page.getByRole('button', { name: 'Retry video' }).click();
  await expect(video).not.toHaveAttribute('data-before-retry', 'true');
  await expect.poll(() => video.evaluateAll(v => (v[0] as HTMLVideoElement)?.currentTime ?? 0)).toBeGreaterThanOrEqual(before - 0.3);
  await expect.poll(() => page.evaluate(() => (window as any).playerReports.length)).toBeGreaterThan(0);
  expect(await page.evaluate(() => (window as any).playerReports.every(
    (report: {positionMs: number}) => report.positionMs >= 17700,
  ))).toBe(true);
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(false);
});

test('retry after a paused MKV errors restores the frame and stays paused', async ({ page, context }) => {
  await mediaSource(page);
  await openPlayer(page);
  const video = page.locator('.integrated-player video');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await seek(page, 15);
  await expect.poll(() => page.evaluate(() => (window as any).playerReports.some(
    (report: {positionMs: number; playing: boolean}) => report.positionMs >= 14900 && !report.playing,
  ))).toBe(true);
  await context.setOffline(true);
  await video.evaluate(v => v.dispatchEvent(new Event('error')));
  const retry = page.getByRole('button', { name: 'Retry video' });
  await expect(retry).toBeVisible();
  await context.setOffline(false);
  await retry.click();
  await expect.poll(() => video.evaluateAll(v => (v[0] as HTMLVideoElement)?.currentTime ?? 0)).toBeCloseTo(15, 0);
  await expect(page.getByRole('button', { name: 'Play video', exact: true })).toBeVisible();
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
});

test('browser player retry uses the current position after an earlier fallback', async ({ page }) => {
  const movie = 'https://media.example.test/retry.mp4';
  await page.route('**/vendor/avplayer/**/avplayer.js', route => route.abort());
  await mediaSource(page, movie, 'movie.mp4');
  await page.goto('/e2e/player.html?url=' + encodeURIComponent(movie));
  const video = page.locator('.cinema-player__visual > video:not([hidden])');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await seek(page, 15);
  await expect.poll(() => page.evaluate(() => (window as any).playerReports.some(
    (report: {positionMs: number; playing: boolean}) => report.positionMs >= 14900 && !report.playing,
  ))).toBe(true);
  await video.evaluate(v => v.dispatchEvent(new Event('error')));
  await page.getByRole('button', { name: 'Retry video' }).click();
  await expect(page.getByRole('button', { name: 'Play video', exact: true })).toBeVisible();
  expect(await video.evaluate(v => v.currentTime)).toBeCloseTo(15, 0);
  expect(await video.evaluate(v => v.paused)).toBe(true);
});

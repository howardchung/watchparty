// Opt-in real-source test. Run Vite first; no room/backend operations are performed.
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const url = process.argv[2];
const output = process.argv[3] ?? '/tmp/watchparty-integrated-player.json';
if (!url || !/^https?:/.test(url)) throw new Error('Usage: node scripts/probe-mkv-subtitles.mjs MEDIA_URL [OUTPUT_JSON]');
const base = process.env.MKV_PROBE_BASE_URL ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const report = { url, date: new Date().toISOString(), mediaBytes: 0, requests: [], errors: [], stages: [] };
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
try {
  page.on('pageerror', error => report.errors.push(String(error)));
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  const mediaIds = new Set();
  cdp.on('Network.requestWillBeSent', event => {
    if (new URL(event.request.url).pathname.toLowerCase().endsWith('.mkv')) {
      mediaIds.add(event.requestId);
      report.requests.push({ method: event.request.method, range: event.request.headers.Range ?? event.request.headers.range ?? '', url: event.request.url });
    }
  });
  cdp.on('Network.dataReceived', event => { if (mediaIds.has(event.requestId)) report.mediaBytes += event.dataLength; });
  const begin = Date.now();
  const video = page.locator('.integrated-player video');
  const snapshot = async name => {
    const data = await video.evaluate(video => ({ time: video.currentTime, duration: Number(document.querySelector('.player-progress input')?.max), nativeDuration: String(video.duration), paused: video.paused, readyState: video.readyState, frames: video.getVideoPlaybackQuality().totalVideoFrames, source: video.src, subtitleText: document.querySelector('.ASS-box')?.textContent ?? '', subtitleVisibility: document.querySelector('.ASS-box') ? getComputedStyle(document.querySelector('.ASS-box')).visibility : 'absent' }));
    const result = { name, elapsedMs: Date.now() - begin, mediaBytes: report.mediaBytes, requests: report.requests.length, ...data };
    report.stages.push(result); console.log(JSON.stringify(result));
  };
  const seek = async value => {
    await page.getByRole('slider', { name: 'Playback position', exact: true }).evaluate((input, value) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, String(value));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
    await page.waitForFunction(value => { const video = document.querySelector('.integrated-player video'); return !video.seeking && video.readyState >= 2 && Math.abs(video.currentTime - value) < 1; }, value, { timeout: 90000 });
  };
  await page.goto(`${base}/e2e/player.html?url=${encodeURIComponent(url)}`);
  await page.waitForFunction(() => { const video = document.querySelector('.integrated-player video'); return video?.currentTime >= 2 && video.getVideoPlaybackQuality().totalVideoFrames > 5; }, {}, { timeout: 90000 });
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await snapshot('initial-off');
  await page.getByRole('button', { name: 'Subtitles', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Subtitles', exact: true });
  report.subtitleTracks = await dialog.getByRole('radio').evaluateAll(inputs => inputs.map(input => ({ id: input.value, label: input.parentElement.textContent })));
  const count = report.requests.length;
  await dialog.locator('input[value^="av:"]').first().check();
  await page.locator('.ASS-box').waitFor({ state: 'visible' });
  report.subtitleToggleNewRequests = report.requests.length - count;
  await snapshot('subtitles-on');
  await page.screenshot({ path: `${output}.png`, fullPage: true });
  await seek(600);
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.integrated-player video').currentTime > 601, {}, { timeout: 60000 });
  await snapshot('seek600-playing');
  await page.getByRole('button', { name: 'Audio tracks', exact: true }).click();
  const audio = page.getByRole('dialog', { name: 'Audio tracks', exact: true });
  report.audioTracks = await audio.getByRole('radio').evaluateAll(inputs => inputs.map(input => ({ id: input.value, label: input.parentElement.textContent })));
  const selection = audio.locator('input[value^="av:"]').last();
  const selectedId = Number((await selection.inputValue()).slice(3));
  await selection.check();
  await page.waitForFunction(id => window.AVPlayer.Instances[0].getSelectedAudioStreamId() === id, selectedId);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await snapshot('audio-switched');
  await seek(3);
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await page.waitForFunction(() => !!document.querySelector('.ASS-dialogue')?.textContent, {}, { timeout: 15000 });
  await snapshot('seek3-subtitle-restored');
  await page.getByRole('button', { name: 'Subtitles', exact: true }).click();
  await dialog.getByRole('radio', { name: 'Off', exact: true }).check();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await snapshot('off');
  report.alerts = await page.getByRole('alert').allTextContents();
  if (report.alerts.length || report.errors.length) throw new Error('Player reported an error; inspect the diagnostic report');
} catch (error) {
  report.failureState = await page.evaluate(() => { const v = document.querySelector('.integrated-player video'); return { time: v?.currentTime, paused: v?.paused, seeking: v?.seeking, ready: v?.readyState, buffered: v ? Array.from({length:v.buffered.length}, (_, i) => [v.buffered.start(i),v.buffered.end(i)]) : [], alerts: Array.from(document.querySelectorAll('[role=alert]')).map(e => e.textContent) }; }).catch(() => null);
  report.failure = String(error); console.error(String(error)); process.exitCode = 1;
} finally {
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}

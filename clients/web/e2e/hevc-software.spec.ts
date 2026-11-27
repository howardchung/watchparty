import { expect, test } from '@playwright/test';

test('a local HEVC Main 10 file prepares a fresh frame and audio/video packets at the requested position', async ({ page }) => {
  // Exercise the actual decoder and canvas pipeline even on hosts with HEVC MSE.
  await page.addInitScript(() => {
    const supported = MediaSource.isTypeSupported.bind(MediaSource);
    MediaSource.isTypeSupported = mime => !/hev1|hvc1/i.test(mime) && supported(mime);
    if (window.VideoDecoder) {
      const supportsConfig = VideoDecoder.isConfigSupported.bind(VideoDecoder);
      VideoDecoder.isConfigSupported = config => /hev1|hvc1/i.test(config.codec)
        ? Promise.resolve({ supported: false, config }) : supportsConfig(config);
    }
  });
  await page.route('**/adapter-test.html', r => r.fulfill({ contentType: 'text/html', body: '<div id="host"></div>' }));
  await page.goto('/adapter-test.html');
  const requests: string[] = [];
  page.on('request', r => { if (r.url().endsWith('.wasm')) requests.push(new URL(r.url()).pathname); });
  const opened = await page.evaluate(async () => {
    const { AvMedia } = await import('/src/components/avPlayer.ts');
    const bytes = await (await fetch('/e2e/fixtures/player-mkv/hevc-main10.mkv')).blob();
    const file = new File([bytes], 'main10.mkv');
    const adapter = new AvMedia(document.querySelector('#host'), '', {
      tracks() {}, state() {}, update() {}, error(message: string) { throw Error(message); },
    }, file);
    (window as any).adapter = adapter;
    await adapter.ready;
    return adapter.duration;
  });
  expect(opened).toBeGreaterThan(11);
  expect(requests).toEqual([]);
  for (const target of [0, 4000]) {
    const state = await page.evaluate(async ms => {
      const adapter = (window as any).adapter;
      await adapter.prepareForSync(ms);
      const engine = (window as any).AVPlayer.Instances[0];
      const stats = engine.getStats();
      return { paused: adapter.paused, ready: adapter.readyState, position: Number(stats.videoCurrentTime),
        frames: Number(stats.videoFrameRenderCount), buffered: adapter.buffered.end(0), mse: engine.isMSE() };
    }, target);
    expect(state.paused).toBe(true);
    expect(state.ready).toBeGreaterThanOrEqual(3);
    expect(state.mse).toBe(false);
    expect(state.frames).toBeGreaterThan(0);
    expect(Math.abs(state.position - target)).toBeLessThan(500);
    expect(state.buffered).toBeGreaterThanOrEqual(target / 1000 + 2);
  }
  await page.evaluate(() => (window as any).adapter.play());
  await expect.poll(() => page.evaluate(() => {
    const stats = (window as any).AVPlayer.Instances[0].getStats();
    return Math.min(Number(stats.videoCurrentTime), Number(stats.audioCurrentTime));
  })).toBeGreaterThan(4500);
  const captions = await page.evaluate(async () => {
    const adapter = (window as any).adapter;
    await adapter.importSubtitle('WEBVTT\n\n00:00:00.000 --> 00:00:11.000\nLocal captions\n', 'captions.vtt');
    await adapter.selectSubtitle('off');
    await adapter.selectSubtitle('local');
    return document.querySelector('.integrated-player__engine')?.getAttribute('data-subtitles');
  });
  expect(captions).toBe('on');
  expect(requests.some(path => /\/hevc(-simd)?\.wasm$/.test(path))).toBe(true);
  await page.evaluate(() => (window as any).adapter.destroy());
});

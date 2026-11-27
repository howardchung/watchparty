import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('report F adapter fixture discovers and selects identical IDs in English and Persian', async ({ page }) => {
  await page.route('**/adapter-test.html', r => r.fulfill({ contentType: 'text/html', body: '<html><head></head><body></body></html>' }));
  await page.route('**/vendor/avplayer/**/*.js', r => r.fulfill({ contentType: 'text/javascript', body: '' }));
  await page.goto('/adapter-test.html');
  const results = await page.evaluate(async () => {
    const { AvMedia } = await import('/src/components/avPlayer.ts');
    const { setLanguage, t } = await import('/src/i18n.ts');
    // Two AAC streams and Persian SubRip from report F; bitmap subtitle guards filtering.
    const streams = [
      { id: 0, mediaType: 'Video', metadata: {}, codecparProxy: { codecId: 27 } },
      { id: 1, mediaType: 'Audio', metadata: { language: 'per', title: 'Film2Media - Namava' }, codecparProxy: { codecId: 86018 } },
      { id: 2, mediaType: 'Audio', metadata: { title: 'WwW.F2M.Top' }, codecparProxy: { codecId: 86018 } },
      { id: 3, mediaType: 'Subtitle', metadata: { language: 'per' }, codecparProxy: { codecId: 94225 } },
      { id: 4, mediaType: 'Subtitle', metadata: {}, codecparProxy: { codecId: 94214 } },
    ];
    let engine: FakePlayer;
    class FakePlayer {
      currentTime = 12345n; audio = 2; subtitle = -1; calls: string[] = []; busy = false;
      constructor() { engine = this; }
      async command(name: string) {
        if (this.busy) throw new Error('Overlapping engine commands');
        this.busy = true; this.calls.push(name);
        await new Promise(resolve => setTimeout(resolve, 1));
        this.busy = false;
      }
      async load() {} on() {} isLive() { return false; } getDuration() { return 60000n; }
      getStreams() { return streams; } getSelectedAudioStreamId() { return this.audio; }
      getSelectedSubtitleStreamId() { return this.subtitle; } setVolume() {}
      async play() { await this.command('play'); } async pause() { await this.command('pause'); }
      async seek(value: bigint) { await this.command(`seek:${value}`); }
      async selectAudio(id: number) { await this.command(`audio:${id}`); this.audio = id; }
      async selectSubtitle(id: number) { await this.command(`subtitle:${id}`); this.subtitle = id; }
      async destroy() {}
    }
    (window as any).AVPlayer = FakePlayer;
    const results = [];
    for (const language of ['en', 'fa']) {
      setLanguage(language);
      let discovered: any;
      const host = document.createElement('div'); document.body.append(host);
      const media = new AvMedia(host, 'https://media.test/report-f.mkv', {
        tracks: (audio, subtitles, automatic, unsupported) => { discovered = { audio, subtitles, automatic, unsupported }; },
        state() {}, update() {}, error(message) { throw new Error(message); },
      });
      await media.ready;
      await Promise.all([media.selectAudio(discovered.audio[0].id), media.selectSubtitle(discovered.subtitles[0].id)]);
      await media.selectAudio(discovered.automatic);
      results.push({ ...discovered, audioLabel: t('Audio'), calls: [...engine!.calls], audioId: engine!.audio, subtitleId: engine!.subtitle });
      media.destroy(); host.remove();
    }
    return results;
  });
  expect(results[0].audioLabel).not.toBe(results[1].audioLabel);
  for (const result of results) {
    expect(result.audio.map((t: any) => t.id)).toEqual(['av:1', 'av:2']);
    expect(result.subtitles.map((t: any) => t.id)).toEqual(['av:3']);
    expect(result.automatic).toBe('av:2'); expect(result.unsupported).toBe(1);
    expect(result.calls).toEqual(['play', 'audio:1', 'seek:12345', 'subtitle:3', 'play', 'audio:2', 'seek:12345']);
    expect(result.audioId).toBe(2); expect(result.subtitleId).toBe(3);
  }
  expect(results[0].audio).toEqual(results[1].audio);
  expect(results[0].subtitles).toEqual(results[1].subtitles);
});

for (const language of ['en', 'fa']) test(`${language}: real MKV tracks in normal/fullscreen controls and after language change`, async ({ page }) => {
  const bytes = await readFile(new URL('./fixtures/player-mkv/movie.mkv', import.meta.url));
  const url = 'https://media.example.test/language.mkv';
  await page.route(url, route => {
    const match = /bytes=(\d+)-(\d*)/.exec(route.request().headers().range ?? '');
    const start = Number(match?.[1] ?? 0), end = Math.min(Number(match?.[2] || bytes.length - 1), bytes.length - 1);
    return route.fulfill({ status: match ? 206 : 200, contentType: 'video/x-matroska',
      headers: { 'access-control-allow-origin': '*', 'accept-ranges': 'bytes', ...(match ? { 'content-range': `bytes ${start}-${end}/${bytes.length}` } : {}) }, body: bytes.subarray(start, end + 1) });
  });
  await page.goto(`/e2e/player.html?url=${encodeURIComponent(url)}&lang=${language}`);
  await expect.poll(() => page.locator('.integrated-player video').evaluateAll(v => v[0] ? (v[0] as HTMLVideoElement).readyState : 0)).toBeGreaterThanOrEqual(2);
  const label = (en: string, fa: string) => language === 'fa' ? fa : en;
  const audioName = label('Audio tracks', 'صداها'), subtitleName = label('Subtitles', 'زیرنویس');
  const trackIds = async (name: string) => {
    await page.getByRole('button', { name, exact: true }).click();
    const dialog = page.getByRole('dialog', { name, exact: true });
    await expect(dialog).toBeInViewport();
    const ids = await dialog.getByRole('radio').evaluateAll(inputs => inputs.map(input => (input as HTMLInputElement).value));
    await page.keyboard.press('Escape'); return ids;
  };
  expect(await trackIds(audioName)).toEqual(['automatic', 'av:1', 'av:2']);
  expect(await trackIds(subtitleName)).toEqual(['off', 'av:3']);
  await page.getByRole('button', { name: label('Enter fullscreen', 'تمام‌صفحه'), exact: true }).click();
  expect(await trackIds(audioName)).toEqual(['automatic', 'av:1', 'av:2']);
  expect(await trackIds(subtitleName)).toEqual(['off', 'av:3']);
  await page.evaluate(async value => { const { setLanguage } = await import('/src/i18n.ts'); setLanguage(value); }, language === 'en' ? 'fa' : 'en');
  const changedAudioName = label('صداها', 'Audio tracks');
  expect(await trackIds(changedAudioName)).toEqual(['automatic', 'av:1', 'av:2']);
  await page.getByRole('button', { name: changedAudioName, exact: true }).click();
  await page.getByRole('dialog').locator('input[value="av:2"]').check();
  await expect.poll(() => page.evaluate(() => (window as any).AVPlayer.Instances[0].getSelectedAudioStreamId())).toBe(2);
  await expect(page.getByTestId('player-notice')).toHaveCount(0);
});

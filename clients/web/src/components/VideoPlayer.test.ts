import { describe, expect, it } from 'vitest';
import { syncPosition, playbackReport, slowLoadingMessage } from './VideoPlayer';
import { usesIntegratedPlayer } from './avPlayer';

describe('integrated player routing', () => {
  it('defaults to AVPlayer for HTTP media, independent of extension', () => {
    for (const path of ['movie.mkv', 'movie.mp4', 'movie.webm', 'master.m3u8', 'manifest.mpd', 'stream?token=1']) {
      expect(usesIntegratedPlayer(`https://media.test/${path}`)).toBe(true);
    }
    for (const url of ['invalid', 'javascript:alert(1)', 'file:///movie.mp4']) expect(usesIntegratedPlayer(url)).toBe(false);
  });
});

describe('slow source guidance', () => {
  it('explains the AAC/MKV startup bug only for affected Firefox versions and MKV links', () => {
    expect(slowLoadingMessage('https://media.test/movie.MKV?token=1', 'Mozilla/5.0 Firefox/153.0')).toContain('entire MKV');
    expect(slowLoadingMessage('https://media.test/movie.mkv', 'Mozilla/5.0 Firefox/157.0')).toContain('entire MKV');
    for (const agent of ['Firefox/158.0', 'Firefox/159.0', 'Chrome/154.0', 'Safari/605.1']) {
      expect(slowLoadingMessage('https://media.test/movie.mkv', agent)).not.toContain('entire MKV');
    }
    expect(slowLoadingMessage('https://media.test/movie.mp4', 'Firefox/153.0')).not.toContain('entire MKV');
    expect(slowLoadingMessage('https://media.test/movie.m3u8', 'Firefox/153.0')).not.toContain('entire MKV');
  });
});

describe('explicit owner synchronization', () => {
  it('uses milliseconds from the server and clamps to media duration', () => {
    expect(syncPosition(10, 25_000, 20)).toBe(20);
    expect(syncPosition(10, 25_000, Infinity)).toBe(25);
  });
  it('rewinds to the owner and clamps when duration shrinks', () => {
    expect(syncPosition(20, 10_000, 50)).toBe(10);
    expect(syncPosition(20, 20_000, 50)).toBeNull();
    expect(syncPosition(20, 30_000, 15)).toBe(15);
  });
  it('rejects nonfinite or negative server positions', () => {
    for (const value of [NaN, Infinity, -1]) expect(syncPosition(10, value, 50)).toBeNull();
  });
});

describe('actual media reports', () => {
  const ready = { readyState: 4, currentTime: 12.3456, paused: false, ended: false, seeking: false, error: null };
  it('reports actual media time in milliseconds', () => {
    expect(playbackReport(ready)).toEqual({ positionMs: 12346, playing: true });
  });
  it('does not report unloaded, seeking or failed media', () => {
    expect(playbackReport({ ...ready, readyState: 0 })).toBeNull();
    expect(playbackReport({ ...ready, seeking: true })).toBeNull();
    expect(playbackReport({ ...ready, currentTime: NaN })).toBeNull();
    expect(playbackReport({ ...ready, error: { code: 3, message: 'decode error' } as MediaError })).toBeNull();
  });
  it('does not claim paused, ended or buffering media is playing', () => {
    expect(playbackReport({ ...ready, paused: true })?.playing).toBe(false);
    expect(playbackReport({ ...ready, ended: true })?.playing).toBe(false);
    expect(playbackReport({ ...ready, readyState: 2 })?.playing).toBe(false);
  });
});

import { afterEach, expect, it, vi } from 'vitest';
import { browserAnalytics } from './analytics';
afterEach(() => vi.unstubAllGlobals());

it('migrates only the random ID and sends an explicit anonymous event', () => {
  const id = '12345678-1234-4234-8234-123456789012';
  const storage = new Map([['ph_demo_posthog', JSON.stringify({ distinct_id: id, url: 'private-invite' })]]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key),
    setItem: (k: string, v: string) => storage.set(k, v),
    removeItem: (k: string) => storage.delete(k),
  });
  vi.stubGlobal('sessionStorage', { removeItem: vi.fn() });
  vi.stubGlobal('navigator', { userAgent: 'Chrome/100', doNotTrack: '0' });
  const send = vi.fn().mockResolvedValue({});
  vi.stubGlobal('fetch', send);
  const track = browserAnalytics('demo', 'https://example.test', 'test', 'test');
  track('$pageview');
  expect(storage.has('ph_demo_posthog')).toBe(false);
  expect(JSON.stringify([...storage])).not.toContain('private-invite');
  expect(send.mock.calls[0][1]).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer' });
  expect(JSON.parse(send.mock.calls[0][1].body)).toEqual({
    event: '$pageview',
    api_key: 'demo',
    distinct_id: id,
    properties: {
      distinct_id: id,
      platform: 'web',
      environment: 'test',
      release: 'test',
      $process_person_profile: false,
      $geoip_disable: true,
      route: '/',
    },
  });
  vi.stubGlobal('navigator', { globalPrivacyControl: true });
  track('app_opened');
  vi.stubGlobal('navigator', { doNotTrack: '1' });
  track('app_opened');
  expect(send).toHaveBeenCalledTimes(1);
});

import { avatarName } from './avatarCatalog';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const profile = { name: 'Host', avatar: 'comet', language: 'en' };
const establishedKey = 'roomio-backend-session-v1';
class StorageFake {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}
let storage: StorageFake;
let fetchMock: ReturnType<typeof vi.fn>;
const reply = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
const session = (token = 'opaque-access', id = 'identity-1') => ({ identity: { ...profile, id }, accessToken: token, accessExpiresAt: new Date(Date.now() + 900_000).toISOString(), refreshExpiresAt: new Date(Date.now() + 180 * 86400_000).toISOString() });
beforeEach(() => {
  vi.resetModules(); vi.useFakeTimers();
  storage = new StorageFake(); storage.setItem('roomio-auth-format', 'backend-v1');
  fetchMock = vi.fn();
  vi.stubGlobal('localStorage', storage); vi.stubGlobal('sessionStorage', new StorageFake()); vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe('backend-owned browser identity', () => {
  it('issues a character name without digits and restores the saved profile on reload', async () => {
    fetchMock.mockResolvedValueOnce(reply({ code: 'UNAUTHENTICATED' }, 401)).mockImplementationOnce(async (_url, options) => reply({ ...session(), identity: { ...JSON.parse(options.body), id: 'identity-1' } }));
    const { ensureSession } = await import('./auth');
    const first = await ensureSession();
    expect(first.identity.name).toBe(avatarName(first.identity.avatar as Parameters<typeof avatarName>[0]));
    expect(first.identity.name).not.toMatch(/\d/);
    expect(first.identity.name.length).toBeLessThanOrEqual(48);
    vi.resetModules();
    fetchMock.mockResolvedValueOnce(reply({ ...session(), identity: first.identity }));
    const reloaded = await import('./auth');
    expect((await reloaded.ensureSession()).identity.name).toBe(first.identity.name);
    expect(fetchMock.mock.calls.map(call => call[0])).toEqual(['/v1/guest-sessions/refresh', '/v1/guest-sessions', '/v1/guest-sessions/refresh']);
  });

  it('recovers the cookie before issuing a guest and stores no credentials in web storage', async () => {
    fetchMock.mockResolvedValue(reply(session()));
    const { ensureSession } = await import('./auth');
    expect((await ensureSession(profile)).identity.id).toBe('identity-1');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/v1/guest-sessions/refresh');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: 'include', headers: { 'X-Roomio-Client': 'browser' } });
    expect([...storage.values.values()].join(' ')).not.toContain('opaque-access');
  });
  it('creates only after a missing cookie, single-flights concurrent initialization and renewals', async () => {
    fetchMock.mockResolvedValueOnce(reply({ code: 'UNAUTHENTICATED' }, 401)).mockResolvedValueOnce(reply(session()));
    const { ensureSession, token } = await import('./auth');
    const [a, b] = await Promise.all([ensureSession(profile), ensureSession(profile)]);
    expect(a.identity.id).toBe(b.identity.id); expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe('/v1/guest-sessions');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual(profile);
    fetchMock.mockResolvedValueOnce(reply(session('renewed')));
    expect(await Promise.all([token(true), token(true)])).toEqual(['renewed', 'renewed']);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
  it.each(['INVALID_TOKEN', 'SESSION_EXPIRED', 'SESSION_REVOKED', 'AUTH_UNAVAILABLE', 'UNAUTHENTICATED'])('retains established identity after %s without new registration', async code => {
    storage.setItem(establishedKey, '1');
    fetchMock.mockResolvedValue(reply({ code }, code === 'AUTH_UNAVAILABLE' ? 503 : 401));
    const { ensureSession } = await import('./auth');
    await expect(ensureSession(profile)).rejects.toMatchObject({ code });
    expect(fetchMock).toHaveBeenCalledTimes(1); expect(storage.getItem(establishedKey)).toBe('1');
  });
  it('retains pending issuance after a lost response and retries cookie restoration', async () => {
    fetchMock.mockResolvedValueOnce(reply({ code: 'UNAUTHENTICATED' }, 401)).mockRejectedValueOnce(new TypeError('offline'));
    const { ensureSession } = await import('./auth');
    await expect(ensureSession(profile)).rejects.toMatchObject({ code: 'NETWORK' });
    fetchMock.mockResolvedValueOnce(reply(session()));
    expect((await ensureSession(profile)).identity.id).toBe('identity-1');
    expect(fetchMock.mock.calls.map(call => call[0])).toEqual(['/v1/guest-sessions/refresh', '/v1/guest-sessions', '/v1/guest-sessions/refresh']);
  });
  it('does not turn a storage failure into a clean signup', async () => {
    storage.getItem = () => { throw new Error('storage unavailable'); };
    const { ensureSession } = await import('./auth');
    await expect(ensureSession(profile)).rejects.toThrow('storage unavailable');
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('requires explicit reset to replace an unusable guest and clears only identity room state', async () => {
    storage.setItem(establishedKey, '1'); storage.setItem('roomio-theme', 'dark'); storage.setItem('roomio-last-owned-code', 'OLDROOM');
    fetchMock.mockResolvedValueOnce(reply({ code: 'SESSION_REVOKED' }, 401));
    const { ensureSession, resetIdentity } = await import('./auth');
    await expect(ensureSession(profile)).rejects.toMatchObject({ code: 'SESSION_REVOKED' });
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await resetIdentity();
    expect(fetchMock.mock.calls[1][0]).toBe('/v1/guest-sessions/reset');
    expect(storage.getItem(establishedKey)).toBeNull(); expect(storage.getItem('roomio-last-owned-code')).toBeNull(); expect(storage.getItem('roomio-theme')).toBe('dark');
    fetchMock.mockResolvedValueOnce(reply({ code: 'UNAUTHENTICATED' }, 401)).mockResolvedValueOnce(reply(session('new-access', 'new-identity')));
    expect((await ensureSession(profile)).identity.id).toBe('new-identity');
  });
  it('refreshes room and voice subscribers before expiry and retries outages without dropping credentials', async () => {
    fetchMock.mockResolvedValueOnce(reply(session()));
    const { ensureSession, watchToken } = await import('./auth'); await ensureSession(profile);
    const updated = vi.fn(); const failed = vi.fn(); const unsubscribe = watchToken(updated, failed);
    fetchMock.mockResolvedValueOnce(reply({ code: 'AUTH_UNAVAILABLE' }, 503));
    await vi.advanceTimersByTimeAsync(840_000);
    expect(failed).toHaveBeenCalledTimes(1); expect(storage.getItem(establishedKey)).toBe('1');
    fetchMock.mockResolvedValueOnce(reply(session('renewed')));
    await vi.advanceTimersByTimeAsync(30_000);
    expect(updated.mock.calls.map(call => call[0])).toEqual(['opaque-access', 'renewed']); unsubscribe();
  });
  it('rejects a refreshed credential for another identity', async () => {
    fetchMock.mockResolvedValueOnce(reply(session()));
    const { ensureSession, token } = await import('./auth'); await ensureSession(profile);
    fetchMock.mockResolvedValueOnce(reply(session('wrong-user', 'another-identity')));
    await expect(token(true)).rejects.toMatchObject({ code: 'INVALID_TOKEN' });
  });
  it('performs the fresh identity cutover once and preserves theme preferences', async () => {
    storage.removeItem('roomio-auth-format'); storage.setItem('roomio-auth-established', '1'); storage.setItem('roomio-last-owned-code', 'LEGACY'); storage.setItem('roomio-theme', 'dark');
    fetchMock.mockResolvedValueOnce(reply({ code: 'UNAUTHENTICATED' }, 401)).mockResolvedValueOnce(reply(session()));
    const { ensureSession } = await import('./auth'); await ensureSession(profile);
    expect(storage.getItem('roomio-auth-established')).toBeNull(); expect(storage.getItem('roomio-last-owned-code')).toBeNull(); expect(storage.getItem('roomio-theme')).toBe('dark'); expect(storage.getItem('roomio-auth-format')).toBe('backend-v1');
  });
});

it('chooses a fresh avatar once, then retains a manually saved character through reset', async () => {
  vi.spyOn(Math, 'random').mockReturnValue(.999);
  fetchMock.mockResolvedValueOnce(reply({ code: 'UNAUTHENTICATED' }, 401)).mockImplementationOnce(async (_url, options) => reply({ ...session(), identity: { ...JSON.parse(options.body), id: 'identity-1' } }));
  const auth = await import('./auth');
  const first = await auth.ensureSession();
  expect(first.identity.avatar).toBe('bloom');
  expect(first.identity.name).toBe('Mummy Barista');
  auth.rememberProfile({ avatar: 'orbit', name: 'Wolf Barista', language: 'en' });
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
  await auth.resetIdentity();
  fetchMock.mockResolvedValueOnce(reply({ code: 'UNAUTHENTICATED' }, 401)).mockImplementationOnce(async (_url, options) => reply({ ...session('new', 'identity-2'), identity: { ...JSON.parse(options.body), id: 'identity-2' } }));
  const reset = await auth.ensureSession();
  expect(reset.identity.avatar).toBe('orbit');
  expect(reset.identity.name).toBe('Wolf Barista');
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, errorMessage, request } from './api';
const auth = vi.hoisted(() => ({ token: vi.fn() }));
vi.mock('./auth', () => ({ token: auth.token }));
afterEach(() => { vi.unstubAllGlobals(); vi.resetAllMocks(); });
describe('authenticated HTTP boundary', () => {
  it('explains recovery for an expired durable guest session', () => {
    expect(errorMessage(new ApiError('SESSION_EXPIRED', 401))).toContain('Reset your guest identity');
  });
  it('renews an expired token once and preserves the mutation idempotency key', async () => {
    auth.token.mockResolvedValueOnce('old-token').mockResolvedValueOnce('fresh-token');
    const fetch = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({code:'SESSION_EXPIRED'}),{status:401})).mockResolvedValueOnce(new Response(JSON.stringify({room:{id:'room'}}),{status:201}));
    vi.stubGlobal('fetch',fetch);
    expect(await request('/v1/rooms',{},'POST','operation-1')).toEqual({room:{id:'room'}});
    expect(auth.token.mock.calls).toEqual([[false],[true]]);
    expect(fetch.mock.calls[0][1].headers['Idempotency-Key']).toBe('operation-1');
    expect(fetch.mock.calls[1][1].headers).toMatchObject({'Idempotency-Key':'operation-1',Authorization:'Bearer fresh-token'});
  });
  it('does not refresh or replace identity after permanent revocation', async () => {
    auth.token.mockResolvedValue('token');
    const fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify({code:'SESSION_REVOKED'}),{status:401}));vi.stubGlobal('fetch',fetch);
    await expect(request('/v1/capabilities')).rejects.toMatchObject({code:'SESSION_REVOKED'});
    expect(auth.token).toHaveBeenCalledTimes(1);expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('preserves only a valid active-party destination on membership conflicts', async () => {
    auth.token.mockResolvedValue('token');
    for (const [code, activePartyCode, expected] of [
      ['ALREADY_IN_ROOM', 'ABCD2345', 'ABCD2345'],
      ['ALREADY_IN_ROOM', '../elsewhere', undefined],
      ['ROOM_FULL', 'ABCD2345', undefined],
      ['ALREADY_IN_ROOM', undefined, undefined],
    ]) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ code, activePartyCode }), { status: 409 })));
      await expect(request('/v1/rooms', {})).rejects.toMatchObject({ code, activePartyCode: expected });
    }
  });
  it('normalizes transport failures and refuses non-API destinations', async () => {
    auth.token.mockResolvedValue('token');vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(request('/v1/capabilities')).rejects.toBeInstanceOf(ApiError);
    await expect(request('/v1/capabilities')).rejects.toMatchObject({code:'NETWORK'});
    await expect(request('https://external.test')).rejects.toThrow('Invalid API path');
  });
});

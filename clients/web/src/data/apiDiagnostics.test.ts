import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.mock('./auth', () => ({ token: vi.fn(async () => 'private-access') }));
import { token } from './auth';
import { request } from './api';
import { sessionLog } from './sessionLog';

beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => vi.unstubAllGlobals());

it('logs a failed request including duration without retaining request content', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network request failed ticket=private-ticket https://private-host/movie')));
  const before = sessionLog().length;
  await expect(request('/v1/rooms/private-room/chat/messages', { text: 'private-chat-message' })).rejects.toMatchObject({ code: 'NETWORK' });
  const captured = sessionLog().slice(before);
  expect(captured).toContain('http.start');
  expect(captured).toContain('http.failure');
  expect(captured).toContain('"code":"NETWORK"');
  expect(captured).toContain('elapsedMs');
  expect(captured).toContain('"reason":"NETWORK"');
  expect(captured).toContain('"event":"exception.handled"');
  expect(captured).not.toContain('Network request failed');
  expect(captured).not.toMatch(/private-(ticket|host|chat|room|access)/);
});
it('links both auth recovery attempts and completion under one operation', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{"code":"SESSION_EXPIRED"}', { status: 401 })).mockResolvedValueOnce(new Response('{"accepted":true}')));
  const before = sessionLog().length;
  await expect(request('/v1/rooms/private-room/leave', {})).resolves.toEqual({ accepted: true });
  expect(token).toHaveBeenNthCalledWith(1, false);
  expect(token).toHaveBeenNthCalledWith(2, true);
  const events = sessionLog().slice(before).trim().split('\n').map(line => JSON.parse(line.slice(line.indexOf('{'))));
  expect(events.map(event => event.event)).toEqual(['http.start', 'http.attempt', 'http.attempt_response', 'http.attempt', 'http.attempt_response', 'http.response', 'http.complete']);
  expect(new Set(events.map(event => event.operation)).size).toBe(1);
});
it('records malformed success responses as decode failures', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not json')));
  const before = sessionLog().length;
  await expect(request('/v1/rooms')).rejects.toThrow();
  expect(sessionLog().slice(before)).toContain('"code":"SyntaxError"');
});

import { logHandledException } from './sessionLog';
import { diagnosticEvent, diagnosticError, nextOperationId } from './sessionLog';
import { avatarName, avatarOptions } from './avatarCatalog';
import type { IdentityDto } from './contracts';
import { backendUrl } from './config';
import { ApiError } from './errors';

interface Profile { name: string; avatar: string; language: string }
export interface GuestSession {
  identity: IdentityDto;
  accessToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
}
const initialProfileKey = 'roomio-initial-profile-v1';
const establishedKey = 'roomio-backend-session-v1';
const formatKey = 'roomio-auth-format';
let current: GuestSession | undefined;
let pending: Promise<GuestSession> | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let initialProfile: Profile | undefined;
const listeners = new Map<(accessToken: string) => void, (error: unknown) => void>();
const refreshEarlyMs = 60_000;

function prepareStorage() {
  // This is the accepted one-time fresh-identity cutover. Theme/profile preferences survive.
  if (localStorage.getItem(formatKey) === 'backend-v1') return;
  localStorage.removeItem('roomio-auth-established');
  localStorage.removeItem('roomio-last-owned-code');
  localStorage.removeItem('roomio-last-room');
  sessionStorage.removeItem('roomio-active-code');
  if (typeof indexedDB !== 'undefined') indexedDB.deleteDatabase('firebaseLocalStorageDb');
  localStorage.setItem(formatKey, 'backend-v1');
}
async function sessionRequest(path: string, body: unknown, accessToken?: string): Promise<Response> {
  const operation = nextOperationId();
  const started = performance.now();
  const action = path === '' ? 'create' : path === '/refresh' ? 'refresh' : path === '/reset' ? 'reset' : 'other';
  diagnosticEvent('auth.start', { operation, action });
  let response: Response;
  try {
    response = await fetch(`${backendUrl}/v1/guest-sessions${path}`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Roomio-Client': 'browser', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    logHandledException("auth.sessionRequest.1", error);
    diagnosticEvent('auth.failure', { operation, code: diagnosticError(error), elapsedMs: Math.round(performance.now() - started) });
    throw new ApiError('NETWORK');
  }
  diagnosticEvent('auth.response', { operation, status: response.status, elapsedMs: Math.round(performance.now() - started) });
  if (!response.ok) {
    const failure = await response.json().catch((handledError) => {
      logHandledException("auth.sessionRequest.failure.2", handledError); return ({}); });
    diagnosticEvent('auth.rejected', { operation, code: diagnosticError(new ApiError(failure.code || 'AUTH_UNAVAILABLE')) });
    throw new ApiError(failure.code || 'AUTH_UNAVAILABLE', response.status);
  }
  return response;
}
function scheduleRefresh(delay?: number) {
  clearTimeout(timer);
  if (!current || listeners.size === 0) return;
  timer = setTimeout(() => {
    void token(true).catch(error => {
      logHandledException("auth.scheduleRefresh.3", error);
      for (const onError of listeners.values()) onError(error);
      if (!canResetIdentity(error)) scheduleRefresh(30_000);
    });
  }, delay ?? Math.max(1000, Date.parse(current.accessExpiresAt) - Date.now() - refreshEarlyMs));
}
function accept(value: GuestSession): GuestSession {
  if (!value.accessToken || !value.identity?.id || !Number.isFinite(Date.parse(value.accessExpiresAt)) || !Number.isFinite(Date.parse(value.refreshExpiresAt))) throw new ApiError('INVALID_TOKEN', 401);
  if (current && current.identity.id !== value.identity.id) throw new ApiError('INVALID_TOKEN', 401);
  diagnosticEvent('auth.accepted', { restored: !!current });
  current = value;
  rememberProfile(value.identity);
  for (const callback of listeners.keys()) callback(value.accessToken);
  scheduleRefresh();
  return value;
}
async function obtain(force: boolean): Promise<GuestSession> {
  prepareStorage();
  if (!force && current && Date.parse(current.accessExpiresAt) - Date.now() > refreshEarlyMs) return current;
  if (pending) return pending;
  const run = async () => {
    const established = localStorage.getItem(establishedKey);
    try {
      const value = await (await sessionRequest('/refresh', {})).json();
      localStorage.setItem(establishedKey, '1');
      return accept(value);
    } catch (error) {
      logHandledException("auth.obtain.run.4", error);
      // Only a genuinely new browser without a cookie may register automatically.
      if (established || current || !(error instanceof ApiError) || error.code !== 'UNAUTHENTICATED') throw error;
    }
    if (!initialProfile) {
      const saved = localStorage.getItem(initialProfileKey);
      if (saved) {
        const candidate = JSON.parse(saved) as Profile;
        if (avatarOptions.some(avatar => avatar.id === candidate.avatar) && ['en', 'fa'].includes(candidate.language)) initialProfile = candidate;
      }
      if (!initialProfile) {
        const avatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)].id;
        const language = localStorage.getItem('roomio-language') === 'fa' ? 'fa' : 'en';
        initialProfile = { name: avatarName(avatar, language), avatar, language };
      }
    }
    localStorage.setItem(initialProfileKey, JSON.stringify(initialProfile));
    // Mark before issuance: a lost response must retry the cookie, never silently issue another guest.
    localStorage.setItem(establishedKey, '1');
    return accept(await (await sessionRequest('', initialProfile)).json());
  };
  // Cookie recovery inside the lock prevents first-open tabs from registering different guests.
  pending = (typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request('roomio-guest-session', run)
    : run()).finally(() => { pending = undefined; });
  return pending;
}
/** Keep explicit profile choices available for subsequent, explicitly requested identity resets. */
export function rememberProfile(profile: Profile) {
  initialProfile = { name: profile.name, avatar: profile.avatar, language: profile.language };
  try { localStorage.setItem(initialProfileKey, JSON.stringify(initialProfile)); } catch (handledError) { logHandledException("auth.rememberProfile.5", handledError);  /* Backend and in-memory profile retain the accepted choice. */ }
}
export function ensureSession(profile?: Profile): Promise<GuestSession> {
  initialProfile = profile ?? initialProfile;
  return obtain(false);
}
export async function token(force = false): Promise<string> {
  return (await obtain(force)).accessToken;
}
export function watchToken(callback: (accessToken: string) => void, onError: (error: unknown) => void = () => {}): () => void {
  listeners.set(callback, onError);
  if (current) callback(current.accessToken);
  scheduleRefresh();
  return () => { listeners.delete(callback); if (listeners.size === 0) clearTimeout(timer); };
}
export function canResetIdentity(error: unknown): boolean {
  return error instanceof ApiError && ['INVALID_TOKEN', 'SESSION_EXPIRED', 'SESSION_REVOKED', 'UNAUTHENTICATED'].includes(error.code);
}
/** Call only after explicit confirmation that existing room ownership will be abandoned. */
export async function resetIdentity(): Promise<void> {
  if (pending) await pending.catch((handledError) => {
    logHandledException("auth.resetIdentity.6", handledError); });
  await sessionRequest('/reset', {});
  clearTimeout(timer);
  current = undefined;
  initialProfile = undefined;
  localStorage.removeItem(establishedKey);
  localStorage.removeItem('roomio-last-owned-code');
  localStorage.removeItem('roomio-last-room');
  sessionStorage.removeItem('roomio-active-code');
}

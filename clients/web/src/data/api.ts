import { logHandledException } from './sessionLog';
import { t } from '../i18n';
import { trackApiSuccess } from '../observability';
import { diagnosticEvent, diagnosticRoute, diagnosticError, nextOperationId } from './sessionLog';
import { token } from './auth';
import { ApiError } from './errors';
import { backendUrl } from './config';
export { ApiError } from './errors';
export { backendUrl } from './config';
export async function request<T>(path: string, body?: unknown, method = body === undefined ? 'GET' : 'POST', idempotencyKey?: string): Promise<T> {
  if (!path.startsWith('/v1/')) throw new Error('Invalid API path');
  const operation = nextOperationId();
  const route = diagnosticRoute(path);
  const started = performance.now();
  diagnosticEvent('http.start', { operation, method, route });
  try {
    const send = async (force: boolean) => {
      diagnosticEvent('http.attempt', { operation, refresh: force });
      const accessToken = await token(force);
      try {
        const response = await fetch(`${backendUrl}${path}`, { method, credentials: 'include', headers: { 'X-Roomio-Client': 'browser', Authorization: `Bearer ${accessToken}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000) });
        diagnosticEvent('http.attempt_response', { operation, refresh: force, status: response.status });
        return response;
      } catch (error) {
        logHandledException("api.request.send.1", error);
        diagnosticEvent('http.transport_failure', { operation, code: diagnosticError(error) });
        throw new ApiError('NETWORK');
      }
    };
    let response = await send(false);
    if (response.status === 401) {
      const failure = await response.clone().json().catch((handledError) => {
        logHandledException("api.request.failure.2", handledError); return ({}); });
      if (['SESSION_EXPIRED', 'INVALID_TOKEN', 'UNAUTHENTICATED'].includes(failure.code)) response = await send(true);
    }
    diagnosticEvent('http.response', { operation, status: response.status, elapsedMs: Math.round(performance.now() - started) });
    if (!response.ok) {
      const error = await response.json().catch((handledError) => {
        logHandledException("api.request.error.3", handledError); return ({}); });
      throw new ApiError(error.code || 'UNAVAILABLE', response.status, error.code === 'ALREADY_IN_ROOM' && typeof error.activePartyCode === 'string' && /^[0-9A-HJKMNP-TV-Z]{8}$/.test(error.activePartyCode) ? error.activePartyCode : undefined);
    }
    const result = response.status === 204 ? undefined as T : await response.json();
    diagnosticEvent('http.complete', { operation, elapsedMs: Math.round(performance.now() - started) });
    trackApiSuccess(route, method);
    return result;
  } catch (error) {
    logHandledException("api.request.4", error);
    diagnosticEvent('http.failure', { operation, code: diagnosticError(error), elapsedMs: Math.round(performance.now() - started) });
    throw error;
  }
}
const messages: Record<string, string> = {
  CHAT_SEND_TIMEOUT: 'Message could not be sent. Retry or discard it.',
  INVALID_CHAT_MESSAGE: 'Use a message of 1–500 characters.', CHAT_MESSAGE_CONFLICT: 'This message could not be retried. Discard it and send a new message.', INVALID_CHAT_CURSOR: 'Could not load earlier messages. Refresh the conversation and try again.',
  REPORT_TOO_LARGE: 'The session log is too large to send. Copy your description, then reload the page to begin a new log.', INVALID_REPORT: 'Check your description (up to 8,000 characters).', REPORT_CONFLICT: 'This report changed. Edit your description and send again.',
  INVALID_STREAM_URL: 'Enter a valid HTTPS video URL.', FORBIDDEN: 'Only the room owner can change the stream.', OWNER_ABSENT: 'The owner must be present to change the stream.', ALREADY_IN_ROOM: 'You already have an active party. Return to it and leave before opening another.', STREAM_ACTIVE: 'End the current stream before starting another.', STALE_STREAM_REVISION: 'The stream changed. Refresh the room and try again.',
  NETWORK: "You're offline. Check your connection and try again.", ROOM_NOT_FOUND: 'That party could not be found. Check the code and try again.', ROOM_FULL: 'This room is full.', ROOM_ENDED: 'This party has ended.', NOT_A_MEMBER: 'Your room session has ended. Join the party again.', OWNER_REQUIRED: 'Only the present owner can change the stream.', INVALID_URL: 'Enter a valid HTTPS video URL.', INVALID_PROFILE: 'Choose an avatar and try saving your profile again.', RATE_LIMITED: 'Too many requests. Wait a moment and try again.', AUTH_UNAVAILABLE: 'Identity service is unavailable. Your saved identity is kept; try again.', SESSION_REVOKED: 'This session was revoked. Reset your guest identity to start again.', SESSION_EXPIRED: 'Your saved guest session has expired. Reset your guest identity to start again.', INVALID_TOKEN: 'Your saved guest session is unavailable. Reset your guest identity to start again.', UNAUTHENTICATED: 'Your saved guest session is unavailable. Reset your guest identity to start again.', VOICE_DISABLED: 'Voice is unavailable on this server.', UNAVAILABLE: 'The service is unavailable. Try again.'
};
export function errorMessage(error: unknown): string {
  return t(error instanceof ApiError ? messages[error.code] || 'That action failed. Please try again.' : 'Unable to restore your session. Check your connection and try again.');
}

export class MutationRequests {
  private keys = new Map<string, string>();
  async run<T>(path: string, body: unknown): Promise<T> {
    const operation = JSON.stringify([path, body]);
    const key = this.keys.get(operation) || crypto.randomUUID();
    this.keys.set(operation, key);
    try {
      const result = await request<T>(path, body, 'POST', key);
      this.keys.delete(operation);
      return result;
    } catch (error) {
      logHandledException("api.run.5", error);
      if (error instanceof ApiError && error.status > 0 && error.status < 500) this.keys.delete(operation);
      throw error;
    }
  }
}

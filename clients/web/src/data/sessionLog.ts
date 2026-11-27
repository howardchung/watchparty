const events = new Set([
  'player.source_attached',
  'player.source_detached',
  'app.connectivity',
  'app.pageshow',
  'app.started',
  'app.visibility',
  'auth.accepted',
  'auth.failure',
  'auth.rejected',
  'auth.response',
  'auth.start',
  'console.error',
  'console.warn',
  'exception.handled',
  'http.attempt',
  'http.attempt_response',
  'http.complete',
  'http.failure',
  'http.response',
  'http.start',
  'http.transport_failure',
  'player.autoplay_blocked',
  'player.fallback',
  'player.seek_requested',
  'player.state',
  'promise.rejected',
  'react.root',
  'report.accepted',
  'report.failure',
  'report.send',
  'room.close',
  'room.connect',
  'room.connect_failure',
  'room.connected',
  'room.disconnected',
  'room.retry_scheduled',
  'room.snapshot_recovery',
  'room.state',
  'room.sync_requested',
  'room.sync_result',
  'room.sync_timeout',
  'screen.state',
  'voice.failure',
  'voice.join',
  'voice.microphone_acquired',
  'voice.mute_requested',
  'voice.peer_state',
  'voice.state',
  'window.error',
]);
const states = new Set(
  'off requesting reconnecting settings party-manager room-preview party mse non_mse software native hevc other local remote idle empty connecting connected disconnected failed closed new checking completed loading playing paused buffering error ready active inactive ended waiting started stopped browser avplayer engine_failure startup_failure hidden visible online offline preview home room joining create join restore reset refresh profile leave GET POST PATCH DELETE APPLIED UNAVAILABLE'.split(
    ' '
  )
);
const numeric = new Set(
  'operation attempt generation retries members peers tracks status revision sequence pending elapsedMs delayMs'.split(
    ' '
  )
);
const flags = new Set('retry muted restored refresh fatal online connected'.split(' '));
const codes = new Set(
  `
ALREADY_IN_ROOM AUTH_UNAVAILABLE CHAT_MESSAGE_CONFLICT CHAT_SEND_TIMEOUT FORBIDDEN
IDEMPOTENCY_MISMATCH IDENTITY_NOT_FOUND INTERNAL_ERROR INVALID_CHAT_CURSOR INVALID_CHAT_MESSAGE
INVALID_FILE_NAME INVALID_IDEMPOTENCY_KEY INVALID_JSON INVALID_PROFILE INVALID_REPORT
INVALID_STREAM_SOURCE INVALID_STREAM_URL INVALID_TICKET INVALID_TOKEN INVALID_URL NETWORK
NOT_A_MEMBER NOT_FOUND NOT_INCLUDED NO_ACTIVE_STREAM NO_READY_VIEWERS OWNER_ABSENT OWNER_ONLY
OWNER_REQUIRED PAYLOAD_TOO_LARGE RATE_LIMITED REPORT_CONFLICT REPORT_TOO_LARGE ROOM_ENDED ROOM_FULL
ROOM_NOT_FOUND SESSION_EXISTS SESSION_EXPIRED SESSION_REVOKED STALE_NEGOTIATION
STALE_STREAM_REVISION STALE_SYNC STREAM_ACTIVE SYNC_COMMITTED SYNC_IN_PROGRESS SYNC_TIMEOUT
TRANSPORT_ERROR UNAUTHENTICATED UNAVAILABLE UNKNOWN UNSUPPORTED_COMMAND VOICE_DISABLED
VOICE_SESSION_EXPIRED
`
    .trim()
    .split(/\s+/)
);
const types = new Set(
  'Error TypeError RangeError SyntaxError ReferenceError AggregateError DOMException InvalidStateError AbortError TimeoutError NotAllowedError NotFoundError NotReadableError NotSupportedError SecurityError UnhandledRejection'
    .split(' ')
    .concat('React ErrorBoundary Error')
);
export function errorType(name: unknown) {
  return typeof name === 'string' && types.has(name) ? name : 'Error';
}
export function errorKind(value: unknown) {
  return value instanceof Error
    ? 'error'
    : value === null
      ? 'null'
      : Array.isArray(value)
        ? 'array'
        : typeof value;
}
export function errorReason(value: unknown): string | undefined {
  const message = value instanceof Error ? value.message : typeof value === 'string' ? value : '';
  if (/network request failed|failed to fetch/i.test(message)) return 'NETWORK';
  if (/sourcebuffer.*removed|removed.*sourcebuffer/i.test(message)) return 'SOURCE_BUFFER_REMOVED';
  if (/loading chunk|dynamically imported module|chunkloaderror/i.test(message)) return 'CHUNK_LOAD_FAILED';
  if (/autoplay|play\(\).*user.*interact/i.test(message)) return 'AUTOPLAY_BLOCKED';
  return undefined;
}
export function diagnosticError(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  if (typeof code === 'string' && codes.has(code)) return code;
  return error instanceof Error && errorType(error.name) !== 'Error' ? errorType(error.name) : 'UNKNOWN';
}

export const sessionStartedAt = new Date().toISOString();
const lines: string[] = [];
const trail: {
  recorded: number;
  category: string;
  message: string;
  data: Record<string, string | number | boolean>;
}[] = [];
export function diagnosticTrail() {
  const now = performance.now();
  return trail
    .filter((item) => now - item.recorded <= 120_000)
    .map(({ recorded, ...item }) => ({
      ...item,
      data: { ...item.data, agoSec: Math.max(0, Math.floor((now - recorded) / 1000)) },
    }));
}
let operationSequence = 0;
export function nextOperationId() {
  return ++operationSequence;
}
function append(record: object) {
  lines.push(JSON.stringify({ ...record, elapsedSec: Math.floor(performance.now() / 1000) }));
}
export function diagnosticEvent(
  event: string,
  fields: Record<string, string | number | boolean | undefined> = {}
) {
  if (!events.has(event)) return;
  const data: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'boolean' && flags.has(key)) data[key] = value;
    else if (typeof value === 'number' && numeric.has(key) && Number.isSafeInteger(value) && value >= 0)
      data[key] = value;
    else if (key === 'route' && typeof value === 'string') data.route = diagnosticRoute(value);
    else if (key === 'code' && typeof value === 'string')
      data.code = codes.has(value) || types.has(value) ? value : 'UNKNOWN';
    else if (
      [
        'state',
        'status',
        'stream',
        'engine',
        'reason',
        'method',
        'action',
        'screen',
        'codec',
        'decoder',
        'source',
      ].includes(key) &&
      typeof value === 'string' &&
      states.has(value)
    )
      data[key] = value;
  }
  append({ event, ...data });
  if (event.startsWith('console.')) return;
  trail.push({ recorded: performance.now(), category: 'application', message: event, data });
  if (trail.length > 12) trail.shift();
}
/** Fixed route labels only: identifiers, invitation codes, query values and unknown paths are never retained. */
export function diagnosticRoute(path: string): string {
  const route = path.split(/[?#]/, 1)[0];
  if (
    /^\/v1\/rooms\/[^/]+(?:\/(?:preview|join|leave|end|snapshot|stream\/(?:start|abort)|realtime-ticket|voice\/config|bug-reports|chat\/messages))?$/.test(
      route
    )
  )
    return route.replace(/(\/rooms\/)[^/]+/, '$1[room]');
  if (
    /^\/v1\/guest-sessions(?:\/(?:refresh|reset|revoke|profile))?$/.test(route) ||
    route === '/v1/rooms' ||
    route === '/v1/bug-reports'
  )
    return route;
  return '[other]';
}

const ownedOperations = new WeakMap<object, string>();
export function observedOperation(error: unknown) {
  return error && typeof error === 'object' ? ownedOperations.get(error) : undefined;
}
const sourceModules = new Set(
  'avPlayer VideoPlayer LiveApp PreviewApp auth api realtime voice sessionLog main BugReportDialog'.split(' ')
);
function firstSourceFrame(stack?: string) {
  for (const line of (stack ?? '').split('\n').slice(1, 25)) {
    const frame = /(?:^|[/ ])([\w.-]+)\.(?:js|tsx?)(?::(\d+):(\d+))\)?$/.exec(line);
    if (frame && sourceModules.has(frame[1])) return frame.slice(1).join(':');
    const bundle = /\/assets\/[\w.-]+\.js:(\d+):(\d+)\)?$/.exec(line);
    if (bundle) return 'bundle:' + bundle.slice(1).join(':');
  }
}
export function logHandledException(operation: string, error: unknown): void {
  try {
    // Only source-owned subsystem names leave this boundary.
    const family = /^(api|auth|room|realtime|voice|report|player|analytics|chat)(?:\.|$)/i
      .exec(operation)?.[1]
      .toLowerCase();
    const label = [
      'promise.rejected',
      'window.error',
      'react.root',
      'player.source.select',
      'player.source.open',
      'voice.capability',
      'voice.roster',
      'voice.mute',
      'chat.send',
      'chat.delivery',
    ].includes(operation)
      ? operation
      : /^(?:VideoPlayer|avPlayer)\./.test(operation)
        ? 'player'
        : (family ?? 'application');
    if (error && typeof error === 'object' && !ownedOperations.has(error)) ownedOperations.set(error, label);
    const cause = error instanceof Error ? error.cause : undefined;
    append({
      event: 'exception.handled',
      operation: label,
      kind: errorKind(error),
      type: errorType(error instanceof Error ? error.name : undefined),
      code: diagnosticError(error),
      reason: errorReason(error),
      frame: error instanceof Error ? firstSourceFrame(error.stack) : undefined,
      causeType: cause instanceof Error ? errorType(cause.name) : undefined,
    });
  } catch {
    /* Logging cannot interfere with recovery. */
  }
}
export function sessionLog() {
  return lines.join('\n');
}
export function browserInfo(): Record<string, string> {
  const match = /(?:Edg|Firefox|Chrome|Version)\/(\d+)/g;
  const versions = Array.from(navigator.userAgent.matchAll(match));
  const agent = versions.find((item) => item[0].startsWith('Edg')) ?? versions[0];
  const ua = navigator.userAgent;
  const os = /Android/.test(ua)
    ? 'Android'
    : /iPhone|iPad|iPod/.test(ua)
      ? 'iOS'
      : /Windows/.test(ua)
        ? 'Windows'
        : /Macintosh/.test(ua)
          ? 'macOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'Other';
  return {
    platform: 'browser',
    os,
    build: import.meta.env.VITE_APP_BUILD || 'development',
    ...(agent ? { browser: agent[0].replace('Version/', 'Safari/').replace('Edg/', 'Edge/') } : {}),
  };
}
diagnosticEvent('app.started');
if (typeof window !== 'undefined') {
  for (const level of ['warn', 'error'] as const) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      diagnosticEvent('console.' + level);
      original(...args);
    };
  }
  window.addEventListener('error', (event) => logHandledException('window.error', event.error));
  window.addEventListener('unhandledrejection', (event) =>
    logHandledException('promise.rejected', event.reason)
  );
}
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => diagnosticEvent('app.connectivity', { online: true }));
  window.addEventListener('offline', () => diagnosticEvent('app.connectivity', { online: false }));
  window.addEventListener('pageshow', (event) =>
    diagnosticEvent('app.pageshow', { restored: event.persisted })
  );
  document.addEventListener('visibilitychange', () =>
    diagnosticEvent('app.visibility', { state: document.visibilityState })
  );
}

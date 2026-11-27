import { serviceCodes } from './diagnostics.ts';

// Report submitters, including older clients, are untrusted. Rebuild each record.
// The same projection is applied to queued reports immediately before delivery.
const events = new Set(
  `
app.started app.connectivity app.pageshow app.visibility screen.state console.warn console.error
auth.accepted auth.failure auth.rejected auth.response auth.start auth.create auth.refresh auth.reset auth.profile
http.attempt http.attempt_response http.complete http.failure http.response http.start http.transport_failure http.cancelled http.decode_failure
exception.handled player.autoplay_blocked player.fallback player.seek_requested player.state player.playing player.tracks
player.source_attached player.source_detached player.failure player.lifecycle player.released player.load player.decoder_recovery player.retry player.subtitle
report.accepted report.failure report.send room.close room.connect room.connect_failure room.connected room.disconnected
room.retry_scheduled room.reconnected room.auth_refresh room.snapshot room.snapshot_recovery room.state room.sync_requested room.sync_result room.sync_timeout
voice.failure voice.join voice.microphone voice.microphone_acquired voice.mute_requested voice.peer_state voice.peer_ice voice.state voice.disconnect
service.command service.start_failed service.destroyed service.task_removed native.warning native.error
`
    .trim()
    .split(/\s+/)
);
const numbers = new Set(
  'elapsedSec state mediaError operation attempt generation retries members peers tracks groups revision sequence pending elapsedMs delayMs status'.split(
    ' '
  )
);
const flags = new Set('retry muted restored refresh fatal online connected enabled value'.split(' '));
const labels = new Set(
  `
off requesting reconnecting settings party-manager room-preview party mse non_mse software native hevc other local remote idle empty connecting connected disconnected failed closed new checking completed loading playing paused buffering error ready active inactive ended waiting started stopped browser avplayer engine_failure startup_failure hidden visible online offline preview home room joining create join restore reset refresh profile leave GET POST PATCH DELETE APPLIED UNAVAILABLE
ERROR_CODE_FAILED_RUNTIME_CHECK ERROR_CODE_DECODING_FAILED object error string boolean number undefined null array bigint symbol function
Error TypeError RangeError SyntaxError ReferenceError AbortError InvalidStateError NotSupportedError NotAllowedError TimeoutError NotFoundError NotReadableError SecurityError DOMException IllegalStateException IllegalArgumentException CancellationException IOException RuntimeException SocketTimeoutException
NETWORK UNKNOWN TRANSPORT_ERROR INVALID_JSON ROOM_ENDED ROOM_NOT_FOUND ROOM_FULL INVALID_TOKEN SESSION_EXPIRED UNAUTHENTICATED OWNER_REQUIRED NOT_A_MEMBER RATE_LIMITED VOICE_DISABLED AUTH_UNAVAILABLE REPORT_TOO_LARGE INVALID_REPORT SOURCE_BUFFER_REMOVED CHUNK_LOAD_FAILED AUTOPLAY_BLOCKED ERROR_CODE_DECODING_RESOURCES_RECLAIMED
`
    .trim()
    .split(/\s+/)
);
const labelKeys = new Set(
  'state status stream engine reason method action screen kind type code codec source decoder causeType'.split(
    ' '
  )
);
const route =
  /^\/v1\/(?:rooms(?:\/\[room\](?:\/(?:preview|join|leave|end|snapshot|realtime-ticket|bug-reports|stream\/(?:start|abort)|voice\/config|chat\/messages))?)?|guest-sessions(?:\/(?:refresh|reset|revoke|profile))?|bug-reports)$/;
const operations = new Set(
  'react.root window.error promise.rejected api auth room realtime voice player report http service native analytics chat player.source.open player.source.select voice.capability voice.roster voice.mute chat.send chat.delivery'.split(
    ' '
  )
);
function safeRecord(input: Record<string, unknown>) {
  if (typeof input.event !== 'string' || !events.has(input.event)) return undefined;
  const result: Record<string, unknown> = { event: input.event };
  for (const [key, value] of Object.entries(input)) {
    if (numbers.has(key) && typeof value === 'number' && Number.isSafeInteger(value) && value >= 0)
      result[key] = value;
    else if (flags.has(key) && typeof value === 'boolean') result[key] = value;
    else if (typeof value === 'string') {
      if (key === 'route')
        result.route = route.test(value) || value === '[socket-handshake]' ? value : '[other]';
      else if (
        key === 'frame' &&
        /^(?:avPlayer|VideoPlayer|LiveApp|PreviewApp|auth|api|realtime|voice|sessionLog|main|BugReportDialog|bundle|HttpDiagnostics|Http|KtorRoomRepository|MeshVoiceClient|RoomViewModel|AndroidVideoPlayer|AppObservability):\d{1,8}:\d{1,8}$/.test(
          value
        )
      )
        result.frame = value;
      else if (labelKeys.has(key) && (labels.has(value) || (key === 'code' && serviceCodes.has(value))))
        result[key] = value;
      else if (key === 'operation' && input.event === 'exception.handled') {
        const family = value.split('.')[0].toLowerCase();
        result.operation = operations.has(value) ? value : operations.has(family) ? family : 'application';
      }
    }
  }
  return result;
}
export function safeReportLog(log: string): string {
  const lines: string[] = [];
  let omitted = false;
  for (const [line] of log.matchAll(/[^\n]+/g)) {
    // Older web clients prefixed JSON records with ISO timestamps.
    const data = line.replace(/^\d{4}-\d\d-\d\dT[\d:.]+Z /, '');
    if (data === '[unstructured diagnostics omitted]') {
      omitted = true;
      continue;
    }
    let record;
    if (data.startsWith('{') && data.length < 8192) {
      try {
        record = safeRecord(JSON.parse(data));
      } catch {
        /* Discard malformed diagnostics. */
      }
    }
    if (!record) {
      const legacy =
        /^\d{4}-\d\d-\d\dT[\d:.]+Z (?:Debug|Info|Warn|Error|Assert|Verbose) [^:\n]{1,80}: ([a-z]+\.[a-z_]+)(?: (.*))?$/.exec(
          line
        );
      if (legacy && events.has(legacy[1])) {
        const fields: Record<string, unknown> = { event: legacy[1] };
        for (const field of (legacy[2] ?? '').slice(0, 1024).split(' ')) {
          const pair = /^([a-zA-Z]+)=(.{1,128})$/.exec(field);
          if (!pair || pair[1] === 'event') continue;
          fields[pair[1]] = /^\d{1,12}$/.test(pair[2])
            ? Number(pair[2])
            : pair[2] === 'true'
              ? true
              : pair[2] === 'false'
                ? false
                : pair[2];
        }
        record = safeRecord(fields);
      }
    }
    if (record) lines.push(JSON.stringify(record));
    else if (line) omitted = true;
  }
  if (omitted) lines.push('[unstructured diagnostics omitted]');
  return lines.join('\n');
}
export function safeClientInfo(info: Record<string, string>) {
  const result: Record<string, string> = {};
  if (['Android', 'Desktop', 'browser'].includes(info.platform)) result.platform = info.platform;
  for (const key of ['sdk', 'appVersion', 'appVersionCode', 'build']) {
    if (/^\d{1,9}(?:\.\d{1,4}){0,3}$/.test(info[key] ?? '')) result[key] = info[key];
  }
  const major = /^(\d{1,3})(?:\.\d+){0,3}$/.exec(info.osVersion ?? '');
  if (major) result.osVersion = major[1];
  if (info.build === 'development' || /^\d{8}-[a-z0-9-]{1,48}-code\d{1,5}$/.test(info.build ?? ''))
    result.build = info.build;
  if (/^(Firefox|Chrome|Safari|Edge)\/\d{1,3}$/.test(info.browser ?? '')) result.browser = info.browser;
  if (['Android', 'iOS', 'Linux', 'Windows', 'macOS', 'Other'].includes(info.os)) result.os = info.os;
  return result;
}

// Match in source order so a signed link is kept whole, while a credential
// assignment or header still consumes its entire value, even if it contains a URL.
const descriptionTokens = [
  /(?<link>https?:\/\/[^\s"'<>]+)/,
  /(?<privateKey>-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----[\s\S]*?(?:-----END (?:[A-Z ]+ )?PRIVATE KEY-----|$))/,
  /(?<header>\b(?:set-cookie|cookie|authorization|proxy-authorization)\s*:\s*[^\r\n]*)/,
  /(?<uri>(?:wss?|content|file|blob):[^\s"'<>]+)/,
  /(?<bearer>Bearer\s+[^\s"',}]+)/,
  /(?<jwt>\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/,
  /(?<field>["']?(?:access[_-]?token|refresh[_-]?token|authorization|password|credential|ticket|token|api[_-]?key|client[_-]?secret|ice-pwd)["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;}]+)/,
];
const descriptionPattern = new RegExp(descriptionTokens.map(token => token.source).join('|'), 'gi');

export function sanitizeReportDescription(value: string): string {
  return value.replace(descriptionPattern, (...args) => {
    const match = args.at(-1) as Record<string, string | undefined>;
    if (match.link) return match.link;
    if (match.privateKey) return '[private key]';
    if (match.header) return '[credential header]';
    if (match.uri) return '[url]';
    if (match.bearer) return 'Bearer [redacted]';
    if (match.jwt) return '[token]';
    return match.field + '[redacted]';
  });
}

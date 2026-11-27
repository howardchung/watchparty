// Only application source modules and coordinates are suitable for operator logs.
const modules = new Set(
  'server app auth avatarNames bugReports chat config db diagnostics errors groupSync main observability realtime reportDelivery rooms socketDiagnostics voice'.split(
    ' '
  )
);
export function sourceModule(value?: string) {
  const basename = value?.split(/[?#]/, 1)[0].split(/[\\/]/).pop();
  return basename?.endsWith('.ts') && modules.has(basename.slice(0, -3)) ? basename : undefined;
}
const types = new Set(
  'Error TypeError RangeError SyntaxError ReferenceError AggregateError TimeoutError AbortError ApiError DatabaseError'.split(
    ' '
  )
);
export function exceptionType(name?: string) {
  return types.has(name ?? '') ? name! : 'Error';
}
export const serviceCodes = new Set(
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
const causes = new Set(
  'ECONNREFUSED ECONNRESET ETIMEDOUT ENOTFOUND EPIPE 23505 23503 40001 40P01 INVALID_JSON NETWORK RATE_LIMITED'.split(
    ' '
  )
);
export function failureCode(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  return typeof code === 'string' && (causes.has(code) || serviceCodes.has(code)) ? code : undefined;
}
export function logHandledException(operation: string, error: unknown): void {
  try {
    const seen = new Set<unknown>();
    const summary = (value: unknown, depth = 0): object => {
      if (depth > 5 || seen.has(value)) return { limited: true };
      seen.add(value);
      if (!(value instanceof Error))
        return { kind: value === null ? 'null' : typeof value, code: failureCode(value) };
      const frames = (value.stack ?? '')
        .split('\n')
        .slice(1, 25)
        .flatMap((line) => {
          const match = /(?:^|[/( ])([\w.-]+\.ts):(\d+):(\d+)\)?$/.exec(line);
          return match && sourceModule(match[1]) ? [match.slice(1).join(':')] : [];
        });
      return {
        type: exceptionType(value.name),
        code: failureCode(value),
        frames,
        cause: value.cause !== undefined ? summary(value.cause, depth + 1) : undefined,
        errors:
          value instanceof AggregateError
            ? value.errors.slice(0, 10).map((e) => summary(e, depth + 1))
            : undefined,
      };
    };
    console.warn(JSON.stringify({ event: 'exception.handled', operation, ...summary(error) }));
  } catch {
    /* Logging must not break recovery. */
  }
}

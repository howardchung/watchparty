import type { ErrorEvent, EventHint, StackFrame } from '@sentry/react';
import {
  browserInfo,
  diagnosticTrail,
  errorKind,
  errorReason,
  errorType,
  observedOperation,
} from '../data/sessionLog';

// Keep the deployed asset identity used by source maps, never a media URL or a local path.
function sourcePath(input?: string) {
  if (!input) return undefined;
  const path = input.split(/[?#]/, 1)[0];
  const origin = typeof location === 'undefined' ? '' : location.origin;
  const relative = origin && path.startsWith(origin + '/') ? path.slice(origin.length) : path;
  if (
    /^\/(?:assets\/[\w.-]+-[\w-]{8}\.js|vendor\/avplayer\/\d+\.\d+\.\d+-watchparty\.\d+\/(?:cheap-polyfill|(?:\d+\.)?avplayer)\.js)$/.test(
      relative
    )
  )
    return relative;
  return undefined;
}
const componentFrames = new Set(['Suspense', 'Lazy', 'PreviewApp', 'LiveApp', 'App', 'VideoPlayer']);
function frame(input: StackFrame): StackFrame {
  const filename = sourcePath(input.filename ?? input.abs_path);
  return {
    filename: filename ?? '[external]',
    lineno: input.lineno,
    colno: input.colno,
    in_app: input.in_app,
    function:
      componentFrames.has(input.function ?? '') || (filename && /^[\w.$]{1,100}$/.test(input.function ?? ''))
        ? input.function
        : undefined,
  };
}
export function sanitizeErrorEvent(event: ErrorEvent, hint?: EventHint): ErrorEvent {
  if (hint) hint.attachments = [];
  const errors = event.exception?.values?.map((item) => {
    const type = errorType(item.type);
    const reason = errorReason(item.value);
    const mechanism = item.mechanism;
    return {
      type,
      value: reason ?? type,
      stacktrace: item.stacktrace && { frames: item.stacktrace.frames?.map(frame) },
      mechanism: mechanism && {
        type: /^(?:auto\.[\w.]+|generic|chained)$/.test(mechanism.type) ? mechanism.type : 'generic',
        handled: mechanism.handled,
        exception_id: mechanism.exception_id,
        parent_id: mechanism.parent_id,
      },
    };
  });
  const meta = event.debug_meta?.images?.flatMap((image) => {
    const code_file = sourcePath(image.code_file);
    return code_file && image.debug_id && /^[a-f\d-]{36}$/i.test(image.debug_id)
      ? [{ type: 'sourcemap' as const, code_file, debug_id: image.debug_id }]
      : [];
  });
  const original = hint?.originalException;
  const rejection =
    typeof PromiseRejectionEvent !== 'undefined' && original instanceof PromiseRejectionEvent
      ? original.reason
      : original;
  const contexts: ErrorEvent['contexts'] = {};
  if (
    hint && 'originalException' in hint &&
    errors?.some((e) => e.type === 'UnhandledRejection' &&
      e.mechanism?.type === 'auto.browser.global_handlers.onunhandledrejection')
  ) {
    contexts.promise_rejection = { reason_type: rejection === null ? 'null' : typeof rejection };
  }
  const tags: Record<string, string> = {};
  if (errors?.some((e) => e.mechanism?.type.includes('unhandledrejection'))) {
    tags.rejection_kind = errorKind(rejection);
    tags.operation = observedOperation(rejection) ?? 'promise.rejected';
  }
  if (errors?.some((e) => e.mechanism?.type.includes('react.error_handler'))) tags.boundary = 'react.root';
  if (typeof navigator !== 'undefined') {
    const { browser, os } = browserInfo();
    if (browser) tags.browser = browser;
    tags.os = os;
  }
  return {
    type: undefined,
    event_id: event.event_id,
    timestamp: event.timestamp,
    platform: event.platform,
    level: event.level,
    release: event.release,
    environment: event.environment,
    sdk: event.sdk,
    tags,
    contexts,
    message: event.message ? 'Application error' : undefined,
    exception: errors && { values: errors },
    debug_meta: meta?.length ? { images: meta } : undefined,
    breadcrumbs: diagnosticTrail(),
  };
}

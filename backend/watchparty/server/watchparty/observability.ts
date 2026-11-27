import * as Sentry from '@sentry/node';

import { exceptionType, failureCode, logHandledException, sourceModule } from './diagnostics.ts';

export function sanitizeEvent(event: Sentry.ErrorEvent, hint?: Sentry.EventHint): Sentry.ErrorEvent {
  if (hint) hint.attachments = [];
  const tags: Record<string, string | number> = {};
  if (event.tags?.operation === 'http.error') {
    tags.operation = 'http.error';
    const method = event.tags.method;
    if (typeof method === 'string' && ['GET', 'POST', 'PATCH', 'DELETE'].includes(method))
      tags.method = method;
    const route = event.tags.route;
    if (
      typeof route === 'string' &&
      /^\/(?:guest-sessions(?:\/(?:revoke|reset|refresh))?|bug-reports|rooms(?:\/:(?:roomId|code)\/(?:snapshot|join|leave|preview|end|bug-reports|realtime-ticket|chat\/messages|voice\/config|stream\/(?:start|abort)))?)$/.test(
        route
      )
    )
      tags.route = route;
    const status = event.tags.status;
    if (typeof status === 'number' && status >= 500 && status < 600) tags.status = status;
  }
  const code = failureCode(hint?.originalException);
  if (code) tags.code = code;
  return {
    type: undefined,
    event_id: event.event_id,
    timestamp: event.timestamp,
    level: event.level,
    platform: event.platform,
    sdk: event.sdk,
    release: event.release,
    environment: event.environment,
    tags,
    message: event.message ? 'Application error' : undefined,
    exception: {
      values: event.exception?.values?.map((item) => ({
        type: exceptionType(item.type),
        value: code ?? exceptionType(item.type),
        mechanism: item.mechanism && {
          type: [
            'auto.node.onuncaughtexception',
            'auto.node.onunhandledrejection',
            'generic',
            'chained',
          ].includes(item.mechanism.type)
            ? item.mechanism.type
            : 'generic',
          handled: item.mechanism.handled,
        },
        stacktrace: item.stacktrace && {
          frames: item.stacktrace.frames?.map((frame) => ({
            filename: sourceModule(frame.filename) ?? '[external]',
            lineno: frame.lineno,
            colno: frame.colno,
            function:
              sourceModule(frame.filename) && /^[\w.$ <>-]{1,100}$/.test(frame.function ?? '')
                ? frame.function
                : undefined,
          })),
        },
      })),
    },
  };
}
// The SDK's fatal integrations also print the original throwable to stderr.
let initialized = false;
export function initializeMonitoring() {
  if (initialized) return;
  initialized = true;
  let exiting = false;
  const fatal = (mechanism: string, error: unknown) => {
    if (exiting) return;
    exiting = true;
    logHandledException(mechanism, error);
    if (!process.env.SENTRY_DSN) process.exit(1);
    const deadline = setTimeout(() => process.exit(1), 5500);
    try {
      Sentry.captureException(error, {
        originalException: error,
        mechanism: { type: mechanism, handled: false },
        captureContext: { level: 'fatal' },
      });
      void Sentry.flush(5000).then(
        () => process.exit(1),
        (error) => {
          logHandledException('monitoring.flush', error);
          process.exit(1);
        }
      );
    } catch (error) {
      logHandledException('monitoring.capture', error);
      clearTimeout(deadline);
      process.exit(1);
    }
  };
  process.on('uncaughtException', (error) => fatal('auto.node.onuncaughtexception', error));
  process.on('unhandledRejection', (error) => fatal('auto.node.onunhandledrejection', error));
  if (!process.env.SENTRY_DSN) return;
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      databaseQueryData: false,
      stackFrameVariables: false,
    },
    defaultIntegrations: false,
    beforeSend: sanitizeEvent,
    maxBreadcrumbs: 0,
  });
}
export function captureServerError(error: unknown, status: number, method: string, route: unknown) {
  if (process.env.SENTRY_DSN)
    Sentry.captureException(error, {
      tags: { operation: 'http.error', status, method, route: typeof route === 'string' ? route : '[other]' },
    });
}
export const flushMonitoring = () => Sentry.flush(5000);

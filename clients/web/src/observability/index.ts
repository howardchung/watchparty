import * as Sentry from '@sentry/react';
import { browserAnalytics, type ProductEvent } from './analytics';
import { sanitizeErrorEvent } from './privacy';

const enabled =
  import.meta.env.VITE_OBSERVABILITY_ENABLED === 'true' ||
  (import.meta.env.PROD && import.meta.env.VITE_OBSERVABILITY_ENABLED !== 'false');
let initialized = false;
let track: ((event: ProductEvent) => void) | undefined;
export function initializeObservability() {
  if (!enabled || initialized) return;
  initialized = true;
  const environment = import.meta.env.VITE_OBSERVABILITY_ENVIRONMENT || import.meta.env.MODE;
  if (import.meta.env.VITE_SENTRY_DSN)
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment,
      release: import.meta.env.VITE_APP_BUILD,
      dataCollection: {
        userInfo: false,
        cookies: false,
        httpHeaders: false,
        httpBodies: [],
        urlQueryParams: false,
        databaseQueryData: false,
        stackFrameVariables: false,
      },
      maxBreadcrumbs: 0,
      transportOptions: { fetchOptions: { referrerPolicy: 'no-referrer', credentials: 'omit' } },
      beforeSend: sanitizeErrorEvent,
    });
  if (import.meta.env.VITE_POSTHOG_TOKEN) {
    track = browserAnalytics(
      import.meta.env.VITE_POSTHOG_TOKEN,
      import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com',
      environment,
      import.meta.env.VITE_APP_BUILD
    );
    track('app_opened');
    track('$pageview');
  }
}
/** Called only after a successful mutation. Paths are already masked by diagnosticRoute. */
export function trackApiSuccess(route: string, method: string) {
  if (method !== 'POST') return;
  const event =
    route === '/v1/rooms'
      ? 'room_created'
      : route.endsWith('/join')
        ? 'room_joined'
        : route.endsWith('/leave')
          ? 'room_left'
          : route.endsWith('/stream/start')
            ? 'playback_started'
            : route.endsWith('/bug-reports')
              ? 'bug_report_submitted'
              : undefined;
  if (event) track?.(event);
}
initializeObservability();

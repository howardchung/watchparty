import { logHandledException } from '../data/sessionLog';
// Explicit ingestion, as on native. Only the random installation ID is persisted.
export type ProductEvent =
  | 'app_opened'
  | '$pageview'
  | 'room_created'
  | 'room_joined'
  | 'room_left'
  | 'playback_started'
  | 'bug_report_submitted';
const allowed = new Set<ProductEvent>([
  'app_opened',
  '$pageview',
  'room_created',
  'room_joined',
  'room_left',
  'playback_started',
  'bug_report_submitted',
]);
const uuid = /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i;
export function browserAnalytics(token: string, host: string, environment: string, release?: string) {
  let installId: string | undefined;
  const legacy = 'ph_' + token.replace(/\+/g, 'PL').replace(/\//g, 'SL').replace(/=/g, 'EQ') + '_posthog';
  function identifyInstallation() {
    try {
      const idKey = legacy + '_install';
      const existing = localStorage.getItem(idKey);
      const previous = localStorage.getItem(legacy);
      let migrated: unknown;
      if (previous) {
        try {
          migrated = JSON.parse(previous).distinct_id;
        } catch (error) {
          logHandledException('analytics.migration', error);
          /* Old SDK storage may be corrupt. */
        }
      }
      const id =
        existing && uuid.test(existing)
          ? existing
          : typeof migrated === 'string' && uuid.test(migrated)
            ? migrated
            : crypto.randomUUID();
      localStorage.setItem(idKey, id);
      // Remove application-owned SDK attribution state after saving the identifier.
      localStorage.removeItem(legacy);
      sessionStorage.removeItem(legacy);
      return id;
    } catch (error) {
      logHandledException('analytics.storage', error);
      return crypto.randomUUID();
    }
  }
  return (event: ProductEvent) => {
    const preferences = navigator as Navigator & { msDoNotTrack?: string; globalPrivacyControl?: boolean };
    const windowDnt =
      typeof window === 'undefined' ? undefined : (window as Window & { doNotTrack?: string }).doNotTrack;
    if (
      !allowed.has(event) ||
      preferences.globalPrivacyControl ||
      [preferences.doNotTrack, preferences.msDoNotTrack, windowDnt].some(
        (flag) => flag === '1' || flag === 'yes'
      )
    )
      return;
    if (
      !import.meta.env.DEV &&
      (navigator.webdriver || /bot\b|crawler|spider|headlesschrome/i.test(navigator.userAgent))
    )
      return;
    try {
      if (localStorage.getItem('__ph_opt_in_out_' + token) === '0') return;
    } catch (error) {
      logHandledException('analytics.preference', error);
      /* Storage can be unavailable. */
    }
    try {
      installId ??= identifyInstallation();
      const properties = {
        distinct_id: installId,
        platform: 'web',
        environment,
        release,
        $process_person_profile: false,
        $geoip_disable: true,
        ...(event === '$pageview' ? { route: '/' } : {}),
      };
      void fetch(new URL('/i/v0/e/', host), {
        method: 'POST',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({ api_key: token, event, distinct_id: installId, properties }),
      }).catch((error) => logHandledException('analytics.send', error));
    } catch (error) {
      logHandledException('analytics.capture', error);
      /* Best-effort analytics cannot affect product operations. */
    }
  };
}

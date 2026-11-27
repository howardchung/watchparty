import { t, useLanguage } from './i18n';
import { lazy, Suspense, useLayoutEffect, type ComponentType } from 'react';
import { captureException } from '@sentry/react';
import { logHandledException } from './data/sessionLog';
import { previewStates } from './previewStates';
import { Button, LoadingIndicator } from './components/Material';
import { PreviewApp } from './PreviewApp';

function PageLoadFailure() {
  return (
    <main className="form-page">
      <p role="alert">{t("This page couldn’t load.")}</p>
      <Button onClick={() => window.location.reload()}>{t("Retry")}</Button>
    </main>
  );
}

function lazyPage(load: () => Promise<{ default: ComponentType }>) {
  return lazy(async () => {
    try {
      return await load();
    } catch (error) {
      if (!(error instanceof Error && error.message.startsWith('Unable to preload CSS for '))) throw error;
      logHandledException('page.stylesheetPreload', error);
      captureException(error, { tags: { operation: 'page.stylesheetPreload' } });
      // React caches the lazy result. Retry in a fresh document with the same URL.
      return { default: PageLoadFailure };
    }
  });
}

const LocalFileDesigns = lazyPage(() => import('./designs/LocalFileDesigns'));
const LiveApp = lazyPage(() => import('./LiveApp'));
const AndroidDownloadDesigns = lazyPage(() => import('./designs/AndroidDownloadDesigns'));
const BugReportDesigns = lazyPage(() => import('./designs/BugReportDesigns'));
const ChatDesigns = lazyPage(() => import('./designs/ChatDesigns'));
const SyncWaitingDesigns = lazyPage(() => import('./designs/SyncWaitingDesigns'));
const SyncDesigns = lazyPage(() => import('./designs/SyncDesigns'));
export function App() {
  const language = useLanguage();
  useLayoutEffect(() => {
    document.title = t("watchparty");
    document.querySelector('meta[name="description"]')?.setAttribute('content', t("Watch movies together with watchparty."));
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' || new URLSearchParams(location.search).get('dir') === 'rtl' ? 'rtl' : 'ltr';
  }, [language]);
  const preview = new URLSearchParams(location.search).get('preview');
  if (preview === 'local-file') return <Suspense fallback={<LoadingIndicator label={t('Loading')} />}><LocalFileDesigns /></Suspense>;
  if (preview === 'sync-waiting') return <Suspense fallback={<div className="preview-loading"><LoadingIndicator expressive label={t("Opening designs")} /></div>}><SyncWaitingDesigns /></Suspense>;
  if (preview === 'sync') return <Suspense fallback={<div className="preview-loading"><LoadingIndicator expressive label={t("Opening designs")} /></div>}><SyncDesigns /></Suspense>;
  if (preview === 'chat') return <Suspense fallback={<div className="preview-loading"><LoadingIndicator expressive label={t("Opening designs")} /></div>}><ChatDesigns /></Suspense>;
  if (preview === 'bug-reports') return <Suspense fallback={<div className="preview-loading"><LoadingIndicator expressive label={t("Opening designs")} /></div>}><BugReportDesigns /></Suspense>;
  if (preview === 'android-downloads') return <Suspense fallback={<div className="preview-loading"><LoadingIndicator expressive label={t("Opening designs")} /></div>}><AndroidDownloadDesigns /></Suspense>;
  return preview && previewStates[preview] ? <PreviewApp /> : <Suspense fallback={<main className="form-page"><LoadingIndicator label={t("Opening watchparty")} /></main>}><LiveApp /></Suspense>;
}

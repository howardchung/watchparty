import { t } from '../i18n';
import { ArrowDownToLine, Smartphone } from 'lucide-react';
import './android-download-row.css';

export const androidDownloadUrl = '/downloads/latest.apk';

export function AndroidDownloadRow() {
  return (
    <aside className="android-download-row" aria-label={t("Android app")}>
      <Smartphone size={24} aria-hidden="true" />
      <div>
        <strong>{t("Native Android app")}</strong>
        <p>{t("Background voice party")}</p>
      </div>
      <a className="md-icon-button md-icon-button--tonal" href={androidDownloadUrl} download="watch-party.apk" aria-label={t("Download native Android app")} data-tooltip={t("Download for Android")}>
        <ArrowDownToLine size={22} aria-hidden="true" />
      </a>
    </aside>
  );
}

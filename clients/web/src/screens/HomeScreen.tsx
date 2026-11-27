import { useState } from 'react';
import { BugReportDialog } from '../components/BugReportDialog';
import { Snackbar } from '../components/Material';
import { t } from '../i18n';
import { ArrowRight, Bug, Moon, Plus, Settings, Sun, Ticket } from 'lucide-react';
import type { Identity, Party } from '../types';
import { Avatar } from '../components/Avatar';
import { Button, IconButton } from '../components/Material';
import { AndroidDownloadRow } from '../components/AndroidDownloadRow';

interface HomeScreenProps {
  live?: boolean;
  busy?: boolean;
  identity: Identity;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSettings: () => void;
  onCreate: () => void;
  onJoin: () => void;
  returnableParty: Party | null;
  onReturnToParty: () => void;
}

export function HomeScreen({
  identity,
  live = false,
  busy = false,
  theme,
  onToggleTheme,
  onSettings,
  onCreate,
  onJoin,
  returnableParty,
  onReturnToParty,
}: HomeScreenProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  return (
    <div className="screen home-screen screen-enter">
      <main className="home-main">
        <div className="home-tools" role="group" aria-label={t("Page settings")}>
          <a
            className="md-icon-button"
            href="https://github.com/mintturtle/watchparty"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("View watchparty on GitHub")}
            data-tooltip={t("View watchparty on GitHub")}
          >
            <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.5 7.5 0 0 1 8 3.86c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </a>
          <IconButton icon={Bug} label={t("Report a bug")} onClick={() => setReportOpen(true)} />
          <IconButton
            icon={theme === 'dark' ? Sun : Moon}
            label={theme === 'dark' ? t("Use light theme") : t("Use dark theme")}
            className="theme-toggle"
            onClick={onToggleTheme}
          />
          <IconButton icon={Settings} label={t("Settings")} onClick={onSettings} />
        </div>
        <section className="home-stage" aria-labelledby="home-title">
          <div className="home-stage__copy">
            <h1 id="home-title">{t("Stream and chill")}</h1>
          </div>

          <div className="identity-pill">
            <Avatar avatarId={identity.avatarId} label={identity.name} size="large" />
            <div>
              <span>{t("Watching as")}</span>
              <strong>{identity.name || t("Choose a name")}</strong>
            </div>
            <IconButton icon={Settings} label={t("Edit profile")} onClick={onSettings} />
          </div>

          <div className="home-actions">
            <Button
              variant="filled"
              icon={<Plus size={20} aria-hidden="true" />}
              onClick={onCreate}
              disabled={busy}
              fullWidth
            >
              {t("Create a party")}</Button>
            <Button
              variant="tonal"
              icon={<Ticket size={20} aria-hidden="true" />}
              onClick={onJoin}
              disabled={busy}
              fullWidth
            >
              {t("Join with code")}</Button>
          </div>
          <AndroidDownloadRow />
        </section>

        {(!live || returnableParty) && <section
          className={`home-room-preview ${returnableParty ? 'home-room-preview--returnable' : ''}`}
          aria-label={t("Last room")}
        >
          <div className="home-room-preview__scene" aria-hidden="true">
            <span className="mini-scene__moon" />
            <span className="mini-scene__ridge mini-scene__ridge--back" />
            <span className="mini-scene__ridge mini-scene__ridge--front" />
          </div>
          <div className="home-room-preview__copy">
            <span className="eyebrow">
              {t("Last room")}</span>
            <strong>{returnableParty?.title || "Mira's late show"}</strong>
            <span role={busy && live ? 'status' : undefined}>
              {returnableParty
                ? live ? busy ? t("Checking room…") : returnableParty.code : t('{count} friends', { count: returnableParty.participants.length })
                : t('{count} friends', { count: 4 })}
            </span>
          </div>
          <IconButton
            className="directional-icon" icon={ArrowRight}
            label={returnableParty ? t("Return to last room") : t("Open party manager")}
            variant={returnableParty ? 'tonal' : 'standard'}
            onClick={returnableParty ? onReturnToParty : onJoin}
            disabled={busy}
          />
        </section>}
      </main>
      <BugReportDialog open={reportOpen} enabled={live} onClose={() => setReportOpen(false)} onSent={() => setReportSent(true)} />
      <Snackbar message={reportSent ? t("Bug report sent. Thank you.") : ""} onDismiss={() => setReportSent(false)} />
    </div>
  );
}

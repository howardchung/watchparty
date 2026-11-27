import { t } from '../i18n';
import {
  ArrowRight,
  CircleStop,
  Clock3,
  DoorOpen,
  LockKeyhole,
  Play,
  Users,
} from 'lucide-react';
import { AppBar } from '../components/AppBar';
import { Button, LoadingIndicator, StatusCard } from '../components/Material';
import type { JoinStatus, PartyPreview } from '../types';

interface RoomPreviewScreenProps {
  preview: PartyPreview;
  errorMessage?: string;
  joinStatus: JoinStatus;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onBack: () => void;
  onJoin: () => void;
}

export function RoomPreviewScreen({
  preview,
  errorMessage,
  joinStatus,
  theme,
  onToggleTheme,
  onBack,
  onJoin,
}: RoomPreviewScreenProps) {
  const canJoin = preview.availability === 'available';
  const unavailableCopy =
    preview.availability === 'full'
      ? t("This room has reached its participant limit.")
      : preview.availability === 'ended'
        ? t("This party has ended and is no longer accepting guests.")
        : '';

  return (
    <div className="screen room-preview-screen screen-enter">
      <AppBar
        title={t("Room preview")}
        subtitle={t("Check the party before joining")}
        canGoBack
        onBack={onBack}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <main className="room-preview-main">
        <section className="room-preview-card" aria-labelledby="room-preview-title">
          <div className="room-preview-scene" aria-hidden="true">
            <span className="room-preview-scene__screen">
              <Play size={34} fill="currentColor" />
            </span>
            <span className="room-preview-scene__seat room-preview-scene__seat--one" />
            <span className="room-preview-scene__seat room-preview-scene__seat--two" />
            <span className="room-preview-scene__seat room-preview-scene__seat--three" />
          </div>

          <div className="room-preview-heading">
            <div>
              <span className="eyebrow">{t("Party")} <bdi dir="ltr">{preview.id}</bdi></span>
              <h2 id="room-preview-title">{preview.title}</h2>
            </div>
            <span className={`room-status-pill room-status-pill--${preview.availability}`}>
              {preview.availability === 'available'
                ? t("Open")
                : preview.availability === 'full'
                  ? t("Full")
                  : t("Ended")}
            </span>
          </div>

          <dl className="room-facts">
            <div>
              <dt><DoorOpen size={19} aria-hidden="true" /> {t("Owner")}</dt>
              <dd>{preview.ownerPresent ? preview.ownerName : t('{name} is away', { name: preview.ownerName })}</dd>
            </div>
            <div>
              <dt><Users size={19} aria-hidden="true" /> {t("In the room")}</dt>
              <dd>{t(preview.participantCount === 1 ? '{count} person' : '{count} people', { count: preview.participantCount })}</dd>
            </div>
            <div>
              <dt><Clock3 size={19} aria-hidden="true" /> {t("Stream")}</dt>
              <dd>{preview.streamStatus === 'playing' ? t("Playing now") : t("Waiting to start")}</dd>
            </div>
          </dl>

          {!preview.ownerPresent && canJoin ? (
            <div className="room-notice" role="status">
              <LockKeyhole size={22} aria-hidden="true" />
              <div>
                <strong>{t("No owner in the room")}</strong>
                <span>{t('You can watch and use local controls, but the video stays locked until {name} returns.', { name: preview.ownerName })}</span>
              </div>
            </div>
          ) : null}

          {!canJoin ? (
            <div className="room-notice room-notice--unavailable" role="status">
              <CircleStop size={22} aria-hidden="true" />
              <div>
                <strong>{t("Joining is unavailable")}</strong>
                <span>{unavailableCopy}</span>
              </div>
            </div>
          ) : null}

          {errorMessage && <StatusCard title={t("Unable to join the party")} tone="error">{errorMessage}</StatusCard>}

          <div className="room-preview-actions">
            <Button variant="text" onClick={onBack} disabled={joinStatus === 'loading'}>
              {t("Not now")}</Button>
            {joinStatus === 'loading' ? (
              <LoadingIndicator label={t('Joining {name}', { name: preview.title })} />
            ) : (
              <Button
                icon={<ArrowRight size={19} aria-hidden="true" />}
                onClick={onJoin}
                disabled={!canJoin}
              >
                {t("Join party")}</Button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

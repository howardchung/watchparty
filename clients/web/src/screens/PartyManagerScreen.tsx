import { t } from '../i18n';
import { DoorOpen, Plus, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppBar } from '../components/AppBar';
import { Button, LoadingIndicator, StatusCard, TextField } from '../components/Material';
import type { JoinStatus } from '../types';

export type ManagerMode = 'create' | 'join';

interface PartyManagerScreenProps {
  live?: boolean;
  errorMessage?: string;
  codeDraft?: string;
  onCodeChange?: (value: string) => void;
  initialMode: ManagerMode;
  joinStatus: JoinStatus;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onBack: () => void;
  onCreate: () => void;
  onPreview: (code: string) => void;
  onResetError: () => void;
}

export function PartyManagerScreen({
  initialMode,
  joinStatus,
  theme,
  onToggleTheme,
  onBack,
  onCreate,
  onPreview,
  onResetError,
  live = false,
  errorMessage,
  codeDraft,
  onCodeChange,
}: PartyManagerScreenProps) {
  const [mode, setMode] = useState(initialMode);
  const [localCode, setCode] = useState(joinStatus === 'error' ? 'NOVA-99' : '');
  const code = codeDraft ?? localCode;

  useEffect(() => setMode(initialMode), [initialMode]);

  const changeMode = (nextMode: ManagerMode) => {
    setMode(nextMode);
    onResetError();
  };

  return (
    <div className="screen manager-screen screen-enter">
      <AppBar
        title={t("Party manager")}
        subtitle={t("Create a room or join friends")}
        canGoBack
        onBack={onBack}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <main className="manager-main">
        <div className="segmented-control" role="tablist" aria-label={t("Party action")}>
          <button
            role="tab"
            aria-selected={mode === 'create'}
            className={mode === 'create' ? 'is-selected' : ''}
            onClick={() => changeMode('create')}
          >
            <Plus size={18} aria-hidden="true" />
            {t("Create")}</button>
          <button
            role="tab"
            aria-selected={mode === 'join'}
            className={mode === 'join' ? 'is-selected' : ''}
            onClick={() => changeMode('join')}
          >
            <Ticket size={18} aria-hidden="true" />
            {t("Join")}</button>
        </div>

        {errorMessage && mode === 'create' && <StatusCard title={t("Unable to create the party")} tone="error">{errorMessage}</StatusCard>}
        {mode === 'create' ? (
          <section className="manager-panel" aria-labelledby="create-title">
            <div className="manager-visual manager-visual--create" aria-hidden="true">
              <span className="manager-visual__screen" />
              <span className="manager-visual__seat manager-visual__seat--one" />
              <span className="manager-visual__seat manager-visual__seat--two" />
              <span className="manager-visual__seat manager-visual__seat--three" />
            </div>
            <p className="eyebrow">{t("You will be the host")}</p>
            <h2 id="create-title">{t("Open a room for movie night")}</h2>
            <p>
              {t("watchparty will create a party code and take you to the empty cinema.")}</p>
            {joinStatus === 'loading' ? (
              <LoadingIndicator label={t("Opening your room")} />
            ) : (
              <Button
                fullWidth
                icon={<DoorOpen size={20} aria-hidden="true" />}
                onClick={onCreate}
              >
                {t("Create party")}</Button>
            )}
          </section>
        ) : (
          <section className="manager-panel" aria-labelledby="join-title">
            <p className="eyebrow">{t("A friend has the code")}</p>
            <h2 id="join-title">{t("Step into their room")}</h2>
            <TextField
              label={t("Party code")}
              value={code}
              onChange={(value) => {
                setCode(value.toUpperCase());
                onCodeChange?.(value.toUpperCase());
                if (joinStatus === 'error') onResetError();
              }}
              placeholder={live ? "ABCD1234" : "MOON-42"}
              error={
                joinStatus === 'error'
                  ? errorMessage || t("We couldn't find that party. Check the code and try again.")
                  : undefined
              }
              disabled={joinStatus === 'loading'}
            />
            {joinStatus === 'loading' ? (
              <LoadingIndicator label={t("Finding that party")} />
            ) : (
              <Button
                fullWidth
                icon={<Ticket size={20} aria-hidden="true" />}
                disabled={!code.trim()}
                onClick={() => onPreview(code)}
              >
                {t("Preview party")}</Button>
            )}
            {!live && <p className="manager-code-hints">
              {t('Try MOON-42, ORBIT-08, FULL-10, or ENDED-3.')}
            </p>}
          </section>
        )}
      </main>
    </div>
  );
}

import { t } from '../i18n';
import { LanguagePicker } from '../components/LanguagePicker';
import { ColorPicker } from '../components/ColorPicker';
import { AvatarPicker } from '../components/AvatarPicker';
import type { useThemePalette } from '../theme';
import { useState } from 'react';
import { avatarName } from '../data/avatarCatalog';
import type { Identity } from '../types';
import { AppBar } from '../components/AppBar';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Material';

interface SettingsScreenProps {
  palette: ReturnType<typeof useThemePalette>;
  identity: Identity;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onBack: () => void;
  onSave: (identity: Identity) => void;
  saving?: boolean;
}

export function SettingsScreen({
  identity,
  palette,
  theme,
  onToggleTheme,
  onBack,
  onSave,
  saving = false,
}: SettingsScreenProps) {
  const [draft, setDraft] = useState(identity);
  const name = avatarName(draft.avatarId, draft.language);

  return (
    <div className="screen settings-screen screen-enter">
      <AppBar
        title={t("Your profile")}
        canGoBack
        onBack={onBack}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <main className="form-page">
        <section className="profile-spotlight" aria-label={t("Profile preview")}>
          <Avatar avatarId={draft.avatarId} label={name} size="large" />
          <div>
            <span>{t("Ready to watch")}</span>
            <strong>{name}</strong>
          </div>
        </section>

        <section className="form-section" aria-labelledby="avatar-heading">
          <div className="section-heading">
            <span>01</span>
            <div>
              <h2 id="avatar-heading">{t("Avatar")}</h2>
              <p>{t("Pick the character friends will see.")}</p>
            </div>
          </div>
          <AvatarPicker value={draft.avatarId} language={draft.language} disabled={saving}
            onChange={avatarId => setDraft(current => ({ ...current, avatarId }))} />
        </section>

        <section className="form-section" aria-labelledby="color-heading">
          <div className="section-heading">
            <span>02</span>
            <div><h2 id="color-heading">{t("Color theme")}</h2></div>
          </div>
          <ColorPicker palette={palette} />
          {palette.saveFailed && <p role="alert">{t("Color applied for now. Couldn’t remember it on this device. Select it again to retry.")}</p>}
        </section>

        <section className="form-section" aria-labelledby="language-heading">
          <div className="section-heading">
            <span>03</span>
            <div>
              <h2 id="language-heading">{t("Language")}</h2>
              <p>{t('Applies after saving.')}</p>
            </div>
          </div>
          <LanguagePicker value={draft.language} disabled={saving}
            onChange={language => setDraft(current => ({ ...current, language }))} />
        </section>

        <div className="sticky-action">
          <Button
            fullWidth
            disabled={saving}
            onClick={() => onSave({ ...draft, name })}
          >
            {saving ? t("Saving…") : t("Save profile")}
          </Button>
        </div>
      </main>
    </div>
  );
}

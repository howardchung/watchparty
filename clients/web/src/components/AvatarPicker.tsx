import { useId } from 'react';
import { Check } from 'lucide-react';
import { t } from '../i18n';
import { Avatar } from './Avatar';
import { avatarName, avatarOptions } from '../data/avatarCatalog';
import type { AvatarId, Identity } from '../types';
import './avatar-picker.css';

export function AvatarPicker({ value, onChange, language, disabled = false }: {
  value: AvatarId; onChange: (value: AvatarId) => void; language: Identity['language']; disabled?: boolean;
}) {
  const group = useId();
  return <fieldset className="spotlight-picker" disabled={disabled}>
    <legend className="sr-only">{t('Choose an avatar')}</legend>
    {avatarOptions.map(avatar => {
      const selected = value === avatar.id;
      const name = avatarName(avatar.id, language);
      return <label key={avatar.id} className={`spotlight-choice ${selected ? 'is-selected' : ''}`}>
        <input type="radio" name={group} value={avatar.id} checked={selected} onChange={() => onChange(avatar.id)} aria-label={name} />
        <span className="spotlight-face">
          <span className="spotlight-art" aria-hidden="true"><Avatar avatarId={avatar.id} label={name} size="large" /></span>
          <span className="spotlight-name">{name}</span>
          {selected && <span className="spotlight-check" aria-hidden="true"><Check size={20} /></span>}
        </span>
      </label>;
    })}
  </fieldset>;
}

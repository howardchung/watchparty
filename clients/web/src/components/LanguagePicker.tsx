import { useId, useState } from 'react';
import { Check, ChevronDown, Languages, Search, X } from 'lucide-react';
import { t } from '../i18n';
import { Button, Dialog } from './Material';
import type { Identity } from '../types';
import './language-picker.css';

const languages = [
  { value: 'English', tag: 'en', name: 'English language', glyph: 'Aa', search: 'english انگلیسی en' },
  { value: 'فارسی', tag: 'fa', name: 'Persian', glyph: 'آ', search: 'persian farsi فارسی fa' },
] as const;

export function LanguagePicker({ value, onChange, disabled = false }: {
  value: Identity['language']; onChange: (value: Identity['language']) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(value);
  const [search, setSearch] = useState('');
  const group = useId();
  const filtered = languages.filter(language => `${language.value} ${language.search}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return <div className="language-picker">
    <button type="button" className="language-picker__trigger" aria-label={t('App language')} aria-haspopup="dialog" disabled={disabled}
      onClick={() => { setPending(value); setSearch(''); setOpen(true); }}>
      <span className="language-picker__emblem"><Languages size={24} aria-hidden="true" /></span>
      <span><small>{t('App language')}</small><strong lang={value === 'فارسی' ? 'fa' : 'en'} dir="auto">{value}</strong></span>
      <ChevronDown size={22} aria-hidden="true" />
    </button>
    <Dialog className="language-picker__dialog" open={open} title={t('Find your language')} onClose={() => setOpen(false)}
      actions={<><Button variant="text" onClick={() => setOpen(false)}>{t('Cancel')}</Button>
        <Button disabled={disabled} onClick={() => { onChange(pending); setOpen(false); }}>{t('Use {language}', { language: pending })}</Button></>}>
      <div className="language-picker__search">
        <Search size={20} aria-hidden="true" />
        <input type="search" aria-label={t('Search languages')} placeholder={t('Search by language name')}
          value={search} disabled={disabled} onChange={event => setSearch(event.target.value)} />
        {search && <button type="button" aria-label={t('Clear search')} onClick={() => setSearch('')}><X size={18} aria-hidden="true" /></button>}
      </div>
      <div className="language-picker__scroll">
        {filtered.length ? <fieldset className="language-picker__options" disabled={disabled}>
          <legend className="sr-only">{t('App language')}</legend>
          {filtered.map(language => <label key={language.tag} className="language-picker__choice">
            <input type="radio" name={group} value={language.value} checked={pending === language.value} aria-label={language.value}
              onChange={() => setPending(language.value)} />
            <span className="language-picker__face">
              <span className="language-picker__glyph" lang={language.tag} aria-hidden="true">{language.glyph}</span>
              <span className="language-picker__name"><strong lang={language.tag} dir="auto">{language.value}</strong><small>{t(language.name)}</small></span>
              <span className="language-picker__check" aria-hidden="true">{pending === language.value && <Check size={18} />}</span>
            </span>
          </label>)}
        </fieldset> : <div className="language-picker__empty" role="status"><strong>{t('No languages found')}</strong>
          <Button variant="tonal" onClick={() => setSearch('')}>{t('Show all languages')}</Button></div>}
      </div>
    </Dialog>
  </div>;
}

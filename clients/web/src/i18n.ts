import { logHandledException } from './data/sessionLog';
import { useSyncExternalStore } from 'react';
import fa from './fa.json';
import en from './en.json';

export type Language = 'en' | 'fa';
const storageKey = 'roomio-language';
export const normalizeLanguage = (value: string | null | undefined): Language => value === 'fa' || value === 'فارسی' ? 'fa' : 'en';
function initialLanguage(): Language {
  try {
    const query = new URLSearchParams(location.search).get('lang');
    return normalizeLanguage(query ?? localStorage.getItem(storageKey));
  } catch (handledError) { logHandledException("i18n.initialLanguage.1", handledError);  return 'en'; }
}
let language = initialLanguage();
const listeners = new Set<() => void>();
export function setLanguage(value: string) {
  language = normalizeLanguage(value);
  try { localStorage.setItem(storageKey, language); } catch (handledError) { logHandledException("i18n.setLanguage.2", handledError);  /* The backend profile still retains the saved preference. */ }
  listeners.forEach(listener => listener());
}
export function useLanguage(): Language {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, () => language);
}
/** Translate only application copy. User content and protocol values never pass through this catalog. */
export function t(text: string, values?: Record<string, string | number>): string {
  const translated = language === 'fa' ? (fa as Record<string, string>)[text] ?? text : (en as Record<string, string>)[text] ?? text;
  return values ? translated.replace(/\{(\w+)\}/g, (token, key: string) => String(values[key] ?? token)) : translated;
}

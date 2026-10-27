import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en } from './en';
import { fr } from './fr';
import { zh } from './zh';

export type Locale = 'en' | 'fr' | 'zh';
export type Dict = Record<string, string>;

export const LOCALES: { id: Locale; label: string; htmlLang: string }[] = [
  { id: 'en', label: 'English', htmlLang: 'en-CA' },
  { id: 'fr', label: 'Français', htmlLang: 'fr-CA' },
  { id: 'zh', label: '中文', htmlLang: 'zh-Hans' },
];

const DICTS: Record<Locale, Dict> = { en, fr, zh };

/**
 * Look up `key` and interpolate `{param}` placeholders. A param value that is
 * itself a dictionary key (e.g. `prov.ON`, `edu.master`) is translated too, so
 * engine output stays language-neutral.
 */
export function translate(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const dict = DICTS[locale];
  const raw = dict[key] ?? en[key] ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name: string) => {
    const v = params[name];
    if (v === undefined) return `{${name}}`;
    if (typeof v === 'string' && (dict[v] ?? en[v])) return dict[v] ?? en[v];
    return typeof v === 'number' ? v.toLocaleString(LOCALES.find((l) => l.id === locale)!.htmlLang) : v;
  });
}

interface I18n {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const Ctx = createContext<I18n | null>(null);

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem('immca.locale');
    if (saved === 'en' || saved === 'fr' || saved === 'zh') return saved;
  } catch {
    /* storage unavailable */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en';
  return nav.startsWith('fr') ? 'fr' : nav.startsWith('zh') ? 'zh' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  useEffect(() => {
    document.documentElement.lang = LOCALES.find((l) => l.id === locale)!.htmlLang;
    try {
      localStorage.setItem('immca.locale', locale);
    } catch {
      /* storage unavailable */
    }
  }, [locale]);
  const value = useMemo<I18n>(
    () => ({ locale, setLocale, t: (k, p) => translate(locale, k, p) }),
    [locale],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n must be used inside I18nProvider');
  return v;
}

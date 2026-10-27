import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Ctx, LOCALES, translate, type I18n, type Locale } from './context';

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


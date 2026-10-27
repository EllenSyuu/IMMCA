import { useI18n } from '../i18n';

/** Locale-aware date formatting for ISO dates (YYYY-MM-DD). */
export function useDate(style: 'long' | 'short' = 'long') {
  const { locale } = useI18n();
  const tag = locale === 'zh' ? 'zh-CN' : `${locale}-CA`;
  const opts: Intl.DateTimeFormatOptions = style === 'long' ? { year: 'numeric', month: 'long', day: 'numeric' } : { month: 'short', day: 'numeric' };
  return (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString(tag, opts);
}

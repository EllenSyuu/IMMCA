/** Subscription links for every calendar app, built from one https feed URL. */
import type { Locale } from '../i18n';
import { COUNTER_URL } from '../usage';

export type FeedKind = 'updates' | 'daily';

/** Where feeds are served: through the counter when it is configured, otherwise straight from the site. */
export function feedUrl(kind: FeedKind, locale: Locale, ext: 'ics' | 'xml' = 'ics'): string {
  const file = `${kind}-${locale}.${ext}`;
  if (COUNTER_URL) return `${COUNTER_URL}/feeds/${file}`;
  const base = typeof window === 'undefined' ? 'https://ellensyuu.github.io/IMMCA/' : window.location.href.split('#')[0].split('?')[0];
  return new URL(`feeds/${file}`, base).toString();
}

export function calendarLinks(https: string, name: string) {
  const webcal = https.replace(/^https?:\/\//, 'webcal://');
  return {
    apple: webcal,
    google: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`,
    outlook: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(https)}&name=${encodeURIComponent(name)}`,
    office365: `https://outlook.office.com/calendar/0/addfromweb?url=${encodeURIComponent(https)}&name=${encodeURIComponent(name)}`,
  };
}

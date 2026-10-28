/**
 * Anonymous usage counts, sent to IMMCA's own open-source counter (counter/).
 * Disabled entirely unless the site is built with VITE_COUNTER_URL. Sends only
 * an event kind and a fixed label (language, calendar app, platform) — never
 * anything entered in the form. No cookies; one small flag in localStorage
 * remembers that this device's app install was already counted.
 */
export const COUNTER_URL: string | undefined = import.meta.env.VITE_COUNTER_URL || undefined;

type Kind = 'view' | 'subscribe' | 'install';

export function track(kind: Kind, label: string): void {
  if (!COUNTER_URL || typeof navigator === 'undefined') return;
  const body = JSON.stringify({ e: kind, l: label });
  try {
    // text/plain keeps this a "simple" request: no CORS preflight, works while the page unloads.
    if (navigator.sendBeacon?.(`${COUNTER_URL}/hit`, new Blob([body], { type: 'text/plain' }))) return;
    void fetch(`${COUNTER_URL}/hit`, { method: 'POST', body, keepalive: true, headers: { 'content-type': 'text/plain' } });
  } catch {
    /* counting must never break the page */
  }
}

export function platform(): 'ios' | 'android' | 'desktop' | 'other' {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return /windows|macintosh|linux|cros/i.test(ua) ? 'desktop' : 'other';
}

export function isStandalone(): boolean {
  return (
    (typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches) ||
    (typeof navigator !== 'undefined' && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

const INSTALL_FLAG = 'immca.installCounted';

/** Count an install once per device: on the `appinstalled` event or the first launch from the home screen. */
export function countInstallOnce(): void {
  try {
    if (localStorage.getItem(INSTALL_FLAG)) return;
    localStorage.setItem(INSTALL_FLAG, '1');
  } catch {
    return; // without storage we can't avoid double counting, so don't count
  }
  track('install', platform());
}

export function startUsageTracking(locale: string): void {
  if (!COUNTER_URL) return;
  track('view', locale);
  if (isStandalone()) countInstallOnce();
  window.addEventListener('appinstalled', countInstallOnce);
}

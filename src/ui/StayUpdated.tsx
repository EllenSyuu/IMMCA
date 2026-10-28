import { useEffect, useState } from 'react';
import { BellRing, CalendarPlus, Check, Copy, Download, Rss, Smartphone } from 'lucide-react';
import { useI18n } from '../i18n';
import { calendarLinks, feedUrl, type FeedKind } from '../feeds/links';
import { countInstallOnce, isStandalone, platform, track } from '../usage';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function StayUpdated() {
  const { t, locale } = useI18n();
  const [kind, setKind] = useState<FeedKind>('updates');
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const https = feedUrl(kind, locale);
  const name = t(kind === 'updates' ? 'feed.calUpdates' : 'feed.calDigest');
  const links = calendarLinks(https, name);
  const os = platform();

  const copy = async () => {
    track('subscribe', 'copy');
    try {
      await navigator.clipboard.writeText(https);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt(t('stay.copyFallback'), https);
    }
  };

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') countInstallOnce();
    setPrompt(null);
  };

  return (
    <section className="stay" id="stay-updated" aria-labelledby="stay-title">
      <div className="stay__inner">
        <div className="stay__intro">
          <h2 id="stay-title">{t('stay.title')}</h2>
          <p>{t('stay.intro')}</p>
        </div>

        <div className="stay__grid">
          <div className="stay__card">
            <h3><CalendarPlus size={20} aria-hidden="true" /> {t('stay.calendarTitle')}</h3>
            <div className="segmented segmented--wide" role="group" aria-label={t('stay.calendarTitle')}>
              <button type="button" aria-pressed={kind === 'updates'} onClick={() => setKind('updates')}>{t('stay.kindUpdates')}</button>
              <button type="button" aria-pressed={kind === 'daily'} onClick={() => setKind('daily')}>{t('stay.kindDaily')}</button>
            </div>
            <p className="muted small">{t(kind === 'updates' ? 'stay.kindUpdatesHelp' : 'stay.kindDailyHelp')}</p>
            <div className="stay__buttons">
              <a className="stay__btn" href={links.apple} onClick={() => track('subscribe', 'apple')}>{t('stay.apple')}</a>
              <a className="stay__btn" href={links.google} target="_blank" rel="noreferrer" onClick={() => track('subscribe', 'google')}>{t('stay.google')}</a>
              <a className="stay__btn" href={links.outlook} target="_blank" rel="noreferrer" onClick={() => track('subscribe', 'outlook')}>{t('stay.outlook')}</a>
              <a className="stay__btn" href={links.office365} target="_blank" rel="noreferrer" onClick={() => track('subscribe', 'office365')}>{t('stay.office365')}</a>
              <button type="button" className="stay__btn stay__btn--plain" onClick={copy}>
                {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />} {copied ? t('stay.copied') : t('stay.copy')}
              </button>
            </div>
            <p className="muted small">{t('stay.windowsHelp')}</p>
            <p className="small">
              <Rss size={14} aria-hidden="true" className="inline-icon" />{' '}
              <a href={feedUrl('updates', locale, 'xml')} onClick={() => track('subscribe', 'rss')}>{t('stay.rss')}</a>
            </p>
          </div>

          <div className="stay__card">
            <h3><Smartphone size={20} aria-hidden="true" /> {t('stay.appTitle')}</h3>
            <p className="small">{t('stay.appIntro')}</p>
            {installed ? (
              <p className="stay__done"><Check size={16} aria-hidden="true" /> {t('stay.appInstalled')}</p>
            ) : prompt ? (
              <button type="button" className="primary-button" onClick={install}>
                <Download size={16} aria-hidden="true" /> {t('stay.install')}
              </button>
            ) : (
              <ol className="stay__steps small">
                {os === 'ios' ? (
                  <>
                    <li>{t('stay.ios1')}</li>
                    <li>{t('stay.ios2')}</li>
                  </>
                ) : os === 'android' ? (
                  <li>{t('stay.android')}</li>
                ) : (
                  <li>{t('stay.desktop')}</li>
                )}
              </ol>
            )}
            <p className="muted small"><BellRing size={14} aria-hidden="true" className="inline-icon" /> {t('stay.appNote')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

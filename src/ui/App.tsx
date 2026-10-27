import { useEffect, useMemo, useState } from 'react';
import { rankPrograms } from '../engine/evaluate';
import { PROGRAMS, PROGRAM_BY_ID } from '../data/programs';
import { VERIFIED } from '../data/programs/shared';
import { LOCALES, useI18n } from '../i18n';
import { ProfileForm } from './ProfileForm';
import { RouteCard } from './RouteCard';
import { RouteMap } from './RouteMap';
import { ScorePanel } from './ScorePanel';
import { EMPTY, SAMPLES, toProfile, type FormState } from './model';

const STORAGE_KEY = 'immca.profile.v1';
const REPO = 'https://github.com/EllenSyuu/IMMCA';
type Filter = 'best' | 'all' | 'closed';

function loadState(): FormState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable or corrupt */
  }
  return SAMPLES.mtl;
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(`${iso}T23:59:59`).getTime() - Date.now()) / 86_400_000);
}

function Watch() {
  const { t } = useI18n();
  const items = [
    { key: 'watch.peq', date: '2026-10-31' },
    { key: 'watch.crs', date: '2026-11-03' },
    { key: 'watch.qcElection', date: '2026-11-01' },
  ].filter((i) => daysUntil(i.date) >= 0);
  if (!items.length) return null;
  return (
    <aside className="watch" aria-labelledby="watch-title">
      <h2 id="watch-title">{t('watch.title')}</h2>
      <ul>
        {items.map((i) => (
          <li key={i.key}>
            <span className="watch__days">{t('watch.daysLeft', { days: daysUntil(i.date) })}</span>
            <span>{t(i.key)}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function App() {
  const { t, locale, setLocale } = useI18n();
  const [state, setState] = useState<FormState>(loadState);
  const [filter, setFilter] = useState<Filter>('best');
  const set = (patch: Partial<FormState>) => setState((s) => ({ ...s, ...patch }));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state]);

  const profile = useMemo(() => toProfile(state), [state]);
  const results = useMemo(() => rankPrograms(PROGRAMS, profile), [profile]);
  const counts = {
    eligible: results.filter((r) => r.verdict === 'eligible').length,
    close: results.filter((r) => r.verdict === 'close').length,
    total: results.length,
  };
  const shown = results.filter((r) =>
    filter === 'all' ? true : filter === 'closed' ? r.verdict === 'unavailable' : r.verdict === 'eligible' || r.verdict === 'close',
  );
  const verified = new Date(`${VERIFIED}T12:00:00`).toLocaleDateString(locale === 'zh' ? 'zh-CN' : `${locale}-CA`, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <a className="skip" href="#results">{t('results.title')}</a>
      <header className="topbar">
        <div className="topbar__brand">
          <span className="logo" aria-hidden="true"><span /><span /><span /></span>
          <span className="topbar__name">{t('app.name')}</span>
          <span className="topbar__tagline">{t('app.tagline')}</span>
        </div>
        <nav className="langs" aria-label={t('app.language')}>
          {LOCALES.map((l) => (
            <button key={l.id} type="button" lang={l.htmlLang} aria-pressed={locale === l.id} onClick={() => setLocale(l.id)}>
              {l.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero__text">
            <h1>{t('hero.title')}</h1>
            <p className="hero__body">{t('hero.body', { count: PROGRAMS.length })}</p>
            <p className="hero__privacy">{t('hero.privacy')}</p>
            <div className="hero__samples">
              <span className="muted">{t('hero.samples')}</span>
              {(Object.keys(SAMPLES) as (keyof typeof SAMPLES)[]).map((k) => (
                <button key={k} type="button" className="chip" onClick={() => setState(SAMPLES[k])}>{t(`sample.${k}`)}</button>
              ))}
              <button type="button" className="chip chip--plain" onClick={() => setState(EMPTY)}>{t('sample.clear')}</button>
            </div>
          </div>
          <RouteMap />
        </section>

        <Watch />

        <div className="workspace">
          <section className="workspace__form" aria-labelledby="form-title">
            <h2 id="form-title">{t('form.title')}</h2>
            <ProfileForm state={state} set={set} />
          </section>

          <section className="workspace__results" id="results" aria-labelledby="results-title">
            <div className="results__head">
              <h2 id="results-title">{t('results.title')}</h2>
              <p className="muted" aria-live="polite">{t('results.count', counts)}</p>
            </div>
            <ScorePanel profile={profile} />
            <div className="filters" role="group" aria-label={t('results.title')}>
              {(['best', 'all', 'closed'] as Filter[]).map((f) => (
                <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                  {t(`results.filter.${f}`)}
                </button>
              ))}
            </div>
            {shown.length ? (
              <ul className="routes">
                {shown.map((r) => <RouteCard key={r.programId} spec={PROGRAM_BY_ID.get(r.programId)!} result={r} />)}
              </ul>
            ) : (
              <p className="empty">{t('results.empty')}</p>
            )}
            <p className="disclaimer">{t('results.disclaimer')}</p>
          </section>
        </div>
      </main>

      <footer className="footer">
        <p>{t('app.verified', { date: verified })}</p>
        <p>{t('footer.about')} {t('footer.nunavut')}</p>
        <p><a href={REPO} target="_blank" rel="noreferrer">{t('footer.source')}</a></p>
      </footer>
    </>
  );
}

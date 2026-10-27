import { useEffect, useMemo, useState } from 'react';
import { rankPrograms } from '../engine/evaluate';
import { decide, dimensions, runScenarios } from '../data/insights';
import { LAST_RUN } from '../data/monitor';
import { PROGRAMS, PROGRAM_BY_ID } from '../data/programs';
import { VERIFIED } from '../data/programs/shared';
import { LOCALES, useI18n } from '../i18n';
import { DecisionPanel } from './DecisionPanel';
import { ProfileForm } from './ProfileForm';
import { RouteCard } from './RouteCard';
import { RouteMap } from './RouteMap';
import { ScenarioLab } from './ScenarioLab';
import { ScorePanel } from './ScorePanel';
import { useDate } from './format';
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

export function App() {
  const { t, locale, setLocale } = useI18n();
  const fmt = useDate('long');
  const [state, setState] = useState<FormState>(loadState);
  const [filter, setFilter] = useState<Filter>('best');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
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
  const decision = useMemo(() => decide(results), [results]);
  const scenarios = useMemo(() => runScenarios(profile), [profile]);
  const counts = {
    eligible: results.filter((r) => r.verdict === 'eligible').length,
    close: results.filter((r) => r.verdict === 'close').length,
    total: results.length,
  };
  const shown = results.filter((r) =>
    filter === 'all' ? true : filter === 'closed' ? r.verdict === 'unavailable' : r.verdict === 'eligible' || r.verdict === 'close',
  );
  const showScore = profile.intendedProvince !== 'QC';

  const toggle = (id: string) =>
    setOpenIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /** Open a route from the summary or scenario panel and scroll to it. */
  const show = (id: string) => {
    if (!shown.some((r) => r.programId === id)) setFilter('all');
    setOpenIds((s) => new Set(s).add(id));
    window.setTimeout(() => document.getElementById(`route-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

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

            <DecisionPanel decision={decision} onShow={show} />
            <ScenarioLab scenarios={scenarios} onShow={show} />
            {showScore && <ScorePanel profile={profile} />}

            <div className="routes__head">
              <h3>{t('results.allRoutes')}</h3>
              <div className="filters" role="group" aria-label={t('results.allRoutes')}>
                {(['best', 'all', 'closed'] as Filter[]).map((f) => (
                  <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                    {t(`results.filter.${f}`)}
                  </button>
                ))}
              </div>
            </div>
            {shown.length ? (
              <ul className="routes">
                {shown.map((r) => {
                  const spec = PROGRAM_BY_ID.get(r.programId)!;
                  return (
                    <RouteCard
                      key={r.programId}
                      spec={spec}
                      result={r}
                      dims={dimensions(spec, r)}
                      open={openIds.has(r.programId)}
                      onToggle={() => toggle(r.programId)}
                    />
                  );
                })}
              </ul>
            ) : (
              <p className="empty">{t('results.empty')}</p>
            )}
            <p className="disclaimer">{t('results.disclaimer')}</p>
          </section>
        </div>
      </main>

      <footer className="footer">
        <p>
          {t('app.verified', { date: fmt(VERIFIED) })}
          {LAST_RUN && <> {t('app.lastCheck', { date: fmt(LAST_RUN.checkedAt), n: LAST_RUN.reachable, total: LAST_RUN.total })}</>}
        </p>
        <p>{t('footer.about')} {t('footer.nunavut')}</p>
        <p><a href={REPO} target="_blank" rel="noreferrer">{t('footer.source')}</a></p>
      </footer>
    </>
  );
}

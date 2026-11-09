import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, BellRing, Lock } from 'lucide-react';
import { rankPrograms } from '../engine/evaluate';
import { decide, dimensions, runScenarios } from '../data/insights';
import { LAST_RUN, SOURCE_COUNT } from '../data/monitor';
import { PROGRAMS, PROGRAM_BY_ID } from '../data/programs';
import { VERIFIED } from '../data/programs/shared';
import { LOCALES, useI18n } from '../i18n';
import { Logo } from './Logo';
import { DecisionPanel } from './DecisionPanel';
import { ProfileForm, QuickForm } from './ProfileForm';
import { RouteCard } from './RouteCard';
import { NewsPanel } from './NewsPanel';
import { ScenarioLab } from './ScenarioLab';
import { ScorePanel } from './ScorePanel';
import { StayUpdated } from './StayUpdated';
import { COUNTER_URL, startUsageTracking } from '../usage';
import { useDate } from './format';
import { EMPTY, SAMPLES, toProfile, type FormState } from './model';

const STORAGE_KEY = 'immca.profile.v1';
const MODE_KEY = 'immca.mode';
type Mode = 'quick' | 'full';
const REPO = 'https://github.com/EllenSyuu/IMMCA';
type Filter = 'best' | 'all' | 'closed';

function loadMode(): Mode {
  try {
    return localStorage.getItem(MODE_KEY) === 'full' ? 'full' : 'quick';
  } catch {
    return 'quick';
  }
}

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
  const [mode, setModeState] = useState<Mode>(loadMode);
  const setMode = (m: Mode) => {
    setModeState(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* storage unavailable */
    }
  };
  const [filter, setFilter] = useState<Filter>('best');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const set = (patch: Partial<FormState>) => setState((s) => ({ ...s, ...patch }));

  // One anonymous view count per page load (only when the counter is configured).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => startUsageTracking(locale), []);

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
          <Logo />
          <span className="topbar__name">{t('app.name')}</span>
          <span className="topbar__tagline">{t('app.tagline')}</span>
        </div>
        <div className="topbar__actions">
          <a className="topbar__link" href="#stay-updated"><BellRing size={16} aria-hidden="true" /> <span className="topbar__link-text">{t('nav.subscribe')}</span></a>
          <nav className="langs" aria-label={t('app.language')}>
            {LOCALES.map((l) => (
              <button key={l.id} type="button" lang={l.htmlLang} aria-pressed={locale === l.id} onClick={() => setLocale(l.id)}>
                {l.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__intro">
            <p className="live">
              <span className="live__dot" aria-hidden="true" />
              {LAST_RUN
                ? t('hero.live', { n: LAST_RUN.total, date: fmt(LAST_RUN.checkedAt) })
                : t('hero.live', { n: SOURCE_COUNT, date: fmt(VERIFIED) })}
            </p>
            <h1 id="hero-title">{t('hero.title')}</h1>
            <p className="hero__body">{t('hero.body', { count: PROGRAMS.length })}</p>
          </div>

          <section className="planner" id="planner" aria-labelledby="form-title">
            <div className="planner__head">
              <h2 id="form-title">{t('form.title')}</h2>
              <div className="tabs" role="tablist" aria-label={t('form.title')}>
                {(['quick', 'full'] as Mode[]).map((m) => (
                  <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}>{t(`form.mode.${m}`)}</button>
                ))}
              </div>
            </div>
            {mode === 'quick' ? <QuickForm state={state} set={set} /> : <ProfileForm state={state} set={set} />}
            <div className="planner__foot">
              <a className="primary-button" href="#results">{t('form.seeResults')} <ArrowDown size={18} aria-hidden="true" /></a>
              <div className="planner__samples">
                <span>{t('hero.samples')}</span>
                {(Object.keys(SAMPLES) as (keyof typeof SAMPLES)[]).map((k) => (
                  <button key={k} type="button" className="text-button" onClick={() => setState(SAMPLES[k])}>{t(`sample.${k}`)}</button>
                ))}
                <button type="button" className="text-button text-button--quiet" onClick={() => setState(EMPTY)}>{t('sample.clear')}</button>
              </div>
            </div>
            <p className="planner__privacy"><Lock size={14} aria-hidden="true" /> {t('hero.privacy')}</p>
          </section>
        </section>

        <div className="results-layout" id="results">
          <section className="results-main" aria-labelledby="results-title">
            <div className="results__head">
              <div>
                <h2 id="results-title">{t('results.title')}</h2>
                <p className="results__count" aria-live="polite">{t('results.count', counts)}</p>
              </div>
              <a className="text-button" href="#planner">{t('results.edit')}</a>
            </div>

            <DecisionPanel decision={decision} onShow={show} />

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

          <aside className="results-aside">
            {showScore && <ScorePanel profile={profile} />}
            <ScenarioLab scenarios={scenarios} onShow={show} />
            <NewsPanel />
          </aside>
        </div>
        <StayUpdated />
      </main>

      <footer className="footer">
        <p>
          {t('app.verified', { date: fmt(VERIFIED) })}
          {LAST_RUN && <> {t('app.lastCheck', { date: fmt(LAST_RUN.checkedAt), n: LAST_RUN.reachable, total: LAST_RUN.total })}</>}
        </p>
        <p>{t('footer.about')} {t('footer.nunavut')}</p>
        {COUNTER_URL && <p>{t('footer.counts')} <a href={`${REPO}/blob/main/PRIVACY.md`} target="_blank" rel="noreferrer">{t('footer.privacy')}</a></p>}
        <p><a href={REPO} target="_blank" rel="noreferrer">{t('footer.source')}</a></p>
      </footer>
    </>
  );
}

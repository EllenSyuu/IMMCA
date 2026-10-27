import { useState } from 'react';
import { computeCrs, LMI_START } from '../engine/crs';
import type { Profile } from '../engine/types';
import { DRAWS, familyOf, shareAbove } from '../data/draws';
import { arrimaScore } from '../data/programs/quebec';
import { useI18n } from '../i18n';
import { useDate } from './format';

const TODAY = () => new Date().toISOString().slice(0, 10);

/** The whole Express Entry pool laid out by score, with a marker at yours. */
function PoolStrip({ score }: { score: number }) {
  const { t, locale } = useI18n();
  const { pool } = DRAWS;
  const ascending = [...pool.bands].sort((a, b) => a.min - b.min);
  const above = shareAbove(score);
  const position = (1 - above) * 100;
  const pct = Math.round(above * 100);
  const nf = new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : `${locale}-CA`);
  const asOf = new Date(`${pool.asOf}T12:00:00`).toLocaleDateString(locale === 'zh' ? 'zh-CN' : `${locale}-CA`, { month: 'long', day: 'numeric' });
  return (
    <div className="pool">
      <div className="pool__strip" role="img" aria-label={t('score.poolAbove', { pct, total: nf.format(pool.total) })}>
        {ascending.map((b, i) => (
          <span
            key={b.min}
            className="pool__band"
            style={{ flexGrow: b.count, ['--shade' as string]: i % 2 ? '#d5dae3' : '#e6e9ef' }}
            title={`${b.min}–${b.max}: ${nf.format(b.count)}`}
          />
        ))}
        <span className="pool__marker" style={{ left: `${Math.min(99.5, Math.max(0.5, position))}%` }}>
          <span className="pool__label">{score}</span>
        </span>
      </div>
      <div className="pool__axis" aria-hidden="true">
        {[350, 450, 500].map((v) => (
          <span key={v} style={{ left: `${(1 - shareAbove(v)) * 100}%` }}>{v}</span>
        ))}
      </div>
      <p className="small">{t('score.poolAbove', { pct, total: nf.format(pool.total) })}</p>
      <p className="muted small">{t('score.poolAsOf', { date: asOf })}</p>
    </div>
  );
}

export function ScorePanel({ profile }: { profile: Profile }) {
  const { t } = useI18n();
  const fmt = useDate('short');
  const today = TODAY();
  const beforeChange = today < LMI_START;
  const [view, setView] = useState<'now' | 'next'>('now');
  const date = view === 'next' ? LMI_START : today;
  const crs = computeCrs(profile, date);
  const showQc = profile.intendedProvince === 'QC' || profile.intendedProvince === 'any' || profile.currentProvince === 'QC';
  const parts = [
    { key: 'score.core', value: Object.values(crs.core).reduce((a, b) => a + b, 0), max: 500 },
    { key: 'score.spouse', value: crs.spouse.education + crs.spouse.language + crs.spouse.canadianWork, max: 40 },
    { key: 'score.transfer', value: crs.transferability.total, max: 100 },
    { key: 'score.additional', value: crs.additional.total, max: 600 },
  ].filter((p) => p.key !== 'score.spouse' || p.value > 0);

  return (
    <section className="score" aria-labelledby="score-title">
      <div className="score__head">
        <h3 id="score-title">{t('score.title')}</h3>
        {beforeChange && (
          <div className="segmented" role="group" aria-label={t('score.title')}>
            <button type="button" aria-pressed={view === 'now'} onClick={() => setView('now')}>{t('score.rulesNow')}</button>
            <button type="button" aria-pressed={view === 'next'} onClick={() => setView('next')}>{t('score.rulesNext')}</button>
          </div>
        )}
      </div>

      <div className="score__grid">
        <p className="score__total" aria-live="polite">
          <span className="score__value">{crs.total}</span>
          <span className="score__max">/ 1200</span>
        </p>
        <PoolStrip score={crs.total} />
      </div>

      <details className="score__more">
        <summary>{t('score.details')}</summary>
        <div className="score__detail">
          <div>
            <ul className="score__bars">
              {parts.map((p) => (
                <li key={p.key}>
                  <span>{t(p.key)}</span>
                  <span className="bar" aria-hidden="true"><span style={{ width: `${Math.min(100, (p.value / p.max) * 100)}%` }} /></span>
                  <strong>{p.value}</strong>
                </li>
              ))}
            </ul>
            {crs.labourMarket && <p className="muted small">{t('score.lmi', { value: crs.core.canadianWork })}</p>}
            {showQc && (
              <p className="score__arrima">
                <span>{t('score.arrima')}</span> <strong>{arrimaScore(profile)}</strong> <span className="muted">/ 1400</span>
                <br />
                <span className="muted small">{t('score.arrimaNote')}</span>
              </p>
            )}
          </div>
          <div>
            <h4>{t('score.recent')}</h4>
            <table className="draws">
              <tbody>
                {DRAWS.rounds.slice(0, 6).map((r) => (
                  <tr key={r.number}>
                    <td className="muted">{fmt(r.date)}</td>
                    <td>{familyOf(r.type) ? t(`draw.${familyOf(r.type)}`) : r.type}</td>
                    <td className="num">{r.crs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="muted small">{t('score.recentNote')}</p>
          </div>
        </div>
      </details>
    </section>
  );
}

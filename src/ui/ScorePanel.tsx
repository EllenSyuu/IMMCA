import { useState } from 'react';
import { computeCrs, crsLevers, LMI_START } from '../engine/crs';
import type { Profile } from '../engine/types';
import { DRAWS, familyOf } from '../data/draws';
import { arrimaScore } from '../data/programs/quebec';
import { useI18n } from '../i18n';

const TODAY = () => new Date().toISOString().slice(0, 10);

export function ScorePanel({ profile }: { profile: Profile }) {
  const { t, locale } = useI18n();
  const today = TODAY();
  const beforeChange = today < LMI_START;
  const [view, setView] = useState<'now' | 'next'>('now');
  const date = view === 'next' ? LMI_START : today;
  const crs = computeCrs(profile, date);
  const levers = crsLevers(profile, date).slice(0, 4);
  const showQc = profile.intendedProvince === 'QC' || profile.intendedProvince === 'any' || profile.currentProvince === 'QC';
  const parts = [
    { key: 'score.core', value: Object.values(crs.core).reduce((a, b) => a + b, 0), max: 500 },
    { key: 'score.spouse', value: crs.spouse.education + crs.spouse.language + crs.spouse.canadianWork, max: 40 },
    { key: 'score.transfer', value: crs.transferability.total, max: 100 },
    { key: 'score.additional', value: crs.additional.total, max: 600 },
  ].filter((p) => p.key !== 'score.spouse' || p.value > 0);
  const fmtDate = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString(locale === 'zh' ? 'zh-CN' : `${locale}-CA`, { month: 'short', day: 'numeric' });

  return (
    <section className="score" aria-labelledby="score-title">
      <div className="score__main">
        <div className="score__head">
          <h3 id="score-title">{t('score.title')}</h3>
          {beforeChange && (
            <div className="segmented" role="group" aria-label={t('score.title')}>
              <button type="button" aria-pressed={view === 'now'} onClick={() => setView('now')}>{t('score.rulesNow')}</button>
              <button type="button" aria-pressed={view === 'next'} onClick={() => setView('next')}>{t('score.rulesNext')}</button>
            </div>
          )}
        </div>
        <p className="score__total" aria-live="polite">
          <span className="score__value">{crs.total}</span>
          <span className="score__max">/ 1200</span>
        </p>
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

        <h4>{t('score.levers')}</h4>
        {levers.length ? (
          <ul className="levers">
            {levers.map((l) => (
              <li key={l.key}><span>{t(l.key)}</span><strong>+{l.gain}</strong></li>
            ))}
          </ul>
        ) : (
          <p className="muted small">{t('score.noLevers')}</p>
        )}
      </div>

      <div className="score__side">
        {showQc && (
          <div className="score__arrima">
            <h4>{t('score.arrima')}</h4>
            <p className="score__total score__total--small"><span className="score__value">{arrimaScore(profile)}</span><span className="score__max">/ 1400</span></p>
            <p className="muted small">{t('score.arrimaNote')}</p>
          </div>
        )}
        <div>
          <h4>{t('score.recent')}</h4>
          <table className="draws">
            <tbody>
              {DRAWS.rounds.slice(0, 6).map((r) => (
                <tr key={r.number}>
                  <td className="muted">{fmtDate(r.date)}</td>
                  <td>{familyOf(r.type) ? t(`draw.${familyOf(r.type)}`) : r.type}</td>
                  <td className="num">{r.crs}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted small">{t('score.recentNote')}</p>
        </div>
      </div>
    </section>
  );
}

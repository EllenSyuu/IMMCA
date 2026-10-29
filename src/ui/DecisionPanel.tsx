import { ArrowRight, CalendarClock, ChevronRight, CircleAlert, ExternalLink } from 'lucide-react';
import type { ProgramKind } from '../engine/types';
import type { Decision } from '../data/insights';
import { PROGRAM_BY_ID } from '../data/programs';
import { useI18n } from '../i18n';
import { LINE_COLOR } from './colors';
import { DimensionPills } from './RouteCard';
import { useDate } from './format';

const NEXT: Record<ProgramKind, string> = {
  'express-entry': 'next.ee',
  'pnp-enhanced': 'next.pnp',
  'pnp-base': 'next.pnp',
  'federal-pathway': 'next.federal',
  quebec: 'next.quebec',
  temporary: 'next.federal',
};

type Entry = Decision['best'][number];

/** The single route to look at first, with the next step towards it. */
function LeadRoute({ entry, onShow }: { entry: Entry; onShow: (id: string) => void }) {
  const { t, locale } = useI18n();
  const { spec, result, dims } = entry;
  const unjudged = result.checks.find((c) => c.status === 'unknown' && !c.group);
  return (
    <div className="lead" style={{ ['--line' as string]: LINE_COLOR[spec.jurisdiction] }}>
      <button type="button" className="lead__route" onClick={() => onShow(spec.id)}>
        <span className="lead__name">{spec.name[locale]}</span>
        <DimensionPills dims={dims} result={result} compact />
        <ChevronRight className="decision__go" size={20} aria-hidden="true" />
      </button>
      <p className="lead__next">
        <strong>{t(unjudged ? 'decision.confirmFirst' : 'decision.next')}</strong>{' '}
        {unjudged ? t(unjudged.key, unjudged.params) : t(NEXT[spec.kind])}{' '}
        <a href={spec.sources[0].url} target="_blank" rel="noreferrer">
          {t('decision.officialPage')}<ExternalLink size={13} aria-hidden="true" />
        </a>
      </p>
    </div>
  );
}

/** The answer first: which routes to pursue, what blocks the nearest one, which dates matter. */
export function DecisionPanel({ decision, onShow }: { decision: Decision; onShow: (id: string) => void }) {
  const { t, locale } = useI18n();
  const fmt = useDate('long');
  const { best, blocker, deadlines } = decision;

  return (
    <section className="decision" aria-labelledby="decision-title">
      <h3 id="decision-title">{t('decision.title')}</h3>

      {best.length ? (
        <>
          <LeadRoute entry={best[0]} onShow={onShow} />
          {best.length > 1 && (
            <>
              <h4 className="decision__also">{t('decision.also')}</h4>
              <ol className="decision__best">
                {best.slice(1).map(({ spec, result, dims }) => (
                  <li key={spec.id} style={{ ['--line' as string]: LINE_COLOR[spec.jurisdiction] }}>
                    <button type="button" className="decision__route" onClick={() => onShow(spec.id)}>
                      <span className="decision__name">{spec.name[locale]}</span>
                      <DimensionPills dims={dims} result={result} compact />
                      <ChevronRight className="decision__go" size={18} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </>
      ) : (
        <p className="decision__empty">{t('decision.none')}</p>
      )}

      {(blocker || deadlines.length > 0) && (
        <div className="decision__aside">
          {blocker && (
            <div className="decision__item">
              <CircleAlert size={18} aria-hidden="true" />
              <p>
                <span className="muted">{t('decision.closest')}</span>{' '}
                <button type="button" className="text-link" onClick={() => onShow(blocker.spec.id)}>{blocker.spec.name[locale]}</button>
                <br />
                {t('decision.missing')} {t(blocker.check.key, blocker.check.params)}
                {blocker.check.hintKey && (
                  <>
                    <br />
                    <ArrowRight size={14} aria-hidden="true" className="inline-icon" />{' '}
                    {t(blocker.check.hintKey, { ...blocker.check.params, ...blocker.check.hintParams })}
                  </>
                )}
              </p>
            </div>
          )}
          {deadlines.length > 0 && (
            <div className="decision__item">
              <CalendarClock size={18} aria-hidden="true" />
              <ul className="decision__dates">
                {deadlines.map((d) => (
                  <li key={d.key + d.date + (d.programId ?? '')}>
                    <strong>{fmt(d.date)}</strong>{' '}
                    {d.programId ? t(d.key, { name: PROGRAM_BY_ID.get(d.programId)!.name[locale] }) : t(d.key)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

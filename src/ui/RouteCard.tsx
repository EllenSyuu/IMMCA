import { useId } from 'react';
import { Check as CheckIcon, ChevronDown, CircleDashed, ExternalLink, X } from 'lucide-react';
import type { Check, ProgramResult, ProgramSpec } from '../engine/types';
import type { Dimensions } from '../data/insights';
import { useI18n } from '../i18n';
import { LINE_COLOR } from './colors';
import { useDate } from './format';

/** A program drawn as one transit line: each requirement is a station. */
function Stations({ checks, color, label }: { checks: Check[]; color: string; label: string }) {
  const n = checks.length;
  const w = Math.max(96, n * 24);
  const x = (i: number) => (n === 1 ? w / 2 : 9 + (i * (w - 18)) / (n - 1));
  return (
    <svg className="stations" viewBox={`0 0 ${w} 18`} width={w} height={18} role="img" aria-label={label}>
      <line x1={9} x2={w - 9} y1={9} y2={9} stroke={color} strokeWidth={3} strokeLinecap="round" />
      {checks.map((c, i) => (
        <circle key={i} cx={x(i)} cy={9} r={c.status === 'met' ? 5 : 4.5} className={`station station--${c.status}`} style={{ ['--line' as string]: color }} />
      ))}
    </svg>
  );
}

/** Availability, competitiveness and evidence as three short pills (eligibility is the station line). */
export function DimensionPills({ dims, result, compact = false }: { dims: Dimensions; result: ProgramResult; compact?: boolean }) {
  const { t } = useI18n();
  const pills: { tone: string; text: string }[] = [];
  if (compact) pills.push({ tone: `elig-${dims.eligibility}`, text: t(`dim.elig.${dims.eligibility}`) });
  pills.push({ tone: `avail-${dims.availability}`, text: t(`dim.avail.${dims.availability}`) });
  if (dims.competitiveness !== 'none' && result.points) {
    const p = result.points;
    pills.push({
      tone: `comp-${dims.competitiveness}`,
      text: p.benchmark !== undefined
        ? t(`dim.comp.${dims.competitiveness}`, { value: p.value, cutoff: p.benchmark })
        : t(`dim.comp.${dims.competitiveness}`, { value: p.value, label: t(p.label) }),
    });
  }
  if (dims.evidence !== 'verified') pills.push({ tone: `evid-${dims.evidence}`, text: t(`dim.evid.${dims.evidence}`) });
  return (
    <span className="pills">
      {pills.map((p) => <span key={p.tone} className={`pill pill--${p.tone}`}>{p.text}</span>)}
    </span>
  );
}

/** "canada.ca · canadian experience class" from a long official URL. */
function sourceLabel(url: string): string {
  const u = new URL(url);
  const host = u.hostname.replace(/^www\./, '');
  const last = u.pathname.replace(/\/$/, '').split('/').pop() ?? '';
  const page = decodeURIComponent(last).replace(/\.(html|pdf)$/i, '').replace(/[-_]+/g, ' ').trim();
  return page ? `${host} · ${page.length > 48 ? `${page.slice(0, 47)}…` : page}` : host;
}

const ICON = { met: CheckIcon, unmet: X, unknown: CircleDashed } as const;

export function RouteCard({ spec, result, dims, open, onToggle }: {
  spec: ProgramSpec; result: ProgramResult; dims: Dimensions; open: boolean; onToggle: () => void;
}) {
  const { t, locale } = useI18n();
  const fmt = useDate('long');
  const panelId = useId();
  const color = LINE_COLOR[spec.jurisdiction];
  const decided = result.checks.filter((c) => c.status !== 'unknown' && !c.group);
  const stations = result.checks.filter((c) => !c.group);
  const met = decided.filter((c) => c.status === 'met').length;
  const where = spec.jurisdiction === 'federal' ? t('juris.federal') : t(`prov.${spec.jurisdiction}`);
  const gaps = result.checks.filter((c) => c.status === 'unmet' && c.hintKey);

  return (
    <li id={`route-${spec.id}`} className={`route route--${result.verdict}`} style={{ ['--line' as string]: color }}>
      <button className="route__head" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
        <span className="route__top">
          <span className="route__badge">{where}</span>
          <span className="route__name">{spec.name[locale]}</span>
          <ChevronDown className="route__chevron" size={18} aria-hidden="true" />
        </span>
        <span className="route__meta">
          <Stations checks={stations} color={color} label={t('results.met', { met, total: decided.length })} />
          <span className={`route__elig route__elig--${dims.eligibility}`}>{t(`dim.elig.${dims.eligibility}`)}</span>
          <DimensionPills dims={dims} result={result} />
        </span>
      </button>

      <div id={panelId} className="route__panel" hidden={!open}>
        <p className="route__summary">{spec.summary[locale]}</p>
        <p className="route__kind">{t(`kind.${spec.kind}`)} · {t(`status.${spec.status}`)} · {t('results.met', { met, total: decided.length })}</p>

        {dims.flag?.kind === 'changed' && <p className="route__alert">{t('evidence.changed', { date: fmt(dims.flag.since) })}</p>}
        {dims.flag?.kind === 'unreachable' && <p className="route__caveat">{t('evidence.unreachable', { date: fmt(dims.flag.since) })}</p>}
        {spec.closesOn && <p className="route__alert">{t('results.closesOn', { date: fmt(spec.closesOn) })}</p>}
        {spec.capacity && <p className="route__caveat">{spec.capacity.note[locale]}</p>}
        {spec.confidence && <p className="route__caveat">{spec.confidence.note[locale]}</p>}

        <ol className="timeline">
          {result.checks.map((c, i) => {
            const Icon = ICON[c.status];
            return (
              <li key={i} className={`timeline__stop timeline__stop--${c.status}${c.group ? ' timeline__stop--group' : ''}`}>
                <span className="timeline__dot" aria-hidden="true"><Icon size={12} strokeWidth={3} /></span>
                <span className="visually-hidden">{t(`station.${c.status}`)}: </span>
                <span>{t(c.key, c.params)}</span>
              </li>
            );
          })}
        </ol>

        {gaps.length > 0 && (
          <div className="route__gaps">
            <h4>{t('results.whatToDo')}</h4>
            <ul>{gaps.map((g, i) => <li key={i}>{t(g.hintKey!, { ...g.params, ...g.hintParams })}</li>)}</ul>
          </div>
        )}

        {(spec.enhanced || spec.notes?.length) && (
          <div className="route__notes">
            {spec.enhanced && <p>{t('results.enhanced')}</p>}
            {spec.notes?.map((n, i) => <p key={i}>{n[locale]}</p>)}
          </div>
        )}

        <div className="route__sources">
          <h4>{t('results.sources')}</h4>
          <ul>
            {spec.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {sourceLabel(s.url)}
                  <ExternalLink size={12} aria-hidden="true" />
                </a>{' '}
                <span className="muted">· {t('results.verifiedOn', { date: fmt(s.verified) })}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

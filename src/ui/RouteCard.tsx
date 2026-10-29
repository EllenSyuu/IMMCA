import { useId } from 'react';
import { Check as CheckIcon, ChevronDown, CircleDashed, ExternalLink, Info, TriangleAlert, X } from 'lucide-react';
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

type Pill = { tone: string; text: string };

function availabilityPill(dims: Dimensions, t: (k: string, p?: Record<string, string | number>) => string): Pill {
  return { tone: `avail-${dims.availability}`, text: t(`dim.avail.${dims.availability}`) };
}

function competitivenessPill(dims: Dimensions, result: ProgramResult, t: (k: string, p?: Record<string, string | number>) => string): Pill | undefined {
  if (dims.competitiveness === 'none' || !result.points) return undefined;
  const p = result.points;
  return {
    tone: `comp-${dims.competitiveness}`,
    text: p.benchmark !== undefined
      ? t(`dim.comp.${dims.competitiveness}`, { value: p.value, cutoff: p.benchmark })
      : t(`dim.comp.${dims.competitiveness}`, { value: p.value, label: t(p.label) }),
  };
}

/**
 * The one status worth seeing before opening a route: a constraint on availability
 * if there is one, otherwise how competitive the person is, otherwise how to get in.
 */
function keyPill(dims: Dimensions, result: ProgramResult, t: (k: string, p?: Record<string, string | number>) => string): Pill {
  const constrained = dims.availability === 'closed' || dims.availability === 'exhausted' || dims.availability === 'limited' || dims.availability === 'windows';
  return (!constrained && competitivenessPill(dims, result, t)) || availabilityPill(dims, t);
}

/** Eligibility plus the single most important status; the rest lives in the opened route. */
export function DimensionPills({ dims, result, compact = false }: { dims: Dimensions; result: ProgramResult; compact?: boolean }) {
  const { t } = useI18n();
  const pills: Pill[] = [];
  if (compact) pills.push({ tone: `elig-${dims.eligibility}`, text: t(`dim.elig.${dims.eligibility}`, { n: result.toConfirm }) });
  pills.push(keyPill(dims, result, t));
  return (
    <span className="pills">
      {pills.map((p) => <span key={p.tone} className={`pill pill--${p.tone}`}>{p.text}</span>)}
      <EvidenceNote dims={dims} />
    </span>
  );
}

/** How reliable the rule data is: metadata, so it is a quiet note rather than a status pill. */
export function EvidenceNote({ dims }: { dims: Dimensions }) {
  const { t } = useI18n();
  if (dims.evidence === 'verified') return null;
  const Icon = dims.evidence === 'review' ? TriangleAlert : Info;
  return (
    <span className={`evidence evidence--${dims.evidence}`}>
      <Icon size={14} aria-hidden="true" /> {t(`dim.evid.${dims.evidence}`)}
    </span>
  );
}

/** All four dimensions, spelled out, for an opened route. */
function DimensionTable({ dims, result }: { dims: Dimensions; result: ProgramResult }) {
  const { t } = useI18n();
  const comp = competitivenessPill(dims, result, t);
  const avail = availabilityPill(dims, t);
  const rows: { label: string; tone: string; text: string }[] = [
    { label: t('dim.label.elig'), tone: `elig-${dims.eligibility}`, text: t(`dim.elig.${dims.eligibility}`, { n: result.toConfirm }) },
    { label: t('dim.label.avail'), tone: avail.tone, text: avail.text },
    { label: t('dim.label.comp'), tone: comp?.tone ?? 'comp-none', text: comp?.text ?? t('dim.comp.none') },
    { label: t('dim.label.evid'), tone: `evid-${dims.evidence}`, text: t(`dim.evid.${dims.evidence}`) },
  ];
  return (
    <dl className="dims">
      {rows.map((r) => (
        <div key={r.label} className={`dims__row dims__row--${r.tone}`}>
          <dt>{r.label}</dt>
          <dd>{r.text}</dd>
        </div>
      ))}
    </dl>
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
          <span className={`route__elig route__elig--${dims.eligibility}`}>{t(`dim.elig.${dims.eligibility}`, { n: result.toConfirm })}</span>
          <DimensionPills dims={dims} result={result} />
        </span>
      </button>

      <div id={panelId} className="route__panel" hidden={!open}>
        <p className="route__summary">{spec.summary[locale]}</p>
        <p className="route__kind">{t(`kind.${spec.kind}`)} · {t(`status.${spec.status}`)} · {t('results.met', { met, total: decided.length })}</p>
        <DimensionTable dims={dims} result={result} />

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

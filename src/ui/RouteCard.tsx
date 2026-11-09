import { useId } from 'react';
import { ChevronDown, CircleCheck, CircleHelp, CircleX, ExternalLink, Info, TriangleAlert } from 'lucide-react';
import type { ProgramResult, ProgramSpec } from '../engine/types';
import type { Dimensions } from '../data/insights';
import { useI18n } from '../i18n';
import { useDate } from './format';

/** How many of the requirements a form can judge are met, as a short meter. */
function Meter({ met, total, label }: { met: number; total: number; label: string }) {
  const share = total ? met / total : 0;
  return (
    <span className="meter" role="img" aria-label={label}>
      <span className="meter__bar"><span style={{ width: `${Math.round(share * 100)}%` }} /></span>
      <span className="meter__text">{label}</span>
    </span>
  );
}

type Pill = { tone: string; text: string };

type Fmt = (iso: string) => string;

function availabilityPill(dims: Dimensions, t: (k: string, p?: Record<string, string | number>) => string, fmt: Fmt): Pill {
  return { tone: `avail-${dims.availability}`, text: t(`dim.avail.${dims.availability}`, { date: dims.opensOn ? fmt(dims.opensOn) : '' }) };
}

function competitivenessPill(dims: Dimensions, result: ProgramResult, t: (k: string, p?: Record<string, string | number>) => string): Pill | undefined {
  if (dims.competitiveness === 'none' || !result.points) return undefined;
  const p = result.points;
  return {
    tone: `comp-${dims.competitiveness}`,
    text: p.benchmark !== undefined
      ? t(`dim.comp.${dims.competitiveness}`, { value: p.value, cutoff: p.benchmark })
      : p.noRoundUnderRules
      ? t('dim.comp.newRules', { value: p.value })
      : t(`dim.comp.${dims.competitiveness}`, { value: p.value, label: t(p.label) }),
  };
}

/**
 * The one status worth seeing before opening a route: a constraint on availability
 * if there is one, otherwise how competitive the person is, otherwise how to get in.
 */
function keyPill(dims: Dimensions, result: ProgramResult, t: (k: string, p?: Record<string, string | number>) => string, fmt: Fmt): Pill {
  const constrained = dims.availability === 'closed' || dims.availability === 'exhausted' || dims.availability === 'limited' || dims.availability === 'windows' || dims.availability === 'upcoming';
  return (!constrained && competitivenessPill(dims, result, t)) || availabilityPill(dims, t, fmt);
}

/** Eligibility plus the single most important status; the rest lives in the opened route. */
export function DimensionPills({ dims, result, compact = false }: { dims: Dimensions; result: ProgramResult; compact?: boolean }) {
  const { t } = useI18n();
  const fmt = useDate('long');
  const pills: Pill[] = [];
  if (compact) pills.push({ tone: `elig-${dims.eligibility}`, text: t(`dim.elig.${dims.eligibility}`, { n: result.toConfirm }) });
  pills.push(keyPill(dims, result, t, fmt));
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
  const fmt = useDate('long');
  const comp = competitivenessPill(dims, result, t);
  const avail = availabilityPill(dims, t, fmt);
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

const ICON = { met: CircleCheck, unmet: CircleX, unknown: CircleHelp } as const;

export function RouteCard({ spec, result, dims, open, onToggle }: {
  spec: ProgramSpec; result: ProgramResult; dims: Dimensions; open: boolean; onToggle: () => void;
}) {
  const { t, locale } = useI18n();
  const fmt = useDate('long');
  const panelId = useId();
  const decided = result.checks.filter((c) => c.status !== 'unknown' && !c.group);
  const met = decided.filter((c) => c.status === 'met').length;
  const where = spec.jurisdiction === 'federal' ? t('juris.federal') : t(`prov.${spec.jurisdiction}`);
  const gaps = result.checks.filter((c) => c.status === 'unmet' && c.hintKey);

  return (
    <li id={`route-${spec.id}`} className={`route route--${result.verdict}`}>
      <button className="route__head" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
        <span className="route__top">
          <span className="route__title">
            <span className="route__name">{spec.name[locale]}</span>
            <span className="route__where">{where} · {t(`kind.${spec.kind}`)}</span>
          </span>
          <span className={`status status--${dims.eligibility}`}>{t(`dim.elig.${dims.eligibility}`, { n: result.toConfirm })}</span>
          <ChevronDown className="route__chevron" size={20} aria-hidden="true" />
        </span>
        <span className="route__meta">
          <Meter met={met} total={decided.length} label={t('results.met', { met, total: decided.length })} />
          <DimensionPills dims={dims} result={result} />
        </span>
      </button>

      <div id={panelId} className="route__panel" hidden={!open}>
        <p className="route__summary">{spec.summary[locale]}</p>
        <DimensionTable dims={dims} result={result} />

        {dims.flag?.kind === 'changed' && <p className="route__alert">{t('evidence.changed', { date: fmt(dims.flag.since) })}</p>}
        {dims.flag?.kind === 'unreachable' && <p className="route__caveat">{t('evidence.unreachable', { date: fmt(dims.flag.since) })}</p>}
        {spec.closesOn && <p className="route__alert">{t('results.closesOn', { date: fmt(spec.closesOn) })}</p>}
        {spec.capacity && <p className="route__caveat">{spec.capacity.note[locale]}</p>}
        {spec.confidence && <p className="route__caveat">{spec.confidence.note[locale]}</p>}

        <div className="route__checks">
          <h4>{t('results.requirements')}</h4>
          <ul className="checklist">
            {result.checks.map((c, i) => {
              const Icon = ICON[c.status];
              return (
                <li key={i} className={`check check--${c.status}${c.group ? ' check--group' : ''}`}>
                  {!c.group && <Icon className="check__icon" size={18} aria-hidden="true" />}
                  <span className="visually-hidden">{t(`station.${c.status}`)}: </span>
                  <span>{t(c.key, c.params)}</span>
                </li>
              );
            })}
          </ul>
        </div>

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

import { useId, useState } from 'react';
import { Check as CheckIcon, ChevronDown, CircleDashed, ExternalLink, X } from 'lucide-react';
import type { Check, ProgramResult, ProgramSpec } from '../engine/types';
import { useI18n } from '../i18n';
import { LINE_COLOR } from './colors';

/** A program drawn as one transit line: each requirement is a station. */
function Stations({ checks, color }: { checks: Check[]; color: string }) {
  const n = checks.length;
  const w = Math.max(160, n * 34);
  const x = (i: number) => (n === 1 ? w / 2 : 12 + (i * (w - 24)) / (n - 1));
  return (
    <svg className="stations" viewBox={`0 0 ${w} 24`} width={w} height={24} aria-hidden="true">
      <line x1={12} x2={w - 12} y1={12} y2={12} stroke={color} strokeWidth={4} strokeLinecap="round" />
      {checks.map((c, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={12}
          r={c.status === 'met' ? 6.5 : 6}
          className={`station station--${c.status}`}
          style={{ ['--line' as string]: color }}
        />
      ))}
    </svg>
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

export function RouteCard({ spec, result }: { spec: ProgramSpec; result: ProgramResult }) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const color = LINE_COLOR[spec.jurisdiction];
  const decided = result.checks.filter((c) => c.status !== 'unknown' && !c.group);
  const stations = result.checks.filter((c) => !c.group);
  const met = decided.filter((c) => c.status === 'met').length;
  const where = spec.jurisdiction === 'federal' ? t('juris.federal') : t(`prov.${spec.jurisdiction}`);
  const gaps = result.checks.filter((c) => c.status === 'unmet' && c.hintKey);
  const dateFmt = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString(locale === 'zh' ? 'zh-CN' : `${locale}-CA`, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <li className={`route route--${result.verdict}`} style={{ ['--line' as string]: color }}>
      <button className="route__head" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
        <span className="route__badge">{where}</span>
        <span className="route__title">
          <span className="route__name">{spec.name[locale]}</span>
          <span className="route__kind">
            {t(`kind.${spec.kind}`)} · {t(`status.${spec.status}`)}
          </span>
        </span>
        <span className={`verdict verdict--${result.verdict}`}>{t(`verdict.${result.verdict}`)}</span>
        <span className="route__line">
          <Stations checks={stations} color={color} />
          <span className="route__met">{t('results.met', { met, total: decided.length })}</span>
          {result.points && (
            <span className="route__points">
              {t('results.yourScore', { label: t(result.points.label) })} <strong>{result.points.value}</strong>
              {result.points.benchmark !== undefined && <> · {t('results.benchmark', { value: result.points.benchmark })}</>}
            </span>
          )}
        </span>
        <ChevronDown className="route__chevron" size={20} aria-hidden="true" />
      </button>

      <div id={panelId} className="route__panel" hidden={!open}>
        <p className="route__summary">{spec.summary[locale]}</p>
        {spec.closesOn && <p className="route__alert">{t('results.closesOn', { date: dateFmt(spec.closesOn) })}</p>}
        {spec.enhanced && <p className="route__note">{t('results.enhanced')}</p>}

        <ol className="timeline">
          {result.checks.map((c, i) => {
            const Icon = ICON[c.status];
            return (
              <li key={i} className={`timeline__stop timeline__stop--${c.status}${c.group ? ' timeline__stop--group' : ''}`}>
                <span className="timeline__dot" aria-hidden="true"><Icon size={13} strokeWidth={3} /></span>
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

        {spec.notes?.map((n, i) => <p key={i} className="route__note">{n[locale]}</p>)}

        <div className="route__sources">
          <h4>{t('results.sources')}</h4>
          <ul>
            {spec.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {sourceLabel(s.url)}
                  <ExternalLink size={13} aria-hidden="true" />
                </a>{' '}
                <span className="muted">({t('results.verifiedOn', { date: dateFmt(s.verified) })})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

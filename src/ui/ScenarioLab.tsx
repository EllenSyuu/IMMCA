import { useState } from 'react';
import type { ScenarioResult } from '../data/insights';
import { PROGRAM_BY_ID } from '../data/programs';
import { useI18n } from '../i18n';

/** "What would change things": one change at a time, its CRS effect and the routes it opens. */
export function ScenarioLab({ scenarios, onShow }: { scenarios: ScenarioResult[]; onShow: (id: string) => void }) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState<string | null>(null);
  if (!scenarios.length) return null;

  return (
    <section className="scenarios" aria-labelledby="scenarios-title">
      <h3 id="scenarios-title">{t('scenario.title')}</h3>
      <p className="muted small">{t('scenario.intro')}</p>
      <ul>
        {scenarios.map((s) => (
          <li key={s.key}>
            <span className="scenarios__label">{t(s.key, s.province ? { prov: t(`prov.${s.province}`) } : undefined)}</span>
            <span className="scenarios__effect">
              {s.crsChange > 0 && <span className="gain">{t('scenario.crs', { n: s.crsChange })}</span>}
              {s.opens.length > 0 ? (
                <button type="button" className="text-link" aria-expanded={open === s.key} onClick={() => setOpen(open === s.key ? null : s.key)}>
                  {t('scenario.opens', { n: s.opens.length })}
                </button>
              ) : (
                <span className="muted">{t('scenario.noNew')}</span>
              )}
            </span>
            {open === s.key && (
              <ul className="scenarios__list">
                {s.opens.map((id) => (
                  <li key={id}>
                    <button type="button" className="text-link" onClick={() => onShow(id)}>{PROGRAM_BY_ID.get(id)!.name[locale]}</button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

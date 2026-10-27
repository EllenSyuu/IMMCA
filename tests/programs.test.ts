import { describe, expect, it } from 'vitest';
import { qualifyingMonths } from '../src/engine/criteria';
import { evaluateProgram, isRelevant, rankPrograms } from '../src/engine/evaluate';
import { PROGRAMS, PROGRAM_BY_ID } from '../src/data/programs';
import { monthsSinceSnapshot } from '../src/data/programs/quebec';
import { clb, graduate } from './fixtures';

const get = (id: string) => {
  const p = PROGRAM_BY_ID.get(id);
  if (!p) throw new Error(`missing ${id}`);
  return p;
};

describe('program registry', () => {
  it('has unique ids, three languages and a dated official source for every program', () => {
    expect(new Set(PROGRAMS.map((p) => p.id)).size).toBe(PROGRAMS.length);
    for (const p of PROGRAMS) {
      for (const lang of ['en', 'fr', 'zh'] as const) {
        expect(p.name[lang], `${p.id} name.${lang}`).toBeTruthy();
        expect(p.summary[lang], `${p.id} summary.${lang}`).toBeTruthy();
      }
      expect(p.sources.length, p.id).toBeGreaterThan(0);
      for (const s of p.sources) {
        expect(s.url).toMatch(/^https:\/\//);
        expect(s.verified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });
});

describe('work-experience windows', () => {
  it('counts only the part of a period inside the window', () => {
    const work = [{ inCanada: true, teer: 1 as const, months: 24, endedMonthsAgo: 24, whileFullTimeStudent: false, selfEmployed: false }];
    expect(qualifyingMonths(work, { months: 0, withinMonths: 36 })).toBe(12);
  });
});

describe('Express Entry', () => {
  it('makes the graduate CEC-eligible with one year of PGWP work', () => {
    expect(evaluateProgram(get('ee-cec'), graduate({ intendedProvince: 'ON' })).verdict).toBe('eligible');
  });

  it('is hidden from people who intend to live in Québec', () => {
    expect(isRelevant(get('ee-cec'), graduate({ intendedProvince: 'QC' }))).toBe(false);
    expect(isRelevant(get('qc-pstq-1'), graduate({ intendedProvince: 'QC' }))).toBe(true);
  });

  it('fails CEC when the only Canadian work was during studies', () => {
    const p = graduate({ work: [{ inCanada: true, teer: 1, months: 18, endedMonthsAgo: 0, whileFullTimeStudent: true, selfEmployed: false }] });
    expect(evaluateProgram(get('ee-cec'), p).verdict).not.toBe('eligible');
  });
});

describe('Québec', () => {
  it('requires French for PSTQ stream 1 and passes once oral 7 / written 5 are met', () => {
    expect(evaluateProgram(get('qc-pstq-1'), graduate()).verdict).not.toBe('eligible');
    expect(evaluateProgram(get('qc-pstq-1'), graduate({ quebecFrench: { oral: 7, written: 5 } })).verdict).toBe('eligible');
  });

  it('computes the PEQ snapshot gap from 2025-11-19', () => {
    expect(monthsSinceSnapshot(new Date('2026-10-27T00:00:00Z'))).toBe(11);
    expect(monthsSinceSnapshot(new Date('2026-11-19T00:00:00Z'))).toBe(12);
  });

  it('treats the PEQ as closed after 31 October 2026', () => {
    const p = graduate({ french: clb(8) });
    expect(evaluateProgram(get('qc-peq-graduates'), p, '2026-10-27').verdict).toBe('eligible');
    expect(evaluateProgram(get('qc-peq-graduates'), p, '2026-11-01').verdict).toBe('unavailable');
  });

  it('rejects a Québec diploma obtained after the snapshot date', () => {
    const p = graduate({ french: clb(8), canadianStudy: { level: 'master', province: 'QC', programMonths: 24, monthsSinceGraduation: 6, fullTime: true } });
    expect(evaluateProgram(get('qc-peq-graduates'), p, '2026-10-27').verdict).not.toBe('eligible');
  });
});

describe('ranking', () => {
  it('lists eligible programs first and closed ones last', () => {
    const results = rankPrograms(PROGRAMS, graduate({ intendedProvince: 'any' }), '2026-10-27');
    const order = { eligible: 0, close: 1, gap: 2, unavailable: 3 };
    for (let i = 1; i < results.length; i++) {
      expect(order[results[i].verdict]).toBeGreaterThanOrEqual(order[results[i - 1].verdict]);
    }
  });

  it('hides provincial streams with no tie to the person', () => {
    const results = rankPrograms(PROGRAMS, graduate({ intendedProvince: 'ON', currentProvince: 'ON', canadianStudy: undefined }), '2026-10-27');
    expect(results.some((r) => r.programId.startsWith('bc-'))).toBe(false);
    expect(results.some((r) => r.programId === 'on-workforce-priority')).toBe(true);
  });
});

describe('verdicts', () => {
  const spec = (n: number, met: number) => ({
    id: 'x', jurisdiction: 'federal' as const, kind: 'federal-pathway' as const, status: 'open' as const,
    name: { en: '', fr: '', zh: '' }, summary: { en: '', fr: '', zh: '' }, sources: [],
    criteria: Array.from({ length: n }, (_, i) => ({ evaluate: () => ({ key: 'k', status: i < met ? 'met' as const : 'unmet' as const }) })),
  });

  it('calls a route "close" only when most of it is already met', () => {
    expect(evaluateProgram(spec(4, 3), graduate()).verdict).toBe('close');
    expect(evaluateProgram(spec(2, 1), graduate()).verdict).toBe('gap');
    expect(evaluateProgram(spec(2, 0), graduate()).verdict).toBe('gap');
    expect(evaluateProgram(spec(6, 4), graduate()).verdict).toBe('close');
    expect(evaluateProgram(spec(5, 3), graduate()).verdict).toBe('gap');
    expect(evaluateProgram(spec(3, 3), graduate()).verdict).toBe('eligible');
  });
});

describe('Canadian Experience Class language rule', () => {
  const tech = (teer: 1 | 2) => graduate({
    intendedProvince: 'ON', english: clb(6),
    work: [{ inCanada: true, province: 'ON', teer, months: 14, endedMonthsAgo: 0, whileFullTimeStudent: false, selfEmployed: false }],
  });
  it('needs CLB 7 for TEER 0–1 work but only CLB 5 for TEER 2–3', () => {
    expect(evaluateProgram(get('ee-cec'), tech(1)).verdict).not.toBe('eligible');
    expect(evaluateProgram(get('ee-cec'), tech(2)).verdict).toBe('eligible');
  });
});

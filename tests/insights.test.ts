import { describe, expect, it } from 'vitest';
import { evaluateProgram, rankPrograms } from '../src/engine/evaluate';
import { decide, dimensions, runScenarios } from '../src/data/insights';
import { PROGRAM_BY_ID, PROGRAMS } from '../src/data/programs';
import { SAMPLES, toProfile } from '../src/ui/model';
import { clb, graduate } from './fixtures';

const DAY = '2026-10-27';
const dimsOf = (id: string, p = graduate({ intendedProvince: 'any' })) => {
  const spec = PROGRAM_BY_ID.get(id)!;
  return dimensions(spec, evaluateProgram(spec, p, DAY), DAY);
};

describe('four dimensions', () => {
  it('keeps eligibility separate from availability', () => {
    // Alberta Express Entry: the minimums can be met while spaces are scarce.
    const d = dimsOf('ab-express-entry');
    expect(d.eligibility).toBe('met');
    expect(d.availability).toBe('limited');
    const spec = { ...PROGRAM_BY_ID.get('ab-express-entry')!, capacity: { level: 'exhausted' as const, note: { en: '', fr: '', zh: '' } } };
    const p = graduate({ intendedProvince: 'any' });
    expect(dimensions(spec, evaluateProgram(spec, p, DAY), DAY)).toMatchObject({ eligibility: 'met', availability: 'exhausted' });
  });

  it('reports a closed program as closed even when its rules are met', () => {
    const p = graduate({ french: clb(8), canadianStudy: { level: 'master', province: 'QC', programMonths: 24, monthsSinceGraduation: 20, fullTime: true } });
    const spec = PROGRAM_BY_ID.get('qc-peq-graduates')!;
    expect(dimensions(spec, evaluateProgram(spec, p, '2026-11-01'), '2026-11-01')).toMatchObject({ eligibility: 'met', availability: 'closed' });
  });

  it('rates competitiveness against the official cutoff, and only where one exists', () => {
    expect(dimsOf('ee-cec').competitiveness).toBe('near'); // 489 vs 519
    expect(dimsOf('ee-cec', graduate({ intendedProvince: 'any', french: clb(9) })).competitiveness).toBe('above');
    expect(dimsOf('qc-pstq-1').competitiveness).toBe('indicative');
    expect(dimsOf('nb-graduates').competitiveness).toBe('none');
    expect(dimsOf('ee-fsw').competitiveness).toBe('nodraw'); // exact CRS, but no recent FSW round
  });

  it('shows approximated or unconfirmed rules in the evidence dimension', () => {
    expect(dimsOf('sk-tech-talent').evidence).toBe('approximate');
    expect(dimsOf('qc-peq-workers').evidence).toBe('unconfirmed');
    expect(dimsOf('ee-cec').evidence).toBe('verified');
  });
});

describe('decision summary', () => {
  it('puts fully eligible, open routes first and never a work-permit bridge', () => {
    const d = decide(rankPrograms(PROGRAMS, toProfile(SAMPLES.mtl), DAY), DAY);
    expect(d.best.length).toBeGreaterThan(0);
    for (const b of d.best) {
      expect(b.dims.eligibility).toBe('met');
      expect(b.dims.availability).not.toBe('closed');
      expect(b.spec.kind).not.toBe('temporary');
    }
    expect(d.deadlines.some((x) => x.date === '2026-11-03')).toBe(true);
    // The sample's diploma came after the PEQ snapshot, so the PEQ deadline is not theirs to act on.
    expect(d.deadlines.some((x) => x.programId === 'qc-peq-graduates')).toBe(false);
    // The program with a real cutoff to compare against comes before one with no recent draw.
    const ids = d.best.map((b) => b.spec.id);
    if (ids.includes('ee-cec') && ids.includes('ee-fsw')) expect(ids.indexOf('ee-cec')).toBeLessThan(ids.indexOf('ee-fsw'));
  });
});

describe('scenario lab', () => {
  it('shows which routes open when French reaches NCLC 7', () => {
    const s = runScenarios(toProfile(SAMPLES.mtl), DAY).find((x) => x.key === 'scenario.french7');
    expect(s).toBeDefined();
    expect(s!.crsChange).toBeGreaterThan(0);
    expect(s!.opens).toContain('ee-french');
  });

  it('skips scenarios the person already meets', () => {
    const keys = runScenarios(toProfile(SAMPLES.mtl), DAY).map((x) => x.key);
    expect(keys).not.toContain('scenario.english9'); // the sample already has CLB 9
  });
});

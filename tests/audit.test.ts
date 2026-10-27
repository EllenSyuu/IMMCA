/**
 * Regression tests for the independent rules audit of 2026-10-27.
 * Each case pins a rule that was once implemented too loosely or too strictly.
 */
import { describe, expect, it } from 'vitest';
import { computeCrs } from '../src/engine/crs';
import { evaluateProgram } from '../src/engine/evaluate';
import { toClb } from '../src/engine/language';
import type { Profile, WorkPeriod } from '../src/engine/types';
import { PROGRAM_BY_ID } from '../src/data/programs';
import { peqWorkerMonths } from '../src/data/programs/quebec';
import { fswGridScore, isFstTrade, meetsCec, meetsFst, meetsFswMinimums } from '../src/data/programs/shared';
import { clb, graduate } from './fixtures';

const get = (id: string) => PROGRAM_BY_ID.get(id)!;
const job = (w: Partial<WorkPeriod>): WorkPeriod => ({
  inCanada: true, teer: 1, months: 12, endedMonthsAgo: 0, whileFullTimeStudent: false, selfEmployed: false, ...w,
});
const stationStatus = (id: string, p: Profile, key: string, date = '2026-10-27') =>
  evaluateProgram(get(id), p, date).checks.find((c) => c.key === key)?.status;

describe('Federal Skilled Trades', () => {
  it('only counts the listed trade NOC groups', () => {
    expect(isFstTrade('72310')).toBe(true);
    expect(isFstTrade('62200')).toBe(true);
    expect(isFstTrade('72600')).toBe(false); // sub-major group 726 excluded
    expect(isFstTrade('22220')).toBe(false); // computer technicians are not a trade
  });

  it('rejects two years as a computer technician, accepts two years as a carpenter', () => {
    const base = { certificateOfQualification: true, english: clb(5) };
    expect(meetsFst(graduate({ ...base, work: [job({ teer: 2, noc: '22220', months: 30 })] }))).toBe(false);
    expect(meetsFst(graduate({ ...base, work: [job({ teer: 2, noc: '72310', months: 30 })] }))).toBe(true);
  });
});

describe('Federal Skilled Worker', () => {
  const lowGrid = graduate({
    age: 46, education: 'secondary', hasEca: true, canadianStudy: undefined, english: clb(7),
    work: [job({ inCanada: false, months: 14 })], status: 'outside', intendedProvince: 'AB',
  });

  it('enforces the 67-point grid wherever Express Entry eligibility is required', () => {
    expect(fswGridScore(lowGrid)).toBeLessThan(67);
    expect(meetsFswMinimums(lowGrid)).toBe(false);
    expect(stationStatus('ab-express-entry', lowGrid, 'check.eeEligible')).toBe('unmet');
  });

  it('counts paid, continuous work done while studying', () => {
    const p = graduate({ age: 26, english: clb(9), work: [job({ months: 14, whileFullTimeStudent: true })] });
    expect(meetsFswMinimums(p)).toBe(true);
    expect(meetsCec(p)).toBe(false);
  });
});

describe('Canadian Experience Class language', () => {
  it('ignores TEER 1 work older than three years', () => {
    const p = graduate({ english: clb(6), work: [job({ teer: 2, months: 14 }), job({ teer: 1, months: 20, endedMonthsAgo: 70 })] });
    expect(meetsCec(p)).toBe(true);
  });
});

describe('CRS Canadian education points', () => {
  const study = (programMonths: number, level: 'one-year' | 'master' = 'one-year', fullTime = true) => ({
    level, province: 'ON' as const, programMonths, monthsSinceGraduation: 6, fullTime,
  });
  it('gives 15 for an 8–11 month credential, nothing part-time or while still studying', () => {
    expect(computeCrs(graduate({ canadianStudy: study(10) }), '2026-10-27').additional.canadianEducation).toBe(15);
    expect(computeCrs(graduate({ canadianStudy: study(24, 'master', false) }), '2026-10-27').additional.canadianEducation).toBe(0);
    expect(computeCrs(graduate({ status: 'student', canadianStudy: study(24, 'master') }), '2026-10-27').additional.canadianEducation).toBe(0);
  });
});

describe('TEF Canada scales', () => {
  it('converts the Express Entry “ancien score” column', () => {
    expect(toClb('tefold', 'speaking', 310)).toBe(7);
    expect(toClb('tefold', 'listening', 316)).toBe(10);
    expect(toClb('tefold', 'reading', 206)).toBe(6);
  });
});

describe('PEQ workers snapshot', () => {
  const today = new Date('2026-10-27T00:00:00Z');
  it('counts only months already worked by 2025-11-19', () => {
    expect(peqWorkerMonths(graduate({ work: [job({ province: 'QC', months: 26 })] }), today)).toBe(15);
    expect(peqWorkerMonths(graduate({ work: [job({ province: 'QC', months: 40 })] }), today)).toBe(25);
  });
});

describe('TEER-dependent language minimums', () => {
  it('needs CLB 7 for TEER 0–1 Nova Scotia experience and CLB 5 for TEER 2–3', () => {
    const p = (teer: 1 | 2) => graduate({ english: clb(6), work: [job({ province: 'NS', teer, months: 14 })] });
    expect(stationStatus('ns-express-entry', p(1), 'check.clbForTeer')).toBe('unmet');
    expect(stationStatus('ns-express-entry', p(2), 'check.clbForTeer')).toBe('met');
  });

  it('asks no language test for TEER 0–1 BC Skilled Worker offers', () => {
    const p = graduate({ english: undefined, jobOffer: { province: 'BC', teer: 1, permanent: true, fullTime: true } });
    expect(stationStatus('bc-skilled-worker', p, 'check.noLanguageTest')).toBe('met');
  });

  it('applies CLB 6 for TEER 0–1 Yukon offers', () => {
    const p = graduate({ english: clb(5), jobOffer: { province: 'YT', teer: 1, permanent: true, fullTime: true } });
    expect(stationStatus('yk-skilled-worker', p, 'check.clbForTeer')).toBe('unmet');
  });
});

describe('Ontario Workforce Priority', () => {
  it('splits TEER 0–3 and TEER 4–5 offers into their own rules', () => {
    const p = graduate({ intendedProvince: 'ON', currentProvince: 'ON', jobOffer: { province: 'ON', teer: 4, permanent: true, fullTime: true } });
    expect(stationStatus('on-workforce-priority', p, 'check.offer')).toBe('unmet');
    expect(stationStatus('on-workforce-priority-teer45', p, 'check.offer')).toBe('met');
  });
});

describe('Atlantic and rural pilots', () => {
  it('requires experience at a TEER that matches the AIP offer', () => {
    const p = graduate({
      canadianStudy: undefined,
      jobOffer: { province: 'NS', teer: 0, permanent: true, fullTime: true, designatedEmployer: true },
      work: [job({ teer: 5, months: 24 })],
    });
    expect(stationStatus('aip', p, 'check.matchedWork')).toBe('unmet');
  });

  it('lets a master’s graduate of a program under two years use the RCIP graduate route', () => {
    const p = graduate({
      work: [], jobOffer: { province: 'ON', teer: 1, permanent: true, fullTime: true },
      canadianStudy: { level: 'master', province: 'ON', programMonths: 16, monthsSinceGraduation: 6, fullTime: true },
    });
    const checks = evaluateProgram(get('rcip'), p).checks;
    expect(checks.find((c) => c.key === 'check.oneOf')?.status).toBe('met');
  });
});

describe('Express Entry categories', () => {
  it('includes the 2026 transport and physician categories', () => {
    expect(get('ee-transport')).toBeDefined();
    expect(get('ee-physicians')).toBeDefined();
  });
});

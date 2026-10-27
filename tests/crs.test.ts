import { describe, expect, it } from 'vitest';
import { computeCrs, crsLevers, crsRulesFor } from '../src/engine/crs';
import { clb, graduate } from './fixtures';

const BEFORE = '2026-10-27';
const AFTER = '2026-11-03';

describe('CRS — rules in force until 2026-11-02', () => {
  it('scores a single master’s graduate with one year of Canadian work', () => {
    const r = computeCrs(graduate(), BEFORE);
    expect(r.rules).toBe('2025-03-25');
    expect(r.core).toEqual({ age: 110, education: 135, firstLanguage: 124, secondLanguage: 0, canadianWork: 40 });
    // education group: (master + CLB 9 = 50) + (master + 1 yr = 25), capped at 50
    expect(r.transferability.total).toBe(50);
    expect(r.additional.canadianEducation).toBe(30);
    expect(r.total).toBe(489);
  });

  it('applies the with-spouse column and spouse factors', () => {
    const p = graduate({ spouse: { accompanying: true, canadianOrPr: false, education: 'bachelor', firstLanguage: clb(7), canadianWorkMonths: 0 } });
    const r = computeCrs(p, BEFORE);
    expect(r.core.age).toBe(100);
    expect(r.core.education).toBe(126);
    expect(r.core.firstLanguage).toBe(4 * 29);
    expect(r.spouse).toEqual({ education: 8, language: 12, canadianWork: 0 });
  });

  it('treats a Canadian-citizen spouse as single', () => {
    const p = graduate({ spouse: { accompanying: true, canadianOrPr: true, education: 'phd', canadianWorkMonths: 60 } });
    expect(computeCrs(p, BEFORE).total).toBe(489);
  });

  it('gives 50 French points with NCLC 7 and CLB 5+ English, 25 without English', () => {
    expect(computeCrs(graduate({ french: clb(7) }), BEFORE).additional.french).toBe(50);
    expect(computeCrs(graduate({ english: undefined, french: clb(7) }), BEFORE).additional.french).toBe(25);
  });

  it('caps the second official language at 24 (single) and adds 600 for a nomination', () => {
    const r = computeCrs(graduate({ french: clb(10), provincialNomination: true }), BEFORE);
    expect(r.core.secondLanguage).toBe(24);
    expect(r.additional.nomination).toBe(600);
  });

  it('ignores work done while a full-time student', () => {
    const p = graduate({ work: [{ inCanada: true, province: 'QC', teer: 1, months: 24, endedMonthsAgo: 0, whileFullTimeStudent: true, selfEmployed: false }] });
    expect(computeCrs(p, BEFORE).core.canadianWork).toBe(0);
  });
});

describe('CRS — Labour Market Integration factor from 2026-11-03', () => {
  it('switches rule sets by date', () => {
    expect(crsRulesFor('2026-11-02')).toBe('2025-03-25');
    expect(crsRulesFor('2026-11-03')).toBe('2026-11-03');
  });

  it('adds the high-wage bonus for 12 months in a 1.5× occupation', () => {
    const r = computeCrs(graduate(), AFTER); // 21211 data scientists → 1.5×
    expect(r.labourMarket).toMatchObject({ experienceLength: 40, highWageBonus: 40, chosen: 'experience' });
    expect(r.core.canadianWork).toBe(80);
    expect(r.total).toBe(489 + 40);
  });

  it('takes the job-offer option when it scores higher, never both', () => {
    const p = graduate({
      work: [],
      jobOffer: { province: 'ON', teer: 0, noc: '00012', permanent: true, fullTime: true }, // 2.0× tier
    });
    const r = computeCrs(p, AFTER);
    expect(r.labourMarket).toMatchObject({ jobOffer: 100, chosen: 'offer' });
    expect(r.core.canadianWork).toBe(100);
  });

  it('gives nothing for an offer outside the high-wage list', () => {
    const p = graduate({ work: [], jobOffer: { province: 'ON', teer: 3, noc: '63200', permanent: true, fullTime: true } });
    expect(computeCrs(p, AFTER).core.canadianWork).toBe(0);
  });
});

describe('CRS levers', () => {
  it('ranks the nomination as the biggest single lever', () => {
    const levers = crsLevers(graduate(), BEFORE);
    // Additional points cap at 600, and this person already has 30 for Canadian education.
    expect(levers[0]).toEqual({ key: 'lever.pnp', gain: 570 });
    expect(levers.find((l) => l.key === 'lever.nclc7')?.gain).toBe(50 + 4 * 3);
  });
});

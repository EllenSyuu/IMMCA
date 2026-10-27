/**
 * Helpers shared by every program file: localized text, the verification
 * date, Express Entry minimum eligibility and the federal settlement-funds table.
 */
import { computeCrs } from '../../engine/crs';
import { custom, educationAtLeast, minOf, firstOfficial, qualifyingMonths, secondOfficial } from '../../engine/criteria';
import type { Criterion, EducationLevel, L10n, Profile } from '../../engine/types';

export const L = (en: string, fr: string, zh: string): L10n => ({ en, fr, zh });

/** Date every rule in this release was last checked against its official source. */
export const VERIFIED = '2026-10-27';

/**
 * Federal proof-of-funds table for Express Entry (FSW / FST), CAD by family size 1–7.
 * Each additional family member adds the difference between the last two entries.
 */
export const FUNDS_TABLE = [15263, 19001, 23360, 28362, 32168, 36280, 40392];

/** Canadian work that counts for the CEC: skilled, in the last 3 years, not while a full-time student, not self-employed. */
const cecPeriods = (p: Profile) =>
  p.work.filter((w) => w.inCanada && w.teer <= 3 && !w.whileFullTimeStudent && !w.selfEmployed && w.endedMonthsAgo < 36);

/** CEC language rule: CLB 7 if the qualifying Canadian work includes TEER 0–1, otherwise CLB 5. */
export function cecLanguageOk(p: Profile): boolean {
  const teers = cecPeriods(p).map((w) => w.teer);
  const need = teers.length && teers.every((t) => t >= 2) ? 5 : 7;
  return minOf(firstOfficial(p).result) >= need;
}

/** Canadian Experience Class minimums. */
export function meetsCec(p: Profile): boolean {
  const months = qualifyingMonths(p.work, {
    months: 12, teers: [0, 1, 2, 3], inCanada: true, withinMonths: 36,
    excludeStudentWork: true, excludeSelfEmployed: true,
  });
  return months >= 12 && cecLanguageOk(p);
}

/**
 * Federal Skilled Worker minimums, including the 67-point grid. Work done while
 * studying counts here if it was paid and continuous (unlike the CEC).
 */
export function meetsFswMinimums(p: Profile): boolean {
  const months = qualifyingMonths(p.work, { months: 12, teers: [0, 1, 2, 3], withinMonths: 120, continuous: true });
  const lang = minOf(firstOfficial(p).result);
  const eduOk = educationAtLeast(p.education, 'secondary') && (p.hasEca || !!p.canadianStudy);
  return months >= 12 && lang >= 7 && eduOk && fswGridScore(p) >= 67;
}

/** NOC 2021 groups that count as skilled trades for the FST. */
export function isFstTrade(noc?: string): boolean {
  if (!noc || noc.length !== 5) return false;
  if (noc.startsWith('726') || noc.startsWith('932')) return false;
  return ['72', '73', '82', '83', '92', '93'].some((g) => noc.startsWith(g)) || noc.startsWith('6320') || noc === '62200';
}

/** Federal Skilled Trades minimums: two years in one trade NOC within five years. */
export function meetsFst(p: Profile): boolean {
  const trades = new Set(p.work.filter((w) => isFstTrade(w.noc)).map((w) => w.noc!));
  const months = Math.max(0, ...[...trades].map((noc) =>
    qualifyingMonths(p.work, { months: 24, nocs: [noc], withinMonths: 60, excludeStudentWork: true })));
  const r = firstOfficial(p).result;
  const lang = !!r && r.speaking >= 5 && r.listening >= 5 && r.reading >= 4 && r.writing >= 4;
  const offerOrCert = p.certificateOfQualification || (!!p.jobOffer && p.jobOffer.fullTime && isFstTrade(p.jobOffer.noc));
  return months >= 24 && lang && offerOrCert;
}

/** Meets at least one Express Entry program's minimums (needed for enhanced PNP streams). */
export function expressEntryEligible(): Criterion {
  return custom('check.eeEligible', (p) => meetsCec(p) || meetsFswMinimums(p) || meetsFst(p), undefined, 'hint.eeEligible');
}

export function crsAtLeast(min: number): Criterion {
  return custom('check.crsMin', (p) => computeCrs(p).total >= min, { min }, 'hint.raiseCrs');
}

// ---------------------------------------------------------------- FSW 67-point grid
const FSW_EDU: Record<EducationLevel, number> = {
  none: 0, secondary: 5, 'one-year': 15, 'two-year': 19, bachelor: 21, 'two-or-more': 22, master: 23, phd: 25,
};

/** Federal Skilled Worker selection grid (pass mark 67/100). */
export function fswGridScore(p: Profile): number {
  const first = firstOfficial(p).result;
  const per = (c: number) => (c >= 9 ? 6 : c === 8 ? 5 : c === 7 ? 4 : 0);
  const lang = first ? per(first.listening) + per(first.reading) + per(first.writing) + per(first.speaking) : 0;
  const second = minOf(secondOfficial(p)) >= 5 ? 4 : 0;
  const edu = FSW_EDU[p.education];
  const years = Math.floor(qualifyingMonths(p.work, { months: 0, teers: [0, 1, 2, 3], withinMonths: 120 }) / 12);
  const work = years >= 6 ? 15 : years >= 4 ? 13 : years >= 2 ? 11 : years >= 1 ? 9 : 0;
  const age = p.age < 18 ? 0 : p.age <= 35 ? 12 : Math.max(0, 12 - (p.age - 35));
  const offer = p.jobOffer && p.jobOffer.fullTime && p.jobOffer.teer <= 3 ? 10 : 0;
  let adapt = 0;
  if (p.spouse?.accompanying && minOf(p.spouse.firstLanguage) >= 4) adapt += 5;
  if (p.canadianStudy && p.canadianStudy.programMonths >= 24 && p.canadianStudy.fullTime) adapt += 5;
  if (qualifyingMonths(p.work, { months: 0, teers: [0, 1, 2, 3], inCanada: true, excludeStudentWork: true }) >= 12) adapt += 10;
  if (p.spouse?.accompanying && p.spouse.canadianWorkMonths >= 12) adapt += 5;
  if (offer) adapt += 5;
  if (p.siblingInCanada) adapt += 5;
  return lang + second + edu + work + age + offer + Math.min(10, adapt);
}

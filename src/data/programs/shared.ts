/**
 * Helpers shared by every program file: localized text, the verification
 * date, Express Entry minimum eligibility and the federal settlement-funds table.
 */
import { computeCrs } from '../../engine/crs';
import { custom, educationAtLeast, minOf, firstOfficial, qualifyingMonths } from '../../engine/criteria';
import type { Criterion, L10n, Profile } from '../../engine/types';

export const L = (en: string, fr: string, zh: string): L10n => ({ en, fr, zh });

/** Date every rule in this release was last checked against its official source. */
export const VERIFIED = '2026-10-27';

/**
 * Federal proof-of-funds table for Express Entry (FSW / FST), CAD by family size 1–7.
 * Each additional family member adds the difference between the last two entries.
 */
export const FUNDS_TABLE = [15263, 19001, 23360, 28362, 32168, 36280, 40392];

/** Canadian Experience Class minimums. */
export function meetsCec(p: Profile): boolean {
  const months = qualifyingMonths(p.work, {
    months: 12, teers: [0, 1, 2, 3], inCanada: true, withinMonths: 36,
    excludeStudentWork: true, excludeSelfEmployed: true,
  });
  const lang = minOf(firstOfficial(p).result);
  const teers = p.work.filter((w) => w.inCanada).map((w) => w.teer);
  const need = teers.some((t) => t <= 1) ? 7 : 5;
  return months >= 12 && lang >= need;
}

/** Federal Skilled Worker minimums (the 67-point grid is checked separately). */
export function meetsFswMinimums(p: Profile): boolean {
  const months = qualifyingMonths(p.work, {
    months: 12, teers: [0, 1, 2, 3], withinMonths: 120, continuous: true,
    excludeStudentWork: true,
  });
  const lang = minOf(firstOfficial(p).result);
  const eduOk = educationAtLeast(p.education, 'secondary') && (p.hasEca || !!p.canadianStudy);
  return months >= 12 && lang >= 7 && eduOk;
}

/** Federal Skilled Trades minimums. */
export function meetsFst(p: Profile): boolean {
  const months = qualifyingMonths(p.work, { months: 24, teers: [2, 3], withinMonths: 60 });
  const r = firstOfficial(p).result;
  const lang = !!r && r.speaking >= 5 && r.listening >= 5 && r.reading >= 4 && r.writing >= 4;
  const offerOrCert = p.certificateOfQualification || (!!p.jobOffer && p.jobOffer.fullTime && p.jobOffer.teer <= 3);
  return months >= 24 && lang && offerOrCert;
}

/** Meets at least one Express Entry program's minimums (needed for enhanced PNP streams). */
export function expressEntryEligible(): Criterion {
  return custom('check.eeEligible', (p) => meetsCec(p) || meetsFswMinimums(p) || meetsFst(p), undefined, 'hint.eeEligible');
}

export function crsAtLeast(min: number): Criterion {
  return custom('check.crsMin', (p) => computeCrs(p).total >= min, { min }, 'hint.raiseCrs');
}

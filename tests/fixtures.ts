import type { LanguageResult, Profile } from '../src/engine/types';

export const clb = (n: number): LanguageResult => ({ listening: n, reading: n, writing: n, speaking: n });

/** A typical master's graduate working in Montréal on a post-graduation work permit. */
export function graduate(overrides: Partial<Profile> = {}): Profile {
  return {
    age: 27,
    intendedProvince: 'any',
    currentProvince: 'QC',
    status: 'graduate-pgwp',
    education: 'master',
    hasEca: true,
    canadianStudy: { level: 'master', province: 'QC', programMonths: 24, monthsSinceGraduation: 14, fullTime: true },
    english: clb(9),
    work: [{ inCanada: true, province: 'QC', teer: 1, noc: '21211', months: 12, endedMonthsAgo: 0, whileFullTimeStudent: false, selfEmployed: false }],
    familySize: 1,
    settlementFundsCad: 20000,
    siblingInCanada: false,
    certificateOfQualification: false,
    provincialNomination: false,
    ...overrides,
  };
}

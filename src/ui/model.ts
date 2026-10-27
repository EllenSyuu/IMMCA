/**
 * Form state ↔ engine profile. The form keeps raw test scores so people can
 * type what's on their result sheet; conversion to CLB/NCLC happens here.
 */
import { toLanguageResult, toQuebecLevel, type Ability, type TestId } from '../engine/language';
import type { CanadianStudy, EducationLevel, JobOffer, LanguageResult, Profile, Province, Teer } from '../engine/types';

export type LangTest = 'none' | 'clb' | TestId;

export interface LangInput {
  test: LangTest;
  scores: Record<Ability, number>;
}

export interface WorkInput {
  id: number;
  where: Province | 'abroad';
  teer: Teer;
  noc: string;
  months: number;
  endedMonthsAgo: number;
  whileFullTimeStudent: boolean;
  selfEmployed: boolean;
}

export interface FormState {
  age: number;
  status: Profile['status'];
  currentProvince: Province | 'outside';
  intendedProvince: Province | 'any';
  education: EducationLevel;
  hasEca: boolean;
  studied: boolean;
  study: CanadianStudy;
  english: LangInput;
  french: LangInput;
  work: WorkInput[];
  hasOffer: boolean;
  offer: JobOffer;
  hasSpouse: boolean;
  spouse: { accompanying: boolean; canadianOrPr: boolean; education: EducationLevel; clb: number; canadianWorkMonths: number };
  familySize: number;
  funds: number;
  sibling: boolean;
  certificate: boolean;
  nomination: boolean;
}

const zero = { listening: 0, reading: 0, writing: 0, speaking: 0 };

export const EMPTY: FormState = {
  age: 25,
  status: 'student',
  currentProvince: 'outside',
  intendedProvince: 'any',
  education: 'bachelor',
  hasEca: false,
  studied: false,
  study: { level: 'master', province: 'ON', programMonths: 24, monthsSinceGraduation: 0, fullTime: true },
  english: { test: 'none', scores: { ...zero } },
  french: { test: 'none', scores: { ...zero } },
  work: [],
  hasOffer: false,
  offer: { province: 'ON', teer: 1, noc: '', permanent: true, fullTime: true, designatedEmployer: false },
  hasSpouse: false,
  spouse: { accompanying: true, canadianOrPr: false, education: 'bachelor', clb: 0, canadianWorkMonths: 0 },
  familySize: 1,
  funds: 0,
  sibling: false,
  certificate: false,
  nomination: false,
};

export const SAMPLES: Record<'mtl' | 'tor' | 'abroad', FormState> = {
  mtl: {
    ...EMPTY,
    age: 27,
    status: 'graduate-pgwp',
    currentProvince: 'QC',
    intendedProvince: 'any',
    education: 'master',
    studied: true,
    study: { level: 'master', province: 'QC', programMonths: 24, monthsSinceGraduation: 15, fullTime: true },
    english: { test: 'ielts', scores: { listening: 8, reading: 7.5, writing: 7, speaking: 7 } },
    french: { test: 'tcf', scores: { listening: 420, reading: 430, writing: 8, speaking: 9 } },
    work: [{ id: 1, where: 'QC', teer: 1, noc: '21211', months: 14, endedMonthsAgo: 0, whileFullTimeStudent: false, selfEmployed: false }],
    funds: 18000,
  },
  tor: {
    ...EMPTY,
    age: 24,
    status: 'graduate-pgwp',
    currentProvince: 'ON',
    intendedProvince: 'ON',
    education: 'two-year',
    studied: true,
    study: { level: 'two-year', province: 'ON', programMonths: 24, monthsSinceGraduation: 15, fullTime: true },
    english: { test: 'celpip', scores: { listening: 8, reading: 8, writing: 7, speaking: 8 } },
    work: [{ id: 1, where: 'ON', teer: 2, noc: '22220', months: 14, endedMonthsAgo: 0, whileFullTimeStudent: false, selfEmployed: false }],
    hasOffer: true,
    offer: { province: 'ON', teer: 2, noc: '22220', permanent: true, fullTime: true, designatedEmployer: false },
    funds: 12000,
  },
  abroad: {
    ...EMPTY,
    age: 31,
    status: 'outside',
    currentProvince: 'outside',
    intendedProvince: 'any',
    education: 'bachelor',
    hasEca: true,
    english: { test: 'ielts', scores: { listening: 7.5, reading: 7, writing: 7, speaking: 7 } },
    work: [{ id: 1, where: 'abroad', teer: 1, noc: '31301', months: 60, endedMonthsAgo: 0, whileFullTimeStudent: false, selfEmployed: false }],
    funds: 25000,
  },
};

function toResult(input: LangInput): LanguageResult | undefined {
  if (input.test === 'none') return undefined;
  if (input.test === 'clb') return { ...input.scores };
  return toLanguageResult(input.test, input.scores);
}

export function quebecLevels(input: LangInput): { oral: number; written: number } | undefined {
  if (input.test !== 'tef' && input.test !== 'tcf') return undefined;
  const lvl = (a: Ability) => toQuebecLevel(input.test as 'tef' | 'tcf', a, input.scores[a]);
  return { oral: Math.min(lvl('listening'), lvl('speaking')), written: Math.min(lvl('reading'), lvl('writing')) };
}

export function toProfile(s: FormState): Profile {
  const clbAll = (n: number): LanguageResult => ({ listening: n, reading: n, writing: n, speaking: n });
  return {
    age: s.age,
    intendedProvince: s.intendedProvince,
    currentProvince: s.currentProvince === 'outside' ? undefined : s.currentProvince,
    status: s.status,
    education: s.education,
    hasEca: s.hasEca,
    canadianStudy: s.studied ? s.study : undefined,
    english: toResult(s.english),
    french: toResult(s.french),
    quebecFrench: quebecLevels(s.french),
    work: s.work.map((w) => ({
      inCanada: w.where !== 'abroad',
      province: w.where === 'abroad' ? undefined : w.where,
      teer: w.teer,
      noc: w.noc.trim() || undefined,
      months: w.months,
      endedMonthsAgo: w.endedMonthsAgo,
      whileFullTimeStudent: w.whileFullTimeStudent,
      selfEmployed: w.selfEmployed,
    })),
    jobOffer: s.hasOffer ? { ...s.offer, noc: s.offer.noc?.trim() || undefined } : undefined,
    spouse: s.hasSpouse
      ? {
          accompanying: s.spouse.accompanying,
          canadianOrPr: s.spouse.canadianOrPr,
          education: s.spouse.education,
          firstLanguage: s.spouse.clb ? clbAll(s.spouse.clb) : undefined,
          canadianWorkMonths: s.spouse.canadianWorkMonths,
        }
      : undefined,
    familySize: Math.max(1, s.familySize),
    settlementFundsCad: s.funds,
    siblingInCanada: s.sibling,
    certificateOfQualification: s.certificate,
    provincialNomination: s.nomination,
  };
}

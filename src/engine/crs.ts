/**
 * Comprehensive Ranking System (CRS) calculator for Express Entry.
 *
 * Point tables follow IRCC's published grid (job-offer points were removed on
 * 2025-03-25). Each section is returned separately so the UI can show where a
 * score comes from and which lever moves it most.
 */
import { minOf, firstOfficial, secondOfficial, qualifyingMonths } from './criteria';
import type { EducationLevel, LanguageResult, Profile } from './types';

type Pair = readonly [single: number, withSpouse: number];

const AGE: Record<number, Pair> = {
  18: [99, 90], 19: [105, 95],
  20: [110, 100], 21: [110, 100], 22: [110, 100], 23: [110, 100], 24: [110, 100],
  25: [110, 100], 26: [110, 100], 27: [110, 100], 28: [110, 100], 29: [110, 100],
  30: [105, 95], 31: [99, 90], 32: [94, 85], 33: [88, 80], 34: [83, 75],
  35: [77, 70], 36: [72, 65], 37: [66, 60], 38: [61, 55], 39: [55, 50],
  40: [50, 45], 41: [39, 35], 42: [28, 25], 43: [17, 15], 44: [6, 5],
};

const EDUCATION: Record<EducationLevel, Pair> = {
  none: [0, 0], secondary: [30, 28], 'one-year': [90, 84], 'two-year': [98, 91],
  bachelor: [120, 112], 'two-or-more': [128, 119], master: [135, 126], phd: [150, 140],
};

/** First official language, per ability. */
function firstLangPerAbility(clb: number): Pair {
  if (clb >= 10) return [34, 32];
  if (clb === 9) return [31, 29];
  if (clb === 8) return [23, 22];
  if (clb === 7) return [17, 16];
  if (clb === 6) return [9, 8];
  if (clb >= 4) return [6, 6];
  return [0, 0];
}

function secondLangPerAbility(clb: number): number {
  if (clb >= 9) return 6;
  if (clb >= 7) return 3;
  if (clb >= 5) return 1;
  return 0;
}

const CDN_WORK: Pair[] = [[0, 0], [40, 35], [53, 46], [64, 56], [72, 63], [80, 70]];

const SPOUSE_EDU: Record<EducationLevel, number> = {
  none: 0, secondary: 2, 'one-year': 6, 'two-year': 7, bachelor: 8, 'two-or-more': 9, master: 10, phd: 10,
};
const SPOUSE_WORK = [0, 5, 7, 8, 9, 10];

function spouseLangPerAbility(clb: number): number {
  if (clb >= 9) return 5;
  if (clb >= 7) return 3;
  if (clb >= 5) return 1;
  return 0;
}

const abilities = (r?: LanguageResult) =>
  r ? [r.listening, r.reading, r.writing, r.speaking] : [0, 0, 0, 0];

export interface CrsBreakdown {
  core: { age: number; education: number; firstLanguage: number; secondLanguage: number; canadianWork: number };
  spouse: { education: number; language: number; canadianWork: number };
  transferability: { educationLanguage: number; educationWork: number; foreignLanguage: number; foreignCanadian: number; certificate: number; total: number };
  additional: { nomination: number; french: number; sibling: number; canadianEducation: number; total: number };
  total: number;
}

/** Years (0–5) of skilled (TEER 0–3) Canadian work within the last 10 years. */
export function canadianWorkYears(p: Profile): number {
  const months = qualifyingMonths(p.work, {
    months: 0, teers: [0, 1, 2, 3], inCanada: true, withinMonths: 120,
    excludeStudentWork: true,
  });
  return Math.min(5, Math.floor(months / 12));
}

/** Years of skilled foreign work within the last 10 years (bands: 0, 1–2, 3+). */
export function foreignWorkYears(p: Profile): number {
  const months = qualifyingMonths(p.work, { months: 0, teers: [0, 1, 2, 3], inCanada: false, withinMonths: 120 });
  return Math.floor(months / 12);
}

/** Whether the post-secondary level falls in the higher transferability tier. */
const highEducation = (e: EducationLevel) => e === 'two-or-more' || e === 'master' || e === 'phd';
const postSecondary = (e: EducationLevel) => !['none', 'secondary'].includes(e);

export function computeCrs(p: Profile): CrsBreakdown {
  const withSpouse = !!p.spouse && p.spouse.accompanying && !p.spouse.canadianOrPr;
  const col = withSpouse ? 1 : 0;

  // ---- A. Core / human capital
  const age = p.age >= 45 || p.age < 18 ? 0 : AGE[p.age][col];
  const education = EDUCATION[p.education][col];
  const first = firstOfficial(p).result;
  const second = secondOfficial(p);
  const firstLanguage = abilities(first).reduce((s, c) => s + firstLangPerAbility(c)[col], 0);
  const secondLanguage = Math.min(
    withSpouse ? 22 : 24,
    abilities(second).reduce((s, c) => s + secondLangPerAbility(c), 0),
  );
  const cdnYears = canadianWorkYears(p);
  const canadianWork = CDN_WORK[cdnYears][col];

  // ---- B. Spouse factors
  const spouse = { education: 0, language: 0, canadianWork: 0 };
  if (withSpouse && p.spouse) {
    spouse.education = SPOUSE_EDU[p.spouse.education];
    spouse.language = Math.min(20, abilities(p.spouse.firstLanguage).reduce((s, c) => s + spouseLangPerAbility(c), 0));
    spouse.canadianWork = SPOUSE_WORK[Math.min(5, Math.floor(p.spouse.canadianWorkMonths / 12))];
  }

  // ---- C. Skill transferability (max 100)
  const firstMin = minOf(first);
  const lang7 = firstMin >= 7;
  const lang9 = firstMin >= 9;
  let educationLanguage = 0;
  let educationWork = 0;
  if (postSecondary(p.education)) {
    const hi = highEducation(p.education);
    if (lang9) educationLanguage = hi ? 50 : 25;
    else if (lang7) educationLanguage = hi ? 25 : 13;
    if (cdnYears >= 2) educationWork = hi ? 50 : 25;
    else if (cdnYears === 1) educationWork = hi ? 25 : 13;
  }
  const fYears = foreignWorkYears(p);
  let foreignLanguage = 0;
  let foreignCanadian = 0;
  if (fYears >= 1) {
    const many = fYears >= 3;
    if (lang9) foreignLanguage = many ? 50 : 25;
    else if (lang7) foreignLanguage = many ? 25 : 13;
    if (cdnYears >= 2) foreignCanadian = many ? 50 : 25;
    else if (cdnYears === 1) foreignCanadian = many ? 25 : 13;
  }
  let certificate = 0;
  if (p.certificateOfQualification) {
    if (firstMin >= 7) certificate = 50;
    else if (firstMin >= 5) certificate = 25;
  }
  const transfer = {
    educationLanguage, educationWork, foreignLanguage, foreignCanadian, certificate,
    total: Math.min(100, Math.min(50, educationLanguage + educationWork) + Math.min(50, foreignLanguage + foreignCanadian) + certificate),
  };

  // ---- D. Additional points (max 600)
  const nomination = p.provincialNomination ? 600 : 0;
  const frMin = minOf(p.french);
  const enMin = minOf(p.english);
  const french = frMin >= 7 ? (enMin >= 5 ? 50 : 25) : 0;
  const sibling = p.siblingInCanada ? 15 : 0;
  let canadianEducation = 0;
  const cs = p.canadianStudy;
  if (cs && postSecondary(cs.level) && cs.monthsSinceGraduation >= 0) {
    canadianEducation = cs.programMonths >= 36 || ['master', 'phd'].includes(cs.level) ? 30 : cs.programMonths >= 12 ? 15 : 0;
  }
  const additional = {
    nomination, french, sibling, canadianEducation,
    total: Math.min(600, nomination + french + sibling + canadianEducation),
  };

  const core = { age, education, firstLanguage, secondLanguage, canadianWork };
  const total =
    Object.values(core).reduce((a, b) => a + b, 0) +
    spouse.education + spouse.language + spouse.canadianWork +
    transfer.total + additional.total;

  return { core, spouse, transferability: transfer, additional, total };
}

/** How many points a single change would add — the "what moves my score" view. */
export function crsLevers(p: Profile): { key: string; gain: number }[] {
  const base = computeCrs(p).total;
  const variants: { key: string; profile: Profile }[] = [];
  const first = firstOfficial(p);
  if (first.result && minOf(first.result) < 10) {
    const bump = (r: LanguageResult): LanguageResult => ({
      listening: Math.max(r.listening, 9), reading: Math.max(r.reading, 9),
      writing: Math.max(r.writing, 9), speaking: Math.max(r.speaking, 9),
    });
    variants.push({
      key: 'lever.clb9',
      profile: first.lang === 'en' ? { ...p, english: bump(first.result) } : { ...p, french: bump(first.result) },
    });
  }
  if (minOf(p.french) < 7) {
    const nclc7: LanguageResult = { listening: 7, reading: 7, writing: 7, speaking: 7 };
    variants.push({ key: 'lever.nclc7', profile: { ...p, french: nclc7 } });
  }
  const years = canadianWorkYears(p);
  if (years < 2) {
    variants.push({
      key: 'lever.cdnWork',
      profile: {
        ...p,
        work: [...p.work, { inCanada: true, teer: 1, months: (years + 1) * 12 - years * 12, endedMonthsAgo: 0, whileFullTimeStudent: false, selfEmployed: false }],
      },
    });
  }
  if (!p.provincialNomination) variants.push({ key: 'lever.pnp', profile: { ...p, provincialNomination: true } });
  return variants
    .map((v) => ({ key: v.key, gain: computeCrs(v.profile).total - base }))
    .filter((v) => v.gain > 0)
    .sort((a, b) => b.gain - a.gain);
}

/**
 * Core domain types for the IMMCA rules engine.
 *
 * The engine is a pure TypeScript module with no UI or network dependencies:
 * a `Profile` goes in, a ranked list of `ProgramResult`s comes out. Everything
 * runs in the visitor's browser — no profile data ever leaves the device.
 */

export type Province =
  | 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS' | 'NT' | 'NU' | 'ON' | 'PE' | 'QC' | 'SK' | 'YT';

export const PROVINCES: Province[] = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
];

export type Jurisdiction = 'federal' | Province;

/** Canadian Language Benchmark (English) or NCLC (French), 0 = no result. */
export type Clb = number;

export interface LanguageResult {
  listening: Clb;
  reading: Clb;
  writing: Clb;
  speaking: Clb;
}

/** TEER category of the 2021 National Occupational Classification. */
export type Teer = 0 | 1 | 2 | 3 | 4 | 5;

export type EducationLevel =
  | 'none'
  | 'secondary'
  | 'one-year'       // one-year post-secondary diploma / certificate
  | 'two-year'       // two-year post-secondary program
  | 'bachelor'       // bachelor's or 3+ year program
  | 'two-or-more'    // two or more credentials, one of them 3+ years
  | 'master'         // master's or professional degree (NOC TEER 1 licensed)
  | 'phd';

export const EDUCATION_ORDER: EducationLevel[] = [
  'none', 'secondary', 'one-year', 'two-year', 'bachelor', 'two-or-more', 'master', 'phd',
];

export interface CanadianStudy {
  level: EducationLevel;
  province: Province;
  /** Length of the credential's program in months (full-time, in Canada). */
  programMonths: number;
  /** Months since graduation; 0 = still studying / just graduated. */
  monthsSinceGraduation: number;
  /** Whether the program was taken on a full-time basis (≥ 8 months). */
  fullTime: boolean;
}

export interface WorkPeriod {
  /** Where the work was done. */
  inCanada: boolean;
  province?: Province;
  teer: Teer;
  /** Optional NOC 2021 five-digit code, used for category draws / occupation lists. */
  noc?: string;
  /** Total months of full-time-equivalent paid experience in this period. */
  months: number;
  /** How many months ago this period ended (0 = ongoing). */
  endedMonthsAgo: number;
  /** Worked while a full-time student (excluded for CEC / FSW). */
  whileFullTimeStudent: boolean;
  selfEmployed: boolean;
}

export interface JobOffer {
  province: Province;
  teer: Teer;
  noc?: string;
  permanent: boolean;
  fullTime: boolean;
  /** Atlantic Immigration Program designated employer. */
  designatedEmployer?: boolean;
  /** Hourly wage in CAD, if known. */
  hourlyWage?: number;
}

export interface SpouseInfo {
  accompanying: boolean;
  /** Spouse is a Canadian citizen / PR (then treated as single for CRS). */
  canadianOrPr: boolean;
  education: EducationLevel;
  firstLanguage?: LanguageResult;
  canadianWorkMonths: number;
}

export interface Profile {
  age: number;
  /** Where the person intends to live; 'any' = open to anywhere. */
  intendedProvince: Province | 'any';
  /** Where the person lives now, if in Canada. */
  currentProvince?: Province;
  status: 'student' | 'graduate-pgwp' | 'worker' | 'outside';
  education: EducationLevel;
  hasEca: boolean;
  canadianStudy?: CanadianStudy;
  english?: LanguageResult;
  french?: LanguageResult;
  work: WorkPeriod[];
  jobOffer?: JobOffer;
  spouse?: SpouseInfo;
  familySize: number;
  settlementFundsCad: number;
  siblingInCanada: boolean;
  certificateOfQualification: boolean;
  provincialNomination: boolean;
}

/** Outcome of a single requirement ("station") on a pathway. */
export type CheckStatus = 'met' | 'unmet' | 'unknown';

export interface Check {
  /** i18n message key, e.g. `check.minClb`. */
  key: string;
  /** Interpolation values for the message. */
  params?: Record<string, string | number>;
  status: CheckStatus;
  /** Optional note shown on how to close a gap. */
  hintKey?: string;
  hintParams?: Record<string, string | number>;
}

export type ProgramStatus = 'open' | 'invitation-only' | 'intake-windows' | 'paused' | 'closed';

export type ProgramKind =
  | 'express-entry'         // federal Express Entry programs
  | 'federal-pathway'       // other federal PR programs / pilots
  | 'pnp-enhanced'          // Express Entry-linked provincial stream
  | 'pnp-base'              // paper / base provincial stream
  | 'quebec'                // Québec selection
  | 'temporary';            // bridging permits (e.g. PGWP)

export interface Source {
  url: string;
  /** ISO date the rule was last checked against this source. */
  verified: string;
}

export type Verdict =
  | 'eligible'      // every requirement met
  | 'close'         // one or two gaps that can realistically be closed
  | 'gap'           // several gaps
  | 'unavailable';  // program closed / paused, shown for awareness

export interface ProgramResult {
  programId: string;
  verdict: Verdict;
  checks: Check[];
  /** Fraction of determinable checks that are met (0–1). */
  score: number;
  /** Program-specific numeric score, e.g. CRS. */
  points?: { label: string; value: number; benchmark?: number };
}

export interface Criterion {
  evaluate(profile: Profile): Check | Check[];
}

/** Text in each interface language, stored next to the rule it describes. */
export interface L10n {
  en: string;
  fr: string;
  zh: string;
}

export interface ProgramSpec {
  id: string;
  name: L10n;
  /** One-sentence plain-language description of who the program is for. */
  summary: L10n;
  jurisdiction: Jurisdiction;
  kind: ProgramKind;
  status: ProgramStatus;
  criteria: Criterion[];
  sources: Source[];
  /** Short, rule-relevant facts shown on the detail panel (selection, recent draws, caveats). */
  notes?: L10n[];
  /** Express Entry-linked provincial streams add 600 CRS points. */
  enhanced?: boolean;
  /** Optional numeric scoring (e.g. CRS) shown with the result. */
  points?: (profile: Profile) => ProgramResult['points'];
}

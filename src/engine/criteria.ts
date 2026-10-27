/**
 * Reusable requirement combinators.
 *
 * Each program is declared as a list of these criteria, so a rule change in
 * the real world is a one-line data change here rather than new branching
 * logic. Every criterion returns a `Check` carrying an i18n key, so the same
 * evaluation renders in English, French and Chinese.
 */
import {
  EDUCATION_ORDER,
  type Check,
  type Clb,
  type Criterion,
  type EducationLevel,
  type LanguageResult,
  type Profile,
  type Province,
  type Teer,
  type WorkPeriod,
} from './types';

const check = (
  key: string,
  ok: boolean | null,
  params?: Check['params'],
  hintKey?: string,
  hintParams?: Check['hintParams'],
): Check => ({
  key,
  params,
  status: ok === null ? 'unknown' : ok ? 'met' : 'unmet',
  ...(ok === false && hintKey ? { hintKey, hintParams } : {}),
});

export const minOf = (r?: LanguageResult): Clb =>
  r ? Math.min(r.listening, r.reading, r.writing, r.speaking) : 0;

export const educationAtLeast = (have: EducationLevel, need: EducationLevel) =>
  EDUCATION_ORDER.indexOf(have) >= EDUCATION_ORDER.indexOf(need);

/** The official language with the higher minimum ability score. */
export function firstOfficial(p: Profile): { lang: 'en' | 'fr'; result?: LanguageResult } {
  return minOf(p.french) > minOf(p.english)
    ? { lang: 'fr', result: p.french }
    : { lang: 'en', result: p.english };
}

export function secondOfficial(p: Profile): LanguageResult | undefined {
  return firstOfficial(p).lang === 'en' ? p.french : p.english;
}

type LangChoice = 'en' | 'fr' | 'either';

/** Minimum CLB/NCLC in all four abilities. */
export function minLanguage(clb: Clb, lang: LangChoice = 'either'): Criterion {
  return {
    evaluate(p) {
      const en = minOf(p.english);
      const fr = minOf(p.french);
      const have = lang === 'en' ? en : lang === 'fr' ? fr : Math.max(en, fr);
      const tested = lang === 'en' ? !!p.english : lang === 'fr' ? !!p.french : !!(p.english || p.french);
      const key = lang === 'fr' ? 'check.minNclc' : lang === 'en' ? 'check.minClbEn' : 'check.minClb';
      return check(key, tested ? have >= clb : false, { clb, have }, tested ? 'hint.raiseLanguage' : 'hint.takeTest', { clb });
    },
  };
}

/** Minimum level of completed education (foreign credentials need an ECA). */
export function minEducation(level: EducationLevel, opts: { requireEcaIfForeign?: boolean } = {}): Criterion {
  return {
    evaluate(p) {
      const canadian = p.canadianStudy && educationAtLeast(p.canadianStudy.level, level);
      const levelOk = educationAtLeast(p.education, level);
      const ecaOk = canadian || !opts.requireEcaIfForeign || p.hasEca;
      const checks: Check[] = [check('check.education', levelOk, { level: `edu.${level}` })];
      if (opts.requireEcaIfForeign && levelOk && !canadian) {
        checks.push(check('check.eca', ecaOk, undefined, 'hint.getEca'));
      }
      return checks;
    },
  };
}

export interface WorkRule {
  months: number;
  teers?: Teer[];
  inCanada?: boolean;
  /** Restrict to work done in this province. */
  province?: Province;
  /** Only experience gained within this many months counts. */
  withinMonths?: number;
  /** Count only the employer of the job offer (approximated as current Canadian work). */
  nocs?: string[];
  /** Must be continuous (approximated as a single period). */
  continuous?: boolean;
  excludeStudentWork?: boolean;
  excludeSelfEmployed?: boolean;
  /** i18n key override for the station label. */
  key?: string;
}

/** Months of qualifying work, counting only the part inside the time window. */
export function qualifyingMonths(work: WorkPeriod[], r: WorkRule): number {
  const eligible = work.filter(
    (w) =>
      (r.teers ? r.teers.includes(w.teer) : true) &&
      (r.inCanada === undefined ? true : w.inCanada === r.inCanada) &&
      (r.province ? w.inCanada && w.province === r.province : true) &&
      (r.nocs ? !!w.noc && r.nocs.some((n) => w.noc!.startsWith(n)) : true) &&
      !(r.excludeStudentWork && w.whileFullTimeStudent) &&
      !(r.excludeSelfEmployed && w.selfEmployed),
  );
  const inWindow = (w: WorkPeriod) => {
    if (r.withinMonths === undefined) return w.months;
    const usable = r.withinMonths - w.endedMonthsAgo;
    return Math.max(0, Math.min(w.months, usable));
  };
  if (r.continuous) return eligible.reduce((m, w) => Math.max(m, inWindow(w)), 0);
  return eligible.reduce((sum, w) => sum + inWindow(w), 0);
}

export function workExperience(rule: WorkRule): Criterion {
  return {
    evaluate(p) {
      const have = qualifyingMonths(p.work, rule);
      const where = rule.province ? `prov.${rule.province}` : rule.inCanada ? 'where.canada' : rule.inCanada === false ? 'where.abroad' : 'where.anywhere';
      const teers = rule.teers ? rule.teers.join(', ') : '0–5';
      return check(
        rule.key ?? 'check.work',
        have >= rule.months,
        { months: rule.months, have, where, teers, years: rule.withinMonths ? Math.round(rule.withinMonths / 12) : 0 },
        'hint.moreWork',
        { more: rule.months - have },
      );
    },
  };
}

export interface OfferRule {
  province?: Province;
  teers?: Teer[];
  permanent?: boolean;
  fullTime?: boolean;
  designatedEmployer?: boolean;
  nocs?: string[];
  minHourlyWage?: number;
}

export function jobOffer(rule: OfferRule = {}): Criterion {
  return {
    evaluate(p) {
      const o = p.jobOffer;
      const ok =
        !!o &&
        (rule.province ? o.province === rule.province : true) &&
        (rule.teers ? rule.teers.includes(o.teer) : true) &&
        (rule.permanent ? o.permanent : true) &&
        (rule.fullTime ? o.fullTime : true) &&
        (rule.designatedEmployer ? !!o.designatedEmployer : true) &&
        (rule.nocs ? !!o.noc && rule.nocs.some((n) => o.noc!.startsWith(n)) : true) &&
        (rule.minHourlyWage ? (o.hourlyWage ?? 0) >= rule.minHourlyWage : true);
      return check(
        rule.designatedEmployer ? 'check.offerDesignated' : 'check.offer',
        ok,
        {
          where: rule.province ? `prov.${rule.province}` : 'where.canada',
          teers: rule.teers ? rule.teers.join(', ') : '0–5',
          wage: rule.minHourlyWage ?? 0,
        },
        'hint.offer',
      );
    },
  };
}

export interface GradRule {
  province?: Province;
  /** Any of these provinces (e.g. the four Atlantic provinces). */
  provinces?: Province[];
  minLevel?: EducationLevel;
  /** Exact levels allowed (e.g. master only, phd only). */
  levels?: EducationLevel[];
  /** Must apply within this many months of graduating. */
  withinMonths?: number;
  minProgramMonths?: number;
  fullTime?: boolean;
}

export function canadianGraduate(rule: GradRule = {}): Criterion {
  return {
    evaluate(p) {
      const s = p.canadianStudy;
      const ok =
        !!s &&
        (rule.province ? s.province === rule.province : true) &&
        (rule.provinces ? rule.provinces.includes(s.province) : true) &&
        (rule.minLevel ? educationAtLeast(s.level, rule.minLevel) : true) &&
        (rule.levels ? rule.levels.includes(s.level) : true) &&
        (rule.withinMonths !== undefined ? s.monthsSinceGraduation <= rule.withinMonths : true) &&
        (rule.minProgramMonths ? s.programMonths >= rule.minProgramMonths : true) &&
        (rule.fullTime ? s.fullTime : true);
      return check('check.graduate', ok, {
        where: rule.province ? `prov.${rule.province}` : rule.provinces ? 'where.atlantic' : 'where.canada',
        level: rule.levels ? `edu.${rule.levels[0]}` : rule.minLevel ? `edu.${rule.minLevel}` : 'edu.one-year',
        within: rule.withinMonths ?? 0,
      });
    },
  };
}

export function ageRange(min: number, max: number): Criterion {
  return { evaluate: (p) => check('check.age', p.age >= min && p.age <= max, { min, max }) };
}

/** Settlement funds by family size, waived where `waive` returns true. */
export function settlementFunds(table: number[], waive?: (p: Profile) => boolean): Criterion {
  return {
    evaluate(p) {
      const idx = Math.min(p.familySize, table.length) - 1;
      const extra = p.familySize > table.length ? (p.familySize - table.length) * (table[table.length - 1] - table[table.length - 2]) : 0;
      const need = table[idx] + extra;
      if (waive?.(p)) return check('check.fundsWaived', true, { need });
      return check('check.funds', p.settlementFundsCad >= need, { need }, 'hint.funds', { need });
    },
  };
}

export function intendsToLive(province: Province): Criterion {
  return {
    evaluate: (p) =>
      check('check.intends', p.intendedProvince === province || p.intendedProvince === 'any', { where: `prov.${province}` }),
  };
}

export function livesIn(province: Province): Criterion {
  return { evaluate: (p) => check('check.livesIn', p.currentProvince === province, { where: `prov.${province}` }) };
}

export function inCanadaNow(): Criterion {
  return { evaluate: (p) => check('check.inCanada', p.status !== 'outside') };
}

/** Passes if any branch passes; shows the best-scoring branch's stations. */
export function anyOf(key: string, ...branches: Criterion[][]): Criterion {
  return {
    evaluate(p) {
      const evaluated = branches.map((b) => b.flatMap((c) => [c.evaluate(p)].flat()));
      const scored = evaluated.map((cs) => cs.filter((c) => c.status === 'met').length / Math.max(1, cs.length));
      const pass = evaluated.findIndex((cs) => cs.every((c) => c.status === 'met'));
      const best = pass >= 0 ? pass : scored.indexOf(Math.max(...scored));
      return [check(key, pass >= 0, { branch: best + 1, of: branches.length }), ...evaluated[best]];
    },
  };
}

/** Informational station: always "unknown", used for things a screener can't judge. */
export function note(key: string, params?: Check['params']): Criterion {
  return { evaluate: () => check(key, null, params) };
}

/** Arbitrary predicate, for one-off rules. */
export function custom(key: string, fn: (p: Profile) => boolean | null, params?: Check['params'], hintKey?: string): Criterion {
  return { evaluate: (p) => check(key, fn(p), params, hintKey) };
}

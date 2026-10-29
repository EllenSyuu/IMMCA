/**
 * Turns raw engine results into the four dimensions a person actually decides
 * on, a short decision summary, and "what if" scenarios.
 *
 * Eligibility comes from the rules; availability from the program's status and
 * capacity; competitiveness only where an official cutoff exists; evidence from
 * the rule's confidence and the daily source monitor. They are kept separate on
 * purpose: meeting the minimums is not the same as being likely to be invited.
 */
import { computeCrs } from '../engine/crs';
import { rankPrograms } from '../engine/evaluate';
import type { Check, Eligibility, Profile, ProgramResult, ProgramSpec } from '../engine/types';
import { sourceFlag, type SourceFlag } from './monitor';
import { PROGRAM_BY_ID, PROGRAMS } from './programs';

export type Availability = 'open' | 'invitation' | 'windows' | 'limited' | 'exhausted' | 'closed';
export type Competitiveness = 'above' | 'near' | 'below' | 'nodraw' | 'indicative' | 'none';
export type Evidence = 'verified' | 'approximate' | 'unconfirmed' | 'review';

export interface Dimensions {
  eligibility: Eligibility;
  availability: Availability;
  competitiveness: Competitiveness;
  evidence: Evidence;
  flag: SourceFlag;
}

/** How far below an official cutoff still counts as "near" (CRS points). */
export const NEAR_MARGIN = 30;

export function dimensions(spec: ProgramSpec, r: ProgramResult, today = new Date().toISOString().slice(0, 10)): Dimensions {
  const closed = spec.status === 'closed' || spec.status === 'paused' || (!!spec.closesOn && today > spec.closesOn);
  const availability: Availability = closed
    ? 'closed'
    : spec.capacity?.level === 'exhausted'
      ? 'exhausted'
      : spec.capacity?.level === 'limited'
        ? 'limited'
        : spec.status === 'intake-windows'
          ? 'windows'
          : spec.status === 'invitation-only'
            ? 'invitation'
            : 'open';

  let competitiveness: Competitiveness = 'none';
  if (r.points) {
    const { value, benchmark } = r.points;
    // A CRS is exact; without a recent draw for the program there is simply nothing to compare it to.
    if (benchmark === undefined) competitiveness = r.points.label === 'points.crs' ? 'nodraw' : 'indicative';
    else competitiveness = value >= benchmark ? 'above' : value >= benchmark - NEAR_MARGIN ? 'near' : 'below';
  }

  const flag = sourceFlag(spec.sources.map((s) => s.url));
  const evidence: Evidence = flag?.kind === 'changed' ? 'review' : spec.confidence?.level ?? 'verified';
  return { eligibility: r.eligibility, availability, competitiveness, evidence, flag };
}

// ---------------------------------------------------------------- decision summary
export interface Decision {
  /** Up to three routes worth pursuing first. */
  best: { spec: ProgramSpec; result: ProgramResult; dims: Dimensions }[];
  /** The nearest route that is blocked by a single requirement, with that requirement. */
  blocker?: { spec: ProgramSpec; check: Check };
  /** Upcoming fixed dates that matter to this person. */
  deadlines: { key: string; date: string; programId?: string }[];
}

const AVAIL_RANK: Record<Availability, number> = { open: 0, invitation: 1, windows: 2, limited: 3, exhausted: 4, closed: 5 };
const COMP_RANK: Record<Competitiveness, number> = { above: 0, near: 1, none: 2, indicative: 2, nodraw: 3, below: 4 };

export function decide(results: ProgramResult[], today = new Date().toISOString().slice(0, 10)): Decision {
  const enriched = results.map((result) => {
    const spec = PROGRAM_BY_ID.get(result.programId)!;
    return { spec, result, dims: dimensions(spec, result, today) };
  });

  const best = enriched
    .filter((e) => (e.dims.eligibility === 'met' || e.dims.eligibility === 'confirm') && e.dims.availability !== 'closed' && e.spec.kind !== 'temporary')
    .sort((a, b) =>
      Number(a.dims.eligibility === 'confirm') - Number(b.dims.eligibility === 'confirm') ||
      COMP_RANK[a.dims.competitiveness] - COMP_RANK[b.dims.competitiveness] ||
      AVAIL_RANK[a.dims.availability] - AVAIL_RANK[b.dims.availability] ||
      Number(a.dims.evidence !== 'verified') - Number(b.dims.evidence !== 'verified'))
    .slice(0, 3);

  const near = enriched
    .filter((e) => e.dims.eligibility === 'close' && e.dims.availability !== 'closed' && e.dims.availability !== 'exhausted')
    .sort((a, b) => b.result.score - a.result.score)[0];
  const blockerCheck = near?.result.checks.find((c) => c.status === 'unmet' && !c.group);

  const deadlines: Decision['deadlines'] = [];
  for (const e of enriched) {
    if (e.spec.closesOn && e.spec.closesOn >= today && (e.dims.eligibility === 'met' || e.dims.eligibility === 'confirm')) {
      deadlines.push({ key: 'decision.closes', date: e.spec.closesOn, programId: e.spec.id });
    }
  }
  if (today < '2026-11-03' && enriched.some((e) => e.spec.kind === 'express-entry')) {
    deadlines.push({ key: 'decision.crsChange', date: '2026-11-03' });
  }
  deadlines.sort((a, b) => a.date.localeCompare(b.date));

  return { best, blocker: near && blockerCheck ? { spec: near.spec, check: blockerCheck } : undefined, deadlines };
}

// ---------------------------------------------------------------- scenario lab
export interface Scenario {
  key: string;
  /** The province a work or job-offer what-if assumes, shown in its label. */
  province?: (p: Profile) => string;
  apply: (p: Profile) => Profile | null;
}

const clbAll = (n: number) => ({ listening: n, reading: n, writing: n, speaking: n });
const lift = (r: Profile['english'], n: number) =>
  r ? { listening: Math.max(r.listening, n), reading: Math.max(r.reading, n), writing: Math.max(r.writing, n), speaking: Math.max(r.speaking, n) } : clbAll(n);

/** Where a work or job-offer what-if takes place: where the person lives, else where they want to live, else Ontario. */
function scenarioProvince(p: Profile) {
  return p.currentProvince ?? (p.intendedProvince === 'any' ? 'ON' : p.intendedProvince);
}

export const SCENARIOS: Scenario[] = [
  {
    key: 'scenario.french7',
    apply: (p) => (p.french && Math.min(p.french.listening, p.french.reading, p.french.writing, p.french.speaking) >= 7
      ? null
      : { ...p, french: lift(p.french, 7), quebecFrench: { oral: Math.max(p.quebecFrench?.oral ?? 0, 7), written: Math.max(p.quebecFrench?.written ?? 0, 7) } }),
  },
  {
    key: 'scenario.english9',
    apply: (p) => (p.english && Math.min(p.english.listening, p.english.reading, p.english.writing, p.english.speaking) >= 9 ? null : { ...p, english: lift(p.english, 9) }),
  },
  {
    key: 'scenario.moreWork',
    province: scenarioProvince,
    apply: (p) => {
      const province = scenarioProvince(p);
      return {
        ...p,
        status: p.status === 'student' ? 'graduate-pgwp' : p.status,
        work: [...p.work.map((w) => (w.endedMonthsAgo === 0 ? w : { ...w, endedMonthsAgo: w.endedMonthsAgo + 12 })),
          { inCanada: true, province, teer: 1, months: 12, endedMonthsAgo: 0, whileFullTimeStudent: false, selfEmployed: false }],
      };
    },
  },
  {
    key: 'scenario.jobOffer',
    province: scenarioProvince,
    apply: (p) => (p.jobOffer ? null : {
      ...p,
      jobOffer: { province: scenarioProvince(p), teer: 1, noc: '21211', permanent: true, fullTime: true },
    }),
  },
  { key: 'scenario.nomination', apply: (p) => (p.provincialNomination ? null : { ...p, provincialNomination: true }) },
];

export interface ScenarioResult {
  key: string;
  /** Province assumed by the what-if, if any. */
  province?: string;
  crsChange: number;
  /** Routes that become fully eligible and are still open. */
  opens: string[];
}

export function runScenarios(profile: Profile, today = new Date().toISOString().slice(0, 10)): ScenarioResult[] {
  const before = new Map(rankPrograms(PROGRAMS, profile, today).map((r) => [r.programId, r]));
  const crsBefore = computeCrs(profile, today).total;
  const out: ScenarioResult[] = [];
  for (const s of SCENARIOS) {
    const next = s.apply(profile);
    if (!next) continue;
    const after = rankPrograms(PROGRAMS, next, today);
    const opens = after
      .filter((r) => r.verdict === 'eligible' && before.get(r.programId)?.verdict !== 'eligible')
      .map((r) => r.programId);
    const crsChange = computeCrs(next, today).total - crsBefore;
    if (crsChange > 0 || opens.length) out.push({ key: s.key, province: s.province?.(profile), crsChange, opens });
  }
  return out.sort((a, b) => b.opens.length - a.opens.length || b.crsChange - a.crsChange);
}

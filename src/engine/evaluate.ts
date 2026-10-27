import type { Check, Profile, ProgramResult, ProgramSpec, Verdict } from './types';

const UNAVAILABLE = new Set(['paused', 'closed']);

/** Evaluate one program against a profile. */
export function evaluateProgram(spec: ProgramSpec, profile: Profile, today = new Date().toISOString().slice(0, 10)): ProgramResult {
  const checks: Check[] = spec.criteria.flatMap((c) => [c.evaluate(profile)].flat());
  // Group headers ("meets one of N routes") summarise the stations below them, so they aren't counted twice.
  const decided = checks.filter((c) => c.status !== 'unknown' && !c.group);
  const met = decided.filter((c) => c.status === 'met').length;
  const unmet = decided.length - met;
  const score = decided.length ? met / decided.length : 0;

  let verdict: Verdict;
  const expired = !!spec.closesOn && today > spec.closesOn;
  if (UNAVAILABLE.has(spec.status) || expired) verdict = 'unavailable';
  else if (unmet === 0 && met > 0) verdict = 'eligible';
  // "Within reach": most of the line is already travelled — one gap with at least 60% met, or two gaps with four or more met.
  else if ((unmet === 1 && score >= 0.6) || (unmet === 2 && met >= 4)) verdict = 'close';
  else verdict = 'gap';

  return { programId: spec.id, verdict, checks, score, points: spec.points?.(profile) };
}

const VERDICT_RANK: Record<Verdict, number> = { eligible: 0, close: 1, gap: 2, unavailable: 3 };

/**
 * Whether a program is relevant enough to show at all: provincial streams are
 * hidden when the person has no tie to that province and isn't open to moving.
 */
export function isRelevant(spec: ProgramSpec, p: Profile): boolean {
  if (spec.jurisdiction === 'federal') {
    // Express Entry and federal pilots don't select people bound for Québec.
    return p.intendedProvince !== 'QC' || spec.kind === 'temporary';
  }
  const prov = spec.jurisdiction;
  if (p.intendedProvince === 'any' || p.intendedProvince === prov) return true;
  return (
    p.currentProvince === prov ||
    p.canadianStudy?.province === prov ||
    p.jobOffer?.province === prov ||
    p.work.some((w) => w.inCanada && w.province === prov)
  );
}

/** Evaluate and rank every relevant program: eligible first, then by closeness. */
export function rankPrograms(specs: ProgramSpec[], profile: Profile, today?: string): ProgramResult[] {
  return specs
    .filter((s) => isRelevant(s, profile))
    .map((s) => evaluateProgram(s, profile, today))
    .sort((a, b) => VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict] || b.score - a.score);
}

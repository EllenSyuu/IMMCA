/**
 * Recent Express Entry rounds. `draws.json` is refreshed weekly from IRCC's
 * public JSON feed by `.github/workflows/refresh-draws.yml`.
 */
import raw from './draws.json';

export interface Round {
  number: number;
  date: string;
  type: string;
  invited: number;
  crs: number;
}

export const DRAWS: { source: string; fetched: string; rounds: Round[] } = raw;

/** Draw-type keyword each program is compared against. */
export type DrawFamily = 'cec' | 'french' | 'health' | 'trades' | 'stem' | 'education' | 'transport' | 'pnp' | 'managers' | 'physicians' | 'researchers' | 'general';

const FAMILY_PATTERNS: [DrawFamily, RegExp][] = [
  ['cec', /canadian experience/i],
  ['french', /french/i],
  ['health', /health/i],
  ['trades', /trade/i],
  ['stem', /stem|science/i],
  ['education', /education/i],
  ['transport', /transport/i],
  ['pnp', /provincial/i],
  ['managers', /senior manager/i],
  ['physicians', /physician/i],
  ['researchers', /researcher/i],
  ['general', /no program specified|general/i],
];

export function familyOf(type: string): DrawFamily | undefined {
  return FAMILY_PATTERNS.find(([, re]) => re.test(type))?.[0];
}

/** Most recent cutoff for a draw family, if one appears in the feed. */
export function latestCutoff(family: DrawFamily): Round | undefined {
  return DRAWS.rounds.find((r) => familyOf(r.type) === family);
}

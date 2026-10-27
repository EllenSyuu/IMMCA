/**
 * Recent Express Entry rounds. `draws.json` is refreshed daily from IRCC's
 * public JSON feed by `.github/workflows/daily.yml`.
 */
import raw from './draws.json';

export interface Round {
  number: number;
  date: string;
  type: string;
  invited: number;
  crs: number;
}

export interface PoolBand {
  min: number;
  max: number;
  count: number;
}

export const DRAWS: {
  source: string;
  fetched: string;
  rounds: Round[];
  /** CRS distribution of every candidate in the Express Entry pool. */
  pool: { asOf: string; total: number; bands: PoolBand[] };
} = raw;

/**
 * Share of the pool scoring above `score`, interpolating linearly inside the
 * band that contains it (IRCC only publishes banded counts).
 */
export function shareAbove(score: number, pool = DRAWS.pool): number {
  let above = 0;
  for (const b of pool.bands) {
    if (b.min > score) above += b.count;
    else if (b.max > score) above += (b.count * (b.max - score)) / (b.max - b.min + 1);
  }
  return above / pool.total;
}

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

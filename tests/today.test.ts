/**
 * The app on the real date, with the live data: no pinned values, only that
 * every sample profile still produces a sane answer today. This is what catches
 * a date-switched rule or a new data file that actually breaks the site, without
 * tests failing merely because a date in an assertion has passed.
 */
import { describe, expect, it, vi } from 'vitest';
import { computeCrs } from '../src/engine/crs';
import { rankPrograms } from '../src/engine/evaluate';
import { decide, runScenarios } from '../src/data/insights';
import { PROGRAMS } from '../src/data/programs';
import { SAMPLES, toProfile } from '../src/ui/model';

describe('the app today', () => {
  it.each(Object.keys(SAMPLES) as (keyof typeof SAMPLES)[])('sample %s gets a complete, sane result', (k) => {
    vi.useRealTimers();
    const profile = toProfile(SAMPLES[k]);
    const results = rankPrograms(PROGRAMS, profile);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(Number.isFinite(r.score)).toBe(true);
      expect(['eligible', 'close', 'gap', 'unavailable']).toContain(r.verdict);
    }
    const crs = computeCrs(profile).total;
    expect(Number.isInteger(crs) && crs >= 0 && crs <= 1200).toBe(true);
    expect(() => decide(results)).not.toThrow();
    for (const s of runScenarios(profile)) expect(Number.isFinite(s.crsChange)).toBe(true);
  });
});

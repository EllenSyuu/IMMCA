import { describe, expect, it } from 'vitest';
import { DRAWS, familyOf, latestCutoff, shareAbove } from '../src/data/draws';
// @ts-expect-error — plain ESM script without type declarations
import { normalize } from '../scripts/refresh-draws.mjs';

describe('Express Entry rounds data', () => {
  it('reads the frozen snapshot, not the live file', () => {
    // tests/fixtures/data/draws.json, fetched 2026-10-28 (see vitest.config.ts).
    expect(DRAWS.fetched).toBe('2026-10-28');
  });

  it('classifies round types into draw families', () => {
    expect(familyOf('Canadian Experience Class')).toBe('cec');
    expect(familyOf('French language proficiency (2026-Version 2)')).toBe('french');
    expect(familyOf('Healthcare and social services occupations')).toBe('health');
    expect(latestCutoff('cec')?.crs).toBe(519); // pinned by the snapshot
  });

  it('places a score within the pool', () => {
    expect(shareAbove(1200)).toBe(0);
    expect(shareAbove(0)).toBeGreaterThan(0.99);
    const mid = shareAbove(450);
    expect(mid).toBeGreaterThan(0.3);
    expect(mid).toBeLessThan(0.6);
  });
});

describe('refresh script', () => {
  const round = (n: number) => ({
    drawNumber: String(n), drawDate: '2026-10-26', drawName: 'Trade occupations (2026-Version 3)', drawSize: '3,500', drawCRS: '476',
    drawDistributionAsOn: 'October 25, 2026',
    dd1: '10', dd2: '10', dd4: '10', dd5: '10', dd6: '10', dd7: '10', dd8: '10', dd10: '10', dd11: '10', dd12: '10',
    dd13: '10', dd14: '10', dd15: '10', dd16: '10', dd17: '10', dd18: '150',
  });

  it('normalizes the IRCC feed shape', () => {
    const out = normalize({ rounds: [round(451), round(450)] }, '2026-10-27');
    expect(out.rounds[0]).toEqual({ number: 451, date: '2026-10-26', type: 'Trade occupations', invited: 3500, crs: 476 });
    expect(out.pool).toMatchObject({ asOf: '2026-10-25', total: 150 });
  });

  it('refuses a feed whose shape changed', () => {
    expect(() => normalize({ rounds: [] }, 'x')).toThrow();
    expect(() => normalize({ rounds: [{ ...round(1), drawCRS: '' }] }, 'x')).toThrow(/unexpected/);
    expect(() => normalize({ rounds: [{ ...round(1), dd18: '9999' }] }, 'x')).toThrow(/add up/);
  });
});

describe('round names', () => {
  it('strips the version suffix with or without brackets', () => {
    const base = { drawNumber: '1', drawDate: '2026-10-27', drawSize: '1', drawCRS: '400', drawDistributionAsOn: 'October 25, 2026',
      dd1: '1', dd2: '0', dd4: '0', dd5: '0', dd6: '0', dd7: '0', dd8: '0', dd10: '0', dd11: '0', dd12: '0', dd13: '0', dd14: '0', dd15: '0', dd16: '0', dd17: '0', dd18: '1' };
    expect(normalize({ rounds: [{ ...base, drawName: 'French-Language proficiency 2026-Version 2' }] }, 'x').rounds[0].type).toBe('French-Language proficiency');
    expect(normalize({ rounds: [{ ...base, drawName: 'Trades (2026-Version 3)' }] }, 'x').rounds[0].type).toBe('Trades');
    expect(normalize({ rounds: [{ ...base, drawName: 'Transport Occupations,' }] }, 'x').rounds[0].type).toBe('Transport Occupations');
  });
});

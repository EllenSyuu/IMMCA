/**
 * The live data files rewritten by the daily workflow. Only their shape is checked
 * here: values change every day, and behaviour tests use frozen copies instead.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const live = (name: string) => JSON.parse(readFileSync(new URL(`../src/data/${name}`, import.meta.url), 'utf8'));

describe('live data files', () => {
  it('draws.json: rounds newest first, valid numbers, a pool that adds up', () => {
    const d = live('draws.json');
    const dates: string[] = d.rounds.map((r: { date: string }) => r.date);
    expect(dates.length).toBeGreaterThan(0);
    expect([...dates].sort().reverse()).toEqual(dates);
    for (const r of d.rounds) {
      expect(Number.isInteger(r.number) && r.number > 0).toBe(true);
      expect(r.crs).toBeGreaterThan(0);
      expect(r.crs).toBeLessThanOrEqual(1200);
      expect(typeof r.type).toBe('string');
    }
    expect(d.pool.bands.reduce((s: number, b: { count: number }) => s + b.count, 0)).toBe(d.pool.total);
  });

  it('source-status.json: every entry has a known status and hashes', () => {
    const { sources } = live('source-status.json');
    for (const [url, s] of Object.entries<{ status: string; baseline: string }>(sources)) {
      expect(url).toMatch(/^https:\/\//);
      expect(['unchanged', 'changed', 'unreachable']).toContain(s.status);
      expect(s.baseline).toMatch(/^[0-9a-f]*$/); // empty until the page has been read once
    }
  });

  it('updates-log.json: one entry per day, in date order', () => {
    const log: { date: string }[] = live('updates-log.json');
    const dates = log.map((e) => e.date);
    expect([...dates].sort()).toEqual(dates);
    expect(new Set(dates).size).toBe(dates.length);
  });
});

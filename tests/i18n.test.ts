import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { en } from '../src/i18n/en';
import { fr } from '../src/i18n/fr';
import { zh } from '../src/i18n/zh';

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(p) ? [p] : [];
  });

describe('translations', () => {
  it('French and Chinese have exactly the English keys', () => {
    expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort());
    expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort());
  });

  it('every placeholder in English also appears in the translations', () => {
    const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const k of Object.keys(en)) {
      expect(ph(fr[k]), `fr ${k}`).toEqual(ph(en[k]));
      expect(ph(zh[k]), `zh ${k}`).toEqual(ph(en[k]));
    }
  });

  it('every message key emitted by the engine and program data exists', () => {
    const src = files('src').filter((f) => !f.includes('i18n')).map((f) => readFileSync(f, 'utf8')).join('\n');
    const used = new Set(src.match(/'(check|hint|lever|points)\.[A-Za-z0-9-]+'/g)?.map((s) => s.slice(1, -1)));
    for (const k of used) expect(en[k], k).toBeDefined();
  });
});

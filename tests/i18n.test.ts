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

describe('rendered requirements', () => {
  it('leave no placeholder unfilled in any program, profile or language', async () => {
    const { translate } = await import('../src/i18n/context');
    const { PROGRAMS } = await import('../src/data/programs');
    const { evaluateProgram } = await import('../src/engine/evaluate');
    const { SAMPLES, EMPTY, toProfile } = await import('../src/ui/model');
    const profiles = [...Object.values(SAMPLES), EMPTY].map(toProfile);
    for (const locale of ['en', 'fr', 'zh'] as const) {
      for (const spec of PROGRAMS) {
        for (const p of profiles) {
          for (const c of evaluateProgram(spec, p, '2026-10-27').checks) {
            const msg = translate(locale, c.key, c.params);
            expect(msg, `${locale} ${spec.id} ${c.key}`).not.toMatch(/\{\w+\}|undefined|NaN|^(check|hint)\./);
            if (c.hintKey) {
              const hint = translate(locale, c.hintKey, { ...c.params, ...c.hintParams });
              expect(hint, `${locale} ${spec.id} ${c.hintKey}`).not.toMatch(/\{\w+\}|undefined|NaN|^hint\./);
            }
          }
        }
      }
    }
  });
});

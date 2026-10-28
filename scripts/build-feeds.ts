/**
 * Write the subscription feeds into the built site (dist/feeds/):
 *   updates-{en,fr,zh}.ics   one event per new round, deadline, rule change
 *   daily-{en,fr,zh}.ics     one short reminder per day
 *   updates-{en,fr,zh}.xml   the same updates as an Atom feed for RSS readers
 * Run after `vite build`; the daily workflow rebuilds and redeploys every morning.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIcs } from '../src/feeds/ics';
import { SITE, buildAtom, calendars } from '../src/feeds/events';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(resolve(ROOT, process.argv[2] ?? 'dist'), 'feeds');
mkdirSync(out, { recursive: true });
const today = new Date().toISOString().slice(0, 10);

for (const locale of ['en', 'fr', 'zh'] as const) {
  const { updates, digest } = calendars(locale, today);
  writeFileSync(join(out, `updates-${locale}.ics`), buildIcs(updates));
  writeFileSync(join(out, `daily-${locale}.ics`), buildIcs(digest));
  writeFileSync(join(out, `updates-${locale}.xml`), buildAtom(locale, today, `${SITE}feeds/updates-${locale}.xml`));
}
console.log(`feeds written to ${out}`);

#!/usr/bin/env node
/**
 * Refresh src/data/draws.json from IRCC's public Express Entry rounds feed.
 * Run daily by .github/workflows/daily.yml; exits non-zero (and
 * leaves the file untouched) if the feed is unreachable or its shape changed.
 *
 *   node scripts/refresh-draws.mjs [--check]
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FEED = 'https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json';
const OUT = new URL('../src/data/draws.json', import.meta.url);
const KEEP = 25;

// IRCC's distribution table: dd1..dd17 are score bands, dd18 is the total.
// Bands dd4–dd8 split dd3 (451–500) and dd10–dd14 split dd9 (401–450).
export const BANDS = [
  { key: 'dd1', min: 601, max: 1200 },
  { key: 'dd2', min: 501, max: 600 },
  { key: 'dd4', min: 491, max: 500 },
  { key: 'dd5', min: 481, max: 490 },
  { key: 'dd6', min: 471, max: 480 },
  { key: 'dd7', min: 461, max: 470 },
  { key: 'dd8', min: 451, max: 460 },
  { key: 'dd10', min: 441, max: 450 },
  { key: 'dd11', min: 431, max: 440 },
  { key: 'dd12', min: 421, max: 430 },
  { key: 'dd13', min: 411, max: 420 },
  { key: 'dd14', min: 401, max: 410 },
  { key: 'dd15', min: 351, max: 400 },
  { key: 'dd16', min: 301, max: 350 },
  { key: 'dd17', min: 0, max: 300 },
];

const num = (v) => Number(String(v ?? '').replace(/[^\d]/g, ''));

export function normalize(feed, fetched) {
  if (!Array.isArray(feed?.rounds) || feed.rounds.length === 0) throw new Error('feed has no rounds');
  const rounds = feed.rounds.slice(0, KEEP).map((r) => ({
    number: num(r.drawNumber),
    date: String(r.drawDate),
    type: String(r.drawName).replace(/\s*\(?\d{4}-Version \d+\)?/i, '').replace(/[\s,;:]+$/, '').trim(),
    invited: num(r.drawSize),
    crs: num(r.drawCRS),
  }));
  for (const r of rounds) {
    if (!r.number || !/^\d{4}-\d{2}-\d{2}$/.test(r.date) || !r.type || !r.invited || !r.crs) {
      throw new Error(`unexpected round shape: ${JSON.stringify(r)}`);
    }
  }
  const latest = feed.rounds[0];
  const bands = BANDS.map((b) => ({ min: b.min, max: b.max, count: num(latest[b.key]) }));
  const total = num(latest.dd18);
  const sum = bands.reduce((s, b) => s + b.count, 0);
  if (!total || Math.abs(sum - total) > total * 0.01) throw new Error(`distribution does not add up (${sum} vs ${total})`);
  return {
    source: FEED,
    fetched,
    rounds,
    pool: { asOf: new Date(`${latest.drawDistributionAsOn} UTC`).toISOString().slice(0, 10), total, bands },
  };
}

async function main() {
  const res = await fetch(FEED, { headers: { 'user-agent': 'IMMCA data refresh (+https://github.com/EllenSyuu/IMMCA)' } });
  if (!res.ok) throw new Error(`feed returned HTTP ${res.status}`);
  const next = normalize(await res.json(), new Date().toISOString().slice(0, 10));
  const prev = JSON.parse(readFileSync(OUT, 'utf8'));
  const changed = JSON.stringify({ ...prev, fetched: '' }) !== JSON.stringify({ ...next, fetched: '' });
  if (process.argv.includes('--check')) {
    console.log(changed ? 'feed has new data' : 'no change');
    return;
  }
  if (!changed) return console.log('no change');
  writeFileSync(OUT, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`updated: latest round #${next.rounds[0].number} on ${next.rounds[0].date}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

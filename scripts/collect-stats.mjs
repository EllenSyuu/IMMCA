#!/usr/bin/env node
/**
 * Copy the counter's public totals into the repository once a day:
 *   stats/stats.json         latest numbers
 *   stats/history.csv        one row per day (open data)
 *   stats/badge-*.json       shields.io endpoint badges used in the README
 * Usage: COUNTER_URL=https://… node scripts/collect-stats.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DIR = new URL('../stats/', import.meta.url);
const fmt = new Intl.NumberFormat('en-US');

export function badges(s) {
  return {
    'badge-visits.json': { schemaVersion: 1, label: 'visits', message: fmt.format(s.visits.total), color: '12213d' },
    'badge-subscriptions.json': { schemaVersion: 1, label: 'calendar subscriptions', message: fmt.format(s.subscriptions.total), color: '1d4ed8' },
    'badge-installs.json': { schemaVersion: 1, label: 'app installs', message: fmt.format(s.installs.total), color: '0f8b6e' },
  };
}

export function historyRow(s) {
  return [s.updated.slice(0, 10), s.visits.total, s.visits.last30, s.pageViews, s.subscriptions.total, s.installs.total, s.feedReaders.yesterday].join(',');
}

export function validate(s) {
  const n = (v) => Number.isInteger(v) && v >= 0;
  if (!s || typeof s.updated !== 'string' || !n(s.visits?.total) || !n(s.visits?.last30) || !n(s.pageViews) ||
      !n(s.subscriptions?.total) || !n(s.installs?.total) || !n(s.feedReaders?.yesterday)) {
    throw new Error('unexpected stats shape');
  }
  return s;
}

async function main() {
  const base = process.env.COUNTER_URL;
  if (!base) throw new Error('COUNTER_URL is not set');
  const res = await fetch(`${base.replace(/\/$/, '')}/stats.json`, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`counter returned HTTP ${res.status}`);
  const s = validate(await res.json());
  mkdirSync(DIR, { recursive: true });
  writeFileSync(new URL('stats.json', DIR), `${JSON.stringify(s, null, 2)}\n`);
  for (const [file, body] of Object.entries(badges(s))) writeFileSync(new URL(file, DIR), `${JSON.stringify(body)}\n`);
  const csv = new URL('history.csv', DIR);
  const header = 'date,visits_total,visits_30d,page_views,subscriptions,installs,feed_readers_yesterday';
  const rows = existsSync(csv) ? readFileSync(csv, 'utf8').trim().split('\n').slice(1) : [];
  const today = historyRow(s);
  const kept = rows.filter((r) => !r.startsWith(today.slice(0, 10)));
  writeFileSync(csv, `${[header, ...kept, today].join('\n')}\n`);
  console.log(`stats: ${s.visits.total} visits, ${s.subscriptions.total} subscriptions, ${s.installs.total} installs`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}

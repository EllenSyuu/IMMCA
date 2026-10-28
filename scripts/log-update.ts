/**
 * Record what changed today in src/data/updates-log.json, for the calendar and
 * RSS feeds. Run by the daily workflow after the data refresh and source check,
 * before committing: it compares the working files with the last commit.
 *
 *   npx tsx scripts/log-update.ts [YYYY-MM-DD]
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOG = join(ROOT, 'src/data/updates-log.json');
const KEEP_DAYS = 120;

type Entry = { date: string; rounds: number[]; changed: string[] };
type Status = { sources: Record<string, { status: string }> };

function committed<T>(path: string, fallback: T): T {
  try {
    return JSON.parse(execFileSync('git', ['show', `HEAD:${path}`], { cwd: ROOT, encoding: 'utf8' }));
  } catch {
    return fallback;
  }
}

/** Pure merge step, exported for tests. */
export function mergeEntry(log: Entry[], day: string, newRounds: number[], newlyChanged: string[]): Entry[] {
  const existing = log.find((e) => e.date === day);
  const entry: Entry = existing ?? { date: day, rounds: [], changed: [] };
  entry.rounds = [...new Set([...entry.rounds, ...newRounds])].sort((a, b) => a - b);
  entry.changed = [...new Set([...entry.changed, ...newlyChanged])].sort();
  const rest = log.filter((e) => e.date !== day);
  const cutoff = new Date(Date.parse(`${day}T00:00:00Z`) - KEEP_DAYS * 86_400_000).toISOString().slice(0, 10);
  return [...rest, entry].filter((e) => e.date >= cutoff).sort((a, b) => a.date.localeCompare(b.date));
}

function main() {
  const day = process.argv[2] ?? new Date().toISOString().slice(0, 10);
  const draws = JSON.parse(readFileSync(join(ROOT, 'src/data/draws.json'), 'utf8')) as { rounds: { number: number }[] };
  const oldDraws = committed<{ rounds: { number: number }[] }>('src/data/draws.json', { rounds: [] });
  const known = new Set(oldDraws.rounds.map((r) => r.number));
  const newRounds = draws.rounds.map((r) => r.number).filter((n) => !known.has(n));

  const status = JSON.parse(readFileSync(join(ROOT, 'src/data/source-status.json'), 'utf8')) as Status;
  const oldStatus = committed<Status>('src/data/source-status.json', { sources: {} });
  const newlyChanged = Object.entries(status.sources)
    .filter(([url, s]) => s.status === 'changed' && oldStatus.sources[url]?.status !== 'changed')
    .map(([url]) => url);

  const log = JSON.parse(readFileSync(LOG, 'utf8')) as Entry[];
  writeFileSync(LOG, `${JSON.stringify(mergeEntry(log, day, newRounds, newlyChanged), null, 2)}\n`);
  console.log(`logged ${day}: ${newRounds.length} new rounds, ${newlyChanged.length} changed pages`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();

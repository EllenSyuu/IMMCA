/**
 * Daily official-source monitor.
 *
 * Fetches every official page that a program rule cites, reduces it to its
 * readable text, and compares it with the text the rule was verified against.
 * It never rewrites a rule: a changed page is flagged on the site ("official
 * page changed, under review") and reported in a GitHub issue for a person to
 * review. Text snapshots are committed under monitor/snapshots/, so the commit
 * diff shows exactly what changed on the government page.
 *
 *   npx tsx scripts/check-sources.ts                 # check every source
 *   npx tsx scripts/check-sources.ts --accept <url>  # mark a reviewed change as the new baseline
 *   npx tsx scripts/check-sources.ts --accept all
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROGRAMS } from '../src/data/programs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STATUS_FILE = join(ROOT, 'src/data/source-status.json');
const RUN_FILE = join(ROOT, 'src/data/monitor-run.json');
const SNAP_DIR = join(ROOT, 'monitor/snapshots');
const TIMEOUT_MS = 30_000;

export type SourceState = {
  /** Hash of the text the rules were verified against. */
  baseline: string;
  /** Hash seen on the latest successful check. */
  current: string;
  status: 'unchanged' | 'changed' | 'unreachable';
  /** First day the page differed from the baseline. */
  changedOn?: string;
  /** First day of the current run of failed fetches. */
  unreachableSince?: string;
  /** Last day a person accepted the page's text as the baseline. */
  acceptedOn?: string;
};

export type StatusFile = { sources: Record<string, SourceState> };

/** Reduce an HTML page to stable, readable text. */
export function pageText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|template|iframe)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(header|footer|nav)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>|<\/(p|li|h[1-6]|tr|div|section)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    // Volatile tokens that change without the content changing.
    .replace(/\b(nonce|csrf|token|session)[-_a-z]*\s*[:=]\s*\S+/gi, '')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l && !NOISE.test(l))
    .join('\n');
}

/**
 * Site-wide banners that come and go without any rule changing — maintenance
 * and outage notices, cookie prompts — are ignored so they don't raise false alarms.
 */
export const NOISE = /\b(site|system|service|scheduled)\b.{0,40}\b(outage|maintenance|unavailable|interruption)\b|\b(outage|maintenance)\b.{0,60}\b(\d{1,2}(:\d{2})?\s*(am|pm|a\.m\.|p\.m\.)|\d{4}-\d{2}-\d{2})|panne temporaire|interruption de service|maintenance planifiée|\bwe use cookies\b/i;

export const hash = (s: string | Buffer) => createHash('sha256').update(s).digest('hex').slice(0, 16);
const snapName = (url: string) => `${hash(url)}.txt`;
const today = () => new Date().toISOString().slice(0, 10);

/** Every official URL cited by a program, with the programs that cite it. */
export function citedSources(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const p of PROGRAMS) for (const s of p.sources) map.set(s.url, [...(map.get(s.url) ?? []), p.id]);
  return map;
}

/** Pure state transition for one source, so the logic is testable without the network. */
export function nextState(prev: SourceState | undefined, fetched: string | null, day: string): SourceState {
  if (fetched === null) {
    if (!prev) return { baseline: '', current: '', status: 'unreachable', unreachableSince: day };
    return { ...prev, status: 'unreachable', unreachableSince: prev.unreachableSince ?? day };
  }
  if (!prev || !prev.baseline) return { baseline: fetched, current: fetched, status: 'unchanged' };
  const { unreachableSince: _gone, ...rest } = prev;
  if (fetched === prev.baseline) return { ...rest, current: fetched, status: 'unchanged', changedOn: undefined };
  return { ...rest, current: fetched, status: 'changed', changedOn: prev.status === 'changed' && prev.changedOn ? prev.changedOn : day };
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'user-agent': 'IMMCA source monitor (+https://github.com/EllenSyuu/IMMCA)', 'accept-language': 'en-CA,en;q=0.9,fr-CA;q=0.8' },
    });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') ?? '';
    if (type.includes('pdf') || url.toLowerCase().endsWith('.pdf')) {
      const buf = Buffer.from(await res.arrayBuffer());
      return `[pdf ${buf.length} bytes sha256:${hash(buf)}]`;
    }
    const text = pageText(await res.text());
    return text.length > 200 ? text : null; // an empty shell usually means a block page
  } catch {
    return null;
  }
}

function load(): StatusFile {
  return existsSync(STATUS_FILE) ? JSON.parse(readFileSync(STATUS_FILE, 'utf8')) : { sources: {} };
}

function save(file: StatusFile) {
  const sorted = Object.fromEntries(Object.entries(file.sources).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(STATUS_FILE, `${JSON.stringify({ sources: sorted }, null, 2)}\n`);
}

async function main() {
  const file = load();
  const args = process.argv.slice(2);

  if (args[0] === '--accept') {
    const target = args[1];
    for (const [url, s] of Object.entries(file.sources)) {
      if (target !== 'all' && url !== target) continue;
      // "all" means every page currently flagged as changed, not every page.
      if (target === 'all' && s.status !== 'changed') continue;
      if (s.current) file.sources[url] = { baseline: s.current, current: s.current, status: 'unchanged', acceptedOn: today() };
    }
    save(file);
    console.log(`accepted ${target}`);
    return;
  }

  const cited = citedSources();
  mkdirSync(SNAP_DIR, { recursive: true });
  const newlyChanged: string[] = [];
  let reachable = 0;
  const day = today();

  // Gentle concurrency: a few requests at a time.
  const urls = [...cited.keys()];
  for (let i = 0; i < urls.length; i += 4) {
    await Promise.all(urls.slice(i, i + 4).map(async (url) => {
      const text = await fetchText(url);
      const before = file.sources[url];
      const state = nextState(before, text === null ? null : hash(text), day);
      file.sources[url] = state;
      if (text !== null) {
        reachable++;
        writeFileSync(join(SNAP_DIR, snapName(url)), `${url}\n\n${text}\n`);
      }
      if (state.status === 'changed' && before?.status !== 'changed') newlyChanged.push(url);
    }));
  }
  // Forget sources no program cites any more.
  for (const url of Object.keys(file.sources)) if (!cited.has(url)) delete file.sources[url];
  save(file);

  writeFileSync(RUN_FILE, `${JSON.stringify({ checkedAt: new Date().toISOString(), reachable, total: urls.length }, null, 2)}\n`);

  const changed = Object.entries(file.sources).filter(([, s]) => s.status === 'changed');
  const lines = [
    `Checked ${urls.length} official sources: ${reachable} reachable, ${changed.length} changed since verification.`,
    ...newlyChanged.map((u) => `NEW CHANGE ${u} (programs: ${cited.get(u)!.join(', ')})`),
  ];
  console.log(lines.join('\n'));
  writeFileSync(join(ROOT, 'monitor/new-changes.md'), newlyChanged.length
    ? `These official pages changed today (${day}). The programs that cite them are flagged "under review" on the site.\n\n${newlyChanged.map((u) => `- ${u} — ${cited.get(u)!.join(', ')}`).join('\n')}\n\nReview the text diff in the latest "data:" commit (monitor/snapshots), update the program spec if the rule changed, then run \`npm run sources:accept -- <url>\`.\n`
    : '');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

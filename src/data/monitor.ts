/**
 * Results of the daily official-source monitor (scripts/check-sources.ts).
 * `source-status.json` is committed whenever a page's state changes;
 * `monitor-run.json` is written by each daily run and only exists in deployed builds.
 */
import status from './source-status.json';

type SourceState = {
  status: 'unchanged' | 'changed' | 'unreachable';
  changedOn?: string;
  unreachableSince?: string;
};

const SOURCES = (status as { sources: Record<string, SourceState> }).sources;

/** How many official pages the monitor watches. */
export const SOURCE_COUNT = Object.keys(SOURCES).length;

const runFiles = import.meta.glob<{ checkedAt: string; reachable: number; total: number }>('./monitor-run.json', { eager: true, import: 'default' });

/** The latest daily run, if this build came from the daily workflow. */
export const LAST_RUN = Object.values(runFiles)[0];

export type SourceFlag = { kind: 'changed'; since: string } | { kind: 'unreachable'; since: string } | undefined;

/** The most important monitor flag across a program's sources. */
export function sourceFlag(urls: string[]): SourceFlag {
  let unreachable: string | undefined;
  for (const url of urls) {
    const s = SOURCES[url];
    if (s?.status === 'changed') return { kind: 'changed', since: s.changedOn ?? '' };
    if (s?.status === 'unreachable' && s.unreachableSince) unreachable = s.unreachableSince;
  }
  // A single failed day is usually a hiccup; flag only a week of failures.
  if (unreachable && Date.now() - new Date(`${unreachable}T00:00:00Z`).getTime() > 7 * 86_400_000) {
    return { kind: 'unreachable', since: unreachable };
  }
  return undefined;
}

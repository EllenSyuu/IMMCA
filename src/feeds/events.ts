/**
 * What subscribers are told about, built from the same data the site uses:
 * new Express Entry rounds, program deadlines, the CRS rule change, official
 * pages that changed, and a once-a-day digest. Pure functions, so the feeds
 * are reproducible and testable.
 */
import { LMI_START } from '../engine/crs';
import { DRAWS, familyOf } from '../data/draws';
import { PROGRAMS } from '../data/programs';
import { translate, type Locale } from '../i18n/context';
import type { IcsCalendar, IcsEvent } from './ics';
import log from '../data/updates-log.json';

export const SITE = 'https://ellensyuu.github.io/IMMCA/';

export interface LogEntry {
  date: string;
  /** Express Entry round numbers first seen that day. */
  rounds: number[];
  /** Official pages first flagged as changed that day. */
  changed: string[];
}

export const UPDATES_LOG = log as LogEntry[];

const DAY = 86_400_000;
const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY);

/** Programs that cite an official URL. */
function programsCiting(url: string) {
  return PROGRAMS.filter((p) => p.sources.some((s) => s.url === url));
}

function roundTitle(locale: Locale, r: (typeof DRAWS.rounds)[number]) {
  const fam = familyOf(r.type);
  const type = fam ? translate(locale, `draw.${fam}`) : r.type;
  return translate(locale, 'feed.round', { n: r.number, type, invited: r.invited, crs: r.crs });
}

/** Event-by-event feed: something happened or is about to. */
export function updateEvents(locale: Locale, today: string): IcsEvent[] {
  const events: IcsEvent[] = [];

  for (const r of DRAWS.rounds) {
    events.push({
      uid: `ee-round-${r.number}@immca`,
      date: r.date,
      summary: roundTitle(locale, r),
      description: translate(locale, 'feed.roundBody', { cutoff: r.crs, invited: r.invited }),
      url: SITE,
      categories: ['Express Entry'],
      alarmMinutesBefore: 0,
    });
  }

  for (const p of PROGRAMS) {
    if (!p.closesOn || daysBetween(p.closesOn, today) > 30) continue;
    events.push({
      uid: `deadline-${p.id}-${p.closesOn}@immca`,
      date: p.closesOn,
      summary: translate(locale, 'feed.deadline', { name: p.name[locale] }),
      description: `${p.summary[locale]}\n\n${p.sources[0].url}`,
      url: p.sources[0].url,
      categories: ['Deadline'],
      alarmMinutesBefore: 3 * 24 * 60,
    });
  }

  if (daysBetween(LMI_START, today) <= 30) {
    events.push({
      uid: `crs-rules-${LMI_START}@immca`,
      date: LMI_START,
      summary: translate(locale, 'feed.crsChange'),
      description: translate(locale, 'feed.crsChangeBody'),
      url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/changes.html',
      categories: ['Express Entry'],
      alarmMinutesBefore: 24 * 60,
    });
  }

  for (const entry of UPDATES_LOG) {
    for (const url of entry.changed) {
      const names = programsCiting(url).map((p) => p.name[locale]);
      if (!names.length) continue;
      events.push({
        uid: `page-change-${entry.date}-${hashString(url)}@immca`,
        date: entry.date,
        summary: translate(locale, 'feed.pageChanged', { names: names.join(' · ') }),
        description: translate(locale, 'feed.pageChangedBody', { url }),
        url,
        categories: ['Rule review'],
        alarmMinutesBefore: 0,
      });
    }
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

/** One short reminder per day the site was checked, at 12:00 UTC (8:00 in Eastern time). */
export function digestEvents(locale: Locale): IcsEvent[] {
  return UPDATES_LOG.slice(-60).map((entry) => {
    const rounds = DRAWS.rounds.filter((r) => entry.rounds.includes(r.number));
    const lines = [
      ...rounds.map((r) => roundTitle(locale, r)),
      ...entry.changed.map((url) => translate(locale, 'feed.pageChanged', { names: programsCiting(url).map((p) => p.name[locale]).join(' · ') })),
    ];
    const summary = lines.length
      ? translate(locale, 'feed.digest', { n: lines.length })
      : translate(locale, 'feed.digestQuiet');
    const latest = DRAWS.rounds.find((r) => r.date <= entry.date);
    const body = [
      ...(lines.length ? lines : [translate(locale, 'feed.digestNothing')]),
      latest ? translate(locale, 'feed.digestLatest', { title: roundTitle(locale, latest) }) : '',
      SITE,
    ].filter(Boolean).join('\n');
    return {
      uid: `digest-${entry.date}@immca`,
      date: entry.date,
      startUtc: '12:00',
      durationMinutes: 10,
      summary,
      description: body,
      url: SITE,
      categories: ['IMMCA digest'],
      alarmMinutesBefore: 0,
    };
  });
}

export function calendars(locale: Locale, today: string): { updates: IcsCalendar; digest: IcsCalendar } {
  return {
    updates: {
      name: translate(locale, 'feed.calUpdates'),
      description: translate(locale, 'feed.calUpdatesDesc'),
      refreshHours: 6,
      events: updateEvents(locale, today),
    },
    digest: {
      name: translate(locale, 'feed.calDigest'),
      description: translate(locale, 'feed.calDigestDesc'),
      refreshHours: 6,
      events: digestEvents(locale),
    },
  };
}

/** Short stable hash for UIDs (FNV-1a). */
export function hashString(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// ---------------------------------------------------------------- Atom (RSS readers)
const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildAtom(locale: Locale, today: string, selfUrl: string): string {
  const events = updateEvents(locale, today).filter((e) => e.date <= today).reverse().slice(0, 50);
  const updated = `${(events[0]?.date ?? today)}T12:00:00Z`;
  const entries = events.map((e) => `  <entry>
    <id>urn:immca:${xml(e.uid)}</id>
    <title>${xml(e.summary)}</title>
    <updated>${e.date}T12:00:00Z</updated>
    <link href="${xml(e.url ?? SITE)}"/>
    <content type="text">${xml(e.description)}</content>
  </entry>`).join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${locale === 'zh' ? 'zh-Hans' : locale}">
  <title>${xml(translate(locale, 'feed.calUpdates'))}</title>
  <subtitle>${xml(translate(locale, 'feed.calUpdatesDesc'))}</subtitle>
  <id>${xml(selfUrl)}</id>
  <link rel="self" href="${xml(selfUrl)}"/>
  <link href="${SITE}"/>
  <updated>${updated}</updated>
  <author><name>IMMCA</name></author>
${entries}
</feed>
`;
}

import ICAL from 'ical.js';
import { describe, expect, it } from 'vitest';
import { buildAtom, calendars, digestEvents, updateEvents } from '../src/feeds/events';
import { buildIcs, escapeText, foldLine } from '../src/feeds/ics';
import { mergeEntry } from '../scripts/log-update';

const TODAY = '2026-10-28';
const enc = new TextEncoder();

describe('ICS writer', () => {
  it('escapes text values', () => {
    expect(escapeText('a, b; c\\d\ne')).toBe(String.raw`a\, b\; c\\d\n` + 'e');
  });

  it('folds long lines at 75 octets without splitting a character', () => {
    const line = `SUMMARY:${'快速通道'.repeat(20)}`;
    const folded = foldLine(line).split('\r\n');
    for (const part of folded) expect(enc.encode(part).length).toBeLessThanOrEqual(75);
    expect(folded.map((p, i) => (i ? p.slice(1) : p)).join('')).toBe(line);
  });
});

describe('subscription feeds', () => {
  for (const locale of ['en', 'fr', 'zh'] as const) {
    it(`parses cleanly in a real iCalendar parser (${locale})`, () => {
      const { updates, digest } = calendars(locale, TODAY);
      for (const cal of [updates, digest]) {
        const text = buildIcs(cal);
        expect(text.includes('\r\n')).toBe(true);
        expect(text.split('\r\n').every((l) => enc.encode(l).length <= 75)).toBe(true);
        const comp = new ICAL.Component(ICAL.parse(text));
        const events = comp.getAllSubcomponents('vevent').map((v) => new ICAL.Event(v));
        expect(events.length).toBe(cal.events.length);
        expect(new Set(events.map((e) => e.uid)).size).toBe(events.length);
        // Round-trips the localized summary exactly, including commas and CJK text.
        expect(events[0].summary).toBe(cal.events[0].summary);
      }
    });
  }

  it('turns each Express Entry round into one event with a stable id', () => {
    const ev = updateEvents('en', TODAY).find((e) => e.uid === 'ee-round-453@immca');
    expect(ev).toMatchObject({ date: '2026-10-28' });
    expect(ev!.summary).toContain('CRS 477');
  });

  it('warns three days before a program deadline and a day before the CRS change', () => {
    const events = updateEvents('en', TODAY);
    expect(events.find((e) => e.uid.startsWith('deadline-qc-peq-graduates'))).toMatchObject({ date: '2026-10-31', alarmMinutesBefore: 4320 });
    expect(events.find((e) => e.uid.startsWith('crs-rules'))).toMatchObject({ date: '2026-11-03', alarmMinutesBefore: 1440 });
  });

  it('drops deadlines more than 30 days in the past', () => {
    expect(updateEvents('en', '2026-12-15').some((e) => e.uid.startsWith('deadline-qc-peq'))).toBe(false);
  });

  it('writes one timed digest reminder per logged day', () => {
    const digest = digestEvents('zh');
    expect(digest.map((e) => e.date)).toEqual(['2026-10-27', '2026-10-28']);
    expect(digest[1]).toMatchObject({ startUtc: '12:00', alarmMinutesBefore: 0 });
    expect(digest[1].summary).toContain('1');
  });

  it('builds a valid-looking Atom feed with escaped XML', () => {
    const atom = buildAtom('fr', TODAY, 'https://ellensyuu.github.io/IMMCA/feeds/updates-fr.xml');
    expect(atom.startsWith('<?xml')).toBe(true);
    expect(atom).toContain('<entry>');
    expect(atom).not.toMatch(/&(?!amp;|lt;|gt;|quot;)/);
  });
});

describe('updates log', () => {
  it('merges reruns of the same day and drops entries older than 120 days', () => {
    const log = [{ date: '2026-05-01', rounds: [1], changed: [] }, { date: '2026-10-28', rounds: [453], changed: [] }];
    const next = mergeEntry(log, '2026-10-28', [453, 454], ['https://x']);
    expect(next).toEqual([{ date: '2026-10-28', rounds: [453, 454], changed: ['https://x'] }]);
  });
});

describe('calendar subscription links', async () => {
  const { calendarLinks } = await import('../src/feeds/links');
  const https = 'https://ellensyuu.github.io/IMMCA/feeds/updates-zh.ics';
  const links = calendarLinks(https, 'IMMCA · 加拿大移民动态');

  it('uses webcal:// for Apple Calendar and Windows apps', () => {
    expect(links.apple).toBe('webcal://ellensyuu.github.io/IMMCA/feeds/updates-zh.ics');
  });

  it('passes the feed to Google and Outlook as encoded parameters', () => {
    expect(new URL(links.google).searchParams.get('cid')).toBe(links.apple);
    expect(new URL(links.outlook).searchParams.get('url')).toBe(https);
    expect(new URL(links.office365).searchParams.get('name')).toBe('IMMCA · 加拿大移民动态');
  });
});

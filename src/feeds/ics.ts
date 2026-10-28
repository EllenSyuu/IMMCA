/**
 * Minimal iCalendar (RFC 5545) writer for subscription feeds.
 * Handles the details calendar clients are strict about: CRLF line endings,
 * folding lines at 75 octets without splitting a UTF-8 character, and
 * escaping commas, semicolons, backslashes and newlines in text values.
 */

export interface IcsEvent {
  uid: string;
  /** All-day event on this date (YYYY-MM-DD), unless `startUtc` is given. */
  date: string;
  /** Timed event start, as HH:MM in UTC. */
  startUtc?: string;
  durationMinutes?: number;
  summary: string;
  description: string;
  url?: string;
  categories?: string[];
  /** Alarm this many minutes before the start (0 = at the start). */
  alarmMinutesBefore?: number;
}

export interface IcsCalendar {
  name: string;
  description: string;
  /** How often clients should refresh, in hours. */
  refreshHours: number;
  events: IcsEvent[];
}

export function escapeText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Fold a content line to 75 octets per physical line, continuation lines starting with a space. */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  let size = 0;
  let limit = 75;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (size + n > limit) {
      parts.push(current);
      current = '';
      size = 0;
      limit = 74; // continuation lines begin with a space
    }
    current += ch;
    size += n;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

const compactDate = (d: string) => d.replace(/-/g, '');

function nextDay(d: string): string {
  const t = new Date(`${d}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + 1);
  return t.toISOString().slice(0, 10);
}

function eventLines(e: IcsEvent): string[] {
  const lines = ['BEGIN:VEVENT', `UID:${e.uid}`, `DTSTAMP:${compactDate(e.date)}T000000Z`];
  if (e.startUtc) {
    const [h, m] = e.startUtc.split(':');
    const start = new Date(`${e.date}T${h}:${m}:00Z`);
    const end = new Date(start.getTime() + (e.durationMinutes ?? 15) * 60_000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    lines.push(`DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${compactDate(e.date)}`, `DTEND;VALUE=DATE:${compactDate(nextDay(e.date))}`);
  }
  lines.push(`SUMMARY:${escapeText(e.summary)}`, `DESCRIPTION:${escapeText(e.description)}`, 'TRANSP:TRANSPARENT');
  if (e.url) lines.push(`URL:${e.url}`);
  if (e.categories?.length) lines.push(`CATEGORIES:${e.categories.map(escapeText).join(',')}`);
  if (e.alarmMinutesBefore !== undefined) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(e.summary)}`,
      e.alarmMinutesBefore === 0 ? 'TRIGGER:PT0M' : `TRIGGER:-PT${e.alarmMinutesBefore}M`,
      'END:VALARM',
    );
  }
  lines.push('END:VEVENT');
  return lines;
}

export function buildIcs(cal: IcsCalendar): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IMMCA//Canadian immigration updates//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(cal.name)}`,
    `X-WR-CALDESC:${escapeText(cal.description)}`,
    `REFRESH-INTERVAL;VALUE=DURATION:PT${cal.refreshHours}H`,
    `X-PUBLISHED-TTL:PT${cal.refreshHours}H`,
    ...cal.events.flatMap(eventLines),
    'END:VCALENDAR',
  ];
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}

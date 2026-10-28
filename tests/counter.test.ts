import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, handle, stats, type D1Database, type D1PreparedStatement, type Env } from '../counter/src/index';

/** Node's built-in SQLite, shaped like the subset of Cloudflare D1 the worker uses. */
function d1(): { db: D1Database; raw: DatabaseSync } {
  const raw = new DatabaseSync(':memory:');
  raw.exec(readFileSync('counter/schema.sql', 'utf8'));
  const prepare = (sql: string, args: unknown[] = []): D1PreparedStatement => ({
    bind: (...values) => prepare(sql, values),
    run: async () => ({ meta: { changes: Number(raw.prepare(sql).run(...(args as never[])).changes) } }),
    first: async <T,>() => (raw.prepare(sql).get(...(args as never[])) as T) ?? null,
    all: async <T,>() => ({ results: raw.prepare(sql).all(...(args as never[])) as T[], meta: { changes: 0 } }),
  });
  return { db: { prepare: (sql) => prepare(sql) }, raw };
}

const env = (db: D1Database): Env => ({ DB: db, SITE_URL: 'https://ellensyuu.github.io/IMMCA/', SITE_ORIGIN: 'https://ellensyuu.github.io' });
const hit = (body: object, ip = '1.2.3.4', ua = 'Firefox') =>
  new Request('https://counter.example/hit', { method: 'POST', body: JSON.stringify(body), headers: { 'CF-Connecting-IP': ip, 'User-Agent': ua } });

afterEach(() => vi.unstubAllGlobals());

describe('usage counter', () => {
  it('counts views, and each visitor once per day', async () => {
    const { db } = d1();
    for (const ip of ['1.1.1.1', '1.1.1.1', '2.2.2.2']) expect((await handle(hit({ e: 'view', l: 'zh' }, ip), env(db))).status).toBe(204);
    const s = await stats(db);
    expect(s.pageViews).toBe(3);
    expect(s.visits.total).toBe(2);
  });

  it('never stores IP addresses or user agents', async () => {
    const { db, raw } = d1();
    await handle(hit({ e: 'subscribe', l: 'google' }, '203.0.113.9', 'SecretBrowser/1.0'), env(db));
    const dump = JSON.stringify([
      raw.prepare('SELECT * FROM daily_counts').all(),
      raw.prepare('SELECT * FROM daily_seen').all(),
    ]);
    expect(dump).not.toContain('203.0.113.9');
    expect(dump).not.toContain('SecretBrowser');
    expect((await stats(db)).subscriptions).toEqual({ total: 1, byCalendar: { google: 1 } });
  });

  it('rejects unknown kinds and free-text labels', async () => {
    const { db } = d1();
    expect((await handle(hit({ e: 'view', l: 'my name is Ellen' }), env(db))).status).toBe(400);
    expect((await handle(hit({ e: 'feed', l: 'updates-en.ics' }), env(db))).status).toBe(400);
    expect((await handle(new Request('https://c/hit', { method: 'POST', body: 'not json' }), env(db))).status).toBe(400);
    expect((await stats(db)).pageViews).toBe(0);
  });

  it('serves a feed through the counter and counts distinct readers', async () => {
    const { db } = d1();
    vi.stubGlobal('fetch', vi.fn(async () => new Response('BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n')));
    const get = (ip: string) => handle(new Request('https://c/feeds/updates-zh.ics', { headers: { 'CF-Connecting-IP': ip } }), env(db));
    const res = await get('9.9.9.9');
    expect(res.headers.get('content-type')).toContain('text/calendar');
    expect(await res.text()).toContain('BEGIN:VCALENDAR');
    await get('9.9.9.9');
    await get('8.8.8.8');
    expect((await handle(new Request('https://c/feeds/../../etc'), env(db))).status).toBe(404);
    const tomorrow = new Date(Date.now() + 86_400_000);
    expect((await stats(db, tomorrow)).feedReaders.yesterday).toBe(2);
  });

  it('cannot link visitors across days, and forgets yesterday’s hashes', async () => {
    const { db, raw } = d1();
    const { record } = await import('../counter/src/index');
    const req = hit({});
    await record(db, 'view', 'en', req, new Date('2026-10-27T10:00:00Z'));
    await record(db, 'view', 'en', req, new Date('2026-10-28T10:00:00Z'));
    const hashes = raw.prepare('SELECT visitor FROM daily_seen').all() as { visitor: string }[];
    expect(new Set(hashes.map((h) => h.visitor)).size).toBe(2); // same person, different daily salt
    await cleanup(db, new Date('2026-10-29T01:00:00Z'));
    expect(raw.prepare('SELECT COUNT(*) AS n FROM daily_seen').get()).toEqual({ n: 1 });
    expect(raw.prepare('SELECT COUNT(*) AS n FROM salts').get()).toEqual({ n: 1 });
    // Aggregates survive cleanup.
    expect((await stats(db, new Date('2026-10-29T01:00:00Z'))).visits.total).toBe(2);
  });

  it('answers CORS preflight for the site only', async () => {
    const { db } = d1();
    const res = await handle(new Request('https://c/hit', { method: 'OPTIONS' }), env(db));
    expect(res.headers.get('access-control-allow-origin')).toBe('https://ellensyuu.github.io');
  });
});

describe('daily stats collection', async () => {
  // @ts-expect-error — plain ESM script without type declarations
  const { badges, historyRow, validate } = await import('../scripts/collect-stats.mjs');
  const sample = {
    updated: '2026-11-02T12:00:00Z', visits: { total: 1234, last30: 400 }, pageViews: 2000,
    subscriptions: { total: 56, byCalendar: { google: 30, apple: 26 } }, installs: { total: 7, byPlatform: {} },
    feedReaders: { yesterday: 21, peak7: 25 },
  };

  it('turns counter totals into README badges and a history row', () => {
    expect(badges(sample)['badge-visits.json']).toEqual({ schemaVersion: 1, label: 'visits', message: '1,234', color: '12213d' });
    expect(historyRow(sample)).toBe('2026-11-02,1234,400,2000,56,7,21');
  });

  it('refuses a response that is not the counter’s stats', () => {
    expect(() => validate({ hello: 'world' })).toThrow();
    expect(() => validate({ ...sample, visits: { total: -1, last30: 0 } })).toThrow();
  });
});

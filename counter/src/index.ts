/**
 * IMMCA usage counter — a small, open-source Cloudflare Worker.
 *
 *   POST /hit                  record a page view, subscription click or app install
 *   GET  /feeds/<file>         serve a calendar / RSS feed and count distinct readers
 *   GET  /stats.json           public aggregate numbers (shown in the README)
 *   GET  /health               liveness check
 *
 * Privacy: no cookies, no raw IP addresses, nothing typed into the IMMCA form.
 * Unique visitors are counted with SHA-256(daily random salt + IP + user agent);
 * the salt is replaced every UTC day and deleted the next, so hashes from
 * different days cannot be linked and none can be traced back to a person.
 */

// ---- minimal D1 / Workers types, so the worker needs no extra type packages
export interface D1Result<T = Record<string, unknown>> { results?: T[]; meta: { changes: number } }
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}
export interface D1Database { prepare(sql: string): D1PreparedStatement }
export interface Env {
  DB: D1Database;
  /** Where the static site lives, e.g. https://ellensyuu.github.io/IMMCA/ */
  SITE_URL: string;
  /** Origin allowed to send hits, e.g. https://ellensyuu.github.io */
  SITE_ORIGIN: string;
}
interface Ctx { waitUntil(p: Promise<unknown>): void }

export type Kind = 'view' | 'subscribe' | 'install' | 'feed';

/** Only these labels are stored, so the counter can't be used to store arbitrary text. */
export const LABELS: Record<Kind, readonly string[]> = {
  view: ['en', 'fr', 'zh'],
  subscribe: ['apple', 'google', 'outlook', 'office365', 'copy', 'rss'],
  install: ['android', 'ios', 'desktop', 'other'],
  feed: ['updates-en.ics', 'updates-fr.ics', 'updates-zh.ics', 'daily-en.ics', 'daily-fr.ics', 'daily-zh.ics', 'updates-en.xml', 'updates-fr.xml', 'updates-zh.xml'],
};

export const today = (now = new Date()) => now.toISOString().slice(0, 10);
const shiftDay = (day: string, n: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
}

async function saltFor(db: D1Database, day: string): Promise<string> {
  const row = await db.prepare('SELECT salt FROM salts WHERE day = ?').bind(day).first<{ salt: string }>();
  if (row) return row.salt;
  const fresh = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');
  await db.prepare('INSERT OR IGNORE INTO salts (day, salt) VALUES (?, ?)').bind(day, fresh).run();
  const again = await db.prepare('SELECT salt FROM salts WHERE day = ?').bind(day).first<{ salt: string }>();
  return again!.salt;
}

/** Record one event; counts it as unique if this visitor hasn't sent it today. */
export async function record(db: D1Database, kind: Kind, label: string, req: Request, now = new Date()): Promise<void> {
  const day = today(now);
  const ip = req.headers.get('CF-Connecting-IP') ?? req.headers.get('X-Forwarded-For') ?? '';
  const ua = req.headers.get('User-Agent') ?? '';
  const visitor = await sha256(`${await saltFor(db, day)}|${ip}|${ua}`);
  const seen = await db
    .prepare('INSERT OR IGNORE INTO daily_seen (day, kind, label, visitor) VALUES (?, ?, ?, ?)')
    .bind(day, kind, label, visitor)
    .run();
  const isNew = seen.meta.changes > 0 ? 1 : 0;
  await db
    .prepare(`INSERT INTO daily_counts (day, kind, label, total, uniques) VALUES (?, ?, ?, 1, ?)
              ON CONFLICT (day, kind, label) DO UPDATE SET total = total + 1, uniques = uniques + excluded.uniques`)
    .bind(day, kind, label, isNew)
    .run();
}

/** Drop per-visitor hashes and salts older than yesterday. */
export async function cleanup(db: D1Database, now = new Date()): Promise<void> {
  const keepFrom = shiftDay(today(now), -1);
  await db.prepare('DELETE FROM daily_seen WHERE day < ?').bind(keepFrom).run();
  await db.prepare('DELETE FROM salts WHERE day < ?').bind(keepFrom).run();
}

export interface Stats {
  updated: string;
  visits: { total: number; last30: number };
  pageViews: number;
  subscriptions: { total: number; byCalendar: Record<string, number> };
  installs: { total: number; byPlatform: Record<string, number> };
  feedReaders: { yesterday: number; peak7: number };
}

export async function stats(db: D1Database, now = new Date()): Promise<Stats> {
  const day = today(now);
  const sum = async (sql: string, ...args: unknown[]) =>
    (await db.prepare(sql).bind(...args).first<{ n: number | null }>())?.n ?? 0;
  const byLabel = async (kind: Kind) => {
    const rows = (await db.prepare('SELECT label, SUM(uniques) AS n FROM daily_counts WHERE kind = ? GROUP BY label').bind(kind).all<{ label: string; n: number }>()).results ?? [];
    return Object.fromEntries(rows.map((r) => [r.label, r.n]));
  };
  const feedDaily = (await db
    .prepare(`SELECT day, SUM(uniques) AS n FROM daily_counts WHERE kind = 'feed' AND day >= ? AND day < ? GROUP BY day`)
    .bind(shiftDay(day, -7), day)
    .all<{ day: string; n: number }>()).results ?? [];

  return {
    updated: now.toISOString(),
    visits: {
      total: await sum(`SELECT SUM(uniques) AS n FROM daily_counts WHERE kind = 'view'`),
      last30: await sum(`SELECT SUM(uniques) AS n FROM daily_counts WHERE kind = 'view' AND day >= ?`, shiftDay(day, -30)),
    },
    pageViews: await sum(`SELECT SUM(total) AS n FROM daily_counts WHERE kind = 'view'`),
    subscriptions: { total: await sum(`SELECT SUM(uniques) AS n FROM daily_counts WHERE kind = 'subscribe'`), byCalendar: await byLabel('subscribe') },
    installs: { total: await sum(`SELECT SUM(uniques) AS n FROM daily_counts WHERE kind = 'install'`), byPlatform: await byLabel('install') },
    feedReaders: {
      yesterday: feedDaily.find((r) => r.day === shiftDay(day, -1))?.n ?? 0,
      peak7: feedDaily.reduce((m, r) => Math.max(m, r.n), 0),
    },
  };
}

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=300', ...init.headers },
  });

export async function handle(req: Request, env: Env, ctx?: Ctx): Promise<Response> {
  const url = new URL(req.url);
  const cors = { 'access-control-allow-origin': env.SITE_ORIGIN, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type' };

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  if (url.pathname === '/hit' && req.method === 'POST') {
    let body: { e?: string; l?: string } = {};
    try {
      body = JSON.parse(await req.text());
    } catch {
      return new Response('bad request', { status: 400, headers: cors });
    }
    const kind = body.e as Kind;
    const label = body.l ?? '';
    if (!(kind in LABELS) || kind === 'feed' || !LABELS[kind].includes(label)) return new Response('bad request', { status: 400, headers: cors });
    const work = record(env.DB, kind, label, req);
    if (ctx) ctx.waitUntil(work);
    else await work;
    return new Response(null, { status: 204, headers: cors });
  }

  const feed = url.pathname.match(/^\/feeds\/([a-z0-9.-]+)$/);
  if (feed && req.method === 'GET') {
    const file = feed[1];
    if (!LABELS.feed.includes(file)) return new Response('not found', { status: 404 });
    const upstream = await fetch(new URL(`feeds/${file}`, env.SITE_URL).toString(), { headers: { 'user-agent': 'IMMCA counter' } });
    if (!upstream.ok) return new Response('feed unavailable', { status: 502 });
    const work = record(env.DB, 'feed', file, req);
    if (ctx) ctx.waitUntil(work);
    else await work;
    return new Response(await upstream.text(), {
      headers: {
        'content-type': file.endsWith('.ics') ? 'text/calendar; charset=utf-8' : 'application/atom+xml; charset=utf-8',
        'cache-control': 'public, max-age=1800',
        'access-control-allow-origin': '*',
      },
    });
  }

  if (url.pathname === '/stats.json' && req.method === 'GET') return json(await stats(env.DB));
  if (url.pathname === '/health') return json({ ok: true });
  return new Response('not found', { status: 404 });
}

export default {
  fetch: (req: Request, env: Env, ctx: Ctx) => handle(req, env, ctx),
  scheduled: (_event: unknown, env: Env, ctx: Ctx) => ctx.waitUntil(cleanup(env.DB)),
};

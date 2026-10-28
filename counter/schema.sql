-- IMMCA usage counter (Cloudflare D1 / SQLite).
-- Only aggregate daily counts are kept long term. `daily_seen` holds salted,
-- one-day hashes used to count unique visitors; it and `salts` are emptied
-- every day, after which old hashes can no longer be linked to anyone.

CREATE TABLE IF NOT EXISTS daily_counts (
  day     TEXT    NOT NULL,           -- YYYY-MM-DD (UTC)
  kind    TEXT    NOT NULL,           -- view | subscribe | install | feed
  label   TEXT    NOT NULL DEFAULT '',-- e.g. language, calendar app, feed file
  total   INTEGER NOT NULL DEFAULT 0, -- every event
  uniques INTEGER NOT NULL DEFAULT 0, -- distinct visitors that day
  PRIMARY KEY (day, kind, label)
);

CREATE TABLE IF NOT EXISTS daily_seen (
  day     TEXT NOT NULL,
  kind    TEXT NOT NULL,
  label   TEXT NOT NULL,
  visitor TEXT NOT NULL,              -- SHA-256(daily salt + IP + user agent), truncated
  PRIMARY KEY (day, kind, label, visitor)
);

CREATE TABLE IF NOT EXISTS salts (
  day  TEXT PRIMARY KEY,
  salt TEXT NOT NULL
);

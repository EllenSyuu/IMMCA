# Frozen test data

Behaviour tests read these snapshots instead of the live files in `src/data/`,
which the daily workflow rewrites. `vitest.config.ts` points the app's imports of
`draws.json`, `source-status.json` and `updates-log.json` here, so a new round,
a changed official page or a new log entry can never break a test about rules.

- `draws.json`: IRCC rounds and pool distribution as fetched on 2026-10-28
  (latest Canadian Experience Class cutoff: 519).
- `source-status.json`: every monitored page, all marked `unchanged`.
- `updates-log.json`: the log as of 2026-10-28.

The live files are still checked, for shape only, by `tests/live-data.test.ts`.
Refresh a snapshot only on purpose, and update the tests that pin its values.

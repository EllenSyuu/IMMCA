# IMMCA usage counter

A small Cloudflare Worker that counts page views, calendar subscriptions and app installs **without cookies or stored IP addresses** (see [PRIVACY.md](../PRIVACY.md)). It also serves the calendar feeds, so it can count how many calendars read them.

| Endpoint | Purpose |
|---|---|
| `POST /hit` | `{"e": "view" \| "subscribe" \| "install", "l": "<fixed label>"}` |
| `GET /feeds/<file>` | calendar / RSS feed, fetched from the site and counted |
| `GET /stats.json` | public totals, copied into `stats/` daily for the README |
| `GET /health` | liveness check |

Tests run the worker against a real SQLite database: `npx vitest run tests/counter.test.ts`.

## One-time setup (about 10 minutes)

1. Create a free account at [dash.cloudflare.com](https://dash.cloudflare.com/sign-up).
2. **Account ID:** copy it from the dashboard's right sidebar ("Account ID").
3. **API token:** My Profile → API Tokens → Create Token → template **"Edit Cloudflare Workers"**, then add the permission **Account → D1 → Edit**. Create it and copy the token.
4. In GitHub, **IMMCA → Settings → Secrets and variables → Actions**:
   - *Secrets* → New secret `CLOUDFLARE_API_TOKEN` = the token.
   - *Variables* → New variable `CLOUDFLARE_ACCOUNT_ID` = the account ID.
5. **Actions → Deploy counter → Run workflow.** The log ends with the worker's address, e.g. `https://immca-counter.<your-subdomain>.workers.dev`.
6. *Variables* → New variable `COUNTER_URL` = that address (no trailing slash).
7. **Actions → Deploy site → Run workflow.** From now on the site counts visits and serves calendar feeds through the counter, and the daily update copies the totals to the README.

Until steps 4–6 are done, every workflow skips the counter with a warning instead of failing.

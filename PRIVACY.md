# Privacy

IMMCA is built so that nothing you enter about yourself ever leaves your device.

## What stays on your device

Everything you type into the profile — age, studies, test scores, work, job offer, family — is processed in your browser. It is kept only in your browser's local storage so the form survives a reload, and clearing the site's data removes it. It is never sent to IMMCA or anyone else.

## What IMMCA counts

To show how many people use it, IMMCA runs its own small, open-source counter ([`counter/`](counter/)). It receives only these events, each with one fixed label:

| Event | Label (one of) | When |
|---|---|---|
| page view | `en`, `fr`, `zh` (interface language) | once per page load |
| calendar subscription | `apple`, `google`, `outlook`, `office365`, `copy`, `rss` | when you click a subscribe button |
| app install | `ios`, `android`, `desktop`, `other` | once per device, when the app is installed |
| calendar feed fetch | the feed file name | when a calendar app refreshes a subscription |

The counter rejects any other event or label, so it cannot be used to store free text.

**No cookies. No stored IP addresses. No user agents. Nothing from the form.** To count each visitor once per day, the counter computes a one-way hash of the IP address and browser name together with a random value (a *salt*) that changes every day. Only that hash is kept, only until the next day; then the hashes and the salt are deleted. Hashes from different days cannot be linked to each other or traced back to anyone. Long-term, only daily totals are kept (for example: "2026-11-02, page views, zh: 37 views, 30 visitors").

The totals are public: they are copied into [`stats/`](stats/) every day and shown on the README.

## Calendar subscriptions

Calendar apps (Apple Calendar, Google Calendar, Outlook) download the feed periodically from the counter's address. Google Calendar fetches feeds from Google's servers on behalf of all its users, so Google subscribers are counted only approximately.

## Third parties

- The site is hosted on GitHub Pages; GitHub may keep standard server logs ([GitHub privacy statement](https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement)).
- The counter runs on Cloudflare Workers ([Cloudflare privacy policy](https://www.cloudflare.com/privacypolicy/)).
- Fonts are loaded from Google Fonts.

## Without the counter

If the counter is not configured (no `COUNTER_URL`), the site sends nothing at all and the footer does not show the counting notice.

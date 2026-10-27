# Updating a rule

## When the daily monitor flags a page

Every morning the daily workflow checks all official pages. When one changes it opens an issue labelled `source-change`, and the site shows *Official page changed* on every program that cites it.

1. Open the latest `data: daily update` commit and read the diff under `monitor/snapshots/` — it is the page's text before and after.
2. If a rule changed, edit the program spec (steps below). If the change is cosmetic, nothing to edit.
3. Run `npm run sources:accept -- <url>` (or `-- all`) to accept the new text as the baseline, commit, and close the issue.

## Changing a rule

Immigration programs change often. Keeping IMMCA correct matters more than adding programs, so every change follows the same steps.

1. **Find the official source.** Use the government page itself (canada.ca, quebec.ca, the province's immigration site, the Gazette). News sites and consultants are fine for discovering a change, never as the source of a rule.
2. **Edit the program spec** in `src/data/programs/<file>.ts`. Change the criteria, `status` (`open`, `invitation-only`, `intake-windows`, `paused`, `closed`) and, for a fixed deadline, `closesOn`.
3. **Update `sources`** with the URL you checked and today's date in `verified`. If the change affects every program's verification date, update `VERIFIED` in `shared.ts`.
4. **Write the note in all three languages** (`notes` / `summary` take `{ en, fr, zh }`). New requirement wording goes in `src/i18n/en.ts`, `fr.ts` and `zh.ts`; the test suite fails if a key or placeholder is missing in any language.
5. **Record the evidence** in `docs/research/`, including anything you could not confirm.
6. **Add or adjust a test** in `tests/` that pins the new behaviour (a threshold, a date, a closed stream).
7. `npm test && npm run build` before opening a pull request.

## Ground rules

- Never commit anyone's personal profile, screenshots of real applications or test results.
- When two official pages disagree, keep the stricter reading and say so in a note.
- Prefer a `note(...)` station ("can't check here") over inventing a rule the source doesn't state.

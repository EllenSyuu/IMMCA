# Research log

Every rule in `src/data/programs/` was checked against official government pages on **2026-10-27**. These notes are the evidence behind each program spec: what the official source says, recent invitation data, and — just as important — what could not be verified.

| File | Covers |
|---|---|
| [federal.md](federal.md) | Express Entry (FSW grid, CEC, FST, proof of funds), the full CRS grid and the 2026-11-03 Labour Market Integration factor, high-wage occupation tiers, CLB/NCLC conversion tables, 2026 categories, recent rounds, PGWP, spousal permits, AIP, RCIP, FCIP, levels plan |
| [quebec.md](quebec.md) | PSTQ streams and the Arrima points grid, 2026 invitation rounds, the PEQ abolition and 2026 reopening, ended pilots, French test equivalences, CAQ caps, the 2026 Québec plan |
| [provinces-east.md](provinces-east.md) | Ontario, New Brunswick, Nova Scotia, Prince Edward Island, Newfoundland and Labrador |
| [provinces-west.md](provinces-west.md) | British Columbia, Alberta, Saskatchewan, Manitoba, Yukon, Northwest Territories, Nunavut |

## Conventions

- Items marked **[secondary]** come from news or consultancy sites, used only where the official page could not be read. They are flagged in the program's notes in the app.
- Items marked **[UNVERIFIED]** are open questions. The screener does not invent a rule for them: it shows a "can't check here" station or a plain-language caveat.
- Proposed reforms that are not in force (for example the October 2026 Express Entry consultation report) are recorded but deliberately not implemented.

## Audit

On 2026-10-27 every program spec was checked against these notes by an independent reviewer. The corrections (FST trade groups, the FSW grid inside Express Entry eligibility, the CEC language window, the PEQ workers snapshot, Canadian-education CRS points, TEF's Express Entry scale, TEER-dependent language minimums, Ontario's TEER 4–5 rules, AIP/RCIP TEER matching, two missing 2026 categories and several wording fixes) are covered by `tests/audit.test.ts`.

## Known open questions (as of 2026-10-27)

- High-wage tier mapping on IRCC's page (labels sit between tables); implemented as 31 / 89 / 66 codes at 2.0× / 1.5× / 1.3× and to be re-checked visually.
- Ontario Workforce Priority: no invitation rounds or cutoffs published yet.
- Québec PEQ workers stream: the reopening notice and the stream page disagree on whether a Québec diploma is needed.
- Prince Edward Island: detailed Labour Impact thresholds were not readable on the official site.
- Manitoba: draw details for rounds 279–282 come from secondary reports.
- TEF Canada tests taken between 2019-10-01 and 2023-12-10 used a single band table for all skills; the app currently offers the post-2023 /699 scale and the Express Entry “ancien score” scale.
- Saskatchewan Tech Talent's 32 eligible occupations are approximated by NOC broad category 2.

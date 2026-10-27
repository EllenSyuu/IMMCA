# Canadian federal economic immigration: rules research for eligibility screener

- **Verified date for every section:** 2026-10-27
- **Method:** Each rule was fetched on 2026-10-27 from canada.ca (IRCC) or laws-lois.justice.gc.ca. Only one item uses a non-government source, and it is labelled where it appears. The fetch tool summarises pages, so it may paraphrase. Numeric tables were cross-checked between two fetches or two official pages wherever possible.
- **Biggest timing caveat:** **On 2026-11-03 (7 days after the verification date), the CRS changes.** A new "Labour Market Integration" factor arrives, job-offer points return for high-wage occupations only, and LMIAs are no longer required for job offers. IRCC will **pause invitation rounds for up to 2 weeks** while it recalculates profiles. A screener should implement both rule sets, switched by date (see §2B).

---

## 0. Cross-cutting definitions (for a machine-checkable engine)

- **Skilled work:** NOC 2021 TEER 0, 1, 2 or 3.
- **"1 year" of work:** 1,560 hours. That is 30 h/week × 52 weeks. Hours above 30/week are not counted. Part-time hours can add up to the total.
- **Paid only:** Work must be paid by wages or commission. Volunteer work and unpaid internships are excluded.
- **Language tests:** Results must be less than 2 years old, both when the profile is created and when the PR application is submitted.
- **Approved tests (Express Entry):**
  - English: CELPIP-General, IELTS General Training (One Skill Retake not accepted), PTE Core.
  - French: TEF Canada, TCF Canada.
- **ECA:** Required for foreign education. It must come from a designated organisation, be less than 5 years old and be issued for immigration purposes. Five general designated bodies: WES, ICAS, IQAS, CES (U of T), ICES. Specialised bodies: MCC for physicians, PEBC for pharmacists, CACB for architects. (Source: AIP ECA page, 2026-06-22. Express Entry uses the same designated list.)

---

## 1. Express Entry programs

### 1.1 Federal Skilled Worker Program (FSW)

- **id:** `ee_fsw`
- **Official name:** Federal Skilled Worker Program. FR: *Programme des travailleurs qualifiés (fédéral)*. The FR name was not fetched today.
- **Status:** Open. Candidates enter the Express Entry pool. Since 2025, general draws have mostly been CEC, PNP and category draws; see §4.
- **Minimum eligibility:**
  - **Work:** At least 1 year of continuous work or 1,560 hours total.
    - It must be in one TEER 0–3 occupation, the "primary occupation" with the same NOC.
    - It must fall within the last 10 years and can be in Canada or abroad.
    - It must be paid.
    - Work done while studying counts only if it was paid, continuous (no gaps) and meets the other rules.
    - Self-employment is not mentioned under minimum requirements. It is mentioned only under selection factors. *Uncertainty:* the treatment of self-employment for the FSW minimum is not explicit on the page.
  - **Language:** CLB/NCLC 7 in all 4 abilities in the first official language.
  - **Education:**
    - Canadian credential: secondary or post-secondary, OR
    - Foreign completed credential plus ECA.
  - **Selection grid:** At least 67/100 (table below).
  - **Proof of funds:** Required (table in §1.4). Exempt if the applicant is currently authorised to work in Canada AND has a valid job offer.
  - **Location and admissibility:** Must intend to live outside Quebec. Must be admissible.
  - **Job offer:** Not required. It is worth 10 grid points (arranged employment).
- **Change on 2026-11-03:** Under a temporary public policy, candidates invited on or after 2026-11-03 are exempt from LMIA and LMIA-exemption requirements for job offers used to establish FSW or FST eligibility. For FSW and FST, qualifying offers can be in any TEER 0–3 job; they do **not** have to be high-wage.
  - The FSW page itself (modified 2026-10-16) still shows the old 4 "situations" based on LMIAs. Sources: the news release and the changes page.

#### FSW 67-point selection grid (max 100)

Sources: the FSW page (2026-10-16) for every factor except education. Education comes from IRPR s.78(1) (current to 2026-09-30).

**Language (max 28)**

| First official language, per ability (×4, max 24) | Points |
|---|---|
| CLB 9+ | 6 |
| CLB 8 | 5 |
| CLB 7 | 4 |
| < CLB 7 | ineligible |

Second official language: at least CLB 5 in all 4 abilities = **4 points**. Otherwise 0.

**Education (max 25), IRPR s.78(1)**

| Credential | Points |
|---|---|
| Secondary school | 5 |
| 1-year post-secondary | 15 |
| 2-year post-secondary | 19 |
| Post-secondary of 3+ years | 21 |
| 2+ post-secondary credentials, one of them 3+ years | 22 |
| Master's or entry-to-practice professional degree (TEER 1, licensed) | 23 |
| Doctoral | 25 |

Points are not summed across credentials (except row e). The highest-scoring credential counts.

**Skilled work experience (max 15)**

| Years | Points |
|---|---|
| 1 | 9 |
| 2–3 | 11 |
| 4–5 | 13 |
| 6+ | 15 |

**Age (max 12)**

| Age | Points |
|---|---|
| <18 | 0 |
| 18–35 | 12 |
| 36 | 11 |
| 37 | 10 |
| 38 | 9 |
| 39 | 8 |
| 40 | 7 |
| 41 | 6 |
| 42 | 5 |
| 43 | 4 |
| 44 | 3 |
| 45 | 2 |
| 46 | 1 |
| 47+ | 0 |

**Arranged employment (10 points)**

The offer must be:
- continuous, paid, full-time (at least 30 h/week);
- non-seasonal;
- for at least 1 year;
- in TEER 0–3;
- for a job the applicant is able to do and, if regulated, licensed for.

It must also fit one of these LMIA-related situations:
- **S1:** Working in Canada on an LMIA-based permit with that employer.
- **S2:** In an LMIA-exempt job (international agreement, significant benefit or federal–provincial agreement), with at least 1 year with the current employer.
- **S3:** No permit, but the employer has an LMIA.
- **S4:** In an LMIA-exempt job not covered by S2, and a different employer has an LMIA.

*From 2026-11-03 the LMIA conditions are lifted by public policy (see above). The grid page has not been updated yet.*

**Adaptability (max 10 combined)**

| Element | Points |
|---|---|
| Spouse's language at CLB 4+ in all 4 abilities | 5 |
| Your past study in Canada (at least 2 academic years full-time, at least 15 h/week) | 5 |
| Spouse's past study in Canada | 5 |
| Your past work in Canada (at least 1 year full-time, TEER 0–3, authorised) | 10 |
| Spouse's past work in Canada (at least 1 year full-time) | 5 |
| Arranged employment (if points were scored above) | 5 |
| Relative in Canada (yours or spouse's: parent, grandparent, child, grandchild, sibling, aunt/uncle, niece/nephew; 18+, citizen or PR) | 5 |

**Pass mark:** 67/100.

- **Official URLs:**
  - https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html
  - https://laws-lois.justice.gc.ca/eng/regulations/SOR-2002-227/section-78.html
- **Uncertainties:**
  - The FSW grid page has not yet been updated for the LMIA removal on 2026-11-03.
  - Self-employment under the FSW minimum is not explicit.

### 1.2 Canadian Experience Class (CEC)

- **id:** `ee_cec`
- **Official name:** Canadian Experience Class. FR: *Catégorie de l'expérience canadienne*.
- **Status:** Open. Recent CEC draws are in §4.
- **Eligibility:**
  - **Work:** At least 1 year or 1,560 hours of paid **Canadian** work in TEER 0–3 within the **3 years before applying**.
    - It can be spread across several jobs or NOCs.
    - It must have been done while authorised as a temporary resident. Quebec work counts.
    - Remote work counts only if the person was physically in Canada working for a Canadian employer.
    - **Excluded:**
      - work during full-time studies, including co-op terms;
      - self-employment (except certain physicians under a temporary public policy);
      - volunteer work or unpaid internships;
      - unauthorised work.
  - **Language (all 4 abilities):**
    - TEER 0 or 1: CLB/NCLC 7.
    - TEER 2 or 3: CLB/NCLC 5.
  - **Education:** None required. It earns CRS points.
  - **Proof of funds:** Not required.
  - **Location:** Must intend to live outside Quebec.
- **URL:** https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/canadian-experience-class.html (modified 2026-10-16)
- **Uncertainties:** When a candidate has mixed TEER experience, the language level follows the TEER of the qualifying experience. The page does not state an explicit tie rule.

### 1.3 Federal Skilled Trades Program (FST)

- **id:** `ee_fst`
- **Official name:** Federal Skilled Trades Program. FR: *Programme des travailleurs de métiers spécialisés (fédéral)*.
- **Status:** Open. Trades category draws are listed in §4.
- **Eligibility:**
  - **Work:** At least 2 years full-time, or 3,120 hours, in a skilled trade within the **5 years before applying**.
    - All of it must be in the same NOC.
    - Eligible NOC groups:
      - Major Groups 72 (excluding Sub-Major Group 726), 73, 82, 83, 92 and 93 (excluding Sub-Major Group 932);
      - Minor Group 6320;
      - Unit Group 62200.
    - Paid. Hours above 30/week are not counted. Work done while studying does not count.
    - It must have been done where the person was qualified to practise the trade.
  - **Language:**
    - Speaking and listening: CLB 5.
    - Reading and writing: CLB 4.
  - **Job offer or certificate:** One of the following:
    - a valid full-time job offer totalling at least 1 year, OR
    - a Canadian certificate of qualification (provincial, territorial or federal).
  - **Proof of funds:** Required unless the person is authorised to work AND has a valid offer.
  - **Education:** None required.
  - **Location:** Outside Quebec.
  - From 2026-11-03, an LMIA is not needed for the FST job offer (public policy).
- **URL:** https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-trades.html (2026-10-16)
- **Uncertainties:** None material.

### 1.4 Proof of funds (FSW and FST)

| Family members | CAD |
|---|---|
| 1 | 15,263 |
| 2 | 19,001 |
| 3 | 23,360 |
| 4 | 28,362 |
| 5 | 32,168 |
| 6 | 36,280 |
| 7 | 40,392 |
| Each additional | +4,112 |

- **Effective date:** These amounts are labelled **"Updated July 7, 2025"**. The deadline to update a profile was 2025-07-28.
- **Basis:** 50% of LICO, updated yearly.
- **Exemptions:** CEC; and FSW/FST applicants who are authorised to work in Canada AND hold a valid job offer.
- **URL:** https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html (page modified 2026-10-16)
- **Uncertainty:** **No 2026 update has been published.** The page still shows the July 2025 amounts even though it was modified in October 2026. The usual annual update did not appear for 2026, or at least is not shown on the page.

### 1.5 Language minimums summary

| Program | Minimum |
|---|---|
| FSW | CLB 7 in all 4 abilities. Second language: CLB 5 for 4 grid points. |
| CEC | TEER 0/1: CLB 7. TEER 2/3: CLB 5. All 4 abilities. |
| FST | Speaking/listening CLB 5. Reading/writing CLB 4. |

Source: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-test.html (2026-10-16)

---

## 2. Comprehensive Ranking System (CRS)

### 2A. CRS in force today, until 2026-11-02

Source: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html (modified 2026-10-16). Two fetches of the page agreed.

The CRS has a maximum of **1,200** points: core 500 (or 460 + 40 spouse factors), skill transferability 100, additional 600.

A candidate is scored as **without spouse** if:
- the spouse is not accompanying, OR
- the spouse is a Canadian citizen or PR.

#### A. Core / human capital (max 460 with spouse, 500 without)

**Age**

| Age | With spouse | Without spouse |
|---|---|---|
| ≤17 | 0 | 0 |
| 18 | 90 | 99 |
| 19 | 95 | 105 |
| 20–29 | 100 | 110 |
| 30 | 95 | 105 |
| 31 | 90 | 99 |
| 32 | 85 | 94 |
| 33 | 80 | 88 |
| 34 | 75 | 83 |
| 35 | 70 | 77 |
| 36 | 65 | 72 |
| 37 | 60 | 66 |
| 38 | 55 | 61 |
| 39 | 50 | 55 |
| 40 | 45 | 50 |
| 41 | 35 | 39 |
| 42 | 25 | 28 |
| 43 | 15 | 17 |
| 44 | 5 | 6 |
| ≥45 | 0 | 0 |

**Education**

| Level | With spouse | Without spouse |
|---|---|---|
| Less than secondary | 0 | 0 |
| Secondary diploma | 28 | 30 |
| 1-year post-secondary | 84 | 90 |
| 2-year post-secondary | 91 | 98 |
| Bachelor's or 3+ year program | 112 | 120 |
| 2+ credentials, one 3+ years | 119 | 128 |
| Master's or professional degree (licensed) | 126 | 135 |
| Doctoral (PhD) | 140 | 150 |

**First official language, per ability** (R, W, L, S). Max 128 with spouse, 136 without.

| CLB | With spouse | Without spouse |
|---|---|---|
| <4 | 0 | 0 |
| 4–5 | 6 | 6 |
| 6 | 8 | 9 |
| 7 | 16 | 17 |
| 8 | 22 | 23 |
| 9 | 29 | 31 |
| ≥10 | 32 | 34 |

**Second official language, per ability.** Max 22 with spouse, 24 without.

| CLB | With spouse | Without spouse |
|---|---|---|
| ≤4 | 0 | 0 |
| 5–6 | 1 | 1 |
| 7–8 | 3 | 3 |
| ≥9 | 6 | 6 |

The cap applies to the total: with spouse, 4 × 6 = 24 is capped at 22.

**Canadian work experience** (TEER 0–3, in Canada, authorised)

| Years | With spouse | Without spouse |
|---|---|---|
| <1 | 0 | 0 |
| 1 | 35 | 40 |
| 2 | 46 | 53 |
| 3 | 56 | 64 |
| 4 | 63 | 72 |
| ≥5 | 70 | 80 |

#### B. Spouse factors (max 40)

| Spouse education | Points |
|---|---|
| Less than secondary | 0 |
| Secondary | 2 |
| 1-year | 6 |
| 2-year | 7 |
| Bachelor's or 3+ year | 8 |
| 2+ credentials (one 3+ years) | 9 |
| Master's or professional | 10 |
| PhD | 10 |

| Spouse first official language, per ability (max 5 each, 20 total) | Points |
|---|---|
| CLB ≤4 | 0 |
| CLB 5–6 | 1 |
| CLB 7–8 | 3 |
| CLB ≥9 | 5 |

| Spouse Canadian work experience | Points |
|---|---|
| <1 year | 0 |
| 1 | 5 |
| 2 | 7 |
| 3 | 8 |
| 4 | 9 |
| ≥5 | 10 |

#### C. Skill transferability (max 100 total)

There are two groups, each capped at 50:
- **Education group** = (education + language) + (education + Canadian work experience), capped at 50.
- **Foreign work group** = (foreign work + language) + (foreign work + Canadian work experience), capped at 50.

The certificate of qualification adds up to 50 more. The overall section is capped at 100.

*The official page states "each combination capped at 50, total 100". The grouping rule above is the long-standing IRCC implementation, and the page's summary table structure (Education max 50, Foreign work experience max 50, Certificate max 50) is consistent with it.*

**Education + first official language**

| Education | CLB 7+ in all, with at least one ability <9 | CLB 9+ in all 4 |
|---|---|---|
| Secondary or less | 0 | 0 |
| Post-secondary, 1+ year | 13 | 25 |
| 2+ credentials (one 3+ years) | 25 | 50 |
| Master's or entry-to-practice professional | 25 | 50 |
| Doctoral | 25 | 50 |

**Education + Canadian work experience**

| Education | 1 year Canadian work experience | 2+ years Canadian work experience |
|---|---|---|
| Secondary or less | 0 | 0 |
| Post-secondary, 1+ year | 13 | 25 |
| 2+ credentials (one 3+ years) | 25 | 50 |
| Master's or professional | 25 | 50 |
| Doctoral | 25 | 50 |

Note: a bachelor's degree alone falls under "post-secondary 1+ year", so it scores 13 or 25.

**Foreign work experience + first official language**

| Foreign work experience | CLB 7+ (at least one <9) | CLB 9+ in all 4 |
|---|---|---|
| None | 0 | 0 |
| 1–2 years | 13 | 25 |
| 3+ years | 25 | 50 |

**Foreign work experience + Canadian work experience**

| Foreign work experience | 1 year Canadian | 2+ years Canadian |
|---|---|---|
| None | 0 | 0 |
| 1–2 years | 13 | 25 |
| 3+ years | 25 | 50 |

**Certificate of qualification (trades) + language**

| | CLB 5+ in all, with at least one <7 | CLB 7+ in all 4 |
|---|---|---|
| Certificate of qualification | 25 | 50 |

#### D. Additional points (max 600)

| Factor | Points |
|---|---|
| Provincial/territorial nomination | 600 |
| Sibling in Canada (18+, citizen or PR; candidate's or spouse's) | 15 |
| French: NCLC 7+ in all 4 AND (English CLB ≤4 or no English test) | 25 |
| French: NCLC 7+ in all 4 AND English CLB 5+ in all 4 | 50 |
| Canadian post-secondary credential, 1–2 years | 15 |
| Canadian post-secondary credential, 3+ years, master's, professional or PhD | 30 |
| **Job offer (arranged employment)** | **0. Repealed 2025-03-25. Returns in a new form on 2026-11-03 (see 2B).** |

Rules for Canadian education points, from the Ministerial Instructions (MI) s.30:
- Secondary credentials earn 0.
- Study in Canada must have been at least 8 months full-time with at least 8 months of physical presence.
- These requirements were waived for programs taken between 2020-03-01 and 2022-08-31.
- Distance learning is otherwise excluded.

French points (MI s.32) lapse when the test result is 2 or more years old.

- **Sources:**
  - CRS page above.
  - Ministerial Instructions (current): https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-application-management-system/current.html. Instrument signed 2025-03-11; repeal of s.29(1) and s.8(1)(d)(ii) effective 2025-03-25.

### 2B. CRS changes effective 2026-11-03 (announced 2026-10-16)

Sources:
- https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/changes.html (2026-10-16)
- https://www.canada.ca/en/immigration-refugees-citizenship/news/2026/10/changes-to-express-entry-for-high-wage-occupations.html
- https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/high-wage.html

**New "Labour Market Integration" (LMI) factor, max 150 without spouse or 140 with spouse**

- It **replaces** the "Canadian work experience" row in core factor A. *Inference:* the maxima of 140/150 = 70/80 for length + 70 for high-wage, so it must sit where the work-experience row was. Strictly, the page says only "new in the CRS".
- The candidate gets **EITHER** option 1 or option 2, whichever is higher, never both.

**Option 1: Canadian work experience** = length points (the existing table in 2A, 0–70 or 0–80) + high-wage bonus.

The high-wage bonus requires at least 12 months (1,560 h) of Canadian experience in high-wage NOCs:
- The months can be non-continuous, combined across jobs, and part-time equivalent.
- Concurrent jobs count only up to 30 h/week.
- Experience generally has to be within the last 10 years and in TEER 0–3 (per the news release).

| High-wage Canadian experience (at least 12 months) | Bonus |
|---|---|
| NOC(s) at ≥2.0× the average median wage | 70 |
| Combined NOCs at ≥1.5× | 40 |
| Combined NOCs at ≥1.3× | 20 |
| <12 months | 0 |

**Option 2: Qualifying job offer.**
- It must be valid under Express Entry rules, generally full-time, continuous, and at least 1 year after PR.
- It must be in a high-wage NOC.
- **No LMIA is needed.** Holding an LMIA gives no extra points.

| Job offer NOC tier | Points |
|---|---|
| ≥2.0× | 100 |
| ≥1.5× and <2.0× | 70 |
| ≥1.3× and <1.5× | 50 |
| Not high-wage | 0 |

The changes page also has a summary table saying a "qualifying job offer = 100". That is the maximum, not a flat value.

**Unchanged on 2026-11-03:**
- Skill transferability still uses Canadian work experience **length** only, not high-wage status.
- All other factors are unchanged.

**How tiers are assigned:**
- A tier is based on the **NOC's** national median wage relative to the average median wage of the workforce. It is **not** based on the individual's salary.
- Each NOC gets the highest tier it reached in the last 3 years of data (2023–2025). The data sources are Job Bank, the LFS and the Census.
- The tier in effect on the date of the ITA is locked in.
- The list has 186 NOCs.

**High-wage list as extracted on 2026-10-27**

The page puts tier labels as plain paragraphs between three tables. The extracted order was:

```
[table 1: 31 codes] "≥2×" label [table 2: 89 codes] "≥1.5× <2×" label [table 3: 66 codes] "≥1.3× <1.5×" label
```

So the labels appear to sit **after** their tables. One third-party reading, gofarglobal.com (non-official), confirms that interpretation: 31 codes at 2×, 89 at 1.5×, 66 at 1.3×. That is consistent with physicians and senior managers in the top tier and industrial electricians in the 1.3× tier. **This mapping must be verified visually on the live page before shipping.**

- **Tier 2.0× (table 1, 31):** 00011, 00012, 00013, 10010, 10011, 10012, 10020, 10021, 20010, 20011, 20012, 21330, 21332, 31100, 31101, 31102, 31103, 31302, 31303, 40010, 40011, 40012, 40019, 40040, 40041, 41100, 41101, 41200, 60010, 80010, 90011
- **Tier 1.5× (table 2, 89):** 00014, 00015, 10019, 10022, 10029, 10030, 11103, 11201, 21100, 21102, 21103, 21109, 21111, 21120, 21202, 21210, 21211, 21220, 21221, 21222, 21223, 21230, 21231, 21232, 21300, 21301, 21310, 21311, 21320, 21321, 21322, 21331, 21390, 21399, 22231, 22312, 30010, 31110, 31112, 31120, 31200, 31202, 31203, 31300, 31301, 32111, 40020, 40021, 40030, 40042, 41210, 41220, 41221, 41310, 41311, 41320, 41401, 41402, 41404, 41407, 42100, 42101, 50010, 50011, 51100, 70010, 70012, 70020, 70021, 72011, 72012, 72023, 72103, 72202, 72203, 72301, 72406, 72600, 72601, 72604, 73310, 82020, 82021, 83101, 90010, 92011, 92100, 93100, 93101
- **Tier 1.3× (table 3, 66):** 00010, 11100, 11101, 11102, 11109, 11200, 12201, 12203, 21101, 21110, 21112, 21200, 21201, 21203, 21234, 22214, 22232, 22233, 22310, 22313, 31121, 32102, 32103, 32120, 32121, 32122, 41300, 41400, 41403, 41405, 41409, 43201, 43203, 50012, 51101, 51102, 51111, 51112, 51120, 52112, 60020, 60031, 60040, 72010, 72013, 72014, 72020, 72021, 72102, 72105, 72201, 72302, 72320, 72321, 72401, 72403, 72404, 72500, 72602, 72603, 73311, 82010, 83100, 83120, 92010, 93102

**Operational notes:**
- Invitation rounds will pause for up to 2 weeks after 2026-11-03.
- Until the IRCC system is updated, candidates with a non-LMIA offer must answer "Yes" to the LMIA question and enter LMIA number 00000, issued 2026-01-01, expiring 2029-01-01.
- Officers will assess whether each offer is genuine: the employer is active, the need is genuine, the employer complies with employment and recruitment laws, and the candidate is qualified and likely to accept.
- **Uncertainties:**
  - The tier-to-table mapping, as above.
  - The exact placement of the LMI factor inside sections A–D is not stated.
  - The physician and trades special rules mentioned in the news release are not detailed.
  - Wage thresholds are expressed only as multiples of the average median; no dollar figures are given.

### 2C. Proposed further reforms, NOT in force (consultation report, 2026-10-15)

These are still under consideration, with no dates set. They would require amendments to the IRPR and the MI, published in Canada Gazette Part I:
- merge FSW, CEC and FST into one program;
- new minimums of CLB 6 and a high-school credential;
- reduce age points;
- limit Canadian study points to bachelor's, master's and PhD;
- limit the certificate of qualification to Red Seal trades;
- **remove sibling points**;
- **remove the spouse grid**.

A screener should **not** implement these. It should watch for them instead.

URL: https://www.canada.ca/en/immigration-refugees-citizenship/corporate/transparency/consultations/2026-consultations-express-entry-reforms-report.html

### 2D. Official CLB/NCLC conversion tables

Sources:
- IRCC "Language test equivalency charts": https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/standard-requirements/language-requirements/test-equivalency-charts.html
- Cross-checked against the Express Entry language page (2026-10-16) and the PGWP language page (2026-05-27). All three agree for CELPIP, IELTS, PTE Core and TCF.

**The TEF needs special care; see the note below the TEF tables.**

**CELPIP-General** (score = CLB, per ability)

| CLB | Reading | Writing | Listening | Speaking |
|---|---|---|---|---|
| 10 | 10–12 | 10–12 | 10–12 | 10–12 |
| 9 | 9 | 9 | 9 | 9 |
| 8 | 8 | 8 | 8 | 8 |
| 7 | 7 | 7 | 7 | 7 |
| 6 | 6 | 6 | 6 | 6 |
| 5 | 5 | 5 | 5 | 5 |
| 4 | 4 | 4 | 4 | 4 |

**IELTS General Training**

| CLB | Reading | Writing | Listening | Speaking |
|---|---|---|---|---|
| 10 | 8.0–9.0 | 7.5–9.0 | 8.5–9.0 | 7.5–9.0 |
| 9 | 7.0 | 7.0 | 8.0 | 7.0 |
| 8 | 6.5 | 6.5 | 7.5 | 6.5 |
| 7 | 6.0 | 6.0 | 6.0–7.0 | 6.0 |
| 6 | 5.0–5.5 | 5.5 | 5.5 | 5.5 |
| 5 | 4.0–4.5 | 5.0 | 5.0 | 5.0 |
| 4 | 3.5 | 4.0–4.5 | 4.5 | 4.0–4.5 |

The official table lists only the lower bound of each band. The ranges shown here fill in the gaps, for example Listening 6.0–7.0 = CLB 7.

**PTE Core**

| CLB | Reading | Writing | Listening | Speaking |
|---|---|---|---|---|
| 10 | 88–90 | 90 | 89–90 | 89–90 |
| 9 | 78–87 | 88–89 | 82–88 | 84–88 |
| 8 | 69–77 | 79–87 | 71–81 | 76–83 |
| 7 | 60–68 | 69–78 | 60–70 | 68–75 |
| 6 | 51–59 | 60–68 | 50–59 | 59–67 |
| 5 | 42–50 | 51–59 | 39–49 | 51–58 |
| 4 | 33–41 | 41–50 | 28–38 | 42–50 |
| 3 | 24–32 | 32–40 | 18–27 | 34–41 |

**TCF Canada** (no date ranges)

| NCLC | Reading | Writing | Listening | Speaking |
|---|---|---|---|---|
| 10 | 549–699 | 16–20 | 549–699 | 16–20 |
| 9 | 524–548 | 14–15 | 523–548 | 14–15 |
| 8 | 499–523 | 12–13 | 503–522 | 12–13 |
| 7 | 453–498 | 10–11 | 458–502 | 10–11 |
| 6 | 406–452 | 7–9 | 398–457 | 7–9 |
| 5 | 375–405 | 6 | 369–397 | 6 |
| 4 | 342–374 | 4–5 | 331–368 | 4–5 |

**TEF Canada: Express Entry uses the "Équivalence ancien score" scale.** These are the old score ranges; the attestation reports them in its "Équivalence ancien score" column. IRCC says the "Score / 699" column is **not** compatible with the Express Entry profile.

| NCLC | Reading | Writing | Listening | Speaking |
|---|---|---|---|---|
| 10 | 263–300 | 393–450 | 316–360 | 393–450 |
| 9 | 248–262 | 371–392 | 298–315 | 371–392 |
| 8 | 233–247 | 349–370 | 280–297 | 349–370 |
| 7 | 207–232 | 310–348 | 249–279 | 310–348 |
| 6 | 181–206 | 271–309 | 217–248 | 271–309 |
| 5 | 151–180 | 226–270 | 181–216 | 226–270 |
| 4 | 121–150 | 181–225 | 145–180 | 181–225 |

**TEF Canada: /699 scale** (used by non-Express Entry programs such as the PGWP and citizenship)

Tests taken **after 2023-12-10**:

| NCLC | Reading | Writing | Listening | Speaking |
|---|---|---|---|---|
| 10 | 546–699 | 558–699 | 546–699 | 556–699 |
| 9 | 503–545 | 512–557 | 503–545 | 518–555 |
| 8 | 462–502 | 472–511 | 462–502 | 494–517 |
| 7 | 434–461 | 428–471 | 434–461 | 456–493 |
| 6 | 393–433 | 379–427 | 393–433 | 422–455 |
| 5 | 352–392 | 330–378 | 352–392 | 387–421 |
| 4 | 306–351 | 268–329 | 306–351 | 328–386 |

Tests taken **2019-10-01 to 2023-12-10**: every skill uses the same bands.

| NCLC | All four skills |
|---|---|
| 10 | 566–699 |
| 9 | 533–565 |
| 8 | 500–532 |
| 7 | 450–499 |
| 6 | 400–449 |
| 5 | 350–399 |
| 4 | 300–349 |

**Uncertainty:**
- The Express Entry language page shows the TEF ancien-score grid in a merged form, with "9 and above" at 371+/298+/248+/371+ (that is, NCLC 9 and 10 merged for FSW grid purposes).
- The CRS distinguishes NCLC 9 from NCLC 10, so use the full ancien table above.
- That page also notes a grid for tests taken 2023-12-11 to 2024-05-06 that was "reverted".

---

## 3. Express Entry category-based selection (2026 categories)

- **id:** `ee_category_*`
- **Status:** In force for 2026. The 2026 categories were announced on 2026-02-18.
- **Source:** https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html (modified 2026-10-16). Announcement: https://www.canada.ca/en/immigration-refugees-citizenship/news/2026/02/canada-prioritizes-top-talent-in-2026-immigration-express-entry-categories.html

**Requirements for every category:**
- be in the pool;
- be eligible for FSW, CEC or FST;
- meet that round's ministerial instructions.

**Standard occupational rule** (healthcare, STEM, trades, education, transport):
- at least 12 months of full-time work (or part-time equivalent) within the past 3 years;
- it does not need to be continuous;
- it must be in a **single** listed occupation, regardless of the candidate's primary occupation;
- it can be **in Canada or abroad**.

**"…with Canadian work experience" categories** (physicians, senior managers, researchers): the same rule, but the experience must be **in Canada only**.

**No agriculture/agri-food category in 2026.** It is absent from the list.

| Category id | Name (exact) | Rule | NOC 2021 codes |
|---|---|---|---|
| `french` | French-language proficiency | NCLC 7+ in all 4 abilities | none |
| `health` | Healthcare and social services occupations | 12 months / 3 years, Canada or abroad | 31100, 31101, 31102, 31103, 31110, 31111, 31112, 31120, 31121, 31200, 31201, 31202, 31203, 31209, 31300, 31301, 31302, 31303, 32101, 32102, 32103, 32104, 32109, 32111, 32120, 32121, 32122, 32123, 32124, 32129, 32201, 33101, 33102, 33103, 41300, 41301, 42201 |
| `stem` | Science, Technology, Engineering and Math (STEM) occupations | same | 20011, 21220, 21300, 21301, 21310, 21321, 21331, 22300, 22301, 22310, 63100 |
| `trades` | Trade occupations | same | 22303, 70010, 70011, 72100, 72102, 72106, 72200, 72201, 72300, 72302, 72310, 72311, 72320, 72400, 72401, 72402, 72422, 72501, 72999, 73100, 73110, 73112, 73113, 82021, 63201 |
| `education` | Education occupations | same | 41220, 41221, 42202, 42203, 43100 |
| `transport` | Transport occupations | same | 72404, 72600, 22313, 72410 |
| `physicians_cwe` | Physicians with Canadian work experience | 12 months / 3 years, **in Canada** | 31100, 31101, 31102 |
| `senior_mgr_cwe` | Senior managers with Canadian work experience | in Canada | 00012, 00013, 00014, 00015 |
| `researchers_cwe` | Researchers with Canadian work experience | in Canada | 41200, 41201 |
| `military` | Skilled military recruits | Foreign Skilled Military Applicant with at least 10 years continuous service in a recognised foreign military; offer from the Canadian Forces Recruiting Group for at least 3 years of full-time work; at least a 2-year post-secondary credential (ECA if foreign) | 40042, 42102, 43204 |

**Uncertainties:**
- The STEM list is now narrow: 11 codes, and it notably includes 63100 (insurance agents). It excludes software and data roles such as 21211 and 21231.
- No STEM draw appears in the last 15 rounds.
- The IRCC deputy minister (DM) transition binder (2026-09) also lists "in-demand occupations" generally.

---

## 4. Recent Express Entry rounds (official JSON feed behind the rounds page)

Source: https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json, fetched 2026-10-27. HTML page: https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html

| # | Date | Round type | Invited | CRS cutoff | Tie-break |
|---|---|---|---|---|---|
| 451 | 2026-10-26 | Provincial Nominee Program | 792 | 761 | 2026-04-03 18:00:26 UTC |
| 450 | 2026-10-16 | French-language proficiency (2026-Version 2) | 5,000 | 435 | 2026-10-06 21:31:22 UTC |
| 449 | 2026-10-15 | Canadian Experience Class | 2,500 | 519 | 2026-09-21 19:00:47 UTC |
| 448 | 2026-10-13 | Provincial Nominee Program | 752 | 772 | 2026-07-15 13:57:33 |
| 447 | 2026-10-01 | Trades occupations (2026-Version 3) | 3,500 | 476 | 2026-05-28 16:55:23 UTC |
| 446 | 2026-09-29 | Canadian Experience Class | 2,000 | 518 | 2026-02-13 20:48:08 UTC |
| 445 | 2026-09-28 | Provincial Nominee Program | 733 | 725 | 2026-09-17 01:36:17 UTC |
| 444 | 2026-09-16 | Senior managers with Canadian work experience (2026-Version 1) | 250 | 389 | 2026-09-01 23:05:13 UTC |
| 443 | 2026-09-15 | Canadian Experience Class | 2,000 | 519 | 2026-03-26 00:16:39 UTC |
| 442 | 2026-09-14 | Provincial Nominee Program | 576 | 734 | 2026-08-29 21:39:50 UTC |
| 441 | 2026-09-04 | Healthcare and social services (2026-Version 3) | 3,500 | 475 | 2026-05-26 00:26:14 UTC |
| 440 | 2026-09-03 | Physicians with Canadian work experience (2026-Version 1) | 229 | 198 | 2026-08-06 19:40:38 UTC |
| 439 | 2026-09-01 | Canadian Experience Class | 2,000 | 521 | 2026-08-18 03:24:13 UTC |
| 438 | 2026-08-31 | Provincial Nominee Program | 562 | 697 | 2026-04-12 04:32:26 UTC |
| 437 | 2026-08-19 | French-language proficiency (2026-Version 2) | 5,000 | 382 | 2026-03-01 18:34:05 UTC |

**Pattern:**
- Roughly biweekly PNP draws, with cutoffs in the 697–772 range.
- CEC draws of 2,000–2,500 at a cutoff of about 518–521.
- Large French draws: 5,000 at 382–435.
- Healthcare and trades draws: 3,500 at about 475.
- No general all-program draws and no STEM draws in this window.

**Uncertainty:** The tool read the JSON feed through a summariser, so spot-check the values against the HTML page. A round pause is expected from 2026-11-03.

---

## 5. Post-Graduation Work Permit (PGWP) and spousal open work permits

### 5.1 PGWP

- **id:** `pgwp`
- **Official name:** Post-Graduation Work Permit. FR: *permis de travail postdiplôme*.
- **Status:** Open.
- **Sources:**
  - https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/eligibility.html (2026-06-24)
  - https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/about.html (2026-03-09)
  - https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/eligibility/field-of-study.html (2026-03-09)

**General eligibility:**
- The program was at a PGWP-eligible DLI and lasted at least 8 months (or 900 hours in Quebec).
- The student was full-time in every semester; the final semester may be part-time.
- The application is made within 180 days of confirmation of completion.
- The student held a valid study permit at some point in those 180 days.
- The student has never had a PGWP before.

**Language** (all 4 abilities; not required if the PGWP application was submitted before 2024-11-01):

| Program | Minimum |
|---|---|
| Bachelor's, master's, doctoral, or other university program | CLB/NCLC 7 |
| College, polytechnic, or other non-university program | CLB/NCLC 5 |
| Flight school graduates | exempt |

**Field of study:**
- **Not required** for bachelor's, master's or doctoral degrees.
- **Required** for all other programs (non-degree university programs and college programs) **if the study permit application was submitted on or after 2024-11-01**.
- The program's 6-digit CIP code must be on the eligible list, either at the time of the study permit application or at the time of the PGWP application.
- Updates to the list:
  - 2025-06-25: 119 fields added and 178 removed.
  - 2025-07-04: the fields removed on 2025-06-25 were restored.
  - About 920 fields are eligible in total.
- **"For 2026, we won't add or remove any eligible fields of study."**
- Field groups on the list include agriculture and agri-food, healthcare and social services, education, trades, transport and STEM. Partial view: the page is about 190 KB and the tool did not read it all.

**Length:**

| Program | PGWP length |
|---|---|
| 8 months to <2 years | up to the program length |
| 2+ years | 3 years |
| Master's (since 2024-02-15), at least 8 months long | 3 years, even if the program was shorter than 2 years |

- Lengths of multiple eligible programs can be combined; the higher language requirement applies.
- The permit is limited to the passport's validity.

**Distance learning:**
- Lock-in date on or after 2024-09-01: at least 50% of the program must be in person in Canada, and time studying abroad is deducted from the PGWP length.

**Curriculum licensing:**
- Within a province: eligible only if the program started on or before 2024-05-15.
- Across provinces: eligible only if it started on or before 2023-01-31.

**Uncertainties:** The full CIP list was not extracted. For non-degree programs, check against the official CIP list.

**Related: study permit cap, 2026**

- Up to 408,000 study permits: 155,000 for new students and 253,000 for extensions.
- The PAL/TAL-required allocation is 180,000 permits (309,670 applications).
- **Master's and doctoral students at public DLIs have been PAL-exempt since 2026-01-01.**
- Source: https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/2026-provincial-territorial-allocations-under-international-student-cap.html (notice dated 2025-11-25)

### 5.2 Spousal open work permit: spouses of students

- **id:** `sowp_student`
- **Status:** Restricted since 2025-01-21.
- **Source:** https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/help-your-spouse-common-law-partner-work-canada.html (2026-02-03)

The principal must hold a valid study permit and be in one of these:
- a **master's program of at least 16 months**;
- a **doctoral** program;
- a listed professional degree: DDS/DMD, LLB/JD/BCL, MD, OD, PharmD/BS/BSc/BPharm, DVM, BScN/BSN/BNSc/BN, BEd, BEng/BE/BASc;
- a listed eligible program, such as the Francophone Minority Communities Student Pilot or certain Quebec, Ontario, Manitoba and BC healthcare programs.

Other rules:
- Dependent children are **not** covered.
- The permit's validity usually matches the student's study permit.

### 5.3 Spousal open work permit: spouses of workers

- **id:** `sowp_worker`
- **Source:** https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/special-instructions/spouses-dependent-children/eligibility.html (2026-06-12)

**High-skilled principal, not on a PR pathway:**
- Only spouses and common-law partners qualify. **Children are not eligible** (since 2025-01-21).
- The principal must work in **TEER 0 or 1**, or in a **listed TEER 2/3 occupation**.
- Listed TEER 2 occupations:
  - 22100–22114, 22210–22214, 22220–22222, 22230–22233, 22300–22313;
  - 32100–32104, 32109–32112, 32120–32124, 32129, 32200, 32201, 32209;
  - 42102, 42202;
  - 72010–72014, 72020–72025, 72100–72106, 72200–72205, 72300–72302, 72310, 72311, 72320, 72321, 72400–72406, 72410, 72411, 72420–72423, 72429, 72500, 72501, 72600–72604, 72999;
  - 82010, 82020, 82021, 82030, 82031.
- Listed TEER 3 occupations:
  - 33100–33103, 33109;
  - 43100, 43204, 53200, 53201;
  - 73100–73113, 73200–73202, 73209;
  - 73300, 73301, 73310, 73311, 73400–73402;
  - 83100, 83101, 83110, 83120, 83121.
  - Code ranges were summarised by the tool; verify the exact listing.
- The principal's permit must have **at least 16 months** of validity remaining after the spouse applies.

**Principal on a PR pathway or who has applied for economic PR:**
- Spouses and dependent children may qualify.
- The principal's permit needs at least 6 months of validity remaining.

**Low-skilled principal (TEER 4/5) not on a pathway:** No new spousal open work permits.

**Ineligible principals:**
- study permit holders, who must use the student route instead;
- PGWP applicants without a decision yet;
- refugee claimants;
- people holding a spousal open work permit themselves.

**New in 2026:**
- BC significant investment projects (2026-03-23);
- Quebec-recruited health professionals (2026-05-25);
- spouses of PSTQ applicants (2026-06-05).

**PGWP holders' spouses:** A PGWP holder counts as a "worker". The spouse qualifies only if the PGWP holder's job is TEER 0/1 or a listed TEER 2/3 occupation and the PGWP has at least 16 months left. *This is an inference from the general rule; the page does not state a PGWP-specific rule.*

---

## 6. Other federal pathways

### 6.1 Atlantic Immigration Program (AIP)

- **id:** `aip`
- **Official name:** Atlantic Immigration Program. FR: *Programme d'immigration au Canada atlantique*.
- **Status:** Open. It is employer-driven, with provincial endorsement and annual allocations. The 2026 target is 4,000 admissions; the DM binder notes 3,315 allocation spaces.
- **Sources:** https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate/ and its subpages (eligibility.html, job-offer.html, work-experience.html, language-testing.html, proof-funds.html, education-assessment.html). Pages modified 2026-05 to 2026-09.

**Eligibility:**
- **Job offer** from a **designated employer** in NB, NS, PEI or NL:
  - full-time (at least 30 h/week) and non-seasonal;
  - TEER 0–3: lasting at least 1 year from PR;
  - TEER 4: permanent;
  - not from a company majority-owned by the applicant or their spouse.
- **Job offer TEER must match work experience TEER:**

  | Job offer TEER | Accepted experience TEER |
  |---|---|
  | 0 | 0–4 |
  | 1 | 1–4 |
  | 2 | 2–4 |
  | 3 | 3–4 |
  | 4 | 4 |

  RN or LPN experience (31301/31201) can be used for job offers in 33102 or 44101.
- **Work experience:**
  - at least 1,560 h of paid work in the **past 5 years**, spread over at least 1 year;
  - Canada or abroad; Canadian work must have been on a valid permit;
  - self-employment excluded;
  - duties must match the NOC.
- **International graduate exemption** (no work experience needed):
  - credential from a recognised Atlantic post-secondary institution, program of **at least 2 years**;
  - full-time for the whole program;
  - obtained **less than 2 years** before the PR application;
  - lived in an Atlantic province for at least 16 of the last 24 months before graduating;
  - held the required status while in Canada;
  - excluded: more than 50% ESL/FSL, more than 50% distance learning, or a return-home scholarship.
- **Language** (all 4 abilities):
  - TEER 0–3: CLB/NCLC 5. Test equivalents: CELPIP 5; IELTS R4.0/W5.0/L5.0/S5.0; PTE Core R42/W51/L39/S51.
  - TEER 4: CLB 4. Test equivalents: CELPIP 4; IELTS R3.5/W4.0/L4.5/S4.0; PTE R33/W41/L28/S42.
- **Education:**
  - TEER 0/1: a Canadian 1-year post-secondary credential or higher, or the foreign equivalent with ECA.
  - TEER 2–4: a Canadian high school diploma or higher, or the equivalent with ECA.
- **Settlement funds** (exempt if already working in Canada on a valid work permit):

  | Family size | CAD |
  |---|---|
  | 1 | 3,815 |
  | 2 | 4,750 |
  | 3 | 5,840 |
  | 4 | 7,090 |
  | 5 | 8,042 |
  | 6 | 9,070 |
  | 7 | 10,098 |
  | Each additional | +1,028 |

  Labelled "Updated July 29, 2025".
- **Settlement plan** from a service provider organisation.

**Uncertainties:**
- Employer designation and endorsement capacity vary by province and can pause in practice. That was not checked.
- The 2026 funds table has not been updated.

### 6.2 Rural Community Immigration Pilot (RCIP)

- **id:** `rcip`
- **Official name:** Rural Community Immigration Pilot. FR: *Projet pilote d'immigration dans les communautés rurales*.
- **Status:** Open. The pilot runs 2025–2029 and requires a community recommendation.
- **Sources:**
  - https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/rural-franco-pilots/rural-immigration/eligibility.html and its subpages (2025-08)
  - Community list: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/rural-franco-pilots.html (2026-08-31)

**Communities (14):**
- Pictou County, NS
- North Bay, ON
- Sudbury, ON
- Timmins, ON
- Sault Ste. Marie, ON
- Thunder Bay, ON
- Steinbach, MB
- Altona/Rhineland, MB
- Brandon, MB
- Moose Jaw, SK
- Claresholm, AB
- West Kootenay, BC
- North Okanagan Shuswap, BC
- Peace Liard, BC

**Eligibility:**
- **Job offer** from a community-designated employer:
  - full-time (at least 30 paid h/week), non-seasonal, and **indeterminate** (no end date);
  - inside the community;
  - in the community's priority sectors.
- **Community recommendation.**
- **Work experience:**
  - 1 year (1,560 h) of paid work in the past 3 years;
  - self-employment excluded.
- **Job offer TEER must match experience TEER:**

  | Job offer TEER | Accepted experience TEER |
  |---|---|
  | 0/1 | 0–3 |
  | 2 | 1–4 |
  | 3/4 | 2–4 |
  | 5 | same 5-digit NOC |

- **International graduate exemption** (credential from a public post-secondary institution in the community; full-time; obtained within 18 months before applying):
  - program of 2+ years: in the community at least 16 of the last 24 months of study;
  - master's or higher taking 2 years or less: in the community for the whole period of study;
  - excluded: more than 50% language study, more than 50% distance learning, or a return-home scholarship.
- **Language** (all 4 abilities):

  | Job offer TEER | Minimum |
  |---|---|
  | 0/1 | CLB 6 |
  | 2/3 | CLB 5 |
  | 4/5 | CLB 4 |

- **Education:** A Canadian credential or the foreign equivalent with ECA. The minimum level is not stated on the fetched page.
- **Settlement funds:** Required. The amounts were not fetched.
- **Intent:** Must intend to live in the community.

**Uncertainties:**
- Third-party sites report that RCIP intake paused in May/June 2026 and was to reopen in August 2026. **No official canada.ca notice was found.**
- Community-level caps and pauses are common.
- The wage requirement and the funds table were not verified.

### 6.3 Francophone Community Immigration Pilot (FCIP)

- **id:** `fcip`
- **Official name:** Francophone Community Immigration Pilot. FR: *Projet pilote d'immigration dans les communautés francophones*.
- **Status:** Open (2025–2029).
- **Communities (6):**
  - Acadian Peninsula, NB
  - Sudbury, ON
  - Timmins, ON
  - Superior East Region, ON
  - St. Pierre Jolys, MB
  - Kelowna, BC
- **Eligibility:**
  - designated-employer job offer plus community recommendation;
  - 1 year (1,560 h) of work in the past 3 years;
  - **French at NCLC 5 in all 4 abilities**;
  - Canadian credential or foreign equivalent;
  - settlement funds;
  - TEER matching and the international graduate exemption assumed parallel to RCIP. That is not verified for FCIP.
- **Sources:**
  - https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/rural-franco-pilots/franco-immigration/eligibility.html
  - The language-test subpage (2025-09-08)
- **Uncertainties:** FCIP-specific TEER, education and wage detail were not fetched.

### 6.4 Home Care Worker Immigration Pilots (Child Care, Home Support)

- **id:** `hcwp`
- **Status:** **CLOSED/PAUSED.**
  - Intake paused **2025-12-19** "until further notice".
  - It will not reopen in March 2026.
  - Applications already received are still processed.
- **Eligibility, for reference:**
  - CLB 4;
  - Canadian high school equivalent;
  - job offer as a home child care provider or home support worker;
  - NOC 44100/42202 (Child Care) or 44101/33102 (Home Support);
  - either 6 months of continuous full-time experience in the last 3 years, or relevant training in the last 2 years;
  - outside Quebec.
- **URLs:**
  - https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/pausing-home-care-worker-immigration-pilots-application-intake.html
  - https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/caregivers/home-care-worker-immigration-pilots/child-care-home-support/eligibility.html

### 6.5 Agri-Food Pilot

- **id:** `agrifood`
- **Status:** **CLOSED.**
  - Ended **2025-05-14**.
  - Applications accepted before that date are still processed.
  - No successor has been announced, and there is no agri-food Express Entry category in 2026.
- **URL:** https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/agri-food-pilot.html (2026-04-27)

### 6.6 In-Canada Workers Initiative (one-time TR→PR acceleration)

- **id:** `in_canada_workers_initiative`
- **Status:** Active in 2026–2027. **It cannot be applied to directly.**
- **Target:** Up to 33,000 work permit holders, with at least about 20,000 in 2026.
- **How it works:** IRCC accelerates **already-submitted** PR applications from work permit holders under:
  - the PNP;
  - the AIP;
  - the community pilots (RCIP/FCIP);
  - the caregiver pilots;
  - the Agri-Food Pilot.
- **Focus:** Smaller and rural communities.
- **Sources:** IRCC backgrounder, 2026-05-04: https://www.canada.ca/en/immigration-refugees-citizenship/news/2026/04/understanding-the-one-time-in-canada-workers-initiative.html. Also the Levels Plan supplementary information.
- **Uncertainties:**
  - Official criteria are not published.
  - Law-firm summaries mention "living outside major urban centres (CMAs) for at least 2 years". That is **not confirmed on canada.ca**.

### 6.7 Other notes

- **Quebec temporary measure (2026-03-13):** An employer-specific work permit for up to 12 months for Quebec workers who were invited to submit a PSTQ application (DSP).
  - It applies to workers whose permits expire between 2026-03-13 and 2026-12-31.
  - Applications are accepted until 2026-12-31.
  - Source: https://www.canada.ca/en/immigration-refugees-citizenship/news/2026/03/new-immigration-measure-to-support-quebec-workers-and-employers.html
- **Paused:** Start-Up Visa and Self-Employed intake are paused indefinitely (DM binder, 2026-09). A "High Impact Start-up Pilot" has been announced, with no details.
- **One-time protected persons initiative:** About 115,000 over 2026–2027. It is not an economic pathway.

---

## 7. 2026–2028 Immigration Levels Plan (headline numbers)

- **Source:** https://www.canada.ca/en/immigration-refugees-citizenship/corporate/immigration-system/levels/supplementary-immigration-levels-2026-2028.html
- **Dates:** Issued 2025-11-04; page modified 2026-10-13.

**Permanent residents:**

| Category | 2026 | 2027 | 2028 |
|---|---|---|---|
| **Total PR** | 380,000 (350–420k) | 380,000 | 380,000 |
| Economic | 239,800 | 244,700 | 244,700 |
| Federal High Skilled (Express Entry) | 109,000 (85k–120k) | 111,000 | 111,000 |
| PNP | 91,500 | 92,500 | 92,500 |
| AIP | 4,000 | 4,000 | 4,000 |
| Economic pilots (caregivers, agri-food, community, EMPP) | 8,175 | 8,775 | 8,775 |
| Federal Business | 500 | 500 | 500 |
| Family | 84,000 | 81,000 | 81,000 |
| Refugees | 49,300 | 49,300 | 49,300 |
| H&C/other | 6,900 | 5,000 | 5,000 |

The economic share is about 63–64%.

**Temporary resident new arrivals:**

| | 2026 | 2027 | 2028 |
|---|---|---|---|
| Total | 385,000 | 370,000 | 370,000 |
| Workers | 230,000 (IMP 170k, TFWP 60k) | 220,000 (TFWP 50k) | 220,000 (TFWP 50k) |
| Students | 155,000 | 150,000 | 150,000 |

**Other targets:**
- Francophone admissions outside Quebec: 9% (2026), 9.5% (2027), 10.5% (2028). The goal is 12% by 2029.
- One-time measures, on top of the targets: up to 33,000 work permit holders → PR (2026–27), and about 115,000 protected persons.
- Goal: the temporary resident population below 5% of the total population by the end of 2027.

**Uncertainty:** The supplementary page does not show separate "Federal Economic Priorities" or "In-Canada Focus" lines. The 2025–2027 plan had those labels; the 2026–2028 plan uses "Federal High Skilled".

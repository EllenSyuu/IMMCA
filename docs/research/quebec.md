# Québec permanent immigration: rules for an eligibility screener

- **Verified date:** 2026-10-27. Every fact below was fetched from the source named on that date, unless it is marked **[secondary]** or **[UNVERIFIED]**.
- **Sources:** quebec.ca pages and PDFs, the Gazette officielle du Québec, and canada.ca. Secondary sources (cicnews, immigration.ca, immigrantquebec.com, Université Laval BVE) are used only where the official page could not be read in full, and each use is labelled.
- **Tooling limits:** Raw downloads from cdn-contenu.quebec.ca were blocked by the network proxy, so PDFs were read through a summarising fetcher. Several quebec.ca news releases (`/nouvelles/actualites/...`) came back empty. Numbers taken from PDFs should be re-checked against the PDFs by hand before release.

## 0. Context that affects every rule below (read first)

- **Election (2026-10-05):** The Parti Québécois won the 5 Oct 2026 election [secondary: immigrantquebec bulletin no. 45, 6 Oct 2026; CBC on the cabinet].
- **Ministry name:** As of the 2026-10-23 update, quebec.ca/gouvernement/ministeres-organismes/immigration gives the ministry's name as **"Ministère de l'Immigration et de l'Intégration"**. The minister is **Catherine Gentilcore**, who is also Vice-première ministre. Other parts of the same page still say "Immigration, de la Francisation et de l'Intégration" (MIFI). The screener should not hard-code the ministry name.
- **PQ platform targets [secondary, NOT enacted]:** About 35,000 permanent admissions per year, about 40,000 temporary foreign workers, about 50,000 international students, and at least a 50% cut in temporary residents over one mandate. No official decision implementing these was found as of 2026-10-27.
- **2027 plan:** The plan d'immigration for 2027 had not been published as of this check. By law it is normally tabled around 1 November.
- **Screener implication:** Rules may change within weeks. Show the "verified on" date in the UI.

---

## 1. PSTQ: Programme de sélection des travailleurs qualifiés

| Field | Value |
|---|---|
| id | `qc_pstq` |
| Official name (FR) | Programme de sélection des travailleurs qualifiés (PSTQ) |
| Official name (EN) | Skilled Worker Selection Program |
| Legal basis | Règlement sur l'immigration au Québec, amended by the regulation published in the GOQ on 2023-11-08. The PSTQ replaced the PRTQ on 2024-11-29. Invitation criteria and points come from a ministerial decision published in the GOQ on 2025-07-02 (erratum 2025-07-09). The points document refers to the arrêté of 2025-06-20, explanatory version updated 2026-06-26. |
| Status | **Open, invitation-only.** Candidates submit a declaration of interest (DI) in Arrima, which is free and valid for 1 year. The Ministry issues invitations by volet, and an invited candidate submits a demande de sélection permanente leading to a CSQ. |
| Fees | $940 CAD for the principal applicant and $201 for each spouse or child, from 2026-01-01 [secondary: Laval BVE April 2026; immigrantquebec Jan 2026]. |

### 1.1 General conditions (all volets)
Source: `.../programme-selection-travailleurs-qualifies/exigences`, last updated 2026-06-25.

```yaml
age_min: 18          # no upper age limit as an eligibility rule (age is scored, see grid)
job_offer_required: false   # not required; you need not be employed in the main occupation
financial_self_sufficiency_contract: true  # 3 months after PR, for self + accompanying family; amounts in the current "barème" PDF
values_attestation_required: true   # Attestation d'apprentissage des valeurs démocratiques et des valeurs québécoises; also accompanying family members 18+
excluded_sectors: [payday_loans, cheque_cashing, pawn, porn_sex_industry]   # erotic dance, escort, erotic massage
not_for_company_you_control: true
scholarship_return_clause_must_be_respected: true
french_results_validity_years: 2   # results dated <= 2 years at the date the application is submitted
```

### 1.2 Volets (eligibility at the demande de sélection stage)

| Field | Volet 1: Haute qualification et compétences spécialisées | Volet 2: Compétences intermédiaires et manuelles | Volet 3: Professions réglementées | Volet 4: Talents d'exception |
|---|---|---|---|---|
| Main occupation | FEER 0, 1 or 2, not regulated (or practised where no authorisation is needed) | FEER 3, 4 or 5, not regulated | On the MIFI list of regulated professions | Any |
| Work experience | ≥12 months paid full-time (or equivalent) in the main occupation, within the 5 years before applying, in Québec or abroad | ≥24 months within 5 years, of which **≥12 months in Québec**. Up to 12 months abroad count, either in the main occupation or in the same CNP major group (same first digit). | Not set by the volet | ≥36 months practising the main occupation within 5 years |
| Internships | Mandatory internships count for up to 3 months | Up to 3 months; internships in Québec must be in the main occupation | (same 3-month rule) | Up to 3 months |
| Education | A diploma leading to an occupation, from a program of ≥1 year full-time. A Québec diploma needs ≥900 h (secondary or college) or ≥30 credits (university). The diploma must be obtained before applying. RAC is accepted. | At least a DES or equivalent, or a ≥1-year program (DEP, ASP, AEC). A Québec diploma needs ≥600 h (secondary), ≥900 h (college) or ≥30 credits (university). | Not set by the volet | Not set (invitation exercise 2 required doctorate-level education) |
| French, principal applicant | **Oral ≥7 and written ≥5** | **Oral ≥5** (no written requirement) | FEER 0–2: oral ≥7 and written ≥5. FEER 3–5: oral ≥5. | **None stated** |
| French, accompanying spouse | Oral ≥4 | Oral ≥4 | Oral ≥4 | None stated |
| Special proof | — | — | A Québec practice authorisation (any type, including restricted, temporary or probationary) **or** proof of partial or full recognition of equivalence (≤5 years old) from the regulatory body. One of 11 listed documents. The candidate has **1 year after the invitation** to obtain it. A refusal of recognition means the candidate is ineligible. | A **positive opinion from a MIFI partner** (strategic economic sectors, research, arts, sport) **or** an accomplishment on the MIFI "liste des réalisations exceptionnelles" |

Notes:
- "Oral" means both oral comprehension and oral production. "Written" means both written comprehension and written production. The invitation criteria state "both oral skills" and "both written skills".
- The French levels are on the Échelle québécoise des niveaux de compétence en français. See section 5 for test equivalences.

### 1.3 Arrima expression of interest: points grid
Source: `cdn-contenu.quebec.ca/cdn-contenu/immigration/publications/fr/Pointage_criteres.pdf`, version updated 2026-06-26, read through the fetcher. **Re-check against the PDF before production.** The overall maximum is **1,400** points.

**Group totals:**
- Capital humain: max **520**
- Réponse aux besoins du Québec: max **700**
- Facteurs d'adaptation: max **180** (principal 40 + spouse 140)

**A. Capital humain, principal applicant (max 520)**

French: four skills, scored separately, max 50 each, 200 total.

| Québec level | Points per skill |
|---|---|
| 1–4 | 0 |
| 5–6 | 38 |
| 7–8 | 44 |
| 9–12 | 50 |

Age (max 120):

| Age | Points |
|---|---|
| 18–19 | 110 |
| 20–30 | 120 |
| 31 | 110 |
| 32 | 100 |
| 33 | 90 |
| 34 | 80 |
| 35 | 75 |
| 36 | 70 |
| 37 | 65 |
| 38 | 60 |
| 39 | 55 |
| 40 | 50 |
| 41 | 40 |
| 42 | 30 |
| 43 | 20 |
| 44 | 10 |
| 45+ | 0 |

Work experience (max 70). The PDF says: "toutes les expériences de travail, peu importe le lieu (au Québec ou à l'étranger)".

| Duration | Points |
|---|---|
| <12 months | 0 |
| 12–23 | 20 |
| 24–35 | 40 |
| 36–47 | 50 |
| ≥48 | 70 |

Education level (max 130):

| Level | Points |
|---|---|
| General secondary (DES) | 13 |
| DEP 600–899 h (Québec) | 13 |
| DEP ≥900 h (Québec), or foreign vocational secondary ≥1 year | 26 |
| Post-secondary general, 2 years | 39 |
| Technical ≥900 h (Québec), or foreign technical 1–2 years | 52 |
| Technical, 3 years | 78 |
| Bachelor's, 1 year | 78 |
| Bachelor's, 2 years | 91 |
| Bachelor's, 3–4 years | 104 |
| Bachelor's, ≥5 years | 110 |
| Master's, 1 year | 110 |
| Master's, ≥2 years | 117 |
| Medical specialisation, ≥2 years | 130 |
| Doctorate | 130 |

**B. Réponse aux besoins du Québec (max 700)**

Labour-market diagnosis × experience in the main occupation (max 120):

| Diagnosis \ months | <12 | 12–23 | 24–35 | 36–47 | 48–60 |
|---|---|---|---|---|---|
| Balanced or none | 0 | 5 | 10 | 15 | 25 |
| Slight shortage (légère pénurie) | 0 | 70 | 80 | 90 | 100 |
| Shortage (pénurie) | 0 | 90 | 100 | 110 | 120 |

Québec diploma (max 200):

| Diploma | Points |
|---|---|
| DES | 20 |
| DEP/ASP 600–899 h | 20 |
| DEP ≥900 h | 40 |
| General post-secondary, 2 years | 60 |
| Technical ≥900 h | 80 |
| Technical DEC, 3 years | 120 |
| Bachelor's, 1 year | 120 |
| Bachelor's, 2 years | 140 |
| Bachelor's, 3–4 years | 160 |
| Bachelor's, ≥5 years | 170 |
| Master's, 1 year | 170 |
| Master's, ≥2 years | 180 |
| Medical specialisation | 200 |
| PhD | 200 |

Québec work experience in the last 5 years (max 160):

| Duration | Points |
|---|---|
| <12 months | 0 |
| 12–23 | 40 |
| 24–35 | 80 |
| 36–47 | 120 |
| 48–60 | 160 |

Time spent outside the Montréal CMM (max 120):

| Months | Residence (max 40) | Work (max 60) | Study (max 20) |
|---|---|---|---|
| 0–5 | 0 | 0 | 0 |
| 6–11 | 6 | 9 | 3 |
| 12–23 | 16 | 24 | 8 |
| 24–35 | 24 | 36 | 12 |
| 36–47 | 32 | 48 | 16 |
| ≥48 | 40 | 60 | 20 |

Other factors:
- **Validated job offer in the main occupation (max 50):** 50 points outside the CMM, 30 points inside the CMM.
- **Practice authorisation, or partial or full recognition (volet 3):** a flat 50 points.

**C. Facteurs d'adaptation**

Principal applicant (max 40):
- Québec study without a diploma (max 30):

| Months | Completed | In progress |
|---|---|---|
| 6–11 | 1 | 5 |
| 12–23 | 3 | 12 |
| 24–35 | 5 | 18 |
| 36–47 | 8 | 24 |
| ≥48 | 10 | 30 |

- Family member in Québec: 10 points if related to the applicant, 5 points if related to the spouse.

Spouse (max 140):

French: four skills, max 10 each, 40 total.

| Level | Points per skill |
|---|---|
| 1–3 | 0 |
| 4 | 4 |
| 5–6 | 6 |
| 7–8 | 8 |
| 9–12 | 10 |

Spouse age (max 20):

| Age | Points |
|---|---|
| 16–19 | 18 |
| 20–30 | 20 |
| 31 | 18 |
| 32 | 17 |
| 33 | 16 |
| 34 | 15 |
| 35 | 14 |
| 36 | 12 |
| 37 | 10 |
| 38 | 8 |
| 39 | 7 |
| 40 | 6 |
| 41 | 5 |
| 42 | 4 |
| 43 | 3 |
| 44 | 2 |
| 45+ | 0 |

Spouse Québec work experience (max 30):

| Months | Points |
|---|---|
| 0–5 | 0 |
| 6–11 | 5 |
| 12–23 | 10 |
| 24–35 | 15 |
| 36–47 | 23 |
| 48–60 | 30 |

Spouse education (max 20):

| Level | Points |
|---|---|
| DES | 2 |
| DEP 600–899 h | 2 |
| DEP ≥900 h, or foreign vocational ≥1 year | 4 |
| General, 2 years | 6 |
| Technical ≥900 h, or foreign technical 1–2 years | 8 |
| Technical, 3 years | 12 |
| Bachelor's, 1 year | 12 |
| Bachelor's, 2 years | 14 |
| Bachelor's, 3–4 years | 16 |
| Bachelor's, ≥5 years | 17 |
| Master's, 1 year | 17 |
| Master's, ≥2 years | 18 |
| Medical specialisation | 20 |
| PhD | 20 |

Spouse Québec diploma (max 30):

| Diploma | Points |
|---|---|
| DES | 3 |
| DEP 600–899 h | 3 |
| DEP ≥900 h | 6 |
| General, 2 years | 9 |
| Technical ≥900 h | 12 |
| Technical, 3 years | 18 |
| Bachelor's, 1 year | 18 |
| Bachelor's, 2 years | 21 |
| Bachelor's, 3–4 years | 24 |
| Bachelor's, ≥5 years | 25 |
| Master's, 1 year | 25 |
| Master's, ≥2 years | 27 |
| Medical specialisation | 30 |
| PhD | 30 |

**Gaps in the grid:**
- **[UNVERIFIED]** How a single applicant's maximum compares with a couple's: whether a single applicant can reach 1,400, or whether points are redistributed. The PDF group totals suggest 180 for adaptation including the spouse. The screener should present the score as "indicative only", as MIFI itself does.
- The labour-market diagnosis per CNP code ("diagnostics de main-d'œuvre") is a separate MIFI/MESS publication. **Not fetched.**

**Non-scored invitation filters** (from the `/invitation` page, updated 2026-10-22):
- Living in Québec, inside or outside the CMM
- Main occupation (5-digit CNP code)
- FEER category
- Intention to practise a regulated profession
- Experience in the main occupation
- Québec experience in the main occupation
- Employment with an INGO
- Positive opinion or accomplishment document (volet 4)

**How invitations work:**
- **Ranking:** Within each exercise, candidates are ranked by score. The minimum score is the score of the last person invited. There is no lottery.
- **Response deadline:** An invitation must be accepted in Arrima within **30 days**.
- **Supporting documents:** Must be filed within 60 days of accepting [secondary: Laval BVE].

### 1.4 Advantages for Québec graduates and workers (verified from the grid and the 2026 rounds)
- **Québec diploma:** Up to **200 points**, the single largest factor. In Jan–Jun 2026, nearly every round of volets 1 and 2 had a dedicated exercise restricted to Québec-diploma holders.
- **Québec work experience:** Up to **160 points**. Volet 2 requires ≥12 months in Québec.
- **Living in Québec:** Every 2026 round listed in the volet 1 and 2 summaries required **currently residing in Québec**.
- **Outside the CMM:** Up to 120 points for time outside the Montréal CMM, plus 50 rather than 30 for a job offer outside the CMM.
- **Québec study without a diploma:** Up to 30 points.
- **Planning targets:** The 2026–2029 orientations aim for ≥65% of permanent admissions to be people already in Québec by 2027–2029, against 54% planned for 2026.

### 1.5 2026 invitation rounds (official page `.../invitation/2026`)

The page is about 90–111k characters and the fetcher truncated it. **The volet 1 data below are fully verified from the official page. Volet 2 data are verified from the official page only for Jan–Apr 2026. Data after April for volet 2, and all volet 3 and 4 data, are [secondary].** No round dated October 2026 was found as of 2026-10-27; the latest is 24 Sep 2026. The page was last updated 2026-10-22, and that update may concern only text.

**Volet 1 (official)**

Every exercise requires:
- FEER 0–2
- No regulated profession
- ≥12 months of experience in 5 years
- Oral ≥7 and written ≥5 (spouse oral ≥4)
- Residing in Québec
- A ≥1-year program (from February onward)

| Date (extraction) | Total | Exercise: count / min score / extra filter |
|---|---|---|
| 2026-01-29 (01-26) | 1,094 | A: n/a / 782 / Québec diploma · B: n/a / 674 / CNP list A · C: n/a / 737 / none |
| 2026-02-26 (02-23) | 907 | 1: 254 / 741 · 2: 419 / 627 / CNP list B · 3: 234 / 722 |
| 2026-03-19/20 (03-16) | 893 | 1: 258 / 718 / Québec diploma · 2: 412 / 588 / CNP B · 3: 223 / 709 |
| 2026-04-30 (04-27) | 983 | 1: 379 / 716 / Québec diploma · 2: 354 / 571 / CNP B · 3: 250 / 704 |
| 2026-06-04 (06-01) | 1,094 | 1: 459 / 677 / Québec diploma · 2: 239 / (not shown) / CNP 31303, 32124, 41301, 42201-42203 · 3: 165 / 666 / CNP list (24 codes) · 4: 231 / 692 |
| 2026-07-03 (06-26) | 74 | 1: 31 / 628 / CNP 32124, 41301, 42201-42203 · 2: 5 / 726 / CNP 62020, 62200, 72400, 72404, 72422 · 3: 38 / 656 / tech and trades list |
| 2026-07-30 (07-27) | 105 | 1: 44 / 651 / health, science, social (21100, 21110, 31209, 31303, 32109, 32124, 41301, 42201-42203) · 2: 12 / 702 / 62020, 62200 · 3: 49 / 701 / engineering, IT, trades (26 codes) |
| 2026-08-27 (08-24) | 87 | 1: 26 / 639 · 2: 11 / 710 · 3: 50 / 694 (same lists as 07-30) |
| 2026-09-24 (09-21) | 86 | 1: 37 / 634 · 2: 8 / 706 · 3: 41 / 696 (EN page) |

CNP lists:
- **List B (26 codes):** 20010, 21321, 22300-22302, 22310, 31303, 32124, 41301, 42201-42203, 72100, 72102, 72105, 72106, 72203, 72204, 72301, 72310, 72320, 72321, 72400, 72401, 72422, 72500
- **Exercise 3 list from July onward:** 20010, 21211, 21220, 21321, 22100, 22232, 22300-22302, 22310, 22313, 72100, 72102, 72105, 72106, 72203, 72301, 72310, 72320, 72321, 72400, 72401, 72404, 72410, 72422, 72500

**Volet 2 (official for Jan–Apr)**

Every exercise requires:
- FEER 3–5
- Oral ≥5 (spouse ≥4)
- ≥24 months of experience, of which 12 in Québec
- Residing in Québec

| Date | Total | Exercises (count / min) |
|---|---|---|
| 2026-01-29 | 683 | G1 / 800 / Québec diploma · G2 / 609 / priority CNP · G3 / 657 / living outside the CMM |
| 2026-02-26 | 495 | 1: 104 / 756 / Québec diploma · 2: 194 / 562 / priority CNP · 3: 197 / 688 |
| 2026-03-19/20 | 509 | 1: 109 / 679 / Québec diploma · 2: 193 / 505 / priority CNP · 3: 207 / 662 |
| 2026-04-30 | 506 | 1: 153 / 660 / Québec diploma · 2: 163 / 494 / priority CNP · 3: 190 / (not read) |

**Volet 2 [secondary, cicnews / immigration.ca]**
- **2026-06-04:** 756 invitations. Ex 1: 229 / 624 (Québec diploma). Ex 2: 256 / 330. Ex 3: 90 / 653. Ex 4: 181 / 652.
- **2026-07-03:** 289 invitations.
- **2026-08-27:** about 570 invitations. Ex 1: 314 / 638. Ex 4 (TEER 4–5): 249 / 616.
- **2026-09-24:** 316 invitations. Ex 1: 48 / 631. Ex 2: 10–15 / 706. Ex 3: fewer than 5 / 698. Ex 4: 254 / 611 (TEER 4–5).

**Volet 3 [secondary]**
- **2026-06-04:** 677 invitations. Ex 1: 73 / 562 (Québec diploma + TEER 0–2). Ex 2: 393 / 275. Ex 3: 118 / 556. Ex 4: 71 / 580. Ex 5: 22 / 637.
- **2026-07-03:** 131 invitations.
- **2026-08-27:** 109 invitations. Ex 1: 77 / 639. Ex 2: 25–30 / 694. Ex 3: fewer than 5 / 393.
- **2026-09-24:** 110 invitations. Ex 1: 69 / 631 (regulated health, education, social). Ex 2: 37 / 697 (engineers, electricians, plumbers). Ex 3: fewer than 5 / 696. Ex 4: fewer than 5 / 380.

**Volet 4 [secondary]**
- No minimum score is published.
- Rounds: 22 invitations (2026-06-04), 7 (2026-07-03), 21 (2026-08-27), 7 (2026-09-24).
- Ex 1 required a partner's positive opinion. Ex 2 required an accomplishment plus a doctorate. Both required ≥36 months of experience.

**All-volet totals [secondary]**

| Date | Total invitations |
|---|---|
| 2025-12-04 | 1,870 (official MIFI communiqué cited by immigrantquebec) |
| 2026-01-29 | ~2,549 |
| 2026-06-04 | ~2,549–2,555 |
| 2026-07-03 | 501 |
| 2026-07-30 | ~523 |
| 2026-08-27 | ~531–790 (sources disagree) |
| 2026-09-24 | 519 |

Volume dropped sharply from July 2026. This matches the PEQ reopening, which MIFI describes as running "in parallel" with the PSTQ. The "50/50 split with the PEQ" claim seen in a blog was **not** confirmed officially.

**Uncertainties:**
- The volet 3 and 4 sections and the "Autres invitations" section of the official page were not read because the page was truncated.
- The 4 Jun volet 1 Ex 2 minimum score is missing.
- Rounds may have occurred after 2026-09-24 and before 2026-10-27 that were not captured. **[UNVERIFIED]**

---

## 2. PEQ: Programme de l'expérience québécoise

| Field | Value |
|---|---|
| id | `qc_peq` (streams `qc_peq_diplomes`, `qc_peq_tet`) |
| Official name (FR / EN) | Programme de l'expérience québécoise / Québec Experience Program |
| History | **Diplômés du Québec stream:** suspended 2024-10-31 [secondary: cicnews]. **Travailleurs étrangers temporaires stream:** suspended 2025-06-25 [secondary]. **Whole program abolished 2025-11-19** (official EN page updated 2025-12-05). Applications filed before abolition continue to be processed. |
| Current status | **Temporarily reopened 2026-07-02 → 2028-07-02** (official FR page updated 2026-06-17 to 2026-06-23). **The only reception window was 2026-07-02 → 2026-10-31.** As of 2026-10-27 the window is open, but it closes in 4 days. After that the status is "closed to new applications". Further windows "could" open depending on the volume received by 31 Oct; no dates have been set. |
| Mechanism | Direct application for permanent selection, not through an Arrima invitation, under a ministerial file-management decision. No numeric cap was published. MIFI says that from fall 2026, invitations may be reduced, for example for FEER 4–5 or for people with less than 2 years of experience. The context suggests this refers to the PSTQ. |

### 2.1 Reception criteria for the 2026 reopening
Snapshot date is **2025-11-19**: the diploma or experience had to exist on that date.

```yaml
qc_peq_diplomes:
  snapshot_date: 2025-11-19
  eligible_quebec_diplomas: [bachelor, master_incl_MBA, doctorate, DEC_technique, DEP_>=1800h, DEP+ASP_>=1800h]
  diploma_obtained_within_months_before_application: 36
  full_time_program_at_quebec_institution: true
  stayed_in_quebec_mainly_to_study_at_least_half_program: true
  legally_in_quebec_at_application: true
  french: {oral_min: 7, written_min: 5, spouse_oral_min: 4}
  french_language_studies_requirement: removed   # official: the requirement to have studied in French was removed
  scholarship_return_clause: must_be_fulfilled
  financial_self_sufficiency_3_months: true
  values_attestation: true   # incl. spouse & adult dependants
  age_min: 18
qc_peq_tet:
  snapshot_date: 2025-11-19
  quebec_experience_FEER: [0,1,2,3]
  experience_rule: ">=24 months full-time (>=30 h/week paid) in Québec within the 36 months before application"
  must_hold_qualifying_job_at_application: true
  legally_in_quebec_as: [temporary_worker, youth_exchange/working_holiday/young_professional/international_coop]
  french: {oral_min: 7, spouse_oral_min: 4}   # written level: see uncertainty
  excluded_sectors_apply: true
  self_employed_or_own_company_experience: excluded
```

### 2.2 Uncertainties and transition rules
- **Diploma for the workers stream:** The reopening PDF (`reouverture_peq.pdf`) says the workers stream also requires an eligible Québec diploma ("hold an eligible diploma"). The detailed stream page does not list a diploma requirement for workers. **This conflicts and needs manual verification.**
- **Written French for workers:** Not stated for the workers stream. It is stated (written ≥5) for graduates.
- **Old transition rule:** Workers in Québec on 2020-07-21 with a valid work permit can use the pre-2020-07-22 rules. Those rules require 12 of the last 24 months full-time in Québec in any FEER, and the spouse is exempt from the French requirement. The page was updated 2026-06-17 and the rule still appears, but its practical relevance in 2026 is unclear.
- **Applications from before abolition:** Applications filed before 2025-11-19 are still being processed.

**URLs:**
- https://www.quebec.ca/immigration/permanente/travailleurs-qualifies/programme-experience-quebecoise
- `.../conditions-selection`, `.../conditions-selection/diplomes-quebec`, `.../conditions-selection/travailleurs-temporaires`, `.../conditions-selection/mesures-transitoires`
- https://cdn-contenu.quebec.ca/cdn-contenu/adm/min/immigration/publications-adm/reouverture_peq.pdf
- EN, closure notice: https://www.quebec.ca/en/immigration/immigration-programs/quebec-experience-program

---

## 3. Other Québec programs

### 3.1 Permanent immigration pilot programs: all **closed**

| id | Name (FR / EN) | Status | Source |
|---|---|---|---|
| `qc_pilot_pab` | Programme pilote d'immigration permanente des préposés aux bénéficiaires / Orderlies pilot | **Ended 2026-01-01.** No new applications; applications filed before then are still processed. | quebec.ca/immigration/permanente/travailleurs-qualifies/preposes-beneficiaires (updated 2026-01-05) |
| `qc_pilot_ia_ti_ev` | Programme pilote d'immigration permanente des travailleurs des secteurs de l'intelligence artificielle, des technologies de l'information et des effets visuels / AI, IT and visual effects pilot | **Ended 2026-01-01**, both streams | .../intelligence-artificielle (updated 2026-01-05) |
| `qc_pilot_transfo_alim` | Programme pilote d'immigration permanente des travailleurs de la transformation alimentaire / Food-processing pilot | **Ended 2026-01-01** | .../transformation-alimentaire (updated 2026-01-05) |

### 3.2 Business programs (gens d'affaires)

| id | Name | Status found | Key conditions (official) | Uncertainty |
|---|---|---|---|---|
| `qc_self_employed` | Programme des travailleurs autonomes / Self-Employed Worker Program | The official conditions page (updated 2026-06-25) shows **no suspension notice**. [secondary: immigrantquebec Jan 2026] says the **federal** self-employed program is suspended "until further notice" by IRCC, which would block the federal PR step. | ≥2 years self-employed experience in 5 years; net worth ≥$100,000; **oral French ≥7**; DES or equivalent; deposit of $25k outside the CMM or $50k inside; 3-month self-sufficiency contract; values attestation | Intake status is **UNVERIFIED**. The IRCC pause is secondary only. The canada.ca page (modified 2026-06-15) shows no pause. |
| `qc_entrepreneurs` | Programme des entrepreneurs / Entrepreneur Program (volets: innovative business, business start-up or acquisition) | The official conditions page (updated 2025-07-09) shows no suspension notice | Start-up stream: age ≥18; oral French ≥7; net worth $600k (from abroad) or $300k (already in Québec, ≥2 years); ≥2 years of management experience; spending of $300k in the CMM or $150k outside; ≥25% equity | Annual caps or intake periods are **UNVERIFIED**. |
| `qc_investors` | Programme des investisseurs / Investor Program | Reception was suspended 2023-04-01 → 2024-01-01 (official news). The program page (updated 2024-04-18) says "Vous pouvez présenter une demande en tout temps". | Not fetched | Current conditions (investment amount, French) were **not verified**, and neither were any later caps. |

Plan 2026 targets for business people: 450–550 admissions and 100–200 CSQs.

### 3.3 Plan d'immigration du Québec 2026 (official PDF PL_immigration_2026_MIFI.pdf, tabled November 2025)

Admissions:

| Category | 2026 range |
|---|---|
| Economic | 27,500–30,100 |
| — Skilled workers | 27,050–29,500 |
| — Business people | 450–550 |
| — Other economic | 0–50 |
| Family reunification | 9,600–10,400 |
| Refugees | 5,500–6,000 |
| Other | 400–500 |
| **Total** | **43,000–47,000** |

CSQs to issue in 2026:

| Category | 2026 range |
|---|---|
| Skilled workers | 32,600–35,600 |
| Business | 100–200 |
| **Total** | **33,800–37,210** |

Temporary immigration:
- CAQs to issue in 2026: 130,700–177,800 in total, of which **students 87,300–114,100** and temporary foreign workers 43,400–63,700.
- Targets by 2029: ≤110,000 student permit holders and ≤65,000 temporary-foreign-worker permit holders.
- Study applications to stay at about the 2024 level.

Planning ratios:
- 76% of 2026 admissions to know French; the goal is above 77%.
- 64% economic.
- 54% already in Québec in 2026, rising to 65% in 2027–2029 (orientations 2026–2029).
- About 45,000 admissions per year planned for 2026–2029.
- These are pre-election targets. The new PQ government may revise them.

### 3.4 Family sponsorship cap (not a student or worker path; included for completeness)
- Arrêté 2026-004, GOQ 2026-06-23: at most 15,700 sponsorship undertakings from 2026-07-02 to 2028-06-30.
- Of these, 13,300 are for spouses and partners, received in staged periods tied to the date of IRCC proof, and 2,400 are for other family members.

---

## 4. Federal step after the CSQ

| Field | Value |
|---|---|
| id | `fed_qsw_pr` |
| Name | Quebec-selected skilled workers: permanent residence (IRCC). The guide is Q7000. |
| Eligibility | Hold a valid CSQ, and submit a complete PR application including police certificates (canada.ca eligibility page, modified 2025-06-12). Federal admissibility rules apply: medical exams, security and criminality checks, biometrics. |
| Process | Québec selects (CSQ), then Canada admits (PR). quebec.ca (updated 2026-09-16): "submit an application for permanent residence as a skilled worker selected by Québec". Neither the CSQ nor the PR application gives temporary status by itself [secondary: Laval]. |
| Fees [secondary: Laval BVE, April 2026] | Processing: $990 for the principal applicant, $990 for the spouse, $270 per child. Right of PR fee: $600 each for the principal applicant and spouse. Biometrics: $85. |
| Express Entry | Does **not** apply to people destined for Québec. canada.ca CEC page (modified 2026-10-16): "You must plan to live outside the province of Quebec." / "The province of Quebec selects its own skilled workers." Québec work experience **can** count for the CEC if the person intends to live outside Québec. |
| Uncertainty | Federal processing times and the CSQ validity period were not fetched. |

URLs:
- https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/quebec-skilled-workers/eligibility.html
- https://www.quebec.ca/en/immigration/permanent/skilled-workers/permanent-residency
- https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/canadian-experience-class.html

---

## 5. French tests: equivalences to the Échelle québécoise
Sources: quebec.ca PSTQ French knowledge page (updated 2025-11-28) and TAB_PSTQ_Correspondance_niveaux_francais.pdf (version 2024-11-29).

**Accepted tests and documents:**
- France Éducation international: TCF, TCF Québec, TCF Canada, DELF, DALF
- CCIP-IDF: TEF, TEFAQ, TEF Canada
- Secondary diplomas: French baccalauréat, Belgian CESS, Swiss maturité from a French-speaking canton
- Volet 3 only: a regular Québec professional-order permit, or the OQLF professional-order French exam attestation
- Results must be ≤2 years old on the date the application is submitted
- **No exemption for native speakers or for people who studied in French** (PSTQ page)

**Equivalence table.** Levels are grouped in the source; the CEFR level is given in brackets.

| Québec level | 1–2 (A1) | 3 (A2) | 4 (A2) | 5–6 (B1) | 7–8 (B2) | 9–10 (C1) | 11–12 (C2) |
|---|---|---|---|---|---|---|---|
| TEF / TEFAQ / TEF Canada, all skills (score) | 100–199 | 200–259 | 260–299 | 300–399 | 400–499 | 500–599 | 600–699 |
| TCF / TCF Québec / TCF Canada, comprehension (oral and written) | 101–199 | 200–259 | 260–299 | 300–399 | 400–499 | 500–599 | 600–699 |
| TCF expression (oral and written, /20) | 1 | 2–3 | 4–5 | 6–9 | 10–13 | 14–17 | 18–20 |
| DELF/DALF, per oral or written group (/25) | A1 12.5–25 | A2 12.5–15.5 | A2 16–25 | B1 12.5–25 | B2 12.5–25 | C1 12.5–25 | C2 synthesis 25/50–50 |

**Screener thresholds:**

| Requirement | TEF | TCF comprehension | TCF expression | DELF/DALF |
|---|---|---|---|---|
| Level 7 | ≥400 | ≥400 | ≥10/20 | B2 passed |
| Level 5 | ≥300 | ≥300 | ≥6/20 | B1 passed |
| Level 4 | ≥260 | ≥260 | ≥4/20 | A2 with ≥16/25 |

**DELF/DALF caveat:** A DELF or DALF diploma gives a single level for the oral pair (comprehension and production) and a single level for the written pair. The PDF assigns levels from the score in each pair. How a DELF B2 diploma with a sub-score under 12.5 is handled is **UNVERIFIED**.

---

## 6. Study permits and CAQ caps (students)

| Field | Value |
|---|---|
| id | `qc_caq_study_caps` |
| Current regime | A government decree caps the number of **CAQ study applications received per institution** (or school service centre or board) for each **one-year period from 2025-12-17 to 2027-12-16**. The caps apply to vocational training, college and university only. A decree published 2026-07-22 revised the maximums for some institutions. (Official page quebec.ca/education/etudier-quebec/demande-selection-temporaire; the page shows "updated 2026-01-01" but includes July 2026 content.) |
| Previous regime | Décret 155-2025 (GOQ 2025-02-26) capped applications for 2025-02-26 → 2026-02-26 at 124,760: vocational 32,261, college 29,200, university 63,299. |
| When the cap is reached | No application is possible at that institution unless the applicant has an exemption. Places freed by inadmissible applications are released on certain Thursdays at 14:00, on a quarterly calendar. |
| Exemptions | Continuing at the same institution and level; asylum claimants; dependent children of temporary foreign workers or students; health bridging training; Bourse d'excellence FP holders; Protocole attestation holders; institution closure. Primary and general secondary studies and the École du Barreau are exempt automatically. |
| Fees and processing | CAQ fee $135 (from 2026-01-01). 80% of decisions within 25 working days of a complete file. |
| Federal side [secondary] | The IRCC 2026 national study-permit cap is 408,000. Québec's allocation of applications needing an attestation is 39,474 (immigrantquebec, Dec 2025). Not verified on canada.ca. |
| Uncertainty | The per-institution figures (TAB_SuivisDemandes_EtudiantsEtrangers.pdf) and the December 2025 decree number were **not retrieved**. The new government's platform proposes about 50,000 students, but this is not enacted. |

---

## 7. Summary of machine-checkable status (as of 2026-10-27)

| id | Status | Checkable rule |
|---|---|---|
| qc_pstq_v1 | invitation-only (open) | FEER 0–2 & not regulated & exp ≥12 months in 5 years & program ≥1 year (Québec ≥900 h or 30 credits) & oral ≥7 & written ≥5 & age ≥18 |
| qc_pstq_v2 | invitation-only (open) | FEER 3–5 & not regulated & exp ≥24 months in 5 years with ≥12 in Québec & DES or ≥1-year program & oral ≥5 |
| qc_pstq_v3 | invitation-only (open) | Regulated profession & (FEER 0–2 → oral 7 / written 5; FEER 3–5 → oral 5) & regulatory proof within 1 year of the invitation |
| qc_pstq_v4 | invitation-only (open) | ≥36 months in 5 years & (partner opinion OR listed accomplishment); no French requirement stated |
| qc_peq_diplomes | open until 2026-10-31, then closed | Eligible Québec diploma held on 2025-11-19, obtained ≤36 months before applying; oral 7, written 5; in Québec |
| qc_peq_tet | open until 2026-10-31, then closed | ≥24 of 36 months full-time in Québec in FEER 0–3 (≥2 years as of 2025-11-19); currently employed; oral 7; in Québec |
| pilots ×3 | closed (2026-01-01) | — |
| self-employed / entrepreneurs / investors | status unclear | See 3.2 |
| fed_qsw_pr | open (needs a CSQ) | Holds a CSQ |
| express_entry | not applicable to Québec | Intends to live in Québec → ineligible |

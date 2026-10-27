# PNP research for eligibility screener: ON, NB, NS, PEI, NL

- **Verified date:** 2026-10-27 (all pages fetched that day unless noted)
- **Method:** WebSearch and WebFetch of official sites only. Third-party news (CIC News, immigration.ca) was used **only** to find official pages or to fill draw counts where the official page could not be fetched. Those cases are tagged `[secondary]`.
- **Fetch limits:** These official pages could not be fetched because of domain allowlist or proxy 403 errors:
  - Most `princeedwardisland.ca/en/information/office-of-immigration/*` stream pages, and the PEI workforce guide PDFs
  - The NB pathway guide PDFs on `www2.gnb.ca`
  - The NL web versions of the eligibility pages (the PDF versions were fetched)
  - The legacy `novascotiaimmigration.com` domain, which now 302-redirects to `liveinnovascotia.com`, the Government of NS site
  - `welcomenb.ca`: NB content now lives on `gnb.ca`
- **Field conventions:** `null` means not stated or not verified. CLB is the minimum in each of the four skills unless noted. "Enhanced" means Express Entry-linked, giving +600 CRS on nomination.

---

## Cross-province summary of 2025–2026 changes

| Province | Key change | Effective | Source |
|---|---|---|---|
| ON | All 8 legacy streams closed. One **Ontario Workforce Priority (OWP)** stream replaced them: employer job offer required, with an optional Express Entry link for TEER 0–3. Masters Graduate, PhD Graduate, International Student, Foreign Worker, In-Demand Skills, HCP, French-Speaking Skilled Worker and Skilled Trades are all gone. | Legacy streams closed May 30, 2026 (HCP banner); Phase 1 under O. Reg. 422/17 on Jun 25, 2026; OWP EOI portal opened Aug 4, 2026 | ontario.ca 2026 updates page; OWP page; archived HCP page |
| ON | Express Entry Skilled Trades stream suspended; outstanding applications returned | Nov 14, 2025 | ontario.ca 2025 updates |
| ON | 2025 allocation reached (10,750 nominations) | Dec 17, 2025 | ontario.ca 2025 updates |
| ON | OWP EOI scoring change: 10 points for $80k+ single-year CRA-assessed earnings | Oct 5–7, 2026 | ontario.ca 2026 updates |
| NB | Skilled Worker restructured into 3 pathways (NB Experience, NB Graduates, NB Priority Occupations). Express Entry has 2 pathways; NB Student Connection dropped. 365-day EOI pool replaced first-come processing. | Jan–Feb 2025 | gnb.ca notices archive 2025 |
| NB | Strategic Initiative "not returning for 2025", but draws resumed in Jan 2026 | 2025 pause; active in 2026 | gnb.ca notices archive and 2026 rounds |
| NB | NAICS 72 (accommodation and food) and 14 retail and other NOCs excluded from Skilled Worker and Express Entry | Feb 3, 2026 | gnb.ca important notices |
| NB | NB Experience pathway limited to health, education and construction occupations because of limited allocation | May 4, 2026 | gnb.ca important notices |
| NB | AIP: employer designation paused for the rest of 2026; candidate NOC restrictions mostly lifted | Sep 14 and Oct 14, 2026 | gnb.ca important notices |
| NS | NSNP consolidated from 10 streams to 4 (Skilled Worker, Nova Scotia: Express Entry, Nova Scotia Graduate, Entrepreneur); old streams became pathways | Feb 18, 2026 | liveinnovascotia.com notices (Feb 5, 2026); detail `[secondary]` CIC News Feb 19, 2026 |
| NS | Formal EOI process. EOIs valid 12 months from May 1, 2026. NSNP application fees from Sep 1, 2026. | Nov 28, 2025 / May 1, 2026 / Sep 1, 2026 | liveinnovascotia.com notices |
| NS | "Occupations in Demand" pathway has no occupations listed, so it is effectively dormant | as of guide dated Sep 2026 | NS Skilled Worker guide |
| PEI | No structural stream change found on official pages. Monthly EOI draws continue; Business Impact had zero draws in 2026 `[secondary]`. Workforce guide republished Mar 30, 2026; contents not fetchable. | — | princeedwardisland.ca |
| NL | EOI model launched for all economic immigration (NLPNP and AIP) | Feb 19, 2025 | gov.nl.ca EOI pages |
| NL | No ITA rounds published after Mar 30, 2026 (page last updated that day). Priority Skills NL no longer appears in the NLPNP category list. | — | gov.nl.ca ITA updates; NLPNP overview |

---

# ONTARIO (OINP)

**Program status, per ontario.ca "Applying to the OINP" (updated Oct 20, 2026):** "the Ontario Workforce Priority stream has launched and ... all other streams are closed."

## ON-OWP: Ontario Workforce Priority stream
- **id:** `on_owp`
- **Official name:** Ontario Workforce Priority Stream
- **Type:** Base by default. Optionally **enhanced** for TEER 0–3 if the candidate has a valid Express Entry profile and meets federal minimums: +600 CRS, nomination must be accepted within 30 days, then 60 days to apply to IRCC.
- **Status:** Open (EOI). Regulation in force since Jun 25, 2026; EOI portal opened Aug 4, 2026. **No OWP invitation rounds were published on ontario.ca as of Oct 27, 2026.** The ITA page (updated Oct 20, 2026) lists only legacy-stream rounds up to Apr 30, 2026.
- **Pathways:**
  - `on_owp_teer03`: job offer, TEER 0–3
  - `on_owp_teer45`: job offer, TEER 4–5
  - `on_owp_physician`: self-employed physicians, no job offer
- **Eligibility (machine-checkable):**

| Criterion | TEER 0–3 | TEER 4–5 |
|---|---|---|
| job_offer_required | true: full-time, permanent, in Ontario, employer approved via Employer Portal | true: same |
| teer | 0,1,2,3 | 4,5 |
| wage | ≥ Job Bank **median** for the region. Exception: the **low** wage level is allowed if the applicant is a recent Ontario graduate and the job is TEER 0–3. Collective-agreement jobs are exempt. | ≥ Job Bank median |
| work_experience | Any ONE of: (a) 6 consecutive months full-time, paid, in the **same position** within the last 12 months (≥780 h, ≥30 h/wk); (b) **recent Ontario graduate**: 3 consecutive months in the position within the last 12 months (≥390 h); (c) 24 months cumulative full-time (≥3,120 h) in the same NOC in the last 5 years (some related NOCs count); (d) holds a mandatory licence for the position. NOC 73300 and 73301 always need option (a). | 9 months cumulative full-time (≥1,170 h) in the position within the last 24 months |
| recent_ontario_grad definition | 2+ year full-time degree or diploma, an Ontario College Graduate Certificate, a Master's, or a PhD, from an eligible **Ontario** institution, completed within the **last 3 years** | n/a |
| min_clb | 6 (non-trades), 5 (listed skilled trades). Test waived for a qualifying Ontario or eligible Canadian credential completed within 3 years. Test must be ≤2 years old. IELTS-GT, CELPIP-G, PTE Core, TEF, TCF. | 4 |
| education | Non-trades: post-secondary credential of ≥1 academic year (Canadian, or foreign with an ECA under 5 years old). Trades: Canadian high school or equivalent. NOC 33102: Ontario college certificate of ≥1 year. | Canadian secondary diploma or equivalent |
| legal_status | Required if in Canada: visitor, study or work permit; maintained status OK | same |
| residence_in_province | No hard requirement; "intent to live and work in Ontario" is assessed | same |
| age | null (not stated) | null |
| funds | null (not stated) | null |
| occupation_restrictions | Any NOC. Excluded: seasonal or contract roles, Ontario Public Service, labour-dispute positions, self-employed (except physicians). NOC 33102 must be in a health care establishment. | same |

- **Employer criteria:** relevant for the screener as "employer eligible?" flags.
  - In business ≥3 years, with Ontario premises.
  - Revenue: ≥$1M in the GTA (Toronto, Durham, Halton, Peel, York). ≥$500k in listed census divisions such as Ottawa, Hamilton, Waterloo, Niagara and Simcoe. ≥$250k elsewhere, summed over the last 2 fiscal years.
  - Full-time citizen or PR employees at the work location: ≥5 in the GTA, ≥3 outside.
  - Recruitment efforts required if the applicant is abroad or outside Ontario.
- **Physician pathway:** No job offer. Needs a CPSO certificate (independent, academic or provisional practice) and an OHIP billing number. A postgraduate education licence does not qualify.
- **Selection:** Employer submits the job offer and receives an ID. Applicant submits an EOI within 30 days. ITA is issued. Employer then has 14 days and applicant 17 days to submit. Applicant applies to IRCC within 6 months of nomination.
- **EOI points, as published:**
  - TEER: 0/1 = 9; 2/3 = 6; 4/5 = 0
  - NOC broad category: 3 = 10; 7 = 8; 2 = 6; 0,1,4,8,9 = 4; 5,6 = 2
  - Hourly wage: ≥$40 = 15; $35–39.99 = 12; $30–34.99 = 10; $25–29.99 = 8; $20–24.99 = 5; under $20 = 0
  - Ontario experience in the job-offer position: >24 mo = 18; 13–24 = 15; 6–12 = 12. Fallback for any Ontario experience: 12 / 9 / 6.
  - Canadian earnings (CRA NOA, last 5 years): ≥$80k = 10; $70–79,999 = 8; $50–69,999 = 6; $30–49,999 = 4
  - Status: work permit = 10; study permit = 5
  - Education: PhD or professional degree = 10; Master's = 8; Bachelor's = 6; college, Ontario College Graduate Certificate or trades = 5
  - Canadian credentials: more than one = 10; one = 5
  - Language: CLB 9+ = 15; 8 = 12; 7 = 8; 6 = 4. Both official languages at CLB 6+ = 10; one = 5.
  - Region: Northern = 15; Eastern, Central (non-GTA) or Southwestern = 10; GTA excluding Toronto = 5; Toronto = 0
- **Recent draws:** none published for OWP. Score cutoffs are unknown.
- **Related:** REDI regional round launched Oct 14–16, 2026, running to end of 2027. It covers Greater Sudbury, Kenora, Nipissing, Rainy River, Renfrew and Thunder Bay. No separate application is needed (OWP-linked). The earlier Lanark, Leeds and Grenville REDI pilot had 2026 rounds.
- **URLs:**
  - https://www.ontario.ca/page/ontario-workforce-priority-stream (updated 2026-10-20)
  - https://www.ontario.ca/page/oinp-employer-guide (updated 2026-10-20)
  - https://www.ontario.ca/page/2026-ontario-immigrant-nominee-program-updates
- **Verified:** 2026-10-27
- **Uncertainties:**
  - No OWP ITA data, so ranking and cutoffs are unknown.
  - Age and funds requirements are not stated on the stream page.
  - The 2026 nomination allocation is not stated on the fetched pages.
  - The full eligible-institution list was not extracted.

## ON legacy streams: CLOSED (keep in the screener as `status: closed` for explanation only)

| id | Name | Type | Status | Last 2026 draw data (official) |
|---|---|---|---|---|
| `on_ejo_intl_student` | Employer Job Offer: International Student | base | **Closed** (redesign; EOIs withdrawn) | Apr 30 GTA: 277 ITAs, score ≥81. Apr 23 regional cutoffs 84–87. Mar 25 GTA cutoff 90. |
| `on_ejo_foreign_worker` | Employer Job Offer: Foreign Worker | base | **Closed** | Apr 30 GTA: 786 ITAs, score ≥57. Healthcare/ECE round Apr 8: 1,635 ITAs total, FW ≥20, IS ≥46. |
| `on_ejo_ids` | Employer Job Offer: In-Demand Skills | base | **Closed** | Apr 15 agriculture and priority occupations: 1,334 ITAs, ≥35/36 |
| `on_masters` | Masters Graduate | base | **Closed** | Apr 22, 2026: 674 ITAs, score ≥61 |
| `on_phd` | PhD Graduate | base | **Closed** | Apr 22, 2026: 244 ITAs, score ≥56 |
| `on_ee_hcp` | Express Entry Human Capital Priorities | enhanced | **Closed May 30, 2026** (archived page banner) | n/a |
| `on_ee_fssw` | Express Entry French-Speaking Skilled Worker | enhanced | **Closed** | Francophone round Apr 8: 146 ITAs (Employer Job Offer streams) |
| `on_ee_trades` | Express Entry Skilled Trades | enhanced | **Suspended Nov 14, 2025, then closed** | n/a |
| `on_entrepreneur` | Entrepreneur | business | Closed: "all other streams are closed" | one-line only |

- **Note on Masters and PhD:** There is no longer a standalone no-job-offer route for Ontario Master's or PhD graduates. They now go through OWP with a job offer. They benefit from the 3-month experience option, the low-wage allowance, the CLB waiver, and education points.

---

# NEW BRUNSWICK (NBPNP)

- **General:** EOI submitted through Immigration New Brunswick; valid 365 days; free to submit. Invitations are based on labour market needs, allocation and priorities. A $250 fee applies before the full application.
- **2026 exclusions:** Accommodation and food services (NAICS 72) NOCs are excluded from **Skilled Worker and Express Entry** if the employer is NAICS 72. A further 14 occupations, mostly retail plus fish and seafood plant workers, are excluded regardless of sector (notice of Feb 3, 2026; exact NOC list on the notice page).
- **URLs:**
  - https://www.gnb.ca/en/topic/family-home-community/immigration/provincial-nominee-program.html
  - https://www.gnb.ca/en/topic/family-home-community/immigration/important-notices.html
  - https://www.gnb.ca/en/topic/family-home-community/immigration/invitation-selection-rounds.html

## NB-SW-EXP: Skilled Worker, New Brunswick Experience
- **id:** `nb_sw_nb_experience`
- **Type:** base
- **Status:** Invitation-only (EOI). Since **May 4, 2026, ITAs are limited to health care, education and construction occupations** because of limited allocation.
- **Eligibility:**
  - job_offer_required: true. Currently working full-time, non-seasonal, for a supporting employer that has operated in NB for 24+ months.
  - teer: null (not stated on the page; guide PDF not fetchable)
  - min_clb: 4 (all skills)
  - education: high school diploma minimum
  - work_experience: ≥6 months full-time with the same employer
  - residence_in_province: lived in NB for the past 6 months
  - age: ≥19
  - wage, funds: null
  - occupation_restrictions: Feb 3, 2026 exclusions; May 4, 2026 sector limit (health, education, construction)
- **Selection:** EOI draws by sector
- **2026 draws:** Usually run jointly with NB Graduates. Jan 13–15: 244 (combined); Feb 11: 196 (health); Mar 3–6: 279; May 1: 87 (health); May 3: 113; Jun 3: 243 (construction, health); Jul 16–18: 58 (with NB Priorities; construction, health); Sep 15–18: 197 (with NB Graduates).
- **Uncertainties:** TEER, wage and permanence wording are in the "NB Experience" guide (June 2026), which was not fetchable.

## NB-SW-GRAD: Skilled Worker, New Brunswick Graduates
- **id:** `nb_sw_nb_graduates`
- **Type:** base
- **Status:** Invitation-only (EOI). Active, with a dedicated round on Jul 18, 2026 of 209 ITAs across all major sectors.
- **Eligibility:**
  - education: completed a **PGWP-eligible program at a DLI located in New Brunswick**. Graduation time window: null (not stated on the page).
  - job_offer_required: true. Working in, or has accepted, a full-time non-seasonal position with a supporting employer (24+ months in NB).
  - min_clb: 4
  - residence_in_province: lived in NB for the past 6 months
  - work_experience: null (none stated)
  - age: ≥19
  - occupation_restrictions: Feb 3, 2026 exclusions apply. The May 4 sector limit applies to NB Experience only.
- **2026 draws:** Jul 18: 209. Jun 3: 138 (education, construction, health, transport). Plus the combined rounds above.
- **URL:** https://www.gnb.ca/en/topic/family-home-community/immigration/provincial-nominee-program/skilled-worker-stream.html
- **Uncertainties:** Graduation window, TEER and wage are in the guide PDF (June 2026), which was not fetchable.

## NB-SW-PRIORITY: Skilled Worker, New Brunswick Priority Occupations
- **id:** `nb_sw_priority_occupations`
- **Type:** base
- **Status:** Invitation-only. The job offer **must result from a GNB-led recruitment mission**, so this route is effectively not open to self-initiated applicants. Draw: Jul 16–18, 2026 (with NB Experience).
- **Eligibility:**
  - full-time non-seasonal offer
  - NOC on the guide's priority list
  - ≥1 year paid related experience
  - high school diploma
  - CLB 4
  - age ≥19
- **Screener note:** Flag as "recruitment-mission only".

## NB-EE-EMP: Express Entry, Employment in New Brunswick
- **id:** `nb_ee_employment_in_nb`
- **Type:** enhanced
- **Status:** Invitation-only (EOI). Active in 2026.
- **Eligibility:**
  - express_entry_profile: required
  - age: 19–55
  - min_clb: 7
  - education: Canadian high school or foreign equivalent
  - work_experience: ≥1 year continuous within the last 10 years in one NOC, TEER 0–3, **plus** 12 months living and working full-time in NB in TEER 0–3 roles while authorized
  - job: currently full-time, non-seasonal, TEER 0–3, with an eligible NB employer (24+ months in NB)
  - residence_in_province: lived and worked in NB for the past 12 months
  - points: ≥67/100 on the NB grid
  - occupation_restrictions: Feb 3, 2026 exclusions
- **2026 draws:** Jan 13–15: 20; Feb 2: 170; Mar 3–6: 29; Mar 30: 25; Apr 30: 17; Jun 4: 75; Jul 16: 115; Sep 17: 102
- **URL:** https://www.gnb.ca/en/topic/family-home-community/immigration/provincial-nominee-program/express-entry-stream.html

## NB-EE-INTEREST: Express Entry, New Brunswick Interest
- **id:** `nb_ee_nb_interest`
- **Type:** enhanced
- **Status:** Invitation-only. Requires a **letter of interest from NB sent through the federal Express Entry profile**. **No 2026 rounds listed** for this pathway.
- **Eligibility:**
  - EE profile
  - age 19–55
  - CLB 7
  - high school education
  - 1 year TEER 0–3 experience in the last 10 years
  - federal proof of funds
  - points ≥67
  - no job offer
- **Uncertainties:** Whether any letters were issued in 2026.

## NB-SI-FWNB: Strategic Initiative, Francophone Workers in NB
- **id:** `nb_si_francophone_workers`
- **Type:** base
- **Status:** Invitation-only. Active in 2026 after not returning for 2025.
- **Eligibility:**
  - min_nclc_french: 5 (all skills). English CLB: null.
  - age ≥19
  - education: high school or equivalent
  - work_experience: 1 year in the last 5 years. Waived for graduates of an NB post-secondary institution.
  - job_offer_required: true. Permanent, full-time, non-seasonal, with an NB employer active for 12+ months.
  - residence_in_province: ≥6 months in NB, unless the job came through a GNB recruitment mission
  - funds: required, unless living in NB or holding an NB job offer
  - points: ≥65/100
- **2026 draws (combined with NB Francophone Priorities):** Jan 13–15: 115 (Priorities only); Feb 2: 160; Mar 3–6: 189; Apr 30: 106; Jun 3: 52 (FWNB) + 94 (Priorities); Jul 16: 254; Sep 11: 251
- **URL:** https://www.gnb.ca/en/topic/family-home-community/immigration/provincial-nominee-program/strategic-initiative.html

## NB-SI-FPRIO: Strategic Initiative, NB Francophone Priorities
- **id:** `nb_si_francophone_priorities`
- **Type:** base
- **Status:** Invitation-only
- **Sub-routes:**
  - (a) **Francophone graduate:** completed an in-person program of ≥1 year at **Université de Moncton or CCNB**, physically present for the whole program, and currently living in NB.
  - (b) **Letter of interest** from Immigration New Brunswick.
- **Common criteria:**
  - NCLC 5
  - age ≥19
  - high school education
  - experience: 1 year in the last 5 years, waived for NB graduates
  - funds: required unless living in NB
  - points ≥65
- **Job offer:** not required

## NB-SI-REMOTE: Strategic Initiative, Francophones Working Remotely in NB
- **id:** `nb_si_francophone_remote`
- **Type:** base
- **Eligibility:**
  - works remotely for a Canadian employer outside Quebec
  - lived in NB for 12 months
  - NCLC 5, age ≥19, high school education, 1 year of experience, points ≥65
- **Status:** Listed on the page. No separate draw data.

## NB-PCCG: Private Career College Graduate Pilot
- **id:** `nb_pccg_pilot`
- **Type:** base
- **Status:** **Limited**. Extended through the end of 2027 only for international students **already registered** in eligible programs (2026 notices page). Not open to new students.
- **Eligibility:**
  - completed an eligible program in education and social development or health at a participating NB private career college
  - full-time, non-seasonal offer related to the program (employer 24+ months in NB)
  - CLB 5
  - age ≥19
  - must complete nomination and apply for a closed work permit within **90 days** of the program completion date
- **URL:** https://www.gnb.ca/en/topic/family-home-community/immigration/provincial-nominee-program/pccg-pilot-program.html

## NB-CWP: Critical Worker Pilot
- **id:** `nb_critical_worker_pilot`
- **Type:** base, for employer-designated participants
- **Status:** Listed on the NBPNP page; details not fetchable (allowlist)
- **Uncertainties:** Status and end date are unverified.

## NB Business Immigration stream
- Listed on the NBPNP page; status not stated (entrepreneur stream, one line only).

---

# NOVA SCOTIA (NSNP)

- **Official site:** https://liveinnovascotia.com (Government of NS, Department of Labour, Skills and Immigration). The legacy novascotiaimmigration.com domain redirects here.
- **Structure since Feb 18, 2026:** 4 streams.
- **EOI:**
  - Submitted through the eNSNP.
  - Valid 12 months, starting May 1, 2026.
  - Application fees apply from Sep 1, 2026.
  - Selections are announced as monthly totals only: Jan 363; Feb 357; Mar 370; Apr 161; May 789; Jun 531; Jul 671; Aug 1,212; Sep 946. January–September total: 5,400.
  - Selected "primarily" from healthcare, skilled trades and other priority occupations. No per-stream breakdown.
- **Sector closure:** A 2024 note closing the Accommodation and Food Services sector is still displayed. Treat as "possibly in effect".

## NS-SW: Skilled Worker
- **id:** `ns_skilled_worker`
- **Type:** base
- **Status:** Open via EOI
- **Pathways:**
  - (A) General Skilled Worker
  - (B) Critical Construction Worker
  - (C) Physicians
  - (D) Occupations In-Demand: **no occupations currently listed, so dormant**
- **Eligibility, common** (Skilled Worker guide dated Sep 2026):
  - job_offer_required: true. Full-time (≥30 h/wk, year-round), **permanent (no end date)**. Employer must have operated in NS for ≥2 years and be registered in NS.
  - wage: meets provincial standards and the Job Bank wage range for the NOC
  - age: 21–55 (physicians exempt)
  - funds: IRCC settlement-funds table by family size. May be reduced case by case if living in NS or holding arranged employment. Refused if family income is likely below the LICO.
  - legal status in the current country of residence
- **(A) General:**
  - high school education
  - **12 months / 1,560 h paid related experience in the last 5 years**
  - TEER 4–5 also needs 6 months with the NS employer
  - CLB 5 for TEER 0–3 (test not needed for native speakers); CLB 4 for TEER 4–5 (test always required, ≤2 years old)
  - **PGWP holders in TEER 5 jobs are ineligible**
- **(B) Construction:**
  - employer in NAICS 23
  - NOC in {70010, 70011, 72011, 72014, 72020, 72102, 72106, 72200, 72201, 72310, 72320, 72401, 72402, 72500, 73100, 73102, 73110, 73200, 73400, 75101, 75110, 75119}
  - 12 months / 1,560 h experience
  - high school or construction training program
  - CLB 5 (TEER 0–3) or CLB 4 (TEER 4–5)
- **(C) Physicians:**
  - NOC 31100, 31101 or 31102
  - approved offer from NS Health or IWK
  - 2-year return-for-service commitment
- **(D) Occupations In-Demand:**
  - TEER 3–5
  - CLB 4
  - 12 months experience
  - occupation must be on the list, which is currently empty
- **Ineligible:**
  - self-employment or ownership of the employer
  - commission-only jobs
  - some home-based, telework and trucking arrangements
  - NSNP or AIP nomination within the last 12 months
  - currently in Canadian post-secondary study
- **Selection:** EOI, then selection by priority occupations
- **URLs:**
  - https://liveinnovascotia.com/skilled-worker
  - Guide: https://liveinnovascotia.com/sites/default/files/2026-02/Guide-NSNP-Skilled-Worker-English.pdf (dated Sep 2026 in its text)
- **Uncertainties:** Whether the Accommodation and Food Services closure is still active.

## NS-GRAD: Nova Scotia Graduate (formerly International Graduates in Demand)
- **id:** `ns_graduate`
- **Type:** base
- **Status:** Open via EOI, for 4 occupations
- **Eligibility:**
  - age: 19–55
  - job_offer_required: true. Full-time, permanent, NS employer, in an eligible NOC matching recent study.
  - eligible_nocs and required credential:
    - 32102 Paramedical occupations: diploma
    - 32124 Pharmacy technicians: diploma
    - 33102 Nurse aides, orderlies and patient service associates: certificate, diploma or degree
    - 42202 Early childhood educators and assistants: diploma or degree
  - education: high school, plus a program at an **NS DLI** of ≥30 weeks (≥24 weeks for 33102), with ≥50% completed in NS
  - graduation_window: program requirements met **within 3 years** of application
  - certification: required NS regulatory certification
  - min_clb: 5
  - funds: sufficient (no amount stated)
- **URL:** https://liveinnovascotia.com/nova-scotia-graduate
- **Uncertainties:** Work permit type is not addressed.

## NS-EE: Nova Scotia: Express Entry (absorbed Nova Scotia Experience: Express Entry, Labour Market Priorities, and LMP for Physicians)
- **id:** `ns_express_entry`
- **Type:** enhanced
- **Status:** Open via EOI
- **Pathways on the official page:**
  - **(1) Skilled Work Experience in Nova Scotia:**
    - EE profile
    - age 21–55
    - ≥1 year NS work experience in TEER 0–3
    - Canadian high school or equivalent
    - CLB 7 for TEER 0/1; CLB 5 for TEER 2/3
    - **if the claimed experience was gained on a PGWP, the applicant must have graduated from an NS institution**
    - job offer not stated
  - **(2) Physicians:**
    - NSHA or IWK approved offer (NOC 31100, 31101, 31102)
    - return-for-service agreement (2 years)
    - **Letter of Interest** through Express Entry; EOI within 30 days
- **Critical Vacancies / Labour Market Priorities:** NS sends a **Notice of Interest** to Express Entry profiles. Active vacancy forms cover 32101, 33102, 70010, 72014, 72020, 72104, 72106, 72310, 73100, 73102, 72100, 72401, 72410 and 22300. This is explicitly **not** an ITA. It matches candidates to employers, who may then use the PNP or AIP.
- **URLs:**
  - https://liveinnovascotia.com/express-entry
  - https://liveinnovascotia.com/critical-vacancies
- **Uncertainties:**
  - Funds are not stated for pathway 1.
  - Whether an LMP-style "no job offer" letter-of-interest route still exists outside Critical Vacancies is not confirmed.

## NS Entrepreneur
- Consolidated Entrepreneur plus International Graduate Entrepreneur stream. Status: listed. Not detailed (entrepreneur stream).

---

# PRINCE EDWARD ISLAND (PEI PNP)

- **General:**
  - EOI through eoi.princeedwardisland.ca; EOI profile active **6 months**.
  - Monthly draws for "Labour Impact & Express Entry" combined. PEI does not publish a split by stream or minimum scores.
  - Priority goes to people living and working in PEI and to graduates of UPEI, Holland College and Collège de l'Île. Priority sectors: healthcare, trades, manufacturing.
- **Official pages fetched:**
  - https://www.princeedwardisland.ca/en/topic/immigrate-to-pei-as-a-worker
  - https://www.princeedwardisland.ca/en/topic/expression-of-interest
  - PEI Express Entry guide PDF
  - EE one-pager
- **Not fetchable:** individual stream pages (allowlist) and the workforce guide PDF (republished Mar 30, 2026). **Labour Impact criteria below come from the hub page only. Detailed thresholds are UNVERIFIED for 2026.**
- **2026 draws** `[secondary: immigration.ca / CIC News; official EOI-draws page not fetchable beyond a Jan 15 row]`:
  - Jan 15: 26
  - Feb 19: 109
  - Mar 20: 101
  - Apr 16: 127
  - May 21: 113
  - Jun 18: 182
  - Jul 16: 195
  - Aug 20: 181
  - Sep 17: 195
  - Oct 7: 90 (unscheduled)
  - Oct 16: 164
  - **Total 1,483.** No Business Impact draws.
  - Remaining scheduled: Nov 19 and Dec 17. Invitees have 30 days to apply.

## PEI-LI-SW: Labour Impact, Skilled Workers in PEI
- **id:** `pei_li_skilled_worker_in_pei`
- **Type:** base
- **Status:** Invitation-only (EOI). Listed as current.
- **Official summary:** "for people currently employed by an Island employer"
- **Eligibility:**
  - job_offer_required: true (currently employed in PEI)
  - Other thresholds (TEER, CLB, education, experience, age, funds): **unverified**, because the guide was not fetchable
- **URL:** https://www.princeedwardisland.ca/en/information/office-of-immigration/skilled-workers-in-pei

## PEI-LI-SWOC: Labour Impact, Skilled Workers Outside Canada
- **id:** `pei_li_skilled_worker_outside_canada`
- **Type:** base
- **Status:** Listed
- **Eligibility:** Employer-led. The PEI employer must obtain Office of Immigration authorization before issuing the job offer.
- **Screener note:** Not applicable to in-Canada students or workers. The detailed thresholds are unverified.

## PEI-LI-CW: Labour Impact, Critical Workers
- **id:** `pei_li_critical_worker`
- **Type:** base
- **Status:** Listed
- **Official summary:** "for people working full-time in PEI", tied to employers
- **Eligibility:** Thresholds unverified. These typically cover TEER 4–5 roles with tenure at the PEI employer, but this is not verified for 2026.
- **URL:** https://www.princeedwardisland.ca/en/information/office-of-immigration/critical-workers

## PEI-LI-IG: Labour Impact, International Graduates
- **id:** `pei_li_international_graduate`
- **Type:** base
- **Status:** Invitation-only. Graduates received **priority** in 2026 draws `[secondary]`.
- **Official summary:** "for graduates of a publicly funded PEI post-secondary institution"
- **Eligibility:**
  - education: graduate of a **publicly funded PEI post-secondary institution** (UPEI, Holland College, Collège de l'Île)
  - Graduation window, job/TEER, months employed, CLB and PGWP: **unverified for 2026**
- **URL:** https://www.princeedwardisland.ca/en/information/office-of-immigration/international-graduates

## PEI-EE: PEI Express Entry
- **id:** `pei_express_entry`
- **Type:** enhanced
- **Status:** Invitation-only (EOI, combined monthly draws)
- **Eligibility:**
  - express_entry_profile: required. Must qualify for FSW, FST or CEC.
  - job_offer_required: false. There are separate point grids with and without a job offer.
  - min_clb: federal minimum for the EE program. Points start at CLB 7.
  - residence: no hard requirement. **Priority** for people living and working in PEI in a job matching their education or experience.
  - funds: sufficient. Six months of bank statements; $300 fee.
  - EE cannot be used to extend an expiring work permit.
- **EOI points (100 max):**
  - Age: 18–24 = 7; 25–29 = 20; 30–44 = 15; 45–49 = 10
  - Language: CLB 9–10 = 20; 8 = 15; 7 = 10; second-language bonus 10
  - Education: Master's or PhD = 15; Bachelor's = 12; 2-year trade diploma = 10
  - Work experience: 15 points with a job offer, 20 without
  - Employment: 15 points with a job offer, 10 without
  - Adaptability (15): includes a PEI post-secondary degree, family in PEI, etc.
- **URLs:**
  - https://www.princeedwardisland.ca/sites/default/files/publications/pei_pnp_express_entry_guide.pdf (undated)
  - https://www.princeedwardisland.ca/sites/default/files/publications/ee_1-pager.pdf
- **Uncertainties:** The guide is undated. Points may have changed.

## PEI Occupations in Demand / Intermediate Experience
- **ids:** `pei_occupations_in_demand`, `pei_intermediate_experience`
- **Type:** base
- **Status:** Listed on the hub
- **Eligibility:** Both are described as "recruitment from outside Canada with prior Office of Immigration authorization, then a work permit". These are employer-led, work-permit-first streams.
- **Uncertainties:** Criteria and whether they lead directly to nomination are unverified.

## PEI Business Impact (Work Permit Stream)
- Listed; **no 2026 draws** `[secondary]`. Entrepreneur stream, one line only.

---

# NEWFOUNDLAND AND LABRADOR (NLPNP)

- **General:**
  - Since **Feb 19, 2025**, all economic immigration (NLPNP and AIP) goes through the **EOI model** in the Immigration Accelerator Portal.
  - EOIs are valid 12 months. Invitees have 60 days to submit.
  - EOI-invited applicants "may not need a job offer at the time of application". This is stated in the eligibility PDFs, but the categories are still built around job offers.
- **Prioritization criteria** (updated Mar 23, 2026):
  - health occupations
  - rural sales and service roles
  - rural and regional jobs
  - underrepresented occupations (business and finance, science and research, trades and transport)
  - strong employers
  - likely retention
  - **NL graduates in priority sectors**
  - Francophone candidates
  - settlement support
- **ITA rounds:**
  - 2025: 13 rounds, 3,376 ITAs (NLPNP 2,473)
  - 2026: Mar 6 = 445 total (NLPNP 362, AIP 83); Mar 30 = 245 total (NLPNP 209, AIP 36)
  - **No rounds published after Mar 30, 2026.** The page was last updated then. Rounds may not be published, or may not have occurred.
- **URLs:**
  - https://www.gov.nl.ca/immigration/invitations-to-apply-updates/
  - https://www.gov.nl.ca/immigration/expression-of-interest-model-prioritization-criteria/
  - https://www.gov.nl.ca/immigration/expression-of-interest-model-overview/

## NL-EESW: Express Entry Skilled Worker
- **id:** `nl_ee_skilled_worker`
- **Type:** enhanced
- **Status:** Invitation-only (EOI)
- **Eligibility:**
  - express_entry_profile: required
  - job_offer_required: true. Full-time (≥30 h/wk), ≥12 months with expected extension, eligible NL employer, salary or hourly pay (not commission), meets the regional prevailing wage. Needs a JVA or LMIA, or a work permit authorizing the job. **Exception:** EOI-invited applicants may not need an offer at application.
  - teer: 0–3
  - min_clb: per the federal EE program
  - education: Canadian post-secondary credential or an ECA
  - points: ≥67 on the NLPNP grid
  - age: null (not stated)
  - **PGWP holders are eligible**
  - in Canada: ≥4 months left on the permit at application
  - ownership of the employer ≤10%
  - funds: sufficient (no amount)
- **URL:** https://www.gov.nl.ca/immigration/files/4.-Express-Entry-Skilled-Worker-Category-Eligibility-Criteria.pdf (undated)

## NL-SW: Skilled Worker
- **id:** `nl_skilled_worker`
- **Type:** base
- **Status:** Invitation-only (EOI)
- **Eligibility:**
  - job_offer_required: true. Same job criteria as above, any TEER 0–5. A JVA is needed if there is no work permit. EOI-invited exception as above.
  - min_clb: 4 for TEER 4–5 only. No test required for TEER 0–3.
  - age: 21–59
  - education and experience: must meet the NOC job requirements
  - **PGWP holders are NOT eligible.** They must use International Graduate or EE Skilled Worker.
  - ≥4 months permit validity
  - funds: sufficient
- **URLs:**
  - https://www.gov.nl.ca/immigration/files/4.-Skilled-Worker-Category-Eligibility-Criteria-1.pdf (undated)
  - https://www.gov.nl.ca/immigration/immigrating-to-newfoundland-and-labrador/provincial-nominee-program/applicants/skilled-worker/

## NL-IG: International Graduate
- **id:** `nl_international_graduate`
- **Type:** base
- **Status:** Invitation-only (EOI). NL graduates are a stated priority.
- **Eligibility:**
  - education: completed a post-secondary program **in Canada**. No minimum length or graduation window stated.
  - **Graduates of Memorial University or College of the North Atlantic:** the job need not be related to their field.
  - **Graduates of other Canadian public institutions:** the job must be directly related to their field, and they must have **worked ≥1 year in NL** before applying.
  - **PGWP required**, with ≥4 months validity
  - job_offer_required: true. Full-time, ≥12 months, NL employer, prevailing wage. **TEER 0–3, or TEER 4 if on OIM's in-demand list.**
  - min_clb: 4, only for TEER 4 offers
  - age: 21–59
  - funds: sufficient
  - ineligible: sponsored study with a return obligation
- **URLs:**
  - https://www.gov.nl.ca/immigration/files/4.-International-Graduate-Eligibility-Criteria.pdf (undated)
  - https://www.gov.nl.ca/immigration/?p=4032 (modified 2025-05-26)

## NL Priority Skills NL
- **id:** `nl_priority_skills`
- **Status:** **UNVERIFIED, probably inactive.** It is not listed among NLPNP categories on the current overview page (modified 2025-10-08).
- **Original 2020 criteria:**
  - Memorial University Master's or PhD graduates within 3 years, or 1 year of specialized high-demand experience in the last 10 years
  - sectors: ICT, ocean tech, health, agriculture, aquaculture
  - CLB 5
  - age ≥21
- **Screener note:** Do not offer it as an active route.

## NL International Entrepreneur / International Graduate Entrepreneur
- Listed on the overview. Status not stated (entrepreneur streams).

---

# Items I could NOT verify (open to-do list)
1. **ON:** Any OWP invitation round, cutoff or volume (none published as of Oct 27, 2026). The 2026 nomination allocation figure. Age and funds rules for OWP.
2. **NB:** Pathway guide PDFs, which hold TEER, wage, NB Graduates time window and the exact excluded NOC list detail. Critical Worker Pilot status. Whether NB Interest letters were issued in 2026.
3. **NS:** Whether the 2024 Accommodation and Food closure is still in force. The per-stream split of EOI selections. Funds for the Express Entry pathway. Whether any no-job-offer LMP route survives beyond Critical Vacancies.
4. **PEI:**
   - All detailed Labour Impact thresholds (Critical Worker, Skilled Worker, International Graduate: CLB, months with employer, graduation window, PGWP requirement)
   - The official EOI-draws table: counts came from secondary sources
   - Whether the EE points grid is current
   - Status of Occupations in Demand and Intermediate Experience
5. **NL:** ITA rounds after Mar 30, 2026. Status of Priority Skills NL. Dates on the eligibility PDFs (undated).

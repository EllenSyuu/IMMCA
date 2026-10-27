/**
 * Ontario and the Atlantic provinces (NB, NS, PE, NL).
 * Verified 2026-10-27 against official program pages; see `sources` on each spec.
 */
import {
  ageRange, anyOf, canadianGraduate, custom, intendsToLive, jobOffer, minEducation,
  minLanguage, note, settlementFunds, workExperience,
} from '../../engine/criteria';
import type { ProgramSpec } from '../../engine/types';
import { L, VERIFIED, expressEntryEligible, FUNDS_TABLE } from './shared';

const nb = 'https://www.gnb.ca/en/topic/family-home-community/immigration/provincial-nominee-program';

export const eastPrograms: ProgramSpec[] = [
  // ---------------------------------------------------------------- Ontario
  {
    id: 'on-workforce-priority',
    jurisdiction: 'ON',
    kind: 'pnp-base',
    status: 'open',
    name: L('OINP Ontario Workforce Priority', 'POCIO Priorité main-d’œuvre de l’Ontario', '安省提名 – 安省劳动力优先类别'),
    summary: L(
      'Ontario’s only open stream since June 2026: a permanent full-time job offer at the regional median wage from an approved Ontario employer.',
      'Seul volet ouvert en Ontario depuis juin 2026 : une offre permanente à temps plein au salaire médian régional d’un employeur ontarien approuvé.',
      '自 2026 年 6 月起安省唯一开放的类别：需要获批安省雇主提供的、达到地区工资中位数的永久全职工作邀请。',
    ),
    criteria: [
      jobOffer({ province: 'ON', permanent: true, fullTime: true }),
      anyOf(
        'check.oneOf',
        [canadianGraduate({ province: 'ON', minProgramMonths: 24, withinMonths: 36 }), workExperience({ months: 3, province: 'ON', withinMonths: 12, continuous: true })],
        [canadianGraduate({ province: 'ON', levels: ['master', 'phd'], withinMonths: 36 }), workExperience({ months: 3, province: 'ON', withinMonths: 12, continuous: true })],
        [workExperience({ months: 6, inCanada: true, withinMonths: 12, continuous: true })],
        [workExperience({ months: 24, withinMonths: 60 })],
      ),
      anyOf(
        'check.oneOf',
        [canadianGraduate({ province: 'ON', withinMonths: 36 })],
        [custom('check.clbByTeer', (p) => {
          const need = p.jobOffer && p.jobOffer.teer >= 4 ? 4 : 6;
          const en = p.english ? Math.min(p.english.listening, p.english.reading, p.english.writing, p.english.speaking) : 0;
          const fr = p.french ? Math.min(p.french.listening, p.french.reading, p.french.writing, p.french.speaking) : 0;
          return Math.max(en, fr) >= need;
        }, { high: 6, low: 4 }, 'hint.raiseLanguage')],
      ),
      minEducation('one-year', { requireEcaIfForeign: true }),
      intendsToLive('ON'),
    ],
    notes: [
      L(
        'Recent Ontario graduates (2-year+ diploma, graduate certificate, master’s or PhD within 3 years) need only 3 months in the job, may be paid at the lower wage level and are exempt from the language test.',
        'Les diplômés récents de l’Ontario (diplôme de 2 ans ou plus, certificat postdiplôme, maîtrise ou doctorat depuis moins de 3 ans) n’ont besoin que de 3 mois dans le poste, peuvent être payés au niveau salarial inférieur et sont dispensés du test de langue.',
        '安省近期毕业生（3 年内取得 2 年以上文凭、研究生证书、硕士或博士）只需在该职位工作 3 个月，可按较低工资标准，并免语言考试。',
      ),
      L(
        'The EOI portal opened 2026-08-04; Ontario has not yet published invitation rounds or cutoffs for this stream. The former Masters and PhD Graduate streams (no job offer) are closed.',
        'Le portail des déclarations d’intérêt a ouvert le 2026-08-04 ; l’Ontario n’a pas encore publié de rondes d’invitations pour ce volet. Les anciens volets Maîtrise et Doctorat (sans offre) sont fermés.',
        'EOI 系统于 2026-08-04 开放，安省尚未公布该类别的邀请轮次或分数线。原无需工作邀请的硕士、博士毕业生类别已关闭。',
      ),
    ],
    sources: [
      { url: 'https://www.ontario.ca/page/ontario-workforce-priority-stream', verified: VERIFIED },
      { url: 'https://www.ontario.ca/page/2026-ontario-immigrant-nominee-program-updates', verified: VERIFIED },
    ],
  },
  {
    id: 'on-masters-phd-graduate',
    jurisdiction: 'ON',
    kind: 'pnp-base',
    status: 'closed',
    name: L('OINP Masters / PhD Graduate (closed)', 'POCIO Diplômés de maîtrise / doctorat (fermé)', '安省提名 – 硕士 / 博士毕业生类（已关闭）'),
    summary: L(
      'Closed in 2026 when Ontario replaced its eight streams. The last draw (2026-04-22) invited 674 master’s graduates at 61+ and 244 PhD graduates at 56+.',
      'Fermé en 2026 lorsque l’Ontario a remplacé ses huit volets. Le dernier tirage (2026-04-22) a invité 674 diplômés de maîtrise à 61+ et 244 diplômés de doctorat à 56+.',
      '2026 年安省合并八个类别时关闭。最后一次抽签（2026-04-22）邀请 674 名硕士（61 分以上）和 244 名博士（56 分以上）。',
    ),
    criteria: [canadianGraduate({ province: 'ON', levels: ['master', 'phd'], withinMonths: 24 })],
    sources: [{ url: 'https://www.ontario.ca/page/2026-ontario-immigrant-nominee-program-updates', verified: VERIFIED }],
  },

  // ---------------------------------------------------------------- New Brunswick
  {
    id: 'nb-graduates',
    jurisdiction: 'NB',
    kind: 'pnp-base',
    status: 'invitation-only',
    name: L('NBPNP Skilled Worker – NB Graduates', 'PCNB Travailleur qualifié – Diplômés du N.-B.', '新省提名 – 技术工人：新省毕业生'),
    summary: L(
      'Graduates of a New Brunswick school working for, or hired by, a New Brunswick employer.',
      'Diplômés d’un établissement du Nouveau-Brunswick qui travaillent pour un employeur néo-brunswickois ou ont été embauchés par lui.',
      '新不伦瑞克省院校毕业、为新省雇主工作或已获其聘用的人。',
    ),
    criteria: [
      canadianGraduate({ province: 'NB' }),
      jobOffer({ province: 'NB', fullTime: true }),
      minLanguage(4),
      custom('check.livesIn6', (p) => p.currentProvince === 'NB', { where: 'prov.NB', months: 6 }),
      ageRange(19, 99),
    ],
    notes: [L(
      'Food-service jobs and 14 mostly retail occupations have been excluded since 2026-02-03.',
      'Les emplois en restauration et 14 professions surtout du commerce de détail sont exclus depuis le 2026-02-03.',
      '自 2026-02-03 起，餐饮业职位及 14 个以零售为主的职业被排除在外。',
    )],
    sources: [
      { url: `${nb}/skilled-worker-stream.html`, verified: VERIFIED },
      { url: 'https://www.gnb.ca/en/topic/family-home-community/immigration/important-notices.html', verified: VERIFIED },
    ],
  },
  {
    id: 'nb-experience',
    jurisdiction: 'NB',
    kind: 'pnp-base',
    status: 'invitation-only',
    name: L('NBPNP Skilled Worker – NB Experience', 'PCNB Travailleur qualifié – Expérience au N.-B.', '新省提名 – 技术工人：新省工作经验'),
    summary: L(
      'For people working full-time for a New Brunswick employer for six months. Since May 2026, only health, education and construction workers are invited.',
      'Pour les personnes travaillant à temps plein pour un employeur du N.-B. depuis six mois. Depuis mai 2026, seuls les travailleurs de la santé, de l’éducation et de la construction sont invités.',
      '适合为新省雇主全职工作满 6 个月的人。自 2026 年 5 月起只邀请医疗、教育和建筑行业。',
    ),
    criteria: [
      jobOffer({ province: 'NB', fullTime: true, nocs: ['3', '4', '7'] }),
      workExperience({ months: 6, province: 'NB', excludeStudentWork: true }),
      minLanguage(4),
      minEducation('secondary'),
      ageRange(19, 99),
    ],
    sources: [{ url: `${nb}/skilled-worker-stream.html`, verified: VERIFIED }],
  },
  {
    id: 'nb-express-entry',
    jurisdiction: 'NB',
    kind: 'pnp-enhanced',
    enhanced: true,
    status: 'invitation-only',
    name: L('NBPNP Express Entry – Employment in NB', 'PCNB Entrée express – Emploi au N.-B.', '新省提名 – 快速通道：新省就业'),
    summary: L(
      'Express Entry candidates who have lived and worked full-time in a skilled job in New Brunswick for 12 months.',
      'Candidats Entrée express ayant vécu et travaillé à temps plein dans un emploi qualifié au N.-B. pendant 12 mois.',
      '在新省生活并全职从事技术类工作满 12 个月的快速通道申请人。',
    ),
    criteria: [
      expressEntryEligible(),
      workExperience({ months: 12, province: 'NB', teers: [0, 1, 2, 3], excludeStudentWork: true }),
      jobOffer({ province: 'NB', teers: [0, 1, 2, 3], fullTime: true }),
      minLanguage(7),
      ageRange(19, 55),
    ],
    sources: [{ url: `${nb}/express-entry-stream.html`, verified: VERIFIED }],
  },
  {
    id: 'nb-francophone',
    jurisdiction: 'NB',
    kind: 'pnp-base',
    status: 'invitation-only',
    name: L('NBPNP Strategic Initiative – Francophones', 'PCNB Initiative stratégique – Francophones', '新省提名 – 法语人士战略计划'),
    summary: L(
      'French speakers (NCLC 5+) with a permanent New Brunswick job offer, or who graduated from Université de Moncton or CCNB.',
      'Francophones (NCLC 5+) ayant une offre permanente au N.-B., ou diplômés de l’Université de Moncton ou du CCNB.',
      '法语达到 NCLC 5 以上、持有新省永久工作邀请，或毕业于蒙克顿大学 / CCNB 的人。',
    ),
    criteria: [
      minLanguage(5, 'fr'),
      anyOf(
        'check.oneOf',
        [jobOffer({ province: 'NB', permanent: true, fullTime: true }), workExperience({ months: 12, withinMonths: 60 })],
        [canadianGraduate({ province: 'NB', minProgramMonths: 12 })],
      ),
      minEducation('secondary'),
      ageRange(19, 99),
    ],
    notes: [L(
      'Paused in 2025, drawing again in 2026 (251 invitations on 2026-09-11).',
      'Suspendue en 2025, de nouveau des tirages en 2026 (251 invitations le 2026-09-11).',
      '2025 年暂停，2026 年恢复抽签（2026-09-11 邀请 251 人）。',
    )],
    sources: [{ url: `${nb}/strategic-initiative.html`, verified: VERIFIED }],
  },

  // ---------------------------------------------------------------- Nova Scotia
  {
    id: 'ns-skilled-worker',
    jurisdiction: 'NS',
    kind: 'pnp-base',
    status: 'invitation-only',
    name: L('NSNP Skilled Worker', 'PCNÉ Travailleur qualifié', '新斯科舍提名 – 技术工人类'),
    summary: L(
      'A permanent full-time job offer from a Nova Scotia employer plus a year of related experience.',
      'Une offre permanente à temps plein d’un employeur de la Nouvelle-Écosse et un an d’expérience connexe.',
      '新斯科舍雇主的永久全职工作邀请，加一年相关工作经验。',
    ),
    criteria: [
      jobOffer({ province: 'NS', permanent: true, fullTime: true }),
      workExperience({ months: 12, withinMonths: 60 }),
      custom('check.clbByTeer', (p) => {
        const need = p.jobOffer && p.jobOffer.teer <= 3 ? 5 : 4;
        const en = p.english ? Math.min(p.english.listening, p.english.reading, p.english.writing, p.english.speaking) : 0;
        const fr = p.french ? Math.min(p.french.listening, p.french.reading, p.french.writing, p.french.speaking) : 0;
        return Math.max(en, fr) >= need;
      }, { high: 5, low: 4 }, 'hint.raiseLanguage'),
      minEducation('secondary'),
      ageRange(21, 55),
      settlementFunds(FUNDS_TABLE, (p) => p.currentProvince === 'NS' && !!p.jobOffer),
      custom('check.notStudying', (p) => p.status !== 'student'),
    ],
    notes: [L(
      'Since 2026-02-18 Nova Scotia has four streams; selections favour health care and skilled trades (5,400 selected Jan–Sep 2026).',
      'Depuis le 2026-02-18, la Nouvelle-Écosse a quatre volets ; les sélections favorisent la santé et les métiers (5 400 sélections de janvier à septembre 2026).',
      '自 2026-02-18 起新斯科舍合并为四个类别，优先医疗和技工行业（2026 年 1–9 月共选出 5,400 人）。',
    )],
    sources: [{ url: 'https://liveinnovascotia.com/skilled-worker', verified: VERIFIED }],
  },
  {
    id: 'ns-graduate',
    jurisdiction: 'NS',
    kind: 'pnp-base',
    status: 'invitation-only',
    name: L('NSNP Nova Scotia Graduate', 'PCNÉ Diplômé de la Nouvelle-Écosse', '新斯科舍提名 – 新斯科舍毕业生类'),
    summary: L(
      'Nova Scotia graduates hired as paramedics, pharmacy technicians, nurse aides or early childhood educators.',
      'Diplômés de la Nouvelle-Écosse embauchés comme paramédics, techniciens en pharmacie, aides-infirmiers ou éducateurs à la petite enfance.',
      '受聘为急救医护、药剂技术员、护理助理或幼儿教育者的新斯科舍毕业生。',
    ),
    criteria: [
      canadianGraduate({ province: 'NS', withinMonths: 36 }),
      jobOffer({ province: 'NS', nocs: ['32102', '32124', '33102', '42202'], permanent: true, fullTime: true }),
      minLanguage(5),
      ageRange(19, 55),
    ],
    sources: [{ url: 'https://liveinnovascotia.com/nova-scotia-graduate', verified: VERIFIED }],
  },
  {
    id: 'ns-express-entry',
    jurisdiction: 'NS',
    kind: 'pnp-enhanced',
    enhanced: true,
    status: 'invitation-only',
    name: L('NSNP Nova Scotia: Express Entry', 'PCNÉ Nouvelle-Écosse : Entrée express', '新斯科舍提名 – 快速通道类'),
    summary: L(
      'Express Entry candidates with a year of skilled work in Nova Scotia. If that work was on a PGWP, you must have graduated in Nova Scotia.',
      'Candidats Entrée express ayant un an de travail qualifié en Nouvelle-Écosse. Si ce travail était sous PTPD, vous devez avoir obtenu votre diplôme en Nouvelle-Écosse.',
      '在新斯科舍有一年技术类工作经验的快速通道申请人。若该经验是持 PGWP 获得的，须为新斯科舍毕业生。',
    ),
    criteria: [
      expressEntryEligible(),
      workExperience({ months: 12, province: 'NS', teers: [0, 1, 2, 3], excludeStudentWork: true }),
      custom('check.pgwpLocalGrad', (p) => p.status !== 'graduate-pgwp' || p.canadianStudy?.province === 'NS', { where: 'prov.NS' }),
      minLanguage(5),
      ageRange(21, 55),
    ],
    sources: [{ url: 'https://liveinnovascotia.com/express-entry', verified: VERIFIED }],
  },

  // ---------------------------------------------------------------- Prince Edward Island
  {
    id: 'pe-international-graduate',
    jurisdiction: 'PE',
    kind: 'pnp-base',
    status: 'invitation-only',
    name: L('PEI PNP Labour Impact – International Graduates', 'PCÎPÉ Impact main-d’œuvre – Diplômés internationaux', '爱德华王子岛提名 – 劳动力影响：国际毕业生'),
    summary: L(
      'Graduates of UPEI, Holland College or Collège de l’Île working on the Island. Local graduates get priority in the monthly draws.',
      'Diplômés de l’UPEI, du Holland College ou du Collège de l’Île travaillant dans l’Île. Les diplômés locaux ont la priorité dans les tirages mensuels.',
      '在岛上工作的 UPEI、Holland College 或 Collège de l’Île 毕业生，月度抽签中优先考虑本地毕业生。',
    ),
    criteria: [
      canadianGraduate({ province: 'PE' }),
      jobOffer({ province: 'PE', fullTime: true }),
      note('check.unverifiedDetail'),
    ],
    notes: [L(
      'Monthly draws continue (164 invited on 2026-10-16; next scheduled 2026-11-19 and 2026-12-17). PEI does not publish its detailed 2026 thresholds online in a form this screener could verify.',
      'Les tirages mensuels continuent (164 invitations le 2026-10-16 ; prochains prévus le 2026-11-19 et le 2026-12-17). L’Î.-P.-É. ne publie pas ses seuils détaillés de 2026 sous une forme vérifiable par ce filtre.',
      '月度抽签持续进行（2026-10-16 邀请 164 人；下次安排在 2026-11-19 和 2026-12-17）。爱德华王子岛的 2026 年详细门槛无法由本工具核实。',
    )],
    sources: [
      { url: 'https://www.princeedwardisland.ca/en/information/office-of-immigration/international-graduates', verified: VERIFIED },
      { url: 'https://www.princeedwardisland.ca/en/topic/expression-of-interest', verified: VERIFIED },
    ],
  },
  {
    id: 'pe-express-entry',
    jurisdiction: 'PE',
    kind: 'pnp-enhanced',
    enhanced: true,
    status: 'invitation-only',
    name: L('PEI PNP Express Entry', 'PCÎPÉ Entrée express', '爱德华王子岛提名 – 快速通道'),
    summary: L(
      'Express Entry candidates, with or without a job offer. People living and working on the Island in their field get priority.',
      'Candidats Entrée express, avec ou sans offre d’emploi. Les personnes vivant et travaillant dans l’Île dans leur domaine sont prioritaires.',
      '快速通道申请人，有无工作邀请均可。在岛上生活并从事本专业工作的人优先。',
    ),
    criteria: [expressEntryEligible(), intendsToLive('PE')],
    sources: [{ url: 'https://www.princeedwardisland.ca/sites/default/files/publications/pei_pnp_express_entry_guide.pdf', verified: VERIFIED }],
  },

  // ---------------------------------------------------------------- Newfoundland and Labrador
  {
    id: 'nl-international-graduate',
    jurisdiction: 'NL',
    kind: 'pnp-base',
    status: 'invitation-only',
    name: L('NLPNP International Graduate', 'PCTNL Diplômé international', '纽芬兰提名 – 国际毕业生类'),
    summary: L(
      'Canadian graduates on a PGWP with a full-time skilled job offer in Newfoundland and Labrador. Memorial and CNA graduates don’t need the job to match their field.',
      'Diplômés canadiens titulaires d’un PTPD ayant une offre d’emploi qualifié à temps plein à T.-N.-L. Les diplômés de Memorial et du CNA n’ont pas besoin d’un emploi lié à leur domaine.',
      '持 PGWP、在纽芬兰与拉布拉多获技术类全职工作邀请的加拿大毕业生。Memorial 大学和北大西洋学院毕业生的工作无需与专业相关。',
    ),
    criteria: [
      canadianGraduate(),
      custom('check.pgwp', (p) => p.status === 'graduate-pgwp'),
      jobOffer({ province: 'NL', teers: [0, 1, 2, 3], fullTime: true }),
      anyOf('check.oneOf',
        [canadianGraduate({ province: 'NL' })],
        [workExperience({ months: 12, province: 'NL' })]),
      ageRange(21, 59),
    ],
    notes: [L(
      'All applications go through an invitation system. Only two 2026 rounds have been published (6 and 30 March).',
      'Toutes les demandes passent par un système d’invitations. Seules deux rondes de 2026 ont été publiées (6 et 30 mars).',
      '所有申请都通过邀请制。2026 年仅公布了两轮（3 月 6 日和 30 日）。',
    )],
    sources: [
      { url: 'https://www.gov.nl.ca/immigration/files/4.-International-Graduate-Eligibility-Criteria.pdf', verified: VERIFIED },
      { url: 'https://www.gov.nl.ca/immigration/invitations-to-apply-updates/', verified: VERIFIED },
    ],
  },
  {
    id: 'nl-express-entry',
    jurisdiction: 'NL',
    kind: 'pnp-enhanced',
    enhanced: true,
    status: 'invitation-only',
    name: L('NLPNP Express Entry Skilled Worker', 'PCTNL Travailleur qualifié Entrée express', '纽芬兰提名 – 快速通道技术工人'),
    summary: L(
      'Express Entry candidates with a full-time skilled job offer in Newfoundland and Labrador. PGWP holders are eligible.',
      'Candidats Entrée express ayant une offre d’emploi qualifié à temps plein à T.-N.-L. Les titulaires d’un PTPD sont admissibles.',
      '持有纽芬兰与拉布拉多技术类全职工作邀请的快速通道申请人，PGWP 持有者可申请。',
    ),
    criteria: [
      expressEntryEligible(),
      jobOffer({ province: 'NL', teers: [0, 1, 2, 3], fullTime: true }),
      note('check.nlPoints', { min: 67 }),
    ],
    sources: [{ url: 'https://www.gov.nl.ca/immigration/files/4.-Express-Entry-Skilled-Worker-Category-Eligibility-Criteria.pdf', verified: VERIFIED }],
  },
];

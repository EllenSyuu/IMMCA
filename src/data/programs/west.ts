/**
 * British Columbia, Alberta, Saskatchewan, Manitoba, Yukon and the Northwest
 * Territories. Nunavut has no nominee program (federal programs only).
 *
 * Verified 2026-10-27 against each province's official program pages; see
 * `sources` on every spec and docs/RESEARCH.md for the evidence log.
 */
import {
  ageRange, anyOf, canadianGraduate, custom, inCanadaNow, intendsToLive, jobOffer, languageForTeer,
  minLanguage, minEducation, note, settlementFunds, workExperience,
} from '../../engine/criteria';
import type { ProgramSpec } from '../../engine/types';
import { L, VERIFIED, crsAtLeast, expressEntryEligible, FUNDS_TABLE } from './shared';

const welcomeBC = 'https://www.welcomebc.ca/immigrate-to-b-c/about-the-bc-provincial-nominee-program/invitations-to-apply';
const aaip = 'https://www.alberta.ca/aaip-processing-information';
const sinp = 'https://www.saskatchewan.ca/residents/moving-to-saskatchewan/live-in-saskatchewan/by-immigrating/saskatchewan-immigrant-nominee-program';

/** Care (health, childcare, education, veterinary) and Build NOCs from WelcomeBC, updated 2026-06-17. */
const BC_CARE_BUILD = [
  '30010', '311', '312', '313', '3210', '3211', '3212', '32200', '33101', '33102', '41300', // health
  '42202', '41220', '41221', '31103', '32104', // childcare, French-language teachers, veterinary
  '72106', '72200', '72201', '72300', '72301', '72310', '72400', '72401', '72402', // construction trades
];

export const westPrograms: ProgramSpec[] = [
  // ---------------------------------------------------------------- BC
  {
    id: 'bc-skilled-worker',
    jurisdiction: 'BC',
    kind: 'pnp-base',
    status: 'invitation-only',
    name: L('BC PNP Skills Immigration – Skilled Worker', 'PCP C.-B. – Travailleur qualifié', '卑诗省提名计划 – 技术工人类'),
    summary: L(
      'For workers with a full-time skilled job offer from a BC employer and two years of skilled experience.',
      'Pour les travailleurs ayant une offre d’emploi qualifié à temps plein d’un employeur de la C.-B. et deux ans d’expérience qualifiée.',
      '适合持有卑诗省雇主全职技术类工作邀请、并有两年技术类工作经验的人。',
    ),
    criteria: [
      jobOffer({ province: 'BC', teers: [0, 1, 2, 3], fullTime: true }),
      workExperience({ months: 24, teers: [0, 1, 2, 3], withinMonths: 120, excludeStudentWork: true }),
      languageForTeer({ 0: null, 1: null, 2: 4, 3: 4 }),
      intendsToLive('BC'),
    ],
    notes: [
      L(
        'Invitations now go only to targeted draws: Care (health, childcare, education, veterinary), Build (9 construction trades) and Innovate (high-wage offers, recently ≥ $52/h, or top scores around 131–138).',
        'Les invitations ne visent plus que des tirages ciblés : Soins (santé, petite enfance, éducation, vétérinaire), Construction (9 métiers) et Innovation (salaires élevés, récemment ≥ 52 $/h, ou meilleurs scores autour de 131–138).',
        '目前只通过定向抽签发邀请：护理（医疗、托育、教育、兽医）、建筑（9 个建筑工种）和创新（高薪职位，近期时薪 ≥ 52 加元，或约 131–138 的高分）。',
      ),
      L(
        'Work done on a study permit does not count toward the 24 months, so most new graduates qualify only through a Care occupation or a high-wage offer.',
        'Le travail effectué avec un permis d’études ne compte pas pour les 24 mois : la plupart des nouveaux diplômés ne sont admissibles que via une profession de soins ou une offre très bien rémunérée.',
        '持学签期间的工作不计入 24 个月，因此大多数应届毕业生只能通过护理类职业或高薪工作获得资格。',
      ),
    ],
    sources: [
      { url: welcomeBC, verified: VERIFIED },
      { url: 'https://www.welcomebc.ca/immigrate-to-b-c/bc-pnp-si-program-guide-pdf', verified: VERIFIED },
    ],
  },
  {
    id: 'bc-skilled-worker-targeted',
    jurisdiction: 'BC',
    kind: 'pnp-base',
    status: 'invitation-only',
    name: L('BC PNP – Care and Build targeted draws', 'PCP C.-B. – Tirages ciblés Soins et Construction', '卑诗省提名 – 护理与建筑定向抽签'),
    summary: L(
      'Skilled Worker candidates in health, early childhood education or construction trades, who are invited at lower scores.',
      'Candidats Travailleur qualifié en santé, éducation à la petite enfance ou métiers de la construction, invités à des scores plus bas.',
      '医疗、幼儿教育或建筑工种的技术工人申请人，邀请分数线较低。',
    ),
    criteria: [
      jobOffer({ province: 'BC', nocs: BC_CARE_BUILD, fullTime: true }),
      workExperience({ months: 24, teers: [0, 1, 2, 3], withinMonths: 120, excludeStudentWork: true }),
      languageForTeer({ 0: null, 1: null, 2: 4, 3: 4 }),
      intendsToLive('BC'),
    ],
    notes: [
      L(
        'Recent minimums (Oct 2026): childcare (NOC 42202) 99, health 76, construction 94 points.',
        'Minimums récents (oct. 2026) : petite enfance (CNP 42202) 99, santé 76, construction 94 points.',
        '近期分数线（2026 年 10 月）：托育（NOC 42202）99 分，医疗 76 分，建筑 94 分。',
      ),
    ],
    sources: [{ url: welcomeBC, verified: VERIFIED }],
  },
  {
    id: 'bc-health-authority',
    jurisdiction: 'BC',
    kind: 'pnp-base',
    status: 'open',
    name: L('BC PNP – Health Authority', 'PCP C.-B. – Autorité sanitaire', '卑诗省提名 – 卫生局类'),
    summary: L(
      'Direct application for people with a permanent full-time offer from a BC public health authority.',
      'Demande directe pour les personnes ayant une offre permanente à temps plein d’une autorité sanitaire publique de la C.-B.',
      '持有卑诗省公立卫生局永久全职工作邀请者可直接申请。',
    ),
    criteria: [
      jobOffer({ province: 'BC', nocs: ['3', '41300', '41301', '42201'], permanent: true, fullTime: true }),
      intendsToLive('BC'),
    ],
    notes: [L(
      'No registration or draw: the health authority must agree to support you first.',
      'Pas d’inscription ni de tirage : l’autorité sanitaire doit d’abord accepter de vous appuyer.',
      '无需注册或抽签，但需卫生局先同意担保。',
    )],
    sources: [{ url: 'https://www.welcomebc.ca/immigrate-to-b-c/bc-pnp-si-program-guide-pdf', verified: VERIFIED }],
  },
  {
    id: 'bc-international-graduate',
    jurisdiction: 'BC',
    kind: 'pnp-base',
    status: 'closed',
    name: L('BC PNP – International Graduate (closed)', 'PCP C.-B. – Diplômé international (fermé)', '卑诗省提名 – 国际毕业生类（已关闭）'),
    summary: L(
      'Closed. BC confirmed on 2026-04-23 that it will not launch new student streams; BC study now only earns registration points.',
      'Fermé. La C.-B. a confirmé le 2026-04-23 qu’elle ne lancera pas de nouveaux volets étudiants ; les études en C.-B. ne donnent plus que des points.',
      '已关闭。卑诗省于 2026-04-23 确认不再推出新的学生类别，在卑诗省学习现在只计入注册分数。',
    ),
    criteria: [canadianGraduate({ province: 'BC' })],
    sources: [{ url: 'https://www.welcomebc.ca/immigrate-to-b-c/about-the-bc-provincial-nominee-program/news', verified: VERIFIED }],
  },

  // ---------------------------------------------------------------- Alberta
  {
    id: 'ab-opportunity',
    jurisdiction: 'AB',
    kind: 'pnp-base',
    status: 'invitation-only',
    name: L('Alberta Opportunity Stream', 'Volet Opportunité de l’Alberta', '阿尔伯塔机会类别 (AOS)'),
    summary: L(
      'For people already living and working in Alberta with a full-time offer in their current occupation.',
      'Pour les personnes qui vivent et travaillent déjà en Alberta, avec une offre à temps plein dans leur profession actuelle.',
      '适合已在阿尔伯塔生活工作、并持有当前职业全职工作邀请的人。',
    ),
    criteria: [
      custom('check.livesWorks', (p) => p.currentProvince === 'AB' && p.status !== 'student' && p.status !== 'outside', { where: 'prov.AB' }),
      jobOffer({ province: 'AB', fullTime: true }),
      anyOf(
        'check.oneOf',
        [
          canadianGraduate({ province: 'AB', minProgramMonths: 24 }),
          custom('check.pgwp', (p) => p.status === 'graduate-pgwp'),
          workExperience({ months: 6, province: 'AB', withinMonths: 18, excludeStudentWork: true }),
        ],
        [workExperience({ months: 12, province: 'AB', withinMonths: 18, excludeStudentWork: true })],
        [workExperience({ months: 24, withinMonths: 30, excludeStudentWork: true })],
      ),
      custom('check.clbForTeer', (p) => {
        const need = p.jobOffer?.noc === '33102' ? 7 : p.jobOffer && p.jobOffer.teer <= 3 ? 5 : 4;
        return Math.max(minOfP(p.english), minOfP(p.french)) >= need;
      }, { need: 5, teer: '0–3', have: '' }, 'hint.raiseLanguage'),
      minEducation('secondary', { requireEcaIfForeign: true }),
    ],
    notes: [
      L(
        'Selected from the Alberta Worker EOI pool; recent minimum scores 54–58. Only 289 of 3,562 spaces were left on 2026-10-21.',
        'Sélection dans le bassin de déclarations d’intérêt de l’Alberta ; scores minimums récents de 54 à 58. Il ne restait que 289 places sur 3 562 au 2026-10-21.',
        '从阿尔伯塔工人 EOI 池中邀请，近期最低分 54–58。截至 2026-10-21，3,562 个名额仅剩 289 个。',
      ),
      L(
        'Alberta graduates on a PGWP from an Alberta public institution need only 6 months of Alberta work.',
        'Les diplômés d’un établissement public albertain titulaires d’un PTPD n’ont besoin que de 6 mois de travail en Alberta.',
        '持阿尔伯塔公立院校学历 PGWP 的毕业生只需 6 个月阿尔伯塔工作经验。',
      ),
    ],
    sources: [
      { url: 'https://www.alberta.ca/aaip-alberta-opportunity-stream-eligibility', verified: VERIFIED },
      { url: aaip, verified: VERIFIED },
    ],
  },
  {
    id: 'ab-express-entry',
    jurisdiction: 'AB',
    kind: 'pnp-enhanced',
    enhanced: true,
    status: 'invitation-only',
    name: L('Alberta Express Entry Stream', 'Volet Entrée express de l’Alberta', '阿尔伯塔快速通道类别'),
    summary: L(
      'Express Entry candidates with CRS ≥ 300 whose occupation is in an Alberta priority sector (health, construction, agriculture, aviation, manufacturing).',
      'Candidats Entrée express avec un SCG ≥ 300 dont la profession relève d’un secteur prioritaire de l’Alberta (santé, construction, agriculture, aviation, fabrication).',
      'CRS ≥ 300、职业属于阿尔伯塔优先行业（医疗、建筑、农业、航空、制造）的快速通道申请人。',
    ),
    criteria: [expressEntryEligible(), crsAtLeast(300), intendsToLive('AB')],
    notes: [L(
      'The 2026 allocation is fully used; a general priority-sector draw on 2026-10-20 still invited 386 people (minimum score 60).',
      'L’allocation 2026 est épuisée ; un tirage général des secteurs prioritaires le 2026-10-20 a tout de même invité 386 personnes (score minimum 60).',
      '2026 年名额已用完，但 2026-10-20 的优先行业综合抽签仍邀请了 386 人（最低 60 分）。',
    )],
    sources: [{ url: 'https://www.alberta.ca/aaip-alberta-express-entry-stream-eligibility', verified: VERIFIED }],
  },
  {
    id: 'ab-accelerated-tech',
    jurisdiction: 'AB',
    kind: 'pnp-enhanced',
    enhanced: true,
    status: 'invitation-only',
    name: L('Alberta Accelerated Tech Pathway', 'Voie accélérée Technologie de l’Alberta', '阿尔伯塔科技加速通道'),
    summary: L(
      'Express Entry candidates working in, or with an offer from, an Alberta tech company in an eligible tech occupation.',
      'Candidats Entrée express travaillant pour une entreprise technologique de l’Alberta (ou ayant une offre) dans une profession admissible.',
      '在阿尔伯塔科技公司从事合格科技职业（或持有其工作邀请）的快速通道申请人。',
    ),
    criteria: [
      expressEntryEligible(),
      crsAtLeast(300),
      jobOffer({ province: 'AB', nocs: ['2'], fullTime: true }),
    ],
    notes: [L(
      'Uses Alberta’s own eligible tech-occupation list; this screener approximates it as NOC broad category 2 (natural and applied sciences). 61 spaces were left on 2026-10-21.',
      'Utilise la liste des professions technologiques admissibles de l’Alberta ; ce filtre l’approxime par la grande catégorie 2 de la CNP. Il restait 61 places au 2026-10-21.',
      '使用阿尔伯塔自己的合格科技职业清单，本工具以 NOC 大类 2（自然与应用科学）近似。截至 2026-10-21 剩余 61 个名额。',
    )],
    sources: [{ url: 'https://www.alberta.ca/aaip-alberta-express-entry-stream-eligibility', verified: VERIFIED }],
  },
  {
    id: 'ab-health-care',
    jurisdiction: 'AB',
    kind: 'pnp-base',
    status: 'invitation-only',
    name: L('Alberta Dedicated Health Care Pathway', 'Voie dédiée aux soins de santé de l’Alberta', '阿尔伯塔医疗专项通道'),
    summary: L(
      'Physicians, nurses, therapists, psychologists and other licensed health workers with an Alberta health-sector offer.',
      'Médecins, infirmières, thérapeutes, psychologues et autres professionnels de la santé autorisés ayant une offre du secteur de la santé albertain.',
      '持有阿尔伯塔医疗机构工作邀请的医生、护士、治疗师、心理学家等持证医护人员。',
    ),
    criteria: [
      jobOffer({ province: 'AB', nocs: ['31100', '31101', '31102', '31303', '31301', '31302', '32101', '31203', '31202', '41300', '31200'] }),
      minLanguage(5),
    ],
    notes: [L(
      'Has an Express Entry-linked option (CRS ≥ 300, nomination adds 600 points) and a non-Express Entry option for those who can’t reach 300.',
      'Comporte une option liée à Entrée express (SCG ≥ 300, la nomination ajoute 600 points) et une option hors Entrée express pour ceux qui n’atteignent pas 300.',
      '分为与快速通道挂钩的选项（CRS ≥ 300，获提名加 600 分）和面向达不到 300 分者的非快速通道选项。',
    )],
    sources: [{ url: 'https://www.alberta.ca/dedicated-health-care-pathway', verified: VERIFIED }],
  },
  {
    id: 'ab-rural-renewal',
    jurisdiction: 'AB',
    kind: 'pnp-base',
    status: 'invitation-only',
    name: L('Alberta Rural Renewal Stream', 'Volet Renouveau rural de l’Alberta', '阿尔伯塔乡村振兴类别'),
    summary: L(
      'For people with a job offer in a designated rural Alberta community and that community’s endorsement.',
      'Pour les personnes ayant une offre d’emploi dans une collectivité rurale désignée de l’Alberta et l’appui de celle-ci.',
      '适合在阿尔伯塔指定乡村社区有工作邀请并获得社区背书的人。',
    ),
    criteria: [
      jobOffer({ province: 'AB', fullTime: true }),
      note('check.communityEndorsement'),
      anyOf(
        'check.oneOf',
        [canadianGraduate({ province: 'AB', minProgramMonths: 24 })],
        [workExperience({ months: 12, withinMonths: 18, excludeStudentWork: true })],
      ),
      languageForTeer({ 0: 5, 1: 5, 2: 5, 3: 5, 4: 4, 5: 4 }),
      minEducation('secondary', { requireEcaIfForeign: true }),
    ],
    notes: [L(
      'Since 2026-01-01 each community has an endorsement cap and letters are valid for one year.',
      'Depuis le 2026-01-01, chaque collectivité a un plafond d’appuis et les lettres sont valides un an.',
      '自 2026-01-01 起，每个社区有背书名额上限，背书信有效期一年。',
    )],
    sources: [{ url: 'https://www.alberta.ca/aaip-rural-renewal-stream-eligibility', verified: VERIFIED }],
  },

  // ---------------------------------------------------------------- Saskatchewan
  {
    id: 'sk-students',
    jurisdiction: 'SK',
    kind: 'pnp-base',
    status: 'open',
    name: L('SINP Saskatchewan Experience – Students', 'PCIS Expérience Saskatchewan – Étudiants', '萨省提名 – 萨省经验：学生类'),
    summary: L(
      'Graduates of a Saskatchewan school with six months of related Saskatchewan work and a skilled job offer.',
      'Diplômés d’un établissement de la Saskatchewan avec six mois de travail connexe dans la province et une offre d’emploi qualifié.',
      '萨省院校毕业、在萨省有 6 个月相关工作经验并持有技术类工作邀请的人。',
    ),
    criteria: [
      canadianGraduate({ province: 'SK' }),
      workExperience({ months: 6, province: 'SK' }),
      jobOffer({ province: 'SK', teers: [0, 1, 2, 3], permanent: true, fullTime: true }),
      intendsToLive('SK'),
    ],
    notes: [L(
      '750 of the 2026 spaces are reserved for Saskatchewan graduates with a priority-sector offer. PGWP holders who studied outside Saskatchewan can no longer use the Saskatchewan Experience categories.',
      '750 places de 2026 sont réservées aux diplômés de la Saskatchewan ayant une offre dans un secteur prioritaire. Les titulaires d’un PTPD ayant étudié hors de la Saskatchewan ne peuvent plus utiliser les catégories Expérience Saskatchewan.',
      '2026 年有 750 个名额预留给持优先行业工作邀请的萨省毕业生。在萨省以外读书的 PGWP 持有者已不能使用萨省经验类别。',
    )],
    sources: [{ url: `${sinp}/browse-sinp-programs/applicants-with-saskatchewan-experience/students`, verified: VERIFIED }],
  },
  {
    id: 'sk-isw-offer',
    jurisdiction: 'SK',
    kind: 'pnp-base',
    status: 'open',
    name: L('SINP International Skilled Worker – Employment Offer', 'PCIS Travailleur qualifié international – Offre d’emploi', '萨省提名 – 国际技术工人：工作邀请类'),
    summary: L(
      'Skilled workers with a permanent Saskatchewan job offer and a year of experience in the occupation.',
      'Travailleurs qualifiés ayant une offre permanente en Saskatchewan et un an d’expérience dans la profession.',
      '持有萨省永久工作邀请、并有该职业一年经验的技术工人。',
    ),
    criteria: [
      jobOffer({ province: 'SK', teers: [0, 1, 2, 3], permanent: true, fullTime: true }),
      workExperience({ months: 12, withinMonths: 120 }),
      minLanguage(4),
      note('check.sinpPoints', { min: 60 }),
    ],
    notes: [L(
      'PGWP and spousal open work permit holders need at least 6 months with the employer making the offer.',
      'Les titulaires d’un PTPD ou d’un permis ouvert de conjoint doivent avoir au moins 6 mois chez l’employeur qui fait l’offre.',
      '持 PGWP 或配偶开放工签者需在提供工作邀请的雇主处工作满 6 个月。',
    )],
    sources: [{ url: `${sinp}/browse-sinp-programs/applicants-international-skilled-workers/international-skilled-worker-with-employment-offer`, verified: VERIFIED }],
  },
  {
    id: 'sk-tech-talent',
    jurisdiction: 'SK',
    kind: 'pnp-base',
    status: 'open',
    name: L('SINP Tech Talent Pathway', 'PCIS Voie des talents technologiques', '萨省提名 – 科技人才通道'),
    summary: L(
      'For tech workers with a permanent full-time offer in one of 32 eligible tech occupations.',
      'Pour les travailleurs en technologie ayant une offre permanente à temps plein dans l’une de 32 professions admissibles.',
      '适合持有 32 个合格科技职业之一永久全职工作邀请的科技人才。',
    ),
    criteria: [
      jobOffer({ province: 'SK', nocs: ['2'], permanent: true, fullTime: true }),
      minEducation('two-year'),
      minLanguage(5),
      anyOf('check.oneOf',
        [workExperience({ months: 6, province: 'SK' })],
        [workExperience({ months: 12, withinMonths: 60 })]),
    ],
    notes: [L(
      'Saskatchewan lists 32 eligible tech occupations; this screener approximates the list with NOC broad category 2 (natural and applied sciences). Check your NOC on the official page.',
      'La Saskatchewan admet 32 professions technologiques ; ce filtre les approxime par la grande catégorie 2 de la CNP (sciences naturelles et appliquées). Vérifiez votre CNP sur la page officielle.',
      '萨省列出 32 个合格科技职业，本工具以 NOC 大类 2（自然与应用科学）近似，请在官方页面核对你的 NOC。',
    )],
    sources: [{ url: `${sinp}/browse-sinp-programs/sinp-innovation-tech-talent-pathway`, verified: VERIFIED }],
  },
  {
    id: 'sk-health-talent',
    jurisdiction: 'SK',
    kind: 'pnp-base',
    status: 'open',
    name: L('SINP Health Talent Pathway', 'PCIS Voie des talents en santé', '萨省提名 – 医疗人才通道'),
    summary: L(
      'For health workers with a permanent full-time offer from a Saskatchewan health employer.',
      'Pour les travailleurs de la santé ayant une offre permanente à temps plein d’un employeur de santé de la Saskatchewan.',
      '适合持有萨省医疗机构永久全职工作邀请的医护人员。',
    ),
    criteria: [
      jobOffer({ province: 'SK', nocs: ['3', '44101'], permanent: true, fullTime: true }),
      minLanguage(5),
      anyOf('check.oneOf',
        [workExperience({ months: 6, province: 'SK' })],
        [workExperience({ months: 12, withinMonths: 60 })]),
    ],
    sources: [{ url: `${sinp}/browse-sinp-programs/health-talent-pathway`, verified: VERIFIED }],
  },
  {
    id: 'sk-occupation-in-demand',
    jurisdiction: 'SK',
    kind: 'pnp-base',
    status: 'paused',
    name: L('SINP Occupation In-Demand / Saskatchewan Express Entry', 'PCIS Profession en demande / Entrée express Saskatchewan', '萨省提名 – 紧缺职业 / 萨省快速通道'),
    summary: L(
      'No-job-offer categories for skilled workers in in-demand occupations. Saskatchewan reports no scheduled draws at this time.',
      'Catégories sans offre d’emploi pour travailleurs qualifiés en professions en demande. La Saskatchewan n’annonce aucun tirage pour l’instant.',
      '无需工作邀请的紧缺职业类别。萨省目前表示没有安排抽签。',
    ),
    criteria: [
      minEducation('one-year', { requireEcaIfForeign: true }),
      workExperience({ months: 12, teers: [0, 1, 2, 3], withinMonths: 120 }),
      minLanguage(4),
      settlementFunds(FUNDS_TABLE),
    ],
    sources: [{ url: `${sinp}/browse-sinp-programs/applicants-international-skilled-workers/international-skilled-worker-occupations-in-demand`, verified: VERIFIED }],
  },

  // ---------------------------------------------------------------- Manitoba
  {
    id: 'mb-skilled-worker',
    jurisdiction: 'MB',
    kind: 'pnp-base',
    status: 'invitation-only',
    name: L('MPNP Skilled Worker in Manitoba', 'PCMB Travailleur qualifié au Manitoba', '曼省提名 – 曼省技术工人类'),
    summary: L(
      'For people working full-time for a Manitoba employer who offers them a long-term job. Manitoba graduates get dedicated draws.',
      'Pour les personnes travaillant à temps plein pour un employeur manitobain qui leur offre un emploi à long terme. Les diplômés du Manitoba ont des tirages dédiés.',
      '适合为曼省雇主全职工作并获其长期工作邀请的人。曼省毕业生有专属抽签。',
    ),
    criteria: [
      jobOffer({ province: 'MB', fullTime: true }),
      custom('check.mbEmployerTenure', (p) => {
        const mbMonths = p.work.filter((w) => w.inCanada && w.province === 'MB' && !w.whileFullTimeStudent && w.endedMonthsAgo === 0).reduce((m, w) => Math.max(m, w.months), 0);
        const otherProvinceGrad = p.canadianStudy && p.canadianStudy.province !== 'MB';
        return mbMonths >= (otherProvinceGrad ? 12 : 6);
      }, { mb: 6, other: 12 }, 'hint.moreWork'),
      inCanadaNow(),
      intendsToLive('MB'),
    ],
    notes: [L(
      'Recent draws for Manitoba graduates: 508 invited at 825+ (2026-09-10) and 734 at 816+ (2026-10-22). The former Career Employment Pathway closed on 2026-06-11.',
      'Tirages récents pour les diplômés du Manitoba : 508 invitations à 825+ (2026-09-10) et 734 à 816+ (2026-10-22). L’ancienne voie Emploi-carrière a fermé le 2026-06-11.',
      '近期曼省毕业生专场：2026-09-10 邀请 508 人（825 分以上），2026-10-22 邀请 734 人（816 分以上）。原职业就业通道已于 2026-06-11 关闭。',
    )],
    sources: [
      { url: 'https://immigratemanitoba.com/mpnp/skilled-worker/swm/eligibility/', verified: VERIFIED },
      { url: 'https://immigratemanitoba.com/draws/', verified: VERIFIED },
    ],
  },
  {
    id: 'mb-graduate-internship',
    jurisdiction: 'MB',
    kind: 'pnp-base',
    status: 'open',
    name: L('MPNP Graduate Internship Pathway', 'PCMB Voie des stages pour diplômés', '曼省提名 – 研究生实习通道'),
    summary: L(
      'Manitoba master’s or PhD graduates who completed a Mitacs internship. No job offer needed.',
      'Diplômés d’une maîtrise ou d’un doctorat au Manitoba ayant fait un stage Mitacs. Aucune offre d’emploi requise.',
      '在曼省完成硕士或博士学位并完成 Mitacs 实习的毕业生，无需工作邀请。',
    ),
    criteria: [
      canadianGraduate({ province: 'MB', levels: ['master', 'phd'], withinMonths: 36 }),
      note('check.mitacs'),
      minLanguage(7),
      intendsToLive('MB'),
    ],
    sources: [{ url: 'https://immigratemanitoba.com/immigrate/ies/graduate-internship/eligibility/', verified: VERIFIED }],
  },
  {
    id: 'mb-career-employment',
    jurisdiction: 'MB',
    kind: 'pnp-base',
    status: 'closed',
    name: L('MPNP Career Employment Pathway (closed)', 'PCMB Voie Emploi-carrière (fermée)', '曼省提名 – 职业就业通道（已关闭）'),
    summary: L(
      'Closed on 2026-06-11. Manitoba graduates now apply through Skilled Worker in Manitoba.',
      'Fermée le 2026-06-11. Les diplômés du Manitoba passent désormais par Travailleur qualifié au Manitoba.',
      '已于 2026-06-11 关闭。曼省毕业生现通过曼省技术工人类申请。',
    ),
    criteria: [canadianGraduate({ province: 'MB', withinMonths: 36 })],
    sources: [{ url: 'https://immigratemanitoba.com/draws/', verified: VERIFIED }],
  },

  // ---------------------------------------------------------------- Territories
  {
    id: 'yk-skilled-worker',
    jurisdiction: 'YT',
    kind: 'pnp-base',
    status: 'intake-windows',
    name: L('Yukon Nominee Program – Skilled Worker', 'Programme des candidats du Yukon – Travailleur qualifié', '育空提名计划 – 技术工人类'),
    summary: L(
      'Employer-led: a Yukon employer submits an expression of interest for a permanent skilled job during one of two yearly intakes.',
      'Mené par l’employeur : un employeur du Yukon soumet une déclaration d’intérêt pour un emploi qualifié permanent lors de l’une des deux périodes annuelles.',
      '由雇主主导：育空雇主在每年两次的申请窗口为永久技术类职位提交意向申请。',
    ),
    criteria: [
      jobOffer({ province: 'YT', teers: [0, 1, 2, 3], permanent: true, fullTime: true }),
      workExperience({ months: 12 }),
      languageForTeer({ 0: 6, 1: 6, 2: 5, 3: 5 }),
    ],
    notes: [L(
      '2026 intakes ran 19–30 Jan and 6–17 Jul; no intake is open now.',
      'Les périodes 2026 ont eu lieu du 19 au 30 janvier et du 6 au 17 juillet ; aucune n’est ouverte actuellement.',
      '2026 年窗口为 1 月 19–30 日和 7 月 6–17 日，目前未开放。',
    )],
    sources: [{ url: 'https://yukon.ca/sites/default/files/ecdev-ynp-2026-operational-guidance-2026-07-03.pdf', verified: VERIFIED }],
  },
  {
    id: 'nt-employer-driven',
    jurisdiction: 'NT',
    kind: 'pnp-base',
    status: 'intake-windows',
    name: L('NWT Nominee Program – Employer-Driven', 'Programme des candidats des T.N.-O. – Volet employeur', '西北地区提名 – 雇主担保类'),
    summary: L(
      'For workers with a permanent full-time NWT offer from an employer they already work for.',
      'Pour les travailleurs ayant une offre permanente à temps plein aux T.N.-O. d’un employeur pour qui ils travaillent déjà.',
      '适合持有现雇主提供的西北地区永久全职工作邀请的人。',
    ),
    criteria: [
      jobOffer({ province: 'NT', teers: [0, 1, 2, 3], permanent: true, fullTime: true }),
      languageForTeer({ 0: 6, 1: 6, 2: 5, 3: 5 }),
      minEducation('secondary', { requireEcaIfForeign: true }),
    ],
    notes: [L(
      'The final 2026 draw was on 2026-09-25, so the employer-driven stream is effectively closed for the rest of 2026.',
      'Le dernier tirage de 2026 a eu lieu le 2026-09-25 ; le volet employeur est donc fermé pour le reste de 2026.',
      '2026 年最后一次抽签在 2026-09-25，雇主担保类在 2026 年余下时间实际已关闭。',
    )],
    sources: [{ url: 'https://www.immigratenwt.ca/expression-interest', verified: VERIFIED }],
  },
];

// Small local helper to avoid importing UI code.
function minOfP(r?: { listening: number; reading: number; writing: number; speaking: number }) {
  return r ? Math.min(r.listening, r.reading, r.writing, r.speaking) : 0;
}

// Keep tree-shaking honest for helpers that some provinces don't use.
void ageRange;

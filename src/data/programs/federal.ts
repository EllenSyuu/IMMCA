/**
 * Federal programs: Express Entry (CEC, FSW, FST and 2026 category draws),
 * the Atlantic Immigration Program, the rural and francophone community pilots,
 * and the post-graduation work permit as a bridge. Verified 2026-10-27.
 */
import {
  anyOf, canadianGraduate, custom, educationAtLeast, inCanadaNow, jobOffer, languageForTeer,
  minEducation, minLanguage, minOf, note, qualifyingMonths, settlementFunds, workExperience,
} from '../../engine/criteria';
import { computeCrs } from '../../engine/crs';
import type { Criterion, Profile, ProgramSpec, Teer } from '../../engine/types';
import { latestCutoff, type DrawFamily } from '../draws';
import { FUNDS_TABLE, L, VERIFIED, cecLanguageOk, expressEntryEligible, fswGridScore, meetsFst } from './shared';

const ircc = 'https://www.canada.ca/en/immigration-refugees-citizenship/services';
const ee = `${ircc}/immigrate-canada/express-entry`;

/** CRS with the latest cutoff for the matching draw family as benchmark. */
const crsPoints = (family: DrawFamily) => (p: Profile) => ({
  label: 'points.crs',
  value: computeCrs(p).total,
  benchmark: latestCutoff(family)?.crs,
});

/** FSW/FST funds are waived for people already authorised to work in Canada who hold a valid offer. */
const authorisedWithOffer = (p: Profile) => (p.status === 'worker' || p.status === 'graduate-pgwp') && !!p.jobOffer;

/**
 * Experience whose TEER is compatible with the job offer's TEER, per a
 * program's matching table (AIP, RCIP). `null` means the same NOC is required.
 */
function matchedExperience(table: Record<Teer, Teer[] | null>, withinMonths: number): Criterion {
  return {
    evaluate(p) {
      const offer = p.jobOffer;
      const allowed = offer ? table[offer.teer] : null;
      const have = !offer
        ? 0
        : allowed
          ? qualifyingMonths(p.work, { months: 12, teers: allowed, withinMonths, excludeSelfEmployed: true })
          : qualifyingMonths(p.work, { months: 12, nocs: offer.noc ? [offer.noc] : ['-'], withinMonths, excludeSelfEmployed: true });
      return {
        key: 'check.matchedWork',
        params: { months: 12, years: withinMonths / 12, teers: allowed ? allowed.join(', ') : (offer?.noc ?? '—'), have },
        status: have >= 12 ? 'met' : 'unmet',
        ...(have >= 12 ? {} : { hintKey: 'hint.moreWork', hintParams: { more: 12 - have } }),
      };
    },
  };
}

const AIP_MATCH: Record<Teer, Teer[] | null> = { 0: [0, 1, 2, 3, 4], 1: [1, 2, 3, 4], 2: [2, 3, 4], 3: [3, 4], 4: [4], 5: [] };
const RCIP_MATCH: Record<Teer, Teer[] | null> = { 0: [0, 1, 2, 3], 1: [0, 1, 2, 3], 2: [1, 2, 3, 4], 3: [2, 3, 4], 4: [2, 3, 4], 5: null };

// ---------------------------------------------------------------- category draws
/** 12 months of full-time work in a single listed occupation in the last 3 years. */
function categoryExperience(nocs: string[], inCanadaOnly = false): Criterion {
  return custom('check.categoryWork', (p) =>
    nocs.some((noc) => qualifyingMonths(p.work, { months: 12, nocs: [noc], withinMonths: 36, inCanada: inCanadaOnly ? true : undefined }) >= 12),
  { months: 12, years: 3, where: inCanadaOnly ? 'where.canada' : 'where.anywhere' }, 'hint.categoryWork');
}

const CATEGORY_NOCS = {
  health: '31100 31101 31102 31103 31110 31111 31112 31120 31121 31200 31201 31202 31203 31209 31300 31301 31302 31303 32101 32102 32103 32104 32109 32111 32120 32121 32122 32123 32124 32129 32201 33101 33102 33103 41300 41301 42201'.split(' '),
  stem: '20011 21220 21300 21301 21310 21321 21331 22300 22301 22310 63100'.split(' '),
  trades: '22303 70010 70011 72100 72102 72106 72200 72201 72300 72302 72310 72311 72320 72400 72401 72402 72422 72501 72999 73100 73110 73112 73113 82021 63201'.split(' '),
  education: '41220 41221 42202 42203 43100'.split(' '),
  physicians: ['31100', '31101', '31102'],
  transport: '72404 72600 22313 72410'.split(' '),
  researchers: ['41200', '41201'],
  managers: ['00012', '00013', '00014', '00015'],
};

const categoryPage = `${ee}/rounds-invitations/category-based-selection.html`;

function category(
  id: string, family: DrawFamily, nocs: string[], name: ReturnType<typeof L>, summary: ReturnType<typeof L>, inCanadaOnly = false,
): ProgramSpec {
  return {
    id, jurisdiction: 'federal', kind: 'express-entry', status: 'invitation-only', name, summary,
    criteria: [expressEntryEligible(), categoryExperience(nocs, inCanadaOnly)],
    points: crsPoints(family),
    sources: [{ url: categoryPage, verified: VERIFIED }],
  };
}

export const federalPrograms: ProgramSpec[] = [
  {
    id: 'ee-cec',
    jurisdiction: 'federal',
    kind: 'express-entry',
    status: 'invitation-only',
    name: L('Express Entry – Canadian Experience Class', 'Entrée express – Catégorie de l’expérience canadienne', '快速通道 – 加拿大经验类 (CEC)'),
    summary: L(
      'For people with a year of skilled work in Canada. The main route for international graduates outside Québec.',
      'Pour les personnes ayant un an de travail qualifié au Canada. La principale voie pour les diplômés internationaux hors Québec.',
      '适合在加拿大有一年技术类工作经验的人，是魁北克以外国际毕业生的主要途径。',
    ),
    criteria: [
      workExperience({ months: 12, teers: [0, 1, 2, 3], inCanada: true, withinMonths: 36, excludeStudentWork: true, excludeSelfEmployed: true, key: 'check.cecWork' }),
      custom('check.cecLanguage', cecLanguageOk, { high: 7, low: 5 }, 'hint.raiseLanguage'),
    ],
    points: crsPoints('cec'),
    notes: [
      L(
        'Work done while you were a full-time student (including co-op) does not count; PGWP work does.',
        'Le travail effectué pendant des études à temps plein (y compris les stages coop) ne compte pas ; le travail sous PTPD compte.',
        '全日制学习期间（包括带薪实习）的工作不计入，持 PGWP 的工作计入。',
      ),
      L(
        'CRS rules change on 2026-11-03: 12 months in a high-wage occupation adds up to 70 points, and a job offer in one can be worth up to 100. Rounds may pause for up to two weeks after the change.',
        'Le SCG change le 2026-11-03 : 12 mois dans une profession à salaire élevé ajoutent jusqu’à 70 points, et une offre d’emploi dans une telle profession peut valoir jusqu’à 100 points. Les rondes peuvent être suspendues jusqu’à deux semaines.',
        'CRS 规则将于 2026-11-03 变化：在高薪职业工作满 12 个月最多加 70 分，高薪职业的工作邀请最多值 100 分。变化后抽签可能暂停最多两周。',
      ),
    ],
    sources: [
      { url: `${ee}/who-can-apply/canadian-experience-class.html`, verified: VERIFIED },
      { url: `${ee}/changes.html`, verified: VERIFIED },
    ],
  },
  {
    id: 'ee-fsw',
    jurisdiction: 'federal',
    kind: 'express-entry',
    status: 'invitation-only',
    name: L('Express Entry – Federal Skilled Worker', 'Entrée express – Travailleurs qualifiés (fédéral)', '快速通道 – 联邦技术移民 (FSW)'),
    summary: L(
      'For skilled workers with a year of continuous experience anywhere, CLB 7 and at least 67 points on the selection grid.',
      'Pour les travailleurs qualifiés ayant un an d’expérience continue, n’importe où, un NCLC 7 et au moins 67 points sur la grille de sélection.',
      '适合在任何地方有一年连续技术类经验、语言 CLB 7 并在评分表上至少 67 分的人。',
    ),
    criteria: [
      workExperience({ months: 12, teers: [0, 1, 2, 3], withinMonths: 120, continuous: true }),
      minLanguage(7),
      minEducation('secondary', { requireEcaIfForeign: true }),
      custom('check.fswGrid', (p) => fswGridScore(p) >= 67, { min: 67 }, 'hint.fswGrid'),
      settlementFunds(FUNDS_TABLE, authorisedWithOffer),
    ],
    points: crsPoints('general'),
    sources: [{ url: `${ee}/who-can-apply/federal-skilled-workers.html`, verified: VERIFIED }],
  },
  {
    id: 'ee-fst',
    jurisdiction: 'federal',
    kind: 'express-entry',
    status: 'invitation-only',
    name: L('Express Entry – Federal Skilled Trades', 'Entrée express – Métiers spécialisés (fédéral)', '快速通道 – 联邦技工移民 (FST)'),
    summary: L(
      'For tradespeople with two years in a skilled trade and either a job offer or a Canadian certificate of qualification.',
      'Pour les gens de métier ayant deux ans dans un métier spécialisé et une offre d’emploi ou un certificat de qualification canadien.',
      '适合有两年技工经验、并有工作邀请或加拿大技工资格证书的人。',
    ),
    criteria: [custom('check.fst', meetsFst, undefined, 'hint.fst'), settlementFunds(FUNDS_TABLE, authorisedWithOffer)],
    points: crsPoints('trades'),
    sources: [{ url: `${ee}/who-can-apply/federal-skilled-trades.html`, verified: VERIFIED }],
  },
  {
    id: 'ee-french',
    jurisdiction: 'federal',
    kind: 'express-entry',
    status: 'invitation-only',
    name: L('Express Entry – French-language proficiency draws', 'Entrée express – Tirages compétences linguistiques en français', '快速通道 – 法语能力定向抽签'),
    summary: L(
      'Express Entry candidates with NCLC 7+ in French. Recent rounds invited 5,000 people at CRS 382–435.',
      'Candidats Entrée express ayant un NCLC 7+ en français. Les rondes récentes ont invité 5 000 personnes à un SCG de 382 à 435.',
      '法语 NCLC 7 以上的快速通道申请人。近期每轮邀请 5,000 人，分数线 382–435。',
    ),
    criteria: [expressEntryEligible(), minLanguage(7, 'fr')],
    points: crsPoints('french'),
    sources: [{ url: categoryPage, verified: VERIFIED }],
  },
  category('ee-health', 'health', CATEGORY_NOCS.health,
    L('Express Entry – Healthcare and social services draws', 'Entrée express – Tirages santé et services sociaux', '快速通道 – 医疗与社会服务定向抽签'),
    L('Twelve months in one listed health or social-services occupation in the last 3 years, in Canada or abroad.',
      'Douze mois dans une profession admissible de la santé ou des services sociaux au cours des 3 dernières années, au Canada ou à l’étranger.',
      '过去 3 年内在一个列明的医疗或社会服务职业工作满 12 个月（加拿大境内外均可）。')),
  category('ee-stem', 'stem', CATEGORY_NOCS.stem,
    L('Express Entry – STEM draws', 'Entrée express – Tirages STIM', '快速通道 – STEM 定向抽签'),
    L('The 2026 STEM list has only 11 occupations and excludes software and data roles. No STEM round has run recently.',
      'La liste STIM 2026 ne compte que 11 professions et exclut les postes en logiciel et en données. Aucune ronde STIM récente.',
      '2026 年 STEM 清单只有 11 个职业，不含软件和数据类职位，近期没有 STEM 抽签。')),
  category('ee-trades', 'trades', CATEGORY_NOCS.trades,
    L('Express Entry – Trade occupations draws', 'Entrée express – Tirages métiers', '快速通道 – 技工职业定向抽签'),
    L('Twelve months in one listed trade in the last 3 years. The latest round invited 3,500 at CRS 476.',
      'Douze mois dans un métier admissible au cours des 3 dernières années. La dernière ronde a invité 3 500 personnes à un SCG de 476.',
      '过去 3 年在一个列明工种工作满 12 个月。最近一轮邀请 3,500 人，分数线 476。')),
  category('ee-education', 'education', CATEGORY_NOCS.education,
    L('Express Entry – Education draws', 'Entrée express – Tirages éducation', '快速通道 – 教育职业定向抽签'),
    L('Teachers, early childhood educators and instructors of persons with disabilities.',
      'Enseignants, éducateurs à la petite enfance et instructeurs de personnes handicapées.',
      '教师、幼儿教育者和残障人士指导员。')),
  category('ee-transport', 'transport', CATEGORY_NOCS.transport,
    L('Express Entry – Transport occupations draws', 'Entrée express – Tirages professions du transport', '快速通道 – 交通运输职业定向抽签'),
    L('Twelve months in the last 3 years as a truck driver, aircraft pilot, aircraft mechanic or rail worker (4 listed occupations).',
      'Douze mois au cours des 3 dernières années comme camionneur, pilote, mécanicien d’aéronefs ou travailleur ferroviaire (4 professions admissibles).',
      '过去 3 年担任卡车司机、飞行员、飞机机械师或铁路工作人员（4 个列明职业）满 12 个月。')),
  category('ee-physicians', 'physicians', CATEGORY_NOCS.physicians,
    L('Express Entry – Physicians with Canadian work experience', 'Entrée express – Médecins ayant une expérience canadienne', '快速通道 – 有加拿大经验的医生'),
    L('Twelve months in Canada as a physician (NOC 31100, 31101, 31102). The latest round invited 229 at CRS 198.',
      'Douze mois au Canada comme médecin (CNP 31100, 31101, 31102). La dernière ronde a invité 229 personnes à un SCG de 198.',
      '在加拿大担任医生（NOC 31100、31101、31102）满 12 个月。最近一轮邀请 229 人，分数线 198。'), true),
  category('ee-researchers', 'researchers', CATEGORY_NOCS.researchers,
    L('Express Entry – Researchers with Canadian work experience', 'Entrée express – Chercheurs ayant une expérience canadienne', '快速通道 – 有加拿大经验的研究人员'),
    L('Twelve months in Canada as a university professor or post-secondary research/teaching assistant (NOC 41200, 41201).',
      'Douze mois au Canada comme professeur d’université ou assistant de recherche/d’enseignement postsecondaire (CNP 41200, 41201).',
      '在加拿大担任大学教授或高校研究 / 教学助理（NOC 41200、41201）满 12 个月。'), true),
  category('ee-senior-managers', 'managers', CATEGORY_NOCS.managers,
    L('Express Entry – Senior managers with Canadian work experience', 'Entrée express – Cadres supérieurs ayant une expérience canadienne', '快速通道 – 有加拿大经验的高级管理人员'),
    L('Twelve months in Canada as a senior manager. The first round (2026-09-16) invited 250 at CRS 389.',
      'Douze mois au Canada comme cadre supérieur. La première ronde (2026-09-16) a invité 250 personnes à un SCG de 389.',
      '在加拿大担任高级管理人员满 12 个月。首轮（2026-09-16）邀请 250 人，分数线 389。'), true),

  // ---------------------------------------------------------------- other federal PR pathways
  {
    id: 'aip',
    jurisdiction: 'federal',
    kind: 'federal-pathway',
    status: 'open',
    name: L('Atlantic Immigration Program', 'Programme d’immigration au Canada atlantique', '大西洋移民计划 (AIP)'),
    summary: L(
      'A job offer from a designated employer in NB, NS, PEI or NL. Graduates of a 2-year Atlantic program don’t need work experience.',
      'Une offre d’un employeur désigné au N.-B., en N.-É., à l’Î.-P.-É. ou à T.-N.-L. Les diplômés d’un programme de 2 ans dans l’Atlantique n’ont pas besoin d’expérience.',
      '需获得新不伦瑞克、新斯科舍、爱德华王子岛或纽芬兰指定雇主的工作邀请。大西洋地区两年制项目毕业生无需工作经验。',
    ),
    criteria: [
      custom('check.offerDesignated', (p) => !!p.jobOffer?.designatedEmployer && ['NB', 'NS', 'PE', 'NL'].includes(p.jobOffer.province) && p.jobOffer.teer <= 4 && p.jobOffer.fullTime, { where: 'where.atlantic' }, 'hint.offer'),
      anyOf('check.oneOf',
        [matchedExperience(AIP_MATCH, 60)],
        [canadianGraduate({ provinces: ['NB', 'NS', 'PE', 'NL'], minProgramMonths: 24, withinMonths: 24, fullTime: true })]),
      languageForTeer({ 0: 5, 1: 5, 2: 5, 3: 5, 4: 4 }),
      custom('check.educationByTeer', (p) => educationAtLeast(p.education, p.jobOffer && p.jobOffer.teer <= 1 ? 'one-year' : 'secondary') && (p.hasEca || !!p.canadianStudy)),
      settlementFunds([3815, 4750, 5840, 7090, 8042, 9070, 10098], (p) => p.status === 'worker' || p.status === 'graduate-pgwp'),
    ],
    notes: [L(
      'New Brunswick paused new employer designations for the rest of 2026; check that your employer is already designated.',
      'Le Nouveau-Brunswick a suspendu les nouvelles désignations d’employeurs pour le reste de 2026 ; vérifiez que votre employeur est déjà désigné.',
      '新不伦瑞克省 2026 年余下时间暂停新的雇主指定，请确认你的雇主已获指定。',
    )],
    sources: [{ url: `${ircc}/immigrate-canada/atlantic-immigration/how-to-immigrate.html`, verified: VERIFIED }],
  },
  {
    id: 'rcip',
    jurisdiction: 'federal',
    kind: 'federal-pathway',
    status: 'open',
    name: L('Rural Community Immigration Pilot', 'Projet pilote d’immigration dans les communautés rurales', '乡村社区移民试点 (RCIP)'),
    summary: L(
      'A permanent job offer from a designated employer in one of 14 rural communities, plus that community’s recommendation.',
      'Une offre d’emploi permanente d’un employeur désigné dans l’une des 14 communautés rurales, avec la recommandation de la communauté.',
      '获得 14 个乡村社区之一指定雇主的永久工作邀请，并取得社区推荐。',
    ),
    criteria: [
      jobOffer({ permanent: true, fullTime: true }),
      note('check.communityRecommendation'),
      anyOf('check.oneOf',
        [matchedExperience(RCIP_MATCH, 36)],
        [canadianGraduate({ withinMonths: 18, minProgramMonths: 24, fullTime: true })],
        [canadianGraduate({ withinMonths: 18, levels: ['master', 'phd'], fullTime: true })]),
      languageForTeer({ 0: 6, 1: 6, 2: 5, 3: 5, 4: 4, 5: 4 }),
    ],
    notes: [L(
      'Communities: Pictou County NS; North Bay, Sudbury, Timmins, Sault Ste. Marie, Thunder Bay ON; Steinbach, Altona/Rhineland, Brandon MB; Moose Jaw SK; Claresholm AB; West Kootenay, North Okanagan Shuswap, Peace Liard BC.',
      'Communautés : comté de Pictou (N.-É.) ; North Bay, Sudbury, Timmins, Sault Ste. Marie, Thunder Bay (Ont.) ; Steinbach, Altona/Rhineland, Brandon (Man.) ; Moose Jaw (Sask.) ; Claresholm (Alb.) ; West Kootenay, North Okanagan Shuswap, Peace Liard (C.-B.).',
      '参与社区：新斯科舍 Pictou County；安省 North Bay、Sudbury、Timmins、Sault Ste. Marie、Thunder Bay；曼省 Steinbach、Altona/Rhineland、Brandon；萨省 Moose Jaw；阿省 Claresholm；卑诗省 West Kootenay、North Okanagan Shuswap、Peace Liard。',
    )],
    sources: [{ url: `${ircc}/immigrate-canada/rural-franco-pilots/rural-immigration/eligibility.html`, verified: VERIFIED }],
  },
  {
    id: 'fcip',
    jurisdiction: 'federal',
    kind: 'federal-pathway',
    status: 'open',
    name: L('Francophone Community Immigration Pilot', 'Projet pilote d’immigration dans les communautés francophones', '法语社区移民试点 (FCIP)'),
    summary: L(
      'French speakers (NCLC 5+) with a job offer in one of six francophone communities outside Québec.',
      'Francophones (NCLC 5+) ayant une offre d’emploi dans l’une des six communautés francophones hors Québec.',
      '在魁北克以外六个法语社区之一获得工作邀请、法语 NCLC 5 以上的人。',
    ),
    criteria: [
      jobOffer({ permanent: true, fullTime: true }),
      note('check.communityRecommendation'),
      minLanguage(5, 'fr'),
      workExperience({ months: 12, withinMonths: 36, excludeSelfEmployed: true }),
    ],
    notes: [L(
      'Communities: Acadian Peninsula NB; Sudbury, Timmins, Superior East ON; St. Pierre Jolys MB; Kelowna BC.',
      'Communautés : Péninsule acadienne (N.-B.) ; Sudbury, Timmins, Superior Est (Ont.) ; St-Pierre-Jolys (Man.) ; Kelowna (C.-B.).',
      '参与社区：新不伦瑞克阿卡迪亚半岛；安省 Sudbury、Timmins、Superior East；曼省 St. Pierre Jolys；卑诗省 Kelowna。',
    )],
    sources: [{ url: `${ircc}/immigrate-canada/rural-franco-pilots/franco-immigration/eligibility.html`, verified: VERIFIED }],
  },
  {
    id: 'home-care-pilots',
    jurisdiction: 'federal',
    kind: 'federal-pathway',
    status: 'paused',
    name: L('Home Care Worker Immigration Pilots (paused)', 'Projets pilotes d’immigration des travailleurs de soins à domicile (suspendus)', '家庭护理工作者移民试点（暂停）'),
    summary: L(
      'Intake paused on 2025-12-19 until further notice; it will not reopen in March 2026.',
      'Réception suspendue le 2025-12-19 jusqu’à nouvel ordre ; elle ne rouvrira pas en mars 2026.',
      '已于 2025-12-19 暂停受理，直至另行通知，2026 年 3 月不会重开。',
    ),
    criteria: [jobOffer({ nocs: ['44100', '42202', '44101', '33102'] })],
    sources: [{ url: `https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/pausing-home-care-worker-immigration-pilots-application-intake.html`, verified: VERIFIED }],
  },

  // ---------------------------------------------------------------- bridge
  {
    id: 'pgwp',
    jurisdiction: 'federal',
    kind: 'temporary',
    status: 'open',
    name: L('Post-Graduation Work Permit', 'Permis de travail postdiplôme', '毕业后工作许可 (PGWP)'),
    summary: L(
      'Not permanent residence, but the work permit that lets most graduates gain the Canadian experience the PR programs ask for.',
      'Pas la résidence permanente, mais le permis qui permet à la plupart des diplômés d’acquérir l’expérience canadienne exigée par les programmes de RP.',
      '不是永久居民身份，但它让大多数毕业生能积累永居项目所需的加拿大工作经验。',
    ),
    criteria: [
      custom('check.pgwpStage', (p) =>
        p.status === 'student' ||
        (p.status !== 'graduate-pgwp' && !!p.canadianStudy && p.canadianStudy.monthsSinceGraduation <= 6)),
      canadianGraduate({ minProgramMonths: 8, fullTime: true }),
      custom('check.clbByProgram', (p) => {
        const uni = !!p.canadianStudy && ['bachelor', 'two-or-more', 'master', 'phd'].includes(p.canadianStudy.level);
        return Math.max(minOf(p.english), minOf(p.french)) >= (uni ? 7 : 5);
      }, { high: 7, low: 5 }, 'hint.raiseLanguage'),
      inCanadaNow(),
    ],
    notes: [
      L(
        'Apply within 180 days of finishing. Bachelor’s, master’s and PhD graduates have no field-of-study requirement; college programs must be on the eligible list (frozen for 2026).',
        'Présentez la demande dans les 180 jours suivant la fin du programme. Pas d’exigence de domaine d’études pour le baccalauréat, la maîtrise et le doctorat ; les programmes collégiaux doivent figurer sur la liste admissible (gelée pour 2026).',
        '须在完成学业后 180 天内申请。本科、硕士、博士无专业限制；学院项目须在合格专业清单内（2026 年清单冻结）。',
      ),
      L(
        'Master’s graduates get 3 years even if the program was shorter than 2 years.',
        'Les diplômés de maîtrise obtiennent 3 ans même si le programme durait moins de 2 ans.',
        '硕士毕业生即使项目不足两年也可获得 3 年工签。',
      ),
    ],
    sources: [{ url: `${ircc}/study-canada/work/after-graduation/eligibility.html`, verified: VERIFIED }],
  },
];


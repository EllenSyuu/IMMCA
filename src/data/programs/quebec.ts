/**
 * Québec selects its own economic immigrants: a Québec Selection Certificate
 * (CSQ) first, then a federal PR application. Express Entry does not apply to
 * people who intend to live in Québec. Verified 2026-10-27 on quebec.ca.
 */
import { anyOf, ageRange, custom, livesIn, minEducation, note, qualifyingMonths, workExperience } from '../../engine/criteria';
import type { Check, Criterion, EducationLevel, Profile, ProgramSpec } from '../../engine/types';
import { L, VERIFIED } from './shared';

const qc = 'https://www.quebec.ca/immigration/permanente/travailleurs-qualifies';

/** French on the Québec scale, falling back to NCLC when no Québec levels were given. */
export function quebecFrench(p: Profile): { oral: number; written: number } {
  if (p.quebecFrench) return p.quebecFrench;
  const f = p.french;
  if (!f) return { oral: 0, written: 0 };
  return { oral: Math.min(f.listening, f.speaking), written: Math.min(f.reading, f.writing) };
}

function qcFrench(oral: number, written = 0): Criterion {
  return {
    evaluate(p): Check {
      const have = quebecFrench(p);
      const ok = have.oral >= oral && have.written >= written;
      return {
        key: written ? 'check.qcFrenchBoth' : 'check.qcFrenchOral',
        params: { oral, written, haveOral: have.oral, haveWritten: have.written },
        status: p.french || p.quebecFrench ? (ok ? 'met' : 'unmet') : 'unmet',
        ...(ok ? {} : { hintKey: 'hint.qcFrench', hintParams: { oral, written } }),
      };
    },
  };
}

/** The person's main occupation: the job offer if any, else the most recent work period. */
const mainTeer = (p: Profile) =>
  p.jobOffer?.teer ?? [...p.work].sort((a, b) => a.endedMonthsAgo - b.endedMonthsAgo)[0]?.teer;

// ---------------------------------------------------------------- Arrima score (indicative)
const AGE_POINTS: Record<number, number> = {
  18: 110, 19: 110, 31: 110, 32: 100, 33: 90, 34: 80, 35: 75, 36: 70, 37: 65,
  38: 60, 39: 55, 40: 50, 41: 40, 42: 30, 43: 20, 44: 10,
};
const FRENCH_PER_SKILL = (lvl: number) => (lvl >= 9 ? 50 : lvl >= 7 ? 44 : lvl >= 5 ? 38 : 0);

function educationPoints(level: EducationLevel, months?: number): number {
  const table: Record<EducationLevel, number> = {
    none: 0, secondary: 13, 'one-year': 52, 'two-year': 52, bachelor: 104, 'two-or-more': 110,
    master: months !== undefined && months < 24 ? 110 : 117, phd: 130,
  };
  return table[level];
}

function quebecDiplomaPoints(level: EducationLevel, months: number): number {
  const table: Record<EducationLevel, number> = {
    none: 0, secondary: 20, 'one-year': 80, 'two-year': 80, bachelor: 160, 'two-or-more': 170,
    master: months < 24 ? 170 : 180, phd: 200,
  };
  return table[level];
}

const band = (months: number, steps: number[]) =>
  months >= 48 ? steps[4] : months >= 36 ? steps[3] : months >= 24 ? steps[2] : months >= 12 ? steps[1] : steps[0];

/**
 * Indicative Arrima expression-of-interest score (out of 1,400) for a single
 * applicant, from the MIFI grid updated 2026-06-26. Leaves out factors a
 * screener can't know: the labour-market diagnosis of the occupation, time
 * outside the Montréal CMM, family in Québec and spouse factors.
 */
export function arrimaScore(p: Profile): number {
  const fr = quebecFrench(p);
  const french = 2 * FRENCH_PER_SKILL(fr.oral) + 2 * FRENCH_PER_SKILL(fr.written);
  const age = p.age >= 20 && p.age <= 30 ? 120 : (AGE_POINTS[p.age] ?? 0);
  const allWork = qualifyingMonths(p.work, { months: 0, withinMonths: 60 });
  const work = band(allWork, [0, 20, 40, 50, 70]);
  const qcStudy = p.canadianStudy?.province === 'QC' ? p.canadianStudy : undefined;
  const education = educationPoints(p.education, qcStudy?.programMonths);
  const diploma = qcStudy ? quebecDiplomaPoints(qcStudy.level, qcStudy.programMonths) : 0;
  const qcWork = band(qualifyingMonths(p.work, { months: 0, province: 'QC', withinMonths: 60 }), [0, 40, 80, 120, 160]);
  const offer = p.jobOffer?.province === 'QC' ? 30 : 0;
  return french + age + work + education + diploma + qcWork + offer;
}

const arrimaPoints = (benchmark?: number) => (p: Profile) => ({ label: 'points.arrima', value: arrimaScore(p), benchmark });

// ---------------------------------------------------------------- PEQ snapshot rule
/** Months between 2025-11-19 (the PEQ snapshot date) and `today`. */
export function monthsSinceSnapshot(today = new Date()): number {
  const snap = new Date('2025-11-19T00:00:00Z');
  return (today.getUTCFullYear() - snap.getUTCFullYear()) * 12 + (today.getUTCMonth() - snap.getUTCMonth()) - (today.getUTCDate() < snap.getUTCDate() ? 1 : 0);
}

const PEQ_LEVELS: EducationLevel[] = ['bachelor', 'two-or-more', 'master', 'phd'];

export const quebecPrograms: ProgramSpec[] = [
  {
    id: 'qc-pstq-1',
    jurisdiction: 'QC',
    kind: 'quebec',
    status: 'invitation-only',
    name: L('PSTQ – Stream 1: Highly qualified and specialized skills', 'PSTQ – Volet 1 : Haute qualification et compétences spécialisées', '魁北克技术移民 PSTQ – 第 1 类：高资质与专业技能'),
    summary: L(
      'Québec’s main skilled-worker program for professional and technical jobs (TEER 0–2). No job offer needed; selection by Arrima score.',
      'Le principal programme de travailleurs qualifiés du Québec pour les emplois professionnels et techniques (FEER 0–2). Aucune offre requise ; sélection par score Arrima.',
      '魁北克针对专业和技术职位（TEER 0–2）的主要技术移民项目，无需工作邀请，按 Arrima 分数邀请。',
    ),
    criteria: [
      custom('check.qcTeer', (p) => { const t = mainTeer(p); return t === undefined ? false : t <= 2; }, { teers: '0, 1, 2' }),
      workExperience({ months: 12, teers: [0, 1, 2], withinMonths: 60 }),
      minEducation('one-year', { requireEcaIfForeign: false }),
      qcFrench(7, 5),
      ageRange(18, 99),
      livesIn('QC'),
    ],
    points: arrimaPoints(),
    notes: [
      L(
        'Every 2026 round required living in Québec. Rounds for Québec-diploma holders had minimums of 677–782; since July rounds have been small (≈ 30–50) and targeted at health, IT, engineering and trades occupations, with minimums around 634–700.',
        'Toutes les rondes de 2026 exigeaient de résider au Québec. Les exercices réservés aux diplômés du Québec avaient des minimums de 677 à 782 ; depuis juillet, les rondes sont petites (≈ 30–50) et ciblent la santé, les TI, le génie et les métiers, avec des minimums d’environ 634 à 700.',
        '2026 年每轮都要求居住在魁北克。魁北克学历专场的最低分为 677–782；7 月以来每轮规模小（约 30–50 人），针对医疗、IT、工程和技工职业，最低分约 634–700。',
      ),
      L(
        'The Arrima score shown is indicative: it leaves out the labour-market diagnosis of your occupation (up to 120), time outside the Montréal area (up to 120) and family factors.',
        'Le score Arrima affiché est indicatif : il exclut le diagnostic du marché du travail de votre profession (jusqu’à 120), le temps passé hors de la région de Montréal (jusqu’à 120) et les facteurs familiaux.',
        '显示的 Arrima 分数仅供参考：未计入职业劳动力市场诊断（最多 120 分）、在蒙特利尔都会区以外的时间（最多 120 分）和家庭因素。',
      ),
    ],
    sources: [
      { url: `${qc}/programme-selection-travailleurs-qualifies/exigences`, verified: VERIFIED },
      { url: `${qc}/programme-selection-travailleurs-qualifies/invitation/2026`, verified: VERIFIED },
      { url: 'https://cdn-contenu.quebec.ca/cdn-contenu/immigration/publications/fr/Pointage_criteres.pdf', verified: VERIFIED },
    ],
  },
  {
    id: 'qc-pstq-2',
    jurisdiction: 'QC',
    kind: 'quebec',
    status: 'invitation-only',
    name: L('PSTQ – Stream 2: Intermediate and manual skills', 'PSTQ – Volet 2 : Compétences intermédiaires et manuelles', '魁北克技术移民 PSTQ – 第 2 类：中级与体力技能'),
    summary: L(
      'For TEER 3–5 jobs: 24 months of experience in 5 years, at least 12 of them in Québec, and oral French at level 5.',
      'Pour les emplois FEER 3–5 : 24 mois d’expérience en 5 ans, dont au moins 12 au Québec, et un français oral de niveau 5.',
      '适用于 TEER 3–5 职位：5 年内 24 个月工作经验，其中至少 12 个月在魁北克，法语口语 5 级。',
    ),
    criteria: [
      custom('check.qcTeer', (p) => { const t = mainTeer(p); return t === undefined ? false : t >= 3; }, { teers: '3, 4, 5' }),
      {
        evaluate: (p) => [
          { key: 'check.work', params: { months: 24, have: qualifyingMonths(p.work, { months: 0, withinMonths: 60 }), where: 'where.anywhere', teers: '0–5', years: 5 }, status: qualifyingMonths(p.work, { months: 0, withinMonths: 60 }) >= 24 ? 'met' : 'unmet' },
          { key: 'check.work', params: { months: 12, have: qualifyingMonths(p.work, { months: 0, province: 'QC', withinMonths: 60 }), where: 'prov.QC', teers: '0–5', years: 5 }, status: qualifyingMonths(p.work, { months: 0, province: 'QC', withinMonths: 60 }) >= 12 ? 'met' : 'unmet' },
        ],
      },
      minEducation('secondary'),
      qcFrench(5),
      livesIn('QC'),
    ],
    points: arrimaPoints(),
    sources: [{ url: `${qc}/programme-selection-travailleurs-qualifies/exigences`, verified: VERIFIED }],
  },
  {
    id: 'qc-pstq-3',
    jurisdiction: 'QC',
    kind: 'quebec',
    status: 'invitation-only',
    name: L('PSTQ – Stream 3: Regulated professions', 'PSTQ – Volet 3 : Professions réglementées', '魁北克技术移民 PSTQ – 第 3 类：受监管职业'),
    summary: L(
      'For people in a regulated profession (nurses, engineers, teachers, electricians…) who hold, or are obtaining, a Québec permit or equivalence.',
      'Pour les personnes exerçant une profession réglementée (infirmières, ingénieurs, enseignants, électriciens…) qui ont ou obtiennent un permis ou une équivalence du Québec.',
      '适合从事受监管职业（护士、工程师、教师、电工等）并持有或正在取得魁北克执照或学历等效认定的人。',
    ),
    criteria: [
      note('check.regulatedProof'),
      anyOf('check.oneOf',
        [custom('check.qcTeer', (p) => (mainTeer(p) ?? 9) <= 2, { teers: '0, 1, 2' }), qcFrench(7, 5)],
        [custom('check.qcTeer', (p) => (mainTeer(p) ?? -1) >= 3, { teers: '3, 4, 5' }), qcFrench(5)]),
      livesIn('QC'),
    ],
    points: arrimaPoints(),
    notes: [L(
      'You have one year after the invitation to obtain the permit or equivalence from the regulatory body.',
      'Vous avez un an après l’invitation pour obtenir le permis ou l’équivalence de l’ordre professionnel.',
      '收到邀请后有一年时间向监管机构取得执照或等效认定。',
    )],
    sources: [{ url: `${qc}/programme-selection-travailleurs-qualifies/exigences`, verified: VERIFIED }],
  },
  {
    id: 'qc-peq-graduates',
    jurisdiction: 'QC',
    kind: 'quebec',
    status: 'open',
    closesOn: '2026-10-31',
    name: L('PEQ – Québec graduates (reopened until 31 Oct 2026)', 'PEQ – Diplômés du Québec (rouvert jusqu’au 31 oct. 2026)', '魁北克经验类 PEQ – 魁北克毕业生（重开至 2026-10-31）'),
    summary: L(
      'A one-time window for Québec graduates whose eligible diploma was obtained by 19 November 2025. Direct application, no invitation.',
      'Une fenêtre unique pour les diplômés du Québec dont le diplôme admissible a été obtenu au plus tard le 19 novembre 2025. Demande directe, sans invitation.',
      '一次性窗口，适用于在 2025 年 11 月 19 日前取得合格魁北克学历的毕业生，直接申请，无需邀请。',
    ),
    criteria: [
      custom('check.peqDiploma', (p) => {
        const s = p.canadianStudy;
        return !!s && s.province === 'QC' && s.fullTime && PEQ_LEVELS.includes(s.level) &&
          s.monthsSinceGraduation >= monthsSinceSnapshot() && s.monthsSinceGraduation <= 36;
      }, { date: '2025-11-19', within: 36 }),
      qcFrench(7, 5),
      livesIn('QC'),
      ageRange(18, 99),
    ],
    notes: [L(
      'Applications close 31 October 2026. Eligible diplomas also include a technical DEC and a DEP of 1,800 hours or more. The requirement to have studied in French was removed.',
      'Les demandes ferment le 31 octobre 2026. Sont aussi admissibles le DEC technique et le DEP de 1 800 heures ou plus. L’exigence d’avoir étudié en français a été retirée.',
      '申请于 2026 年 10 月 31 日截止。合格学历还包括技术类 DEC 和 1,800 小时以上的 DEP。已取消须以法语学习的要求。',
    )],
    sources: [
      { url: `${qc}/programme-experience-quebecoise`, verified: VERIFIED },
      { url: 'https://cdn-contenu.quebec.ca/cdn-contenu/adm/min/immigration/publications-adm/reouverture_peq.pdf', verified: VERIFIED },
    ],
  },
  {
    id: 'qc-peq-workers',
    jurisdiction: 'QC',
    kind: 'quebec',
    status: 'open',
    closesOn: '2026-10-31',
    name: L('PEQ – Temporary workers (reopened until 31 Oct 2026)', 'PEQ – Travailleurs étrangers temporaires (rouvert jusqu’au 31 oct. 2026)', '魁北克经验类 PEQ – 临时外劳（重开至 2026-10-31）'),
    summary: L(
      'For people with 24 months of full-time skilled work in Québec (TEER 0–3) in the last 36 months, who still hold such a job.',
      'Pour les personnes ayant 24 mois de travail qualifié à temps plein au Québec (FEER 0–3) au cours des 36 derniers mois et qui occupent toujours un tel emploi.',
      '适合过去 36 个月内在魁北克全职从事技术类工作（TEER 0–3）满 24 个月、且目前仍在职的人。',
    ),
    criteria: [
      workExperience({ months: 24, province: 'QC', teers: [0, 1, 2, 3], withinMonths: 36, excludeSelfEmployed: true }),
      custom('check.currentlyEmployed', (p) => p.work.some((w) => w.inCanada && w.province === 'QC' && w.endedMonthsAgo === 0 && w.teer <= 3)),
      qcFrench(7),
      livesIn('QC'),
    ],
    notes: [L(
      'The experience must already have existed on 19 November 2025. Québec’s notice and stream page differ on whether workers also need a Québec diploma; confirm on quebec.ca.',
      'L’expérience devait exister au 19 novembre 2025. L’avis de réouverture et la page du volet divergent sur l’exigence d’un diplôme du Québec pour les travailleurs ; vérifiez sur quebec.ca.',
      '工作经验须在 2025 年 11 月 19 日前已具备。重开通知与项目页面对工人类是否也需魁北克学历说法不一，请到 quebec.ca 确认。',
    )],
    sources: [{ url: `${qc}/programme-experience-quebecoise`, verified: VERIFIED }],
  },
  {
    id: 'qc-pilots',
    jurisdiction: 'QC',
    kind: 'quebec',
    status: 'closed',
    name: L('Québec permanent immigration pilots (ended)', 'Programmes pilotes d’immigration permanente du Québec (terminés)', '魁北克永久移民试点项目（已结束）'),
    summary: L(
      'The orderlies, AI/IT/visual effects and food-processing pilots all ended on 1 January 2026.',
      'Les programmes pilotes des préposés aux bénéficiaires, de l’IA/TI/effets visuels et de la transformation alimentaire ont pris fin le 1er janvier 2026.',
      '护理员、人工智能 / 信息技术 / 视觉特效、食品加工三个试点项目均已于 2026 年 1 月 1 日结束。',
    ),
    criteria: [livesIn('QC')],
    sources: [{ url: `${qc}/intelligence-artificielle`, verified: VERIFIED }],
  },
];

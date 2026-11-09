/**
 * Policy changes that affect many routes at once, shown beside the results.
 * Each item is checked against its official source; newest first.
 */
import type { L10n } from '../engine/types';
import { L } from './programs/shared';

export interface NewsItem {
  date: string;
  title: L10n;
  body: L10n;
  source: string;
}

export const NEWS: NewsItem[] = [
  {
    date: '2026-11-05',
    title: L('2027–2029 levels plan', 'Plan des niveaux 2027–2029', '2027–2029 年移民配额计划'),
    body: L(
      '380,000 new permanent residents a year. Express Entry’s skilled-worker programs: 100,000; provincial nominees: 95,000; the new rural program: 5,500 in 2027. New international students are capped at 150,000 a year.',
      '380 000 nouveaux résidents permanents par an. Programmes de travailleurs qualifiés d’Entrée express : 100 000 ; candidats des provinces : 95 000 ; nouveau programme rural : 5 500 en 2027. Les nouveaux étudiants étrangers sont plafonnés à 150 000 par an.',
      '每年 380,000 名新永久居民。快速通道技术移民项目 100,000 人，省提名 95,000 人，新的乡村项目 2027 年 5,500 人。新国际学生每年上限 150,000 人。',
    ),
    source: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/immigration-system/levels/supplementary-immigration-levels-2027-2029.html',
  },
  {
    date: '2026-11-05',
    title: L('A one-time 2027 measure for people already in Canada', 'Une mesure ponctuelle en 2027 pour les personnes déjà au Canada', '2027 年针对已在加拿大者的一次性措施'),
    body: L(
      'Up to 200,000 people already living in Canada will move to permanent residence in 2027. For workers, provinces get larger nominee allocations and can pick people who already applied to select federal programs. Who qualifies has not been published yet.',
      'Jusqu’à 200 000 personnes vivant déjà au Canada deviendront résidents permanents en 2027. Pour les travailleurs, les provinces recevront plus de places de candidats et pourront choisir des personnes ayant déjà présenté une demande à certains programmes fédéraux. Les critères ne sont pas encore publiés.',
      '2027 年最多 200,000 名已在加拿大生活的人将转为永久居民。工人部分通过增加各省提名名额实现，各省可挑选已申请特定联邦项目的人。具体资格尚未公布。',
    ),
    source: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/2026/11/building-a-stronger-canada-through-a-well-managed-predictable-immigration-system.html',
  },
  {
    date: '2026-11-04',
    title: L('The rural pilot becomes permanent', 'Le projet pilote rural devient permanent', '乡村试点转为永久项目'),
    body: L(
      'The Rural Community Immigration Program replaces the pilot. Pilot recommendations can be issued until 31 December 2026; recommendations for the new program start on 1 January 2027.',
      'Le Programme d’immigration dans les communautés rurales remplace le projet pilote. Les recommandations du projet pilote peuvent être délivrées jusqu’au 31 décembre 2026 ; celles du nouveau programme commencent le 1er janvier 2027.',
      '乡村社区移民项目取代试点。试点推荐信可发到 2026 年 12 月 31 日；新项目的推荐信从 2027 年 1 月 1 日开始。',
    ),
    source: 'https://gazette.gc.ca/rp-pr/p2/2026/2026-11-04/html/sor-dors217-eng.html',
  },
  {
    date: '2026-11-03',
    title: L('New Express Entry points; rounds paused', 'Nouveaux points d’Entrée express ; rondes suspendues', '快速通道新计分规则生效，抽签暂停'),
    body: L(
      'The new CRS rules are in force. IRCC is recalculating every profile, which can take up to two weeks, and holds no rounds until it finishes.',
      'Les nouvelles règles du SCG sont en vigueur. IRCC recalcule tous les profils, ce qui peut prendre jusqu’à deux semaines, et ne tient aucune ronde d’ici là.',
      '新 CRS 规则已生效。IRCC 正在重新计算所有档案，最长约两周，期间不进行抽签。',
    ),
    source: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/changes.html',
  },
];

/**
 * Official test score → CLB / NCLC conversion (IRCC "Language test equivalency
 * charts", verified 2026-10-27), plus the Québec French scale used by Arrima.
 *
 * Each table lists the minimum score for CLB 10 down to CLB 4 (index 0 → CLB 10).
 */
import type { LanguageResult } from './types';

export type Ability = 'listening' | 'reading' | 'writing' | 'speaking';
export type TestId = 'celpip' | 'ielts' | 'pte' | 'tef' | 'tefold' | 'tcf';

export const TESTS: Record<TestId, { lang: 'en' | 'fr'; label: string; step: number; max: number }> = {
  celpip: { lang: 'en', label: 'CELPIP-General', step: 1, max: 12 },
  ielts: { lang: 'en', label: 'IELTS General Training', step: 0.5, max: 9 },
  pte: { lang: 'en', label: 'PTE Core', step: 1, max: 90 },
  tef: { lang: 'fr', label: 'TEF Canada (score /699)', step: 1, max: 699 },
  tefold: { lang: 'fr', label: 'TEF Canada (Express Entry “ancien score”)', step: 1, max: 450 },
  tcf: { lang: 'fr', label: 'TCF Canada', step: 1, max: 699 },
};

type Thresholds = Record<Ability, number[]>; // minimum score for CLB 10, 9, 8, 7, 6, 5, 4

const TABLES: Record<TestId, Thresholds> = {
  celpip: {
    listening: [10, 9, 8, 7, 6, 5, 4], reading: [10, 9, 8, 7, 6, 5, 4],
    writing: [10, 9, 8, 7, 6, 5, 4], speaking: [10, 9, 8, 7, 6, 5, 4],
  },
  ielts: {
    listening: [8.5, 8, 7.5, 6, 5.5, 5, 4.5],
    reading: [8, 7, 6.5, 6, 5, 4, 3.5],
    writing: [7.5, 7, 6.5, 6, 5.5, 5, 4],
    speaking: [7.5, 7, 6.5, 6, 5.5, 5, 4],
  },
  pte: {
    listening: [89, 82, 71, 60, 50, 39, 28],
    reading: [88, 78, 69, 60, 51, 42, 33],
    writing: [90, 88, 79, 69, 60, 51, 41],
    speaking: [89, 84, 76, 68, 59, 51, 42],
  },
  // TEF Canada, /699 scale for tests taken after 2023-12-10.
  tef: {
    listening: [546, 503, 462, 434, 393, 352, 306],
    reading: [546, 503, 462, 434, 393, 352, 306],
    writing: [558, 512, 472, 428, 379, 330, 268],
    speaking: [556, 518, 494, 456, 422, 387, 328],
  },
  // TEF Canada "Équivalence ancien score" column — the scale IRCC requires in an Express Entry profile.
  tefold: {
    listening: [316, 298, 280, 249, 217, 181, 145],
    reading: [263, 248, 233, 207, 181, 151, 121],
    writing: [393, 371, 349, 310, 271, 226, 181],
    speaking: [393, 371, 349, 310, 271, 226, 181],
  },
  // TCF Canada: comprehension out of 699, expression out of 20.
  tcf: {
    listening: [549, 523, 503, 458, 398, 369, 331],
    reading: [549, 524, 499, 453, 406, 375, 342],
    writing: [16, 14, 12, 10, 7, 6, 4],
    speaking: [16, 14, 12, 10, 7, 6, 4],
  },
};

/** Convert one ability's score to CLB/NCLC (0 if below CLB 4). */
export function toClb(test: TestId, ability: Ability, score: number): number {
  const row = TABLES[test][ability];
  const i = row.findIndex((min) => score >= min);
  return i === -1 ? 0 : 10 - i;
}

export function toLanguageResult(test: TestId, scores: Record<Ability, number>): LanguageResult {
  return {
    listening: toClb(test, 'listening', scores.listening),
    reading: toClb(test, 'reading', scores.reading),
    writing: toClb(test, 'writing', scores.writing),
    speaking: toClb(test, 'speaking', scores.speaking),
  };
}

/**
 * Québec French scale (Échelle québécoise, 1–12) from TEF / TCF scores.
 * Source: MIFI correspondence table (version 2024-11-29). Levels are reported
 * as the lower bound of each band (e.g. "7–8" → 7).
 */
export function toQuebecLevel(test: 'tef' | 'tcf', ability: Ability, score: number): number {
  const expression = test === 'tcf' && (ability === 'writing' || ability === 'speaking');
  const bands = expression
    ? [[18, 11], [14, 9], [10, 7], [6, 5], [4, 4], [2, 3]]
    : [[600, 11], [500, 9], [400, 7], [300, 5], [260, 4], [200, 3]];
  for (const [min, level] of bands) if (score >= min) return level;
  return score > 0 ? 1 : 0;
}

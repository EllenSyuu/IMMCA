import { describe, expect, it } from 'vitest';
import { toClb, toLanguageResult, toQuebecLevel } from '../src/engine/language';

describe('test score conversion', () => {
  it('maps IELTS band edges to the official CLB levels', () => {
    expect(toClb('ielts', 'listening', 8)).toBe(9);
    expect(toClb('ielts', 'listening', 7)).toBe(7);
    expect(toClb('ielts', 'reading', 6.5)).toBe(8);
    expect(toClb('ielts', 'writing', 3.5)).toBe(0);
  });

  it('maps CELPIP 11 and 12 to CLB 10', () => {
    expect(toLanguageResult('celpip', { listening: 12, reading: 11, writing: 9, speaking: 8 })).toEqual({ listening: 10, reading: 10, writing: 9, speaking: 8 });
  });

  it('uses the TCF expression scale out of 20', () => {
    expect(toClb('tcf', 'speaking', 10)).toBe(7);
    expect(toClb('tcf', 'listening', 458)).toBe(7);
    expect(toClb('tcf', 'listening', 457)).toBe(6);
  });

  it('converts TEF Canada (/699, after 2023-12-10)', () => {
    expect(toClb('tef', 'speaking', 456)).toBe(7);
    expect(toClb('tef', 'writing', 427)).toBe(6);
  });

  it('maps TEF/TCF to the Québec scale', () => {
    expect(toQuebecLevel('tef', 'listening', 400)).toBe(7);
    expect(toQuebecLevel('tcf', 'writing', 6)).toBe(5);
    expect(toQuebecLevel('tcf', 'reading', 299)).toBe(4);
  });
});

/**
 * Freeze the clock for every test at the day the frozen test data was taken.
 *
 * The engine reads "today" for date-switched rules (the 3 November 2026 CRS
 * reform, closing dates, the PEQ snapshot window). Left on the real clock, a test
 * written before such a date fails on its own when the date passes, which is what
 * broke the daily update from 2026-11-03. Tests that need another day pass it
 * explicitly; tests/today.test.ts runs the app on the real date instead.
 */
import { beforeEach, vi } from 'vitest';

export const TEST_DAY = '2026-10-28';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(`${TEST_DAY}T12:00:00Z`));
});

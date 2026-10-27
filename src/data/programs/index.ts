import type { ProgramSpec } from '../../engine/types';
import { eastPrograms } from './east';
import { federalPrograms } from './federal';
import { quebecPrograms } from './quebec';
import { westPrograms } from './west';

/** Every program the screener knows about, in display order of jurisdiction. */
export const PROGRAMS: ProgramSpec[] = [...federalPrograms, ...quebecPrograms, ...eastPrograms, ...westPrograms];

export const PROGRAM_BY_ID = new Map(PROGRAMS.map((p) => [p.id, p]));

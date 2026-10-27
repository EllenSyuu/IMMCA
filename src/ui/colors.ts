import type { Jurisdiction } from '../engine/types';

/** Line colour for each jurisdiction, like lines on a transit map. */
export const LINE_COLOR: Record<Jurisdiction, string> = {
  federal: '#D52B1E',
  QC: '#1D4ED8',
  ON: '#E8710A',
  BC: '#0F8B6E',
  AB: '#7C3AED',
  SK: '#B7860B',
  MB: '#9A6B3F',
  NB: '#0E8FA8',
  NS: '#4F6D8F',
  PE: '#C026D3',
  NL: '#5C8F1A',
  YT: '#475569',
  NT: '#64748B',
  NU: '#64748B',
};

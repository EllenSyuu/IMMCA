import type { Jurisdiction } from '../engine/types';

/**
 * Line colour for each jurisdiction, like lines on a transit map. These only
 * identify a government; they never mean "met", "open" or "warning". Greens
 * and the status reds/ambers are kept for those judgements, so no line uses them.
 */
export const LINE_COLOR: Record<Jurisdiction, string> = {
  federal: '#D52B1E',
  QC: '#2F6BFF',
  ON: '#E8710A',
  BC: '#0891B2',
  AB: '#7C3AED',
  SK: '#B45309',
  MB: '#8B5E3C',
  NB: '#4F46E5',
  NS: '#4F6D8F',
  PE: '#C026D3',
  NL: '#DB2777',
  YT: '#475569',
  NT: '#64748B',
  NU: '#64748B',
};

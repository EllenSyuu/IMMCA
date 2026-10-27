import { LINE_COLOR } from './colors';
import { useI18n } from '../i18n';

/**
 * Hero illustration: lines from every jurisdiction converge on a single
 * terminus, permanent residence. Drawn once on load (skipped when the visitor
 * prefers reduced motion).
 */
const LINES: { color: string; d: string; stations: [number, number][] }[] = [
  { color: LINE_COLOR.federal, d: 'M20 60 H250 Q300 60 330 110 L380 190 Q395 215 425 215 H520', stations: [[90, 60], [170, 60], [250, 60]] },
  { color: LINE_COLOR.QC, d: 'M20 120 H200 Q240 120 270 150 L320 200 Q335 215 365 215 H520', stations: [[80, 120], [150, 120]] },
  { color: LINE_COLOR.ON, d: 'M20 180 H180 Q210 180 240 200 Q260 215 290 215 H520', stations: [[70, 180], [130, 180]] },
  { color: LINE_COLOR.BC, d: 'M20 250 H190 Q225 250 255 230 Q275 215 305 215 H520', stations: [[100, 250], [160, 250]] },
  { color: LINE_COLOR.AB, d: 'M20 310 H230 Q270 310 300 270 L330 235 Q348 215 375 215 H520', stations: [[60, 310], [130, 310], [200, 310]] },
  { color: LINE_COLOR.NS, d: 'M20 370 H260 Q310 370 340 320 L380 250 Q398 215 430 215 H520', stations: [[110, 370], [190, 370]] },
];

export function RouteMap() {
  const { t } = useI18n();
  return (
    <svg className="route-map" viewBox="0 0 600 430" role="img" aria-label={t('hero.title')}>
      {LINES.map((l, i) => (
        <g key={i} style={{ ['--i' as string]: i }}>
          <path className="route-map__line" d={l.d} stroke={l.color} pathLength={1} />
          {l.stations.map(([x, y], j) => (
            <circle key={j} className="route-map__station" cx={x} cy={y} r={7} stroke={l.color} />
          ))}
        </g>
      ))}
      <g className="route-map__terminus">
        <rect x={505} y={188} width={86} height={54} rx={27} />
        <text x={548} y={221} textAnchor="middle">{t('hero.terminus')}</text>
      </g>
    </svg>
  );
}

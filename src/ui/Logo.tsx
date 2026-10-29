/**
 * The IMMCA mark: three routes converging on one station, permanent residence.
 * Same geometry as scripts/build-icons.mjs, which renders the favicon and app icons.
 */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <g fill="none" strokeLinecap="round" strokeWidth={3.6}>
        <path d="M4 7.5H9.5C14.5 7.5 15.5 16 21 16" stroke="#D52B1E" />
        <path d="M4 24.5H9.5C14.5 24.5 15.5 16 21 16" stroke="#E8710A" />
        <path d="M4 16H21" stroke="#2F6BFF" />
      </g>
      <circle cx="25" cy="16" r="5" fill="#0e1c38" />
      <circle cx="25" cy="16" r="2" fill="#fff" />
    </svg>
  );
}

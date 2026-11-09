/**
 * The IMMCA mark: a forward arrow on a blue tile, "your next step".
 * Same geometry as scripts/build-icons.mjs, which renders the favicon and app icons.
 */
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0B57D0" />
      <path d="M11 21 21 11M13.5 11H21v7.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

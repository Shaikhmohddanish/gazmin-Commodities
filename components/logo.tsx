import Link from "next/link";

/**
 * The official lockup has navy ink, which disappears on a navy page. This screen
 * filter (from the WordPress theme, functions.php:31) lifts the navy to the ink
 * colour and keeps the gold; the artwork itself is never redrawn.
 */
export function LogoFilter() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <filter id="logo-platinum" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -12 0 12 0 0" result="navy" />
          <feFlood style={{ floodColor: "var(--color-ink)" }} result="platinum" />
          <feComposite in="platinum" in2="navy" operator="in" />
          <feComposite in2="SourceGraphic" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="GazMin Commodities, home">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image server */}
      <img src="/media/logo-gazmin.png" width={500} height={220} alt="" />
      <span className="brand__word">Commodities</span>
    </Link>
  );
}

/**
 * Generative Material-You style wallpaper. Every fill uses the --wp-* palette
 * derived from the active seed color, so changing the wallpaper choice (or
 * dark mode) re-colors it live — mirroring how Android couples wallpaper and
 * dynamic color.
 */
export function Wallpaper() {
  return (
    <div className="wallpaper" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="wp-bg" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0" stopColor="var(--wp-base1)" />
            <stop offset="1" stopColor="var(--wp-base2)" />
          </linearGradient>
          <filter id="wp-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id="wp-softer" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="11" />
          </filter>
        </defs>
        <rect width="100" height="100" fill="url(#wp-bg)" />
        <circle cx="86" cy="80" r="46" fill="var(--wp-blob1)" filter="url(#wp-softer)" opacity="0.7" />
        <circle cx="8" cy="94" r="32" fill="var(--wp-blob2)" filter="url(#wp-softer)" opacity="0.65" />
        <circle cx="80" cy="12" r="22" fill="var(--wp-blob3)" filter="url(#wp-softer)" opacity="0.5" />
        <path
          d="M -10 76 Q 28 60 54 72 T 115 66 L 115 115 L -10 115 Z"
          fill="var(--wp-hill)"
          filter="url(#wp-soft)"
          opacity="0.55"
        />
        <circle cx="80" cy="12" r="13" fill="none" stroke="var(--wp-accent)" strokeWidth="0.45" opacity="0.55" />
      </svg>
    </div>
  )
}

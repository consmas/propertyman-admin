/**
 * RentWise brand assets
 *
 * LogoMark  — house icon only (roofline + keyhole negative space)
 * LogoLockup — horizontal: icon + "RentWise" wordmark
 *
 * The house uses SVG fill-rule="evenodd" so the keyhole is always transparent,
 * showing whatever background sits behind it — works on any surface colour.
 */

interface LogoMarkProps {
  /** Pixel size (width = height). Default 36 */
  size?: number
  /** House fill colour. Default brand orange */
  color?: string
}

export function LogoMark({ size = 36, color = '#c2703e' }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="RentWise logo mark"
    >
      {/*
        Single compound path with fill-rule="evenodd":
        — Outer shape: peaked roof + rectangular body + two legs with arched doorway
        — Inner holes: keyhole circle + keyhole stem (both appear transparent)
      */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill={color}
        d={[
          // ── Outer house silhouette (clockwise) ──
          'M32 4',
          'L60 30 L51 30',
          'L51 60 L39 60',
          'L39 46 Q32 39 25 46',
          'L25 60 L13 60',
          'L13 30 L4 30 Z',
          // ── Keyhole circle (counter-clockwise → hole) ──
          'M38.5 20 A6.5 6.5 0 1 0 25.5 20 A6.5 6.5 0 1 0 38.5 20 Z',
          // ── Keyhole stem (counter-clockwise → hole) ──
          'M30 26.5 L34 26.5 L36.5 37 L27.5 37 Z',
        ].join(' ')}
      />
    </svg>
  )
}

interface LogoLockupProps {
  /** Icon size in px. Default 32 */
  iconSize?: number
  /** "Rent" text colour. Default '#1a1a1f' */
  textColor?: string
  /** "Wise" accent colour. Default '#c2703e' */
  accentColor?: string
  /** Optional subtitle line below wordmark */
  subtitle?: string
  /** Subtitle colour */
  subtitleColor?: string
}

export function LogoLockup({
  iconSize = 32,
  textColor = '#1a1a1f',
  accentColor = '#c2703e',
  subtitle,
  subtitleColor,
}: LogoLockupProps) {
  const fontSize = Math.round(iconSize * 0.56)
  const subtitleSize = Math.round(iconSize * 0.34)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(iconSize * 0.3) }}>
      <LogoMark size={iconSize} color={accentColor} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: textColor,
          }}
        >
          Rent<span style={{ color: accentColor }}>Wise</span>
        </span>
        {subtitle && (
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: subtitleSize,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: subtitleColor ?? accentColor,
              lineHeight: 1,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}

/** Lockup variant for dark/sidebar backgrounds — white text, orange accent */
export function LogoLockupDark({
  iconSize = 32,
  subtitle,
}: {
  iconSize?: number
  subtitle?: string
}) {
  return (
    <LogoLockup
      iconSize={iconSize}
      textColor="#ffffff"
      accentColor="#c2703e"
      subtitle={subtitle}
      subtitleColor="rgba(255,255,255,0.45)"
    />
  )
}

/** Lockup variant for fully white surfaces (auth pages, splash screens) */
export function LogoLockupLight({
  iconSize = 36,
  subtitle,
}: {
  iconSize?: number
  subtitle?: string
}) {
  return (
    <LogoLockup
      iconSize={iconSize}
      textColor="#1a1a1f"
      accentColor="#c2703e"
      subtitle={subtitle}
      subtitleColor="#9b9ba5"
    />
  )
}

import { argbFromHex, hexFromArgb, themeFromSourceColor, type Theme } from '@material/material-color-utilities'

/**
 * Generates the full Material 3 color scheme (including the surface container
 * roles the library's Scheme object predates) straight from tonal palettes —
 * the same mapping Android's dynamic color engine uses.
 */

export type Mode = 'light' | 'dark'

export interface WallpaperDef {
  id: string
  label: string
  seed: string
}

/** Wallpaper choices — each carries its own dynamic-color seed, like Android 12+. */
export const WALLPAPERS: WallpaperDef[] = [
  { id: 'lagoon', label: 'Lagoon', seed: '#3B6C52' },
  { id: 'horizon', label: 'Horizon', seed: '#1667C2' },
  { id: 'orchid', label: 'Orchid', seed: '#7C4E9C' },
  { id: 'ember', label: 'Ember', seed: '#B3541E' },
  { id: 'rosewater', label: 'Rosewater', seed: '#A63D62' },
]

export const DEFAULT_WALLPAPER = WALLPAPERS[1]

function tones(theme: Theme, mode: Mode): Record<string, string> {
  const p = theme.palettes.primary
  const s = theme.palettes.secondary
  const t = theme.palettes.tertiary
  const n = theme.palettes.neutral
  const nv = theme.palettes.neutralVariant
  const e = theme.palettes.error
  const c = (palette: typeof p, tone: number) => hexFromArgb(palette.tone(tone))

  if (mode === 'light') {
    return {
      primary: c(p, 40), 'on-primary': c(p, 100), 'primary-container': c(p, 90), 'on-primary-container': c(p, 10),
      secondary: c(s, 40), 'on-secondary': c(s, 100), 'secondary-container': c(s, 90), 'on-secondary-container': c(s, 10),
      tertiary: c(t, 40), 'on-tertiary': c(t, 100), 'tertiary-container': c(t, 90), 'on-tertiary-container': c(t, 10),
      error: c(e, 40), 'on-error': c(e, 100), 'error-container': c(e, 90), 'on-error-container': c(e, 10),
      surface: c(n, 98), 'on-surface': c(n, 10), 'surface-variant': c(nv, 90), 'on-surface-variant': c(nv, 30),
      'surface-container-lowest': c(n, 100), 'surface-container-low': c(n, 96), 'surface-container': c(n, 94),
      'surface-container-high': c(n, 92), 'surface-container-highest': c(n, 90),
      'surface-dim': c(n, 87), 'surface-bright': c(n, 98),
      outline: c(nv, 50), 'outline-variant': c(nv, 80),
      'inverse-surface': c(n, 20), 'inverse-on-surface': c(n, 95), 'inverse-primary': c(p, 80),
      'surface-tint': c(p, 40), scrim: c(n, 0), shadow: c(n, 0),
      'primary-fixed-dim': c(p, 80),
    }
  }
  return {
    primary: c(p, 80), 'on-primary': c(p, 20), 'primary-container': c(p, 30), 'on-primary-container': c(p, 90),
    secondary: c(s, 80), 'on-secondary': c(s, 20), 'secondary-container': c(s, 30), 'on-secondary-container': c(s, 90),
    tertiary: c(t, 80), 'on-tertiary': c(t, 20), 'tertiary-container': c(t, 30), 'on-tertiary-container': c(t, 90),
    error: c(e, 80), 'on-error': c(e, 20), 'error-container': c(e, 30), 'on-error-container': c(e, 90),
    surface: c(n, 6), 'on-surface': c(n, 90), 'surface-variant': c(nv, 30), 'on-surface-variant': c(nv, 80),
    'surface-container-lowest': c(n, 4), 'surface-container-low': c(n, 10), 'surface-container': c(n, 12),
    'surface-container-high': c(n, 17), 'surface-container-highest': c(n, 22),
    'surface-dim': c(n, 6), 'surface-bright': c(n, 24),
    outline: c(nv, 60), 'outline-variant': c(nv, 30),
    'inverse-surface': c(n, 90), 'inverse-on-surface': c(n, 20), 'inverse-primary': c(p, 40),
    'surface-tint': c(p, 80), scrim: c(n, 0), shadow: c(n, 0),
    'primary-fixed-dim': c(p, 80),
  }
}

export function applyScheme(seedHex: string, mode: Mode) {
  const theme = themeFromSourceColor(argbFromHex(seedHex))
  const scheme = tones(theme, mode)
  const root = document.documentElement
  for (const [role, hex] of Object.entries(scheme)) {
    root.style.setProperty(`--md-${role}`, hex)
  }

  // Wallpaper palette — richer tones than the UI surfaces so home-screen
  // content keeps contrast against it in both modes.
  const { primary: p, secondary: s, tertiary: t, neutral: n } = theme.palettes
  const hx = (pal: typeof p, tone: number) => hexFromArgb(pal.tone(tone))
  const wp = mode === 'light'
    ? {
        base1: hx(n, 96), base2: hx(p, 90),
        blob1: hx(p, 80), blob2: hx(t, 85), blob3: hx(s, 80),
        hill: hx(p, 87), accent: hx(p, 40),
      }
    : {
        base1: hx(n, 15), base2: hx(p, 20),
        blob1: hx(p, 40), blob2: hx(t, 35), blob3: hx(s, 45),
        hill: hx(p, 25), accent: hx(p, 70),
      }
  for (const [k, v] of Object.entries(wp)) {
    root.style.setProperty(`--wp-${k}`, v)
  }

  root.dataset.mode = mode
  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', scheme['surface'])
}

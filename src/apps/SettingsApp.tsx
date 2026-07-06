import { useRef, useState } from 'react'
import { AppScreen } from '../ui/AppScreen'
import { Icon } from '../ui/Icon'
import { Pressable } from '../ui/Pressable'
import { useSystem, type ModePref } from '../system/SystemContext'
import { WALLPAPERS } from '../theme/theme'
import { meta } from '../content'

const MODE_OPTIONS: { value: ModePref; label: string; support: string }[] = [
  { value: 'dark', label: 'Dark theme', support: 'Easier on the eyes' },
  { value: 'light', label: 'Light theme', support: 'Bright and clean' },
  { value: 'auto', label: 'Follow system', support: 'Match your OS preference' },
]

export function SettingsApp() {
  const { modePref, setModePref, wallpaperId, setWallpaperId } = useSystem()
  const [snack, setSnack] = useState<string | null>(null)
  const buildTaps = useRef(0)
  const snackTimer = useRef<number>(0)

  const showSnack = (msg: string) => {
    setSnack(msg)
    window.clearTimeout(snackTimer.current)
    snackTimer.current = window.setTimeout(() => setSnack(null), 2600)
  }

  const onBuildTap = () => {
    buildTaps.current += 1
    const left = 7 - buildTaps.current
    if (left <= 0) {
      showSnack('You are now a developer! 🎉 Check out my GitHub.')
      buildTaps.current = 0
    } else if (left <= 3) {
      showSnack(`You are now ${left} steps away from being a developer.`)
    }
  }

  return (
    <AppScreen title="Settings">
      <div className="page-fade">
        <div className="section-label" style={{ paddingTop: 0 }}>Display</div>
        <div className="card" style={{ padding: '6px 0' }}>
          {MODE_OPTIONS.map(opt => (
            <Pressable
              key={opt.value}
              className="list-item settings-item"
              onClick={() => setModePref(opt.value)}
              role="radio"
              aria-checked={modePref === opt.value}
            >
              <span className="li-icon">
                <Icon name={opt.value === 'light' ? 'light_mode' : opt.value === 'dark' ? 'dark_mode' : 'smartphone'} size={20} />
              </span>
              <span className="li-text">
                <div className="li-headline">{opt.label}</div>
                <div className="li-support">{opt.support}</div>
              </span>
              <span className={`radio-dot ${modePref === opt.value ? 'selected' : ''}`} />
            </Pressable>
          ))}
        </div>

        <div className="section-label">Wallpaper &amp; style</div>
        <div className="card">
          <div className="list-item" style={{ paddingBottom: 4 }}>
            <span className="li-icon"><Icon name="palette" size={20} /></span>
            <span className="li-text">
              <div className="li-headline">Dynamic color</div>
              <div className="li-support">Pick a wallpaper — the whole system retints, Material You style</div>
            </span>
          </div>
          <div className="wallpaper-swatches">
            {WALLPAPERS.map(wp => (
              <Pressable
                key={wp.id}
                className="wp-swatch"
                style={{ background: wp.seed }}
                onClick={() => setWallpaperId(wp.id)}
                aria-label={`${wp.label} wallpaper`}
                title={wp.label}
              >
                {wallpaperId === wp.id && <Icon name="check" size={22} />}
              </Pressable>
            ))}
          </div>
          <p className="contact-note" style={{ padding: '4px 16px 14px' }}>
            Colors are generated from the seed with Google's material-color-utilities —
            the same tonal-palette algorithm Android 12+ uses.
          </p>
        </div>

        <div className="section-label">About device</div>
        <div className="card" style={{ padding: '6px 0' }}>
          <div className="list-item">
            <span className="li-icon"><Icon name="smartphone" size={20} /></span>
            <span className="li-text">
              <div className="li-headline">Device</div>
              <div className="li-support">Portfolio Pixel — a website cosplaying as Android</div>
            </span>
          </div>
          <div className="list-item">
            <span className="li-icon"><Icon name="person" size={20} /></span>
            <span className="li-text">
              <div className="li-headline">Owner</div>
              <div className="li-support">{meta.name} · {meta.designation}</div>
            </span>
          </div>
          <div className="list-item">
            <span className="li-icon"><Icon name="memory" size={20} /></span>
            <span className="li-text">
              <div className="li-headline">Powered by</div>
              <div className="li-support">React + TypeScript · hand-built Material 3 · no UI framework</div>
            </span>
          </div>
          <Pressable className="list-item settings-item" onClick={onBuildTap} style={{ width: '100%' }}>
            <span className="li-icon"><Icon name="code" size={20} /></span>
            <span className="li-text">
              <div className="li-headline">Build number</div>
              <div className="li-support">portfolio-userdebug 1.0 (keep tapping…)</div>
            </span>
          </Pressable>
        </div>
      </div>
      {snack && <div className="snackbar">{snack}</div>}
    </AppScreen>
  )
}

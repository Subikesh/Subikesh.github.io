import { useEffect, useState } from 'react'
import { useSystem } from './SystemContext'
import { useClock } from './StatusBar'
import { Icon, type IconName } from '../ui/Icon'
import { Pressable } from '../ui/Pressable'
import { WALLPAPERS } from '../theme/theme'
import { meta } from '../content'

interface Tile {
  icon: IconName
  label: string
  sub?: string
  active: boolean
  onTap?: () => void
}

interface Notif {
  icon: IconName
  app: string
  title: string
  body: string
  action: () => void
}

export function Shade() {
  const { shadeOpen, setShadeOpen, modePref, setModePref, mode, wallpaperId, setWallpaperId, navigate } = useSystem()
  const { now } = useClock(true)
  // Stays mounted once first opened; visibility is pure CSS so open/close
  // can never race and leave a stuck invisible scrim.
  const [everOpened, setEverOpened] = useState(false)

  useEffect(() => {
    if (shadeOpen) setEverOpened(true)
  }, [shadeOpen])

  useEffect(() => {
    if (!shadeOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        setShadeOpen(false)
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [shadeOpen, setShadeOpen])

  if (!everOpened) return null

  const nextWallpaper = () => {
    const i = WALLPAPERS.findIndex(w => w.id === wallpaperId)
    setWallpaperId(WALLPAPERS[(i + 1) % WALLPAPERS.length].id)
  }

  const tiles: Tile[] = [
    { icon: 'wifi', label: 'Internet', sub: 'connected to you', active: true },
    {
      icon: mode === 'dark' ? 'dark_mode' : 'light_mode',
      label: 'Dark theme',
      sub: modePref === 'auto' ? 'Follow system' : mode === 'dark' ? 'On' : 'Off',
      active: mode === 'dark',
      onTap: () => setModePref(mode === 'dark' ? 'light' : 'dark'),
    },
    {
      icon: 'palette',
      label: 'Material You',
      sub: WALLPAPERS.find(w => w.id === wallpaperId)?.label,
      active: true,
      onTap: nextWallpaper,
    },
    { icon: 'bluetooth', label: 'Bluetooth', sub: 'Pixel Buds', active: false },
  ]

  const notifs: Notif[] = [
    {
      icon: 'newsbuddy', app: 'NewsBuddy', title: 'Your daily briefing is ready',
      body: 'My KMP + Compose news app, live on the Play Store. Tap to see how it’s built.',
      action: () => { setShadeOpen(false); navigate('projects/newsbuddy-ai') },
    },
    {
      icon: 'description', app: 'Resume', title: 'Recruiter mode available',
      body: 'Open the full resume — experience at Intuit and Zoho, skills, and a PDF download.',
      action: () => { setShadeOpen(false); navigate('resume') },
    },
    {
      icon: 'mail', app: 'Contact', title: `Say hi to ${meta.name.split(' ')[0]}`,
      body: 'Email, LinkedIn, GitHub, or a message straight from the Contact app.',
      action: () => { setShadeOpen(false); navigate('contact') },
    },
  ]

  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?[AP]M/i, '')
  const date = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className={`shade-root ${shadeOpen ? 'open' : ''}`} onClick={() => setShadeOpen(false)}>
      <div className="shade-panel" onClick={e => e.stopPropagation()}>
        <div className="shade-header">
          <span className="shade-clock">{time}</span>
          <span className="shade-date">{date}</span>
          <span style={{ flex: 1 }} />
          <Pressable className="icon-btn" aria-label="Settings" onClick={() => { setShadeOpen(false); navigate('settings') }}>
            <Icon name="settings" size={20} />
          </Pressable>
        </div>

        <div className="qs-grid">
          {tiles.map(t => (
            <Pressable
              key={t.label}
              className={`qs-tile ${t.active ? 'active' : ''} ${t.onTap ? '' : 'static'}`}
              onClick={t.onTap}
            >
              <Icon name={t.icon} size={22} />
              <span className="qs-text">
                <span className="qs-label">{t.label}</span>
                {t.sub && <span className="qs-sub">{t.sub}</span>}
              </span>
            </Pressable>
          ))}
        </div>

        <div className="shade-notifs">
          <div className="shade-section-label">Notifications</div>
          {notifs.map(n => (
            <Pressable key={n.app} className="notif" onClick={n.action}>
              <span className="notif-icon"><Icon name={n.icon} size={18} /></span>
              <span className="notif-text">
                <span className="notif-top">{n.app} · now</span>
                <span className="notif-title">{n.title}</span>
                <span className="notif-body">{n.body}</span>
              </span>
            </Pressable>
          ))}
        </div>

        <div className="shade-handle" onClick={() => setShadeOpen(false)}>
          <span className="nav-pill" style={{ opacity: 0.5 }} />
        </div>
      </div>
    </div>
  )
}

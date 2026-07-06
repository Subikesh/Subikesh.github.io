import type { PointerEvent } from 'react'
import { useSystem } from '../system/SystemContext'
import { useClock } from '../system/StatusBar'
import { Icon } from '../ui/Icon'
import { Pressable } from '../ui/Pressable'
import { APPS, DOCK_APPS, GRID_APPS, LINK_APPS, type AppDef } from '../apps/registry'
import { meta } from '../content'

function AppIcon({ app }: { app: AppDef }) {
  const { navigate, launchRects } = useSystem()

  const launch = (e: PointerEvent<HTMLElement> | React.MouseEvent<HTMLElement>) => {
    if (app.url) {
      window.open(app.url, '_blank', 'noopener')
      return
    }
    const bg = (e.currentTarget as HTMLElement).querySelector('.app-icon-bg')
    if (bg) launchRects.current.set(app.id, bg.getBoundingClientRect())
    navigate(app.id)
  }

  return (
    <Pressable className="app-icon" onClick={launch} aria-label={app.label}>
      <span className="app-icon-bg">
        <Icon name={app.icon} size={28} />
      </span>
      <span className="app-icon-label">{app.label}</span>
    </Pressable>
  )
}

function AtAGlance() {
  const { now } = useClock(true)
  const { navigate, launchRects } = useSystem()
  const time = now
    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(/\s?[AP]M/i, '')
  const date = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })

  const openAbout = (e: React.MouseEvent<HTMLElement>) => {
    const avatar = e.currentTarget.querySelector('.ow-avatar')
    if (avatar) launchRects.current.set('about', avatar.getBoundingClientRect())
    navigate('about')
  }

  return (
    <div className="glance">
      <div className="glance-clock">{time}</div>
      <div className="glance-date">{date}</div>
      <Pressable className="owner-widget" onClick={openAbout} aria-label="About Me">
        <span className="ow-avatar">{meta.name.trim().charAt(0)}</span>
        <span className="ow-text">
          <span className="ow-name">{meta.name}</span>
          <span className="ow-role">{meta.designation}</span>
        </span>
      </Pressable>
    </div>
  )
}

export function HomeScreen({ behind }: { behind: boolean }) {
  const { device, navigate } = useSystem()
  // Tablets show every app in the grid (dock apps included), like Android's
  // tablet launcher; phones keep the grid to what isn't already in the dock.
  const gridApps = device === 'tablet' ? [...APPS.filter(a => a.id !== 'settings'), ...LINK_APPS, ...APPS.filter(a => a.id === 'settings')] : GRID_APPS
  return (
    <div className={`home ${behind ? 'behind' : ''}`}>
      <AtAGlance />
      <div className="home-grid-area">
        <div className="app-grid">
          {gridApps.map(app => (
            <AppIcon key={app.id} app={app} />
          ))}
        </div>
        <Pressable className="search-pill" onClick={() => navigate('search')} aria-label="Search portfolio">
          <Icon name="search" size={20} />
          Search apps, projects, skills…
        </Pressable>
        <div className="dock">
          {DOCK_APPS.map(app => (
            <AppIcon key={app.id} app={app} />
          ))}
        </div>
      </div>
    </div>
  )
}

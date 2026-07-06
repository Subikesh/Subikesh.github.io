import { useRef, useState, type ReactNode, type UIEvent } from 'react'
import { useSystem } from '../system/SystemContext'
import { Icon } from './Icon'
import { Pressable } from './Pressable'

interface TopBarProps {
  title: string
  scrolled?: boolean
  actions?: ReactNode
  onBack?: () => void
}

export function TopBar({ title, scrolled, actions, onBack }: TopBarProps) {
  const { goBack } = useSystem()
  return (
    <header className={`top-bar ${scrolled ? 'scrolled' : ''}`}>
      <Pressable className="icon-btn" aria-label="Back" onClick={onBack ?? goBack}>
        <Icon name="arrow_back" size={22} />
      </Pressable>
      <span className="top-bar-title">{title}</span>
      <span className="top-bar-spacer" />
      {actions}
    </header>
  )
}

interface AppScreenProps {
  title: string
  /** Hide the large in-content headline (for screens with a custom hero). */
  noHeadline?: boolean
  actions?: ReactNode
  onBack?: () => void
  children: ReactNode
  className?: string
}

/**
 * M3 medium top app bar behavior: large headline scrolls with content;
 * the toolbar gains a container tint + title once the headline scrolls away.
 */
export function AppScreen({ title, noHeadline, actions, onBack, children, className }: AppScreenProps) {
  const [scrolled, setScrolled] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 28)
  }

  return (
    <div className={`screen ${className ?? ''}`}>
      <TopBar title={title} scrolled={scrolled} actions={actions} onBack={onBack} />
      <div className="screen-scroll" ref={scrollRef} onScroll={onScroll}>
        <div className="content-col">
          {!noHeadline && <h1 className="screen-headline">{title}</h1>}
          {children}
        </div>
      </div>
    </div>
  )
}

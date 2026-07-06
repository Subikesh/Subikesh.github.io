import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSystem } from './SystemContext'
import { getApp, type AppDef } from '../apps/registry'
import { Icon } from '../ui/Icon'

const OPEN_MS = 480
const CLOSE_MS = 340

function insetFor(rect: DOMRect): string {
  const right = window.innerWidth - rect.right
  const bottom = window.innerHeight - rect.bottom
  return `inset(${rect.top}px ${right}px ${bottom}px ${rect.left}px round ${rect.width / 2}px)`
}

function fallbackRect(): DOMRect {
  const s = 58
  return new DOMRect(window.innerWidth / 2 - s / 2, window.innerHeight * 0.7, s, s)
}

/**
 * Hosts the currently open app and plays Android 12-style launch/close
 * animations: the window is clip-path-revealed from the tapped icon's rect
 * with a splash layer (icon on its container color) that fades into content.
 */
export function AppHost() {
  const { route, launchRects } = useSystem()
  const target = getApp(route[0])
  const [rendered, setRendered] = useState<AppDef | null>(target)
  const [openGen, setOpenGen] = useState(0)
  const winRef = useRef<HTMLDivElement>(null)
  const splashRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const closing = useRef(false)

  useEffect(() => {
    if (target) {
      closing.current = false
      setRendered(target)
      setOpenGen(g => g + 1)
    } else if (rendered && !closing.current) {
      closing.current = true
      const win = winRef.current
      if (!win) {
        setRendered(null)
        return
      }
      const rect = launchRects.current.get(rendered.id) ?? fallbackRect()
      const anim = win.animate(
        [
          { clipPath: 'inset(0px 0px 0px 0px round 0px)', opacity: 1 },
          { clipPath: insetFor(rect), opacity: 1, offset: 0.85 },
          { clipPath: insetFor(rect), opacity: 0 },
        ],
        { duration: CLOSE_MS, easing: 'cubic-bezier(0.3, 0, 0.8, 0.15)', fill: 'forwards' },
      )
      splashRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: CLOSE_MS * 0.6,
        fill: 'forwards',
      })
      anim.onfinish = () => {
        if (closing.current) {
          closing.current = false
          setRendered(null)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  // Launch animation — replays whenever an app is (re)opened.
  useLayoutEffect(() => {
    if (openGen === 0 || !rendered) return
    const win = winRef.current
    const splash = splashRef.current
    const content = contentRef.current
    if (!win || !splash || !content) return

    for (const el of [win, splash, content]) {
      el.getAnimations().forEach(a => a.cancel())
    }

    const from = launchRects.current.get(rendered.id) ?? fallbackRect()
    win.animate(
      [{ clipPath: insetFor(from) }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }],
      { duration: OPEN_MS, easing: 'cubic-bezier(0.2, 0, 0, 1)', fill: 'backwards' },
    )
    splash.animate(
      [{ opacity: 1 }, { opacity: 1, offset: 0.45 }, { opacity: 0 }],
      { duration: OPEN_MS + 140, easing: 'linear', fill: 'forwards' },
    )
    splash.firstElementChild?.animate(
      [{ transform: 'scale(0.55)' }, { transform: 'scale(1)' }],
      { duration: OPEN_MS, easing: 'cubic-bezier(0.05, 0.7, 0.1, 1)' },
    )
    content.animate(
      [{ opacity: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 1 }],
      { duration: OPEN_MS, easing: 'linear', fill: 'backwards' },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openGen])

  if (!rendered) return null
  const Component = rendered.component
  return (
    <div className="app-window" ref={winRef}>
      <div className="app-content" ref={contentRef}>
        {Component ? <Component /> : null}
      </div>
      <div className="app-splash" ref={splashRef}>
        <Icon name={rendered.icon} size={88} />
      </div>
    </div>
  )
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { applyScheme, DEFAULT_WALLPAPER, WALLPAPERS, type Mode } from '../theme/theme'

export type Device = 'phone' | 'tablet'
export type ModePref = Mode | 'auto'

interface SystemState {
  /** Parsed from the URL hash: [] = home, ['projects'] = app, ['projects', 'x'] = in-app page. */
  route: string[]
  navigate: (path: string) => void
  goBack: () => void
  goHome: () => void
  device: Device
  wallpaperId: string
  setWallpaperId: (id: string) => void
  modePref: ModePref
  setModePref: (m: ModePref) => void
  mode: Mode
  shadeOpen: boolean
  setShadeOpen: (open: boolean) => void
  /** Last tapped icon rect per app id — origin for the launch animation. */
  launchRects: React.MutableRefObject<Map<string, DOMRect>>
}

const SystemContext = createContext<SystemState | null>(null)

function parseHash(): string[] {
  return decodeURIComponent(window.location.hash.replace(/^#\/?/, ''))
    .split('/')
    .filter(Boolean)
}

function readDevice(): Device {
  const w = window.innerWidth
  const h = window.innerHeight
  return w >= 840 && w > h ? 'tablet' : 'phone'
}

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

export function SystemProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<string[]>(parseHash)
  const [device, setDevice] = useState<Device>(readDevice)
  const [wallpaperId, setWallpaperId] = useState(
    () => localStorage.getItem('wallpaper') ?? DEFAULT_WALLPAPER.id,
  )
  const [modePref, setModePref] = useState<ModePref>(
    () => (localStorage.getItem('mode') as ModePref) ?? 'dark',
  )
  const [systemDark, setSystemDark] = useState(prefersDark)
  const [shadeOpen, setShadeOpen] = useState(false)
  const launchRects = useRef(new Map<string, DOMRect>())

  const mode: Mode = modePref === 'auto' ? (systemDark ? 'dark' : 'light') : modePref

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const onResize = () => setDevice(readDevice())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemDark(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const wp = WALLPAPERS.find(w => w.id === wallpaperId) ?? DEFAULT_WALLPAPER
    applyScheme(wp.seed, mode)
    localStorage.setItem('wallpaper', wallpaperId)
    localStorage.setItem('mode', modePref)
  }, [wallpaperId, mode, modePref])

  // Depth of history entries *we* pushed is stamped into history.state, so back
  // navigation works even when the visitor deep-links straight into an app.
  const navigate = useCallback((path: string) => {
    const d = (window.history.state?.d ?? 0) + 1
    window.location.hash = path
    window.history.replaceState({ d }, '')
  }, [])

  const goBack = useCallback(() => {
    const current = parseHash()
    if (current.length === 0) return
    if ((window.history.state?.d ?? 0) > 0) {
      window.history.back()
    } else {
      navigate(current.slice(0, -1).join('/'))
    }
  }, [navigate])

  const goHome = useCallback(() => {
    const depth = parseHash().length
    if (depth === 0) return
    if ((window.history.state?.d ?? 0) >= depth) {
      window.history.go(-depth)
    } else {
      navigate('')
    }
  }, [navigate])

  const value = useMemo(
    () => ({
      route, navigate, goBack, goHome, device,
      wallpaperId, setWallpaperId, modePref, setModePref, mode,
      shadeOpen, setShadeOpen, launchRects,
    }),
    [route, navigate, goBack, goHome, device, wallpaperId, modePref, mode, shadeOpen],
  )

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>
}

export function useSystem(): SystemState {
  const ctx = useContext(SystemContext)
  if (!ctx) throw new Error('useSystem outside SystemProvider')
  return ctx
}

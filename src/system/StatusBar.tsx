import { useEffect, useState } from 'react'
import { Icon } from '../ui/Icon'
import { useSystem } from './SystemContext'

function useClock(withDate = false) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const tick = () => setNow(new Date())
    const id = setInterval(tick, 10_000)
    return () => clearInterval(id)
  }, [])
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(/\s?[AP]M/i, '')
  const date = withDate
    ? now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
    : undefined
  return { time, date, now }
}

export function StatusBar() {
  const { time } = useClock()
  const { setShadeOpen, shadeOpen } = useSystem()
  return (
    <div
      className="status-bar"
      role="button"
      title="Notifications"
      onClick={() => setShadeOpen(!shadeOpen)}
    >
      <span className="sb-time">{time}</span>
      <span className="sb-icons">
        <Icon name="wifi" size={15} />
        <Icon name="signal" size={14} />
        <Icon name="battery" size={15} />
      </span>
    </div>
  )
}

export { useClock }

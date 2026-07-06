import { forwardRef, type ButtonHTMLAttributes, type PointerEvent } from 'react'

/** Spawns an M3-style ripple inside the pressed element. */
export function spawnRipple(e: PointerEvent<HTMLElement>) {
  const host = e.currentTarget
  const rect = host.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const r = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y))
  const span = document.createElement('span')
  span.className = 'ripple'
  span.style.left = `${x - r}px`
  span.style.top = `${y - r}px`
  span.style.width = span.style.height = `${r * 2}px`
  host.appendChild(span)
  const release = () => {
    span.classList.add('fading')
    setTimeout(() => span.remove(), 320)
    window.removeEventListener('pointerup', release)
    window.removeEventListener('pointercancel', release)
  }
  window.addEventListener('pointerup', release)
  window.addEventListener('pointercancel', release)
}

type PressableProps = ButtonHTMLAttributes<HTMLButtonElement>

/** A button with M3 ripple + hover state layer. */
export const Pressable = forwardRef<HTMLButtonElement, PressableProps>(function Pressable(
  { className, onPointerDown, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`ripple-host state-layer ${className ?? ''}`}
      onPointerDown={e => {
        spawnRipple(e)
        onPointerDown?.(e)
      }}
      {...rest}
    >
      {children}
    </button>
  )
})

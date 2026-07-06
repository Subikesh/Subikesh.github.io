import { useSystem } from './SystemContext'

/** Gesture navigation bar — tap (or swipe up on touch) to go home. */
export function NavBar() {
  const { goHome, route } = useSystem()
  return (
    <button
      className="nav-bar"
      aria-label="Home"
      title={route.length ? 'Go to home screen' : ''}
      onClick={goHome}
    >
      <span className="nav-pill" />
    </button>
  )
}

import { useEffect } from 'react'
import { SystemProvider, useSystem } from './system/SystemContext'
import { StatusBar } from './system/StatusBar'
import { NavBar } from './system/NavBar'
import { Wallpaper } from './system/Wallpaper'
import { AppHost } from './system/AppHost'
import { Shade } from './system/Shade'
import { HomeScreen } from './home/HomeScreen'
import { SearchOverlay } from './home/SearchOverlay'

function Device() {
  const { route, device, goBack } = useSystem()
  const searchOpen = route[0] === 'search'
  const appOpen = route.length > 0 && !searchOpen

  // Escape acts like the Android back gesture.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') goBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goBack])

  return (
    <div className="device" data-device={device}>
      <Wallpaper />
      <HomeScreen behind={appOpen} />
      <AppHost />
      {searchOpen && <SearchOverlay />}
      <StatusBar />
      <NavBar />
      <Shade />
    </div>
  )
}

export default function App() {
  return (
    <SystemProvider>
      <Device />
    </SystemProvider>
  )
}

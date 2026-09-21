import { useLayoutEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Cursor from './components/Cursor.jsx'
import Grain from './components/Grain.jsx'
import { SmoothScrollProvider, useLenis } from './hooks/useLenis.jsx'
import Home from './pages/Home.jsx'
import Archive from './pages/Archive.jsx'
import About from './pages/About.jsx'

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

/** Each route starts at the top with a clean set of ScrollTrigger measurements. */
function RouteTransition() {
  const { pathname } = useLocation()
  const lenis = useLenis()

  useLayoutEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)
    ScrollTrigger.refresh()
  }, [pathname, lenis])

  return null
}

export default function App() {
  return (
    <SmoothScrollProvider>
      <Cursor />
      <Grain />
      <RouteTransition />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SmoothScrollProvider>
  )
}

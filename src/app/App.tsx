import { useEffect, useState } from 'react'
import { Footer } from '../components/layout/Footer/Footer'
import { Header } from '../components/layout/Header/Header'
import { MobileMenu } from '../components/layout/MobileMenu/MobileMenu'
import { SearchDialog } from '../features/search/SearchDialog/SearchDialog'
import { Suspense } from 'react'
import { DocsFrame } from '../components/docs/DocsShell/DocsShell'
import { RouteErrorBoundary } from '../components/docs/RouteErrorBoundary/RouteErrorBoundary'
import { AppRoutes } from './AppRoutes'
import { parseRoute } from './router'
import type { AppRoute } from './types'

export function App() {
  const [route, setRoute] = useState<AppRoute>(() => parseRoute())
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onHash = () => setRoute(parseRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [route])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true) }
      if (event.key === 'Escape') { setSearchOpen(false); setMenuOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const routeKey = route.page === 'technology' || route.page === 'api' ? `${route.page}/${route.slug}` : route.page
  return (
    <>
      <Header onSearch={() => setSearchOpen(true)} onMenu={() => setMenuOpen(true)} />
      {route.page === 'home' ? <RouteErrorBoundary resetKey={routeKey}><AppRoutes route={route} /></RouteErrorBoundary> : (
        <DocsFrame active={route.page === 'technology' ? `technology/${route.slug}` : route.page === 'api' ? 'project-apis' : route.page}>
          <RouteErrorBoundary resetKey={routeKey}><Suspense fallback={<main className="docs-main"><div className="route-loading" role="status" aria-live="polite">正在载入正文，左侧菜单可以继续使用…</div></main>}><AppRoutes route={route} /></Suspense></RouteErrorBoundary>
        </DocsFrame>
      )}
      <Footer />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}

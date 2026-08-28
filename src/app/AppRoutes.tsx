import { lazy } from 'react'
import type { AppRoute } from './types'
import { technologies } from '../data/catalog'
import { HomePage } from '../pages/home/HomePage'
import { NewsPage } from '../pages/news/NewsPage'
import { PatternsPage } from '../pages/patterns/PatternsPage'
import { ProjectsPage } from '../pages/projects/ProjectsPage'
import { RoadmapPage } from '../pages/roadmap/RoadmapPage'
import { SourcesPage } from '../pages/sources/SourcesPage'
import { TechnologiesPage } from '../pages/technologies/TechnologiesPage'
import { TechnologyDetailPage } from '../pages/technology/TechnologyDetailPage'

const EndpointExplorerPage = lazy(() => import('../pages/endpoints/EndpointExplorerPage').then((module) => ({ default: module.EndpointExplorerPage })))
const FrameworkApiExplorerPage = lazy(() => import('../pages/framework-api-explorer/FrameworkApiExplorerPage').then((module) => ({ default: module.FrameworkApiExplorerPage })))
const ApiExplorerPage = lazy(() => import('../pages/api-explorer/ApiExplorerPage').then((module) => ({ default: module.ApiExplorerPage })))
const ApiDetailRoutePage = lazy(() => import('../pages/api-detail/ApiDetailRoutePage').then((module) => ({ default: module.ApiDetailRoutePage })))
const CoveragePage = lazy(() => import('../pages/coverage/CoveragePage').then((module) => ({ default: module.CoveragePage })))

export function AppRoutes({ route }: { route: AppRoute }) {
  if (route.page === 'home') return <HomePage />
  if (route.page === 'roadmap') return <RoadmapPage />
  if (route.page === 'news') return <NewsPage />
  if (route.page === 'technologies') return <TechnologiesPage />
  if (route.page === 'apis') return <FrameworkApiExplorerPage />
  if (route.page === 'project-apis') return <ApiExplorerPage />
  if (route.page === 'endpoints') return <EndpointExplorerPage />
  if (route.page === 'coverage') return <CoveragePage />
  if (route.page === 'projects') return <ProjectsPage />
  if (route.page === 'patterns') return <PatternsPage />
  if (route.page === 'sources') return <SourcesPage />
  if (route.page === 'api') {
    return <ApiDetailRoutePage slug={route.slug} />
  }
  const tech = technologies.find((item) => item.slug === route.slug)
  return tech ? <TechnologyDetailPage tech={tech} /> : <TechnologiesPage />
}

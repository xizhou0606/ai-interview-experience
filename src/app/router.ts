import type { AppRoute } from './types'

export function parseRoute(): AppRoute {
  const value = window.location.hash.replace(/^#\/?/, '').split('?')[0]
  if (!value) return { page: 'home' }
  if (value.startsWith('technology/')) return { page: 'technology', slug: value.split('/')[1] }
  if (value.startsWith('api/')) return { page: 'api', slug: value.split('/')[1] }
  if (value === 'roadmap' || value === 'technologies' || value === 'apis' || value === 'project-apis' || value === 'endpoints' || value === 'coverage' || value === 'projects' || value === 'patterns' || value === 'sources') {
    return { page: value }
  }
  return { page: 'home' }
}

export function navigateTo(hash: string) {
  window.location.hash = hash
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

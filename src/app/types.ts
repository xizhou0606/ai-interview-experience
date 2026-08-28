export type AppRoute =
  | { page: 'home' }
  | { page: 'roadmap' }
  | { page: 'news' }
  | { page: 'technologies' }
  | { page: 'technology'; slug: string }
  | { page: 'apis' }
  | { page: 'project-apis' }
  | { page: 'endpoints' }
  | { page: 'api'; slug: string }
  | { page: 'coverage' }
  | { page: 'projects' }
  | { page: 'patterns' }
  | { page: 'sources' }

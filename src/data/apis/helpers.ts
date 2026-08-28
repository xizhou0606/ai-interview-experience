import type { ApiEntry, ProjectSlug } from './types'

export const AI_INTERVIEW_COMMIT = 'ee897c2801eb'
export const AI_INTERVIEW_REPO = 'https://github.com/agniwen/ai-interview'

const PROJECT_REPOS: Partial<Record<ProjectSlug, string>> = {
  'ai-interview': AI_INTERVIEW_REPO,
  'ai-pm': 'https://github.com/liushurui666/ai-pm',
  'unified-auth-sdk': 'https://github.com/liushurui666/unified-auth-sdk',
  'douyin-ai-growth': 'https://github.com/liushurui666/douyin-ai-growth',
  'ai-playlet': 'https://github.com/liushurui666/ai-playlet',
  'one-2-all': 'https://gitlab.quguazhan.com/ops/one-2-all',
  'anime-armory': 'https://github.com/anton6202527/anime-armory',
  monitoring: 'https://github.com/liushurui666/monitoring-platform',
  'ai-robot': 'https://github.com/liushurui666/ai-robot',
}

export function projectRepo(project: ProjectSlug) {
  return PROJECT_REPOS[project]
}

function blobUrl(repo: string, commit: string, path: string) {
  return `${repo}${repo.includes('gitlab.') ? '/-/blob/' : '/blob/'}${commit}/${path}`
}

export function sourceUrl(entry: ApiEntry) {
  const repo = projectRepo(entry.project)
  return repo ? `${blobUrl(repo, entry.verifiedCommit, entry.sourcePath)}#L${entry.sourceLine}` : ''
}

export function testUrl(path: string, project: ProjectSlug = 'ai-interview', commit = AI_INTERVIEW_COMMIT) {
  const repo = projectRepo(project)
  return repo ? blobUrl(repo, commit, path) : ''
}

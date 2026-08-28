import type { Technology } from './catalog'

export interface TechnologyNavigationGroup {
  label: string
  technologySlugs: string[]
}

// 侧栏只按技术所在的工程层次分类；“我要做什么”的场景分组仅保留在选型页。
export const technologyNavigationGroups: TechnologyNavigationGroup[] = [
  { label: '01 · 模型与生成', technologySlugs: ['ai-sdk-6', 'openai-compatible', 'openai-javascript-sdk'] },
  { label: '02 · Agent 与编排', technologySlugs: ['langchain', 'langgraph', 'mastra', 'mcp', 'nanobot'] },
  { label: '03 · 数据与异步任务', technologySlugs: ['qdrant', 'bullmq'] },
  { label: '04 · 实时语音', technologySlugs: ['livekit-agents'] },
  { label: '05 · Web 产品底座', technologySlugs: ['solid-js', 'tanstack', 'better-auth'] },
  { label: '06 · 工程构建与交付', technologySlugs: ['vite', 'turborepo', 'docker'] },
  { label: '07 · 质量与可观测', technologySlugs: ['langfuse'] },
]

export function buildTechnologyNavigation(technologies: Technology[]) {
  const bySlug = new Map(technologies.map((technology) => [technology.slug, technology]))
  return technologyNavigationGroups.map((group) => ({
    ...group,
    technologies: group.technologySlugs.map((slug) => bySlug.get(slug)).filter((technology): technology is Technology => Boolean(technology)),
  })).filter((group) => group.technologies.length > 0)
}

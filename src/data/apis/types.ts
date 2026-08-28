export type ApiKind = 'function' | 'class' | 'method' | 'http' | 'workflow' | 'agent-task'
export type ProjectSlug = 'ai-interview' | 'ai-pm' | 'unified-auth-sdk' | 'resume' | 'douyin-ai-growth' | 'ai-playlet' | 'one-2-all' | 'anime-armory' | 'monitoring' | 'ai-robot'

export interface ApiParameter {
  name: string
  type: string
  required: boolean
  description: string
  defaultValue?: string
}

export interface ApiEffect {
  title: string
  description: string
  metrics: { label: string; value: string }[]
  output: { label: string; value: string; tone?: 'good' | 'warn' | 'neutral' }[]
}

export interface ApiEntry {
  slug: string
  name: string
  signature: string
  kind: ApiKind
  project: ProjectSlug
  module: string
  technology: string
  implementationStatus?: 'production' | 'defined-only' | 'fallback' | 'best-effort'
  statusNote?: string
  summary: string
  whenToUse: string
  sourcePath: string
  sourceLine: number
  verifiedCommit: string
  parameters: ApiParameter[]
  returns: { type: string; description: string }
  example: { language: string; code: string; explanation: string[] }
  effect: ApiEffect
  errors: { condition: string; behavior: string; recovery: string }[]
  bestPractices: string[]
  tests: { path: string; proves: string }[]
  officialSources: { label: string; url: string }[]
  related: string[]
}

export interface ApiModule {
  slug: string
  name: string
  description: string
  technology: string
  learningOrder: number
}

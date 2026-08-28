export type FrameworkApiKind = 'function' | 'class' | 'interface' | 'type' | 'object' | 'hook' | 'transport' | 'middleware' | 'command' | 'configuration'
export type FrameworkApiMaturity = 'stable' | 'experimental' | 'type-only'
export type FrameworkApiLifecycle = 'stable' | 'experimental'
export type FrameworkApiLearningLevel = 'core' | 'advanced' | 'reference'
export type FrameworkApiRuntime = 'server' | 'client' | 'both'

export interface FrameworkApiParameter {
  name: string
  type: string
  required: boolean
  defaultValue?: string
  description: string
}

export interface FrameworkApiErrorCase {
  condition: string
  handling: string
}

export interface FrameworkApiLearningMeta {
  learningLevel: FrameworkApiLearningLevel
  runtime: FrameworkApiRuntime
  parameters: FrameworkApiParameter[]
  expectedOutput: string
  errorCases: FrameworkApiErrorCase[]
  relatedApis: string[]
}

export interface FrameworkApiReference extends Partial<FrameworkApiLearningMeta> {
  slug: string
  technologySlug: string
  name: string
  group: string
  kind: FrameworkApiKind
  maturity: FrameworkApiMaturity
  lifecycle?: FrameworkApiLifecycle
  signature: string
  beginner: string
  whenToUse: string
  imports?: string
  example: string
  exampleLanguage: string
  returns: string
  interview: string
  pitfall: string
  officialUrl: string
}

export interface FrameworkApiCatalog {
  technologySlug: string
  expectedCount: number
  coverageBasis: string
  officialIndexUrl: string
  verifiedAt: string
}

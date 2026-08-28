import type { FrameworkApiReference } from '../types'
import { mcpLearningMeta } from './learning-meta'

export const MCP_SPEC = 'https://modelcontextprotocol.io/specification/2025-11-25'

type McpApiInput = Omit<FrameworkApiReference, 'slug' | 'technologySlug' | 'maturity' | 'exampleLanguage'> & {
  maturity?: FrameworkApiReference['maturity']
}

export function mcpApi(input: McpApiInput): FrameworkApiReference {
  const learningMeta = mcpLearningMeta[input.name as keyof typeof mcpLearningMeta]
  if (!learningMeta) throw new Error(`Missing structured MCP learning metadata for ${input.name}`)
  return {
    ...input,
    ...learningMeta,
    slug: `mcp-${input.name.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()}`,
    technologySlug: 'mcp',
    maturity: input.maturity ?? 'stable',
    exampleLanguage: 'json',
  }
}

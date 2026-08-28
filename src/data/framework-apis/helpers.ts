import type { FrameworkApiReference } from './types'
import { aiSdkLearningMeta } from './ai-sdk/learning-meta'

export const AI_SDK_CORE = 'https://ai-sdk.dev/docs/reference/ai-sdk-core/'
export const AI_SDK_UI = 'https://ai-sdk.dev/docs/reference/ai-sdk-ui/'

const reactExports = new Set(['useChat', 'useCompletion', 'useObject'])

function aiSdkImport(name: string, maturity: FrameworkApiReference['maturity']) {
  if (name === 'createMCPClient') return `import { createMCPClient } from '@ai-sdk/mcp'`
  if (name === 'Experimental_StdioMCPTransport') return `import { Experimental_StdioMCPTransport } from '@ai-sdk/mcp/mcp-stdio'`
  const packageName = reactExports.has(name) ? '@ai-sdk/react' : 'ai'
  const exportName = name === 'transcribe' ? 'experimental_transcribe as transcribe'
    : name === 'generateSpeech' ? 'experimental_generateSpeech as generateSpeech'
      : name === 'useObject' ? 'experimental_useObject as useObject'
        : name
  return `import ${maturity === 'type-only' ? 'type ' : ''}{ ${exportName} } from '${packageName}'`
}

export function aiSdkApi(input: Omit<FrameworkApiReference, 'slug' | 'technologySlug' | 'maturity' | 'exampleLanguage'> & { maturity?: FrameworkApiReference['maturity']; exampleLanguage?: string }): FrameworkApiReference {
  const maturity = input.maturity ?? 'stable'
  const learningMeta = aiSdkLearningMeta[input.name as keyof typeof aiSdkLearningMeta]
  if (!learningMeta) throw new Error(`Missing structured AI SDK learning metadata for ${input.name}`)
  return {
    ...input,
    ...learningMeta,
    slug: `ai-sdk-${input.name.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()}`,
    technologySlug: 'ai-sdk-6',
    maturity,
    imports: input.imports ?? aiSdkImport(input.name, maturity),
    exampleLanguage: input.exampleLanguage ?? 'ts',
  }
}

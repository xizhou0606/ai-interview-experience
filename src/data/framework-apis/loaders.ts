import type { FrameworkApiReference } from './types'

type FrameworkApiLoader = () => Promise<FrameworkApiReference[]>

const loaders: Record<string, FrameworkApiLoader> = {
  vite: async () => (await import('./vite/core')).viteFrameworkApis,
  turborepo: async () => (await import('./turborepo/core')).turborepoFrameworkApis,
  'ai-sdk-6': async () => (await import('./ai-sdk')).aiSdkFrameworkApis,
  mcp: async () => (await import('./mcp')).mcpFrameworkApis,
  langgraph: async () => (await import('./langgraph/core')).langGraphFrameworkApis,
  mastra: async () => (await import('./mastra/core')).mastraFrameworkApis,
  qdrant: async () => (await import('./qdrant/core')).qdrantFrameworkApis,
  bullmq: async () => (await import('./bullmq/core')).bullMqFrameworkApis,
  langchain: async () => (await import('./langchain/core')).langChainFrameworkApis,
  'livekit-agents': async () => (await import('./livekit-agents/core')).liveKitFrameworkApis,
  langfuse: async () => (await import('./langfuse/core')).langfuseFrameworkApis,
  'better-auth': async () => (await import('./better-auth/core')).betterAuthFrameworkApis,
  nanobot: async () => (await import('./nanobot/core')).nanobotFrameworkApis,
  'openai-compatible': async () => (await import('./openai-compatible/core')).openAiCompatibleProviderApis,
  'openai-javascript-sdk': async () => (await import('./openai-compatible-provider/core')).openAiJavascriptSdkApis,
  'solid-js': async () => (await import('./solid-js/core')).solidJsFrameworkApis,
  tanstack: async () => (await import('./tanstack/core')).tanstackFrameworkApis,
}

export async function loadFrameworkApis(technologySlug: string) {
  return loaders[technologySlug]?.() ?? []
}

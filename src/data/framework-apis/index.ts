import { aiSdkFrameworkApis } from './ai-sdk'
import { mcpFrameworkApis } from './mcp'
import { langGraphFrameworkApis } from './langgraph/core'
import { mastraFrameworkApis } from './mastra/core'
import { qdrantFrameworkApis } from './qdrant/core'
import { bullMqFrameworkApis } from './bullmq/core'
import { langChainFrameworkApis } from './langchain/core'
import { liveKitFrameworkApis } from './livekit-agents/core'
import { langfuseFrameworkApis } from './langfuse/core'
import { betterAuthFrameworkApis } from './better-auth/core'
import { nanobotFrameworkApis } from './nanobot/core'
import { openAiCompatibleProviderApis } from './openai-compatible/core'
import { openAiJavascriptSdkApis } from './openai-compatible-provider/core'
import { solidJsFrameworkApis } from './solid-js/core'
import { tanstackFrameworkApis } from './tanstack/core'
import { viteFrameworkApis } from './vite/core'
import { turborepoFrameworkApis } from './turborepo/core'

export type { FrameworkApiCatalog, FrameworkApiReference, FrameworkApiKind, FrameworkApiLifecycle, FrameworkApiMaturity } from './types'
export { frameworkApiCatalogs, frameworkApiReferenceCount, getFrameworkApiCatalog } from './catalogs'

export const frameworkApiReferences = [
  ...viteFrameworkApis,
  ...turborepoFrameworkApis,
  ...aiSdkFrameworkApis,
  ...mcpFrameworkApis,
  ...langGraphFrameworkApis,
  ...mastraFrameworkApis,
  ...qdrantFrameworkApis,
  ...bullMqFrameworkApis,
  ...langChainFrameworkApis,
  ...liveKitFrameworkApis,
  ...langfuseFrameworkApis,
  ...betterAuthFrameworkApis,
  ...nanobotFrameworkApis,
  ...openAiCompatibleProviderApis,
  ...openAiJavascriptSdkApis,
  ...solidJsFrameworkApis,
  ...tanstackFrameworkApis,
]

export function getFrameworkApis(technologySlug: string) {
  return frameworkApiReferences.filter((api) => api.technologySlug === technologySlug)
}

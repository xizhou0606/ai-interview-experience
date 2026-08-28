import { runtimeApis } from './ai-interview/runtime'
import { webClientApis } from './ai-interview/web-client'
import { aiSdkApis } from './ai-interview/ai-sdk'
import { agentApis } from './ai-interview/agents'
import { pipelineApis } from './ai-interview/pipeline'
import { mastraRuntimeApis } from './ai-interview/mastra-runtime'
import { mastraAgentApis } from './ai-interview/mastra-agents'
import { mastraWorkflowApis } from './ai-interview/mastra-workflows'
import { realtimeLifecycleApis } from './ai-interview/realtime-lifecycle'
import { operationApis } from './ai-interview/operations'
import { frontendPlatformApis } from './ai-interview/frontend-platform'
import { integrationApis } from './ai-interview/integrations'
import { publicHttpApis } from './ai-interview/http-public'
import { httpWorkspaceCoreApis } from './ai-interview/http-workspace-core'
import { httpEdgePlatformApis } from './ai-interview/http-edge-platform'
import { httpStudioFoundationApis } from './ai-interview/http-studio-foundation'
import { studioTalentHttpApis } from './ai-interview/http-studio-talent'
import { httpStudioWorkspaceApis } from './ai-interview/http-studio-workspace'
import { httpStudioMailIngestApis } from './ai-interview/http-studio-mail-ingest'
import { httpStudioResumeBatchApis } from './ai-interview/http-studio-resume-batches'
import { studioResumePoolHttpApis } from './ai-interview/http-studio-resume-pool'
import { studioResumesHttpApis } from './ai-interview/http-studio-resumes'
import { httpStudioInterviewCoreApisA } from './ai-interview/http-studio-interviews-a'
import { httpStudioInterviewCoreApisB } from './ai-interview/http-studio-interviews-b'
import { httpStudioInterviewHumanApis } from './ai-interview/http-studio-interviews-human'
import { httpStudioInterviewMeetingApis } from './ai-interview/http-studio-interviews-meetings'
import { aiRobotCoreApis } from './ai-robot/core'
import { aiPlayletCoreApis } from './ai-playlet/core'
import { aiPmCoreApis } from './ai-pm/core'
import { aiPmKnowledgeApis } from './ai-pm/knowledge'
import { aiPmOrchestrationApis } from './ai-pm/orchestration'
import { aiPmAutomationApis } from './ai-pm/automation'
import { one2AllCoreApis } from './one-2-all/core'
import { resumeCoreApis } from './resume/core'
import { monitoringCoreApis } from './monitoring/core'
import { douyinAiGrowthCoreApis } from './douyin-ai-growth/core'
import { unifiedAuthSdkCoreApis } from './unified-auth-sdk/core'
import { animeArmoryCoreApis } from './anime-armory/core'
import { semanticApis } from './ai-interview/semantic'
import { voiceApis } from './ai-interview/voice'
import { workflowApis } from './ai-interview/workflows'
import { apiModules } from './modules'
import { apiTechnologyStacks } from './stacks'

export type { ApiEntry, ApiKind, ApiModule, ApiParameter, ProjectSlug } from './types'
export type { ApiTechnologyStack } from './stacks'
export { apiModules, apiTechnologyStacks }
export { getApiTechnologyStack, getTechnologyStackBySlug } from './stacks'
export { aiInterviewInventory } from './inventory'

export const apiEntries = [...runtimeApis, ...webClientApis, ...frontendPlatformApis, ...aiSdkApis, ...agentApis, ...mastraRuntimeApis, ...mastraAgentApis, ...semanticApis, ...pipelineApis, ...workflowApis, ...mastraWorkflowApis, ...operationApis, ...integrationApis, ...voiceApis, ...realtimeLifecycleApis, ...publicHttpApis, ...httpWorkspaceCoreApis, ...httpEdgePlatformApis, ...httpStudioFoundationApis, ...studioTalentHttpApis, ...httpStudioWorkspaceApis, ...httpStudioMailIngestApis, ...httpStudioResumeBatchApis, ...studioResumePoolHttpApis, ...studioResumesHttpApis, ...httpStudioInterviewCoreApisA, ...httpStudioInterviewCoreApisB, ...httpStudioInterviewHumanApis, ...httpStudioInterviewMeetingApis, ...aiRobotCoreApis, ...aiPlayletCoreApis, ...aiPmCoreApis, ...aiPmKnowledgeApis, ...aiPmOrchestrationApis, ...aiPmAutomationApis, ...one2AllCoreApis, ...resumeCoreApis, ...monitoringCoreApis, ...douyinAiGrowthCoreApis, ...unifiedAuthSdkCoreApis, ...animeArmoryCoreApis]

export function getApiBySlug(slug: string) {
  return apiEntries.find((entry) => entry.slug === slug)
}

export function getModuleBySlug(slug: string) {
  return apiModules.find((module) => module.slug === slug)
}

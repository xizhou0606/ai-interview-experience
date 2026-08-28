import type { FrameworkApiCatalog } from './types'

export const frameworkApiCatalogs: FrameworkApiCatalog[] = [
  {
    technologySlug: 'turborepo',
    expectedCount: 33,
    coverageBasis: 'Turborepo 2.9.15 的 33 项 learner-facing 稳定合同，覆盖任务选择、任务图、缓存、环境变量、仓库配置、watch、prune 与版本匹配文档；deprecated --parallel 只在迁移教程中解释，不再作为推荐 API',
    officialIndexUrl: 'https://turborepo.dev/docs/reference',
    verifiedAt: '2026-07-18',
  },
  {
    technologySlug: 'vite',
    expectedCount: 57,
    coverageBasis: 'Vite 8.1.5 的 57 项 learner-facing 学习目录：12 项配置/JavaScript API、26 项关键配置、11 项 Plugin API 与 8 项 HMR API；这是明确锁定的教学范围，不声称覆盖全部配置字段或内部导出',
    officialIndexUrl: 'https://vite.dev/guide/api-javascript.html',
    verifiedAt: '2026-07-16',
  },
  {
    technologySlug: 'ai-sdk-6',
    expectedCount: 56,
    coverageBasis: 'AI SDK 6.0.228 官方 Core 44 项 + UI 12 项（AI SDK 6 版本线）',
    officialIndexUrl: 'https://ai-sdk.dev/docs/reference/ai-sdk-core',
    verifiedAt: '2026-07-16',
  },
  {
    technologySlug: 'mcp',
    expectedCount: 31,
    coverageBasis: 'MCP 2025-11-25（latest）Schema 的 20 个请求方法 + 11 个通知方法；Tasks 与 URL elicitation 为该版本实验性能力',
    officialIndexUrl: 'https://modelcontextprotocol.io/specification/2025-11-25/schema',
    verifiedAt: '2026-07-16',
  },
  {
    technologySlug: 'langgraph',
    expectedCount: 63,
    coverageBasis: 'LangGraph Python 1.2.9、langgraph-prebuilt 1.1.0 及 Checkpoint 4.1.1/数据库集成 Reference 的 63 项公开 Graph、Runtime、Checkpoint、Store 与 Prebuilt API',
    officialIndexUrl: 'https://reference.langchain.com/python/langgraph/',
    verifiedAt: '2026-07-16',
  },
  {
    technologySlug: 'mastra',
    expectedCount: 101,
    coverageBasis: 'Mastra 1.51.0 官方 Reference 的 101 项核心 learner-facing API，覆盖运行时、Agent、Tool、Workflow、Memory、RAG 与 Observability',
    officialIndexUrl: 'https://mastra.ai/reference',
    verifiedAt: '2026-07-16',
  },
  {
    technologySlug: 'qdrant',
    expectedCount: 60,
    coverageBasis: '@qdrant/js-client-rest 1.18.0 官方 QdrantClient 的 60 项非重复 learner-facing facade API，覆盖 Collection、Point、Query、索引、Snapshot 与集群管理',
    officialIndexUrl: 'https://api.qdrant.tech/master/api-reference',
    verifiedAt: '2026-07-16',
  },
  {
    technologySlug: 'bullmq',
    expectedCount: 108,
    coverageBasis: 'BullMQ 5.80.4 官方 TypeDoc 与 Guide 的 108 项 learner-facing API，覆盖 Queue、Worker、Job、Events、Flow、Scheduler、限流与 Metrics',
    officialIndexUrl: 'https://api.docs.bullmq.io/',
    verifiedAt: '2026-07-16',
  },
  {
    technologySlug: 'langchain',
    expectedCount: 101,
    coverageBasis: 'LangChain JS 1.5.3、@langchain/core 1.2.3 与 @langchain/textsplitters 1.0.1 的 101 项 learner-facing API，覆盖 Agent、Middleware、Runnable、消息、工具、Prompt、Parser 与 Retrieval',
    officialIndexUrl: 'https://docs.langchain.com/oss/javascript/langchain/overview',
    verifiedAt: '2026-07-16',
  },
  {
    technologySlug: 'livekit-agents',
    expectedCount: 103,
    coverageBasis: 'LiveKit Agents 官方 Python Reference 的 103 项 learner-facing API，覆盖 Agent/Session、Worker/Job、Room I/O、LLM/Tools、STT/VAD、TTS、Events/Metrics、Realtime 与 Turn handling',
    officialIndexUrl: 'https://docs.livekit.io/reference/python/livekit/agents/index.html',
    verifiedAt: '2026-07-16',
  },
  {
    technologySlug: 'langfuse',
    expectedCount: 60,
    coverageBasis: 'Langfuse JS/TS 5.9.1 的 60 项 learner-facing API，覆盖 Client 生命周期、Prompt、Dataset/Experiment、Score、Media、Tracing/Observation 与 OpenTelemetry 装配',
    officialIndexUrl: 'https://js.reference.langfuse.com/',
    verifiedAt: '2026-07-16',
  },
  {
    technologySlug: 'better-auth',
    expectedCount: 93,
    coverageBasis: 'Better Auth 1.6.23 官方文档的 93 项 learner-facing API，覆盖核心实例、服务端/客户端认证、Session、Users/Accounts、Admin、Organization 与 Passkey',
    officialIndexUrl: 'https://www.better-auth.com/docs/basic-usage',
    verifiedAt: '2026-07-16',
  },
  {
    technologySlug: 'nanobot',
    expectedCount: 86,
    coverageBasis: 'HKUDS/nanobot v0.2.2 官方 Python SDK、CLI 与公开扩展契约的 86 项 learner-facing API，覆盖 Agent loop、Session/Memory、Tools/Skills、Provider/Channel、Cron、Config 与 CLI',
    officialIndexUrl: 'https://github.com/HKUDS/nanobot/blob/v0.2.2/docs/python-sdk.md',
    verifiedAt: '2026-07-16',
  },
  {
    technologySlug: 'openai-compatible',
    expectedCount: 10,
    coverageBasis: '@ai-sdk/openai-compatible 3.0.11 面向应用开发的 10 项主要公开合同，覆盖 ProviderV4 创建、配置、Chat/Completion/Embedding/Image 模型工厂、deprecated 别名与 MetadataExtractor',
    officialIndexUrl: 'https://ai-sdk.dev/providers/openai-compatible-providers',
    verifiedAt: '2026-07-16',
  },
  {
    technologySlug: 'openai-javascript-sdk',
    expectedCount: 77,
    coverageBasis: 'OpenAI JavaScript SDK 6.47.0 的 77 项应用开发核心公开 API；明确覆盖 Client/Transport、Responses、Chat、Embeddings、Images、Audio、Files/Uploads、Models、Moderations、Batches 与 Vector Stores，排除项见章节说明',
    officialIndexUrl: 'https://developers.openai.com/api/reference/overview',
    verifiedAt: '2026-07-16',
  },
  {
    technologySlug: 'solid-js',
    expectedCount: 48,
    coverageBasis: 'solid-js 1.9.14 官方 Reference 的 48 项 learner-facing API，覆盖响应式、Owner、Context、控制流、Store、客户端渲染与 SSR',
    officialIndexUrl: 'https://docs.solidjs.com/reference',
    verifiedAt: '2026-07-16',
  },
  {
    technologySlug: 'tanstack',
    expectedCount: 59,
    coverageBasis: 'ai-interview React 项目锁定版本的 59 项 learner-facing API：Query 5.100.14、Router 1.170.15、Start 1.168.27 RC、Form 1.32.0、Table 8.21.3 与 Virtual 3.14.2',
    officialIndexUrl: 'https://tanstack.com/query/v5/docs/framework/react/overview',
    verifiedAt: '2026-07-16',
  },
]

export const frameworkApiReferenceCount = frameworkApiCatalogs.reduce((total, catalog) => total + catalog.expectedCount, 0)

export function getFrameworkApiCatalog(technologySlug: string) {
  return frameworkApiCatalogs.find((catalog) => catalog.technologySlug === technologySlug)
}

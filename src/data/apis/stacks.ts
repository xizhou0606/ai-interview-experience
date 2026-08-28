import type { ApiEntry } from './types'

export interface ApiTechnologyStack {
  slug: string
  name: string
  description: string
  learningOrder: number
  chapterSlug?: string
}

export const apiTechnologyStacks: ApiTechnologyStack[] = [
  { slug: 'ai-sdk-6', name: 'AI SDK 6', description: '模型调用、ToolLoopAgent、UI Message 与流式传输。', learningOrder: 1, chapterSlug: 'ai-sdk-6' },
  { slug: 'openai-compatible', name: 'OpenAI-compatible Provider', description: '兼容端点、模型路由、Chat Completions 与供应商适配。', learningOrder: 2, chapterSlug: 'openai-compatible' },
  { slug: 'openai-javascript-sdk', name: 'OpenAI JavaScript SDK', description: '官方 Client、Responses、Files、Batch、Vector Stores 与流式事件。', learningOrder: 3, chapterSlug: 'openai-javascript-sdk' },
  { slug: 'solid-js', name: 'SolidJS', description: 'Signal、细粒度响应式、控制流、Store、客户端渲染与 SSR。', learningOrder: 4, chapterSlug: 'solid-js' },
  { slug: 'tanstack', name: 'TanStack 应用栈', description: 'Query、Router、Start、Form、Table 与 Virtual 的独立能力。', learningOrder: 5, chapterSlug: 'tanstack' },
  { slug: 'structured-generation', name: 'Structured Generation', description: 'Zod/JSON Schema 约束输出、解析、校验与降级。', learningOrder: 3, chapterSlug: 'structured-generation' },
  { slug: 'mastra', name: 'Mastra', description: 'Agent、Tool、Memory、Workflow、Evals 与流转换。', learningOrder: 4, chapterSlug: 'mastra' },
  { slug: 'langgraph', name: 'LangGraph', description: '状态图、检查点、Interrupt、监督者与多 Agent 编排。', learningOrder: 5, chapterSlug: 'langgraph' },
  { slug: 'langchain', name: 'LangChain 1.x', description: 'Runnable、Tool、Parser、Loader 与模型集成。', learningOrder: 6, chapterSlug: 'langchain' },
  { slug: 'qdrant', name: 'Qdrant 与 RAG', description: 'Embedding、分块、混合检索、向量过滤与重排。', learningOrder: 7, chapterSlug: 'qdrant' },
  { slug: 'bullmq', name: 'BullMQ 与异步任务', description: '队列、Worker、重试、探针、幂等和状态机。', learningOrder: 8, chapterSlug: 'bullmq' },
  { slug: 'mcp', name: 'Model Context Protocol', description: 'MCP Server、资源、工具与最小权限能力面。', learningOrder: 9, chapterSlug: 'mcp' },
  { slug: 'nanobot', name: 'nanobot', description: '私有 Agent、原生工具、Skill 与人工确认。', learningOrder: 10, chapterSlug: 'nanobot' },
  { slug: 'livekit-agents', name: 'LiveKit Agents', description: '实时语音、房间、Token、Webhook、录制与打断。', learningOrder: 11, chapterSlug: 'livekit-agents' },
  { slug: 'skill-engineering', name: 'Skill Engineering', description: '可执行 Skill、状态契约、模型路由和交付治理。', learningOrder: 12, chapterSlug: 'skill-engineering' },
  { slug: 'multimodal-quality-pipeline', name: '多模态生成与质量流水线', description: '图像、视频、OCR、VLM、FFmpeg 与分层质量闸门。', learningOrder: 13, chapterSlug: 'multimodal-quality-pipeline' },
  { slug: 'langfuse', name: 'Langfuse', description: 'LLM Trace、Session、评分、回调和运行关联。', learningOrder: 14, chapterSlug: 'langfuse' },
  { slug: 'ai-observability', name: 'AI 辅助可观测性', description: '遥测、Session Replay、Source Map、证据聚合与根因诊断。', learningOrder: 15, chapterSlug: 'ai-observability' },
  { slug: 'better-auth', name: 'Better Auth 与 OAuth', description: '登录、Session、Realm、OAuth、RBAC 与安全迁移。', learningOrder: 16, chapterSlug: 'better-auth' },
  { slug: 'web-runtime', name: 'Web API 与流式运行时', description: 'Hono、FastAPI、Next.js、Fetch、SSE 与请求边界。', learningOrder: 17 },
  { slug: 'frontend-runtime', name: 'React 与 Electron 运行时', description: 'Web UI、SSR、水合、桌面 IPC 与客户端状态。', learningOrder: 18 },
  { slug: 'data-storage', name: '数据库与对象存储', description: 'Drizzle、PostgreSQL、MySQL、Redis、S3/R2 与事务。', learningOrder: 19 },
  { slug: 'integrations', name: '外部集成与消息投递', description: '飞书、邮件、Webhook、目录匹配与供应商故障恢复。', learningOrder: 20 },
  { slug: 'engineering-foundation', name: '工程契约与可靠性', description: 'Zod、配置、Hash、幂等、质量收据和可恢复状态。', learningOrder: 21 },
]

const stackBySlug = new Map(apiTechnologyStacks.map((stack) => [stack.slug, stack]))

export function getApiTechnologyStack(entry: ApiEntry): ApiTechnologyStack {
  const text = `${entry.technology} ${entry.module} ${entry.summary}`.toLowerCase()
  const is = (pattern: RegExp) => pattern.test(text)
  let slug = 'engineering-foundation'

  if (is(/better auth|oauth|auth-sdk|auth-security|authentication|session projection|rbac/)) slug = 'better-auth'
  else if (is(/livekit|voice-agent|realtime-api|\bstt\b|\btts\b|\bvad\b|speech|audio turn/)) slug = 'livekit-agents'
  else if (is(/langfuse|langsmith/)) slug = 'langfuse'
  else if (is(/rrweb|source map|source-map|telemetry|observability|monitoring|trace mapping/)) slug = 'ai-observability'
  else if (is(/fastmcp|model context protocol|\bmcp\b/)) slug = 'mcp'
  else if (is(/langgraph|openhands|supervisor|checkpoint graph|react agent/)) slug = 'langgraph'
  else if (is(/langchain|dynamicstructuredtool|runnablelambda/)) slug = 'langchain'
  else if (is(/structured generation|structured output|json schema|schema-constrained|zod object|qwen structured/)) slug = 'structured-generation'
  else if (is(/mastra/)) slug = 'mastra'
  else if (is(/bullmq|background-jobs|queue worker|job queue|task queue/)) slug = 'bullmq'
  else if (is(/qdrant|embedding|rerank|vector|semantic-search|semantic search|hybrid retrieval|rag\b|chunking/)) slug = 'qdrant'
  else if (is(/nanobot/)) slug = 'nanobot'
  else if (is(/skill engineering|creative-contracts|skills \+|codex cli|production skill/)) slug = 'skill-engineering'
  else if (is(/multimodal|media-generation|multimodal-quality|qwen-vl|\bvlm\b|ocr|ffmpeg|pillow|image\/video|image generation|video generation|dreamina|contact sheet/)) slug = 'multimodal-quality-pipeline'
  else if (is(/(^|[^w])ai sdk|@ai-sdk|toolloopagent|uimessage|ui message|defaultchattransport/)) slug = 'ai-sdk-6'
  else if (is(/openai node|openai javascript sdk|openai sdk/)) slug = 'openai-javascript-sdk'
  else if (is(/openai-compatible|openai compatible|chat completions|dashscope|qwen|model-routing/)) slug = 'openai-compatible'
  else if (is(/tanstack|react-query|react-router-ssr-query|query-core/)) slug = 'tanstack'
  else if (is(/solid-js|solidjs|solid start|solidstart/)) slug = 'solid-js'
  else if (is(/react|electron|ipcmain|contextbridge|frontend-runtime|web-client/)) slug = 'frontend-runtime'
  else if (is(/hono|fastapi|next\.js|web request|fetch api|http-public|http runtime|sse|readablestream/)) slug = 'web-runtime'
  else if (is(/s3|cloudflare r2|object-storage|drizzle|postgres|mysql|prisma|redis|database|sql\b|persistence/)) slug = 'data-storage'
  else if (is(/feishu|resend|imapflow|mailparser|email|webhook delivery|larksuite|integrations/)) slug = 'integrations'

  return stackBySlug.get(slug) ?? apiTechnologyStacks[apiTechnologyStacks.length - 1]
}

export function getTechnologyStackBySlug(slug: string) {
  return stackBySlug.get(slug)
}

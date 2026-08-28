import type { Technology } from './catalog'

export interface TechnologyMenuGroup {
  slug: string
  label: string
  question: string
  description: string
  outcome: string
  technologySlugs: string[]
  decisionRules: Array<{ need: string; choose: string; reason: string }>
}

export const technologyMenuGroups: TechnologyMenuGroup[] = [
  {
    slug: 'model-chat',
    label: '接入模型与聊天',
    question: '我要让产品能调用大模型、流式回答或稳定输出 JSON',
    description: '先解决“怎样安全地调用模型并把结果交给产品”，不要一开始就上 Agent。',
    outcome: '做出一个可切换模型、可停止、可校验输出的聊天或生成接口。',
    technologySlugs: ['ai-sdk-6', 'openai-compatible', 'openai-javascript-sdk'],
    decisionRules: [
      { need: 'TypeScript Web 聊天与流式 UI', choose: 'AI SDK 6', reason: '前后端消息协议、流式和工具调用组合最直接。' },
      { need: '直接使用 OpenAI 最新平台能力', choose: 'OpenAI JavaScript SDK', reason: '官方资源 API 最完整，不需要跨厂商抽象。' },
      { need: '同一业务切换多个兼容模型', choose: 'OpenAI-compatible', reason: '把地址、密钥和供应商差异集中到适配层。' },
    ],
  },
  {
    slug: 'agent-automation',
    label: '构建 Agent 与自动化',
    question: '我要让 AI 调工具、执行多步任务、暂停确认或失败后继续',
    description: '先判断任务是“模型自由决定”还是“代码固定流程”，再选 Agent、工作流或协议。',
    outcome: '做出有权限边界、终止条件、状态恢复和人工确认的任务执行器。',
    technologySlugs: ['langchain', 'langgraph', 'mastra', 'mcp', 'nanobot'],
    decisionRules: [
      { need: '快速组合模型、工具和解析器', choose: 'LangChain', reason: '组件生态丰富，适合做调用层和通用集成。' },
      { need: '任务需要暂停、恢复和显式状态', choose: 'LangGraph', reason: '状态图和 checkpoint 适合长流程与人工介入。' },
      { need: 'TypeScript 中同时需要 Agent 与固定 Workflow', choose: 'Mastra', reason: '一套运行时同时组织 Agent、Tool、Workflow 和观测。' },
    ],
  },
  {
    slug: 'knowledge-data',
    label: '构建知识库与后台任务',
    question: '我要让 AI 查企业资料，或把耗时处理放到后台可靠执行',
    description: '知识库不只是向量搜索：还包括切块、权限过滤、重排、索引任务和失败重做。',
    outcome: '做出可评测、可隔离租户、可重建索引的知识检索链路。',
    technologySlugs: ['qdrant', 'bullmq'],
    decisionRules: [
      { need: '按语义找相近文档并做业务过滤', choose: 'Qdrant', reason: '向量召回与 payload filter 可以放在同一查询边界。' },
      { need: '解析、切块、Embedding 等任务耗时较长', choose: 'BullMQ', reason: '把任务状态、重试和 Worker 从请求生命周期中拆开。' },
      { need: '只是几十条固定 FAQ', choose: '先不用向量库', reason: '普通数据库全文检索或规则匹配更简单、更容易验证。' },
    ],
  },
  {
    slug: 'realtime-media',
    label: '构建实时语音应用',
    question: '我要做语音对话、实时房间、自然打断和断线恢复',
    description: '实时语音技术栈重点解决媒体传输、房间、会话生命周期和延迟；图片视频生产方法不属于这一栏。',
    outcome: '做出可以加入房间、连续对话、自然打断并在异常后恢复的语音应用。',
    technologySlugs: ['livekit-agents'],
    decisionRules: [
      { need: '实时房间、语音识别、合成和打断', choose: 'LiveKit Agents', reason: '把媒体房间与 Agent 会话生命周期接在一起。' },
      { need: '只做一次音频转文字', choose: '直接调用 STT API', reason: '不需要引入完整实时房间与 Agent 运行时。' },
      { need: '批量生成图片或视频', choose: '查看工程实践', reason: '这需要组合具体模型 API、FFmpeg 和质检方法，不是一个独立技术栈。' },
    ],
  },
  {
    slug: 'product-foundation',
    label: '搭建 Web 产品底座',
    question: '我要为新产品选择前端状态、全栈路由、表单、权限和身份方案',
    description: '把客户端状态、远端数据、URL、认证和业务授权分开，避免所有状态都塞进一个框架。',
    outcome: '搭出能扩展、能 SSR、身份清楚且不会跨用户泄漏的产品基础。',
    technologySlugs: ['vite', 'solid-js', 'tanstack', 'better-auth'],
    decisionRules: [
      { need: '现代前端开发服务器、热更新和生产构建', choose: 'Vite', reason: '把开发、插件、资源处理和生产构建放进一套工作流。' },
      { need: '追求细粒度更新与简单响应式模型', choose: 'SolidJS', reason: 'Signal 直接连接依赖节点，组件通常只建立一次。' },
      { need: 'React 项目需要远端缓存、路由或复杂表格', choose: '按需选择 TanStack 子库', reason: 'Query、Router、Form、Table 各自解决一种状态。' },
      { need: '邮箱、OAuth、Session、组织与 Passkey', choose: 'Better Auth', reason: '使用成熟认证边界，业务层继续负责具体授权。' },
    ],
  },
  {
    slug: 'deployment-delivery',
    label: '部署与交付项目',
    question: '我要把静态站、SSR 服务或带 Worker 的复杂项目稳定部署到服务器',
    description: '先把应用、依赖、进程角色和启动顺序写成可重复执行的部署文件，再讨论更复杂的集群编排。',
    outcome: '独立完成镜像构建、Compose 多服务启动、健康检查、持久化和故障排查。',
    technologySlugs: ['turborepo', 'docker'],
    decisionRules: [
      { need: '一个仓库有多个应用与共享包，需要增量构建', choose: 'Turborepo', reason: '用任务图、缓存和受影响范围统一调度各包脚本，再交给 Docker 或平台部署。' },
      { need: '一台或少量服务器部署多个服务', choose: 'Docker + Compose', reason: '学习成本可控，部署文件可复现，并能清楚拆分 Web、Worker、数据库和缓存。' },
      { need: '大量节点、自愈调度和滚动发布', choose: '进一步学习 Kubernetes', reason: '这属于集群编排层，仍然可以继续运行 Dockerfile 构建出的 OCI 镜像。' },
      { need: '只托管一个纯静态站点', choose: '也可选静态托管平台', reason: '若不需要自管服务器，CDN 托管通常比维护 Nginx 容器更省事。' },
    ],
  },
  {
    slug: 'quality-production',
    label: '保证质量与稳定上线',
    question: '我要知道 AI 为什么答错、哪一步变慢，以及升级后有没有退化',
    description: '上线不是接口返回 200：还要能追踪一次调用、固定评测、控制成本并保护敏感数据。',
    outcome: '建立能复现问题、比较版本、发现退化并指导修复的质量闭环。',
    technologySlugs: ['langfuse'],
    decisionRules: [
      { need: '追踪 Prompt、模型、工具、token 和评分', choose: 'Langfuse', reason: '面向 LLM 的 trace、dataset、experiment 和 score 已形成闭环。' },
      { need: '普通前端错误、回放和源码定位', choose: '先用 Sentry / OpenTelemetry', reason: '先建立可靠遥测证据，再决定是否增加 AI 辅助诊断。' },
      { need: '刚做原型且没有回归集', choose: '先建立 20 条固定案例', reason: '没有基准数据时，再复杂的平台也无法证明质量变化。' },
    ],
  },
]

export function groupTechnologies(technologies: Technology[]) {
  const bySlug = new Map(technologies.map((technology) => [technology.slug, technology]))
  return technologyMenuGroups.map((group) => ({
    ...group,
    technologies: group.technologySlugs.map((slug) => bySlug.get(slug)).filter((technology): technology is Technology => Boolean(technology)),
  })).filter((group) => group.technologies.length > 0)
}

export function getTechnologyMenuGroup(technologySlug: string) {
  return technologyMenuGroups.find((group) => group.technologySlugs.includes(technologySlug))
}

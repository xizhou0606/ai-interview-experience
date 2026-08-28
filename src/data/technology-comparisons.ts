export type MigrationCostLevel = 'low' | 'medium' | 'high'

export interface MigrationCost {
  level: MigrationCostLevel
  reason: string
}

export interface TechnologyAlternative {
  alternative: string
  difference: string
  chooseCurrentWhen: string
  chooseAlternativeWhen: string
  migrationCost: MigrationCost
}

export interface TechnologyComparison {
  technologySlug: string
  decisionSummary: string
  alternatives: TechnologyAlternative[]
}

/**
 * 面向选型页的横向对比数据。
 *
 * current 指 technologySlug 对应的技术；alternative 是可独立采用的真实技术、产品或协议，
 * 不把“分层架构”“人工审核”等工程做法伪装成一个技术栈。
 */
export const technologyComparisons: TechnologyComparison[] = [
  {
    technologySlug: 'docker',
    decisionSummary: 'Docker 最适合需要可重复镜像、广泛生态和 Compose 多服务部署的团队。安全优先的 Linux 环境可比较 Podman；不想维护 Dockerfile 可比较 Cloud Native Buildpacks；进入多节点调度时再组合 Kubernetes，而不是把它们视为完全同层工具。',
    alternatives: [
      {
        alternative: 'Podman',
        difference: 'Podman 兼容常见容器工作流，采用无守护进程架构并强调 rootless；Docker 的 Desktop、Compose、教程和团队普及度更高。',
        chooseCurrentWhen: '团队需要最广泛的镜像、Compose、CI 和本地开发生态，希望新人更容易找到资料和排错经验。',
        chooseAlternativeWhen: 'Linux 服务器强制 rootless、无常驻 daemon，或组织已使用 Red Hat 容器工具链。',
        migrationCost: { level: 'low', reason: 'OCI 镜像和大多数 Dockerfile 可复用，但 Compose、网络、socket 集成与边缘 CLI 行为需要重新验证。' },
      },
      {
        alternative: 'Cloud Native Buildpacks',
        difference: 'Buildpacks 自动识别语言并生成 OCI 镜像，减少手写 Dockerfile；Dockerfile 对系统包、构建步骤、用户和最终文件具有更细控制。',
        chooseCurrentWhen: '部署包含自定义系统依赖、多阶段构建、Nginx 配置或多个进程角色，需要逐层理解和控制镜像。',
        chooseAlternativeWhen: '应用形态标准化，希望平台团队统一升级运行时和基础镜像，并减少业务团队维护构建脚本。',
        migrationCost: { level: 'medium', reason: '应用代码通常不改，但构建参数、缓存、系统依赖、启动命令和 CI 发布流程要迁移到 buildpack 约定。' },
      },
      {
        alternative: 'Kubernetes',
        difference: 'Docker 负责构建和单机容器工作流，Compose 适合小规模多服务；Kubernetes 负责多节点调度、自愈、滚动升级和服务发现，常继续使用同一 OCI 镜像。',
        chooseCurrentWhen: '部署在单台或少量服务器，团队当前更需要先掌握镜像、网络、卷、健康检查和服务拆分。',
        chooseAlternativeWhen: '确实存在多节点高可用、自动扩缩、滚动发布、复杂流量治理和平台团队运维能力。',
        migrationCost: { level: 'high', reason: '镜像可复用，但 Compose 服务要重写为 Deployment、Service、ConfigMap、Secret、PVC、Probe 和发布流水线。' },
      },
    ],
  },
  {
    technologySlug: 'ai-sdk-6',
    decisionSummary: 'AI SDK 6 最适合 TypeScript Web 产品：它把多模型调用、工具状态和前端流式 UI 放进同一套类型协议。若只用单一厂商的原生资源，官方 SDK 更直接；若重点是复杂 Agent 编排，则应选专门的 Agent 框架。',
    alternatives: [
      {
        alternative: 'OpenAI JavaScript SDK',
        difference: 'OpenAI 官方 SDK 完整暴露 Responses、Files、Batch、Vector Stores 等平台资源；AI SDK 6 更关注跨供应商生成接口以及服务端到 UI 的统一消息流。',
        chooseCurrentWhen: '产品要切换多个模型供应商，或 React 页面需要现成的聊天状态、停止、重试和工具调用渲染。',
        chooseAlternativeWhen: '已经确定只使用 OpenAI，并且要第一时间采用 OpenAI 独有的资源 API。',
        migrationCost: { level: 'medium', reason: '纯文本生成容易替换，但消息 part、工具事件、流协议和 React hooks 都要重写。' },
      },
      {
        alternative: 'LangChain.js',
        difference: 'LangChain.js 提供模型、Retriever、Runnable、Tool 和 Agent 等更广的组合积木；AI SDK 6 的 Web 流式传输和生成式 UI 路径更短。',
        chooseCurrentWhen: '主要交付聊天、结构化生成和工具 UI，希望依赖少、前后端类型连贯。',
        chooseAlternativeWhen: '需要大量现成数据连接器、检索器、Agent 组件，且 UI 协议可以自己处理。',
        migrationCost: { level: 'medium', reason: '模型和工具概念相近，但消息类型、流事件、Schema 接口与前端消费方式不同。' },
      },
      {
        alternative: 'Mastra',
        difference: 'Mastra 是包含 Agent、Workflow、Memory、Storage、Evals 的 TypeScript 运行时；AI SDK 6 更像面向产品调用和 UI 流的轻量应用层 SDK。',
        chooseCurrentWhen: '一次请求内的生成、工具调用和 UI 交互是主体，不需要持久工作流运行时。',
        chooseAlternativeWhen: '同一项目需要长期运行的工作流、Agent 记忆、评测和统一观测。',
        migrationCost: { level: 'medium', reason: '底层模型调用可复用，但 Agent 定义、工作流状态、存储和 UI 适配需要重新组织。' },
      },
    ],
  },
  {
    technologySlug: 'openai-compatible',
    decisionSummary: 'OpenAI-compatible 适合用一个共同协议接入多个厂商，但“请求长得一样”不代表工具、流式和 JSON 语义完全一致。能力差异很大时，优先使用官方 SDK；模型数量和治理需求很大时，再考虑独立网关。',
    alternatives: [
      {
        alternative: 'Anthropic TypeScript SDK',
        difference: '兼容接口只保留多个厂商的共同形状；Anthropic 官方 SDK 直接表达 Messages、content blocks、prompt caching 和 Anthropic 的错误类型。',
        chooseCurrentWhen: '业务必须在多个已验证兼容性的模型间切换，共同协议比单厂商特性更重要。',
        chooseAlternativeWhen: '主要使用 Claude，并依赖 Anthropic 原生内容块、缓存或最新平台能力。',
        migrationCost: { level: 'medium', reason: '基础消息容易迁移，但鉴权、角色约束、流事件、工具内容块和错误处理要按官方协议重写。' },
      },
      {
        alternative: 'LiteLLM Proxy',
        difference: 'LiteLLM 在独立服务中做模型路由、预算、限流和日志；应用内兼容 Provider 只在当前进程统一调用接口。',
        chooseCurrentWhen: '模型选择规则简单，团队希望少维护一个网关服务，并在应用代码里控制路由。',
        chooseAlternativeWhen: '多个应用共享几十个模型，需要集中配额、故障转移、成本和密钥治理。',
        migrationCost: { level: 'low', reason: 'LiteLLM 也提供 OpenAI 风格端点，通常主要替换 base URL、密钥和模型映射，但仍需重跑契约测试。' },
      },
      {
        alternative: 'OpenRouter',
        difference: 'OpenRouter 是托管式多模型入口并负责供应商路由；自建兼容层让团队直接控制每个供应商账户、数据路径和故障策略。',
        chooseCurrentWhen: '有数据驻留、直连厂商合同或定制路由要求，不希望请求经过第三方聚合服务。',
        chooseAlternativeWhen: '要快速试用大量模型，接受托管聚合层，并希望减少逐家开户和接入工作。',
        migrationCost: { level: 'low', reason: '协议相近，代码变动较小；主要成本是模型名、能力差异、隐私条款和计费重新核验。' },
      },
    ],
  },
  {
    technologySlug: 'openai-javascript-sdk',
    decisionSummary: 'OpenAI JavaScript SDK 是直接使用 OpenAI 平台完整能力的首选。若产品核心是跨厂商、React 流式 UI 或云上 Azure 治理，分别考虑 AI SDK、LangChain.js 或 Azure OpenAI SDK。',
    alternatives: [
      {
        alternative: 'AI SDK 6',
        difference: 'OpenAI SDK 贴近官方 REST 资源；AI SDK 把多厂商文本生成、工具调用和前端消息协议抽象成一致接口。',
        chooseCurrentWhen: '要管理 OpenAI Files、Batch、Vector Stores、Realtime 等原生资源，或需要与官方文档完全同步。',
        chooseAlternativeWhen: 'React 聊天体验和供应商切换比 OpenAI 独有资源更重要。',
        migrationCost: { level: 'medium', reason: '普通生成可以映射，原生资源、事件类型、分页对象和错误处理不能直接平移。' },
      },
      {
        alternative: 'LangChain.js',
        difference: 'OpenAI SDK 是低层官方客户端；LangChain.js 在其上提供统一模型、Runnable、Retriever、Tool 和 Agent 抽象。',
        chooseCurrentWhen: '希望精确控制请求并减少抽象，业务流程由自己的服务代码组织。',
        chooseAlternativeWhen: '需要快速接入多种向量库、文档加载器、Retriever 或通用 Agent 组件。',
        migrationCost: { level: 'medium', reason: '可继续在 LangChain 的 OpenAI 适配器下使用同一账户，但调用接口、消息对象和流处理要调整。' },
      },
      {
        alternative: 'Azure OpenAI endpoint（OpenAI JS 客户端）',
        difference: '当前 Azure OpenAI 可通过同一个 OpenAI 客户端连接 Azure resource endpoint，并使用 deployment name、Azure API key 或 Entra ID；OpenAI 官方平台直接使用 OpenAI endpoint 与模型名。',
        chooseCurrentWhen: '直接使用 OpenAI 账户、模型名和最新官方平台资源。',
        chooseAlternativeWhen: '企业要求 Azure 网络、身份、区域、配额和采购体系。',
        migrationCost: { level: 'low', reason: '同一 OpenAI 客户端下大部分调用可保留，主要调整 endpoint、deployment name、身份配置，并核对区域能力。' },
      },
    ],
  },
  {
    technologySlug: 'langchain',
    decisionSummary: 'LangChain 的优势是集成广、积木多，适合快速连接模型、工具和检索。以文档索引为中心可选 LlamaIndex，以生产级 Python 检索流水线为中心可选 Haystack；TypeScript 团队若同时需要工作流运行时可选 Mastra。',
    alternatives: [
      {
        alternative: 'LlamaIndex',
        difference: 'LlamaIndex 更聚焦文档摄取、索引、检索与知识 Agent；LangChain 的模型、Runnable、工具和 Agent 覆盖面更广。',
        chooseCurrentWhen: '项目同时需要多模型、工具调用、通用链路和大量第三方集成。',
        chooseAlternativeWhen: '核心工作是把复杂文档转成可查询索引，并需要丰富的检索与节点后处理能力。',
        migrationCost: { level: 'medium', reason: '模型层相似，但 Document、Node、Retriever、索引和 callback 数据模型不同。' },
      },
      {
        alternative: 'Haystack',
        difference: 'Haystack 用显式 Component 和 Pipeline 构建可检查的数据与 RAG 流程；LangChain 的表达方式更灵活，Agent 生态更大。',
        chooseCurrentWhen: '需要快速拼接多种工具或 Agent，并依赖 LangChain 生态连接器。',
        chooseAlternativeWhen: 'Python 团队重视显式 RAG pipeline、组件输入输出和生产部署。',
        migrationCost: { level: 'high', reason: '组件接口、Pipeline 图、文档模型和观测方式差异明显，通常需要重搭检索链。' },
      },
      {
        alternative: 'Mastra',
        difference: 'Mastra 原生面向 TypeScript，内置 Agent、Workflow、Memory、Storage 和 Evals；LangChain 横跨 Python/JavaScript，通用集成更成熟。',
        chooseCurrentWhen: '需要跨语言生态或大量已有 LangChain 集成，且状态运行时另有安排。',
        chooseAlternativeWhen: '团队以 TypeScript 为主，希望用一套运行时组织 Agent 和固定工作流。',
        migrationCost: { level: 'high', reason: 'Tool 可手工适配，但 Runnable 链、Agent、Memory、回调和持久化接口都需重新实现。' },
      },
    ],
  },
  {
    technologySlug: 'langgraph',
    decisionSummary: 'LangGraph 适合“模型参与决策、流程又必须可暂停恢复”的有状态 Agent。纯确定性、跨天且强一致的业务流程更适合 Temporal；TypeScript 一体化可选 Mastra；以多角色协作为主且恢复要求较低时可看 CrewAI。',
    alternatives: [
      {
        alternative: 'Temporal',
        difference: 'Temporal 是通用持久化工作流引擎，强调确定性重放、Activity 重试和长期可靠执行；LangGraph 直接围绕 LLM 状态、消息和 Agent 节点建模。',
        chooseCurrentWhen: '流程需要模型分支、工具循环、人工中断，并希望状态与 Agent 语义放在同一张图里。',
        chooseAlternativeWhen: '订单、付款、审批等确定性业务必须跨月可靠运行，并要求成熟的补偿与运维能力。',
        migrationCost: { level: 'high', reason: '状态图节点不能直接变成可重放 Workflow；副作用必须拆成 Activity，信号和持久化模型也不同。' },
      },
      {
        alternative: 'Mastra Workflows',
        difference: 'Mastra 在 TypeScript 中把 Workflow 与 Agent、Tool、Storage 放在一起；LangGraph 的图状态、interrupt 和 checkpoint 控制更细，Python 生态也更成熟。',
        chooseCurrentWhen: '需要复杂循环、子图、状态合并和成熟的 Agent checkpoint 语义。',
        chooseAlternativeWhen: '全栈 TypeScript 团队希望少拼装组件，并让 Agent 与固定 workflow 共用运行时。',
        migrationCost: { level: 'high', reason: '节点业务可以复用，图状态、路由、暂停恢复、checkpoint 和流事件需要重新建模。' },
      },
      {
        alternative: 'CrewAI',
        difference: 'CrewAI 以 Agent 角色、Task 和 Crew 协作为主要抽象；LangGraph 以显式状态与控制流为中心，不强制多角色。',
        chooseCurrentWhen: '需要精确知道每一步状态、条件分支、工具循环和失败后的恢复位置，并能按节点测试。',
        chooseAlternativeWhen: '任务天然可描述为研究员、撰稿人、审核员等角色协作，且流程可靠性要求一般。',
        migrationCost: { level: 'high', reason: '从状态机转为角色任务会改变控制权、上下文传递、错误恢复和测试方式。' },
      },
    ],
  },
  {
    technologySlug: 'mastra',
    decisionSummary: 'Mastra 适合 TypeScript 团队把 Agent、固定 Workflow、存储、记忆和评测放进同一运行时。只需要 Web 生成与 UI 时 AI SDK 更轻；需要最成熟的跨语言集成或更细的状态图时，分别看 LangChain/LangGraph。',
    alternatives: [
      {
        alternative: 'LangChain.js + LangGraph.js',
        difference: 'LangChain/LangGraph 提供更大的跨语言生态和更细的图控制；Mastra 的 TypeScript 开发体验、一体化项目结构和配套能力更集中。',
        chooseCurrentWhen: '团队希望快速统一 Agent、Workflow、Memory、Evals 与观测，不想自行拼装多套包。',
        chooseAlternativeWhen: '已有大量 LangChain 资产，或需要 LangGraph 特有的复杂图与 checkpoint 控制。',
        migrationCost: { level: 'high', reason: 'Agent、工具、工作流、存储和 trace 虽有概念映射，但具体协议无法直接互换。' },
      },
      {
        alternative: 'AI SDK 6',
        difference: 'AI SDK 聚焦模型生成、工具调用和前端流协议；Mastra 额外提供持久 Workflow、Memory、Storage 和 Eval 运行时。',
        chooseCurrentWhen: '应用确实有多步后台任务、Agent 记忆和评测治理。',
        chooseAlternativeWhen: '只做一次请求内的聊天、生成式 UI 或少量工具调用。',
        migrationCost: { level: 'medium', reason: '底层模型和 Schema 较容易改写，但 Mastra workflow、memory 与 storage 需要另找实现。' },
      },
      {
        alternative: 'Temporal',
        difference: 'Temporal 是语言无关业务场景的耐久工作流平台，不提供 LLM Agent、Prompt 或 Eval 抽象；Mastra 直接服务 AI 应用。',
        chooseCurrentWhen: 'AI 任务占主体，希望工作流步骤能直接调用 Agent 与 Tool。',
        chooseAlternativeWhen: '首要目标是跨服务、跨月、强可靠的业务编排，AI 只是某些 Activity。',
        migrationCost: { level: 'high', reason: '需把步骤改造成确定性 Workflow 和 Activity，并重新处理 Worker、信号、版本与部署。' },
      },
    ],
  },
  {
    technologySlug: 'mcp',
    decisionSummary: 'MCP 的价值是让多个 AI 客户端用同一标准发现工具、资源和提示。若接口主要服务普通软件客户端，OpenAPI 或 gRPC 更合适；若工具只存在于一个模型请求中，厂商原生 Function Calling 更简单。',
    alternatives: [
      {
        alternative: 'OpenAPI',
        difference: 'OpenAPI 描述通用 HTTP API，并拥有成熟网关和代码生成生态；MCP 额外规定 AI 客户端的能力协商、工具、资源、提示和会话交互。',
        chooseCurrentWhen: '同一工具或资源要被 Claude、IDE、桌面助手等多个 MCP 客户端直接发现和调用。',
        chooseAlternativeWhen: '接口首先服务 Web、移动端和第三方开发者，AI 只是其中一种调用方。',
        migrationCost: { level: 'medium', reason: '业务函数能复用，但工具 schema、传输、会话、错误和授权上下文要重新包装。' },
      },
      {
        alternative: '模型 Function Calling',
        difference: 'Function Calling 是一次模型请求中的工具描述与返回协议；MCP 把工具发现和调用做成客户端与独立服务间的标准。',
        chooseCurrentWhen: '工具要跨应用复用、独立部署，或还要暴露 resources、prompts 等能力。',
        chooseAlternativeWhen: '工具只属于单个应用后端，数量少，也不需要被外部 AI 客户端发现。',
        migrationCost: { level: 'low', reason: 'MCP tool 的名称、描述和 JSON Schema 大多能复用，主要改传输与调用适配层。' },
      },
      {
        alternative: 'gRPC',
        difference: 'gRPC 用 Protobuf 提供高性能、强类型的服务间 RPC；MCP 面向模型可理解的工具元数据和 AI 客户端交互。',
        chooseCurrentWhen: '调用方是 AI 客户端，需要动态发现以及人类可读的工具说明。',
        chooseAlternativeWhen: '调用方是受控微服务，吞吐、双向流和编译期契约比模型发现更重要。',
        migrationCost: { level: 'high', reason: '需要定义 Protobuf、生成客户端、重做传输与错误模型，AI 工具描述还需单独保留。' },
      },
    ],
  },
  {
    technologySlug: 'nanobot',
    decisionSummary: 'nanobot 适合代码小、可自托管、以个人消息机器人和 Skill 自动化为核心的场景。需要可视化企业平台选 Dify，需要大量 SaaS 连接选 n8n，需要精确状态恢复则选 LangGraph。',
    alternatives: [
      {
        alternative: 'Dify',
        difference: 'Dify 提供可视化应用、知识库、工作流、运营和多租户平台；nanobot 更轻，更容易直接读代码、修改 Agent loop 与渠道。',
        chooseCurrentWhen: '个人或小团队想自托管一个轻量私有机器人，并愿意用代码和 Skill 管理行为。',
        chooseAlternativeWhen: '产品、运营和开发多人协作，需要可视化编排、数据集管理和应用发布界面。',
        migrationCost: { level: 'high', reason: 'Skill、工具、渠道和本地状态要转换为平台节点、插件或 API，运行与权限模型也会改变。' },
      },
      {
        alternative: 'n8n',
        difference: 'n8n 是通用可视化自动化平台，拥有大量 SaaS 节点和确定性流程；nanobot 以对话 Agent、工具和 Skill 为中心。',
        chooseCurrentWhen: '用户主要通过消息自然语言交互，模型需要在受控工具中选择下一步。',
        chooseAlternativeWhen: '任务大多是固定的 CRM、表格、邮件和 webhook 数据搬运，需要非开发者维护。',
        migrationCost: { level: 'medium', reason: '外部 API 调用可映射为节点，但对话上下文、Skill 与确认机制要重新设计。' },
      },
      {
        alternative: 'LangGraph',
        difference: 'LangGraph 是可编程状态图运行时，擅长 checkpoint、interrupt 和复杂分支；nanobot 提供更开箱即用的个人 Agent、渠道与 Skill 结构。',
        chooseCurrentWhen: '目标是尽快部署轻量私有消息机器人，流程复杂度可控，并希望直接复用渠道和 Skill。',
        chooseAlternativeWhen: '任务需要明确的持久状态、长流程恢复、多层分支和严格节点测试。',
        migrationCost: { level: 'high', reason: '需要把隐式 Agent loop 和 Skill 规则显式建成状态、节点、边与 checkpoint。' },
      },
    ],
  },
  {
    technologySlug: 'qdrant',
    decisionSummary: 'Qdrant 适合既要向量检索、又要复杂 payload 过滤并希望自托管或云托管可选的团队。追求全托管省运维看 Pinecone；希望把检索与关系数据放在 PostgreSQL 看 pgvector；需要更完整搜索平台能力看 Weaviate。',
    alternatives: [
      {
        alternative: 'Pinecone',
        difference: 'Pinecone 是全托管向量数据库，运维负担小；Qdrant 同时提供开源自托管与云服务，对部署和数据路径控制更多。',
        chooseCurrentWhen: '需要自托管、私有网络、精细 payload filter，或希望避免完全绑定托管厂商。',
        chooseAlternativeWhen: '团队不想管理集群，愿意为全托管扩缩容和可用性付费。',
        migrationCost: { level: 'medium', reason: '向量和元数据可导出导入，但过滤语法、namespace/collection、索引参数和一致性选项要改。' },
      },
      {
        alternative: 'Weaviate',
        difference: 'Weaviate 提供对象 schema、模块化向量化和混合搜索平台；Qdrant 的 point、vector、payload 模型更直接轻量。',
        chooseCurrentWhen: '已有自己的 embedding 流程，希望清楚控制向量、过滤和检索参数。',
        chooseAlternativeWhen: '希望数据库集成向量化、生成模块和更完整的对象搜索体验。',
        migrationCost: { level: 'high', reason: '数据 schema、向量化职责、查询语言、混合搜索和模块配置均不同。' },
      },
      {
        alternative: 'PostgreSQL + pgvector',
        difference: 'pgvector 把向量列、SQL、事务和关系数据放在同一数据库；Qdrant 是为向量检索和过滤优化的专用服务。',
        chooseCurrentWhen: '向量规模和查询压力较大，需要专用索引、分片、量化与多向量能力。',
        chooseAlternativeWhen: '数据已在 PostgreSQL，规模可控，事务 JOIN 和减少基础设施数量更重要。',
        migrationCost: { level: 'medium', reason: '数据模型能映射，但要重写 SQL/过滤、索引、分页和批量写入，并重新做召回性能测试。' },
      },
    ],
  },
  {
    technologySlug: 'bullmq',
    decisionSummary: 'BullMQ 是 Node.js 团队使用 Redis 构建后台任务、重试和调度的直接选择。Python 生态可选 Celery，跨语言简单消息缓冲可选 SQS，跨天且需要强恢复语义的业务流程应选 Temporal。',
    alternatives: [
      {
        alternative: 'Celery',
        difference: 'Celery 是成熟的 Python 分布式任务队列，支持多种 broker；BullMQ 原生 TypeScript/Node.js，并以 Redis 为核心。',
        chooseCurrentWhen: 'Worker 和业务都使用 Node.js，希望共享 TypeScript 类型并快速接入 Redis。',
        chooseAlternativeWhen: '计算任务主要是 Python、数据科学或机器学习代码，团队已有 Celery 运维经验。',
        migrationCost: { level: 'high', reason: '需要跨语言重写 Worker，并重做任务序列化、重试、调度、监控和部署。' },
      },
      {
        alternative: 'Amazon SQS',
        difference: 'SQS 是托管消息队列，负责可靠投递和扩缩容；BullMQ 还内置 job 状态、延迟任务、重复任务、进度和队列事件。',
        chooseCurrentWhen: '需要丰富任务状态、定时调度和本地可控 Redis，且应用主要在 Node.js。',
        chooseAlternativeWhen: '运行在 AWS，希望少管 Redis，并能自行实现 Worker 状态、调度和监控。',
        migrationCost: { level: 'medium', reason: '任务 payload 可保留，但 jobId、延迟、repeat、进度、事件和失败查询需用 AWS 组件重建。' },
      },
      {
        alternative: 'Temporal',
        difference: 'Temporal 记录工作流历史，可恢复跨步骤状态并协调补偿；BullMQ 主要保证单个或一组队列 job 至少执行一次。',
        chooseCurrentWhen: '任务相对独立，失败后重试即可，队列吞吐和简单调度是重点。',
        chooseAlternativeWhen: '流程跨多个服务和人工等待，必须知道执行到哪一步并可靠恢复。',
        migrationCost: { level: 'high', reason: '要把 job 拆成 Workflow/Activity，处理确定性约束、信号、版本和 Worker 发布。' },
      },
    ],
  },
  {
    technologySlug: 'livekit-agents',
    decisionSummary: 'LiveKit Agents 适合需要 WebRTC 房间、多参与者、STT-LLM-TTS 会话和自然打断的实时语音产品。只做模型原生低延迟语音可看 OpenAI Realtime；需要可替换媒体与模型流水线看 Pipecat；电话网络入口更适合 Twilio。',
    alternatives: [
      {
        alternative: 'OpenAI Realtime API',
        difference: 'OpenAI Realtime 提供模型原生的实时音频会话；LiveKit Agents 在媒体房间之上编排多种 STT、LLM、TTS 和 Agent，供应商选择更开放。',
        chooseCurrentWhen: '需要房间、多参与者、电话/浏览器接入，或自由组合语音识别、模型和合成厂商。',
        chooseAlternativeWhen: '接受 OpenAI 单一实时模型，希望最短路径获得低延迟语音到语音体验。',
        migrationCost: { level: 'high', reason: '音频事件、会话状态、工具事件、打断和媒体连接方式都会改变。' },
      },
      {
        alternative: 'Pipecat',
        difference: 'Pipecat 用可组合 processor pipeline 连接传输、STT、LLM 与 TTS；LiveKit Agents 更深地整合 LiveKit 房间、参与者和 AgentSession 生命周期。',
        chooseCurrentWhen: '产品已经使用 LiveKit，房间、轨道、参与者和部署代理是一等需求。',
        chooseAlternativeWhen: '希望用 Python 明确组合每个媒体处理器，并在不同传输服务间切换。',
        migrationCost: { level: 'high', reason: 'Agent 生命周期和媒体管线抽象不同，需要重写事件、上下文、打断及部署适配。' },
      },
      {
        alternative: 'Twilio Media Streams',
        difference: 'Twilio 强项是 PSTN 电话号码、呼叫控制和媒体流入口；LiveKit 强项是 WebRTC 房间和实时媒体应用平台。',
        chooseCurrentWhen: '主要入口是 Web/移动端实时房间，并可能有多参与者或共享媒体。',
        chooseAlternativeWhen: '核心业务是呼入呼出电话、号码、IVR 和传统电话网络集成。',
        migrationCost: { level: 'high', reason: '信令、身份、媒体编码、呼叫状态和基础设施都不同，Agent 层也需适配。' },
      },
    ],
  },
  {
    technologySlug: 'solid-js',
    decisionSummary: 'SolidJS 适合愿意采用 Signal 心智模型、追求细粒度更新的新项目。React 的生态和招聘面最广，Vue 的模板与渐进接入友好，Svelte 的编译式写法简洁；选择时应以团队和现有组件资产为主，不只看跑分。',
    alternatives: [
      {
        alternative: 'React',
        difference: 'React 默认按组件重新执行并用 Hook 保持状态；Solid 组件通常只建立一次，Signal 直接通知读取它的表达式。',
        chooseCurrentWhen: '新项目重视细粒度更新，团队接受 getter、owner 和不同于 React 的响应式模型。',
        chooseAlternativeWhen: '依赖大量 React 组件、React Native、成熟招聘市场或既有团队经验。',
        migrationCost: { level: 'high', reason: '虽然都用 JSX，但状态、生命周期、Context、列表和第三方组件协议不能机械替换。' },
      },
      {
        alternative: 'Vue',
        difference: 'Vue 使用模板或 JSX、ref/reactive 与单文件组件，生态更大；Solid 使用 JSX getter 和更直接的细粒度 DOM 更新。',
        chooseCurrentWhen: '偏好接近 JavaScript 的 JSX 表达和最小运行时更新。',
        chooseAlternativeWhen: '团队喜欢模板语法、官方 Router/状态方案和更成熟的中文生态。',
        migrationCost: { level: 'high', reason: '组件文件、模板、响应式 API、路由和状态库都需重写，通常只能复用业务函数与样式。' },
      },
      {
        alternative: 'Svelte',
        difference: 'Svelte 通过编译器把组件语法和响应式 rune 转成更新代码；Solid 保留 JSX/函数组件并在运行时维护细粒度依赖图。',
        chooseCurrentWhen: '希望沿用 JSX 和函数式组合，同时获得 Signal 细粒度更新。',
        chooseAlternativeWhen: '喜欢单文件组件、编译器语法和 SvelteKit 的一体化全栈体验。',
        migrationCost: { level: 'high', reason: '组件语法、响应式规则、slot/snippet、生命周期和全栈路由约定差异很大。' },
      },
    ],
  },
  {
    technologySlug: 'tanstack',
    decisionSummary: 'TanStack 不是一个单体框架，应先明确是在选 Query、Router/Start、Form、Table 还是 Virtual。React 项目可按问题逐个引入；若想要强约定全栈框架选 Next.js，若只缺某一能力则与 SWR、React Router、React Hook Form 等同类库单独比较。',
    alternatives: [
      {
        alternative: 'Next.js App Router',
        difference: 'Next.js 是包含构建、路由、服务端组件、服务端函数和部署约定的完整 React 框架；TanStack 各包可独立采用，Start 才是其中的全栈组合。',
        chooseCurrentWhen: '希望类型安全 URL、显式客户端缓存，并按需组合 Query、Router、Form、Table 或 Virtual。',
        chooseAlternativeWhen: '团队接受 Next.js 约定，并需要成熟的 React Server Components、托管部署和大生态。',
        migrationCost: { level: 'high', reason: '若涉及 Start/Router，文件路由、数据加载、SSR、缓存和服务端边界都要重构；只替换单个子库则成本较低。' },
      },
      {
        alternative: 'SWR + React Router',
        difference: 'SWR 提供更轻的远端缓存，React Router 提供成熟路由与数据 API；TanStack Query 的缓存控制和 TanStack Router 的端到端类型推导更细。',
        chooseCurrentWhen: '复杂产品需要精细 invalidation、mutation、prefetch，以及强类型 params/search/loader。',
        chooseAlternativeWhen: '应用数据缓存简单，团队更熟悉 React Router，或希望减少概念和配置。',
        migrationCost: { level: 'medium', reason: '组件 UI 可保留，但 query key、mutation、loader、search 校验和导航 API 要逐层替换。' },
      },
      {
        alternative: 'React Hook Form + AG Grid',
        difference: 'React Hook Form 专注非受控表单，AG Grid 提供带 UI 的企业表格；TanStack Form/Table 是无头状态与计算层，更方便接自有设计系统。',
        chooseCurrentWhen: '需要完全控制 DOM、样式、校验和表格交互，并愿意自己组合可访问性与视觉组件。',
        chooseAlternativeWhen: '只缺成熟表单库，或希望直接获得分组、透视、导出等完整企业表格界面。',
        migrationCost: { level: 'medium', reason: '字段和列定义可人工映射，但验证状态、事件、行模型、选择与虚拟化行为均不兼容。' },
      },
    ],
  },
  {
    technologySlug: 'better-auth',
    decisionSummary: 'Better Auth 适合 TypeScript 团队自持用户数据、Session 和插件能力。已有 Next.js 轻量需求可选 Auth.js；希望把安全运维交给 SaaS 可选 Clerk；大型企业身份、规则和合规整合可选 Auth0。',
    alternatives: [
      {
        alternative: 'Auth.js',
        difference: 'Auth.js 以 Web 框架认证、Provider 和 Session 为核心，尤其常见于 Next.js；Better Auth 提供更广的数据库模型、客户端 API 和组织、Passkey 等插件。',
        chooseCurrentWhen: '需要自托管、类型安全客户端和较完整的账户/组织插件，同时希望掌控数据库。',
        chooseAlternativeWhen: 'Next.js 项目只需要成熟 OAuth 登录与 Session，已有 Auth.js 经验和适配器。',
        migrationCost: { level: 'high', reason: '用户、账户、Session 表结构、Cookie、回调和客户端 hooks 都需迁移，且必须处理存量登录态。' },
      },
      {
        alternative: 'Clerk',
        difference: 'Clerk 是托管身份平台，提供预制 UI、用户管理和组织能力；Better Auth 主要在自己的应用和数据库中运行，控制更强。',
        chooseCurrentWhen: '对数据所有权、私有部署、定制数据库和避免按用户计费更敏感。',
        chooseAlternativeWhen: '希望最快获得登录 UI、风控和用户后台，愿意接受 SaaS 费用与厂商依赖。',
        migrationCost: { level: 'high', reason: '身份主库、用户 ID、Session、UI、Webhook 和组织权限都可能变化，迁移需双写或账户映射。' },
      },
      {
        alternative: 'Auth0',
        difference: 'Auth0 是成熟企业 IAM SaaS，覆盖企业连接、规则、风控与合规；Better Auth 更轻、更贴近 TypeScript 应用代码。',
        chooseCurrentWhen: '中小团队希望在代码内灵活扩展认证，并自己负责部署和安全运营。',
        chooseAlternativeWhen: '需要 SAML/企业目录、大规模 B2B 联邦身份、合规认证和专业支持。',
        migrationCost: { level: 'high', reason: '要迁移 identity provider、subject ID、token/session 模型、回调和业务用户关联。' },
      },
    ],
  },
  {
    technologySlug: 'langfuse',
    decisionSummary: 'Langfuse 适合需要开源自托管、LLM trace、Prompt、Dataset、Experiment 和 Score 闭环的团队。深度使用 LangChain 可选 LangSmith，偏开源评测分析可选 Phoenix，已有 W&B 机器学习平台可选 Weave。',
    alternatives: [
      {
        alternative: 'LangSmith',
        difference: 'LangSmith 与 LangChain/LangGraph 集成最深，提供 trace、dataset 和评测平台；Langfuse 更强调开源、自托管和框架无关接入。',
        chooseCurrentWhen: '需要自托管、控制遥测数据，或同时观测多种 LLM 框架。',
        chooseAlternativeWhen: '团队已重度使用 LangChain/LangGraph，希望获得原生调试和托管体验。',
        migrationCost: { level: 'medium', reason: 'OpenTelemetry 或包装层可降低成本，但 trace 层级、dataset、evaluator、prompt 和历史数据需要映射。' },
      },
      {
        alternative: 'Arize Phoenix',
        difference: 'Phoenix 是开源 AI observability/evaluation 工具，强项包括 OpenTelemetry trace、embedding 与实验分析；Langfuse 的 Prompt 管理和产品化工作流更完整。',
        chooseCurrentWhen: '需要一体化管理 trace、prompt、dataset、experiment 和线上 score。',
        chooseAlternativeWhen: '偏好 OpenInference/OpenTelemetry 标准，重点是开源评测、检索和模型行为分析。',
        migrationCost: { level: 'medium', reason: '标准 trace 可转接，但 Prompt、Dataset、Score 定义和历史报表不能无损迁移。' },
      },
      {
        alternative: 'Weights & Biases Weave',
        difference: 'Weave 与 W&B 的模型实验和数据资产结合紧密；Langfuse 更专注 LLM 应用调用、Prompt 与用户反馈。',
        chooseCurrentWhen: '应用工程团队主要排查线上会话、工具调用和 Prompt 版本。',
        chooseAlternativeWhen: '组织已使用 W&B 管理训练和实验，希望生成式 AI 评测也进入同一平台。',
        migrationCost: { level: 'medium', reason: '调用埋点概念类似，但对象模型、评测执行、数据集和仪表盘都要重新配置。' },
      },
    ],
  },
  {
    technologySlug: 'turborepo',
    decisionSummary: 'Turborepo 适合已有 pnpm/npm/yarn workspace、希望用较少配置获得任务图和分布式缓存的 JavaScript/TypeScript 团队。需要完整项目图治理与生成器可选 Nx；只想批量跑脚本可继续用 pnpm filter；跨语言、超大规模和严格沙箱构建再评估 Bazel。',
    alternatives: [
      {
        alternative: 'Nx',
        difference: 'Nx 同样提供项目图、受影响任务和缓存，还带插件、生成器、迁移器与更强的仓库治理；Turborepo 更薄，主要复用已有 package.json scripts 和 workspace 结构。',
        chooseCurrentWhen: '团队已有清楚的 workspace 与脚本，只需要易懂的任务图、缓存、filter 和增量 CI，不希望框架接管项目结构。',
        chooseAlternativeWhen: '需要代码生成、依赖边界、框架插件、自动迁移、分布式执行平台或大量一致性治理。',
        migrationCost: { level: 'medium', reason: '脚本可复用，但任务配置、缓存输入、项目推断、CI 命令和云缓存需要重新建模与验证。' },
      },
      {
        alternative: 'pnpm workspace scripts',
        difference: 'pnpm --filter/--recursive 能按包筛选并并发执行脚本，也负责安装与发布；Turborepo 在其上增加跨任务依赖图、内容哈希缓存、运行摘要和远程缓存。',
        chooseCurrentWhen: 'build/test/typecheck 成本高，多个任务存在跨包先后关系，并希望本机和 CI 复用结果。',
        chooseAlternativeWhen: '仓库较小、任务很快，只需一次性批量执行，不愿维护额外任务配置和缓存规则。',
        migrationCost: { level: 'low', reason: '移除 Turbo 后仍可保留 package scripts，但需把 dependsOn 改成 shell/pnpm 顺序，并失去 Turbo 缓存与运行元数据。' },
      },
      {
        alternative: 'Bazel',
        difference: 'Bazel 以显式构建图、沙箱和跨语言可复现构建面向超大规模仓库；Turborepo 更贴近 Node workspace，接入快但隔离和跨语言能力有限。',
        chooseCurrentWhen: '主要是 JavaScript/TypeScript，团队希望渐进接入，并继续使用 Vite、Next.js、tsc 等现有命令。',
        chooseAlternativeWhen: '仓库跨多种语言、构建规模巨大，需要严格声明每个输入输出、远程执行和强可复现性。',
        migrationCost: { level: 'high', reason: '要把隐式 Node 构建改写为 Bazel rule/target，处理工具链、依赖、沙箱、产物和 CI 基础设施。' },
      },
    ],
  },
  {
    technologySlug: 'vite',
    decisionSummary: 'Vite 适合现代 Web 应用的快速开发服务器和生产构建，尤其适合 React、Vue、Solid、Svelte 等客户端项目。大型存量 webpack 项目不必为速度盲目迁移；超大仓库可评估 Rspack；深度绑定 Next.js 时由 Turbopack 随框架选择。',
    alternatives: [
      {
        alternative: 'webpack',
        difference: 'webpack 生态和可定制 loader/plugin 极其成熟，兼容大量存量配置；Vite 开发期以原生 ESM 为核心，默认启动和热更新更轻快。',
        chooseCurrentWhen: '新建现代前端项目，希望配置简单、开发反馈快，并且依赖能够正常使用 ESM。',
        chooseAlternativeWhen: '大型存量工程依赖特殊 loader、Module Federation 方案或多年沉淀的 webpack 插件。',
        migrationCost: { level: 'high', reason: '复杂项目要重写 loader/plugin、环境变量、静态资源、代理和测试集成；简单 SPA 则可能只是中等成本。' },
      },
      {
        alternative: 'Rspack',
        difference: 'Rspack 用 Rust 实现并追求 webpack API 兼容，适合加速大型 webpack 工程；Vite 的插件模型、开发服务器和 Rollup 生态更偏现代 ESM。',
        chooseCurrentWhen: '新项目或中型应用看重 Vite 生态、框架模板和直观配置。',
        chooseAlternativeWhen: '项目体量很大、webpack 配置资产多，希望以较小改造获得更快构建。',
        migrationCost: { level: 'medium', reason: '从 Vite 迁移要改插件和构建配置；从 webpack 转 Rspack 通常更低，但仍需检查插件兼容。' },
      },
      {
        alternative: 'Turbopack',
        difference: 'Turbopack 是面向大型 JavaScript/TypeScript 应用的增量打包器，目前主要随 Next.js 使用；Vite 是框架无关、插件生态成熟的独立工具链。',
        chooseCurrentWhen: '不是 Next.js 项目，或需要可独立配置的构建工具、库模式和广泛插件。',
        chooseAlternativeWhen: '项目已经选择 Next.js，并希望沿用其默认开发与构建方向。',
        migrationCost: { level: 'high', reason: '通常不是单换 bundler，而是同时进入 Next.js 构建约定；插件、SSR、资源和环境变量行为都需核验。' },
      },
    ],
  },
]

const comparisonsBySlug = new Map(
  technologyComparisons.map((comparison) => [comparison.technologySlug, comparison]),
)

export function getTechnologyComparison(slug: string) {
  return comparisonsBySlug.get(slug)
}

import type { FrameworkApiReference } from '../types'
import { langfuseLearningMeta } from './learning-meta'

type LangfuseApiInput = Omit<
  FrameworkApiReference,
  'technologySlug' | 'maturity' | 'exampleLanguage' | 'officialUrl'
> & {
  officialUrl: string
  maturity?: FrameworkApiReference['maturity']
}

const langfuseApi = ({ maturity = 'stable', ...input }: LangfuseApiInput): FrameworkApiReference => {
  const learningMeta = langfuseLearningMeta[input.name as keyof typeof langfuseLearningMeta]
  if (!learningMeta) throw new Error(`Missing structured Langfuse learning metadata for ${input.name}`)
  return {
    ...input,
    ...learningMeta,
    technologySlug: 'langfuse',
    maturity,
    exampleLanguage: 'ts',
  }
}

const clientApis: FrameworkApiReference[] = [
  langfuseApi({
    slug: 'langfuse-client-constructor',
    name: 'LangfuseClient',
    group: 'Client 与生命周期',
    kind: 'class',
    signature: 'new LangfuseClient(params?: LangfuseClientParams): LangfuseClient',
    beginner: 'LangfuseClient 是应用访问 Prompt、Dataset、Experiment、Score 和底层公共 API 的总入口。它可以显式接收密钥与地址，也会读取 LANGFUSE_PUBLIC_KEY、LANGFUSE_SECRET_KEY、LANGFUSE_BASE_URL 等环境变量。',
    whenToUse: '服务启动时创建一次并复用；它适合配置应用级 Langfuse 能力，不应在每个请求内重复实例化。',
    example: `import { LangfuseClient } from '@langfuse/client'

export const langfuse = new LangfuseClient({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL,
})`,
    returns: '一个包含 prompt、dataset、experiment、score、media 管理器和 api facade 的 LangfuseClient 实例。',
    interview: '面试时要说明 v5 把“业务 API client”和“基于 OpenTelemetry 的 tracing”拆成不同包：Client 管 Prompt、Dataset、Score 等控制面，trace span 由 @langfuse/tracing 与 @langfuse/otel 负责。',
    pitfall: '不要把 secretKey 发到浏览器，也不要每次请求 new Client；无凭据时 SDK 可能只警告而不是立即失败，生产启动检查必须主动验证配置。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.LangfuseClient.html',
  }),
  langfuseApi({
    slug: 'langfuse-client-flush',
    name: 'LangfuseClient.flush',
    group: 'Client 与生命周期',
    kind: 'function',
    signature: 'client.flush(): Promise<void>',
    beginner: '立刻发送 Client 内 ScoreManager 队列里尚未上报的评分事件，不再等待批量阈值或定时器。它主要解决短任务结束太快、评分还留在内存队列的问题。',
    whenToUse: '无服务器函数即将返回、测试结束，或需要保证刚创建的 score 已可查询时。',
    example: `langfuse.score.create({ name: 'helpful', value: 1, traceId })
await langfuse.flush()`,
    returns: '队列中的评分全部尝试发送后完成的 Promise，不返回评分对象。',
    interview: 'Flush 是批量吞吐与数据及时性的显式同步点。v5 Client.flush 处理的是 client score 队列；OpenTelemetry span 则由 LangfuseSpanProcessor.forceFlush 管理，两个通道不能混为一谈。',
    pitfall: '不要在每个 score 后 flush，否则会破坏批处理吞吐；也不要误以为它会冲刷所有 OTel spans，trace 导出要操作对应的 tracer provider 或 span processor。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.LangfuseClient.html',
  }),
  langfuseApi({
    slug: 'langfuse-client-shutdown',
    name: 'LangfuseClient.shutdown',
    group: 'Client 与生命周期',
    kind: 'function',
    signature: 'client.shutdown(): Promise<void>',
    beginner: '优雅关闭 Client：先把尚未发送的评分刷出，再停止 ScoreManager 的定时器和队列处理。适合进程退出，而不是普通请求结束。',
    whenToUse: 'Node 进程接到 SIGTERM、脚本运行结束或测试套件 teardown 时调用一次。',
    example: `process.once('SIGTERM', async () => {
  await langfuse.shutdown()
  process.exit(0)
})`,
    returns: '评分队列清空且 Client 关闭完成后的 Promise。',
    interview: '优雅关闭是 at-least-once 异步遥测链路的最后保障：正常路径依靠批处理，进程终止路径依靠 shutdown。它不能替代进程级超时和信号处理。',
    pitfall: '不要在热请求路径调用 shutdown，关闭后的实例不应继续复用；进程退出超时要留出上报窗口，并同时关闭 OTel provider。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.LangfuseClient.html',
  }),
  langfuseApi({
    slug: 'langfuse-client-get-trace-url',
    name: 'LangfuseClient.getTraceUrl',
    group: 'Client 与生命周期',
    kind: 'function',
    signature: 'client.getTraceUrl(traceId: string): Promise<string>',
    beginner: '根据 traceId 生成该项目在 Langfuse 网页中的可查看地址，方便把诊断链接放进日志、告警或内部调试页面。',
    whenToUse: '已知 traceId，需要让研发或运营直接跳转到对应调用链时。',
    example: `const traceUrl = await langfuse.getTraceUrl(traceId)
logger.info({ traceId, traceUrl }, 'LLM request failed')`,
    returns: '指向 Langfuse UI 中指定 trace 的 HTTPS URL 字符串。',
    interview: 'traceId 是跨日志、业务请求和可观测平台的关联键；生成 URL 只是可导航性增强，不改变 trace 数据的权限模型。',
    pitfall: '不要把内部 trace URL 暴露给未授权终端用户；即使知道 URL，仍应依赖 Langfuse 的项目权限控制访问。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.LangfuseClient.html',
  }),
]

const promptApis: FrameworkApiReference[] = [
  langfuseApi({
    slug: 'langfuse-prompt-create',
    name: 'PromptManager.create',
    group: 'Prompt Management',
    kind: 'function',
    signature: 'client.prompt.create(body: CreateTextPromptRequest | CreateChatPromptRequest): Promise<TextPromptClient | ChatPromptClient>',
    beginner: '创建一个文本或聊天 Prompt 版本；如果同名 Prompt 已存在，Langfuse 会新增版本，而不是覆盖历史版本。labels 可把新版本直接标记为 production、staging 等部署通道。',
    whenToUse: '从代码迁移硬编码 Prompt、CI 发布新版本，或自动化同步 Prompt 配置时。',
    example: `const prompt = await langfuse.prompt.create({
  name: 'interview-feedback',
  type: 'text',
  prompt: '请以 {{level}} 难度点评：{{answer}}',
  labels: ['staging'],
})`,
    returns: '新版本对应的 TextPromptClient 或 ChatPromptClient，可立即 compile 并读取版本元数据。',
    interview: 'Prompt 管理的核心是“不可变版本 + 可移动标签”：版本保证可追溯，production 标签决定运行时取哪一版，从而把内容发布与代码部署解耦。',
    pitfall: '同名创建会增加版本，不能把它当幂等更新；发布脚本应记录版本并控制 labels，避免并发发布让 production 指向意外版本。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.PromptManager.html',
  }),
  langfuseApi({
    slug: 'langfuse-prompt-get',
    name: 'PromptManager.get',
    group: 'Prompt Management',
    kind: 'function',
    signature: 'client.prompt.get(name, { type?, version?, label?, cacheTtlSeconds?, fallback?, fetchTimeoutMs?, maxRetries? }): Promise<PromptClient>',
    beginner: '按名称获取文本或聊天 Prompt。默认使用生产标签，并在 SDK 本地缓存；也可以锁定具体 version、选择 label、设置缓存时长与失败 fallback。',
    whenToUse: '线上请求需要取得当前部署 Prompt，或者离线复现实验时锁定某个历史版本。',
    example: `const prompt = await langfuse.prompt.get('interview-feedback', {
  label: 'production',
  cacheTtlSeconds: 300,
  fallback: '请点评：{{answer}}',
})`,
    returns: 'TextPromptClient；传 type: "chat" 时返回 ChatPromptClient，并包含 name、version、labels、config 与 fallback 状态。',
    interview: 'SDK 缓存让 Prompt 管理不进入每次模型调用的关键延迟路径；fallback 提高可用性，但必须观测是否降级，否则旧内容可能长期掩盖服务故障。',
    pitfall: '要明确选择 label 或 version，不能依赖“最新”含义；fallback 变量结构必须与远端 Prompt 兼容，并监控 isFallback。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.PromptManager.html',
  }),
  langfuseApi({
    slug: 'langfuse-prompt-update',
    name: 'PromptManager.update',
    group: 'Prompt Management',
    kind: 'function',
    signature: 'client.prompt.update({ name, version, newLabels }): Promise<Prompt>',
    beginner: '更新某个既有 Prompt 版本的标签集合，例如把验证通过的第 7 版提升为 production。它修改的是部署标签，不会改写该版本的 Prompt 内容。',
    whenToUse: '发布、回滚或环境晋级流程需要移动 production/staging 标签时。',
    example: `await langfuse.prompt.update({
  name: 'interview-feedback',
  version: 7,
  newLabels: ['production'],
})`,
    returns: '服务端更新后的 Prompt 元数据对象。',
    interview: '标签是运行时路由指针，版本是不可变内容。回滚只需把 production 标签移回经过验证的版本，因此变更快且可审计。',
    pitfall: 'newLabels 是目标标签集合，不要误当成“追加一个标签”；并发晋级要有发布锁或审批，避免标签竞态。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.PromptManager.html',
  }),
  langfuseApi({
    slug: 'langfuse-prompt-delete',
    name: 'PromptManager.delete',
    group: 'Prompt Management',
    kind: 'function',
    signature: 'client.prompt.delete(name: string, options?: { version?: number; label?: string }): Promise<void>',
    beginner: '删除指定版本、带某标签的版本，或在不传筛选时删除该名称的全部版本；SDK 也会失效这个名称对应的本地缓存。',
    whenToUse: '清理错误发布、测试 Prompt 或执行明确的数据治理流程时。',
    example: `await langfuse.prompt.delete('temporary-eval-prompt', { version: 2 })`,
    returns: '删除完成后的 Promise，不返回被删除内容。',
    interview: '删除既改变服务端版本集合，也必须使客户端缓存失效，否则运行时会继续使用已删除对象；这是控制面与数据面一致性问题。',
    pitfall: '不传 version 或 label 会删除全部版本，风险很高；生产操作应二次确认、记录审计，并优先取消标签而非直接删历史。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.PromptManager.html',
  }),
  langfuseApi({
    slug: 'langfuse-text-prompt-compile',
    name: 'TextPromptClient.compile',
    group: 'Prompt Management',
    kind: 'function',
    signature: 'textPrompt.compile(variables?: Record<string, string>): string',
    beginner: '把文本 Prompt 中的 Mustache 变量（例如 {{name}}）替换为运行时值，生成可以直接发给模型的最终字符串。',
    whenToUse: '已经 get/create 一个文本 Prompt，需要把用户、语言或业务参数填入模板时。',
    example: `const prompt = await langfuse.prompt.get('greeting')
const text = prompt.compile({ name: '小林', role: '前端工程师' })`,
    returns: '变量替换后的完整文本字符串。',
    interview: 'Compile 是模板渲染，不是模型调用；Prompt 版本负责指令治理，变量负责请求级数据，两者分离才能复现某次生成。',
    pitfall: '不要把不可信内容当模板本身发布；缺失变量可能留下占位符，调用模型前应校验必需变量并控制输入长度。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.TextPromptClient.html',
  }),
  langfuseApi({
    slug: 'langfuse-text-prompt-langchain',
    name: 'TextPromptClient.getLangchainPrompt',
    group: 'Prompt Management',
    kind: 'function',
    signature: 'textPrompt.getLangchainPrompt(): string',
    beginner: '把 Langfuse 的 Mustache 变量语法转换成 LangChain PromptTemplate 使用的花括号格式，让同一 Prompt 可以交给 LangChain 渲染。',
    whenToUse: '项目同时使用 Langfuse Prompt Management 与 LangChain PromptTemplate 时。',
    example: `const managed = await langfuse.prompt.get('qa')
const template = PromptTemplate.fromTemplate(managed.getLangchainPrompt())`,
    returns: '转换为 LangChain 变量格式的模板字符串。',
    interview: '这是适配层：Langfuse 管版本与标签，LangChain 管链式组合与执行；语法转换避免复制两套 Prompt，但仍需链接 Prompt 版本到 generation。',
    pitfall: '模板中的 JSON 花括号需要正确转义；转换后还要确保 LangChain 变量名与传入参数完全一致。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.TextPromptClient.html',
  }),
  langfuseApi({
    slug: 'langfuse-text-prompt-to-json',
    name: 'TextPromptClient.toJSON',
    group: 'Prompt Management',
    kind: 'function',
    signature: 'textPrompt.toJSON(): string',
    beginner: '把 Prompt 客户端包含的名称、版本、标签、模板和配置序列化为 JSON 字符串，便于日志、快照或调试展示。',
    whenToUse: '需要保存 Prompt 快照、调试版本选择或把元数据传给不接受 class 实例的边界时。',
    example: `const snapshot = prompt.toJSON()
await auditStore.save({ promptSnapshot: snapshot })`,
    returns: '包含当前 Prompt 数据的 JSON 字符串。',
    interview: '序列化快照有助于可复现性，但真正的关联主键仍应包含 prompt name/version；完整模板属于潜在敏感资产。',
    pitfall: '不要无差别把 toJSON 结果写入公开日志，其中可能含系统指令和配置；日志应脱敏并限制保留时间。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.TextPromptClient.html',
  }),
  langfuseApi({
    slug: 'langfuse-chat-prompt-compile',
    name: 'ChatPromptClient.compile',
    group: 'Prompt Management',
    kind: 'function',
    signature: 'chatPrompt.compile(variables?, placeholders?): Array<ChatMessage | unknown>',
    beginner: '先把聊天 Prompt 里的消息占位块替换为传入消息，再对每条消息内容执行 Mustache 变量替换，得到可传给聊天模型的消息数组。',
    whenToUse: 'Prompt 是 system/user/assistant 多消息结构，或需要动态插入历史消息、few-shot 示例时。',
    example: `const prompt = await langfuse.prompt.get('chat-coach', { type: 'chat' })
const messages = prompt.compile(
  { level: '高级' },
  { history: previousMessages },
)`,
    returns: '编译后的消息数组；未提供值的可选消息占位符可能仍以占位对象保留。',
    interview: '聊天 Prompt 不只是字符串：消息角色、顺序、placeholder 和变量共同构成模型输入契约，版本化时应整体管理。',
    pitfall: '动态 history 必须限制条数和 token，并防止旧消息中的提示注入；未解析 placeholder 不能直接交给不认识该格式的模型 SDK。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.ChatPromptClient.html',
  }),
  langfuseApi({
    slug: 'langfuse-chat-prompt-langchain',
    name: 'ChatPromptClient.getLangchainPrompt',
    group: 'Prompt Management',
    kind: 'function',
    signature: 'chatPrompt.getLangchainPrompt(options?: { placeholders?: Record<string, unknown> }): ChatMessage[]',
    beginner: '把 Langfuse 聊天 Prompt 转成 LangChain 可消费的消息模板格式，并可同时解析消息 placeholder。',
    whenToUse: '使用 LangChain ChatPromptTemplate，但希望 Prompt 内容和版本仍由 Langfuse 管理时。',
    example: `const managed = await langfuse.prompt.get('agent-chat', { type: 'chat' })
const prompt = ChatPromptTemplate.fromMessages(
  managed.getLangchainPrompt({ placeholders: { history: [] } }),
)`,
    returns: '变量语法适配后的聊天消息模板数组。',
    interview: '适配器把 Prompt 控制面与编排框架解耦，但观测时仍应把 managed prompt 关联到 generation，才能按 Prompt 版本比较成本和质量。',
    pitfall: 'LangChain 支持的 message shape 可能与模型供应商不同；升级两边版本时要测试 role、placeholder 与 JSON 花括号转换。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.ChatPromptClient.html',
  }),
  langfuseApi({
    slug: 'langfuse-chat-prompt-to-json',
    name: 'ChatPromptClient.toJSON',
    group: 'Prompt Management',
    kind: 'function',
    signature: 'chatPrompt.toJSON(): string',
    beginner: '把聊天 Prompt 的消息、配置、版本和标签序列化成 JSON 字符串，可用于审计、测试快照或调试。',
    whenToUse: '要把 Prompt 元数据跨进程传递，或保存一次实验使用的精确 Prompt 快照时。',
    example: `const promptJson = managedChatPrompt.toJSON()
expect(promptJson).toContain('system')`,
    returns: '当前聊天 Prompt 数据的 JSON 字符串表示。',
    interview: '快照可以辅助复现，但大规模评测应以稳定的 prompt name/version 为索引；快照与 trace 结合才能解释结果差异。',
    pitfall: '聊天消息可能包含内部系统指令或示例隐私数据；不要把序列化结果直接返回客户端或写入不受控日志。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.ChatPromptClient.html',
  }),
]

const evaluationApis: FrameworkApiReference[] = [
  langfuseApi({
    slug: 'langfuse-dataset-get',
    name: 'DatasetManager.get',
    group: 'Dataset 与 Experiment',
    kind: 'function',
    signature: 'client.dataset.get(name: string, options?: { fetchItemsPageSize?: number; version?: string }): Promise<FetchedDataset>',
    beginner: '按名称读取 Dataset，并自动分页取回全部 Dataset Items。返回对象还为每个 item 增加 link，并为整个 dataset 增加 runExperiment，方便直接执行回归评测。',
    whenToUse: 'CI、离线实验或本地调试需要用 Langfuse 托管的固定测试集时。',
    example: `const dataset = await langfuse.dataset.get('rag-regression', {
  fetchItemsPageSize: 100,
})
console.log(dataset.items.length)`,
    returns: '包含 Dataset 元数据、全部增强 items、version 和 runExperiment 方法的 FetchedDataset。',
    interview: '固定 Dataset 把线上坏样本变成可重复回归输入；按时间点读取 version 能冻结数据状态，避免同名数据集持续变化导致实验不可比较。',
    pitfall: '该高层方法会加载全部 items，大数据集要关注内存和分页请求；关键实验应固定 version，并校验租户与项目权限。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.DatasetManager.html',
  }),
  langfuseApi({
    slug: 'langfuse-dataset-create-item',
    name: 'DatasetManager.createItem',
    group: 'Dataset 与 Experiment',
    kind: 'function',
    signature: 'client.dataset.createItem(request: CreateDatasetItemRequest): Promise<DatasetItem>',
    beginner: '向指定 Dataset 新增或按 id 更新一个测试样本，样本可包含 input、expectedOutput、metadata，以及来源 trace/observation 的关联信息。',
    whenToUse: '把生产坏样本加入回归集，或通过脚本批量维护评测数据时。',
    example: `await langfuse.dataset.createItem({
  datasetName: 'rag-regression',
  id: 'citation-case-42',
  input: { question: '退款期限是多少？' },
  expectedOutput: { mustCite: 'policy-v3' },
})`,
    returns: '服务端创建或更新后的 DatasetItem。',
    interview: '稳定 item id 让写入可幂等并保留样本身份；input 是任务输入，expectedOutput 是评测参照，metadata 用于分层分析而不是替代答案。',
    pitfall: 'DatasetItem id 在项目范围需唯一，不能跨数据集复用；不要直接把未经脱敏的生产输入复制进评测集。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.DatasetManager.html',
  }),
  langfuseApi({
    slug: 'langfuse-dataset-item-link',
    name: 'FetchedDataset.items[].link',
    group: 'Dataset 与 Experiment',
    kind: 'function',
    signature: 'item.link({ otelSpan }, runName: string, runArgs?): Promise<DatasetRunItem>',
    beginner: '把一个 Dataset Item 与实际执行产生的 OpenTelemetry observation 连接起来，并归入指定 runName。这样 UI 能从测试样本跳到完整 trace。',
    whenToUse: '手写评测循环，已经为某个样本执行任务并得到 Langfuse observation 时。',
    example: `const span = startObservation('answer-case', { input: item.input })
span.update({ output })
span.end()
await item.link({ otelSpan: span.otelSpan }, 'prompt-v7')`,
    returns: '服务端创建的 DatasetRunItem，记录样本、运行与 observation 的血缘关系。',
    interview: 'Link 建立的是“测试输入 → 这次执行 trace”的数据血缘；它让分数、延迟、成本和内部步骤都能回到同一实验样本。',
    pitfall: '必须链接代表该 item 执行的正确 span，runName 也要稳定；先 end 再确保 span 尚可被 processor 导出，退出前需要 forceFlush。',
    officialUrl: 'https://js.reference.langfuse.com/types/_langfuse_client.FetchedDataset.html',
  }),
  langfuseApi({
    slug: 'langfuse-dataset-run-experiment',
    name: 'FetchedDataset.runExperiment',
    group: 'Dataset 与 Experiment',
    kind: 'function',
    signature: 'dataset.runExperiment(params: Omit<ExperimentParams, "data">): Promise<ExperimentResult>',
    beginner: '直接在已读取的 Langfuse Dataset 上运行 task、逐项 evaluators 和整体 runEvaluators，不需要再次传 data；SDK 会自动追踪并创建 Dataset Run。',
    whenToUse: '评测输入由 Langfuse Dataset 管理，希望获得 UI 对比、trace 链接和运行级评分时。',
    example: `const result = await dataset.runExperiment({
  name: 'RAG prompt v7',
  task: async ({ input }) => answer(input.question),
  evaluators: [citationEvaluator],
})`,
    returns: 'ExperimentResult，含 experimentId、runName、逐项结果、运行级评分和 Dataset Run URL。',
    interview: 'Experiment runner 统一并发、错误隔离、trace、item score 和 run score；它让模型或 Prompt 变更通过同一数据集进行可比较实验。',
    pitfall: 'task 必须避免共享可变状态；并发上限、模型限流和评测成本要显式配置，不能只看平均分忽略失败样本。',
    officialUrl: 'https://js.reference.langfuse.com/types/_langfuse_client.FetchedDataset.html',
  }),
  langfuseApi({
    slug: 'langfuse-experiment-run',
    name: 'ExperimentManager.run',
    group: 'Dataset 与 Experiment',
    kind: 'function',
    signature: 'client.experiment.run(config: ExperimentParams): Promise<ExperimentResult>',
    beginner: '在本地数组或 Dataset Items 上执行完整实验：逐项运行 task，执行 item evaluators，再执行 run evaluators，并自动创建 trace 与 score。',
    whenToUse: '数据来自代码或临时样本，或需要完全自定义实验输入与评估流程时。',
    example: `const result = await langfuse.experiment.run({
  name: 'JSON format check',
  data: [{ input: '生成用户资料', expectedOutput: { valid: true } }],
  task: async ({ input }) => generateProfile(input),
  evaluators: [jsonSchemaEvaluator],
})`,
    returns: '包含每个 item 输出、评估、trace 信息及运行级评估的 ExperimentResult。',
    interview: 'Task 定义被测系统，Evaluator 定义单样本质量，RunEvaluator 定义集合级指标；分层能同时发现局部退化与整体趋势。',
    pitfall: '本地 data 实验只创建 traces，不一定生成 Langfuse Dataset Run；想做长期可比实验应托管 Dataset，并固定模型、Prompt 和数据版本。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.ExperimentManager.html',
  }),
  langfuseApi({
    slug: 'langfuse-experiment-format',
    name: 'ExperimentResult.format',
    group: 'Dataset 与 Experiment',
    kind: 'function',
    signature: 'result.format(options?: { includeItemResults?: boolean }): Promise<string>',
    beginner: '把结构化 ExperimentResult 转成人类易读的文本摘要，可选是否包含每个样本的详细结果，适合终端和 CI 日志。',
    whenToUse: '实验结束后想快速在控制台、构建日志或评审评论中查看结果摘要时。',
    example: `console.log(await result.format({ includeItemResults: false }))`,
    returns: '包含汇总指标、评分和相关链接的格式化字符串。',
    interview: 'format 是展示层，不是判定门禁；自动回归应该直接读取结构化 evaluations 并用明确阈值决定通过或失败。',
    pitfall: '不要解析格式化文本做机器判断，输出格式可能变化；大数据集开启 includeItemResults 会产生很长日志并泄露样本内容。',
    officialUrl: 'https://js.reference.langfuse.com/types/_langfuse_client.ExperimentResult.html',
  }),
  langfuseApi({
    slug: 'langfuse-create-autoevals-evaluator',
    name: 'createEvaluatorFromAutoevals',
    group: 'Dataset 与 Experiment',
    kind: 'function',
    signature: 'createEvaluatorFromAutoevals(autoevalEvaluator, params?): Evaluator',
    beginner: '把 AutoEvals 库中的预置评估函数包装成 Langfuse Experiment 可直接使用的 Evaluator，自动适配 input、output、expected 与 score 结果。',
    whenToUse: '希望在 JS/TS 实验中复用 AutoEvals 的相似度、事实性等评估器时。',
    example: `const evaluator = createEvaluatorFromAutoevals(Factuality, {
  model: judgeModel,
})
await langfuse.experiment.run({ name: 'facts', data, task, evaluators: [evaluator] })`,
    returns: '符合 Langfuse Evaluator 签名、可放入 evaluators 数组的异步函数。',
    interview: '适配器统一第三方 evaluator 与 Langfuse Score 数据模型，但 LLM-as-a-Judge 仍有模型偏差、版本漂移和成本，必须用人工样本校准。',
    pitfall: '不要把 Judge 分数当绝对真相；固定评审模型与参数，记录理由，并设置超时、重试和并发限制。',
    officialUrl: 'https://js.reference.langfuse.com/functions/_langfuse_client.createEvaluatorFromAutoevals.html',
  }),
  langfuseApi({
    slug: 'langfuse-runner-context',
    name: 'RunnerContext',
    group: 'Dataset 与 Experiment',
    kind: 'class',
    signature: 'new RunnerContext({ client, data?, datasetVersion?, metadata? })',
    beginner: '为测试框架或自定义运行器保存 Langfuse client、默认数据、数据集版本与实验 metadata，随后可在同一上下文内重复运行实验。',
    whenToUse: '需要把实验能力嵌入测试工具、CLI 或自建评测 runner，而不是直接调用 experiment.run 时。',
    example: `const runner = new RunnerContext({
  client: langfuse,
  data: regressionCases,
  metadata: { commit: process.env.GIT_SHA },
})`,
    returns: '一个保存实验默认上下文的 RunnerContext 实例。',
    interview: 'RunnerContext 是依赖与默认参数容器，让多次实验共享 client、数据版本和构建元数据；它不是执行结果，也不替代 Dataset 版本控制。',
    pitfall: '不要在并发测试中修改共享 data；metadata 应记录 commit、模型和 Prompt 版本，但不能塞入密钥或个人数据。',
    officialUrl: 'https://js.reference.langfuse.com/modules/_langfuse_client.html',
  }),
  langfuseApi({
    slug: 'langfuse-runner-context-run-experiment',
    name: 'RunnerContext.runExperiment',
    group: 'Dataset 与 Experiment',
    kind: 'function',
    signature: 'runner.runExperiment(params: RunnerContextExperimentParams): Promise<ExperimentResult>',
    beginner: '使用 RunnerContext 中保存的 client、默认 data 和 metadata 启动一次实验，同时允许本次调用覆盖实验名称、task、evaluators 等参数。',
    whenToUse: '测试框架已经建立共享 RunnerContext，需要运行多组模型或 Prompt 回归时。',
    example: `const result = await runner.runExperiment({
  name: 'candidate-v8',
  task: candidateTask,
  evaluators: [accuracyEvaluator],
})`,
    returns: '完整 ExperimentResult，可继续格式化或用 RegressionError 做门禁。',
    interview: '上下文注入减少重复配置，但每次 experiment 仍应生成独立身份；共享的是依赖与基线，不是运行状态。',
    pitfall: '不要复用同一个 runName 覆盖语义不同的实验；CI 中应给运行名加入 commit 或构建号，避免结果无法区分。',
    officialUrl: 'https://js.reference.langfuse.com/modules/_langfuse_client.html',
  }),
  langfuseApi({
    slug: 'langfuse-regression-error',
    name: 'RegressionError',
    group: 'Dataset 与 Experiment',
    kind: 'class',
    signature: 'new RegressionError({ result, message } | { result, metric, value, threshold, message? })',
    beginner: '表示一次评测没有达到预期阈值的专用错误，可携带 ExperimentResult、失败指标、实际值和阈值，让测试或 CI 明确失败。',
    whenToUse: '把离线评测变成发布门禁，指标低于阈值时需要抛出结构化错误时。',
    example: `if (accuracy < 0.9) {
  throw new RegressionError({
    result,
    metric: 'accuracy',
    value: accuracy,
    threshold: 0.9,
  })
}`,
    returns: '一个可抛出的 RegressionError 实例，包含实验结果和回归上下文。',
    interview: '自动门禁把“看报告”升级为可执行质量契约；阈值要基于稳定基线和置信区间，而不是随意选一个漂亮数字。',
    pitfall: '小样本波动会造成误报；门禁应报告失败样本与统计量，并区分基础设施错误、模型随机性和真实质量回归。',
    officialUrl: 'https://js.reference.langfuse.com/modules/_langfuse_client.html',
  }),
]

const scoreApis: FrameworkApiReference[] = [
  langfuseApi({
    slug: 'langfuse-score-create', name: 'ScoreManager.create', group: 'Score 质量信号', kind: 'function',
    signature: 'client.score.create(data: ScoreBody): void',
    beginner: '创建一个评分事件并放入本地批处理队列。Score 可绑定 trace、observation、session 或 dataset run，并支持数值、分类、布尔和文本质量信号。',
    whenToUse: '已有明确目标 id，需要写入用户反馈、规则检查、人工标注或模型评审结果时。',
    example: `langfuse.score.create({ name: 'citation-correct', value: 1, traceId, comment: '来源可验证' })`,
    returns: '立即返回 void；评分先进入队列，稍后批量发送。',
    interview: 'Trace 解释“发生了什么”，Score 衡量“做得好不好”。Score 名称与数据类型必须稳定，才能按版本、模型和用户分群比较质量趋势。',
    pitfall: '入队不代表服务端已保存，短任务结束前要 flush；不要让同一 score 名在不同代码路径混用不同量纲或类型。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.ScoreManager.html',
  }),
  langfuseApi({
    slug: 'langfuse-score-observation', name: 'ScoreManager.observation', group: 'Score 质量信号', kind: 'function',
    signature: 'client.score.observation({ otelSpan }, data): void',
    beginner: '从指定 Langfuse observation 的 OpenTelemetry span 自动取出 traceId 和 observationId，把评分精确绑定到某一步，而不是整条请求。',
    whenToUse: '要评价一次检索、一次 generation、一个 tool 或 guardrail 步骤时。',
    example: `langfuse.score.observation({ otelSpan: generation.otelSpan }, { name: 'faithfulness', value: 0.92 })`,
    returns: 'void；评分进入异步批处理队列。',
    interview: 'Observation-level score 提供细粒度归因：整条回答低分时，可以区分是检索、生成还是工具执行导致问题。',
    pitfall: '必须传入目标 observation 的 otelSpan；评分前不要丢失对象引用，也要避免把步骤分数误当成端到端用户满意度。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.ScoreManager.html',
  }),
  langfuseApi({
    slug: 'langfuse-score-trace', name: 'ScoreManager.trace', group: 'Score 质量信号', kind: 'function',
    signature: 'client.score.trace({ otelSpan }, data): void',
    beginner: '从任意属于目标 trace 的 observation span 取出 traceId，并创建整条 trace 级评分，不要求调用方手工复制 id。',
    whenToUse: '评价一次完整用户请求或工作流结果，例如满意度、任务是否完成时。',
    example: `langfuse.score.trace({ otelSpan: root.otelSpan }, { name: 'user-rating', value: 5 })`,
    returns: 'void；创建的评分排队等待批量发送。',
    interview: 'Trace-level score 衡量端到端结果，Observation-level score 衡量局部步骤；两层同时存在才能做结果与根因的关联分析。',
    pitfall: '确保传入 span 属于想评分的 trace；分数尺度要有文档，例如 1–5 星与 0–1 不应共用同名指标。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.ScoreManager.html',
  }),
  langfuseApi({
    slug: 'langfuse-score-active-observation', name: 'ScoreManager.activeObservation', group: 'Score 质量信号', kind: 'function',
    signature: 'client.score.activeObservation(data): void',
    beginner: '读取当前 OpenTelemetry context 中的 active observation，并把评分绑定到它；调用方不需要显式传 span 或 id。',
    whenToUse: '代码运行在 startActiveObservation/observe 回调内部，评分对象就是当前步骤时。',
    example: `await startActiveObservation('check-answer', async () => {
  const passed = await check()
  langfuse.score.activeObservation({ name: 'passed', value: passed ? 1 : 0 })
})`,
    returns: 'void；没有 active span 时会记录警告并跳过。',
    interview: 'Active API 依赖 OTel 上下文传播，用便利性换取隐式依赖；异步上下文正确时能自动关联，跨队列或脱离回调时则可能丢失。',
    pitfall: '没有 active span 不会得到有效评分；跨异步边界要验证 context 传播，关键路径可改用显式 observation()。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.ScoreManager.html',
  }),
  langfuseApi({
    slug: 'langfuse-score-active-trace', name: 'ScoreManager.activeTrace', group: 'Score 质量信号', kind: 'function',
    signature: 'client.score.activeTrace(data): void',
    beginner: '从当前 active observation 自动解析其 traceId，然后创建整条 trace 的评分，适合在深层函数里记录端到端反馈。',
    whenToUse: '处于有效 OTel context 内，但当前函数只知道业务评分、不方便层层传 traceId 时。',
    example: `langfuse.score.activeTrace({ name: 'task-completed', value: completed ? 1 : 0 })`,
    returns: 'void；没有 active trace 时只警告并跳过。',
    interview: 'OTel context 像请求级隐式关联键，能减少参数传递；但可测试性和跨进程传播必须通过显式 traceparent 或 id 保障。',
    pitfall: '后台回调、队列消费者或 detached promise 可能没有原 context；不要忽略警告，必要时使用显式 trace score。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.ScoreManager.html',
  }),
  langfuseApi({
    slug: 'langfuse-score-flush', name: 'ScoreManager.flush', group: 'Score 质量信号', kind: 'function',
    signature: 'client.score.flush(): Promise<void>',
    beginner: '立即发送 ScoreManager 队列里的全部待处理 score，作用与 client.flush 在评分通道上一致，但入口更明确。',
    whenToUse: '测试、serverless 请求或需要马上查询评分结果的边界。',
    example: `langfuse.score.create(score)
await langfuse.score.flush()`,
    returns: '评分队列成功处理后的 Promise。',
    interview: '批处理降低网络开销，flush 提供一致性边界；应用应在吞吐与“退出前不丢数据”之间选择合适同步点。',
    pitfall: '频繁 flush 会退化为逐条请求；它只处理 score，不负责结束 observation 或导出 OTel span。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.ScoreManager.html',
  }),
  langfuseApi({
    slug: 'langfuse-score-shutdown', name: 'ScoreManager.shutdown', group: 'Score 质量信号', kind: 'function',
    signature: 'client.score.shutdown(): Promise<void>',
    beginner: '关闭评分管理器前先 flush 所有 score，并停止后台批处理计时器，是评分通道的最终生命周期操作。',
    whenToUse: '只管理 ScoreManager 生命周期，或进程整体退出时由 client.shutdown 间接调用。',
    example: `afterAll(async () => {
  await langfuse.score.shutdown()
})`,
    returns: '待处理评分发送并关闭完成后的 Promise。',
    interview: 'shutdown 应当幂等地终结异步队列，并在进程生命周期末尾执行；遥测系统不能反过来阻塞业务无限等待。',
    pitfall: '关闭后不要继续 create score；为 shutdown 设置合理超时，并与 OTel tracer provider 的 shutdown 分开处理。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.ScoreManager.html',
  }),
]

const mediaApis: FrameworkApiReference[] = [
  langfuseApi({
    slug: 'langfuse-media-resolve-references', name: 'MediaManager.resolveReferences', group: 'Media 内容', kind: 'function',
    signature: 'client.media.resolveReferences<T>({ obj, resolveWith: "base64DataUri", maxDepth? }): Promise<T>',
    beginner: '递归扫描对象中的 Langfuse media reference，把引用解析成 base64 data URI，便于重放包含图片、音频或 PDF 的观测数据。',
    whenToUse: '从 Langfuse 读取包含媒体引用的 input/output，并确实需要恢复原始二进制内容时。',
    example: `const resolved = await langfuse.media.resolveReferences({
  obj: trace.input,
  resolveWith: 'base64DataUri',
  maxDepth: 4,
})`,
    returns: '保持原对象结构、但已把可识别 media references 替换为 data URI 的新值。',
    interview: 'Langfuse 用引用避免在每条 span 中复制大二进制；按需解析把可观测元数据与媒体存储解耦，同时保留重放能力。',
    pitfall: 'base64 会显著增大内存和日志体积；限制 maxDepth、校验媒体类型与大小，绝不能把解析后的敏感文件直接写入日志。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_client.MediaManager.html',
  }),
]

const tracingApis: FrameworkApiReference[] = [
  langfuseApi({
    slug: 'langfuse-start-observation', name: 'startObservation', group: 'Tracing 入口', kind: 'function',
    signature: 'startObservation(name, attributes?, { asType?, parentSpanContext?, startTime? }): LangfuseObservation',
    beginner: '手动开始一个 Langfuse observation。默认创建普通 span；通过 asType 可创建 generation、event、embedding、agent、tool、chain、retriever、evaluator 或 guardrail，并按类型返回对应包装对象。',
    whenToUse: '工作跨越多个函数、需要手工控制结束时间，或已明确管理父子 span context 时。',
    example: `const generation = startObservation('answer', {
  input: messages,
  model: 'gpt-5-mini',
}, { asType: 'generation' })
try {
  const result = await callModel(messages)
  generation.update({ output: result.text, usageDetails: result.usage })
} finally {
  generation.end()
}`,
    returns: '由 asType 推断的强类型 Langfuse observation；event 创建后自动结束，其他类型需要显式 end。',
    interview: 'Observation 是 OTel span 加上 LLM 语义属性。span 表示有持续时间的工作，generation 增加模型与 token/cost，event 表示瞬时事件；父子 context 形成完整 trace。',
    pitfall: '手工模式必须在 finally 中 end；event 无需再次结束。跨异步或进程边界时要传正确 parentSpanContext，否则会生成断裂 trace。',
    officialUrl: 'https://js.reference.langfuse.com/functions/_langfuse_tracing.startObservation.html',
  }),
  langfuseApi({
    slug: 'langfuse-start-active-observation', name: 'startActiveObservation', group: 'Tracing 入口', kind: 'function',
    signature: 'startActiveObservation(name, fn, { asType?, endOnExit?, parentSpanContext? }): ReturnType<typeof fn>',
    beginner: '创建 observation、把它设为当前 OpenTelemetry active span、执行回调，并在回调结束或抛错时自动完成生命周期。回调内创建的子 observation 会自动继承父上下文。',
    whenToUse: '一个函数或代码块正好对应一次 span/generation/tool 等操作，希望自动 end 和错误标记时。',
    example: `const answer = await startActiveObservation(
  'answer-generation',
  async generation => {
    generation.update({ input: messages, model: 'gpt-5-mini' })
    const result = await callModel(messages)
    generation.update({ output: result.text, usageDetails: result.usage })
    return result.text
  },
  { asType: 'generation' },
)`,
    returns: '原回调的准确返回值或 Promise，并自动结束 observation；回调错误会继续向外抛出。',
    interview: 'Active context 是 OTel 自动父子关联的核心。结构化并发中的子操作继承当前 span，SDK 同时自动处理结束和异常，因此比手动模式更不易漏埋点。',
    pitfall: 'endOnExit:false 会把生命周期责任交还给调用方；detached promise 或队列任务可能在 active context 失效后运行，需要显式传播 context。',
    officialUrl: 'https://js.reference.langfuse.com/functions/_langfuse_tracing.startActiveObservation.html',
  }),
  langfuseApi({
    slug: 'langfuse-observe', name: 'observe', group: 'Tracing 入口', kind: 'function',
    signature: 'observe<T extends (...args: any[]) => any>(fn: T, options?: ObserveOptions): T',
    beginner: '包装一个现有函数，使每次调用自动创建 active observation，并可控制名称、类型以及是否捕获函数输入和输出，不必改写函数主体。',
    whenToUse: '想以声明式方式追踪 service、tool、retriever 或 evaluator 函数，且函数边界就是 observation 边界时。',
    example: `const retrieve = observe(
  async (query: string) => vectorStore.search(query),
  { name: 'knowledge-retrieval', asType: 'retriever' },
)`,
    returns: '保持原函数参数、返回类型和异步行为的包装函数。',
    interview: 'observe 是函数装饰器模式，底层仍使用 active OTel context。它降低埋点侵入性，但自动 capture 可能扩大数据收集面，因此可观测性与隐私必须同时设计。',
    pitfall: '默认捕获 input/output 前先检查是否含 PII、密钥或大对象；高阶函数和绑定 this 的方法要验证包装后语义不变。',
    officialUrl: 'https://js.reference.langfuse.com/functions/_langfuse_tracing.observe.html',
  }),
  langfuseApi({
    slug: 'langfuse-update-active-observation', name: 'updateActiveObservation', group: 'Tracing 入口', kind: 'function',
    signature: 'updateActiveObservation(attributes, { asType? }): void',
    beginner: '更新当前 active observation 的 input、output、metadata、level 等属性；传 asType 后 TypeScript 会检查 generation、retriever 等类型特有字段。',
    whenToUse: '深层业务函数位于 active context 内，但没有拿到 observation 对象引用时。',
    example: `updateActiveObservation(
  { output: answer, usageDetails: usage },
  { asType: 'generation' },
)`,
    returns: 'void；直接修改当前 active OTel span 上的 Langfuse 属性。',
    interview: '它依赖隐式 OTel context，从而减少对象透传；类型参数只保证字段形状，真正的父子关系仍由运行时 context 决定。',
    pitfall: '没有 active span 时更新不会落到期望 observation；跨队列或 detached callback 时应传显式对象，而不是假设 context 一直存在。',
    officialUrl: 'https://js.reference.langfuse.com/functions/_langfuse_tracing.updateActiveObservation.html',
  }),
  langfuseApi({
    slug: 'langfuse-set-active-trace-io', name: 'setActiveTraceIO', group: 'Tracing 入口', kind: 'function',
    signature: 'setActiveTraceIO({ input?, output? }: LangfuseTraceAttributes): void',
    beginner: '给当前 active trace 设置端到端 input/output，即使代码此刻处在某个子 observation 内，也会把信息标记为 trace 级数据。',
    whenToUse: '在请求入口记录用户任务，在流程结束处记录最终结果，让 UI 顶层 trace 一眼可读时。',
    example: `setActiveTraceIO({ input: { question } })
const answer = await runAgent(question)
setActiveTraceIO({ output: { answer } })`,
    returns: 'void；属性写入当前 trace 的 OTel 语义字段。',
    interview: 'Trace IO 表示端到端契约，Observation IO 表示局部步骤。两者分层可避免只能看到大量 span、却不知道用户请求和最终结果是什么。',
    pitfall: '不要把完整敏感正文默认写入 trace；应用字段 allowlist、截断和脱敏，并确保调用发生在正确 active trace 上。',
    officialUrl: 'https://js.reference.langfuse.com/functions/_langfuse_tracing.setActiveTraceIO.html',
  }),
  langfuseApi({
    slug: 'langfuse-set-active-trace-public', name: 'setActiveTraceAsPublic', group: 'Tracing 入口', kind: 'function',
    signature: 'setActiveTraceAsPublic(): void',
    beginner: '把当前 active trace 标记为可通过 Langfuse 的公共 trace 机制访问，常用于显式分享某条演示或调试记录。',
    whenToUse: '产品确实提供 trace 分享能力，并已完成内容审查和用户授权时。',
    example: `if (request.shareTrace === true && user.canShare) {
  setActiveTraceAsPublic()
}`,
    returns: 'void；只更新当前 trace 的 public 属性。',
    interview: 'Public 是数据访问策略，不是普通展示选项。可观测 trace 常含 Prompt、工具参数和模型输出，公开前必须做最小化、脱敏与授权。',
    pitfall: '绝不能默认公开所有 trace；标记后要确认部署的访问规则，并阻止未授权用户通过业务参数任意公开内部执行记录。',
    officialUrl: 'https://js.reference.langfuse.com/functions/_langfuse_tracing.setActiveTraceAsPublic.html',
  }),
  langfuseApi({
    slug: 'langfuse-propagate-attributes', name: 'propagateAttributes', group: 'Tracing 入口', kind: 'function',
    signature: 'propagateAttributes(params: PropagateAttributesParams, fn: () => T): T',
    beginner: '在回调范围内传播 userId、sessionId、tags、metadata、trace name/version 等公共属性，让后续创建的所有子 observations 自动继承。',
    whenToUse: '一次请求或会话中的多层操作都需要相同租户、用户、标签和版本维度时。',
    example: `await propagateAttributes(
  { userId: user.id, sessionId, tags: ['interview'], metadata: { tenantId } },
  () => runInterview(),
)`,
    returns: '原回调的返回值，并仅在回调的 OTel context 范围内传播属性。',
    interview: 'Context propagation 避免每个 span 手工重复公共维度，并保证同一 trace 可按用户、会话、版本聚合；它类似请求作用域上下文。',
    pitfall: '高基数和敏感 metadata 会复制到大量 spans，造成成本与隐私风险；只传播必要字段，并测试异步 context 是否保持。',
    officialUrl: 'https://js.reference.langfuse.com/functions/_langfuse_tracing.propagateAttributes.html',
  }),
  langfuseApi({
    slug: 'langfuse-create-trace-id', name: 'createTraceId', group: 'Tracing 入口', kind: 'function',
    signature: 'createTraceId(seed?: string): Promise<string>',
    beginner: '生成符合 OpenTelemetry 格式的 traceId；传 seed 时会确定性地产生同一个 id，便于把业务请求 id 映射到 Langfuse trace。',
    whenToUse: '在开始 observation 前就需要稳定 traceId，或要把跨系统业务 id 与 trace 建立可重复映射时。',
    example: `const traceId = await createTraceId(order.id)
const parentSpanContext = { traceId, spanId: randomSpanId(), traceFlags: 1 }`,
    returns: '32 个十六进制字符的 OTel trace id 字符串。',
    interview: '确定性 traceId 可让分布式系统按业务键关联，但 traceId 不是权限凭证或数据库主键；采样与 parent context 仍决定链路是否完整。',
    pitfall: '不要把可猜测 seed 当安全隔离；同一 seed 的并发独立请求可能被错误合并，需先确认业务语义确实是一条 trace。',
    officialUrl: 'https://js.reference.langfuse.com/functions/_langfuse_tracing.createTraceId.html',
  }),
  langfuseApi({
    slug: 'langfuse-get-active-trace-id', name: 'getActiveTraceId', group: 'Tracing 入口', kind: 'function',
    signature: 'getActiveTraceId(): string | undefined',
    beginner: '读取当前 OpenTelemetry active span 所属的 traceId，适合把相同关联 id 写入业务日志或响应头。',
    whenToUse: '代码处于 active observation 中，需要与日志、队列消息或错误报告关联时。',
    example: `logger.info({ traceId: getActiveTraceId() }, 'tool started')`,
    returns: '当前 traceId；没有有效 active span 时返回 undefined。',
    interview: 'TraceId 是端到端调用链标识，跨服务传播通常依赖 W3C trace context；读取 id 不会自动把 context 注入外部消息。',
    pitfall: '必须处理 undefined；向队列发送时还要显式注入 trace context，不能只记录一个字符串就认为子消费者自动成为同一 trace。',
    officialUrl: 'https://js.reference.langfuse.com/functions/_langfuse_tracing.getActiveTraceId.html',
  }),
  langfuseApi({
    slug: 'langfuse-get-active-span-id', name: 'getActiveSpanId', group: 'Tracing 入口', kind: 'function',
    signature: 'getActiveSpanId(): string | undefined',
    beginner: '读取当前 active observation 对应的 OTel spanId，在 Langfuse 中也可作为 observation 级关联标识。',
    whenToUse: '错误日志、评分或自定义遥测需要定位到当前具体步骤，而不只是整条 trace 时。',
    example: `const observationId = getActiveSpanId()
errorReporter.setContext({ observationId })`,
    returns: '当前 spanId 字符串；没有 active span 时返回 undefined。',
    interview: '同一 trace 有多个 spanId：traceId 定位整条请求，spanId 定位一个时间区间。二者一起才能准确表达父子调用关系。',
    pitfall: 'spanId 只在所属 trace 内有语义；不要当全局业务 id，且异步 context 丢失时必须处理 undefined。',
    officialUrl: 'https://js.reference.langfuse.com/functions/_langfuse_tracing.getActiveSpanId.html',
  }),
  langfuseApi({
    slug: 'langfuse-get-tracer', name: 'getLangfuseTracer', group: 'Tracing 入口', kind: 'function',
    signature: 'getLangfuseTracer(): Tracer',
    beginner: '取得 Langfuse 使用的 OpenTelemetry Tracer，供高级场景直接创建标准 OTel spans 或与现有 instrumentation 协作。',
    whenToUse: '已有 OTel 基础设施，需要用标准 Tracer API 与 Langfuse 导出管线衔接时。',
    example: `const tracer = getLangfuseTracer()
tracer.startActiveSpan('custom-operation', async span => {
  try { await work() } finally { span.end() }
})`,
    returns: '当前 Langfuse tracer provider 提供的 OpenTelemetry Tracer。',
    interview: 'Langfuse v5 建立在 OTel 上，因此可与 HTTP、数据库和 GenAI instrumentation 共用 trace；Langfuse semantic attributes 决定 UI 如何理解 LLM 观测。',
    pitfall: '纯 OTel span 若没有 Langfuse/GenAI 语义属性，可能被默认过滤或只显示为通用 span；生命周期仍要显式 end。',
    officialUrl: 'https://js.reference.langfuse.com/functions/_langfuse_tracing.getLangfuseTracer.html',
  }),
  langfuseApi({
    slug: 'langfuse-get-tracer-provider', name: 'getLangfuseTracerProvider', group: 'Tracing 入口', kind: 'function',
    signature: 'getLangfuseTracerProvider(): TracerProvider',
    beginner: '读取 tracing 包当前使用的 OpenTelemetry TracerProvider，便于高级配置、诊断或在进程退出时统一 flush/shutdown。',
    whenToUse: '应用自行搭建 OTel SDK，或需要检查 Langfuse tracing 正在使用哪个 provider 时。',
    example: `const provider = getLangfuseTracerProvider()
await provider.forceFlush?.()`,
    returns: '当前注册给 Langfuse 的 TracerProvider。',
    interview: 'TracerProvider 是 tracer 的工厂与处理管线入口，SpanProcessor 挂在 provider 上完成采样、批处理和导出；错误的 provider 会让 context 存在却没有数据落库。',
    pitfall: '不要在普通业务请求中频繁操作 provider；不同 OTel SDK 的 provider 生命周期方法可能不同，应由应用启动/关闭层统一管理。',
    officialUrl: 'https://js.reference.langfuse.com/functions/_langfuse_tracing.getLangfuseTracerProvider.html',
  }),
  langfuseApi({
    slug: 'langfuse-set-tracer-provider', name: 'setLangfuseTracerProvider', group: 'Tracing 入口', kind: 'function',
    signature: 'setLangfuseTracerProvider(provider: TracerProvider | null): void',
    beginner: '告诉 @langfuse/tracing 应使用哪个 OpenTelemetry TracerProvider；传 null 可清除自定义 provider，让应用重新按默认方式解析。',
    whenToUse: '应用已有统一 OTel NodeSDK/provider，需要让 Langfuse observations 加入同一条遥测管线时。',
    example: `const provider = new NodeTracerProvider({
  spanProcessors: [new LangfuseSpanProcessor()],
})
setLangfuseTracerProvider(provider)`,
    returns: 'void；后续 Langfuse tracer 与 observations 使用指定 provider。',
    interview: '单一 provider 让通用服务 spans 与 LLM spans 共享 context 和 export pipeline，是避免两套割裂 trace 的关键装配点。',
    pitfall: '应在创建任何 observation 前设置一次；运行中更换 provider 会割裂 trace，且必须自行负责旧 provider 的 flush 和 shutdown。',
    officialUrl: 'https://js.reference.langfuse.com/functions/_langfuse_tracing.setLangfuseTracerProvider.html',
  }),
]

const observationApis: FrameworkApiReference[] = [
  langfuseApi({
    slug: 'langfuse-span', name: 'LangfuseSpan', group: 'Observation 对象', kind: 'class',
    signature: 'startObservation(name, attributes?) => LangfuseSpan',
    beginner: '通用有时长 observation，用于函数、工作流步骤、数据库访问或任何不属于模型专用类型的操作。它可以包含任意类型的子 observations。',
    whenToUse: '追踪请求处理、业务步骤、数据准备或无法归入更具体语义类型的操作时。',
    example: `const span = startObservation('load-profile', { input: { userId } })
span.update({ output: { found: true } })
span.end()`,
    returns: '可 update、end、创建子 observation，并暴露 id、traceId 与 otelSpan 的 LangfuseSpan。',
    interview: 'Span 是一段有开始和结束的工作，父子 span 形成因果层级；它记录过程，不代表模型生成，也不应该滥用 generation 字段。',
    pitfall: '必须 end 才有正确耗时；通用 span 名称要稳定且低基数，不要把 userId 或完整问题拼进 name。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_tracing.LangfuseSpan.html',
  }),
  langfuseApi({
    slug: 'langfuse-generation', name: 'LangfuseGeneration', group: 'Observation 对象', kind: 'class',
    signature: 'startObservation(name, generationAttributes, { asType: "generation" }) => LangfuseGeneration',
    beginner: '专门表示一次 LLM/生成模型调用，除 input/output 外可记录 model、modelParameters、usageDetails、costDetails、首 token 时间和关联 Prompt。',
    whenToUse: '每一次真正向聊天、补全或多模态生成模型发请求时。',
    example: `const generation = startObservation('openai-chat', {
  model: 'gpt-5-mini', input: messages,
}, { asType: 'generation' })
generation.update({ output: answer, usageDetails: usage })
generation.end()`,
    returns: '带模型、token、成本语义并继承通用 observation 能力的 LangfuseGeneration。',
    interview: 'Generation 将模型调用标准化，Langfuse 才能按模型、Prompt 版本、token、成本和延迟聚合；它是 LLM observability 区别于普通 APM 的核心对象。',
    pitfall: 'usage 字段必须使用稳定单位和真实供应商结果；不要把整条 agent 工作流都记成一个 generation，否则无法定位工具与检索耗时。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_tracing.LangfuseGeneration.html',
  }),
  langfuseApi({
    slug: 'langfuse-event', name: 'LangfuseEvent', group: 'Observation 对象', kind: 'class',
    signature: 'startObservation(name, attributes, { asType: "event" }) => LangfuseEvent',
    beginner: '表示没有持续时间的瞬时事件或日志点，例如用户取消、缓存命中、人工审批或限流发生；创建时自动结束。',
    whenToUse: '只关心某件事在某时发生，而不需要计算持续时长时。',
    example: `startObservation('user-cancelled', {
  metadata: { stage: 'generation' },
  level: 'WARNING',
}, { asType: 'event' })`,
    returns: '已经自动结束的 LangfuseEvent，可读取 id、traceId 和底层 otelSpan。',
    interview: 'Event 是时间点，Span 是时间区间；把瞬时事实记成 event 可避免大量零时长 span，同时保留 trace 内的时间顺序。',
    pitfall: 'Event 创建后自动结束，不要把需要后续 update 的长操作建成 event；高频循环事件也应采样，避免遥测洪水。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_tracing.LangfuseEvent.html',
  }),
  langfuseApi({
    slug: 'langfuse-agent-observation', name: 'LangfuseAgent', group: 'Observation 对象', kind: 'class',
    signature: 'startObservation(name, attributes, { asType: "agent" }) => LangfuseAgent',
    beginner: '表示一个 Agent 的整体决策与执行区间，通常包含 generation、tool、retriever 等子 observations，用于观察一次代理任务如何完成。',
    whenToUse: 'Agent 接收目标、循环规划并调用多个工具，需把整个自治过程作为一个步骤时。',
    example: `await startActiveObservation('research-agent', async agent => {
  agent.update({ input: { question } })
  const output = await runAgent(question)
  agent.update({ output })
}, { asType: 'agent' })`,
    returns: '具有通用 update/end/子 observation 能力的 LangfuseAgent。',
    interview: 'Agent observation 是语义父节点，子 generation 表示推理调用、tool 表示动作；层级拆分后才能分析循环次数、失败步骤和成本来源。',
    pitfall: '不要只记录一个巨大的 agent span；内部模型和工具仍要建子 observations，并限制 metadata 中的思维链或敏感状态。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_tracing.LangfuseAgent.html',
  }),
  langfuseApi({
    slug: 'langfuse-tool-observation', name: 'LangfuseTool', group: 'Observation 对象', kind: 'class',
    signature: 'startObservation(name, attributes, { asType: "tool" }) => LangfuseTool',
    beginner: '表示 Agent 或模型触发的一次工具/函数调用，可记录结构化输入、结果、错误、重试与工具元数据。',
    whenToUse: '调用搜索、数据库、HTTP、代码执行或业务 action 等工具边界时。',
    example: `await startActiveObservation('weather-tool', async tool => {
  tool.update({ input: args })
  const result = await getWeather(args)
  tool.update({ output: result })
  return result
}, { asType: 'tool' })`,
    returns: '表示一次工具执行并可创建更细子步骤的 LangfuseTool。',
    interview: '工具是模型世界与真实系统之间的副作用边界，单独观测便于审计参数、权限、错误率和重试，而不是把问题都归给模型。',
    pitfall: '输入输出可能含密钥和个人数据，必须脱敏；工具成功也不等于业务正确，应结合权限、幂等性和 score 判断。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_tracing.LangfuseTool.html',
  }),
  langfuseApi({
    slug: 'langfuse-chain-observation', name: 'LangfuseChain', group: 'Observation 对象', kind: 'class',
    signature: 'startObservation(name, attributes, { asType: "chain" }) => LangfuseChain',
    beginner: '表示一个由多个连续步骤组成的链或 pipeline，例如 query rewrite → retrieve → rerank → generate 的 RAG 流程。',
    whenToUse: '多个可观测步骤共同实现一个明确的顺序流程，需要一个语义父节点时。',
    example: `await startActiveObservation('rag-chain', async chain => {
  chain.update({ input: { question } })
  const answer = await runRag(question)
  chain.update({ output: { answer } })
}, { asType: 'chain' })`,
    returns: '承载流程级 input/output 和子 observation 层级的 LangfuseChain。',
    interview: 'Chain 描述确定性或半确定性的步骤组合，Agent 更强调动态决策；语义区分有助于比较流程延迟与自治行为。',
    pitfall: '不要把整个服务所有逻辑都塞进一条 chain；按业务边界拆分子步骤，避免重复记录巨大 input/output。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_tracing.LangfuseChain.html',
  }),
  langfuseApi({
    slug: 'langfuse-retriever-observation', name: 'LangfuseRetriever', group: 'Observation 对象', kind: 'class',
    signature: 'startObservation(name, attributes, { asType: "retriever" }) => LangfuseRetriever',
    beginner: '表示一次文档、关键词或向量检索操作，可记录 query、过滤条件、topK、返回文档 id/score 和耗时。',
    whenToUse: 'RAG、搜索或记忆召回从外部知识源取得候选内容时。',
    example: `const retriever = startObservation('vector-search', {
  input: { query, topK: 5 },
}, { asType: 'retriever' })
const hits = await search(query)
retriever.update({ output: hits.map(({ id, score }) => ({ id, score })) })
retriever.end()`,
    returns: '表示一次召回操作的 LangfuseRetriever。',
    interview: 'Retriever observation 让生成质量与召回质量分开分析；记录候选 id、排名和 score 后，可计算 recall、MRR、引用命中等检索指标。',
    pitfall: '优先记录文档 id/score 而非完整敏感正文；topK、embedding 版本、过滤器和租户条件都应可追溯。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_tracing.LangfuseRetriever.html',
  }),
  langfuseApi({
    slug: 'langfuse-evaluator-observation', name: 'LangfuseEvaluator', group: 'Observation 对象', kind: 'class',
    signature: 'startObservation(name, attributes, { asType: "evaluator" }) => LangfuseEvaluator',
    beginner: '表示一次质量评估过程，例如规则检查、LLM-as-a-Judge 或引用正确性计算；它记录评估输入、输出与执行成本，不等同于最终 Score。',
    whenToUse: '评估本身有模型调用、延迟或错误，需要观测其执行过程时。',
    example: `const evaluator = startObservation('faithfulness-judge', {
  input: { answer, context },
}, { asType: 'evaluator' })
const score = await judge(answer, context)
evaluator.update({ output: { score } })
evaluator.end()`,
    returns: '表示评估执行过程的 LangfuseEvaluator。',
    interview: 'Evaluator observation 追踪“评分是如何计算的”，Score 保存“评分结果是什么”。分开后可监控 Judge 成本、错误和漂移。',
    pitfall: '完成 evaluator observation 后仍需创建 Score 才能进入质量分析；评审模型输入也要脱敏并固定版本。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_tracing.LangfuseEvaluator.html',
  }),
  langfuseApi({
    slug: 'langfuse-guardrail-observation', name: 'LangfuseGuardrail', group: 'Observation 对象', kind: 'class',
    signature: 'startObservation(name, attributes, { asType: "guardrail" }) => LangfuseGuardrail',
    beginner: '表示一次安全、合规、格式或策略检查，可记录被检查内容的摘要、命中规则、允许/拒绝结果和检查耗时。',
    whenToUse: '输入进入模型前或输出返回用户前执行内容安全、PII、越狱或 schema 校验时。',
    example: `await startActiveObservation('pii-guardrail', async guardrail => {
  const result = await scanForPii(text)
  guardrail.update({ output: { allowed: result.safe, categories: result.categories } })
}, { asType: 'guardrail' })`,
    returns: '表示一次策略检查执行的 LangfuseGuardrail。',
    interview: 'Guardrail 是可观测的控制点：不仅要看拦截率，还要分析误杀、漏检、延迟和策略版本，才能持续治理安全质量。',
    pitfall: '不要为了调试把未脱敏原文写回 guardrail trace；被阻断内容尤其敏感，应记录类别、哈希或最小摘要。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_tracing.LangfuseGuardrail.html',
  }),
  langfuseApi({
    slug: 'langfuse-embedding-observation', name: 'LangfuseEmbedding', group: 'Observation 对象', kind: 'class',
    signature: 'startObservation(name, attributes, { asType: "embedding" }) => LangfuseEmbedding',
    beginner: '表示一次 embedding 模型调用，可记录模型、输入、向量批次数量、token usage 和成本；通常不应把完整高维向量写入 output。',
    whenToUse: '为文档或查询生成向量，想单独分析 embedding 延迟、用量与模型版本时。',
    example: `const embedding = startObservation('embed-query', {
  model: 'text-embedding-3-small', input: query,
}, { asType: 'embedding' })
const vector = await embed(query)
embedding.update({ output: { dimensions: vector.length }, usageDetails: usage })
embedding.end()`,
    returns: '带 generation 类模型与用量字段的 LangfuseEmbedding。',
    interview: 'Embedding 也是模型推理，但输出是向量而非自然语言；独立类型便于按维度、批量和模型分析 RAG 上游成本。',
    pitfall: '不要上传完整向量和敏感原文造成巨大体积；模型或维度变化要版本化，否则检索索引不可比较。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_tracing.LangfuseEmbedding.html',
  }),
  langfuseApi({
    slug: 'langfuse-observation-update', name: 'LangfuseObservation.update', group: 'Observation 对象', kind: 'function',
    signature: 'observation.update(attributes): typeof observation',
    beginner: '在 observation 生命周期中补充或更新 input、output、metadata、level、statusMessage，以及 generation 的 model/usage/cost 等类型专用字段。',
    whenToUse: '创建时只知道输入，执行结束后才知道结果、用量或错误状态时。',
    example: `try {
  const output = await work()
  observation.update({ output })
} catch (error) {
  observation.update({ level: 'ERROR', statusMessage: String(error) })
  throw error
}`,
    returns: '同类型 observation 实例，便于链式调用；属性写到底层 OTel span。',
    interview: 'Observation 是增量构建的：开始记录输入和上下文，结束前补结果与状态。更新属性不结束计时，end 才确定持续时间。',
    pitfall: '不要在 end 后继续 update；metadata 应保持可序列化并限制大小，错误信息也要移除密钥与个人数据。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_tracing.LangfuseSpan.html',
  }),
  langfuseApi({
    slug: 'langfuse-observation-end', name: 'LangfuseObservation.end', group: 'Observation 对象', kind: 'function',
    signature: 'observation.end(endTime?: TimeInput): void',
    beginner: '结束一个手动创建的 span/generation 等 observation，确定结束时间和持续时长，并让 OTel processor 可以完成导出。event 会自动结束。',
    whenToUse: '使用 startObservation 手工管理生命周期时，必须在成功和失败路径最终调用。',
    example: `const span = startObservation('rerank')
try {
  span.update({ output: await rerank() })
} finally {
  span.end()
}`,
    returns: 'void；底层 OpenTelemetry span 被标记为已结束。',
    interview: '只有 ended span 才具有完整持续时间并进入 BatchSpanProcessor 导出流程；漏 end 会造成 trace 不完整和内存滞留。',
    pitfall: '始终放在 finally；不要重复结束或结束父 span 后仍创建依赖其 active context 的子操作。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_tracing.LangfuseSpan.html',
  }),
]

const otelApis: FrameworkApiReference[] = [
  langfuseApi({
    slug: 'langfuse-span-processor', name: 'LangfuseSpanProcessor', group: 'OpenTelemetry 导出', kind: 'class',
    signature: 'new LangfuseSpanProcessor(params?: LangfuseSpanProcessorParams)',
    beginner: '挂到 OpenTelemetry TracerProvider/NodeSDK 的 SpanProcessor，负责筛选、脱敏、批处理并把已结束 spans 导出到 Langfuse，还可处理媒体上传、environment 与 release 标签。',
    whenToUse: 'Node.js 20+ 应用使用 Langfuse v5 tracing，或已有 OTel SDK 需要增加 Langfuse 导出后端时。',
    example: `const processor = new LangfuseSpanProcessor({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  environment: 'production',
  mask: ({ data }) => redact(data),
})
const sdk = new NodeSDK({ spanProcessors: [processor] })`,
    returns: '实现 OpenTelemetry SpanProcessor 的 LangfuseSpanProcessor 实例。',
    interview: 'Instrumentation 产生 spans，TracerProvider 管 context 与 processor，LangfuseSpanProcessor 负责批量 export。mask 和 shouldExportSpan 是隐私、成本与采样的关键边界。',
    pitfall: 'mask 必须覆盖 input/output/metadata 中的敏感信息；自定义 shouldExportSpan 会完全覆盖默认智能过滤，错误规则可能导出所有噪声或丢掉关键 LLM spans。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_otel.LangfuseSpanProcessor.html',
  }),
  langfuseApi({
    slug: 'langfuse-span-processor-force-flush', name: 'LangfuseSpanProcessor.forceFlush', group: 'OpenTelemetry 导出', kind: 'function',
    signature: 'processor.forceFlush(): Promise<void>',
    beginner: '强制把 processor 已收到但尚在批处理缓冲区中的 spans 立即导出，并等待媒体等相关异步工作完成。',
    whenToUse: 'serverless 调用结束、测试断言前、脚本退出或需要保证 trace 立即可见时。',
    example: `root.end()
await processor.forceFlush()`,
    returns: '当前缓冲 span 导出完成后的 Promise。',
    interview: 'OTel span 只有 end 后才交给 processor，forceFlush 再把缓冲区推送到后端；这与 Client.flush 的 score 队列是两条独立管线。',
    pitfall: '必须先 end observations；每请求 forceFlush 会损失批处理吞吐，应只在短生命周期或明确同步边界使用。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_otel.LangfuseSpanProcessor.html',
  }),
  langfuseApi({
    slug: 'langfuse-span-processor-shutdown', name: 'LangfuseSpanProcessor.shutdown', group: 'OpenTelemetry 导出', kind: 'function',
    signature: 'processor.shutdown(): Promise<void>',
    beginner: '停止 processor 前完成最终 flush 并释放批处理与 exporter 资源，是 OTel tracing 管线在进程退出时的关闭入口。',
    whenToUse: '服务接到终止信号、测试 teardown 或一次性 Node 脚本结束时。',
    example: `process.once('SIGTERM', async () => {
  await Promise.all([processor.shutdown(), langfuse.shutdown()])
  process.exit(0)
})`,
    returns: '剩余 spans 处理并关闭 exporter 后完成的 Promise。',
    interview: '生产优雅关闭要同时终结 trace processor 与 Client score manager；两个 shutdown 各自保证一条异步遥测通道不丢数据。',
    pitfall: 'shutdown 后不要继续创建 spans；设置总体退出超时，且不要在多个组件重复关闭同一 processor 导致竞态。',
    officialUrl: 'https://js.reference.langfuse.com/classes/_langfuse_otel.LangfuseSpanProcessor.html',
  }),
]

export const LANGFUSE_FRAMEWORK_API_EXPECTED_COUNT = 60

export const langfuseFrameworkApis: FrameworkApiReference[] = [
  ...clientApis,
  ...promptApis,
  ...evaluationApis,
  ...scoreApis,
  ...mediaApis,
  ...tracingApis,
  ...observationApis,
  ...otelApis,
]

if (langfuseFrameworkApis.length !== LANGFUSE_FRAMEWORK_API_EXPECTED_COUNT) {
  throw new Error(
    `Langfuse framework API catalog expected ${LANGFUSE_FRAMEWORK_API_EXPECTED_COUNT} entries, received ${langfuseFrameworkApis.length}`,
  )
}

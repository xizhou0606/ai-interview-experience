import type { FrameworkApiLearningMeta, FrameworkApiParameter } from '../types'

// 短描述在这里按参数语义补足，避免每个条目重复书写同一段治理说明。
const parameterDescriptionDetails: Record<string, string> = {
  name: '用于从注册表稳定定位对应资源。',
  logger: '替换后由所有框架模块统一复用。',
  messages: '框架会将其规范化为本轮模型上下文。',
  requestContext: '其中携带租户、身份与请求级配置。',
  model: '运行前还需核对能力、版本与成本策略。',
  'config.id': '用于资源发现、追踪与版本治理。',
  'config.instructions': '仅在技能被选中后注入模型上下文。',
  '无显式参数': '调用时无需额外传入业务字段。',
  'config.indexName': '必须与实际建库和维度配置保持一致。',
  'config.defaultStrategy': '应根据文档结构与检索评测结果选择。',
  'config.topK': '需要在召回覆盖与上下文成本之间权衡。',
  'config.inputSchema': '会在执行前拒绝结构不合法的数据。',
  'config.outputSchema': '供下游步骤验证并安全恢复执行。',
  'config.execute': '其中还要实现授权、取消与副作用治理。',
  持久化快照: '服务重启后会依靠它继续原有执行。',
  'options.workflow': '读取器会按该定义解释持久化状态。',
  'options.runId': '用于定位同一次执行及其持久化快照。',
  step: '其输入输出必须与相邻流程节点兼容。',
  branches: '每个条件都要有可测试的确定性语义。',
  'default branch': '防止所有业务条件均未命中时流程悬空。',
  steps: '框架会等待各分支完成后再汇合结果。',
  并发预算: '需要结合连接池和下游限流能力设定。',
  失败策略: '决定部分成功时是否继续、回滚或补偿。',
  inputData: '提交前必须满足当前步骤或流程的输入契约。',
  state: '读取时应保持不可变并通过官方机制更新。',
  'options.concurrency': '用于保护数据库、模型与外部服务容量。',
  condition: '应保持无副作用并覆盖明确的终止边界。',
  '最大轮次/预算': '同时约束时间、令牌和外部调用费用。',
  '最大轮次/退避': '用于阻止无限轮询并保护下游服务。',
  'milliseconds | resolver': '到期后由持久化调度器唤醒当前 Run。',
  'options.resourceId': '用于执行状态的租户归属与访问控制。',
  'workflow version': '旧 Run 恢复时必须仍能找到该版本。',
  runId: '客户端依靠它查询状态、重连并关联日志。',
  提交幂等键: '网络重试时相同键必须复用原提交结果。',
  resumeData: '必须满足暂停步骤声明的恢复数据契约。',
  'options.step': '用于精确定位暂停、恢复或重放节点。',
  审批幂等键: '可防止用户重复点击触发两次副作用。',
  AbortSignal: '应继续传递给模型、工具和外部请求。',
  options: '调用前应核对快照状态与副作用安全性。',
  'options.inputData': '只用于从指定节点修正后续重放数据。',
  'abort/reconnect': '连接中断后依靠游标恢复未消费事件。',
  callback: '应快速返回并把慢处理移交有界队列。',
  幂等键: '相同键的重复请求应返回同一次执行结果。',
  'options.cursor': '服务端据此补发尚未确认的结构化事件。',
  'config.vector': '还必须与 embedder 和索引维度保持一致。',
  'options.model': '需要记录实际模型版本与本次令牌用量。',
  'options.instructions': '用于约束摘要重点、结构与遗漏处理。',
  resourceId: '必须由认证上下文确定而非信任客户端输入。',
  threadId: '读取或修改前必须再次校验资源归属。',
  title: '写入前应限制长度并清理不可见控制字符。',
  metadata: '只保存经 schema 筛选且允许持久化的字段。',
  page: '必须与每页上限和稳定排序规则一起使用。',
  orderBy: '还需加入唯一字段作为同值时的次排序键。',
  vectorSearchString: '会被编码为向量以寻找远期相关记忆。',
  'token/lastMessages': '共同控制连续性、相关性与模型上下文成本。',
  newThreadId: '重复克隆请求应复用该标识保证幂等。',
  instructions: '用于明确摘要的重点、结构和输出边界。',
  vectorStoreName: '服务端会用它定位已授权的向量适配器。',
  indexName: '必须与入库时使用的索引和模型版本匹配。',
  value: '发送模型前应完成大小限制和敏感数据审查。',
  maxRetries: '只应重试限流或网络抖动等瞬时错误。',
  abortSignal: '超时或用户取消时应立即停止上游请求。',
  values: '每一项都需要保留稳定 id 以便部分重试。',
  'options.strategy': '选择结果会直接影响块的语义完整性。',
  'options.maxSize': '需按 embedding 与检索上下文预算设定。',
  'options.overlap': '用于保留跨边界语义但会增加重复数据。',
  'tenantId/resourceId': '必须由服务端注入且不允许客户端覆盖。',
  业务字段: '实际操作符需由目标向量适配器支持。',
  threshold: '数值会直接影响图的连通度与噪声比例。',
  results: '应限制数量并保留原始分数与来源信息。',
  query: '会作为精排相关性的判断目标与审计依据。',
  'options.topK': '需要小于候选数量并符合上下文预算。',
  scorer: '应固定版本并记录评分理由与失败状态。',
  configs: '每个实例都应配置独立服务名与导出策略。',
  'config.serviceName': '会作为所有 trace 和指标的低基数维度。',
  'child.name': '用于在调用树中识别当前业务操作。',
  attributes: '只允许写入脱敏、低基数且有界的字段。',
  'config.name': '会出现在每条结构化日志的组件字段中。',
  'config.level': '生产通常按环境在启动时确定并保持稳定。',
  'redaction/transport': '决定敏感字段清理与日志最终发送位置。',
}

const parameter = (
  name: string,
  type: string,
  required: boolean,
  description: string,
  defaultValue?: string,
): FrameworkApiParameter => ({
  name,
  type,
  required,
  description: description.length >= 12 ? description : `${description}${parameterDescriptionDetails[name] ?? ''}`,
  ...(defaultValue === undefined ? {} : { defaultValue }),
})

const mastraLearningMetaBase = {
  Mastra: {
    learningLevel: 'core', runtime: 'server',
    parameters: [parameter('config.agents', 'Record<string, Agent>', false, '按稳定键名注册 Agent，供路由、Workflow 与 Studio 发现。'), parameter('config.workflows', 'Record<string, Workflow>', false, '注册已 commit 的 Workflow 定义。'), parameter('config.storage', 'MastraStorage', false, '生产环境的持久化适配器，承载恢复与记忆数据。'), parameter('config.observability', 'ObservabilityRegistryConfig', false, '配置 trace、指标与导出管线。')],
    expectedOutput: '返回应用级 Mastra 注册中心；启动后可按名字取得资源，并让各模块共享存储、日志和观测上下文。',
    errorCases: [{ condition: '注册键重复、资源 id 冲突或生产环境缺少持久化', handling: '在启动健康检查中枚举资源并验证唯一性；缺少关键依赖时拒绝接收流量。' }],
    relatedApis: ['Mastra.getAgent', 'Mastra.getWorkflow', 'Mastra.getStorage'],
  },
  'Mastra.addGateway': {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [parameter('gateway', 'MastraModelGateway', true, '要动态注册的模型网关；应具有稳定且唯一的 id。')],
    expectedOutput: '无返回值；网关随后能通过名称/id 查询并参与模型路由。',
    errorCases: [{ condition: '重复 id、网关未初始化或在流量期间热替换', handling: '注册放在启动阶段；先探活并以版本化配置原子切换，失败则保留旧网关。' }],
    relatedApis: ['Mastra.getGateway', 'Mastra.getGatewayById', 'Mastra.listGateways'],
  },
  'Mastra.getAgent': {
    learningLevel: 'core', runtime: 'server',
    parameters: [parameter('name', 'string', true, 'Mastra 配置对象中的注册键，不是 Agent.id。'), parameter('TAgent', 'generic', false, '用于保留具体 Agent 类型的泛型。'), parameter('授权上下文', 'RequestContext', false, '调用后续方法时仍需传递的请求级身份与租户信息。')],
    expectedOutput: '返回与注册键匹配的 Agent；适合代码内稳定依赖访问。',
    errorCases: [{ condition: '名字未注册或把 Agent.id 当成 name', handling: '启动时校验注册表；外部 id 查询改用 getAgentById，并显式处理 undefined。' }],
    relatedApis: ['Agent', 'Mastra.getAgentById', 'Mastra.listAgents'],
  },
  'Mastra.getAgentById': {
    learningLevel: 'reference', runtime: 'server',
    parameters: [parameter('id', 'string', true, 'Agent 构造配置中的稳定资源 id。')],
    expectedOutput: '找到时返回 Agent，否则返回 undefined。',
    errorCases: [{ condition: '外部 id 不存在、重复或当前租户无权使用', handling: '先做允许列表和租户校验；缺失返回受控 404，不要直接解引用。' }],
    relatedApis: ['Mastra.getAgent', 'Mastra.listAgents', 'Agent.getMetadata'],
  },
  'Mastra.getGateway': {
    learningLevel: 'reference', runtime: 'server',
    parameters: [parameter('name', 'string', true, '网关在 Mastra 配置中的注册键。')],
    expectedOutput: '返回指定模型网关实例。',
    errorCases: [{ condition: '键名错误或网关不可用', handling: '启动时检查目录并配置探活、熔断和已批准的降级网关。' }],
    relatedApis: ['Mastra.addGateway', 'Mastra.getGatewayById', 'Mastra.listGateways'],
  },
  'Mastra.getGatewayById': {
    learningLevel: 'reference', runtime: 'server',
    parameters: [parameter('id', 'string', true, '模型网关自身的稳定 id。')],
    expectedOutput: '返回匹配网关或 undefined。',
    errorCases: [{ condition: '未知或越权的网关 id', handling: '仅接受服务端允许列表中的 id；缺失时使用明确的受控回退而非任意供应商。' }],
    relatedApis: ['Mastra.getGateway', 'Mastra.addGateway', 'Mastra.listGateways'],
  },
  'Mastra.getLogger': {
    learningLevel: 'reference', runtime: 'server',
    parameters: [parameter('无显式参数', 'never', false, '读取当前全局 logger；请求关联字段应在写日志时附加。')],
    expectedOutput: '返回当前 IMastraLogger。',
    errorCases: [{ condition: '日志包含 prompt、密钥或个人信息', handling: '在 logger processor 中统一脱敏、截断并关联 traceId/runId。' }],
    relatedApis: ['Mastra.setLogger', 'PinoLogger', 'BaseSpan'],
  },
  'Mastra.getMemory': {
    learningLevel: 'core', runtime: 'server',
    parameters: [parameter('name', 'string', false, 'Memory 注册键；省略时尝试默认 Memory。'), parameter('threadId', 'string', false, '后续线程操作的会话边界，不由本方法消费。'), parameter('resourceId', 'string', false, '后续记忆操作必须携带的所有者/租户边界。')],
    expectedOutput: '返回指定或默认 Memory，未配置时为 undefined。',
    errorCases: [{ condition: 'Memory 未配置或调用方只用 threadId 隔离用户', handling: '生产启动时强制检查；每次线程/召回操作同时校验 resourceId。' }],
    relatedApis: ['Memory', 'Agent.getMemory', 'Mastra.listMemory'],
  },
  'Mastra.getScorer': {
    learningLevel: 'reference', runtime: 'server',
    parameters: [parameter('name', 'string', true, '评分器的注册键。')],
    expectedOutput: '返回可执行的 MastraScorer。',
    errorCases: [{ condition: '评分器不存在、版本漂移或模型裁判超时', handling: '固定 scorer 版本并记录理由；缺失/超时标为未评测，不得默认为通过。' }],
    relatedApis: ['Mastra.getScorerById', 'Mastra.listScorers', 'Agent.listScorers'],
  },
  'Mastra.getScorerById': {
    learningLevel: 'reference', runtime: 'server',
    parameters: [parameter('id', 'string', true, '评分器自身 id，常来自持久化评测配置。')],
    expectedOutput: '返回评分器或 undefined。',
    errorCases: [{ condition: '历史实验引用了已删除 scorer', handling: '保留版本化 scorer 目录；无法恢复时将实验标记为配置失效。' }],
    relatedApis: ['Mastra.getScorer', 'Mastra.listScorers', 'rerankWithScorer'],
  },
  'Mastra.getStorage': {
    learningLevel: 'core', runtime: 'server',
    parameters: [parameter('无显式参数', 'never', false, '读取当前 MastraStorage。'), parameter('连接健康', 'implicit', false, '返回实例不代表数据库连接一定健康。'), parameter('迁移版本', 'implicit', false, '调用方应另行检查 schema 与应用版本兼容。')],
    expectedOutput: '返回共享持久化适配器；未配置时为 undefined。',
    errorCases: [{ condition: '存储缺失、迁移落后或连接池耗尽', handling: 'readiness 检查失败即摘流；使用迁移锁、连接池指标和备份恢复演练。' }],
    relatedApis: ['Mastra.setStorage', 'Memory', 'Run'],
  },
  'Mastra.getTool': {
    learningLevel: 'core', runtime: 'server',
    parameters: [parameter('name', 'string', true, 'Tool 的注册键。'), parameter('input', 'unknown', false, '后续 execute 要通过 inputSchema 校验的业务输入。'), parameter('executionContext', 'ToolExecutionContext', false, '后续执行所需的身份、取消信号和 trace 上下文。')],
    expectedOutput: '返回 ToolAction；只代表已注册，不代表当前用户已获授权。',
    errorCases: [{ condition: '工具不存在、参数不合法或调用者无权限', handling: '先查允许列表，再执行 schema 校验与服务端授权；记录审计但裁剪敏感结果。' }],
    relatedApis: ['createTool', 'Mastra.getToolById', 'Mastra.listTools'],
  },
  'Mastra.getToolById': {
    learningLevel: 'reference', runtime: 'server',
    parameters: [parameter('id', 'string', true, 'Tool 自身 id，通常来自审批或任务记录。')],
    expectedOutput: '返回 ToolAction 或 undefined。',
    errorCases: [{ condition: '找得到工具但用户无执行权限', handling: '将资源发现与授权分开；执行前校验主体、租户、动作和输入范围。' }],
    relatedApis: ['Mastra.getTool', 'Mastra.listTools', 'createTool'],
  },
  'Mastra.getVector': {
    learningLevel: 'core', runtime: 'server',
    parameters: [parameter('name', 'string', true, '向量库注册键。'), parameter('indexName', 'string', false, '后续查询/写入使用的索引。'), parameter('tenantFilter', 'MetadataFilter', false, '后续检索必须由服务端加入的租户过滤。')],
    expectedOutput: '返回 MastraVector 适配器，用于索引、upsert、query 与 delete。',
    errorCases: [{ condition: '索引不存在、维度不一致或越权查询其他租户', handling: '启动时校验索引契约；模型升级建新索引并双读验证，过滤条件禁止客户端覆盖。' }],
    relatedApis: ['Mastra.listVectors', 'DatabaseConfig', 'MetadataFilter'],
  },
  'Mastra.getWorkflow': {
    learningLevel: 'core', runtime: 'server',
    parameters: [parameter('name', 'string', true, 'Workflow 在注册表中的键。'), parameter('inputData', 'unknown', false, '后续启动时由 inputSchema 校验的数据。'), parameter('resourceId', 'string', false, '创建 Run 时绑定的用户/租户资源。')],
    expectedOutput: '返回 Workflow 定义；需 createRun 后才能执行。',
    errorCases: [{ condition: '名字无效、流程未 commit 或输入版本不兼容', handling: '启动期校验流程图；为定义与输入 schema 版本化，旧 Run 用兼容代码恢复。' }],
    relatedApis: ['createWorkflow', 'Workflow.createRun', 'Mastra.listWorkflows'],
  },
  'Mastra.listAgents': {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('无显式参数', 'never', false, '枚举配置态 Agent 注册表。')],
    expectedOutput: '返回注册键到 Agent 的 Record。', errorCases: [{ condition: '把实例直接序列化给浏览器', handling: '映射为最小 DTO，仅暴露允许公开的 id、名称和描述。' }], relatedApis: ['Mastra.getAgent', 'Mastra.getAgentById', 'Agent.getDescription'],
  },
  'Mastra.listGateways': {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('无显式参数', 'never', false, '枚举配置态网关。')],
    expectedOutput: '返回注册键到模型网关的 Record。', errorCases: [{ condition: '响应泄露凭据或内部拓扑', handling: '仅输出经过筛选的状态与模型目录，不序列化实例。' }], relatedApis: ['Mastra.getGateway', 'Mastra.getGatewayById', 'Mastra.addGateway'],
  },
  'Mastra.listMemory': {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('无显式参数', 'never', false, '枚举 Memory 装配，不读取线程内容。')],
    expectedOutput: '返回注册键到 Memory 的 Record。', errorCases: [{ condition: '管理接口把 Memory 实例或跨租户内容暴露出去', handling: '只返回配置摘要，并对管理路由实施强认证与审计。' }], relatedApis: ['Mastra.getMemory', 'Memory', 'Agent.getMemory'],
  },
  'Mastra.listScorers': {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('无显式参数', 'never', false, '枚举已注册评分器。')],
    expectedOutput: '返回注册键到 MastraScorer 的 Record。', errorCases: [{ condition: '无差别运行全部模型型 scorer 导致超时或成本激增', handling: '按任务选择维度、采样运行并记录未执行原因。' }], relatedApis: ['Mastra.getScorer', 'Mastra.getScorerById', 'Agent.listScorers'],
  },
  'Mastra.listTools': {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('无显式参数', 'never', false, '枚举顶层注册 Tool，不代表请求态授权。')],
    expectedOutput: '返回注册键到 ToolAction 的 Record。', errorCases: [{ condition: '把所有工具无条件交给模型', handling: '按任务、主体和风险等级过滤为最小工具集，高风险动作加审批。' }], relatedApis: ['Mastra.getTool', 'Agent.getTools', 'Agent.listTools'],
  },
  'Mastra.listVectors': {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('无显式参数', 'never', false, '枚举向量后端注册表。')],
    expectedOutput: '返回注册键到 MastraVector 的 Record。', errorCases: [{ condition: '用户可任选其他租户的向量库', handling: '服务端根据租户路由，不接受原样的客户端 store 名。' }], relatedApis: ['Mastra.getVector', 'DatabaseConfig', 'createVectorQueryTool'],
  },
  'Mastra.listWorkflows': {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('无显式参数', 'never', false, '枚举已注册 Workflow 定义。')],
    expectedOutput: '返回注册键到 Workflow 的 Record。', errorCases: [{ condition: '客户端可启动任意 Workflow', handling: '目录展示与启动授权分离，并对每条流程校验输入、版本和副作用权限。' }], relatedApis: ['Mastra.getWorkflow', 'Workflow.createRun', 'createWorkflow'],
  },
  'Mastra.setLogger': {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('logger', 'IMastraLogger', true, '新的统一日志实现。')],
    expectedOutput: '无返回值；后续框架日志使用新实例。', errorCases: [{ condition: '请求处理中频繁切换或旧 logger 缓冲未 flush', handling: '只在启动/测试边界替换；切换前 drain，关闭时 await flush。' }], relatedApis: ['Mastra.getLogger', 'PinoLogger', 'DefaultObservabilityInstance'],
  },
  'Mastra.setStorage': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('storage', 'MastraStorage', true, '已初始化且 schema 就绪的新存储适配器。')],
    expectedOutput: '无返回值；后续模块通过 Mastra 使用新存储。', errorCases: [{ condition: '运行中切换导致旧 Run 快照留在另一后端', handling: '仅在启动期注入；迁移使用双写/停机窗口并演练旧 runId 的恢复。' }], relatedApis: ['Mastra.getStorage', 'Run', 'Memory'],
  },

  Agent: {
    learningLevel: 'core', runtime: 'server',
    parameters: [parameter('config.id', 'string', true, '稳定资源 id，用于追踪、治理和持久化引用。'), parameter('config.instructions', 'AgentInstructions | dynamic', true, '角色、目标、边界与输出约束；不是安全边界。'), parameter('config.model', 'MastraLanguageModel | dynamic', true, '实际执行模型或按请求解析的模型。'), parameter('config.tools', 'Record<string, ToolAction> | dynamic', false, '仅暴露当前任务最小必要工具集。')],
    expectedOutput: '返回可 generate、stream 或 network 的 Agent 实例。',
    errorCases: [{ condition: '动态配置串租户、工具权限过宽或循环不停止', handling: '以 requestContext 解析配置；execute 层再鉴权，并限制 maxSteps、时长和预算。' }],
    relatedApis: ['Agent.generate', 'Agent.stream', 'Agent.getTools'],
  },
  'Agent.generate': {
    learningLevel: 'core', runtime: 'server',
    parameters: [parameter('messages', 'string | Message[]', true, '用户输入或多轮消息。'), parameter('options.memory', '{ thread: string; resource: string }', false, '同时指定线程与资源，防止记忆串用户。'), parameter('options.maxSteps', 'number', false, '限制模型—工具往返次数。', '实现默认值'), parameter('options.abortSignal', 'AbortSignal', false, '传播客户端取消或服务端超时。')],
    expectedOutput: 'Promise<MastraModelOutput>，含 text、steps、toolCalls、toolResults、usage 与 finishReason。',
    errorCases: [{ condition: '模型超时、工具失败、达到步数上限或结构化输出不合法', handling: '分类错误并只重试幂等步骤；记录 finishReason/usage，返回可恢复状态而非伪造完整答案。' }],
    relatedApis: ['Agent.stream', 'Agent.getModel', 'Agent.getMemory'],
  },
  'Agent.stream': {
    learningLevel: 'core', runtime: 'both',
    parameters: [parameter('messages', 'string | Message[]', true, '本轮输入。'), parameter('options', 'AgentStreamOptions', false, '模型、工具、memory、processor 与输出配置。'), parameter('options.abortSignal', 'AbortSignal', false, '断线或用户停止时取消上游。')],
    expectedOutput: '返回包含 textStream/fullStream 与最终结果 Promise 的流式输出；服务端可转换为 Web Response。',
    errorCases: [{ condition: '中途断线、慢消费者或工具事件被误当纯文本丢弃', handling: '采用结构化事件协议、背压与取消；客户端按事件 id 去重并支持重新获取最终状态。' }],
    relatedApis: ['Agent.generate', 'Agent.streamUntilIdle', 'Workflow.stream'],
  },
  'Agent.streamUntilIdle': {
    learningLevel: 'advanced', runtime: 'both', parameters: [parameter('messages', 'string | Message[]', true, '启动 durable Agent 的输入。')],
    expectedOutput: '持续输出事件，直到当前可执行工作进入 idle/完成边界。', errorCases: [{ condition: '把 idle 误判为永久完成或连接无限占用', handling: '持久化任务状态；设置连接时限并允许后续信号再次唤醒。' }], relatedApis: ['Agent.stream', 'Agent.network', 'Run.startAsync'],
  },
  'Agent.getDefaultOptions': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('options.requestContext', 'RequestContext', false, '解析请求态动态配置的上下文。')],
    expectedOutput: '返回本次运行实际采用的默认选项。', errorCases: [{ condition: '把某租户解析结果全局缓存', handling: '按请求或安全缓存键解析，缓存键必须包含会影响配置的租户与版本。' }], relatedApis: ['Agent.getModel', 'Agent.getTools', 'Agent.getInstructions'],
  },
  'Agent.getDescription': {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('requestContext', 'RequestContext', false, '动态描述的请求上下文。')],
    expectedOutput: '返回 Agent 能力描述或 undefined。', errorCases: [{ condition: '描述过宽导致 Supervisor 误路由', handling: '明确能力、输入边界和反例，并用路由评测集回归。' }], relatedApis: ['Agent.network', 'Agent.getMetadata', 'Mastra.listAgents'],
  },
  'Agent.getInstructions': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('requestContext', 'RequestContext', false, '解析动态系统指令的上下文。')],
    expectedOutput: '返回当前请求解析后的 AgentInstructions。', errorCases: [{ condition: '敏感配置泄露或用户输入被拼入高权限指令', handling: '管理接口脱敏；隔离不可信内容，并以工具授权而非 prompt 承担安全。' }], relatedApis: ['Agent', 'Agent.getDefaultOptions', 'Agent.getTools'],
  },
  'Agent.getLLM': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('requestContext', 'RequestContext', false, '动态模型解析上下文。'), parameter('model', 'MastraLanguageModel', false, '本次显式覆盖的模型。')],
    expectedOutput: '返回已解析的底层 LLM 执行器。', errorCases: [{ condition: '直接调用 LLM 绕过 Agent memory、工具或 processor', handling: '业务优先使用 generate/stream；下沉调用时显式补齐 guardrail、trace 与取消。' }], relatedApis: ['Agent.getModel', 'Agent.generate', 'Agent.stream'],
  },
  'Agent.getMemory': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('requestContext', 'RequestContext', false, '解析动态 Memory 的请求上下文。')],
    expectedOutput: '返回本次请求的 Memory 或 undefined。', errorCases: [{ condition: '无 Memory 或跨租户复用动态实例', handling: '显式处理 undefined；缓存按租户隔离，线程调用同时校验 resourceId。' }], relatedApis: ['Memory', 'Mastra.getMemory', 'Memory.recall'],
  },
  'Agent.getMetadata': {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('无显式参数', 'never', false, '读取 Agent 的治理元数据。')],
    expectedOutput: '返回自由格式 metadata 或 undefined。', errorCases: [{ condition: '假设字段总存在或把密钥放入 metadata', handling: '用 schema 收窄公开字段，秘密放专用密钥存储。' }], relatedApis: ['Agent.getDescription', 'Mastra.getAgentById', 'Agent.listSkills'],
  },
  'Agent.getModel': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('requestContext', 'RequestContext', false, '模型路由的租户/任务上下文。'), parameter('model', 'MastraLanguageModel', false, '本次显式模型覆盖。')],
    expectedOutput: '返回本次实际使用的 MastraLanguageModel。', errorCases: [{ condition: '回退模型不支持 tools/structured output 或无法追溯费用变化', handling: '路由前做能力检查；记录最终 model id、路由原因与价格版本。' }], relatedApis: ['Agent.getLLM', 'Agent.generate', 'Mastra.getGateway'],
  },
  createSkill: {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('config.id', 'string', true, '技能稳定 id。'), parameter('config.description', 'string', true, '供发现/路由使用的能力边界。'), parameter('config.instructions', 'string', true, '按需加载的操作说明。')],
    expectedOutput: '返回可配置给 Agent 的 Skill。', errorCases: [{ condition: '描述误触发、文件过期或技能内工具越权', handling: '评测技能选择；版本化来源文件，工具执行仍做独立授权。' }], relatedApis: ['Agent.getSkill', 'Agent.listSkills', 'createTool'],
  },
  'Agent.getSkill': {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('id', 'string', true, '要查找的 Skill id。')],
    expectedOutput: '返回 Skill 或 undefined。', errorCases: [{ condition: '任意用户 id 可加载高权限技能', handling: '按 Agent、主体和租户做允许列表；缺失返回受控错误。' }], relatedApis: ['createSkill', 'Agent.listSkills', 'Agent.getTools'],
  },
  'Agent.getTools': {
    learningLevel: 'core', runtime: 'server',
    parameters: [parameter('requestContext', 'RequestContext', false, '解析当前主体和租户可用工具。'), parameter('policy', 'implicit authorization policy', false, '决定本次最小工具集的服务端策略。'), parameter('cacheScope', 'request | tenant-version', false, '若缓存动态工具结果，必须包含授权版本。')],
    expectedOutput: '返回请求态工具名到 ToolAction 的映射。',
    errorCases: [{ condition: '缓存串租户或只靠隐藏工具实现权限', handling: '每请求解析/安全分区缓存；Tool.execute 内再次授权并记录调用审计。' }],
    relatedApis: ['Agent.listTools', 'createTool', 'Mastra.listTools'],
  },
  'Agent.listScorers': {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('无显式参数', 'never', false, '枚举 Agent 配置态 scorer。')],
    expectedOutput: '返回 scorer 名到实例的映射。', errorCases: [{ condition: '误以为列出即会自动执行', handling: '验证实际评测调用链、采样率和阈值告警。' }], relatedApis: ['Mastra.listScorers', 'Mastra.getScorer', 'rerankWithScorer'],
  },
  'Agent.listSkills': {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('无显式参数', 'never', false, '枚举配置态技能目录。')],
    expectedOutput: '返回 Skill 映射。', errorCases: [{ condition: '把技能内部提示和文件暴露给客户端', handling: '公开接口只输出经过审核的 id 与描述。' }], relatedApis: ['createSkill', 'Agent.getSkill', 'Agent.getDescription'],
  },
  'Agent.listTools': {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('无显式参数', 'never', false, '读取静态配置态工具集。')],
    expectedOutput: '返回静态 ToolAction 映射。', errorCases: [{ condition: '把配置态目录当成当前请求授权结果', handling: '真正执行前改用 getTools 并在 execute 内二次鉴权。' }], relatedApis: ['Agent.getTools', 'Mastra.listTools', 'createTool'],
  },
  'Agent.listWorkflows': {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('无显式参数', 'never', false, '枚举该 Agent 可见的 Workflow 定义。')],
    expectedOutput: '返回 Workflow 映射。', errorCases: [{ condition: 'Agent 可启动包含高风险副作用的全部流程', handling: '按任务最小暴露，并在 createRun/start 路由再次授权。' }], relatedApis: ['Agent.network', 'Mastra.listWorkflows', 'Workflow.createRun'],
  },
  'Agent.network': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('messages', 'string | Message[]', true, 'Supervisor 要解决的开放任务。'), parameter('options.agents', 'Record<string, Agent>', false, '可委派的专长 Agent。'), parameter('options.maxSteps', 'number', true, '动态路由与调用的硬上限。')],
    expectedOutput: '返回多 Agent/Tool/Workflow 动态委派后的 NetworkResult。', errorCases: [{ condition: '路由循环、预算失控或子 Agent 错误级联', handling: '限制步骤、时间和 token；对每次委派建 span，并为可恢复任务保存中间状态。' }], relatedApis: ['Agent.getDescription', 'Agent.streamUntilIdle', 'Agent.listWorkflows'],
  },

  createTool: {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('config.id', 'string', true, '工具稳定 id。'), parameter('config.description', 'string', true, '告诉模型何时使用与何时不要使用。'), parameter('config.inputSchema', 'Schema<TInput>', true, '运行时校验模型生成的参数。'), parameter('config.execute', '(input, context) => Promise<TOutput>', true, '执行真实业务且承担鉴权、幂等与超时。')],
    expectedOutput: '返回类型化 ToolAction，可交给 Agent、Workflow 或 MCP。', errorCases: [{ condition: '输入通过 schema 但越权、重复执行或外部 API 挂起', handling: 'execute 内校验主体与资源；副作用用幂等键，传播 AbortSignal 并裁剪敏感错误。' }], relatedApis: ['Agent.getTools', 'Mastra.getTool', 'MCPServer'],
  },
  createVectorQueryTool: {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('config.id', 'string', true, '检索工具 id。'), parameter('config.vectorStoreName', 'string', true, 'Mastra 中的向量库注册键。'), parameter('config.indexName', 'string', true, '目标索引。'), parameter('config.model', 'EmbeddingModel', true, '必须与入库向量维度一致的 embedding 模型。')],
    expectedOutput: '返回把查询文本转为向量并检索相似文档的 ToolAction。', errorCases: [{ condition: '维度不匹配、无租户过滤或检索内容提示注入', handling: '固定索引契约；服务端注入 MetadataFilter，把召回文本作为不可信数据并保留来源。' }], relatedApis: ['embed', 'Mastra.getVector', 'MetadataFilter'],
  },
  createDocumentChunkerTool: {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('config.defaultStrategy', 'ChunkStrategy', false, '默认切块策略。'), parameter('config.defaultOptions', 'ChunkOptions', false, '默认块大小与 overlap。')],
    expectedOutput: '返回可由 Agent 调用、输出 DocumentChunk[] 的 ToolAction。', errorCases: [{ condition: '超大文件、解析炸弹或重复入库', handling: '限制字节/页数/耗时；用内容哈希和版本键保证幂等。' }], relatedApis: ['MDocument', 'MDocument.chunk', 'embedMany'],
  },
  createGraphRAGTool: {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('config.id', 'string', true, '图检索工具 id。'), parameter('config.graph', 'GraphRAG', true, '已构建/可查询的图实例。'), parameter('config.topK', 'number', false, '返回候选数。')],
    expectedOutput: '返回执行图增强检索的 ToolAction。', errorCases: [{ condition: '错误关系被放大或遍历过深导致延迟', handling: '保留来源、限制深度/topK，并用领域问题集评测图检索增益。' }], relatedApis: ['GraphRAG', 'createVectorQueryTool', 'rerank'],
  },
  MCPClient: {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('config.id', 'string', true, '客户端稳定 id。'), parameter('config.servers', 'Record<string, MCPServerConfig>', true, '远程 MCP Server 与 transport 配置。'), parameter('认证/超时', 'headers | authProvider | timeout', false, 'Host 侧身份、连接与取消策略。')],
    expectedOutput: '返回可发现远程 tools/resources/prompts 并管理连接的 MCPClient。', errorCases: [{ condition: '远端失信、连接中断、schema 变化或工具返回恶意内容', handling: '服务白名单、最小授权、超时重连与 schema 版本检查；所有远端内容按不可信输入处理。' }], relatedApis: ['MCPServer', 'createTool', 'Agent.getTools'],
  },
  MCPServer: {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('config.id', 'string', true, '服务身份 id。'), parameter('config.version', 'string', true, '供客户端协商与兼容治理的版本。'), parameter('config.tools', 'Record<string, ToolAction>', false, '明确允许发布的工具集合。'), parameter('transport/auth', 'MCP transport + auth policy', true, '连接协议与 Host 身份校验。')],
    expectedOutput: '返回可绑定 transport、发布 Mastra 能力的 MCP Server。', errorCases: [{ condition: '发布过多工具、未鉴权或副作用调用重复', handling: '能力允许列表与 Host 鉴权；危险调用审批、幂等和审计，异常转换为受控协议错误。' }], relatedApis: ['MCPClient', 'createTool', 'Mastra.listTools'],
  },

  createWorkflow: {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('config.id', 'string', true, '流程定义的稳定 id。'), parameter('config.inputSchema', 'Schema<TInput>', true, '启动数据契约。'), parameter('config.outputSchema', 'Schema<TOutput>', true, '成功结果契约。'), parameter('config.stateSchema', 'Schema<TState>', false, '跨步骤持久化的共享状态。')], expectedOutput: '返回 Workflow builder；连接步骤并 commit 后才可执行。', errorCases: [{ condition: 'schema 不兼容、忘记 commit 或升级破坏旧快照', handling: '构建期校验图；版本化流程/schema 并保留旧 Run 恢复代码。' }], relatedApis: ['createStep', 'Workflow.commit', 'Workflow.createRun'],
  },
  createStep: {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('config.id', 'string', true, '步骤稳定 id，快照恢复依赖它。'), parameter('config.inputSchema', 'Schema<TInput>', true, '步骤输入契约。'), parameter('config.outputSchema', 'Schema<TOutput>', true, '步骤输出契约。'), parameter('config.execute', 'StepExecute', true, '尽量幂等的执行函数。')], expectedOutput: '返回可复用 Step，也可从 Tool/Agent 包装步骤。', errorCases: [{ condition: '产生部分副作用后重试', handling: '用 runId+stepId 作为幂等键；不可逆动作提供补偿记录。' }], relatedApis: ['createWorkflow', 'Workflow.then', 'Run.restart'],
  },
  Run: {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('options.runId', 'string', false, '本次执行稳定标识，重试必须复用。'), parameter('options.resourceId', 'string', false, 'Run 所属用户/租户。'), parameter('持久化快照', 'MastraStorage', true, '长任务恢复依赖的存储。')], expectedOutput: 'createRun 返回独立 Run，承载执行状态、快照与控制方法。', errorCases: [{ condition: '同一 runId 对应不同输入或恢复他人 Run', handling: '绑定输入哈希和 resourceId；控制操作先授权。' }], relatedApis: ['Workflow.createRun', 'Run.start', 'Run.resume'],
  },
  WorkflowStateReader: {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('options.workflow', 'Workflow', true, '目标流程定义。'), parameter('options.runId', 'string', true, '要读取状态的运行。')], expectedOutput: '返回已持久化 Workflow state 的只读访问器。', errorCases: [{ condition: '读到过期快照或原地修改返回对象', handling: '展示版本/更新时间；更新走 Workflow 状态机制。' }], relatedApis: ['Run', 'Workflow.createRun', 'Run.timeTravel'],
  },
  'Workflow.then': {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('step', 'Step', true, '下一个顺序步骤。'), parameter('前序输出', 'PreviousStepOutput', true, '必须满足 step.inputSchema。'), parameter('步骤 id', 'string', true, '用于图校验、trace 和恢复。')], expectedOutput: '返回添加了确定性顺序边的 Workflow builder。', errorCases: [{ condition: 'schema 接不上或用全局变量传状态', handling: '用 schema/map 连接，避免不可恢复的进程内状态。' }], relatedApis: ['createStep', 'Workflow.map', 'Workflow.commit'],
  },
  'Workflow.branch': {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('branches', 'Array<[Condition, Step]>', true, '候选条件分支。'), parameter('condition', 'Condition', true, '确定、快速且无副作用的判断。'), parameter('default branch', 'Condition + Step', true, '无命中时的兜底路径。')], expectedOutput: '返回加入条件路由的 Workflow builder。', errorCases: [{ condition: '无分支命中、多分支歧义或输出无法汇合', handling: '提供默认分支并统一输出契约。' }], relatedApis: ['Workflow.then', 'Workflow.parallel', 'Workflow.commit'],
  },
  'Workflow.parallel': {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('steps', 'Step[]', true, '彼此无依赖的并行步骤。'), parameter('并发预算', 'number', true, '下游可承受峰值。'), parameter('失败策略', 'all | partial | compensate', true, '一支失败时的聚合语义。')], expectedOutput: '返回加入 fan-out/fan-in 节点的 builder。', errorCases: [{ condition: '并发放大或部分副作用已完成', handling: '限流；显式表达部分成功并补偿已完成动作。' }], relatedApis: ['Workflow.foreach', 'Workflow.branch', 'Run.cancel'],
  },
  'Workflow.map': {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('mapping', 'MappingConfig | function', true, '把数据塑形成下一步输入。'), parameter('inputData', 'unknown', true, '前序结果。'), parameter('state', 'WorkflowState', false, '只读共享状态。')], expectedOutput: '返回带纯数据转换节点的 builder。', errorCases: [{ condition: 'map 内执行网络请求或副作用', handling: '保持纯函数；外部工作建独立 Step。' }], relatedApis: ['Workflow.then', 'createStep', 'WorkflowStateReader'],
  },
  'Workflow.foreach': {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('step', 'Step', true, '逐项执行的步骤。'), parameter('options.concurrency', 'number', false, '最大并发数。', '实现默认值'), parameter('items', 'unknown[]', true, '必须匹配步骤输入的数组。')], expectedOutput: '返回受控 fan-out/fan-in builder 并汇集结果。', errorCases: [{ condition: '大数组压垮下游或部分项目重复执行', handling: '分批限流；每项使用稳定 id/幂等键。' }], relatedApis: ['Workflow.parallel', 'createStep', 'Run.restart'],
  },
  'Workflow.dowhile': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('step', 'Step', true, '至少执行一次的循环体。'), parameter('condition', 'Condition', true, '为 true 时继续。'), parameter('最大轮次/预算', 'number', true, '停止护栏。')], expectedOutput: '返回先执行后判断的循环 builder。', errorCases: [{ condition: '条件长期为 true', handling: '限制轮次、时长、token 和费用并记录退出原因。' }], relatedApis: ['Workflow.dountil', 'Workflow.sleep', 'Run.cancel'],
  },
  'Workflow.dountil': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('step', 'Step', true, '至少执行一次的循环体。'), parameter('condition', 'Condition', true, '为 true 时停止。'), parameter('最大轮次/退避', 'LoopPolicy', true, '失败出口与等待策略。')], expectedOutput: '返回重复直到达标的 builder。', errorCases: [{ condition: '永不达标或轮询风暴', handling: '最大轮次、指数退避和不可重试错误分类。' }], relatedApis: ['Workflow.dowhile', 'Workflow.sleep', 'Run.resume'],
  },
  'Workflow.sleep': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('milliseconds | resolver', 'number | DelayResolver', true, '相对等待时长。')], expectedOutput: '返回加入可持久化相对延迟的 builder。', errorCases: [{ condition: '延迟非法或重启后重复唤醒', handling: '钳制范围；持久化时间并用 runId+节点 id 去重。' }], relatedApis: ['Workflow.sleepUntil', 'Workflow.dountil', 'Run.cancel'],
  },
  'Workflow.sleepUntil': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('date | resolver', 'Date | DateResolver', true, '绝对唤醒时间，推荐 UTC。')], expectedOutput: '返回加入绝对时间等待的 builder。', errorCases: [{ condition: '时区错误或停机错过调度', handling: '存 UTC/ISO；恢复扫描补偿漏调度。' }], relatedApis: ['Workflow.sleep', 'Run.resume', 'Run.cancel'],
  },
  'Workflow.commit': {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('无显式参数', 'never', false, '冻结并校验流程图。'), parameter('图完整性', 'implicit', true, '边、步骤 id 与 schema 必须闭合。'), parameter('定义版本', 'implicit', true, '恢复旧 Run 的稳定版本。')], expectedOutput: '返回已提交、可创建 Run 的 Workflow。', errorCases: [{ condition: '图不闭合或旧定义被删除', handling: 'CI 契约测试；旧版本保留到相关 Run 终结。' }], relatedApis: ['createWorkflow', 'Workflow.createRun', 'Mastra.getWorkflow'],
  },
  'Workflow.createRun': {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('options.runId', 'string', false, '幂等与恢复关联键。'), parameter('options.resourceId', 'string', false, 'Run 所有者/租户。'), parameter('workflow version', 'implicit', true, '创建时绑定的定义版本。')], expectedOutput: '返回尚未开始的独立 Run。', errorCases: [{ condition: 'runId 冲突或资源越权', handling: '存输入哈希和 resourceId；冲突返回 409。' }], relatedApis: ['Run', 'Run.start', 'Run.startAsync'],
  },
  'Run.start': {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('inputData', 'WorkflowInput', true, '通过 inputSchema 的启动数据。'), parameter('超时', 'AbortSignal | deadline', false, '等待上限，不等同后台取消。'), parameter('幂等键', 'runId', true, '重复请求命中同一 Run。')], expectedOutput: '返回可能成功、失败、暂停或取消的 WorkflowResult。', errorCases: [{ condition: '假设必成功或超时后重复启动', handling: '穷举 status；超时后按 runId 查询。' }], relatedApis: ['Run.startAsync', 'Run.resume', 'Run.cancel'],
  },
  'Run.startAsync': {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('inputData', 'WorkflowInput', true, '后台任务输入。'), parameter('runId', 'string', true, '查询/订阅标识。'), parameter('提交幂等键', 'string', true, '防重复入队。')], expectedOutput: '快速返回 runId；最终结果另行查询或订阅。', errorCases: [{ condition: '已接受但未调度或重复入队', handling: '事务性 outbox/队列确认并持久化提交状态。' }], relatedApis: ['Run.start', 'Workflow.stream', 'Workflow.observeStream'],
  },
  'Run.resume': {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('resumeData', 'unknown', true, '暂停点的恢复输入。'), parameter('options.step', 'string', false, '目标步骤。'), parameter('审批幂等键', 'string', true, '防重复恢复。')], expectedOutput: '从快照继续并返回新 WorkflowResult。', errorCases: [{ condition: '非暂停态、越权或重复恢复', handling: '条件更新暂停记录并校验主体/幂等键。' }], relatedApis: ['Workflow.resumeStream', 'Run.restart', 'Workflow.createRun'],
  },
  'Run.cancel': {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('无显式参数', 'never', false, '取消当前 Run。'), parameter('AbortSignal', 'implicit', true, '步骤需协作响应。'), parameter('补偿策略', 'implicit', true, '已发生副作用不会自动回滚。')], expectedOutput: 'Promise<void>，表示取消已登记。', errorCases: [{ condition: '步骤忽略取消或副作用已提交', handling: '传播 signal；执行补偿，cancel 保持幂等。' }], relatedApis: ['Run.startAsync', 'Workflow.observeStream', 'Run.restart'],
  },
  'Run.restart': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('options', 'RestartOptions', false, '重启范围与选项。')], expectedOutput: '返回重新执行后的 WorkflowResult。', errorCases: [{ condition: '非幂等步骤再次产生副作用', handling: '检查执行账本；复用幂等键或先补偿。' }], relatedApis: ['Run.resume', 'Run.timeTravel', 'createStep'],
  },
  'Run.timeTravel': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('options.step', 'string', true, '历史重放起点。'), parameter('options.inputData', 'unknown', false, '纠正输入。')], expectedOutput: '从指定位置重放并返回 WorkflowResult。', errorCases: [{ condition: '重放副作用或定义不兼容', handling: '严格授权/dry-run；绑定定义版本并使副作用幂等。' }], relatedApis: ['Workflow.timeTravelStream', 'Run.restart', 'WorkflowStateReader'],
  },
  'Workflow.stream': {
    learningLevel: 'core', runtime: 'both', parameters: [parameter('inputData', 'WorkflowInput', true, '启动输入。'), parameter('runId', 'string', true, '事件关联标识。'), parameter('abort/reconnect', 'AbortSignal + cursor', false, '取消与续传。')], expectedOutput: '返回结构化 Workflow 事件流与最终状态。', errorCases: [{ condition: '断线误判停止、事件重复或乱序', handling: '运行与连接解耦；事件编号，重连补拉并去重。' }], relatedApis: ['Workflow.observeStream', 'Workflow.resumeStream', 'Run.startAsync'],
  },
  'Workflow.observeStream': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('callback', '(event) => void | Promise<void>', true, '旁路事件回调。')], expectedOutput: '返回 unsubscribe，不会重新启动 Run。', errorCases: [{ condition: '慢回调阻塞或忘记退订', handling: '有界队列隔离；finally 中退订。' }], relatedApis: ['Workflow.stream', 'Run.startAsync', 'BaseSpan'],
  },
  'Workflow.resumeStream': {
    learningLevel: 'advanced', runtime: 'both', parameters: [parameter('resumeData', 'unknown', true, '恢复数据。'), parameter('options.step', 'string', false, '目标步骤。'), parameter('幂等键', 'string', true, '恢复去重键。')], expectedOutput: '返回恢复后的结构化事件流。', errorCases: [{ condition: '断线后再次提交 resume', handling: '恢复与连接分离；返回同一 Run 并续传。' }], relatedApis: ['Run.resume', 'Workflow.stream', 'Workflow.observeStream'],
  },
  'Workflow.timeTravelStream': {
    learningLevel: 'advanced', runtime: 'both', parameters: [parameter('options.step', 'string', true, '重放起点。'), parameter('options.cursor', 'string', false, '续传位置。')], expectedOutput: '返回重放分支事件流。', errorCases: [{ condition: '原始与重放事件混淆或越权', handling: '标记 replayId/origin；严格授权并默认 dry-run。' }], relatedApis: ['Run.timeTravel', 'Workflow.stream', 'WorkflowStateReader'],
  },

  Memory: {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('config.storage', 'MastraStorage', true, '线程、消息和派生数据的持久化。'), parameter('config.vector', 'MastraVector', false, '语义召回的向量后端。'), parameter('config.embedder', 'EmbeddingModel', false, '必须与向量索引维度一致。'), parameter('config.options', 'MemoryOptions', false, '最近消息、语义召回和工作记忆策略。')], expectedOutput: '返回管理线程、消息、召回与上下文裁剪的 Memory。', errorCases: [{ condition: '进程重启丢记忆、跨租户召回或 embedding 维度漂移', handling: '生产持久化；所有查询绑定 resourceId，模型迁移建新索引。' }], relatedApis: ['Memory.createThread', 'Memory.recall', 'Agent.getMemory'],
  },
  ObservationalMemory: {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('config.model', 'MastraLanguageModel', true, 'Observer/Reflector 使用的模型。'), parameter('config.observation', 'ObservationOptions', true, '触发压缩的 token/消息阈值。'), parameter('反思策略', 'ReflectionOptions', false, '合并旧观察与纠错的策略。')], expectedOutput: '返回用观察笔记压缩长对话的记忆处理器。', errorCases: [{ condition: '摘要漂移、错误事实长期固化或成本失控', handling: '关键事实结构化存储；保留原文引用、版本并抽样评测压缩质量。' }], relatedApis: ['Memory', 'summarizeConversation', 'Memory.summarizeThread'],
  },
  summarizeConversation: {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('options.model', 'MastraLanguageModel', true, '执行总结的模型。'), parameter('options.messages', 'Message[]', true, '调用方已有的消息，不会自动读 Memory。'), parameter('options.instructions', 'string', false, '总结重点与格式。')], expectedOutput: '返回 summary、extracted、extractionFailures 与 usage；不会自动落库。', errorCases: [{ condition: '空消息、结构抽取失败或长对话截断', handling: '校验输入；分别展示 extractionFailures，并保存模型/提示版本与 usage。' }], relatedApis: ['Memory.summarizeThread', 'ObservationalMemory', 'Memory.recall'],
  },
  'Memory.createThread': {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('resourceId', 'string', true, '线程所有者或业务资源。'), parameter('threadId', 'string', false, '可选自定义会话 id。'), parameter('title', 'string', false, '列表展示标题。'), parameter('metadata', 'Record<string, unknown>', false, '非敏感业务元数据。')], expectedOutput: '返回包含 id、resourceId、时间和 metadata 的线程。', errorCases: [{ condition: 'threadId 冲突、可猜或 resourceId 来自未校验客户端', handling: '服务端生成/校验 id；从认证上下文确定 resourceId，冲突幂等返回已有线程。' }], relatedApis: ['Memory.getThreadById', 'Memory.listThreads', 'Agent.generate'],
  },
  'Memory.getThreadById': {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('threadId', 'string', true, '要读取的线程 id。'), parameter('当前 resourceId', 'string', true, '读取后必须比对的认证资源。'), parameter('include messages', 'never', false, '本方法只取线程记录，不自动返回全部消息。')], expectedOutput: '返回线程记录或 null。', errorCases: [{ condition: '知道 id 即可读取造成 IDOR', handling: '返回数据前比较 thread.resourceId 与认证主体；未授权按不存在处理。' }], relatedApis: ['Memory.createThread', 'Memory.listThreads', 'Memory.recall'],
  },
  'Memory.listThreads': {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('resourceId', 'string', true, '服务端确定的线程所有者过滤。'), parameter('page', 'number', false, '分页位置。', '0'), parameter('perPage', 'number', false, '每页数量，服务端设上限。'), parameter('orderBy', 'ThreadOrder', false, '稳定排序规则。')], expectedOutput: '返回指定 resource 的线程页与分页信息。', errorCases: [{ condition: '客户端覆盖 resourceId、超大页或排序不稳定', handling: 'resourceId 取自会话；限制 perPage 并加唯一 id 作为排序次键。' }], relatedApis: ['Memory.createThread', 'Memory.getThreadById', 'Memory.cloneThread'],
  },
  'Memory.recall': {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('threadId', 'string', true, '当前会话。'), parameter('resourceId', 'string', true, '资源/租户隔离。'), parameter('vectorSearchString', 'string', false, '语义召回查询。'), parameter('token/lastMessages', 'RecallOptions', false, '最近窗口与上下文预算。')], expectedOutput: '返回最近消息、语义相关历史与线程上下文。', errorCases: [{ condition: '跨租户向量召回、旧提示注入或上下文超预算', handling: '服务端 metadata 过滤；历史按不可信内容隔离，再按 token 预算裁剪。' }], relatedApis: ['Memory', 'MetadataFilter', 'Agent.generate'],
  },
  'Memory.deleteMessages': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('messageIds', 'string[]', true, '已验证归属的消息 id 列表。')], expectedOutput: 'Promise<void>；删除指定消息。', errorCases: [{ condition: '只删主表却遗留向量、摘要、缓存或备份', handling: '以删除任务追踪所有派生存储；记录 tombstone 并监控最终一致性。' }], relatedApis: ['Memory.getThreadById', 'Memory.recall', 'ObservationalMemory'],
  },
  'Memory.cloneThread': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('threadId', 'string', true, '源线程。'), parameter('newThreadId', 'string', false, '新分支 id。'), parameter('resourceId', 'string', true, '源/目标资源授权边界。')], expectedOutput: '返回新线程及复制结果，源线程保持不变。', errorCases: [{ condition: '克隆越权、复制敏感 metadata 或大线程超时', handling: '验证源归属；字段白名单、后台分批复制并用 newThreadId 幂等。' }], relatedApis: ['Memory.createThread', 'Memory.getThreadById', 'Memory.listThreads'],
  },
  'Memory.summarizeThread': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('threadId', 'string', true, '要从存储加载的线程。'), parameter('resourceId', 'string', true, '线程归属与授权。'), parameter('instructions', 'string', false, '总结目标。')], expectedOutput: '返回 summary、extracted、失败信息与 usage，不保证自动写回业务库。', errorCases: [{ condition: '越权总结、长线程截断或结果不可追溯', handling: '先校验归属；分层总结并保存模型/提示/消息范围版本。' }], relatedApis: ['summarizeConversation', 'ObservationalMemory', 'Memory.getThreadById'],
  },

  DatabaseConfig: {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('vectorStoreName', 'string', true, '已注册向量库名。'), parameter('indexName', 'string', true, '目标索引名。')], expectedOutput: '仅提供类型化知识库定位配置，不执行查询。', errorCases: [{ condition: '客户端任意覆盖 store/index 或环境配置漂移', handling: '服务端路由并在启动时探测索引；配置版本化。' }], relatedApis: ['Mastra.getVector', 'createVectorQueryTool', 'MetadataFilter'],
  },
  embed: {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('model', 'EmbeddingModel', true, '语义编码模型。'), parameter('value', 'string | Embeddable', true, '单条待编码内容。'), parameter('maxRetries', 'number', false, '瞬时错误重试上限。'), parameter('abortSignal', 'AbortSignal', false, '取消/超时信号。')], expectedOutput: '返回单个 embedding:number[] 与 usage 等信息。', errorCases: [{ condition: '限流、敏感文本外发或模型升级导致维度变化', handling: '指数退避且遵守 Retry-After；合规审查，新模型写新索引并重嵌入。' }], relatedApis: ['embedMany', 'Mastra.getVector', 'createVectorQueryTool'],
  },
  embedMany: {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('model', 'EmbeddingModel', true, '与索引维度一致的模型。'), parameter('values', 'Embeddable[]', true, '按顺序编码的批次。'), parameter('maxRetries', 'number', false, '批次重试上限。'), parameter('abortSignal', 'AbortSignal', false, '取消信号。')], expectedOutput: '返回与 values 顺序一致的 embeddings:number[][] 和 usage。', errorCases: [{ condition: '批次过大、部分失败或重试重复写入', handling: '自适应分批；保留 chunkId→位置映射，upsert 使用稳定 id。' }], relatedApis: ['embed', 'MDocument.chunk', 'Mastra.getVector'],
  },
  MDocument: {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('content', 'string | object', true, 'Text/HTML/Markdown/JSON 原文。'), parameter('metadata', 'Record<string, unknown>', false, '来源、版本、租户和权限标签。'), parameter('format constructor', 'fromText | fromHTML | fromMarkdown | fromJSON', true, '匹配真实文档格式的构造入口。')], expectedOutput: '返回统一文档对象，可读取、切块和提取 metadata。', errorCases: [{ condition: 'HTML 脚本、重复导航、敏感字段或来源丢失', handling: '解析前限大小并清洗；保留 source/version/hash 与权限标签。' }], relatedApis: ['MDocument.chunk', 'ExtractParams', 'embedMany'],
  },
  'MDocument.chunk': {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('options.strategy', 'ChunkStrategy', true, '按文档结构选切块策略。'), parameter('options.maxSize', 'number', true, '单块上限。'), parameter('options.overlap', 'number', false, '相邻上下文重叠。', '0')], expectedOutput: '返回继承 metadata 的 DocumentChunk[]。', errorCases: [{ condition: '块过碎、过大或 overlap 造成大量重复', handling: '用真实问答集评测召回；版本化切块配置，变更后重建向量。' }], relatedApis: ['MDocument', 'embedMany', 'createDocumentChunkerTool'],
  },
  ExtractParams: {
    learningLevel: 'reference', runtime: 'server', parameters: [parameter('title/summary/keywords/questions', 'boolean | ExtractionOption', false, '选择要生成的派生 metadata。')], expectedOutput: '仅定义提取配置；实际派生字段由文档提取流程产生。', errorCases: [{ condition: '模型生成 metadata 被当成原文事实或成本重复发生', handling: '标注 generated/source/version；按文档而非每块重复提取。' }], relatedApis: ['MDocument', 'MDocument.chunk', 'rerank'],
  },
  MetadataFilter: {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('tenantId/resourceId', 'FilterValue', true, '服务端强制的数据边界。'), parameter('业务字段', 'FilterOperator', false, '分类、时间与权限条件。'), parameter('适配器操作符', '$in | $eq | ...', true, '目标向量库实际支持的表达式。')], expectedOutput: '返回/表示传给向量查询的过滤表达式，不单独执行检索。', errorCases: [{ condition: '只在回答后过滤或适配器忽略不支持操作符', handling: '检索阶段服务端注入；集成测试生成 SQL/查询计划与越权样例。' }], relatedApis: ['Mastra.getVector', 'createVectorQueryTool', 'DatabaseConfig'],
  },
  GraphRAG: {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('dimension', 'number', false, '节点 embedding 维度。'), parameter('threshold', 'number', false, '相似度建边阈值。'), parameter('图更新策略', 'full | incremental', true, '文档变化时维持图一致性。')], expectedOutput: '返回可建图并查询 RankedNode[] 的 GraphRAG。', errorCases: [{ condition: '维度不符、噪声密图、孤立图或更新陈旧', handling: '校验维度；评测阈值/连通度并版本化重建或增量更新。' }], relatedApis: ['createGraphRAGTool', 'embedMany', 'rerank'],
  },
  rerank: {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('results', 'RetrievalResult[]', true, '第一阶段候选集。'), parameter('query', 'string', true, '用户问题。'), parameter('model', 'RerankModel', true, '精排模型。'), parameter('options.topK', 'number', false, '最终保留数。')], expectedOutput: '返回按新相关性排序/裁剪的 RerankedResult[]。', errorCases: [{ condition: '候选过多导致高延迟或精排服务失败', handling: '先控制召回 K；超时回退原排序并记录降级标志和原分数。' }], relatedApis: ['rerankWithScorer', 'createVectorQueryTool', 'GraphRAG'],
  },
  rerankWithScorer: {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('results', 'RetrievalResult[]', true, '候选文档。'), parameter('query', 'string', true, '业务问题。'), parameter('scorer', 'MastraScorer', true, '自定义相关性标准。'), parameter('options.topK', 'number', false, '返回数。')], expectedOutput: '返回带 scorer 分数并重排的候选。', errorCases: [{ condition: '逐条模型评分慢、某条失败或 scorer 版本漂移', handling: '限并发/批处理/缓存；保留失败项与 scorer 版本，禁止静默给满分。' }], relatedApis: ['rerank', 'Mastra.getScorer', 'Agent.listScorers'],
  },

  ObservabilityRegistryConfig: {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('configs', 'Record<string, ObservabilityInstanceConfig>', false, '命名观测实例。'), parameter('default', 'ObservabilityInstanceConfig', false, '默认 trace 管线。'), parameter('configSelector', 'function', false, '按请求选择实例的路由器。')], expectedOutput: '类型化 observability 注册配置；Mastra 据此创建/选择实例。', errorCases: [{ condition: 'selector 串租户、exporter 失败拖垮请求或默认记录敏感 prompt', handling: '请求开始固定选择；导出异步降级并统一采样、脱敏、保留期。' }], relatedApis: ['DefaultObservabilityInstance', 'BaseSpan', 'AutomaticMetrics'],
  },
  DefaultObservabilityInstance: {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('config.serviceName', 'string', true, '稳定服务名。'), parameter('config.exporters', 'Exporter[]', true, 'trace 导出目的地。'), parameter('config.processors', 'Processor[]', false, '导出前采样、脱敏与转换。')], expectedOutput: '返回可启动并在 shutdown 时 flush 的观测实例。', errorCases: [{ condition: 'exporter 阻塞、缓冲丢失或属性基数爆炸', handling: '有界异步队列与熔断；优雅关闭 flush，限制属性大小和基数。' }], relatedApis: ['ObservabilityRegistryConfig', 'BaseSpan', 'SpanFilter'],
  },
  BaseSpan: {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('child.name', 'string', true, '稳定低基数操作名。'), parameter('attributes', 'Record<string, primitive>', false, '脱敏且有界的诊断字段。'), parameter('end/error', 'SpanEndOptions', true, '结束时间、状态与受控错误信息。')], expectedOutput: '创建/更新/结束 Span，并由父子关系形成完整 Trace。', errorCases: [{ condition: '忘记 end、异步上下文丢失或记录高基数敏感字段', handling: 'finally 中 end；传播 tracing context，字段白名单与截断。' }], relatedApis: ['DefaultObservabilityInstance', 'SpanFilter', 'PinoLogger'],
  },
  SpanFilter: {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('span', 'ExportedSpan', true, '导出前待判断的 span。')], expectedOutput: '返回 boolean，决定该规则是否匹配/保留 span。', errorCases: [{ condition: '过滤掉错误/父 span 造成 trace 断裂', handling: '错误优先保留；测试父子完整性并监控过滤命中率。' }], relatedApis: ['BaseSpan', 'DefaultObservabilityInstance', 'AutomaticMetrics'],
  },
  PinoLogger: {
    learningLevel: 'core', runtime: 'server', parameters: [parameter('config.name', 'string', true, '日志服务/组件名。'), parameter('config.level', 'string', false, '最低日志级别。', 'info'), parameter('redaction/transport', 'Pino options', false, '脱敏规则与输出目的地。')], expectedOutput: '返回实现 Mastra logger 接口的结构化 PinoLogger。', errorCases: [{ condition: 'prompt/密钥泄露、日志注入或退出前未 flush', handling: '字段化写入与 redaction；限制原文，优雅关闭等待 drain。' }], relatedApis: ['Mastra.setLogger', 'Mastra.getLogger', 'BaseSpan'],
  },
  'Observability.addFeedback': {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('traceId', 'string', true, '反馈关联的 trace。'), parameter('spanId', 'string', false, '可选具体调用 span。'), parameter('feedback', 'FeedbackPayload', true, '来源、类型、值和受控评论。')], expectedOutput: 'Promise<void> 写入反馈；active implementation 不支持时能力可能缺失。', errorCases: [{ condition: '接口不存在、trace 越权、刷分或评论含个人信息', handling: '能力检测；验证 trace 归属、限频去重并脱敏评论。' }], relatedApis: ['ObservabilityRegistryConfig', 'BaseSpan', 'AutomaticMetrics'],
  },
  AutomaticMetrics: {
    learningLevel: 'advanced', runtime: 'server', parameters: [parameter('enabled', 'boolean', false, '是否从 trace 自动生成指标。', 'false'), parameter('metricOptions', 'AutomaticMetricOptions', false, '启用的延迟、错误、token/成本维度。')], expectedOutput: '配置生效后由观测管线产生聚合指标；类型本身无业务返回。', errorCases: [{ condition: '把 userId/runId/prompt 当 label 导致时序基数爆炸', handling: '标签允许列表；高基数信息留在 trace/log，监控 series 数量与费用。' }], relatedApis: ['ObservabilityRegistryConfig', 'DefaultObservabilityInstance', 'SpanFilter'],
  },
} satisfies Record<string, FrameworkApiLearningMeta>

const expectedOutputDetails: Partial<Record<keyof typeof mastraLearningMetaBase, string>> = {
  'Mastra.getGateway': '调用方随后可通过该实例发现模型并执行统一供应商路由。',
  'Mastra.getGatewayById': '未注册该资源 id 时结果保持 undefined，调用方必须显式处理缺失。',
  'Mastra.getLogger': '业务扩展可复用它写入与框架一致的结构化字段和输出通道。',
  'Mastra.getScorerById': '历史 id 已失效时返回 undefined，不会伪造一个默认评分器。',
  'Mastra.listGateways': '该目录主要用于服务端资源发现与启动完整性检查。',
  'Mastra.setLogger': '设置完成后，所有后续框架日志统一写入新的 logger 实例。',
  'Agent.getDefaultOptions': '结果已经结合当前 requestContext 解析，可用于本次 Agent 运行。',
  'Agent.getLLM': '该实例已经应用请求上下文和本次显式模型覆盖项。',
  'Agent.listScorers': '结果只表示 Agent 的静态评分能力目录，不代表已经执行评测。',
  'Agent.listSkills': '结果包含当前 Agent 已配置的技能标识与对应 Skill 实例。',
  'Agent.listTools': '结果反映定义阶段配置，不代表当前请求已经获得执行授权。',
  'Agent.listWorkflows': '结果包含当前 Agent 可以发现和委派的流程定义实例。',
  'Workflow.dountil': '其中循环体至少执行一次，并在条件首次变为 true 时退出。',
  'Workflow.createRun': '该实例已经绑定流程定义与资源身份，但尚未开始执行任何步骤。',
  'Workflow.resumeStream': '事件覆盖恢复后各步骤的开始、完成、暂停、错误与最终状态。',
  'Workflow.timeTravelStream': '每个事件都属于指定历史步骤创建的独立重放分支。',
  ObservationalMemory: '它通过 Observer 与 Reflector 的两阶段处理控制长会话上下文成本。',
  'Memory.getThreadById': '返回值仅包含线程记录而不自动附带完整消息列表。',
  'Memory.cloneThread': '原始线程内容和后续写入历史保持不变，新分支独立演进。',
}

const errorRecoveryDetails: Partial<Record<keyof typeof mastraLearningMetaBase, string>> = {
  'Workflow.branch': '同时为所有分支统一输出 schema，并用边界样例验证命中顺序。',
}

export const mastraLearningMeta: Record<string, FrameworkApiLearningMeta> = Object.fromEntries(
  Object.entries(mastraLearningMetaBase).map(([name, meta]) => [name, {
      ...meta,
      expectedOutput: meta.expectedOutput.length >= 20
        ? meta.expectedOutput
        : `${meta.expectedOutput}${expectedOutputDetails[name as keyof typeof mastraLearningMetaBase] ?? ''}`,
      errorCases: meta.errorCases.map(errorCase => ({
        ...errorCase,
        handling: errorCase.handling.length >= 16
          ? errorCase.handling
          : `${errorCase.handling}${errorRecoveryDetails[name as keyof typeof mastraLearningMetaBase] ?? ''}`,
      })),
    }]),
)

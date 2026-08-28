import type { FrameworkApiLearningMeta } from '../types'

/**
 * Structured learning metadata for the 31 MCP 2025-11-25 request and
 * notification methods documented by this catalog. Keys intentionally match
 * each FrameworkApiReference.name exactly.
 *
 * Runtime describes the side that initiates the protocol message:
 * - client: the MCP Host/Client sends it to an MCP Server;
 * - server: the MCP Server sends a reverse request/notification to the Client;
 * - both: either peer can send it, depending on which peer owns the operation.
 */
export const mcpLearningMeta = {
  initialize: {
    learningLevel: 'core', runtime: 'client',
    parameters: [
      { name: 'protocolVersion', type: 'string', required: true, description: '客户端希望使用的 MCP 协议版本；服务端会选择它支持的兼容版本并在结果中回传。' },
      { name: 'capabilities', type: 'ClientCapabilities', required: true, description: 'Host/Client 支持的 roots、sampling、elicitation、tasks 等反向能力及其子能力声明。' },
      { name: 'clientInfo', type: 'Implementation', required: true, description: '客户端实现的 name、version 和可选 title，供服务端诊断兼容性与展示连接来源。' },
    ],
    expectedOutput: 'InitializeResult，包含最终 protocolVersion、serverInfo、ServerCapabilities，以及可选的服务端 instructions；成功后客户端还必须发送 notifications/initialized。',
    errorCases: [
      { condition: '双方没有可共同使用的 protocolVersion', handling: '终止初始化并提示升级客户端或服务端，不能擅自按本地版本继续调用业务方法。' },
      { condition: '后续调用使用了未协商的 capability', handling: '将其视为协议错误；调用前同时检查客户端与服务端在 initialize 中声明的能力。' },
    ], relatedApis: ['notifications/initialized', 'ping', 'roots/list', 'sampling/createMessage', 'elicitation/create'],
  },
  'notifications/initialized': {
    learningLevel: 'advanced', runtime: 'client',
    parameters: [
      { name: '无参数', type: 'never', required: false, description: '这是纯生命周期通知；initialize 成功就是它唯一需要的前置状态，不允许携带业务参数。' },
    ],
    expectedOutput: '没有 JSON-RPC 响应；服务端收到后把当前连接从 initialization 阶段推进到 operation 阶段。',
    errorCases: [
      { condition: 'initialize 尚未成功或已经失败', handling: '不要发送该通知；关闭或重新初始化连接，不能跳过版本与能力协商。' },
      { condition: '错误地附加 JSON-RPC id 并等待响应', handling: '移除 id，把它作为 notification 发送；通知按协议不会返回 result。' },
    ], relatedApis: ['initialize', 'ping'],
  },
  ping: {
    learningLevel: 'reference', runtime: 'both',
    parameters: [
      { name: '无参数', type: 'never', required: false, description: 'ping 只检查 MCP 对端是否还能处理请求，不携带业务 payload。' },
    ],
    expectedOutput: '空的 JSON-RPC result；它只证明协议端点有响应，不证明模型、数据库、工具或资源都健康。',
    errorCases: [
      { condition: '请求超时、连接关闭或收到 JSON-RPC error', handling: '把会话视为不可用，取消依赖该会话的等待，并按传输策略重连和重新 initialize。' },
    ], relatedApis: ['initialize', 'notifications/cancelled'],
  },
  'notifications/cancelled': {
    learningLevel: 'advanced', runtime: 'both',
    parameters: [
      { name: 'requestId', type: 'RequestId', required: false, description: 'Schema 中是可选字段，但取消非 Task 请求时协议要求必须提供，并且只能引用同一方向、同一会话中先前发出的请求；Task 必须改用 tasks/cancel。' },
      { name: 'reason', type: 'string', required: false, description: '面向日志和用户的简短取消原因，不应包含密钥、原始文档或其他敏感数据。' },
    ],
    expectedOutput: '没有响应；接收方尽力停止与 requestId 关联的工作，但已经发生的外部副作用不会自动回滚。',
    errorCases: [
      { condition: 'requestId 不存在、已完成或属于其他会话', handling: '安全忽略或记录诊断信息，绝不能根据跨会话 id 取消其他用户的工作。' },
      { condition: '底层操作不支持立即取消', handling: '停止继续消费结果，并让副作用具备幂等、补偿和最终状态查询能力。' },
    ], relatedApis: ['ping', 'tasks/cancel', 'notifications/progress'],
  },
  'notifications/progress': {
    learningLevel: 'core', runtime: 'both',
    parameters: [
      { name: 'progressToken', type: 'ProgressToken', required: true, description: '调用方在原请求 _meta 中提供的关联令牌；执行方必须原样用于该请求的所有进度通知。' },
      { name: 'progress', type: 'number', required: true, description: '当前已完成的工作量；同一 token 的后续值应保持单调递增。' },
      { name: 'total', type: 'number', required: false, description: '已知的总工作量；省略时表示只能报告进展而无法计算确定百分比。' },
      { name: 'message', type: 'string', required: false, description: '可展示的阶段说明，例如“正在建立索引”；内容必须脱敏且限制长度。' },
    ],
    expectedOutput: '没有响应；接收方按 progressToken 更新对应请求的进度 UI 或 trace，最终结果仍由原始请求返回。',
    errorCases: [
      { condition: 'progressToken 未由原请求提供或无法匹配', handling: '忽略该通知并记录协议诊断，不能把它误关联到最近一个请求。' },
      { condition: 'progress 倒退、超过 total 或 total 语义中途改变', handling: '按最后可信值展示并标记异常；发送方应固定度量单位，重新分阶段时使用新的 token。' },
    ], relatedApis: ['notifications/cancelled', 'notifications/tasks/status', 'tasks/get'],
  },
  'logging/setLevel': {
    learningLevel: 'advanced', runtime: 'client',
    parameters: [
      { name: 'level', type: 'LoggingLevel', required: true, description: '服务端后续应发送的最低日志严重级别，例如 debug、info、warning、error。' },
    ],
    expectedOutput: '空结果；成功后只影响当前 MCP 会话的 notifications/message 过滤阈值，不会自动修改服务端其他日志系统。',
    errorCases: [
      { condition: '服务端没有在 initialize 中声明 logging capability', handling: '不要调用；客户端隐藏日志级别控制，并继续使用服务端默认行为。' },
      { condition: 'level 不是协议定义的 LoggingLevel', handling: '拒绝请求并让客户端回退到受支持枚举，不能把任意字符串映射成内部日志配置。' },
    ], relatedApis: ['notifications/message', 'initialize'],
  },
  'notifications/message': {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'level', type: 'LoggingLevel', required: true, description: '这条日志的严重级别，必须满足当前会话通过 logging/setLevel 设置的阈值。' },
      { name: 'logger', type: 'string', required: false, description: '可选的日志源名称，用于区分工具、解析器或服务模块。' },
      { name: 'data', type: 'unknown', required: true, description: 'JSON 可序列化的结构化日志内容；应使用稳定 code 和少量诊断字段而不是完整业务对象。' },
    ],
    expectedOutput: '没有响应；客户端可把日志展示在开发面板、写入结构化日志或关联到当前 trace，但不能把它当作业务结果。',
    errorCases: [
      { condition: 'data 包含 token、密码、个人信息或超大对象', handling: '服务端发送前按 allowlist 脱敏和裁剪；客户端仍需限制大小、频率与渲染方式。' },
      { condition: '日志风暴导致 UI 或传输拥塞', handling: '按 logger/code 聚合、采样或限速；重要业务失败仍应通过原请求 error/result 表达。' },
    ], relatedApis: ['logging/setLevel', 'notifications/progress'],
  },
  'completion/complete': {
    learningLevel: 'advanced', runtime: 'client',
    parameters: [
      { name: 'ref', type: 'PromptReference | ResourceTemplateReference', required: true, description: '要补全的 prompt 或 resource template 引用；类型和值共同确定候选的语义范围。' },
      { name: 'argument', type: 'CompletionArgument', required: true, description: '当前正在填写的参数 name 与尚未完成的 value 前缀。' },
      { name: 'context', type: 'CompletionContext', required: false, description: '同一模板中已经填写的其他 arguments，供服务端做依赖其他字段的候选过滤。' },
    ],
    expectedOutput: 'CompleteResult.completion，包含最多 100 个 values，以及可选 total 和 hasMore；它只返回候选，不会执行 prompt 或读取资源。',
    errorCases: [
      { condition: 'ref 不存在或 argument.name 不是该模板参数', handling: '返回明确的无效参数错误，客户端刷新 prompts/list 或 resources/templates/list 后再试。' },
      { condition: '候选包含当前用户无权看到的名称', handling: '服务端按当前会话身份过滤，不能因为它只是自动补全就绕过资源或 prompt 授权。' },
    ], relatedApis: ['prompts/list', 'prompts/get', 'resources/templates/list'],
  },
  'prompts/list': {
    learningLevel: 'advanced', runtime: 'client',
    parameters: [
      { name: 'cursor', type: 'Cursor', required: false, description: '上一页返回的 nextCursor；首次请求省略，后续必须原样传回而不能自行解析成页码。' },
    ],
    expectedOutput: 'ListPromptsResult，包含当前页 prompts 和可选 nextCursor；每项仅描述模板名称、参数与展示信息，不是最终 PromptMessage。',
    errorCases: [
      { condition: '服务端未声明 prompts capability', handling: '客户端不要调用，并隐藏依赖 prompt 目录的菜单或斜杠命令。' },
      { condition: 'cursor 失效或目录已在分页期间变化', handling: '从第一页重新同步，并以 prompt.name 原子替换本地缓存。' },
    ], relatedApis: ['prompts/get', 'notifications/prompts/list_changed', 'completion/complete'],
  },
  'prompts/get': {
    learningLevel: 'advanced', runtime: 'client',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'prompts/list 返回的稳定模板名，不应使用展示 title 代替。' },
      { name: 'arguments', type: 'Record<string, string>', required: false, description: '模板声明的参数名到字符串值的映射；服务端负责校验必填、长度和允许值。' },
    ],
    expectedOutput: 'GetPromptResult，含可选 description 与已实例化的 PromptMessage[]；消息可以包含文本、图片、音频或嵌入资源。',
    errorCases: [
      { condition: '模板不存在或必填 argument 缺失', handling: '刷新 prompts/list，并把服务端验证错误映射到具体表单字段，不能静默使用空值。' },
      { condition: '模板消息含不可信指令或超出模型上下文预算', handling: 'Host 在交给模型前展示来源、做内容策略检查并限制大小；MCP server 不是天然可信提示源。' },
    ], relatedApis: ['prompts/list', 'completion/complete', 'notifications/prompts/list_changed'],
  },
  'resources/list': {
    learningLevel: 'advanced', runtime: 'client',
    parameters: [
      { name: 'cursor', type: 'Cursor', required: false, description: '用于读取下一页具体资源的 opaque cursor；首次请求省略。' },
    ],
    expectedOutput: 'ListResourcesResult，包含 Resource[] 和可选 nextCursor；资源项提供 URI 与元数据，但不包含资源正文。',
    errorCases: [
      { condition: '服务端没有声明 resources capability', handling: '客户端禁用资源浏览，不要用 tools/list 或任意 URL 抓取来冒充 Resources。' },
      { condition: '目录很大、分页被忽略或跨租户资源被混入', handling: '完整处理 nextCursor，并让服务端在列举阶段就按当前身份过滤。' },
    ], relatedApis: ['resources/read', 'resources/templates/list', 'notifications/resources/list_changed'],
  },
  'resources/templates/list': {
    learningLevel: 'advanced', runtime: 'client',
    parameters: [
      { name: 'cursor', type: 'Cursor', required: false, description: '动态资源模板目录的下一页游标；它是 opaque token，不是模板变量。' },
    ],
    expectedOutput: 'ListResourceTemplatesResult，包含 uriTemplate、name 和展示元数据，以及可选 nextCursor；不会枚举模板可生成的所有 URI。',
    errorCases: [
      { condition: '客户端把模板变量直接拼入文件路径、URL 或查询', handling: '使用 URI Template 解析器规范化，再在服务端检查 scheme、根目录、目标域和租户权限。' },
      { condition: '游标过期或模板目录发生变化', handling: '丢弃旧分页结果并从首页重取，避免混合两个版本的模板目录。' },
    ], relatedApis: ['resources/list', 'resources/read', 'completion/complete'],
  },
  'resources/read': {
    learningLevel: 'advanced', runtime: 'client',
    parameters: [
      { name: 'uri', type: 'string', required: true, description: 'resources/list 返回或由受控模板生成的资源 URI；URI 只负责寻址，不代表调用者已经获得权限。' },
    ],
    expectedOutput: 'ReadResourceResult.contents，数组元素为带 uri/mimeType 的 TextResourceContents 或 base64 BlobResourceContents。',
    errorCases: [
      { condition: 'URI 越过授权 roots、触发 SSRF 或指向敏感资源', handling: '服务端规范化 URI、限制 scheme/host/path 并按当前身份授权；Host 也应在送入模型前二次确认。' },
      { condition: '资源过大、二进制解码膨胀或 MIME 类型不受支持', handling: '在读取和解码前设置字节上限，返回引用、分页或摘要，而不是把全部内容放进上下文。' },
    ], relatedApis: ['resources/list', 'resources/templates/list', 'resources/subscribe', 'notifications/resources/updated'],
  },
  'resources/subscribe': {
    learningLevel: 'reference', runtime: 'client',
    parameters: [
      { name: 'uri', type: 'string', required: true, description: '要监听的具体资源 URI；必须已经通过当前会话的资源授权，并且服务端声明 subscribe 支持。' },
    ],
    expectedOutput: '空结果；之后内容变化由 notifications/resources/updated 发出失效信号，客户端需要再次 resources/read 才能取得新内容。',
    errorCases: [
      { condition: '服务端未声明 resources.subscribe 或 URI 不可订阅', handling: '回退到按需读取或有预算的轮询，不要假设所有资源都支持实时更新。' },
      { condition: '断线重连或租户切换后订阅状态丢失', handling: '重连并重新 initialize 后按当前授权恢复必要订阅，先清理旧租户 URI。' },
    ], relatedApis: ['resources/unsubscribe', 'resources/read', 'notifications/resources/updated'],
  },
  'resources/unsubscribe': {
    learningLevel: 'reference', runtime: 'client',
    parameters: [
      { name: 'uri', type: 'string', required: true, description: '先前由当前会话成功订阅的资源 URI。' },
    ],
    expectedOutput: '空结果；服务端停止向当前客户端发送该 URI 的 notifications/resources/updated。',
    errorCases: [
      { condition: 'URI 从未订阅或订阅已因断线消失', handling: '把取消设计为幂等清理；客户端移除本地状态，不应无限重试。' },
      { condition: '页面销毁或身份切换时遗漏取消', handling: '在作用域清理函数和会话关闭路径统一 unsubscribe，防止重复通知和跨身份缓存。' },
    ], relatedApis: ['resources/subscribe', 'notifications/resources/updated'],
  },
  'tools/list': {
    learningLevel: 'advanced', runtime: 'client',
    parameters: [
      { name: 'cursor', type: 'Cursor', required: false, description: '下一页工具目录游标；首次省略，后续使用前页 nextCursor。' },
    ],
    expectedOutput: 'ListToolsResult，包含 Tool[] 和可选 nextCursor；每个 Tool 提供 name、description、inputSchema，以及可选 outputSchema、annotations、execution。',
    errorCases: [
      { condition: '服务端未声明 tools capability', handling: '不要调用或把空目录解释为故障；客户端应禁用该 Server 的模型工具能力。' },
      { condition: '工具缓存已过期仍把旧 schema 交给模型', handling: '收到 notifications/tools/list_changed 后重新分页读取，并在一次模型请求内原子替换工具集合。' },
    ], relatedApis: ['tools/call', 'notifications/tools/list_changed', 'initialize'],
  },
  'tools/call': {
    learningLevel: 'core', runtime: 'client',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'tools/list 返回的稳定工具名；调用前还要确认该工具对当前用户可见且允许执行。' },
      { name: 'arguments', type: 'Record<string, unknown>', required: false, defaultValue: '{}', description: '符合 Tool.inputSchema 的参数；服务端必须再次执行结构校验和业务授权。' },
      { name: 'task', type: 'TaskMetadata', required: false, description: '请求把支持 taskSupport 的长工具调用转为持久任务；未声明任务能力时不能发送。' },
    ],
    expectedOutput: '同步时返回 CallToolResult.content、可选 structuredContent 和 isError；任务增强时返回 CreateTaskResult，后续用 tasks/get 与 tasks/result。',
    errorCases: [
      { condition: '工具不存在、参数不符合 inputSchema 或当前身份无权限', handling: '分别返回可诊断的工具/参数/授权错误；绝不能信任 arguments 中的 userId、tenantId 代替会话身份。' },
      { condition: '工具业务执行失败但 JSON-RPC 传输正常', handling: '用 CallToolResult.isError 和安全的 content 表达工具级失败；协议/传输错误才使用 JSON-RPC error。' },
      { condition: '写操作重试造成重复副作用', handling: '使用服务端幂等键、确认步骤和补偿机制；取消信号也不能代替事务设计。' },
    ], relatedApis: ['tools/list', 'tasks/get', 'tasks/result', 'tasks/cancel', 'notifications/cancelled'],
  },
  'roots/list': {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: '无参数', type: 'never', required: false, description: 'Server 请求 Client 返回 Host 当前允许暴露的根目录列表；过滤依据来自 Host 状态而不是请求参数。' },
    ],
    expectedOutput: 'ListRootsResult.roots，每项包含 file:// URI、可选 name 与 metadata；它是工作范围提示，不包含文件内容，也不是操作系统权限授予。',
    errorCases: [
      { condition: '客户端未声明 roots capability', handling: 'Server 不得调用，并采用显式配置或拒绝需要文件范围的功能。' },
      { condition: 'Root 包含整个主目录、符号链接逃逸或已经被撤销', handling: 'Host 只返回用户选择的最小范围；Server 规范化真实路径并响应 notifications/roots/list_changed。' },
    ], relatedApis: ['notifications/roots/list_changed', 'resources/read', 'initialize'],
  },
  'sampling/createMessage': {
    learningLevel: 'core', runtime: 'server',
    parameters: [
      { name: 'messages', type: 'SamplingMessage[]', required: true, description: 'Server 希望 Host 交给模型的对话消息；Host 可以审查、修改或拒绝敏感内容。' },
      { name: 'maxTokens', type: 'number', required: true, description: '本次反向模型生成允许的最大输出 token 数，是 Host 成本和资源策略的上限输入。' },
      { name: 'modelPreferences', type: 'ModelPreferences', required: false, description: 'Server 对 cost、speed、intelligence 和模型 hints 的偏好；最终模型选择权仍属于 Host。' },
      { name: 'systemPrompt', type: 'string', required: false, description: '建议的系统指令；Host 必须把它视为来自外部 Server 的不可信输入。' },
      { name: 'includeContext', type: '"none" | "thisServer" | "allServers"', required: false, defaultValue: '"none"', description: '请求 Host 是否附加 MCP 上下文；thisServer/allServers 已软弃用，只有 Client 声明 sampling.context 时才可请求，Server 应优先省略并使用 none。' },
      { name: 'temperature', type: 'number', required: false, description: '建议的采样随机度，具体取值和支持程度由 Host 选定的模型决定。' },
      { name: 'stopSequences', type: 'string[]', required: false, description: '建议的停止序列；Host/Provider 可能不支持或有数量限制。' },
      { name: 'metadata', type: 'object', required: false, description: 'Server 希望随采样传递的附加元数据；Host 应按 allowlist 接受，不能把它当授权或模型配置的可信来源。' },
      { name: 'tools / toolChoice', type: 'Tool[] / ToolChoice', required: false, description: '允许此次 sampling 使用的受控工具及选择策略；Host 必须重新授权每个工具。' },
      { name: 'task', type: 'TaskMetadata', required: false, description: '请求 task-augmented execution；只有 Client 在 sampling capability 中声明该请求类型支持 Tasks 时才能使用。' },
    ],
    expectedOutput: '普通分支返回 CreateMessageResult（model、assistant role、content、可选 stopReason）；协商 Tasks 且传 task 时先返回 CreateTaskResult，最终生成结果通过 tasks/result 获取。Server 不会获得 Host 的模型密钥。',
    errorCases: [
      { condition: 'Client 未声明 sampling capability或用户拒绝本次推理', handling: 'Server 使用不依赖 sampling 的降级路径，并把拒绝视为正常控制结果而不是反复重试。' },
      { condition: 'Server 请求敏感上下文、过高 maxTokens 或未经授权的 tools', handling: 'Host 展示并裁剪请求、应用成本与数据策略，必要时直接拒绝。' },
      { condition: '模型请求超时、拒答或返回不支持的内容类型', handling: '返回受控错误；Server 不得把失败结果伪装成可信业务事实。' },
      { condition: '请求带 task，但 Client 未声明 tasks.requests.sampling.createMessage', handling: '不得发送任务增强参数；改用普通 sampling 或其它已协商的异步工作流。' },
    ], relatedApis: ['initialize', 'elicitation/create', 'tools/list', 'tasks/get', 'tasks/result', 'notifications/cancelled'],
  },
  'elicitation/create': {
    learningLevel: 'core', runtime: 'server',
    parameters: [
      { name: 'mode', type: '"form" | "url"', required: false, defaultValue: '"form"', description: 'form 分支可以省略 mode；url 分支必须显式为 "url"。它决定由 Host 渲染结构化表单，还是让用户前往受控外部 URL。' },
      { name: 'message', type: 'string', required: true, description: 'Host 展示给用户的请求原因，必须清楚说明需要什么和为何需要。' },
      { name: 'requestedSchema', type: 'ElicitRequestFormParams.requestedSchema', required: false, description: 'form 模式的受限 JSON Schema；仅描述允许的人机输入字段，不能索取密码或长期密钥。' },
      { name: 'url', type: 'string', required: false, description: 'url 模式的外部地址；Host 必须验证 scheme、域名、展示来源并防止开放重定向。' },
      { name: 'elicitationId', type: 'string', required: false, description: 'url 模式一次性交互标识，用于 notifications/elicitation/complete 关联原流程。' },
      { name: 'task', type: 'TaskMetadata', required: false, description: '把支持任务增强的 elicitation 转成持久任务，供长时间人工交互后恢复。' },
    ],
    expectedOutput: 'form 模式返回 ElicitResult，action 为 accept、decline 或 cancel，接受时带经 Host 收集的 content；任务增强可先返回 CreateTaskResult。',
    errorCases: [
      { condition: 'form schema 使用不支持的结构或试图收集密码、token', handling: 'Host 拒绝渲染并说明安全限制；敏感认证改用受控 URL/OAuth 流程。' },
      { condition: 'URL 域名不可信、elicitationId 重放或客户端单方面声称成功', handling: 'Host 展示真实域名；Server 通过自己的安全回调核验事实，并让 id 短期、一次性、绑定会话。' },
      { condition: '用户 decline 或 cancel', handling: '把它作为显式业务分支，不应自动重试或换一种方式绕过用户决定。' },
    ], relatedApis: ['notifications/elicitation/complete', 'sampling/createMessage', 'tasks/get', 'tasks/result'],
  },
  'tasks/get': {
    learningLevel: 'advanced', runtime: 'both',
    parameters: [
      { name: 'taskId', type: 'string', required: true, description: 'CreateTaskResult 返回的持久任务标识；必须绑定创建它的身份、会话或租户。' },
    ],
    expectedOutput: 'GetTaskResult 中的 Task 快照，包含 status、statusMessage、createdAt、lastUpdatedAt、ttl 和可选 pollInterval；不携带最终业务 payload。',
    errorCases: [
      { condition: 'taskId 不存在、已过 ttl 或调用方无权访问', handling: '区分过期与未授权但避免泄露其他租户任务是否存在；应用应保留自己的业务状态。' },
      { condition: '客户端忽略 pollInterval 高频轮询', handling: '至少等待服务端建议间隔并使用退避；同时监听 notifications/tasks/status 改善实时性。' },
    ], relatedApis: ['tasks/result', 'tasks/list', 'tasks/cancel', 'notifications/tasks/status'],
  },
  'tasks/result': {
    learningLevel: 'advanced', runtime: 'both',
    parameters: [
      { name: 'taskId', type: 'string', required: true, description: '当前调用方有权访问的任务标识；无需先等到 terminal，非 terminal 时 tasks/result 会阻塞。input_required 时调用方应主动调用它以接收关联消息。' },
    ],
    expectedOutput: '到达 terminal 后，返回原始 tools/call、sampling/createMessage 或 elicitation/create 本应产生的成功 result 或 JSON-RPC error；working/input_required 时响应必须阻塞。',
    errorCases: [
      { condition: '任务仍是 working', handling: '保持 tasks/result 等待；若没有主动阻塞等待，可并行按 pollInterval 调用 tasks/get 观察状态。' },
      { condition: '任务进入 input_required', handling: '主动调用或保持 tasks/result 流，以接收带 io.modelcontextprotocol/related-task 的输入请求；完成输入后继续等待 terminal。' },
      { condition: '结果已超过 ttl 被删除或 payload 太大', handling: '在完成后及时领取并持久化真正业务事实；大结果使用资源引用而不是无限内嵌。' },
    ], relatedApis: ['tasks/get', 'notifications/tasks/status', 'tools/call', 'sampling/createMessage', 'elicitation/create'],
  },
  'tasks/list': {
    learningLevel: 'reference', runtime: 'both',
    parameters: [
      { name: 'cursor', type: 'Cursor', required: false, description: '当前可见任务目录的下一页游标；首次省略，后续按 nextCursor 分页。' },
    ],
    expectedOutput: 'ListTasksResult，包含当前授权范围内的 Task[] 和可选 nextCursor；任务记录用于恢复协议工作，不是长期业务审计库。',
    errorCases: [
      { condition: '未协商 tasks.list 或实现方不支持任务列举', handling: '回退到保存已创建 taskId 并逐个 tasks/get，不要假设任务一定可全量发现。' },
      { condition: '任务列表跨用户或租户泄露', handling: '执行方在分页前按可信身份过滤；调用方不能通过 cursor 绕过作用域。' },
    ], relatedApis: ['tasks/get', 'tasks/result', 'notifications/tasks/status'],
  },
  'tasks/cancel': {
    learningLevel: 'advanced', runtime: 'both',
    parameters: [
      { name: 'taskId', type: 'string', required: true, description: '仍处于可取消状态且当前调用方拥有取消权限的持久任务 id。' },
    ],
    expectedOutput: 'CancelTaskResult，包含 status 已为 cancelled 的 Task 快照；接收方必须在发送响应前完成该状态转换，已发生副作用仍不会自动回滚。',
    errorCases: [
      { condition: '任务已经 completed、failed 或 cancelled', handling: '接收方必须以 -32602（Invalid params）拒绝，调用方随后用 tasks/get 收敛权威状态。' },
      { condition: '取消执行底层作业失败，或取消与完成竞争', handling: '协议状态仍必须在响应前转为 cancelled 且以后不可再变化；底层继续发生的副作用用幂等/补偿治理。' },
    ], relatedApis: ['tasks/get', 'notifications/tasks/status', 'notifications/cancelled'],
  },
  'notifications/tasks/status': {
    learningLevel: 'core', runtime: 'both',
    parameters: [
      { name: 'taskId', type: 'string', required: true, description: '状态发生变化的任务标识，接收方用它定位本地任务记录。' },
      { name: 'status', type: 'TaskStatus', required: true, description: 'working、input_required、completed、failed 或 cancelled 等当前状态。' },
      { name: 'statusMessage', type: 'string', required: false, description: '可展示的阶段或失败摘要，必须脱敏且不能替代结构化状态。' },
      { name: 'createdAt', type: 'string (ISO 8601)', required: true, description: '任务创建时间，用于诊断生命周期而不是决定通知新旧。' },
      { name: 'lastUpdatedAt', type: 'string (ISO 8601)', required: true, description: '本次快照的更新时间；客户端用它忽略重复或乱序的旧通知。' },
      { name: 'ttl', type: 'number | null', required: true, description: '任务从创建时起的实际保留时长（毫秒）；null 表示无限保留，不是每次通知时重新计算的剩余时间。' },
      { name: 'pollInterval', type: 'number', required: false, description: '即使已有通知，断线恢复时再次 tasks/get 建议遵守的最小轮询间隔。' },
    ],
    expectedOutput: '没有响应；客户端更新任务状态，但 terminal 任务的最终业务 payload 仍必须通过 tasks/result 获取。',
    errorCases: [
      { condition: '通知重复、乱序或在断线期间丢失', handling: '按 taskId 和 lastUpdatedAt 幂等收敛；重连后调用 tasks/get 获取权威快照。' },
      { condition: '收到未知 taskId 或跨身份任务通知', handling: '不创建可见业务记录，先验证当前会话归属并记录安全诊断。' },
    ], relatedApis: ['tasks/get', 'tasks/result', 'tasks/cancel', 'notifications/progress'],
  },
  'notifications/prompts/list_changed': {
    learningLevel: 'reference', runtime: 'server',
    parameters: [
      { name: '无参数', type: 'never', required: false, description: '它只使 prompt 目录缓存失效；新目录内容必须重新请求 prompts/list。' },
    ],
    expectedOutput: '没有响应；客户端对 prompt 目录做去抖刷新，并用新的分页结果原子替换旧缓存。',
    errorCases: [
      { condition: '服务端未声明 prompts.listChanged', handling: '不要发送；能力协商必须先于目录变化通知。' },
      { condition: '短时间连续变化造成刷新风暴', handling: '客户端合并通知并从第一页重取，避免并发分页结果相互覆盖。' },
    ], relatedApis: ['prompts/list', 'prompts/get'],
  },
  'notifications/resources/list_changed': {
    learningLevel: 'reference', runtime: 'server',
    parameters: [
      { name: '无参数', type: 'never', required: false, description: '表示可发现资源目录的成员或元数据变化，不表示某个已订阅资源正文变化。' },
    ],
    expectedOutput: '没有响应；客户端重新调用 resources/list 获取权威目录，旧 cursor 应视为可能失效。',
    errorCases: [
      { condition: '把每次资源内容修改都发送成 list_changed', handling: '目录成员/元数据变化才用本通知；已订阅 URI 的内容变化使用 notifications/resources/updated。' },
      { condition: '服务端未声明 resources.listChanged', handling: '不要发送；客户端应依赖显式刷新或其他已协商机制。' },
    ], relatedApis: ['resources/list', 'notifications/resources/updated'],
  },
  'notifications/resources/updated': {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'uri', type: 'string', required: true, description: '已经由该客户端 resources/subscribe 的具体资源 URI；通知只声明它已失效。' },
    ],
    expectedOutput: '没有响应且不包含新正文；客户端按需调用 resources/read 取得新版本，并合并短时间内重复更新。',
    errorCases: [
      { condition: '向未订阅客户端发送或 URI 已被撤权', handling: '服务端按会话订阅表过滤；客户端收到后仍需重新授权才能读取。' },
      { condition: '更新频率很高导致读取循环', handling: '客户端去抖并只保留最新失效状态；读取期间再次变化时完成后再统一刷新一次。' },
    ], relatedApis: ['resources/subscribe', 'resources/unsubscribe', 'resources/read', 'notifications/resources/list_changed'],
  },
  'notifications/tools/list_changed': {
    learningLevel: 'reference', runtime: 'server',
    parameters: [
      { name: '无参数', type: 'never', required: false, description: '表示工具集合、schema 或 execution 元数据变化；新的权威定义来自 tools/list。' },
    ],
    expectedOutput: '没有响应；客户端重新分页读取工具，并为下一次模型调用原子替换工具目录。',
    errorCases: [
      { condition: '服务端未声明 tools.listChanged', handling: '不要发送；动态工具目录必须在 initialize capability 中明确。' },
      { condition: '目录刷新时正在执行旧版本工具', handling: '让既有调用按发起时的 schema/version 完成，新定义只用于后续请求，避免半途改变合同。' },
    ], relatedApis: ['tools/list', 'tools/call'],
  },
  'notifications/roots/list_changed': {
    learningLevel: 'advanced', runtime: 'client',
    parameters: [
      { name: '无参数', type: 'never', required: false, description: '用户授权的 roots 集合发生变化；Server 必须重新 roots/list，而不能继续信任旧缓存。' },
    ],
    expectedOutput: '没有响应；Server 重新请求 roots/list，并依据新范围停止使用被撤销根目录及相关缓存。',
    errorCases: [
      { condition: '客户端未声明 roots.listChanged', handling: '不要发送；如果授权范围必须变化，应结束旧会话并重新 initialize。' },
      { condition: '撤销 root 时仍有文件操作执行', handling: 'Host 明确取消或重新授权策略；Server 停止启动新操作并清理旧范围缓存。' },
    ], relatedApis: ['roots/list', 'notifications/cancelled', 'initialize'],
  },
  'notifications/elicitation/complete': {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'elicitationId', type: 'string', required: true, description: '先前 URL 模式 elicitation/create 提供的 opaque id；外部交互在 Server 一侧完成后，Server 用它通知 Client 关闭或更新对应交互界面。' },
    ],
    expectedOutput: '没有响应；Server 告知 Client 某个 out-of-band elicitation 已完成，Client 可关闭提示或刷新状态。它本身不向 Client 暴露支付、OAuth 等敏感结果。',
    errorCases: [
      { condition: 'Client 收到未知、重复或已经关闭的 elicitationId', handling: '幂等忽略并记录协议诊断，不能据此关闭其他 Server 或会话创建的交互。' },
      { condition: '外部系统尚未通过可信回调确认就发送 complete', handling: 'Server 必须先验证自己的后端事实再通知 Client，不能把浏览器跳转或用户口头确认当作成功凭证。' },
      { condition: '通知在断线后没有到达', handling: 'Client 仍应提供手动重试、取消或继续操作入口，不能把可选通知当作唯一恢复机制。' },
    ], relatedApis: ['elicitation/create', 'tasks/get', 'notifications/cancelled'],
  },
} satisfies Record<string, FrameworkApiLearningMeta>

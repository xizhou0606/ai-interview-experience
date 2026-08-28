export type AiSdkLearningLevel = 'core' | 'advanced' | 'reference'
export type AiSdkRuntime = 'server' | 'client' | 'both'

export interface AiSdkLearningParameter {
  name: string
  type: string
  required: boolean
  defaultValue?: string
  description: string
}

export interface AiSdkLearningErrorCase {
  condition: string
  handling: string
}

export interface AiSdkLearningMeta {
  learningLevel: AiSdkLearningLevel
  runtime: AiSdkRuntime
  parameters: AiSdkLearningParameter[]
  expectedOutput: string
  errorCases: AiSdkLearningErrorCase[]
  relatedApis: string[]
}

/**
 * Structured learning metadata for every learner-facing AI SDK 6 Core/UI entry.
 * Keys intentionally match the `name` values in the four AI SDK catalog files.
 */
export const aiSdkLearningMeta = {
  generateText: {
    learningLevel: 'core', runtime: 'server',
    parameters: [
      { name: 'model', type: 'LanguageModel', required: true, description: '实际执行生成的语言模型；可传 Provider 创建的模型或 AI Gateway 模型字符串。' },
      { name: 'prompt | messages', type: 'string | ModelMessage[]', required: true, description: '二选一的模型输入；简单一次性问题用 prompt，多轮或多模态上下文用 messages。' },
      { name: 'tools', type: 'ToolSet', required: false, defaultValue: '{}', description: '允许模型调用的工具集合；对象键就是暴露给模型的 toolName。' },
      { name: 'stopWhen', type: 'StopCondition | StopCondition[]', required: false, defaultValue: 'stepCountIs(1)', description: '有工具结果后是否继续下一步，以及何时停止工具循环。' },
      { name: 'output', type: 'Output', required: false, defaultValue: 'Output.text()', description: '声明最终输出是文本、对象、数组、枚举还是任意 JSON。' },
      { name: 'abortSignal / timeout', type: 'AbortSignal | number | TimeoutOptions', required: false, description: '限制整次调用或单步骤时长，并允许上游请求取消。' },
    ],
    expectedOutput: 'Promise<GenerateTextResult>；完成后可读取 text、output、steps、toolCalls、toolResults、usage、finishReason、sources 和响应元数据。',
    errorCases: [
      { condition: 'Provider 请求失败、限流或重试耗尽', handling: '识别可重试错误，记录 provider/model/requestId，设置 maxRetries 与 timeout，并向调用方返回可理解的降级结果。' },
      { condition: '结构化 output 无法解析或未通过 schema', handling: '捕获结构化输出错误，不使用未验证文本执行写库等副作用；必要时缩小 schema 或设计一次受控修复。' },
    ], relatedApis: ['streamText', 'Output', 'tool', 'stepCountIs', 'hasToolCall'],
  },
  streamText: {
    learningLevel: 'core', runtime: 'server',
    parameters: [
      { name: 'model', type: 'LanguageModel', required: true, description: '负责生成增量内容的模型，必须支持所需的文本、工具或多模态能力。' },
      { name: 'prompt | messages', type: 'string | ModelMessage[]', required: true, description: '二选一输入；聊天服务通常先把 UIMessage 转换为 ModelMessage[]。' },
      { name: 'tools', type: 'ToolSet', required: false, defaultValue: '{}', description: '模型在流中可以发出的工具调用定义。' },
      { name: 'stopWhen', type: 'StopCondition | StopCondition[]', required: false, defaultValue: 'stepCountIs(1)', description: '控制工具调用后是否继续生成下一步骤。' },
      { name: 'experimental_transform', type: 'StreamTextTransform | StreamTextTransform[]', required: false, description: '对文本和 reasoning chunk 做平滑或自定义转换，同时必须保持流协议完整。' },
      { name: 'onChunk / onStepFinish / onFinish / onError', type: 'callback', required: false, description: '在流生命周期中记录增量、步骤、最终 usage 或错误。' },
    ],
    expectedOutput: '立即得到 StreamTextResult；textStream/fullStream 可逐块消费，text、usage 等最终值以 Promise 暴露，也可转换为文本或 UIMessage Response。',
    errorCases: [
      { condition: '流开始前的模型请求失败', handling: '在路由层捕获并返回合适 HTTP 状态；不要伪装成成功流。' },
      { condition: '流开始后某个 chunk、工具或转换器失败', handling: '通过 onError/错误 chunk 收口，传播 AbortSignal，保证客户端能结束 loading 状态。' },
    ], relatedApis: ['generateText', 'createUIMessageStream', 'smoothStream', 'useChat', 'Output'],
  },
  Output: {
    learningLevel: 'core', runtime: 'server',
    parameters: [
      { name: 'schema', type: 'FlexibleSchema', required: false, description: 'Output.object/array 使用的结构规则；Output.text/json 不需要 schema。' },
      { name: 'options', type: 'readonly string[]', required: false, description: 'Output.choice 可选择的有限字符串集合。' },
      { name: 'name / description', type: 'string', required: false, description: '可选的结构名称和说明，帮助支持相关能力的 Provider 理解预期输出。' },
    ],
    expectedOutput: '返回给 generateText/streamText 的 Output 规格；最终 output 类型取决于 text、object、array、choice 或 json。object/array/choice 会验证，json 只保证是合法 JSON。',
    errorCases: [
      { condition: '模型返回内容不是合法 JSON 或不符合 schema/choice', handling: '让生成 API 抛出结构化输出错误；捕获后展示失败或有限重试，不要强制类型断言。' },
      { condition: 'schema 形状过深或含模型难理解的 refine', handling: '简化模型可见 schema，把关键语义写进 description，并在业务层做第二次校验。' },
    ], relatedApis: ['generateText', 'streamText', 'jsonSchema', 'zodSchema', 'valibotSchema'],
  },
  embed: {
    learningLevel: 'core', runtime: 'server',
    parameters: [
      { name: 'model', type: 'EmbeddingModel', required: true, description: '把输入映射到固定维度向量空间的 embedding 模型。' },
      { name: 'value', type: 'VALUE', required: true, description: '需要向量化的单个值，常见类型是字符串。' },
      { name: 'maxRetries / abortSignal', type: 'number | AbortSignal', required: false, defaultValue: 'maxRetries: 2', description: '限制失败重试次数，或在请求取消时终止调用。' },
    ],
    expectedOutput: 'Promise<EmbedResult>，包含原 value、embedding 数组、usage、warnings、providerMetadata 和 response。',
    errorCases: [
      { condition: 'Provider 未返回 embedding 或返回维度异常', handling: '拒绝写入向量库，记录模型版本和实际维度，并检查 collection 配置。' },
      { condition: '输入超过模型 token 限制', handling: '先按语义切块或截断，并把切块策略与模型版本一同持久化。' },
    ], relatedApis: ['embedMany', 'cosineSimilarity', 'rerank'],
  },
  embedMany: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'model', type: 'EmbeddingModel', required: true, description: '批量输入共同使用的 embedding 模型。' },
      { name: 'values', type: 'VALUE[]', required: true, description: '待转换的值数组；输出 embeddings 与输入顺序一一对应。' },
      { name: 'maxParallelCalls', type: 'number', required: false, defaultValue: 'Infinity', description: 'SDK 拆批后最多并行发出的 Provider 请求数。' },
    ],
    expectedOutput: 'Promise<EmbedManyResult>，包含 values、同序 embeddings、总 usage、warnings、providerMetadata 和可能有多个元素的 responses。',
    errorCases: [
      { condition: '某个拆分批次失败或触发限流', handling: '降低 maxParallelCalls，使用可追踪的批次 ID 重试失败批次，避免重复写入和重复计费。' },
    ], relatedApis: ['embed', 'cosineSimilarity', 'rerank'],
  },
  rerank: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'model', type: 'RerankingModel', required: true, description: '对 query 与候选文档成对评分的重排模型。' },
      { name: 'query', type: 'string', required: true, description: '用户的真实检索问题，而不是已经向量化的坐标。' },
      { name: 'documents', type: 'string[] | object[]', required: true, description: '召回阶段得到的候选集合；对象文档需要模型支持或合适的字段映射。' },
      { name: 'topN', type: 'number', required: false, description: '只返回得分最高的前 N 项。' },
    ],
    expectedOutput: 'Promise<RerankResult>；ranking 按相关度排序，每项包含 originalIndex、relevanceScore 和原 document，另有 usage。',
    errorCases: [
      { condition: '候选数量或文本总量超出模型限制', handling: '在召回阶段限制候选规模，裁剪无关字段，并分批后谨慎合并分数。' },
    ], relatedApis: ['embed', 'embedMany', 'cosineSimilarity'],
  },
  generateImage: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'model', type: 'ImageModel', required: true, description: '实际生成图片的 Provider 模型。' },
      { name: 'prompt', type: 'string | ImagePrompt', required: true, description: '文字描述，或包含参考图与文字的图像编辑输入。' },
      { name: 'n / size / aspectRatio', type: 'number | string', required: false, defaultValue: 'n: 1', description: '生成数量及画面尺寸；size 与 aspectRatio 通常不能同时设置，且取值依 Provider 而异。' },
    ],
    expectedOutput: 'Promise<GenerateImageResult>；image 是第一张图，images 是全部 GeneratedFile，另含 warnings、responses 与 providerMetadata。',
    errorCases: [
      { condition: '模型未生成图片、内容审核拒绝或参数不受支持', handling: '区分安全拒绝与技术失败，读取 warnings；不要把失败响应当作空白图片继续持久化。' },
    ], relatedApis: ['wrapImageModel', 'DefaultGeneratedFile', 'experimental_generateVideo'],
  },
  transcribe: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'model', type: 'TranscriptionModelV3', required: true, description: '转写完整音频文件的实验性模型；代码中从 ai 以 experimental_transcribe 别名导入。' },
      { name: 'audio', type: 'DataContent | URL', required: true, description: '音频的 Buffer、Uint8Array、ArrayBuffer、base64/字符串或 URL。' },
      { name: 'download', type: 'DownloadFunction', required: false, description: '读取 URL 音频的自定义下载器，可限制允许域名、体积和超时。' },
    ],
    expectedOutput: '转写结果包含 text、segments、language、durationInSeconds、warnings、providerMetadata 和 responses。',
    errorCases: [
      { condition: '音频格式、大小或 URL 下载不合法', handling: '上传边界先校验媒体类型和大小；URL 使用受限下载器，防止 SSRF。' },
      { condition: 'Provider 无法识别语音或不给时间戳', handling: '允许 segments/language/duration 缺失，向用户明确低置信度或仅返回全文。' },
    ], relatedApis: ['generateSpeech', 'DefaultGeneratedFile'],
  },
  generateSpeech: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'model', type: 'SpeechModelV3', required: true, description: '文字转语音的实验性模型；从 ai 以 experimental_generateSpeech 别名导入。' },
      { name: 'text', type: 'string', required: true, description: '需要合成的文字；长文通常应按语义和停顿切段。' },
      { name: 'voice / outputFormat / speed', type: 'string | number', required: false, description: '声音、输出格式和语速，具体可选值取决于 Provider。' },
    ],
    expectedOutput: '结果中的 audio 是 GeneratedAudioFile，可读取 base64、uint8Array、mediaType 和 format；另含 warnings、providerMetadata 与 responses。',
    errorCases: [
      { condition: '所选 voice、语言或格式不受当前 Provider 支持', handling: '启动时维护 Provider 能力表，读取 warnings，并提供受支持的默认 voice/format。' },
    ], relatedApis: ['transcribe', 'DefaultGeneratedFile'],
  },
  experimental_generateVideo: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'model', type: 'VideoModelV3', required: true, description: '异步生成视频的实验性模型。' },
      { name: 'prompt', type: 'string | { text: string; image: DataContent }', required: true, description: '纯文字生成，或带起始图片的 image-to-video 输入。' },
      { name: 'n / duration / fps / resolution / aspectRatio', type: 'number | string', required: false, defaultValue: 'n: 1', description: '视频数量和规格；支持范围由模型决定。' },
      { name: 'abortSignal / providerOptions', type: 'AbortSignal | ProviderOptions', required: false, description: '取消长任务，并配置 Provider 的轮询超时等专有参数。' },
    ],
    expectedOutput: 'GenerateVideoResult；video 为第一条 GeneratedFile，videos 为全部视频，另含 warnings、responses 和 providerMetadata。',
    errorCases: [
      { condition: 'Provider 轮询超时或没有生成可用视频', handling: '捕获 NoVideoGeneratedError，保存外部任务 ID 与 responses；生产环境用队列恢复，而非占用普通 HTTP 请求。' },
    ], relatedApis: ['generateImage', 'DefaultGeneratedFile'],
  },
  Agent: {
    learningLevel: 'reference', runtime: 'both',
    parameters: [
      { name: 'CALL_OPTIONS', type: 'generic type', required: false, defaultValue: 'never', description: '调用 Agent 时额外 options 的类型；没有自定义调用配置时保持 never。' },
      { name: 'TOOLS', type: 'ToolSet generic', required: false, defaultValue: '{}', description: 'Agent 暴露工具集合的静态类型。' },
      { name: 'OUTPUT', type: 'Output generic', required: false, defaultValue: 'never', description: 'Agent 结构化输出规格的类型，而不是 Output.text() 这样的运行时调用表达式。' },
    ],
    expectedOutput: '这是类型合同而非运行时函数；实现者提供 version、id、tools、generate() 和 stream()，两种方法分别产生 GenerateTextResult 与 StreamTextResult。',
    errorCases: [{ condition: '自定义实现不满足 agent-v1 合同或忽略取消信号', handling: '用 TypeScript implements/赋值检查验证完整接口，并在 generate/stream 中透传 abortSignal、timeout 和工具类型。' }],
    relatedApis: ['ToolLoopAgent', 'createAgentUIStream', 'createAgentUIStreamResponse'],
  },
  ToolLoopAgent: {
    learningLevel: 'core', runtime: 'server',
    parameters: [
      { name: 'model', type: 'LanguageModel', required: true, description: 'Agent 每一步推理和选择工具时使用的模型。' },
      { name: 'instructions', type: 'string | SystemModelMessage | SystemModelMessage[]', required: false, description: '在所有调用中复用的系统约束、角色和工作原则。' },
      { name: 'tools', type: 'ToolSet', required: false, defaultValue: '{}', description: 'Agent 可调用的受控外部能力。' },
      { name: 'stopWhen', type: 'StopCondition | StopCondition[]', required: false, defaultValue: 'stepCountIs(20)', description: '决定工具循环何时结束；生产中通常显式设置更小硬上限和业务终止工具。' },
      { name: 'prepareStep', type: 'PrepareStepFunction', required: false, description: '每一步之前动态更换模型、工具、消息或上下文。' },
    ],
    expectedOutput: '构造得到可复用 Agent；agent.generate() 返回完整 GenerateTextResult，agent.stream() 返回包含文本、reasoning 和工具事件的 StreamTextResult。',
    errorCases: [
      { condition: '工具反复调用、上下文持续增长或副作用重复', handling: '组合 stepCountIs 与业务终止条件；工具执行使用幂等键并在高风险动作前请求确认。' },
      { condition: '某一步模型或工具失败', handling: '利用步骤回调记录 stepNumber/toolCallId，区分可重试查询和不可自动重试的写操作。' },
    ], relatedApis: ['Agent', 'tool', 'stepCountIs', 'hasToolCall', 'createAgentUIStreamResponse'],
  },
  createAgentUIStream: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'agent', type: 'Agent', required: true, description: '要执行且必须实现 stream()、tools 的 Agent。' },
      { name: 'uiMessages', type: 'unknown[]', required: true, description: '来自界面的消息；函数会按 Agent 工具定义验证并转换为模型消息。' },
      { name: 'abortSignal / timeout', type: 'AbortSignal | number | { totalMs?: number }', required: false, description: '客户端断开或超时时终止 Agent 流。' },
    ],
    expectedOutput: 'Promise<AsyncIterableStream<UIMessageChunk>>；可用 for await 逐块消费 Agent 的 UI 消息事件。',
    errorCases: [{ condition: 'uiMessages 无效或 Agent 流中途失败', handling: '在进入 Agent 前返回验证错误；流错误用 UIMessageStream 的错误策略收口并停止上游。' }],
    relatedApis: ['Agent', 'createAgentUIStreamResponse', 'pipeAgentUIStreamToResponse', 'UIMessage'],
  },
  createAgentUIStreamResponse: {
    learningLevel: 'core', runtime: 'server',
    parameters: [
      { name: 'agent', type: 'Agent', required: true, description: '服务端运行并输出 UIMessage stream 的 Agent。' },
      { name: 'uiMessages', type: 'unknown[]', required: true, description: '浏览器提交的 UI 消息历史；不是 ModelMessage[] 参数。' },
      { name: 'headers / status / statusText', type: 'HeadersInit | number | string', required: false, description: '给最终 Web Response 增加 HTTP 初始化信息。' },
      { name: 'abortSignal', type: 'AbortSignal', required: false, description: '请求断开时取消模型和工具执行。' },
    ],
    expectedOutput: 'Promise<Response>，body 是按 AI SDK UI 协议编码的实时 UIMessage 流。',
    errorCases: [{ condition: '认证失败、消息验证失败或流启动失败', handling: '认证和资源授权必须在调用前完成；可预见的输入错误返回 4xx，流内错误再用协议事件表示。' }],
    relatedApis: ['createAgentUIStream', 'pipeAgentUIStreamToResponse', 'useChat'],
  },
  pipeAgentUIStreamToResponse: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'response', type: 'ServerResponse', required: true, description: 'Express/Node HTTP 风格的原生响应对象。' },
      { name: 'agent', type: 'Agent', required: true, description: '产生流式输出的 Agent。' },
      { name: 'uiMessages', type: 'unknown[]', required: true, description: '需要验证、转换后交给 Agent 的界面消息。' },
    ],
    expectedOutput: 'Promise<void>；Promise 完成表示 UIMessage 流已全部写入 Node ServerResponse。',
    errorCases: [{ condition: '客户端断开或已经写出 headers 后发生错误', handling: '把 req/res 的关闭事件转换成 AbortSignal；流开始后不要再调用 res.json 或二次写 header。' }],
    relatedApis: ['createAgentUIStream', 'createAgentUIStreamResponse', 'pipeUIMessageStreamToResponse'],
  },
  tool: {
    learningLevel: 'core', runtime: 'server',
    parameters: [
      { name: 'description', type: 'string', required: false, description: '告诉模型何时应使用工具；应包含边界而不是营销式模糊文字。' },
      { name: 'inputSchema', type: 'FlexibleSchema', required: true, description: '模型生成参数时看到的结构，也是 execute 前运行时验证边界。' },
      { name: 'execute', type: '(input, options) => RESULT | Promise<RESULT>', required: false, description: '真正执行业务动作；省略时可把工具调用转交客户端或队列。' },
      { name: 'strict / inputExamples', type: 'boolean | ToolInputExample[]', required: false, description: '在支持的 Provider 上启用严格参数生成，或提供少量代表性输入示例。' },
    ],
    expectedOutput: '保留输入和输出推断的 Tool 定义；只有被 generateText、streamText 或 Agent 放进 tools 后才可能执行。',
    errorCases: [
      { condition: '模型参数未通过 inputSchema', handling: '拒绝执行，必要时用受控 repairToolCall 修复；绝不能跳过验证直接调用业务服务。' },
      { condition: 'execute 包含重复扣款、发信等副作用', handling: '基于 toolCallId/业务键实现幂等，并在工具内部重新鉴权。' },
    ], relatedApis: ['dynamicTool', 'ToolLoopAgent', 'generateText', 'streamText'],
  },
  dynamicTool: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'inputSchema', type: 'FlexibleSchema<unknown>', required: true, description: '运行时才获取的 schema；TypeScript 不会为 execute 提供具体字段推断。' },
      { name: 'execute', type: '(input: unknown, options) => unknown', required: false, description: '接收动态输入的执行器，必须依据 schema 结果或判别字段显式收窄。' },
    ],
    expectedOutput: 'DynamicTool；调用事件会标记为 dynamic，消费方应按 unknown 处理 input/output。',
    errorCases: [{ condition: '远程插件或 MCP schema 不可信、与实际执行器不一致', handling: '限制可加载来源，验证 schema，自执行边界再次收窄并设置权限、超时和输出大小限制。' }],
    relatedApis: ['tool', 'createMCPClient', 'jsonSchema'],
  },
  createMCPClient: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'transport', type: 'MCPTransportConfig | MCPTransport', required: true, description: 'HTTP/SSE 配置或已创建的 transport；该函数从 @ai-sdk/mcp 导入。' },
      { name: 'name / version', type: 'string', required: false, defaultValue: 'ai-sdk-mcp-client / 1.0.0', description: '初始化握手时上报给 MCP Server 的客户端身份。' },
      { name: 'capabilities', type: 'ClientCapabilities', required: false, description: '例如启用 elicitation 时向服务器声明客户端支持的能力。' },
      { name: 'onUncaughtError', type: '(error: unknown) => void', required: false, description: '接收协议层未由具体请求 Promise 捕获的错误。' },
    ],
    expectedOutput: 'Promise<MCPClient>；提供 tools、listResources、readResource、listResourceTemplates、实验性 prompts、elicitation handler 和 close。',
    errorCases: [
      { condition: '协议版本不兼容、连接失败或服务器缺能力', handling: '捕获 MCPClientError，记录 server 地址但脱敏凭证，并按能力探测结果关闭相关功能。' },
      { condition: '客户端生命周期结束或初始化后任一步失败', handling: '在 finally 中 await client.close()，避免子进程、socket 和事件监听器泄漏。' },
    ], relatedApis: ['Experimental_StdioMCPTransport', 'dynamicTool', 'tool'],
  },
  Experimental_StdioMCPTransport: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'command', type: 'string', required: true, description: '在 Node.js 主机上启动 MCP Server 的可执行文件；从 @ai-sdk/mcp/mcp-stdio 导入。' },
      { name: 'args / env / cwd', type: 'string[] | Record<string,string> | string', required: false, description: '受控命令参数、环境变量和工作目录，不能直接来自用户输入。' },
      { name: 'stderr', type: 'IOType | Stream | number', required: false, description: '子进程标准错误输出目标，用于诊断而不能混入 JSON-RPC stdout。' },
    ],
    expectedOutput: '可传给 createMCPClient 的 Node-only 实验性 MCPTransport。',
    errorCases: [{ condition: '命令不存在、进程提前退出或 stdout 被普通日志污染', handling: '启动前白名单化 command/args，固定 cwd/env；将日志写 stderr，并在父进程结束时关闭 transport。' }],
    relatedApis: ['createMCPClient'],
  },
  jsonSchema: {
    learningLevel: 'reference', runtime: 'both',
    parameters: [
      { name: 'schema', type: 'JSONSchema7', required: true, description: '来自 OpenAPI、MCP 或其他语言系统的标准 JSON Schema。' },
      { name: 'validate', type: '(value: unknown) => ValidationResult', required: false, description: '当基础 schema 还不够时提供额外运行时验证。' },
    ],
    expectedOutput: 'AI SDK FlexibleSchema，携带 JSON Schema 以及可选验证器，供工具输入或 Output 使用。',
    errorCases: [{ condition: 'TypeScript 泛型声明与真实 schema 不一致', handling: '以运行时 schema 为真相，不用泛型强转掩盖 required/additionalProperties 等错误。' }],
    relatedApis: ['zodSchema', 'valibotSchema', 'Output', 'tool'],
  },
  zodSchema: {
    learningLevel: 'reference', runtime: 'both',
    parameters: [
      { name: 'zodSchema', type: 'ZodSchema', required: true, description: '已有的 Zod 规则；适配后保留输入类型推断与运行时验证。' },
      { name: 'useReferences', type: 'boolean', required: false, description: '转换复杂 schema 时是否使用 JSON Schema references，支持情况取决于消费端。' },
    ],
    expectedOutput: '统一的 AI SDK Schema，供 tool、Output 和消息验证 API 消费。',
    errorCases: [{ condition: 'refine/transform 等 Zod 逻辑无法完整表达给模型', handling: '将模型必须理解的约束写入字段 description，服务端仍执行原 Zod 校验。' }],
    relatedApis: ['jsonSchema', 'valibotSchema', 'tool', 'Output'],
  },
  valibotSchema: {
    learningLevel: 'reference', runtime: 'both',
    parameters: [
      { name: 'valibotSchema', type: 'Valibot GenericSchema', required: true, description: '应用已有的 Valibot schema，用来推断并验证 AI 输入输出。' },
      { name: 'options', type: 'Schema conversion options', required: false, description: '控制 schema 转换行为；应与项目使用的 Valibot 版本匹配。' },
    ],
    expectedOutput: 'AI SDK Schema，类型由 Valibot 规则推断。',
    errorCases: [{ condition: 'Valibot 版本或转换器不支持某些高级规则', handling: '为关键 schema 增加运行时测试；无法转换的规则改为模型可见描述加业务层验证。' }],
    relatedApis: ['jsonSchema', 'zodSchema', 'tool', 'Output'],
  },
  ModelMessage: {
    learningLevel: 'core', runtime: 'server',
    parameters: [
      { name: 'role', type: "'system' | 'user' | 'assistant' | 'tool'", required: true, description: '决定消息在模型协议中的身份和允许的 content part。' },
      { name: 'content', type: 'string | ModelMessagePart[]', required: true, description: '模型真正接收的文本、图像、文件、reasoning、工具调用或工具结果。' },
      { name: 'providerOptions', type: 'ProviderOptions', required: false, description: '随特定消息传给 Provider 的扩展配置。' },
    ],
    expectedOutput: 'TypeScript 联合类型，不产生运行时值；作为 generateText、streamText 和 Agent 的 messages 输入。',
    errorCases: [{ condition: 'role 与 content part 不匹配，或工具调用和工具结果未配对', handling: '使用转换/验证 API 建立协议边界，持久化时保留 toolCallId 并做版本迁移。' }],
    relatedApis: ['UIMessage', 'convertToModelMessages', 'generateText', 'streamText'],
  },
  UIMessage: {
    learningLevel: 'core', runtime: 'both',
    parameters: [
      { name: 'id', type: 'string', required: true, description: '消息稳定标识，用于增量合并、持久化和重新生成。' },
      { name: 'role', type: "'system' | 'user' | 'assistant'", required: true, description: '界面消息角色；工具状态作为 parts，而不是独立 tool role。' },
      { name: 'parts', type: 'UIMessagePart[]', required: true, description: '有序文本、reasoning、工具、文件、source 和自定义 data part。' },
      { name: 'metadata', type: 'METADATA', required: false, description: '页面需要但默认不应发送给模型的业务元数据。' },
    ],
    expectedOutput: '强类型 UI 消息对象，供 useChat、持久化和 UIMessage stream 增量更新。',
    errorCases: [{ condition: '旧数据库消息不再符合当前 metadata/data/tool 类型', handling: '加载时先迁移版本并调用 validateUIMessages，失败记录最小诊断而不是强转。' }],
    relatedApis: ['ModelMessage', 'validateUIMessages', 'convertToModelMessages', 'useChat'],
  },
  validateUIMessages: {
    learningLevel: 'core', runtime: 'server',
    parameters: [
      { name: 'messages', type: 'unknown[]', required: true, description: '来自 HTTP 或数据库、尚未可信的 UI 消息数组。' },
      { name: 'tools', type: 'ToolSet', required: false, description: '验证工具 part 的 toolName、input 和 output 所依据的工具定义。' },
      { name: 'dataSchemas / metadataSchema', type: 'UIDataTypesToSchemas | FlexibleSchema', required: false, description: '验证自定义 data part 与消息 metadata 的运行时规则。' },
    ],
    expectedOutput: 'Promise<UIMessage[]>；成功时返回经过验证并完成类型收窄的消息，任一错误都会抛出 TypeValidationError。',
    errorCases: [{ condition: '任一消息、part、metadata 或工具数据非法', handling: '捕获验证错误映射为 400，不继续调用模型；日志只记录索引、字段路径和错误码。' }],
    relatedApis: ['safeValidateUIMessages', 'UIMessage', 'convertToModelMessages'],
  },
  safeValidateUIMessages: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'messages', type: 'unknown[]', required: true, description: '要验证但不希望以异常控制流程的 UI 消息数组。' },
      { name: 'tools / dataSchemas / metadataSchema', type: 'validation schemas', required: false, description: '与严格版本相同的工具、自定义数据和 metadata 验证上下文。' },
    ],
    expectedOutput: 'Promise 判别联合：成功为 { success: true, data }，失败为 { success: false, error }。',
    errorCases: [{ condition: 'result.success 为 false', handling: '只使用 error 生成安全的 4xx 响应；绝不能继续使用原始 messages。' }],
    relatedApis: ['validateUIMessages', 'UIMessage', 'convertToModelMessages'],
  },
  createProviderRegistry: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'providers', type: 'Record<string, Provider>', required: true, description: '以唯一前缀注册的 Provider，例如 openai、anthropic；前缀参与 provider:model ID。' },
      { name: 'separator', type: 'string', required: false, defaultValue: ':', description: 'Provider ID 与模型 ID 的分隔符。' },
      { name: 'languageModelMiddleware / imageModelMiddleware', type: 'Middleware | Middleware[]', required: false, description: '统一包装从注册表取出的语言或图像模型。' },
    ],
    expectedOutput: 'Provider 兼容注册表，可通过 languageModel、embeddingModel、imageModel 等方法解析带 Provider 前缀的模型 ID。',
    errorCases: [{ condition: 'ID 没有分隔符、Provider 未注册或模型不存在', handling: '在配置加载阶段验证允许的 ID；对外只暴露业务白名单，不把任意 modelId 透传给注册表。' }],
    relatedApis: ['customProvider', 'wrapLanguageModel', 'wrapImageModel'],
  },
  customProvider: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'languageModels / embeddingModels / imageModels', type: 'Record<string, Model>', required: false, description: '把业务别名精确映射到预配置模型实例。' },
      { name: 'transcriptionModels / speechModels / rerankingModels', type: 'Record<string, Model>', required: false, description: '为多模态与重排模型建立同样的别名映射。' },
      { name: 'fallbackProvider', type: 'Provider', required: false, description: '本地映射中没有 ID 时委托的真实 Provider。' },
    ],
    expectedOutput: '符合 Provider 接口的别名 Provider，可通过各类 model 方法取得映射模型或 fallback 模型。',
    errorCases: [{ condition: '别名缺失，且 fallback 也无法解析模型', handling: '启动时做别名完整性检查；模型迁移时版本化配置并运行质量/成本回归。' }],
    relatedApis: ['createProviderRegistry', 'wrapLanguageModel', 'defaultSettingsMiddleware'],
  },
  cosineSimilarity: {
    learningLevel: 'reference', runtime: 'both',
    parameters: [
      { name: 'vector1', type: 'number[]', required: true, description: '第一个向量，通常是查询 embedding。' },
      { name: 'vector2', type: 'number[]', required: true, description: '第二个等维向量，通常是候选文档 embedding。' },
    ],
    expectedOutput: 'number；两个非零向量方向的余弦相似度，越接近 1 通常越相似。',
    errorCases: [{ condition: '维度不一致、含 NaN/Infinity 或零向量', handling: '计算前验证维度和有限数值；零向量明确返回业务定义的最低分或拒绝比较。' }],
    relatedApis: ['embed', 'embedMany', 'rerank'],
  },
  wrapLanguageModel: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'model', type: 'LanguageModelV3', required: true, description: '被装饰的原始语言模型，包装后业务调用方式保持不变。' },
      { name: 'middleware', type: 'LanguageModelV3Middleware | LanguageModelV3Middleware[]', required: true, description: '按数组顺序组合的请求/响应中间件。' },
      { name: 'modelId / providerId', type: 'string', required: false, description: '需要隐藏底层身份或建立逻辑模型名时覆盖模型和 Provider ID。' },
    ],
    expectedOutput: '新的 LanguageModelV3；调用方式与原模型一致，但经过全部中间件。',
    errorCases: [{ condition: '中间件顺序错误、吞掉协议 chunk 或改变返回结构', handling: '对 generate 与 stream 分别做契约测试；观测层记录后仍需原样传播错误、usage 和 finish part。' }],
    relatedApis: ['LanguageModelV3Middleware', 'defaultSettingsMiddleware', 'simulateStreamingMiddleware', 'extractReasoningMiddleware'],
  },
  wrapImageModel: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'model', type: 'ImageModelV3', required: true, description: '被包装的原始图像模型，负责执行最终图片生成请求。' },
      { name: 'middleware', type: 'ImageModelV3Middleware | ImageModelV3Middleware[]', required: true, description: '处理图像调用参数或执行过程的中间件。' },
      { name: 'modelId / providerId', type: 'string', required: false, description: '可观测性和路由中使用的覆盖标识。' },
    ],
    expectedOutput: '新的 ImageModelV3，可直接交给 generateImage。',
    errorCases: [{ condition: '中间件保留参考图、二进制响应或敏感 prompt', handling: '日志只保留散列、大小和审核标签；为二进制设置内存及存储上限。' }],
    relatedApis: ['generateImage', 'DefaultGeneratedFile'],
  },
  LanguageModelV3Middleware: {
    learningLevel: 'reference', runtime: 'server',
    parameters: [
      { name: 'specificationVersion', type: "'v3'", required: true, description: '中间件协议版本，声明实现遵循 Language Model V3 合同。' },
      { name: 'transformParams', type: 'TransformParams', required: false, description: 'Provider 执行前异步转换调用参数。' },
      { name: 'wrapGenerate / wrapStream', type: 'wrapper function', required: false, description: '包裹非流式或流式执行；必须返回完整 V3 结果协议。' },
      { name: 'overrideProvider / overrideModelId / overrideSupportedUrls', type: 'override callback', required: false, description: '覆盖包装模型暴露的身份和 URL 支持能力。' },
    ],
    expectedOutput: '这是 AI SDK 6 的实验性 V3 类型合同，不产生运行时输出；对象随后传给 wrapLanguageModel。V3 表示协议版本，experimental 表示功能生命周期。',
    errorCases: [{ condition: 'wrapStream 丢失 tool-call、reasoning、usage、finish 或错误 chunk', handling: '以 LanguageModelV3StreamPart 判别联合逐类测试，未知 part 默认透传。' }],
    relatedApis: ['wrapLanguageModel', 'extractReasoningMiddleware', 'simulateStreamingMiddleware', 'defaultSettingsMiddleware'],
  },
  extractReasoningMiddleware: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'tagName', type: 'string', required: false, defaultValue: 'think', description: '模型用来包裹 reasoning 的 XML 风格标签名。' },
      { name: 'separator / startWithReasoning', type: 'string | boolean', required: false, description: '标签与最终文本的分隔行为，以及流是否从 reasoning 状态开始。' },
    ],
    expectedOutput: 'LanguageModelV3Middleware，将标签内内容转为 reasoning part、标签外内容保留为 text part。',
    errorCases: [{ condition: '模型输出未闭合标签、嵌套标签或格式漂移', handling: '监控解析异常和原始 warnings；无法可靠拆分时降级为普通文本，且不要向终端用户暴露隐藏推理。' }],
    relatedApis: ['wrapLanguageModel', 'LanguageModelV3Middleware', 'streamText'],
  },
  simulateStreamingMiddleware: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [{ name: '无参数', type: 'never', required: false, description: '直接调用 simulateStreamingMiddleware()，它不接受配置参数。' }],
    expectedOutput: 'LanguageModelV3Middleware；在 stream 调用时先获得完整 generate 结果，再按协议模拟流式 chunk。',
    errorCases: [{ condition: '把模拟流当作原生流评估首字延迟或取消能力', handling: '指标中标记 simulated=true；明确它统一接口但不降低模型真实首包等待。' }],
    relatedApis: ['wrapLanguageModel', 'streamText', 'simulateReadableStream'],
  },
  defaultSettingsMiddleware: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'settings', type: 'LanguageModelV3CallOptions defaults', required: true, description: 'temperature、maxOutputTokens、providerOptions 等缺省值；调用方显式值优先。' },
    ],
    expectedOutput: 'LanguageModelV3Middleware，在每次模型调用前合并默认设置。',
    errorCases: [{ condition: '全站默认配置不适合特定任务，或 Provider 不支持某项设置', handling: '按任务建立不同包装模型；读取 warnings，结构化抽取和创意生成不要共用同一采样策略。' }],
    relatedApis: ['wrapLanguageModel', 'customProvider', 'LanguageModelV3Middleware'],
  },
  addToolInputExamplesMiddleware: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [{ name: '无参数', type: 'never', required: false, description: '工厂本身无参数；示例来自每个 Tool 的 inputExamples 字段。' }],
    expectedOutput: 'LanguageModelV3Middleware；对不原生支持 inputExamples 的 Provider，把示例序列化进工具描述。',
    errorCases: [{ condition: '示例过多、含敏感数据或与当前 schema 不一致', handling: '只保留少量匿名化代表样例；schema 变更时用测试同步更新示例。' }],
    relatedApis: ['tool', 'wrapLanguageModel', 'LanguageModelV3Middleware'],
  },
  extractJsonMiddleware: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [{ name: '无参数', type: 'never', required: false, description: '直接调用 extractJsonMiddleware()，无需配置。' }],
    expectedOutput: 'LanguageModelV3Middleware，从带 Markdown code fence 的文本中提取 JSON 内容，便于后续解析。',
    errorCases: [{ condition: '回答包含多个代码块、围栏未闭合或围栏外混有解释', handling: '提取后仍执行严格 JSON/schema 验证；歧义时失败关闭，不用正则猜测业务数据。' }],
    relatedApis: ['Output', 'wrapLanguageModel', 'jsonSchema'],
  },
  stepCountIs: {
    learningLevel: 'core', runtime: 'server',
    parameters: [
      { name: 'count', type: 'number', required: true, description: '允许执行的最大生成步骤数，必须是符合业务复杂度的正整数。' },
      { name: 'steps（运行时传入）', type: 'StepResult[]', required: true, description: 'SDK 调用返回的 StopCondition 时自动传入已完成步骤；业务代码不手动传。' },
      { name: 'lastStep（由 steps 推导）', type: 'StepResult | undefined', required: false, description: '条件通过步骤数量判断是否达到上限，不检查业务是否真正完成。' },
    ],
    expectedOutput: 'StopCondition；当已执行步骤数达到 count 时返回 true。',
    errorCases: [{ condition: 'count 太小导致任务半途结束，或太大造成成本失控', handling: '结合任务评测选择上限，并与 hasToolCall/业务完成条件共同使用。' }],
    relatedApis: ['hasToolCall', 'ToolLoopAgent', 'generateText', 'streamText'],
  },
  hasToolCall: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'toolName', type: 'string', required: true, description: '一旦在当前步骤出现就触发停止的工具名，必须与 tools 对象键一致。' },
    ],
    expectedOutput: 'StopCondition；当前步骤包含指定 toolName 的调用时返回 true。',
    errorCases: [{ condition: '工具被调用但 execute 失败，条件仍可能认为应停止', handling: '终止工具输出应明确 success 状态；副作用失败时不要把“已调用”等同于“已完成”。' }],
    relatedApis: ['stepCountIs', 'ToolLoopAgent', 'tool'],
  },
  simulateReadableStream: {
    learningLevel: 'reference', runtime: 'both',
    parameters: [
      { name: 'chunks', type: 'T[]', required: true, description: '测试中按顺序发送的确定性 chunk。' },
      { name: 'initialDelayInMs / chunkDelayInMs', type: 'number | null', required: false, description: '首个 chunk 前和相邻 chunk 间的模拟延迟。' },
    ],
    expectedOutput: 'ReadableStream<T>，按配置延迟依次发出 chunks 后正常关闭。',
    errorCases: [{ condition: '测试只覆盖理想 chunk 和正常结束', handling: '另建会 error、提前 cancel、空 chunk 和跨边界切分的测试流。' }],
    relatedApis: ['streamText', 'readUIMessageStream', 'simulateStreamingMiddleware'],
  },
  smoothStream: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'delayInMs', type: 'number | null', required: false, description: '重新发出平滑 chunk 之间的等待时间；越大人为延迟越明显。' },
      { name: 'chunking', type: "'word' | 'line' | RegExp | custom function", required: false, description: '按单词、行或自定义边界重切文本和 reasoning。' },
    ],
    expectedOutput: 'StreamTextTransform，可传给 streamText 的 experimental_transform。',
    errorCases: [{ condition: '延迟或切分规则导致标点抖动、CJK 文本切分异常或取消滞后', handling: '用真实中英文输出调参；取消时立即停止定时器并传播上游 signal。' }],
    relatedApis: ['streamText', 'simulateReadableStream'],
  },
  generateId: {
    learningLevel: 'reference', runtime: 'both',
    parameters: [{ name: 'size', type: 'number', required: false, description: '随机部分长度；省略时使用 SDK 默认长度。' }],
    expectedOutput: '高熵随机字符串，可用作消息、工具调用或追踪 ID。',
    errorCases: [{ condition: '长度过短导致碰撞，或把 ID 当作授权凭证', handling: '根据规模保留足够熵并在数据库加唯一约束；资源访问仍必须鉴权。' }],
    relatedApis: ['createIdGenerator', 'UIMessage'],
  },
  createIdGenerator: {
    learningLevel: 'reference', runtime: 'both',
    parameters: [
      { name: 'prefix', type: 'string', required: false, description: '便于日志识别实体类别的固定前缀。' },
      { name: 'size / alphabet', type: 'number | string', required: false, description: '随机部分长度与字符集；共同决定可用熵。' },
      { name: 'separator', type: 'string', required: false, defaultValue: '-', description: '前缀与随机部分之间的分隔符。' },
    ],
    expectedOutput: 'IdGenerator 函数；每次调用生成符合所配置格式的新字符串。',
    errorCases: [{ condition: 'alphabet 太短、size 太小或前缀包含不允许字符', handling: '按预期数量计算碰撞风险，并在写入前验证最终 ID 格式。' }],
    relatedApis: ['generateId', 'UIMessage'],
  },
  DefaultGeneratedFile: {
    learningLevel: 'reference', runtime: 'server',
    parameters: [
      { name: 'data', type: 'string | Uint8Array', required: true, description: 'base64 字符串或原始字节；类会按需惰性转换另一种表示。' },
      { name: 'mediaType', type: 'string', required: true, description: '文件的 IANA MIME 类型，例如 image/png。' },
    ],
    expectedOutput: 'GeneratedFile 实例，暴露 base64、uint8Array 和 mediaType。',
    errorCases: [{ condition: '错误 base64、错误 MIME 或对大文件同时保留两种表示', handling: '构造前验证媒体类型/大小；大文件优先对象存储或流，避免进程内内存翻倍。' }],
    relatedApis: ['generateImage', 'generateSpeech', 'experimental_generateVideo'],
  },
  useChat: {
    learningLevel: 'core', runtime: 'client',
    parameters: [
      { name: 'transport', type: 'ChatTransport', required: false, defaultValue: 'DefaultChatTransport({ api: "/api/chat" })', description: '决定消息如何发送并读取 UIMessage stream；可用 HTTP 或 DirectChatTransport。' },
      { name: 'id / messages', type: 'string | UIMessage[]', required: false, description: '稳定会话 ID 与初始历史；恢复或跨组件共享状态时必须保持一致。' },
      { name: 'onToolCall / sendAutomaticallyWhen', type: 'callback', required: false, description: '客户端工具到达时执行或提交结果，并决定是否自动继续下一轮。' },
      { name: 'onFinish / onError', type: 'callback', required: false, description: '一次流结束或失败时更新持久化、提示和观测。' },
    ],
    expectedOutput: 'Chat helpers：id、messages、status、error、sendMessage、regenerate、stop、resumeStream、setMessages、addToolOutput 等。',
    errorCases: [
      { condition: 'HTTP/流协议失败或服务端返回非兼容 UIMessage stream', handling: '读取 error/status，允许用户重试；客户端与服务端固定兼容 AI SDK 协议版本。' },
      { condition: '同一会话重复初始化或消息 ID 不稳定', handling: '将 Chat/transport 生命周期提升到稳定组件边界，持久化 ID 而不是按渲染重新生成。' },
    ], relatedApis: ['UIMessage', 'DirectChatTransport', 'createUIMessageStreamResponse', 'convertToModelMessages'],
  },
  useCompletion: {
    learningLevel: 'core', runtime: 'client',
    parameters: [
      { name: 'api', type: 'string', required: false, defaultValue: '/api/completion', description: '接收纯文本流补全请求的服务端地址。' },
      { name: 'initialCompletion / id', type: 'string', required: false, description: '初始文本与可共享这份 completion 状态的稳定 ID。' },
      { name: 'headers / body / credentials', type: 'request options', required: false, description: '附加请求配置；动态敏感值应在调用时读取而不是写死。' },
    ],
    expectedOutput: 'completion、complete(prompt)、stop、setCompletion、error、isLoading 和输入辅助状态。',
    errorCases: [{ condition: '补全接口返回错误、流中断或用户连续提交', handling: '显示 error，提交时禁用重复操作；新请求前按产品语义停止或等待旧请求。' }],
    relatedApis: ['useChat', 'streamText'],
  },
  useObject: {
    learningLevel: 'advanced', runtime: 'client',
    parameters: [
      { name: 'api', type: 'string', required: true, description: '返回流式 JSON 文本的接口地址。' },
      { name: 'schema', type: 'Zod Schema | JSON Schema', required: true, description: '最终完整对象必须满足的结构；该 Hook 以 experimental_useObject 别名导入。' },
      { name: 'initialValue / id', type: 'DeepPartial<RESULT> | string', required: false, description: '首屏部分对象和用于共享 Hook 状态的 ID。' },
      { name: 'onFinish / onError', type: 'callback', required: false, description: '最终校验完成或请求失败时的处理。' },
    ],
    expectedOutput: 'object 为不断更新的 DeepPartial<RESULT>，另有 submit、stop、clear、error 和 isLoading。',
    errorCases: [{ condition: '流式阶段字段暂缺，或最终对象未通过 schema', handling: '渲染时对每层字段做 undefined 处理；只有 onFinish 得到有效完整对象后才能触发不可逆业务动作。' }],
    relatedApis: ['Output', 'streamText', 'jsonSchema'],
  },
  convertToModelMessages: {
    learningLevel: 'core', runtime: 'server',
    parameters: [
      { name: 'uiMessages', type: 'UIMessage[]', required: true, description: '已经验证过、面向界面的消息历史。' },
      { name: 'tools', type: 'ToolSet', required: false, description: '转换工具 part 时用于识别输入输出类型及 provider-executed 工具。' },
      { name: 'convertDataPart', type: 'DataPart conversion callback', required: false, description: '显式决定哪些自定义 data part 以及如何转换成模型可见内容。' },
      { name: 'ignoreIncompleteToolCalls', type: 'boolean', required: false, defaultValue: 'false', description: '恢复未完成流时是否忽略不完整工具调用。' },
    ],
    expectedOutput: 'Promise<ModelMessage[]>，只保留模型协议需要的角色、内容、文件和工具上下文。',
    errorCases: [{ condition: '自定义 data/tool part 无转换规则或消息未经验证', handling: '先 validateUIMessages；默认不把 UI metadata/内部错误送入 prompt，缺少规则时明确拒绝。' }],
    relatedApis: ['UIMessage', 'ModelMessage', 'validateUIMessages', 'generateText', 'streamText'],
  },
  pruneMessages: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'messages', type: 'ModelMessage[]', required: true, description: '需要缩减但必须保持协议有效的模型消息。' },
      { name: 'reasoning', type: "'all' | 'before-last-message' | 'none'", required: false, defaultValue: 'none', description: '删除 reasoning part 的范围。' },
      { name: 'toolCalls', type: 'Tool pruning strategy | strategy[]', required: false, defaultValue: 'none', description: '按位置和可选 toolName 移除工具调用、结果与审批内容。' },
      { name: 'emptyMessages', type: "'keep' | 'remove'", required: false, defaultValue: 'remove', description: '裁剪后是否保留 content 为空的消息。' },
    ],
    expectedOutput: '新的 ModelMessage[]；原数组顺序保留，匹配策略的 part 被移除。',
    errorCases: [{ condition: '裁剪导致关键业务事实或安全指令丢失', handling: '安全系统消息不参与普通裁剪；长期事实先摘要/持久化，并用回归测试验证工具调用结果仍成对。' }],
    relatedApis: ['ModelMessage', 'convertToModelMessages', 'generateText', 'streamText'],
  },
  createUIMessageStream: {
    learningLevel: 'core', runtime: 'server',
    parameters: [
      { name: 'execute', type: '({ writer }) => void | Promise<void>', required: true, description: '通过 writer.write 写 UIMessageChunk，或 writer.merge 合并模型 UI 流。' },
      { name: 'originalMessages', type: 'UIMessage[]', required: false, description: '提供后启用持久化模式，使响应消息能续接原历史。' },
      { name: 'onFinish', type: 'FinishCallback', required: false, description: '流结束后接收更新后的 messages、responseMessage、是否取消和 finishReason。' },
      { name: 'onError / generateId', type: 'callback | IdGenerator', required: false, description: '把内部错误转换成安全文本，并生成稳定消息/part ID。' },
    ],
    expectedOutput: 'ReadableStream<UIMessageChunk>；可以承载 text、reasoning、tool、source、file 与 data-* 事件。',
    errorCases: [{ condition: '相同内容块的 start/delta/end ID 不一致，或 merge 的流协议损坏', handling: '为每个块生成并复用稳定 ID；在测试中用 readUIMessageStream 完整消费并断言最终消息。' }],
    relatedApis: ['createUIMessageStreamResponse', 'pipeUIMessageStreamToResponse', 'readUIMessageStream', 'streamText'],
  },
  createUIMessageStreamResponse: {
    learningLevel: 'core', runtime: 'server',
    parameters: [
      { name: 'stream', type: 'ReadableStream<UIMessageChunk>', required: true, description: '已经按 AI SDK UI 协议产生的消息流。' },
      { name: 'status / statusText / headers', type: 'number | string | HeadersInit', required: false, defaultValue: 'status: 200', description: '最终 Web Response 的状态与附加 header。' },
      { name: 'consumeSseStream', type: '({ stream }) => void | PromiseLike<void>', required: false, description: '独立消费 tee 出的 SSE 副本，例如确保 serverless 流完成。' },
    ],
    expectedOutput: '标准 Web Response，body 持续输出 UIMessage SSE，带协议需要的内容类型与缓存控制。',
    errorCases: [{ condition: '代理缓冲、缓存流，或调用方覆盖协议关键 header', handling: '禁用响应缓存和代理缓冲；保留 SDK 生成的 content-type，并以真实部署链路验证首块到达。' }],
    relatedApis: ['createUIMessageStream', 'pipeUIMessageStreamToResponse', 'useChat'],
  },
  pipeUIMessageStreamToResponse: {
    learningLevel: 'advanced', runtime: 'server',
    parameters: [
      { name: 'response', type: 'ServerResponse', required: true, description: '需要写入 UIMessage SSE 的 Node.js 原生响应对象。' },
      { name: 'stream', type: 'ReadableStream<UIMessageChunk>', required: true, description: '由 createUIMessageStream 或模型结果产生的协议流。' },
      { name: 'status / headers / consumeSseStream', type: 'response options', required: false, description: 'Node 响应初始化信息和可选的 SSE 副本消费者。' },
    ],
    expectedOutput: '无业务返回值；函数把流编码并持续写入 ServerResponse，直到关闭。',
    errorCases: [{ condition: '首块后再修改状态/header，或客户端断开但上游继续生成', handling: '写流前完成 header；监听 close 并通过 AbortSignal 取消模型，之后不要再 res.json。' }],
    relatedApis: ['createUIMessageStream', 'createUIMessageStreamResponse', 'pipeAgentUIStreamToResponse'],
  },
  readUIMessageStream: {
    learningLevel: 'advanced', runtime: 'both',
    parameters: [
      { name: 'stream', type: 'ReadableStream<UIMessageChunk>', required: true, description: '需要还原为完整消息快照的 UIMessage chunk 流。' },
      { name: 'message', type: 'UIMessage', required: false, description: '恢复流时作为起点的上一条 assistant 消息。' },
      { name: 'onError / terminateOnError', type: 'callback | boolean', required: false, defaultValue: 'terminateOnError: false', description: '观察处理错误并决定出错后是否终止迭代。' },
    ],
    expectedOutput: 'AsyncIterableStream<UIMessage>；每次迭代都是同一消息逐步完成后的最新完整快照。',
    errorCases: [{ condition: 'chunk 顺序、ID 或 start/end 协议无效', handling: 'onError 记录 part 类型和 ID；安全关键消费者使用 terminateOnError，避免持久化半条错误消息。' }],
    relatedApis: ['createUIMessageStream', 'UIMessage', 'useChat'],
  },
  InferUITools: {
    learningLevel: 'reference', runtime: 'both',
    parameters: [{ name: 'TOOLS', type: 'ToolSet generic', required: true, description: '需要整体映射为 UI 工具输入/输出类型的服务端工具集合类型。' }],
    expectedOutput: 'TypeScript 映射类型；每个工具名对应可用于 UIMessage 工具 part 的 input/output 类型。',
    errorCases: [{ condition: '为了复用 typeof tools 把服务端实现和密钥带进客户端 bundle', handling: '把 Tool 类型通过 type-only 模块导出；运行时消息仍调用 validateUIMessages。' }],
    relatedApis: ['InferUITool', 'UIMessage', 'tool'],
  },
  InferUITool: {
    learningLevel: 'reference', runtime: 'both',
    parameters: [{ name: 'TOOL', type: 'Tool generic', required: true, description: '需要推断单个 UI 工具 input/output 的 Tool 类型。' }],
    expectedOutput: '形如 { input: InferToolInput<TOOL>; output: InferToolOutput<TOOL> } 的 TypeScript 类型。',
    errorCases: [{ condition: '组件只按 output-available 编写而忽略其他状态', handling: '使用推断类型同时覆盖 input-streaming、input-available、approval、output-error 等 UI 状态。' }],
    relatedApis: ['InferUITools', 'UIMessage', 'tool'],
  },
  DirectChatTransport: {
    learningLevel: 'advanced', runtime: 'both',
    parameters: [
      { name: 'agent', type: 'Agent', required: true, description: '在同一进程直接运行、无需 HTTP 的 Agent。' },
      { name: 'options', type: 'CALL_OPTIONS', required: false, description: '每次调用 agent.stream() 时传入的自定义 Agent options。' },
      { name: 'originalMessages / generateMessageId', type: 'UIMessage[] | IdGenerator', required: false, description: '持久化模式的历史消息和响应消息 ID 生成器。' },
      { name: 'sendReasoning / sendSources / onError', type: 'boolean | callback', required: false, description: '控制流中包含哪些内容，以及如何把内部错误转为安全消息。' },
    ],
    expectedOutput: 'ChatTransport；sendMessages() 返回 Promise<ReadableStream<UIMessageChunk>>，可直接传给 useChat。',
    errorCases: [{ condition: '在浏览器使用带服务端 API key 的 Agent，或误以为支持断线恢复', handling: '只在可信同进程环境使用；Web 生产应用保留服务端边界，且 Direct transport 的 reconnectToStream 始终无法恢复。' }],
    relatedApis: ['useChat', 'Agent', 'ToolLoopAgent', 'UIMessage'],
  },
} satisfies Record<string, AiSdkLearningMeta>

export type AiSdkLearningMetaName = keyof typeof aiSdkLearningMeta

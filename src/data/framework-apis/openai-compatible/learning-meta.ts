import type { FrameworkApiLearningMeta, FrameworkApiLearningLevel, FrameworkApiParameter, FrameworkApiRuntime } from '../types'

const p = (name: string, type: string, required: boolean, description: string, defaultValue?: string): FrameworkApiParameter => ({ name, type, required, description, ...(defaultValue === undefined ? {} : { defaultValue }) })
const meta = (learningLevel: FrameworkApiLearningLevel, runtime: FrameworkApiRuntime, parameters: FrameworkApiParameter[], expectedOutput: string, condition: string, handling: string, relatedApis: string[]): FrameworkApiLearningMeta => ({ learningLevel, runtime, parameters, expectedOutput, errorCases: [{ condition, handling }], relatedApis })

export const openAiCompatibleLearningMeta = {
  createOpenAICompatible: meta('core', 'server', [
    p('settings.name', 'string', true, '写入 provider metadata 和诊断信息的稳定供应商名称，不应包含用户输入。'),
    p('settings.baseURL', 'string', true, '兼容 API 的可信服务端根地址，通常包含固定版本路径且禁止动态拼接。'),
    p('settings.apiKey', 'string', false, '仅在服务端读取的供应商认证密钥，不得序列化到客户端代码。'),
    p('settings.headers', 'Record<string, string>', false, '应用到供应商请求的受信附加请求头，可承载服务端派生租户标识。'),
  ], '返回可调用的 OpenAICompatibleProvider 工厂对象，并提供语言、补全、向量和图像模型创建方法。', 'baseURL 不可信、认证失败、服务并非真正兼容或配置能力声明错误', '启动时验证 URL 允许列表和密钥；用契约测试覆盖文本、流、工具、usage 与错误响应。', ['OpenAICompatibleProviderSettings', 'provider(modelId)', 'provider.languageModel']),
  OpenAICompatibleProviderSettings: meta('core', 'server', [
    p('name', 'string', true, '用于标识该兼容 Provider 的稳定名称，也会影响日志和元数据字段命名。'),
    p('baseURL', 'string', true, '所有模型请求使用的兼容服务根地址，必须来自部署配置而非客户端参数。'),
    p('supportsStructuredOutputs', 'boolean', false, '声明目标服务是否真正支持结构化输出协议，需要契约测试证明。', 'false'),
    p('includeUsage', 'boolean', false, '控制流式和非流式结果是否尝试转换供应商返回的 token usage。'),
  ], 'TypeScript 配置合同本身不发起网络请求；交给工厂后决定连接、能力声明和响应适配行为。', '声明了供应商不支持的能力、覆盖认证头或 transformRequestBody 破坏协议', '按能力矩阵逐项开启开关；保护 Authorization 并对请求变换做固定输入输出快照测试。', ['createOpenAICompatible', 'MetadataExtractor', 'provider(modelId)']),
  'provider(modelId)': meta('core', 'server', [
    p('modelId', 'string', true, '目标兼容端点已部署且在服务端允许列表中的聊天模型标识。'),
    p('provider', 'OpenAICompatibleProvider', true, '由 createOpenAICompatible 创建并保存连接设置的 Provider 实例。'),
    p('coreCall', 'generateText | streamText', true, '真正执行请求并提供标准结果合同的 AI SDK Core API。'),
  ], '返回 LanguageModelV4 适配对象；只有交给 generateText 或 streamText 后才发送实际 HTTP 请求。', 'modelId 不存在、聊天端点不兼容或流式事件格式与适配器预期不同', '限制模型 ID 并在启动时探测能力；解析失败时保存脱敏响应样本并按供应商降级。', ['createOpenAICompatible', 'provider.languageModel', 'provider.chatModel']),
  'provider.languageModel': meta('core', 'server', [
    p('modelId', 'string', true, '要访问的兼容语言模型标识，必须由可信模型路由配置提供。'),
    p('config', 'OpenAICompatibleChatConfig', false, '针对这个模型覆盖支持 URL 等局部兼容行为的配置对象。'),
    p('supportedUrls', 'Record<string, RegExp[]>', false, '允许模型直接读取的 URL 模式，规则过宽会引入服务端请求风险。'),
  ], '返回配置完成的 LanguageModelV4，可被所有支持语言模型合同的 AI SDK Core API 使用。', 'supportedUrls 过宽、模型能力与配置不一致或输入模态不被供应商接受', '使用最窄 URL 规则和模型能力表；发送前校验媒体来源并对不兼容输入提前拒绝。', ['provider(modelId)', 'provider.chatModel', 'OpenAICompatibleProviderSettings']),
  'provider.chatModel': meta('core', 'server', [
    p('modelId', 'string', true, '明确走 Chat Completions 风格端点的供应商模型标识。'),
    p('messages', 'ModelMessage[]', true, '由 Core API 转换并发送给聊天端点的多角色消息与内容块。'),
    p('tools', 'ToolSet', false, '可选工具 schema 集合，目标供应商必须支持对应 tool calling 语义。'),
  ], '返回聊天语义 LanguageModelV4；执行后产生文本、工具调用、usage、warnings 和供应商元数据。', '供应商只部分实现工具协议、角色消息不兼容或流式 tool arguments 无法组装', '上线前测试多轮消息和并行工具；对无效工具参数做 schema 校验并保留安全错误恢复。', ['provider(modelId)', 'provider.languageModel', 'provider.completionModel']),
  'provider.completionModel': meta('advanced', 'server', [
    p('modelId', 'string', true, '明确部署在传统文本补全端点而非聊天端点的模型标识。'),
    p('prompt', 'string', true, '发送给补全模型的单段文本输入，不包含多角色消息协议。'),
  ], '返回 completion 语义 LanguageModelV4；Core API 调用后得到标准文本结果和可用的 usage 信息。', '错误把 chat 模型用于 completion、供应商移除旧端点或特殊参数不兼容', '模型目录明确标注端点类型；新对话业务优先 chat 模型，旧补全链路保留回归测试。', ['provider.chatModel', 'provider(modelId)', 'OpenAICompatibleProviderSettings']),
  'provider.embeddingModel': meta('core', 'server', [
    p('modelId', 'string', true, '用于入库和查询的兼容 embedding 模型标识，版本必须保持一致。'),
    p('value', 'string | string[]', true, '交给 embed 或 embedMany 转成向量的文本或批量文本内容。'),
    p('expectedDimension', 'number', true, '应用索引约定的向量维度，用于写入前验证供应商返回长度。'),
  ], '返回 EmbeddingModelV4；Core API 执行后得到数值向量数组、token usage 与可选供应商元数据。', '返回维度变化、批量上限超出、空文本或查询模型与入库模型不一致', '写入前校验维度并限制批量大小；模型升级新建版本化索引并重新生成全部历史向量。', ['provider.textEmbeddingModel', 'createOpenAICompatible', 'OpenAICompatibleProviderSettings']),
  'provider.textEmbeddingModel': meta('reference', 'server', [
    p('modelId', 'string', true, '旧代码传入的兼容 embedding 模型标识，行为与新方法一致。'),
  ], '返回与 provider.embeddingModel 相同的 EmbeddingModelV4；这是 deprecated 兼容别名。', '新代码继续扩散 deprecated 方法或升级后别名被移除导致编译失败', '立即迁移到 provider.embeddingModel，并用向量维度和相似度回归测试确认行为未变。', ['provider.embeddingModel', 'createOpenAICompatible']),
  'provider.imageModel': meta('advanced', 'server', [
    p('modelId', 'string', true, '目标供应商兼容图像生成端点中实际部署的模型标识。'),
    p('prompt', 'string', true, '交给 generateImage 的受控图像描述，需要结合内容安全规则审核。'),
    p('sizeOrAspectRatio', 'string', false, '供应商支持的尺寸或宽高比配置，兼容端点之间差异通常较大。'),
  ], '返回 ImageModelV4；generateImage 执行后得到 GeneratedFile 列表、warnings 与供应商扩展元数据。', '供应商不支持所选尺寸、返回格式不同、内容策略拒绝或生成文件过大', '维护参数能力矩阵并处理 warnings；限制文件大小，完成审核后再写入受控对象存储。', ['createOpenAICompatible', 'OpenAICompatibleProviderSettings', 'MetadataExtractor']),
  MetadataExtractor: meta('advanced', 'server', [
    p('extractMetadata', 'function', true, '从非流式解析响应提取受控供应商扩展字段的异步函数。'),
    p('createStreamExtractor', 'function', true, '为每次流式请求创建独立累积器，避免并发请求共享可变状态。'),
    p('processChunk', 'function', true, '逐个接收供应商流式 chunk 并只保留构建最终元数据所需内容。'),
  ], '完整响应返回 providerMetadata；流式路径在结束时通过 buildMetadata 产出同一命名空间的扩展数据。', '累积器无界增长、并发共享状态、原始 Prompt 或密钥被写入 metadata', '每次请求创建独立有界提取器；字段白名单和脱敏后再返回，并为异常 chunk 提供降级。', ['OpenAICompatibleProviderSettings', 'createOpenAICompatible', 'provider(modelId)']),
} satisfies Record<string, FrameworkApiLearningMeta>

import { MCP_SPEC, mcpApi } from './helpers'

const PROMPTS = `${MCP_SPEC}/server/prompts`
const RESOURCES = `${MCP_SPEC}/server/resources`
const TOOLS = `${MCP_SPEC}/server/tools`

export const mcpServerFeatureApis = [
  mcpApi({
    name: 'prompts/list', group: 'Prompts', kind: 'function', signature: 'prompts/list({ cursor? }): ListPromptsResult',
    beginner: '客户端先用它询问服务端有哪些可复用提示模板。返回的是模板目录，不是已经填好变量的最终消息。',
    whenToUse: '服务端声明 prompts capability，客户端要展示斜杠命令、模板菜单或同步模板列表时。',
    example: `{"jsonrpc":"2.0","id":10,"method":"prompts/list","params":{"cursor":"next-page"}}`,
    returns: 'Prompt 数组与可选 nextCursor；每项包含 name、可选 title/description 和 arguments。',
    interview: 'Prompts 是用户控制的能力：通常由用户显式选择；list 和 get 分开是为了发现、分页和按需实例化。',
    pitfall: '不要把 prompt 列表当工具列表自动交给模型，也不要忽略 nextCursor 导致大目录被截断。', officialUrl: PROMPTS,
  }),
  mcpApi({
    name: 'prompts/get', group: 'Prompts', kind: 'function', signature: 'prompts/get({ name, arguments? }): GetPromptResult',
    beginner: '选定某个模板后，用它把参数填进去，得到真正可以交给模型或展示给用户的一组 PromptMessage。',
    whenToUse: '用户已经选择一个 prompt，并提供了该模板要求的参数时。',
    example: `{"jsonrpc":"2.0","id":11,"method":"prompts/get","params":{"name":"review-code","arguments":{"language":"typescript"}}}`,
    returns: 'GetPromptResult，包含可选 description 与 messages；消息内容可以是文本、图片、音频或嵌入资源。',
    interview: '模板实例化仍在服务端完成，客户端负责用户确认与模型调用；Prompt 内容也应视为不可信输入。',
    pitfall: '必须校验必填参数、长度和权限；不要因为模板来自 MCP server 就跳过 prompt injection 防护。', officialUrl: PROMPTS,
  }),
  mcpApi({
    name: 'resources/list', group: 'Resources', kind: 'function', signature: 'resources/list({ cursor? }): ListResourcesResult',
    beginner: '它列出服务端当前提供的具体资源，例如某个文件、数据库 schema 或知识文档，相当于可读取上下文的目录。',
    whenToUse: '客户端需要让用户或应用浏览可用资源，并且服务端声明 resources capability 时。',
    example: `{"jsonrpc":"2.0","id":12,"method":"resources/list","params":{}}`,
    returns: 'Resource 数组和可选 nextCursor；资源项含 uri、name、可选 title/description/mimeType/size。',
    interview: 'Resources 是 application-controlled 上下文，不应该像工具一样由模型任意执行；读取前仍需 host 决定是否附加。',
    pitfall: '列表可分页且可能很大；客户端必须做 URI 信任、租户隔离和大小预算，不能自动读取全部资源。', officialUrl: RESOURCES,
  }),
  mcpApi({
    name: 'resources/templates/list', group: 'Resources', kind: 'function', signature: 'resources/templates/list({ cursor? }): ListResourceTemplatesResult',
    beginner: '普通 resources/list 给出具体资源，这个方法给出带变量的 URI 模板，例如 repo://{owner}/{name}/README。',
    whenToUse: '资源集合是动态或无限的，无法提前枚举每个具体 URI，需要用户填写模板变量时。',
    example: `{"jsonrpc":"2.0","id":13,"method":"resources/templates/list","params":{}}`,
    returns: 'ResourceTemplate 数组与 nextCursor，每项包含 uriTemplate、name 和可选展示元数据。',
    interview: '模板解决动态寻址，不代表任意 URI 都有权限；通常结合 completion/complete 帮助填写变量。',
    pitfall: '不要把用户变量直接拼接到文件路径或 SQL；解析 URI template 后仍需规范化并检查授权范围。', officialUrl: RESOURCES,
  }),
  mcpApi({
    name: 'resources/read', group: 'Resources', kind: 'function', signature: 'resources/read({ uri }): ReadResourceResult',
    beginner: '给定一个 URI 后，它真正读取资源内容；文本资源放在 text，二进制资源用 base64 blob 返回。',
    whenToUse: '用户或应用已经选择具体资源，并确认它应进入当前上下文时。',
    example: `{"jsonrpc":"2.0","id":14,"method":"resources/read","params":{"uri":"file:///workspace/README.md"}}`,
    returns: 'contents 数组；每项是 TextResourceContents 或 BlobResourceContents，并带原始 uri 和可选 MIME 类型。',
    interview: '资源 URI 是协议标识，不是授权凭证；Host 要控制是否读取、是否发送给模型以及上下文预算。',
    pitfall: '防止路径穿越、SSRF、超大资源和敏感文件泄露；二进制 blob 还需要严格限制解码大小。', officialUrl: RESOURCES,
  }),
  mcpApi({
    name: 'resources/subscribe', group: 'Resources', kind: 'function', signature: 'resources/subscribe({ uri }): EmptyResult',
    beginner: '客户端订阅一个会变化的资源，之后服务端在内容更新时发送 resources/updated 通知。',
    whenToUse: '服务端声明 resources.subscribe，客户端需要让文件、状态面板或动态数据保持新鲜时。',
    example: `{"jsonrpc":"2.0","id":15,"method":"resources/subscribe","params":{"uri":"file:///workspace/plan.md"}}`,
    returns: '成功时空结果；真正的变化通过后续 notification 到达，客户端通常再调用 resources/read。',
    interview: '订阅通知只表示“可能变化”，并不携带完整新内容；这种失效通知模型能避免推送巨大资源。',
    pitfall: '断线重连要恢复订阅，并在页面离开时 unsubscribe；否则会产生泄漏和重复通知。', officialUrl: RESOURCES,
  }),
  mcpApi({
    name: 'resources/unsubscribe', group: 'Resources', kind: 'function', signature: 'resources/unsubscribe({ uri }): EmptyResult',
    beginner: '它取消先前的资源订阅，告诉服务端不必再为这个客户端推送该 URI 的更新。',
    whenToUse: '资源不再显示、会话结束、租户切换或客户端准备释放连接时。',
    example: `{"jsonrpc":"2.0","id":16,"method":"resources/unsubscribe","params":{"uri":"file:///workspace/plan.md"}}`,
    returns: '成功时返回空结果，服务端应停止发送对应 resources/updated。',
    interview: 'subscribe/unsubscribe 是有状态会话操作，生命周期治理和重连恢复同样重要。',
    pitfall: '不要对未订阅 URI 反复取消，也不要忘记租户切换时清理旧订阅。', officialUrl: RESOURCES,
  }),
  mcpApi({
    name: 'tools/list', group: 'Tools', kind: 'function', signature: 'tools/list({ cursor? }): ListToolsResult',
    beginner: '客户端用它发现服务端允许模型调用哪些工具，以及每个工具需要什么 JSON Schema 参数。',
    whenToUse: '握手确认 tools capability 后，在模型调用前加载或刷新工具目录。',
    example: `{"jsonrpc":"2.0","id":17,"method":"tools/list","params":{}}`,
    returns: 'Tool 数组和 nextCursor；工具包含 name、description、inputSchema、可选 outputSchema/annotations/execution。',
    interview: '工具由模型选择但由 Host 授权执行；annotations 只是提示，不是可信安全策略。2025-11 还可声明 taskSupport。',
    pitfall: '不要把所有工具无条件暴露给每个用户；按身份过滤、校验 schema，并处理 list_changed 后的缓存失效。', officialUrl: TOOLS,
  }),
  mcpApi({
    name: 'tools/call', group: 'Tools', kind: 'function', signature: 'tools/call({ name, arguments?, task? }): CallToolResult | CreateTaskResult',
    beginner: '它真正执行一个已发现的工具。客户端给出工具名和参数，服务端校验权限后运行并返回内容或结构化结果。',
    whenToUse: '模型选择工具、用户确认高风险动作，并且参数已经通过客户端与服务端双重校验时。',
    example: `{"jsonrpc":"2.0","id":18,"method":"tools/call","params":{"name":"search_resumes","arguments":{"keyword":"TypeScript"}}}`,
    returns: '同步时返回 CallToolResult.content/structuredContent/isError；任务增强时可先返回 CreateTaskResult。',
    interview: '工具调用最关键的边界是 schema 不等于授权：身份必须来自可信会话，副作用要幂等，isError 是工具级失败而非 JSON-RPC 传输失败。',
    pitfall: '不要信任模型传入的 userId/tenantId，也不要在没有用户确认、超时、幂等键和结果大小限制时执行写操作。', officialUrl: TOOLS,
  }),
]

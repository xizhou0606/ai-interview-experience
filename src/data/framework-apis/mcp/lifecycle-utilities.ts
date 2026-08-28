import { MCP_SPEC, mcpApi } from './helpers'

const LIFECYCLE = `${MCP_SPEC}/basic/lifecycle`
const PING = `${MCP_SPEC}/basic/utilities/ping`
const CANCELLATION = `${MCP_SPEC}/basic/utilities/cancellation`
const PROGRESS = `${MCP_SPEC}/basic/utilities/progress`
const LOGGING = `${MCP_SPEC}/server/utilities/logging`
const COMPLETION = `${MCP_SPEC}/server/utilities/completion`

export const mcpLifecycleUtilityApis = [
  mcpApi({
    name: 'initialize', group: '生命周期与能力协商', kind: 'function', signature: 'initialize({ protocolVersion, capabilities, clientInfo }): InitializeResult',
    beginner: '这是一次 MCP 连接真正开始工作的握手。客户端先说明自己支持的协议版本和能力，服务端再返回最终协商版本、服务能力与身份信息。',
    whenToUse: '每条新连接的第一条请求必须是 initialize；在它成功前不能调用 tools/list、resources/read 等业务方法。',
    example: `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{"roots":{}},"clientInfo":{"name":"interview-host","version":"1.0.0"}}}`,
    returns: 'InitializeResult，包含双方最终使用的 protocolVersion、serverInfo、capabilities，以及可选 instructions。',
    interview: '面试时要说清楚 MCP 不是连上就能随便调用，而是先做版本与 capability negotiation；后续只能使用握手中双方声明过的能力。',
    pitfall: '不要忽略服务端返回的版本，也不要把本地支持能力当作远端已支持；Streamable HTTP 后续请求还必须带 MCP-Protocol-Version。', officialUrl: LIFECYCLE,
  }),
  mcpApi({
    name: 'notifications/initialized', group: '生命周期与能力协商', kind: 'object', signature: 'notifications/initialized: notification<void>',
    beginner: '客户端收到 initialize 成功结果后，用这条无响应通知告诉服务端：“握手完成，现在可以进入正常工作阶段了”。',
    whenToUse: '只在 initialize 成功后发送一次，然后才能开始普通请求与通知交换。',
    example: `{"jsonrpc":"2.0","method":"notifications/initialized"}`,
    returns: '通知不带 id，因此服务端不会返回 JSON-RPC result；它只推动连接状态机进入 operation 阶段。',
    interview: 'initialize 是有响应的 request，initialized 是无响应的 notification；区分二者能证明你理解 MCP 生命周期而不只是记住工具调用。',
    pitfall: '不要给 notification 添加 id 或等待响应；也不要在 initialize 失败后继续发送它。', officialUrl: LIFECYCLE,
  }),
  mcpApi({
    name: 'ping', group: '基础工具', kind: 'function', signature: 'ping(): EmptyResult',
    beginner: 'ping 是最小健康探测：它不做业务操作，只确认对端仍能接收并正确响应 MCP 请求。',
    whenToUse: '长连接空闲、怀疑对端进程卡死，或连接池准备复用会话之前。',
    example: `{"jsonrpc":"2.0","id":2,"method":"ping"}`,
    returns: '成功时返回空 result；超时、连接关闭或 JSON-RPC error 表示会话不可继续信任。',
    interview: '说明 ping 只能证明协议端点有响应，不能证明模型、数据库或每个工具都健康；生产探针仍需分层。',
    pitfall: '不要高频 ping 制造无意义负载，也不要把一次 ping 成功当作业务依赖全部可用。', officialUrl: PING,
  }),
  mcpApi({
    name: 'notifications/cancelled', group: '基础工具', kind: 'object', signature: 'notifications/cancelled({ requestId, reason? }): notification<void>',
    beginner: '任一方不再需要某个仍在执行的请求时，用它通知对端尽快停止，并通过 requestId 指向原请求。',
    whenToUse: '用户点击停止、上游超时、页面离开，或服务端发现继续执行已经没有意义时。',
    example: `{"jsonrpc":"2.0","method":"notifications/cancelled","params":{"requestId":42,"reason":"用户停止生成"}}`,
    returns: '无响应通知；对端应尽力取消，但协议不保证副作用一定能回滚或任务一定立即终止。',
    interview: '取消是协作信号而不是事务回滚。可靠设计还需要 AbortSignal、幂等副作用和最终状态查询。',
    pitfall: '不要假设发出 cancelled 后数据库写入会自动撤销；requestId 也必须来自当前会话，避免取消错任务。', officialUrl: CANCELLATION,
  }),
  mcpApi({
    name: 'notifications/progress', group: '基础工具', kind: 'object', signature: 'notifications/progress({ progressToken, progress, total?, message? }): notification<void>',
    beginner: '长任务可以用它持续报告当前进度。progressToken 像快递单号，把多次进度通知和最初的请求关联起来。',
    whenToUse: '文件解析、批量索引、长时间工具调用等无法立即完成，但用户需要看到进展时。',
    example: `{"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"job-7","progress":40,"total":100,"message":"正在建立索引"}}`,
    returns: '无响应通知，携带递增 progress、可选 total 与人类可读 message。',
    interview: '进度通知是请求外的旁路事件，依靠调用方在原请求 _meta 中提供的 progressToken 相关联；它不是最终结果。',
    pitfall: 'progress 不应倒退，total 变化要有明确定义；不要把敏感内部路径或原始文档内容写入 message。', officialUrl: PROGRESS,
  }),
  mcpApi({
    name: 'logging/setLevel', group: '日志与自动补全', kind: 'function', signature: 'logging/setLevel({ level }): EmptyResult',
    beginner: '客户端用它告诉服务端只发送指定严重级别及以上的结构化日志，例如把开发期 debug 调整为生产期 warning。',
    whenToUse: '服务端声明 logging capability，并且客户端需要动态控制日志噪声时。',
    example: `{"jsonrpc":"2.0","id":3,"method":"logging/setLevel","params":{"level":"warning"}}`,
    returns: '成功时返回空结果；之后服务端按新级别发送 notifications/message。',
    interview: '它控制的是 MCP 会话内的日志通知阈值，不等于修改服务端所有进程日志；还要提 capability 检查与敏感信息脱敏。',
    pitfall: '不要在服务端未声明 logging 时调用，也不要把日志级别当权限边界或把用户原文直接输出到日志。', officialUrl: LOGGING,
  }),
  mcpApi({
    name: 'notifications/message', group: '日志与自动补全', kind: 'object', signature: 'notifications/message({ level, logger?, data }): notification<void>',
    beginner: '服务端通过这条通知把结构化运行日志交给客户端展示或记录，data 可以是文本，也可以是结构化对象。',
    whenToUse: '客户端已经协商 logging capability，并且日志级别满足当前 setLevel 阈值时。',
    example: `{"jsonrpc":"2.0","method":"notifications/message","params":{"level":"warning","logger":"resume-parser","data":{"code":"OCR_LOW_CONFIDENCE"}}}`,
    returns: '无响应通知，携带 level、可选 logger 名和任意 JSON 可序列化 data。',
    interview: '说明结构化日志有利于过滤和关联 trace，但日志通知不是业务结果，也不能代替错误响应或监控指标。',
    pitfall: '不要发送密钥、访问令牌或未经脱敏的简历原文；客户端也应限制日志大小和渲染频率。', officialUrl: LOGGING,
  }),
  mcpApi({
    name: 'completion/complete', group: '日志与自动补全', kind: 'function', signature: 'completion/complete({ ref, argument, context? }): CompleteResult',
    beginner: '它为 prompt 参数或资源 URI 模板提供候选补全，效果类似命令行按 Tab，但候选由 MCP 服务端根据上下文计算。',
    whenToUse: '用户正在填写 prompt 参数、资源模板变量，客户端希望给出最多 100 个可选值时。',
    example: `{"jsonrpc":"2.0","id":4,"method":"completion/complete","params":{"ref":{"type":"ref/prompt","name":"review-code"},"argument":{"name":"language","value":"typ"}}}`,
    returns: 'CompleteResult.completion，含 values、可选 total 和 hasMore。',
    interview: '自动补全改善人机交互，但不会执行 prompt 或读取资源；引用对象必须明确是 prompt 还是 resource template。',
    pitfall: '不要返回超过 100 个候选或泄露用户无权看到的名称；context 中的既有参数也必须重新做权限过滤。', officialUrl: COMPLETION,
  }),
]

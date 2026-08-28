import { MCP_SPEC, mcpApi } from './helpers'

const TASKS = `${MCP_SPEC}/basic/utilities/tasks`
const PROMPTS = `${MCP_SPEC}/server/prompts`
const RESOURCES = `${MCP_SPEC}/server/resources`
const TOOLS = `${MCP_SPEC}/server/tools`
const ROOTS = `${MCP_SPEC}/client/roots`
const ELICITATION = `${MCP_SPEC}/client/elicitation`

export const mcpTaskNotificationApis = [
  mcpApi({
    name: 'tasks/get', group: 'Tasks（实验性）', kind: 'function', maturity: 'experimental', signature: 'tasks/get({ taskId }): GetTaskResult',
    beginner: '任务型调用不会一直占着原请求等待。客户端用 taskId 查询当前状态、进度提示和建议的下次轮询间隔。',
    whenToUse: 'tools/call、sampling 或 elicitation 以 task 方式返回，调用方要轮询单个长任务时。',
    example: `{"jsonrpc":"2.0","id":30,"method":"tasks/get","params":{"taskId":"task-abc"}}`,
    returns: 'Task 当前快照，含 status、statusMessage、createdAt、lastUpdatedAt、ttl 和可选 pollInterval。',
    interview: 'tasks/get 只查状态，最终业务 payload 要用 tasks/result；这把长任务建模为可持久轮询的状态机。',
    pitfall: '不要无视 pollInterval 高频轮询，也不要在 terminal 状态后继续请求；taskId 仍需绑定当前身份。', officialUrl: TASKS,
  }),
  mcpApi({
    name: 'tasks/result', group: 'Tasks（实验性）', kind: 'function', maturity: 'experimental', signature: 'tasks/result({ taskId }): GetTaskPayloadResult',
    beginner: '用它等待并领取任务真正结果。任务未结束时该请求会阻塞到 terminal；若状态是 input_required，调用方应主动打开它，以便在同一传输上接收关联的人机输入请求。',
    whenToUse: '已经拿到 taskId，要等待最终 result；或 tasks/get 显示 input_required，需要接收带 related-task 元数据的后续消息时。',
    example: `{"jsonrpc":"2.0","id":31,"method":"tasks/result","params":{"taskId":"task-abc"}}`,
    returns: '任务到达 completed、failed 或 cancelled 后，精确返回原请求本应产生的成功 result 或 JSON-RPC error；非 terminal 状态必须保持等待。',
    interview: 'tasks/get 用于无阻塞观察状态，tasks/result 可以阻塞等待最终结果；input_required 时仍应调用 result 来承载与任务关联的交互消息。',
    pitfall: '不要假设调用后会立即返回，也不要因 result 正在等待就停止所有状态观察；ttl 到期后结果可能已删除。', officialUrl: TASKS,
  }),
  mcpApi({
    name: 'tasks/list', group: 'Tasks（实验性）', kind: 'function', maturity: 'experimental', signature: 'tasks/list({ cursor? }): ListTasksResult',
    beginner: '它分页列出当前一方可见的任务，适合恢复页面、运营面板或断线后重新发现未完成工作。',
    whenToUse: '握手声明 tasks.list，并需要批量查看或恢复当前身份下的任务时。',
    example: `{"jsonrpc":"2.0","id":32,"method":"tasks/list","params":{}}`,
    returns: 'Task 数组与可选 nextCursor，只应包含当前授权范围内的任务。',
    interview: '任务列表是恢复能力的一部分，但协议任务不是业务数据库；长期审计与业务状态仍应进入自己的存储。',
    pitfall: '必须按用户和租户过滤并处理分页；不要把所有会话的任务暴露给任意客户端。', officialUrl: TASKS,
  }),
  mcpApi({
    name: 'tasks/cancel', group: 'Tasks（实验性）', kind: 'function', maturity: 'experimental', signature: 'tasks/cancel({ taskId }): CancelTaskResult',
    beginner: '它请求取消一个已经创建的持久任务，并返回取消后的任务状态，比通用 cancelled notification 更适合异步任务。',
    whenToUse: '对端声明 tasks.cancel，任务处于 working 或 input_required，并且用户有权终止它时。',
    example: `{"jsonrpc":"2.0","id":33,"method":"tasks/cancel","params":{"taskId":"task-abc"}}`,
    returns: 'CancelTaskResult，包含已经转为 cancelled 的 Task；接收方必须先完成状态转换再响应，但已发生副作用不会自动回滚。',
    interview: 'tasks/cancel 是有响应的持久任务操作，notifications/cancelled 是针对请求的尽力通知；两者生命周期不同。',
    pitfall: 'terminal 任务必须以 -32602 拒绝取消；取消前重新鉴权，副作用使用幂等和补偿，不能把 cancelled 等同于业务数据已恢复原状。', officialUrl: TASKS,
  }),
  mcpApi({
    name: 'notifications/tasks/status', group: 'Tasks（实验性）', kind: 'object', maturity: 'experimental', signature: 'notifications/tasks/status({ taskId, status, ...taskFields }): notification<void>',
    beginner: '任务状态发生变化时，对端可以主动推送新快照，减少客户端盲目轮询。',
    whenToUse: '任务执行方希望实时报告 working、input_required、completed、failed 或 cancelled 等状态变化时。',
    example: `{"jsonrpc":"2.0","method":"notifications/tasks/status","params":{"taskId":"task-abc","status":"completed","createdAt":"2026-07-16T08:00:00Z","lastUpdatedAt":"2026-07-16T08:00:05Z","ttl":60000}}`,
    returns: '无响应通知，参数携带完整 Task 状态字段；最终结果仍通过 tasks/result 获取。',
    interview: '推送和轮询可以并存：通知改善实时性，tasks/get 提供断线后的权威收敛。',
    pitfall: '客户端要处理重复、乱序和断线丢失，按 lastUpdatedAt 收敛；通知本身不能作为唯一持久事实。', officialUrl: TASKS,
  }),
  mcpApi({
    name: 'notifications/prompts/list_changed', group: '目录变化通知', kind: 'object', signature: 'notifications/prompts/list_changed: notification<void>',
    beginner: '服务端的 prompt 模板目录变化时，用它告诉客户端缓存已过期，客户端随后重新调用 prompts/list。',
    whenToUse: '服务端声明 prompts.listChanged，并发生模板新增、删除或元数据变化时。',
    example: `{"jsonrpc":"2.0","method":"notifications/prompts/list_changed"}`,
    returns: '无参数、无响应通知；它只表示目录失效，不直接携带新列表。',
    interview: '这是 cache invalidation 事件而非数据同步事件，重新 list 才能得到权威目录。',
    pitfall: '客户端应做去抖，避免变化风暴重复刷新；服务端未声明 listChanged 时不能擅自发送。', officialUrl: PROMPTS,
  }),
  mcpApi({
    name: 'notifications/resources/list_changed', group: '目录变化通知', kind: 'object', signature: 'notifications/resources/list_changed: notification<void>',
    beginner: '可发现资源目录改变时，它提醒客户端重新分页获取 resources/list。',
    whenToUse: 'resources.listChanged 已协商，资源被新增、删除或展示元数据发生变化时。',
    example: `{"jsonrpc":"2.0","method":"notifications/resources/list_changed"}`,
    returns: '无参数、无响应通知；客户端自行决定何时刷新目录。',
    interview: '目录变化与单个资源内容变化不同：前者 list_changed，后者对已订阅 URI 使用 resources/updated。',
    pitfall: '不要把内容每次修改都当目录变化；大量通知要合并，并保持分页游标失效策略一致。', officialUrl: RESOURCES,
  }),
  mcpApi({
    name: 'notifications/resources/updated', group: '目录变化通知', kind: 'object', signature: 'notifications/resources/updated({ uri }): notification<void>',
    beginner: '某个已订阅资源的内容变化时，服务端发出这条通知；客户端再用同一 URI 重新读取最新内容。',
    whenToUse: '客户端先成功 resources/subscribe，之后该 URI 对应内容发生更新时。',
    example: `{"jsonrpc":"2.0","method":"notifications/resources/updated","params":{"uri":"file:///workspace/plan.md"}}`,
    returns: '无响应通知，只带变化资源 URI，不包含完整新内容。',
    interview: '这是 invalidation-based subscription：通知小、读取按需，代价是客户端必须处理合并变化和重新读取失败。',
    pitfall: '只向真正订阅者发送；客户端应合并短时间连续更新，并防止读取循环。', officialUrl: RESOURCES,
  }),
  mcpApi({
    name: 'notifications/tools/list_changed', group: '目录变化通知', kind: 'object', signature: 'notifications/tools/list_changed: notification<void>',
    beginner: '工具目录变化时，它让客户端丢弃旧工具 schema 并重新调用 tools/list。',
    whenToUse: '服务端声明 tools.listChanged，工具新增、删除、schema 或 execution 元数据发生变化时。',
    example: `{"jsonrpc":"2.0","method":"notifications/tools/list_changed"}`,
    returns: '无参数、无响应通知；权威工具定义仍来自下一次 tools/list。',
    interview: '工具 schema 是模型调用契约，缓存更新不一致会导致模型继续发送旧参数，因此刷新必须原子替换。',
    pitfall: '正在执行的调用仍按发起时版本处理；不要让目录刷新导致同一请求中工具集合突然不一致。', officialUrl: TOOLS,
  }),
  mcpApi({
    name: 'notifications/roots/list_changed', group: '目录变化通知', kind: 'object', signature: 'notifications/roots/list_changed: notification<void>',
    beginner: '客户端允许服务端操作的根目录发生变化时，主动提醒服务端重新请求 roots/list。',
    whenToUse: '客户端声明 roots.listChanged，用户切换工作区、增加或撤销根目录时。',
    example: `{"jsonrpc":"2.0","method":"notifications/roots/list_changed"}`,
    returns: '无参数、无响应通知；服务端随后重新请求 roots/list 获取当前边界。',
    interview: 'roots 变化是授权范围变化信号，撤销范围后服务端应停止使用旧根并清理相关缓存。',
    pitfall: '不能继续信任缓存的旧 roots；正在执行的文件操作需要明确取消或重新授权策略。', officialUrl: ROOTS,
  }),
  mcpApi({
    name: 'notifications/elicitation/complete', group: 'Elicitation 通知', kind: 'object', signature: 'notifications/elicitation/complete({ elicitationId }): notification<void>',
    beginner: 'URL 模式的外部交互完成并经服务端确认后，服务端用它通知最初发起交互的客户端关闭提示、刷新状态或重试原请求。',
    whenToUse: '先前的 elicitation/create 使用 URL 模式，并且服务端已通过自己的可信回调确认外部流程完成时。',
    example: `{"jsonrpc":"2.0","method":"notifications/elicitation/complete","params":{"elicitationId":"elicit-9"}}`,
    returns: 'Server → Client 的无响应通知，只携带 elicitationId；不会把支付、OAuth 等敏感结果送进 MCP 消息。',
    interview: '完成通知是可选的流程协调信号，不是支付或 OAuth 成功凭证；服务端必须先验证自己的后端事实。',
    pitfall: '只能发给原始客户端；客户端必须忽略未知或已完成 id，并保留手动重试/取消入口，因为通知可能永远不到。', officialUrl: ELICITATION,
  }),
]

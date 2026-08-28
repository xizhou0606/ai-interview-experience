import type { FrameworkApiLearningMeta } from '../types'

/** nanobot v0.2.2 structured learning metadata; keys mirror core.ts names exactly. */
export const nanobotLearningMeta = {
  'Nanobot.from_config': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'config_path', type: 'Path | str | None', required: false, defaultValue: '~/.nanobot/config.json', description: '指定 JSON 配置来源；from_config 随后还会解析环境变量和模型 Provider。' },
      { name: 'workspace', type: 'Path | str | None', required: false, description: '覆盖 Agent 的 workspace 根目录，决定 Memory、Skills 和文件工具边界。' },
      { name: 'model', type: 'str | None', required: false, description: '直接覆盖使用的模型标识，优先级应与 model_preset 明确区分。' },
      { name: 'model_preset', type: 'str | None', required: false, description: '选择配置中可版本化的模型预设，集中复用 Provider 与生成参数。' },
    ], expectedOutput: '返回装配好 Config、Provider、Tool/Skill、Session、Memory 与异步资源的 Nanobot 实例。',
    errorCases: [{ condition: '配置不存在、环境变量未解析、workspace 越界或模型预设无效', handling: '启动期 fail fast；校验路径和密钥，使用受控 workspace，并在退出时 await aclose。' }],
    relatedApis: ['load_config', 'Config.resolve_preset', 'Config.get_provider', 'Nanobot.aclose'],
  },
  'Nanobot.run': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'message', type: 'str', required: true, description: '本轮用户输入；进入模型前应做长度、权限和不可信内容边界处理。' },
      { name: 'session_key', type: 'str', required: false, defaultValue: '"sdk:default"', description: '会话隔离键，服务端应绑定租户、用户与业务会话，不能信任客户端任意传值。' },
      { name: 'channel / chat_id / sender_id', type: 'str', required: false, description: '消息来源和身份上下文，用于 Channel 策略、审计和响应路由。' },
      { name: 'media', type: 'list | None', required: false, description: '图片、文件等多模态附件引用，读取前必须校验类型、大小与权限。' },
      { name: 'hooks', type: 'list[AgentHook] | None', required: false, description: '本轮生命周期扩展点，用于审计、流事件、策略或内容收口。' },
      { name: 'model / model_preset', type: 'str | None', required: false, description: '仅覆盖本次运行的模型或预设，不应把密钥暴露给调用方。' },
    ], expectedOutput: 'await 返回 RunResult，包含最终文本、工具使用、消息轨迹、usage、停止原因、错误和元数据。',
    errorCases: [{ condition: '同一 session 并发写入、工具副作用重复或模型/工具超时', handling: '按 session 串行或加版本控制；工具幂等和服务端鉴权，设置迭代/时间/成本上限。' }],
    relatedApis: ['Nanobot.run_streamed', 'RunResult', 'AgentHook', 'SessionClient.get'],
  },
  'Nanobot.run_streamed': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'message', type: 'str', required: true, description: '要以增量事件运行的用户输入。' },
      { name: 'run_options.session_key', type: 'str', required: false, defaultValue: '"sdk:default"', description: '隔离并持久化本次流式会话的稳定键。' },
      { name: 'run_options.hooks', type: 'list[AgentHook] | None', required: false, description: '参与流事件、工具执行和最终结果处理的 Hook。' },
      { name: 'run_options.model / model_preset', type: 'str | None', required: false, description: '本次流式运行的模型路由覆盖。' },
    ], expectedOutput: 'await 返回 RunStream；后台执行 AgentLoop，可消费事件并独立 wait、text、cancel 或 aclose。',
    errorCases: [{ condition: '调用方不消费/关闭 RunStream，导致后台任务和连接泄漏', handling: '使用 async with/finally 调用 aclose；客户端断开时 cancel 并继续等待资源收口。' }],
    relatedApis: ['Nanobot.stream', 'RunStream.stream_events', 'RunStream.wait', 'RunStream.cancel'],
  },
  'Nanobot.stream': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'message', type: 'str', required: true, description: '直接开始异步迭代的 Agent 输入文本。' },
      { name: 'run_options.session_key', type: 'str', required: false, defaultValue: '"sdk:default"', description: '当前增量运行使用的隔离会话键。' },
      { name: 'run_options.channel / sender_id', type: 'str', required: false, description: '用于权限、审计和消息来源标记的上下文。' },
    ], expectedOutput: '返回 AsyncIterator[StreamEvent]；事件覆盖文本 delta、工具调用、迭代状态、usage、结果和错误。',
    errorCases: [{ condition: '只拼接 delta 忽略 error/result/tool 事件，或提前退出未取消上游', handling: '按 StreamEvent.type 完整处理；在 finally 关闭迭代器并传播客户端取消。' }],
    relatedApis: ['Nanobot.run_streamed', 'StreamEvent', 'RunStream.stream_events'],
  },
  'Nanobot.aclose': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'async graceful shutdown', required: false, description: '关闭 Nanobot 持有的 Provider、Channel、Cron、Session flush 和其他后台异步资源。' }],
    expectedOutput: 'await 完成后实例资源被优雅释放；调用方不应继续启动新的 run 或 stream。',
    errorCases: [{ condition: '进程直接退出导致会话/遥测未 flush，或在 active run 中途关闭', handling: '先停止接受新任务并等待/取消在途运行，再以有界超时 await aclose。' }],
    relatedApis: ['Nanobot.from_config', 'RunStream.aclose', 'SessionClient.flush', 'CronService.stop'],
  },
  'RunStream.stream_events': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'async event iterator', required: false, description: '从对应 RunStream 顺序消费尚未读取的文本、工具、迭代和最终事件。' }],
    expectedOutput: '返回 AsyncIterator[StreamEvent]，直到 Agent 完成、失败或取消后自然结束。',
    errorCases: [{ condition: '多个消费者争抢同一事件流或慢消费者造成内存积压', handling: '每个 RunStream 指定单一消费所有者；对下游发送设置背压、超时和取消。' }],
    relatedApis: ['RunStream.wait', 'RunStream.text', 'StreamEvent', 'RunStream.cancel'],
  },
  'RunStream.wait': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'run completion wait', required: false, description: '等待 RunStream 对应后台 AgentLoop 完整结束并收集最终结构化结果。' }],
    expectedOutput: 'Promise/awaitable RunResult；包含成功、错误或取消后的最终状态与用量。',
    errorCases: [{ condition: '没有外层超时导致永久等待，或取消后不 wait 造成资源未收口', handling: '使用 asyncio.timeout；cancel 后仍 await wait/aclose，并检查 result.error。' }],
    relatedApis: ['RunStream.text', 'RunStream.cancel', 'RunResult', 'RunStream.aclose'],
  },
  'RunStream.text': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'final text projection', required: false, description: '等待运行完成并只投影 RunResult.content 文本，不返回工具轨迹和 usage。' }],
    expectedOutput: 'await 返回最终文本字符串；需要错误、工具或成本信息时应改用 wait。',
    errorCases: [{ condition: '把空文本当成功，忽略 RunResult.error 或工具-only 结果', handling: '生产流程优先 wait 并检查 stop_reason/error，再向 UI 投影 text。' }],
    relatedApis: ['RunStream.wait', 'RunResult', 'RunStream.stream_events'],
  },
  'RunStream.cancel': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'cooperative async cancellation', required: false, description: '请求取消后台 AgentLoop、模型流和可取消工具，并进入最终资源清理。' }],
    expectedOutput: 'await 完成表示取消请求已传播；已发生的外部副作用不会自动回滚。',
    errorCases: [{ condition: '工具忽略取消或把 cancel 当事务回滚', handling: '长工具定期检查取消；副作用使用幂等/补偿，并在取消后 await aclose。' }],
    relatedApis: ['RunStream.aclose', 'RunStream.wait', 'Nanobot.run_streamed'],
  },
  'RunStream.aclose': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'stream resource close', required: false, description: '停止未完成运行并关闭事件流、后台任务及其关联的异步资源。' }],
    expectedOutput: 'await 完成后 RunStream 不再产生事件，适合客户端断开和 finally 清理。',
    errorCases: [{ condition: '仅停止迭代却不 aclose，后台模型/工具继续消耗资源', handling: '所有流消费都放在 try/finally；断连时先 cancel，再 aclose。' }],
    relatedApis: ['RunStream.cancel', 'RunStream.stream_events', 'Nanobot.aclose'],
  },
  RunResult: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'content', type: 'str', required: true, description: '最终对用户可展示的 Agent 文本内容。' },
      { name: 'tools_used / messages', type: 'list', required: true, description: '本轮工具名称与规范化消息轨迹，用于审计和调试。' },
      { name: 'usage / stop_reason', type: 'dict / str', required: true, description: '模型 token/成本统计以及正常、预算、取消等停止原因。' },
      { name: 'error / metadata', type: 'Exception | None / dict', required: false, description: '结构化错误和运行元数据，不能只依据 content 判断成功。' },
    ], expectedOutput: '不可变式运行结果合同，用于服务层判断成功、失败、成本、工具轨迹并生成响应。',
    errorCases: [{ condition: '日志持久化完整 messages 泄露隐私，或忽略 error/stop_reason', handling: '仅保存脱敏摘要和必要审计；显式映射错误、预算耗尽和取消状态。' }],
    relatedApis: ['Nanobot.run', 'RunStream.wait', 'RunStream.text', 'StreamEvent'],
  },
  StreamEvent: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'type', type: 'str', required: true, description: '判别 delta、tool、iteration、usage、result、error 等事件结构。' },
      { name: 'delta / content', type: 'str', required: false, description: '增量文本或当前完整文本，消费端不可假定两者同时存在。' },
      { name: 'name / tool_call_id / arguments', type: 'str / dict', required: false, description: '工具生命周期事件的名称、关联 ID 与参数摘要。' },
      { name: 'result / usage / error / metadata', type: 'Any', required: false, description: '最终结果、用量、错误和扩展元数据，只在对应 type 下读取。' },
    ], expectedOutput: '结构化事件值；前端或 Channel 应按 type 渲染文本、工具状态、成本和最终错误。',
    errorCases: [{ condition: '未知事件类型导致消费者崩溃，或工具参数/错误原样暴露', handling: '使用向前兼容 default 分支；对参数和错误脱敏后再向终端输出。' }],
    relatedApis: ['Nanobot.stream', 'RunStream.stream_events', 'RunResult', 'AgentHook'],
  },
  AgentHook: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'before_run / after_run', type: 'async hook methods', required: false, description: '在整轮开始和结束时注入策略、审计或最终结果处理。' },
      { name: 'before_iteration / after_iteration', type: 'async hook methods', required: false, description: '在每次模型/工具循环边界读取 AgentHookContext。' },
      { name: 'before_execute_tools / on_stream', type: 'async hook methods', required: false, description: '工具执行前审批/裁剪以及增量流事件观察。' },
      { name: 'on_error / on_finally', type: 'async hook methods', required: false, description: '错误记录与无论成功失败都必须完成的资源收口。' },
    ], expectedOutput: '可继承的生命周期合同；Hook 返回值可调整内容/上下文，但不应隐藏核心执行错误。',
    errorCases: [{ condition: 'Hook 抛错中断 Agent、执行慢 I/O 阻塞流，或绕过工具权限', handling: 'Hook 保持快速可测试；错误策略明确，所有安全判断仍在 Tool.execute 服务端边界。' }],
    relatedApis: ['AgentHookContext', 'Nanobot.run', 'StreamEvent', 'Tool.execute'],
  },
  AgentHookContext: {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'iteration / messages / response', type: 'int / list / LLMResponse', required: true, description: '当前循环轮次、模型上下文和本次响应快照。' },
      { name: 'tool_calls / tool_results / tool_events', type: 'list', required: false, description: '当前轮工具计划、执行结果与流式事件。' },
      { name: 'usage / stop_reason / error', type: 'dict / str / Exception', required: false, description: '成本、停止原因和错误状态，供 Hook 做观测而非篡改身份。' },
    ], expectedOutput: 'Hook 方法收到的可读写上下文对象，用于跨生命周期阶段交换受控状态。',
    errorCases: [{ condition: 'Hook 原地破坏 messages/response 造成协议不一致，或记录敏感上下文', handling: '只修改明确支持字段并复制复杂结构；日志采用字段白名单和脱敏。' }],
    relatedApis: ['AgentHook', 'StreamEvent', 'RunResult'],
  },
  'SessionClient.ingest': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'session_key', type: 'str', required: true, description: '导入消息所属的租户隔离会话键。' },
      { name: 'messages', type: 'list[dict | Message]', required: true, description: '需要规范化、验证并合并到会话的历史消息。' },
      { name: 'metadata / source', type: 'dict | str | None', required: false, description: '导入来源、迁移版本和业务上下文，便于审计。' },
      { name: 'save', type: 'bool', required: false, defaultValue: 'True', description: '是否立即持久化；false 仅用于受控预览或批量阶段。' },
    ], expectedOutput: 'await 返回合并后的 SessionSnapshot，并按 save 决定是否写入会话存储。',
    errorCases: [{ condition: '消息角色/格式无效、重复导入或跨租户 session_key 注入', handling: '边界做 schema/归属校验；保存来源游标和稳定消息 ID，导入过程幂等。' }],
    relatedApis: ['SessionClient.get', 'SessionClient.export', 'SessionSnapshot', 'SessionClient.flush'],
  },
  'SessionClient.get': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'session_key', type: 'str', required: true, description: '要读取的精确会话键，调用前必须验证当前用户对其拥有访问权。' }],
    expectedOutput: '返回 SessionSnapshot 或 None；不存在、被删除或尚未保存时均可能为空。',
    errorCases: [{ condition: '客户端枚举其他用户 session_key 或把 None 当系统故障', handling: '服务端绑定/校验会话归属；将未找到与存储异常分别映射。' }],
    relatedApis: ['SessionClient.list', 'SessionClient.export', 'SessionClient.clear'],
  },
  'SessionClient.list': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'session index read', required: false, description: '列出当前 SessionClient 存储可见范围内的会话摘要，不自动做租户过滤。' }],
    expectedOutput: '返回 SessionInfo 列表，通常包含 key、时间和摘要，而不是完整 messages。',
    errorCases: [{ condition: '在共享 workspace 暴露所有 session 摘要或无分页规模增长', handling: '按用户使用独立存储/前缀并在服务层过滤；大型部署使用外部索引分页。' }],
    relatedApis: ['SessionClient.get', 'SessionClient.delete', 'SessionSnapshot'],
  },
  'SessionClient.export': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'session_key', type: 'str', required: true, description: '要导出的已授权会话隔离键，读取前必须验证资源归属。' }],
    expectedOutput: '返回可迁移/备份的 SessionSnapshot 或 None，可能含完整消息和 metadata。',
    errorCases: [{ condition: '导出文件包含私密消息、工具参数或系统指令', handling: '强制鉴权、脱敏与加密下载；设置审计和短时有效链接。' }],
    relatedApis: ['SessionClient.ingest', 'SessionClient.get', 'SessionClient.delete'],
  },
  'SessionClient.clear': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'session_key', type: 'str', required: true, description: '清空消息但保留会话容器/元数据的目标键。' }],
    expectedOutput: '返回清空后的 SessionSnapshot，可用于重新开始同一业务会话标识。',
    errorCases: [{ condition: '用户无权清空或误以为外部 Memory/日志也同时删除', handling: '对象级授权并明确数据范围；长期 Memory、备份与审计另行治理。' }],
    relatedApis: ['SessionClient.delete', 'SessionClient.get', 'MemoryClient.read_history'],
  },
  'SessionClient.delete': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'session_key', type: 'str', required: true, description: '要永久删除会话记录的授权键。' }],
    expectedOutput: '返回 bool 表示是否找到并删除会话；删除不会回滚已经执行的工具副作用。',
    errorCases: [{ condition: '删错租户会话或遗忘请求未覆盖备份/日志', handling: '二次确认和审计；把主存、历史、缓存和备份纳入数据生命周期。' }],
    relatedApis: ['SessionClient.clear', 'SessionClient.export', 'SessionClient.list'],
  },
  'SessionClient.flush': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'pending session write flush', required: false, description: '把 SessionClient 内部尚未落盘的脏会话批量写入持久化存储。' }],
    expectedOutput: '返回本次成功 flush 的会话数量，适合关停和测试同步点。',
    errorCases: [{ condition: '每轮都 flush 降低吞吐，或退出前未 flush 丢失最近消息', handling: '正常依赖批处理；SIGTERM/aclose 前有界 flush，并监控写入失败。' }],
    relatedApis: ['Nanobot.aclose', 'SessionClient.ingest', 'SessionClient.get'],
  },
  'MemoryClient.read': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'workspace memory read', required: false, description: '读取当前 workspace 的长期 Memory 文本，内容可能跨多个 Session 使用。' }],
    expectedOutput: '返回长期记忆字符串；空字符串表示尚无记忆，不等同存储错误。',
    errorCases: [{ condition: '共享 workspace 导致用户记忆串线或 Memory 内容提示注入', handling: '按租户隔离 workspace；把记忆视为不可信上下文并限制进入 Prompt 的长度。' }],
    relatedApis: ['MemoryClient.write', 'MemoryClient.append_history', 'RuntimeClient.model / workspace'],
  },
  'MemoryClient.write': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'text', type: 'str', required: true, description: '覆盖写入当前 workspace 长期 Memory 的完整文本，应先脱敏和限制大小。' }],
    expectedOutput: '无业务返回；持久化后的文本会被后续 Agent 运行作为长期上下文读取。',
    errorCases: [{ condition: '覆盖丢失已有记忆、并发写竞争或写入敏感/恶意指令', handling: '读改写使用版本锁；保存来源/审批，过滤隐私并为自动记忆设置信任边界。' }],
    relatedApis: ['MemoryClient.read', 'MemoryClient.append_history', 'SessionClient.export'],
  },
  'MemoryClient.append_history': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'text', type: 'str', required: true, description: '追加到历史日志的脱敏摘要文本。' },
      { name: 'session_key', type: 'str | None', required: false, description: '可选关联会话键，用于按会话读取历史。' },
    ], expectedOutput: '返回追加后的记录数或新记录索引，供诊断和生命周期管理。',
    errorCases: [{ condition: '无限追加使文件增长，或记录完整 Prompt/个人数据', handling: '设置轮转/保留上限；只存摘要、来源和必要审计字段。' }],
    relatedApis: ['MemoryClient.read_history', 'MemoryClient.read', 'SessionClient.clear'],
  },
  'MemoryClient.read_history': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: 'session_key', type: 'str | None', required: false, description: '可选仅读取某个授权会话的历史；省略可能返回 workspace 全部记录。' }],
    expectedOutput: '返回历史记录字典列表，包含内容和可用的时间/会话元数据。',
    errorCases: [{ condition: '无 session 过滤暴露其他用户记录，或全量读取过大文件', handling: '服务端强制租户范围；增加分页/保留策略并避免在线请求全扫。' }],
    relatedApis: ['MemoryClient.append_history', 'SessionClient.get', 'SessionClient.list'],
  },
  'RuntimeClient.model / workspace': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无调用参数', type: 'read-only runtime properties', required: false, description: '读取当前 Nanobot 已解析模型名称与 workspace Path，不触发配置重载。' }],
    expectedOutput: '分别得到模型字符串和受控 workspace 路径，可用于诊断和扩展组件上下文。',
    errorCases: [{ condition: '把 workspace 直接展示客户端泄露服务器路径，或误以为属性修改可重配', handling: '对外只返回逻辑名称；配置变更重新构建 Nanobot 或使用正式配置流程。' }],
    relatedApis: ['Nanobot.from_config', 'Config.workspace_path', 'Config.resolve_preset'],
  },
  'RuntimeClient.compact_session': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'session_key', type: 'str', required: true, description: '要压缩的已授权会话隔离键，操作前必须验证资源归属。' },
      { name: 'model context', type: 'RuntimeClient.model / workspace', required: true, description: '执行摘要的当前模型和 workspace Memory 上下文。' },
      { name: 'preservation policy', type: 'application summary contract', required: true, description: '规定必须保留的事实、决策、工具结果和安全约束。' },
    ], expectedOutput: 'await 返回压缩后的 SessionSnapshot，用摘要替换冗长历史以降低后续 token。',
    errorCases: [{ condition: '摘要遗漏关键事实/安全约束，或模型生成错误记忆', handling: '保留最近原文和结构化事实；对关键字段程序化抽取并做回归测试。' }],
    relatedApis: ['RuntimeClient.compact_idle_session', 'SessionClient.get', 'SessionSnapshot'],
  },
  'RuntimeClient.compact_idle_session': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'session_key', type: 'str', required: true, description: '只在空闲条件满足时尝试压缩的会话键。' },
      { name: 'max_suffix', type: 'int', required: false, defaultValue: '8', description: '压缩后保留的最近消息数量，兼顾细节和 token 成本。' },
    ], expectedOutput: 'await 返回生成的摘要字符串，若无需/无法压缩则返回 None。',
    errorCases: [{ condition: '与 active run 并发压缩导致丢消息，或 suffix 太小丢上下文', handling: '检查/锁定会话空闲状态；按任务复杂度调参并保存压缩前版本。' }],
    relatedApis: ['RuntimeClient.compact_session', 'SessionClient.get', 'SessionClient.flush'],
  },
  SessionSnapshot: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'key', type: 'str', required: true, description: '会话唯一键，必须包含可靠租户隔离语义。' },
      { name: 'messages', type: 'list[Message]', required: true, description: '当前规范化消息历史或压缩后的上下文。' },
      { name: 'metadata', type: 'dict', required: false, defaultValue: '{}', description: '来源、版本和业务附加信息，必须保持可序列化。' },
      { name: 'created_at / updated_at', type: 'datetime', required: true, description: '用于排序、空闲压缩和并发版本判断的时间信息。' },
    ], expectedOutput: 'Session API 的结构化快照值，可导出、压缩、清空并作为运行前历史恢复依据。',
    errorCases: [{ condition: '把快照对象当实时可变存储或完整返回未授权客户端', handling: '修改通过 SessionClient；响应使用脱敏 DTO 并校验会话归属。' }],
    relatedApis: ['SessionClient.get', 'SessionClient.ingest', 'RuntimeClient.compact_session'],
  },
  Tool: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'name / description', type: 'str', required: true, description: '暴露给模型的稳定工具名和清晰前置条件、效果及失败语义。' },
      { name: 'parameters', type: 'JSON Schema', required: true, description: '模型生成参数的结构合同，只验证形状，不代表调用者有权限。' },
      { name: 'read_only', type: 'bool', required: true, description: '声明工具是否无副作用，供审批、并发和重试策略使用。' },
      { name: 'concurrency_safe / exclusive', type: 'bool', required: true, description: '声明是否可并行以及是否必须独占执行关键资源。' },
      { name: 'config_cls / enabled / create', type: 'class hooks', required: false, description: '定义扩展配置、可用性检查和基于 ToolContext 的实例创建。' },
    ], expectedOutput: '抽象 Tool 扩展合同；注册后生成模型 tool definition，并由 ToolRegistry 安全实例化和执行。',
    errorCases: [{ condition: 'schema 正确但越权、写工具被自动重试或并发执行', handling: 'execute 内再次鉴权；写操作幂等并需确认，正确设置 read_only/exclusive。' }],
    relatedApis: ['Tool.execute', 'tool_parameters', 'ToolRegistry.register', 'nanobot.tools entry point'],
  },
  'Tool.execute': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'kwargs', type: 'Any', required: true, description: '已经过基础 schema 校验但仍需业务校验的模型生成参数。' },
      { name: 'trusted ToolContext', type: 'runtime context', required: true, description: '创建工具时绑定的用户、workspace、服务端凭据和取消信号。' },
      { name: 'idempotency / authorization', type: 'application policy', required: true, description: '每次执行写工具必须使用的对象级鉴权和副作用幂等策略。' },
    ], expectedOutput: 'await 返回可序列化工具结果，AgentLoop 会把它转换成工具消息再交回模型。',
    errorCases: [{ condition: '模型伪造身份参数、外部服务超时或重复执行副作用', handling: '身份只取可信上下文；设置超时/取消，写操作用唯一键并返回脱敏错误。' }],
    relatedApis: ['Tool', 'ToolRegistry.execute', 'AgentHook', 'LLMProvider.chat'],
  },
  tool_parameters: {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'schema', type: 'dict[str, Any]', required: true, description: '装饰 Tool 类/方法的 JSON Schema，描述属性、required 和可选约束。' }],
    expectedOutput: '返回装饰后的目标并附加参数 schema 元数据，供 ToolRegistry 生成模型定义。',
    errorCases: [{ condition: 'schema 与 execute kwargs 漂移，或复杂规则只存在 Python 代码中', handling: '写契约测试；模型可见 description 解释关键语义，execute 再做运行时验证。' }],
    relatedApis: ['Tool', 'Tool.execute', 'ToolRegistry.get_definitions'],
  },
  'ToolRegistry.register': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'tool', type: 'Tool', required: true, description: '要按其稳定 name 注册的已配置 Tool 实例或定义。' }],
    expectedOutput: '无业务返回；后续 definitions、get 和 execute 可发现该工具。',
    errorCases: [{ condition: '重复 name 静默覆盖安全策略不同的工具', handling: '启动期拒绝重复或显式审计替换；工具名纳入扩展版本治理。' }],
    relatedApis: ['ToolRegistry.unregister', 'ToolRegistry.get', 'ToolRegistry.execute', 'Tool'],
  },
  'ToolRegistry.unregister': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: 'name', type: 'str', required: true, description: '要从当前 Registry 移除的精确工具名称。' }],
    expectedOutput: '无业务返回；移除后新的模型 definitions 和 execute 不再发现该工具。',
    errorCases: [{ condition: '运行中移除而已有模型 tool_call 仍引用该名称', handling: '扩展集合在启动期冻结；热更新需版本化会话并返回可恢复未知工具错误。' }],
    relatedApis: ['ToolRegistry.register', 'ToolRegistry.get', 'ToolRegistry.tool_names'],
  },
  'ToolRegistry.get': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: 'name', type: 'str', required: true, description: '要精确查找的已注册工具名称。' }],
    expectedOutput: '返回 Tool 或 None；不会执行 enabled 或参数校验。',
    errorCases: [{ condition: '调用方未处理 None 或绕过 Registry.execute 直接执行未授权工具', handling: '未知名称返回结构化工具错误；统一通过受控执行入口。' }],
    relatedApis: ['ToolRegistry.register', 'ToolRegistry.execute', 'ToolRegistry.get_definitions'],
  },
  'ToolRegistry.get_definitions': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'tool schema projection', required: false, description: '将当前可用 Tool 投影为模型 provider 可消费的名称、描述与参数定义。' }],
    expectedOutput: '返回工具 definition 字典列表，供 LLMProvider.chat/chat_stream 发送给模型。',
    errorCases: [{ condition: '把所有内部工具无条件暴露给每个用户/场景', handling: '按权限、Channel、会话和 enabled 状态先过滤最小工具集合。' }],
    relatedApis: ['ToolRegistry.tool_names', 'ToolRegistry.execute', 'LLMProvider.chat'],
  },
  'ToolRegistry.execute': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'name', type: 'str', required: true, description: '模型请求执行的工具名称，必须存在于当前允许 Registry。' },
      { name: 'params', type: 'Any', required: true, description: '根据 Tool.parameters 校验后传给 execute 的参数。' },
      { name: 'execution policy', type: 'registry concurrency policy', required: true, description: '依据 read_only、concurrency_safe、exclusive 应用的锁和并发控制。' },
    ], expectedOutput: 'await 返回工具执行结果；Registry 负责查找、校验和并发约束，业务鉴权仍由工具负责。',
    errorCases: [{ condition: '未知工具、参数无效、独占锁冲突或 Tool.execute 抛错', handling: '返回模型可理解且脱敏的错误；只对安全只读瞬时错误有界重试。' }],
    relatedApis: ['Tool.execute', 'ToolRegistry.get', 'ToolRegistry.get_definitions', 'AgentHook'],
  },
  'ToolRegistry.tool_names': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无调用参数', type: 'read-only registry property', required: false, description: '读取当前 Registry 已登记工具名的稳定列表，不执行任何工具。' }],
    expectedOutput: '返回 list[str]，适合诊断和测试；不代表每个用户都应看到全部工具。',
    errorCases: [{ condition: '把内部工具名直接展示终端用户或当授权列表', handling: '对外使用业务描述；权限判断调用服务端策略而非仅检查名称存在。' }],
    relatedApis: ['ToolRegistry.get_definitions', 'ToolRegistry.get', 'ToolRegistry.register'],
  },
  'nanobot.tools entry point': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'entry point group', type: '"nanobot.tools"', required: true, description: 'Python package metadata 中用于发现第三方工具的固定入口组。' },
      { name: 'tool_name', type: 'entry point name', required: true, description: '注册到 Registry 的扩展工具名称，应全局稳定且避免冲突。' },
      { name: 'package.module:ToolClass', type: 'import target', required: true, description: '可导入且实现 Tool 合同的类路径。' },
    ], expectedOutput: '安装包后 Nanobot 启动发现并加载 ToolClass，再按配置/可用性注册工具。',
    errorCases: [{ condition: '不可信包在启动期执行代码、依赖冲突或重复工具名', handling: '只安装审核白名单扩展并锁版本/哈希；隔离权限并在启动期报告冲突。' }],
    relatedApis: ['Tool', 'ToolRegistry.register', 'ToolsConfig'],
  },
  'SKILL.md': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'frontmatter.name / description', type: 'YAML strings', required: true, description: 'Skill 的稳定名称和模型可理解的适用范围说明。' },
      { name: 'metadata.nanobot.requires', type: 'requirements metadata', required: false, description: '声明命令、环境或依赖要求，Loader 用于可用性检查。' },
      { name: 'metadata.nanobot.always', type: 'bool', required: false, defaultValue: 'false', description: '是否始终加入上下文；开启会持续消耗 token，应非常克制。' },
      { name: 'body instructions', type: 'Markdown', required: true, description: '面向 Agent 的可执行步骤、边界、失败处理和输出标准。' },
    ], expectedOutput: '被 SkillsLoader 解析为可发现、可校验并可按需注入 Agent context 的 Skill 文本。',
    errorCases: [{ condition: 'Skill 内容含提示注入/越权指令，或 always 导致上下文膨胀', handling: '只加载受控 workspace/包；代码评审、版本锁定并最小化 always skills。' }],
    relatedApis: ['SkillsLoader.list_skills', 'SkillsLoader.load_skill', 'SkillsLoader.get_skill_availability'],
  },
  'SkillsLoader.list_skills': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'filter_unavailable', type: 'bool', required: false, defaultValue: 'True', description: '是否过滤缺少依赖、配置或环境条件的 Skill。' }],
    expectedOutput: '返回 Skill 元数据字典列表，不加载完整正文，适合发现和选择。',
    errorCases: [{ condition: '展示不可用 Skill 让模型反复选择，或目录包含未审核文件', handling: '生产保持过滤并限制 Skill 搜索根；展示不可用原因给管理员。' }],
    relatedApis: ['SkillsLoader.load_skill', 'SkillsLoader.get_skill_availability', 'SKILL.md'],
  },
  'SkillsLoader.load_skill': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'name', type: 'str', required: true, description: '要加载的 Skill exact name，必须来自已发现/授权目录。' }],
    expectedOutput: '返回完整 Skill Markdown 字符串或 None，供上下文注入前进一步组合。',
    errorCases: [{ condition: '路径穿越、Skill 不可用或正文过大挤占模型上下文', handling: '只按已解析 name 查找；检查可用性、大小和可信来源。' }],
    relatedApis: ['SkillsLoader.list_skills', 'SkillsLoader.load_skills_for_context', 'SkillsLoader.get_skill_availability'],
  },
  'SkillsLoader.load_skills_for_context': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'skill_names', type: 'list[str]', required: true, description: '本轮经过选择和授权、需要加入上下文的 Skill 名称。' },
      { name: 'availability filter', type: 'SkillsLoader.get_skill_availability', required: true, description: '组合前对依赖与配置进行的可用性门禁。' },
      { name: 'context budget', type: 'token/character limit', required: true, description: '控制 Skill 总正文长度和优先级的上下文预算。' },
    ], expectedOutput: '返回按顺序组合的 Skill 指令文本，可加入系统上下文，不会执行其中步骤。',
    errorCases: [{ condition: '加载重复/冲突 Skill、上下文超预算或未授权指令进入模型', handling: '去重、排序并限制总长度；只允许受信 Skill，冲突规则显式报告。' }],
    relatedApis: ['SkillsLoader.load_skill', 'SkillsLoader.list_skills', 'SKILL.md'],
  },
  'SkillsLoader.get_skill_availability': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'name', type: 'str', required: true, description: '要检查 requires 和环境条件的 Skill exact name。' }],
    expectedOutput: '返回 (bool, reason)；布尔表示可加载，字符串解释缺失依赖或禁用原因。',
    errorCases: [{ condition: '只检查文件存在而忽略命令/环境要求，运行中才失败', handling: '在启动和选择时调用；reason 提供管理员可操作且不泄露密钥的提示。' }],
    relatedApis: ['SkillsLoader.list_skills', 'SkillsLoader.load_skill', 'SKILL.md'],
  },
  GenerationSettings: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'temperature / top_p', type: 'float | None', required: false, description: '控制随机性和采样范围；结构化任务通常更低，创意任务可适度提高。' },
      { name: 'max_tokens', type: 'int | None', required: false, description: '限制单次模型输出 token，保护延迟和成本预算。' },
      { name: 'reasoning_effort', type: 'str | None', required: false, description: '支持推理模型的思考强度，具体值和费用由 Provider 决定。' },
      { name: 'extra_body / extra_query', type: 'dict | None', required: false, description: 'Provider 专有字段逃生口，应隔离使用并做版本契约测试。' },
    ], expectedOutput: '生成不可变式模型调用设置，传给 LLMProvider.chat/chat_stream 并可由 preset 复用。',
    errorCases: [{ condition: '发送 Provider 不支持参数或无界 max_tokens 导致失败/成本失控', handling: '维护能力矩阵；配置启动校验并记录实际 settings、usage 和警告。' }],
    relatedApis: ['ProviderConfig', 'LLMProvider.chat', 'Config.resolve_preset'],
  },
  ProviderConfig: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'api_key', type: 'str', required: true, description: '模型 Provider 服务端密钥，必须来自环境变量或秘密管理。' },
      { name: 'api_base', type: 'str | None', required: false, description: '兼容端点基础地址，需限制 HTTPS 和允许的目标域。' },
      { name: 'extra_headers', type: 'dict | None', required: false, description: '租户、版本等额外请求头，禁止来自未经验证的用户输入。' },
      { name: 'extra_body / extra_query', type: 'dict | None', required: false, description: 'Provider 专有参数，应集中在 Adapter 而非散落业务逻辑。' },
    ], expectedOutput: '结构化 Provider 连接配置，供 Config.get_provider 创建可复用 LLMProvider。',
    errorCases: [{ condition: '密钥进入日志/客户端、api_base SSRF 或自定义 header 注入', handling: '只在服务端解析 secrets；base URL 白名单，日志过滤认证和敏感字段。' }],
    relatedApis: ['Config.get_provider', 'GenerationSettings', 'LLMProvider.chat'],
  },
  'LLMProvider.chat': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'messages', type: 'list[Message]', required: true, description: '规范化模型消息，包含系统约束、用户输入和工具结果。' },
      { name: 'tools', type: 'list[ToolDefinition] | None', required: false, description: '本轮允许模型选择的最小工具定义集合。' },
      { name: 'model', type: 'str | None', required: false, description: '本次覆盖模型；省略时使用 Provider/Config 默认值。' },
      { name: 'settings', type: 'GenerationSettings | None', required: false, description: '温度、token、推理和 Provider 额外参数。' },
    ], expectedOutput: 'await 返回完整 LLMResponse，可能包含文本、tool call、usage、停止原因和 Provider 元数据。',
    errorCases: [{ condition: '429/5xx/超时、消息超上下文或工具调用参数不合法', handling: '使用有界 retry helper 和 timeout；裁剪上下文，工具参数仍由 Registry 校验。' }],
    relatedApis: ['LLMProvider.chat_stream', 'LLMProvider retry helpers', 'GenerationSettings', 'ToolRegistry.get_definitions'],
  },
  'LLMProvider.chat_stream': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'messages', type: 'list[Message]', required: true, description: '流式生成使用的规范化上下文消息。' },
      { name: 'tools', type: 'list[ToolDefinition] | None', required: false, description: '流中可能产生 ToolCallRequest 的允许工具集合。' },
      { name: 'model', type: 'str | None', required: false, description: '本次流式调用使用的模型覆盖标识，应受服务端允许列表约束。' },
      { name: 'settings', type: 'GenerationSettings | None', required: false, description: '流式生成参数和 Provider 专有配置。' },
    ], expectedOutput: '返回异步迭代器，依次产生文本增量、ToolCallRequest 和最终 LLMResponse。',
    errorCases: [{ condition: '流中途断开、工具参数跨 chunk 不完整或消费端未传播取消', handling: '按事件类型聚合并仅在完整调用后执行；finally 关闭流和传播取消。' }],
    relatedApis: ['LLMProvider.chat', 'LLMProvider retry helpers', 'StreamEvent', 'ToolRegistry.execute'],
  },
  'LLMProvider retry helpers': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'chat arguments', type: 'messages/tools/model/settings', required: true, description: '原样传给非流式或流式 Provider 调用的请求合同。' },
      { name: 'retry budget', type: 'attempts/backoff/timeout', required: true, description: '限定最大次数、指数退避、抖动和总耗时。' },
      { name: 'retryable errors', type: 'error classifier', required: true, description: '只选择限流、瞬时网络和部分 5xx，排除鉴权/输入业务错误。' },
    ], expectedOutput: '非流式最终返回 LLMResponse，流式返回可恢复策略下的事件流；预算耗尽会抛出最后错误。',
    errorCases: [{ condition: '无界重试放大成本，或流已向用户发送内容后从头重试造成重复', handling: '使用总预算；流开始后谨慎断点/终止，不对非幂等工具结果自动重放。' }],
    relatedApis: ['LLMProvider.chat', 'LLMProvider.chat_stream', 'GenerationSettings'],
  },
  BaseChannel: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'login/start/stop', type: 'async lifecycle methods', required: true, description: '负责认证、开始接收消息和优雅停止后台 Channel 任务。' },
      { name: 'send', type: 'async outbound method', required: true, description: '把 OutboundMessage 转成平台请求并处理限流和错误。' },
      { name: 'is_allowed', type: 'authorization predicate', required: true, description: '在进入 Agent 前验证 sender_id 是否在允许范围。' },
      { name: 'supports_streaming/default_config', type: 'capability/config', required: true, description: '声明流式能力和安全默认配置。' },
    ], expectedOutput: '抽象消息接入合同；Gateway 通过实现类统一管理平台登录、收发、权限和生命周期。',
    errorCases: [{ condition: 'Channel 相信消息内身份、重连重复消费或停止时丢失发送任务', handling: '身份取平台签名上下文；消息幂等，重连有游标，stop 等待在途发送。' }],
    relatedApis: ['BaseChannel.login', 'BaseChannel.start', 'BaseChannel.stop', 'BaseChannel.send'],
  },
  'BaseChannel.login': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'force', type: 'bool', required: false, defaultValue: 'False', description: '是否忽略已有凭据状态并强制重新进行 Channel 登录流程。' }],
    expectedOutput: 'await 返回 bool 表示登录/凭据准备是否成功，不会自动启动消息消费。',
    errorCases: [{ condition: '交互式登录卡住后台服务或凭据写入不安全位置', handling: '部署前独立完成登录；凭据加密、最小权限并支持撤销/轮换。' }],
    relatedApis: ['BaseChannel.start', 'nanobot channels login', 'nanobot channels status'],
  },
  'BaseChannel.start': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'async channel start', required: false, description: '在登录完成后启动平台连接、轮询/WebSocket 和入站消息处理。' }],
    expectedOutput: 'await 通常持续到 stop 或连接结束；具体实现可能启动后台任务后返回。',
    errorCases: [{ condition: '重复 start、连接重试风暴或消息重复投递', handling: '生命周期状态机防重入；指数退避，使用平台 event id 做幂等。' }],
    relatedApis: ['BaseChannel.login', 'BaseChannel.stop', 'nanobot gateway'],
  },
  'BaseChannel.stop': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'async graceful channel stop', required: false, description: '停止接收入站消息并关闭连接、后台任务和在途发送资源。' }],
    expectedOutput: 'await 完成表示 Channel 已优雅停止，可安全进入 Gateway/Nanobot 关停。',
    errorCases: [{ condition: '直接取消导致 ack/发送丢失，或 stop 不幂等产生异常', handling: '先停止新消息、等待/限时收口在途任务；实现可重复调用。' }],
    relatedApis: ['BaseChannel.start', 'BaseChannel.send', 'Nanobot.aclose'],
  },
  'BaseChannel.send': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'msg', type: 'OutboundMessage', required: true, description: '包含目标 chat、文本、媒体和关联信息的规范化出站消息。' },
      { name: 'platform credentials', type: 'channel trusted config', required: true, description: '由 Channel 实例持有的服务端凭据，不能来自 Agent 参数。' },
      { name: 'delivery idempotency', type: 'application message key', required: true, description: '网络结果不确定时安全重试发送所需的业务去重标识。' },
    ], expectedOutput: 'await 完成表示平台接受发送请求；不一定代表最终送达或用户已读。',
    errorCases: [{ condition: '429/超时后重复发送、目标 chat 越权或媒体不合法', handling: '解析 Retry-After、有界幂等重试；校验路由归属和附件大小/类型。' }],
    relatedApis: ['BaseChannel.is_allowed', 'BaseChannel.supports_streaming', 'BaseChannel.stop'],
  },
  'BaseChannel.supports_streaming': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无调用参数', type: 'read-only capability property', required: false, description: '读取 Channel 是否支持增量编辑/发送流式消息，而非只发最终文本。' }],
    expectedOutput: '返回 bool；Gateway 据此选择实时增量或缓冲为单条最终回复。',
    errorCases: [{ condition: '错误声明 true 导致平台限流或消息碎片，false 导致体验降级', handling: '按平台真实 API 实现并做速率测试；流式发送加入节流。' }],
    relatedApis: ['BaseChannel.send', 'Nanobot.stream', 'StreamEvent'],
  },
  'BaseChannel.is_allowed': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'sender_id', type: 'str', required: true, description: '由平台认证事件解析出的真实发送者标识，不接受消息正文自报身份。' }],
    expectedOutput: '返回 bool，决定入站消息能否进入 AgentLoop；应默认拒绝未知用户。',
    errorCases: [{ condition: '允许列表为空却 fail-open，或 sender_id 可被用户伪造', handling: '身份取签名验证后的平台事件；默认拒绝并记录脱敏审计。' }],
    relatedApis: ['BaseChannel', 'BaseChannel.send', 'nanobot channels status'],
  },
  'nanobot.channels entry point': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'entry point group', type: '"nanobot.channels"', required: true, description: 'Python 包中声明 Channel 插件发现的固定入口组。' },
      { name: 'channel_name', type: 'entry point name', required: true, description: '配置和 CLI 使用的稳定 Channel 名称。' },
      { name: 'package.module:ChannelClass', type: 'import target', required: true, description: '实现 BaseChannel 合同的可导入类路径。' },
    ], expectedOutput: '安装受信包后，Gateway 可发现 ChannelClass、读取默认配置并纳入生命周期管理。',
    errorCases: [{ condition: '恶意插件启动执行代码、名称冲突或依赖供应链风险', handling: '仅白名单安装、锁版本/哈希并隔离密钥；启动期拒绝重复名称。' }],
    relatedApis: ['BaseChannel', 'nanobot channels login', 'nanobot gateway'],
  },
  CronSchedule: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'kind', type: '"at" | "every" | "cron"', required: true, description: '选择一次性、固定间隔或 cron 表达式三种互斥调度语义。' },
      { name: 'at_ms / every_ms / cron_expr', type: 'int | str | None', required: true, description: '按 kind 提供毫秒时间点、间隔毫秒数或标准 cron 表达式。' },
      { name: 'tz', type: 'str | None', required: false, description: '为 cron 表达式指定 IANA 时区，避免服务器本地时区造成偏移。' },
      { name: 'until_ms', type: 'int | None', required: false, description: '限定重复任务的最终截止时间，防止过期计划继续自动执行。' },
    ], expectedOutput: '返回可持久化的调度值对象，CronService 据此计算下一次运行时间和终止条件。',
    errorCases: [{ condition: '表达式非法、间隔非正数、夏令时跳变或 at 时间已经过去', handling: '创建时严格校验互斥字段与时区；展示下一次触发，并明确错过执行策略。' }],
    relatedApis: ['CronService.add_job', 'CronService.update_job', 'CronService.get_job / status'],
  },
  'CronService.start': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'async scheduler lifecycle', required: false, description: '启动调度循环并加载持久化任务，不应在多个进程中无锁重复启动。' }],
    expectedOutput: 'await 后调度器开始计算和执行到期任务，通常由 Gateway 生命周期统一持有。',
    errorCases: [{ condition: '多实例同时领取同一任务、启动两次或存储加载失败', handling: '使用分布式租约或单实例部署；状态机防重入，加载失败时停止接单并告警。' }],
    relatedApis: ['CronService.stop', 'CronService.list_jobs', 'nanobot gateway'],
  },
  'CronService.stop': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'async graceful scheduler stop', required: false, description: '停止领取新的到期任务，并等待或限时取消当前正在执行的任务。' }],
    expectedOutput: 'await 完成代表调度循环和后台资源已经关闭，可安全结束 Gateway 进程。',
    errorCases: [{ condition: '强制退出造成任务半完成，或停止后仍写入下一次运行时间', handling: '先冻结领取再收口在途任务；副作用任务幂等，并以原子状态提交运行结果。' }],
    relatedApis: ['CronService.start', 'CronService.run_job', 'Nanobot.aclose'],
  },
  'CronService.list_jobs': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: 'include_disabled', type: 'bool', required: false, defaultValue: 'True', description: '控制列表是否同时返回已禁用计划，便于运维查看完整调度状态。' }],
    expectedOutput: '返回任务定义列表，包含标识、计划、启用状态、下次运行和最近运行信息。',
    errorCases: [{ condition: '任务量过大一次加载，或把敏感消息参数直接展示给普通用户', handling: '服务层分页和租户过滤；响应中脱敏任务输入并按角色限制可见字段。' }],
    relatedApis: ['CronService.get_job / status', 'CronService.enable_job', 'CronService.remove_job'],
  },
  'CronService.add_job': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'name', type: 'str', required: true, description: '面向用户和审计日志的稳定任务名称，应在所属空间内可辨识。' },
      { name: 'schedule', type: 'CronSchedule', required: true, description: '经过校验的触发计划，决定一次性或重复执行的时间语义。' },
      { name: 'message', type: 'str', required: true, description: '触发时送入 AgentLoop 的任务指令，必须视为持久化的不可信输入。' },
      { name: 'session_key', type: 'str | None', required: false, description: '运行使用的会话隔离键，应由服务端绑定租户和任务身份。' },
      { name: 'enabled', type: 'bool', required: false, defaultValue: 'True', description: '创建后是否立即参与调度，生产环境可先禁用验证计划。' },
    ], expectedOutput: '持久化并返回带唯一 job_id 的任务记录，同时计算可观测的下一次运行时间。',
    errorCases: [{ condition: '重复请求创建两份任务、越权 session 或计划触发频率过高', handling: '支持幂等键和租户鉴权；限制最小间隔、并发、成本与单任务执行时长。' }],
    relatedApis: ['CronSchedule', 'CronService.update_job', 'CronService.run_job', 'Nanobot.run'],
  },
  'CronService.remove_job': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'job_id', type: 'str', required: true, description: '要移除的稳定任务标识，服务端必须校验它属于当前租户或空间。' }],
    expectedOutput: '返回删除是否成功；移除未来调度，但不会自动撤销已经发生的外部副作用。',
    errorCases: [{ condition: '任务不存在、越权删除，或任务正在执行时记录被直接清除', handling: '先鉴权并用幂等删除；运行中标记取消/删除待定，保留必要审计记录。' }],
    relatedApis: ['CronService.list_jobs', 'CronService.get_job / status', 'CronService.stop'],
  },
  'CronService.enable_job': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'job_id', type: 'str', required: true, description: '需要切换启用状态的任务标识，操作前必须验证资源归属。' },
      { name: 'enabled', type: 'bool', required: true, description: '明确设置目标状态而不是简单翻转，便于请求安全重试和保持幂等。' },
    ], expectedOutput: '返回更新后的任务状态；重新启用时会按既定错过策略计算下一次触发。',
    errorCases: [{ condition: '并发更新覆盖状态，或启用过期的一次性任务立即误触发', handling: '使用版本号或条件更新；启用前重新验证计划并向用户展示下次运行时间。' }],
    relatedApis: ['CronService.update_job', 'CronService.list_jobs', 'CronService.get_job / status'],
  },
  'CronService.update_job': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'job_id', type: 'str', required: true, description: '要更新的任务唯一标识，必须在当前授权空间中查询和修改。' },
      { name: 'schedule', type: 'CronSchedule | None', required: false, description: '可选替换调度计划，更新后重新计算下次运行时间。' },
      { name: 'message', type: 'str | None', required: false, description: '可选替换 Agent 指令，写入前执行长度和敏感信息校验。' },
      { name: 'name / enabled / session_key', type: 'partial fields', required: false, description: '按字段部分更新显示名、启用状态和受控会话绑定。' },
    ], expectedOutput: '原子返回更新后的任务记录及新 next_run，未提供字段保持原值不变。',
    errorCases: [{ condition: '丢失更新、部分字段先写成功后失败，或运行中变更产生语义竞争', handling: '使用版本条件和单事务更新；定义本次运行使用旧快照、后续运行使用新配置。' }],
    relatedApis: ['CronSchedule', 'CronService.add_job', 'CronService.enable_job', 'CronService.get_job / status'],
  },
  'CronService.run_job': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'job_id', type: 'str', required: true, description: '要立即触发的任务标识，仍需通过租户权限和任务存在性检查。' },
      { name: 'force', type: 'bool', required: false, defaultValue: 'False', description: '是否忽略禁用或未到期状态强制执行，不应绕过鉴权和安全预算。' },
    ], expectedOutput: '执行任务对应的 Agent 运行并返回运行结果或运行标识，同时记录手动触发来源。',
    errorCases: [{ condition: '与定时触发并发导致重复副作用、禁用任务被误运行或执行超时', handling: '使用运行租约和幂等键；force 仅限高权限，设置 Agent 时间、迭代和成本上限。' }],
    relatedApis: ['CronService.get_job / status', 'CronService.add_job', 'Nanobot.run'],
  },
  'CronService.get_job / status': {
    learningLevel: 'reference', runtime: 'server', parameters: [
      { name: 'job_id', type: 'str', required: true, description: '查询单个任务及其运行状态的标识，服务端必须按租户过滤。' },
      { name: 'operation', type: '"get_job" | "status"', required: false, description: '选择返回完整任务定义或调度器整体健康与统计状态。' },
    ], expectedOutput: 'get_job 返回任务详情；status 返回调度器运行状态、任务数量和近期错误摘要。',
    errorCases: [{ condition: '不存在与无权限返回不同细节造成枚举，或状态缓存严重滞后', handling: '对外统一未找到响应并记录内部原因；附带采样时间并限制敏感错误详情。' }],
    relatedApis: ['CronService.list_jobs', 'CronService.run_job', 'CronService.start'],
  },
  load_config: {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'config_path', type: 'Path | str | None', required: false, description: '读取指定或默认 JSON 配置文件，路径应来自可信启动参数而非普通请求。' }],
    expectedOutput: '返回完成迁移和 Pydantic 校验的 Config；环境变量仍需另行调用 resolve_config_env_vars。',
    errorCases: [{ condition: 'JSON 语法错误、字段校验失败、路径穿越或文件权限过宽泄露密钥', handling: '启动期严格 schema 校验并拒绝非法字段；限定路径和最小化文件权限。' }],
    relatedApis: ['resolve_config_env_vars', 'save_config', 'Nanobot.from_config', 'Config.get_provider'],
  },
  save_config: {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'config', type: 'Config', required: true, description: '待持久化的结构化配置，只写允许序列化和验证通过的字段。' },
      { name: 'config_path', type: 'Path | str | None', required: false, description: '目标配置文件位置，应限制在受控用户配置目录中。' },
    ], expectedOutput: '将配置按字段别名写入 JSON 文件，并保持可再次被 load_config 读取的结构与语义。',
    errorCases: [{ condition: '官方实现直接写文件时进程中断、并发覆盖，或把解析后的明文密钥写回磁盘', handling: '调用层先加锁、备份并限制权限；高可靠部署可封装临时文件原子替换，密钥保存环境引用。' }],
    relatedApis: ['load_config', 'resolve_config_env_vars', 'Config.workspace_path'],
  },
  resolve_config_env_vars: {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'config', type: 'Config | mapping', required: true, description: '包含环境变量占位符的配置树，解析必须限制允许替换的字段和格式。' }],
    expectedOutput: '返回运行时可用的配置值；缺失的必需变量应明确报错而不是保留空字符串。',
    errorCases: [{ condition: '缺失变量静默变空、日志打印解析后密钥或用户输入注入变量名', handling: '必需变量 fail fast；只接受固定占位语法，日志统一脱敏且不回写明文。' }],
    relatedApis: ['load_config', 'save_config', 'ProviderConfig', 'Config.get_provider'],
  },
  'Config.workspace_path': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无调用参数', type: 'resolved Path property', required: false, description: '读取规范化后的 workspace 根目录，作为 Memory、Skill 和文件工具的共同边界。' }],
    expectedOutput: '返回绝对 Path；其子目录承载会话、记忆、技能及其他受控运行时数据。',
    errorCases: [{ condition: '符号链接逃逸、相对路径依赖工作目录，或目录对其他用户可写', handling: 'resolve 后校验父子关系；创建时设置最小权限，文件操作再次做边界检查。' }],
    relatedApis: ['Nanobot.from_config', 'ToolsConfig', 'MemoryClient.read', 'SkillsLoader.list_skills'],
  },
  'Config.resolve_preset': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'name', type: 'str | None', required: false, description: '要解析的模型预设名；为空时使用配置声明的默认预设并保留确定性优先级。' }],
    expectedOutput: '返回合并后的模型、Provider 和生成参数预设，供单次运行或默认运行使用。',
    errorCases: [{ condition: '预设不存在、循环继承，或请求方通过预设越权切换高成本模型', handling: '启动期验证引用图；服务端维护允许预设名单并设置租户成本上限。' }],
    relatedApis: ['Config.get_provider', 'ProviderConfig', 'GenerationSettings', 'Nanobot.from_config'],
  },
  'Config.get_provider': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'model', type: 'str | None', required: false, description: '模型标识或路由别名，用来选择对应的 Provider 配置。' },
      { name: 'preset', type: 'str | None', required: false, description: '可选预设名称，集中覆盖模型、端点和生成参数。' },
      { name: 'resolved provider configs', type: 'mapping[str, ProviderConfig]', required: true, description: '已经完成环境变量解析的受信 Provider 配置集合。' },
    ], expectedOutput: '返回匹配的 ProviderConfig 或可实例化 LLMProvider 所需的确定配置，不暴露密钥。',
    errorCases: [{ condition: '模型前缀歧义、Provider 未配置或客户端可提交任意 base_url', handling: '使用显式映射和允许列表；端点及密钥只取服务端配置，找不到时清晰失败。' }],
    relatedApis: ['Config.resolve_preset', 'ProviderConfig', 'LLMProvider.chat', 'Nanobot.from_config'],
  },
  ToolsConfig: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'restrict_to_workspace', type: 'bool', required: true, description: '强制文件和命令相关工具只能访问规范化 workspace 边界。' },
      { name: 'enabled / disabled', type: 'list[str]', required: false, description: '显式控制可注册工具集合，生产环境优先从最小允许列表开始。' },
      { name: 'exec / filesystem / web', type: 'tool policy sections', required: false, description: '分别设置命令、文件和联网工具的超时、大小、域名与操作限制。' },
      { name: 'mcp_servers', type: 'mapping[str, MCPServerConfig]', required: false, description: '声明可信 MCP 服务及其启动方式、环境和调用超时。' },
    ], expectedOutput: '形成 ToolRegistry 的服务端安全策略，使 Agent 只能看到并执行当前环境允许的工具。',
    errorCases: [{ condition: '仅依赖提示词限制工具、workspace 符号链接逃逸或 shell 权限过大', handling: '在执行层强制策略、路径 realpath 校验并用低权限隔离进程；默认拒绝危险能力。' }],
    relatedApis: ['ToolRegistry.register', 'ToolRegistry.execute', 'Config.workspace_path', 'MCPServerConfig / ChannelsConfig'],
  },
  'MCPServerConfig / ChannelsConfig': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'command / url', type: 'str | None', required: true, description: 'MCP 选择本地受控命令或远端固定 URL；Channel 选择已安装实现。' },
      { name: 'args / env / headers', type: 'list | mapping', required: false, description: '传递最小必要启动参数和凭据引用，禁止来自普通消息动态拼接。' },
      { name: 'tool_timeout / enabled', type: 'number / bool', required: false, description: '限制外部工具调用时长并明确服务或 Channel 是否启用。' },
      { name: 'allowlists / channel options', type: 'mapping', required: false, description: '配置发送者允许列表、平台设置及其他实现特定安全策略。' },
    ], expectedOutput: '生成外部 MCP 与消息 Channel 的可验证连接配置，供 Gateway 按生命周期安全装配。',
    errorCases: [{ condition: '命令注入、SSRF、子进程继承全部环境，或 Channel 默认允许所有发送者', handling: '命令/域名白名单、最小环境和网络隔离；Channel 默认拒绝并验证平台身份。' }],
    relatedApis: ['ToolsConfig', 'nanobot.tools entry point', 'nanobot.channels entry point', 'nanobot gateway'],
  },
  'nanobot --version': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无业务参数', type: 'CLI global option', required: false, description: '输出当前安装的 nanobot 版本后退出，不加载 Agent 或启动后台服务。' }],
    expectedOutput: '终端打印精确版本字符串，可用于复现问题、文档匹配和部署镜像审计。',
    errorCases: [{ condition: '命令来自不同虚拟环境导致报告版本与实际服务不一致', handling: '用与服务相同解释器和环境执行，并同时记录锁文件或镜像摘要。' }],
    relatedApis: ['nanobot status', 'nanobot onboard'],
  },
  'nanobot onboard': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'interactive answers', type: 'provider/model/workspace choices', required: true, description: '向导收集 Provider、模型和 workspace 选择，敏感值不应显示或写入历史。' },
      { name: 'config destination', type: 'Path', required: false, description: '生成配置文件的受控位置，已存在时需要明确覆盖或合并策略。' },
      { name: 'workspace initialization', type: 'bool/options', required: false, description: '决定是否创建 Memory、Skills 等初始目录和示例文件。' },
    ], expectedOutput: '创建可由 load_config 读取的基础配置和 workspace，并给出下一步状态检查命令。',
    errorCases: [{ condition: '覆盖已有配置、终端回显密钥，或生成目录权限允许其他用户读取', handling: '先备份并要求确认；密钥使用隐藏输入和环境引用，文件权限设为仅当前用户。' }],
    relatedApis: ['load_config', 'save_config', 'nanobot status', 'Config.workspace_path'],
  },
  'nanobot status': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: 'config / workspace context', type: 'CLI resolved defaults', required: false, description: '检查当前 CLI 环境解析到的配置、workspace 与关键依赖状态。' }],
    expectedOutput: '打印可操作的配置、Provider、workspace 和服务就绪摘要，不应显示完整凭据。',
    errorCases: [{ condition: '状态命令泄露密钥，或只检查文件存在却误报 Provider 可用', handling: '所有敏感值脱敏；区分静态配置有效、网络连通和真实鉴权三个层级。' }],
    relatedApis: ['nanobot --version', 'nanobot onboard', 'load_config', 'Config.get_provider'],
  },
  'nanobot agent': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'message', type: 'str | interactive input', required: false, description: '单次消息或交互式终端输入，进入 Agent 前执行长度和内容边界处理。' },
      { name: 'session', type: 'str | None', required: false, description: '选择稳定会话键以延续上下文，避免不同用户共享默认会话。' },
      { name: 'config / workspace', type: 'Path | None', required: false, description: '覆盖可信配置和工作目录，只应从操作者启动参数读取。' },
      { name: 'model / preset / output flags', type: 'CLI options', required: false, description: '选择允许的模型预设以及 Markdown、日志或流式输出方式。' },
    ], expectedOutput: '在终端运行一次或持续的 AgentLoop，展示文本、工具事件和最终运行状态。',
    errorCases: [{ condition: '共享 session 泄露历史、Ctrl-C 未取消工具，或 verbose 日志打印秘密', handling: '显式隔离会话；捕获取消并优雅关闭，日志对消息、参数和凭据统一脱敏。' }],
    relatedApis: ['Nanobot.run', 'Nanobot.stream', 'SessionClient.get', 'Nanobot.aclose'],
  },
  'nanobot gateway': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'config / workspace', type: 'Path | None', required: false, description: '指定 Gateway 使用的可信配置和工作目录，决定 Provider、工具与 Channel。' },
      { name: 'verbose', type: 'bool', required: false, description: '开启诊断日志但仍必须脱敏消息、工具参数、令牌和平台凭据。' },
      { name: 'foreground / background', type: 'process mode', required: false, description: '选择前台运行或交由服务管理器托管，生产环境应支持健康与退出信号。' },
      { name: 'runtime limits', type: 'timeouts/concurrency', required: false, description: '限制消息并发、Agent 运行时长和关停等待，避免资源耗尽。' },
    ], expectedOutput: '启动消息 Gateway，装配 Channels、Nanobot、Cron 和后台任务并持续处理授权消息。',
    errorCases: [{ condition: '重复实例消费消息、未授权发送者进入 Agent，或 SIGTERM 直接丢失任务', handling: '平台游标/租约防重复；Channel 先鉴权，信号触发 stop、flush 和 aclose。' }],
    relatedApis: ['BaseChannel.start', 'CronService.start', 'Nanobot.from_config', 'nanobot gateway service management'],
  },
  'nanobot gateway service management': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'action', type: 'install | start | stop | restart | status | logs', required: true, description: '选择服务管理动作并以明确子命令执行，避免隐式修改系统状态。' },
      { name: 'service scope', type: 'user | system', required: false, description: '确定服务归属和权限边界，默认用户级可降低宿主机影响范围。' },
      { name: 'follow / dry-run options', type: 'CLI flags', required: false, description: '日志跟随和变更预览选项，部署前可先审查生成的服务定义。' },
      { name: 'config environment', type: 'paths/env references', required: true, description: '固化服务使用的解释器、配置与密钥引用，避免依赖交互 shell 环境。' },
    ], expectedOutput: '安装或控制持久 Gateway 服务，并返回进程状态、退出码或可审计日志位置。',
    errorCases: [{ condition: '错误作用域覆盖其他服务、服务环境缺少密钥，或重启形成崩溃循环', handling: '使用唯一服务名和最小权限；启动前校验环境，设置退避与最大重启次数。' }],
    relatedApis: ['nanobot gateway', 'nanobot status', 'CronService.stop', 'Nanobot.aclose'],
  },
  'nanobot serve': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'host', type: 'str', required: false, defaultValue: '127.0.0.1', description: 'HTTP 服务监听地址；暴露到非本机网络前必须增加认证、TLS 和访问控制。' },
      { name: 'port', type: 'int', required: false, description: '监听端口，启动前检查冲突并由部署平台统一管理映射。' },
      { name: 'config / workspace', type: 'Path | None', required: false, description: '为 HTTP Agent 服务装配可信配置、会话存储和工具边界。' },
      { name: 'timeout / concurrency', type: 'number', required: false, description: '限定请求、流和 Agent 执行的总时长与并发资源预算。' },
      { name: 'verbose', type: 'bool', required: false, description: '控制服务诊断输出，生产环境仍需对请求体和敏感字段脱敏。' },
    ], expectedOutput: '启动 HTTP API 服务，为请求提供隔离的 run/stream 能力并在退出时优雅关闭资源。',
    errorCases: [{ condition: '绑定 0.0.0.0 无认证、客户端断开后 Agent 继续运行或请求共享 session', handling: '默认仅本机；网关层鉴权限流，断连传播取消，并由服务端生成租户会话键。' }],
    relatedApis: ['Nanobot.run', 'Nanobot.run_streamed', 'Nanobot.aclose', 'nanobot gateway'],
  },
  'nanobot channels status': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'config context', type: 'Path | resolved Config', required: false, description: '选择要检查的 Channel 配置环境，仅读取必要状态且不输出完整凭据。' }],
    expectedOutput: '逐个显示 Channel 的启用、登录和可用状态，并提供不泄密的失败原因摘要。',
    errorCases: [{ condition: '把配置存在误判为已登录，或状态输出包含 token、用户白名单明细', handling: '区分配置/凭据/连通状态；敏感值和身份列表仅显示脱敏统计。' }],
    relatedApis: ['nanobot channels login', 'BaseChannel.login', 'nanobot gateway'],
  },
  'nanobot channels login': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'channel', type: 'str', required: true, description: '选择已安装且配置允许的 Channel 名称，不能加载任意模块路径。' },
      { name: 'force', type: 'bool', required: false, defaultValue: 'False', description: '已有登录状态时是否强制重新认证，用于凭据轮换或故障恢复。' },
      { name: 'config context', type: 'Path | resolved Config', required: false, description: '指定登录结果对应的配置环境和凭据存储边界。' },
    ], expectedOutput: '完成交互或设备登录并安全保存可撤销凭据，返回明确的 Channel 登录状态。',
    errorCases: [{ condition: '在无交互服务中等待输入、凭据保存为明文，或回调身份未验证', handling: '登录独立于 Gateway 完成；凭据用系统安全存储，并验证 state/设备码和目标账号。' }],
    relatedApis: ['BaseChannel.login', 'nanobot channels status', 'nanobot.channels entry point'],
  },
  'nanobot provider login': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'provider', type: 'str', required: true, description: '选择支持登录流程的已配置 Provider 名称，而不是用户提供的动态端点。' }],
    expectedOutput: '完成 Provider 认证并保存可轮换凭据，随后 Config.get_provider 可用于模型调用。',
    errorCases: [{ condition: '设备码钓鱼、回调 state 不匹配、token 明文落盘或授权范围过大', handling: '向用户展示官方域名和目标账号；校验 state，安全存储并申请最小权限。' }],
    relatedApis: ['nanobot provider logout', 'Config.get_provider', 'ProviderConfig', 'nanobot status'],
  },
  'nanobot provider logout': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'provider', type: 'str', required: true, description: '指定要撤销本地登录状态的 Provider，操作前应确认当前账号和环境。' }],
    expectedOutput: '删除本地凭据并尽可能撤销远端授权，返回后新的模型调用应明确要求重新登录。',
    errorCases: [{ condition: '只删本地缓存却未撤销远端 token，或误登出另一环境账号', handling: '展示脱敏账号并确认；同时调用撤销端点，失败时明确提示用户去控制台处理。' }],
    relatedApis: ['nanobot provider login', 'Config.get_provider', 'ProviderConfig'],
  },
} satisfies Record<string, FrameworkApiLearningMeta>

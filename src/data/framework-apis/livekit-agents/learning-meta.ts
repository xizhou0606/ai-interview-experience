import type {
  FrameworkApiErrorCase,
  FrameworkApiLearningLevel,
  FrameworkApiLearningMeta,
  FrameworkApiParameter,
} from '../types'

const p = (name: string, type: string, required: boolean, description: string, defaultValue?: string): FrameworkApiParameter => ({
  name, type, required, description, ...(defaultValue === undefined ? {} : { defaultValue }),
})

const e = (condition: string, handling: string): FrameworkApiErrorCase => ({ condition, handling })

const m = (
  learningLevel: FrameworkApiLearningLevel,
  parameters: FrameworkApiParameter[],
  expectedOutput: string,
  errorCases: FrameworkApiErrorCase[],
  relatedApis: string[],
): FrameworkApiLearningMeta => ({ learningLevel, runtime: 'server', parameters, expectedOutput, errorCases, relatedApis })

const agentSessionMeta = {
  Agent: m('core', [
    p('instructions', 'str', true, '定义角色目标、行为边界与回答风格；应由服务端版本化，不能直接拼接不可信用户输入。'),
    p('tools', 'list[FunctionTool]', false, '暴露给模型的最小工具集合；工具参数和权限仍须在执行端独立校验。'),
    p('stt / vad / llm / tts', 'component | str', false, '可按角色覆写语音识别、活动检测、模型与合成组件；未提供时继承 Session 配置。'),
    p('turn_detection', 'TurnDetectionMode', false, '控制该角色如何判断用户一轮结束，并与端点延迟和打断策略共同作用。'),
  ], '返回尚未运行的 Agent 角色定义；交给 AgentSession.start 或 update_agent 后才参与实时媒体和模型处理。', [
    e('跨用户复用带可变状态的 Agent 实例', '每个会话创建独立实例，把持久事实存入外部数据库，并在 handoff 时只传递必要摘要。'),
  ], ['AgentSession', 'AgentSession.start', 'Agent.update_tools', 'Agent.on_enter']),
  'Agent.on_enter': m('advanced', [
    p('self.session', 'AgentSession', true, '当前角色绑定的活动会话，可用于生成开场回复或读取本会话上下文。'),
  ], '协程正常完成后表示角色进入初始化结束，不直接返回业务消息；其触发的回复会通过会话播放链路异步产生。', [
    e('handoff 或重连导致重复欢迎与重复副作用', '让进入逻辑幂等并记录角色阶段，昂贵资源提前预热，避免阻塞首个回复。'),
  ], ['Agent', 'Agent.on_exit', 'AgentSession.generate_reply', 'AgentSession.update_agent']),
  'Agent.on_exit': m('advanced', [
    p('self.session', 'AgentSession', true, '即将离开的角色所绑定会话，只适合做短小清理与尽力持久化。'),
  ], '没有业务返回值；协程结束后框架可继续角色切换或会话关闭，但进程异常时不保证该钩子一定执行。', [
    e('把唯一的数据持久化机会放在退出钩子', '关键状态在每轮完成时增量保存；退出逻辑保持短小、幂等并容忍任务取消。'),
  ], ['Agent.on_enter', 'AgentSession.update_agent', 'AgentSession.aclose']),
  'Agent.on_user_turn_completed': m('core', [
    p('turn_ctx', 'ChatContext', true, '本轮提交给模型前的可修改上下文，可安全追加检索资料或业务事实。'),
    p('new_message', 'ChatMessage', true, '刚确认结束的用户最终消息；不要把临时转写当作已提交文本。'),
    p('self.session', 'AgentSession', true, '提供当前会话、userdata 与生成控制；慢操作会直接增加端到端响应延迟。'),
  ], '不返回 Agent 回复；对 turn_ctx 的修改会进入本轮 LLM 请求，因此是 RAG、画像和策略注入的关键边界。', [
    e('检索超时或不可信文档污染高优先级上下文', '设置短超时、候选与字符上限，标注资料来源，并把用户可控内容作为数据而非系统指令。'),
  ], ['ChatContext', 'ChatContext.add_message', 'UserInputTranscribedEvent', 'Agent.llm_node']),
  'Agent.llm_node': m('advanced', [
    p('chat_ctx', 'ChatContext', true, '已经完成本轮补充的聊天上下文，包含消息与配对后的工具调用结果。'),
    p('tools', 'list[FunctionTool]', true, '本轮允许模型选择的工具定义；覆写节点仍需保持 schema 与执行器一致。'),
    p('model_settings', 'ModelSettings', true, '本轮工具选择、温度等模型设置，通常应传递给默认实现或受控路由器。'),
  ], '返回或产出 ChatChunk 异步流；这些增量继续驱动工具解析、文本分句和 TTS，返回 None 表示自定义逻辑接管。', [
    e('覆写时破坏 chunk 顺序、取消传播或指标采集', '优先包装默认节点并逐块 yield；保留取消异常、工具 schema 和请求关联标识。'),
  ], ['LLM.chat', 'LLMStream.collect', 'Agent.tts_node', 'LLMMetrics']),
  'Agent.stt_node': m('advanced', [
    p('audio', 'AsyncIterable[rtc.AudioFrame]', true, '连续用户音频帧输入，消费速度必须跟上实时采集以免缓冲无界增长。'),
    p('model_settings', 'ModelSettings', true, '携带语言、关键字或连接策略等识别配置，应与当前参与者和业务语言一致。'),
  ], '返回 SpeechEvent 异步流；interim 只用于即时字幕，final transcript 才能稳定进入用户轮次与后续生成。', [
    e('阻塞帧消费或把 interim 当 final 重复提交', '校验采样率并设置有界队列，只在最终事件提交业务文本，取消时关闭下游识别流。'),
  ], ['STT.stream', 'RecognizeStream.push_frame', 'SpeechEvent', 'Agent.on_user_turn_completed']),
  'Agent.tts_node': m('advanced', [
    p('text', 'AsyncIterable[str]', true, '来自模型或 say 的文本增量，分句大小决定首音延迟、语调完整性和请求数量。'),
    p('model_settings', 'ModelSettings', true, '包含语音与连接相关设置；角色切换时应确认目标 TTS 支持对应语言和声音。'),
  ], '返回 rtc.AudioFrame 异步流，随后由 RoomIO 发布到房间；流被取消通常表示用户打断或会话正在关闭。', [
    e('用户打断后合成仍继续并产生费用或旧音频', '让取消沿文本流传到 TTS，限制缓冲长度，并用 TTSMetrics 观察取消率和浪费。'),
  ], ['TTS.stream', 'SynthesizeStream.push_text', 'RoomIO', 'TTSMetrics']),
  'Agent.transcription_node': m('advanced', [
    p('text', 'AsyncIterable[str]', true, 'Agent 输出文本流，可在不改变语义的前提下移除 Markdown 或内部展示标记。'),
    p('model_settings', 'ModelSettings', true, '当前生成设置与语言上下文，可用于选择适合客户端字幕的格式策略。'),
  ], '返回要发布到房间的字符串增量；字幕和实际语音是独立通道，但事实内容与结束顺序必须保持一致。', [
    e('字幕顺序、数字或事实与实际语音不一致', '只做可逆展示格式化并保留增量顺序，用录制回放同时核对音频和最终字幕。'),
  ], ['Agent.tts_node', 'RoomOutputOptions', 'ConversationItemAddedEvent']),
  'Agent.update_instructions': m('core', [
    p('instructions', 'str', true, '替换后的完整角色指令，应来自经过审计和版本控制的服务端策略。'),
    p('调用时机', 'runtime phase', true, '应在阶段边界更新，并明确正在生成的旧回复是否需要先中断。'),
    p('同步范围', 'Agent + realtime session', true, '更新会同步到活动实时模型，但不会追溯重写已经提交的历史消息。'),
  ], '无业务返回值；await 完成后后续模型轮次使用新指令，已在途生成是否受影响取决于调用时序与 provider。', [
    e('直接拼接用户文本造成提示注入或并发更新乱序', '服务端渲染白名单模板并附版本号，在阶段状态机中串行更新且记录审计。'),
  ], ['Agent', 'RealtimeSession.update_instructions', 'AgentSession.interrupt']),
  'Agent.update_tools': m('core', [
    p('tools', 'list[FunctionTool]', true, '替换后的工具全集而非增量补丁，应按当前身份和阶段实施最小权限。'),
    p('工具 schema', 'JSON Schema', true, '名称、参数与描述会影响模型选择，必须和真正执行函数的验证逻辑同步。'),
    p('在途调用', 'FunctionCall state', true, '移除或改名工具前要处理已经生成但尚未完成的调用与历史配对。'),
  ], '无业务返回值；更新完成后新 LLM 请求看到新的工具集合，旧上下文中的历史工具调用仍应保持可解释。', [
    e('权限收回后在途调用仍能执行敏感动作', '执行端每次重新鉴权并支持幂等取消，工具 schema 变更采用兼容窗口和版本化名称。'),
  ], ['function_tool', 'FunctionTool', 'RunContext.update', 'FunctionToolsExecutedEvent']),
  'Agent.update_chat_ctx': m('core', [
    p('chat_ctx', 'ChatContext', true, '用于替换当前历史的完整上下文，应从持久事实复制构建而非并发原地修改。'),
    p('exclude_invalid_function_calls', 'bool', false, '是否过滤缺少配对输出的无效工具调用，默认开启可避免 provider 拒绝上下文。', 'True'),
    p('token 预算', 'application policy', true, '替换前应裁剪或摘要长历史，同时保留工具调用与结果的配对关系。'),
  ], '无业务返回值；活动 Agent 与实时模型会话随后看到一致的新历史，但它不是数据库事务或长期记忆存储。', [
    e('裁剪后留下孤立 function call 或丢失关键业务事实', '使用 copy 和 truncate 构建新对象，写配对校验，并把可靠事实保存在外部存储。'),
  ], ['ChatContext.copy', 'ChatContext.truncate', 'ChatContext.add_message', 'AgentSession.userdata']),
  AgentSession: m('core', [
    p('stt / vad / llm / tts', 'component | str', false, '组成传统实时语音流水线的组件；也可将 RealtimeModel 作为融合式模型边界。'),
    p('tools', 'list[FunctionTool]', false, '会话级默认工具集合，Agent 自身配置可覆写；执行端仍需鉴权和参数校验。'),
    p('userdata', 'Userdata_T', false, '本会话业务状态容器，只能保存当前用户数据，不能跨会话共享可变对象。'),
    p('turn_handling', 'TurnHandlingOptions', false, '统一控制端点检测、打断、轮次上限和预生成，是语音体验调优核心。'),
  ], '返回未启动的会话编排器；start 后才连接 Agent、房间媒体、模型、工具、播放和事件生命周期。', [
    e('一个 AgentSession 被多个用户或房间复用', '每个 job/参与者创建独立实例，所有监听器、凭证和 userdata 随会话关闭释放。'),
  ], ['Agent', 'AgentSession.start', 'TurnHandlingOptions', 'RoomIO']),
  'AgentSession.start': m('core', [
    p('agent', 'Agent', true, '本次启动的初始活动角色，其指令和节点覆写将进入会话流水线。'),
    p('room', 'rtc.Room', false, '要绑定的已连接 LiveKit 房间；省略时需另行配置输入输出适配器。'),
    p('room_options', 'RoomOptions', false, '集中配置房间输入输出；新代码优先使用它而不是旧兼容参数。'),
    p('capture_run', 'bool', false, '开启后返回可检查的 RunResult，适合测试、文本运行和结构化结果采集。', 'False'),
  ], 'capture_run=True 时返回 RunResult，否则通常返回 None；方法返回后长期媒体会话仍在后台运行，不表示对话结束。', [
    e('重复 start 或把返回当作会话已经结束', '每个 Session 只启动一次，用事件和 close 策略管理生命周期，测试时显式捕获运行结果。'),
  ], ['AgentSession', 'RoomIO.start', 'AgentSession.aclose', 'AgentSession.run']),
  'AgentSession.run': m('core', [
    p('user_input', 'str', true, '一次文本或结构化运行的用户输入；不要混入系统级策略或未清洗模板。'),
    p('input_modality', 'str', false, '声明输入模态，文本测试通常使用 text，并应与传入数据的真实格式一致。', 'text'),
    p('output_type', 'type[Run_T]', false, '可选结构化输出类型，用于验证模型结果而不是仅依赖自然语言解析。'),
    p('output_options', 'RunOutputOptions', false, '控制运行输出采集与验证方式，需和 output_type 的 schema 相匹配。'),
  ], '返回可等待的 RunResult[Run_T]，其中包含本次运行的结构化或文本结果；它适合可控调用而非替代房间长会话。', [
    e('输出不符合类型或把文本 run 与实时房间状态混用', '捕获验证错误并设计重试/降级，测试与线上会话使用独立 Session 和明确输入模态。'),
  ], ['AgentSession.start', 'ChatContext', 'LLM.chat']),
  'AgentSession.say': m('core', [
    p('text', 'str | AsyncIterable[str]', true, '要直接播出的确定文本或文本流，不会让 LLM 改写其事实内容。'),
    p('audio', 'AudioSource', false, '可选预生成音频；提供时应保证采样率、声道和文本字幕保持一致。'),
    p('allow_interruptions', 'bool', false, '是否允许用户 barge-in 停止这段播放；关键合规提示可按产品策略禁用。'),
    p('add_to_chat_ctx', 'bool', false, '是否把本次话语写入会话历史，关闭后后续模型可能不知道已经说过。', 'True'),
  ], '立即返回 SpeechHandle；播放和写入历史在后台推进，需要等待 handle 或 wait_for_idle 才能确认音频真正播完。', [
    e('把拿到 SpeechHandle 当作用户已经听完', '需要顺序副作用时显式等待播放完成，打断场景检查 handle 状态并避免重复执行。'),
  ], ['AgentSession.generate_reply', 'AgentSession.wait_for_idle', 'RunContext.wait_for_playout']),
  'AgentSession.generate_reply': m('core', [
    p('user_input', 'str', false, '可选追加的用户输入；已有完整轮次时不应重复传入相同文本。'),
    p('instructions', 'str', false, '只约束本次生成的临时指令，不应替代长期 Agent instructions。'),
    p('tool_choice', 'ToolChoice', false, '控制本轮工具选择策略；强制工具时仍必须在执行端校验权限和参数。'),
    p('allow_interruptions', 'bool', false, '决定本次生成及播放能否被用户语音打断，应与全局打断策略一致。'),
  ], '立即返回 SpeechHandle；LLM 流、工具调用、TTS 与播放随后异步发生，最终内容和完成状态通过 handle 与事件观察。', [
    e('并发触发多个回复造成音频重叠或工具乱序', '建立会话级生成队列，必要时先 interrupt 并等待旧 speech 收敛，再启动新回复。'),
  ], ['AgentSession.say', 'AgentSession.interrupt', 'Agent.llm_node', 'FunctionToolsExecutedEvent']),
  'AgentSession.interrupt': m('core', [
    p('force', 'bool', false, '为 true 时强制中断，即使当前 speech 配置为不允许普通用户打断。', 'False'),
    p('当前播放', 'SpeechHandle', true, '中断作用于当前活动 speech；没有播放时返回的 Future 仍应按幂等操作处理。'),
    p('后续状态', 'asyncio.Future[None]', true, '调用方应等待 Future，确认取消与播放停止已经沿流水线传播完成。'),
  ], '返回 asyncio.Future[None]；完成表示当前回复的生成/合成/播放中断已处理，不会自动生成替代回答。', [
    e('强制中断关键提示或未等待就立即启动新播放', '仅在服务端策略允许时 force，等待 Future 完成并记录打断原因，再决定是否恢复或重答。'),
  ], ['InterruptionOptions', 'AgentSession.generate_reply', 'AgentSession.wait_for_idle']),
  'AgentSession.commit_user_turn': m('core', [
    p('transcript_timeout', 'float', false, '等待最终转写到达的最长秒数，超时后需决定使用已有文本还是提示重说。', '2.0'),
    p('stt_flush_duration', 'float', false, '提交前允许 STT 刷新尾部音频的秒数，过短可能截断，过长增加响应延迟。', '2.0'),
    p('skip_reply', 'bool', false, '为 true 时只提交用户轮次但不自动生成回复，适合外部状态机接管。', 'False'),
  ], '返回 Future[str]；完成后得到最终提交的用户 transcript，并据 skip_reply 决定是否继续驱动 Agent 回复。', [
    e('手动提交过早导致尾音丢失或和自动端点重复提交', '只在 push-to-talk/外部端点模式调用，串行化轮次并对 transcript 做空值和重复检查。'),
  ], ['AgentSession.clear_user_turn', 'SpeechEvent', 'EndpointingOptions']),
  'AgentSession.clear_user_turn': m('advanced', [
    p('当前未提交轮次', 'session turn buffer', true, '清理对象是当前积累但尚未 commit 的用户音频与转写，不会删除既有聊天历史。'),
  ], '无返回值；当前待提交用户轮次缓冲被丢弃，系统不会自动恢复这些音频或生成对应回复。', [
    e('误清已获得用户确认的重要输入', '仅在取消按键或明确重录流程中调用，UI 提示状态并保留必要的客户端草稿。'),
  ], ['AgentSession.commit_user_turn', 'ChatContext', 'UserInputTranscribedEvent']),
  'AgentSession.update_agent': m('core', [
    p('agent', 'Agent', true, '要切换成的完整角色实例，必须属于当前会话且不能携带其他用户状态。'),
    p('handoff context', 'ChatContext', true, '切换前应决定保留原始历史、裁剪历史还是只传递经过审计的阶段摘要。'),
    p('lifecycle hooks', 'on_exit / on_enter', true, '更新会触发角色生命周期边界，钩子必须短小并能承受重复或取消。'),
  ], '无直接业务返回值；当前 Agent 被替换，后续轮次和生成使用新角色，角色进入退出钩子按会话时序执行。', [
    e('handoff 丢失上下文、重复欢迎或跨租户泄漏状态', '构造全新角色并显式传递最小上下文，给 handoff 设阶段 id，并记录切换审计。'),
  ], ['Agent', 'Agent.on_enter', 'Agent.on_exit', 'Agent.update_chat_ctx']),
  'AgentSession.update_options': m('core', [
    p('endpointing_opts', 'EndpointingOptions', false, '动态更新停顿到轮次结束的等待策略，应使用真实录音验证延迟与截断率。'),
    p('turn_detection', 'TurnDetectionMode', false, '切换 VAD、STT 或语义端点模式时必须确认所需组件和 provider 能力可用。'),
    p('keyterms', 'list[str]', false, '传给支持关键字增强的 STT，内容应受长度限制并避免敏感词进入日志。'),
    p('min/max_endpointing_delay', 'float', false, '兼容性端点秒数参数；新代码优先集中使用 endpointing_opts，避免两套配置冲突。'),
  ], '无返回值；新策略作用于后续用户轮次，不保证重新解释已经开始或已经提交的当前轮次。', [
    e('在线调参导致当前轮次状态不一致或单位配置错误', '仅在轮次边界串行更新，统一使用秒并记录配置版本，灰度观察 EOU 指标。'),
  ], ['TurnHandlingOptions', 'EndpointingOptions', 'InterruptionOptions', 'EOUMetrics']),
  'AgentSession.wait_for_idle': m('advanced', [
    p('会话生命周期', 'AgentSession', true, '等待对象是当前会话的活动任务与播放，不应在事件循环中用同步阻塞替代 await。'),
  ], '返回已收敛的 AgentActivity；表示当前处理和播放进入 idle，不代表房间关闭，也不阻止随后到来的新用户输入。', [
    e('在仍接收新输入的会话中无限等待 idle', '为业务等待添加外层超时，必要时先停止输入或 drain，并处理新轮次竞态。'),
  ], ['AgentSession.drain', 'AgentSession.say', 'AgentSession.aclose']),
  'AgentSession.drain': m('advanced', [
    p('当前活动任务', 'session activities', true, '等待现有生成、工具与播放收敛，同时不应再接纳无限的新工作。'),
  ], '协程完成后当前 Session 已排空在途活动，适合优雅关停；它本身不会释放全部连接和监听器。', [
    e('持续接收新输入导致 drain 无法结束', '先从入口摘流并设置关停超时，超时后转入 aclose，副作用工具仍用幂等恢复。'),
  ], ['AgentSession.wait_for_idle', 'AgentSession.aclose', 'AgentServer.drain']),
  'AgentSession.aclose': m('core', [
    p('关闭时机', 'lifecycle boundary', true, '在房间离开、job 结束或异常退出时调用，且每个 Session 最终都应执行。'),
    p('在途任务', 'async tasks', true, '关闭会取消或结束媒体、模型和播放任务，关键副作用不能只依赖进程内完成。'),
    p('幂等调用', 'awaitable close', true, '清理路径应允许重复触发并始终 await，避免连接和监听器残留。'),
  ], '协程完成表示会话拥有的流、任务和 I/O 已关闭；不会自动删除外部数据库、录制或 provider 侧持久资源。', [
    e('异常路径遗漏 await aclose 造成悬挂任务和连接泄漏', '在 try/finally 或 Job shutdown callback 中统一关闭，并监控未结束任务与连接数量。'),
  ], ['AgentSession.drain', 'RoomIO.aclose', 'AgentServer.aclose']),
  'AgentSession.userdata': m('core', [
    p('类型参数', 'Userdata_T', true, '为业务状态定义明确 dataclass 或 TypedDict，减少随意字典键和运行时类型错误。'),
    p('作用域', 'per-session', true, '数据只属于当前 Session 和用户，禁止使用共享可变默认值或跨 job 缓存。'),
    p('持久性', 'in-memory state', true, '它是进程内便捷状态而非可靠数据库，关键事实需要增量写入外部存储。'),
  ], '读取当前会话携带的强类型业务状态对象；对其修改立即影响本进程后续逻辑，但不自动持久化或跨重启恢复。', [
    e('把 userdata 当数据库或混入其他会话对象', '每次创建 Session 时构造新值，敏感字段最小化，关键状态使用稳定主键写外部存储。'),
  ], ['AgentSession', 'RunContext', 'get_job_context']),
} satisfies Record<string, FrameworkApiLearningMeta>

const llmToolMeta = {
  ChatContext: m('core', [
    p('items', 'list[ChatItem] | NotGiven', false, '按会话时序排列的消息、工具调用和结果；工具调用必须保留成对关系。'),
    p('所有权', 'per-session value', true, '上下文应属于单个会话，通过 copy 创建修改版本，避免多个任务并发原地写。'),
    p('token 预算', 'application policy', true, '长会话需裁剪、摘要或外部记忆检索，不能让历史无限增长到模型上限。'),
  ], '返回聊天上下文容器，供 Agent 和 LLM 请求读取；它表示生成历史而不是可靠业务数据库或自动长期记忆。', [
    e('工具调用与输出失配或跨用户复用上下文', '每会话独立构造，更新前做配对校验，并把持久事实按用户主键存入外部系统。'),
  ], ['ChatContext.empty', 'ChatContext.add_message', 'ChatContext.copy', 'ChatContext.truncate']),
  'ChatContext.empty': m('advanced', [
    p('类方法调用', 'ChatContext.empty()', true, '无需传入消息，得到新的独立空上下文，不能把一个实例作为全局可变默认值共享。'),
  ], '返回不含任何 ChatItem 的新 ChatContext，可作为测试、全新会话或安全重建历史的起点。', [
    e('清空历史后模型丢失必要身份和业务事实', '重新注入受控 instructions 和最小可靠事实，并把清空动作记录为明确会话事件。'),
  ], ['ChatContext', 'ChatContext.add_message', 'Agent.update_chat_ctx']),
  'ChatContext.add_message': m('core', [
    p('role', 'ChatRole', true, '声明 system、user 或 assistant 等消息角色，不能让用户自行选择高权限角色。'),
    p('content', 'str | list[ChatContent]', true, '消息文本或多模态内容；输入需限长、校验资源来源并避免敏感日志。'),
    p('id', 'str | NotGiven', false, '可选稳定消息标识，用于去重、审计和客户端同步，不应包含隐私明文。'),
    p('created_at', 'float | NotGiven', false, '可选创建时间；排序仍应遵循上下文 items 顺序而非仅信任客户端时间。'),
  ], '返回并追加一个 ChatMessage 到当前上下文；该操作只改变内存历史，不会自动触发模型生成或持久化。', [
    e('把用户文本追加为 system 角色或重复追加同一消息', '服务端固定角色映射，按 message id 去重，并在写入模型前限制长度和内容类型。'),
  ], ['ChatMessage', 'ChatContext.copy', 'AgentSession.generate_reply']),
  'ChatContext.copy': m('core', [
    p('exclude_function_call', 'bool', false, '是否排除工具调用项；排除时同时考虑相关结果，避免产生孤立上下文。', 'False'),
    p('exclude_instructions', 'bool', false, '是否排除指令项，handoff 时可用但必须由目标 Agent 重新提供安全策略。', 'False'),
    p('exclude_empty_message', 'bool', false, '是否过滤空消息，通常有助于避免 provider schema 拒绝。', 'False'),
    p('tools', 'list[FunctionTool] | None', false, '可按新工具集合修整上下文中的工具引用，需与目标 Agent 能力保持一致。'),
  ], '返回独立 ChatContext 副本；后续修改副本不会有意改变原上下文，适合裁剪、handoff 和测试快照。', [
    e('复制时只删除工具调用却保留无归属结果', '对 items 做成对完整性校验，使用框架过滤选项并写 provider 契约测试。'),
  ], ['ChatContext', 'ChatContext.truncate', 'Agent.update_chat_ctx']),
  'ChatContext.truncate': m('core', [
    p('max_items', 'int', true, '保留的最大 ChatItem 数量；它按条目而非精确 token 计数，需留足模型上下文余量。'),
    p('工具配对', 'context invariant', true, '裁剪边界不能拆开 function call 与 output，也不能留下无法解释的孤立结果。'),
    p('关键事实', 'memory policy', true, '被删除的历史若包含业务事实，应先形成受控摘要或写入外部长期记忆。'),
  ], '返回经过条目上限裁剪的 ChatContext；它降低历史规模，但不保证精确满足具体模型的 token 窗口。', [
    e('机械截断丢失系统约束或拆散工具调用', '保留独立 instructions，裁剪前做结构校验，并用 tokenizer/摘要策略控制真实 token。'),
  ], ['ChatContext.copy', 'Agent.update_chat_ctx', 'ChatContext.add_message']),
  ChatMessage: m('core', [
    p('role', 'ChatRole', true, '消息角色决定模型解释方式，system/assistant 身份只能由受信服务端创建。'),
    p('content', 'str | list[ChatContent]', true, '支持文本或多模态内容，远程资源需白名单、大小限制和访问授权。'),
    p('id', 'str', false, '消息稳定标识可用于事件去重和持久化关联，不要直接使用可枚举用户秘密。'),
    p('interrupted', 'bool', false, '标记 Agent 话语是否被打断，回放和上下文策略应理解未完整播放的语义。', 'False'),
  ], '返回一条结构化聊天消息，可进入 ChatContext 和会话事件；构造消息本身不会触发播放或 LLM 请求。', [
    e('把未播完的 assistant 消息当作用户已完整听见', '保存 interrupted 状态，后续回复按实际 playout 决定是否重复关键内容。'),
  ], ['ChatContext.add_message', 'ConversationItemAddedEvent', 'AgentSession.say']),
  function_tool: m('core', [
    p('func', 'Callable', false, '要暴露给模型的 Python 函数；函数签名和类型注解决定默认参数 schema。'),
    p('name', 'str | NotGiven', false, '稳定工具名应表达业务动作并保持版本兼容，不能暴露内部任意函数路径。'),
    p('description', 'str | NotGiven', false, '告诉模型何时使用工具的明确说明，但不能替代执行端的鉴权和参数校验。'),
    p('raw_schema', 'dict | NotGiven', false, '需要精细控制时传入 JSON Schema，并通过测试保证与 Python 实际输入一致。'),
  ], '返回 FunctionTool，或作为装饰器返回包装后的可调用定义；模型只获得 schema，真实调用仍在受信执行器中完成。', [
    e('模型参数合法但调用者无权限执行副作用', '工具函数内部根据当前 RunContext 重新鉴权，使用幂等键并对高风险动作二次确认。'),
  ], ['FunctionTool', 'RunContext', 'Agent.update_tools', 'FunctionToolsExecutedEvent']),
  FunctionTool: m('advanced', [
    p('name / description', 'str', true, '面向模型的工具身份与使用说明，应稳定、无歧义并避免包含秘密实现细节。'),
    p('parameters schema', 'JSON Schema', true, '限定模型可提交的参数结构，但执行时仍需做类型、范围、租户和权限验证。'),
  ], '表示可由 LLM 选择的类型化工具定义，包含 schema 和执行入口；它不是对底层业务权限的授权凭证。', [
    e('动态工具列表与旧 schema 缓存不一致', '工具名称采用兼容版本，更新后发起新模型轮次，并对调用参数进行服务端强校验。'),
  ], ['function_tool', 'Agent.update_tools', 'LLM.chat']),
  RunContext: m('core', [
    p('session', 'AgentSession', true, '当前工具调用所属会话，用于访问 userdata 和受控更新，而非跨用户全局状态。'),
    p('speech_handle', 'SpeechHandle', true, '触发工具的当前回复句柄，可用于协调工具完成与实际播放时序。'),
    p('function_call', 'FunctionCall | None', false, '当前模型工具调用元数据，可作为审计关联，但参数仍需重新验证。'),
  ], '返回注入工具函数的运行上下文，连接模型调用、会话状态和播放生命周期；作用域仅限当前调用。', [
    e('工具把 RunContext 缓存到后台长期使用', '立即提取稳定主键与最小数据，后台任务自行管理生命周期和权限，不保留会话对象引用。'),
  ], ['function_tool', 'RunContext.update', 'RunContext.wait_for_playout']),
  'RunContext.update': m('core', [
    p('instructions', 'str | NotGiven', false, '可在工具执行期间更新角色指令，必须使用受控模板并记录策略版本。'),
    p('tools', 'list[FunctionTool] | NotGiven', false, '可更新后续能力集合；权限收回仍要在执行端立即生效。'),
    p('chat_ctx', 'ChatContext | NotGiven', false, '可替换后续生成历史，需保持消息和工具调用结果结构完整。'),
  ], '无返回值；提供的字段更新到当前运行上下文和后续会话步骤，未提供的字段保持不变。', [
    e('工具副作用与上下文更新部分成功造成状态分叉', '先提交幂等业务事务，再以可重试方式更新会话；失败时从持久事实重建上下文。'),
  ], ['RunContext', 'Agent.update_instructions', 'Agent.update_tools', 'Agent.update_chat_ctx']),
  'RunContext.wait_for_playout': m('advanced', [
    p('当前 speech_handle', 'SpeechHandle', true, '等待的是触发当前工具流程的相关语音播放完成，而非仅等待 TTS 已经生成。'),
  ], '协程完成表示关联音频已实际播完或结束；适合把必须在用户听到提示后发生的副作用按时序执行。', [
    e('用户打断后仍执行假设“已听完”的不可逆操作', '检查播放或中断状态，高风险操作要求显式用户确认，不能只依赖等待协程返回。'),
  ], ['AgentSession.say', 'AgentSession.interrupt', 'RunContext']),
  LLM: m('core', [
    p('provider implementation', 'LLM subclass', true, '抽象类需由具体 provider 插件实现，凭证和模型配置只放服务端环境。'),
    p('capabilities', 'model contract', true, '确认流式、工具调用、并行工具和结构化输出等能力与应用路径匹配。'),
    p('connection policy', 'APIConnectOptions', true, '统一设置超时、重试和并发，避免实时会话因无界重试放大尾延迟。'),
  ], '表示统一的语言模型适配器；调用 chat 才创建具体 LLMStream 和网络请求，实例通常可按进程复用。', [
    e('把同步阻塞 provider 或不兼容模型接入实时事件循环', '选择官方异步实现，启动时验证能力，并为限流、超时和区域故障配置有界降级。'),
  ], ['LLM.chat', 'LLMStream.collect', 'RealtimeModel', 'LLMMetrics']),
  'LLM.chat': m('core', [
    p('chat_ctx', 'ChatContext', true, '发送给模型的完整本轮上下文，调用前应完成裁剪、权限过滤和工具配对校验。'),
    p('tools', 'list[FunctionTool] | None', false, '本轮模型可选择的工具 schema；空列表与 None 的 provider 语义需通过适配器统一。'),
    p('conn_options', 'APIConnectOptions', false, '连接超时、重试等策略；实时回复应优先有界延迟而不是长时间自动重试。'),
    p('parallel_tool_calls', 'bool | NotGiven', false, '是否允许模型并行提出工具调用，仅在工具彼此独立且副作用可控时开启。'),
    p('tool_choice', 'ToolChoice | NotGiven', false, '限制自动、禁止或强制工具选择；执行端权限校验始终不可省略。'),
  ], '返回可异步迭代的 LLMStream；文本 chunk 和工具调用会逐步到达，创建 stream 不等于请求已经完整消费。', [
    e('未消费或未关闭 stream 导致连接泄漏，或并行副作用乱序', '使用 async for/上下文管理完整消费，取消时关闭流，并只并行执行可交换的只读工具。'),
  ], ['LLM', 'LLMStream.collect', 'Agent.llm_node', 'FunctionTool']),
  'LLMStream.collect': m('advanced', [
    p('当前 LLMStream', 'LLMStream', true, '收集会持续消费剩余流直到结束，不适合需要低延迟逐 token 驱动 TTS 的主链路。'),
  ], '协程返回聚合后的 ChatChunk，包含收集到的文本或调用信息；等待期间不会向调用方逐块暴露增量。', [
    e('在实时语音路径 collect 导致首音等待完整模型结束', '主链路使用 async for 流式处理，只在测试、短响应或确需完整结果时 collect。'),
  ], ['LLM.chat', 'Agent.llm_node', 'LLMMetrics']),
} satisfies Record<string, FrameworkApiLearningMeta>

const speechMeta = {
  STT: m('core', [
    p('capabilities', 'STTCapabilities', true, '声明实现是否支持 streaming、interim results 等能力，Session 会据此选择处理路径。'),
    p('provider configuration', 'STT subclass', true, '具体语言、模型和凭证由 provider 实现配置，应与用户语言和数据区域匹配。'),
    p('audio format', 'sample rate / channels', true, '输入音频格式必须满足实现要求，必要时在边界统一重采样而非静默错读。'),
  ], '表示语音识别器抽象；recognize 处理完整缓冲，stream 创建实时识别流，本身不消耗音频。', [
    e('能力声明与实际 provider 不符导致没有 interim 或无法流式', '启动时做能力检查和固定音频样本探测，并为不支持流式的实现配置适配器。'),
  ], ['STT.recognize', 'STT.stream', 'SpeechEvent', 'Agent.stt_node']),
  'STT.recognize': m('core', [
    p('buffer', 'AudioBuffer', true, '完整音频帧集合，应控制时长和内存，并保证采样率、声道连续一致。'),
    p('language', 'str | NotGiven', false, '识别语言或自动检测设置；明确语言通常能降低延迟和误识别。'),
    p('conn_options', 'APIConnectOptions', false, '本次网络超时与重试策略，批量音频也应设置最大时长和请求截止时间。'),
  ], '协程返回 SpeechEvent，通常包含最终 alternatives 与 usage；它不会持续接收随后产生的新音频。', [
    e('长音频一次性识别超时或语言选择错误', '按语义段切分并限制缓冲大小，重试保持幂等，使用真实口音数据评测语言配置。'),
  ], ['STT', 'STT.stream', 'SpeechEvent']),
  'STT.stream': m('core', [
    p('language', 'str | NotGiven', false, '本流的识别语言，运行中切换能力取决于 provider，通常每段会话保持稳定。'),
    p('conn_options', 'APIConnectOptions', false, '长连接建立、超时和重试策略；断线后需决定是否重放尚未确认的音频。'),
    p('生命周期', 'RecognizeStream', true, '创建后要持续 push_frame，按边界 flush，输入结束时 end_input，并消费全部事件。'),
  ], '返回 RecognizeStream；音频和 SpeechEvent 通过长连接双向推进，创建对象时尚未产生转写结果。', [
    e('只推音频不消费事件造成背压或断线重连重复文字', '并发运行生产者与消费者，队列设上限，用 request/speech 标识去重最终结果。'),
  ], ['RecognizeStream.push_frame', 'RecognizeStream.flush', 'RecognizeStream.end_input', 'SpeechEvent']),
  'RecognizeStream.push_frame': m('core', [
    p('frame', 'rtc.AudioFrame', true, '单个连续音频帧，采样率、声道和时间顺序必须与该识别流的预期一致。'),
    p('发送节奏', 'realtime cadence', true, '按实时速率持续推送，不能无界堆积，也不应在事件循环做耗时同步处理。'),
    p('流状态', 'open RecognizeStream', true, '只能在 end_input 前调用；断线或关闭后必须新建流而非继续写旧对象。'),
  ], '无返回值；帧被送入识别流输入队列，真正 interim/final 结果随后从 SpeechEvent 异步迭代侧到达。', [
    e('格式不一致、乱序或生产速度超过网络消费', '入口校验媒体格式，使用有界队列和背压，超限时按产品策略丢弃或重连而非占满内存。'),
  ], ['STT.stream', 'RecognizeStream.flush', 'SpeechEvent']),
  'RecognizeStream.flush': m('advanced', [
    p('当前输入缓冲', 'RecognizeStream buffer', true, '提示识别器处理当前已推音频但保持流可继续使用，不等于永久关闭输入。'),
  ], '无返回值；provider 可尽快产出当前段的识别事件，之后仍允许继续 push_frame 新音频。', [
    e('每帧 flush 导致请求碎片化或把 flush 当 final 保证', '只在真实段落边界调用，并依据 SpeechEvent.type/is final 判断最终文本。'),
  ], ['RecognizeStream.push_frame', 'RecognizeStream.end_input', 'SpeechEvent']),
  'RecognizeStream.end_input': m('advanced', [
    p('当前 RecognizeStream', 'open stream', true, '声明不再有音频帧输入；调用后仍需继续消费尾部 final 和 usage 事件。'),
  ], '无返回值；输入侧半关闭，识别器可处理尾部缓冲并结束事件流，调用后不能再次 push_frame。', [
    e('end_input 后立刻取消消费者导致尾词和最终转写丢失', '继续迭代直至流自然结束并设置外层超时，异常关闭时记录未确认音频范围。'),
  ], ['RecognizeStream.flush', 'SpeechEvent', 'AgentSession.commit_user_turn']),
  SpeechEvent: m('core', [
    p('type', 'SpeechEventType', true, '区分开始、临时结果、最终结果、usage 等事件，业务处理必须按类型分支。'),
    p('alternatives', 'list[SpeechData]', true, '候选转写及置信信息；选择文本前确认列表非空和语言策略。'),
    p('request_id', 'str', true, '关联 provider 请求与指标的标识，用于调试去重但不应暴露为用户身份。'),
    p('recognition_usage', 'RecognitionUsage', false, '可选识别用量数据，用于成本聚合，不能直接视为最终账单。'),
  ], '表示 STT 流上的一个结构化事件；只有最终识别事件适合提交到 ChatContext 和触发确定性业务。', [
    e('把 interim 持久化或 alternatives 为空时直接取首项', '按事件类型和 final 语义处理，空候选安全跳过，UI 临时字幕允许被后续覆盖。'),
  ], ['STT.recognize', 'STT.stream', 'UserInputTranscribedEvent', 'STTMetrics']),
  VAD: m('core', [
    p('capabilities', 'VADCapabilities', true, '描述活动检测器支持的流式能力和更新方式，需与 Session turn 策略匹配。'),
    p('threshold policy', 'provider options', true, '语音概率、最短讲话和静音阈值应使用真实噪声、口音和设备回放调优。'),
    p('audio format', 'sample rate / channels', true, '输入帧格式必须符合 VAD 实现要求，重采样延迟也计入端点体验。'),
  ], '表示语音活动检测抽象；stream 创建状态化检测流，用于说话开始/结束信号而不是生成文字。', [
    e('把 VAD 当作语义轮次结束，导致用户自然停顿时被抢话', '将 VAD 与 STT final、语义端点和 min/max delay 组合，并观察 EOU 与误打断率。'),
  ], ['VAD.stream', 'VADStream.push_frame', 'EndpointingOptions', 'EOUMetrics']),
  'VAD.stream': m('core', [
    p('VAD 实例', 'VAD', true, '从已配置且能力匹配的检测器创建，每位参与者应拥有独立的状态化流。'),
    p('音频连续性', 'stream invariant', true, '后续帧必须按时间顺序连续输入，丢帧和跨用户混流会破坏内部状态。'),
    p('消费生命周期', 'VADStream', true, '创建后需要并发推帧与消费事件，结束会话时显式关闭相关任务。'),
  ], '返回 VADStream，随后异步产生语音开始、推理中和语音结束等活动事件；创建时尚无检测结果。', [
    e('同一 VADStream 混入多个参与者或没有消费输出', '每参与者独立创建，使用有界队列并让生产、消费、关闭共享同一 job 生命周期。'),
  ], ['VAD', 'VADStream.push_frame', 'TurnHandlingOptions']),
  'VADStream.push_frame': m('core', [
    p('frame', 'rtc.AudioFrame', true, '按真实时间顺序送入的用户音频帧，格式需与 VAD 模型要求完全一致。'),
    p('背压', 'bounded queue', true, '推送速度必须受控，积压会让检测结果晚于真实讲话并破坏 barge-in 体验。'),
    p('参与者隔离', 'per-user stream', true, '每个流只能接收一个说话源，房间混音不能直接当作单用户端点信号。'),
  ], '无返回值；音频进入 VAD 状态机，语音活动事件随后从流的异步输出侧产生。', [
    e('事件延迟积累或回声被识别为用户打断', '限制队列、启用合适降噪/回声消除，并用真实全双工录音调整阈值。'),
  ], ['VAD.stream', 'InterruptionOptions', 'RoomInputOptions']),
} satisfies Record<string, FrameworkApiLearningMeta>

const ttsMeta = {
  TTS: m('core', [
    p('capabilities', 'TTSCapabilities', true, '声明实现是否支持流式文本等能力，Agent 会据此选择 synthesize 或 stream 路径。'),
    p('sample_rate', 'int', true, '合成音频采样率，必须与 RoomOutputOptions 或重采样器保持明确兼容。'),
    p('num_channels', 'int', true, '输出声道数；实时语音通常单声道，客户端和发布轨道必须使用一致格式。'),
  ], '表示语音合成器抽象；synthesize 处理完整文本，stream 接收增量文本，本身不会自动向房间播放。', [
    e('能力或媒体格式与输出轨道不匹配', '启动时验证 provider 能力并播放固定探针，统一采样率/声道，必要时显式重采样。'),
  ], ['TTS.synthesize', 'TTS.stream', 'RoomOutputOptions', 'Agent.tts_node']),
  'TTS.synthesize': m('core', [
    p('text', 'str', true, '一次性提交的完整待合成文本，应限长、过滤不支持标记并保留关键数字读法。'),
    p('conn_options', 'APIConnectOptions', false, '本次合成的超时和重试策略；实时首音路径必须限制无界重试。'),
    p('消费方式', 'ChunkedStream', true, '返回后需要异步迭代音频块，创建 stream 不代表所有音频已经生成。'),
  ], '返回 ChunkedStream，逐块产生合成音频与相关事件；适合完整短文本，但首帧仍需等待 provider 响应。', [
    e('长文本整段提交导致首音慢或取消后继续计费', '按自然句切分，异步消费并传播取消，用 TTSMetrics 观察 TTFB 和取消浪费。'),
  ], ['TTS', 'TTS.stream', 'TTSMetrics']),
  'TTS.stream': m('core', [
    p('conn_options', 'APIConnectOptions', false, '流式连接超时、重试和断线策略，重连时不能盲目重复已播放文本。'),
    p('输入协议', 'SynthesizeStream', true, '依次 push_text，句子边界 flush，模型输出结束后 end_input。'),
    p('输出消费', 'async audio events', true, '必须并发消费音频以避免背压，并把取消传播给 provider 和播放层。'),
  ], '返回 SynthesizeStream；文本输入和音频输出可并行推进，从而降低 LLM 增量到首音频的等待时间。', [
    e('只写文本不消费音频，或断线后重复播放前缀', '使用结构化并发管理生产消费，记录已确认边界，取消或断线时关闭整个流。'),
  ], ['SynthesizeStream.push_text', 'SynthesizeStream.flush', 'SynthesizeStream.end_input', 'Agent.tts_node']),
  'SynthesizeStream.push_text': m('core', [
    p('token', 'str', true, '按原始顺序加入的文本增量，可是 token 或短片段，但不能跨句乱序或重复。'),
    p('分句缓冲', 'application policy', true, '过细会破坏语调并增加调用开销，过粗会拉长首音，需要按语言标点调优。'),
    p('流状态', 'open SynthesizeStream', true, '只允许在 end_input 前推送；关闭后新回复必须创建新的合成流。'),
  ], '无返回值；文本进入 TTS 输入缓冲，音频可能在达到 provider 分句条件或 flush 后异步产生。', [
    e('逐 token 强制合成造成声音断裂和成本上升', '使用句子 tokenizer 聚合自然边界，保留文本顺序并限制最大等待字符数。'),
  ], ['TTS.stream', 'SynthesizeStream.flush', 'SynthesizeStream.end_input']),
  'SynthesizeStream.flush': m('advanced', [
    p('当前文本缓冲', 'SynthesizeStream buffer', true, '提示合成器立即处理已推文本但保持输入流开放，适合完整句子边界。'),
  ], '无返回值；已缓冲文本被提交合成，后续仍可继续 push_text，音频结果从异步输出侧到达。', [
    e('每个 token 都 flush 造成语调碎裂和请求放大', '只在自然句子或受控最大延迟边界调用，并用真实语言回放调节分句器。'),
  ], ['SynthesizeStream.push_text', 'SynthesizeStream.end_input', 'TTSMetrics']),
  'SynthesizeStream.end_input': m('advanced', [
    p('当前 SynthesizeStream', 'open stream', true, '声明文本永久结束；调用后仍要消费尾部音频和最终事件直到流自然关闭。'),
  ], '无返回值；输入侧半关闭并触发剩余文本合成，调用后不能再次 push_text，但输出可能继续到达。', [
    e('end_input 后立即取消消费者导致尾音和字幕丢失', '继续迭代到输出完成并设置合理超时；用户打断时则明确走取消语义而不是假装正常结束。'),
  ], ['SynthesizeStream.flush', 'AgentSession.wait_for_idle', 'AgentSession.interrupt']),
} satisfies Record<string, FrameworkApiLearningMeta>

const workerJobMeta = {
  AgentServer: m('core', [
    p('worker_type', 'WorkerType', false, '决定 worker 接收房间或发布者等 job 类型，必须和部署调度目标一致。', 'ROOM'),
    p('num_idle_processes', 'int', false, '预热空闲子进程数量，用内存成本换取新 job 冷启动延迟，应基于并发压测设置。'),
    p('load_fnc', 'Callable', false, '返回当前实例负载供调度决策，计算必须快速且能反映 CPU、内存与活动 job。'),
    p('setup_fnc', 'Callable', false, '进程启动时加载共享只读模型或资源，不应保存具体用户会话数据。'),
  ], '返回 Agent worker 服务编排器；注册 rtc_session 后由 run 接入调度并为每个 job 创建隔离执行上下文。', [
    e('预热过多耗尽内存或负载函数失真造成雪崩', '以单 job 资源曲线设容量，负载函数保持无阻塞，并用平台指标校准调度阈值。'),
  ], ['AgentServer.rtc_session', 'AgentServer.run', 'JobContext', 'AgentServer.drain']),
  'AgentServer.rtc_session': m('core', [
    p('func', 'Callable[[JobContext], Awaitable[None]]', false, '处理单个 RTC job 的异步入口，负责连接房间、创建 Session 并最终清理。'),
    p('agent_name', 'str', false, '用于路由命名 Agent 的稳定名称，应和派单配置及部署版本保持一致。'),
    p('装饰器返回', 'Callable', true, '既可直接传函数也可作为装饰器使用，注册阶段不应启动网络或用户副作用。'),
  ], '返回已注册或待装饰的入口函数；真正调用发生在 Worker 接到匹配 job 后，而不是模块导入时。', [
    e('入口异常退出但 Session 和 Room 未关闭', '入口使用 try/finally，并把统一清理注册到 JobContext shutdown callback。'),
  ], ['AgentServer', 'AgentServer.run', 'JobContext.connect', 'AgentSession.aclose']),
  'AgentServer.run': m('core', [
    p('devmode', 'bool', false, '开发模式允许本地调试行为，生产部署必须明确关闭并使用正式注册。', 'False'),
    p('unregistered', 'bool', false, '控制是否以未注册方式运行；生产 agent 路由通常需要稳定注册身份。', 'False'),
    p('已注册入口', 'rtc_session handlers', true, 'run 前至少注册与调度相符的入口，否则 worker 在线也无法正确承接会话。'),
  ], '长时间运行直到服务关闭；协程负责 worker 注册、job 接收与子进程生命周期，正常情况下不会快速返回。', [
    e('事件循环被同步初始化阻塞或进程信号后无法退出', '重型加载移到 setup 并异步化 I/O，接收终止信号后先 drain 再 aclose。'),
  ], ['AgentServer.rtc_session', 'AgentServer.drain', 'AgentServer.aclose']),
  'AgentServer.drain': m('advanced', [
    p('timeout', 'int | None', false, '等待活动 job 完成的最长秒数；None 可能无限等待，发布系统应设置明确上限。'),
  ], '协程完成后 worker 已停止接收新 job，并在期限内等待现有 job 收敛；超时任务仍需关闭和恢复策略。', [
    e('滚动发布时 drain 超时导致在途对话被强杀', '让负载均衡先摘除实例，按最长会话设合理期限，并持久化可恢复的业务状态。'),
  ], ['AgentServer.run', 'AgentServer.aclose', 'AgentSession.drain']),
  'AgentServer.simulate_job': m('advanced', [
    p('room', 'str', true, '用于模拟派单的目标房间名，应指向隔离测试环境而非真实生产用户房间。'),
    p('fake_job', 'bool', false, '是否构造本地假 job；它适合入口测试但不能证明真实调度和权限链路。', 'False'),
    p('agent_identity / token', 'str | None', false, '可指定 Agent 身份或访问令牌；令牌只能从秘密配置读取并避免输出到测试日志。'),
  ], '协程完成表示模拟 job 已提交或执行结束，具体房间媒体和入口行为仍应通过事件与测试断言验证。', [
    e('测试误连生产房间或把 token 写入日志', '环境前缀和项目 ID双重校验，使用短期令牌，并在测试后关闭所有房间资源。'),
  ], ['AgentServer.rtc_session', 'JobContext', 'JobContext.connect']),
  'AgentServer.aclose': m('advanced', [
    p('服务生命周期', 'AgentServer', true, '在进程最终退出时调用，通常应先 drain 以给活动 job 优雅收敛机会。'),
  ], '协程完成表示 worker 连接、子进程与服务资源已关闭，不再接受 job；外部队列或房间资源不一定随之删除。', [
    e('直接关闭导致活动会话和工具副作用中断', '终止流程先摘流、drain，再在 finally 中 aclose，并为未完成副作用设计幂等恢复。'),
  ], ['AgentServer.drain', 'AgentSession.aclose', 'RoomIO.aclose']),
  JobContext: m('core', [
    p('info', 'JobInfo', true, '包含派单、房间和 Agent 元信息，只能用于当前 job 的授权与关联。'),
    p('room', 'rtc.Room', true, '当前 job 对应的房间对象；connect 前不能假设媒体轨道已经可用。'),
    p('on_connect / on_shutdown', 'Callable', true, '由运行时管理连接和关停回调，业务清理应通过公开 callback API 注册。'),
    p('inference_executor', 'InferenceExecutor', true, '为推理任务提供执行边界，避免 CPU 密集工作阻塞主事件循环。'),
  ], '返回框架创建的单 job 上下文，提供房间连接、参与者等待、关停回调与推理执行资源。', [
    e('把 JobContext 保存到全局或在 job 结束后继续使用', '严格限定在入口协程和派生任务内，所有任务加入关停流程并在退出时取消。'),
  ], ['get_job_context', 'JobContext.connect', 'JobContext.shutdown', 'AgentSession']),
  'JobContext.connect': m('core', [
    p('e2ee', 'E2EEOptions', false, '可选端到端加密配置；密钥管理、参与者兼容和录制能力必须提前验证。'),
    p('auto_subscribe', 'AutoSubscribe', false, '决定自动订阅哪些远端轨道；语音 Agent 通常只订阅需要的音频以控制资源。', 'SUBSCRIBE_ALL'),
    p('rtc_config', 'RtcConfiguration', false, '连接层网络与 RTC 配置，应与部署区域、防火墙和媒体质量策略匹配。'),
  ], '协程完成表示 JobContext 已连接 LiveKit 房间并可访问参与者与媒体；不表示目标用户已经加入。', [
    e('连接成功但订阅了错误轨道或目标参与者尚未出现', '最小化 auto_subscribe，随后 wait_for_participant，并监听轨道发布和断开事件。'),
  ], ['JobContext.wait_for_participant', 'RoomIO', 'AgentSession.start']),
  'JobContext.wait_for_participant': m('core', [
    p('identity', 'str | None', false, '指定目标参与者身份；多用户房间应显式传入，避免绑定到第一个无关参与者。'),
    p('kind', 'ParticipantKind', false, '限制 STANDARD、SIP 等参与者类型，需与实际接入渠道一致。', 'STANDARD'),
    p('外层超时', 'asyncio timeout', true, 'API 本身可能长期等待，业务必须定义无人加入、掉线和取消时的截止时间。'),
  ], '返回匹配的 rtc.RemoteParticipant；对象只在当前房间连接生命周期内有效，随后仍需处理离开与重连。', [
    e('房间无人加入导致 job 永久占用进程', '使用 asyncio.timeout，超时后记录原因并 shutdown；多参与者时按可信 identity 选择。'),
  ], ['JobContext.connect', 'RoomIO.set_participant', 'JobContext.shutdown']),
  'JobContext.add_shutdown_callback': m('advanced', [
    p('callback', 'Callable[[str], Awaitable[None]]', true, '接收关停原因的异步回调，应快速、幂等且容忍被取消或重复触发。'),
  ], '无返回值；回调被登记到当前 job 的关停序列，真正执行发生在 shutdown 或运行时结束时。', [
    e('回调阻塞关停或某个异常阻断其他清理', '每项清理设置独立超时并捕获异常，关键状态平时增量持久化而非仅靠回调。'),
  ], ['JobContext.shutdown', 'AgentSession.aclose', 'RoomIO.aclose']),
  'JobContext.shutdown': m('core', [
    p('reason', 'str', false, '用于日志和回调的低基数关停原因，不应包含 transcript、令牌或个人隐私。', ''),
    p('调用语义', 'signal', true, '该方法发出结束请求而非同步等待所有资源关闭，后续由运行时执行清理。'),
    p('幂等性', 'application contract', true, '多个错误路径可能同时请求 shutdown，调用侧必须允许重复并保留首个根因。'),
  ], '无返回值；当前 job 被请求结束，已注册的 shutdown callbacks 随运行时关停流程执行。', [
    e('调用后继续接收输入或启动新的回复任务', '设置本地 closing 状态，停止入口流量，等待清理回调并让所有副作用支持取消。'),
  ], ['JobContext.add_shutdown_callback', 'AgentSession.drain', 'AgentServer.drain']),
  'JobContext.add_participant_entrypoint': m('advanced', [
    p('entrypoint_fnc', 'Callable[[JobContext, rtc.RemoteParticipant], Coroutine]', true, '每个匹配参与者触发的独立异步入口，必须隔离状态并负责自己的 Session 生命周期。'),
    p('kind', 'list[ParticipantKind]', false, '限定 SIP、STANDARD 或 AGENT 等参与者类型，防止系统参与者误触发业务 Agent。'),
  ], '无返回值；注册后新匹配参与者会启动对应协程，适合一个房间中按参与者创建独立会话。', [
    e('参与者反复重连创建重复 Session 或并发修改共享状态', '按 participant identity 维护活动任务表，去重重连，并为每个入口创建独立 userdata。'),
  ], ['JobContext.wait_for_participant', 'AgentSession', 'RoomIO.set_participant']),
  'JobRequest.accept': m('core', [
    p('name', 'str', false, 'Agent 在房间中的展示名称，应避免放入内部服务版本或敏感部署信息。', ''),
    p('identity', 'str', false, 'Agent 参与者的稳定身份，需在房间内唯一并满足业务审计关联。', ''),
    p('metadata / attributes', 'str | dict', false, '随参与者发布的可见元数据和属性，只放客户端需要且可公开的最小字段。'),
  ], '协程完成表示当前 JobRequest 已接受并开始分配执行上下文；真正房间连接仍由 JobContext.connect 完成。', [
    e('accept 后入口初始化失败或身份与现有参与者冲突', '接受前完成轻量配置校验，使用可重试唯一 identity，并让初始化失败触发明确 shutdown。'),
  ], ['JobRequest.reject', 'JobContext', 'JobContext.connect']),
  'JobRequest.reject': m('advanced', [
    p('terminate', 'bool', false, '决定拒绝后是否终止该请求；仅临时过载时应按调度协议选择可重新派发策略。', 'True'),
  ], '协程完成表示拒绝决定已提交给调度层，不会为此请求创建正常的 JobContext 会话。', [
    e('可恢复过载被永久拒绝或不可恢复请求反复派发', '按错误类型设置 terminate，记录低基数原因，并通过负载函数提前减少错误派单。'),
  ], ['JobRequest.accept', 'AgentServer', 'AgentServer.drain']),
  get_job_context: m('advanced', [
    p('required', 'bool', false, '为 true 时上下文缺失应抛错；工具只允许在 job 内调用时保持默认更安全。', 'True'),
  ], '在活动 job 任务上下文中返回 JobContext；required=False 且当前不在 job 内时可返回 None。', [
    e('后台任务脱离 contextvars 后读取到空上下文', '显式把需要的稳定数据传入任务；仅在确需兼容非 job 场景时使用 required=False。'),
  ], ['JobContext', 'AgentSession.userdata', 'RunContext']),
} satisfies Record<string, FrameworkApiLearningMeta>

const roomIoMeta = {
  RoomIO: m('core', [
    p('agent_session', 'AgentSession', true, '要连接房间媒体的会话编排器，二者生命周期应由同一个 job 统一管理。'),
    p('room', 'rtc.Room', true, '已经由 JobContext 连接的目标房间，不能跨 job 或跨用户复用。'),
    p('participant', 'rtc.RemoteParticipant | None', false, '指定输入来源；多参与者房间应显式绑定可信身份，避免音频串线。'),
    p('input_options / output_options', 'RoomInputOptions / RoomOutputOptions', false, '控制订阅媒体、降噪、发布音频与字幕等边界配置。'),
  ], '返回尚未启动的房间 I/O 适配器；start 后才把参与者媒体、文本与 Session 输入输出真正连接起来。', [
    e('多参与者房间自动选错输入或输出发布参数不兼容', '显式绑定 participant，校验采样率和轨道来源，并用房间事件处理离开与重连。'),
  ], ['RoomIO.start', 'RoomInputOptions', 'RoomOutputOptions', 'AgentSession.start']),
  'RoomIO.start': m('core', [
    p('房间连接', 'rtc.Room', true, '启动前 room 必须处于已连接状态，否则媒体订阅和发布无法正常建立。'),
    p('参与者选择', 'participant selector', true, '确认输入参与者 identity 或等待策略已经确定，避免捕获系统或其他用户音频。'),
    p('I/O 选项', 'RoomInputOptions / RoomOutputOptions', true, '启动前固定媒体和字幕选项，运行中变更需遵循对应对象支持的生命周期。'),
  ], '协程完成表示 RoomIO 的订阅、输入处理和输出发布任务已启动；媒体是否真正 ready 还应等待 wait_for_ready。', [
    e('start 后立刻播放导致轨道尚未 ready 丢失首音', '调用 wait_for_ready 后再发送关键欢迎语，并为参与者迟到设置超时和降级。'),
  ], ['RoomIO.wait_for_ready', 'RoomIO.set_participant', 'AgentSession.say']),
  'RoomIO.wait_for_ready': m('advanced', [
    p('外层超时', 'asyncio timeout', true, '等待媒体输入输出就绪可能受参与者和网络影响，业务必须设置可观测截止时间。'),
  ], '协程完成表示当前 RoomIO 已达到可工作的媒体就绪状态，可安全开始依赖音频输出的关键交互。', [
    e('参与者未发布音频导致无限等待', '设置超时并区分无人加入、无麦克风权限和网络失败，必要时降级为文本交互。'),
  ], ['RoomIO.start', 'JobContext.wait_for_participant', 'RoomIO.audio_input']),
  'RoomIO.set_participant': m('core', [
    p('participant', 'rtc.RemoteParticipant | str', true, '传入房间内参与者对象或精确 identity，来源必须经过当前 job 授权。'),
    p('切换时机', 'turn boundary', true, '切换输入来源前应结束旧用户轮次，避免两个人的音频进入同一上下文。'),
    p('轨道状态', 'remote tracks', true, '新参与者可能尚未发布音频，需要继续监听轨道并等待 I/O ready。'),
  ], '无返回值；RoomIO 后续从指定参与者接收媒体，既有已提交 ChatContext 不会自动清除。', [
    e('切换参与者后沿用旧用户上下文造成隐私串线', '参与者隔离使用独立 Session；确需切换时先清空未提交轮次并重建业务上下文。'),
  ], ['RoomIO.unset_participant', 'RoomIO.wait_for_ready', 'AgentSession.clear_user_turn']),
  'RoomIO.unset_participant': m('advanced', [
    p('当前绑定', 'rtc.RemoteParticipant', true, '解除的是当前媒体输入来源，不会让该参与者离开房间或自动关闭 Session。'),
  ], '无返回值；RoomIO 停止针对当前参与者的输入绑定，后续可重新 set_participant 或关闭适配器。', [
    e('解绑后仍让旧用户未提交音频触发回复', '先 clear_user_turn 并停止输入任务，再解绑；重新绑定前验证新的会话隔离策略。'),
  ], ['RoomIO.set_participant', 'AgentSession.clear_user_turn', 'RoomIO.aclose']),
  'RoomIO.register_text_input': m('advanced', [
    p('text_input_cb', 'TextInputCallback', true, '处理房间文本输入的回调，必须验证发送者身份、长度、格式和业务权限。'),
  ], '无返回值；回调注册后匹配的房间文本消息会进入应用处理链，回调结果由其自身协议决定。', [
    e('任意参与者文本触发敏感工具或回调阻塞事件循环', '在回调入口鉴权限流，耗时工作放入有界任务，并将文本作为用户数据处理。'),
  ], ['RoomInputOptions', 'AgentSession.run', 'ChatContext.add_message']),
  'RoomIO.audio_input': m('advanced', [
    p('读取时机', 'AudioInput | None', true, '只有启用音频输入并成功绑定参与者后才通常非空，调用前必须处理 None。'),
  ], '返回当前 AudioInput 适配器或 None；该对象代表实时帧来源，不是已经完整缓冲的音频文件。', [
    e('在 start/participant ready 前直接解引用 audio_input', '先等待 RoomIO ready 并检查 None，参与者切换或离开时重新获取当前引用。'),
  ], ['RoomIO.start', 'RoomIO.wait_for_ready', 'RoomInputOptions']),
  'RoomIO.aclose': m('core', [
    p('关闭顺序', 'lifecycle boundary', true, '停止房间输入输出任务时应和 AgentSession 关停统一排序，避免继续产生新音频。'),
    p('发布轨道', 'local tracks', true, '关闭会停止或释放适配器拥有的轨道，但房间连接本身由 JobContext 管理。'),
    p('幂等清理', 'awaitable close', true, '异常、参与者离开和 job 终止可能重复触发，清理代码必须允许多次调用。'),
  ], '协程完成表示 RoomIO 的媒体与文本任务已关闭；它不会自动关闭整个 rtc.Room 或删除远端参与者。', [
    e('只关闭 Session 未关闭 RoomIO 造成轨道和任务残留', '在 job 的 finally 或 shutdown callback 中同时关闭二者，并监控未结束媒体任务。'),
  ], ['AgentSession.aclose', 'JobContext.add_shutdown_callback', 'RoomIO.unset_participant']),
  RoomInputOptions: m('core', [
    p('audio_enabled', 'bool | NotGiven', false, '是否接收参与者音频；文本 Agent 应明确关闭以减少不必要订阅与隐私采集。'),
    p('text_enabled', 'bool | NotGiven', false, '是否接收房间文本输入，开启后仍需在回调中验证发送者身份。'),
    p('video_enabled', 'bool | NotGiven', false, '是否把视频作为输入，需确认 Agent/model 真正消费并设置帧率和成本预算。'),
    p('noise_cancellation', 'NoiseCancellationOptions | None', false, '可选降噪插件配置，SIP、耳机和远场环境需要分别回放评测。'),
    p('participant_identity', 'str | NotGiven', false, '限定媒体来源的参与者身份，多人房间建议显式配置以维持隔离。'),
  ], '返回类型化房间输入配置，交给 RoomIO 或 AgentSession.start 使用；它本身不会连接或订阅任何轨道。', [
    e('默认订阅过多媒体造成成本、延迟或隐私范围扩大', '仅开启业务实际需要的模态，显式限制 participant，并在隐私告知后才采集。'),
  ], ['RoomIO', 'RoomOutputOptions', 'RoomIO.audio_input']),
  RoomOutputOptions: m('core', [
    p('audio_enabled', 'bool | NotGiven', false, '是否把 Agent 合成音频发布到房间；纯文本模式应关闭以避免无用 TTS。'),
    p('transcription_enabled', 'bool | NotGiven', false, '是否发布 Agent 字幕，开启后要保证内容与真实播放语音保持一致。'),
    p('audio_sample_rate', 'int', false, '输出音频采样率，必须与 TTS 或重采样链路和客户端播放能力兼容。', '24000'),
    p('audio_num_channels', 'int', false, '输出声道数；语音通常使用单声道，错误设置会造成播放异常或浪费带宽。', '1'),
    p('sync_transcription', 'bool', false, '是否让字幕时序跟随实际音频播放，而非提前展示完整生成文本。', 'True'),
  ], '返回类型化房间输出配置；真正音频轨道和字幕发布由 RoomIO.start 后的运行任务完成。', [
    e('TTS 采样率不匹配或字幕早于音频泄露尚未播放内容', '统一媒体格式并保留必要重采样，关键场景开启同步字幕并做端到端回放测试。'),
  ], ['RoomIO', 'RoomInputOptions', 'Agent.transcription_node', 'TTS']),
} satisfies Record<string, FrameworkApiLearningMeta>

const eventMetricsMeta = {
  AgentStateChangedEvent: m('core', [
    p('old_state', 'AgentState', true, '变化前的 Agent 状态，例如 listening、thinking 或 speaking，用于计算阶段起点。'),
    p('new_state', 'AgentState', true, '变化后的运行状态，可驱动客户端动画，但不能作为业务事务成功凭证。'),
    p('created_at', 'float', true, '事件创建时间用于阶段延迟计算，跨服务分析时应统一时钟并允许网络乱序。'),
  ], '监听器收到描述 Agent 状态迁移的只读事件；它适合 UI 和耗时观测，不保证远端客户端看到每个瞬时状态。', [
    e('监听器阻塞事件循环或 UI 因快速状态切换抖动', '处理器只入有界队列，耗时上报异步批量完成，客户端对短暂状态做适度去抖。'),
  ], ['UserStateChangedEvent', 'MetricsCollectedEvent', 'AgentSession.wait_for_idle']),
  UserStateChangedEvent: m('advanced', [
    p('old_state / new_state', 'UserState', true, '表示用户 listening、speaking、away 等推断状态变化，不等同于业务在线状态。'),
    p('created_at', 'float', true, '状态推断事件时间，可用于分析用户与 Agent 抢话及离席时长。'),
  ], '返回给监听器的用户状态迁移记录；状态来自媒体和超时推断，可能受噪声、丢包与设备静音影响。', [
    e('单次 away 或 speaking 抖动触发不可逆业务动作', '对状态设置持续时间门槛并结合房间参与者事件，关键动作要求额外确认。'),
  ], ['AgentStateChangedEvent', 'UserInputTranscribedEvent', 'InterruptionOptions']),
  UserInputTranscribedEvent: m('core', [
    p('transcript', 'str', true, '当前用户转写文本；临时结果会被后续修订，需限长和敏感数据治理。'),
    p('is_final', 'bool', true, '明确文本是否最终确定；只有 final 通常适合持久化和触发确定性业务。'),
    p('speaker_id', 'str | None', false, '多说话人关联标识，必须在当前房间内映射授权身份而不能盲目信任。'),
    p('language', 'str | None', false, '识别出的语言，可用于显示与路由，但低置信自动检测应允许回退。'),
  ], '监听器收到 interim 或 final 用户转写事件；事件用于字幕和审计，最终提交历史仍由 Session 轮次状态机决定。', [
    e('把 interim 重复落库或多说话人文本混入同一用户', 'UI 临时覆盖，持久化仅接收 final，并按 speaker_id 与 room identity 做服务端映射。'),
  ], ['SpeechEvent', 'Agent.on_user_turn_completed', 'ConversationItemAddedEvent']),
  ConversationItemAddedEvent: m('core', [
    p('item', 'ChatItem', true, '正式加入会话历史的消息、工具调用或结果，应按具体类型安全序列化。'),
    p('created_at', 'float', true, '条目提交事件时间，用于构建回放时序但不能替代稳定 item id。'),
    p('事件类型', 'conversation_item_added', true, '固定事件名用于订阅；处理器应能接受未来新增 ChatItem 变体。'),
  ], '监听器收到一个已提交 ChatItem，比 token 流更适合持久化可恢复时间线，但仍可能因重连或重试重复投递。', [
    e('重复事件导致消息或工具副作用重复写入', '使用 item id 和会话 id 做幂等 upsert，工具参数与结果按字段级策略脱敏。'),
  ], ['ChatMessage', 'ChatContext', 'FunctionToolsExecutedEvent']),
  FunctionToolsExecutedEvent: m('core', [
    p('function_calls', 'list[FunctionCall]', true, '本轮模型提出并已进入执行的调用集合，参数可能包含敏感业务数据。'),
    p('function_call_outputs', 'list[FunctionCallOutput]', true, '与调用对应的成功或错误结果，不能只以事件到达判断全部成功。'),
    p('关联关系', 'call id mapping', true, '必须按 call id 关联输入输出，不能依赖数组内容相似或仅按工具名称匹配。'),
  ], '监听器收到一批工具调用及对应输出，可用于审计、成功率和时延分析；批内允许存在部分失败。', [
    e('日志泄露工具秘密或把部分失败统计成整批成功', '按 call id 逐项分类结果，字段级脱敏，并让外部副作用使用幂等键和审计记录。'),
  ], ['function_tool', 'RunContext', 'ConversationItemAddedEvent', 'MetricsCollectedEvent']),
  MetricsCollectedEvent: m('core', [
    p('metrics', 'AgentMetrics', true, '具体 LLM、STT、TTS、EOU 或 realtime 指标联合类型，需要按类型分别处理。'),
    p('created_at', 'float', true, '指标采集事件时间，用于时序关联并允许批量异步导出。'),
    p('关联键', 'request_id / speech_id', true, '跨组件串联一次用户体验，不能把 user_id 放进高基数监控标签。'),
  ], '监听器收到单条组件指标记录；它适合实时观测和 UsageCollector 聚合，但不等同于 provider 最终账单。', [
    e('每条指标同步上报拖慢会话或标签基数爆炸', '监听器只写本地有界批队列，限制标签集合，原始关联 id 放日志或 trace 属性。'),
  ], ['UsageCollector.collect', 'LLMMetrics', 'STTMetrics', 'TTSMetrics', 'EOUMetrics']),
  SessionUsageUpdatedEvent: m('advanced', [
    p('usage', 'AgentSessionUsage', true, '当前会话累计模型用量快照，适合预算展示但可能晚于实际 provider 消耗。'),
    p('created_at', 'float', true, '累计值更新时间，持久化时应记录采集截止点和价格表版本。'),
  ], '监听器收到会话用量更新快照，覆盖已纳入统计的 LLM、STT 与 TTS 资源；不是支付扣费凭证。', [
    e('重复累加累计快照导致用量翻倍', '按快照覆盖保存或只消费 Metrics 增量，结合会话 id 和更新时间做幂等处理。'),
  ], ['MetricsCollectedEvent', 'UsageCollector', 'UsageCollector.get_summary']),
  UsageCollector: m('core', [
    p('实例作用域', 'per-session collector', true, '每个 AgentSession 使用独立收集器，不能混合多个用户或测试重放指标。'),
    p('输入来源', 'AgentMetrics events', true, '从 metrics_collected 事件逐条 collect，重复投递会重复累计。'),
    p('读取时机', 'summary snapshot', true, '会话中可随时读取，但最终保存应等待指标流收敛并记录截止时间。'),
  ], '返回有内部累计状态的使用量收集器，可标准化汇总 token、STT 音频和 TTS 字符/音频用量。', [
    e('跨会话复用或事件重放未去重导致统计翻倍', '每会话新建实例，接入层按 request id 去重，并与 provider 账单做周期性校准。'),
  ], ['UsageCollector.collect', 'UsageCollector.get_summary', 'MetricsCollectedEvent']),
  'UsageCollector.collect': m('core', [
    p('metrics', 'AgentMetrics', true, '一条具体组件指标，必须属于当前会话且尚未被该收集器重复处理。'),
    p('调用来源', 'metrics_collected handler', true, '通常在事件监听器中同步执行轻量 reducer，不在此进行网络 I/O。'),
    p('异常请求', 'cancelled metrics', true, '取消或失败请求也可能产生实际用量，应按计费口径纳入而非简单丢弃。'),
  ], '无返回值；内部累计 UsageSummary 被增量更新，调用不会自动持久化、估价或上传监控后端。', [
    e('同一 metrics 重复 collect 或混入其他 Session', '在事件入口校验会话和 request id，持久化摘要时附带 collector 生命周期标识。'),
  ], ['UsageCollector', 'UsageCollector.get_summary', 'SessionUsageUpdatedEvent']),
  'UsageCollector.get_summary': m('core', [
    p('当前 collector', 'UsageCollector', true, '读取对象必须是当前会话专属收集器，且已接收需要统计的指标事件。'),
    p('采集截止点', 'timestamp', true, '摘要是读取瞬间快照，后续事件仍会改变累计值，应一起保存截止时间。'),
    p('价格版本', 'billing policy', true, '返回的是资源数量而非金额，成本换算必须绑定 provider、模型和价格表版本。'),
  ], '返回 UsageSummary 当前快照，包含模型 token、STT 时长、TTS 字符或音频量等已收集资源计数。', [
    e('把中途摘要当最终账单或用统一单价估算所有模型', '关停时再保存最终快照，区分 provider/model，并用正式账单进行对账而非直接扣款。'),
  ], ['UsageCollector.collect', 'SessionUsageUpdatedEvent', 'MetricsCollectedEvent']),
  LLMMetrics: m('advanced', [
    p('ttft / duration', 'float', true, '首 token 与完整请求耗时应分别观察；前者影响首次响应，后者影响总生成。'),
    p('prompt_tokens / completion_tokens', 'int', true, '输入输出 token 用量需结合缓存字段和具体模型价格解释。'),
    p('cancelled / request_id', 'bool / str', true, '取消状态用于分析 barge-in 浪费，request_id 只作关联而非用户标签。'),
  ], '一条传统 LLM 请求的结构化性能与用量记录，可用于分位延迟、吞吐、取消率和成本分析。', [
    e('只看平均 TTFT 或把不同模型指标混成同一分布', '按 provider/model/区域分层观察 p50/p95/p99，标签保持低基数并关联端到端 speech。'),
  ], ['MetricsCollectedEvent', 'TTSMetrics', 'EOUMetrics', 'LLM.chat']),
  STTMetrics: m('advanced', [
    p('duration / audio_duration', 'float', true, '处理耗时与音频长度可计算实时系数，需防止 audio_duration 为零。'),
    p('streamed', 'bool', true, '区分流式与批量识别，两种模式的延迟口径不能直接混合比较。'),
    p('input_tokens / output_tokens', 'int', false, '部分 provider 提供的语音 token 用量，字段缺失时不能用零代替未知。'),
  ], '一条 STT 请求的时长、音频量、模式和可选 token 指标，适合诊断转写是否跟得上实时输入。', [
    e('用速度指标代替识别准确率或除零产生异常值', '速度与 WER/实体准确率分别评测，计算比率时保护零值并按语言设备分桶。'),
  ], ['MetricsCollectedEvent', 'SpeechEvent', 'EOUMetrics', 'STT.stream']),
  TTSMetrics: m('advanced', [
    p('ttfb / duration', 'float', true, '首音频时间决定开口延迟，总时长描述完整合成过程，两者需分别看分位数。'),
    p('audio_duration / characters_count', 'float / int', true, '产出音频长度与字符量帮助解释成本和实时系数，但各语言计价口径不同。'),
    p('cancelled / request_id', 'bool / str', true, '取消率反映用户打断和回复过长，request_id 用于串联而非高基数标签。'),
  ], '一条 TTS 合成请求的首帧、总时长、产量和取消状态记录，可定位开口慢与打断浪费。', [
    e('取消请求被忽略造成成本低估或字符数跨语言直接比较', '保留 cancelled 用量，按 provider/voice/language 分层，并和 Session usage 及账单校准。'),
  ], ['MetricsCollectedEvent', 'LLMMetrics', 'AgentSession.interrupt', 'TTS.stream']),
  EOUMetrics: m('core', [
    p('end_of_utterance_delay', 'float', true, '用户实际说完到端点确认的延迟，过低易截断，过高让 Agent 显得迟钝。'),
    p('transcription_delay', 'float', true, '最终转写相对语音结束的等待时间，用于区分 STT 与端点瓶颈。'),
    p('on_user_turn_completed_delay', 'float', true, 'turn hook 中 RAG 或业务补充耗时，直接进入 LLM 前等待。'),
    p('speech_id', 'str', true, '串联同一轮 STT、EOU、LLM、TTS 的关联键，不能作为长期用户身份。'),
  ], '记录一次用户 speech 从结束到轮次就绪的延迟拆解，是调优抢话、停顿和 RAG 首响的核心指标。', [
    e('不同 turn detection 模式混用同一基线得出错误结论', '按模式、语言和设备分别建立分位基线，并与截断率、误打断率和主观体验联看。'),
  ], ['EndpointingOptions', 'Agent.on_user_turn_completed', 'STTMetrics', 'LLMMetrics']),
} satisfies Record<string, FrameworkApiLearningMeta>

const realtimeTurnMeta = {
  RealtimeModel: m('core', [
    p('provider implementation', 'RealtimeModel subclass', true, '具体 provider 维持长连接并融合音频理解与生成，凭证仅存服务端。'),
    p('modalities', 'audio / text / video capabilities', true, '确认模型真实支持的输入输出模态、工具和数据区域，不能套用传统管线假设。'),
    p('session limits', 'duration / concurrency', true, '长连接时长、并发、速率和成本需要按用户会话做容量与降级设计。'),
  ], '表示原生多模态实时模型抽象；session 才创建有状态 provider 连接，它可能融合传统 STT、LLM 和 TTS 边界。', [
    e('假设传统节点钩子和指标在 realtime 模式完全等价', '按 provider 能力矩阵设计功能与可观测性，缺失边界使用应用事件和录制补足。'),
  ], ['RealtimeModel.session', 'LLM', 'RealtimeSession.push_audio', 'MetricsCollectedEvent']),
  'RealtimeModel.session': m('core', [
    p('chat_ctx', 'ChatContext', true, '初始化实时连接的历史上下文，应裁剪并确保工具调用与结果结构有效。'),
    p('tools', 'list[FunctionTool] | NotGiven', false, '该实时会话可调用的最小工具集合，需确认 provider 支持的 schema 子集。'),
    p('fnc_ctx', 'legacy function context | NotGiven', false, '兼容旧函数上下文的参数，新代码应优先使用明确 tools 并避免两套定义冲突。'),
  ], '返回有状态 RealtimeSession；需要持续推送媒体、消费事件并显式关闭，不能按一次 HTTP completion 使用。', [
    e('连接创建后未消费未关闭，或断线后状态恢复不明确', '每用户独立管理生命周期，定义重连时上下文和音频提交点，并在 finally 中关闭。'),
  ], ['RealtimeModel', 'RealtimeSession.push_audio', 'RealtimeSession.commit_audio', 'ChatContext']),
  'RealtimeSession.generate_reply': m('core', [
    p('instructions', 'str | NotGiven', false, '只约束本次实时响应的临时指令，应来自受控策略而不是直接用户拼接。'),
    p('当前输入状态', 'committed realtime turn', true, '通常应在音频已 commit 或外部事件已写入会话状态后触发。'),
    p('并发响应', 'provider response state', true, '上一响应未结束时再次触发的行为因 provider 而异，应用应串行管理。'),
  ], '无直接返回值；它向实时连接发出生成命令，文本、音频、工具和完成事件随后异步到达。', [
    e('重复 generate 导致响应重叠或把无返回值当失败', '维护 response 状态机和 request 关联，在旧响应结束/取消后再触发新生成。'),
  ], ['RealtimeSession.commit_audio', 'AgentSession.generate_reply', 'RealtimeSession.update_instructions']),
  'RealtimeSession.push_audio': m('core', [
    p('frame', 'rtc.AudioFrame', true, '连续用户音频帧，采样率和声道必须满足实时 provider 输入规范。'),
    p('背压', 'bounded send queue', true, '网络变慢时限制发送队列，避免数秒积压让模型响应过期音频。'),
    p('用户隔离', 'per-session stream', true, '每个 RealtimeSession 只能接收对应用户音频，禁止跨房间或参与者混流。'),
  ], '无返回值；帧进入 provider 实时输入缓冲，是否形成完整用户轮次取决于自动端点或 commit_audio。', [
    e('乱序、格式错误或断线期间无界缓存音频', '媒体入口校验格式并设置队列上限，断线后按隐私和时效策略丢弃或受控重放。'),
  ], ['RealtimeModel.session', 'RealtimeSession.commit_audio', 'VADStream.push_frame']),
  'RealtimeSession.commit_audio': m('core', [
    p('当前音频缓冲', 'realtime input buffer', true, '提交当前已 push 的音频为一轮输入；空缓冲和重复提交应由状态机防护。'),
    p('端点来源', 'manual / push-to-talk', true, '适合手动端点或关闭 provider 自动端点时，不能与自动提交无序并用。'),
    p('后续生成', 'response policy', true, 'commit 只建立轮次边界，是否自动生成或另调 generate_reply 取决于 provider 配置。'),
  ], '无返回值；当前音频缓冲被提交给实时模型处理，随后识别或响应事件通过连接异步产生。', [
    e('过早提交截断尾音或自动端点与手动提交重复', '统一端点所有权，按 speaking 状态防空提交，并用录音与 EOU 指标验证时序。'),
  ], ['RealtimeSession.push_audio', 'RealtimeSession.generate_reply', 'AgentSession.commit_user_turn']),
  'RealtimeSession.update_instructions': m('core', [
    p('instructions', 'str', true, '替换实时 provider 会话指令的完整文本，应版本化、审计并防止提示注入。'),
    p('更新时机', 'response boundary', true, '尽量在响应边界串行更新，正在生成的内容是否改变取决于 provider 时序。'),
    p('本地一致性', 'Agent policy', true, '应用 Agent 指令与 provider 指令应同步更新，避免控制面出现两个不同版本。'),
  ], '无返回值；后续实时模型响应使用新指令，已经提交的历史和已生成音频不会被追溯重写。', [
    e('并发更新乱序导致 provider 与 Agent 策略不一致', '使用会话级锁和单调版本号，更新失败时回读/重建连接并记录当前生效版本。'),
  ], ['Agent.update_instructions', 'RealtimeSession.generate_reply', 'RealtimeModel.session']),
  TurnHandlingOptions: m('core', [
    p('turn_detection', 'TurnDetectionMode | NotGiven', false, '选择 VAD、STT、语义或手动轮次检测方式，必须和已配置组件能力匹配。'),
    p('endpointing', 'EndpointingOptions | NotGiven', false, '配置用户停顿后确认轮次结束的等待范围，平衡截断风险与响应速度。'),
    p('interruption', 'InterruptionOptions | NotGiven', false, '配置 barge-in 的有效语音门槛和误打断恢复，影响全双工体验。'),
    p('user_turn_limit', 'UserTurnLimitOptions | NotGiven', false, '限制单轮时长或内容规模，避免无限讲话占用资源并保护模型上下文。'),
    p('preemptive_generation', 'bool | NotGiven', false, '是否在 final 端点前预生成以降低延迟；预测错误时会浪费模型和 TTS 成本。'),
  ], '返回统一轮次处理策略对象，交给 AgentSession 组合 VAD、STT、端点、预生成和播放打断状态机。', [
    e('只调一个阈值却忽略端点、预生成和打断相互影响', '用真实双向录音建立截断率、误打断率、EOU 和首音延迟联合评测矩阵。'),
  ], ['EndpointingOptions', 'InterruptionOptions', 'AgentSession.update_options', 'EOUMetrics']),
  EndpointingOptions: m('core', [
    p('min_delay', 'float', true, '检测到停顿后至少等待的秒数，过小会把自然思考停顿误判为轮次结束。'),
    p('max_delay', 'float', true, '即使语义不确定也必须结束等待的最大秒数，用于限制最坏响应延迟。'),
    p('alpha', 'float', false, '动态端点平滑或权重参数，需按具体实现文档和回放数据调节而非盲猜。'),
    p('mode', 'EndpointingMode', false, '选择固定或动态等端点模式，不同模式的 EOU 指标基线不可直接混用。'),
  ], '返回端点检测配置，由 Session 在 VAD/STT/语义信号后决定何时提交用户轮次并开始回复。', [
    e('把毫秒当秒或 min_delay 大于 max_delay', '配置层做范围和单位校验，灰度发布并按语言、设备观察截断和 p95 EOU。'),
  ], ['TurnHandlingOptions', 'AgentSession.commit_user_turn', 'VAD', 'EOUMetrics']),
  InterruptionOptions: m('core', [
    p('enabled', 'bool', true, '控制是否允许用户 barge-in 停止 Agent 播放，关键提示可按场景单独禁用。'),
    p('min_duration', 'float', true, '用户声音持续达到该秒数才算有效打断，用于过滤咳嗽、回声和瞬时噪声。'),
    p('min_words', 'int', false, '可结合 STT 要求至少识别词数，语言分词差异会影响合理阈值。'),
    p('false_interruption_timeout', 'float', false, '疑似误打断后等待确认的秒数，期间需协调暂停音频和用户新语音。'),
    p('resume_false_interruption', 'bool', false, '确认误打断后是否恢复先前播放，恢复点应避免重复或跳过关键语义。'),
  ], '返回播放打断策略，由 Session 综合 VAD、词数和超时判断真正中断，或在误打断后恢复原回复。', [
    e('阈值过松导致回声频繁停播，过严又让用户无法插话', '按设备和声学环境回放测试，联合降噪/回声消除，并观察取消率与用户抢话率。'),
  ], ['TurnHandlingOptions', 'AgentSession.interrupt', 'VADStream.push_frame', 'TTSMetrics']),
} satisfies Record<string, FrameworkApiLearningMeta>

export const liveKitAgentsLearningMeta = {
  ...agentSessionMeta,
  ...workerJobMeta,
  ...roomIoMeta,
  ...llmToolMeta,
  ...speechMeta,
  ...ttsMeta,
  ...eventMetricsMeta,
  ...realtimeTurnMeta,
} satisfies Record<string, FrameworkApiLearningMeta>

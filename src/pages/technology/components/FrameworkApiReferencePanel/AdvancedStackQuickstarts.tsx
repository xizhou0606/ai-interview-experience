import { StackQuickstart, type QuickstartConfig } from './StackQuickstarts'

const langChainConfig: QuickstartConfig = {
  label: 'LangChain',
  title: '先掌握 Runnable 统一协议，再进入 Agent 循环',
  mentalModel: 'LangChain 把 Prompt、Model、Parser、Retriever、Tool 等能力统一成 Runnable：都可以 invoke、batch、stream，并用 pipe 或 RunnableSequence 组合；createAgent 则在 LangGraph 上预装“模型判断 → 工具执行 → 再判断”的受控循环。',
  install: 'pnpm add langchain @langchain/openai zod',
  flow: ['消息或 Prompt', 'Runnable / Model', '模型选择 Tool', '执行结果回填', '完成或继续循环'],
  choices: [
    ['只调用一次聊天模型', 'BaseChatModel.invoke', '输入消息并等待一个完整 AIMessage，适合非流式问答。'],
    ['组合固定处理链', 'RunnableSequence.from', '把 Prompt、Model、Parser 串成类型清晰、可流式的确定性流水线。'],
    ['需要模型自主使用工具', 'createAgent', '让预构建 Agent 在终止条件内反复调用模型与 Tool。'],
    ['封装业务能力', 'tool', '用 name、description、Zod schema 和实现函数定义模型可见的受控接口。'],
    ['限制成本或人工审批', 'createMiddleware / modelCallLimitMiddleware', '自定义横切钩子，或使用模型/工具限次、脱敏与 Human-in-the-loop 等官方中间件。'],
    ['接入知识库', 'VectorStore.asRetriever', '把相似度检索包装成 Runnable，再接到链或 Agent。'],
  ],
  exampleTitle: '最小 createAgent + Tool 案例',
  exampleNote: '设置 OPENAI_API_KEY 后执行。模型只负责提出工具调用，真实权限和副作用控制仍属于工具实现。',
  example: `import { ChatOpenAI } from '@langchain/openai'
import { createAgent, modelCallLimitMiddleware, tool } from 'langchain'
import * as z from 'zod'

const calculateTotal = tool(
  async ({ price, quantity }) => ({ total: price * quantity }),
  {
    name: 'calculate_total',
    description: '根据商品单价和正整数数量计算总价',
    schema: z.object({
      price: z.number().nonnegative(),
      quantity: z.number().int().positive(),
    }),
  },
)

const agent = createAgent({
  model: new ChatOpenAI({ model: 'gpt-4.1-mini', temperature: 0 }),
  tools: [calculateTotal],
  middleware: [modelCallLimitMiddleware({ runLimit: 6, exitBehavior: 'end' })],
})

const result = await agent.invoke({
  messages: [{ role: 'user', content: '单价 19.9 元，买 3 件多少钱？请说明计算过程。' }],
})
console.log(result.messages.at(-1)?.content)`,
  interview: 'LangChain 的底层组合抽象是 Runnable，它用 invoke、batch、stream 和配置传播统一不同组件；createAgent 在 LangGraph 运行时上实现模型与工具的循环，并允许 middleware 横切模型调用、工具调用和生命周期。生产系统必须限制循环次数、缩小工具集合、校验工具权限，并把短期消息、长期事实与运行时 context 分开。',
  risks: ['Tool schema 只校验输入形状，鉴权、幂等、限流和审计必须在执行实现中完成。', 'Agent 必须配置模型/工具调用上限和超时，防止错误规划形成高成本无限循环。', '不要把数据库连接或用户身份放进全局可变状态；通过 Runtime context 注入并按请求隔离。', '流式消费要处理取消和 tool-call 增量；不要只拼接文本后丢失消息、用量和工具元数据。'],
}

const liveKitConfig: QuickstartConfig = {
  label: 'LiveKit Agents',
  title: '把实时语音理解成持续运转、可被打断的媒体流水线',
  mentalModel: '每个 Job 创建独立 AgentSession；Session 持续把房间音频送进 VAD/Turn Detection 与 STT，再让 LLM 决策并把文本流送入 TTS 和 Room 输出。用户插话时，取消信号必须贯穿播放、TTS 与生成，而不是只把扬声器静音。',
  install: 'uv add "livekit-agents~=1.5" python-dotenv',
  flow: ['Room 音频输入', 'VAD + 回合检测', 'STT 转写', 'LLM / Tools', 'TTS + Room 播放'],
  choices: [
    ['定义角色和工具', 'Agent', '保存 instructions、tools 与可覆写的 STT/LLM/TTS 节点。'],
    ['编排一次实时会话', 'AgentSession', '连接媒体、模型、打断、事件、用量与会话生命周期。'],
    ['启动房间处理', 'AgentSession.start', '把 Agent 与 JobContext 的 room 绑定并启动持续数据流。'],
    ['直接播放确定文本', 'AgentSession.say', '欢迎语、合规声明等不需要 LLM 推理的内容。'],
    ['主动触发模型回复', 'AgentSession.generate_reply', '开场、超时提醒或外部事件到达时生成一轮语音。'],
    ['运行和扩缩容入口', 'AgentServer.rtc_session', '注册每个房间或发布者 Job 的异步入口。'],
  ],
  exampleTitle: '最小 Python AgentServer + AgentSession 案例',
  exampleNote: '这是当前 Python 1.5 风格。需配置 LiveKit 凭据；模型字符串通过 LiveKit Inference 解析，生产还要增加噪声消除、事件指标和关停策略。',
  example: `from dotenv import load_dotenv
from livekit import agents
from livekit.agents import (
    Agent, AgentServer, AgentSession, TurnHandlingOptions, inference
)

load_dotenv('.env.local')

class InterviewCoach(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions='你是耐心的中文面试教练，一次只问一个问题。'
        )

server = AgentServer()

@server.rtc_session(agent_name='interview-coach')
async def interview_session(ctx: agents.JobContext):
    session = AgentSession(
        stt=inference.STT(model='deepgram/nova-3', language='multi'),
        llm=inference.LLM(model='openai/gpt-4.1-mini'),
        tts=inference.TTS(model='cartesia/sonic-3'),
        turn_handling=TurnHandlingOptions(
            turn_detection=inference.TurnDetector(),
        ),
    )
    await session.start(room=ctx.room, agent=InterviewCoach())
    await session.generate_reply(instructions='简短问候，然后询问目标岗位。')

if __name__ == '__main__':
    agents.cli.run_app(server)`,
  interview: 'LiveKit AgentSession 是实时编排根：输入侧协调 Room、VAD、回合检测和 STT，推理侧驱动 LLM 与 Tools，输出侧把文本流送入 TTS 并发布音频，同时通过事件暴露状态与指标。实时系统的难点是端点判断、首包延迟、背压和 barge-in；正确打断必须取消整条旧响应并修正聊天上下文。',
  risks: ['为每个 Job 创建独立 Session 和用户状态，不能跨房间复用带可变上下文的 Agent。', 'VAD、STT endpointing 与语义回合检测要按语言和噪声评测；参数过激会截断，过保守会拖慢回答。', '用户打断要取消 LLM、TTS 和播放并等待状态落定，不能只在客户端静音旧音轨。', '监听 MetricsCollectedEvent 和 SessionUsageUpdatedEvent，分别监控首字/首音延迟、错误、成本与中断率。', 'SIGTERM 先 drain 停止接单，再等待活跃会话收口；所有流、任务和外部连接都要显式关闭。'],
}

const langfuseConfig: QuickstartConfig = {
  label: 'Langfuse',
  title: '先分清 Trace、Observation 与 Generation，再谈评分和实验',
  mentalModel: '一次用户请求是一条 Trace；其中检索、Agent、Tool、LLM 调用是父子 Observation，LLM 调用通常标为 Generation；Score 挂在 Trace 或 Observation 上衡量质量。JS v5 以 OpenTelemetry 作为上下文传播与导出底座。',
  install: 'pnpm add @langfuse/tracing @langfuse/otel @opentelemetry/sdk-node',
  flow: ['初始化 OTel', '开始根 Observation', '创建子 Generation', '更新并结束 Span', '批量导出 + Score'],
  choices: [
    ['包住一段异步业务', 'startActiveObservation', '自动建立 active context，让内部 Observation 成为正确子节点。'],
    ['手动控制子节点', 'startObservation', '创建 Generation、Tool 或 Retriever span，并显式 update/end。'],
    ['更新当前调用信息', 'updateActiveObservation', '在不知道对象引用的深层函数补 input、output 或 metadata。'],
    ['导出 OpenTelemetry spans', 'LangfuseSpanProcessor', '把 OTel 记录批量发送到 Langfuse 项目。'],
    ['提交质量信号', 'ScoreManager.create', '为 trace/observation 写数值、布尔或分类评分。'],
    ['退出前保证送达', 'LangfuseSpanProcessor.forceFlush', '短脚本、测试和无服务器退出前等待 span 导出。'],
  ],
  exampleTitle: '最小 OpenTelemetry + Trace + Generation 案例',
  exampleNote: 'instrumentation 必须先于被观测业务初始化。示例同时展示父子上下文和显式结束；真实 LLM 调用应补 token、cost、modelParameters 与错误状态。',
  example: `import { NodeSDK } from '@opentelemetry/sdk-node'
import { LangfuseSpanProcessor } from '@langfuse/otel'
import { propagateAttributes, startActiveObservation, startObservation } from '@langfuse/tracing'

const processor = new LangfuseSpanProcessor()
const sdk = new NodeSDK({ spanProcessors: [processor] })
sdk.start()

await propagateAttributes({ userId: 'user-42' }, async () => {
  await startActiveObservation('interview-request', async (trace) => {
    trace.update({ input: { question: '什么是事件循环？' } })

    const generation = startObservation(
      'answer-generation',
      { model: 'gpt-4.1-mini', input: [{ role: 'user', content: '什么是事件循环？' }] },
      { asType: 'generation' },
    )
    // const answer = await model.invoke(...)
    const answer = '事件循环协调任务队列与异步回调。'
    generation.update({ output: answer }).end()
    trace.update({ output: answer })
  })
})

await processor.forceFlush()
await sdk.shutdown()`,
  interview: 'Langfuse v5 以 OpenTelemetry 保存当前上下文：Trace 表示一条端到端请求，Observation 表示其中的步骤，Generation 是携带模型、token 和成本语义的 Observation，Score 是独立质量信号。startActiveObservation 自动维持父子关系，手动 startObservation 必须显式 end；生产要控制采样、脱敏、flush/shutdown，并用业务 request id 贯通日志和 trace。',
  risks: ['OpenTelemetry SDK 必须在业务模块之前初始化，否则早期调用不会被正确采集或建立父子关系。', '每个手动 Observation 都必须在 finally 中 end；异常路径要记录错误状态，避免悬空跨度。', 'Prompt、输入输出和 metadata 可能含隐私或密钥，导出前做字段级脱敏和租户边界检查。', '高流量系统配置采样与批处理，普通请求不要逐条 forceFlush；退出路径才集中等待。', 'Client 的 score 队列与 OTel span 导出是两条生命周期，关停时分别 flush/shutdown。'],
}

export function LangChainQuickstart() { return <StackQuickstart config={langChainConfig} /> }
export function LiveKitQuickstart() { return <StackQuickstart config={liveKitConfig} /> }
export function LangfuseQuickstart() { return <StackQuickstart config={langfuseConfig} /> }

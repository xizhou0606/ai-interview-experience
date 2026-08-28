import { AlertTriangle, ArrowRight, BookOpenCheck, Boxes, MessageSquareQuote, PackageCheck } from 'lucide-react'

export interface QuickstartConfig {
  label: string
  title: string
  mentalModel: string
  install: string
  flow: string[]
  choices: Array<[string, string, string]>
  exampleTitle: string
  exampleNote: string
  example: string
  interview: string
  risks: string[]
}

export function StackQuickstart({ config }: { config: QuickstartConfig }) {
  return (
    <section className="stack-quickstart ai-sdk-quickstart" aria-label={`${config.label} 初学者快速入门`}>
      <div className="ai-sdk-quickstart-heading">
        <div><span>START HERE</span><h3>{config.title}</h3><p><strong>一句话心智模型：</strong>{config.mentalModel}</p></div>
        <div className="ai-sdk-install"><PackageCheck size={16} /><span>安装依赖</span><code>{config.install}</code></div>
      </div>

      <div className={`ai-sdk-mental-model flow-${config.flow.length}`} aria-label={`${config.label} ${config.flow.length} 步运行链路`}>
        {config.flow.map((item, index, all) => <div key={item}><span>{index + 1}</span><strong>{item}</strong>{index < all.length - 1 && <ArrowRight size={15} />}</div>)}
      </div>

      <div className="ai-sdk-choice-guide">
        <div className="ai-sdk-guide-title"><Boxes size={17} /><div><strong>遇到需求时，先这样选择核心 API</strong><p>先按问题选择能力族，再进入下面的逐 API 参数和错误恢复说明。</p></div></div>
        <div>{config.choices.map(([need, api, scene]) => <article key={api}><span>{need}</span><code>{api}</code><p>{scene}</p></article>)}</div>
      </div>

      <div className="ai-sdk-full-example">
        <div><BookOpenCheck size={17} /><strong>{config.exampleTitle}</strong><p>{config.exampleNote}</p></div>
        <div className="ai-sdk-code-grid langgraph-code-grid"><article><span>quickstart</span><pre><code>{config.example}</code></pre></article></div>
      </div>

      <div className="ai-sdk-interview-memory"><MessageSquareQuote size={18} /><div><strong>面试 60 秒记忆句</strong><p>“{config.interview}”</p></div></div>

      <div className="stack-production-risks"><AlertTriangle size={18} /><div><strong>生产环境必须防住这些风险</strong><ul>{config.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul></div></div>
    </section>
  )
}

const mastraConfig: QuickstartConfig = {
  label: 'Mastra',
  title: '先分清 Agent 的自由决策与 Workflow 的确定性控制',
  mentalModel: 'Mastra 是 TypeScript AI 应用运行时：Mastra 实例统一注册资源，Agent 让模型选择行动，Tool 封装受控能力，Workflow 用 schema 和步骤固定业务流程，Memory/Storage 保存上下文与运行状态。',
  install: 'pnpm add @mastra/core @ai-sdk/openai zod',
  flow: ['定义 Tool', '创建 Agent', '注册到 Mastra', 'generate / stream', '观测、存储与评测'],
  choices: [
    ['模型需要自主选择工具', 'Agent', '对话、研究或开放式任务，让模型在受限工具集合中决定下一步。'],
    ['步骤必须可预测', 'createWorkflow / createStep', '审批、发布、数据处理等需要固定顺序、分支和恢复的流程。'],
    ['接入业务能力', 'createTool', '用 schema 描述输入输出，在 execute 内完成鉴权、幂等和真实调用。'],
    ['保持多轮上下文', 'Memory', '按 resourceId/threadId 保存消息、工作记忆与语义召回。'],
    ['统一查找资源', 'Mastra.getAgent / getWorkflow', '路由或服务层通过注册键取得单例资源，避免每次请求重新构造。'],
    ['验证回答质量', 'MastraScorer', '把相关性、事实性或业务规则变成可重复执行的评测。'],
  ],
  exampleTitle: '最小 Agent + Tool 案例',
  exampleNote: '设置 OPENAI_API_KEY 后执行。示例把计算能力放进 Tool；真实写操作还必须在 execute 内做用户授权与幂等。',
  example: `import { openai } from '@ai-sdk/openai'
import { Agent } from '@mastra/core/agent'
import { Mastra } from '@mastra/core/mastra'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

const calculate = createTool({
  id: 'calculate-total',
  description: '计算商品单价与数量的总价',
  inputSchema: z.object({ price: z.number().nonnegative(), quantity: z.number().int().positive() }),
  outputSchema: z.object({ total: z.number() }),
  execute: async ({ context: { price, quantity } }) => ({ total: price * quantity }),
})

const assistant = new Agent({
  id: 'learning-assistant',
  name: '初学者助手',
  instructions: '先解释计算步骤，再给出结果；需要乘法时使用 calculate-total。',
  model: openai('gpt-4.1-mini'),
  tools: { calculate },
})

const mastra = new Mastra({ agents: { assistant } })
const result = await mastra.getAgent('assistant').generate('单价 19.9 元，买 3 件一共多少钱？')
console.log(result.text)`,
  interview: 'Mastra 把 Agent、Tool、Workflow、Memory、Storage 和 Observability 装配成一个 TypeScript AI 运行时。Agent 适合模型驱动的动态决策，Workflow 适合代码确定的可恢复流程；Tool 的 schema 只负责参数合同，真正的权限、幂等与审计仍在 execute。生产上还要配置持久化、评测、追踪和明确终止条件。',
  risks: ['不要把 Agent instructions 当权限系统；危险 Tool 在执行层重新鉴权并要求确认。', 'Workflow、Tool 与恢复路径中的副作用都必须幂等，防止重试导致重复写入。', 'Memory 用 resourceId 与 threadId 双重隔离，并限制召回条数、token 和敏感字段。', '生产配置持久化 Storage、trace 采样和 scorer 回归集，不能只依赖默认内存状态。'],
}

const qdrantConfig: QuickstartConfig = {
  label: 'Qdrant',
  title: '先建立“Collection → Point → Query → Filter”的检索模型',
  mentalModel: 'Qdrant 是向量检索数据库：Collection 定义向量空间，Point 把 id、vector 和 payload 放在一起，Query 用相似度召回候选，Filter 与 payload index 控制结构化范围，Snapshot/Replica 负责恢复与可用性。',
  install: 'pnpm add @qdrant/js-client-rest',
  flow: ['创建 Collection', '生成同维向量', 'upsert Points', 'query / search', '过滤、索引与评测'],
  choices: [
    ['定义向量维度和距离', 'createCollection', '首次建库时锁定 size、Cosine/Dot/Euclid 与分片副本策略。'],
    ['幂等写入或更新文档', 'upsert', '用稳定 point id 写入 vector 与 payload，同 id 再写会更新。'],
    ['做统一混合查询', 'query', '组合 dense/sparse、prefetch、fusion、filter 与分页。'],
    ['做经典向量搜索', 'search', '已有单个查询向量，需要 ScoredPoint 列表时。'],
    ['加速结构化过滤', 'createPayloadIndex', '高频按 tenant、status、时间或类别过滤时建立正确字段索引。'],
    ['备份与灾难恢复', 'createSnapshot / recoverSnapshot', '升级、迁移或故障恢复前后保存并验证 Collection。'],
  ],
  exampleTitle: '最小 Collection + Upsert + Search 案例',
  exampleNote: '先启动本地 Qdrant（默认 6333）。演示向量用固定数组代替真实 embedding；生产必须确保写入和查询来自同一模型与维度。',
  example: `import { QdrantClient } from '@qdrant/js-client-rest'

const client = new QdrantClient({ url: 'http://127.0.0.1:6333' })
const collection = 'learning_notes'
const dimension = 4

const existence = await client.collectionExists(collection)
if (!existence.exists) {
  await client.createCollection(collection, {
    vectors: { size: dimension, distance: 'Cosine' },
  })
  await client.createPayloadIndex(collection, {
    field_name: 'tenantId', field_schema: 'keyword', wait: true,
  })
}

await client.upsert(collection, {
  wait: true,
  points: [
    { id: 1, vector: [0.9, 0.1, 0.0, 0.2], payload: { tenantId: 'demo', text: 'LangGraph 使用显式状态图' } },
    { id: 2, vector: [0.1, 0.8, 0.2, 0.0], payload: { tenantId: 'demo', text: 'BullMQ 使用 Redis 管理任务状态' } },
  ],
})

const hits = await client.search(collection, {
  vector: [0.85, 0.12, 0.0, 0.18], limit: 3, with_payload: true,
  filter: { must: [{ key: 'tenantId', match: { value: 'demo' } }] },
})
console.log(hits.map(hit => ({ id: hit.id, score: hit.score, text: hit.payload?.text })))`,
  interview: 'Qdrant 把每条数据建模为带 id、向量和 payload 的 Point，并在 Collection 定义的向量空间中做近似最近邻检索。相似度负责语义候选，payload filter 负责租户和业务条件，payload index 让过滤可扩展。生产质量取决于 embedding 一致性、召回评测、过滤隔离和 snapshot/replica 恢复，而不只是 search 能返回结果。',
  risks: ['Collection 的 size 必须与 embedding 模型输出一致，迁移模型时新建版本化 Collection 并回填。', 'tenantId 等隔离条件由服务端强制注入 filter，不能信任客户端自行提交。', 'upsert 使用稳定 point id 和 wait/ordering 策略；异步写入后立即查询要理解一致性边界。', '高频 payload 字段建立正确索引，但避免无目的索引放大内存和写入成本。', '定期验证 snapshot 恢复、replica 健康和召回基准，不能把数据库存活等同于检索质量。'],
}

const bullMqConfig: QuickstartConfig = {
  label: 'BullMQ',
  title: '先理解 Job 状态机，再谈重试、并发和可靠性',
  mentalModel: 'BullMQ 用 Redis 保存持久化 Job 状态：Queue 生产和管理任务，Worker 领取带 lock 的 Job 并执行，QueueEvents 汇总全局事件，Job 在 waiting/active/completed/failed/delayed 间转换；默认交付语义是至少一次。',
  install: 'pnpm add bullmq',
  flow: ['Queue.add 投递', 'Redis 保存 Job', 'Worker 加锁领取', 'processor 执行与续锁', '完成、失败、重试或 stalled'],
  choices: [
    ['投递一个后台任务', 'Queue.add', '设置稳定 jobId、attempts、backoff 和保留策略。'],
    ['消费并执行任务', 'Worker', '设置 concurrency，processor 内做幂等、超时与取消传播。'],
    ['监听整条队列事件', 'QueueEvents', '跨 Worker 获取 completed、failed、progress 和 stalled。'],
    ['表达父子依赖', 'FlowProducer', '用原子 fan-out/fan-in 树组织子任务先执行、父任务后汇总。'],
    ['更新任务进度', 'Job.updateProgress', '为长任务保存稳定进度 schema，并控制 Redis 写入频率。'],
    ['安全滚动发布', 'Worker.pause / close', '停止领取新任务、等待 active 收口，再关闭连接。'],
  ],
  exampleTitle: '最小 Queue + Worker + QueueEvents 案例',
  exampleNote: '先启动本地 Redis。重复运行生产者时，相同 jobId 不会无限创建新任务；processor 仍需对外部副作用单独幂等。',
  example: `import { Queue, QueueEvents, Worker } from 'bullmq'

const connection = { host: '127.0.0.1', port: 6379 }
const queue = new Queue('learning-email', {
  connection,
  defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 100 },
})
const events = new QueueEvents('learning-email', { connection })
await events.waitUntilReady()

const worker = new Worker('learning-email', async (job, _token, signal) => {
  if (signal.aborted) throw signal.reason
  await job.updateProgress({ stage: 'sending', percent: 50 })
  // 真实系统在这里用业务幂等键 job.id 写数据库或调用外部 API。
  return { sentTo: job.data.email }
}, { connection, concurrency: 4 })

worker.on('error', error => console.error('worker error', error))
events.on('completed', ({ jobId, returnvalue }) => console.log('completed', jobId, returnvalue))
events.on('failed', ({ jobId, failedReason }) => console.error('failed', jobId, failedReason))

await queue.add('welcome', { email: 'learner@example.com' }, { jobId: 'welcome-learner' })

async function shutdown() {
  await worker.close()
  await events.close()
  await queue.close()
}
process.once('SIGTERM', () => void shutdown())
process.once('SIGINT', () => void shutdown())`,
  interview: 'BullMQ 是基于 Redis 的持久任务队列。Queue 原子写入 Job，Worker 通过 lock 领取并续锁，成功或异常驱动状态转换，QueueEvents 用 Redis Streams 汇总全局事件。它提供的是至少一次执行：进程崩溃或 lock 失效会让 stalled Job 再执行，因此业务副作用必须幂等，并配合有界重试、退避、优雅关停和 Redis 容量治理。',
  risks: ['把至少一次当成恰好一次会造成重复扣款或发信；processor 用业务幂等键去重。', 'CPU 阻塞会阻止 lock 续期并制造 stalled；CPU 密集任务使用 sandboxed processor 或工作线程。', 'attempts、backoff、timeout、removeOnComplete/Fail 和死信处理必须在投产前明确。', 'Queue、Worker、QueueEvents 的连接角色不同；阻塞连接不要错误复用，并监控 Redis 内存与延迟。', 'SIGTERM 时先停止领取、等待 active 任务收口再 close；强制退出后要允许安全重做。'],
}

export function MastraQuickstart() { return <StackQuickstart config={mastraConfig} /> }
export function QdrantQuickstart() { return <StackQuickstart config={qdrantConfig} /> }
export function BullMqQuickstart() { return <StackQuickstart config={bullMqConfig} /> }

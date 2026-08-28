import type { FrameworkApiLearningMeta } from '../types'

/** BullMQ v5 learner metadata. Keys mirror core.ts `name` exactly. */
export const bullMqLearningMeta = {
  Queue: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: 'Redis 中队列的逻辑名称；生产者、Worker、QueueEvents 必须完全一致。' },
      { name: 'opts.connection', type: 'ConnectionOptions', required: true, description: 'Redis 地址、认证、TLS 与重连配置；不同环境应隔离实例或 prefix。' },
      { name: 'opts.defaultJobOptions', type: 'JobsOptions', required: false, defaultValue: '{}', description: '统一 attempts、backoff、removeOnComplete/removeOnFail 等默认投递策略。' },
      { name: 'opts.prefix', type: 'string', required: false, defaultValue: '"bull"', description: 'BullMQ Redis key 前缀；同一协作队列的所有组件必须一致。' },
    ], expectedOutput: '返回可复用的 Queue 生产/管理实例；它只写入和管理 Job，不会执行 processor。',
    errorCases: [{ condition: 'Redis 不可达、prefix/name 配错或每个 HTTP 请求重复创建 Queue', handling: '启动期验证连接并复用单例；请求受理成功前必须确认 add 已写入，退出时 await close。' }],
    relatedApis: ['Queue.add', 'Worker', 'QueueEvents', 'Queue.close'],
  },
  'Queue.add': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'name', type: 'Name', required: true, description: 'processor 用于区分任务类型的名称。' },
      { name: 'data', type: 'Data', required: true, description: '可序列化的小型任务载荷；推荐只放业务 ID，由 Worker 再读取事实。' },
      { name: 'opts.jobId', type: 'string', required: false, description: '队列内稳定去重标识；相同 ID 存在时不会再创建，但不能替代业务副作用幂等。' },
      { name: 'opts.attempts / backoff', type: 'number / BackoffOptions', required: false, defaultValue: 'attempts: 1', description: '技术性失败的最大尝试次数和退避策略。' },
      { name: 'opts.removeOnComplete / removeOnFail', type: 'boolean | number | KeepJobs', required: false, description: 'Redis 中完成/失败记录的保留上限。' },
    ], expectedOutput: 'Promise<Job>；Redis 原子创建 waiting/delayed/prioritized Job 后返回任务对象。BullMQ 处理语义是 at-least-once。',
    errorCases: [{ condition: '网络结果不确定导致调用方重试 add，或 Worker 重跑造成外部副作用重复', handling: '使用稳定 jobId 处理投递重复；processor 对写库、付款、发信再使用业务幂等键。' }],
    relatedApis: ['Queue.addBulk', 'Job', 'Worker', 'Job.retry'],
  },
  'Queue.addBulk': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'jobs', type: 'Array<{ name; data; opts? }>', required: true, description: '同一 Queue 的任务数组；每项独立声明类型、数据和投递策略。' },
      { name: 'jobs[].opts.jobId', type: 'string', required: false, description: '每条任务自己的稳定去重 ID。' },
      { name: 'batch size', type: 'application constraint', required: true, description: '调用方控制的单批上限，防止超大 Lua/Redis 写入阻塞事件循环。' },
    ], expectedOutput: 'Promise<Job[]>，顺序与输入一致；一次 Redis 交互写入同队列的一批任务。',
    errorCases: [{ condition: '批次太大或连接中断后不确定是否已写入', handling: '按固定大小分批并为每项设置 jobId；失败重试整批时依赖 ID 去重而非内存下标。' }],
    relatedApis: ['Queue.add', 'FlowProducer.addBulk', 'Job'],
  },
  'Queue.getJob': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'jobId', type: 'string', required: true, description: '队列内的任务 ID，可能是 BullMQ 生成值或业务自定义 ID。' }],
    expectedOutput: 'Promise<Job | undefined>；任务被 removeOnComplete/removeOnFail 清理后也会返回 undefined。',
    errorCases: [{ condition: '把 undefined 当作“从未执行”，或允许用户枚举他人 jobId', handling: '业务长期状态另存数据库；对外读取前校验 jobId 与租户/资源归属。' }],
    relatedApis: ['Queue.getJobState', 'Job.getState', 'Queue.remove'],
  },
  'Queue.getJobs': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'types', type: 'JobType | JobType[]', required: false, defaultValue: '所有支持状态', description: '要读取的 waiting、active、failed、delayed 等状态集合。' },
      { name: 'start / end', type: 'number', required: false, defaultValue: '0 / -1', description: 'Redis 排名范围；生产应设置小页，不要用 -1 拉全量。' },
      { name: 'asc', type: 'boolean', required: false, defaultValue: 'false', description: '是否按从旧到新的方向返回。' },
    ], expectedOutput: 'Promise<Job[]>；这是多个易变 Redis 状态集合的查询视图，不是业务数据库快照。',
    errorCases: [{ condition: '大队列全量扫描或把跨状态结果当强一致顺序', handling: '按状态分页并接受查询期间迁移；用户业务列表使用业务数据库投影。' }],
    relatedApis: ['Queue.getWaiting', 'Queue.getActive', 'Queue.getFailed', 'Queue.getJobCounts'],
  },
  'Queue.getJobState': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'jobId', type: 'string', required: true, description: '要轻量读取当前 Redis 状态的任务 ID。' }],
    expectedOutput: 'Promise<JobType | "unknown">；状态是瞬时读数，任务清理或不存在均可能是 unknown。',
    errorCases: [{ condition: '先读状态再执行控制产生竞态', handling: '显示用途可读取；状态转换使用 BullMQ 原子方法，并处理 Job 已迁移的错误。' }],
    relatedApis: ['Queue.getJob', 'Job.getState', 'Queue.getJobCounts'],
  },
  'Queue.getJobCounts': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'types', type: '...JobType[]', required: false, defaultValue: '默认状态集合', description: '需要分别统计的任务状态；结果保留每个状态的独立数量。' }],
    expectedOutput: 'Promise<Record<JobType, number>>，适合积压/失败看板的瞬时计数。',
    errorCases: [{ condition: '用 completed 当前保留量计算历史吞吐，忽略自动删除', handling: '吞吐趋势使用 Queue.getMetrics 或外部监控；计数用于当前队列压力。' }],
    relatedApis: ['Queue.getJobCountByTypes', 'Queue.getMetrics', 'Queue.exportPrometheusMetrics'],
  },
  'Queue.getJobCountByTypes': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: 'types', type: '...JobType[]', required: true, description: '要合并成单个总数的状态集合，例如 waiting、active、delayed。' }],
    expectedOutput: 'Promise<number>，返回这些状态数量之和。',
    errorCases: [{ condition: '用“先读数量再 add”做强配额，产生并发竞态', handling: '硬限制使用全局并发、限流或业务侧原子配额。' }],
    relatedApis: ['Queue.getJobCounts', 'Queue.setGlobalConcurrency', 'Queue.setGlobalRateLimit'],
  },
  'Queue.getWaiting': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: 'start / end', type: 'number', required: false, defaultValue: '0 / -1', description: 'waiting 列表的排名范围；应按小页读取。' }],
    expectedOutput: 'Promise<Job[]>，仅普通 waiting，不包含 prioritized。',
    errorCases: [{ condition: '把 waiting 当全部待处理量或全量读取', handling: '同时查看 prioritized/delayed/waiting-children 和计数；始终分页。' }],
    relatedApis: ['Queue.getPrioritized', 'Queue.getDelayed', 'Queue.getJobCounts'],
  },
  'Queue.getActive': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'start / end', type: 'number', required: false, defaultValue: '0 / -1', description: 'active 有锁任务的分页范围。' }],
    expectedOutput: 'Promise<Job[]>，返回当前由 Worker 持锁处理的任务视图。',
    errorCases: [{ condition: '长 active 被误判为死任务并强删，导致仍在运行的副作用失去追踪', handling: '先检查 processor 时长、lockDuration、Worker 事件和 stalled 状态；不要手工破坏 active 锁。' }],
    relatedApis: ['Worker.extendJobLocks', 'Worker.startStalledCheckTimer', 'Queue.isMaxed'],
  },
  'Queue.getCompleted': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: 'start / end', type: 'number', required: false, defaultValue: '0 / -1', description: '仍保留 completed 任务的分页范围。' }],
    expectedOutput: 'Promise<Job[]>，包含保留任务的 returnvalue；不代表全部历史成功记录。',
    errorCases: [{ condition: 'returnvalue 过大或无限保留完成任务耗尽 Redis', handling: '结果写业务库/对象存储，并配置 removeOnComplete 数量或年龄。' }],
    relatedApis: ['Job.isCompleted', 'Queue.clean', 'Queue.getMetrics'],
  },
  'Queue.getFailed': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'start / end', type: 'number', required: false, defaultValue: '0 / -1', description: '仍保留 failed 任务的分页范围。' }],
    expectedOutput: 'Promise<Job[]>，可读取 failedReason、stacktrace、attemptsMade 等诊断字段。',
    errorCases: [{ condition: '未区分永久错误便批量 retry，形成 poison-job 循环', handling: '按错误分类和代码版本筛选；修复根因、保证幂等后再有限重试。' }],
    relatedApis: ['Queue.retryJobs', 'Job.retry', 'Job.isFailed', 'Queue.getMetrics'],
  },
  'Queue.getDelayed': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: 'start / end', type: 'number', required: false, defaultValue: '0 / -1', description: '按延迟时间排序的分页范围。' }],
    expectedOutput: 'Promise<Job[]>，包含 delay、backoff 或调度产生的尚未到期任务。',
    errorCases: [{ condition: '把 delay 时间当硬实时执行 SLA', handling: '它只是最早可领取时间；容量规划需加上 Worker、并发、限流和积压延迟。' }],
    relatedApis: ['Job.changeDelay', 'Job.promote', 'Queue.promoteJobs', 'JobScheduler'],
  },
  'Queue.getPrioritized': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: 'start / end', type: 'number', required: false, defaultValue: '0 / -1', description: '优先队列的分页排名范围。' }],
    expectedOutput: 'Promise<Job[]>，通常较小 priority 数值先被处理。',
    errorCases: [{ condition: '高优任务持续涌入导致低优任务饥饿', handling: '减少优先级档位、监控等待年龄，必要时按服务等级拆队列。' }],
    relatedApis: ['Job.changePriority', 'Queue.getWaiting', 'Queue.getJobCounts'],
  },
  'Queue.getWaitingChildren': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'start / end', type: 'number', required: false, defaultValue: '0 / -1', description: '等待 Flow 子任务的父 Job 分页范围。' }],
    expectedOutput: 'Promise<Job[]>，返回依赖尚未满足的父任务。',
    errorCases: [{ condition: '把 waiting-children 当普通 Worker 积压', handling: '读取依赖和失败子项，确认所有子队列 Worker 在线及失败传播选项。' }],
    relatedApis: ['FlowProducer.getFlow', 'Job.getDependencies', 'Job.getFailedChildrenValues'],
  },
  'Queue.getJobLogs': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'jobId', type: 'string', required: true, description: '要读取任务级日志的 Job ID。' },
      { name: 'start / end', type: 'number', required: false, defaultValue: '0 / -1', description: '按 Redis 日志列表排名截取的分页范围，生产查询应设置有限窗口。' },
      { name: 'asc', type: 'boolean', required: false, defaultValue: 'false', description: '控制日志按旧到新或新到旧返回，排障时间线通常选择升序。' },
    ], expectedOutput: 'Promise<{ logs: string[]; count: number }>。',
    errorCases: [{ condition: '日志包含密钥/个人数据或每个任务无限增长', handling: 'job.log 前脱敏；使用 keepLogs/clearLogs，并将全局可检索日志发送到外部系统。' }],
    relatedApis: ['Job.log', 'Job.clearLogs', 'Queue.trimEvents'],
  },
  'Queue.clean': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'grace', type: 'number', required: true, description: '只删除年龄超过该毫秒数的任务。' },
      { name: 'limit', type: 'number', required: true, description: '本批最多删除数，保护 Redis 免受大清理阻塞。' },
      { name: 'type', type: 'JobType', required: false, defaultValue: 'completed', description: '要清理的状态；选错可能删除仍需调查的数据。' },
    ], expectedOutput: 'Promise<string[]>，返回本批删除的 jobId。',
    errorCases: [{ condition: '大批清理阻塞 Redis，或错误清掉 failed 审计证据', handling: '小批循环、限速并审计；优先在投递时配置自动保留策略。' }],
    relatedApis: ['Queue.obliterate', 'Queue.drain', 'Queue.getCompleted', 'Queue.getFailed'],
  },
  'Queue.drain': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'delayed', type: 'boolean', required: false, defaultValue: 'false', description: '是否连 delayed 一起删除；active/completed/failed 不受影响。' }],
    expectedOutput: 'Promise<void>，清空尚未开始的 waiting，按选项清理 delayed。',
    errorCases: [{ condition: '生产者同时 add 或 Flow 依赖仍存在，清理后业务状态不一致', handling: '先停生产入口并 pause；按业务批次记录取消意图，单独处理 Flow 父子依赖。' }],
    relatedApis: ['Queue.pause', 'Queue.obliterate', 'Queue.clean'],
  },
  'Queue.obliterate': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'opts.force / count', type: 'boolean / number', required: false, defaultValue: 'false / 1000', description: 'force 允许 active 存在时强删；count 控制每轮删除 key 数。' }],
    expectedOutput: 'Promise<void>，彻底移除该 queue/prefix 的 BullMQ 数据。',
    errorCases: [{ condition: '删错环境、active processor 仍执行或数据不可恢复', handling: '严格运维授权；停生产者和 Worker、确认 name/prefix、保留业务事实后再执行。' }],
    relatedApis: ['Queue.drain', 'Queue.clean', 'Worker.close', 'Queue.pause'],
  },
  'Queue.pause': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'global queue control', required: false, description: '把全局暂停标记写入 Redis；不停止已经 active 的任务，也不阻止 add。' }],
    expectedOutput: 'Promise<void>，所有 Worker 停止领取该队列的新任务。',
    errorCases: [{ condition: '误以为 active 已取消，或维护后忘记恢复造成无限积压', handling: '配合 Worker.close 等待 active；为全局暂停设置审计、告警和恢复检查。' }],
    relatedApis: ['Queue.resume', 'Queue.isPaused', 'Worker.pause'],
  },
  'Queue.resume': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'global queue control', required: false, description: '移除 Redis 全局暂停标记。' }],
    expectedOutput: 'Promise<void>，允许可用 Worker 继续领取积压。',
    errorCases: [{ condition: '大 backlog 一次释放压垮下游', handling: '恢复前确认依赖健康，并用全局并发/限流渐进释放。' }],
    relatedApis: ['Queue.pause', 'Queue.isPaused', 'Queue.setGlobalConcurrency'],
  },
  'Queue.isPaused': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'global queue state read', required: false, description: '读取 Redis 中的队列全局暂停标记。' }],
    expectedOutput: 'Promise<boolean>；不表示某个 Worker 是否本地暂停。',
    errorCases: [{ condition: '用瞬时读数做先查后改强一致控制', handling: '仅用于展示/诊断；控制方法本身应可重复调用。' }],
    relatedApis: ['Queue.pause', 'Queue.resume', 'Worker.isPaused'],
  },
  'Queue.promoteJobs': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'opts.count', type: 'number', required: false, defaultValue: '1000', description: '本批提前从 delayed 推到可执行状态的最大任务数。' }],
    expectedOutput: 'Promise<void>，批量使 delayed 任务立即具备领取资格。',
    errorCases: [{ condition: '批量提升制造突发流量或破坏原定退避', handling: '只在根因已修复时小批执行，并配合限流、并发和幂等 processor。' }],
    relatedApis: ['Job.promote', 'Queue.getDelayed', 'Queue.setGlobalRateLimit'],
  },
  'Queue.retryJobs': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'opts.count', type: 'number', required: false, defaultValue: '1000', description: '限制每轮最多重新排队的任务数量，避免瞬间释放全部失败积压。' },
      { name: 'opts.state', type: '"failed" | "completed"', required: false, defaultValue: '"failed"', description: '从哪个终态重新进入等待。' },
      { name: 'opts.timestamp', type: 'number', required: false, defaultValue: '当前时间', description: '只选择该时间之前的任务，便于按故障窗口恢复。' },
    ], expectedOutput: 'Promise<void>，把符合条件的保留任务批量转回 waiting。',
    errorCases: [{ condition: '毒任务反复失败或已成功副作用再次执行', handling: '先按失败原因/版本修复；processor 使用业务幂等键，分批观察失败率。' }],
    relatedApis: ['Job.retry', 'Queue.getFailed', 'Queue.getJobLogs'],
  },
  'Queue.close': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'graceful resource close', required: false, description: '等待 Queue 正在进行的 Redis 命令完成后关闭连接。' }],
    expectedOutput: 'Promise<void>，适合 SIGTERM graceful shutdown。',
    errorCases: [{ condition: '进程直接退出或仍在 add 时关闭导致投递结果不确定', handling: '先停止接受请求，等待在途 add，再 await close，并给关停设置总超时。' }],
    relatedApis: ['Queue.disconnect', 'Worker.close', 'FlowProducer.close'],
  },
  'Queue.disconnect': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'immediate connection control', required: false, description: '立即断开 Queue Redis 客户端，不等待在途命令。' }],
    expectedOutput: 'Promise<void>；更适合故障强制终止而非正常关停。',
    errorCases: [{ condition: '在途 add 的 Redis 结果变成未知', handling: '正常路径使用 close；若必须 disconnect，调用方用 jobId 安全核对/重试。' }],
    relatedApis: ['Queue.close', 'Worker.disconnect', 'Queue.waitUntilReady'],
  },
  'Queue.waitUntilReady': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'connection readiness wait', required: false, description: '等待 Queue 的 Redis 客户端进入可用状态。' }],
    expectedOutput: 'Promise<RedisClient>，表示基础连接可用，不代表 Worker 或下游依赖健康。',
    errorCases: [{ condition: 'Redis 长期不可达导致启动无限等待', handling: '在外层设置启动超时；readiness 失败时不接受异步任务请求。' }],
    relatedApis: ['Queue.close', 'Worker.waitUntilReady', 'FlowProducer.waitUntilReady'],
  },
  'Queue.trimEvents': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'maxLength', type: 'number', required: true, description: 'Redis events stream 近似保留的最大事件条数。' }],
    expectedOutput: 'Promise<number>，返回裁剪后/删除相关的 Redis 结果。',
    errorCases: [{ condition: '保留过小导致 QueueEvents 消费者错过历史，过大持续占 Redis', handling: '依据最慢消费者恢复窗口设置，并把关键业务事件另存可靠外部系统。' }],
    relatedApis: ['QueueEvents', 'QueueEvents.on', 'Queue.getJobLogs'],
  },
  'Queue.setGlobalConcurrency': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'concurrency', type: 'number', required: true, description: '跨所有 Worker 同时 active 的最大 Job 数，必须大于 0。' }],
    expectedOutput: 'Promise<number>，写入全局并发上限；与各 Worker 本地 concurrency 共同约束。',
    errorCases: [{ condition: '设置过低造成积压，或移除/提高后压垮数据库', handling: '按下游连接池容量设置并监控最老等待时间、active 和错误率。' }],
    relatedApis: ['Queue.getGlobalConcurrency', 'Queue.removeGlobalConcurrency', 'Queue.isMaxed', 'Worker'],
  },
  'Queue.getGlobalConcurrency': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'global concurrency read', required: false, description: '读取 Redis 中当前队列的全局 active 上限。' }],
    expectedOutput: 'Promise<number | null>；null 表示未设置全局限制。',
    errorCases: [{ condition: '把 null 当 0 或只看配置不看实际 Worker 容量', handling: 'null 解释为无限制；结合 getWorkers、active 和下游容量诊断。' }],
    relatedApis: ['Queue.setGlobalConcurrency', 'Queue.removeGlobalConcurrency', 'Queue.getWorkers'],
  },
  'Queue.removeGlobalConcurrency': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'global concurrency mutation', required: false, description: '移除队列级 active 上限。' }],
    expectedOutput: 'Promise<number>，Redis 删除结果；之后仅剩 Worker 本地 concurrency 等限制。',
    errorCases: [{ condition: '高积压时突然解除限制造成并发洪峰', handling: '先逐步扩容 Worker/下游，或改成更高但有限的 setGlobalConcurrency。' }],
    relatedApis: ['Queue.setGlobalConcurrency', 'Queue.getGlobalConcurrency', 'Queue.setGlobalRateLimit'],
  },
  'Queue.getWorkers': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'worker discovery read', required: false, description: '读取最近向队列注册/心跳的 Worker 信息。' }],
    expectedOutput: 'Promise<WorkerInfo[]>，用于运维发现，不是永久实例清单。',
    errorCases: [{ condition: '短暂心跳延迟被误判为 Worker 永久下线', handling: '结合 workers count、队列吞吐和多次采样；不要仅凭一次结果自动扩缩容。' }],
    relatedApis: ['Queue.getWorkersCount', 'Worker.waitUntilReady', 'Queue.getActive'],
  },
  'Queue.getWorkersCount': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'worker discovery count', required: false, description: '统计当前可发现 Worker 数量。' }],
    expectedOutput: 'Promise<number>，表示 Worker 注册视图，不保证每个 processor 健康。',
    errorCases: [{ condition: 'count 大于 0 就判定队列健康', handling: '同时检查 oldest waiting、completed/failed 速率和 stalled 事件。' }],
    relatedApis: ['Queue.getWorkers', 'Queue.getMetrics', 'Worker.startStalledCheckTimer'],
  },
  'Queue.isMaxed': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'global concurrency status', required: false, description: '检查 active 数是否达到全局并发上限。' }],
    expectedOutput: 'Promise<boolean>，仅反映全局并发闸门。',
    errorCases: [{ condition: '把 false 当作一定会立即领取任务', handling: '还需检查 pause、rate limit、Worker 在线、delay 和本地 concurrency。' }],
    relatedApis: ['Queue.setGlobalConcurrency', 'Queue.getGlobalConcurrency', 'Queue.getRateLimitTtl'],
  },
  'Queue.remove': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'jobId', type: 'string', required: true, description: '要删除的队列任务 ID。' },
      { name: 'opts.removeChildren', type: 'boolean', required: false, defaultValue: 'false', description: 'Flow 父任务删除时是否连同可删除子任务。' },
    ], expectedOutput: 'Promise<number>，表示删除结果；锁定 active Job 通常不能安全删除。',
    errorCases: [{ condition: '删除 active/他人任务或破坏 Flow 依赖，processor 仍可能完成副作用', handling: '先校验业务归属和状态；取消语义写入业务库并让 processor 协作停止，不把 remove 当撤销事务。' }],
    relatedApis: ['Job.remove', 'Queue.getJob', 'Job.removeUnprocessedChildren'],
  },
  Worker: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '要消费的 Queue 名称，必须与生产者 name/prefix/connection 对齐。' },
      { name: 'processor', type: 'Processor | string | URL', required: false, description: '处理函数或沙箱 processor 路径；可能因 lock 丢失而重复执行，必须幂等。' },
      { name: 'opts.connection', type: 'ConnectionOptions', required: true, description: 'Redis 连接；Worker 需要阻塞连接并应使用适合后台进程的重连策略。' },
      { name: 'opts.concurrency', type: 'number', required: false, defaultValue: '1', description: '该 Worker 实例同时处理的任务数，不应超过下游连接/CPU 容量。' },
      { name: 'opts.lockDuration / stalledInterval / maxStalledCount', type: 'number', required: false, description: '任务锁时长、stalled 检测周期与最多恢复次数，决定崩溃恢复和重复执行窗口。' },
      { name: 'opts.autorun', type: 'boolean', required: false, defaultValue: 'true', description: '是否构造后立即开始取任务；false 时由 run 显式启动。' },
    ], expectedOutput: '返回长生命周期 Worker；它从 Redis 原子领取 Job、续租 lock、调用 processor，再转为 completed/failed。语义为 at-least-once。',
    errorCases: [{ condition: '事件循环阻塞导致 lock 无法续租，Job 被判 stalled 后另一个 Worker 重跑', handling: 'CPU 工作用沙箱/worker thread；processor 幂等，监控 stalled/error，按最坏时长配置 lockDuration。' }],
    relatedApis: ['Queue', 'Job', 'Worker.on', 'Worker.close'],
  },
  'Worker.on': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'event', type: 'WorkerEvent', required: true, description: '本 Worker 的 completed、failed、stalled、error、active、progress 等事件名。' },
      { name: 'listener', type: '(...args) => void', required: true, description: '同步事件监听器；重逻辑应异步移出，避免阻塞 Worker 事件循环。' },
      { name: 'error listener', type: '(error: Error) => void', required: true, description: '生产 Worker 必须监听 error，记录 Redis/运行时故障，避免 Node EventEmitter 无监听错误退出。' },
    ], expectedOutput: '返回 Worker 自身以便链式注册；事件只覆盖当前实例，不是全队列全局事件。',
    errorCases: [{ condition: '缺少 error 监听，或在 listener 抛异常/执行慢操作', handling: '始终注册 error；监听器只记录和分发，业务状态以幂等 processor/数据库为准。' }],
    relatedApis: ['QueueEvents.on', 'Worker', 'Job.updateProgress'],
  },
  'Worker.pause': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'doNotWaitActive', type: 'boolean', required: false, defaultValue: 'false', description: 'false 时等待当前 active 完成后暂停；true 只停止领取并立即返回。' }],
    expectedOutput: 'Promise<void>，只暂停当前 Worker 实例；Queue 全局仍可被其他 Worker 消费。',
    errorCases: [{ condition: 'doNotWaitActive=true 后立即关进程，使 active 锁过期并重复执行', handling: '正常部署使用等待模式或 Worker.close；强停前确保 processor 可幂等恢复。' }],
    relatedApis: ['Worker.resume', 'Worker.isPaused', 'Queue.pause', 'Worker.close'],
  },
  'Worker.resume': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'local worker control', required: false, description: '恢复当前 Worker 的取任务循环，不修改 Queue 全局暂停标记。' }],
    expectedOutput: '无业务返回；Worker 在本地重新允许领取任务。',
    errorCases: [{ condition: 'Queue 仍全局暂停或 Redis 不可用，调用后仍无任务', handling: '结合 Queue.isPaused、Worker.waitUntilReady 和积压状态诊断。' }],
    relatedApis: ['Worker.pause', 'Worker.isPaused', 'Queue.resume'],
  },
  'Worker.close': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'force', type: 'boolean', required: false, defaultValue: 'false', description: 'false 为 graceful：停止领取并等待 active；true 不等 active 完成。' },
      { name: 'shutdown timeout', type: 'application timeout', required: true, description: '外层应设置的最大优雅等待时间，防止卡住部署。' },
      { name: 'signal handling', type: 'SIGTERM/SIGINT lifecycle', required: true, description: '收到信号后先停止健康/流量，再只调用一次 close。' },
    ], expectedOutput: 'Promise<void>；默认在当前任务收口后关闭 Redis 连接，是 Worker 首选 graceful shutdown。',
    errorCases: [{ condition: 'force=true 或平台过早 SIGKILL，active Job lock 到期后会重跑', handling: '给平台 terminationGracePeriod 留足时间；processor 使用业务幂等键并让外部调用可恢复。' }],
    relatedApis: ['Worker.pause', 'Worker.disconnect', 'Queue.close', 'FlowProducer.close'],
  },
  'Worker.disconnect': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'immediate connection control', required: false, description: '立即断开 Worker Redis 连接，不等待 active processor 正常结束。' }],
    expectedOutput: 'Promise<void>；在途 Job 可能失去续锁，稍后被 stalled 恢复。',
    errorCases: [{ condition: '正常部署使用 disconnect 导致重复执行窗口增大', handling: '正常关停使用 close；只在无法优雅恢复的连接故障中强制断开。' }],
    relatedApis: ['Worker.close', 'Queue.disconnect', 'Worker.startStalledCheckTimer'],
  },
  'Worker.run': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'processing loop start', required: false, description: '当 Worker 以 autorun:false 构造后，显式启动领取和处理循环。' }],
    expectedOutput: 'Promise<void>，通常持续到 Worker 关闭；不是单个 Job 的完成 Promise。',
    errorCases: [{ condition: 'autorun 已开启仍重复 run，或 await run 阻塞应用启动后续逻辑', handling: '仅 autorun:false 时调用一次；独立管理长运行 Promise，并监听 error。' }],
    relatedApis: ['Worker', 'Worker.isRunning', 'Worker.close'],
  },
  'Worker.isPaused': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'local state read', required: false, description: '读取当前 Worker 实例的本地暂停状态。' }],
    expectedOutput: 'boolean；不会访问 Queue 全局暂停标记。',
    errorCases: [{ condition: '用它判断整条队列是否暂停', handling: '全局状态使用 Queue.isPaused，并分别展示本地/全局控制层。' }],
    relatedApis: ['Worker.pause', 'Worker.resume', 'Queue.isPaused'],
  },
  'Worker.isRunning': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'local state read', required: false, description: '读取当前实例的处理循环是否已启动。' }],
    expectedOutput: 'boolean；只反映本地 run 状态，不证明 Redis/processor 健康。',
    errorCases: [{ condition: 'isRunning=true 就作为 readiness 成功', handling: '同时验证 waitUntilReady、错误事件和近期处理/积压指标。' }],
    relatedApis: ['Worker.run', 'Worker.waitUntilReady', 'Queue.getWorkers'],
  },
  'Worker.waitUntilReady': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'connection readiness wait', required: false, description: '等待 Worker 所需 Redis 连接就绪。' }],
    expectedOutput: 'Promise<RedisClient>；连接可用后返回，不保证 processor 下游依赖健康。',
    errorCases: [{ condition: 'Redis 永久不可达导致无限等待', handling: '外层设置启动超时并让实例保持 not-ready，避免接受却无法处理任务。' }],
    relatedApis: ['Queue.waitUntilReady', 'Worker.isRunning', 'Worker.close'],
  },
  'Queue.rateLimit': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'expireTimeMs', type: 'number', required: true, description: '根据第三方 Retry-After 换算出的队列动态暂停毫秒数，并应设置业务最大值。' },
    ], expectedOutput: 'Promise<void>，写入跨全部 Worker 生效的队列限流 TTL；当前 processor 通常随后抛 Worker.RateLimitError。',
    errorCases: [{ condition: '只调用 rateLimit 却正常 return，任务被错误标记完成；或把秒当毫秒', handling: '调用 Queue.rateLimit 后抛 Worker.RateLimitError，并严格解析 Retry-After 单位与最大等待。' }],
    relatedApis: ['Queue.getRateLimitTtl', 'WorkerOptions.limiter', 'Queue.setGlobalRateLimit'],
  },
  'Worker.cancelJob': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'jobId', type: 'string', required: true, description: '当前 Worker 正在处理、希望通过 AbortSignal 协作取消的 Job ID。' },
      { name: 'reason', type: 'string', required: false, defaultValue: '取消原因', description: '传给 processor 信号/错误的可诊断原因，不应含敏感数据。' },
    ], expectedOutput: 'boolean，表示当前 Worker 是否找到并请求取消该 active Job；不是跨 Worker 全局强杀。',
    errorCases: [{ condition: 'processor 不监听 AbortSignal，或误以为取消能回滚已发生副作用', handling: '长任务定期检查 signal；外部副作用用补偿/幂等设计，取消只停止尚未发生的步骤。' }],
    relatedApis: ['Worker.cancelAllJobs', 'Worker.close', 'Queue.remove'],
  },
  'Worker.cancelAllJobs': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'reason', type: 'string', required: false, defaultValue: '取消原因', description: '传给当前 Worker 所有 active processor 的协作取消原因。' }],
    expectedOutput: '无业务返回；仅请求取消当前实例处理中的 Job。',
    errorCases: [{ condition: '用作 graceful shutdown 但 processor 忽略取消，或同时取消不可中断事务', handling: '正常关停优先 close 等待；只有业务允许时取消，并为每个步骤设计安全中断点。' }],
    relatedApis: ['Worker.cancelJob', 'Worker.close', 'Worker.pause'],
  },
  'Worker.getNextJob': {
    learningLevel: 'reference', runtime: 'server', parameters: [
      { name: 'token', type: 'string', required: true, description: '手动领取时用于 Job lock 所有权验证的唯一 Worker token。' },
      { name: 'options', type: 'GetNextJobOptions', required: false, defaultValue: '{}', description: '阻塞/等待等低层领取选项。' },
    ], expectedOutput: 'Promise<Job | undefined>，手动领取并锁定下一任务；主要供高级自定义 Worker 循环。',
    errorCases: [{ condition: 'token 管理错误、未续锁/完成任务，导致 active Job stalled 重跑', handling: '一般使用 Worker 自动循环；自定义时必须完整实现 lock、moveToCompleted/Failed 和关停。' }],
    relatedApis: ['Worker.extendJobLocks', 'Worker.startStalledCheckTimer', 'Job'],
  },
  'Worker.extendJobLocks': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'jobIds', type: 'string[]', required: true, description: '需要批量续租的 active Job ID。' },
      { name: 'tokens', type: 'string[]', required: true, description: '与 jobIds 同序的 lock token，证明当前 Worker 所有权。' },
      { name: 'duration', type: 'number', required: true, description: '从现在起延长的锁毫秒数。' },
    ], expectedOutput: 'Promise<string[]>，返回续锁失败的 Job ID；空数组表示本批任务锁都成功延长。',
    errorCases: [{ condition: '数组错位、token 失效或把返回数组误认为成功项', handling: '不手工干预自动 Worker；自定义循环逐个处理返回的失败 jobId，并让 processor 幂等应对失锁重跑。' }],
    relatedApis: ['Worker.getNextJob', 'Worker.startStalledCheckTimer', 'Queue.getActive'],
  },
  'Worker.startStalledCheckTimer': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'stalled recovery loop', required: false, description: '启动当前 Worker 的 stalled 检查定时器；自动运行 Worker 通常已经管理。' }],
    expectedOutput: 'Promise<void>；定期发现失去 lock 的 active Job，并按 maxStalledCount 重新等待或失败。',
    errorCases: [{ condition: '重复启动检查器，或关闭它使崩溃任务永久 active', handling: '正常使用 Worker 自动生命周期；监控 stalled 事件并排查 CPU 阻塞/lock 配置。' }],
    relatedApis: ['Worker', 'Worker.extendJobLocks', 'Queue.getActive', 'Queue.getFailed'],
  },
  Job: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'id', type: 'string | undefined', required: true, description: '队列内标识；持久化后通常存在，可用于 trace 和业务状态关联。' },
      { name: 'name', type: 'Name', required: true, description: '任务类型，决定 processor 中的业务分支。' },
      { name: 'data', type: 'Data', required: true, description: '投递时序列化到 Redis 的输入快照，不会自动跟随业务数据库变化。' },
      { name: 'opts', type: 'JobsOptions', required: true, description: 'attempts、backoff、priority、delay、保留等执行策略。' },
    ], expectedOutput: '任务记录对象，提供状态读取、进度、日志、重试、删除与 Flow 依赖方法；长期业务事实仍应存数据库。',
    errorCases: [{ condition: '把 Job 当恰好一次事务或永久事实源', handling: 'BullMQ 为 at-least-once；外部副作用幂等，业务状态单独持久化并用 jobId/traceId 关联。' }],
    relatedApis: ['Queue.add', 'Worker', 'Job.getState', 'Job.retry'],
  },
  'Job.updateData': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'data', type: 'Data', required: true, description: '替换 Job 在 Redis 中保存的完整 data；必须可序列化。' }],
    expectedOutput: 'Promise<void>；后续读取和尚未使用旧快照的 processor 将看到新 data。',
    errorCases: [{ condition: 'active processor 已读取旧 data，更新造成并发语义不一致', handling: '只在明确状态和版本下更新；更推荐 data 放 ID，最新事实从带版本的业务库读取。' }],
    relatedApis: ['Queue.getJob', 'Job.getState', 'Job.updateProgress'],
  },
  'Job.updateProgress': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'progress', type: 'number | object', required: true, description: '轻量、可序列化的百分比或结构化阶段信息。' }],
    expectedOutput: 'Promise<void>；更新 Redis progress 并发出 progress 事件。',
    errorCases: [{ condition: '高频逐条更新压垮 Redis/事件流，或对象过大', handling: '按时间/百分比节流，只写可展示的最小进度；最终业务状态另存数据库。' }],
    relatedApis: ['Worker.on', 'QueueEvents.on', 'Job.log'],
  },
  'Job.log': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'logRow', type: 'string', required: true, description: '追加到该 Job Redis 日志列表的单行脱敏文本。' }],
    expectedOutput: 'Promise<number>，返回写入后的日志条数。',
    errorCases: [{ condition: '记录密钥/个人数据或每个步骤无限写入', handling: '脱敏、限制长度与频率，并使用 clearLogs/keepLogs；完整日志进入外部日志系统。' }],
    relatedApis: ['Queue.getJobLogs', 'Job.clearLogs', 'Job.updateProgress'],
  },
  'Job.clearLogs': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: 'keepLogs', type: 'number', required: false, defaultValue: '0', description: '清理后保留最新多少条 Job log。' }],
    expectedOutput: 'Promise<void>，裁剪或清空该任务日志。',
    errorCases: [{ condition: '在故障调查前清空关键上下文', handling: '先导出需要的脱敏证据，再按数据保留策略清理。' }],
    relatedApis: ['Job.log', 'Queue.getJobLogs', 'Queue.clean'],
  },
  'Job.getState': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'job state read', required: false, description: '使用当前 Job 的 queue/id 查询 Redis 状态。' }],
    expectedOutput: 'Promise<JobType | "unknown">，是调用时刻的状态快照。',
    errorCases: [{ condition: '记录已自动删除返回 unknown，或读取后状态立即变化', handling: '长期状态看业务库；控制转换调用原子 Job 方法并处理竞态错误。' }],
    relatedApis: ['Queue.getJobState', 'Job.isActive', 'Job.isCompleted', 'Job.isFailed'],
  },
  'Job.isWaiting': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'state predicate', required: false, description: '检查当前 Job 是否在普通 waiting 集合。' }],
    expectedOutput: 'Promise<boolean>；不包含 delayed/prioritized/waiting-children。',
    errorCases: [{ condition: 'false 被解释为任务已完成', handling: '需要完整状态时调用 getState。' }], relatedApis: ['Job.getState', 'Queue.getWaiting', 'Job.isDelayed'],
  },
  'Job.isActive': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'state predicate', required: false, description: '检查任务当前是否由 Worker 持锁处理。' }],
    expectedOutput: 'Promise<boolean>；返回调用瞬间任务是否处于 active 并由某个 Worker 持有执行锁。',
    errorCases: [{ condition: 'active 被当作 processor 一定健康', handling: '同时检查处理时长、lock/stalled 和 Worker 事件。' }], relatedApis: ['Job.getState', 'Queue.getActive', 'Worker.extendJobLocks'],
  },
  'Job.isCompleted': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'state predicate', required: false, description: '检查保留记录是否处于 completed。' }],
    expectedOutput: 'Promise<boolean>；返回当前保留的任务记录是否已经成功进入 completed 终态。',
    errorCases: [{ condition: '记录已删除而误判业务未成功', handling: '业务成功写数据库/outbox；completed 仅是短期运行证据。' }], relatedApis: ['Job.getState', 'Queue.getCompleted', 'Job.waitUntilFinished'],
  },
  'Job.isFailed': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'state predicate', required: false, description: '检查任务是否最终进入 failed。' }],
    expectedOutput: 'Promise<boolean>；返回任务是否已经耗尽重试或被明确转入 failed 终态。',
    errorCases: [{ condition: 'false 被当作没有错误，忽略 waiting for retry/delayed backoff', handling: '检查 getState、attemptsMade 和 failedReason。' }], relatedApis: ['Job.getState', 'Queue.getFailed', 'Job.retry'],
  },
  'Job.isDelayed': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'state predicate', required: false, description: '检查任务是否等待 delay/backoff/调度时间。' }],
    expectedOutput: 'Promise<boolean>；返回任务是否正在 delayed 集合等待延迟、退避或调度时间到期。',
    errorCases: [{ condition: '把 delayed 当故障或承诺准点执行', handling: '结合 delay timestamp、rate limit 和 backlog 解释。' }], relatedApis: ['Queue.getDelayed', 'Job.changeDelay', 'Job.promote'],
  },
  'Job.isWaitingChildren': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'flow state predicate', required: false, description: '检查父 Job 是否等待 Flow 子依赖。' }],
    expectedOutput: 'Promise<boolean>；返回 Flow 父任务是否仍在等待一个或多个子依赖完成。',
    errorCases: [{ condition: '长期等待却只扩容父队列 Worker', handling: '检查 children 队列、失败依赖和依赖策略。' }], relatedApis: ['Queue.getWaitingChildren', 'Job.getDependencies', 'FlowProducer.getFlow'],
  },
  'Job.changeDelay': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'delay', type: 'number', required: true, description: '从现在起重新等待的毫秒数，只适用于 delayed Job。' }],
    expectedOutput: 'Promise<void>，原子更新 delayed 执行时间。',
    errorCases: [{ condition: 'Job 已迁移状态或时间单位错误', handling: '处理状态不匹配异常；统一毫秒并设置业务允许的最大延迟。' }], relatedApis: ['Queue.getDelayed', 'Job.promote', 'Queue.promoteJobs'],
  },
  'Job.changePriority': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'opts.priority / lifo', type: 'number / boolean', required: false, defaultValue: 'priority: 0, lifo: false', description: '更新 waiting Job 优先级，或以 LIFO 方式重排无优先级任务。' }],
    expectedOutput: 'Promise<void>，调整任务在可等待结构中的排序。',
    errorCases: [{ condition: 'Job 非可重排状态，或频繁提权造成低优饥饿', handling: '仅对 waiting/prioritized 管理；优先级策略有限且可审计。' }], relatedApis: ['Queue.getPrioritized', 'Queue.getWaiting', 'Job.getState'],
  },
  'Job.promote': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'delayed state transition', required: false, description: '把当前 delayed Job 提前转为 waiting。' }],
    expectedOutput: 'Promise<void>；任务随后按并发、优先级和限流被领取。',
    errorCases: [{ condition: '用于绕过 backoff 后根因未修复，造成快速失败循环', handling: '确认依赖恢复并确保 processor 幂等；批量场景优先 Queue.promoteJobs 限量操作。' }], relatedApis: ['Queue.promoteJobs', 'Job.changeDelay', 'Queue.getDelayed'],
  },
  'Job.retry': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'state', type: '"failed" | "completed"', required: false, defaultValue: '"failed"', description: '只允许从指定终态重新进入 waiting。' },
      { name: 'opts.resetAttemptsMade', type: 'boolean', required: false, defaultValue: 'false', description: '是否重置 attemptsMade；会影响后续 attempts 预算。' },
      { name: 'idempotency key', type: 'application business key', required: true, description: '重跑前必须存在的业务副作用去重键。' },
    ], expectedOutput: 'Promise<void>，将保留的终态 Job 原子移回 waiting。',
    errorCases: [{ condition: 'processor 已完成部分副作用或 poison input 永久失败', handling: '先修复/补偿并验证幂等；保留重试审计，设置有限 attempts 而非无限人工点击。' }],
    relatedApis: ['Queue.retryJobs', 'Job.isFailed', 'Queue.getFailed', 'Job.discard'],
  },
  'Job.remove': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'opts.removeChildren', type: 'boolean', required: false, defaultValue: 'false', description: '删除 Flow 节点时是否尝试递归删除子项。' }],
    expectedOutput: 'Promise<void>，删除该任务 Redis 记录；锁定 active Job 通常会拒绝。',
    errorCases: [{ condition: '把删除 Job 当作撤销已完成副作用，或破坏父子依赖', handling: '业务取消用协作标记/补偿；Flow 删除前读取依赖并审计范围。' }], relatedApis: ['Queue.remove', 'Job.removeUnprocessedChildren', 'Worker.cancelJob'],
  },
  'Job.discard': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'local retry flag', required: false, description: '在当前 processor 中标记该 Job 本次失败后不再自动重试。' }],
    expectedOutput: '无返回值；修改 Job 实例的 discard 标志，后续抛错会直接失败。',
    errorCases: [{ condition: '调用后没有抛错却误以为任务失败，或把瞬时错误永久丢弃', handling: '仅对明确不可重试业务错误使用，随后抛出分类异常并记录原因。' }], relatedApis: ['Job.retry', 'Queue.getFailed', 'Worker.on'],
  },
  'Job.waitUntilFinished': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'queueEvents', type: 'QueueEvents', required: true, description: '已运行且共享同 queue/prefix/Redis 的全局事件消费者。' },
      { name: 'ttl', type: 'number', required: false, description: '等待 completed/failed 的最大毫秒数，防止请求永久挂起。' },
      { name: 'job retention', type: 'removeOnComplete/removeOnFail policy', required: true, description: '等待期间事件和结果必须尚可关联；QueueEvents 需先就绪。' },
    ], expectedOutput: 'Promise<Result>；completed 时解析 returnvalue，failed 时拒绝。它会把异步队列重新变成长等待，不适合大规模 HTTP。',
    errorCases: [{ condition: 'QueueEvents 未就绪错过事件、ttl 缺失或 HTTP 连接长期占用', handling: '先 await waitUntilReady，设置 ttl；大任务返回 jobId 并轮询/推送业务状态。' }],
    relatedApis: ['QueueEvents', 'QueueEvents.waitUntilReady', 'Job.isCompleted', 'Job.isFailed'],
  },
  'Job.getChildrenValues': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'flow dependency result read', required: false, description: '从父 Job 的已成功子依赖读取 key 到 returnvalue 映射。' }],
    expectedOutput: 'Promise<Values>，key 通常编码子队列/job 标识，值为子 Job returnvalue。',
    errorCases: [{ condition: '子结果巨大撑高 Redis，或假设所有 children 都成功存在', handling: '大结果存对象存储只返回引用；同时读取失败/未处理依赖。' }], relatedApis: ['Job.getFailedChildrenValues', 'Job.getDependencies', 'FlowProducer.getFlow'],
  },
  'Job.getFailedChildrenValues': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'flow failure read', required: false, description: '读取失败或按选项被视为失败的子依赖原因。' }],
    expectedOutput: 'Promise<Record<string, string>>，子依赖 key 到失败原因。',
    errorCases: [{ condition: '把失败字符串直接展示导致内部信息泄漏', handling: '服务端分类/脱敏，并结合 Flow 策略决定补偿、忽略或让父失败。' }], relatedApis: ['Job.getChildrenValues', 'Job.getDependencies', 'Queue.getWaitingChildren'],
  },
  'Job.getDependencies': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'opts', type: 'DependenciesOpts', required: false, defaultValue: '{}', description: '选择 processed/unprocessed/failed/ignored 分组及分页游标和数量。' }],
    expectedOutput: 'Promise<JobDependencies>，返回 Flow 父任务依赖的分页视图。',
    errorCases: [{ condition: '不分页读取超大 fan-out 或误把变化中视图当一致快照', handling: '按分组/游标分页，并用 getDependenciesCount 做概览。' }], relatedApis: ['Job.getDependenciesCount', 'FlowProducer.getFlow', 'Job.removeChildDependency'],
  },
  'Job.getDependenciesCount': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: 'opts', type: 'DependencyCountOptions', required: false, defaultValue: '全部依赖类型', description: '指定要统计 processed、unprocessed、failed、ignored 中哪些分组。' }],
    expectedOutput: 'Promise<Record<DependencyType, number>>，返回父 Job 各依赖状态数量。',
    errorCases: [{ condition: '计数变化时据此执行非原子控制', handling: '用于展示/诊断；依赖迁移交给 BullMQ 原子 Flow 逻辑。' }], relatedApis: ['Job.getDependencies', 'Queue.getWaitingChildren', 'FlowProducer.getFlow'],
  },
  'Job.removeChildDependency': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'flow relation mutation', required: false, description: '从当前子 Job 移除其对父 Job 的依赖关系。' }],
    expectedOutput: 'Promise<boolean>，表示是否移除依赖；父 Job 可能因此变为可运行。',
    errorCases: [{ condition: '误解除必要依赖使父任务在缺少结果时运行', handling: '仅在明确业务补偿/忽略策略下操作，并记录父子 ID 和操作者。' }], relatedApis: ['Job.getDependencies', 'Job.removeUnprocessedChildren', 'FlowProducer.getFlow'],
  },
  'Job.removeUnprocessedChildren': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'flow subtree mutation', required: false, description: '删除父 Job 下尚未完成处理的 children。' }],
    expectedOutput: 'Promise<void>，用于取消尚未执行的 Flow 分支；已 active/processed 副作用不自动回滚。',
    errorCases: [{ condition: '与 Worker 领取竞态或误以为已执行子项被补偿', handling: '先写业务取消标记，让 processor 启动时检查；对已发生副作用单独补偿。' }], relatedApis: ['Job.removeChildDependency', 'Job.remove', 'Worker.cancelJob'],
  },
  'Job.removeDeduplicationKey': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'deduplication state mutation', required: false, description: '删除该 Job 对应的 BullMQ deduplication key，让相同去重标识可再次投递。' }],
    expectedOutput: 'Promise<boolean>，表示 key 是否被移除。',
    errorCases: [{ condition: '任务仍在执行时提前移除，允许重复任务并发产生相同副作用', handling: '仅在明确允许新一轮后移除；业务幂等仍由数据库唯一键/状态机保证。' }], relatedApis: ['Queue.add', 'Job.retry', 'Queue.getJob'],
  },
  QueueEvents: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '要监听的 Queue 名称。' },
      { name: 'opts.connection', type: 'ConnectionOptions', required: true, description: '读取 Redis stream 的独立连接配置。' },
      { name: 'opts.lastEventId', type: 'string', required: false, description: '从指定 stream ID 后恢复消费；仍受事件裁剪窗口限制。' },
      { name: 'opts.autorun', type: 'boolean', required: false, defaultValue: 'true', description: '是否构造后立即启动全局事件消费循环。' },
    ], expectedOutput: '返回全队列事件消费者；通过 Redis stream 接收所有 Worker 的 completed、failed、progress、stalled 等事件。',
    errorCases: [{ condition: '事件被 trim、消费者停机太久或重复投递，导致通知丢失/重复', handling: '事件处理幂等；关键业务状态以数据库/Job 查询对账，不能把 QueueEvents 当唯一消息总线。' }], relatedApis: ['QueueEvents.on', 'Worker.on', 'Queue.trimEvents', 'Job.waitUntilFinished'],
  },
  'QueueEvents.on': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'event', type: 'QueueEvent', required: true, description: '全队列 completed、failed、progress、stalled、waiting 等事件。' },
      { name: 'listener', type: '(...args) => void', required: true, description: '接收 jobId 和序列化事件数据的监听器。' },
      { name: 'idempotency key', type: 'event id | jobId + transition', required: true, description: '监听器写外部系统时用于防止重放/重复处理。' },
    ], expectedOutput: '返回 QueueEvents 自身；持续接收跨 Worker 事件。',
    errorCases: [{ condition: '监听器失败没有自动业务重试，或 completed 重复导致重复通知', handling: '监听器只投递到可靠 outbox/队列并幂等；业务结果可通过 Job/数据库重新对账。' }], relatedApis: ['QueueEvents.once', 'QueueEvents.off', 'Worker.on', 'Job.waitUntilFinished'],
  },
  'QueueEvents.once': {
    learningLevel: 'reference', runtime: 'server', parameters: [
      { name: 'event', type: 'QueueEvent', required: true, description: '只接收下一次的全局队列事件类型。' },
      { name: 'listener', type: '(...args) => void', required: true, description: '触发一次后自动移除的回调。' },
    ], expectedOutput: '返回当前 QueueEvents 实例以便继续链式注册；指定监听器只会在下一次匹配事件触发一次。',
    errorCases: [{ condition: '用一次监听等待特定 job，但先到的是其他 Job 的同类事件', handling: 'listener 内核对 jobId，或使用 Job.waitUntilFinished；仍设置超时。' }], relatedApis: ['QueueEvents.on', 'QueueEvents.off', 'Job.waitUntilFinished'],
  },
  'QueueEvents.off': {
    learningLevel: 'reference', runtime: 'server', parameters: [
      { name: 'event', type: 'QueueEvent', required: true, description: '要取消监听的具体全局队列事件名称，必须与注册时完全一致。' },
      { name: 'listener', type: 'Function', required: true, description: '必须是注册时同一函数引用。' },
    ], expectedOutput: '返回 QueueEvents 自身并移除指定 listener。',
    errorCases: [{ condition: '使用新匿名函数 off 导致原监听器仍存活、内存和重复副作用累积', handling: '保存稳定 listener 引用，并在服务生命周期结束时成对注销。' }], relatedApis: ['QueueEvents.on', 'QueueEvents.once', 'QueueEvents.close'],
  },
  'QueueEvents.run': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'event loop start', required: false, description: 'autorun:false 时显式启动 Redis stream 消费循环。' }],
    expectedOutput: 'Promise<void>，持续到 QueueEvents 关闭。', errorCases: [{ condition: 'autorun=true 时重复 run，或未管理长运行 Promise 的错误', handling: '仅手动模式调用一次，并注册 error/关停处理。' }], relatedApis: ['QueueEvents', 'QueueEvents.close', 'QueueEvents.waitUntilReady'],
  },
  'QueueEvents.close': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'graceful event consumer close', required: false, description: '停止事件读取循环并关闭 Redis 连接。' }],
    expectedOutput: 'Promise<void>，适合应用 graceful shutdown。', errorCases: [{ condition: '关停期间仍依赖事件完成请求，或没有等待 close', handling: '先停止新等待者，允许在途业务超时/对账，再 await close。' }], relatedApis: ['QueueEvents.run', 'Worker.close', 'Queue.close'],
  },
  'QueueEvents.waitUntilReady': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'connection readiness wait', required: false, description: '等待 Redis stream 连接可用；waitUntilFinished 前应先就绪。' }],
    expectedOutput: 'Promise<RedisClient>。', errorCases: [{ condition: '未就绪便等待 Job 事件，发生竞态或启动无限卡住', handling: '启动阶段 await 并设置超时；失败时不开放依赖事件的接口。' }], relatedApis: ['Job.waitUntilFinished', 'QueueEvents.close', 'Queue.waitUntilReady'],
  },
  FlowProducer: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'opts.connection', type: 'ConnectionOptions', required: true, description: '所有 Flow 队列可访问的 Redis 连接。' },
      { name: 'opts.prefix', type: 'string', required: false, defaultValue: '"bull"', description: '父子队列必须使用兼容 prefix 才能建立依赖。' },
      { name: 'flow identity', type: 'stable jobId strategy', required: true, description: '调用方为重试创建 Flow 设计的父子业务幂等 ID。' },
    ], expectedOutput: '返回 Flow 生产实例，可原子创建跨队列父子依赖树；执行仍由各队列 Worker 完成。',
    errorCases: [{ condition: '创建结果未知后重试生成重复树，或某子队列无 Worker 永久阻塞父项', handling: '为所有节点设置稳定 ID/业务批次；部署前验证每个 queueName 有消费者和失败策略。' }], relatedApis: ['FlowProducer.add', 'FlowProducer.getFlow', 'Queue.getWaitingChildren', 'Job.getDependencies'],
  },
  'FlowProducer.add': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'flow', type: 'FlowJob', required: true, description: '包含 name、queueName、data、opts 与递归 children 的依赖树。' },
      { name: 'opts', type: 'FlowOpts', required: false, defaultValue: '{}', description: '队列前缀等 Flow 创建选项。' },
      { name: 'children failure options', type: 'JobsOptions', required: true, description: '每个子项的 failParentOnFailure、ignoreDependencyOnFailure 等失败传播策略。' },
    ], expectedOutput: 'Promise<JobNode>；整棵树原子写入，children 先运行，依赖满足后父 Job 可执行。',
    errorCases: [{ condition: '超大 fan-out 阻塞 Redis，或父 processor 假设所有子结果存在', handling: '限制树宽/深并分层；显式失败传播，父项同时读取成功与失败 children。' }], relatedApis: ['FlowProducer.addBulk', 'FlowProducer.getFlow', 'Job.getChildrenValues', 'Job.getFailedChildrenValues'],
  },
  'FlowProducer.addBulk': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'flows', type: 'FlowJob[]', required: true, description: '要一次原子加入的多棵独立依赖树；总节点数应受限。' }],
    expectedOutput: 'Promise<JobNode[]>，顺序与输入 flows 一致。', errorCases: [{ condition: '单次树总量过大或失败后重试产生重复 Flow', handling: '按节点总数分批并为每棵树所有 Job 使用稳定业务 ID。' }], relatedApis: ['FlowProducer.add', 'Queue.addBulk', 'FlowProducer.getFlow'],
  },
  'FlowProducer.getFlow': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'opts.id', type: 'string', required: true, description: '根/目标 Flow Job ID。' },
      { name: 'opts.queueName', type: 'string', required: true, description: '目标 Job 所在队列名。' },
      { name: 'opts.depth', type: 'number', required: false, defaultValue: '展开默认层级', description: '递归展开子树的最大深度。' },
      { name: 'opts.maxChildren', type: 'number', required: false, description: '每个节点最多读取的 children，保护 Redis 和内存。' },
    ], expectedOutput: 'Promise<JobNode>，返回变化中的父子树状态视图。',
    errorCases: [{ condition: '无界展开大型 Flow 或允许跨租户读取任意 id', handling: '限制 depth/maxChildren，分页补充依赖，并校验根业务归属。' }], relatedApis: ['FlowProducer.add', 'Job.getDependencies', 'Job.getDependenciesCount'],
  },
  'FlowProducer.close': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'graceful producer close', required: false, description: '等待在途 Flow Redis 命令完成后关闭连接。' }],
    expectedOutput: 'Promise<void>；等待 FlowProducer 在途 Redis 命令收口，并完成其连接资源的优雅关闭。', errorCases: [{ condition: 'add/addBulk 尚未收口时关停，创建结果未知', handling: '停止新建 Flow、等待在途 Promise，再 await close；重启后用稳定 ID 对账。' }], relatedApis: ['Queue.close', 'FlowProducer.waitUntilReady', 'Worker.close'],
  },
  'FlowProducer.waitUntilReady': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'connection readiness wait', required: false, description: '等待 FlowProducer Redis 连接可用。' }],
    expectedOutput: 'Promise<RedisClient>。', errorCases: [{ condition: '连接未就绪却向 API 声称整棵 Flow 已受理', handling: '在 readiness/请求写入边界 fail fast，并设置连接超时。' }], relatedApis: ['FlowProducer.add', 'FlowProducer.close', 'Queue.waitUntilReady'],
  },
  JobScheduler: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'id', type: 'string', required: true, description: '调度定义的稳定业务 ID；重复部署使用同 ID 才能幂等 upsert。' },
      { name: 'repeatOpts', type: 'every | pattern | RepeatOptions', required: true, description: '间隔或 cron 规则；cron 注意秒字段和时区。' },
      { name: 'template', type: '{ name; data; opts }', required: false, defaultValue: '{}', description: '每次产生 Job 所使用的任务名称、数据和 options 模板。' },
    ], expectedOutput: '通过 Queue.upsertJobScheduler 使用后返回当前/下一条 delayed Job；调度器持续按规则生成实例。',
    errorCases: [{ condition: '部署改用新 id 产生重复调度，或误认为每次一定准点执行', handling: '把 scheduler id 纳入声明式配置；监控实际开始延迟，容量/限流会使执行晚于计划。' }],
    relatedApis: ['Queue.upsertJobScheduler', 'Queue.getJobScheduler', 'Queue.removeJobScheduler'],
  },
  'QueueScheduler (deprecated)': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无新项目参数', type: 'deprecated v1 component', required: false, description: 'BullMQ v2+ 不再需要独立 QueueScheduler；v5 delayed/stalled/retry 由 Worker/核心机制处理。' }],
    expectedOutput: 'v5 新代码不应构造任何实例；历史系统迁移后移除该进程。',
    errorCases: [{ condition: '照搬旧教程，把它与 v5 JobScheduler 混为一谈', handling: '核对 BullMQ major；重复任务使用 upsertJobScheduler，stalled 依赖 Worker。' }],
    relatedApis: ['JobScheduler', 'Worker.startStalledCheckTimer', 'Queue.upsertJobScheduler'],
  },
  'Queue.upsertJobScheduler': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'id', type: 'string', required: true, description: '调度器稳定身份；相同 ID 更新而不是新增。' },
      { name: 'repeatOpts', type: 'RepeatOptions', required: true, description: 'every、pattern、startDate、endDate、limit、offset 等重复规则。' },
      { name: 'jobTemplate', type: '{ name?; data?; opts? }', required: false, defaultValue: '{}', description: '后续每个 Job 的数据、attempts、backoff 和保留策略。' },
    ], expectedOutput: 'Promise<Job>，返回调度器生成的首条/下一条延迟 Job。',
    errorCases: [{ condition: 'cron 时区/秒字段错误、模板不可序列化或换 ID 导致双份生产', handling: '启动期校验规则并使用固定 ID；先 upsert 新配置再核对 scheduler 列表。' }],
    relatedApis: ['JobScheduler', 'Queue.getJobScheduler', 'Queue.removeJobScheduler'],
  },
  'Queue.getJobScheduler': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'id', type: 'string', required: true, description: '要读取的稳定 scheduler ID。' }],
    expectedOutput: 'Promise<JobSchedulerJson | undefined>，包含规则、模板和下一次时间；不是单次 Job 状态。',
    errorCases: [{ condition: 'undefined 被忽略导致定时任务实际未部署', handling: '启动配置审计把缺失视为漂移并重新 upsert/告警。' }], relatedApis: ['Queue.upsertJobScheduler', 'Queue.getJobSchedulers', 'Queue.removeJobScheduler'],
  },
  'Queue.getJobSchedulers': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'start / end', type: 'number', required: false, defaultValue: '0 / -1', description: '按调度器 Redis 排名读取的分页范围，避免一次扫描全部生产规则。' },
      { name: 'asc', type: 'boolean', required: false, defaultValue: 'false', description: '控制调度器目录按升序或降序返回，配置审计时应固定方向。' },
    ], expectedOutput: 'Promise<JobSchedulerJson[]>，用于配置审计和管理界面。',
    errorCases: [{ condition: '不分页或把目录当声明真源手工漂移', handling: '代码配置为真源，列表只做 diff；始终设置范围。' }], relatedApis: ['Queue.getJobScheduler', 'Queue.getJobSchedulersCount', 'Queue.upsertJobScheduler'],
  },
  'Queue.getJobSchedulersCount': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'scheduler count read', required: false, description: '统计新式 Job Scheduler 定义数量。' }],
    expectedOutput: 'Promise<number>；返回当前队列 Redis 中仍存在的新式 Job Scheduler 配置总数。', errorCases: [{ condition: '数量正确就认为规则和 ID 都正确', handling: '进一步读取列表并与期望配置逐项 diff。' }], relatedApis: ['Queue.getJobSchedulers', 'Queue.getJobScheduler'],
  },
  'Queue.removeJobScheduler': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'id', type: 'string', required: true, description: '要停止继续产生 Job 的 scheduler ID。' }],
    expectedOutput: 'Promise<boolean>；删除调度定义，但已经产生的 waiting/delayed Job 不一定删除。',
    errorCases: [{ condition: '只删 scheduler 却误以为已取消所有实例', handling: '分别决定已生成 Job 的取消/保留，并在业务配置中记录下线。' }], relatedApis: ['Queue.upsertJobScheduler', 'Queue.getJobScheduler', 'Queue.getDelayed'],
  },
  'Queue.getRepeatableJobs': {
    learningLevel: 'reference', runtime: 'server', parameters: [
      { name: 'start / end', type: 'number', required: false, defaultValue: '0 / -1', description: 'legacy repeatable 配置分页范围。' },
      { name: 'asc', type: 'boolean', required: false, defaultValue: 'false', description: '控制旧重复任务配置按升序或降序返回，迁移脚本应固定顺序。' },
    ], expectedOutput: 'Promise<RepeatableJob[]>，用于旧版 repeat 迁移，包含精确删除 key。',
    errorCases: [{ condition: '把 legacy repeat 与新 JobScheduler 混用或全量读取', handling: '按版本分开治理并分页；新配置迁移到 upsertJobScheduler。' }], relatedApis: ['Queue.removeRepeatable', 'Queue.removeRepeatableByKey', 'Queue.getJobSchedulers'],
  },
  'Queue.removeRepeatable': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '旧重复任务的 Job 名称。' },
      { name: 'repeatOpts', type: 'RepeatOptions', required: true, description: '必须与创建时 pattern/every/tz 等精确一致。' },
      { name: 'jobId', type: 'string', required: false, description: '创建旧 repeat 时参与身份计算的可选 Job ID。' },
    ], expectedOutput: 'Promise<boolean>，删除匹配的 legacy repeat 配置。',
    errorCases: [{ condition: '参数细微不一致导致 false，旧任务继续生产', handling: '先 getRepeatableJobs 获取真实 key/配置；更可靠地使用 removeRepeatableByKey。' }],
    relatedApis: ['Queue.getRepeatableJobs', 'Queue.removeRepeatableByKey', 'Queue.removeJobScheduler'],
  },
  'Queue.removeRepeatableByKey': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'key', type: 'string', required: true, description: 'getRepeatableJobs 返回的精确 legacy repeat key。' }],
    expectedOutput: 'Promise<boolean>，删除对应旧重复定义。',
    errorCases: [{ condition: '接受外部任意 key 或跨 queue/prefix 使用', handling: 'key 只来自受控列表并校验环境/队列；新 scheduler 使用显式 id API。' }], relatedApis: ['Queue.getRepeatableJobs', 'Queue.removeRepeatable', 'Queue.removeJobScheduler'],
  },
  'Queue.setGlobalRateLimit': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'max', type: 'number', required: true, description: '每个 duration 窗口最多开始处理的 Job 数。' },
      { name: 'duration', type: 'number', required: true, description: '全局固定限流窗口的毫秒长度，必须按下游真实配额统一换算。' },
    ], expectedOutput: 'Promise<number>，写入跨所有 Worker 生效的固定速率限制。',
    errorCases: [{ condition: '把 duration 秒误作毫秒，或限流不足仍压垮第三方', handling: '统一单位并压测；结合动态 Queue.rateLimit 处理 429 Retry-After。' }], relatedApis: ['Queue.getGlobalRateLimit', 'Queue.getRateLimitTtl', 'Queue.removeGlobalRateLimit', 'Queue.rateLimit'],
  },
  'Queue.getGlobalRateLimit': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'rate configuration read', required: false, description: '读取固定 max/duration 配置，不是当前剩余额度。' }],
    expectedOutput: 'Promise<{ max; duration } | null>。', errorCases: [{ condition: 'null 当成 max=0，或用配置值解释当前阻塞', handling: 'null 表示未设置；当前等待读取 getRateLimitTtl。' }], relatedApis: ['Queue.setGlobalRateLimit', 'Queue.getRateLimitTtl', 'Queue.removeGlobalRateLimit'],
  },
  'Queue.getRateLimitTtl': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'maxJobs', type: 'number', required: false, description: '可选判断指定任务数量可通过当前窗口需要等待多久。' }],
    expectedOutput: 'Promise<number>，当前限流剩余 TTL 毫秒；非正值通常表示无需等待。',
    errorCases: [{ condition: '高频轮询 Redis 或 TTL 到期就承诺立刻执行', handling: '运维采样即可；到期后仍受 pause、并发、priority 和 Worker 可用性影响。' }], relatedApis: ['Queue.getGlobalRateLimit', 'Queue.rateLimit', 'Queue.isMaxed'],
  },
  'Queue.removeGlobalRateLimit': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'rate configuration mutation', required: false, description: '删除 Redis 中当前队列的固定全局速率上限配置，不影响并发限制。' }],
    expectedOutput: 'Promise<number>，Redis 删除结果。', errorCases: [{ condition: '大 backlog 下解除限流造成流量洪峰', handling: '先评估 Worker 总 concurrency 和下游容量，优先逐步提高而非一次移除。' }], relatedApis: ['Queue.setGlobalRateLimit', 'Queue.getGlobalRateLimit', 'Queue.setGlobalConcurrency'],
  },
  'WorkerOptions.limiter': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'max', type: 'number', required: true, description: '共享时间窗口允许处理的任务数。' },
      { name: 'duration', type: 'number', required: true, description: 'Worker 固定限流时间窗口的毫秒长度，由同队列实例共同协调。' },
      { name: 'worker connection scope', type: 'same queue/prefix/Redis', required: true, description: '只有连接同一队列的 Worker 才共同协调该限制。' },
    ], expectedOutput: '类型配置；Worker 领取任务时由 Redis 跨实例协调固定限流。',
    errorCases: [{ condition: '误认为每 Worker 各有 max，或期待旧版 groupKey 多租户分组限流', handling: '按队列全局容量理解；租户差异拆队列或在业务网关实现公平调度。' }],
    relatedApis: ['Worker', 'Queue.rateLimit', 'Queue.setGlobalRateLimit'],
  },
  'Queue.getMetrics': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'type', type: '"completed" | "failed"', required: true, description: '读取成功或失败的每分钟序列。' },
      { name: 'start / end', type: 'number', required: false, defaultValue: '0 / -1', description: '分钟数据点排名范围；按保留点分页。' },
      { name: 'WorkerOptions.metrics', type: 'metrics configuration', required: true, description: 'Worker 必须事先启用 maxDataPoints 才会写入历史数据。' },
    ], expectedOutput: 'Promise<Metrics>，包含 data 每分钟计数、meta 和累计 count；不是延迟分位数或完整 APM。',
    errorCases: [{ condition: 'Worker 未启用 metrics 得到空序列，或把累计 count 当窗口和', handling: '统一所有 Worker 保留配置；根据 data 计算窗口趋势，延迟/SLO 发送外部监控。' }],
    relatedApis: ['WorkerOptions.metrics', 'Queue.exportPrometheusMetrics', 'Queue.getJobCounts'],
  },
  'Queue.exportPrometheusMetrics': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'globalVariables', type: 'Record<string, string>', required: false, defaultValue: '{}', description: '附加到所有指标的低基数标签，如 service/environment；禁止 jobId/userId。' }],
    expectedOutput: 'Promise<string>，Prometheus exposition 文本，主要反映各 Job 状态当前数量。',
    errorCases: [{ condition: '高基数标签导致 Prometheus 时序爆炸，或公开端点泄露内部队列名', handling: '固定白名单标签，保护 metrics 端点，并在网关控制抓取权限。' }], relatedApis: ['Queue.getMetrics', 'Queue.getJobCounts', 'WorkerOptions.metrics'],
  },
  'WorkerOptions.metrics': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'maxDataPoints', type: 'MetricsTime | number', required: false, defaultValue: '约一天默认值', description: 'Redis 中每分钟 completed/failed 序列最多保留多少点；所有 Worker 应一致。' }],
    expectedOutput: '类型配置；启用后 Worker 在处理结束时写 BullMQ 内建分钟指标。',
    errorCases: [{ condition: '保留过大占 Redis，或跨 Worker 配置不一致导致窗口不可预测', handling: '按真正诊断窗口计算点数、统一配置并监控 Redis 内存；长期指标导出外部 TSDB。' }], relatedApis: ['Queue.getMetrics', 'Queue.exportPrometheusMetrics', 'Worker'],
  },
} satisfies Record<string, FrameworkApiLearningMeta>

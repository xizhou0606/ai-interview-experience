import type { FrameworkApiLearningMeta } from '../types'

/** Langfuse JS/TS v5 structured learning metadata; keys mirror core.ts names exactly. */
export const langfuseLearningMeta = {
  LangfuseClient: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'params.publicKey', type: 'string', required: true, description: 'Langfuse 项目公钥，用于标识遥测和控制面数据写入哪个项目。' },
      { name: 'params.secretKey', type: 'string', required: true, description: '服务端私钥，只能存放在后端环境变量或密钥管理系统中。' },
      { name: 'params.baseUrl', type: 'string', required: false, defaultValue: 'Langfuse Cloud URL', description: '云端或自托管 Langfuse 的 HTTPS 地址，部署时必须与数据驻留区域一致。' },
      { name: 'params.environment / release', type: 'string', required: false, description: '标记环境和发布版本，便于比较回归、筛选生产流量和定位变更。' },
    ], expectedOutput: '返回可复用的 LangfuseClient，提供 Prompt、Dataset、Experiment、Score、Media 与 API 管理入口。',
    errorCases: [{ condition: '密钥缺失/泄露、baseUrl 区域错误或每个请求重复创建实例', handling: '启动期验证配置并只在服务端创建单例；按环境隔离项目，关停时调用 shutdown。' }],
    relatedApis: ['LangfuseClient.flush', 'LangfuseClient.shutdown', 'PromptManager.get', 'ScoreManager.create'],
  },
  'LangfuseClient.flush': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'client score queue flush', required: false, description: '立即提交当前 Client 内尚未发送的评分批次，但不会冲刷 OpenTelemetry span 队列。' }],
    expectedOutput: 'Promise<void>；所有当前排队的 ScoreManager 事件完成一次发送尝试后解析，不返回评分对象。',
    errorCases: [{ condition: '每条 score 后都 flush 降低批处理吞吐，或误以为 trace spans 也已导出', handling: '只在短进程同步点使用；OTel 遥测另调用 LangfuseSpanProcessor.forceFlush。' }],
    relatedApis: ['ScoreManager.flush', 'LangfuseSpanProcessor.forceFlush', 'LangfuseClient.shutdown'],
  },
  'LangfuseClient.shutdown': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'graceful client shutdown', required: false, description: '清空评分队列并停止后台定时器，适合 SIGTERM、脚本结束和测试 teardown。' }],
    expectedOutput: 'Promise<void>；ScoreManager 排队数据完成发送尝试且 Client 后台资源关闭后解析。',
    errorCases: [{ condition: '热请求中关闭共享 Client，或平台在 flush 完成前强制退出', handling: '只在进程生命周期末调用一次，并为 SIGTERM 留出有上限的遥测上报窗口。' }],
    relatedApis: ['LangfuseClient.flush', 'ScoreManager.shutdown', 'LangfuseSpanProcessor.shutdown'],
  },
  'LangfuseClient.getTraceUrl': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: 'traceId', type: 'string', required: true, description: '要生成 Langfuse 控制台跳转链接的真实 trace 标识符。' }],
    expectedOutput: 'Promise<string>；返回指向当前项目中该 trace 详情页的 HTTPS 控制台地址。',
    errorCases: [{ condition: 'traceId 不存在或把内部诊断 URL 暴露给无权限终端用户', handling: '链接只写受控日志/内部告警，并继续依赖 Langfuse 项目访问控制。' }],
    relatedApis: ['createTraceId', 'getActiveTraceId', 'setActiveTraceAsPublic'],
  },
  'PromptManager.create': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'body.name', type: 'string', required: true, description: 'Prompt 的稳定名称，运行时按此名称和 label/version 解析。' },
      { name: 'body.type / prompt', type: '"text" | "chat" / template', required: true, description: '模板类型及不可变版本内容；聊天类型保留角色和消息顺序。' },
      { name: 'body.labels', type: 'string[]', required: false, defaultValue: '[]', description: '把新版本发布到 production、staging 等可移动部署通道。' },
      { name: 'body.config', type: 'Record<string, unknown>', required: false, defaultValue: '{}', description: '与该 Prompt 版本绑定的模型、温度或业务元配置。' },
    ], expectedOutput: 'Promise<TextPromptClient | ChatPromptClient>；同名创建会新增不可变版本，并返回可立即编译的客户端。',
    errorCases: [{ condition: '并发发布创建多个版本并争抢 production 标签，或误把 create 当幂等更新', handling: '发布流水线加锁并记录返回 version；先在 staging 评测，再通过 update 移动标签。' }],
    relatedApis: ['PromptManager.get', 'PromptManager.update', 'PromptManager.delete', 'TextPromptClient.compile'],
  },
  'PromptManager.get': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '要读取的 Prompt 稳定名称。' },
      { name: 'type', type: '"text" | "chat"', required: false, defaultValue: '"text"', description: '选择返回文本或聊天 PromptClient，必须与服务端版本类型一致。' },
      { name: 'version / label', type: 'number / string', required: false, defaultValue: 'production label', description: '锁定不可变版本以复现，或使用标签跟随部署通道。' },
      { name: 'cacheTtlSeconds', type: 'number', required: false, defaultValue: 'SDK default', description: '本地缓存有效期，在控制面可用性和 Prompt 更新时效之间取舍。' },
      { name: 'fallback', type: 'string | ChatMessage[]', required: false, description: '远端超时/失败时使用的兼容模板，变量合同必须一致。' },
    ], expectedOutput: 'Promise<PromptClient>；返回含 name、version、labels、config 与 isFallback 状态的缓存/远端 Prompt。',
    errorCases: [{ condition: '远端不可用长期静默使用 fallback，或 label 漂移让实验不可复现', handling: '监控 isFallback 和缓存命中；实验保存具体 version，生产明确使用受控 label。' }],
    relatedApis: ['PromptManager.create', 'PromptManager.update', 'TextPromptClient.compile', 'ChatPromptClient.compile'],
  },
  'PromptManager.update': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '目标 Prompt 名称。' },
      { name: 'version', type: 'number', required: true, description: '要晋级、回滚或重新标注的不可变版本号。' },
      { name: 'newLabels', type: 'string[]', required: true, description: '该版本更新后的完整标签集合，并非仅追加差异标签。' },
    ], expectedOutput: 'Promise<Prompt>；返回服务端标签更新后的版本元数据，Prompt 模板内容保持不变。',
    errorCases: [{ condition: '并发晋级覆盖标签或把 newLabels 误当追加操作', handling: '使用审批/发布锁并在更新后重新 get 校验 production 指向的精确版本。' }],
    relatedApis: ['PromptManager.get', 'PromptManager.create', 'PromptManager.delete'],
  },
  'PromptManager.delete': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '要删除并失效本地缓存的 Prompt 名称。' },
      { name: 'options.version / label', type: 'number / string', required: false, description: '限制删除具体版本或标签；全部省略可能删除该名称的所有版本。' },
    ], expectedOutput: 'Promise<void>；服务端删除匹配版本并清除该名称对应的 SDK 本地缓存。',
    errorCases: [{ condition: '未传筛选条件误删全部历史，破坏 trace 可复现性', handling: '生产二次确认并优先移除部署标签；保留审计和引用版本的实验记录。' }],
    relatedApis: ['PromptManager.create', 'PromptManager.get', 'PromptManager.update'],
  },
  'TextPromptClient.compile': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'variables', type: 'Record<string, string>', required: false, defaultValue: '{}', description: '替换 {{variable}} 占位符的请求级字符串数据。' },
      { name: 'required variable validation', type: 'application schema', required: true, description: '调用模型前由业务校验的必需变量集合和长度限制。' },
      { name: 'prompt version', type: 'client.version', required: true, description: '本次编译所依据的不可变 Prompt 版本，应关联到 generation。' },
    ], expectedOutput: '返回变量替换后的完整文本字符串；该方法只做模板渲染，不调用模型或自动验证事实。',
    errorCases: [{ condition: '变量缺失留下占位符、用户输入过长或敏感数据进入 trace', handling: '用 schema 校验变量和长度；观测时按隐私策略裁剪输入并记录 Prompt 版本。' }],
    relatedApis: ['PromptManager.get', 'TextPromptClient.getLangchainPrompt', 'TextPromptClient.toJSON', 'LangfuseGeneration'],
  },
  'TextPromptClient.getLangchainPrompt': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'template syntax adapter', required: false, description: '把当前版本 Mustache 变量语法转换成 LangChain PromptTemplate 使用的花括号格式。' }],
    expectedOutput: '返回适配 LangChain 的模板字符串，仍需由 PromptTemplate 传入变量并执行后续模型调用。',
    errorCases: [{ condition: '模板 JSON 花括号未正确转义或变量名与 LangChain 输入不一致', handling: '为转换结果建立快照和编译测试，升级两侧依赖时运行 Prompt 回归集。' }],
    relatedApis: ['TextPromptClient.compile', 'PromptManager.get', 'TextPromptClient.toJSON'],
  },
  'TextPromptClient.toJSON': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'prompt snapshot serialization', required: false, description: '序列化当前文本 Prompt 的模板、版本、标签和配置，不触发网络请求。' }],
    expectedOutput: '返回包含当前 Prompt 快照的 JSON 字符串，可用于审计和测试但可能包含内部系统指令。',
    errorCases: [{ condition: '完整 Prompt 快照写入公开日志，泄露系统指令或敏感示例', handling: '仅保存受控审计存储；日志优先记录 name/version 并对内容脱敏。' }],
    relatedApis: ['TextPromptClient.compile', 'ChatPromptClient.toJSON', 'PromptManager.get'],
  },
  'ChatPromptClient.compile': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'variables', type: 'Record<string, string>', required: false, defaultValue: '{}', description: '替换每条聊天消息内容里的 Mustache 变量。' },
      { name: 'placeholders', type: 'Record<string, unknown>', required: false, defaultValue: '{}', description: '把 history、few-shot 等消息占位块替换为实际消息序列。' },
      { name: 'message budget', type: 'application token policy', required: true, description: '业务对插入历史条数、token 和不可信内容设定的上限。' },
    ], expectedOutput: '返回按角色和顺序编译后的聊天消息数组，可交给模型 SDK；未解析占位对象需先处理。',
    errorCases: [{ condition: '动态历史无限增长、旧消息提示注入或 placeholder 未解析', handling: '裁剪/摘要历史并标记不可信内容；模型调用前验证最终消息结构和 token。' }],
    relatedApis: ['PromptManager.get', 'ChatPromptClient.getLangchainPrompt', 'ChatPromptClient.toJSON', 'LangfuseGeneration'],
  },
  'ChatPromptClient.getLangchainPrompt': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'options.placeholders', type: 'Record<string, unknown>', required: false, defaultValue: '{}', description: '在转换 LangChain 消息模板时解析指定动态消息占位块。' }],
    expectedOutput: '返回变量语法和消息形状适配后的 ChatMessage 模板数组，供 LangChain 继续组合。',
    errorCases: [{ condition: '角色/placeholder 形状与 LangChain 版本不兼容', handling: '对 system/user/assistant/tool 消息做契约测试，并锁定相关包兼容版本。' }],
    relatedApis: ['ChatPromptClient.compile', 'PromptManager.get', 'ChatPromptClient.toJSON'],
  },
  'ChatPromptClient.toJSON': {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'chat prompt snapshot serialization', required: false, description: '序列化当前聊天 Prompt 的消息、版本、标签和配置，不调用远端服务。' }],
    expectedOutput: '返回聊天 Prompt 快照 JSON 字符串，适合受控审计、实验快照或测试断言。',
    errorCases: [{ condition: '系统消息、内部示例或隐私数据被写入不受控日志', handling: '只记录 name/version 或脱敏快照，并设置最小访问权限和保留期。' }],
    relatedApis: ['ChatPromptClient.compile', 'TextPromptClient.toJSON', 'PromptManager.get'],
  },
  'DatasetManager.get': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '要读取的评测 Dataset 稳定名称。' },
      { name: 'options.fetchItemsPageSize', type: 'number', required: false, defaultValue: 'SDK default', description: '分页拉取 items 的单页大小，过大将增加 API 延迟和内存。' },
      { name: 'options.version', type: 'string', required: false, description: '锁定 Dataset 版本以保证实验可复现，省略时可能随内容更新。' },
    ], expectedOutput: 'Promise<FetchedDataset>；返回数据集元数据、items、版本信息以及运行 Experiment 的便捷方法。',
    errorCases: [{ condition: '未锁版本导致基线漂移，或一次加载过大 Dataset', handling: '回归实验保存 datasetVersion；按合理页大小读取并在离线 worker 运行。' }],
    relatedApis: ['DatasetManager.createItem', 'FetchedDataset.runExperiment', 'RunnerContext'],
  },
  'DatasetManager.createItem': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'request.datasetName', type: 'string', required: true, description: '目标 Dataset 名称，必须与实验治理中的稳定名称一致。' },
      { name: 'request.input', type: 'unknown', required: true, description: '评测任务的结构化输入，应符合 task 函数预期合同。' },
      { name: 'request.expectedOutput', type: 'unknown', required: false, description: '可选参考答案或期望结构，供 evaluator 计算质量。' },
      { name: 'request.id / metadata', type: 'string / object', required: false, description: '稳定样本 ID 与切片元数据，用于幂等同步和分群分析。' },
    ], expectedOutput: 'Promise<DatasetItem>；返回服务端创建或更新后的样本对象及其稳定标识和元数据。',
    errorCases: [{ condition: '重复导入产生多份样本、输入含敏感生产数据或 schema 漂移', handling: '使用稳定 item id 和脱敏流水线；版本化数据合同并在导入前校验。' }],
    relatedApis: ['DatasetManager.get', 'FetchedDataset.items[].link', 'FetchedDataset.runExperiment'],
  },
  'FetchedDataset.items[].link': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'otelSpan', type: 'Span', required: true, description: '本次处理该 Dataset item 的 OpenTelemetry span，用于绑定实验观测。' },
      { name: 'runName', type: 'string', required: true, description: '实验运行名称，通常包含候选版本或配置。' },
      { name: 'runArgs', type: 'DatasetRunItemCreate | undefined', required: false, description: '可选描述、metadata 和 run 级附加信息。' },
    ], expectedOutput: 'Promise<DatasetRunItem>；建立 Dataset item、实验 run 与具体 OTel span 的可追溯关联。',
    errorCases: [{ condition: 'span 已结束/未由 Langfuse provider 导出，或重复链接同一运行', handling: '在 task span 生命周期内链接；使用稳定 runName/item id 并验证导出链路。' }],
    relatedApis: ['startObservation', 'FetchedDataset.runExperiment', 'RunnerContext.runExperiment'],
  },
  'FetchedDataset.runExperiment': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'params.name', type: 'string', required: true, description: '实验运行名称，应表达模型、Prompt 或代码候选版本。' },
      { name: 'params.task', type: '(item) => output', required: true, description: '对每个 Dataset item 执行的被测任务函数。' },
      { name: 'params.evaluators', type: 'Evaluator[]', required: false, defaultValue: '[]', description: '对 task 输出计算质量分数、原因或结构检查的评估器。' },
      { name: 'params.maxConcurrency', type: 'number', required: false, description: '并行样本上限，用于控制模型速率、成本和下游容量。' },
    ], expectedOutput: 'Promise<ExperimentResult>；包含逐样本输出、evaluator 分数、运行元数据和聚合统计。',
    errorCases: [{ condition: '并发过高触发限流、task 非确定副作用或部分样本失败中止', handling: '使用只读/幂等 task，限制并发和成本；保留逐项错误并允许安全重跑失败项。' }],
    relatedApis: ['ExperimentManager.run', 'ExperimentResult.format', 'createEvaluatorFromAutoevals', 'RegressionError'],
  },
  'ExperimentManager.run': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'config.data', type: 'Dataset | Array<Input>', required: true, description: '实验输入数据集或内存样本列表。' },
      { name: 'config.task', type: 'ExperimentTask', required: true, description: '被测模型/链/检索流程，返回每个输入的实际结果。' },
      { name: 'config.evaluators', type: 'Evaluator[]', required: false, defaultValue: '[]', description: '质量、格式、成本或自定义规则评估器集合。' },
      { name: 'config.name / metadata', type: 'string / object', required: true, description: '稳定实验名以及模型、Prompt、代码 commit 等可复现元数据。' },
    ], expectedOutput: 'Promise<ExperimentResult>；运行数据、task 与 evaluators 后返回可聚合、格式化并用于回归门禁的结果。',
    errorCases: [{ condition: '候选与基线数据/Prompt 不一致，或 evaluator 自身不稳定', handling: '固定 Dataset/Prompt/model 版本；校准 evaluator 并把统计显著性与人工抽样结合。' }],
    relatedApis: ['FetchedDataset.runExperiment', 'RunnerContext.runExperiment', 'ExperimentResult.format', 'RegressionError'],
  },
  'ExperimentResult.format': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'options.includeItemResults', type: 'boolean', required: false, defaultValue: 'false', description: '是否在格式化摘要中包含每个样本的详细输入、输出和评分结果。' }],
    expectedOutput: 'Promise<string>；返回适合终端、CI 日志或评审报告的人类可读实验摘要文本。',
    errorCases: [{ condition: '包含 item 详情导致日志过大或泄露测试数据隐私', handling: 'CI 默认只输出聚合；详细结果存受控 Langfuse 项目并按需脱敏查看。' }],
    relatedApis: ['ExperimentManager.run', 'FetchedDataset.runExperiment', 'RegressionError'],
  },
  createEvaluatorFromAutoevals: {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'autoevalEvaluator', type: 'AutoEvals evaluator', required: true, description: '来自 autoevals 的具体评分器，例如事实性、相关性或 JSON 校验。' },
      { name: 'params', type: 'EvaluatorAdapterOptions', required: false, defaultValue: '{}', description: '字段映射、名称或适配配置，使 Langfuse item/task 输出满足评分器输入。' },
    ], expectedOutput: '返回 Langfuse Experiment 可直接调用的 Evaluator 函数，并把 autoevals 结果规范化为评分。',
    errorCases: [{ condition: '字段映射错误、评估模型不可用或 LLM-as-judge 偏差', handling: '用少量人工标注集校准；记录 judge 模型/Prompt 版本并为失败返回可解释结果。' }],
    relatedApis: ['ExperimentManager.run', 'FetchedDataset.runExperiment', 'ScoreManager.create'],
  },
  RunnerContext: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'client', type: 'LangfuseClient', required: true, description: '用于 Dataset、Experiment 和 Score 控制面的共享客户端。' },
      { name: 'data', type: 'Dataset | unknown[]', required: false, description: 'Runner 默认实验数据，调用 runExperiment 时可复用。' },
      { name: 'datasetVersion', type: 'string', required: false, description: '固定回归集版本，避免实验期间样本集合漂移。' },
      { name: 'metadata', type: 'Record<string, unknown>', required: false, defaultValue: '{}', description: '应用、commit、模型和 Prompt 版本等运行上下文。' },
    ], expectedOutput: '返回保存公共 client/data/version/metadata 的实验运行上下文，可反复启动可比较实验。',
    errorCases: [{ condition: '跨并发实验复用可变 metadata/data，导致运行污染', handling: '上下文按候选配置不可变创建；每次运行使用独立 name 和稳定版本信息。' }],
    relatedApis: ['RunnerContext.runExperiment', 'ExperimentManager.run', 'DatasetManager.get'],
  },
  'RunnerContext.runExperiment': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'params.name', type: 'string', required: true, description: '在共享 RunnerContext 下本次候选实验的唯一名称。' },
      { name: 'params.task', type: 'ExperimentTask', required: true, description: '对 context data 执行的候选实现。' },
      { name: 'params.evaluators', type: 'Evaluator[]', required: false, defaultValue: '[]', description: '逐项或运行级质量评估器。' },
      { name: 'params.maxConcurrency', type: 'number', required: false, description: '覆盖本次运行并发预算，保护模型限流和成本。' },
    ], expectedOutput: 'Promise<ExperimentResult>；自动复用 RunnerContext 的数据版本和元数据完成实验。',
    errorCases: [{ condition: '同名并发运行难区分、task 超时或 evaluator 部分失败', handling: '名称加入候选版本；设置任务超时/并发，并保留逐项错误供有限重跑。' }],
    relatedApis: ['RunnerContext', 'ExperimentManager.run', 'ExperimentResult.format'],
  },
  RegressionError: {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'result', type: 'ExperimentResult', required: true, description: '未达到质量门槛的完整实验结果。' },
      { name: 'metric', type: 'string', required: false, description: '发生回归的具体评分指标名称。' },
      { name: 'value / threshold', type: 'number', required: false, description: '实际聚合值与 CI/发布允许的最低或最高阈值。' },
      { name: 'message', type: 'string', required: false, description: '给开发者解释失败候选、切片和恢复建议的信息。' },
    ], expectedOutput: '构造带 ExperimentResult 和可选指标上下文的 Error，可抛出以阻断 CI 或发布。',
    errorCases: [{ condition: '单次噪声样本误判回归，或阈值没有版本/基线依据', handling: '使用足够样本和稳定基线；报告分布、切片及置信度，再决定自动阻断。' }],
    relatedApis: ['ExperimentManager.run', 'ExperimentResult.format', 'RunnerContext.runExperiment'],
  },
  'ScoreManager.create': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'data.name', type: 'string', required: true, description: '评分指标名称，应使用稳定词表，例如 faithfulness、latency-slo。' },
      { name: 'data.value', type: 'number | string', required: true, description: '数值、布尔/分类评分值，必须符合 Langfuse 中对应 score config。' },
      { name: 'data.traceId / observationId', type: 'string', required: true, description: '把质量信号精确关联到整条 Trace 或某个 Span/Generation。' },
      { name: 'data.comment / metadata', type: 'string / object', required: false, description: '解释评分来源、理由、评估器版本和人工反馈上下文。' },
    ], expectedOutput: '无同步业务返回；Score 进入 Client 批量队列，稍后发送，可通过 flush/shutdown 强制收口。',
    errorCases: [{ condition: '关联 ID 错误、评分量纲不一致或短进程退出前未发送', handling: '统一 score config 和关联键；记录 evaluator 版本，并在脚本末 flush/shutdown。' }],
    relatedApis: ['ScoreManager.observation', 'ScoreManager.trace', 'ScoreManager.flush', 'LangfuseClient.flush'],
  },
  'ScoreManager.observation': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'context.otelSpan', type: 'Span', required: true, description: '要评分的具体 OpenTelemetry observation span。' },
      { name: 'data.name', type: 'string', required: true, description: '稳定的 observation 级质量指标名。' },
      { name: 'data.value', type: 'number | string', required: true, description: '对该检索、模型或工具步骤计算的分值/分类。' },
      { name: 'data.comment', type: 'string', required: false, description: '评分理由或评估器输出摘要，需避免记录敏感原文。' },
    ], expectedOutput: '无同步业务返回；从 otelSpan 提取 observation 关联信息，并把评分加入异步批量队列。',
    errorCases: [{ condition: 'span 不是 Langfuse 导出的 observation 或已丢失上下文', handling: '在 span 生命周期内评分；验证 provider/processor 装配并记录无法关联的指标。' }],
    relatedApis: ['ScoreManager.create', 'ScoreManager.activeObservation', 'LangfuseObservation.update'],
  },
  'ScoreManager.trace': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'context.otelSpan', type: 'Span', required: true, description: '属于目标 Trace 的任意有效 Langfuse OTel span。' },
      { name: 'data.name', type: 'string', required: true, description: '端到端质量指标名称，例如 user-rating 或 task-success。' },
      { name: 'data.value', type: 'number | string', required: true, description: '应用于整条 Trace 的评分值。' },
      { name: 'data.comment', type: 'string', required: false, description: '人工反馈或端到端 evaluator 的精简理由。' },
    ], expectedOutput: '无同步业务返回；从 span 上下文解析 traceId，并排队创建 Trace 级评分。',
    errorCases: [{ condition: '用子步骤局部信号冒充端到端评分，或 trace 上下文跨请求串线', handling: '明确 observation/trace 量级；使用 AsyncLocalStorage/OTel context 正确传播。' }],
    relatedApis: ['ScoreManager.create', 'ScoreManager.activeTrace', 'getActiveTraceId'],
  },
  'ScoreManager.activeObservation': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'data.name', type: 'string', required: true, description: '当前 active observation 的评分指标名。' },
      { name: 'data.value', type: 'number | string', required: true, description: '当前步骤的评分值或分类标签。' },
      { name: 'data.comment', type: 'string', required: false, description: '评分理由、来源和 evaluator 版本的脱敏说明。' },
    ], expectedOutput: '无同步业务返回；自动从当前 OTel context 找到 active observation 并排队评分。',
    errorCases: [{ condition: '异步边界丢失 active span，评分无法关联或关联到父步骤', handling: '在 observe/startActiveObservation 回调内调用，并对缺失 context 做日志和测试。' }],
    relatedApis: ['ScoreManager.observation', 'ScoreManager.activeTrace', 'getActiveSpanId'],
  },
  'ScoreManager.activeTrace': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'data.name', type: 'string', required: true, description: '当前 active trace 的端到端评分指标名。' },
      { name: 'data.value', type: 'number | string', required: true, description: '用户反馈、业务成功或整体质量的数值/分类。' },
      { name: 'data.comment', type: 'string', required: false, description: '对评分原因和来源的脱敏解释。' },
    ], expectedOutput: '无同步业务返回；从当前 OTel context 解析 Trace 并把评分写入异步队列。',
    errorCases: [{ condition: '在没有 active trace 的后台回调调用，或异步上下文串到其他请求', handling: '显式传 traceId 使用 create，或确保 context 绑定和并发隔离测试通过。' }],
    relatedApis: ['ScoreManager.trace', 'ScoreManager.activeObservation', 'getActiveTraceId'],
  },
  'ScoreManager.flush': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'score queue flush', required: false, description: '立即发送当前 ScoreManager 内存队列中的评分批次，不等待定时器。' }],
    expectedOutput: 'Promise<void>；当前排队评分完成一次网络发送尝试后解析，不保证 OTel span 同时完成导出。',
    errorCases: [{ condition: '每次评分都 flush 破坏批处理，或网络失败后进程立即退出', handling: '仅在短任务/测试同步点调用；为退出留重试窗口并监控上报错误。' }],
    relatedApis: ['ScoreManager.create', 'LangfuseClient.flush', 'ScoreManager.shutdown'],
  },
  'ScoreManager.shutdown': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'score manager shutdown', required: false, description: '先 flush 评分队列，再停止 ScoreManager 定时器和后台处理。' }],
    expectedOutput: 'Promise<void>；所有当前评分完成发送尝试且管理器关闭后解析，关闭后不应继续复用。',
    errorCases: [{ condition: '请求路径误关闭共享管理器，或 SIGKILL 早于 shutdown 完成', handling: '只在进程 teardown 调用一次，并配置平台优雅退出时限。' }],
    relatedApis: ['ScoreManager.flush', 'LangfuseClient.shutdown', 'LangfuseSpanProcessor.shutdown'],
  },
  'MediaManager.resolveReferences': {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'obj', type: 'T', required: true, description: '可能递归包含 Langfuse media reference 的任意对象。' },
      { name: 'resolveWith', type: '"base64DataUri"', required: true, description: '把引用解析为可直接消费的 base64 Data URI。' },
      { name: 'maxDepth', type: 'number', required: false, defaultValue: 'SDK default', description: '限制递归解析层数，防止深对象造成过多请求和内存。' },
    ], expectedOutput: 'Promise<T>；返回结构相同但媒体引用已替换为 Data URI 的新对象。',
    errorCases: [{ condition: '大媒体 base64 放大内存、未授权引用或递归对象过深', handling: '限制尺寸/depth 和来源权限；大文件优先使用受控 URL/对象存储而非内联。' }],
    relatedApis: ['LangfuseClient', 'LangfuseObservation.update', 'LangfuseGeneration'],
  },
  startObservation: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '稳定、低基数的 observation 名称，例如 retrieve-context 或 call-model。' },
      { name: 'attributes', type: 'LangfuseObservationAttributes', required: false, defaultValue: '{}', description: '输入、输出、metadata、model、usage、level 等观测字段，须遵循隐私采集策略。' },
      { name: 'options.asType', type: 'ObservationType', required: false, defaultValue: '"span"', description: '将 observation 语义标记为 generation、tool、retriever、agent 等类型。' },
      { name: 'options.parentSpanContext', type: 'SpanContext', required: false, description: '显式指定父级，跨队列/进程传播时用于连接调用链。' },
    ], expectedOutput: '返回对应类型的 LangfuseObservation；它不会自动结束，调用方必须 update 并 end。',
    errorCases: [{ condition: '忘记 end 产生悬空 span，或 attributes 记录完整敏感 Prompt/输出', handling: '用 try/finally 结束；默认脱敏/采样并只记录排障所需字段。' }],
    relatedApis: ['startActiveObservation', 'observe', 'LangfuseObservation.update', 'LangfuseObservation.end'],
  },
  startActiveObservation: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '成为回调期间 active OTel context 的 observation 名称。' },
      { name: 'fn', type: '(observation) => T', required: true, description: '在 active span 上下文中执行的同步或异步业务回调。' },
      { name: 'options.asType', type: 'ObservationType', required: false, defaultValue: '"span"', description: '为该 active observation 指定 generation、tool、chain 等语义类型。' },
      { name: 'options.endOnExit', type: 'boolean', required: false, defaultValue: 'true', description: '回调成功或抛错退出时是否自动结束 observation。' },
    ], expectedOutput: '返回 fn 的同步值或 Promise；执行期间 getActiveTraceId/SpanId 和 active 更新函数可用。',
    errorCases: [{ condition: '异步上下文被未绑定回调切断，或 endOnExit:false 后忘记结束', handling: '在受支持 async context 中运行；手动模式保存 observation 并在 finally end。' }],
    relatedApis: ['startObservation', 'updateActiveObservation', 'getActiveTraceId', 'getActiveSpanId'],
  },
  observe: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'fn', type: 'T extends Function', required: true, description: '要自动创建 observation、捕获异常并记录输入输出的函数。' },
      { name: 'options.name', type: 'string', required: false, defaultValue: '函数名', description: 'Trace 中稳定可读的 observation 名称。' },
      { name: 'options.asType', type: 'ObservationType', required: false, defaultValue: '"span"', description: '函数属于 generation、tool、retriever 等哪类 AI 操作。' },
      { name: 'options.captureInput / captureOutput', type: 'boolean', required: false, defaultValue: '环境配置', description: '是否采集参数和返回值；处理隐私数据时应关闭或预先脱敏。' },
    ], expectedOutput: '返回保持原函数参数和返回类型的包装函数；每次调用自动创建、激活并结束 observation。',
    errorCases: [{ condition: '高频函数全量采集造成成本/隐私风险，或包装改变 this 绑定', handling: '只观测关键边界并配置采样/脱敏；为方法绑定和异常路径写回归测试。' }],
    relatedApis: ['startActiveObservation', 'updateActiveObservation', 'propagateAttributes', 'LangfuseObservation.end'],
  },
  updateActiveObservation: {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'attributes', type: 'LangfuseObservationAttributes', required: true, description: '合并到当前 active observation 的输入、输出、metadata、usage 或状态字段。' },
      { name: 'options.asType', type: 'ObservationType', required: false, description: '帮助选择与 active observation 类型匹配的属性合同。' },
    ], expectedOutput: '无返回值；更新当前 OTel context 中的 Langfuse observation，不会创建或结束新 span。',
    errorCases: [{ condition: '没有 active observation 时静默无关联，或并发上下文串线', handling: '只在 observe/startActiveObservation 回调内调用，并用并发测试验证 context 隔离。' }],
    relatedApis: ['startActiveObservation', 'setActiveTraceIO', 'LangfuseObservation.update'],
  },
  setActiveTraceIO: {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'input', type: 'unknown', required: false, description: '整条 Trace 的入口业务输入，必须先执行字段裁剪和隐私脱敏。' },
      { name: 'output', type: 'unknown', required: false, description: '整条 Trace 的最终业务输出，不等于某个子 generation 的原始文本。' },
    ], expectedOutput: '无返回值；把 input/output 写到当前 active Trace 根上下文，便于端到端查看和评测。',
    errorCases: [{ condition: '在无 active trace 环境调用，或记录密码、个人数据和完整文档', handling: '在请求根 observation 内调用；建立字段白名单、哈希/脱敏与按环境采样。' }],
    relatedApis: ['startActiveObservation', 'updateActiveObservation', 'setActiveTraceAsPublic'],
  },
  setActiveTraceAsPublic: {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'active trace visibility mutation', required: false, description: '把当前 active Trace 标记为可通过公共链接访问，属于高风险可见性变更。' }],
    expectedOutput: '无返回值；当前 Trace 会带 public 标记，但是否真正可访问仍由 Langfuse 项目策略决定。',
    errorCases: [{ condition: '包含 Prompt、用户输入或工具结果的敏感 Trace 被意外公开', handling: '默认保持私有；公开前做内容审查、授权和过期策略，生产禁止自动调用。' }],
    relatedApis: ['setActiveTraceIO', 'LangfuseClient.getTraceUrl', 'getActiveTraceId'],
  },
  propagateAttributes: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'params', type: 'PropagateAttributesParams', required: true, description: '要传播给回调内后代 observations 的 userId、sessionId、tags、metadata 等 Trace 属性。' },
      { name: 'fn', type: '() => T', required: true, description: '在属性传播上下文中执行的同步或异步回调。' },
      { name: 'privacy policy', type: 'application context policy', required: true, description: '规定哪些用户/会话字段可进入遥测及其哈希、保留和访问方式。' },
    ], expectedOutput: '返回 fn 的原始值或 Promise；回调中新建的 observation 自动继承允许传播的 Trace 属性。',
    errorCases: [{ condition: 'userId/sessionId 在异步任务间串线，或传播高基数/隐私 metadata', handling: '每个请求创建独立上下文；字段白名单、稳定哈希，并限制 tags/metadata 基数。' }],
    relatedApis: ['observe', 'startActiveObservation', 'setActiveTraceIO'],
  },
  createTraceId: {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'seed', type: 'string', required: false, description: '可选稳定种子；相同种子可得到可预测 Trace ID，用于跨系统预关联。' }],
    expectedOutput: 'Promise<string>；返回符合 OpenTelemetry trace-id 形状的 32 位十六进制标识。',
    errorCases: [{ condition: '低熵可猜 seed 泄露业务标识，或同一 seed 误用于多个独立请求', handling: '默认使用随机 ID；需要确定性时对稳定业务键加服务端命名空间/哈希。' }],
    relatedApis: ['getActiveTraceId', 'LangfuseClient.getTraceUrl', 'startObservation'],
  },
  getActiveTraceId: {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'active OTel context read', required: false, description: '从当前异步 OpenTelemetry 上下文读取正在执行的 Trace ID。' }],
    expectedOutput: '返回 string 或 undefined；没有 active span/context 时不会自动创建新的 Trace。',
    errorCases: [{ condition: '后台回调上下文已丢失却强制断言非空', handling: '显式处理 undefined；跨进程通过标准 trace context 传播而非全局变量。' }],
    relatedApis: ['getActiveSpanId', 'createTraceId', 'startActiveObservation'],
  },
  getActiveSpanId: {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'active OTel context read', required: false, description: '从当前异步 OpenTelemetry 上下文读取 active observation 的 Span ID。' }],
    expectedOutput: '返回 string 或 undefined；用于日志关联，不改变当前 observation 生命周期。',
    errorCases: [{ condition: '异步边界丢失 context 或把 Span ID 当权限凭证', handling: '使用 OTel propagator/AsyncLocalStorage；ID 只用于关联，资源访问仍需鉴权。' }],
    relatedApis: ['getActiveTraceId', 'startActiveObservation', 'updateActiveObservation'],
  },
  getLangfuseTracer: {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'configured tracer read', required: false, description: '读取当前全局 Langfuse/OpenTelemetry Tracer，供底层手工 span 集成使用。' }],
    expectedOutput: '返回 OpenTelemetry Tracer；新建 span 是否导出取决于当前 TracerProvider 与 SpanProcessor 装配。',
    errorCases: [{ condition: 'provider 尚未配置就创建 spans，数据只进入 no-op tracer', handling: '应用启动最早阶段装配 provider/processor，并在 readiness 做最小导出验证。' }],
    relatedApis: ['getLangfuseTracerProvider', 'setLangfuseTracerProvider', 'LangfuseSpanProcessor'],
  },
  getLangfuseTracerProvider: {
    learningLevel: 'reference', runtime: 'server', parameters: [{ name: '无显式参数', type: 'global tracer provider read', required: false, description: '读取当前 Langfuse tracing 使用的全局 OpenTelemetry TracerProvider。' }],
    expectedOutput: '返回 TracerProvider；可用于 forceFlush/shutdown 或诊断当前导出装配。',
    errorCases: [{ condition: '误关闭由其他框架共享的 provider，导致全应用遥测中断', handling: '明确 provider 所有权；只在应用统一生命周期组件中 flush/shutdown。' }],
    relatedApis: ['setLangfuseTracerProvider', 'getLangfuseTracer', 'LangfuseSpanProcessor.shutdown'],
  },
  setLangfuseTracerProvider: {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: 'provider', type: 'TracerProvider | null', required: true, description: '设置自定义 OTel provider；传 null 恢复/清除显式覆盖，影响后续 tracing。' }],
    expectedOutput: '无返回值；更新 Langfuse tracing 获取 Tracer 的 provider 来源，不会迁移已创建的 spans。',
    errorCases: [{ condition: '请求并发期间替换 provider，或新 provider 未装配 LangfuseSpanProcessor', handling: '仅在启动/测试隔离阶段设置；写 smoke trace 验证 exporter，并统一关停旧 provider。' }],
    relatedApis: ['getLangfuseTracerProvider', 'getLangfuseTracer', 'LangfuseSpanProcessor'],
  },
  LangfuseSpan: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '通用业务步骤的稳定名称，例如 authorize-request 或 assemble-context。' },
      { name: 'attributes.input / output', type: 'unknown', required: false, description: '步骤输入和输出的脱敏摘要，而不是默认复制完整业务对象。' },
      { name: 'attributes.metadata', type: 'Record<string, unknown>', required: false, description: '版本、缓存命中、重试等低基数诊断信息。' },
      { name: 'lifecycle', type: 'update + end', required: true, description: '创建后必须在成功和异常路径更新结果并结束。' },
    ], expectedOutput: 'startObservation 返回的通用 LangfuseSpan，可继续 update、记录状态并显式 end。',
    errorCases: [{ condition: 'span 悬空、嵌套关系错误或输入输出过度采集', handling: 'try/finally end；使用 active context 建父子关系，并实施采样和字段白名单。' }],
    relatedApis: ['startObservation', 'LangfuseObservation.update', 'LangfuseObservation.end', 'LangfuseGeneration'],
  },
  LangfuseGeneration: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '模型生成步骤名称，例如 interview-feedback-generation。' },
      { name: 'generationAttributes.model / modelParameters', type: 'string / object', required: true, description: '真实模型标识和温度、maxTokens 等影响结果的参数。' },
      { name: 'generationAttributes.input / output', type: 'unknown', required: false, description: '模型输入和输出；按隐私规则脱敏、截断或完全禁用采集。' },
      { name: 'generationAttributes.usageDetails / costDetails', type: 'Record<string, number>', required: false, description: '输入输出 token、缓存 token 和成本明细。' },
      { name: 'generationAttributes.prompt', type: 'PromptClient', required: false, description: '关联 Langfuse Prompt name/version，支持按版本比较质量与成本。' },
    ], expectedOutput: '返回 LangfuseGeneration observation，用于记录模型延迟、输入输出、usage、成本和 Prompt 版本。',
    errorCases: [{ condition: 'usage 单位/模型名错误使成本失真，或记录原始 Prompt 泄露隐私', handling: '从 Provider 响应标准化 usage/model；按租户策略脱敏并配置采样。' }],
    relatedApis: ['startObservation', 'PromptManager.get', 'LangfuseObservation.update', 'LangfuseObservation.end'],
  },
  LangfuseEvent: {
    learningLevel: 'reference', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '瞬时事件的稳定名称，例如 cache-hit 或 user-cancelled。' },
      { name: 'attributes', type: 'LangfuseObservationAttributes', required: false, defaultValue: '{}', description: '事件发生时的脱敏 metadata、level 和状态摘要。' },
    ], expectedOutput: '返回 event 类型 observation，表示瞬时事实而非长耗时区间，仍可显式结束。',
    errorCases: [{ condition: '把高频日志逐条建 Event 造成遥测成本和噪声', handling: '只记录对调用链解释有价值的离散事件，并应用采样/聚合。' }],
    relatedApis: ['startObservation', 'LangfuseSpan', 'LangfuseObservation.end'],
  },
  LangfuseAgent: {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: 'Agent 运行或决策循环的稳定名称。' },
      { name: 'attributes.metadata', type: 'Record<string, unknown>', required: false, description: 'agent 版本、最大步数、终止原因和预算等诊断信息。' },
    ], expectedOutput: '返回 agent 类型 observation，用于包裹多个 Generation、Tool 与 Retriever 子 observation。',
    errorCases: [{ condition: 'Agent 循环无限增长产生过深 Trace 或记录完整内部推理', handling: '设置步数/成本上限；只记录决策摘要和工具事实，不暴露敏感 chain-of-thought。' }],
    relatedApis: ['LangfuseGeneration', 'LangfuseTool', 'LangfuseRetriever', 'LangfuseChain'],
  },
  LangfuseTool: {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '工具业务能力名称，不应泄露内部路由或密钥。' },
      { name: 'attributes.input / output', type: 'unknown', required: false, description: '经过参数裁剪的工具输入和结果摘要。' },
    ], expectedOutput: '返回 tool 类型 observation，用于衡量外部调用耗时、失败、重试及其对 Agent 的贡献。',
    errorCases: [{ condition: '日志记录授权 token/完整数据库结果，或工具重试未区分 attempt', handling: '字段白名单和脱敏；metadata 记录 attempt/错误分类并保持副作用幂等。' }],
    relatedApis: ['LangfuseAgent', 'LangfuseSpan', 'LangfuseObservation.update'],
  },
  LangfuseChain: {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '多步骤 Chain/Workflow 阶段的稳定名称。' },
      { name: 'attributes.metadata', type: 'Record<string, unknown>', required: false, description: 'workflow 版本、分支和重试等低基数运行信息。' },
    ], expectedOutput: '返回 chain 类型 observation，作为多个模型、检索和工具步骤的父级范围。',
    errorCases: [{ condition: '把整个应用都塞进一个 Chain，失去可定位的子步骤', handling: '按可测试责任拆分子 observations，并保持名称在版本间稳定。' }],
    relatedApis: ['LangfuseSpan', 'LangfuseAgent', 'LangfuseGeneration', 'LangfuseRetriever'],
  },
  LangfuseRetriever: {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '检索阶段名称，例如 hybrid-retrieval 或 rerank-candidates。' },
      { name: 'attributes.input / output', type: 'unknown', required: false, description: '脱敏查询和文档 ID/score 摘要，避免默认上传完整文档正文。' },
    ], expectedOutput: '返回 retriever 类型 observation，用于分析召回延迟、候选数量、相关性和后续生成质量。',
    errorCases: [{ condition: '完整私有文档进入遥测或只看生成分数无法定位召回问题', handling: '记录文档 ID/分数/索引版本；正文哈希或脱敏，并配套 retrieval evaluator。' }],
    relatedApis: ['LangfuseGeneration', 'LangfuseEvaluator', 'LangfuseChain'],
  },
  LangfuseEvaluator: {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '评估步骤名称和 evaluator 版本标识。' },
      { name: 'attributes.metadata', type: 'Record<string, unknown>', required: false, description: 'judge 模型、rubric、阈值和校准集等信息。' },
    ], expectedOutput: '返回 evaluator 类型 observation，记录质量评估本身的延迟、成本、输入和结果。',
    errorCases: [{ condition: 'LLM judge 输出当绝对真相，或评估自身成本未被观测', handling: '保存 evaluator 版本并用人工标注校准；对评估失败单独分类。' }],
    relatedApis: ['ScoreManager.create', 'createEvaluatorFromAutoevals', 'LangfuseRetriever'],
  },
  LangfuseGuardrail: {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: '安全、隐私或内容规则检查名称。' },
      { name: 'attributes.output / metadata', type: 'unknown / object', required: false, description: '允许/拦截结论、规则版本和脱敏原因。' },
    ], expectedOutput: '返回 guardrail 类型 observation，用于定位拦截率、误报、耗时及规则版本。',
    errorCases: [{ condition: '把原始敏感文本写进安全观测，或 guardrail 故障默认放行', handling: '仅记录分类/哈希；按风险选择 fail-closed，并监控规则不可用率。' }],
    relatedApis: ['LangfuseSpan', 'LangfuseEvaluator', 'ScoreManager.observation'],
  },
  LangfuseEmbedding: {
    learningLevel: 'advanced', runtime: 'server', parameters: [
      { name: 'name', type: 'string', required: true, description: 'Embedding 调用阶段名称。' },
      { name: 'attributes.model / usageDetails', type: 'string / object', required: true, description: '向量模型版本、输入 token 和批量大小等成本信息。' },
      { name: 'attributes.input', type: 'unknown', required: false, description: '默认只记录数量、长度、哈希或脱敏摘要，避免私有文档泄露。' },
    ], expectedOutput: '返回 embedding 类型 observation，用于分析向量化吞吐、延迟、模型版本和成本。',
    errorCases: [{ condition: '模型升级后维度变化未记录，或批量原文进入 trace', handling: 'metadata 记录模型/维度/索引版本；输入使用统计摘要并严格脱敏。' }],
    relatedApis: ['LangfuseRetriever', 'LangfuseSpan', 'LangfuseObservation.update'],
  },
  'LangfuseObservation.update': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'attributes.input / output', type: 'unknown', required: false, description: '追加或覆盖 observation 的脱敏输入输出信息。' },
      { name: 'attributes.metadata', type: 'Record<string, unknown>', required: false, description: '状态、版本、usage、错误分类等可检索上下文。' },
      { name: 'attributes.level / statusMessage', type: 'ObservationLevel / string', required: false, description: '标记错误/警告级别并提供可操作的脱敏状态说明。' },
    ], expectedOutput: '返回同一个 observation 以便链式更新；不会自动结束或立即强制导出 span。',
    errorCases: [{ condition: '多次更新覆盖关键字段、对象不可序列化或包含敏感数据', handling: '在边界标准化字段并维护单一所有者；循环引用改为 ID/摘要。' }],
    relatedApis: ['LangfuseObservation.end', 'updateActiveObservation', 'LangfuseSpan'],
  },
  'LangfuseObservation.end': {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'endTime', type: 'TimeInput', required: false, defaultValue: '当前时间', description: '可选显式结束时间，用于回放已发生事件或非实时观测。' },
      { name: 'final update', type: 'LangfuseObservation.update', required: true, description: '结束前写入最终 output、usage、错误或状态的调用约定。' },
      { name: 'finally path', type: 'application lifecycle', required: true, description: '确保成功、抛错和取消路径都执行一次 end。' },
    ], expectedOutput: '无返回值；结束底层 OTel span，使其进入 SpanProcessor 批量导出流程。',
    errorCases: [{ condition: '重复结束、异常路径遗漏或 endTime 早于 startTime', handling: '统一 try/catch/finally；先 update 错误再 end，并校验回放时间顺序。' }],
    relatedApis: ['LangfuseObservation.update', 'startObservation', 'LangfuseSpanProcessor.forceFlush'],
  },
  LangfuseSpanProcessor: {
    learningLevel: 'core', runtime: 'server', parameters: [
      { name: 'params.publicKey / secretKey', type: 'string', required: true, description: 'Langfuse OTel 导出的项目凭据，只允许服务端使用。' },
      { name: 'params.baseUrl', type: 'string', required: false, defaultValue: 'Langfuse Cloud URL', description: 'Trace 导出端点，必须匹配项目区域/自托管地址。' },
      { name: 'params.environment / release', type: 'string', required: false, description: '附加到 spans 的环境与发布版本。' },
      { name: 'params.sampleRate', type: 'number', required: false, defaultValue: '1', description: '0 到 1 的 Trace 采样比例，平衡可见性、成本与隐私风险。' },
    ], expectedOutput: '返回 OpenTelemetry SpanProcessor，把结束的 Langfuse spans 批量转换并导出到目标项目。',
    errorCases: [{ condition: '未注册到 provider、密钥/区域错误、采样过高导致成本或隐私风险', handling: '启动期发送 smoke trace；按环境配置采样和脱敏，并监控导出失败/队列丢弃。' }],
    relatedApis: ['getLangfuseTracerProvider', 'setLangfuseTracerProvider', 'LangfuseSpanProcessor.forceFlush', 'LangfuseSpanProcessor.shutdown'],
  },
  'LangfuseSpanProcessor.forceFlush': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'OpenTelemetry batch flush', required: false, description: '立即等待当前处理器队列中的已结束 spans 完成导出，不处理 Client score 队列。' }],
    expectedOutput: 'Promise<void>；当前已结束 spans 完成一次导出尝试后解析，仍需处理网络失败。',
    errorCases: [{ condition: '每个请求都 forceFlush 破坏批量吞吐，或 span 尚未 end 就期望被导出', handling: '只在 serverless/测试/关停同步点调用；先结束 observations，再 flush。' }],
    relatedApis: ['LangfuseObservation.end', 'LangfuseClient.flush', 'LangfuseSpanProcessor.shutdown'],
  },
  'LangfuseSpanProcessor.shutdown': {
    learningLevel: 'advanced', runtime: 'server', parameters: [{ name: '无显式参数', type: 'OpenTelemetry processor shutdown', required: false, description: '执行最后一次 flush 并关闭 SpanProcessor 的批处理、定时器和导出资源。' }],
    expectedOutput: 'Promise<void>；处理器完成最后导出尝试并停止后解析，关闭后不应继续接收 spans。',
    errorCases: [{ condition: '热请求中关闭共享 processor，或平台退出窗口短于导出耗时', handling: '由应用唯一生命周期所有者在 SIGTERM 调用，并设置有界关停超时。' }],
    relatedApis: ['LangfuseSpanProcessor.forceFlush', 'LangfuseClient.shutdown', 'getLangfuseTracerProvider'],
  },
} satisfies Record<string, FrameworkApiLearningMeta>

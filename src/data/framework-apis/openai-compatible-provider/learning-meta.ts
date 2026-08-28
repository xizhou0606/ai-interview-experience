import type { FrameworkApiErrorCase, FrameworkApiLearningLevel, FrameworkApiLearningMeta, FrameworkApiParameter } from '../types'

const p = (name: string, type: string, required: boolean, description: string, defaultValue?: string): FrameworkApiParameter => ({
  name, type, required, description, ...(defaultValue === undefined ? {} : { defaultValue }),
})
const e = (condition: string, handling: string): FrameworkApiErrorCase => ({ condition, handling })
const m = (learningLevel: FrameworkApiLearningLevel, parameters: FrameworkApiParameter[], expectedOutput: string, errorCases: FrameworkApiErrorCase[], relatedApis: string[]): FrameworkApiLearningMeta => ({
  learningLevel, runtime: 'server', parameters, expectedOutput, errorCases, relatedApis,
})

const clientMeta = {
  'new OpenAI': m('core', [
    p('apiKey', 'string', false, '服务端认证密钥，默认可从环境读取，禁止发送到浏览器、日志或客户端包。'),
    p('baseURL', 'string', false, 'API 根地址；兼容服务只保证协议近似，必须逐项验证模型、参数和流事件。'),
    p('timeout', 'number', false, '单次 HTTP 请求默认超时毫秒数，超时不证明服务端任务或副作用从未开始。'),
    p('maxRetries', 'number', false, '对连接、429 和部分 5xx 的最大自动重试次数；非幂等操作需要额外评估。', '2'),
  ], '返回可跨请求复用的 OpenAI 客户端；构造阶段只保存传输配置，调用资源方法时才真正发起网络请求。', [
    e('在前端暴露密钥或每次业务请求都新建客户端', '只在服务端组合根创建并注入单例，使用秘密管理，按部署副本数统一预算连接与重试。'),
  ], ['client.withOptions', 'OpenAI.APIError', 'responses.create']),
  'client.withOptions': m('advanced', [
    p('options', 'Partial<ClientOptions>', true, '仅覆盖特定任务需要的超时、重试、地址或请求头，不会修改原客户端。'),
  ], '返回继承原配置并应用覆盖项的新 OpenAI 客户端，适合一组请求共享特殊传输策略。', [
    e('为单次调用大量派生客户端造成配置难以追踪', '单请求优先使用 RequestOptions；只有稳定子策略才派生并在依赖注入层命名管理。'),
  ], ['new OpenAI', 'responses.create', 'OpenAI.APIError']),
  'OpenAI.APIError': m('core', [
    p('status', 'number | undefined', false, 'HTTP 状态码用于区分认证、参数、限流和服务端错误，网络失败时可能为空。'),
    p('request_id', 'string | undefined', false, '服务端请求关联标识，应写入结构化日志和 trace，但不能作为用户可猜资源 ID。'),
    p('code / headers', 'string | Headers', false, '错误代码与响应头补充限流和诊断上下文，记录时需要脱敏。'),
  ], '捕获到包含状态、请求 ID、响应头和服务端错误体的 SDK 错误；具体子类可表达认证、限流等类别。', [
    e('对 401、参数错误或非幂等副作用进行无差别重试', '按状态和 code 分类；401/4xx 快速失败，429/5xx 指数退避并遵守服务端重试提示。'),
  ], ['new OpenAI', 'APIPromise.withResponse', 'Stream.controller.abort']),
  'APIPromise.asResponse': m('advanced', [
    p('当前请求', 'APIPromise<T>', true, '调用于尚未被其他消费方式读取的 SDK 请求，响应体通常只能消费一次。'),
  ], '返回原始 Web Response，可直接读取状态、响应头、二进制或流；SDK 不再替调用方解析业务 JSON。', [
    e('读取 raw body 后又尝试由 SDK 解析同一响应', '为每个请求选择唯一消费路径，需要数据和响应元信息时改用 withResponse。'),
  ], ['APIPromise.withResponse', 'audio.speech.create', 'files.content']),
  'APIPromise.withResponse': m('core', [
    p('data', 'T', true, 'SDK 已按端点类型解析的业务数据，调用方继续使用正常强类型合同。'),
    p('response', 'Response', true, '对应原始 Web Response，可读取状态和限流头，但响应体已被 SDK 消费。'),
    p('request_id', 'string | null', true, '来自响应头的关联 ID，适合进入日志、追踪和供应商工单。'),
  ], '返回解析后的 data、原始 Response 元信息和 request_id，兼顾强类型业务处理与协议级可观测性。', [
    e('把 request_id 当业务资源 ID 或记录全部敏感响应头', '关联 ID 仅用于诊断，响应头采用白名单记录并遵循日志数据保留策略。'),
  ], ['APIPromise.asResponse', 'OpenAI.APIError', 'responses.create']),
  'PagePromise async iterator': m('core', [
    p('list params', 'object', false, '首个分页请求的 limit、after、before 等参数，具体字段由资源端点决定。'),
    p('消费循环', 'for await...of', true, '消费速度控制下一页请求节奏，适合逐项处理而不是一次加载全量。'),
    p('业务上限', 'number / AbortSignal', true, '全量扫描可能消耗大量配额，在线链路必须限制条数、时长或允许取消。'),
  ], '异步逐项产出所有请求页中的资源，网络仍按 cursor 分页拉取，不会一次把完整集合载入内存。', [
    e('无界自动分页拖慢在线请求并耗尽速率额度', '设置最大处理数和截止时间，长扫描转后台任务并在页边界保存 checkpoint。'),
  ], ['AbstractPage.hasNextPage', 'AbstractPage.getNextPage', 'files.list']),
  'AbstractPage.hasNextPage': m('advanced', [
    p('当前 page', 'AbstractPage<T>', true, '根据响应 cursor 与原请求参数判断是否能构造下一页，不能仅看 data.length。'),
  ], '返回布尔值，表示当前页之后是否存在可请求的下一页；cursor 不是稳定页码或永久快照。', [
    e('仅以当前页条数等于 limit 推断还有数据', '始终调用 hasNextPage，并接受集合并发变化造成前后页内容移动。'),
  ], ['AbstractPage.getNextPage', 'PagePromise async iterator']),
  'AbstractPage.getNextPage': m('advanced', [
    p('当前 page', 'AbstractPage<T>', true, '使用当前页保存的 cursor 和请求选项获取下一页，调用前先检查 hasNextPage。'),
  ], '返回同类下一页实例，包含新的 data 和继续分页信息；每次调用都会产生一次独立 API 请求。', [
    e('无下一页时调用或失败后丢失同步进度', '先判断 hasNextPage，在页完成后持久化 cursor，并对 429/5xx 有界退避。'),
  ], ['AbstractPage.hasNextPage', 'PagePromise async iterator', 'batches.list']),
  'Stream async iterator': m('core', [
    p('stream', 'Stream<Event>', true, '由 stream:true 或高层 helper 创建的事件流，必须完整消费或主动取消。'),
    p('event.type', 'string', true, '按判别联合的 type 分派文本、工具、完成和错误事件，不能把 delta 当完整对象。'),
    p('最终持久化', 'completion event', true, 'UI 可展示增量，但确定性保存和副作用应等待完成事件或最终快照。'),
  ], '异步逐条产出 SSE 解析后的类型化事件；迭代正常结束才表示该客户端流已完整收尾。', [
    e('把 delta 当完整回答或客户端断流后仍标记任务成功', '维护事件状态机，增量与最终数据分离，异常时记录未完成并允许用户重试。'),
  ], ['Stream.controller.abort', 'responses.stream', 'responses.create']),
  'Stream.controller.abort': m('advanced', [
    p('reason', 'unknown', false, '可选取消原因只用于本地诊断，禁止放入秘密或完整用户内容。'),
  ], '无业务返回值；向当前底层 fetch 流发出取消信号，后续迭代结束或抛出取消错误。', [
    e('把断开连接误认为服务端后台任务已经取消', '持久化 background Response 应另调 responses.cancel，并按最终 status 核验。'),
  ], ['Stream async iterator', 'responses.cancel', 'responses.retrieve']),
  toFile: m('core', [
    p('value', 'Buffer | Uint8Array | Blob | stream', true, '要转换的字节或流输入；流可能被完整缓冲，因此需限制来源大小。'),
    p('name', 'string', false, '上传文件名会影响 multipart 元数据和格式判断，应包含正确且安全的扩展名。'),
    p('options', '{ type?, lastModified? }', false, '可声明 MIME 与时间信息，但服务端仍会按 purpose 和内容校验。'),
  ], '返回标准 File 对象，供 files.create、images.edit 等 multipart 端点上传；不会自动发起网络请求。', [
    e('大流被完整缓冲导致内存峰值或文件类型错误', '先校验大小和 MIME，大文件使用文件流或 toStreamingFile，并限制并发上传。'),
  ], ['toStreamingFile', 'files.create', 'images.edit']),
  toStreamingFile: m('core', [
    p('stream', 'ReadableStream | NodeJS.Readable', true, '可流式读取的数据源，上传失败后通常不能自动从头重放。'),
    p('name', 'string', false, '服务端看到的文件名，必须与真实内容和目标端点允许格式一致。'),
    p('options', '{ type? }', false, '可选 MIME 类型用于 multipart 元数据，不能替代服务端内容验证。'),
  ], '返回 SDK 可识别的流式 Uploadable，发送请求时边读边上传，从而降低大文件内存峰值。', [
    e('网络重试尝试复用已经消费的单次流', '关闭自动重试或提供可重新打开的数据源，并记录已发送范围和失败原因。'),
  ], ['toFile', 'files.create', 'uploads.parts.create']),
} satisfies Record<string, FrameworkApiLearningMeta>

const assetBatchMeta = {
  'files.create': m('core', [
    p('file', 'Uploadable', true, '要上传的文件、File 或可读流，需验证大小、MIME、扩展名和用户访问权限。'),
    p('purpose', 'FilePurpose', true, '声明 batch、assistants 等用途，服务端据此限制格式和后续可访问端点。'),
    p('options', 'RequestOptions', false, '覆盖上传超时、重试和信号；单次流不可重放时应谨慎自动重试。'),
  ], '返回 FileObject，包含文件 ID、purpose、字节数与处理状态；上传成功不代表所有下游解析已经完成。', [
    e('流已消费后自动重试或 purpose/格式不匹配', '使用可重新打开的数据源或关闭自动重试，上传前按用途执行格式和大小校验。'),
  ], ['toFile', 'toStreamingFile', 'files.retrieve', 'files.waitForProcessing']),
  'files.retrieve': m('advanced', [p('fileId', 'string', true, '要读取元数据的文件 ID，必须通过当前租户资源映射解析并鉴权。')], '返回 FileObject 元数据和状态，不下载文件正文；可用于确认处理完成或排查失败。', [e('轮询过快或越权探测其他租户文件', '服务端绑定 fileId 归属，轮询使用退避和总截止时间，终态立即停止。')], ['files.create', 'files.content', 'files.waitForProcessing']),
  'files.list': m('advanced', [p('query', 'purpose / cursor / limit', false, '按用途和 cursor 分页列出文件，在线页面需要限制条数和可见租户范围。')], '返回 FileObject 分页集合，可手动分页或异步遍历；不会包含每个文件的正文内容。', [e('用全局凭证列出后直接向用户展示所有文件', '在应用层维护租户归属并二次过滤，长扫描转后台且设置上限。')], ['PagePromise async iterator', 'files.retrieve', 'files.delete']),
  'files.delete': m('core', [
    p('fileId', 'string', true, '永久删除的文件资源 ID，必须从可信租户记录获取而非直接接受任意输入。'),
    p('下游引用', 'batch / vector store references', true, '删除前检查 Batch、Upload 或 Vector Store 是否仍依赖该文件。'),
    p('options', 'RequestOptions', false, '控制删除请求超时和重试；超时后先 retrieve 核验最终状态。'),
  ], '返回 FileDeleted 确认对象；删除文件资源不会自动清理应用数据库、对象存储副本和衍生索引。', [
    e('仍有 Batch/Vector Store 引用时误删或超时后重复判断', '先检查引用并按保留策略审批，未知状态重新 retrieve/list 后再决定。'),
  ], ['files.retrieve', 'files.list', 'vectorStores.files.delete']),
  'files.content': m('advanced', [p('fileId', 'string', true, '要下载正文的文件 ID，内容可能含敏感批输入或模型输出，必须鉴权。')], '返回原始 Web Response，可按 text、arrayBuffer 或 stream 消费文件内容，而不是 FileObject 元数据。', [e('把大文件一次读入内存或未经授权转发内容', '使用流式下载和字节上限，校验租户归属、Content-Type，并设置安全响应头。')], ['files.retrieve', 'APIPromise.asResponse', 'vectorStores.files.content']),
  'files.waitForProcessing': m('core', [
    p('fileId', 'string', true, '等待进入终态的已上传文件 ID，必须属于当前任务和租户。'),
    p('pollInterval', 'number', false, '两次状态查询间隔毫秒数，过小会浪费配额并触发限流。'),
    p('maxWait', 'number', false, '最长等待毫秒数；到期应返回可恢复状态而不是无限占用请求。'),
  ], '轮询直到返回已处理的 FileObject 或因失败/超时抛错；它只等待文件处理，不创建任何下游任务。', [
    e('在线 HTTP 请求中无限等待或文件进入失败终态', '设置总截止时间，长任务转后台队列，并将服务端失败原因映射为可操作提示。'),
  ], ['files.create', 'files.retrieve', 'vectorStores.files.poll']),
  'uploads.create': m('core', [
    p('filename / purpose', 'string / FilePurpose', true, '声明最终文件名和用途，必须与后续 parts 内容及目标端点要求一致。'),
    p('bytes', 'number', true, '最终文件总字节数，用于完整性和容量保护，不能小于实际 parts 合计。'),
    p('mime_type', 'string', true, '明确内容类型，服务端仍会验证真实格式，不能仅信任客户端声明。'),
  ], '返回 Upload 会话及其 ID，在过期前可并行添加 parts；此时尚未形成可供其他 API 使用的 FileObject。', [
    e('声明字节数或类型与实际内容不符，或 Upload 过期', '创建前计算稳定元数据，记录 expires_at，失败后新建 Upload 而不是继续旧 ID。'),
  ], ['uploads.parts.create', 'uploads.complete', 'uploads.cancel']),
  'uploads.parts.create': m('core', [
    p('uploadId', 'string', true, '目标未完成 Upload ID，必须归属当前任务且仍在有效期内。'),
    p('data', 'Uploadable', true, '一个文件分片的数据流，每片需符合大小要求并能在失败时受控重放。'),
    p('并发与排序', 'application policy', true, 'parts 可并行上传，但最终顺序由 complete 的 part_ids 明确指定。'),
  ], '返回 UploadPart 及 part ID；分片暂存成功不代表 Upload 已完成或生成最终 FileObject。', [
    e('分片重复、丢失或单次流失败后无法重放', '为每片记录序号、校验值和 part ID，限制并发，重试时重新打开确定字节范围。'),
  ], ['uploads.create', 'uploads.complete', 'toStreamingFile']),
  'uploads.complete': m('core', [
    p('uploadId', 'string', true, '要提交的 Upload 会话 ID，完成后不能再追加新的 parts。'),
    p('part_ids', 'string[]', true, '按最终文件字节顺序排列的全部分片 ID，顺序错误会产生损坏文件。'),
    p('md5', 'string', false, '可选最终内容校验值，用于发现 parts 缺失、错序或传输损坏。'),
  ], '返回完成后的 Upload，其中包含最终 FileObject；后续需按 purpose 等待处理或交给目标 API。', [
    e('part_ids 错序/缺失或 complete 超时状态未知', '本地保存 manifest 和校验值，超时后查询相关资源状态，避免盲目创建重复文件。'),
  ], ['uploads.parts.create', 'uploads.cancel', 'files.retrieve']),
  'uploads.cancel': m('advanced', [p('uploadId', 'string', true, '取消尚未完成的 Upload 会话；已 complete 的最终文件需使用 files.delete。')], '返回取消后的 Upload 状态，已上传 parts 不再用于 complete；不会删除另行创建的 FileObject。', [e('把 cancel 当作最终文件删除或与 complete 并发竞态', '用任务状态机串行操作，完成竞态后检查是否已生成 file 并按策略删除。')], ['uploads.create', 'uploads.complete', 'files.delete']),
  'models.retrieve': m('advanced', [p('modelId', 'string', true, '要查询的模型 ID，应从服务端允许列表获取而不是任意用户输入。')], '返回 Model 元数据，包括 ID、所有者和创建信息；存在不表示当前项目拥有全部调用权限。', [e('把模型存在当作能力和权限验证', '启动时执行最小探针并维护能力矩阵，实际请求仍处理权限与参数错误。')], ['models.list', 'responses.create', 'embeddings.create']),
  'models.list': m('advanced', [p('options', 'RequestOptions', false, '控制列表请求超时、重试与信号，结果仅代表当前凭证可见模型。')], '返回 Model 分页列表，可用于运维发现和诊断，但不提供完整价格、能力或地区可用性合同。', [e('运行时让用户从全部列表任意选择模型', '服务端维护经过评测的允许列表，列表仅作管理诊断并缓存短时结果。')], ['models.retrieve', 'PagePromise async iterator', 'responses.create']),
  'models.delete': m('advanced', [p('modelId', 'string', true, '要删除的可删除模型资源 ID；基础托管模型通常不适用此操作。')], '返回 ModelDeleted 确认；删除后依赖该模型 ID 的任务会失败，不能通过 SDK 自动恢复。', [e('误删仍在生产配置或批任务引用的模型', '检查配置与在途任务引用，执行审批和回滚计划，删除后更新模型路由。')], ['models.retrieve', 'models.list']),
  'moderations.create': m('core', [
    p('model', 'string', true, '选择当前支持的审核模型并记录版本，不同版本阈值与类别不可盲目复用。'),
    p('input', 'string | string[] | multimodal input', true, '待审核用户或模型内容，应按业务阶段批量且保持输入索引映射。'),
    p('业务阈值', 'application policy', true, 'category_scores 需按风险、地区和产品政策解释，不能只依赖单一 flagged 布尔值。'),
  ], '返回 ModerationCreateResponse，results 与输入顺序对应，包含 flagged、类别和分数供应用决策。', [
    e('把审核 API 当唯一安全防线或忽略申诉与误报', '结合输入限制、权限、人工复核和审计，按类别建立可解释的处置策略。'),
  ], ['responses.create', 'images.generate', 'audio.transcriptions.create']),
  'batches.create': m('core', [
    p('input_file_id', 'string', true, 'purpose=batch 的 JSONL 输入文件 ID，每行 custom_id 应稳定唯一便于结果对账。'),
    p('endpoint', 'string', true, '批内每行请求的目标端点必须与文件内容一致，并在当前 Batch API 支持范围内。'),
    p('completion_window', 'string', true, '服务端允许的完成窗口，不是单请求 timeout；业务 SLA 必须允许异步等待。'),
    p('metadata', 'object', false, '低敏批任务索引字段，限制键值长度，不放完整用户内容或秘密。'),
  ], '返回 Batch 任务及 ID，初始通常处于 validating/in_progress；结果稍后通过状态和 output_file_id 获取。', [
    e('JSONL 行格式错误导致整批验证失败或 custom_id 重复', '提交前本地逐行 schema 校验和去重，小样本预跑后再上传大批次。'),
  ], ['files.create', 'batches.retrieve', 'batches.cancel', 'files.content']),
  'batches.retrieve': m('core', [
    p('batchId', 'string', true, '要查询的 Batch 标识，必须绑定当前租户、输入文件和业务任务。'),
    p('轮询间隔', 'backoff policy', true, '状态变化以分钟/小时计时应指数退避，不能高频占用速率额度。'),
    p('终态处理', 'BatchStatus', true, 'completed、failed、expired、cancelled 等终态分别处理输出与错误文件。'),
  ], '返回 Batch 当前状态、计数、output_file_id 和 error_file_id 等信息；retrieve 不会重新执行任务。', [
    e('只判断 completed 忽略逐行失败或无限轮询', '设置总截止时间，终态下载输出/错误 JSONL 并按 custom_id 逐项对账。'),
  ], ['batches.create', 'batches.list', 'batches.cancel', 'files.content']),
  'batches.list': m('advanced', [p('query', 'cursor / limit / after', false, '分页列出当前项目可见批任务，在线管理页应限制条数和租户范围。')], '返回 Batch 分页集合，可异步遍历或手动 cursor 翻页，不会自动下载每个任务结果文件。', [e('把项目级 Batch 列表直接暴露给普通用户', '应用维护业务归属并二次鉴权，管理查询设 limit 和审计。')], ['PagePromise async iterator', 'batches.retrieve', 'batches.create']),
  'batches.cancel': m('core', [
    p('batchId', 'string', true, '请求取消的 Batch ID，必须先校验租户归属和当前可取消状态。'),
    p('竞态', 'BatchStatus', true, '取消到达时部分请求可能已完成，最终输出和费用不能假定为零。'),
    p('options', 'RequestOptions', false, '控制取消请求超时与重试，状态未知时应 retrieve 核验。'),
  ], '返回取消请求后的 Batch 状态快照；任务可能先进入 cancelling，稍后才到 cancelled 终态。', [
    e('HTTP 成功即删除本地任务或忽略已完成行', '继续轮询到终态，下载可用输出并按 custom_id 对账，再执行数据清理。'),
  ], ['batches.retrieve', 'batches.create', 'files.content']),
} satisfies Record<string, FrameworkApiLearningMeta>

const vectorStoreMeta = {
  'vectorStores.create': m('core', [
    p('name', 'string', false, '便于运维识别的向量库名称，不应包含用户敏感信息或作为唯一业务主键。'),
    p('file_ids', 'string[]', false, '可选初始文件集合，创建返回后解析和索引可能仍在异步进行。'),
    p('expires_after', 'ExpirationPolicy', false, '设置基于活动时间的自动过期，避免临时知识库无限保留和持续计费。'),
    p('chunking_strategy', 'ChunkingStrategy', false, '控制文档切块大小和重叠，直接影响召回、上下文噪声和索引成本。'),
  ], '返回 VectorStore 资源及 ID；存在资源不等于所有文件已完成解析，使用前需检查 file_counts 或轮询。', [
    e('创建后立即检索导致文件尚未 ready 或无过期策略', '使用 createAndPoll/uploadAndPoll 等 helper，临时库配置 expires_after 并监控失败计数。'),
  ], ['vectorStores.retrieve', 'vectorStores.files.create', 'vectorStores.search', 'vectorStores.delete']),
  'vectorStores.retrieve': m('advanced', [p('vectorStoreId', 'string', true, '读取向量库元数据的 ID，必须从当前租户业务记录解析。')], '返回 VectorStore 状态、file_counts、过期与容量信息；不返回文档全文或检索结果。', [e('把 completed 文件计数与上传文件数不一致忽略', '检查 failed/in_progress 计数，逐个或按 batch 定位失败文件并决定重试。')], ['vectorStores.create', 'vectorStores.update', 'vectorStores.files.list']),
  'vectorStores.update': m('core', [
    p('vectorStoreId', 'string', true, '目标向量库 ID，更新前校验租户归属和当前生命周期状态。'),
    p('name / metadata', 'string / object', false, '可更新展示名和低敏索引元数据，不会重写已有文档向量。'),
    p('expires_after', 'ExpirationPolicy', false, '调整自动过期策略时要避免活动生产库意外进入删除窗口。'),
  ], '返回更新后的 VectorStore；元数据和过期策略变更不等于文件重新解析或检索立即重建。', [
    e('误设过期策略导致生产知识库自动删除', '配置变更走审批并校验环境，关键库设置外部备份和到期预警。'),
  ], ['vectorStores.retrieve', 'vectorStores.delete', 'vectorStores.list']),
  'vectorStores.list': m('advanced', [p('query', 'cursor / limit / order', false, '按 cursor 分页读取向量库，项目级结果需在应用层再次按租户授权。')], '返回 VectorStore 分页集合，可查看状态和容量；不会自动列出其中的全部文件。', [e('无界扫描或把项目级资源展示给任意用户', '设置 limit 和截止时间，使用业务映射过滤归属并记录管理访问。')], ['PagePromise async iterator', 'vectorStores.retrieve', 'vectorStores.files.list']),
  'vectorStores.delete': m('core', [
    p('vectorStoreId', 'string', true, '永久删除的向量库 ID，必须由服务端可信映射确认租户和环境。'),
    p('依赖检查', 'responses / file search usage', true, '删除前确认没有活动 Agent 或 Responses 工具仍引用该知识库。'),
    p('数据保留', 'retention policy', true, '向量库删除不一定删除原 Files 和应用副本，需统一清理或保留。'),
  ], '返回 VectorStoreDeleted 确认；索引资源被删除，原始 FileObject 是否保留取决于另行文件生命周期。', [
    e('仍被生产 file_search 引用或误以为原文件已删除', '先停止引用并观察流量，删除后按 fileId 清单执行独立 files.delete 策略。'),
  ], ['vectorStores.retrieve', 'vectorStores.files.list', 'files.delete']),
  'vectorStores.search': m('core', [
    p('vectorStoreId', 'string', true, '目标知识库 ID，服务端必须校验用户对该库和文档的访问权限。'),
    p('query', 'string | string[]', true, '自然语言或多条查询，需限长并避免把敏感全文写入搜索日志。'),
    p('max_num_results / ranking_options', 'number / object', false, '控制返回数量、重排器和阈值，需要用固定评测集校准召回与延迟。'),
    p('filters', 'AttributeFilter', false, '基于文件 attributes 的服务端过滤，多租户边界不能仅依赖模型提示。'),
  ], '返回 VectorStoreSearchResponse，包含相关内容片段、文件信息和分数；结果是检索候选而非事实保证。', [
    e('遗漏租户过滤造成跨权限召回或阈值照搬不同语料', '服务端强制合并授权 filters，离线评测 recall@k 和答案引用正确率。'),
  ], ['vectorStores.create', 'vectorStores.files.update', 'responses.create']),
  'vectorStores.files.create': m('core', [
    p('vectorStoreId', 'string', true, '目标向量库 ID，必须与 fileId 属于同一授权业务范围。'),
    p('file_id', 'string', true, '已由 files.create 上传的文件 ID，附加后会异步解析、切块和索引。'),
    p('attributes', 'Record<string, string|number|boolean>', false, '用于检索 filters 的低敏属性，应规范字段类型并避免高基数无用值。'),
    p('chunking_strategy', 'ChunkingStrategy', false, '为该文件选择切块策略，一旦索引后变更通常需要重新附加。'),
  ], '返回 VectorStoreFile，初始可能 in_progress；创建关联成功不表示文档已可被 search 或 file_search 召回。', [
    e('未等待索引完成就上线或文件与库跨租户关联', '校验双边归属并调用 poll/createAndPoll，失败状态记录 last_error 后受控重试。'),
  ], ['vectorStores.files.createAndPoll', 'vectorStores.files.poll', 'files.create']),
  'vectorStores.files.retrieve': m('advanced', [p('fileId / vector_store_id', 'string / string', true, '联合定位某个库内文件关系，两者都需通过当前租户授权。')], '返回 VectorStoreFile 的索引状态、attributes 和错误信息，不返回原文件字节。', [e('只按 fileId 查询却忽略它可属于多个向量库', '始终携带正确 vector_store_id，并以二元组作为业务记录键。')], ['vectorStores.files.list', 'vectorStores.files.poll', 'vectorStores.files.content']),
  'vectorStores.files.update': m('core', [
    p('fileId', 'string', true, '要更新 attributes 的文件 ID，需与指定向量库组成授权资源键。'),
    p('vector_store_id', 'string', true, '文件所在目标向量库，不能从不可信前端任意选择。'),
    p('attributes', 'Record<string, scalar>', true, '替换或更新检索过滤属性，字段类型必须与现有 filter 约定一致。'),
  ], '返回更新后的 VectorStoreFile；attributes 可影响后续 filters，但不会修改原文内容或重新生成 embedding。', [
    e('属性类型漂移导致过滤漏召回或越权范围扩大', '定义属性 schema 并校验租户字段，更新后用固定查询验证过滤结果。'),
  ], ['vectorStores.files.retrieve', 'vectorStores.search', 'vectorStores.files.list']),
  'vectorStores.files.list': m('advanced', [p('vectorStoreId / query', 'string / cursor filters', true, '分页列出库内文件关系，可按状态或 attributes 过滤并限制条数。')], '返回 VectorStoreFile 分页集合，包含索引状态和属性；不自动下载原文内容。', [e('把列表数量当全部文件或忽略 failed 状态', '处理 cursor 分页并汇总各状态，失败文件逐个读取 last_error。')], ['PagePromise async iterator', 'vectorStores.files.retrieve', 'vectorStores.files.delete']),
  'vectorStores.files.delete': m('core', [
    p('fileId', 'string', true, '要从指定库解除并删除索引的文件 ID，不一定删除全局 FileObject。'),
    p('vector_store_id', 'string', true, '目标向量库 ID，必须和 fileId 的授权关系一起校验。'),
    p('原文件策略', 'File lifecycle', true, '若不再被其他库或任务使用，应另行决定是否调用 files.delete。'),
  ], '返回 VectorStoreFileDeleted，表示该文件不再参与指定库检索；全局文件资源通常仍独立存在。', [
    e('误认为解除索引已满足所有数据删除要求', '查询其他引用，按保留策略再删除 FileObject、缓存和应用侧衍生数据。'),
  ], ['vectorStores.files.retrieve', 'files.delete', 'vectorStores.files.list']),
  'vectorStores.files.createAndPoll': m('core', [
    p('vectorStoreId', 'string', true, '目标向量库 ID，必须与上传文件的业务归属一致。'),
    p('body', '{ file_id, attributes?, chunking_strategy? }', true, '创建关系的完整配置，切块和过滤属性需在索引前确定。'),
    p('pollIntervalMs / maxWait', 'number', false, '轮询节奏与总等待时间，在线链路必须有上限并允许后台接管。'),
  ], '创建并轮询，最终返回 completed 或失败的 VectorStoreFile；超时可能抛错但后台处理仍可能继续。', [
    e('超时后重复创建同一文件关系造成重复索引', '先 retrieve/list 核验现有关系，使用业务幂等记录并对轮询指数退避。'),
  ], ['vectorStores.files.create', 'vectorStores.files.poll', 'vectorStores.files.uploadAndPoll']),
  'vectorStores.files.poll': m('core', [
    p('vectorStoreId', 'string', true, '文件关系所在向量库 ID，与 fileId 一起作为状态查询主键。'),
    p('fileId', 'string', true, '等待解析和索引终态的文件 ID，必须已附加到目标库。'),
    p('pollIntervalMs / maxWait', 'number', false, '状态查询间隔和总等待上限，避免无限占用请求和配额。'),
  ], '轮询并返回进入 completed/failed 等终态的 VectorStoreFile；不会创建新文件或自动修复失败内容。', [
    e('失败状态仍持续轮询或等待超时后盲目重建', '识别终态并记录 last_error，修复源文件/格式后再执行有审计的重试。'),
  ], ['vectorStores.files.retrieve', 'vectorStores.files.createAndPoll', 'files.waitForProcessing']),
  'vectorStores.files.upload': m('core', [
    p('vectorStoreId', 'string', true, '接收上传并附加文件的目标向量库，服务端校验租户归属。'),
    p('file', 'Uploadable', true, '原始文件或流，会先创建 FileObject 再关联；需限制格式、大小和可重试性。'),
    p('options', 'RequestOptions', false, '控制上传请求超时与重试；单次流失败后可能无法安全重放。'),
  ], '返回创建的 VectorStoreFile 关系，但异步解析与索引可能仍在进行，不保证立即可检索。', [
    e('上传成功就开始 search 或网络重试复用已消费流', '需要就绪时用 uploadAndPoll，流上传提供可重新打开数据源或禁用自动重试。'),
  ], ['vectorStores.files.uploadAndPoll', 'files.create', 'vectorStores.files.poll']),
  'vectorStores.files.uploadAndPoll': m('core', [
    p('vectorStoreId', 'string', true, '目标向量库 ID，需校验环境和租户，避免上传到错误知识库。'),
    p('file', 'Uploadable', true, '待上传并索引的文件，预先验证内容权限、类型、大小和恶意载荷。'),
    p('poll options', 'pollIntervalMs / maxWait', false, '控制处理状态轮询，超时只表示客户端停止等待。'),
  ], '完成上传、关联并轮询后返回终态 VectorStoreFile，适合需要“可检索后再发布”的流程。', [
    e('轮询超时后重复上传造成多个 FileObject 和索引副本', '保存已返回的 fileId，先 list/retrieve 核验状态，再决定继续 poll 或清理重试。'),
  ], ['vectorStores.files.upload', 'vectorStores.files.poll', 'vectorStores.search']),
  'vectorStores.files.content': m('advanced', [p('fileId / vector_store_id', 'string / string', true, '读取特定库内文件解析内容，两者都必须通过租户和文档权限检查。')], '返回 VectorStoreFileContentResponse，通常包含解析后的文本内容；它不同于 files.content 的原始字节。', [e('将解析全文无鉴权展示或记录日志', '执行文档级 ACL，限制返回片段和大小，并对敏感字段脱敏。')], ['vectorStores.files.retrieve', 'files.content', 'vectorStores.search']),
  'vectorStores.fileBatches.create': m('core', [
    p('vectorStoreId', 'string', true, '批量附加文件的目标向量库，必须与全部 file_ids 授权范围一致。'),
    p('file_ids', 'string[]', true, '待解析索引的文件 ID 集合，应去重、限制批量大小并记录输入顺序。'),
    p('attributes / chunking_strategy', 'object', false, '批量共享的过滤属性和切块策略，个别文件需要差异时应分批。'),
  ], '返回 VectorStoreFileBatch，异步处理每个文件并累计状态计数；创建成功不代表全部文件完成。', [
    e('批内部分失败却只看总体状态或混入越权文件', '提交前逐个鉴权，终态 listFiles 按状态对账并仅重试失败项。'),
  ], ['vectorStores.fileBatches.createAndPoll', 'vectorStores.fileBatches.listFiles', 'vectorStores.fileBatches.cancel']),
  'vectorStores.fileBatches.retrieve': m('advanced', [p('batchId / vector_store_id', 'string / string', true, '联合定位文件批次，两者都需从当前业务任务可信记录解析。')], '返回 VectorStoreFileBatch 当前状态和各状态文件计数，不返回逐个文件详情。', [e('只看 completed 总数忽略 failed 详情', '终态后调用 listFiles 过滤 failed，读取每个文件错误并建立重试清单。')], ['vectorStores.fileBatches.poll', 'vectorStores.fileBatches.listFiles', 'vectorStores.fileBatches.cancel']),
  'vectorStores.fileBatches.cancel': m('core', [
    p('batchId', 'string', true, '要取消的文件批处理 ID，必须确认属于目标向量库和当前租户。'),
    p('vector_store_id', 'string', true, '批次所在向量库，和 batchId 一起构成资源定位与授权边界。'),
    p('部分完成', 'file_counts', true, '取消到达前部分文件可能已完成索引，需要决定保留还是逐个删除。'),
  ], '返回取消后的 VectorStoreFileBatch 状态快照；取消是竞态操作，不会回滚已经完成的文件索引。', [
    e('认为取消会自动删除所有已索引文件', '等待终态并 listFiles 对账，对不应保留的完成项逐个 files.delete 关联。'),
  ], ['vectorStores.fileBatches.retrieve', 'vectorStores.fileBatches.listFiles', 'vectorStores.files.delete']),
  'vectorStores.fileBatches.createAndPoll': m('core', [
    p('vectorStoreId', 'string', true, '目标向量库 ID，创建前校验全部文件与库的业务归属。'),
    p('body', '{ file_ids, attributes?, chunking_strategy? }', true, '批量附加配置，file_ids 要去重且控制数量和总大小。'),
    p('poll options', 'pollIntervalMs / maxWait', false, '轮询间隔与总等待上限，超时后批任务可能仍在后台执行。'),
  ], '创建批次并轮询到终态后返回 VectorStoreFileBatch；仍需检查 failed 文件计数而非只看 Promise 成功。', [
    e('超时后重复创建整批导致完成文件再次索引', '保存 batchId 并继续 poll/retrieve，终态只重试失败 file IDs。'),
  ], ['vectorStores.fileBatches.create', 'vectorStores.fileBatches.poll', 'vectorStores.fileBatches.listFiles']),
  'vectorStores.fileBatches.listFiles': m('core', [
    p('batchId', 'string', true, '要展开文件详情的批次 ID，需与指定向量库和当前业务任务匹配。'),
    p('vector_store_id', 'string', true, '批次所属向量库 ID，是查询和授权不可省略的组成部分。'),
    p('filter / cursor / limit', 'status / pagination', false, '可筛选 in_progress/completed/failed 并分页，不能假设单页是全部。'),
  ], '返回该批次包含的 VectorStoreFile 分页集合，可用于逐项对账、定位失败和后续重试。', [
    e('只读取第一页导致遗漏失败文件', '处理完整 cursor 分页或按状态遍历，并以 fileId 建立幂等对账表。'),
  ], ['vectorStores.fileBatches.retrieve', 'PagePromise async iterator', 'vectorStores.files.retrieve']),
  'vectorStores.fileBatches.poll': m('core', [
    p('vectorStoreId', 'string', true, '目标向量库 ID，必须与 batchId 所在资源一致。'),
    p('batchId', 'string', true, '要等待状态收敛的文件批次 ID，不会创建新批次。'),
    p('poll options', 'pollIntervalMs / maxWait', false, '轮询频率和总等待时间，防止高频请求与无限等待。'),
  ], '轮询并返回终态 VectorStoreFileBatch；Promise 完成后仍应检查 file_counts.failed 和逐文件错误。', [
    e('失败计数非零却把整个知识库发布为 ready', 'listFiles 过滤失败项，设置允许失败门禁，并在发布前执行固定检索验收。'),
  ], ['vectorStores.fileBatches.retrieve', 'vectorStores.fileBatches.listFiles', 'vectorStores.fileBatches.createAndPoll']),
  'vectorStores.fileBatches.uploadAndPoll': m('core', [
    p('vectorStoreId', 'string', true, '接收批量上传和索引的目标向量库，必须校验租户与环境。'),
    p('files', 'Uploadable[]', true, '需要创建 FileObject 的本地或流式文件列表，逐个验证大小、格式、权限和可重试性。'),
    p('fileIds', 'string[]', false, '可同时附加已有 FileObject IDs，需去重并校验全部资源归属。'),
    p('poll options', 'pollIntervalMs / maxWait', false, '限制状态轮询节奏和总等待，超时不等于后台停止。'),
  ], '上传新文件、合并已有 IDs、创建批次并轮询后返回 VectorStoreFileBatch 终态与计数。', [
    e('部分上传失败后整批重试造成重复文件和费用', '记录每个本地文件到 fileId 的映射，恢复时复用已成功 IDs，仅重试未确认项。'),
  ], ['vectorStores.fileBatches.createAndPoll', 'vectorStores.files.uploadAndPoll', 'vectorStores.fileBatches.listFiles']),
} satisfies Record<string, FrameworkApiLearningMeta>

const generationMeta = {
  'responses.create': m('core', [
    p('model', 'string', true, '选择支持所需工具、模态和结构化输出的模型，名称由服务端配置而非用户任意传入。'),
    p('input', 'string | ResponseInputItem[]', true, '文本或类型化多模态输入，必须限长、鉴权远程资源并防止提示注入。'),
    p('tools', 'Tool[]', false, '允许模型提出的工具集合；模型调用不是授权，执行端仍须鉴权、校验和幂等。'),
    p('stream / background', 'boolean', false, '分别控制 SSE 增量与服务端后台生命周期，两者的恢复和取消语义不同。'),
  ], 'stream=false 返回完整 Response，stream=true 返回 ResponseStreamEvent 流；输出是类型化 item 序列而非固定首项文本。', [
    e('只读取 output[0] 或对超时请求无界重试工具副作用', '按 output item type 分派，记录 response/request id，副作用工具使用幂等键。'),
  ], ['responses.stream', 'responses.retrieve', 'responses.cancel', 'responses.parse']),
  'responses.retrieve': m('core', [
    p('responseId', 'string', true, '要恢复或查询的 Response ID，必须先验证其属于当前租户和业务记录。'),
    p('query.stream', 'boolean', false, '为 true 时继续以事件流接收状态，否则返回当前完整状态快照。'),
    p('options', 'RequestOptions', false, '可覆盖超时、重试和信号；轮询必须另外实现退避与总截止时间。'),
  ], '返回当前 Response 状态与已有输出，或在 stream 查询模式下返回事件流；它不会重新执行同一生成。', [
    e('高频轮询或越权读取其他租户的 responseId', '服务端绑定资源归属，使用指数退避和总超时，完成/失败后立即停止轮询。'),
  ], ['responses.create', 'responses.cancel', 'responses.delete']),
  'responses.delete': m('advanced', [
    p('responseId', 'string', true, '待永久删除的已存储 Response ID，必须从可信租户映射解析。'),
  ], '成功时 Promise 完成且无业务响应体；删除服务端 Response 不会同步清理应用数据库、缓存或日志副本。', [
    e('误删其他租户资源或把删除等同于取消执行', '先校验归属与状态；运行任务先 cancel，随后按数据保留流程清理全部衍生副本。'),
  ], ['responses.retrieve', 'responses.cancel']),
  'responses.cancel': m('core', [
    p('responseId', 'string', true, '使用 background:true 创建且仍可能运行的 Response 标识，需校验当前租户归属。'),
    p('竞态状态', 'ResponseStatus', true, '取消到达前任务可能已完成，因此必须根据返回和后续 retrieve 判断最终状态。'),
    p('options', 'RequestOptions', false, '控制本次取消请求超时和重试；超时后应查询状态而不是盲目重复。'),
  ], '返回取消操作后的 Response 状态快照；HTTP 成功不保证没有任何已产生输出、费用或已执行工具副作用。', [
    e('取消请求超时后假设任务一定停止', '重新 retrieve 获取权威状态，对已产生副作用按业务幂等与补偿策略处理。'),
  ], ['responses.retrieve', 'Stream.controller.abort', 'responses.delete']),
  'responses.compact': m('advanced', [
    p('model / input', 'string / ResponseInput', true, '指定压缩所用模型和长会话输入；关键业务事实不能只依赖有损压缩保留。'),
  ], '返回 CompactedResponse，其 output 可作为后续 Responses 输入，降低上下文占用但不保证保留每个历史细节。', [
    e('把 compaction 当可审计长期记忆导致关键约束丢失', '可靠事实结构化外置，压缩前后用固定任务集验证工具状态和安全约束。'),
  ], ['responses.create', 'responses.inputTokens.count', 'responses.inputItems.list']),
  'responses.parse': m('core', [
    p('model', 'string', true, '必须支持所选 structured output 格式，并与生产模型版本一起固定。'),
    p('input', 'ResponseInput', true, '提供待抽取或生成的输入，schema 只能约束格式，不能保证事实真实性。'),
    p('text.format', 'ResponseFormat', true, '由 Zod 等 helper 生成的命名 schema，应控制复杂度并保持向后兼容。'),
  ], '返回 ParsedResponse<T>；成功时 output_parsed 为类型化对象，拒答、不完整或无匹配输出时可能为空。', [
    e('未处理 refusal/incomplete 就把 parsed 值写入核心业务', '显式判断状态与空值，再执行领域校验、权限校验和必要的人工确认。'),
  ], ['responses.create', 'chat.completions.parse', 'responses.stream']),
  'responses.stream': m('core', [
    p('params', 'ResponseCreateParams', true, '除 stream 外的 Responses 请求参数，可包含模型、输入、工具和结构化格式。'),
    p('event listener', 'ResponseStream events', true, '按事件类型处理文本 delta、工具参数和完成状态，避免重复消费。'),
    p('finalResponse', 'Promise<Response>', true, '结束时读取累积最终对象；取消或异常时 Promise 会拒绝而非返回部分成功。'),
  ], '立即返回高层 ResponseStream runner，可监听和异步迭代事件，并在结束后取得累积完整 Response。', [
    e('同时注册多套消费者导致 delta 重复展示或内存积累', '为每条流指定唯一状态 reducer，异常/取消时统一清理 UI 和监听器。'),
  ], ['responses.create', 'Stream async iterator', 'Stream.controller.abort']),
  'responses.inputItems.list': m('advanced', [
    p('responseId', 'string', true, '目标 Response 标识，输入项可能含敏感消息和工具数据，必须执行租户鉴权。'),
    p('query', 'cursor / order / limit', false, '控制输入 item 分页与排序，cursor 只用于继续当前集合读取。'),
  ], '返回可分页的 ResponseItem 集合，用于审计服务端实际保存的消息与工具输入图。', [
    e('把完整输入项写入普通日志或调试页面越权展示', '对访问进行租户鉴权和审计，内容按字段脱敏并限制保留期。'),
  ], ['responses.retrieve', 'PagePromise async iterator', 'responses.inputTokens.count']),
  'responses.inputTokens.count': m('core', [
    p('model', 'string', true, '按目标模型的真实 tokenizer 与多模态计费规则计算，模型变更后计数不可复用。'),
    p('input', 'ResponseInput', true, '完整输入结构，包括文本、图片和历史项，而不是简单字符长度。'),
    p('tools / instructions', 'Tool[] / string', false, '工具 schema 和系统指令同样占上下文，预算时必须包含。'),
  ], '返回包含 input_tokens 的计数结果而不生成模型输出，适合提交前做窗口和成本保护。', [
    e('只按字符数估算或计数后又追加大量工具 schema', '对最终序列化请求计数并保留输出余量，超限时 compact、摘要或拒绝。'),
  ], ['responses.create', 'responses.compact', 'embeddings.create']),
  'chat.completions.create': m('core', [
    p('model', 'string', true, '选择支持消息、工具或视觉输入的模型，服务端配置白名单并记录版本。'),
    p('messages', 'ChatCompletionMessageParam[]', true, '有序角色消息数组，工具调用和 tool result 必须正确配对。'),
    p('tools / tool_choice', 'ChatCompletionTool[] / ToolChoice', false, '声明本轮可用函数及选择策略，执行端仍需鉴权和参数验证。'),
    p('stream', 'boolean', false, '开启后返回 ChatCompletionChunk 流，调用方负责增量拼接与结束判断。'),
  ], '非流式返回 ChatCompletion，流式返回 ChatCompletionChunk 异步流；choices 可能含文本、工具调用或结束原因。', [
    e('假设 choices[0].message.content 总有文本', '检查 finish_reason、tool_calls 和 content 空值，复杂新应用优先评估 Responses API。'),
  ], ['responses.create', 'chat.completions.stream', 'chat.completions.parse', 'chat.completions.runTools']),
  'chat.completions.retrieve': m('advanced', [p('completionId', 'string', true, '读取此前使用存储能力创建的 ChatCompletion，必须校验资源归属。')], '返回已存储 ChatCompletion 的当前完整快照；不会重新运行模型或继续旧流。', [e('越权读取或对未存储 completion 调用', '服务端维护租户资源映射，区分 404、权限和暂时故障，不泄露 ID 是否存在。')], ['chat.completions.list', 'chat.completions.update', 'chat.completions.delete']),
  'chat.completions.update': m('advanced', [p('completionId / metadata', 'string / object', true, '只更新已存储 completion 的 metadata，键值需限长并避免高敏数据。')], '返回 metadata 更新后的 ChatCompletion；不会修改原模型输出、token 或生成内容。', [e('把 metadata 更新误认为能修正模型回答', '业务修订另存版本和审计记录，metadata 仅保存低敏索引与状态。')], ['chat.completions.retrieve', 'chat.completions.list']),
  'chat.completions.list': m('advanced', [p('query', 'cursor / limit / metadata filter', false, '控制已存储 completion 的筛选和分页，在线接口应设置业务上限。')], '返回可自动或手动分页的 ChatCompletion 集合，仅覆盖有存储记录且当前凭证可见的资源。', [e('无界遍历所有 completion 或把 cursor 当页码', '使用 limit 和 cursor，长扫描转后台任务，并按租户再次过滤授权。')], ['PagePromise async iterator', 'chat.completions.retrieve', 'chat.completions.delete']),
  'chat.completions.delete': m('advanced', [p('completionId', 'string', true, '永久删除的已存储 completion ID，必须从可信租户记录解析。')], '返回 ChatCompletionDeleted 确认对象；不会自动清理应用侧副本、缓存和日志。', [e('误删或遗漏衍生数据', '删除前校验归属并执行统一数据生命周期工作流，记录不含正文的审计事件。')], ['chat.completions.retrieve', 'chat.completions.list']),
  'chat.completions.parse': m('core', [
    p('model', 'string', true, '选择支持结构化输出的模型并固定版本，避免 schema 能力随兼容服务变化。'),
    p('messages', 'ChatCompletionMessageParam[]', true, '有序输入历史，不能让用户伪造 system/tool 角色。'),
    p('response_format', 'AutoParseableResponseFormat<T>', true, 'Zod 等 helper 生成的 schema，控制结构但不证明领域事实正确。'),
  ], '返回 ParsedChatCompletion<T>，解析成功时 message.parsed 为类型化值，拒答或不完整时可能为空。', [
    e('只依赖 TypeScript 类型忽略运行时 refusal 和业务校验', '检查 finish_reason、refusal 与 parsed，再执行领域约束和必要人工确认。'),
  ], ['chat.completions.create', 'responses.parse', 'chat.completions.stream']),
  'chat.completions.runTools': m('core', [
    p('messages / model', 'messages / string', true, '定义本轮上下文和模型，工具循环会在其上追加调用与结果。'),
    p('tools', 'RunnableToolFunction[]', true, '包含 schema 与本地执行函数；函数内部必须鉴权、限时且幂等。'),
    p('maxChatCompletions', 'number', false, '限制自动工具循环轮数，防止模型反复调用造成费用和副作用失控。'),
  ], '返回 ChatCompletionRunner，自动执行匹配工具并继续请求，最终可读取完成消息和运行事件。', [
    e('工具循环无界或同一副作用被重复调用', '设置最大轮数、每工具超时和幂等键，高风险动作要求明确确认。'),
  ], ['chat.completions.create', 'chat.completions.stream', 'responses.create']),
  'chat.completions.stream': m('core', [
    p('messages / model', 'messages / string', true, '流式请求的上下文与模型，发送前需完成裁剪和角色校验。'),
    p('event handlers', 'ChatCompletionStream events', true, '按增量、工具和完成事件更新单一状态，避免多个监听器重复拼接。'),
    p('finalChatCompletion', 'Promise<ChatCompletion>', true, '流结束后得到累积对象，异常或取消时应按失败处理。'),
  ], '返回 ChatCompletionStream runner，支持事件监听、异步迭代和最终 ChatCompletion 累积。', [
    e('流中断后把部分文字当完整回答持久化', '标记 partial 状态，只在最终事件提交正式结果，取消时释放监听器。'),
  ], ['chat.completions.create', 'Stream async iterator', 'chat.completions.runTools']),
  'embeddings.create': m('core', [
    p('model', 'string', true, '选择稳定 embedding 模型，版本和维度必须与向量索引 schema 一起管理。'),
    p('input', 'string | string[] | token arrays', true, '待向量化文本或批次，需去除空值并受模型单项与批量 token 上限约束。'),
    p('dimensions / encoding_format', 'number / float|base64', false, '部分模型支持目标维度和编码格式，写入与查询必须保持一致。'),
  ], '返回 CreateEmbeddingResponse，data 按输入顺序包含向量和索引，并附总 token usage。', [
    e('更换模型/维度后混写旧索引或批量超限', '向量 schema 版本化，写入前校验维度，按 token 和条数分批并保留输入索引映射。'),
  ], ['responses.inputTokens.count', 'vectorStores.search', 'vectorStores.create']),
  'images.generate': m('core', [
    p('model', 'string', true, '选择支持目标尺寸、质量和流式预览的图像模型，并配置允许模型白名单。'),
    p('prompt', 'string', true, '图像描述需限长、内容审核并避免包含未授权个人或受保护素材。'),
    p('size / quality / n', 'string / string / number', false, '控制分辨率、质量和数量，直接影响延迟、费用与响应大小。'),
    p('stream', 'boolean', false, '开启时返回图像生成事件流，最终资产仍需按完成事件保存。'),
  ], '返回 ImagesResponse 或 ImageGenStreamEvent 流，数据可能是 URL 或 base64，需按响应格式安全存储。', [
    e('未限制尺寸/数量导致成本激增或把临时 URL 当永久资产', '设置产品配额和审核，将完成图像复制到受控存储并记录来源元数据。'),
  ], ['images.edit', 'images.createVariation', 'Stream async iterator']),
  'images.edit': m('core', [
    p('image', 'Uploadable | Uploadable[]', true, '待编辑原图必须符合格式、尺寸和权限要求，上传前验证内容所有权。'),
    p('prompt', 'string', true, '描述目标修改而非隐藏权限指令，服务端需限长并执行内容安全策略。'),
    p('mask', 'Uploadable', false, '可选蒙版限定编辑区域，尺寸和透明通道应与原图规则一致。'),
    p('stream', 'boolean', false, '支持时返回编辑事件流，取消连接不等于已生成资产自动删除。'),
  ], '返回 ImagesResponse 或 ImageEditStreamEvent 流，包含编辑后的图像数据而不是对原文件的原地修改。', [
    e('原图/蒙版格式不匹配或用户编辑无权素材', '上传前做 MIME、尺寸、像素和授权校验，结果单独存储并保留审计。'),
  ], ['images.generate', 'images.createVariation', 'toFile']),
  'images.createVariation': m('advanced', [p('image / model / n', 'Uploadable / string / number', true, '提供有授权的源图及模型和数量，格式、尺寸与费用需在请求前校验。')], '返回 ImagesResponse，其中每项是源图的生成变体；不会修改或覆盖上传的原始图像。', [e('上传不支持格式或批量数量无上限', '预处理为允许格式，限制文件大小和 n，并把结果保存到受控对象存储。')], ['images.generate', 'images.edit', 'toFile']),
  'audio.speech.create': m('core', [
    p('model', 'string', true, '选择语音合成模型并记录版本，需确认语言、声音和数据政策适配。'),
    p('voice / input', 'string / string', true, '指定声音与待朗读文本，输入需限长并正确处理专有名词和数字。'),
    p('response_format / speed', 'string / number', false, '控制音频编码和语速，必须与播放器、带宽和可访问性要求兼容。'),
  ], '返回原始 Web Response 音频体，需要以 arrayBuffer、stream 或 asResponse 路径读取并转发/保存。', [
    e('把响应当 JSON 解析或长文本一次合成导致首音慢', '按正确内容类型流式消费，长文本按自然句切分并传播客户端取消信号。'),
  ], ['APIPromise.asResponse', 'audio.transcriptions.create', 'Stream.controller.abort']),
  'audio.transcriptions.create': m('core', [
    p('file', 'Uploadable', true, '待转写音频文件或流，需限制大小、时长、格式并获得用户录音授权。'),
    p('model', 'string', true, '选择支持所需语言、时间戳和流式能力的转写模型。'),
    p('language / response_format', 'string', false, '明确语言通常更稳定，响应格式决定文本、JSON、时间戳或事件流合同。'),
    p('stream', 'boolean', false, '支持时返回 TranscriptionStreamEvent，临时 delta 不应直接触发确定性业务。'),
  ], '返回 Transcription、字符串或转写事件流，具体类型由 response_format 与 stream 参数共同决定。', [
    e('未按返回格式分支或敏感录音被长期保留', '在 TypeScript 中按参数收窄类型，只保存必要 final 文本并落实音频删除期限。'),
  ], ['audio.translations.create', 'audio.speech.create', 'toFile']),
  'audio.translations.create': m('core', [
    p('file', 'Uploadable', true, '待翻译语音文件，必须验证格式、大小、权限和数据保留要求。'),
    p('model', 'string', true, '选择支持语音翻译的模型，能力不等同于通用文本翻译端点。'),
    p('response_format / prompt', 'string', false, '控制输出合同并可提供术语提示，但提示不能覆盖真实音频内容。'),
  ], '返回 Translation 对象或纯字符串，将源语音内容转换为目标文本；不会生成目标语言音频。', [
    e('把翻译文本当逐字法律记录或语言方向理解错误', '展示模型生成声明，关键场景人工复核，并保留原文转写作对照。'),
  ], ['audio.transcriptions.create', 'audio.speech.create']),
} satisfies Record<string, FrameworkApiLearningMeta>

export const openAiJavascriptSdkLearningMeta = {
  ...clientMeta,
  ...generationMeta,
  ...assetBatchMeta,
  ...vectorStoreMeta,
} satisfies Record<string, FrameworkApiLearningMeta>

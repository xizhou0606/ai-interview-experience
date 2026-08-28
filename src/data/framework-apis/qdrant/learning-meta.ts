import type {
  FrameworkApiErrorCase,
  FrameworkApiLearningMeta,
  FrameworkApiParameter,
} from '../types'

const p = (name: string, type: string, required: boolean, description: string, defaultValue?: string): FrameworkApiParameter => ({
  name, type, required, description, ...(defaultValue === undefined ? {} : { defaultValue }),
})

const e = (condition: string, handling: string): FrameworkApiErrorCase => ({ condition, handling })

const server = (meta: Omit<FrameworkApiLearningMeta, 'runtime'>): FrameworkApiLearningMeta => ({
  runtime: 'server',
  ...meta,
})

/**
 * Structured learning metadata for the 60 learner-facing QdrantClient facade
 * entries. Keys intentionally match each FrameworkApiReference.name exactly.
 * Qdrant credentials, tenant filters and destructive control-plane operations
 * belong in a trusted service/worker, so every entry uses the server runtime.
 */
export const qdrantLearningMeta = {
  'new QdrantClient': server({
    learningLevel: 'core',
    parameters: [
      p('url | host', 'string', true, '二选一的服务地址。url 包含 http/https 协议；host 只写主机名，不能同时传入。'),
      p('apiKey', 'string', false, 'Qdrant Cloud 或启用 API key 的自建服务凭证，只能从服务端秘密配置读取。'),
      p('timeout', 'number', false, '客户端请求超时，单位是毫秒；不要与单个 API options 中通常以秒计的 timeout 混淆。', '300000'),
      p('maxConnections', 'number', false, '底层 HTTP Agent 允许的最大连接数，应与服务并发、Qdrant 限制和部署实例数一起预算。'),
      p('checkCompatibility', 'boolean', false, '是否在构造后检查 JS client 与 Qdrant engine 的主/次版本兼容性。', 'true'),
    ],
    expectedOutput: '一个可复用的 QdrantClient 实例；构造不生成 embedding，也不会自动创建 collection。首次网络调用或兼容检查才会访问服务端。',
    errorCases: [
      e('url/host 配置冲突、地址无协议或 TLS/API key 不匹配', '启动阶段校验配置并执行 versionInfo 健康检查；生产 API key 必须配合 HTTPS。'),
      e('每个请求重复创建客户端导致连接膨胀', '在进程组合根创建单例，复用连接池，并按部署副本数计算 maxConnections。'),
    ], relatedApis: ['versionInfo', 'getCollections', 'QdrantClient.api'],
  }),
  'QdrantClient.api': server({
    learningLevel: 'reference',
    parameters: [p('无显式参数', 'never', false, '调用 client.api() 即可；它返回同一连接配置下的低层 OpenAPI 客户端。')],
    expectedOutput: 'ClientApi。其方法保留 data/status/headers 等 HTTP 结构和 OpenAPI snake_case 参数，不会像 facade 一样自动解包 result。',
    errorCases: [
      e('把低层 response.data 当作 facade 的直接结果', '集中封装 raw client 调用并为响应解包写类型测试，避免业务层混用两套返回合同。'),
      e('升级后生成端点或字段变化', '锁定 @qdrant/js-client-rest 版本，对使用 api() 的少数适配器做契约回归。'),
    ], relatedApis: ['new QdrantClient', 'versionInfo'],
  }),

  getCollections: server({
    learningLevel: 'reference',
    parameters: [p('无显式参数', 'never', false, '列出当前实例可见的 collection 元数据目录，不读取 points。')],
    expectedOutput: 'CollectionsResponse，其中 collections 是包含 collection name 的数组；它不包含 schema、健康状态或点数据。',
    errorCases: [
      e('把目录存在当作 collection 可用', '对目标名称继续调用 getCollection，校验 status、向量配置和索引状态。'),
      e('每次业务查询都先 list 再判断', '已知名称直接调用目标 API；初始化场景用 collectionExists，并处理并发创建竞态。'),
    ], relatedApis: ['collectionExists', 'getCollection', 'createCollection'],
  }),
  getCollection: server({
    learningLevel: 'advanced',
    parameters: [p('collectionName', 'string', true, '要读取的 collection 或 alias 名称；服务端应从受控配置解析，避免任意租户枚举。')],
    expectedOutput: 'CollectionInfo，包含 status、config、payload_schema、points_count、indexed_vectors_count、optimizer_status 等配置与运行信息。',
    errorCases: [
      e('collection 不存在或 alias 已切换', '区分 404 与服务故障；部署校验时重新解析 alias，并给出明确的 schema 初始化提示。'),
      e('把 points_count 当精确业务计数', '它是内部近似指标；需要精确过滤数量时调用 count({ exact: true })。'),
      e('写入向量维度与 config.params.vectors 不一致', '在 embedding 写入前校验命名向量、size 和模型版本，禁止把不同向量空间混入同一槽位。'),
    ], relatedApis: ['getCollections', 'collectionExists', 'count', 'updateCollection'],
  }),
  collectionExists: server({
    learningLevel: 'advanced',
    parameters: [p('collectionName', 'string', true, '要检查的 collection 名称。存在只表示名称可解析，不保证 schema 与应用预期一致。')],
    expectedOutput: 'CollectionExistence，核心字段 exists 为 boolean。',
    errorCases: [
      e('并发执行 exists→create 产生竞争', '允许其中一个 createCollection 返回冲突，随后重新 getCollection 并比较完整 schema。'),
      e('存在同名但维度、distance 或 named vectors 不正确', '不要直接复用；校验配置后采用版本化新 collection 与 alias 迁移。'),
    ], relatedApis: ['createCollection', 'getCollection', 'updateCollectionAliases'],
  }),
  createCollection: server({
    learningLevel: 'core',
    parameters: [
      p('collectionName', 'string', true, '新 collection 的稳定名称，推荐包含数据/embedding schema 版本。'),
      p('vectors', 'VectorParams | Record<string, VectorParams>', true, 'Dense 或命名向量配置；每个 size 必须与实际 embedding 维度完全一致，distance 要匹配模型语义。'),
      p('sparse_vectors', 'Record<string, SparseVectorParams>', false, '稀疏向量命名配置，用于关键词/稀疏模型与 dense 的混合检索。'),
      p('shard_number', 'number', false, '数据水平分片数量；影响扩展与并行，不等同于副本数。'),
      p('replication_factor', 'number', false, '每个 shard 的副本数量；提高可用性与读取能力，也增加存储和写放大。'),
      p('on_disk_payload', 'boolean', false, '是否把 payload 放磁盘以节省内存；频繁过滤字段仍应建立 payload index。'),
    ],
    expectedOutput: 'Promise<boolean>；true 表示 collection 配置已通过控制面提交，不代表随后导入的向量或后台索引已经完成。',
    errorCases: [
      e('embedding 维度与 vectors.size 不匹配', '把模型 ID、维度、归一化策略写入 schema 版本；更换模型时新建 collection，不要原地混写。'),
      e('同名 collection 已存在', '读取并对比 vectors、distance、shard、replica 和索引；兼容则复用，不兼容则创建新版本并切 alias。'),
      e('shard/replica 超过集群容量', '在创建前检查 peer 数、故障域和磁盘，避免副本无法分配导致 yellow/red。'),
    ], relatedApis: ['getCollection', 'collectionExists', 'updateCollection', 'updateCollectionAliases', 'upsert'],
  }),
  updateCollection: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '目标 collection；生产变更前应确认 alias 最终解析到预期版本。'),
      p('args', 'UpdateCollection', false, '可在线更新的 optimizer、HNSW、quantization、replication、strict mode 或向量配置。'),
    ],
    expectedOutput: 'boolean；true 表示配置更新被接受，HNSW/量化重建或副本调整可能仍在后台进行。',
    errorCases: [
      e('尝试修改不可在线迁移的向量维度', '创建新版本 collection、重算 embedding、双读验证后使用 alias 原子切换。'),
      e('索引重建在高峰期耗尽 CPU/内存/磁盘', '先在副本或测试数据压测，变更后通过 getCollection/getOptimizations 观察完成状态。'),
    ], relatedApis: ['getCollection', 'getOptimizations', 'createCollection', 'updateCollectionAliases'],
  }),
  deleteCollection: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '要永久删除的 collection 名称；不能直接使用不可信用户输入。'),
      p('timeout', 'number', false, '服务端等待删除控制面操作的超时秒数，而非 QdrantClient 构造器的毫秒超时。'),
    ],
    expectedOutput: 'boolean；true 表示删除成功，collection 的 points、vectors、payload 与索引均不可再访问。',
    errorCases: [
      e('误删 alias 当前指向或仍在回滚窗口内的 collection', '先检查 aliases、创建并验证 snapshot、停止写入，再通过双人审批执行。'),
      e('删除超时但实际后台已提交', '重新 collectionExists/getCollections 确认最终状态，重试必须幂等，不能仅依赖客户端超时判断。'),
    ], relatedApis: ['listSnapshots', 'createSnapshot', 'getCollectionAliases', 'updateCollectionAliases'],
  }),
  createVectorName: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '需要扩展 named vector schema 的 collection。'),
      p('vectorName', 'string', true, '新向量槽位名称，例如 title、dense_v2；后续写入和查询 using 必须完全一致。'),
      p('config', 'VectorParams | SparseVectorParams', true, '新槽位维度、distance、HNSW/量化等配置；只创建 schema，不为旧 points 生成向量。'),
      p('options', '{ wait?, ordering?, timeout? }', false, '控制是否等待完成、写顺序强度及超时。'),
    ],
    expectedOutput: 'UpdateResult，包含 operation_id 与 acknowledged/completed 状态；旧 point 在回填前不会自动拥有新向量。',
    errorCases: [
      e('旧 points 缺少新命名向量导致查询漏召回', '后台批量回填并统计覆盖率，覆盖达到门禁后才让查询 using 新名称。'),
      e('同名向量已存在但维度或 distance 不同', '读取 getCollection 配置；不兼容时使用新名称或新 collection，不要强行覆盖。'),
    ], relatedApis: ['updateVectors', 'deleteVectorName', 'getCollection', 'query'],
  }),
  deleteVectorName: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '包含待删除 named vector 的 collection。'),
      p('vectorName', 'string', true, '要从 schema 和所有 points 中移除的向量名。'),
      p('options', '{ wait?, ordering?, timeout? }', false, '决定是否等待、写入 ordering 与超时。'),
    ],
    expectedOutput: 'UpdateResult；删除向量槽位及其数据，但保留 point、payload 与其他命名向量。',
    errorCases: [
      e('线上 search/query/prefetch 仍使用旧 vectorName', '先停写、切读并观察无旧 using 流量，再删除；操作前创建 snapshot。'),
      e('删除请求超时后重复提交', '按 operation 状态/getCollection 验证 schema，确保重试不会触发错误迁移判断。'),
    ], relatedApis: ['createVectorName', 'deleteVectors', 'getCollection', 'createSnapshot'],
  }),
  getOptimizations: server({
    learningLevel: 'reference',
    parameters: [
      p('collectionName', 'string', true, '要观察后台 segment merge、indexing 等优化任务的 collection。'),
      p('with / completed_limit', 'OptimizationFilter / number', false, '筛选优化记录并限制已完成历史数量，避免诊断响应过大。'),
    ],
    expectedOutput: 'OptimizationsResponse，包含运行中、排队或已完成的优化操作，用于判断配置变更/批量导入后的后台工作。',
    errorCases: [
      e('把 create/update 返回成功当作索引已 ready', '持续查看 optimization 与 getCollection.optimizer_status，直到达到发布门禁。'),
      e('频繁拉取全部历史影响控制面', '只取需要的状态并限制 completed_limit，持续监控使用 metrics 而不是高频诊断 API。'),
    ], relatedApis: ['getCollection', 'updateCollection', 'upsert'],
  }),
  updateCollectionAliases: server({
    learningLevel: 'advanced',
    parameters: [
      p('actions', 'AliasOperations[]', true, '同一事务中执行 create_alias、delete_alias、rename_alias 等动作，适合原子切换版本。'),
      p('timeout', 'number', false, '服务端处理 alias 控制面事务的超时秒数。'),
    ],
    expectedOutput: 'boolean；一组 alias actions 原子提交，客户端不会看到中间“无 alias”或同时指向两个版本的状态。',
    errorCases: [
      e('新 collection 尚未完成回填/评测就切 alias', '切换前校验维度、点数、过滤、recall 与真实查询，保留旧 collection 回滚窗口。'),
      e('超时后不确定事务是否提交', '调用 getAliases/getCollectionAliases 获取权威映射，再决定是否幂等重试。'),
    ], relatedApis: ['getAliases', 'getCollectionAliases', 'createCollection', 'deleteCollection'],
  }),
  getCollectionAliases: server({
    learningLevel: 'reference',
    parameters: [p('collectionName', 'string', true, '要反查的实际 collection 名称，不是 alias 名。')],
    expectedOutput: 'CollectionsAliasesResponse，列出当前指向该 collection 的 alias 映射。',
    errorCases: [
      e('把没有 alias 误判为 collection 不可访问', 'alias 是可选路由层；需要时仍可使用真实 collectionName。'),
      e('删除 collection 前遗漏 alias', '先读取并迁移/删除 alias，避免业务名称突然解析失败。'),
    ], relatedApis: ['getAliases', 'updateCollectionAliases', 'deleteCollection'],
  }),
  getAliases: server({
    learningLevel: 'reference',
    parameters: [p('无显式参数', 'never', false, '返回当前实例所有 alias 映射，不读取 collection 内容。')],
    expectedOutput: 'CollectionsAliasesResponse，包含 alias_name 到 collection_name 的映射目录。',
    errorCases: [
      e('把全局 alias 目录暴露给普通租户', '只在运维服务调用，并按业务允许列表裁剪展示。'),
      e('读取后再写存在映射竞态', '使用 updateCollectionAliases 原子 actions，并在失败/超时后重新读取权威状态。'),
    ], relatedApis: ['getCollectionAliases', 'updateCollectionAliases', 'getCollections'],
  }),

  upsert: server({
    learningLevel: 'core',
    parameters: [
      p('collectionName', 'string', true, '目标 collection/alias；应由服务端根据租户和索引版本选择。'),
      p('points | batch', 'PointStruct[] | Batch', true, '稳定 point id、与 schema 同维的 vector/named vectors 及 payload；两种输入格式二选一。'),
      p('wait', 'boolean', false, 'true 等待写入应用完成；false 只返回 acknowledged，适合高吞吐但需后续确认。', 'false'),
      p('ordering', 'WriteOrdering', false, 'weak/medium/strong 的副本写顺序权衡；越强通常延迟与可用性成本越高。', 'weak'),
      p('shard_key', 'ShardKeySelector', false, 'custom sharding collection 的业务路由键，必须与创建/查询时一致。'),
    ],
    expectedOutput: 'UpdateResult。相同 point id 再次写入会覆盖对应 point，因此稳定 id 能把重试变为幂等 upsert；但外部副作用仍需独立幂等。',
    errorCases: [
      e('vector 维度、named vector 名或 sparse 格式不符合 collection schema', '写入前读取/缓存 schema 并校验；模型迁移使用新向量名或新 collection。'),
      e('随机 point id 让重试产生重复记录', '用 sourceId + version + chunkIndex 计算稳定 id，并把 embedding/model 版本放入 payload。'),
      e('wait=false 后立即强一致读取看不到最新写入', '按业务选择 wait、ordering 和查询 consistency；后台任务持久化 operation/job 状态并做收敛校验。'),
    ], relatedApis: ['retrieve', 'updateVectors', 'setPayload', 'batchUpdate', 'createCollection'],
  }),
  retrieve: server({
    learningLevel: 'core',
    parameters: [
      p('collectionName', 'string', true, '要按 point id 精确读取的 collection。'),
      p('ids', 'PointId[]', true, '需要读取的 point id 列表；结果只包含存在且对当前 shard/一致性可见的记录。'),
      p('with_payload', 'boolean | PayloadSelector', false, '是否返回 payload 或只选择必要字段，避免把正文/敏感信息全部拉回。', 'true'),
      p('with_vector', 'boolean | string[]', false, '是否返回向量；向量体积大，普通详情接口通常关闭。', 'false'),
      p('consistency', 'ReadConsistency', false, '读取副本一致性要求，例如数字因子、majority、quorum 或 all。'),
    ],
    expectedOutput: 'Record[]，顺序和缺失项不能假定与 ids 完全一一对应；每项包含 id 及请求选择的 payload/vector。',
    errorCases: [
      e('ids 中部分不存在或已删除', '按返回 id 建 Map 再与输入对齐，明确区分 missing，不要按数组位置直接配对。'),
      e('consistency 过强导致副本故障时不可读', '根据业务陈旧度容忍选择 consistency，并监控副本健康；关键确认读可提高一致性。'),
      e('with_vector=true 导致响应巨大', '只在迁移/诊断时取向量，按命名向量选择并限制 ids 数量。'),
    ], relatedApis: ['upsert', 'scroll', 'delete', 'getCollection'],
  }),
  delete: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '要删除 points 的 collection。'),
      p('points | filter', 'PointId[] | Filter', true, '按明确 ids 或 payload filter 选择删除范围，二选一。'),
      p('wait', 'boolean', false, '是否等待删除应用完成；合规删除通常等待并复核。', 'false'),
      p('ordering', 'WriteOrdering', false, '删除在副本间的写入顺序强度。', 'weak'),
    ],
    expectedOutput: 'UpdateResult；删除 point 会移除其 vectors 与 payload。filter 删除可能影响大量数据，结果不返回被删明细。',
    errorCases: [
      e('filter 为空、过宽或漏掉 tenant 条件', '服务端强制注入租户 must 条件，删除前先 count/scroll 预览并设置数量上限。'),
      e('客户端超时后重复删除', '按幂等删除处理并复核 count/retrieve；保留审计记录而不是依赖返回数组。'),
    ], relatedApis: ['retrieve', 'count', 'scroll', 'clearPayload', 'deleteCollection'],
  }),
  updateVectors: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '包含目标 points 的 collection。'),
      p('points', 'PointVectors[]', true, 'point id 与要新增/替换的 vector 或 named vectors；维度必须匹配各自配置。'),
      p('wait / ordering', 'boolean / WriteOrdering', false, '控制是否等待和副本写顺序。'),
      p('shard_key', 'ShardKeySelector', false, 'custom sharding 的路由键，必须能定位这些 points。'),
    ],
    expectedOutput: 'UpdateResult；只修改指定向量，不改 point payload 或未包含的其他命名向量。',
    errorCases: [
      e('新 embedding 维度或向量名错误', '依据 getCollection schema 校验，并将模型版本与向量名绑定。'),
      e('批量回填中部分 point 不存在或覆盖新版本', '按 source/version 建幂等任务，读取当前 payload 版本后再更新，并记录覆盖率。'),
    ], relatedApis: ['upsert', 'deleteVectors', 'createVectorName', 'retrieve'],
  }),
  deleteVectors: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '目标 collection。'),
      p('points | filter', 'PointId[] | Filter', true, '选择要移除向量的 points；filter 必须包含租户边界。'),
      p('vector', 'string[]', true, '要删除的 named vector 名称列表；point 与 payload 仍保留。'),
      p('wait / ordering / shard_key', 'boolean / WriteOrdering / ShardKeySelector', false, '控制写完成、一致顺序和 custom shard 路由。'),
    ],
    expectedOutput: 'UpdateResult；所选 points 不再具有指定 named vectors，其他向量与 payload 不变。',
    errorCases: [
      e('仍有 query/search using 被删除向量', '先切换读路径并确认覆盖率和流量归零，再分批删除。'),
      e('filter 误选跨租户 points', '服务端合并强制 tenant filter，执行前 count 并限制最大影响数。'),
    ], relatedApis: ['updateVectors', 'deleteVectorName', 'retrieve', 'count'],
  }),
  setPayload: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '目标 collection。'),
      p('payload', 'Payload', true, '要合并写入的字段；未提及的既有字段继续保留。'),
      p('points | filter', 'PointId[] | Filter', true, '目标 points 选择器，二选一并强制租户范围。'),
      p('key', 'string', false, '可选嵌套路径；用于把 payload 写到指定子对象。'),
      p('wait / ordering', 'boolean / WriteOrdering', false, '控制完成等待与副本写顺序。'),
    ],
    expectedOutput: 'UpdateResult；将 payload 字段合并到目标 points，向量不变。',
    errorCases: [
      e('误以为 setPayload 会删除未提供字段', '需要完整替换时使用 overwritePayload；需要删字段时用 deletePayload。'),
      e('写入字段类型与 payload index schema 不一致', '在应用 schema 层验证类型，变更字段类型前重建对应 payload index。'),
    ], relatedApis: ['overwritePayload', 'deletePayload', 'clearPayload', 'createPayloadIndex'],
  }),
  overwritePayload: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '目标 collection。'),
      p('payload', 'Payload', true, '替换后的完整 payload；目标层级原有未提供字段会被移除。'),
      p('points | filter', 'PointId[] | Filter', true, '要覆盖的 points 选择器，必须限制租户和影响数量。'),
      p('key', 'string', false, '只覆盖指定嵌套路径；省略时覆盖整个 payload。'),
      p('wait / ordering', 'boolean / WriteOrdering', false, '控制写完成等待与副本顺序。'),
    ],
    expectedOutput: 'UpdateResult；目标 payload 或 key 子树被完整替换，vectors 不变。',
    errorCases: [
      e('只想更新一个字段却误删其他 payload', '普通部分更新使用 setPayload；覆盖前 retrieve/scroll 验证目标结构。'),
      e('并发写导致较旧完整对象覆盖新字段', '使用版本字段、串行化同 point 更新或改为细粒度 setPayload。'),
    ], relatedApis: ['setPayload', 'deletePayload', 'clearPayload', 'retrieve'],
  }),
  deletePayload: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '目标 collection。'),
      p('keys', 'string[]', true, '要从 payload 删除的字段或嵌套路径。'),
      p('points | filter', 'PointId[] | Filter', true, '目标 points；filter 必须带租户边界。'),
      p('wait / ordering', 'boolean / WriteOrdering', false, '控制删除完成等待与副本写顺序。'),
    ],
    expectedOutput: 'UpdateResult；只移除指定 payload keys，不影响其他 payload 或 vectors。',
    errorCases: [
      e('删除仍用于 filter/group/facet 的字段', '先迁移查询、索引和业务 schema，再分批删除并做回归。'),
      e('错误 key 路径或过宽 filter', '使用固定字段 allowlist，先 scroll 少量样本和 count 预览影响范围。'),
    ], relatedApis: ['setPayload', 'overwritePayload', 'clearPayload', 'deletePayloadIndex'],
  }),
  clearPayload: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '目标 collection。'),
      p('points | filter', 'PointId[] | Filter', true, '要清空全部 payload 的 points；vectors 和 point id 会保留。'),
      p('wait / ordering', 'boolean / WriteOrdering', false, '控制完成等待与副本写顺序。'),
    ],
    expectedOutput: 'UpdateResult；目标 points 的全部 payload 被清空，向量仍可被无过滤搜索召回。',
    errorCases: [
      e('清空租户/权限字段后 points 仍存在并可能被召回', '若数据应彻底删除用 delete；如果只清业务字段，保留不可缺失的安全字段并重新验证查询过滤。'),
      e('filter 选中范围过大', '先 count exact、抽样 scroll 并设置审批阈值，服务端强制租户条件。'),
    ], relatedApis: ['deletePayload', 'delete', 'setPayload', 'count'],
  }),
  batchUpdate: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '同一批操作所属的 collection。'),
      p('operations', 'PointsUpdateOperation[]', true, '有序的 upsert/delete/vector/payload 操作列表；每项都有自己的选择器和语义。'),
      p('wait', 'boolean', false, '是否等待批操作应用完成。', 'false'),
      p('ordering', 'WriteOrdering', false, '批操作在副本上的写顺序强度。', 'weak'),
      p('timeout', 'number', false, '覆盖本次批量写操作的服务端等待上限，单位是秒；超时只表示客户端未等到最终响应，不能据此断定所有 operations 都未执行。'),
    ],
    expectedOutput: 'UpdateResult[]，与 operations 顺序对应；批量减少网络往返，但不能假定跨所有业务系统形成事务。',
    errorCases: [
      e('某项失败后调用方不知道已应用范围', '按索引映射结果，操作使用稳定 point id 和幂等语义；复杂工作流持久化批次状态。'),
      e('批次过大导致超时和重试成本放大', '按点数/字节分块，设置有界并发，并只重试未确认分片。'),
    ], relatedApis: ['upsert', 'delete', 'updateVectors', 'setPayload'],
  }),
  scroll: server({
    learningLevel: 'core',
    parameters: [
      p('collectionName', 'string', true, '要遍历 points 的 collection。'),
      p('filter', 'Filter', false, '服务端过滤条件；多租户必须注入 tenant/workspace must 条件。'),
      p('limit', 'number', false, '单页最大 points 数，按响应大小与处理能力设置，避免一次拉全库。', '10'),
      p('offset', 'PointId', false, '上一页 next_page_offset；它是续游标，不是数字页码。'),
      p('with_payload / with_vector', 'boolean | selector', false, '只返回任务需要的 payload 字段；批处理通常关闭 vectors。'),
      p('order_by', 'OrderBy', false, '按已建索引的 payload 字段排序；使用时分页语义不同于默认 point-id scroll。'),
    ],
    expectedOutput: 'ScrollResult，包含 points 和可选 next_page_offset；下一页必须传回该 offset，直到它缺失，而不是用数组长度猜结束。',
    errorCases: [
      e('使用深 offset/页码或一次 limit 过大', '坚持 cursor/next_page_offset 分页并限制响应字节；长任务保存 checkpoint。'),
      e('分页过程中 points 持续写入/删除导致非快照结果', '接受最终一致扫描，或冻结业务版本/使用稳定过滤；不要把一次 scroll 当数据库事务快照。'),
      e('遗漏 tenant filter 导致跨租户遍历', '服务端在适配器强制合并安全过滤，不接受模型或浏览器传入的租户身份。'),
    ], relatedApis: ['count', 'retrieve', 'search', 'facet'],
  }),
  count: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '要统计的 collection。'),
      p('filter', 'Filter', false, '只统计满足条件的 points；权限/租户过滤必须服务端注入。'),
      p('exact', 'boolean', false, 'true 做精确计数，false 允许近似以换取速度；索引进行中时近似值尤其可能不可靠。', 'true'),
      p('shard_key', 'ShardKeySelector', false, '限制 custom shard key 范围，减少扫描并维持租户路由。'),
      p('timeout', 'number', false, '限制服务端执行过滤与精确计数的时间，单位是秒；复杂 exact count 超时后应缩小 filter 或补建 payload index。'),
    ],
    expectedOutput: 'CountResult.count；exact=false 适合估算和看板，exact=true 才适合需要精确范围确认的管理操作。',
    errorCases: [
      e('对复杂 filter 高频 exact count 造成高负载', '为过滤字段建 payload index，缓存非关键统计，并给管理请求设置超时。'),
      e('把 getCollection.points_count 当过滤后的精确结果', '使用本 API 并显式 exact:true；仍需理解并发写会让前后两次计数变化。'),
    ], relatedApis: ['scroll', 'getCollection', 'createPayloadIndex', 'facet'],
  }),

  search: server({
    learningLevel: 'core',
    parameters: [
      p('collectionName', 'string', true, '目标向量 collection/alias。'),
      p('vector', 'number[] | NamedVector', true, '查询 embedding；维度、模型和归一化策略必须与 using 指定的入库向量空间一致。'),
      p('filter', 'Filter', false, '结构化 payload 条件；多租户检索必须服务端强制注入。'),
      p('limit / offset', 'number', false, '返回数量和浅层偏移；深 offset 性能差，复杂新检索优先 query。'),
      p('using', 'string', false, '选择 named vector；省略时使用默认向量。'),
      p('score_threshold', 'number', false, '过滤低相关候选；阈值方向取决于 distance，必须离线校准。'),
      p('with_payload / with_vector', 'boolean | selector', false, '控制返回字段；RAG 通常只取必要 payload，不返回向量。'),
    ],
    expectedOutput: 'ScoredPoint[]，按当前 distance 的相关顺序返回 id、score 及选择的 payload/vector；ANN 结果是近似召回。',
    errorCases: [
      e('query 向量维度或 named vector using 不匹配', '在 embedding adapter 校验模型版本和维度，并让 collection schema 与配置一起发布。'),
      e('遗漏 payload filter 造成跨租户召回', '安全 filter 在服务端适配层强制合并，不能由 prompt 或模型参数决定。'),
      e('把 score 跨 distance、模型或查询直接比较', '按具体向量空间离线标定 threshold；最终质量用 recall@k、MRR 和答案指标评估。'),
    ], relatedApis: ['query', 'searchBatch', 'searchPointGroups', 'createPayloadIndex'],
  }),
  searchBatch: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '所有批内 search 所属的同一 collection。'),
      p('searches', 'SearchRequest[]', true, '独立查询数组；每项都应携带自己的 vector、filter、limit 与 using。'),
      p('consistency', 'ReadConsistency', false, '指定整批搜索读取多少副本以及如何达成 majority、quorum 或 all；级别越强越能减少陈旧读，但副本异常时越容易失败或增大延迟。'),
      p('timeout', 'number', false, '限制服务端完成整批搜索的时间，单位是秒；任一重查询都可能拖高整批尾延迟，超时后应缩小批次而不是无界重试。'),
    ],
    expectedOutput: 'ScoredPoint[][]，外层数组与 searches 顺序严格对应；批量只减少网络往返，不会融合不同查询排名。',
    errorCases: [
      e('结果与请求按内容而不是索引配对', '为每个业务查询保留本地 query id，并按数组位置映射。'),
      e('单批过大或某个重查询拖高整批尾延迟', '按总候选数/字节分块，限制 batch 大小和 timeout。'),
    ], relatedApis: ['search', 'queryBatch', 'recommendBatch'],
  }),
  recommend: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '包含正负样本和候选向量的 collection。'),
      p('positive', 'RecommendExample[]', true, '喜欢的 point id 或原始向量样本，至少一个。'),
      p('negative', 'RecommendExample[]', false, '不喜欢的样本，用于把检索方向远离这些区域。'),
      p('strategy', 'RecommendStrategy', false, '正负样本聚合策略，例如 average_vector 或 best_score。'),
      p('using / filter / limit', 'string / Filter / number', false, '选择向量空间、租户过滤和候选数量。'),
    ],
    expectedOutput: 'ScoredPoint[]，按推荐策略得到的相关度排序；样本只定义检索方向，不等于业务反馈模型已经训练。',
    errorCases: [
      e('引用的 point id 不存在、无目标向量或跨租户', '先按可信租户验证样本归属；using 必须选择所有样本都具备的向量空间。'),
      e('冷启动或反馈偏差导致结果单一', '设计默认召回与多样性策略，用离线/在线指标比较 recommend、discover 和 query fusion。'),
    ], relatedApis: ['recommendBatch', 'recommendPointGroups', 'discoverPoints', 'query'],
  }),
  recommendBatch: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '批内所有推荐所属 collection。'),
      p('searches', 'RecommendRequest[]', true, '独立推荐请求数组，每项分别包含正负样本、filter 与 using。'),
      p('consistency', 'ReadConsistency', false, '指定整批推荐读取多少副本以及如何达成 majority、quorum 或 all；更强一致性降低陈旧样本风险，也会增加延迟与失败概率。'),
      p('timeout', 'number', false, '限制服务端完成整批推荐的时间，单位是秒；复杂正负样本可能放大尾延迟，超时后应拆小批次并只重试未确认请求。'),
    ],
    expectedOutput: 'ScoredPoint[][]，与 searches 同序；每个子数组是独立推荐结果，不会跨用户融合。',
    errorCases: [
      e('批内不同租户请求复用同一个 filter', '为每项从可信身份注入独立 tenant filter，并限制一批可混合的安全作用域。'),
      e('批次失败导致重复昂贵请求', '按稳定 query id 分块并记录完成分片，只重试未确认批次。'),
    ], relatedApis: ['recommend', 'searchBatch', 'queryBatch'],
  }),
  searchPointGroups: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '目标 collection。'),
      p('vector', 'number[] | NamedVector', true, '与目标向量空间相匹配的 query vector。'),
      p('group_by', 'string', true, 'payload 分组字段，例如 document_id；应建立 keyword/integer payload index。'),
      p('group_size', 'number', true, '每个 group 最多保留的 points 数量。'),
      p('limit', 'number', true, '最多返回的 group 数量，而不是 point 总量。'),
      p('filter / using', 'Filter / string', false, '租户过滤与 named vector 选择。'),
    ],
    expectedOutput: 'GroupsResult，包含按 group_by 聚合的 group 列表及组内 ScoredPoint；适合把多个 chunk 收敛到父文档。',
    errorCases: [
      e('group_by 字段缺失、类型不稳定或未索引', '写入时保证字段存在且类型统一，创建 payload index，并对缺失数据单独治理。'),
      e('group_size × limit 过大造成响应和上下文膨胀', '先定义最终文档/片段预算，只返回展示与 rerank 所需字段。'),
    ], relatedApis: ['search', 'queryGroups', 'recommendPointGroups', 'createPayloadIndex'],
  }),
  recommendPointGroups: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '目标 collection。'),
      p('positive / negative', 'RecommendExample[]', true, '正样本必需、负样本可选，用于形成推荐方向。'),
      p('group_by', 'string', true, '控制多样性的 payload 分组字段。'),
      p('group_size', 'number', true, '每组返回 points 上限。'),
      p('limit', 'number', true, '返回 group 数量上限。'),
      p('using / filter', 'string / Filter', false, '向量空间与租户/业务过滤。'),
    ],
    expectedOutput: 'GroupsResult；先按推荐语义打分，再按 payload key 分组，避免同一文档或品牌占满结果。',
    errorCases: [
      e('样本向量空间与 using 不兼容', '确认所有 id 具备相同 named vector，迁移期间只使用覆盖率达标的空间。'),
      e('group 字段未索引或存在跨租户值冲突', '建立 payload index，并让 filter 先限定租户后再分组。'),
    ], relatedApis: ['recommend', 'searchPointGroups', 'queryGroups', 'createPayloadIndex'],
  }),
  discoverPoints: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '用于探索候选的 collection。'),
      p('target', 'RecommendExample', true, '希望靠近的目标 point/vector。'),
      p('context', 'ContextExamplePair[]', true, '多组 positive/negative 对，用于表达探索方向。'),
      p('using / filter / limit', 'string / Filter / number', false, '向量空间、租户过滤和返回数量。'),
    ],
    expectedOutput: 'ScoredPoint[]；结果既考虑接近 target，也参考 context pairs 的方向偏好。',
    errorCases: [
      e('context 正负样本噪声或相互冲突', '保存样本来源并离线评测，限制单个用户反馈对结果的支配。'),
      e('point id 缺向量、using 错误或跨租户引用', '服务端验证 id 归属和向量覆盖，始终注入租户 filter。'),
    ], relatedApis: ['discoverBatchPoints', 'recommend', 'query'],
  }),
  discoverBatchPoints: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '批内所有 discover 请求所属 collection。'),
      p('searches', 'DiscoverRequest[]', true, '独立 target/context 查询数组。'),
      p('consistency', 'ReadConsistency', false, '指定整批探索查询读取多少副本以及如何达成 majority、quorum 或 all；更强一致性会减少陈旧读，同时提高延迟和副本故障敏感度。'),
      p('timeout', 'number', false, '限制服务端完成整批探索查询的时间，单位是秒；过多 context pairs 会拖高尾延迟，超时后应缩小上下文与批次。'),
    ],
    expectedOutput: 'ScoredPoint[][]，按 searches 顺序一一返回独立探索结果。',
    errorCases: [
      e('批结果丢失 query 身份或顺序映射错误', '调用侧保留同序 query id，不按返回 point 内容猜对应请求。'),
      e('批量上下文过大造成尾延迟', '限制每个 context pair 数和整批候选预算，按租户/用途分块。'),
    ], relatedApis: ['discoverPoints', 'queryBatch', 'searchBatch'],
  }),
  query: server({
    learningLevel: 'core',
    parameters: [
      p('collectionName', 'string', true, '目标 collection/alias。'),
      p('query', 'Query', false, 'nearest、recommend、discover、sample、fusion、formula 等主查询；省略时可配 prefetch 做纯融合。'),
      p('prefetch', 'Prefetch | Prefetch[]', false, '先执行的候选召回层，可组合 dense、sparse 或多阶段检索；limit 要为最终重排留足候选。'),
      p('using', 'string', false, '主 query 使用的 named vector。'),
      p('filter', 'Filter', false, '应用于主查询的结构化条件；多租户必须服务端注入。'),
      p('params', 'SearchParams', false, 'HNSW exact、ef、量化等查询参数，影响召回率与延迟。'),
      p('limit / offset', 'number', false, '最终返回数量与浅层偏移。'),
      p('consistency', 'ReadConsistency', false, '指定本次 Query 的副本读取一致性（因子、majority、quorum 或 all）；更强一致性降低陈旧读风险，也会增加延迟和副本故障时的失败概率。'),
    ],
    expectedOutput: 'QueryResponse.points；可表达单向量、hybrid RRF、两阶段 rerank、推荐、发现、采样或公式打分，是新复杂检索的统一入口。',
    errorCases: [
      e('prefetch limit 小于最终 limit，重排没有足够候选', '按目标 recall 和 rerank 预算设置候选池，离线评测不同 prefetch/limit。'),
      e('dense/sparse 分数尺度不同却直接相加', '使用 RRF/DBSF 等明确 fusion 或归一化公式，不要盲目比较原始 score。'),
      e('filter、using、向量维度在子 prefetch 与主 query 中不一致', '把查询计划建成类型化配置，逐层校验 named vector、租户范围和返回字段。'),
    ], relatedApis: ['search', 'queryBatch', 'queryGroups', 'createPayloadIndex', 'facet'],
  }),
  queryBatch: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '所有统一查询所属的同一 collection。'),
      p('searches', 'QueryRequest[]', true, '独立 query/prefetch/filter 计划数组。'),
      p('consistency', 'ReadConsistency', false, '指定整批 Query 读取多少副本以及如何达成 majority、quorum 或 all；级别越强越能减少陈旧读，但复杂批次的延迟与失败概率也越高。'),
      p('timeout', 'number', false, '限制服务端完成整批 Query 的时间，单位是秒；任一多阶段查询都可能拖高尾延迟，超时后应按候选预算拆分批次。'),
    ],
    expectedOutput: 'QueryResponse[]，与 searches 同序；每项可拥有自己的多阶段或 hybrid 查询计划。',
    errorCases: [
      e('某个复杂 query 拖慢整批或放大候选总量', '按总 prefetch candidates 和估算成本分批，给每项设置合理 limit。'),
      e('不同租户查询共用错误 filter', '逐项从可信身份注入 tenant 条件，批处理不能削弱隔离。'),
    ], relatedApis: ['query', 'searchBatch', 'discoverBatchPoints'],
  }),
  queryGroups: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '目标 collection。'),
      p('query / prefetch', 'Query / Prefetch[]', false, '主查询与候选召回计划，可表达 hybrid 和多阶段检索。'),
      p('group_by', 'string', true, '父文档/品牌等 payload 分组字段，应建立索引。'),
      p('group_size', 'number', true, '每组保留的 points 数。'),
      p('limit', 'number', true, '返回 group 数上限。'),
      p('with_lookup', 'WithLookup', false, '按 group key 从另一 collection 回查父记录与必要 payload/vector。'),
      p('filter / using', 'Filter / string', false, 'filter 在服务端限定租户与业务候选范围；using 选择主查询使用的 named vector，两者都必须与 prefetch 和 collection schema 保持一致。'),
    ],
    expectedOutput: 'GroupsResult；返回按 group_by 聚合的 query 结果，可借助 with_lookup 补充父文档信息。',
    errorCases: [
      e('group_by 值与 lookup collection point id 类型不一致', '统一父键类型并在写入时校验，发布前用固定样本验证 lookup 命中。'),
      e('prefetch、group_size、limit 和 lookup payload 组合导致响应过大', '分别设置候选、分组和字段预算，只取生成引用所需信息。'),
    ], relatedApis: ['query', 'searchPointGroups', 'recommendPointGroups', 'createPayloadIndex'],
  }),
  facet: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '要做 payload 聚合的 collection。'),
      p('key', 'string', true, '需要列出唯一值及计数的 payload 字段，通常是 keyword/integer。'),
      p('filter', 'Filter', false, '先限制统计范围；租户边界必须由服务端注入。'),
      p('limit', 'number', false, '最多返回 facet values 数量。'),
      p('exact', 'boolean', false, '是否要求精确计数；精确模式成本更高。', 'false'),
      p('shard_key', 'ShardKeySelector', false, '限制 custom sharding 范围。'),
    ],
    expectedOutput: 'FacetResponse，返回 key 的唯一值及 count，可用于搜索筛选器或数据分布诊断。',
    errorCases: [
      e('字段未建立可用 payload index', '先 createPayloadIndex 并确认 schema 类型；strict mode 下未索引查询可能被拒绝。'),
      e('把 limit 内结果当作全部唯一值', '处理分页/上限语义，在 UI 明确“热门值”而不是宣称全集。'),
    ], relatedApis: ['createPayloadIndex', 'count', 'scroll', 'query'],
  }),
  searchMatrixPairs: server({
    learningLevel: 'reference',
    parameters: [
      p('collectionName', 'string', true, '用于样本相似关系分析的 collection。'),
      p('filter', 'Filter', false, '限制参与采样的 points 范围。'),
      p('sample', 'number', false, '用于矩阵计算的采样点数；完整 N×N 成本是平方级。'),
      p('limit', 'number', false, '每个样本保留的近邻关系数量。'),
      p('using', 'string', false, '选择参与距离计算的 named vector。'),
    ],
    expectedOutput: 'SearchMatrixPairsResponse，以 point id 对和 score 表示采样相似关系，适合边列表、重复检测和探索分析。',
    errorCases: [
      e('sample/limit 无界导致平方级计算和传输', '设置小样本和邻接上限，离线执行并监控集群负载。'),
      e('把采样矩阵当作全库统计真相', '记录采样策略并重复验证；生产检索质量仍使用固定评测集。'),
    ], relatedApis: ['searchMatrixOffsets', 'search', 'query'],
  }),
  searchMatrixOffsets: server({
    learningLevel: 'reference',
    parameters: [
      p('collectionName', 'string', true, '用于矩阵分析的 collection。'),
      p('filter', 'Filter', false, '在矩阵采样前限定可参与的 points；多租户场景必须注入 tenant 条件，避免样本关系跨越授权边界。'),
      p('sample', 'number', false, '参与矩阵计算的样本数量。'),
      p('limit', 'number', false, '限制每个采样 point 保留的近邻关系数量；值越大，offsets、scores 响应和矩阵重建成本越高。'),
      p('using', 'string', false, '选择 named vector 空间。'),
    ],
    expectedOutput: 'SearchMatrixOffsetsResponse，返回 ids、offsets 与 scores 的紧凑矩阵编码；offset 是 ids 数组位置，不是 point id。',
    errorCases: [
      e('把 offset 当作真实 point id', '严格按官方 ids/offsets 语义重建关系，并写小样本单测。'),
      e('大 sample/limit 占用过多内存', '限制矩阵规模，分批/离线处理，展示层只传必要子集。'),
    ], relatedApis: ['searchMatrixPairs', 'search', 'query'],
  }),

  createPayloadIndex: server({
    learningLevel: 'core',
    parameters: [
      p('collectionName', 'string', true, '要建立过滤访问路径的 collection。'),
      p('field_name', 'string', true, '经常参与 filter、group_by、facet 或 order_by 的 payload 字段路径。'),
      p('field_schema', 'PayloadSchemaType | PayloadIndexParams', true, 'keyword、integer、float、geo、text 等索引类型，必须与实际 payload 值匹配。'),
      p('wait', 'boolean', false, '是否等待索引构建完成；大量历史数据时可能耗时。', 'false'),
      p('ordering', 'WriteOrdering', false, '索引 schema 更新在副本间的写顺序。', 'weak'),
    ],
    expectedOutput: 'UpdateResult；索引让过滤更快并提供 cardinality estimation，帮助 planner 选择 payload-first、全扫或 filterable HNSW。',
    errorCases: [
      e('field_schema 与既有 payload 类型不一致', '先 scroll 抽样/离线校验并清洗数据；不要让同一字段混用 string 与 number。'),
      e('给所有字段建索引导致内存和写入成本上升', '只索引真实查询字段，依据 filter 使用率、选择性与延迟决定。'),
      e('wait=false 后立即依赖索引或 strict mode', '观察 getCollection.payload_schema/优化状态，索引 ready 后再开启强制策略。'),
    ], relatedApis: ['deletePayloadIndex', 'getCollection', 'query', 'facet', 'scroll'],
  }),
  deletePayloadIndex: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '包含待删除 payload index 的 collection。'),
      p('fieldName', 'string', true, '索引字段路径；删除索引不会删除 payload 值。'),
      p('wait / ordering / timeout', 'boolean / WriteOrdering / number', false, '控制是否等待、副本写顺序与服务端超时。'),
    ],
    expectedOutput: 'UpdateResult；物理访问路径被移除，字段数据仍存在，但过滤可能退化为扫描或在 strict mode 下被拒绝。',
    errorCases: [
      e('线上 filter/facet/group_by 仍依赖该索引', '先审计查询、压测无索引性能并调整 strict mode，再删除。'),
      e('误以为删除索引同时删除敏感字段', '需要数据删除时使用 deletePayload/clearPayload/delete，并单独验证结果。'),
    ], relatedApis: ['createPayloadIndex', 'deletePayload', 'getCollection', 'facet'],
  }),

  listSnapshots: server({
    learningLevel: 'reference',
    parameters: [p('collectionName', 'string', true, '要列出当前节点 collection snapshots 的名称。')],
    expectedOutput: 'SnapshotDescription[]，包含 name、size、creation_time、checksum 等；只代表当前节点可见快照。',
    errorCases: [
      e('把单节点快照列表当作整个集群备份覆盖', '记录每个 shard/peer 的备份拓扑，或使用适合部署形态的托管 backup。'),
      e('只看快照存在但未验证 checksum/恢复', '复制到独立故障域并定期 recover 到隔离环境演练。'),
    ], relatedApis: ['createSnapshot', 'deleteSnapshot', 'recoverSnapshot', 'listShardSnapshots'],
  }),
  createSnapshot: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '当前节点上需要快照的 collection。'),
      p('wait', 'boolean', false, '是否等待快照文件创建完成；异步路径可能暂时返回 null。', 'true'),
    ],
    expectedOutput: 'SnapshotDescription 或 null；成功描述含文件名、大小、时间与 checksum。快照不包含 alias 映射。',
    errorCases: [
      e('磁盘空间不足或高峰期 I/O 影响查询', '备份前检查容量，在低峰执行并监控延迟；完成后立即异地复制。'),
      e('分布式 collection 只在一个 peer 创建快照', '按 shard/replica 拓扑制定完整备份，不能把局部文件当集群恢复点。'),
    ], relatedApis: ['listSnapshots', 'recoverSnapshot', 'deleteSnapshot', 'getAliases'],
  }),
  deleteSnapshot: server({
    learningLevel: 'reference',
    parameters: [
      p('collectionName', 'string', true, '快照所属 collection。'),
      p('snapshotName', 'string', true, '从 listSnapshots 获得的快照文件名，不能使用任意路径输入。'),
      p('wait', 'boolean', false, 'true 时等待 collection 快照文件删除完成再返回；false 只确认删除已受理，后续应重新 listSnapshots 验证文件确实消失。'),
    ],
    expectedOutput: 'boolean；删除本地 collection snapshot 文件，不影响当前线上 collection。',
    errorCases: [
      e('远端副本未验证就清理最后一个恢复点', '执行保留策略前核验 checksum、对象存储副本和恢复演练记录。'),
      e('snapshotName 来自不可信输入', '只允许删除 listSnapshots 返回且属于目标 collection 的名称，并记录审计。'),
    ], relatedApis: ['listSnapshots', 'createSnapshot', 'recoverSnapshot'],
  }),
  listFullSnapshots: server({
    learningLevel: 'reference',
    parameters: [p('无显式参数', 'never', false, '列出当前节点整个 Qdrant storage 的 full snapshots。')],
    expectedOutput: 'SnapshotDescription[]；每个文件覆盖该节点上的全部 collections，但不是多节点集群的全局一致备份。',
    errorCases: [
      e('普通业务用户获得节点备份拓扑', '将端点限制在运维网络与服务身份，日志脱敏路径和环境信息。'),
      e('只备份一个节点', '为全部 peer 协调恢复点或使用平台级备份，明确 RPO/RTO。'),
    ], relatedApis: ['createFullSnapshot', 'deleteFullSnapshot', 'listSnapshots'],
  }),
  createFullSnapshot: server({
    learningLevel: 'advanced',
    parameters: [p('wait', 'boolean', false, '是否等待当前节点全 storage 快照完成。', 'true')],
    expectedOutput: 'SnapshotDescription，描述当前节点所有 collections 的全量快照文件。',
    errorCases: [
      e('全量快照导致显著磁盘和 I/O 压力', '在低峰执行、预留容量并限制并行；快照完成后移出本机故障域。'),
      e('误认为单个 full snapshot 可恢复整个集群', '记录节点/peer 对应关系，协调所有节点恢复点并定期演练。'),
    ], relatedApis: ['listFullSnapshots', 'deleteFullSnapshot', 'createSnapshot'],
  }),
  deleteFullSnapshot: server({
    learningLevel: 'reference',
    parameters: [
      p('snapshotName', 'string', true, '从 listFullSnapshots 获取的节点级快照名。'),
      p('wait', 'boolean', false, 'true 时等待节点级 full snapshot 删除完成再返回；false 只确认删除已受理，后续应重新 listFullSnapshots 验证文件确实消失。'),
    ],
    expectedOutput: 'boolean；移除当前节点的 full snapshot 文件，不删除线上 collections。',
    errorCases: [
      e('误删影响多个 collections 的唯一恢复点', '执行跨 collection 保留策略和双人审批，先验证异地副本。'),
      e('任意文件名注入或跨节点混淆', '只接受当前节点 listFullSnapshots 目录中的精确名称。'),
    ], relatedApis: ['listFullSnapshots', 'createFullSnapshot'],
  }),
  recoverSnapshot: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '要被创建或覆盖恢复的目标 collection。'),
      p('location', 'string', true, 'Qdrant 可访问的 snapshot URL 或 file URI；必须来自受控备份目录/域名。'),
      p('priority', 'SnapshotPriority', false, '决定 snapshot、现有 replica 或较新数据谁是 source of truth。'),
      p('checksum', 'string', false, '期望的快照校验和，防止损坏或拿错文件。'),
      p('api_key', 'string', false, 'Qdrant 拉取受保护远程 snapshot 时使用的凭证，应短期且避免日志输出。'),
    ],
    expectedOutput: 'boolean；恢复请求成功后 collection 数据可能被 snapshot 覆盖，并按 priority 与副本同步。',
    errorCases: [
      e('priority 选择错误覆盖健康副本或让旧数据胜出', '在隔离环境演练，确认拓扑和时间点；生产恢复前停止写入并记录 source of truth 决策。'),
      e('location 导致 SSRF、凭证泄露或 checksum 不符', '限制 scheme/host/path，使用短期下载凭证并强制 checksum。'),
      e('快照与 Qdrant 版本/collection schema 不兼容', '先验证 versionInfo 和恢复兼容矩阵，在独立实例试恢复后再切流量。'),
    ], relatedApis: ['listSnapshots', 'createSnapshot', 'getCollection', 'updateCollectionAliases'],
  }),
  recoverShardFromSnapshot: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '包含目标 shard 的 collection。'),
      p('shardId', 'number', true, '要恢复的具体 shard 编号，必须与当前集群拓扑匹配。'),
      p('location', 'string', true, '该 shard snapshot 的受控 URL/file URI。'),
      p('priority', 'SnapshotPriority', false, '决定 snapshot 与已有 replica 的数据优先级。'),
      p('checksum / wait', 'string / boolean', false, '校验快照完整性并选择是否等待恢复。'),
    ],
    expectedOutput: 'boolean；目标 shard 的恢复操作被接受，副本同步和状态收敛仍需 collectionClusterInfo 验证。',
    errorCases: [
      e('请求发到不承载 shard 的 peer 或 shardId/快照不匹配', '先读取 collectionClusterInfo 与 listShardSnapshots，按 peer 路由运维请求。'),
      e('错误 priority 覆盖健康 replica', '明确 source of truth，备份当前状态并在变更后验证副本一致性。'),
    ], relatedApis: ['listShardSnapshots', 'collectionClusterInfo', 'createShardSnapshot', 'updateCollectionCluster'],
  }),
  listShardSnapshots: server({
    learningLevel: 'reference',
    parameters: [
      p('collectionName', 'string', true, '目标 collection。'),
      p('shardId', 'number', true, '当前节点承载的具体 shard id。'),
    ],
    expectedOutput: 'SnapshotDescription[]；仅列出当前节点上该 shard 的快照，不代表其他 replica 的备份。',
    errorCases: [
      e('节点不承载指定 shard', '先 collectionClusterInfo 确定 peer/shard 拓扑，再向正确节点查询。'),
      e('混用不同时间/peer 的 shard snapshots 组成不一致恢复集', '备份 catalog 记录 peer、shard、creation_time 和 checksum。'),
    ], relatedApis: ['createShardSnapshot', 'deleteShardSnapshot', 'recoverShardFromSnapshot', 'collectionClusterInfo'],
  }),
  createShardSnapshot: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '目标 collection。'),
      p('shardId', 'number', true, '当前节点实际承载的 shard id。'),
      p('wait', 'boolean', true, '是否等待 shard snapshot 文件完成；当前 facade 签名要求显式给出。'),
    ],
    expectedOutput: 'SnapshotDescription，包含该 shard 快照的名称、大小、时间和 checksum。',
    errorCases: [
      e('peer 不承载该 shard 或 shard 正在迁移', '先 collectionClusterInfo 检查 local_shards/transfers，等待拓扑稳定或选择健康 replica。'),
      e('快照只留本机', '完成后复制到独立存储并验证 checksum，集中登记 shard 覆盖。'),
    ], relatedApis: ['listShardSnapshots', 'recoverShardFromSnapshot', 'collectionClusterInfo'],
  }),
  deleteShardSnapshot: server({
    learningLevel: 'reference',
    parameters: [
      p('collectionName', 'string', true, '快照所属 collection。'),
      p('shardId', 'number', true, '快照所属 shard id。'),
      p('snapshotName', 'string', true, '从 listShardSnapshots 得到的精确文件名。'),
      p('wait', 'boolean', true, 'true 时等待指定 shard 快照删除完成再返回；false 只确认删除已受理，后续应按相同 collection 与 shardId 重新 listShardSnapshots 验证。'),
    ],
    expectedOutput: 'boolean；删除当前节点指定 shard snapshot，不改变线上 shard 数据。',
    errorCases: [
      e('删除后无法组成完整 shard 恢复集合', '集中备份 catalog 检查所有 shard/peer 覆盖和远端副本后再清理。'),
      e('collection、shardId 与 snapshotName 对应错误', '三者必须从同一次 listShardSnapshots 上下文解析并通过运维审批。'),
    ], relatedApis: ['listShardSnapshots', 'createShardSnapshot', 'recoverShardFromSnapshot'],
  }),

  collectionClusterInfo: server({
    learningLevel: 'advanced',
    parameters: [p('collectionName', 'string', true, '要查看 shard、replica 和传输拓扑的 collection。')],
    expectedOutput: 'CollectionClusterInfo，包含 local_shards、remote_shards、shard_transfers 及副本状态，用于运维决策而非业务内容查询。',
    errorCases: [
      e('读取后拓扑立即变化形成 TOCTOU 竞态', '操作前后都重新读取，自动化必须容忍 transfer 中状态和幂等冲突。'),
      e('把单节点视图误解为完整健康结论', '结合所有 peer/集群遥测和 replica 状态判断 quorum 与可用性。'),
    ], relatedApis: ['updateCollectionCluster', 'clusterTelemetry', 'recoverShardFromSnapshot'],
  }),
  updateCollectionCluster: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '需要改变 shard 拓扑的 collection。'),
      p('operation', 'MoveShard | ReplicateShard | DropReplica | AbortTransfer | ...', true, '明确的集群操作及 shard_id、from_peer_id、to_peer_id 等拓扑字段。'),
      p('timeout', 'number', false, '控制面操作提交超时秒数；传输常在返回后继续。'),
    ],
    expectedOutput: 'boolean；操作被控制面接受，shard move/replicate 的实际完成状态需要持续 collectionClusterInfo。',
    errorCases: [
      e('drop/move 让副本数低于安全 quorum 或选错 peer', '变更前计算 replica/故障域与容量，备份并采用双人审批；业务服务不应拥有此权限。'),
      e('传输超时、卡住或与另一操作冲突', '检查 shard_transfers，必要时使用明确 abort 操作，随后重新读取拓扑再规划。'),
    ], relatedApis: ['collectionClusterInfo', 'clusterTelemetry', 'recoverShardFromSnapshot'],
  }),
  listShardKeys: server({
    learningLevel: 'reference',
    parameters: [p('collectionName', 'string', true, '启用 custom sharding 的 collection；普通自动分片 collection 通常没有业务 shard keys。')],
    expectedOutput: 'ShardKeysResponse，列出已创建的业务 shard_key 及相关信息。',
    errorCases: [
      e('把 shard_key 当普通 payload tag', '它决定实际数据路由和 shard 生命周期；写入与查询必须携带一致 key。'),
      e('向普通租户暴露所有 key', '只在受控运维服务读取，并按当前身份过滤可见范围。'),
    ], relatedApis: ['createShardKey', 'deleteShardKey', 'collectionClusterInfo'],
  }),
  createShardKey: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, '必须以 custom sharding 创建的 collection。'),
      p('shard_key', 'ShardKey', true, '应用负责的稳定路由键，例如 tenant/region；后续 point 写入与查询必须一致。'),
      p('shards_number', 'number', false, '该 key 分配的 shard 数量，影响并行与资源开销。'),
      p('replication_factor', 'number', false, '每个 shard 的副本数量。'),
      p('placement', 'number[]', false, '可选 peer 放置列表；需满足容量和故障域策略。'),
      p('timeout', 'number', false, '限制 shard key 控制面创建操作的等待时间，单位是秒；超时后要用 listShardKeys 和 collectionClusterInfo 核验是否已部分或全部创建。'),
    ],
    expectedOutput: 'boolean；为该业务 key 创建路由与 shards，之后只有携带匹配 shard_key 的数据才能落到该范围。',
    errorCases: [
      e('创建过多小 shards 导致内存和调度开销', '按租户规模分层设计 key/shards，避免“一租户固定多 shard”的无界增长。'),
      e('placement 指向容量不足或同一故障域', '创建前读取集群遥测和 peer 拓扑，保证 replica 分散。'),
    ], relatedApis: ['listShardKeys', 'deleteShardKey', 'collectionClusterInfo', 'upsert'],
  }),
  deleteShardKey: server({
    learningLevel: 'advanced',
    parameters: [
      p('collectionName', 'string', true, 'custom sharding collection。'),
      p('shard_key', 'ShardKey', true, '要删除的业务路由键；删除会移除其关联 shards 和数据，不只是标签。'),
      p('timeout', 'number', false, '限制 shard key 控制面删除操作的等待时间，单位是秒；超时不代表数据仍完整，必须重新 listShardKeys 核验最终状态。'),
    ],
    expectedOutput: 'boolean；成功后该 shard_key 及其数据不再存在。',
    errorCases: [
      e('误把租户标识直接传入导致不可逆整租户删除', '服务端解析内部 key、停止写入、exact count、创建快照并双人确认。'),
      e('超时后未知是否已删除', '重新 listShardKeys/collectionClusterInfo 确认，重试必须幂等。'),
    ], relatedApis: ['listShardKeys', 'createShardKey', 'createShardSnapshot', 'collectionClusterInfo'],
  }),
  clusterTelemetry: server({
    learningLevel: 'reference',
    parameters: [
      p('details_level', 'number', false, '诊断详情级别；越高响应越大且可能包含更多环境信息。'),
      p('per_collection', 'boolean', false, '是否附带每个 collection 的详细遥测。', 'false'),
      p('timeout', 'number', false, '采集分布式遥测的超时秒数。'),
    ],
    expectedOutput: 'DistributedTelemetryData，包含 peers、collections、硬件与运行诊断快照；适合排障，不替代持续 metrics。',
    errorCases: [
      e('高 details_level 响应巨大或采集影响集群', '仅在受控排障时使用并设置 timeout；持续告警使用 metrics。'),
      e('拓扑、主机信息泄露给普通用户', '端点只允许运维身份，存储和工单内容脱敏并设置保留期。'),
    ], relatedApis: ['collectionClusterInfo', 'getCollection', 'versionInfo'],
  }),
  versionInfo: server({
    learningLevel: 'reference',
    parameters: [p('无显式参数', 'never', false, '读取当前 Qdrant engine 的版本与构建信息。')],
    expectedOutput: 'VersionInfo，通常包含 version、commit 等；用于兼容性检查和问题报告，不证明数据面健康。',
    errorCases: [
      e('客户端与 engine 主版本或次版本差距不兼容', '锁定兼容版本，升级前阅读迁移说明并跑真实 collection 读写回归。'),
      e('versionInfo 成功却 collection/集群不可用', '继续检查 getCollection status、collectionClusterInfo，并执行受控 upsert/retrieve 探针。'),
    ], relatedApis: ['new QdrantClient', 'getCollection', 'collectionClusterInfo'],
  }),
} satisfies Record<string, FrameworkApiLearningMeta>

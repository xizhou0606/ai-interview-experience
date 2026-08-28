import type { FrameworkApiReference } from '../types'
import { qdrantLearningMeta } from './learning-meta'

const API = 'https://api.qdrant.tech/master/api-reference'
const COLLECTIONS = `${API}/collections`
const POINTS = `${API}/points`
const SEARCH = `${API}/search`
const INDEXES = `${API}/indexes`
const SNAPSHOTS = `${API}/snapshots`
const ALIASES = `${API}/aliases`
const DISTRIBUTED = `${API}/distributed`
const CLIENT_SOURCE = 'https://github.com/qdrant/qdrant-js/blob/master/packages/js-client-rest/src/qdrant-client.ts'

type QdrantApiInput = Omit<FrameworkApiReference, 'slug' | 'technologySlug' | 'maturity' | 'exampleLanguage'> & {
  slug: string
  maturity?: FrameworkApiReference['maturity']
}

function qdrantApi(input: QdrantApiInput): FrameworkApiReference {
  const learningMeta = qdrantLearningMeta[input.name as keyof typeof qdrantLearningMeta]
  if (!learningMeta) throw new Error(`Missing structured Qdrant learning metadata for ${input.name}`)
  return {
    ...input,
    ...learningMeta,
    slug: `qdrant-${input.slug}`,
    technologySlug: 'qdrant',
    maturity: input.maturity ?? 'stable',
    exampleLanguage: 'ts',
  }
}

/**
 * Learner-facing denominator: the 60 non-duplicate QdrantClient facade entries
 * exposed by @qdrant/js-client-rest. The legacy `recommend_batch` alias and the
 * deprecated `recreateCollection` helper are intentionally excluded. Generated
 * low-level `client.api()` endpoint methods remain discoverable through `api()`
 * but are not duplicated as separate lessons here.
 */
export const qdrantFrameworkApis: FrameworkApiReference[] = [
  qdrantApi({
    slug: 'client', name: 'new QdrantClient', group: '客户端基础', kind: 'class', signature: 'new QdrantClient({ url?, host?, port?, apiKey?, https?, timeout?, maxConnections?, checkCompatibility? })',
    beginner: '它创建一个会把 TypeScript 调用转换成 Qdrant REST 请求的客户端。url 要包含协议；host 只写主机名，不能同时传 url 和 host。', whenToUse: '应用启动时创建一次并复用，用它连接本地 Qdrant、自建集群或 Qdrant Cloud。',
    example: `import { QdrantClient } from '@qdrant/js-client-rest'\n\nconst client = new QdrantClient({\n  url: process.env.QDRANT_URL!,\n  apiKey: process.env.QDRANT_API_KEY,\n  timeout: 30_000,\n})`, returns: '返回 QdrantClient 实例；构造时默认异步检查客户端与服务端版本兼容性。',
    interview: 'REST 客户端负责鉴权、超时、连接复用、OpenAPI 类型和错误包装；向量生成不属于它，embedding 维度与 collection schema 必须由业务保证。', pitfall: '不要每个请求 new 一个客户端；API key 必须配 HTTPS，timeout 单位是毫秒，而单次方法中的 timeout 通常是秒。', officialUrl: CLIENT_SOURCE,
  }),
  qdrantApi({
    slug: 'api', name: 'QdrantClient.api', group: '客户端基础', kind: 'function', signature: 'client.api(): ClientApi',
    beginner: '返回由 Qdrant OpenAPI 自动生成的底层端点客户端。facade 暂未包装的新接口可以从这里调用，但参数和响应会更接近 HTTP 原始结构。', whenToUse: '官方服务已经有某个 REST 端点，而当前 facade 尚未提供方便方法，或需要访问更底层响应元数据时。',
    example: `const raw = client.api()\nconst response = await raw.getCollections()\nconsole.log(response.data.result?.collections)`, returns: 'ClientApi，方法通常返回包含 data/status/headers 的底层 HTTP 响应。',
    interview: 'facade 是稳定易用层，api() 是 OpenAPI 生成层；前者会解包 result，后者保留传输细节。生产代码应集中封装底层调用以隔离生成代码变化。', pitfall: '不要把底层响应当成 facade 返回值；参数名通常采用 OpenAPI 的 snake_case，升级客户端后要做类型回归。', officialUrl: CLIENT_SOURCE,
  }),

  qdrantApi({
    slug: 'get-collections', name: 'getCollections', group: 'Collection 与别名', kind: 'function', signature: 'client.getCollections(): Promise<CollectionsResponse>',
    beginner: '列出当前 Qdrant 实例中的全部 collection 名称，相当于先看“有哪些向量表”，不会把点和向量一起读出来。', whenToUse: '管理后台、启动自检、迁移脚本或判断需要处理哪些 collection 时。',
    example: `const { collections } = await client.getCollections()\nfor (const item of collections) console.log(item.name)`, returns: 'CollectionsResponse，核心字段 collections 是名称对象列表。',
    interview: 'Collection 是共享向量配置和索引的顶层容器；列目录是元数据操作，不代表 collection 已健康或索引已完成。', pitfall: '不要在每次查询前先 list 再判断，存在竞态且多一次网络往返；已知名称可直接 collectionExists。', officialUrl: `${COLLECTIONS}/get-collections`,
  }),
  qdrantApi({
    slug: 'get-collection', name: 'getCollection', group: 'Collection 与别名', kind: 'function', signature: 'client.getCollection(collectionName): Promise<CollectionInfo>',
    beginner: '读取一个 collection 的配置和运行状态，包括向量维度、距离、分片、payload schema、点数估计和优化器状态。', whenToUse: '启动时校验 schema、排查 yellow/red 状态、观察索引进度或容量趋势。',
    example: `const info = await client.getCollection('documents')\nconsole.log(info.status, info.config.params.vectors)`, returns: 'CollectionInfo，包含 status、config、payload_schema、points_count、indexed_vectors_count 等。',
    interview: 'points_count 和 indexed_vectors_count 是近似内部计数，受 segment 优化和延迟索引影响；精确业务数量应使用 count({ exact: true })。', pitfall: '不要用近似 count 做计费或分页终止条件；读取配置后仍要校验实际 embedding 维度与命名向量。', officialUrl: `${COLLECTIONS}/get-collection`,
  }),
  qdrantApi({
    slug: 'collection-exists', name: 'collectionExists', group: 'Collection 与别名', kind: 'function', signature: 'client.collectionExists(collectionName): Promise<CollectionExistence>',
    beginner: '只回答指定 collection 是否存在，比故意调用 getCollection 再捕获 404 更清晰。', whenToUse: '初始化脚本需要“存在则复用、不存在则创建”时。',
    example: `const { exists } = await client.collectionExists('documents')\nif (!exists) await client.createCollection('documents', { vectors: { size: 768, distance: 'Cosine' } })`, returns: 'CollectionExistence，核心字段 exists 为布尔值。',
    interview: 'exists→create 不是原子操作，并发初始化仍可能竞争；部署系统应允许 create 冲突后再次读取并校验 schema。', pitfall: '存在不等于配置正确；复用前必须比较向量 size、distance、named vectors 与索引。', officialUrl: `${COLLECTIONS}/collection-exists`,
  }),
  qdrantApi({
    slug: 'create-collection', name: 'createCollection', group: 'Collection 与别名', kind: 'function', signature: 'client.createCollection(collectionName, { vectors, sparse_vectors?, shard_number?, replication_factor?, ... }): Promise<boolean>',
    beginner: '创建一张向量“表”，最重要的是确定每个向量的维度和距离度量；还可配置稀疏向量、分片、副本、HNSW、量化与磁盘存储。', whenToUse: '首次部署、为新 embedding 模型建立新版本 collection，或设计 dense+sparse 混合检索时。',
    example: `await client.createCollection('documents-v1', {\n  vectors: { dense: { size: 768, distance: 'Cosine' } },\n  sparse_vectors: { sparse: {} },\n  replication_factor: 2,\n})`, returns: '成功时返回 true；collection 配置会通过集群共识提交。',
    interview: '维度由 embedding 模型决定，distance 要匹配模型训练方式；shard 影响水平扩展，replica 影响可用性，二者不是同一个参数。', pitfall: '上线后不要原地更换维度；更稳妥做法是新建版本 collection、重建索引，再用 alias 原子切换。', officialUrl: `${COLLECTIONS}/create-collection`,
  }),
  qdrantApi({
    slug: 'update-collection', name: 'updateCollection', group: 'Collection 与别名', kind: 'function', signature: 'client.updateCollection(collectionName, args?): Promise<boolean>',
    beginner: '修改现有 collection 的可更新参数，例如 optimizer、HNSW、quantization、replication、strict mode 或向量配置，而不是重建全部点。', whenToUse: '调优索引、扩副本、启用量化或 strict mode，且官方允许在线更新该字段时。',
    example: `await client.updateCollection('documents', {\n  optimizers_config: { indexing_threshold: 20_000 },\n  strict_mode_config: { enabled: true },\n})`, returns: '操作被接受后返回 true；后台重建索引可能继续运行。',
    interview: '控制面更新通过共识，但索引重建是后台过程；配置请求成功不等于新索引已经全部 ready。', pitfall: 'HNSW/量化调整可能消耗大量 CPU、磁盘和内存；先压测并观察 optimizer_status，避免高峰期变更。', officialUrl: `${COLLECTIONS}/update-collection`,
  }),
  qdrantApi({
    slug: 'delete-collection', name: 'deleteCollection', group: 'Collection 与别名', kind: 'function', signature: 'client.deleteCollection(collectionName, { timeout? }?): Promise<boolean>',
    beginner: '永久删除整个 collection 及其点、向量、payload 和索引，是破坏性很强的管理操作。', whenToUse: '清理废弃版本、测试环境或已完成备份和迁移的 collection。',
    example: `const deleted = await client.deleteCollection('documents-old', { timeout: 60 })\nconsole.log({ deleted })`, returns: '删除成功返回 true。',
    interview: '大规模 schema 迁移通常用新 collection + alias 切换，旧 collection 经过回滚窗口后再删，避免直接原地破坏。', pitfall: '先确认 alias 不再指向它并保留 snapshot；collection 名称必须经过服务端白名单，不能让用户任意传入。', officialUrl: `${COLLECTIONS}/delete-collection`,
  }),
  qdrantApi({
    slug: 'create-vector-name', name: 'createVectorName', group: 'Collection 与别名', kind: 'function', signature: 'client.createVectorName(collectionName, vectorName, config, options?): Promise<UpdateResult>',
    beginner: '给现有 collection 新增一个命名向量槽位，例如同时保存正文 dense、标题 dense 或 sparse 向量；它只建配置，不会替旧点自动生成向量。', whenToUse: '渐进引入新的 embedding 表示，而不想立刻重建整个 collection 时。',
    example: `await client.createVectorName('documents', 'title', {\n  size: 384,\n  distance: 'Cosine',\n})`, returns: 'UpdateResult，包含 acknowledged/completed 状态与 operation_id。',
    interview: 'Named vectors 允许一个 point 拥有多种表示，查询时 using 选择向量空间；每个向量名可有独立维度和距离。', pitfall: '新增后旧点缺少该向量；查询前要完成回填并监控覆盖率，否则召回集合会不完整。', officialUrl: `${COLLECTIONS}/create-vector-name`,
  }),
  qdrantApi({
    slug: 'delete-vector-name', name: 'deleteVectorName', group: 'Collection 与别名', kind: 'function', signature: 'client.deleteVectorName(collectionName, vectorName, options?): Promise<UpdateResult>',
    beginner: '从 collection schema 中删除一个命名向量以及所有点上该向量的数据，不会删除点本身和其他向量。', whenToUse: '新向量迁移完成后清理旧表示，回收磁盘和内存。',
    example: `await client.deleteVectorName('documents', 'legacy_embedding', { wait: true })`, returns: 'UpdateResult，描述配置变更操作状态。',
    interview: '删除 named vector 是 schema 变更；alias/查询代码必须先停止 using 旧名称，再执行删除，符合 expand-and-contract 迁移。', pitfall: '操作不可用客户端自动回滚；先做 snapshot，并确认没有线上查询、prefetch 或推荐仍依赖该名称。', officialUrl: `${COLLECTIONS}/delete-vector-name`,
  }),
  qdrantApi({
    slug: 'get-optimizations', name: 'getOptimizations', group: 'Collection 与别名', kind: 'function', signature: 'client.getOptimizations(collectionName, { with?, completed_limit? }?): Promise<OptimizationsResponse>',
    beginner: '查看 collection 正在进行和最近完成的后台优化任务，例如 segment 合并或索引构建，比只看一个 optimizer_status 更细。', whenToUse: '导入大量数据后等待索引完成、诊断资源占用或发布前做就绪检查。',
    example: `const jobs = await client.getOptimizations('documents', {\n  with: 'status',\n  completed_limit: 10,\n})\nconsole.log(jobs)`, returns: 'OptimizationsResponse，包含匹配条件的优化任务与状态。',
    interview: 'Qdrant 的写入先进入 WAL/segments，优化器异步合并并建立 HNSW；已接受写入不等于已经进入最终索引结构。', pitfall: '不要高频轮询制造管理面压力；该接口版本较新，客户端和服务端 minor 版本需要兼容。', officialUrl: `${COLLECTIONS}/get-optimizations`,
  }),
  qdrantApi({
    slug: 'update-aliases', name: 'updateCollectionAliases', group: 'Collection 与别名', kind: 'function', signature: 'client.updateCollectionAliases({ actions, timeout? }): Promise<boolean>',
    beginner: '在一个原子请求中创建、删除或重命名 collection alias。应用只查询稳定别名，就能无停机切换到新 collection。', whenToUse: 'embedding 模型升级、重建索引、蓝绿发布或快速回滚时。',
    example: `await client.updateCollectionAliases({ actions: [\n  { delete_alias: { alias_name: 'documents-live' } },\n  { create_alias: { collection_name: 'documents-v2', alias_name: 'documents-live' } },\n] })`, returns: '别名操作成功返回 true。',
    interview: 'Alias 是向量库 schema 迁移的间接层；批量 actions 原子提交，读流量不会看到“旧别名已删、新别名未建”的中间态。', pitfall: '新 collection 必须先完成数据回填和检索验收；切换前验证 payload index、named vector 和权限配置一致。', officialUrl: `${ALIASES}/update-aliases`,
  }),
  qdrantApi({
    slug: 'get-collection-aliases', name: 'getCollectionAliases', group: 'Collection 与别名', kind: 'function', signature: 'client.getCollectionAliases(collectionName): Promise<CollectionsAliasesResponse>',
    beginner: '列出所有指向某个真实 collection 的别名，便于判断它是否仍承接线上流量。', whenToUse: '删除旧 collection 前检查引用、管理后台展示或迁移验收。',
    example: `const { aliases } = await client.getCollectionAliases('documents-v2')\nconsole.log(aliases.map(alias => alias.alias_name))`, returns: 'CollectionsAliasesResponse，包含 alias_name 与 collection_name 的映射列表。',
    interview: '别名反向查询是安全删除检查的一部分，但读取与随后删除之间仍存在竞态，变更权限应集中在部署控制面。', pitfall: '不要只看返回为空就立即删除；自动化流程应锁定发布或再次校验当前 live alias。', officialUrl: `${ALIASES}/get-collection-aliases`,
  }),
  qdrantApi({
    slug: 'get-aliases', name: 'getAliases', group: 'Collection 与别名', kind: 'function', signature: 'client.getAliases(): Promise<CollectionsAliasesResponse>',
    beginner: '列出实例中全部 alias 到 collection 的映射，相当于查看向量库的逻辑路由表。', whenToUse: '运维盘点、迁移审计和管理界面。',
    example: `const { aliases } = await client.getAliases()\nfor (const alias of aliases) console.log(alias.alias_name, alias.collection_name)`, returns: 'CollectionsAliasesResponse，包含所有别名映射。',
    interview: '客户端应依赖稳定 alias，部署系统负责将 alias 指向具体版本；这把数据重建与应用发布解耦。', pitfall: '全局 alias 列表可能泄露租户结构，不应直接暴露给普通用户；大型实例也不要每次请求调用。', officialUrl: `${ALIASES}/get-collections-aliases`,
  }),

  qdrantApi({
    slug: 'upsert', name: 'upsert', group: 'Points 与 Payload', kind: 'function', signature: 'client.upsert(collectionName, { points | batch, wait?, ordering?, timeout? }): Promise<UpdateResult>',
    beginner: '插入或按相同 id 覆盖 point。一个 point 由 id、vector 和可选 payload 组成；批量写比逐条请求更省网络开销。', whenToUse: '文档切块入库、embedding 更新、事件同步或批量导入。',
    example: `await client.upsert('documents', {\n  wait: true,\n  points: [{ id: 'chunk-1', vector: [0.1, 0.2, 0.3], payload: { tenant: 'acme', text: '...' } }],\n})`, returns: 'UpdateResult；wait=true 通常返回 completed，false 可能只返回 acknowledged 与 operation_id。',
    interview: 'Upsert 以 point id 幂等覆盖，WAL 先保证写入耐久，再异步应用到 segment/index；批大小要在吞吐、请求大小和失败重试粒度间权衡。', pitfall: '向量维度/名称必须匹配 schema；重复 id 会整体覆盖该 point 的向量与 payload 结构，敏感 payload 要控制。', officialUrl: `${POINTS}/upsert-points`,
  }),
  qdrantApi({
    slug: 'retrieve', name: 'retrieve', group: 'Points 与 Payload', kind: 'function', signature: 'client.retrieve(collectionName, { ids, with_payload?, with_vector?, shard_key?, consistency? }): Promise<Record[]>',
    beginner: '按已知 point id 精确读取记录，不做相似度搜索。可以选择是否带 payload 和向量，避免传输不需要的大数组。', whenToUse: '缓存命中回源、按 chunk id 展示详情、校验写入或批量获取已知记录。',
    example: `const records = await client.retrieve('documents', {\n  ids: ['chunk-1', 'chunk-2'],\n  with_payload: ['text', 'source'],\n  with_vector: false,\n})`, returns: 'Record[]；只返回实际存在的点，包含 id 及选择的 payload/vector。',
    interview: 'retrieve 是主键查找，search/query 是近邻检索；能用 id 精确读时不应构造向量搜索。', pitfall: '结果长度和顺序不一定与 ids 完全一致，必须按 id 映射；默认 payload 可能很大，向量默认选择也要明确。', officialUrl: `${POINTS}/get-points`,
  }),
  qdrantApi({
    slug: 'delete-points', name: 'delete', group: 'Points 与 Payload', kind: 'function', signature: 'client.delete(collectionName, { points | filter, wait?, ordering?, timeout? }): Promise<UpdateResult>',
    beginner: '按 id 列表或 filter 删除 points。按 filter 很强大，能一次清理一个租户或数据版本，也因此更危险。', whenToUse: '文档撤回、租户删除、过期数据清理或重新切块前移除旧版本。',
    example: `await client.delete('documents', {\n  wait: true,\n  filter: { must: [{ key: 'document_id', match: { value: 'doc-42' } }] },\n})`, returns: 'UpdateResult，描述删除操作是否 acknowledged/completed。',
    interview: '点删除通常先产生 tombstone，物理空间由后台优化回收；wait=true 表示更新已应用，不等于磁盘立即缩小。', pitfall: 'filter 删除前先 count/review 条件并强制 tenant 条件；不要接受客户端原样传入任意过滤器。', officialUrl: `${POINTS}/delete-points`,
  }),
  qdrantApi({
    slug: 'update-vectors', name: 'updateVectors', group: 'Points 与 Payload', kind: 'function', signature: 'client.updateVectors(collectionName, { points, wait?, ordering?, shard_key? }): Promise<UpdateResult>',
    beginner: '只更新指定 point 的一个或多个向量，不动它的 payload 和其他命名向量，适合重算 embedding。', whenToUse: '修正向量、逐步回填新 named vector 或模型小版本重算。',
    example: `await client.updateVectors('documents', {\n  wait: true,\n  points: [{ id: 'chunk-1', vector: { dense: [0.2, 0.4, 0.6] } }],\n})`, returns: 'UpdateResult。',
    interview: '向量和 payload 可以独立更新，减少写放大；但 embedding 版本仍应写入 payload，避免混用不同模型空间。', pitfall: '仅按维度相同不能保证语义空间兼容；同一 named vector 内混入不同模型向量会悄悄破坏召回。', officialUrl: `${POINTS}/update-vectors`,
  }),
  qdrantApi({
    slug: 'delete-vectors', name: 'deleteVectors', group: 'Points 与 Payload', kind: 'function', signature: 'client.deleteVectors(collectionName, { points | filter, vector, wait?, ordering?, shard_key? }): Promise<UpdateResult>',
    beginner: '从匹配 points 上删除指定命名向量，但保留 point、payload 和其他向量。', whenToUse: '清理错误回填、撤销某种多模态向量或降低存储占用。',
    example: `await client.deleteVectors('documents', {\n  points: ['chunk-1', 'chunk-2'],\n  vector: ['image'],\n  wait: true,\n})`, returns: 'UpdateResult。',
    interview: '这与 delete point、deleteVectorName 不同：前者删记录，后者删整个 schema；deleteVectors 只删选中点上的向量值。', pitfall: '删除后 using 该向量查询时这些点不会参与召回；批量 filter 操作必须带租户边界。', officialUrl: `${POINTS}/delete-vectors`,
  }),
  qdrantApi({
    slug: 'set-payload', name: 'setPayload', group: 'Points 与 Payload', kind: 'function', signature: 'client.setPayload(collectionName, { payload, points | filter, key?, wait?, ordering? }): Promise<UpdateResult>',
    beginner: '把 payload 字段合并到选中的 points：同名字段覆盖，没提到的原字段保留；可用 key 把内容写到嵌套路径。', whenToUse: '更新标签、权限、状态或元数据，而无需重写向量。',
    example: `await client.setPayload('documents', {\n  points: ['chunk-1'],\n  payload: { status: 'published', tenant: 'acme' },\n  wait: true,\n})`, returns: 'UpdateResult。',
    interview: 'Payload 是结构化过滤维度，不应塞进 embedding 替代精确约束；高频过滤字段应建立匹配类型的 payload index。', pitfall: 'set 是合并不是整体替换；字段类型改变可能与已有 payload index 不兼容。', officialUrl: `${POINTS}/set-payload`,
  }),
  qdrantApi({
    slug: 'overwrite-payload', name: 'overwritePayload', group: 'Points 与 Payload', kind: 'function', signature: 'client.overwritePayload(collectionName, { payload, points | filter, key?, wait?, ordering? }): Promise<UpdateResult>',
    beginner: '用新对象整体替换选中 points 的 payload；与 setPayload 不同，旧字段会被清掉。', whenToUse: '同步外部系统的完整权威元数据快照，确定旧 payload 不应保留时。',
    example: `await client.overwritePayload('documents', {\n  points: ['chunk-1'],\n  payload: { tenant: 'acme', version: 3 },\n  wait: true,\n})`, returns: 'UpdateResult。',
    interview: 'setPayload 是 patch 语义，overwritePayload 是 replace 语义；同步系统必须先定义谁是 source of truth。', pitfall: '很容易误删权限或检索所需字段；覆盖前构造完整 payload，并为 schema 变化做回归。', officialUrl: `${POINTS}/overwrite-payload`,
  }),
  qdrantApi({
    slug: 'delete-payload', name: 'deletePayload', group: 'Points 与 Payload', kind: 'function', signature: 'client.deletePayload(collectionName, { keys, points | filter, wait?, ordering? }): Promise<UpdateResult>',
    beginner: '只删除 payload 中指定的字段，point、向量和其他字段都保留。', whenToUse: '隐私字段擦除、清理废弃标签或 schema 收缩。',
    example: `await client.deletePayload('documents', {\n  keys: ['private_note', 'legacy_tag'],\n  points: ['chunk-1'],\n  wait: true,\n})`, returns: 'UpdateResult。',
    interview: '字段级删除支持数据最小化，但 payload index 的 schema 不会因为数据字段消失就自动删除，索引要单独管理。', pitfall: '按 filter 大范围删除前必须预估 count；嵌套路径与普通字段名要按官方 payload path 语义处理。', officialUrl: `${POINTS}/delete-payload`,
  }),
  qdrantApi({
    slug: 'clear-payload', name: 'clearPayload', group: 'Points 与 Payload', kind: 'function', signature: 'client.clearPayload(collectionName, { points | filter, wait?, ordering? }): Promise<UpdateResult>',
    beginner: '清空选中 points 的全部 payload，但保留 id 和向量；这些点仍可做纯向量检索。', whenToUse: '完整移除元数据、隐私清除或测试数据重置。',
    example: `await client.clearPayload('documents', {\n  filter: { must: [{ key: 'expired', match: { value: true } }] },\n  wait: true,\n})`, returns: 'UpdateResult。',
    interview: 'clear payload 与 delete points 的可检索性不同：向量仍在，所以是否满足“用户数据删除”要结合业务合规定义。', pitfall: '清空后 tenant/ACL 字段也消失，可能让不带强制过滤的查询暴露向量结果；安全系统通常应直接删点。', officialUrl: `${POINTS}/clear-payload`,
  }),
  qdrantApi({
    slug: 'batch-update', name: 'batchUpdate', group: 'Points 与 Payload', kind: 'function', signature: 'client.batchUpdate(collectionName, { operations, wait?, ordering?, timeout? }): Promise<UpdateResult[]>',
    beginner: '把多种 point 更新操作放进一个 HTTP 请求，例如先 upsert、再设 payload，减少网络往返。', whenToUse: '一个业务动作需要批量执行多个 Qdrant update operation，或大规模同步希望降低请求开销。',
    example: `const results = await client.batchUpdate('documents', {\n  wait: true,\n  operations: [\n    { upsert: { points: [{ id: 1, vector: [0.1, 0.2, 0.3] }] } },\n    { set_payload: { points: [1], payload: { ready: true } } },\n  ],\n})`, returns: '与 operations 对应的 UpdateResult[]。',
    interview: 'Batch 减少网络开销，但 Qdrant 分布式点操作不提供传统数据库的跨操作强事务保证；业务一致性仍需幂等和补偿。', pitfall: '不要假设后一个失败会回滚前一个；限制批大小，并能按 operation 结果重试。', officialUrl: `${POINTS}/batch-update`,
  }),
  qdrantApi({
    slug: 'scroll', name: 'scroll', group: 'Points 与 Payload', kind: 'function', signature: 'client.scroll(collectionName, { filter?, limit?, offset?, with_payload?, with_vector?, order_by? }?): Promise<ScrollResult>',
    beginner: '按 id/指定顺序遍历 points，不按向量相似度排序。返回 points 和 next_page_offset，用下一页游标继续。', whenToUse: '离线导出、迁移、后台扫描、按 filter 批处理或浏览 collection。',
    example: `let offset: string | number | undefined\ndo {\n  const page = await client.scroll('documents', { limit: 100, offset, with_vector: false })\n  for (const point of page.points) console.log(point.id)\n  offset = page.next_page_offset ?? undefined\n} while (offset !== undefined)`, returns: 'ScrollResult，包含 points 与可选 next_page_offset。',
    interview: 'Scroll 是游标遍历，search offset 是结果集跳过；大数据导出应使用 next_page_offset，避免深 offset 的成本和不稳定。', pitfall: '终止条件要区分 null/undefined/0；扫描期间并发写入可能改变视图，严格快照需求应使用 snapshot。', officialUrl: `${POINTS}/scroll-points`,
  }),
  qdrantApi({
    slug: 'count', name: 'count', group: 'Points 与 Payload', kind: 'function', signature: 'client.count(collectionName, { filter?, exact?, shard_key?, timeout? }?): Promise<CountResult>',
    beginner: '统计全部或满足 filter 的 point 数。exact=true 更准确但更慢，false 可用近似方式快速估计。', whenToUse: '分页总数、删除前预估影响、数据校验或租户配额检查。',
    example: `const { count } = await client.count('documents', {\n  filter: { must: [{ key: 'tenant', match: { value: 'acme' } }] },\n  exact: true,\n})`, returns: 'CountResult，核心字段 count 为数量。',
    interview: 'CollectionInfo 的 points_count 是近似内部指标；Count API 的 exact 参数才表达查询级精确性与性能权衡。', pitfall: '高频复杂 exact count 会消耗资源；Cloud strict mode 下过滤字段应先建 payload index。', officialUrl: `${POINTS}/count-points`,
  }),

  qdrantApi({
    slug: 'search', name: 'search', group: '检索与 Query', kind: 'function', signature: 'client.search(collectionName, { vector, filter?, limit?, offset?, with_payload?, with_vector?, score_threshold?, using? }): Promise<ScoredPoint[]>',
    beginner: '经典的单向量近邻搜索：拿查询 embedding 与 collection 中向量比较，再按相似度返回前 N 个点，可叠加 payload filter。', whenToUse: '简单 dense/sparse 向量检索或维护旧版代码；新复杂检索优先统一到 query。',
    example: `const hits = await client.search('documents', {\n  vector: { name: 'dense', vector: queryEmbedding },\n  filter: { must: [{ key: 'tenant', match: { value: 'acme' } }] },\n  limit: 5,\n  with_payload: ['text', 'source'],\n})`, returns: '按 score 排序的 ScoredPoint[]。',
    interview: 'ANN 搜索用 HNSW 换取低延迟与近似召回；filter 的选择性和 payload index 会影响 query planner 采用全扫、payload-first 或 filterable HNSW。', pitfall: 'distance 不同导致 score_threshold 方向语义可能不同；深 offset 性能差，向量模型/归一化必须与入库一致。', officialUrl: `${SEARCH}/points`,
  }),
  qdrantApi({
    slug: 'search-batch', name: 'searchBatch', group: '检索与 Query', kind: 'function', signature: 'client.searchBatch(collectionName, { searches, consistency?, timeout? }): Promise<ScoredPoint[][]>',
    beginner: '在一个请求中执行多条独立 search，每个查询仍得到自己的结果数组，适合减少网络往返。', whenToUse: '一次需要多个查询向量、评测批次或并行检索多个子问题。',
    example: `const [first, second] = await client.searchBatch('documents', {\n  searches: [\n    { vector: embeddingA, limit: 3 },\n    { vector: embeddingB, limit: 3 },\n  ],\n})`, returns: 'ScoredPoint[][]，外层顺序与 searches 一一对应。',
    interview: 'Batch 优化传输与调度，不代表把多个 query 融合为一个排名；融合应使用 query prefetch/fusion 或业务 rerank。', pitfall: '必须按索引映射结果；单批过大可能触发 timeout/strict mode 限制并放大失败重试成本。', officialUrl: `${SEARCH}/batch-points`,
  }),
  qdrantApi({
    slug: 'recommend', name: 'recommend', group: '检索与 Query', kind: 'function', signature: 'client.recommend(collectionName, { positive, negative?, strategy?, using?, filter?, limit?, ... }): Promise<ScoredPoint[]>',
    beginner: '用喜欢的正样本和不喜欢的负样本生成检索方向；样本可以是已有 point id 或原始向量。', whenToUse: '相似商品、用户反馈推荐、“像这些但不像那些”的探索。',
    example: `const recommendations = await client.recommend('products', {\n  positive: ['liked-1', 'liked-2'],\n  negative: ['disliked-1'],\n  using: 'dense',\n  limit: 10,\n})`, returns: '按推荐得分排序的 ScoredPoint[]。',
    interview: '推荐将多个正负示例聚合成查询目标；average_vector 与 best_score 等 strategy 表达不同偏好，离线评测比盲选更重要。', pitfall: '引用 point id 时对应向量必须存在且空间相同；冷启动、反馈偏差和租户过滤不能忽略。', officialUrl: `${SEARCH}/recommend-points`,
  }),
  qdrantApi({
    slug: 'recommend-batch', name: 'recommendBatch', group: '检索与 Query', kind: 'function', signature: 'client.recommendBatch(collectionName, { searches, consistency?, timeout? }): Promise<ScoredPoint[][]>',
    beginner: '一次发送多条推荐请求，返回与 searches 顺序对应的多组推荐结果。', whenToUse: '批量为多个用户/会话生成候选，或离线评测推荐策略。',
    example: `const batches = await client.recommendBatch('products', {\n  searches: [\n    { positive: [1], negative: [9], limit: 5 },\n    { positive: [2, 3], limit: 5 },\n  ],\n})`, returns: 'ScoredPoint[][]。',
    interview: '批量接口降低 HTTP 开销，但每个 recommendation 仍是独立检索；跨用户请求必须各自带 tenant filter。', pitfall: '不要使用重复蛇形别名 recommend_batch；结果按请求顺序映射，批量上限要受服务端资源保护。', officialUrl: `${SEARCH}/recommend-batch-points`,
  }),
  qdrantApi({
    slug: 'search-point-groups', name: 'searchPointGroups', group: '检索与 Query', kind: 'function', signature: 'client.searchPointGroups(collectionName, { vector, group_by, group_size, limit, ... }): Promise<GroupsResult>',
    beginner: '先做向量搜索，再按某个 payload 字段分组，每组只保留若干结果，避免同一文档的很多 chunk 霸占前 N 名。', whenToUse: 'RAG 按 document_id 去重、商品按商家分组、新闻按来源多样化。',
    example: `const result = await client.searchPointGroups('chunks', {\n  vector: queryEmbedding,\n  group_by: 'document_id',\n  group_size: 2,\n  limit: 5,\n  with_payload: true,\n})`, returns: 'GroupsResult，包含按 group id 组织的 hits。',
    interview: '分组在召回阶段控制结果多样性，比客户端拿 topK 后粗暴去重更能保证每组有足够候选。group_by 字段应建 keyword/integer index。', pitfall: 'group_by 值缺失的点不会按预期分组；group_size×limit 决定返回规模，避免拉取过大。', officialUrl: `${SEARCH}/point-groups`,
  }),
  qdrantApi({
    slug: 'recommend-point-groups', name: 'recommendPointGroups', group: '检索与 Query', kind: 'function', signature: 'client.recommendPointGroups(collectionName, { positive, negative?, group_by, group_size, limit, ... }): Promise<GroupsResult>',
    beginner: '把正负样本推荐与 payload 分组结合，既“像喜欢的内容”，又控制每个文档、品牌或类别的结果数量。', whenToUse: '推荐流多样化、按父文档聚合相关 chunks。',
    example: `const groups = await client.recommendPointGroups('products', {\n  positive: ['liked-1'],\n  group_by: 'brand',\n  group_size: 2,\n  limit: 10,\n})`, returns: 'GroupsResult。',
    interview: '这是 recommendation scoring + grouping 两层约束；多样性不是 rerank 的副产品，需要显式 group key 和候选预算。', pitfall: 'group 字段应索引且类型稳定；正负样本与 using 向量必须属于兼容空间。', officialUrl: `${SEARCH}/recommend-point-groups`,
  }),
  qdrantApi({
    slug: 'discover-points', name: 'discoverPoints', group: '检索与 Query', kind: 'function', signature: 'client.discoverPoints(collectionName, { target, context, using?, filter?, limit?, ... }): Promise<ScoredPoint[]>',
    beginner: 'Discover 不只找“最像 target”，还用 context 中的正负样本对帮助确定你想探索的方向，适合在已有候选附近发现新内容。', whenToUse: '探索性推荐、基于上下文对的偏好学习或相似结果过于单一时。',
    example: `const hits = await client.discoverPoints('products', {\n  target: 'candidate-42',\n  context: [{ positive: 'liked-1', negative: 'disliked-1' }],\n  limit: 10,\n})`, returns: 'ScoredPoint[]。',
    interview: 'Discover 以 target 相似度为基础，再用 context pair 判断方向一致性；它不同于只求平均正负向量的 recommend。', pitfall: 'context 样本质量决定结果；id 对应向量必须存在，仍需 tenant filter 防止跨域引用。', officialUrl: `${SEARCH}/discover-points`,
  }),
  qdrantApi({
    slug: 'discover-batch-points', name: 'discoverBatchPoints', group: '检索与 Query', kind: 'function', signature: 'client.discoverBatchPoints(collectionName, { searches, consistency?, timeout? }): Promise<ScoredPoint[][]>',
    beginner: '一次执行多条独立 discover 请求，外层数组与 searches 一一对应。', whenToUse: '离线探索评测、多用户批处理或多个 target 同时发现候选。',
    example: `const results = await client.discoverBatchPoints('products', {\n  searches: [\n    { target: 1, context: [{ positive: 2, negative: 3 }], limit: 5 },\n    { target: 4, context: [], limit: 5 },\n  ],\n})`, returns: 'ScoredPoint[][]。',
    interview: '与其他 batch API 一样优化往返，不融合结果；评测系统需要保留 query id 与数组位置映射。', pitfall: '单批太大导致尾延迟和重试成本上升；每条搜索都要带正确过滤条件。', officialUrl: `${SEARCH}/discover-batch-points`,
  }),
  qdrantApi({
    slug: 'query', name: 'query', group: '检索与 Query', kind: 'function', signature: 'client.query(collectionName, { query?, prefetch?, using?, filter?, params?, limit?, offset?, ... }): Promise<QueryResponse>',
    beginner: '统一查询入口，能表达 nearest、recommend、discover、sample，也能先 prefetch 多路候选再做 fusion、公式打分或多阶段 rerank。', whenToUse: '新项目、hybrid dense+sparse、两阶段检索、随机采样或复杂排名组合。',
    example: `const result = await client.query('documents', {\n  prefetch: [\n    { query: denseVector, using: 'dense', limit: 50 },\n    { query: sparseVector, using: 'sparse', limit: 50 },\n  ],\n  query: { fusion: 'rrf' },\n  limit: 10,\n  with_payload: ['text'],\n})`, returns: 'QueryResponse，核心字段 points 为统一查询后的 ScoredPoint 列表。',
    interview: 'prefetch 是候选召回层，主 query 是融合/重排层；hybrid 检索常用 RRF 融合不同分值尺度，避免直接相加不可比 score。', pitfall: 'prefetch limit 必须大于最终 limit 才有 rerank 空间；named vector、filter、payload index 和超时都要一起设计。', officialUrl: `${SEARCH}/query-points`,
  }),
  qdrantApi({
    slug: 'query-batch', name: 'queryBatch', group: '检索与 Query', kind: 'function', signature: 'client.queryBatch(collectionName, { searches, consistency?, timeout? }): Promise<QueryResponse[]>',
    beginner: '批量执行多个统一 Query 请求，每个请求都可以有自己的 prefetch、fusion、filter 和返回字段。', whenToUse: '批量 RAG 检索、评测数据集或多子问题并行召回。',
    example: `const responses = await client.queryBatch('documents', {\n  searches: [\n    { query: embeddingA, limit: 5 },\n    { query: embeddingB, filter: tenantFilter, limit: 5 },\n  ],\n})`, returns: 'QueryResponse[]，顺序与 searches 相同。',
    interview: 'queryBatch 是现代通用批接口，能力覆盖旧 search/recommend batch；批量只减少往返，仍需管理总候选数和集群负载。', pitfall: '不要把所有用户混入无过滤批次；批量中一个超重 query 会拖高整批尾延迟。', officialUrl: `${SEARCH}/query-batch-points`,
  }),
  qdrantApi({
    slug: 'query-groups', name: 'queryGroups', group: '检索与 Query', kind: 'function', signature: 'client.queryGroups(collectionName, { query?, prefetch?, group_by, group_size, limit, with_lookup?, ... }): Promise<GroupsResult>',
    beginner: '把统一 Query 的多阶段/hybrid 能力和分组结合，还可用 with_lookup 从另一个 collection 补充组级信息。', whenToUse: 'hybrid RAG 按父文档聚合 chunks，或分组后需要回查文档标题等父记录。',
    example: `const groups = await client.queryGroups('chunks', {\n  query: queryEmbedding,\n  group_by: 'document_id',\n  group_size: 3,\n  limit: 5,\n  with_lookup: { collection: 'documents', with_payload: true },\n})`, returns: 'GroupsResult，组中包含 hits，并可包含 lookup 记录。',
    interview: 'Parent-document retrieval 用 chunk collection 召回、document_id 分组、lookup collection 补元数据，兼顾细粒度匹配与文档级展示。', pitfall: 'lookup id 类型必须与 group_by 值匹配；跨 collection lookup 增加 I/O，字段需索引并限制返回 payload。', officialUrl: `${SEARCH}/query-points-groups`,
  }),
  qdrantApi({
    slug: 'facet', name: 'facet', group: '检索与 Query', kind: 'function', signature: 'client.facet(collectionName, { key, filter?, limit?, exact?, shard_key? }): Promise<FacetResponse>',
    beginner: '像 SQL GROUP BY + COUNT：统计某个 payload 字段有哪些值以及各有多少点，可叠加 filter。', whenToUse: '搜索侧边栏品牌/类别计数、数据分布检查或估算过滤选择性。',
    example: `const facets = await client.facet('products', {\n  key: 'brand',\n  filter: { must: [{ key: 'in_stock', match: { value: true } }] },\n  limit: 20,\n  exact: true,\n})`, returns: 'FacetResponse，hits 中包含 value 与 count。',
    interview: 'Facet 依赖支持 MatchValue 的 payload index（如 keyword）；索引同时帮助过滤基数估计和 query planning。', pitfall: '未建合适索引无法高效/严格模式下可能被拒绝；默认 limit 只返回部分唯一值。', officialUrl: `${POINTS}/facet`,
  }),
  qdrantApi({
    slug: 'search-matrix-pairs', name: 'searchMatrixPairs', group: '检索与 Query', kind: 'function', signature: 'client.searchMatrixPairs(collectionName, { filter?, sample?, limit?, using?, ... }): Promise<SearchMatrixPairsResponse>',
    beginner: '从采样 points 计算成对距离/相似度，并以 id 对列表返回，适合看数据簇、重复和覆盖，而不是面向用户的 topK 查询。', whenToUse: '离线探索、聚类前分析、重复检测或可视化样本关系。',
    example: `const matrix = await client.searchMatrixPairs('documents', {\n  sample: 100,\n  limit: 10,\n  using: 'dense',\n})\nconsole.log(matrix.pairs)`, returns: 'SearchMatrixPairsResponse，以 point id 对和 score 表示矩阵非零/近邻关系。',
    interview: '完整 N×N 矩阵成本是平方级，Qdrant 通过 sample/limit 控制规模；pairs 格式适合稀疏边列表。', pitfall: '不要对全库无界执行；采样结果不是全局统计真相，using 必须选对向量空间。', officialUrl: `${SEARCH}/matrix-pairs`,
  }),
  qdrantApi({
    slug: 'search-matrix-offsets', name: 'searchMatrixOffsets', group: '检索与 Query', kind: 'function', signature: 'client.searchMatrixOffsets(collectionName, { filter?, sample?, limit?, using?, ... }): Promise<SearchMatrixOffsetsResponse>',
    beginner: '与 matrix pairs 计算相同关系，但返回 ids 列表及行列 offset，适合直接构造数值矩阵或图算法输入。', whenToUse: '前端热力图、聚类/图算法或需要紧凑矩阵索引表示时。',
    example: `const matrix = await client.searchMatrixOffsets('documents', {\n  sample: 50,\n  limit: 10,\n  using: 'dense',\n})\nconsole.log(matrix.ids, matrix.offsets, matrix.scores)`, returns: 'SearchMatrixOffsetsResponse，包含 ids、offsets 与 scores。',
    interview: 'pairs 易读，offsets 更紧凑；两者是同一距离矩阵信息的不同编码，客户端需按官方索引语义重建关系。', pitfall: '不要把 offset 当 point id；大 sample/limit 仍会产生高计算和传输成本。', officialUrl: `${SEARCH}/matrix-offsets`,
  }),

  qdrantApi({
    slug: 'create-payload-index', name: 'createPayloadIndex', group: 'Payload Index', kind: 'function', signature: 'client.createPayloadIndex(collectionName, { field_name, field_schema, wait?, ordering? }): Promise<UpdateResult>',
    beginner: '给经常过滤、分组或 facet 的 payload 字段建立类型索引，类似数据库给列建索引；类型可为 keyword、integer、float、geo、text 等。', whenToUse: 'tenant、document_id、status、时间范围等会频繁参与 filter/group_by 的字段，最好在大量导入前创建。',
    example: `await client.createPayloadIndex('documents', {\n  field_name: 'tenant',\n  field_schema: 'keyword',\n  wait: true,\n})`, returns: 'UpdateResult；索引构建可能后台进行。',
    interview: 'Payload index 不只加速过滤，还提供 cardinality estimation，帮助 planner 在 payload-first、full scan 与 filterable HNSW 之间选策略。', pitfall: '字段类型必须与实际 payload 一致；索引过多占内存并拖慢写入，Cloud strict mode 还限制数量。', officialUrl: `${INDEXES}/create-field-index`,
  }),
  qdrantApi({
    slug: 'delete-payload-index', name: 'deletePayloadIndex', group: 'Payload Index', kind: 'function', signature: 'client.deletePayloadIndex(collectionName, fieldName, { wait?, ordering?, timeout? }?): Promise<UpdateResult>',
    beginner: '删除某个 payload 字段的索引，但不会删除 points 上的字段值；之后仍可能扫描过滤，只是性能下降或被 strict mode 拒绝。', whenToUse: '字段不再查询、索引类型要重建或需要回收内存。',
    example: `await client.deletePayloadIndex('documents', 'legacy_tag', { wait: true })`, returns: 'UpdateResult。',
    interview: '数据与索引生命周期分离；删除索引是物理访问路径变更，不是逻辑数据删除。', pitfall: '先检查线上 filter/facet/group_by 依赖；严格模式开启时删除后相关查询可能直接失败。', officialUrl: `${INDEXES}/delete-field-index`,
  }),

  qdrantApi({
    slug: 'list-snapshots', name: 'listSnapshots', group: 'Snapshot', kind: 'function', signature: 'client.listSnapshots(collectionName): Promise<SnapshotDescription[]>',
    beginner: '列出当前节点上某个 collection 的 snapshots，包含文件名、大小、创建时间和校验和。', whenToUse: '备份盘点、恢复前选择版本或清理旧快照。',
    example: `const snapshots = await client.listSnapshots('documents')\nconsole.table(snapshots)`, returns: 'SnapshotDescription[]。',
    interview: 'Collection snapshot 包含该 collection 的配置、points 与 payload，但不包含 aliases；分布式集群每个节点只快照本地 shard 数据。', pitfall: '只在一个节点看到 snapshot 不代表集群完整备份；还要备份 alias 和验证恢复流程。', officialUrl: `${SNAPSHOTS}/list-snapshots`,
  }),
  qdrantApi({
    slug: 'create-snapshot', name: 'createSnapshot', group: 'Snapshot', kind: 'function', signature: 'client.createSnapshot(collectionName, { wait? }?): Promise<SnapshotDescription | null>',
    beginner: '为指定 collection 在当前节点创建 tar snapshot，用于归档、复制或灾难恢复。', whenToUse: '高风险迁移前、定期备份或把 collection 迁到另一实例。',
    example: `const snapshot = await client.createSnapshot('documents', { wait: true })\nif (!snapshot) throw new Error('Snapshot not ready')\nconsole.log(snapshot.name, snapshot.checksum)`, returns: 'wait 完成后返回 SnapshotDescription；某些异步情形可能为 null。',
    interview: 'snapshot 是某节点上 collection 数据的一致归档；分布式部署要为各节点/各 shard 设计完整备份，Cloud 通常优先 backups。', pitfall: '创建成功后还要把文件复制到独立存储并验证 checksum；同机磁盘损坏会同时丢数据和快照。', officialUrl: `${SNAPSHOTS}/create-snapshot`,
  }),
  qdrantApi({
    slug: 'delete-snapshot', name: 'deleteSnapshot', group: 'Snapshot', kind: 'function', signature: 'client.deleteSnapshot(collectionName, snapshotName, { wait? }?): Promise<boolean>',
    beginner: '删除某个 collection 的指定 snapshot 文件，不会删除当前线上 collection。', whenToUse: '执行备份保留策略、清理已上传到对象存储的旧快照。',
    example: `await client.deleteSnapshot('documents', snapshotName, { wait: true })`, returns: '删除成功返回 true。',
    interview: '快照生命周期需要保留窗口、异地副本、校验和与定期恢复演练，单纯“创建过”不等于可恢复。', pitfall: 'snapshotName 必须来自可信列表，避免路径/误删风险；确认远端备份完整后再清理本地。', officialUrl: `${SNAPSHOTS}/delete-snapshot`,
  }),
  qdrantApi({
    slug: 'list-full-snapshots', name: 'listFullSnapshots', group: 'Snapshot', kind: 'function', signature: 'client.listFullSnapshots(): Promise<SnapshotDescription[]>',
    beginner: '列出当前节点的全存储 snapshots；全量 snapshot 覆盖该节点上的所有 collections，而不是单个 collection。', whenToUse: '节点级备份盘点和灾难恢复管理。',
    example: `const fullSnapshots = await client.listFullSnapshots()\nconsole.log(fullSnapshots.map(item => item.name))`, returns: 'SnapshotDescription[]。',
    interview: 'Full snapshot 是节点级物理备份单元，分布式集群仍要覆盖每个节点；它不同于 Cloud backup 的托管语义。', pitfall: '文件通常更大，保留和下载会占用磁盘/带宽；访问权限应仅限运维。', officialUrl: `${SNAPSHOTS}/list-full-snapshots`,
  }),
  qdrantApi({
    slug: 'create-full-snapshot', name: 'createFullSnapshot', group: 'Snapshot', kind: 'function', signature: 'client.createFullSnapshot({ wait? }?): Promise<SnapshotDescription>',
    beginner: '为当前 Qdrant 节点上的整个 storage 创建快照，一次覆盖该节点的全部 collections。', whenToUse: '节点级定期备份、版本升级或基础设施迁移前。',
    example: `const snapshot = await client.createFullSnapshot({ wait: true })\nconsole.log(snapshot.name, snapshot.size)`, returns: 'SnapshotDescription。',
    interview: '节点全量 snapshot 简化单机恢复，但集群级 RPO/RTO 仍取决于所有节点快照协调、外部存储和恢复编排。', pitfall: '会产生显著 I/O 和磁盘占用；不要在容量不足或高峰期无计划执行。', officialUrl: `${SNAPSHOTS}/create-full-snapshot`,
  }),
  qdrantApi({
    slug: 'delete-full-snapshot', name: 'deleteFullSnapshot', group: 'Snapshot', kind: 'function', signature: 'client.deleteFullSnapshot(snapshotName, { wait? }?): Promise<boolean>',
    beginner: '删除当前节点上的一个 full snapshot，不影响正在运行的 collections。', whenToUse: '全量备份过期且已确认远端副本可恢复时。',
    example: `const ok = await client.deleteFullSnapshot(fullSnapshotName, { wait: true })`, returns: '删除成功返回 true。',
    interview: '备份清理应由可审计保留策略驱动，而不是磁盘满时临时删；至少保留跨故障域副本和最近恢复点。', pitfall: '这是节点级大文件，误删影响多个 collection 的恢复能力；先校验名称、checksum 和远端副本。', officialUrl: `${SNAPSHOTS}/delete-full-snapshot`,
  }),
  qdrantApi({
    slug: 'recover-snapshot', name: 'recoverSnapshot', group: 'Snapshot', kind: 'function', signature: 'client.recoverSnapshot(collectionName, { location, priority?, checksum?, api_key? }): Promise<boolean>',
    beginner: '让 Qdrant 从 URL 或本地 file URI 拉取 collection snapshot 并恢复，会覆盖本节点现有 collection 数据。', whenToUse: '灾难恢复、从另一实例迁移 collection 或回滚到快照。',
    example: `await client.recoverSnapshot('documents', {\n  location: 'https://backup.example/documents.snapshot',\n  checksum: expectedSha256,\n  priority: 'snapshot',\n})`, returns: '恢复请求成功返回 true。',
    interview: 'priority 决定 snapshot 与现有 replica 谁是 source of truth；分布式恢复不同于单机，必须理解 shard/replica 同步。', pitfall: '恢复会覆盖数据；URL 下载凭据、checksum、网络可达性和版本兼容必须先验证，禁止用户任意 location。', officialUrl: `${SNAPSHOTS}/recover-from-snapshot`,
  }),
  qdrantApi({
    slug: 'recover-shard-snapshot', name: 'recoverShardFromSnapshot', group: 'Snapshot', kind: 'function', signature: 'client.recoverShardFromSnapshot(collectionName, shardId, { location, priority?, checksum?, wait? }): Promise<boolean>',
    beginner: '只恢复 collection 的一个 shard，主要用于分布式集群某个 shard 副本丢失时，而不是普通应用数据导入。', whenToUse: '集群故障恢复、手工重建缺失 shard replica。',
    example: `await client.recoverShardFromSnapshot('documents', 3, {\n  location: 'https://backup.example/shard-3.snapshot',\n  priority: 'snapshot',\n  wait: true,\n})`, returns: '恢复操作接受后返回 true。',
    interview: 'Shard 是 collection 的独立数据分区；恢复目标、peer placement 和 replica source-of-truth 必须与集群拓扑一致。', pitfall: '运维级危险操作，不应暴露到业务 API；选错 shard/priority 可能覆盖健康副本。', officialUrl: `${SNAPSHOTS}/recover-shard-from-snapshot`,
  }),
  qdrantApi({
    slug: 'list-shard-snapshots', name: 'listShardSnapshots', group: 'Snapshot', kind: 'function', signature: 'client.listShardSnapshots(collectionName, shardId): Promise<SnapshotDescription[]>',
    beginner: '列出当前节点上某个 collection 某个 shard 的快照，用于检查分布式备份覆盖。', whenToUse: '集群备份审计和 shard 恢复前选择文件。',
    example: `const snapshots = await client.listShardSnapshots('documents', 3)\nconsole.log(snapshots)`, returns: 'SnapshotDescription[]。',
    interview: 'Shard snapshot 粒度更细，适合恢复单个丢失分片；完整备份仍需映射所有 shard、replica 与节点。', pitfall: '同一 shard 在不同 peer 上快照可能不同时间；记录拓扑和创建时间，避免拼出不一致恢复集。', officialUrl: `${SNAPSHOTS}/list-shard-snapshots`,
  }),
  qdrantApi({
    slug: 'create-shard-snapshot', name: 'createShardSnapshot', group: 'Snapshot', kind: 'function', signature: 'client.createShardSnapshot(collectionName, shardId, { wait }): Promise<SnapshotDescription>',
    beginner: '为当前节点承载的指定 shard 创建快照，文件只包含这个分片的数据。', whenToUse: '分布式备份、移动/恢复特定 shard。',
    example: `const snapshot = await client.createShardSnapshot('documents', 3, { wait: true })\nconsole.log(snapshot.checksum)`, returns: 'SnapshotDescription。',
    interview: 'Shard snapshot 便于并行和局部恢复，但备份编排必须知道每个 shard 的有效 replica 位于哪个 peer。', pitfall: '请求发送到不承载该 shard 的节点会失败；创建后要异地保存并核验 checksum。', officialUrl: `${SNAPSHOTS}/create-shard-snapshot`,
  }),
  qdrantApi({
    slug: 'delete-shard-snapshot', name: 'deleteShardSnapshot', group: 'Snapshot', kind: 'function', signature: 'client.deleteShardSnapshot(collectionName, shardId, snapshotName, { wait }): Promise<boolean>',
    beginner: '删除当前节点上指定 shard 的某个 snapshot 文件。', whenToUse: '分片备份过期且远端副本已确认可用时。',
    example: `await client.deleteShardSnapshot('documents', 3, snapshotName, { wait: true })`, returns: '删除成功返回 true。',
    interview: '细粒度快照也需要集中 catalog，否则难以判断删除后是否仍有完整恢复集合。', pitfall: '同时校验 collection、shardId 和 snapshotName；不能只按同名文件推断它属于正确分片。', officialUrl: `${SNAPSHOTS}/delete-shard-snapshot`,
  }),

  qdrantApi({
    slug: 'collection-cluster-info', name: 'collectionClusterInfo', group: '集群与 Sharding', kind: 'function', signature: 'client.collectionClusterInfo(collectionName): Promise<CollectionClusterInfo>',
    beginner: '查看某个 collection 的 shard 分布：本地 shard、远端 shard、replica 状态和正在传输的 shard。', whenToUse: '扩缩容、故障诊断、确认副本健康或执行 shard move/replicate 前。',
    example: `const topology = await client.collectionClusterInfo('documents')\nconsole.log(topology.local_shards, topology.remote_shards, topology.shard_transfers)`, returns: 'CollectionClusterInfo。',
    interview: 'Collection 被切成 shards，每个 shard 可有 replicas；任一节点可协调查询，但实际数据分布和副本状态决定可用性与负载。', pitfall: '拓扑会变化，读取后再操作存在竞态；自动化必须处理 transfer 中状态并重试校验。', officialUrl: `${DISTRIBUTED}/collection-cluster-info`,
  }),
  qdrantApi({
    slug: 'update-collection-cluster', name: 'updateCollectionCluster', group: '集群与 Sharding', kind: 'function', signature: 'client.updateCollectionCluster(collectionName, operation & { timeout? }): Promise<boolean>',
    beginner: '发起 move_shard、replicate_shard、drop_replica、abort_transfer 等集群拓扑操作，是手工重平衡的控制面接口。', whenToUse: '自建 Qdrant 集群扩容、下线节点、补副本或处理卡住的 shard transfer。',
    example: `await client.updateCollectionCluster('documents', {\n  move_shard: { shard_id: 2, from_peer_id: 10, to_peer_id: 11, method: 'stream_records' },\n})`, returns: '操作被接受返回 true；传输通常后台继续。',
    interview: 'Collection 元数据操作经过 Raft 共识，point 写不提供同等级强事务；shard move 需要源、目标和传输方法，完成前持续监控。', pitfall: '错误 drop/move 会降低副本数甚至丢数据；业务服务不应拥有此权限，变更前确认 quorum 和备份。', officialUrl: `${DISTRIBUTED}/update-collection-cluster`,
  }),
  qdrantApi({
    slug: 'list-shard-keys', name: 'listShardKeys', group: '集群与 Sharding', kind: 'function', signature: 'client.listShardKeys(collectionName): Promise<ShardKeysResponse>',
    beginner: '列出 custom sharding collection 中已有的 shard keys，例如按租户或区域把 points 定向到一组 shards。', whenToUse: '管理自定义分片租户、检查 routing key 是否已创建。',
    example: `const result = await client.listShardKeys('tenant-documents')\nconsole.log(result.keys)`, returns: 'ShardKeysResponse。',
    interview: 'Custom sharding 由业务提供 shard_key，能隔离租户并定向查询；key 数量、每 key shards 和 placement 共同影响资源分布。', pitfall: '不要把任意用户输入直接当 shard key；key 生命周期要与租户数据删除和容量规划一致。', officialUrl: `${DISTRIBUTED}/list-shard-keys`,
  }),
  qdrantApi({
    slug: 'create-shard-key', name: 'createShardKey', group: '集群与 Sharding', kind: 'function', signature: 'client.createShardKey(collectionName, { shard_key, shards_number?, replication_factor?, placement?, timeout? }): Promise<boolean>',
    beginner: '为 custom sharding collection 创建一个业务路由 key，并配置该 key 对应的 shard 数、副本数和放置位置。', whenToUse: '新租户/区域接入，需要物理隔离或可定向扩缩容时。',
    example: `await client.createShardKey('tenant-documents', {\n  shard_key: 'tenant-acme',\n  shards_number: 2,\n  replication_factor: 2,\n})`, returns: '创建成功返回 true。',
    interview: 'User-defined sharding 把路由责任交给应用，换来租户级 placement 与查询裁剪；请求写入和查询都必须携带一致 shard_key。', pitfall: '创建过多小 shard 会增加资源和调度开销；placement 指定 peer 前要检查容量与故障域。', officialUrl: `${DISTRIBUTED}/create-shard-key`,
  }),
  qdrantApi({
    slug: 'delete-shard-key', name: 'deleteShardKey', group: '集群与 Sharding', kind: 'function', signature: 'client.deleteShardKey(collectionName, { shard_key, timeout? }): Promise<boolean>',
    beginner: '删除 custom shard key 及其关联 shards，是租户级破坏性数据删除操作。', whenToUse: '租户彻底下线且数据已备份/确认无需保留。',
    example: `await client.deleteShardKey('tenant-documents', { shard_key: 'tenant-old', timeout: 120 })`, returns: '删除成功返回 true。',
    interview: 'Shard key 是路由和数据放置单元，删除不是只删一个标签；它会移除对应 shard 数据，应进入受审计运维流程。', pitfall: '不可把客户端参数直通；删除前 count、snapshot、双人确认，并停止该 key 的所有写入。', officialUrl: `${DISTRIBUTED}/delete-shard-key`,
  }),
  qdrantApi({
    slug: 'cluster-telemetry', name: 'clusterTelemetry', group: '集群与 Sharding', kind: 'function', signature: 'client.clusterTelemetry({ details_level?, per_collection?, timeout? }?): Promise<DistributedTelemetryData>',
    beginner: '收集分布式集群的诊断遥测，包括 peers、collections 和硬件/运行信息，主要供运维排障而非业务查询。', whenToUse: '集群故障、性能诊断或向官方提交问题前收集上下文。',
    example: `const telemetry = await client.clusterTelemetry({\n  details_level: 1,\n  per_collection: true,\n  timeout: 30,\n})\nconsole.log(telemetry)`, returns: 'DistributedTelemetryData。',
    interview: 'Telemetry 与 metrics 不同：前者是按需诊断快照，后者用于持续监控；生产要限制端点权限和数据体积。', pitfall: '可能包含集群拓扑和环境信息，不能暴露给普通用户；高 details_level 会增加响应体与采集成本。', officialUrl: `${DISTRIBUTED}/cluster-telemetry`,
  }),
  qdrantApi({
    slug: 'version-info', name: 'versionInfo', group: '服务诊断', kind: 'function', signature: 'client.versionInfo(): Promise<VersionInfo>',
    beginner: '读取 Qdrant 服务端版本、提交信息等实例详情，用于健康自检和确认客户端兼容性。', whenToUse: '应用启动诊断、升级验收、问题报告或功能开关按服务端版本判断时。',
    example: `const version = await client.versionInfo()\nconsole.log(version.version, version.commit)`, returns: 'VersionInfo。',
    interview: '@qdrant/js-client-rest 的 major/minor 与 engine 版本对齐；默认兼容检查要求 major 相同且 minor 差距不超过 1。', pitfall: '不要只因 root 可访问就认定数据面健康；还要检查 collection status、集群和真实读写探针。', officialUrl: `${API}/service/root`,
  }),
]

export const QDRANT_FRAMEWORK_API_EXPECTED_COUNT = 60

if (qdrantFrameworkApis.length !== QDRANT_FRAMEWORK_API_EXPECTED_COUNT) {
  throw new Error(`Qdrant framework API catalog expected ${QDRANT_FRAMEWORK_API_EXPECTED_COUNT} entries, received ${qdrantFrameworkApis.length}`)
}

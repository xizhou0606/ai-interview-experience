import { AI_INTERVIEW_COMMIT } from '../helpers'
import type { ApiEntry } from '../types'

const SOURCE = 'apps/ai-recruitment-copilot-backend/src/server/routes/studio/routes/resume-pool/route.ts'
const ROUTE_TEST = 'apps/ai-recruitment-copilot-backend/src/server/routes/studio/routes/resume-pool/__tests__/route.test.ts'
const DAO_TEST = 'apps/ai-recruitment-copilot-backend/src/server/routes/studio/routes/resume-pool/__tests__/dao.test.ts'
const hono = { label: 'Hono validation', url: 'https://hono.dev/docs/guides/validation' }
const drizzle = { label: 'Drizzle transactions', url: 'https://orm.drizzle.team/docs/transactions' }
const owasp = { label: 'OWASP object authorization', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html' }
const s3 = { label: 'AWS S3 streaming', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html' }
const cache = { label: 'MDN HTTP caching', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching' }

type Spec = {
  slug: string; method: 'GET' | 'POST' | 'DELETE'; path: string; line: number; manifest: string; technology: string
  summary: string; use: string; params?: ApiEntry['parameters']; returns: string; result: string; code: string
  visible: string; error: string; recovery: string; practice: string; test?: string; proves: string; related: string[]
  module?: string; sources?: ApiEntry['officialSources']; transport?: 'json' | 'binary'
}

function definePoolHttp(s: Spec): ApiEntry {
  const endpoint = `${s.method} ${s.path}`
  const idParameter = s.path.includes('/:id') ? [{ name: 'id', type: 'path string', required: true, description: '仅能解析当前用户可访问的 active pool item；不可接受客户端组织 ID。' }] : []
  return {
    slug: s.slug, name: endpoint, signature: `${endpoint} → ${s.returns}`, kind: 'http', project: 'ai-interview', module: s.module ?? 'data-runtime', technology: s.technology,
    implementationStatus: 'production', statusNote: `生产端点；manifest 核对为 ${s.manifest}。${s.proves}`,
    summary: s.summary, whenToUse: s.use, sourcePath: SOURCE, sourceLine: s.line, verifiedCommit: AI_INTERVIEW_COMMIT,
    parameters: [{ name: 'slug', type: 'path string', required: true, description: 'workspaceMiddleware 解析出的当前组织。' }, ...idParameter, ...(s.params ?? [])],
    returns: { type: s.returns, description: s.result },
    example: { language: 'ts', code: s.code, explanation: [`真实案例：${s.visible}`, '客户端先检查 response.ok；二进制端点读取 Blob，JSON 端点再解析业务错误。'] },
    effect: { title: s.visible, description: s.result, metrics: [{ label: 'transport', value: s.transport ?? 'json' }, { label: 'manifest status', value: s.manifest }, { label: 'scope', value: 'workspace + actor/object' }], output: [{ label: '成功', value: s.visible, tone: 'good' }, { label: '失败', value: s.error, tone: 'warn' }] },
    errors: [{ condition: s.error, behavior: `端点按契约拒绝请求；${s.proves}`, recovery: s.recovery }, { condition: '会话、workspace 或对象范围不成立', behavior: '401/404，且不返回跨租户对象。', recovery: '恢复当前工作区会话并重新从有权列表选择对象，不要用组织 ID 或对象 ID 猜测重试。' }],
    bestPractices: [s.practice, '对象查询同时约束 workspace、actor/visibility 与 id；公共池来源也不能绕过导入目标组织授权。', '上传/发布/导入写操作记录幂等键、审计事件、延迟和失败类别；AI/索引副作用可重放且不阻塞主事务。'],
    tests: [{ path: s.test ?? ROUTE_TEST, proves: s.proves }], officialSources: [hono, drizzle, owasp, ...(s.sources ?? [])], related: s.related,
  }
}

export const studioResumePoolHttpApis: ApiEntry[] = [
  definePoolHttp({
    slug: 'list-studio-resume-pool-http', method: 'GET', path: '/api/w/:slug/studio/resume-pool', line: 75, manifest: 'JSON 200；错误 401', technology: 'Hono Zod + Drizzle scoped list',
    summary: '按 private/public scope 列出 active 简历池；private 同时约束 organizationId+createdBy，public 为跨组织共享池，最多返回最近 100 条并补充导入、来源和重复摘要。', use: '个人暂存池或公共人才池页面初始化时。', params: [{ name: 'scope', type: 'private | public', required: false, defaultValue: 'private', description: '决定 owner-scoped 私池或全局公共池。' }], returns: '200 { records: ResumePoolListRecord[]; total: number } | 401', result: '列表包含上传者、来源组织、解析状态、导入状态和重复摘要；total 可能大于实际返回的 100 条。', code: `const pool = await fetch('/api/w/acme/studio/resume-pool?scope=private', { credentials: 'include' }).then(r => r.json())`, visible: '简历池卡片显示来源、解析、重复与入库状态', error: 'scope 非 private/public 或 activeOrg/user 缺失', recovery: '固定使用枚举；规模超过 100 时给 DAO 增加 cursor/page，避免把 total 误当 records.length。', practice: '公共池必须明确 PII 分享政策、撤回/保留期；列表应分页，不能用硬 limit(100) 伪装完整结果。', test: DAO_TEST, proves: 'DAO 测试覆盖 private owner/public scope 和列表映射；未直接证明 HTTP 401、查询 validator 与 100 条上限。', related: ['get-studio-resume-pool-item-http', 'list-studio-resumes-http'],
  }),
  definePoolHttp({
    slug: 'create-studio-resume-pool-http', method: 'POST', path: '/api/w/:slug/studio/resume-pool', line: 200, manifest: 'JSON 201；错误 400/401/500', technology: 'Multipart upload + fast parse + semantic dedup', module: 'semantic-search',
    summary: '校验 PDF/大小和表单，验证岗位归属，上传对象、复用缓存或快速解析 ResumeProfile，查语义重复并创建 processing 记录，再完成重复快照与语义索引就绪。', use: '用户把一份简历放入私池或公共池，尚不直接进入招聘台时。', params: [{ name: 'resume', type: 'multipart File', required: true, description: '源码 validateResumeFile 前置校验的简历文件。' }, { name: 'scope / candidate* / targetRole / notes / jobDescriptionId', type: 'multipart fields', required: true, description: 'scope 必填；其余有 40~10000 字符上限，岗位须属于 activeOrg。' }], returns: '201 ResumePoolDetail | 400 | 401 | 500', result: '成功即可看到解析后的候选人摘要和重复提示；对象上传失败为 500，其余可识别输入/解析异常被 toBadRequest 转为 400。', code: `const fd = new FormData(); fd.set('resume', file); fd.set('scope', 'private'); fd.set('candidateName', '林岚')\nconst item = await fetch('/api/w/acme/studio/resume-pool', { method: 'POST', body: fd, credentials: 'include' }).then(r => r.json())`, visible: '上传后出现可检索的简历池记录与重复候选提示', error: '缺文件、非法 PDF/超限、跨租户岗位、上传或 AI 解析失败', recovery: '保留表单与 content hash；输入错误就地修复，上传失败使用幂等键重试，解析/索引失败进入可观测重放队列。', practice: '对象存储和数据库不是单事务：用 content hash+幂等键、孤儿对象清理和 outbox/补偿任务治理双写。', proves: '路由集成测试直证私池 POST 201、actor/org 去重范围与重复快照写入；未覆盖真实 S3、解析器失败和 500。', related: ['find-semantic-resume-duplicates', 'put-object-bytes', 'list-studio-resume-pool-item-duplicate-matches-http'],
  }),
  definePoolHttp({
    slug: 'delete-studio-resume-pool-item-http', method: 'DELETE', path: '/api/w/:slug/studio/resume-pool/:id', line: 183, manifest: 'JSON 200；错误 401/404', technology: 'Drizzle owner-scoped delete + best-effort index cleanup',
    summary: '仅删除当前组织、当前创建者的 active pool item，随后 best-effort 清理向量索引和重复匹配。', use: '用户撤回自己上传且仍 active 的池记录时。', returns: '200 { success: true } | 401 | 404', result: '卡片消失；无权、非 active 或不存在统一落到 404，避免泄漏对象存在性。', code: `await fetch('/api/w/acme/studio/resume-pool/' + id, { method: 'DELETE', credentials: 'include' })`, visible: '自己的 active 池记录从列表移除', error: '记录不是本人创建、跨组织、非 active 或不存在', recovery: '刷新列表并把 404 当最终不可见；若索引清理失败由后台对账任务按已删 sourceId 重放。', practice: '数据库删除与外部索引清理采用 outbox/墓碑和周期对账；DELETE 应对重复请求定义幂等结果。', test: DAO_TEST, proves: 'DAO 测试覆盖 owner-scoped 删除和不可删除分支；manifest 的代表测试指向无关 offer-drafts，不能作为本端点证据。', related: ['list-studio-resume-pool-http', 'delete-studio-resume-http'],
  }),
  definePoolHttp({
    slug: 'get-studio-resume-pool-item-http', method: 'GET', path: '/api/w/:slug/studio/resume-pool/:id', line: 93, manifest: 'JSON 200；错误 401/404', technology: 'Hono + actor-aware Drizzle detail',
    summary: '用组织、用户和对象 ID 加载可访问池详情，并并行补充目标组织导入、上传者、来源渠道和重复匹配。', use: '打开简历池详情抽屉、发布或导入前确认状态时。', returns: '200 ResumePoolDetail | 401 | 404', result: '返回个人/公共可见详情；私池他人记录与不存在对象统一 404。', code: `const item = await fetch('/api/w/acme/studio/resume-pool/' + encodeURIComponent(id), { credentials: 'include' }).then(r => r.json())`, visible: '详情抽屉展示候选资料、文件、来源和导入状态', error: '对象不在当前 actor 可见范围', recovery: '回列表移除陈旧缓存；不要把 404 改成可枚举的“无权限”。', practice: '详情 DTO 只返回界面所需 PII，日志和缓存 key 不写明文邮箱/电话。', test: DAO_TEST, proves: 'DAO 测试覆盖 accessible item 与 detail presenter；没有本 GET handler 的直接状态码测试。', related: ['list-studio-resume-pool-http', 'get-studio-resume-pool-file-http'],
  }),
  definePoolHttp({
    slug: 'list-studio-resume-pool-item-duplicate-matches-http', method: 'GET', path: '/api/w/:slug/studio/resume-pool/:id/duplicate-matches', line: 108, manifest: 'JSON 200；错误 401/404', technology: 'Scoped source verification + semantic match snapshot', module: 'semantic-search',
    summary: '先证明 pool item 对当前用户可见，再以 organizationId、private owner、sourceType 和 sourceId 读取持久化重复匹配。', use: '重复确认弹窗解释为什么建议合并、跳过或继续导入时。', returns: '200 { matches: ResumeDuplicateMatch[] } | 401 | 404', result: 'UI 显示规则/向量相似度和候选来源，不重新运行昂贵的 embedding 检索。', code: `const { matches } = await fetch('/api/w/acme/studio/resume-pool/' + id + '/duplicate-matches', { credentials: 'include' }).then(r => r.json())`, visible: '重复弹窗展示持久化匹配原因与分数', error: '源记录不可见或重复快照已过期', recovery: '不可见返回列表；过期时触发受控重算并标记算法/索引版本。', practice: '重复结论记录 embedding、规则和阈值版本；分数只作辅助，最终合并需人工确认。', proves: '路由集成测试直证可访问对象返回 200，并断言 organizationId、owner、source type/id 全部进入查询。', related: ['find-semantic-resume-duplicates', 'create-studio-resume-pool-http'],
  }),
  definePoolHttp({
    slug: 'import-studio-resume-pool-item-http', method: 'POST', path: '/api/w/:slug/studio/resume-pool/:id/import', line: 299, manifest: '静态 manifest 记为 JSON 200、错误 400/401；源码动态返回 201 或 409', technology: 'Dual-permission admission + advisory lock + async AI review', module: 'background-jobs',
    summary: '同时要求 resumePool.import 与 resumeLibrary.create，验证目标岗位组织归属；admission 用事务 advisory lock 防并发重复导入，check 策略命中重复返回 409，成功 201 并 best-effort 排队 AI 评价。', use: '把私池/公共池候选人正式纳入当前组织招聘台时。', params: [{ name: 'body', type: '{ dedupPolicy: check|force; jobDescriptionMode: none|bind; jobDescriptionId?: string }', required: true, description: 'bind 必须有当前组织岗位；none 会强制把 jobDescriptionId 归一为 null。' }], returns: '201 { status: "imported"; resumeRecordId } | 409 { status: "duplicate"; matches } | 400 | 401', result: '成功进入招聘台并可异步生成岗位评价；check 命中重复时不给数据库制造第二条候选人。', code: `const result = await fetch('/api/w/acme/studio/resume-pool/' + id + '/import', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ dedupPolicy: 'check', jobDescriptionMode: 'bind', jobDescriptionId }), credentials: 'include' }).then(r => r.json())`, visible: '候选人入库或出现可解释的 409 重复确认', error: '权限任一缺失、岗位跨租户、重复命中或并发导入', recovery: '409 让用户选择既有记录或明确 force；网络重试复用 idempotency key，advisory lock/唯一约束返回同一导入记录。', practice: '跨组织公共池导入需记录来源、同意/合法依据和 PII 访问审计；AI review 排队使用 outbox，不能因队列暂不可用回滚已提交导入。', proves: 'schema 测试直证 bind 必填岗位、none 清空岗位；DAO 测试覆盖 check/force、并发锁和重复 admission，未直接覆盖双权限 middleware。', related: ['list-studio-resumes-http', 'enqueue-resume-review-generation-jobs', 'find-semantic-resume-duplicates'],
  }),
  definePoolHttp({
    slug: 'publish-studio-resume-pool-item-http', method: 'POST', path: '/api/w/:slug/studio/resume-pool/:id/publish', line: 283, manifest: 'JSON 201；错误 400/401', technology: 'Drizzle clone transaction + provenance events', module: 'data-runtime',
    summary: '仅把本人 private 且解析 ready 的记录克隆为 public 记录；事务写入来源链和两侧事件，提交后 best-effort 建立公共记录语义索引。', use: '候选人资料经确认可进入跨组织公共人才池时。', returns: '201 ResumePoolDetail | 400 | 401', result: '生成新的 public id，保留 sourcePoolItemId/sourceOrganizationId/sourceUserId，原 private 记录仍存在。', code: `const publicItem = await fetch('/api/w/acme/studio/resume-pool/' + id + '/publish', { method: 'POST', credentials: 'include' }).then(r => r.json())`, visible: '公共池出现带可追溯来源的新记录', error: '非本人私池、未解析 ready、重复点击或公共记录回读失败', recovery: '先等待解析；增加 sourcePoolItemId 唯一/幂等约束，重复请求返回既有 public item。', practice: '发布 PII 前必须有显式确认、目的限制、撤回与审计；数据库 provenance 与对象访问策略同步治理。', test: DAO_TEST, proves: 'DAO 测试覆盖发布前置状态、来源克隆和事务事件；没有本 POST 的 handler 状态码直测。', related: ['get-studio-resume-pool-item-http', 'run-resume-semantic-index-job'],
  }),
  definePoolHttp({
    slug: 'get-studio-resume-pool-file-http', method: 'GET', path: '/api/w/:slug/studio/resume-pool/:id/resume', line: 130, manifest: 'binary 200；错误 JSON 401/404', technology: 'S3/R2 streaming Response', module: 'object-storage', transport: 'binary', sources: [s3, cache],
    summary: '先做 actor-aware pool item 授权，再从对象存储流式读取原文件，并设置 private max-age=300、inline 文件名、类型和可选长度。', use: '浏览器内嵌查看原始 PDF/Office 文件或下载前预览时。', returns: '200 binary stream | 401 | 404 JSON', result: '浏览器直接渲染或下载原文件，服务端不把整个对象载入内存。', code: `const response = await fetch('/api/w/acme/studio/resume-pool/' + id + '/resume', { credentials: 'include' })\nconst file = await response.blob()`, visible: '五分钟私有缓存的原始简历内嵌预览', error: '记录不可见、storage key 缺失或对象已丢失', recovery: '404 展示“文件不可用”并保留结构化资料；用对象清单对账 DB key 与生命周期删除。', practice: '流式响应设置 nosniff、受控 Content-Disposition/Content-Type；不要在共享 CDN 缓存含 PII 的文件。', proves: 'family 路由测试未直接覆盖对象流、响应头、404 或 backpressure。', related: ['get-studio-resume-pool-preview-http', 'put-object-bytes'],
  }),
  definePoolHttp({
    slug: 'get-studio-resume-pool-preview-http', method: 'GET', path: '/api/w/:slug/studio/resume-pool/:id/resume-preview.pdf', line: 159, manifest: 'binary 200；错误 JSON 401/404', technology: 'Object bytes + PPTX-to-PDF preview', module: 'object-storage', transport: 'binary', sources: [s3, cache],
    summary: '授权并读取完整对象字节，再由 createPptxPreviewPdfResponse 对 PPTX 生成/缓存 PDF；PDF 等支持格式走统一预览响应。', use: '前端需要统一 PDF viewer，而原文件可能是 PPTX 时。', returns: '200 application/pdf bytes | 401 | 404 JSON | 500', result: 'PDF viewer 获得可显示的预览；转换失败落统一 500，而 manifest 只静态识别显式 401/404。', code: `const response = await fetch('/api/w/acme/studio/resume-pool/' + id + '/resume-preview.pdf', { credentials: 'include' })\nconst previewUrl = URL.createObjectURL(await response.blob())`, visible: 'PPTX/简历在同一 PDF 阅读器中可视化', error: '对象缺失、超大文件占用内存或转换器失败', recovery: '限制对象大小/页数并把转换移到可重试 worker；前端失败时回退原文件下载。', practice: '完整 bytes 转换设内存/CPU/超时配额和转换缓存；缓存 key 含对象版本，避免覆盖后返回旧预览。', proves: 'family 测试 mock 了 preview helper，但没有断言转换调用、二进制头、资源上限与失败恢复。', related: ['get-studio-resume-pool-file-http', 'presign-recording-url'],
  }),
]

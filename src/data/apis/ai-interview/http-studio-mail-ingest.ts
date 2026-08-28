import { AI_INTERVIEW_COMMIT } from '../helpers'
import type { ApiEntry, ApiParameter } from '../types'

const ROUTE = 'apps/ai-recruitment-copilot-backend/src/server/routes/studio/routes/mail-ingest/route.ts'
const TEST = 'apps/ai-recruitment-copilot-backend/src/server/routes/studio/routes/mail-ingest/__tests__/route.test.ts'
const HONO = { label: 'Hono validation', url: 'https://hono.dev/docs/guides/validation' }
const IMAP = { label: 'ImapFlow API', url: 'https://imapflow.com/module-imapflow-ImapFlow.html' }
const OWASP = { label: 'OWASP secrets management', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html' }

type Spec = {
  slug: string; name: string; signature: string; line: number; summary: string; when: string
  parameters: ApiParameter[]; returns: { type: string; description: string }; code: string; effect: string
  output: { label: string; value: string; tone?: 'good' | 'warn' }[]
  errors: { condition: string; behavior: string; recovery: string }[]; practices: string[]
  related: string[]; proof: string; statusNote?: string
}

function mailApi(s: Spec): ApiEntry {
  return {
    slug: s.slug, name: s.name, signature: s.signature, kind: 'http', project: 'ai-interview', module: 'integrations', technology: 'Hono + ImapFlow + Drizzle + encrypted credentials', implementationStatus: 'production', statusNote: s.statusNote, verifiedCommit: AI_INTERVIEW_COMMIT,
    summary: s.summary, whenToUse: s.when, sourcePath: ROUTE, sourceLine: s.line, parameters: s.parameters, returns: s.returns,
    example: { language: 'ts', code: s.code, explanation: ['activeOrg/user 来自会话；普通端点额外按 user.id 做对象所有权，managed 端点只授予 manage 权限。', '账号 DTO 不返回 password/encryptedPassword；连接失败只显示可操作的脱敏信息。'] },
    effect: { title: s.effect, description: s.summary, metrics: [{ label: 'tenant scope', value: 'organizationId' }, { label: 'credential at rest', value: 'encrypted' }, { label: 'transport', value: 'JSON' }], output: s.output },
    errors: [{ condition: 'activeOrg 或 user 缺失', behavior: '401，连接验证和 SQL 均不执行。', recovery: '恢复有效会话和工作区，禁止客户端提交 organizationId 冒充范围。' }, ...s.errors],
    bestPractices: ['密码仅在服务端短暂解密用于 IMAP 登录，DTO、日志与错误响应不得出现明文或密文。', '所有对象访问至少联合 account.id+organizationId；个人端点还必须联合 userId。', ...s.practices],
    tests: [{ path: TEST, proves: s.proof }], officialSources: [HONO, IMAP, OWASP], related: s.related,
  }
}

const slugParam: ApiParameter = { name: 'slug', type: 'path string', required: true, description: 'workspaceMiddleware 解析的组织范围。' }
const idParam: ApiParameter = { name: 'id', type: 'path string', required: true, description: '邮箱配置 ID；必须做组织/所有者 scope。' }
const loginFields: ApiParameter = { name: 'account', type: 'JSON createMailIngestAccountSchema', required: true, description: 'emailAddress、username、password、IMAP 主机/端口/TLS、mailbox、主题关键字与处理/失败目录；均有安全默认值。' }
const messageQuery: ApiParameter = { name: 'filters', type: 'query', required: false, description: 'page(1)、pageSize(20,≤100)、status、skipReason、jdBindStatus、keyword、receivedFrom/To。' }

export const httpStudioMailIngestApis: ApiEntry[] = [
  mailApi({
    slug: 'get-studio-mail-ingest-accounts-http', name: 'GET /api/w/:slug/studio/mail-ingest-accounts', signature: 'GET /api/w/:slug/studio/mail-ingest-accounts → 200 { accounts:MailIngestAccountDto[] }', line: 170,
    summary: '列出当前用户在当前组织拥有的邮件摄取账号，按创建时间排序，并通过 presenter 排除 encryptedPassword。', when: '个人邮箱摄取设置页加载自己的账号时。', parameters: [slugParam], returns: { type: '200 { accounts }', description: '仅本人+本组织账号的安全 DTO。' }, code: `const { accounts } = await fetch(\`/api/w/\${slug}/studio/mail-ingest-accounts\`).then(r=>r.json())`, effect: '个人邮箱配置可见', output: [{ label: 'scope', value: 'org + current user', tone: 'good' }, { label: 'password', value: 'omitted', tone: 'good' }], errors: [{ condition: '误用 managed 列表替代个人列表', behavior: '扩大成员与账号元数据暴露面。', recovery: '普通设置页只调用本端点。' }], practices: ['个人列表不必暴露 message/problem 聚合，保持最小 DTO。'], related: ['post-studio-mail-ingest-account-http', 'get-studio-mail-ingest-account-messages-http'], proof: 'family：route 测试装配普通账号路径并直接验证个人 messages 的 org+user scope；未直测列表排序。',
  }),
  mailApi({
    slug: 'post-studio-mail-ingest-account-http', name: 'POST /api/w/:slug/studio/mail-ingest-accounts', signature: 'POST /api/w/:slug/studio/mail-ingest-accounts CreateMailIngestAccount → 201 MailIngestAccountDto', line: 178,
    summary: '先用完整连接配置尝试 IMAP 登录，验证成功后把密码加密写入当前用户/组织账号；验证错误为 400，未知异常脱敏为 500。', when: '成员首次绑定自己的企业邮箱接收招聘简历时。', parameters: [slugParam, loginFields], returns: { type: '201 MailIngestAccountDto', description: '不含密码；登录验证失败 400，保存失败脱敏 500。' }, code: `await fetch(\`/api/w/\${slug}/studio/mail-ingest-accounts\`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(account)})`, effect: '邮箱摄取账号可投入轮询', output: [{ label: 'login valid', value: '201', tone: 'good' }, { label: 'bad credentials', value: '400', tone: 'warn' }], errors: [{ condition: 'IMAP 认证/TLS/邮箱目录错误', behavior: 'MailIngestValidationError 返回 400，不写库。', recovery: '校验应用专用密码、TLS 端口和目录后重试。' }, { condition: '连接验证成功但 DB 失败', behavior: '500 脱敏错误。', recovery: '按 operation 日志关联，客户端不要重复回显密码。' }], practices: ['登录探测设置超时与并发限流，防止该端点成为网络扫描器。', '密码字段使用 password manager/autocomplete=new-password，失败后清空内存状态。'], related: ['patch-studio-mail-ingest-account-http', 'get-studio-mail-ingest-accounts-http'], proof: 'family：同一路由测试直接证明 IMAP 登录验证失败时返回 400 且 create DAO 不被调用。',
  }),
  mailApi({
    slug: 'patch-studio-mail-ingest-account-http', name: 'PATCH /api/w/:slug/studio/mail-ingest-accounts/:id', signature: 'PATCH /api/w/:slug/studio/mail-ingest-accounts/:id Partial<Account> → 200 MailIngestAccountDto', line: 211,
    summary: '先按组织+本人读取现有登录配置，将部分更新与旧密码合并后重新验证 IMAP，再只更新提供字段；新密码会重新加密。', when: '成员修改主机、邮箱目录、主题规则、启用状态或轮换密码时。', parameters: [slugParam, idParam, { name: 'patch', type: 'JSON updateMailIngestAccountSchema', required: true, description: '所有创建字段可选；password 省略则复用旧密钥。' }], returns: { type: '200 MailIngestAccountDto | 404', description: '越界/不存在 404；验证失败 400。' }, code: `await fetch(\`/api/w/\${slug}/studio/mail-ingest-accounts/\${id}\`, {method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({enabled:false})})`, effect: '个人账号配置经过验证后更新', output: [{ label: 'password omitted', value: 'reuse encrypted secret' }, { label: 'foreign id', value: '404', tone: 'warn' }], errors: [{ condition: '部分更新未合并旧字段就验证', behavior: '会错误拒绝合法 patch。', recovery: '保持 mergeMailIngestLoginConfig 后验证完整连接。' }], practices: ['开关 enabled 仍会触发当前完整登录验证；若要支持离线禁用，可把禁用分成不依赖供应商的专用命令。'], related: ['post-studio-mail-ingest-account-http', 'delete-studio-mail-ingest-account-http'], proof: 'family：同路由 managed PATCH 直测旧密码合并、新 host 验证失败且不写库；个人 PATCH 额外 userId scope 未直测。',
  }),
  mailApi({
    slug: 'delete-studio-mail-ingest-account-http', name: 'DELETE /api/w/:slug/studio/mail-ingest-accounts/:id', signature: 'DELETE /api/w/:slug/studio/mail-ingest-accounts/:id → 200 { ok:true } | 404', line: 258,
    summary: '只允许账号所有者在当前组织删除配置，SQL 同时限定 id、organizationId、userId；不存在和跨租户统一 404。', when: '成员永久解绑自己的邮件摄取账号时。', parameters: [slugParam, idParam], returns: { type: '200 { ok:true } | 404', description: '成功删除配置；越界/重复删除 404。' }, code: `await fetch(\`/api/w/\${slug}/studio/mail-ingest-accounts/\${id}\`, { method:'DELETE' })`, effect: '轮询账号被移除', output: [{ label: 'owned', value: 'deleted', tone: 'good' }, { label: 'foreign', value: '404', tone: 'warn' }], errors: [{ condition: 'worker 正持有账号 lease', behavior: '删除与轮询可能并发。', recovery: '依赖外键/worker 缺行安全退出，并观测删除后的运行错误。' }], practices: ['明确历史邮件日志的级联、保留和合规策略；UI 在删除前说明后果。'], related: ['get-studio-mail-ingest-accounts-http', 'post-studio-mail-ingest-account-http'], proof: 'family：route 测试装配删除 DAO mock，但未直接断言 DELETE；属于同族边界证据。', statusNote: 'manifest 误配 offer-drafts 测试；本条改用同目录 mail-ingest route family 测试并明确证明边界。',
  }),
  mailApi({
    slug: 'get-studio-mail-ingest-account-messages-http', name: 'GET /api/w/:slug/studio/mail-ingest-accounts/:id/messages', signature: 'GET /api/w/:slug/studio/mail-ingest-accounts/:id/messages?filters → 200 { records,total }', line: 273,
    summary: '先确认账号属于当前用户/组织，再分页筛选邮件处理日志，联查岗位、附件解析态和重复匹配，错误文案被单行截断。', when: '成员查看本人邮箱的摄取、跳过、失败、岗位绑定与简历解析结果时。', parameters: [slugParam, idParam, messageQuery], returns: { type: '200 { records,total }', description: '按 receivedAt DESC NULLS LAST + id 排序；每条含附件与 poolSummary。' }, code: `const log = await fetch(\`/api/w/\${slug}/studio/mail-ingest-accounts/\${id}/messages?page=1&pageSize=20&status=failed\`).then(r=>r.json())`, effect: '邮件摄取问题可诊断', output: [{ label: 'pagination', value: '≤100/page', tone: 'good' }, { label: 'foreign account', value: '404', tone: 'warn' }], errors: [{ condition: '账号不属于当前用户', behavior: '读取配置返回 null，消息查询不执行。', recovery: '切换正确账号；管理员跨用户排障使用 managed 端点。' }], practices: ['时间范围与状态过滤在 SQL 执行；错误详情截断并避免显示服务端堆栈。'], related: ['get-managed-studio-mail-ingest-account-messages-http', 'get-studio-mail-ingest-accounts-http'], proof: 'direct：验证默认 page=1/pageSize=20、org+user 所有权参数、成功日志和越权 404 且 DAO 不调用。',
  }),
  mailApi({
    slug: 'get-managed-studio-mail-ingest-accounts-http', name: 'GET /api/w/:slug/studio/mail-ingest-accounts/managed', signature: 'GET /api/w/:slug/studio/mail-ingest-accounts/managed?page&pageSize&search&sortBy&sortOrder → 200 PaginatedResult', line: 32,
    summary: '为 mailIngestAccount.manage 角色分页列出工作区全部成员及其可空账号，附最近运行计数、消息数和问题数，支持多字段搜索和稳定排序。', when: '工作区管理员集中运营所有成员邮箱摄取时。', parameters: [slugParam, { name: 'pagination/search/sort', type: 'query strings', required: false, description: 'sortBy 仅 userName/userEmail/emailAddress/lastCheckedAt；默认姓名升序。' }], returns: { type: '200 PaginatedResult<WorkspaceMailIngestAccountRow>', description: '无账号成员也作为 account:null 行返回。' }, code: `const page = await fetch(\`/api/w/\${slug}/studio/mail-ingest-accounts/managed?page=1&pageSize=20&search=alice\`).then(r=>r.json())`, effect: '管理员获得邮箱健康总览', output: [{ label: 'rows', value: 'members including unconfigured', tone: 'good' }, { label: 'problemCount', value: 'failed + skipped' }], errors: [{ condition: '模糊搜索在大组织变慢', behavior: '多列 ILIKE %term% 与相关子查询成本上升。', recovery: '增加 trigram/聚合索引并观测慢查询。' }], practices: ['页码、页长和排序字段必须由共享 schema 白名单化。', '聚合指标用于排障，不在列表返回加密凭据。'], related: ['post-managed-studio-mail-ingest-account-http', 'get-managed-studio-mail-ingest-account-messages-http'], proof: 'family：route 测试装配 manage 路径和权限；分页、搜索与聚合 SQL 尚无直接测试。',
  }),
  mailApi({
    slug: 'post-managed-studio-mail-ingest-account-http', name: 'POST /api/w/:slug/studio/mail-ingest-accounts/managed', signature: 'POST /api/w/:slug/studio/mail-ingest-accounts/managed { userId,...Account } → 201 MailIngestAccountDto', line: 61,
    summary: '管理员先验证目标 userId 确为当前工作区成员，再验证 IMAP 登录并为该成员创建加密账号，避免跨租户代配。', when: '有 manage 权限的管理员代成员配置企业邮箱时。', parameters: [slugParam, { ...loginFields, name: 'managedAccount', description: '完整账号字段外加当前工作区 userId。' }], returns: { type: '201 MailIngestAccountDto | 400 | 404', description: '成员不存在 404；登录失败 400；保存失败脱敏 500。' }, code: `await fetch(\`/api/w/\${slug}/studio/mail-ingest-accounts/managed\`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...account,userId})})`, effect: '管理员安全代配成员邮箱', output: [{ label: 'member check', value: 'org scoped', tone: 'good' }, { label: 'login invalid', value: 'no DB write', tone: 'good' }], errors: [{ condition: '目标用户不属于组织', behavior: '404，连接验证不执行。', recovery: '从工作区成员列表选择 userId。' }], practices: ['代配属于高风险操作，记录 actor、subject、时间与字段变更但绝不记录 password。'], related: ['get-managed-studio-mail-ingest-accounts-http', 'patch-managed-studio-mail-ingest-account-http'], proof: 'direct：登录失败返回 400 且 create DAO 不调用；测试 fixture 以 admin+org 上下文执行 managed create。',
  }),
  mailApi({
    slug: 'patch-managed-studio-mail-ingest-account-http', name: 'PATCH /api/w/:slug/studio/mail-ingest-accounts/managed/:id', signature: 'PATCH /api/w/:slug/studio/mail-ingest-accounts/managed/:id Partial<Account> → 200 MailIngestAccountDto', line: 99,
    summary: '管理员按 id+organizationId 读取任意组织内账号，合并旧登录配置、重新验证后更新；不要求账号属于管理员本人。', when: '集中修复成员邮箱连接、目录规则或启用状态时。', parameters: [slugParam, idParam, { name: 'patch', type: 'JSON updateMailIngestAccountSchema', required: true, description: '部分字段；password 可选。' }], returns: { type: '200 MailIngestAccountDto | 400 | 404', description: '组织外/不存在 404，登录验证失败 400。' }, code: `await fetch(\`/api/w/\${slug}/studio/mail-ingest-accounts/managed/\${id}\`, {method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify(patch)})`, effect: '组织内账号由管理员修复', output: [{ label: 'scope', value: 'org, any owner' }, { label: 'new credentials invalid', value: '400', tone: 'warn' }], errors: [{ condition: '账号在验证后、更新前被删除', behavior: 'update 返回 null，HTTP 404。', recovery: '刷新管理列表，不重建除非用户确认。' }], practices: ['先 scope 后解密，避免对越界 id 解密密钥；连接探测加审计和速率限制。'], related: ['post-managed-studio-mail-ingest-account-http', 'get-managed-studio-mail-ingest-account-messages-http'], proof: 'direct：验证 partial patch 与旧密码合并后登录探测；失败 400 且 update DAO 不调用。',
  }),
  mailApi({
    slug: 'get-managed-studio-mail-ingest-account-messages-http', name: 'GET /api/w/:slug/studio/mail-ingest-accounts/managed/:id/messages', signature: 'GET /api/w/:slug/studio/mail-ingest-accounts/managed/:id/messages?filters → 200 { records,total }', line: 144,
    summary: 'manage 用户可下钻当前组织任意账号的邮件日志；先做轻量组织存在性检查，再复用统一分页、过滤和附件聚合。', when: '管理员从健康总览定位某成员邮箱的失败邮件和简历处理结果时。', parameters: [slugParam, idParam, messageQuery], returns: { type: '200 { records,total } | 404', description: '组织外账号 404；合法账号返回筛选日志。' }, code: `const log = await fetch(\`/api/w/\${slug}/studio/mail-ingest-accounts/managed/\${id}/messages?jdBindStatus=ambiguous\`).then(r=>r.json())`, effect: '管理员可定位跨成员摄取故障', output: [{ label: 'scope', value: 'org-wide with manage', tone: 'good' }, { label: 'foreign org', value: '404', tone: 'warn' }], errors: [{ condition: '只按 accountId 查日志', behavior: '可能跨组织读取。', recovery: '保持 existence check 和日志查询内 join organizationId 双层边界。' }], practices: ['管理员读取成员邮件主题/发件人涉及 PII，应限制留存、导出和访问审计。'], related: ['get-studio-mail-ingest-account-messages-http', 'get-managed-studio-mail-ingest-accounts-http'], proof: 'direct：验证 manage 用户不带 userId 即可读组织内账号；组织外 404 且消息 DAO 不执行。',
  }),
]

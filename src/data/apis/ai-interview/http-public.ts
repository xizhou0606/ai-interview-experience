import { AI_INTERVIEW_COMMIT } from '../helpers'
import type { ApiEntry, ApiParameter } from '../types'

const SOURCE = 'apps/ai-recruitment-copilot-backend/src/server/routes/public/route.ts'
const PUBLIC_ROUTE_TEST = 'apps/ai-recruitment-copilot-backend/src/server/routes/public/__tests__/voice-preview.test.ts'
const ROUND_DAO_TEST = 'apps/ai-recruitment-copilot-backend/src/server/routes/studio/routes/interviews/dao/__tests__/interview-rounds.test.ts'
const HUMAN_DAO_TEST = 'apps/ai-recruitment-copilot-backend/src/server/routes/studio/routes/interviews/__tests__/pipeline-subtables.test.ts'
const REPORT_DAO_TEST = 'apps/ai-recruitment-copilot-backend/src/server/routes/studio/routes/interviews/dao/__tests__/interview-conversations.test.ts'
const RECORDING_ROUTE_TEST = 'apps/ai-recruitment-copilot-backend/src/server/routes/studio/routes/interviews/routes/recordings/__tests__/route.test.ts'
const RESUME_DAO_TEST = 'apps/ai-recruitment-copilot-backend/src/server/routes/studio/routes/resumes/__tests__/dao.test.ts'
const REFERRAL_DAO_TEST = 'apps/ai-recruitment-copilot-backend/src/server/routes/studio/routes/job-descriptions/dao/referral-links.test.ts'

const honoSource = { label: 'Hono routing', url: 'https://hono.dev/docs/api/routing' }
const httpCachingSource = { label: 'MDN HTTP caching', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching' }
const liveKitTokenSource = { label: 'LiveKit access tokens', url: 'https://docs.livekit.io/home/server/generating-tokens/' }
const s3Source = { label: 'AWS SDK S3 v3', url: 'https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/' }

function param(name: string, description: string, type = 'string'): ApiParameter {
  return { name, type, required: true, description }
}

type PublicHttpInput = Omit<ApiEntry, 'kind' | 'project' | 'module' | 'implementationStatus' | 'technology' | 'verifiedCommit' | 'sourcePath' | 'officialSources'> & {
  officialSources?: ApiEntry['officialSources']
  technology?: string
}

function definePublicHttp(input: PublicHttpInput): ApiEntry {
  return {
    ...input,
    kind: 'http', project: 'ai-interview', module: 'http-public', implementationStatus: 'production',
    technology: input.technology ?? 'Hono 4.12.23 + Drizzle ORM', verifiedCommit: AI_INTERVIEW_COMMIT, sourcePath: SOURCE,
    officialSources: [honoSource, ...(input.officialSources ?? [])],
  }
}

export const publicHttpApis: ApiEntry[] = [
  definePublicHttp({
    slug: 'get-public-candidate-human-meeting', name: '公开读取候选人真人复面', signature: 'GET /api/public/human-interview-meetings/:inviteToken', sourceLine: 278,
    statusNote: '生产公开入口；inviteToken 是候选人 bearer capability，服务端验签、比对 token hash 并检查 candidateInviteExpiresAt。',
    summary: '用候选人邀请 token 解析会议、候选人和轮次，只返回入会页需要的姓名、标题、时间、状态与有效期。', whenToUse: '候选人打开真人复面邀请链接，先渲染会议预览和入会倒计时。',
    parameters: [param('inviteToken', '签名邀请 token；载荷绑定 meetingId/roundId，数据库保存 hash 与独立过期时间。')], returns: { type: '200 PublicHumanInterviewMeetingPreview | 404 { error }', description: '成功返回 candidateName、meetingId、roundLabel、scheduledAt、status、title、validUntil；无效/过期统一 404。' },
    example: { language: 'ts', code: `const res = await fetch('/api/public/human-interview-meetings/' + encodeURIComponent(inviteToken))\nif (!res.ok) throw new Error('邀请已失效')\nconst meeting = await res.json()`, explanation: ['页面先读取预览，不在 URL 外持久化 token。', '404 合并伪造、过期与已撤销，避免暴露内部原因。'] },
    effect: { title: '候选人入会预览', description: '有效邀请显示面试标题、轮次和倒计时；无效邀请停留在不可用页。', metrics: [{ label: 'auth', value: 'signed token + DB hash' }, { label: 'success', value: '200 JSON' }], output: [{ label: 'valid invite', value: 'meeting preview', tone: 'good' }, { label: 'invalid/expired', value: '404 same message', tone: 'warn' }] },
    errors: [{ condition: 'token 验签失败、hash 不匹配、记录缺失或候选人邀请过期', behavior: '返回 404「真人复面链接不可用」。', recovery: '联系招聘方重新生成邀请；不要重试旧 token。' }], bestPractices: ['邀请 token 只经 HTTPS 传输并从访问日志、分析参数和 Referer 中脱敏。', '预览响应使用 no-store，并提供撤销与轮换能力。'],
    tests: [{ path: HUMAN_DAO_TEST, proves: '只覆盖会议 DAO 的创建、有效期和状态规则；未直接请求此公开 handler，token 验签/hash/404 仍缺路由级测试。' }], officialSources: [liveKitTokenSource], related: ['post-public-candidate-human-livekit-token', 'get-public-interviewer-human-meeting', 'human-livekit-room'],
  }),
  definePublicHttp({
    slug: 'post-public-candidate-human-livekit-token', name: '候选人签发真人复面 LiveKit Token', signature: 'POST /api/public/human-interview-meetings/:inviteToken/livekit-token', sourceLine: 296, technology: 'Hono 4.12.23 + LiveKit Server SDK 2.15.3',
    statusNote: '生产公开入口；候选人 token 可发布媒体，只有 scheduled/in_progress、入场窗口内且 room 已初始化才签发。',
    summary: '校验候选人邀请、会议状态、提前五分钟窗口、validUntil 和房间名，再签发绑定 candidate/round/meeting metadata 的 LiveKit JWT 并把 scheduled 原子推进为 in_progress。', whenToUse: '候选人点击“进入会议”，客户端准备连接 LiveKit 房间时。',
    parameters: [param('inviteToken', '候选人签名邀请 token。')], returns: { type: '200 { serverUrl, participantToken } | 403 | 404 | 409 | 500', description: '成功返回 LiveKit 地址和短期 participant token；业务时窗与配置错误使用不同状态。' },
    example: { language: 'ts', code: `const res = await fetch('/api/public/human-interview-meetings/' + encodeURIComponent(inviteToken) + '/livekit-token', { method: 'POST' })\nconst token = await res.json()\nawait room.connect(token.serverUrl, token.participantToken)`, explanation: ['只在用户准备连接时签发，减少 token 暴露窗口。', 'participantIdentity 固定为 candidate_{roundId}，metadata 绑定会议上下文。'] },
    effect: { title: '候选人进入真人房间', description: '合法候选人获得发布音视频权限，会议状态首次入场后变为 in_progress。', metrics: [{ label: 'early-entry', value: '5 min' }, { label: 'publish', value: 'true' }], output: [{ label: 'eligible', value: 'LiveKit JWT', tone: 'good' }, { label: 'too early/ended', value: '403', tone: 'warn' }, { label: 'room missing', value: '409', tone: 'warn' }] },
    errors: [{ condition: '会议取消/结束、过早或超过 validUntil', behavior: '返回 403，不签发 token。', recovery: 'UI 展示明确状态；到允许时间后再请求。' }, { condition: 'LiveKit 配置缺失或签名异常', behavior: '返回安全 500，内部记录 meetingId/operation。', recovery: '运维修复配置并重新签发，不缓存失败响应。' }], bestPractices: ['token 使用短 TTL、最小 grant，并限制同一 identity 的并发会话策略。', '签发接口按 token/IP 限流并记录安全审计，绝不记录 JWT。'],
    tests: [{ path: HUMAN_DAO_TEST, proves: '覆盖会议有效时窗和状态 DAO；没有直接覆盖此公开签发 handler、grant/metadata 与 403/409/500 映射。' }], officialSources: [liveKitTokenSource], related: ['get-public-candidate-human-meeting', 'post-public-interviewer-human-livekit-token', 'human-livekit-room'],
  }),
  definePublicHttp({
    slug: 'get-public-interviewer-human-meeting', name: '公开读取面试官真人复面', signature: 'GET /api/public/human-interview-meetings/interviewer/:inviteToken', sourceLine: 187,
    statusNote: '生产公开入口；签名 token 绑定 meetingId、userId、role，DAO 再与面试官关联表匹配。',
    summary: '解析面试官邀请 token，并返回姓名、角色、会议标题、时间、状态和有效期供主持/观察员入会页展示。', whenToUse: '面试官或观察员从专属邀请链接进入会前页时。',
    parameters: [param('inviteToken', '绑定 meetingId/userId/role 的签名 interviewer token。')], returns: { type: '200 PublicHumanInterviewInterviewerPreview | 404 { error }', description: '成功返回 interviewerName、meetingId、role、scheduledAt、status、title、validUntil。' },
    example: { language: 'ts', code: `const res = await fetch('/api/public/human-interview-meetings/interviewer/' + encodeURIComponent(inviteToken))\nconst preview = res.ok ? await res.json() : null`, explanation: ['role 决定后续 token 是否可以 publish。', '无效链接统一 404。'] },
    effect: { title: '按角色展示会前页', description: '面试官看到主持/观察身份与会议状态，观察员 UI 可提前隐藏发布控件。', metrics: [{ label: 'roles', value: 'interviewer / observer' }, { label: 'auth', value: 'signed bearer token' }], output: [{ label: 'valid interviewer', value: 'role-aware preview', tone: 'good' }, { label: 'invalid token', value: '404', tone: 'warn' }] },
    errors: [{ condition: 'token 伪造、载荷与 DB 关联不一致或记录缺失', behavior: '返回 404。', recovery: '使用当前会议重新生成的专属邀请。' }], bestPractices: ['面试官 token 不可转发；服务端继续以 DB role 为授权事实。', '邀请页设置 Referrer-Policy: no-referrer 与 no-store。'],
    tests: [{ path: HUMAN_DAO_TEST, proves: '覆盖会议/面试官关联的 DAO 生命周期，但未直接覆盖 interviewer token 解析和本 handler 响应字段。' }], officialSources: [liveKitTokenSource], related: ['post-public-interviewer-human-livekit-token', 'post-public-interviewer-end-human-meeting', 'get-public-candidate-human-meeting'],
  }),
  definePublicHttp({
    slug: 'post-public-interviewer-human-livekit-token', name: '面试官签发真人复面 LiveKit Token', signature: 'POST /api/public/human-interview-meetings/interviewer/:inviteToken/livekit-token', sourceLine: 207, technology: 'Hono 4.12.23 + LiveKit Server SDK 2.15.3',
    statusNote: '生产公开入口；observer 的 canPublish=false，其余面试官可发布；时窗/状态/房间门禁与候选人一致。',
    summary: '校验面试官邀请和会议时窗，按数据库 role 生成最小 LiveKit grant，把 user/role/meeting 写入 metadata，并推进会议状态。', whenToUse: '面试官或观察员点击入会，客户端即将 connect 时。',
    parameters: [param('inviteToken', '签名 interviewer token；不得由客户端自报 role。')], returns: { type: '200 { serverUrl, participantToken } | 403 | 404 | 409 | 500', description: '返回与角色匹配的 LiveKit token；observer 没有发布权限。' },
    example: { language: 'ts', code: `const res = await fetch('/api/public/human-interview-meetings/interviewer/' + encodeURIComponent(inviteToken) + '/livekit-token', { method: 'POST' })\nif (res.ok) await room.connect(...Object.values(await res.json()))`, explanation: ['participantIdentity 使用 interviewer_{userId}。', 'observer grant 在服务端强制 canPublish=false。'] },
    effect: { title: '角色约束的面试官入会', description: '主持人可发布，观察员只能订阅；成功签发触发会议 in_progress。', metrics: [{ label: 'observer publish', value: 'false' }, { label: 'identity', value: 'user-bound' }], output: [{ label: 'interviewer', value: 'publish token', tone: 'good' }, { label: 'observer', value: 'subscribe-only token', tone: 'neutral' }, { label: 'invalid window', value: '403', tone: 'warn' }] },
    errors: [{ condition: '会议不在有效窗口或已终止', behavior: '返回 403。', recovery: '按 scheduledAt/validUntil 更新 UI，不盲目重试。' }, { condition: '房间或 LiveKit 配置缺失', behavior: '409 或安全 500。', recovery: '由招聘方重新初始化房间或运维修复配置。' }], bestPractices: ['授权完全从服务端 role 派生，客户端 role 只作展示。', 'JWT、邀请 token、serverUrl 不进入错误遥测。'],
    tests: [{ path: HUMAN_DAO_TEST, proves: '只证明会议/角色数据与时窗 DAO；该公开 handler 的 observer grant 和错误映射无直接测试。' }], officialSources: [liveKitTokenSource], related: ['get-public-interviewer-human-meeting', 'post-public-interviewer-end-human-meeting', 'post-public-candidate-human-livekit-token'],
  }),
  definePublicHttp({
    slug: 'post-public-interviewer-end-human-meeting', name: '面试官结束真人复面', signature: 'POST /api/public/human-interview-meetings/interviewer/:inviteToken/end', sourceLine: 261, technology: 'Hono 4.12.23 + LiveKit RoomService',
    statusNote: '生产公开写接口；任何有效 interviewer token（包括 observer role）当前都可结束会议，且删除 LiveKit 房间失败会 fail-open。',
    summary: '用面试官邀请解析 meetingId，将未取消会议标为 ended，再 best-effort 删除 LiveKit 房间并返回 ok。', whenToUse: '具备主持权限的面试官确认结束整场真人复面时；当前源码尚未把“可结束”收紧到主持角色。',
    parameters: [param('inviteToken', '有效面试官邀请 token；当前 handler 未额外限制 role。')], returns: { type: '200 { ok: true } | 404', description: '数据库结束成功即返回 200；房间删除配置错误或非配置异常均不改变响应。' },
    example: { language: 'ts', code: `const res = await fetch('/api/public/human-interview-meetings/interviewer/' + encodeURIComponent(inviteToken) + '/end', { method: 'POST' })\nif (res.ok) navigate('/meeting-ended')`, explanation: ['这是影响所有参与者的状态写入。', 'LiveKit 删除失败只 warning，数据库仍是 ended。'] },
    effect: { title: '整场会议终止', description: '会议状态变为 ended；房间删除成功时在线参与者被断开。', metrics: [{ label: 'DB state', value: 'ended' }, { label: 'room delete', value: 'best effort' }], output: [{ label: 'meeting', value: 'ended', tone: 'good' }, { label: 'room cleanup failure', value: '200 + warning', tone: 'warn' }] },
    errors: [{ condition: '邀请无效', behavior: '返回 404，不修改会议。', recovery: '重新获取主持邀请。' }, { condition: '观察员 token 调用', behavior: '当前也可结束会议。', recovery: '服务端增加 role/capability 检查，并为结束操作增加确认与审计。' }], bestPractices: ['仅主持角色可结束，采用幂等状态转换与审计日志。', '房间删除失败进入 durable reconciliation，而不是只 console.warn。'],
    tests: [{ path: HUMAN_DAO_TEST, proves: '覆盖按轮次结束会议的 DAO 行为；没有直接测试此 token handler、observer 权限或房间删除 fail-open。' }], officialSources: [{ label: 'LiveKit RoomService', url: 'https://docs.livekit.io/home/server/managing-participants/' }], related: ['get-public-interviewer-human-meeting', 'post-public-interviewer-human-livekit-token', 'post-livekit-webhook'],
  }),
  definePublicHttp({
    slug: 'get-public-interview-round', name: '公开读取面试轮次详情', signature: 'GET /api/public/interview-rounds/:id', sourceLine: 365,
    statusNote: '生产公开入口；:id 可为 roundId 或 candidateId，源码没有独立邀请 token/会话门禁，ID 本身承担 capability，涉及候选人数据暴露面。',
    summary: '先把 round/candidate id 解析为 organizationId 与目标 round，再复用 Studio DAO 返回候选人快照和轮次详情。', whenToUse: '公开候选人结果页需要加载单轮基础信息时；只应配合不可猜测、可撤销的分享能力。',
    parameters: [param('id', 'roundId；若传 candidateId 会自动选择 sortOrder/createdAt 最新轮次。')], returns: { type: '200 StudioInterviewRoundDetail | 404 { error }', description: '成功返回完整轮次和候选人快照；scope 或 detail 缺失都统一 404。' },
    example: { language: 'ts', code: `const res = await fetch('/api/public/interview-rounds/' + encodeURIComponent(roundId))\nconst round = res.ok ? await res.json() : null`, explanation: ['organizationId 在服务端由 id 反查。', '传 candidateId 会得到最新轮次，调用方需明确语义。'] },
    effect: { title: '公开轮次详情', description: '分享页展示候选人、岗位、轮次、状态与时间线基础数据。', metrics: [{ label: 'scope resolution', value: 'round or candidate id' }, { label: 'auth middleware', value: 'none' }], output: [{ label: 'known id', value: 'full round detail', tone: 'good' }, { label: 'enumerated id risk', value: 'PII exposure surface', tone: 'warn' }] },
    errors: [{ condition: 'id 无对应轮次/候选人或详情读取为空', behavior: '返回统一 404。', recovery: '检查分享链接是否仍有效；不要向用户暴露组织存在性。' }], bestPractices: ['改为有目的、过期、撤销能力的分享 token，不直接把业务主键当授权。', '响应按最小披露裁剪 PII，并记录访问审计与速率限制。'],
    tests: [{ path: ROUND_DAO_TEST, proves: '直接覆盖 loadInterviewRoundDetail 的候选人快照、组织隔离和未知 id；不覆盖公开 scope 解析或本 handler。' }], officialSources: [{ label: 'OWASP IDOR prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html' }], related: ['get-public-interview-round-resolve', 'get-public-interview-round-reports', 'get-public-interview-round-resume'],
  }),
  definePublicHttp({
    slug: 'get-public-interview-round-form-submissions', name: '公开读取轮次表单答卷', signature: 'GET /api/public/interview-rounds/:id/form-submissions', sourceLine: 386,
    statusNote: '生产公开入口；scope 由 raw round/candidate id 反查，无独立分享 token；源码按 candidateId 加载答卷，可能跨轮次返回候选人级集合。',
    summary: '解析公开轮次 scope 后，以 candidateId 调用表单 DAO，返回该候选人的 submissions 数组。', whenToUse: '受控分享页展示候选人申请表或评价表答卷时。',
    parameters: [param('id', 'roundId 或 candidateId；解析后实际以 candidateId 查询。')], returns: { type: '200 { submissions: FormSubmission[] } | 404', description: 'scope 存在返回答卷数组（可为空），否则 404。' },
    example: { language: 'ts', code: `const res = await fetch('/api/public/interview-rounds/' + encodeURIComponent(roundId) + '/form-submissions')\nconst { submissions } = await res.json()`, explanation: ['空数组是正常成功，不是 404。', '服务端目前未按指定 roundId 二次裁剪。'] },
    effect: { title: '公开答卷面板', description: '分享页显示候选人提交的结构化表单内容。', metrics: [{ label: 'query scope', value: 'candidateId' }, { label: 'route auth', value: 'none' }], output: [{ label: 'known candidate', value: 'submissions[]', tone: 'good' }, { label: 'sensitive answers', value: 'over-disclosure risk', tone: 'warn' }] },
    errors: [{ condition: 'id 无法解析', behavior: '返回 404。', recovery: '刷新有效分享链接；不要尝试枚举 id。' }], bestPractices: ['按分享目的裁剪字段并按 round/form scope 校验，不默认公开候选人全部答卷。', '对敏感答案设置访问期限、审计与导出水印。'],
    tests: [{ path: 'apps/ai-recruitment-copilot-backend/src/server/routes/studio/routes/forms/dao/__tests__/applicable-scope.test.ts', proves: '只覆盖表单适用范围 DAO，不直接覆盖 loadSubmissionsByInterview 或这个公开 handler；当前证据存在明显缺口。' }], officialSources: [{ label: 'OWASP API object authorization', url: 'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/' }], related: ['get-public-interview-round', 'get-public-interview-round-reports', 'get-public-resume-detail'],
  }),
  definePublicHttp({
    slug: 'get-public-interview-round-recording', name: '公开获取轮次录像播放链接', signature: 'GET /api/public/interview-rounds/:id/recordings/:conversationId', sourceLine: 395, technology: 'Hono 4.12.23 + Drizzle ORM + Cloudflare R2',
    statusNote: '生产公开入口；源码实际返回 JSON 预签 URL，不是二进制；要求 conversation.organizationId 与 scope 一致且 scheduleEntryId 等于目标 round。',
    summary: '解析公开轮次后校验会话属于同组织同轮次、录像 key 存在且 recordingStatus=completed，再签发 600 秒 R2 GetObject URL。', whenToUse: '公开分享页在用户点击播放已完成录像时按需取短期 URL。',
    parameters: [param('id', 'roundId 或 candidateId；最终收敛为 roundId。'), param('conversationId', '必须属于同组织且 scheduleEntryId 等于目标 round 的会话 ID。')], returns: { type: '200 { url, expiresInSeconds: 600 } | 404 | 409 | 500', description: '完成录像返回十分钟 bearer URL；无录像 404，生成中 409，签名失败 500。' },
    example: { language: 'ts', code: `const res = await fetch('/api/public/interview-rounds/' + roundId + '/recordings/' + conversationId)\nif (res.status === 409) return showProcessing()\nvideo.src = (await res.json()).url`, explanation: ['只在播放时请求 URL。', '409 body 同时返回当前 recording status。'] },
    effect: { title: '短时公开录像播放', description: '同轮次已完成录像可播放十分钟，跨轮次 conversationId 被 404 隐藏。', metrics: [{ label: 'URL TTL', value: '600s' }, { label: 'binding', value: 'org + round' }], output: [{ label: 'completed', value: 'presigned URL', tone: 'good' }, { label: 'processing', value: '409 + status', tone: 'neutral' }, { label: 'wrong round', value: '404', tone: 'warn' }] },
    errors: [{ condition: '会话缺失、跨组织/跨轮次或无 file key', behavior: '返回 404。', recovery: '只使用当前 round API 返回的 conversationId。' }, { condition: '录像未完成', behavior: '返回 409。', recovery: '按退避轮询状态，而不是高频重试。' }], bestPractices: ['预签 URL 视为密钥，禁止进入日志、Referer 和长期缓存。', '公开录像应再绑定可撤销 share token，并记录播放审计。'],
    tests: [{ path: RECORDING_ROUTE_TEST, proves: '直接覆盖同逻辑的已认证 Studio 录像路由：预签、跨轮次、缺文件和未完成；没有直接请求 public 路径。' }], officialSources: [{ label: 'Cloudflare R2 presigned URLs', url: 'https://developers.cloudflare.com/r2/api/s3/presigned-urls/' }], related: ['presign-recording-url', 'get-public-interview-round', 'post-livekit-webhook'],
  }),
  definePublicHttp({
    slug: 'get-public-interview-round-reports', name: '公开读取轮次 AI 报告', signature: 'GET /api/public/interview-rounds/:id/reports', sourceLine: 377,
    statusNote: '生产公开入口；raw id 解析 scope 后查询该 round 全部 conversation reports，没有会话认证或独立分享 capability。',
    summary: '把公开 id 收敛为 roundId，并返回该轮所有 AI 面试会话报告。', whenToUse: '候选人/招聘方共享页展示评分、总结和证据时，前提是产品明确允许该受众看到报告。',
    parameters: [param('id', 'roundId 或 candidateId；candidateId 会解析到最新轮次。')], returns: { type: '200 InterviewConversationReport[] | 404', description: 'scope 存在即返回数组（可为空），否则 404。' },
    example: { language: 'ts', code: `const res = await fetch('/api/public/interview-rounds/' + encodeURIComponent(roundId) + '/reports')\nconst reports = await res.json()`, explanation: ['空数组表示尚无报告。', '报告可能含评价与证据，属于高敏招聘数据。'] },
    effect: { title: '公开报告视图', description: '分享页展示同轮多会话报告；没有报告时正常显示空态。', metrics: [{ label: 'scope', value: 'round' }, { label: 'visibility policy', value: 'not enforced here' }], output: [{ label: 'report ready', value: 'report cards', tone: 'good' }, { label: 'raw-id access', value: 'privacy risk', tone: 'warn' }] },
    errors: [{ condition: 'id 无法解析', behavior: '返回 404。', recovery: '使用仍有效的分享入口。' }], bestPractices: ['报告共享需显式受众、字段红action、过期与撤销策略。', '不要只依赖 UUID 不可猜测；增加对象级授权与访问审计。'],
    tests: [{ path: REPORT_DAO_TEST, proves: '直接覆盖 queryInterviewConversationReportsByRound 的公开/Studio 投影视图；未覆盖本公开 handler 的 scope 与 404。' }], officialSources: [{ label: 'OWASP API privacy risks', url: 'https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/' }], related: ['post-agent-report', 'get-public-interview-round', 'get-public-interview-round-recording'],
  }),
  definePublicHttp({
    slug: 'get-public-interview-round-resume', name: '公开流式读取轮次简历', signature: 'GET /api/public/interview-rounds/:id/resume', sourceLine: 449, technology: 'Hono 4.12.23 + AWS SDK S3 3.1053.0',
    statusNote: '生产公开二进制入口；raw id 反查组织/候选人后流式返回原文件，Cache-Control=private,max-age=300。',
    summary: '解析公开 scope，按 candidateId+organizationId 读取简历对象 key，再从 S3-compatible storage 流式 inline 返回原始文件。', whenToUse: '受控分享页内嵌或下载候选人原始简历，且浏览器可直接展示该媒体类型时。',
    parameters: [param('id', 'roundId 或 candidateId；服务端绑定到同组织 candidate。')], returns: { type: '200 binary stream | 404 { error }', description: '返回原始对象 Content-Type/Length 与编码后的 inline filename；记录、key 或对象缺失均 404。' },
    example: { language: 'ts', code: `const url = '/api/public/interview-rounds/' + encodeURIComponent(roundId) + '/resume'\niframe.src = url`, explanation: ['响应是二进制，不调用 response.json。', 'private,max-age=300 仍允许浏览器私有缓存五分钟。'] },
    effect: { title: '内嵌原始简历', description: '浏览器直接显示 PDF 等受支持格式；对象缺失显示不可用状态。', metrics: [{ label: 'transport', value: 'stream' }, { label: 'private cache', value: '300s' }], output: [{ label: 'object found', value: 'inline binary', tone: 'good' }, { label: 'PII cache/share', value: 'exposure risk', tone: 'warn' }] },
    errors: [{ condition: 'scope、storageKey 或对象缺失', behavior: '返回 404。', recovery: '提示招聘方重新上传或关闭分享。' }], bestPractices: ['高敏简历公开入口应使用可撤销 share token、Content-Security-Policy 与 no-store/更短缓存。', '保持流式响应和 backpressure，不把大文件读入内存。'],
    tests: [{ path: PUBLIC_ROUTE_TEST, proves: '同 publicRouter 测试只直接证明 voice preview 的 getObjectStream/headers；不覆盖此简历 scope、filename 或 private cache。' }], officialSources: [s3Source, httpCachingSource], related: ['get-public-interview-round-resume-preview', 'put-object-bytes', 'get-public-interview-round'],
  }),
  definePublicHttp({
    slug: 'get-public-interview-round-resume-preview', name: '公开生成轮次简历 PDF 预览', signature: 'GET /api/public/interview-rounds/:id/resume-preview.pdf', sourceLine: 489, technology: 'Hono 4.12.23 + S3 + PPTX/PDF preview adapter',
    statusNote: '生产公开二进制入口；先整对象读入内存，再由 createPptxPreviewPdfResponse 处理 PDF/PPTX，超大文件需额外门禁。',
    summary: '解析公开 scope、读取候选人简历 bytes，并统一生成浏览器可预览的 PDF 响应。', whenToUse: '原始简历是 PPTX 或浏览器不便直接展示，需要统一 PDF 预览时。',
    parameters: [param('id', 'roundId 或 candidateId。')], returns: { type: '200 application/pdf | 404 { error } | preview error', description: '成功返回 PDF 预览；记录/key/对象缺失返回 404，转换异常交给全局错误处理。' },
    example: { language: 'ts', code: `window.open('/api/public/interview-rounds/' + encodeURIComponent(roundId) + '/resume-preview.pdf', '_blank', 'noopener')`, explanation: ['扩展名明确告诉浏览器按 PDF 打开。', '服务端按 storageKey 作为预览 cacheKey。'] },
    effect: { title: '统一 PDF 简历预览', description: 'PDF 原样或 PPTX 转换后在新页展示，避免客户端安装 Office。', metrics: [{ label: 'input', value: 'object bytes' }, { label: 'output', value: 'PDF' }], output: [{ label: 'supported file', value: 'preview.pdf', tone: 'good' }, { label: 'large file', value: 'memory pressure', tone: 'warn' }] },
    errors: [{ condition: '对象缺失', behavior: '返回 404。', recovery: '重新上传源文件。' }, { condition: '格式不支持或转换失败', behavior: '进入全局 500。', recovery: '前端回退到原文件下载，并记录格式/大小指标。' }], bestPractices: ['转换前限制文件大小、MIME 与压缩炸弹，隔离运行转换器。', '缓存转换产物并绑定源对象 hash，避免重复 CPU 消耗。'],
    tests: [{ path: PUBLIC_ROUTE_TEST, proves: '只覆盖同路由族另一个对象流 endpoint；本 bytes 读取、PPTX/PDF 分支和安全限制没有直接测试。' }], officialSources: [s3Source, { label: 'OWASP file upload security', url: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html' }], related: ['get-public-interview-round-resume', 'put-object-bytes', 'get-public-interview-round'],
  }),
  definePublicHttp({
    slug: 'get-public-interview-round-resolve', name: '解析公开面试 ID', signature: 'GET /api/public/interview-rounds/resolve?id=:id', sourceLine: 349,
    statusNote: '生产公开入口；Zod 只要求 trim 后非空，id 可为 roundId 或 candidateId，返回最新 roundId。',
    summary: '校验 query.id，先按 round 主键查找，未命中再把它当 candidateId 取最新轮次，并只返回规范 roundId。', whenToUse: '兼容旧链接或候选人级链接，在跳转到规范轮次 URL 前做一次解析。',
    parameters: [param('id', '非空 query string；允许 roundId 或 candidateId。')], returns: { type: '200 { roundId: string } | 400 validation error | 404', description: '命中后返回规范 roundId；空 query 由 zValidator 返回 400，未知 id 返回 404。' },
    example: { language: 'ts', code: `const url = new URL('/api/public/interview-rounds/resolve', location.origin)\nurl.searchParams.set('id', legacyId)\nconst { roundId } = await fetch(url).then(r => r.json())`, explanation: ['searchParams 自动编码。', 'candidateId 始终解析到当前最新轮次，结果可能随新增轮次变化。'] },
    effect: { title: '旧链接规范化', description: '旧 candidate 链接跳转到最新 round 路径。', metrics: [{ label: 'validation', value: 'Zod min(1)' }, { label: 'candidate selection', value: 'latest round' }], output: [{ label: 'round id', value: 'same canonical id', tone: 'good' }, { label: 'candidate id', value: 'latest round id', tone: 'neutral' }] },
    errors: [{ condition: 'id 缺失/空白', behavior: '返回 400「查询参数无效」。', recovery: '调用方在请求前校验并显示链接损坏。' }, { condition: '无对应记录', behavior: '返回 404。', recovery: '停止跳转，不枚举其他 id。' }], bestPractices: ['规范 URL 使用 302/307 或明确 cache policy，并避免 candidate 最新轮次造成语义漂移。', 'raw id 查询同样需要 share capability、限流和审计。'],
    tests: [{ path: ROUND_DAO_TEST, proves: '覆盖轮次详情和组织隔离，但不直接覆盖 resolvePublicInterviewScope 的 round/candidate 双分支或 query validator。' }], officialSources: [{ label: 'Zod strings', url: 'https://zod.dev/api?id=strings' }], related: ['get-public-interview-round', 'get-public-resume-rounds', 'api-fetch'],
  }),
  definePublicHttp({
    slug: 'get-public-minimax-voice-preview', name: '公开流式读取 MiniMax 音色试听', signature: 'GET /api/public/minimax-voice-previews/:id', sourceLine: 157, technology: 'Hono 4.12.23 + AWS SDK S3 3.1053.0',
    statusNote: '生产公开静态资产入口；DB id 映射 storageKey，响应 public,max-age=31536000,immutable。',
    summary: '按预览记录 id 查对象 key，从 S3-compatible storage 流式返回音频，并设置一年 immutable 缓存。', whenToUse: 'Studio 音色选择器或分享页播放已生成且内容不可变的试听音频时。',
    parameters: [param('id', 'minimaxVoicePreview 记录 ID。')], returns: { type: '200 audio stream | 404 { error }', description: '返回对象流、Content-Type/Length 与长期缓存头；DB 或对象缺失分别 404。' },
    example: { language: 'tsx', code: `<audio controls src={'/api/public/minimax-voice-previews/' + previewId} />`, explanation: ['浏览器自行流式加载与缓存。', 'immutable 只适用于相同 id 永不换内容。'] },
    effect: { title: '低成本重复试听', description: '首播读取对象存储，后续一年可命中公共缓存。', metrics: [{ label: 'cache TTL', value: '1 year' }, { label: 'transport', value: 'stream' }], output: [{ label: 'first request', value: 'audio bytes', tone: 'good' }, { label: 'repeat', value: 'browser/CDN cache', tone: 'good' }] },
    errors: [{ condition: '预览行或对象不存在', behavior: '返回 404，且无 DB 行时不会访问对象存储。', recovery: '前端移除失效试听项并允许重新生成。' }], bestPractices: ['immutable URL 必须内容寻址或永不原地覆盖。', '设置 nosniff、Range 支持与 CDN 命中率/404 指标。'],
    tests: [{ path: PUBLIC_ROUTE_TEST, proves: '直接请求此 endpoint，覆盖 200 字节流、Content-Type/Length、immutable cache 和 DB 缺失 404。' }], officialSources: [s3Source, httpCachingSource], related: ['put-object-bytes', 'human-livekit-room', 'get-public-interview-round-resume'],
  }),
  definePublicHttp({
    slug: 'get-public-referral', name: '公开读取内推链接预览', signature: 'GET /api/public/referrals/:token', sourceLine: 71,
    statusNote: '生产公开入口；token 经 DAO hash 查询且 disabled/expired 链接不可解析，响应只走 toPublicReferralPreview。',
    summary: '解析内推 token 并返回经过公共投影裁剪的公司、职位与推荐人预览。', whenToUse: '外部候选人打开内推投递页，上传前确认公司和岗位。',
    parameters: [param('token', '不可猜测的内推 bearer token；DAO 以 SHA-256 hash 查询。')], returns: { type: '200 PublicReferralPreview | 404 { error }', description: '有效链接返回公共预览；无效、禁用或过期统一 404。' },
    example: { language: 'ts', code: `const res = await fetch('/api/public/referrals/' + encodeURIComponent(token))\nconst referral = res.ok ? await res.json() : null`, explanation: ['只返回公共投影，不返回内部 organization/user 记录。', 'token 不应写入 analytics。'] },
    effect: { title: '内推落地页', description: '候选人看到岗位、公司与推荐人信息，然后选择简历。', metrics: [{ label: 'token storage', value: 'hash' }, { label: 'invalid states', value: '404 unified' }], output: [{ label: 'active link', value: 'referral preview', tone: 'good' }, { label: 'disabled/expired', value: 'unavailable', tone: 'warn' }] },
    errors: [{ condition: 'token 不存在、禁用或过期', behavior: '返回 404「内推链接不可用」。', recovery: '向推荐人索取新链接。' }], bestPractices: ['token 至少 128-bit 熵、数据库只存 hash，并支持过期/撤销/轮换。', '公共投影用 contract test 防止新增内部字段意外泄露。'],
    tests: [{ path: REFERRAL_DAO_TEST, proves: '直接覆盖链接解析元数据和 disabled→null；未直接覆盖 GET handler 与 toPublicReferralPreview 字段白名单。' }], officialSources: [{ label: 'OWASP forgot-password token guidance', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html' }], related: ['post-public-referral-resume', 'enqueue-resume-parse-jobs', 'put-object-bytes'],
  }),
  definePublicHttp({
    slug: 'post-public-referral-resume', name: '公开提交内推简历', signature: 'POST /api/public/referrals/:token/resumes', sourceLine: 78, technology: 'Hono 4.12.23 + multipart/form-data + BullMQ + S3',
    statusNote: '生产公开写入口；手工 multipart 校验，先存对象/批次后入队；入队失败会 cancelBatch，但已上传对象的清理依赖后续治理。',
    summary: '验证内推链接和 resume 文件，确认队列可用，存储对象、创建 public/referral 批次与 pool item，再批量入队解析；失败时取消批次。', whenToUse: '外部候选人在内推落地页提交一份简历进入公开简历池。',
    parameters: [param('token', '有效内推 bearer token。'), param('resume', 'multipart 文件字段；由 validateResumeFile 校验类型与大小。', 'File')], returns: { type: '201 { batchId, poolItemId, status:"queued" } | 400 | 404 | 500 | 503', description: '成功返回排队批次；格式/文件 400，链接 404，存储 500，队列不可用/入队失败 503。' },
    example: { language: 'ts', code: `const body = new FormData()\nbody.set('resume', file)\nconst res = await fetch('/api/public/referrals/' + encodeURIComponent(token) + '/resumes', { method: 'POST', body })\nconst result = await res.json()`, explanation: ['不要手动设置 Content-Type，浏览器会生成 boundary。', '201 只表示 queued，不表示解析完成。'] },
    effect: { title: '内推简历进入异步流水线', description: '对象与批次落库后，Worker 异步解析并更新 pool item。', metrics: [{ label: 'success status', value: '201 queued' }, { label: 'dedup policy', value: 'create' }], output: [{ label: 'valid upload', value: 'batch queued', tone: 'good' }, { label: 'queue offline', value: '503 retry later', tone: 'warn' }, { label: 'enqueue failure', value: 'batch cancelled', tone: 'neutral' }] },
    errors: [{ condition: '非 multipart、缺 resume 或文件无效', behavior: '返回 400，不创建批次。', recovery: '客户端预检格式/大小并让用户重选。' }, { condition: '队列未配置或入队失败', behavior: '返回 503；后者取消 batch。', recovery: '使用幂等提交键与状态查询，避免用户重试生成重复对象/批次。' }], bestPractices: ['公开上传按 token/IP 限流，扫描恶意文件和压缩炸弹。', '采用 outbox 事务化 batch/queue，并对取消批次的孤儿对象做生命周期清理。'],
    tests: [{ path: PUBLIC_ROUTE_TEST, proves: '直接覆盖 malformed multipart→400；未覆盖有效 201、文件校验、S3/批次、503 与 cancelBatch 补偿。' }, { path: REFERRAL_DAO_TEST, proves: '覆盖链接有效/disabled 解析，但不是上传 handler。' }], officialSources: [{ label: 'MDN FormData', url: 'https://developer.mozilla.org/en-US/docs/Web/API/FormData' }, { label: 'BullMQ reliability patterns', url: 'https://docs.bullmq.io/patterns/idempotent-jobs' }], related: ['get-public-referral', 'enqueue-resume-parse-jobs', 'put-object-bytes'],
  }),
  definePublicHttp({
    slug: 'get-public-resume-detail', name: '公开读取候选人简历详情', signature: 'GET /api/public/resumes/:id', sourceLine: 522,
    statusNote: '生产公开入口；candidateId 直接反查 organizationId 后复用完整 loadResumeDetail，无独立分享 token，可能暴露简历、联系方式与 AI 派生数据。',
    summary: '用 candidateId 查归属组织，再加载 Studio 简历详情并原样返回。', whenToUse: '公开候选人档案页确有授权受众时；当前实现应视为需要安全收敛的高敏入口。',
    parameters: [param('id', 'studioInterview candidateId；当前同时充当公开访问 capability。')], returns: { type: '200 StudioResumeDetail | 404 { error }', description: '存在返回完整详情；找不到组织或详情统一 404。' },
    example: { language: 'ts', code: `const res = await fetch('/api/public/resumes/' + encodeURIComponent(candidateId))\nif (res.ok) renderCandidate(await res.json())`, explanation: ['返回的是 Studio 详情，不是专门的 public DTO。', '调用方无法仅凭 URL 判断字段的披露边界。'] },
    effect: { title: '公开候选人档案', description: '页面可展示完整简历与 AI 分析；同样形成严重 PII 暴露面。', metrics: [{ label: 'projection', value: 'full Studio detail' }, { label: 'auth middleware', value: 'none' }], output: [{ label: 'known id', value: 'resume detail', tone: 'good' }, { label: 'BOLA/PII', value: 'high risk', tone: 'warn' }] },
    errors: [{ condition: 'candidate 或 organization 不存在', behavior: '返回 404。', recovery: '停止访问并使用受控分享入口。' }], bestPractices: ['禁止直接以业务主键授权；使用带 audience/scope/expiry 的 share token。', '定义 PublicResumeDTO，只允许最小字段并做对象级授权、限流、审计和数据水印。'],
    tests: [{ path: RESUME_DAO_TEST, proves: '直接覆盖 loadResumeDetail 的组织隔离与数据组装；未覆盖 public organization 反查、完整 DTO 暴露或本 handler。' }], officialSources: [{ label: 'OWASP BOLA', url: 'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/' }], related: ['get-public-resume-rounds', 'get-public-interview-round-resume', 'get-public-interview-round'],
  }),
  definePublicHttp({
    slug: 'get-public-resume-rounds', name: '公开读取候选人全部轮次', signature: 'GET /api/public/resumes/:id/rounds', sourceLine: 534,
    statusNote: '生产公开入口；candidateId 反查组织后返回全部轮次，包含候选人联系信息、创建人和岗位等字段，无独立 share token。',
    summary: '解析候选人归属组织，并按 sortOrder 返回该候选人的全部面试轮次列表。', whenToUse: '公开候选人档案需要轮次导航时，且分享权限明确覆盖全部轮次。',
    parameters: [param('id', 'studioInterview candidateId。')], returns: { type: '200 StudioInterviewRoundListRecord[] | 404', description: '候选人存在返回按 sortOrder 升序的轮次数组（可为空），否则 404。' },
    example: { language: 'ts', code: `const rounds = await fetch('/api/public/resumes/' + encodeURIComponent(candidateId) + '/rounds').then(r => r.json())\nrounds.forEach(renderRoundLink)`, explanation: ['列表包含每轮 conversationId/status/岗位和候选人快照。', '空数组表示候选人尚无轮次。'] },
    effect: { title: '候选人轮次时间线', description: '公开页面显示从第一轮到最新轮的状态与入口。', metrics: [{ label: 'ordering', value: 'sortOrder asc' }, { label: 'scope', value: 'all candidate rounds' }], output: [{ label: 'known candidate', value: 'round timeline', tone: 'good' }, { label: 'over-broad share', value: 'cross-round exposure', tone: 'warn' }] },
    errors: [{ condition: 'candidate 不存在', behavior: '返回 404。', recovery: '使用仍有效的受控分享链接。' }], bestPractices: ['share scope 明确到允许的 roundIds，不默认公开候选人历史全部轮次。', 'PublicRoundListDTO 去除联系方式、内部创建人和对象 key。'],
    tests: [{ path: ROUND_DAO_TEST, proves: '覆盖轮次查询的组织 scope 和详情，但未直接断言 listInterviewRoundsForCandidate 或此公开 handler；需补 route contract test。' }], officialSources: [{ label: 'OWASP API object authorization', url: 'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/' }], related: ['get-public-resume-detail', 'get-public-interview-round', 'get-public-interview-round-resolve'],
  }),
]

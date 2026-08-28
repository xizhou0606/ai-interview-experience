import type { ApiEntry, ApiParameter } from '../types'

const COMMIT = '3061418de31616f5402f54bd233c53f54affd8b5'
const ELECTRON_IPC = { label: 'Electron IPC tutorial', url: 'https://www.electronjs.org/docs/latest/tutorial/ipc' }
const ELECTRON_SECURITY = { label: 'Electron security checklist', url: 'https://www.electronjs.org/docs/latest/tutorial/security' }
const LANGCHAIN = { label: 'LangChain RunnableLambda', url: 'https://reference.langchain.com/javascript/langchain-core/runnables/RunnableLambda' }
const NODE_FS = { label: 'Node.js file system API', url: 'https://nodejs.org/api/fs.html#fswritefilesyncfile-data-options' }
const FFMPEG = { label: 'FFmpeg command-line documentation', url: 'https://ffmpeg.org/ffmpeg.html' }

const p = (name: string, type: string, required: boolean, description: string, defaultValue?: string): ApiParameter => ({ name, type, required, description, defaultValue })
const noUnitTests = [{ path: 'package.json', proves: '仓库当前没有行为单元测试；npm run typecheck 与 npm run build 只能证明类型、约束和打包通过，不能证明 IPC 输入校验、崩溃恢复或媒体输出正确。' }]

type Spec = {
  slug: string
  name: string
  signature: string
  kind: ApiEntry['kind']
  module: string
  technology: string
  summary: string
  whenToUse: string
  sourcePath: string
  sourceLine: number
  parameters: ApiParameter[]
  returns: ApiEntry['returns']
  code: string
  explanation: string[]
  effectTitle: string
  effectDescription: string
  success: string
  edge: string
  errors: ApiEntry['errors']
  bestPractices: string[]
  related: string[]
  officialSources?: ApiEntry['officialSources']
  implementationStatus?: ApiEntry['implementationStatus']
  statusNote?: string
}

const entry = (spec: Spec): ApiEntry => ({
  slug: spec.slug,
  name: spec.name,
  signature: spec.signature,
  kind: spec.kind,
  project: 'ai-playlet',
  module: spec.module,
  technology: spec.technology,
  implementationStatus: spec.implementationStatus ?? 'production',
  statusNote: spec.statusNote,
  summary: spec.summary,
  whenToUse: spec.whenToUse,
  sourcePath: spec.sourcePath,
  sourceLine: spec.sourceLine,
  verifiedCommit: COMMIT,
  parameters: spec.parameters,
  returns: spec.returns,
  example: { language: 'typescript', code: spec.code, explanation: spec.explanation },
  effect: {
    title: spec.effectTitle,
    description: spec.effectDescription,
    metrics: [{ label: 'project', value: 'ai-playlet' }, { label: 'evidence', value: COMMIT.slice(0, 12) }],
    output: [{ label: 'success', value: spec.success, tone: 'good' }, { label: 'boundary', value: spec.edge, tone: 'warn' }]
  },
  errors: spec.errors,
  bestPractices: spec.bestPractices,
  tests: noUnitTests,
  officialSources: spec.officialSources ?? [ELECTRON_IPC],
  related: spec.related
})

const ipc = (spec: Omit<Spec, 'kind' | 'sourcePath' | 'technology' | 'officialSources'> & Pick<Partial<Spec>, 'officialSources'>) => entry({
  ...spec,
  kind: 'method',
  sourcePath: 'src/main/index.ts',
  technology: 'Electron ipcMain.handle + contextBridge',
  officialSources: spec.officialSources ?? [ELECTRON_IPC, ELECTRON_SECURITY]
})

export const aiPlayletCoreApis: ApiEntry[] = [
  ipc({
    slug: 'playlet-ipc-bootstrap', name: 'IPC app:getBootstrap', signature: 'ipcRenderer.invoke("app:getBootstrap") → BootstrapPayload & { plan }', module: 'workflows', sourceLine: 74,
    summary: '读取桌面工作台初始资产、草稿、模型路由、设置和分析数据，并用 LangChain RunnableLambda 追加确定性的技能执行计划。', whenToUse: 'Renderer 首次启动，需要在一次双向 IPC 中取得生产台基线状态和工作流路线时。', parameters: [], returns: { type: 'Promise<BootstrapPayload & { plan: SkillPlanOutput }>', description: '静态 bootstrap 数据加 desktop-mvp 技能路线；当前不调用远程模型。' },
    code: `const bootstrap = await window.aiPlaylet.getBootstrap()\nconsole.log(bootstrap.plan.guardBeforeVideo)`, explanation: ['返回值经过 Electron structured clone。', 'plan 是本地 RunnableLambda 的确定性结果，不是 LLM 推理。'], effectTitle: '工作台一次性初始化', effectDescription: 'Renderer 得到统一的资产、草稿、设置和技能计划快照。', success: 'bootstrap + guarded skill plan', edge: 'static demo data; no model call',
    errors: [{ condition: 'Main 进程未注册 handler 或 Runnable 抛错', behavior: 'invoke Promise rejection，页面无法完成初始化。', recovery: '捕获错误并使用 renderer fallback；记录 channel 与版本，不记录内容资产。' }], bestPractices: ['Bootstrap 只返回可序列化数据。', '对返回结构做运行时 schema 校验。', '把静态示例数据与用户持久化状态分离。'], related: ['playlet-create-skill-plan-runnable', 'playlet-ipc-generate-draft'], implementationStatus: 'fallback', statusNote: '技能计划由本地规则生成；尚未连接可观测的 LLM/模型路由。', officialSources: [ELECTRON_IPC, LANGCHAIN]
  }),
  ipc({
    slug: 'playlet-ipc-open-external', name: 'IPC app:openExternal', signature: 'ipcRenderer.invoke("app:openExternal", url) → void', module: 'auth-security', sourceLine: 80,
    summary: '把打开外链的系统权限留在 Main，仅允许 https 前缀后调用 shell.openExternal，Renderer 不直接获得 Electron shell。', whenToUse: '技术文档、供应商控制台或帮助链接需要交给系统浏览器打开时。', parameters: [p('url', 'string', true, '必须以 https:// 开头的外部地址。')], returns: { type: 'Promise<void>', description: '系统接受打开请求后完成；不返回窗口句柄。' },
    code: `await window.aiPlaylet.openExternal('https://www.electronjs.org/docs/latest/tutorial/security')`, explanation: ['白名单桥接比暴露 ipcRenderer 更小权限。', '字符串前缀检查不是完整主机 allowlist。'], effectTitle: '外链权限收口', effectDescription: 'Renderer 无法直接调用任意 Electron 原生 API。', success: 'system browser opens HTTPS URL', edge: 'no host allowlist or sender validation',
    errors: [{ condition: 'URL 非 https、系统拒绝或协议处理器失败', behavior: 'Main 抛错，Renderer 收到序列化 message。', recovery: '使用 URL 解析器和可信主机 allowlist；在 UI 显示可复制链接。' }], bestPractices: ['校验 event.senderFrame。', '用 new URL 解析并限制 host。', '不要把 shell 或通用 invoke 暴露给 Renderer。'], related: ['playlet-ipc-bootstrap'], officialSources: [ELECTRON_SECURITY]
  }),
  ipc({
    slug: 'playlet-ipc-assets-list', name: 'IPC assets:list', signature: 'ipcRenderer.invoke("assets:list", fallback) → ProductionAsset[]', module: 'object-storage', sourceLine: 87,
    summary: '惰性读取 userData/production-assets.json；文件缺失或 JSON 非数组时把 Renderer 提供的 fallback 持久化为初始资产集。', whenToUse: 'Asset Library 启动或生产快照需要加载本地护栏证据时。', parameters: [p('fallback', 'ProductionAsset[]', true, '首次启动或文件损坏时的回退数据。')], returns: { type: 'Promise<ProductionAsset[]>', description: '内存缓存或新持久化的资产数组。' },
    code: `const assets = await window.aiPlaylet.getProductionAssets(defaultAssets)`, explanation: ['首次调用会读盘一次并缓存。', '损坏 JSON 当前会静默被 fallback 覆盖。'], effectTitle: '资产证据可跨会话恢复', effectDescription: '角色、首帧、配音和场景状态从 Electron userData 恢复。', success: 'persisted asset catalogue', edge: 'fallback overwrites corrupt state',
    errors: [{ condition: '目录不可写、磁盘满或 fallback 含不可序列化值', behavior: '同步文件 API 在 Main 抛错，invoke rejection。', recovery: '显示只读模式；备份损坏文件后再迁移，不应直接覆盖。' }], bestPractices: ['对 JSON 做版本化 schema 校验。', '原子写临时文件后 rename。', '区分不存在、损坏和权限错误。'], related: ['playlet-create-asset-service', 'playlet-apply-asset-evidence'], officialSources: [ELECTRON_IPC, NODE_FS]
  }),
  ipc({
    slug: 'playlet-ipc-assets-save', name: 'IPC assets:save', signature: 'ipcRenderer.invoke("assets:save", assets) → ProductionAsset[]', module: 'object-storage', sourceLine: 88,
    summary: '把完整 ProductionAsset 数组替换写入本地 JSON，并同步更新 Main 进程内存缓存。', whenToUse: '用户补充护栏证据、改变资产状态或批量修复后保存 Asset Library 时。', parameters: [p('assets', 'ProductionAsset[]', true, '完整的新资产快照。')], returns: { type: 'Promise<ProductionAsset[]>', description: '写盘成功后的同一资产快照。' },
    code: `const saved = await window.aiPlaylet.saveProductionAssets(nextAssets)`, explanation: ['当前是整表覆盖而非增量事务。', 'handler 没有运行时类型校验。'], effectTitle: '护栏证据持久化', effectDescription: '资产状态成为后续分镜与队列派生的输入。', success: 'JSON snapshot saved', edge: 'last writer wins',
    errors: [{ condition: '并发窗口覆盖、写盘中断或 payload 非法', behavior: '可能丢失前一写入或留下截断文件。', recovery: '增加 revision/ETag、原子写和 schema validation。' }], bestPractices: ['Main 校验 IPC 参数。', '使用版本号检测并发更新。', '敏感媒体只存路径和哈希，不内嵌 IPC。'], related: ['playlet-ipc-assets-list', 'playlet-create-asset-service', 'playlet-build-render-queue'], officialSources: [ELECTRON_IPC, NODE_FS]
  }),
  ipc({
    slug: 'playlet-ipc-generate-draft', name: 'IPC drafts:generate', signature: 'ipcRenderer.invoke("drafts:generate", input) → ProductionDraft', module: 'workflows', sourceLine: 89,
    summary: '通过惰性 LangChain RunnableLambda 把一句话简报转换为带节拍、资产需求和视频前置护栏的 ProductionDraft。', whenToUse: 'Generate Drama 或 Director Chat 把用户创意交给 Main 生成可审核生产草稿时。', parameters: [p('input', 'DramaBriefInput', true, 'logline、genre、format、tone 与 duration。')], returns: { type: 'Promise<ProductionDraft>', description: '确定性的本地草稿，默认阻断配音、角色参考和首帧。' },
    code: `const draft = await window.aiPlaylet.generateProductionDraft({\n  logline: '雨夜信使发现失控记忆', genre: '赛博朋克', format: '短剧', tone: '快节奏', duration: 45\n})`, explanation: ['RunnableLambda 只是统一可组合接口。', '当前没有 prompt、模型调用、结构化输出重试或内容安全。'], effectTitle: '创意进入可控生产结构', effectDescription: '一句话变成节拍、阶段和资产护栏，而不是直接消费视频额度。', success: 'guarded ProductionDraft', edge: 'deterministic scaffold only',
    errors: [{ condition: 'input 缺字段、duration 非法或 Renderer 传入超长文本', behavior: '当前缺运行时校验，可能生成负时长节拍或过大 IPC payload。', recovery: '在 Main 使用 Zod 校验和长度上限；模型失败时保留本地 deterministic fallback。' }], bestPractices: ['标注这是 fallback 而非 LLM 结果。', '接模型后使用结构化 schema、超时和 trace。', '任何视频调用前仍需资产和预算护栏。'], related: ['playlet-create-draft-planner-runnable', 'playlet-create-production-draft', 'playlet-ipc-drafts-save'], implementationStatus: 'fallback', statusNote: '命名为 AI 草稿生成，但当前只运行本地 deterministic factory，没有调用任何 LLM。', officialSources: [ELECTRON_IPC, LANGCHAIN]
  }),
  ipc({
    slug: 'playlet-ipc-drafts-list', name: 'IPC drafts:list', signature: 'ipcRenderer.invoke("drafts:list", fallback) → ProductionDraft[]', module: 'object-storage', sourceLine: 90,
    summary: '从 userData/production-drafts.json 惰性恢复生产草稿；无有效数组时保存 fallback。', whenToUse: 'My Studio、分镜、渲染队列需要同一批持久化草稿时。', parameters: [p('fallback', 'ProductionDraft[]', true, '首次运行的默认草稿。')], returns: { type: 'Promise<ProductionDraft[]>', description: '持久化或回退草稿数组。' }, code: `const drafts = await window.aiPlaylet.getProductionDrafts(seedDrafts)`, explanation: ['只验证顶层是数组。', '没有逐字段迁移或版本控制。'], effectTitle: '生产草稿跨会话恢复', effectDescription: 'Studio 与下游工作台共享同一个草稿来源。', success: 'draft snapshot loaded', edge: 'corrupt data becomes fallback', errors: [{ condition: 'JSON 损坏或结构旧版', behavior: '当前静默返回 null 并覆盖为 fallback。', recovery: '先备份、迁移和展示恢复提示。' }], bestPractices: ['对 Draft 做逐项 schema 校验。', '保留 schemaVersion。', '读取失败不得静默丢弃用户内容。'], related: ['playlet-create-draft-service', 'playlet-ipc-drafts-save'], officialSources: [ELECTRON_IPC, NODE_FS]
  }),
  ipc({
    slug: 'playlet-ipc-drafts-save', name: 'IPC drafts:save', signature: 'ipcRenderer.invoke("drafts:save", drafts) → ProductionDraft[]', module: 'object-storage', sourceLine: 91,
    summary: '整表替换持久化 ProductionDraft 数组，成为 Studio、Storyboard 和 Render Queue 的共享输入。', whenToUse: '新建、归档、修改草稿或资产证据反向更新草稿护栏后。', parameters: [p('drafts', 'ProductionDraft[]', true, '完整草稿快照。')], returns: { type: 'Promise<ProductionDraft[]>', description: '写盘后的草稿数组。' }, code: `await window.aiPlaylet.saveProductionDrafts(updatedDrafts)`, explanation: ['保存前应合并最新 revision。', 'Main 当前不验证字段和所有权。'], effectTitle: '生产状态统一落盘', effectDescription: '所有生产视图重启后仍可重建阶段和护栏。', success: 'draft JSON saved', edge: 'whole-file overwrite', errors: [{ condition: '磁盘失败或多窗口竞争', behavior: 'Promise rejection 或后写覆盖先写。', recovery: '原子写、revision compare 和冲突提示。' }], bestPractices: ['IPC 边界运行时校验。', '对归档使用软删除。', '大项目迁移到 SQLite 事务。'], related: ['playlet-ipc-drafts-list', 'playlet-create-draft-service', 'playlet-build-storyboard-shots'], officialSources: [ELECTRON_IPC, NODE_FS]
  }),
  ipc({
    slug: 'playlet-ipc-render-list', name: 'IPC renderQueue:list', signature: 'ipcRenderer.invoke("renderQueue:list", snapshot) → RenderQueueJob[]', module: 'background-jobs', sourceLine: 93,
    summary: '从 drafts/assets/settings/storyboardState 重新派生队列，再叠加本地状态 override；视频前置护栏不通过时任务保持 blocked。', whenToUse: 'Render Queue、Review Center 或 Delivery Hub 需要最新任务视图时。', parameters: [p('snapshot', 'RenderQueueSnapshot', true, '草稿、资产、设置和分镜锁定状态。')], returns: { type: 'Promise<RenderQueueJob[]>', description: '派生任务与持久化进度/事件 override 合并后的数组。' }, code: `const jobs = await window.aiPlaylet.getRenderQueue(snapshot)`, explanation: ['任务基线是纯函数派生。', '当前没有真实外部视频供应商 job 状态同步。'], effectTitle: '昂贵视频调用前可见阻断', effectDescription: '缺配音、角色参考、首帧或分镜锁定会直接显示 blocked 原因。', success: 'derived queue with guard issues', edge: 'local simulation, not provider queue', errors: [{ condition: 'snapshot 与 override 的 key 失配或 JSON 损坏', behavior: 'override 被忽略/回退，任务可能回到派生状态。', recovery: '为 snapshot 和 overrides 加版本与迁移；从供应商状态对账。' }], bestPractices: ['派生函数保持无副作用。', '不要把本地 progress 当真实供应商进度。', '外部 job id、幂等键和账单必须持久化。'], related: ['playlet-build-render-queue', 'playlet-render-service', 'playlet-ipc-render-advance'], implementationStatus: 'fallback', statusNote: '队列由本地数据派生并模拟状态，没有实际视频生成供应商或 Worker。'
  }),
  ipc({
    slug: 'playlet-ipc-render-advance', name: 'IPC renderQueue:advance', signature: 'ipcRenderer.invoke("renderQueue:advance", key, snapshot) → RenderQueueJob[]', module: 'background-jobs', sourceLine: 94,
    summary: '按 queued→rendering→review→done 本地状态机推进任务，写入最近六条事件；不会启动 FFmpeg 或视频 API。', whenToUse: '演示/本地工作台手工推进一个已通过护栏的队列项时。', parameters: [p('key', 'string', true, '任务稳定 key。'), p('snapshot', 'RenderQueueSnapshot', true, '用于重建队列的当前快照。')], returns: { type: 'Promise<RenderQueueJob[]>', description: '状态推进后的完整队列。' }, code: `const jobs = await window.aiPlaylet.advanceRenderJob(job.key, snapshot)`, explanation: ['blocked 状态不会由 nextQueueStatus 推进。', 'rendering 只是标签，不是正在运行的进程。'], effectTitle: '队列状态机可演练', effectDescription: 'UI 可以演示推进和审片路径。', success: 'persisted next local status', edge: 'no media job launched', errors: [{ condition: 'key 不存在或 snapshot 改变导致任务消失', behavior: '抛“未找到渲染任务”。', recovery: '刷新队列并使用当前 key；真正执行器需按外部 job id 对账。' }], bestPractices: ['把模拟推进明确标识为 dry-run。', '真实任务使用 Worker lease、重试和幂等。', '禁止 blocked 任务绕过护栏。'], related: ['playlet-next-queue-status', 'playlet-ipc-render-review', 'playlet-ipc-render-list'], implementationStatus: 'defined-only', statusNote: '只改变本地状态和事件，没有调用视频模型、任务 Worker 或 FFmpeg。'
  }),
  ipc({
    slug: 'playlet-ipc-render-compose', name: 'IPC renderQueue:compose', signature: 'ipcRenderer.invoke("renderQueue:compose", key, snapshot) → RenderQueueJob[]', module: 'integrations', sourceLine: 95,
    summary: '对 done 且已有 exportPath 的任务生成 FFmpeg dry-run JSON 计划，包含 concat、最终配音映射与原生音频剥离检查。', whenToUse: 'Delivery Hub 已有批准导出清单，需要准备本地合成计划但还没有真实媒体文件时。', parameters: [p('key', 'string', true, '已完成任务 key。'), p('snapshot', 'RenderQueueSnapshot', true, '提供导出 preset 等设置。')], returns: { type: 'Promise<RenderQueueJob[]>', description: '包含 compositionPath 的队列；条件不满足时原样返回。' }, code: `const jobs = await window.aiPlaylet.composeRenderJob(doneJob.key, snapshot)`, explanation: ['写出的是 composition-plan.json。', 'commandPreview 不会被执行。'], effectTitle: '合成步骤先预演', effectDescription: '在真实 FFmpeg 执行前可审核输入、音轨和输出策略。', success: 'dry-run composition plan path', edge: 'no FFmpeg process or media validation', errors: [{ condition: '任务未 done、无 exportPath 或目录不可写', behavior: '前两者静默 no-op；写盘错误则 reject。', recovery: 'UI 显示前置条件；执行前用 ffprobe 校验所有输入。' }], bestPractices: ['命令参数用 spawn 数组而非 shell 字符串。', '验证 concat 清单路径。', '捕获 stderr、exit code 和取消信号。'], related: ['playlet-render-service', 'playlet-ipc-render-export'], implementationStatus: 'defined-only', statusNote: '只写 dry-run JSON 和 commandPreview，没有执行 FFmpeg。', officialSources: [ELECTRON_IPC, FFMPEG]
  }),
  ipc({
    slug: 'playlet-ipc-render-export', name: 'IPC renderQueue:export', signature: 'ipcRenderer.invoke("renderQueue:export", key, snapshot) → RenderQueueJob[]', module: 'workflows', sourceLine: 96,
    summary: '为 done 任务写出含质量、预设、成本、时长和审片检查的导出 manifest，并把路径叠加到队列 override。', whenToUse: '人工审片批准后，为后续本地合成固定不可变的交付元数据时。', parameters: [p('key', 'string', true, '已完成任务 key。'), p('snapshot', 'RenderQueueSnapshot', true, '当前设置与派生输入。')], returns: { type: 'Promise<RenderQueueJob[]>', description: '包含 exportPath 的完整队列。' }, code: `const jobs = await window.aiPlaylet.exportRenderJob(approved.key, snapshot)`, explanation: ['仅 done 任务写清单。', '清单不包含真实镜头文件和内容哈希。'], effectTitle: '交付元数据可追溯', effectDescription: '审片、成本和导出设置固化为 JSON。', success: 'export manifest path', edge: 'manifest only; no MP4', errors: [{ condition: '任务未 done、找不到 key 或写盘失败', behavior: '未 done 静默 no-op；其余抛错。', recovery: '显式返回 skipped 原因；原子写并加入镜头哈希。' }], bestPractices: ['manifest 记录输入资产版本和模型参数。', '用内容哈希确保可复现。', '不要把 manifest 当成最终媒体。'], related: ['playlet-ipc-render-review', 'playlet-ipc-render-compose', 'playlet-render-service'], implementationStatus: 'defined-only', statusNote: '只生成 JSON manifest，不编码或导出 MP4。', officialSources: [ELECTRON_IPC, NODE_FS]
  }),
  ipc({
    slug: 'playlet-ipc-render-pause', name: 'IPC renderQueue:pause', signature: 'ipcRenderer.invoke("renderQueue:pause", key, snapshot) → RenderQueueJob[]', module: 'background-jobs', sourceLine: 97,
    summary: '仅当本地状态为 rendering 时退回 queued 并记录事件；没有向真实供应商发送取消请求。', whenToUse: '用户在模拟队列中暂停某个正在推进的任务时。', parameters: [p('key', 'string', true, '任务 key。'), p('snapshot', 'RenderQueueSnapshot', true, '当前队列派生输入。')], returns: { type: 'Promise<RenderQueueJob[]>', description: '暂停后的完整队列；非 rendering 原样返回。' }, code: `await window.aiPlaylet.pauseRenderJob(rendering.key, snapshot)`, explanation: ['本地状态回到 queued。', '不会停止任何进程或计费。'], effectTitle: '本地队列可暂停', effectDescription: '工作台状态和事件日志反映用户操作。', success: 'rendering → queued', edge: 'no provider cancellation', errors: [{ condition: 'key 不存在或真实供应商仍在运行', behavior: '本地抛错，或产生状态漂移和继续计费。', recovery: '真实实现必须保存 provider job id 并确认 cancel 结果。' }], bestPractices: ['区分 pause、cancel 和 retry。', '供应商确认前显示 cancelling。', '记录最终计费与残留输出。'], related: ['playlet-ipc-render-advance', 'playlet-render-service'], implementationStatus: 'defined-only', statusNote: '只更新本地 JSON；没有可取消的真实 Worker 或模型任务。'
  }),
  ipc({
    slug: 'playlet-ipc-render-review', name: 'IPC renderQueue:review', signature: 'ipcRenderer.invoke("renderQueue:review", key, decision, snapshot) → RenderQueueJob[]', module: 'workflows', sourceLine: 98,
    summary: '对 review 任务执行人工 approve→done 或 rework→queued 状态转换，并将决定写入事件日志。', whenToUse: 'Review Center 的人工审片确认最终输出或要求返工时。', parameters: [p('key', 'string', true, '待审片任务。'), p('decision', '"approve" | "rework"', true, '人工决定。'), p('snapshot', 'RenderQueueSnapshot', true, '重建队列所需快照。')], returns: { type: 'Promise<RenderQueueJob[]>', description: '审片决定后的完整队列。' }, code: `await window.aiPlaylet.reviewRenderJob(job.key, 'rework', snapshot)`, explanation: ['只在 review 状态生效。', '当前不保存审片人、帧级标注或签名。'], effectTitle: '人工审片形成状态门', effectDescription: '只有 approve 才进入 done，rework 回到队列。', success: 'review decision persisted', edge: 'minimal audit identity', errors: [{ condition: 'key 不存在、decision 非法或非 review 状态', behavior: 'key 错误抛错；其余可能 no-op 或按非 approve 返工。', recovery: 'Main 端 schema 校验枚举并记录 reviewer identity。' }], bestPractices: ['保存审片人、时间和具体 findings。', '批准清单绑定输出哈希。', '返工应路由到具体镜头/资产。'], related: ['playlet-ipc-render-export', 'playlet-render-service']
  }),
  ipc({
    slug: 'playlet-ipc-settings-get', name: 'IPC settings:get', signature: 'ipcRenderer.invoke("settings:get", fallback) → RuntimeSettings', module: 'object-storage', sourceLine: 99,
    summary: '从 userData/runtime-settings.json 惰性加载模型路由、预算、并发、画质和视频护栏开关。', whenToUse: 'Settings 或队列派生前取得当前运行策略时。', parameters: [p('fallback', 'RuntimeSettings', true, '首次启动的安全默认值。')], returns: { type: 'Promise<RuntimeSettings>', description: '持久化设置或保存后的 fallback。' }, code: `const settings = await window.aiPlaylet.getRuntimeSettings(defaultSettings)`, explanation: ['当前只校验 JSON 是对象。', '设置直接影响是否阻断付费视频任务。'], effectTitle: '运行策略跨会话一致', effectDescription: '预算、并发与资产护栏在重启后保留。', success: 'runtime settings loaded', edge: 'no schema migration', errors: [{ condition: '旧版/损坏 JSON 或权限错误', behavior: '损坏会静默回退，写入失败 reject。', recovery: '版本迁移并保留安全默认护栏为 true。' }], bestPractices: ['fail closed：未知值不得关闭护栏。', '校验预算和并发范围。', '模型凭据不得存普通 JSON。'], related: ['playlet-create-settings-service', 'playlet-ipc-settings-save', 'playlet-build-render-queue'], officialSources: [ELECTRON_IPC, NODE_FS]
  }),
  ipc({
    slug: 'playlet-ipc-settings-save', name: 'IPC settings:save', signature: 'ipcRenderer.invoke("settings:save", settings) → RuntimeSettings', module: 'object-storage', sourceLine: 100,
    summary: '整对象写入运行设置 JSON 并刷新内存缓存，随后队列会按新的预算/护栏策略重新派生。', whenToUse: '用户切换模型、质量、导出预设、并发或 guard 开关并点击保存时。', parameters: [p('settings', 'RuntimeSettings', true, '完整运行设置。')], returns: { type: 'Promise<RuntimeSettings>', description: '写盘后的设置对象。' }, code: `await window.aiPlaylet.saveRuntimeSettings({ ...settings, maxConcurrentJobs: 2 })`, explanation: ['当前 Main 不校验数值范围。', '关闭 guard 只影响本地派生，没有授权审批。'], effectTitle: '生产策略受控更新', effectDescription: '新设置立即成为后续队列和导出的输入。', success: 'settings JSON saved', edge: 'unsafe values accepted', errors: [{ condition: '负预算、过高并发、字段缺失或写盘失败', behavior: '非法值仍可能写入；文件错误 reject。', recovery: 'Zod 校验、管理员授权和安全默认回滚。' }], bestPractices: ['敏感 guard 变更需要二次确认。', '限制预算与并发上下界。', '写入审计事件和 schemaVersion。'], related: ['playlet-ipc-settings-get', 'playlet-create-settings-service']
  }),
  ipc({
    slug: 'playlet-ipc-storyboard-get', name: 'IPC storyboard:get', signature: 'ipcRenderer.invoke("storyboard:get", fallback) → StoryboardState', module: 'object-storage', sourceLine: 101,
    summary: '恢复锁定镜头 key、prompt 版本号和更新时间；仅当两个核心字段结构正确才接受 JSON。', whenToUse: 'Storyboard Workbench 和 Render Queue 需要共享镜头锁定状态时。', parameters: [p('fallback', 'StoryboardState', true, '首次启动的空锁定状态。')], returns: { type: 'Promise<StoryboardState>', description: '持久化状态或 fallback。' }, code: `const state = await window.aiPlaylet.getStoryboardState(emptyStoryboardState)`, explanation: ['比其他 JSON service 多做了两项结构校验。', '没有验证 key 是否仍属于当前 draft。'], effectTitle: '镜头锁定跨会话保存', effectDescription: '队列可据此阻止未锁定分镜进入视频生成。', success: 'locked shots restored', edge: 'stale shot keys possible', errors: [{ condition: '草稿节拍变化、JSON 损坏或文件不可写', behavior: '旧 key 可能失效；损坏回 fallback。', recovery: '按 draft/version 清理失效 key，并显示迁移提示。' }], bestPractices: ['状态绑定 draft revision。', 'prompt version 单调递增。', '锁定操作记录操作者和资产哈希。'], related: ['playlet-create-storyboard-service', 'playlet-build-storyboard-shots', 'playlet-ipc-storyboard-save'], officialSources: [ELECTRON_IPC, NODE_FS]
  }),
  ipc({
    slug: 'playlet-ipc-storyboard-save', name: 'IPC storyboard:save', signature: 'ipcRenderer.invoke("storyboard:save", state) → StoryboardState', module: 'object-storage', sourceLine: 102,
    summary: '完整覆盖写入镜头锁定与 prompt 版本状态，让 Render Queue 下一次派生时执行分镜锁定护栏。', whenToUse: '用户锁定/解锁镜头或重新生成 motion prompt 后。', parameters: [p('state', 'StoryboardState', true, '新的锁定 key、promptVersions 和 updatedAt。')], returns: { type: 'Promise<StoryboardState>', description: '写盘后的分镜状态。' }, code: `await window.aiPlaylet.saveStoryboardState(nextStoryboardState)`, explanation: ['整对象替换。', 'Main 当前不验证锁定镜头的 guard 是否通过。'], effectTitle: '分镜决策影响付费队列', effectDescription: '未全部锁定的镜头批次继续保持 blocked。', success: 'storyboard state saved', edge: 'client can forge locked keys', errors: [{ condition: 'Renderer 伪造 key、并发覆盖或写盘失败', behavior: '无服务端验证时可绕过意图；IO 错误 reject。', recovery: 'Main 重建 shots 并只接受合法 key，增加 revision compare。' }], bestPractices: ['锁定前在 Main 重跑 guard。', '保存 draft revision 与 prompt hash。', '原子写并记录审计。'], related: ['playlet-ipc-storyboard-get', 'playlet-build-render-queue', 'playlet-create-storyboard-service'], officialSources: [ELECTRON_IPC, NODE_FS]
  }),

  entry({
    slug: 'playlet-create-draft-planner-runnable', name: 'createDraftPlannerRunnable', signature: 'createDraftPlannerRunnable() → RunnableLambda<DramaBriefInput, ProductionDraft>', kind: 'function', module: 'workflows', technology: 'LangChain Core RunnableLambda', sourcePath: 'src/main/services/langchain/draft-planner.ts', sourceLine: 5,
    summary: '把本地 createProductionDraft 包成 LangChain Runnable，统一 invoke 接口，为未来串联模型、trace、重试和 fallback 留出编排边界。', whenToUse: 'Main 进程需要向 IPC 提供稳定的 Runnable 接口，但当前仍采用确定性草稿工厂时。', parameters: [], returns: { type: 'RunnableLambda<DramaBriefInput, ProductionDraft>', description: '可 invoke 的本地同步转换 Runnable。' }, code: `const planner = createDraftPlannerRunnable()\nconst draft = await planner.invoke(input)`, explanation: ['RunnableLambda 可组合，但此处只有单个同步函数。', '不能把它描述成已接入 LLM。'], effectTitle: '草稿生成获得可组合边界', effectDescription: '调用方不依赖具体生成实现。', success: 'typed Runnable', edge: 'no model, trace or retry', errors: [{ condition: '工厂输入非法', behavior: '底层 createProductionDraft 仍会生成可能不合理的结构。', recovery: '在 Runnable 前加入 schema、内容安全和超时层。' }], bestPractices: ['为 Runnable 配置 name/tags。', '记录 fallback 与模型输出来源。', '流式需求不要误用只返回最终值的 Lambda。'], related: ['playlet-create-production-draft', 'playlet-ipc-generate-draft'], officialSources: [LANGCHAIN], implementationStatus: 'fallback', statusNote: '仅包装确定性函数，未调用聊天模型或结构化输出解析器。'
  }),
  entry({
    slug: 'playlet-create-skill-plan-runnable', name: 'createSkillPlanRunnable', signature: 'createSkillPlanRunnable() → RunnableLambda<SkillPlanInput, SkillPlanOutput>', kind: 'function', module: 'workflows', technology: 'LangChain Core RunnableLambda', sourcePath: 'src/main/services/langchain/skill-registry.ts', sourceLine: 12,
    summary: '按 desktop-mvp/full-pipeline 选择确定性技能路线，并永远声明视频前必须执行 guard。', whenToUse: '初始化生产台或解释不同项目形态的技能顺序时。', parameters: [], returns: { type: 'RunnableLambda<SkillPlanInput, SkillPlanOutput>', description: '输入 projectKind 后返回 route 和 guardBeforeVideo=true。' }, code: `const plan = await createSkillPlanRunnable().invoke({ projectKind: 'full-pipeline' })`, explanation: ['desktop 路线进入合成/机械审片。', 'full 路线追加图像、视频 prompt 与生成 guard。'], effectTitle: '工作流顺序显式化', effectDescription: '昂贵的视频阶段始终位于低成本生成和护栏之后。', success: 'ordered skill route', edge: 'hard-coded registry', errors: [{ condition: '运行时传入类型外 projectKind', behavior: '三元判断会落入 full-pipeline 分支。', recovery: '使用运行时枚举校验并对未知值 fail closed。' }], bestPractices: ['技能声明包含输入输出 schema。', '路由版本化并可观测。', 'guard 不允许由模型自行删除。'], related: ['playlet-ipc-bootstrap', 'playlet-create-draft-planner-runnable'], officialSources: [LANGCHAIN], implementationStatus: 'defined-only', statusNote: '路线为硬编码数组，尚无真实 skill registry、执行器或 tracing。'
  }),
  entry({
    slug: 'playlet-create-production-draft', name: 'createProductionDraft', signature: 'createProductionDraft(input, now?) → ProductionDraft', kind: 'function', module: 'workflows', technology: 'TypeScript deterministic draft factory', sourcePath: 'src/shared/draft-factory.ts', sourceLine: 27,
    summary: '将简报规范化为标题、观众、风险、六阶段 pipeline、四个 guard、四段 beats 和四类资产需求；默认不允许直接进入视频。', whenToUse: 'Electron Main 与浏览器 preview 需要共享完全一致的本地草稿 fallback 时。', parameters: [p('input', 'DramaBriefInput', true, '创意与生成偏好。'), p('now', 'Date', false, '用于稳定 key 与时间，测试时可注入。', 'new Date()')], returns: { type: 'ProductionDraft', description: '进度 22、状态 Draft、配音/角色/首帧 blocked 的新草稿。' }, code: `const draft = createProductionDraft(input, new Date('2026-07-15T08:00:00+08:00'))`, explanation: ['注入 now 可使输出可测试。', 'duration 决定 scenes 与 beat 时长。'], effectTitle: '高成本步骤前先结构化', effectDescription: '创意先进入可审查、可返工的低成本生产对象。', success: 'deterministic guarded draft', edge: 'duration validation absent', errors: [{ condition: 'duration 小于 18、NaN 或 logline 为空', behavior: '最后一个 beat 可能负数，空标题回退但内容质量低。', recovery: '调用前校验 15..120 秒、有限数值和文本长度。' }], bestPractices: ['纯函数保留确定性。', '真实 AI 输出仍需同一 schema 校验。', '阶段与 guard 使用稳定 key。'], related: ['playlet-create-draft-planner-runnable', 'playlet-build-storyboard-shots'], officialSources: [LANGCHAIN], implementationStatus: 'fallback', statusNote: '这是规则工厂，不是模型生成器。'
  }),
  entry({
    slug: 'playlet-build-storyboard-shots', name: 'buildStoryboardShots', signature: 'buildStoryboardShots(draft, assets) → StoryboardShot[]', kind: 'function', module: 'workflows', technology: 'Deterministic storyboard + asset guards', sourcePath: 'src/shared/storyboard.ts', sourceLine: 69,
    summary: '按 beats 生成镜头、机位、动作 prompt、字幕和 ownerSkill，并把真实配音、角色参考、首帧三类资产转为逐镜头 guard。', whenToUse: 'Storyboard Workbench 展示可锁定镜头，或 Render Queue 检查全部镜头是否满足前置资产时。', parameters: [p('draft', 'ProductionDraft', true, '带 beats 的生产草稿。'), p('assets', 'ProductionAsset[]', true, '跨项目资产集合。')], returns: { type: 'StoryboardShot[]', description: '每个 beat 一个镜头；只有 ready/locked 资产能让 guard pass。' }, code: `const shots = buildStoryboardShots(draft, assets)\nconst blocked = shots.flatMap(s => s.guards).filter(g => g.status === 'blocked')`, explanation: ['资产按 asset.project === draft.title 关联。', '视频 prompt 只描述动作/运镜，图像 prompt 承担静态构图。'], effectTitle: '分镜把连续性和时长前置', effectDescription: '付费视频前可见每镜头所缺的真实证据。', success: 'timed guarded shots', edge: 'template prompts; no model/provider', errors: [{ condition: '同名项目冲突、voice 总时长不足或 beats 缺失', behavior: '可能关联错资产；每个 beat 只做 Math.min，不能保证总时长守恒。', recovery: '使用 projectId；按时间轴分配 voice segments 并校验总和。' }], bestPractices: ['角色/场景连续性用稳定资产 ID。', '锁定前保存 prompt 版本和参考哈希。', '模板 prompt 与模型增强结果区分来源。'], related: ['playlet-build-render-queue', 'playlet-ipc-storyboard-save', 'playlet-create-production-draft'], implementationStatus: 'fallback', statusNote: '分镜与 prompt 来自固定模板，没有调用图像/视频模型。'
  }),
  entry({
    slug: 'playlet-progress-for-status', name: 'progressForStatus', signature: 'progressForStatus(status, current=0) → number', kind: 'function', module: 'background-jobs', technology: 'Pure queue state projection', sourcePath: 'src/shared/render-queue.ts', sourceLine: 12,
    summary: '把 queued/rendering/review/done 映射为单调的 UI 进度下限，blocked 保留当前值。', whenToUse: '本地状态机推进时计算展示进度，而不是读取供应商实际百分比时。', parameters: [p('status', 'RenderQueueStatus', true, '目标状态。'), p('current', 'number', false, '已有进度。', '0')], returns: { type: 'number', description: 'queued=0、rendering≥36、review≥72、done=100。' }, code: `const progress = progressForStatus('review', 48) // 72`, explanation: ['保证主要状态推进时进度不倒退。', '不是媒体生成的真实进度。'], effectTitle: '队列进度展示一致', effectDescription: '不同页面使用同一状态到进度投影。', success: 'stable UI percentage', edge: 'synthetic progress only', errors: [{ condition: 'current 超出 0..100 或状态未知', behavior: '可能返回异常数值或原样 current。', recovery: '输入 clamp 并使用 exhaustive switch。' }], bestPractices: ['命名标明 synthetic。', '真实 provider progress 单独存储。', '阻断状态显示原因而非伪百分比。'], related: ['playlet-next-queue-status', 'playlet-render-service'], implementationStatus: 'fallback', statusNote: '只用于 UI 模拟进度，不代表真实视频任务。'
  }),
  entry({
    slug: 'playlet-next-queue-status', name: 'nextQueueStatus', signature: 'nextQueueStatus(status) → RenderQueueStatus', kind: 'function', module: 'background-jobs', technology: 'Finite state machine helper', sourcePath: 'src/shared/render-queue.ts', sourceLine: 20,
    summary: '定义 queued→rendering→review→done 的单向 happy path；blocked 与 done 保持不变。', whenToUse: 'advance 操作需要确定下一本地状态时。', parameters: [p('status', 'RenderQueueStatus', true, '当前状态。')], returns: { type: 'RenderQueueStatus', description: '下一状态或原状态。' }, code: `const next = nextQueueStatus('rendering') // 'review'`, explanation: ['没有失败、取消、重试等生产状态。', 'review 的 approve/rework 由独立方法处理。'], effectTitle: '状态推进规则集中', effectDescription: 'UI 和 Main 不重复定义 happy path。', success: 'deterministic transition', edge: 'incomplete production FSM', errors: [{ condition: '需要 failed/cancelling/retrying 等状态', behavior: '当前类型无法表达，可能被错误映射为 happy path。', recovery: '扩展显式状态图与合法 transition table。' }], bestPractices: ['拒绝非法转换。', '状态变化与外部副作用原子记录。', '区分 requested 与 confirmed 状态。'], related: ['playlet-progress-for-status', 'playlet-ipc-render-advance'], implementationStatus: 'defined-only', statusNote: '只覆盖演示 happy path，缺少生产任务失败与恢复状态。'
  }),
  entry({
    slug: 'playlet-estimate-render-cost', name: 'estimateRenderCost', signature: 'estimateRenderCost(duration, quality) → "$0.00"', kind: 'function', module: 'model-routing', technology: 'Deterministic cost heuristic', sourcePath: 'src/shared/render-queue.ts', sourceLine: 27,
    summary: '按 Draft/Balanced/Final 三档固定美元每秒费率估算镜头批次成本，并格式化为两位小数。', whenToUse: '视频 API 调用前做 UI 预算提示和本地 guard 初筛时。', parameters: [p('duration', 'number', true, '视频秒数。'), p('quality', 'Draft | Balanced | Final', true, '质量档位。')], returns: { type: 'string', description: '美元展示字符串，不含供应商账单或币种换算。' }, code: `estimateRenderCost(45, 'Balanced') // '$12.60'`, explanation: ['费率写死在客户端共享代码。', '不包含失败重试、图像、语音或存储成本。'], effectTitle: '预算在排队前可见', effectDescription: '高成本视频阶段可先和用户预算比较。', success: 'rough USD estimate', edge: 'not provider pricing', errors: [{ condition: '时长负数、费率变化或供应商按 token/分辨率计费', behavior: '估算与真实账单偏离。', recovery: '从版本化价格表计算并在完成后对账。' }], bestPractices: ['显示估算时间和价格版本。', '预算 guard 用数值不要解析字符串。', '把重试与失败成本计入上限。'], related: ['playlet-build-render-queue'], implementationStatus: 'fallback', statusNote: '固定费率仅用于原型估算，不是供应商实时定价。'
  }),
  entry({
    slug: 'playlet-build-render-queue', name: 'buildRenderQueueJobs', signature: 'buildRenderQueueJobs(snapshot) → RenderQueueJob[]', kind: 'function', module: 'background-jobs', technology: 'Pure derived queue + video guards', sourcePath: 'src/shared/render-queue.ts', sourceLine: 35,
    summary: '把草稿、资产、设置和分镜锁定纯函数式派生成视频/导出任务；配音、角色、首帧、锁镜、原生音频和其他 guard 任一失败都会阻断。', whenToUse: 'Main service 和浏览器 preview 需要从同一快照重建一致队列时。', parameters: [p('snapshot', 'RenderQueueSnapshot', true, 'drafts/assets/settings/storyboardState。')], returns: { type: 'RenderQueueJob[]', description: '每草稿至少一个视频任务；Ready 草稿额外一个导出任务。' }, code: `const jobs = buildRenderQueueJobs(snapshot)\nconst spendable = jobs.filter(j => j.status === 'queued')`, explanation: ['纯派生便于重放与测试。', '当前预算值未真正和 maxBudgetUsd 比较。'], effectTitle: '视频前置护栏集中执行', effectDescription: '资产和分镜不完整时不会显示为可渲染。', success: 'guard-aware derived jobs', edge: 'budget/concurrency/provider execution absent', errors: [{ condition: '同名项目资产串用、storyboardState 缺失或设置被关闭', behavior: '可能错误放行/阻断；预算 guard 名义存在但没有金额比较。', recovery: '使用 projectId、服务端验证设置并实现累计预算。' }], bestPractices: ['纯函数输入必须是不可变版本快照。', 'guard 结果包含 machine-readable code。', '付费执行前在 Main/Worker 再验证一次。'], related: ['playlet-build-storyboard-shots', 'playlet-has-ready-asset', 'playlet-ipc-render-list'], implementationStatus: 'fallback', statusNote: '只派生本地任务；没有 Worker、供应商调用、预算执行或真实进度。'
  }),
  entry({
    slug: 'playlet-is-ready-asset', name: 'isReadyAsset', signature: 'isReadyAsset(asset) → boolean', kind: 'function', module: 'workflows', technology: 'Asset guard predicate', sourcePath: 'src/shared/asset-guards.ts', sourceLine: 21,
    summary: '仅把 ready/locked 视为可供生产使用，missing/review 不得满足视频前置证据。', whenToUse: '任何 guard 需要判断单个资产是否可参与分镜或队列时。', parameters: [p('asset', 'ProductionAsset', true, '待判定资产。')], returns: { type: 'boolean', description: 'ready 或 locked 返回 true。' }, code: `if (!isReadyAsset(asset)) blockPaidGeneration()`, explanation: ['review 不等于批准。', 'locked 与 ready 当前都通过，语义差异由上层决定。'], effectTitle: '资产审批语义统一', effectDescription: '未审资产不会意外进入昂贵生成。', success: 'strict readiness boolean', edge: 'no evidence integrity check', errors: [{ condition: '状态伪造或资产文件已丢失', behavior: '仅看 status 会错误放行。', recovery: '同时验证文件存在、哈希、审批人和过期时间。' }], bestPractices: ['状态由可信 Main 更新。', '资产证据不可只由 Renderer 自报。', 'locked 资产变更需生成新版本。'], related: ['playlet-has-ready-asset', 'playlet-apply-asset-evidence']
  }),
  entry({
    slug: 'playlet-has-ready-asset', name: 'hasReadyAsset', signature: 'hasReadyAsset(assets, kind) → boolean', kind: 'function', module: 'workflows', technology: 'Asset guard collection predicate', sourcePath: 'src/shared/asset-guards.ts', sourceLine: 25,
    summary: '在项目资产集合中寻找指定 kind 且 ready/locked 的任一证据，供 voice/character/first-frame guard 使用。', whenToUse: '队列派生判断某类生产证据是否齐备时。', parameters: [p('assets', 'ProductionAsset[]', true, '已按项目过滤的资产。'), p('kind', 'AssetKind', true, 'voice、character、first-frame 或 scene。')], returns: { type: 'boolean', description: '存在至少一个就绪资产时 true。' }, code: `const hasVoice = hasReadyAsset(projectAssets, 'voice')`, explanation: ['调用者负责先按项目过滤。', '只要求一个资产，不能证明每个镜头都覆盖。'], effectTitle: '队列可快速检查证据类别', effectDescription: '缺类目时形成明确 guard issue。', success: 'category readiness', edge: 'not per-shot coverage', errors: [{ condition: '调用者传入跨项目数组或只需一张资产不足以覆盖全片', behavior: '可能错误放行。', recovery: '函数接收 projectId/shot requirements 并返回覆盖矩阵。' }], bestPractices: ['按镜头检查角色与首帧映射。', '返回证据 ID 便于追溯。', '不要仅返回 boolean 隐藏缺口。'], related: ['playlet-is-ready-asset', 'playlet-build-render-queue']
  }),
  entry({
    slug: 'playlet-apply-asset-evidence', name: 'applyAssetEvidenceToDrafts', signature: 'applyAssetEvidenceToDrafts(drafts, asset) → ProductionDraft[]', kind: 'function', module: 'workflows', technology: 'Immutable guard reconciliation', sourcePath: 'src/shared/asset-guards.ts', sourceLine: 33,
    summary: '就绪资产按 kind 映射到 draft guard key，更新匹配项目的 pass 标签、状态、进度和 nextAction；非就绪/场景证据不改草稿。', whenToUse: 'Asset Library 保存角色、首帧或配音证据后同步 Studio 草稿护栏时。', parameters: [p('drafts', 'ProductionDraft[]', true, '当前草稿数组。'), p('asset', 'ProductionAsset', true, '新建或升级的证据。')], returns: { type: 'ProductionDraft[]', description: '不可变更新后的数组；无匹配时等价副本/原对象。' }, code: `const nextDrafts = applyAssetEvidenceToDrafts(drafts, readyVoiceAsset)`, explanation: ['按 draft.title === asset.project 匹配。', '所有 blocked guard 清除后状态变 Ready。'], effectTitle: '资产证据反向推进生产', effectDescription: '补证据后草稿自动更新下一步和进度。', success: 'matching guard passes', edge: 'title-based identity', errors: [{ condition: '项目同名、asset 被降级或证据后来失效', behavior: '可能改错草稿；函数只会加 pass 不会撤销。', recovery: '用 projectId 并从全量资产重新计算 guard，而非单向 patch。' }], bestPractices: ['护栏状态应可重算。', '保存证据来源和审批人。', 'UI 更新后 Main 再验证。'], related: ['playlet-is-ready-asset', 'playlet-create-ready-evidence', 'playlet-build-render-queue']
  }),
  entry({
    slug: 'playlet-create-asset-evidence-seed', name: 'createAssetEvidenceSeed', signature: 'createAssetEvidenceSeed(project, issue?) → ProductionAsset', kind: 'function', module: 'workflows', technology: 'Guard repair routing', sourcePath: 'src/shared/asset-evidence.ts', sourceLine: 38,
    summary: '从 guard issue 文本推断 voice/first-frame/character/scene 类别，生成 review 状态的修复资产表单预填数据。', whenToUse: 'Render Queue 的 Fix Guard 跳转 Asset Library 并打开证据抽屉时。', parameters: [p('project', 'string', true, '项目标题。'), p('issue', 'string', false, '包含 voice/frame/character/reference 的 guard 文本。')], returns: { type: 'ProductionAsset', description: '带默认说明、ownerSkill、review 状态和时间的 seed。' }, code: `const seed = createAssetEvidenceSeed(job.project, job.guardIssues[0])`, explanation: ['文本匹配失败默认 scene。', '只是 UI seed，不是已验证证据。'], effectTitle: '阻断问题直达修复表单', effectDescription: '用户不必手工判断缺少哪类资产。', success: 'review evidence seed', edge: 'locale-sensitive text inference', errors: [{ condition: '中文 issue 或文案变化不含英文关键词', behavior: '误判为 scene。', recovery: 'guard issue 使用稳定 code 而非解析展示文本。' }], bestPractices: ['code 与 label 分离。', 'seed 永远从 review 开始。', '最终通过需要文件/时长证据验证。'], related: ['playlet-create-ready-evidence', 'playlet-apply-asset-evidence'], implementationStatus: 'best-effort', statusNote: '通过英文子串猜测问题类型，中文和文案变化会回退为 scene。'
  }),
  entry({
    slug: 'playlet-create-ready-evidence', name: 'createReadyAssetEvidenceForIssues', signature: 'createReadyAssetEvidenceForIssues(project, issues, durationSec) → ProductionAsset[]', kind: 'function', module: 'workflows', technology: 'Prototype bulk guard repair', sourcePath: 'src/shared/asset-evidence.ts', sourceLine: 51,
    summary: '去重 issue 推断出的资产类别，为非 scene 类别直接生成 ready 证据；voice 附带 durationSec。', whenToUse: '原型中的“一键解决当前资产护栏”演示，不应用于真实生产审批。', parameters: [p('project', 'string', true, '项目标题。'), p('issues', 'string[]', true, '当前 guard 文本。'), p('durationSec', 'number', true, 'voice 证据时长。')], returns: { type: 'ProductionAsset[]', description: '直接标为 ready 的 voice/character/first-frame 占位证据。' }, code: `const demoEvidence = createReadyAssetEvidenceForIssues(project, issues, duration)`, explanation: ['scene 类别被过滤。', '没有文件、哈希或人工审批。'], effectTitle: '原型可演示护栏解锁', effectDescription: '一次操作生成多个 ready 状态用于 UI 验证。', success: 'ready demo evidence', edge: 'unsafe for real paid generation', errors: [{ condition: '真实生产误用或 issue 解析错误', behavior: '没有证据也会放行付费任务。', recovery: '生产构建禁用此函数；ready 必须由 Main 校验文件与审批。' }], bestPractices: ['明确标记 demo-only。', '生产使用 upload→validate→review→lock 状态机。', 'voice 时长来自真实音频探测。'], related: ['playlet-create-asset-evidence-seed', 'playlet-apply-asset-evidence'], implementationStatus: 'fallback', statusNote: '直接创建 ready 原型证据，没有真实文件或审批，不能用于生产视频放行。'
  }),
  entry({
    slug: 'playlet-create-asset-service', name: 'createProductionAssetService', signature: 'createProductionAssetService(path) → { list, save }', kind: 'function', module: 'object-storage', technology: 'Node.js synchronous JSON persistence', sourcePath: 'src/main/services/production-assets.ts', sourceLine: 15,
    summary: '构造惰性单次读盘、内存缓存、整表 JSON 写入的资产仓储，目录不存在时递归创建。', whenToUse: 'Main 进程为 assets:list/save IPC 绑定 userData 路径时。', parameters: [p('path', 'string', true, 'production-assets.json 绝对路径。')], returns: { type: '{ list(fallback); save(nextAssets) }', description: '进程内缓存的资产仓储。' }, code: `const service = createProductionAssetService(assetPath)\nservice.save(nextAssets)`, explanation: ['同步 IO 会阻塞 Main。', '单进程小数据原型简单，但不具事务性。'], effectTitle: '资产状态本地落盘', effectDescription: 'Electron 重启后恢复护栏证据。', success: 'cached JSON repository', edge: 'non-atomic sync writes', errors: [{ condition: '磁盘满、崩溃中断或多窗口写竞争', behavior: 'Main 卡顿、抛错或文件截断/覆盖。', recovery: '异步原子写、备份、revision 与 SQLite 事务。' }], bestPractices: ['严格校验 JSON schema。', '损坏文件先隔离。', '媒体二进制不要进 JSON。'], related: ['playlet-ipc-assets-list', 'playlet-ipc-assets-save'], officialSources: [NODE_FS]
  }),
  entry({
    slug: 'playlet-create-draft-service', name: 'createProductionDraftService', signature: 'createProductionDraftService(path) → { list, save }', kind: 'function', module: 'object-storage', technology: 'Node.js synchronous JSON persistence', sourcePath: 'src/main/services/production-drafts.ts', sourceLine: 15,
    summary: '构造生产草稿 JSON 仓储，首次 list 才读盘，之后 list/save 共享内存快照。', whenToUse: 'Main 为 Studio 草稿 IPC 提供跨会话持久化时。', parameters: [p('path', 'string', true, 'production-drafts.json 路径。')], returns: { type: '{ list(fallback); save(nextDrafts) }', description: '草稿数组仓储。' }, code: `const service = createProductionDraftService(draftsPath)\nconst drafts = service.list(seed)`, explanation: ['顶层只验证 Array。', 'fallback 会在无有效文件时立即持久化。'], effectTitle: '草稿生产状态可恢复', effectDescription: 'Studio、分镜和队列共享持久化输入。', success: 'cached draft repository', edge: 'schema-less whole-file storage', errors: [{ condition: '旧 schema、并发覆盖或同步 IO 失败', behavior: '静默回 fallback、丢更新或 Main reject。', recovery: 'schema migration、原子写与 revision。' }], bestPractices: ['草稿数量增长后迁移 SQLite。', '为每次 AI 生成保存 provenance。', '不要静默覆盖损坏用户文件。'], related: ['playlet-ipc-drafts-list', 'playlet-ipc-drafts-save'], officialSources: [NODE_FS]
  }),
  entry({
    slug: 'playlet-create-settings-service', name: 'createRuntimeSettingsService', signature: 'createRuntimeSettingsService(path) → { get, save }', kind: 'function', module: 'object-storage', technology: 'Node.js synchronous JSON persistence', sourcePath: 'src/main/services/runtime-settings.ts', sourceLine: 15,
    summary: '持久化单个 RuntimeSettings 对象，惰性读取并在文件无效时保存安全 fallback。', whenToUse: 'Main 为模型、预算、并发、guard 和导出设置提供本地状态时。', parameters: [p('path', 'string', true, 'runtime-settings.json 路径。')], returns: { type: '{ get(fallback); save(settings) }', description: '运行设置仓储。' }, code: `const service = createRuntimeSettingsService(settingsPath)\nconst current = service.get(safeDefaults)`, explanation: ['只验证 parsed 是 object。', '安全性取决于 fallback 和上层校验。'], effectTitle: '视频策略持久化', effectDescription: '生产护栏和预算在重启后仍保持。', success: 'cached settings repository', edge: 'unvalidated security-sensitive fields', errors: [{ condition: 'guard 字段缺失/伪造或文件写失败', behavior: '可能错误放行任务或 reject。', recovery: '严格 schema、fail-closed default 和管理员审计。' }], bestPractices: ['凭据使用系统安全存储。', '安全开关缺失时默认 true。', '设置变更写审计。'], related: ['playlet-ipc-settings-get', 'playlet-ipc-settings-save'], officialSources: [NODE_FS]
  }),
  entry({
    slug: 'playlet-create-storyboard-service', name: 'createStoryboardStateService', signature: 'createStoryboardStateService(path) → { get, save }', kind: 'function', module: 'object-storage', technology: 'Node.js JSON persistence + structural guard', sourcePath: 'src/main/services/storyboard-state.ts', sourceLine: 17,
    summary: '持久化 lockedShotKeys 与 promptVersions，并在读取时最低限度验证数组和对象结构。', whenToUse: 'Main 需要让镜头锁定/prompt 版本影响后续队列 guard 时。', parameters: [p('path', 'string', true, 'storyboard-state.json 路径。')], returns: { type: '{ get(fallback); save(state) }', description: '分镜状态仓储。' }, code: `const service = createStoryboardStateService(statePath)\nservice.save(nextState)`, explanation: ['结构校验比直接断言更安全。', '仍未校验 shot key 和 version 数值。'], effectTitle: '分镜决策可重放', effectDescription: '队列可从持久化锁定状态重建。', success: 'storyboard state repository', edge: 'partial validation only', errors: [{ condition: '旧 key、负版本或整表写中断', behavior: '可能产生错误锁定或文件损坏。', recovery: '绑定 draft revision、Zod 校验和原子写。' }], bestPractices: ['锁定记录关联 prompt/资产哈希。', '无效 key 主动清理。', '保存变更事件而非只存最终快照。'], related: ['playlet-ipc-storyboard-get', 'playlet-ipc-storyboard-save'], officialSources: [NODE_FS]
  }),
  entry({
    slug: 'playlet-render-service', name: 'createRenderQueueService', signature: 'createRenderQueueService(path) → { list, advance, pause, review, exportJob, compose }', kind: 'function', module: 'background-jobs', technology: 'Electron Main local queue state + JSON artifacts', sourcePath: 'src/main/services/render-queue.ts', sourceLine: 44,
    summary: '组合纯队列派生与本地 override 状态机，持久化进度/事件，并为审片后的任务写 export manifest 与 FFmpeg dry-run plan。', whenToUse: 'Main 进程统一处理 Render Queue 的读取、推进、暂停、审片、导出和合成预演 IPC 时。', parameters: [p('path', 'string', true, 'render-queue-state.json 路径。')], returns: { type: 'RenderQueueService', description: '六个同步方法组成的本地服务对象。' }, code: `const queue = createRenderQueueService(statePath)\nconst jobs = queue.review(key, 'approve', snapshot)`, explanation: ['override 只保存部分字段，基线每次从 snapshot 重建。', 'export/compose 只写 JSON；没有真实媒体进程。'], effectTitle: '原型队列端到端可操作', effectDescription: '工作台能演示护栏、审片、清单与合成计划。', success: 'persisted local state and artifacts', edge: 'not a production job runner', errors: [{ condition: '进程崩溃、并发调用、snapshot 漂移或外部供应商状态变化', behavior: 'override 可能丢失、覆盖或与真实任务不一致。', recovery: '使用 SQLite 事务、Worker lease、幂等键和供应商 reconciliation。' }], bestPractices: ['所有付费副作用由 Main/Worker 二次验证 guard。', '状态转换与事件原子提交。', '真实 FFmpeg 用受控参数 spawn。', '保留 provider job id 和账单。'], related: ['playlet-build-render-queue', 'playlet-ipc-render-advance', 'playlet-ipc-render-review', 'playlet-ipc-render-compose'], officialSources: [NODE_FS, FFMPEG], implementationStatus: 'defined-only', statusNote: '完整的是本地原型状态流；视频 API、Worker、FFmpeg 执行和供应商恢复均未实现。'
  })
]

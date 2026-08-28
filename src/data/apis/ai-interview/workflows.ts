import { AI_INTERVIEW_COMMIT } from '../helpers'
import type { ApiEntry } from '../types'

export const workflowApis: ApiEntry[] = [
  {
    slug: 'create-resume-parse-workflow', name: 'createResumeParseWorkflow', signature: 'createResumeParseWorkflow(deps: ResumeParseWorkflowDeps): Workflow', kind: 'workflow',
    project: 'ai-interview', module: 'workflows', technology: 'Mastra Core 1.47.0 Workflows', verifiedCommit: AI_INTERVIEW_COMMIT,
    summary: '用四个强类型步骤串联文件哈希、文本提取、结构化生成和安全预览，并把外部依赖全部注入。', whenToUse: '需要可测试、可观测、可复用的简历解析编排，而不是在路由里堆叠异步调用时。',
    sourcePath: 'apps/ai-recruitment-copilot-backend/src/server/agents/mastra/workflows/resume-parse-workflow.ts', sourceLine: 91,
    parameters: [{ name: 'deps.extractText', type: 'extractResumeDocumentText', required: true, description: 'Office/PDF/图片文本提取边界。' }, { name: 'deps.hashBytes', type: 'sha256HexOfBytes', required: true, description: '内容寻址与缓存键。' }, { name: 'deps.structureText', type: 'generateResumeStructured', required: true, description: 'LLM 结构化生成边界。' }],
    returns: { type: 'CommittedWorkflow', description: '输入/步骤/输出都经 Zod 校验的四步工作流。' },
    example: { language: 'ts', code: `const workflow = createResumeParseWorkflow(deps)\nconst run = await workflow.createRun()\nconst result = await run.start({ inputData: { bytesBase64, fileName } })`, explanation: ['每一步输出成为下一步输入，schema 防止隐式契约漂移。', '测试可替换 OCR、哈希和模型，不需要网络。'] },
    effect: { title: '解析进度时间线', description: '用户能看到任务从上传到结构化预览的真实阶段。', metrics: [{ label: '步骤', value: '4' }, { label: 'schema', value: '5 层' }, { label: '副作用注入', value: '100%' }], output: [{ label: 'hash-resume', value: 'completed', tone: 'good' }, { label: 'extract-resume-text', value: 'completed · qwen-ocr', tone: 'good' }, { label: 'structure-resume', value: 'running', tone: 'neutral' }] },
    errors: [{ condition: '任一步骤失败', behavior: 'run.status=failed 并保留 error。', recovery: '按 stepId 展示失败并从幂等边界重试。' }, { condition: '输出不满足 schema', behavior: '解析失败，不返回半结构化结果。', recovery: '记录模型与 schema 版本，使用修复提示或降级。' }],
    bestPractices: ['步骤围绕可恢复边界拆分，而不是追求数量。', '大文件不应长期以 base64 存储在工作流状态中；生产可改对象存储引用。', '所有进度事件带 runId/traceId。'],
    tests: [{ path: 'apps/ai-recruitment-copilot-backend/src/server/agents/mastra/__tests__/resume-parse-workflow.test.ts', proves: '步骤顺序、成功输出、失败传播与依赖替换。' }], officialSources: [{ label: 'Mastra Workflows', url: 'https://mastra.ai/docs/workflows/overview' }], related: ['create-ai-run-event-stream', 'qwen-vl-ocr'],
  },
  {
    slug: 'create-ai-run-event-stream', name: 'createAiRunEventStream', signature: 'createAiRunEventStream(options): ReadableStream<Uint8Array>', kind: 'function',
    project: 'ai-interview', module: 'workflows', technology: 'Web Streams + SSE', verifiedCommit: AI_INTERVIEW_COMMIT,
    summary: '把长任务包装为统一 run.started / heartbeat / step / completed / failed 事件流，并保证只发送一个终态。', whenToUse: '浏览器需要实时展示 OCR、工作流、批处理或报告生成进度时。',
    sourcePath: 'apps/ai-recruitment-copilot-backend/src/server/agents/mastra/adapters/ai-run-stream.ts', sourceLine: 124,
    parameters: [{ name: 'run', type: '(emit) => Promise<unknown>', required: true, description: '通过 emit 推送业务进度的异步任务。' }, { name: 'runId', type: 'string', required: true, description: '一次执行的稳定 ID。' }, { name: 'title', type: 'string', required: true, description: '用户可读任务名。' }, { name: 'heartbeatIntervalMs', type: 'number', required: false, defaultValue: '10000', description: '空闲心跳周期。' }, { name: 'traceId', type: 'string', required: false, description: '跨服务追踪 ID。' }],
    returns: { type: 'ReadableStream<Uint8Array>', description: '每条为 data: JSON\\n\\n 编码的 AiRunEvent。' },
    example: { language: 'ts', code: `return new Response(createAiRunEventStream({\n  runId, title: '解析简历',\n  run: (emit) => streamResumeParseWorkflow(input, { onWorkflowEvent: emit }),\n}), { headers: streamHeaders })`, explanation: ['启动事件在执行任务前发送。', '任务已主动发送终态时，包装器不会重复 completed。'] },
    effect: { title: '不中断的任务反馈', description: '代理层不缓存 SSE，用户能看到步骤与心跳。', metrics: [{ label: '心跳', value: '10s' }, { label: '终态', value: '恰好 1 个' }, { label: '编码', value: 'UTF-8 SSE' }], output: [{ label: '0.00s', value: 'run.started', tone: 'neutral' }, { label: '1.42s', value: 'step.completed', tone: 'good' }, { label: '10.00s', value: 'run.heartbeat', tone: 'neutral' }] },
    errors: [{ condition: 'run 抛错', behavior: '转换为 run.failed 后正常关闭流。', recovery: '客户端按 runId 保留进度并显示可重试动作。' }, { condition: '连接被反向代理缓存', behavior: '用户直到结束才看到事件。', recovery: '设置 no-cache、chunked、X-Accel-Buffering:no。' }],
    bestPractices: ['终态必须幂等且唯一。', '错误事件公开安全 message，详细错误留服务端 trace。', '客户端以事件 type 建状态机，不解析文案。'],
    tests: [{ path: 'apps/ai-recruitment-copilot-backend/src/server/agents/mastra/__tests__/ai-run-stream.test.ts', proves: '事件映射、心跳、失败与单终态保证。' }], officialSources: [{ label: 'WHATWG Streams', url: 'https://streams.spec.whatwg.org/' }, { label: 'MDN Server-sent events', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events' }], related: ['create-resume-parse-workflow', 'post-resume-chat'],
  },
  {
    slug: 'qwen-vl-ocr', name: 'qwenVlOcr', signature: 'qwenVlOcr(imageBytes: Buffer, mediaType?: string): Promise<string>', kind: 'function',
    project: 'ai-interview', module: 'resume-parsing', technology: 'OpenAI SDK 6 + Qwen-VL', verifiedCommit: AI_INTERVIEW_COMMIT,
    summary: '把一页图片以 data URL 发送给 Qwen-VL，使用约束提示只返回原文，实现 PDF/图片简历 OCR 兜底。', whenToUse: 'PDF 页面栅格化后，或输入本身是图片且无法直接提取文本时。',
    sourcePath: 'apps/ai-recruitment-copilot-backend/src/lib/server/qwen-ocr.ts', sourceLine: 31,
    parameters: [{ name: 'imageBytes', type: 'Buffer', required: true, description: '单页图片字节。' }, { name: 'mediaType', type: 'string', required: false, defaultValue: 'image/png', description: 'data URL 媒体类型。' }],
    returns: { type: 'Promise<string>', description: '模型返回的 OCR 纯文本；choices 为空时当前实现返回空字符串，由外层管线判定可用性。' },
    example: { language: 'ts', code: `const pages = await rasterizePdf(pdfBytes)\nconst text = (await pMap(pages, page =>\n  qwenVlOcr(page.bytes, 'image/png'), { concurrency: 1 }\n)).join('\\n\\n')`, explanation: ['PDF 先逐页栅格化，页面顺序不变。', '调用链外层对瞬态错误最多重试 3 次。'] },
    effect: { title: '扫描件恢复为可检索文本', description: '页面级结果可记录耗时和字符数，不记录隐私正文。', metrics: [{ label: '默认并发', value: '1' }, { label: '默认尝试', value: '3' }, { label: '文本预览日志', value: '≤300 字符 · dev-only' }], output: [{ label: 'page 1', value: '1,428 chars · success', tone: 'good' }, { label: 'page 2', value: 'retry 1/3 → success', tone: 'warn' }] },
    errors: [{ condition: 'ALIBABA_API_KEY / OCR base URL / model 缺失', behavior: 'getClient 或 getRequiredEnv 抛出配置错误。', recovery: '启动自检；可提取文本的 Office 文件走本地路径。' }, { condition: '模型返回空内容', behavior: 'qwenVlOcr 返回空字符串，外层抽取管线负责判定。', recovery: '外层按页重试；超过上限标记解析失败。' }],
    bestPractices: ['逐页重试，不重复处理已成功页面。', '限制页数、分辨率、文件大小与并发。', 'OCR 文本进入结构化模型前做长度裁剪与来源标记。'],
    tests: [{ path: 'apps/ai-recruitment-copilot-backend/src/lib/server/__tests__/resume-parse-pipeline.test.ts', proves: 'PDF/图片 OCR、重试、进度与 Office 降级路径。' }], officialSources: [{ label: 'OpenAI SDK vision input', url: 'https://github.com/openai/openai-node' }, { label: 'Qwen vision models', url: 'https://help.aliyun.com/zh/model-studio/vision' }], related: ['create-resume-parse-workflow', 'post-interview-parse-resume'],
  },
]

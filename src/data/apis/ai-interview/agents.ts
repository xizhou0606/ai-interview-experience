import { AI_INTERVIEW_COMMIT } from '../helpers'
import type { ApiEntry } from '../types'

export const agentApis: ApiEntry[] = [
  {
    slug: 'search-resume-records-for-copilot', name: 'searchResumeRecordsForCopilot', signature: 'searchResumeRecordsForCopilot(input, deps?): Promise<SearchResumeRecordsOutput>', kind: 'function',
    project: 'ai-interview', module: 'agent-tools', technology: 'Mastra Tool + Zod + hybrid retrieval', verifiedCommit: AI_INTERVIEW_COMMIT,
    summary: '把结构化简历查询与 Qdrant 语义召回合并为候选人卡片、引用和明确 retrievalMode。', whenToUse: '招聘 Copilot 回答“找三位有 RAG 经验的候选人”一类需要权限、筛选与语义召回的查询时。',
    sourcePath: 'apps/ai-recruitment-copilot-backend/src/server/agents/mastra/tools/recruiting-copilot.ts', sourceLine: 244,
    parameters: [{ name: 'organizationId', type: 'string', required: true, description: '组织租户边界。' }, { name: 'visibilityScope', type: 'RecruitingVisibilityScope', required: true, description: '用户可见候选人范围。' }, { name: 'query', type: 'string', required: false, description: '最长 120 字符的语义/文本查询。' }, { name: 'skills', type: 'string[]', required: false, description: '最多 20 个结构化技能过滤。' }, { name: 'limit', type: '1..10', required: false, defaultValue: '5', description: '返回卡片上限。' }],
    returns: { type: 'SearchResumeRecordsOutput', description: '候选人卡片、去重引用、总数、语义命中数与 combined/semantic/structured/structured_text 模式。' },
    example: { language: 'ts', code: `const result = await searchResumeRecordsForCopilot({\n  organizationId, visibilityScope, query: 'RAG 和向量检索',\n  skills: ['TypeScript'], limit: 5,\n})`, explanation: ['关系库按更新时间提供稳定的结构化结果。', '存在 query 时并行/补充语义卡片，按 candidate id 去重。'] },
    effect: { title: '带引用的混合候选人检索', description: 'Agent 不只输出自然语言，还返回可点击卡片与数据来源。', metrics: [{ label: '结果上限', value: '10' }, { label: '检索模式', value: '4 种' }, { label: '越权结果', value: '0' }], output: [{ label: 'retrievalMode', value: 'combined', tone: 'good' }, { label: 'semanticHitCount', value: '3', tone: 'neutral' }, { label: 'citations', value: '3 unique records', tone: 'good' }] },
    errors: [{ condition: '输入超限', behavior: 'Zod parse 抛出校验错误。', recovery: 'Agent 缩短 query/skills/limit 后重试。' }, { condition: 'Qdrant 不可用', behavior: '语义依赖降级为空，结构化检索继续。', recovery: '返回 structured_text/structured 并记录告警。' }],
    bestPractices: ['所有检索都同时传 organizationId 与 visibilityScope。', '返回结构化引用，禁止模型编造候选人。', '召回与展示分开：先取 ID，再从授权 DAO 加载卡片。'],
    tests: [{ path: 'apps/ai-recruitment-copilot-backend/src/server/agents/mastra/__tests__/recruiting-copilot-tools.test.ts', proves: '输入上限、混合结果、引用、权限与降级。' }], officialSources: [{ label: 'Mastra Tools', url: 'https://mastra.ai/docs/agents/using-tools' }, { label: 'Qdrant filtering', url: 'https://qdrant.tech/documentation/search/filtering/' }], related: ['post-resume-chat', 'find-semantic-resume-duplicates'],
  },
  {
    slug: 'create-interview-report-workflow', name: 'createInterviewReportWorkflow', signature: 'createInterviewReportWorkflow(deps): Workflow', kind: 'workflow',
    project: 'ai-interview', module: 'workflows', technology: 'Mastra Core 1.47.0 Workflows', verifiedCommit: AI_INTERVIEW_COMMIT,
    summary: '并行生成面试摘要与结构化评估，各分支独立捕获失败，最后合成为允许部分成功的报告。', whenToUse: '面试结束后从逐字稿和题目生成报告，且不希望一个模型分支失败导致整份报告丢失时。',
    sourcePath: 'apps/ai-recruitment-copilot-backend/src/server/agents/mastra/workflows/interview-report-workflow.ts', sourceLine: 66,
    parameters: [{ name: 'deps.generateSummary', type: 'async function', required: true, description: '生成面试摘要。' }, { name: 'deps.generateEvaluation', type: 'async function', required: true, description: '生成证据化结构评估。' }, { name: 'deps.composeReport', type: 'function', required: true, description: '确定性合成与缺口标注。' }],
    returns: { type: 'Committed Workflow<InterviewReportWorkflowOutput>', description: '摘要、评估、合成报告与分支错误状态。' },
    example: { language: 'ts', code: `const workflow = createInterviewReportWorkflow(deps)\nconst run = await workflow.createRun()\nconst result = await run.start({ inputData: { transcript, questions } })`, explanation: ['summary 与 evaluation 使用 .parallel() 降低总耗时。', '分支返回 discriminated union，而不是直接让工作流整体失败。'] },
    effect: { title: '可部分成功的面试报告', description: '摘要失败时仍可交付评估，并明确显示缺失部分。', metrics: [{ label: '并行分支', value: '2' }, { label: '部分成功', value: '支持' }, { label: '证据定位', value: 'turn-level' }], output: [{ label: 'summary', value: 'failed · retryable', tone: 'warn' }, { label: 'evaluation', value: 'completed', tone: 'good' }, { label: 'report', value: 'partial · gap disclosed', tone: 'neutral' }] },
    errors: [{ condition: '单个生成分支失败', behavior: '该分支转为 rejected 结果，另一分支继续。', recovery: '报告标记缺口并允许单分支重试。' }, { condition: '工作流状态 failed', behavior: 'runner 抛 result.error。', recovery: '按 runId/traceId 恢复或重新执行。' }],
    bestPractices: ['并行只用于互不依赖的步骤。', '模型结论必须绑定逐字稿证据。', '部分成功必须对用户可见，不能悄悄补空字符串。'],
    tests: [{ path: 'apps/ai-recruitment-copilot-backend/src/server/agents/mastra/__tests__/interview-report-workflow.test.ts', proves: '并行、成功、单分支失败与报告合成。' }], officialSources: [{ label: 'Mastra workflow control flow', url: 'https://mastra.ai/docs/workflows/control-flow' }], related: ['create-ai-run-event-stream', 'get-mastra-model-config'],
  },
]

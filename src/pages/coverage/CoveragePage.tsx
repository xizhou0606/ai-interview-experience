import { AlertTriangle, ArrowRight, BadgeCheck, Database, FileCode2, GitCommitHorizontal, Route } from 'lucide-react'
import { navigateTo } from '../../app/router'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { aiInterviewInventory, apiEntries } from '../../data/apis'

const projectScopes = [
  ['ai-interview', 'AI/HTTP 全量：216/216 显式端点'],
  ['ai-pm', 'AI SDK、Mastra、RAG 与业务工具'],
  ['ai-robot', 'MCP、nanobot、飞书与人工确认'],
  ['ai-playlet', 'Electron IPC 与多媒体生成边界'],
  ['one-2-all', 'FastAPI 与 LangGraph 编排内核'],
  ['resume', 'LangChain 简历 Agent 与流式接口'],
  ['monitoring', '遥测、源码还原与 Qwen 诊断'],
  ['douyin-ai-growth', 'Qwen 结构化生成与模拟发布边界'],
  ['anime-armory', '多模态 Skills、模型路由与质量闸门'],
  ['unified-auth-sdk', '直接 AI 能力 0；审计认证安全底座'],
] as const

export function CoveragePage() {
  const inventory = aiInterviewInventory
  const maxEndpoints = Math.max(...inventory.endpoints.map((item) => item.count))
  const projectCoverage = projectScopes.map(([project, scope]) => {
    const entries = apiEntries.filter((entry) => entry.project === project)
    return { project, scope, count: entries.length, commit: entries[0]?.verifiedCommit ?? '待集成', kinds: [...new Set(entries.map((entry) => entry.kind))].join(' · ') }
  })
  return (
    <DocsShell active="coverage">
      <PageIntro kicker="SOURCE COVERAGE" title="覆盖率必须经得起源码反查" description="这里同时展示 10 个源码仓库的固定 commit 审计与八维 API 精讲。没有直接 AI 能力的仓库会如实标注，不把依赖安装或代码存在误写成生产能力。" stats={[[String(projectCoverage.length), '源码仓库'], [String(inventory.totals.httpEndpoints), 'ai-interview 端点'], [`${apiEntries.length}`, '完整 API 详情']]} />
      <div className="coverage-section-head"><div><span className="section-kicker">REPOSITORY MATRIX</span><h2>10 仓库固定快照</h2></div><p>数量是已通过八维内容门禁的详情，不是仅扫到的函数名。</p></div>
      <section className="project-coverage-table"><div className="project-coverage-row project-coverage-head"><span>仓库</span><span>固定 commit</span><span>完整详情</span><span>审计范围</span></div>{projectCoverage.map((item) => <div className="project-coverage-row" key={item.project}><strong>{item.project}</strong><code>{item.commit.slice(0, 12)}</code><span><b>{item.count}</b><small>{item.kinds || '无直接 API'}</small></span><p>{item.scope}</p></div>)}</section>
      <div className="coverage-section-head"><div><span className="section-kicker">DEEP BASELINE</span><h2>ai-interview 全量基线</h2></div><p>该仓库额外建立了 HTTP 端点清单与数据表分母。</p></div>
      <section className="coverage-baseline"><div><GitCommitHorizontal size={18} /><span>审计基线</span><strong>{inventory.branch} · {inventory.commit.slice(0, 12)}</strong><small>{inventory.verifiedAt}</small></div><div><FileCode2 size={18} /><span>Git 跟踪文件</span><strong>{inventory.totals.trackedFiles.toLocaleString()}</strong><small>当前 main</small></div><div><Route size={18} /><span>显式 Hono 端点</span><strong>{inventory.totals.httpEndpoints}</strong><small>动态端点另计</small></div><div><Database size={18} /><span>pgTable</span><strong>{inventory.totals.databaseTables}</strong><small>字段级审计待展开</small></div></section>
      <div className="coverage-section-head"><div><span className="section-kicker">HTTP INVENTORY</span><h2>端点分布</h2></div><p>分母来自 route 源码中的显式 HTTP handler。</p></div>
      <section className="endpoint-bars">{inventory.endpoints.map((item) => <div key={item.group}><span>{item.group}</span><div><i style={{ width: `${(item.count / maxEndpoints) * 100}%` }} /></div><strong>{item.count}</strong></div>)}</section>
      <div className="coverage-section-head"><div><span className="section-kicker">LOCKED VERSIONS</span><h2>核心技术栈</h2></div><p>版本取 lockfile，不取漂移的本地 node_modules。</p></div>
      <section className="stack-inventory"><div className="stack-row stack-head"><span>技术</span><span>锁定版本</span><span>项目职责</span></div>{inventory.stacks.map(([name, version, role]) => <div className="stack-row" key={name}><strong>{name}</strong><code>{version}</code><span>{role}</span></div>)}</section>
      <div className="coverage-section-head"><div><span className="section-kicker">UPGRADE RADAR</span><h2>版本差异与教学分支</h2></div><p>示例默认与仓库一致；新主版本只作为显式迁移路径。</p></div>
      <section className="upgrade-radar"><div className="upgrade-row upgrade-head"><span>技术</span><span>仓库版本</span><span>同系列 / 最新</span><span>采用策略</span></div>{inventory.upgradeRadar.map((item) => <div className="upgrade-row" key={item.name}><strong>{item.name}</strong><code>{item.repository}</code><span>{item.sameSeries} / {item.latest}</span><p>{item.strategy}</p></div>)}</section>
      <div className="coverage-section-head"><div><span className="section-kicker">DOCUMENTATION GATE</span><h2>项目实现 API 完成门禁</h2></div><button onClick={() => navigateTo('#project-apis')}>查看实现证据 <ArrowRight size={14} /></button></div>
      <section className="quality-gates">{['定义与签名', '参数', '返回值', '可运行案例', '可见效果', '错误恢复', '测试证据', '源码证据'].map((item) => <div key={item}><BadgeCheck size={15} /><span>{item}</span><strong>{apiEntries.length}/{apiEntries.length}</strong></div>)}</section>
      <section className="coverage-caveats"><h3><AlertTriangle size={17} />审计边界与已知缺口</h3>{inventory.caveats.map((item) => <p key={item}>{item}</p>)}</section>
    </DocsShell>
  )
}

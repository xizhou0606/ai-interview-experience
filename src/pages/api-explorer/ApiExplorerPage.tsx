import { ListTree, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { navigateTo } from '../../app/router'
import { apiEntries, apiModules, apiTechnologyStacks, getApiTechnologyStack } from '../../data/apis'
import { ApiCard } from './components/ApiCard/ApiCard'
import { CoveragePanel } from './components/CoveragePanel/CoveragePanel'
import { TechnologyStackPicker } from './components/TechnologyStackPicker/TechnologyStackPicker'

function readQuery() {
  const query = window.location.hash.split('?')[1] ?? ''
  const params = new URLSearchParams(query)
  return { search: params.get('q') ?? '', stack: params.get('stack') ?? 'all', module: params.get('module') ?? 'all', kind: params.get('kind') ?? 'all', status: params.get('status') ?? 'all' }
}

const PAGE_SIZE = 24

export function ApiExplorerPage() {
  const initial = readQuery()
  const [search, setSearch] = useState(initial.search)
  const [stack, setStack] = useState(initial.stack)
  const [module, setModule] = useState(initial.module)
  const [kind, setKind] = useState(initial.kind)
  const [status, setStatus] = useState(initial.status)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const syncFromHash = () => {
      if (!window.location.hash.startsWith('#project-apis')) return
      const next = readQuery()
      setSearch(next.search)
      setStack(next.stack)
      setModule(next.module)
      setKind(next.kind)
      setStatus(next.status)
      setPage(1)
    }
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  const kinds = [...new Set(apiEntries.map((entry) => entry.kind))]
  const projects = [...new Set(apiEntries.map((entry) => entry.project))]
  const modules = apiModules.filter((item) => stack === 'all' || apiEntries.some((entry) => entry.module === item.slug && getApiTechnologyStack(entry).slug === stack))
  const visible = useMemo(() => apiEntries.filter((entry) => {
    const technologyStack = getApiTechnologyStack(entry)
    const haystack = `${technologyStack.name} ${entry.name} ${entry.signature} ${entry.summary} ${entry.technology} ${entry.project} ${entry.parameters.map((item) => `${item.name} ${item.description}`).join(' ')}`.toLowerCase()
    const entryStatus = entry.implementationStatus ?? 'production'
    return (stack === 'all' || technologyStack.slug === stack) && (module === 'all' || entry.module === module) && (kind === 'all' || entry.kind === kind) && (status === 'all' || entryStatus === status) && haystack.includes(search.trim().toLowerCase())
  }).sort((left, right) => {
    const leftStack = getApiTechnologyStack(left)
    const rightStack = getApiTechnologyStack(right)
    return leftStack.learningOrder - rightStack.learningOrder || (apiModules.find((item) => item.slug === left.module)?.learningOrder ?? 99) - (apiModules.find((item) => item.slug === right.module)?.learningOrder ?? 99) || left.name.localeCompare(right.name)
  }), [kind, module, search, stack, status])
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paginated = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const reset = () => { setSearch(''); setStack('all'); setModule('all'); setKind('all'); setStatus('all'); setPage(1); window.history.replaceState(null, '', '#project-apis') }
  const remember = (next: { search?: string; stack?: string; module?: string; kind?: string; status?: string }) => {
    const params = new URLSearchParams()
    const values = { search, stack, module, kind, status, ...next }
    if (values.search) params.set('q', values.search)
    if (values.stack !== 'all') params.set('stack', values.stack)
    if (values.module !== 'all') params.set('module', values.module)
    if (values.kind !== 'all') params.set('kind', values.kind)
    if (values.status !== 'all') params.set('status', values.status)
    window.history.replaceState(null, '', `#project-apis${params.size ? `?${params}` : ''}`)
  }
  return (
    <DocsShell active="project-apis">
      <PageIntro kicker="PROJECT IMPLEMENTATION EVIDENCE" title="项目实现 API：验证框架如何真正落地" description="这里收录源码中的封装函数、业务端点和运行时调用链，只用于补充框架官方 API 的真实实现、测试与固定 commit 证据，不作为主学习目录。" stats={[[String(apiTechnologyStacks.length), '关联技术栈'], [String(apiEntries.length), '项目实现详解'], [String(projects.length), '源码案例库']]} />
      <CoveragePanel entries={apiEntries} />
      <button className="endpoint-catalog-cta" onClick={() => navigateTo('#endpoints')}><ListTree size={17} /><span><strong>查看完整 HTTP 端点分母</strong><small>从 216 条显式 Hono 路由反查方法、权限、请求与响应</small></span></button>
      <TechnologyStackPicker entries={apiEntries} value={stack} onChange={(nextStack) => { setStack(nextStack); setModule('all'); setPage(1); remember({ stack: nextStack, module: 'all' }) }} />
      <section className="api-filter-panel">
        <div className="api-search-box"><Search size={17} /><input name="api-search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); remember({ search: event.target.value }) }} placeholder="搜索 API、签名、参数或技术…" /></div>
        <label><span><SlidersHorizontal size={14} />能力模块</span><select name="api-module" value={module} onChange={(event) => { setModule(event.target.value); setPage(1); remember({ module: event.target.value }) }}><option value="all">全部能力模块</option>{modules.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
        <label><span>类型</span><select name="api-kind" value={kind} onChange={(event) => { setKind(event.target.value); setPage(1); remember({ kind: event.target.value }) }}><option value="all">全部类型</option>{kinds.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label><span>实现状态</span><select name="api-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); remember({ status: event.target.value }) }}><option value="all">全部状态</option><option value="production">生产链路</option><option value="defined-only">已定义未接线</option><option value="fallback">备用实现</option><option value="best-effort">尽力执行</option></select></label>
        <button onClick={reset}><RotateCcw size={14} />重置</button>
      </section>
      <div className="api-results-head"><div><strong>{visible.length}</strong><span> 个 API</span>{stack !== 'all' && <small> · {apiTechnologyStacks.find((item) => item.slug === stack)?.name}</small>}</div><p>第 {safePage} / {pageCount} 页 · 按技术栈学习，项目仅作为源码证据。</p></div>
      {visible.length > 0 ? <><div className="api-grid">{paginated.map((api) => <ApiCard key={api.slug} api={api} />)}</div>{visible.length > PAGE_SIZE && <nav className="catalog-pagination" aria-label="API 图谱分页"><button disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>上一页</button><span>显示 {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, visible.length)} / {visible.length}</span><button disabled={safePage === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>下一页</button></nav>}</> : <div className="api-empty"><strong>没有匹配项</strong><p>尝试清空搜索或减少筛选条件。</p><button className="button button-primary" onClick={reset}>重置全部筛选</button></div>}
    </DocsShell>
  )
}

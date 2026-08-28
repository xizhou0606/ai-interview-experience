import { ArrowRight, BadgeCheck, FileCode2, RotateCcw, Search, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { navigateTo } from '../../app/router'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { apiEntries } from '../../data/apis'
import { AI_INTERVIEW_COMMIT, AI_INTERVIEW_REPO } from '../../data/apis/helpers'
import { httpEndpoints } from '../../data/endpoints'

function readQuery() {
  const params = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
  return { search: params.get('q') ?? '', method: params.get('method') ?? 'all', group: params.get('group') ?? 'all', transport: params.get('transport') ?? 'all' }
}

const PAGE_SIZE = 30
function endpointKey(value: string) {
  const match = value.match(/(GET|POST|PATCH|DELETE|PUT)\s+(\/api\/\S+)/)
  return match ? `${match[1]} ${match[2].split('?')[0]}` : undefined
}

const deepApiByEndpoint = new Map(
  apiEntries
    .filter((entry) => entry.kind === 'http')
    .flatMap((entry) => [endpointKey(entry.name), endpointKey(entry.signature)]
      .filter((key): key is string => Boolean(key))
      .map((key) => [key, entry] as const)),
)

function deepApi(method: string, path: string) {
  return deepApiByEndpoint.get(`${method} ${path}`)
}

export function EndpointExplorerPage() {
  const initial = readQuery()
  const [search, setSearch] = useState(initial.search)
  const [method, setMethod] = useState(initial.method)
  const [group, setGroup] = useState(initial.group)
  const [transport, setTransport] = useState(initial.transport)
  const [page, setPage] = useState(1)
  const methods = [...new Set(httpEndpoints.map((item) => item.method))]
  const groups = [...new Set(httpEndpoints.map((item) => item.group))]
  const transports = [...new Set(httpEndpoints.map((item) => item.transport).filter(Boolean))]
  const deepCount = httpEndpoints.filter((item) => deepApi(item.method, item.path) || item.deepApiSlug).length
  const visible = useMemo(() => httpEndpoints.filter((item) => {
    const haystack = `${item.method} ${item.path} ${item.group} ${item.summary} ${item.auth.join(' ')} ${item.permission ?? ''}`.toLowerCase()
    return (method === 'all' || item.method === method) && (group === 'all' || item.group === group) && (transport === 'all' || item.transport === transport) && haystack.includes(search.trim().toLowerCase())
  }), [group, method, search, transport])
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paginated = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const remember = (next: { search?: string; method?: string; group?: string; transport?: string }) => {
    const values = { search, method, group, transport, ...next }
    const params = new URLSearchParams()
    if (values.search) params.set('q', values.search)
    if (values.method !== 'all') params.set('method', values.method)
    if (values.group !== 'all') params.set('group', values.group)
    if (values.transport !== 'all') params.set('transport', values.transport)
    window.history.replaceState(null, '', `#endpoints${params.size ? `?${params}` : ''}`)
  }
  const reset = () => { setSearch(''); setMethod('all'); setGroup('all'); setTransport('all'); setPage(1); window.history.replaceState(null, '', '#endpoints') }
  return (
    <DocsShell active="endpoints">
      <PageIntro kicker="HTTP INVENTORY" title="216 个端点，一条不藏" description="这里先给出完整路由分母，再逐条升级为八维精讲。路径、方法、权限、请求、响应、测试与固定 commit 可以交叉检索；未精讲的端点不会伪装成已完成。" stats={[[String(httpEndpoints.length), '已编目端点'], [String(deepCount), '已完成精讲'], [String(apiEntries.filter((item) => item.kind === 'http').length), '深度 HTTP 案例']]} />
      <section className="endpoint-trust-strip"><div><FileCode2 size={17} /><span>审计基线</span><strong>{AI_INTERVIEW_COMMIT}</strong></div><div><ShieldCheck size={17} /><span>分母</span><strong>显式 Hono handler</strong></div><div><BadgeCheck size={17} /><span>完成定义</span><strong>八维内容门禁</strong></div></section>
      <section className="api-filter-panel endpoint-filter-panel">
        <div className="api-search-box"><Search size={17} /><input name="endpoint-search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); remember({ search: event.target.value }) }} placeholder="搜索路径、权限、模块或用途…" /></div>
        <label><span>方法</span><select name="endpoint-method" value={method} onChange={(event) => { setMethod(event.target.value); setPage(1); remember({ method: event.target.value }) }}><option value="all">全部方法</option>{methods.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label><span>路由组</span><select name="endpoint-group" value={group} onChange={(event) => { setGroup(event.target.value); setPage(1); remember({ group: event.target.value }) }}><option value="all">全部路由组</option>{groups.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label><span>响应</span><select name="endpoint-transport" value={transport} onChange={(event) => { setTransport(event.target.value); setPage(1); remember({ transport: event.target.value }) }}><option value="all">全部响应</option>{transports.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <button onClick={reset}><RotateCcw size={14} />重置</button>
      </section>
      <div className="api-results-head"><div><strong>{visible.length}</strong><span> 个端点</span></div><p>第 {safePage} / {pageCount} 页 · 每页最多 {PAGE_SIZE} 条，精讲入口与源码入口分开标注。</p></div>
      <section className="endpoint-list">
        {paginated.map((item) => {
          const api = deepApi(item.method, item.path)
          const apiSlug = api?.slug ?? item.deepApiSlug
          return <article className="endpoint-row" key={item.slug}>
          <span className={`method-badge method-${item.method.toLowerCase()}`}>{item.method}</span>
          <div className="endpoint-main"><code>{item.path}</code><p>{apiSlug ? '已完成签名、案例、可见效果、错误恢复、测试与最佳实践八维精讲。' : item.summary}</p><div><span>{item.group}</span><span>{item.transport}</span><span>{item.auth.length ? item.auth.join(' → ') : '公开入口 / handler 内校验'}</span>{item.permission && <span>{item.permission}</span>}</div></div>
          <div className="endpoint-contract"><span>请求</span><p>{api ? api.parameters.map((parameter) => `${parameter.name}:${parameter.type}${parameter.required ? '' : '?'}`).join(' · ') || '无请求参数' : item.request ?? '等待精讲'}</p><span>响应</span><p>{api ? `${api.returns.type} · ${api.returns.description}` : item.responses?.join(' · ') ?? '等待精讲'}</p></div>
          <div className="endpoint-actions">{apiSlug ? <button onClick={() => navigateTo(`#api/${apiSlug}`)}>完整精讲 <ArrowRight size={13} /></button> : <span>等待精讲</span>}<a href={`${AI_INTERVIEW_REPO}/blob/${AI_INTERVIEW_COMMIT}/${item.sourcePath}#L${item.sourceLine}`} target="_blank" rel="noreferrer">固定源码</a>{item.testPath && <a href={`${AI_INTERVIEW_REPO}/blob/${AI_INTERVIEW_COMMIT}/${item.testPath}`} target="_blank" rel="noreferrer">代表测试</a>}</div>
        </article>
        })}
        {visible.length === 0 && <div className="api-empty"><strong>{httpEndpoints.length ? '没有匹配端点' : '端点清单正在合并'}</strong><p>{httpEndpoints.length ? '尝试清空搜索或减少筛选条件。' : '完整 216 条源码审计完成后会一次性写入。'}</p>{httpEndpoints.length > 0 && <button className="button button-primary" onClick={reset}>重置全部筛选</button>}</div>}
      </section>
      {visible.length > PAGE_SIZE && <nav className="endpoint-pagination" aria-label="端点目录分页">
        <button disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>上一页</button>
        <span>显示 {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, visible.length)} / {visible.length}</span>
        <button disabled={safePage === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>下一页</button>
      </nav>}
    </DocsShell>
  )
}

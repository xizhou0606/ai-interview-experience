import { ArrowLeft, ArrowRight, BadgeCheck, Braces, Check, CheckCircle2, ChevronRight, ExternalLink, GitCommitHorizontal, Layers3, ShieldCheck, TestTube2 } from 'lucide-react'
import { navigateTo } from '../../app/router'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { apiEntries, getApiTechnologyStack, getModuleBySlug, type ApiEntry } from '../../data/apis'
import { sourceUrl } from '../../data/apis/helpers'
import { useLessonProgress } from '../../features/progress/useLessonProgress'
import { ArticleSection } from '../technology/components/ArticleSection/ArticleSection'
import { ApiCodeBlock } from './components/ApiCodeBlock/ApiCodeBlock'
import { EffectDemoPanel } from './components/EffectDemoPanel/EffectDemoPanel'
import { ErrorMatrix } from './components/ErrorMatrix/ErrorMatrix'
import { ParameterTable } from './components/ParameterTable/ParameterTable'
import { SourceEvidence } from './components/SourceEvidence/SourceEvidence'

const TOC = ['技术定位与签名', '参数与返回值', '最小实现', '效果案例', '错误与恢复', '最佳实践', '测试与证据', '同栈 API']

export function ApiDetailPage({ api }: { api: ApiEntry }) {
  const module = getModuleBySlug(api.module)
  const stack = getApiTechnologyStack(api)
  const status = api.implementationStatus ?? 'production'
  const statusLabel = { production: '生产链路', 'defined-only': '已定义未接线', fallback: '备用实现', 'best-effort': '尽力执行' }[status]
  const progress = useLessonProgress(`api:${api.slug}`)
  const stackEntries = apiEntries.filter((item) => getApiTechnologyStack(item).slug === stack.slug).sort((left, right) => (getModuleBySlug(left.module)?.learningOrder ?? 99) - (getModuleBySlug(right.module)?.learningOrder ?? 99) || left.name.localeCompare(right.name))
  const index = stackEntries.findIndex((item) => item.slug === api.slug)
  const previous = stackEntries[index - 1]
  const next = stackEntries[index + 1]
  return (
    <DocsShell active="project-apis" toc={TOC}>
      <article className="article-page api-detail-page">
        <div className="breadcrumbs"><button onClick={() => navigateTo(`#project-apis?stack=${stack.slug}`)}>项目实现 API</button><ChevronRight size={13} /><span>{stack.name}</span><ChevronRight size={13} /><span>{module?.name}</span><ChevronRight size={13} /><span>{api.name}</span></div>
        <header className="article-header api-detail-header">
          <div className="api-detail-kinds"><span><Layers3 size={13} />{stack.name}</span><span><Braces size={13} />{api.kind}</span><span className={`api-status-${status}`}>{statusLabel}</span></div>
          <h1>{api.name}</h1><p>{api.summary}</p><code className="api-signature">{api.signature}</code>
          <div className="article-meta"><span><GitCommitHorizontal size={15} />{api.verifiedCommit}</span><span><BadgeCheck size={15} />源码已核验</span><span><TestTube2 size={15} />{api.tests.length} 项测试证据</span></div>
          <div className="evidence-banner"><ShieldCheck size={18} /><div><strong>{stack.name} · 真实实现来自 {api.project}</strong><p>具体技术：{api.technology}。页面事实固定到源码 commit；项目只承担实现证据，不主导学习顺序。</p></div></div>
        </header>
        <ArticleSection index={0} title="技术定位与签名"><div className="api-definition-grid"><div><span>技术栈</span><p>{stack.name}：{stack.description}</p></div><div><span>能力模块</span><p>{module?.name}：{module?.description}</p></div><div><span>什么时候使用</span><p>{api.whenToUse}</p></div><div><span>实现状态</span><p>{api.statusNote ?? `${statusLabel}；该状态已按固定 commit 的调用关系核验。`}</p></div></div><div className="api-signature-panel"><div><strong>{api.name}</strong><span>{api.kind} · {api.technology}</span></div><code>{api.signature}</code></div></ArticleSection>
        <ArticleSection index={1} title="参数与返回值"><ParameterTable parameters={api.parameters} /><div className="api-return-panel"><span>返回值</span><code>{api.returns.type}</code><p>{api.returns.description}</p></div></ArticleSection>
        <ArticleSection index={2} title="最小可运行实现"><ApiCodeBlock api={api} /><div className="code-explanation"><strong>关键步骤</strong>{api.example.explanation.map((line) => <p key={line}><span><Check size={13} /></span>{line}</p>)}</div></ArticleSection>
        <ArticleSection index={3} title="案例与可见效果"><EffectDemoPanel effect={api.effect} /></ArticleSection>
        <ArticleSection index={4} title="错误、重试与恢复"><ErrorMatrix errors={api.errors} /></ArticleSection>
        <ArticleSection index={5} title="生产最佳实践"><div className="practice-list">{api.bestPractices.map((practice, itemIndex) => <div key={practice}><span>{itemIndex + 1}</span><p>{practice}</p></div>)}</div></ArticleSection>
        <ArticleSection index={6} title="测试与证据"><SourceEvidence api={api} />{sourceUrl(api) && <a className="api-source-cta" href={sourceUrl(api)} target="_blank" rel="noreferrer">在固定 commit 查看源码 <ExternalLink size={14} /></a>}</ArticleSection>
        <ArticleSection index={7} title="相关 API 与同栈学习顺序"><div className="related-api-list">{api.related.map((slug) => { const related = apiEntries.find((item) => item.slug === slug); return related ? <button key={slug} onClick={() => navigateTo(`#api/${slug}`)}><span>{getApiTechnologyStack(related).name} · {getModuleBySlug(related.module)?.name}</span><strong>{related.name}</strong><ArrowRight size={14} /></button> : null })}</div></ArticleSection>
        <div className="article-complete"><div><strong>{progress.completed ? '这个 API 已掌握' : '完成这个 API 的学习了吗？'}</strong><p>进度只保存在当前浏览器。</p></div><button className={`button ${progress.completed ? 'button-complete' : 'button-primary'}`} onClick={progress.toggle}>{progress.completed ? <CheckCircle2 size={16} /> : <Check size={16} />}{progress.completed ? '已完成' : '标记为完成'}</button></div>
        <div className="api-pager">{previous ? <button onClick={() => navigateTo(`#api/${previous.slug}`)}><ArrowLeft size={15} /><span><small>{stack.name} · 上一个 API</small><strong>{previous.name}</strong></span></button> : <span />}{next && <button onClick={() => navigateTo(`#api/${next.slug}`)}><span><small>{stack.name} · 下一个 API</small><strong>{next.name}</strong></span><ArrowRight size={15} /></button>}</div>
      </article>
    </DocsShell>
  )
}

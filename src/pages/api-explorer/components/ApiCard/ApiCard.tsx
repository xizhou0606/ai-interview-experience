import { ArrowRight, BadgeCheck, Braces, FlaskConical, TestTube2 } from 'lucide-react'
import { navigateTo } from '../../../../app/router'
import { getApiTechnologyStack, getModuleBySlug, type ApiEntry } from '../../../../data/apis'

export function ApiCard({ api }: { api: ApiEntry }) {
  const module = getModuleBySlug(api.module)
  const stack = getApiTechnologyStack(api)
  const status = api.implementationStatus ?? 'production'
  const statusLabel = { production: '生产链路', 'defined-only': '已定义未接线', fallback: '备用实现', 'best-effort': '尽力执行' }[status]
  return (
    <article className="api-card">
      <div className="api-card-top"><span className="api-stack-badge">{stack.name}</span><span className={`api-status api-status-${status}`}>{statusLabel}</span><span className="api-verified"><BadgeCheck size={13} />源码已核验</span></div>
      <button className="api-card-title" onClick={() => navigateTo(`#api/${api.slug}`)}>{api.name}</button>
      <span className="api-card-technology">具体实现 · {api.technology}</span>
      <code>{api.signature}</code>
      <p>{api.summary}</p>
      <div className="api-card-meta"><span><Braces size={12} />{api.kind}</span><span>{module?.name}</span><span>源码：{api.project}</span><span><FlaskConical size={12} />效果案例</span><span><TestTube2 size={12} />{api.tests.length} 项测试</span></div>
      <button className="api-card-open" onClick={() => navigateTo(`#api/${api.slug}`)}>查看完整 API <ArrowRight size={14} /></button>
    </article>
  )
}

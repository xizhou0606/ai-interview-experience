import { ArrowRight, Braces, FolderGit2 } from 'lucide-react'
import { navigateTo } from '../../../../app/router'
import { apiEntries, getApiTechnologyStack, getModuleBySlug } from '../../../../data/apis'

export function TechnologyApiIndex({ technologySlug }: { technologySlug: string }) {
  const entries = apiEntries
    .filter((entry) => getApiTechnologyStack(entry).chapterSlug === technologySlug)
    .sort((left, right) => (getModuleBySlug(left.module)?.learningOrder ?? 99) - (getModuleBySlug(right.module)?.learningOrder ?? 99) || left.name.localeCompare(right.name))
  const stack = entries[0] ? getApiTechnologyStack(entries[0]) : undefined

  if (!stack || entries.length === 0) return <div className="technology-api-empty"><strong>API 索引正在补齐</strong><p>本章目前保留概念与项目证据，具体 API 会按同一内容门禁接入。</p></div>

  return (
    <div className="technology-api-catalog">
      <div className="technology-api-summary"><div><span>{entries.length}</span><p>个项目实现已归入 {stack.name}，每个都有参数、返回值、运行案例、错误恢复、测试与源码证据。</p></div><button onClick={() => navigateTo(`#project-apis?stack=${stack.slug}`)}>查看项目实现证据 <ArrowRight size={14} /></button></div>
      <div className="technology-api-list">
        {entries.map((entry) => <button key={entry.slug} onClick={() => navigateTo(`#api/${entry.slug}`)}><span className="technology-api-kind"><Braces size={12} />{entry.kind}</span><strong>{entry.name}</strong><code>{entry.signature}</code><span className="technology-api-meta"><b>{getModuleBySlug(entry.module)?.name}</b><small><FolderGit2 size={11} />源码：{entry.project}</small></span><ArrowRight size={14} /></button>)}
      </div>
    </div>
  )
}

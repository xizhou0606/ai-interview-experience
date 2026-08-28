import { ArrowRight, BookOpen, Layers3 } from 'lucide-react'
import { navigateTo } from '../../../../app/router'
import { apiTechnologyStacks, getApiTechnologyStack, type ApiEntry } from '../../../../data/apis'

export function TechnologyStackPicker({ entries, value, onChange }: { entries: ApiEntry[]; value: string; onChange: (slug: string) => void }) {
  const counts = new Map<string, number>()
  entries.forEach((entry) => {
    const slug = getApiTechnologyStack(entry).slug
    counts.set(slug, (counts.get(slug) ?? 0) + 1)
  })
  return (
    <section className="technology-stack-picker" aria-label="按技术栈选择 API">
      <div className="stack-picker-head"><div><span>STEP 01 · 技术栈</span><h2>先选择要学习的技术</h2><p>项目不再作为目录层级；它只在 API 详情中提供真实源码证据。</p></div><button className={value === 'all' ? 'active' : ''} onClick={() => onChange('all')}><Layers3 size={15} />全部 {entries.length}</button></div>
      <div className="technology-stack-grid">
        {apiTechnologyStacks.map((stack) => {
          const count = counts.get(stack.slug) ?? 0
          if (!count) return null
          return <button key={stack.slug} className={value === stack.slug ? 'active' : ''} onClick={() => onChange(stack.slug)}><span><strong>{stack.name}</strong><small>{stack.description}</small></span><b>{count}</b></button>
        })}
      </div>
      {value !== 'all' && apiTechnologyStacks.find((stack) => stack.slug === value)?.chapterSlug && <button className="stack-chapter-link" onClick={() => navigateTo(`#technology/${apiTechnologyStacks.find((stack) => stack.slug === value)?.chapterSlug}`)}><BookOpen size={14} />阅读技术栈完整章节 <ArrowRight size={14} /></button>}
    </section>
  )
}

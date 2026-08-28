import { useEffect, useMemo, useState } from 'react'
import { Braces, Boxes, FolderGit2, Newspaper, Search, Workflow } from 'lucide-react'
import { navigateTo } from '../../../app/router'
import { engineeringPatternTechnologies, frameworkTechnologies, patterns, projects } from '../../../data/catalog'
import { visibleTechnologyNews } from '../../../data/technology-news'

interface SearchDialogProps { open: boolean; onClose: () => void }
interface SearchItem { title: string; subtitle: string; type: string; hash: string }

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [apiItems, setApiItems] = useState<SearchItem[]>([])
  const items = useMemo<SearchItem[]>(() => [
    { title: '技术新闻', subtitle: '近两周可核验的前端、后端与 AI 一手来源', type: '栏目', hash: '#news' },
    ...frameworkTechnologies.map((item) => ({ title: item.name, subtitle: item.summary, type: `技术栈 · ${item.category}`, hash: `#technology/${item.slug}` })),
    ...engineeringPatternTechnologies.map((item) => ({ title: item.name, subtitle: item.summary, type: '工程实践', hash: `#technology/${item.slug}` })),
    ...apiItems,
    ...projects.map((item) => ({ title: item.name, subtitle: item.summary, type: '真实项目', hash: '#projects' })),
    ...patterns.map((item) => ({ title: item.title, subtitle: item.description, type: '工程模式', hash: '#patterns' })),
    ...visibleTechnologyNews().map((item) => ({ title: item.title, subtitle: `${item.date} · ${item.source} · ${item.summary}`, type: `技术新闻 · ${item.category}`, hash: '#news' })),
  ], [apiItems])
  const filtered = items.filter((item) => `${item.title}${item.subtitle}${item.type}`.toLowerCase().includes(query.toLowerCase())).slice(0, 9)
  useEffect(() => { if (open) setQuery('') }, [open])
  useEffect(() => {
    if (!open || apiItems.length) return
    let active = true
    Promise.all([
      import('../../../data/apis'),
      import('../../../data/framework-apis/catalogs'),
      import('../../../data/framework-apis/loaders'),
    ]).then(async ([{ apiEntries }, { frameworkApiCatalogs }, { loadFrameworkApis }]) => {
      if (!active) return
      const officialCatalogs = await Promise.all(frameworkApiCatalogs.map(async (catalog) => ({
        technologySlug: catalog.technologySlug,
        apis: await loadFrameworkApis(catalog.technologySlug),
      })))
      if (!active) return
      const officialItems = officialCatalogs.flatMap(({ technologySlug, apis }) => apis.map((item) => ({ title: item.name, subtitle: `${item.signature} · ${item.beginner}`, type: '框架官方 API', hash: `#apis?tech=${technologySlug}&api=${item.slug}` })))
      const projectItems = apiEntries.map((item) => ({ title: item.name, subtitle: `${item.signature} · ${item.summary}`, type: '项目实现 API', hash: `#api/${item.slug}` }))
      setApiItems([...officialItems, ...projectItems])
    })
    return () => { active = false }
  }, [apiItems.length, open])
  if (!open) return null
  const openItem = (hash: string) => { navigateTo(hash); onClose() }
  return (
    <div className="dialog-backdrop" onMouseDown={onClose} role="presentation">
      <section className="search-dialog" role="dialog" aria-modal="true" aria-label="全站搜索" onMouseDown={(event) => event.stopPropagation()}>
        <div className="search-input-row"><Search size={19} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入 AI SDK、RAG、语音 Agent…" /><button onClick={onClose}>ESC</button></div>
        <div className="search-meta"><span>{query ? `找到 ${filtered.length} 个结果` : '推荐内容'}</span><span>技术栈 · 工程实践 · 官方 API · 项目证据</span></div>
        <div className="search-results">
          {filtered.map((item) => <button key={`${item.type}-${item.title}`} onClick={() => openItem(item.hash)}><span className="search-result-icon">{item.type === '真实项目' ? <FolderGit2 size={17} /> : item.type === '工程模式' ? <Workflow size={17} /> : item.type.includes('API') ? <Braces size={17} /> : item.type.startsWith('技术新闻') || item.type === '栏目' ? <Newspaper size={17} /> : <Boxes size={17} />}</span><span><strong>{item.title}</strong><small>{item.subtitle}</small></span><span className="search-type">{item.type}</span></button>)}
          {filtered.length === 0 && <div className="empty-search">没有直接结果，试试“工具”“检索”或“语音”。</div>}
        </div>
        <div className="search-footer"><span><kbd>↑</kbd><kbd>↓</kbd> 选择</span><span><kbd>↵</kbd> 打开</span><span><kbd>esc</kbd> 关闭</span></div>
      </section>
    </div>
  )
}

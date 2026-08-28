import { ChevronDown, ListTree, Sparkles } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { DocsSidebar } from '../DocsSidebar/DocsSidebar'

interface DocsShellProps {
  active: string
  children: React.ReactNode
  toc?: string[]
}

interface TocRegistration {
  owner: string
  items?: string[]
}

const DocsFrameContext = createContext<((registration: TocRegistration) => void) | null>(null)

function PageToc({ items }: { items?: string[] }) {
  const scrollToSection = (index: number) => document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if (!items) return null
  return <aside className="page-toc"><h3>本页内容</h3>{items.map((item, index) => <button key={item} type="button" onClick={() => scrollToSection(index)}>{item}</button>)}<div className="toc-card"><Sparkles size={17} /><strong>内容可信度</strong><p>源码事实与官方资料分开标注，推断不伪装成实现。</p></div></aside>
}

export function DocsFrame({ active, children }: { active: string; children: React.ReactNode }) {
  const [registration, setRegistration] = useState<TocRegistration>({ owner: active })
  const registerToc = useCallback((next: TocRegistration) => setRegistration((current) => {
    const unchanged = current.owner === next.owner && current.items?.length === next.items?.length && current.items?.every((item, index) => item === next.items?.[index])
    return unchanged ? current : next
  }), [])
  const toc = registration.owner === active ? registration.items : undefined
  return (
    <DocsFrameContext.Provider value={registerToc}>
      <div className="docs-layout">
        <DocsSidebar active={active} />
        <div className="docs-content-column">{children}</div>
        <PageToc items={toc} />
      </div>
    </DocsFrameContext.Provider>
  )
}

export function DocsShell({ active, children, toc }: DocsShellProps) {
  const registerToc = useContext(DocsFrameContext)
  useEffect(() => {
    if (!registerToc) return
    registerToc({ owner: active, items: toc })
  }, [active, registerToc, toc])

  const scrollToSection = (index: number) => {
    document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (registerToc) return <main className="docs-main">{toc && <details className="mobile-page-toc"><summary><ListTree size={16} /><span>本章目录</span><small>{toc.length} 个章节</small><ChevronDown size={16} /></summary><nav aria-label="本章目录">{toc.map((item, index) => <button key={item} type="button" onClick={(event) => { scrollToSection(index); event.currentTarget.closest('details')?.removeAttribute('open') }}><span>{String(index + 1).padStart(2, '0')}</span>{item}</button>)}</nav></details>}{children}</main>

  return (
    <div className="docs-layout">
      <DocsSidebar active={active} />
      <div className="docs-content-column">
        {toc && <details className="mobile-page-toc"><summary><ListTree size={16} /><span>本章目录</span><small>{toc.length} 个章节</small><ChevronDown size={16} /></summary><nav aria-label="本章目录">{toc.map((item, index) => <button key={item} type="button" onClick={(event) => { scrollToSection(index); event.currentTarget.closest('details')?.removeAttribute('open') }}><span>{String(index + 1).padStart(2, '0')}</span>{item}</button>)}</nav></details>}
        <main className="docs-main">{children}</main>
      </div>
      <PageToc items={toc} />
    </div>
  )
}

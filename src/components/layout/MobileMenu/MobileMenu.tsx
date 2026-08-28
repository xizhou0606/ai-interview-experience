import { BarChart3, BookMarked, BookOpen, Boxes, Braces, ChevronRight, FolderGit2, ListTree, Newspaper, Route, Workflow, X } from 'lucide-react'
import { navigateTo } from '../../../app/router'
import { engineeringPatternTechnologies, frameworkTechnologies } from '../../../data/catalog'
import { buildTechnologyNavigation } from '../../../data/technology-navigation'
import { AppLogo } from '../../brand/AppLogo/AppLogo'

interface MobileMenuProps { open: boolean; onClose: () => void }

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  if (!open) return null
  const openRoute = (hash: string) => { navigateTo(hash); onClose() }
  const sections = [
    { title: '开始', items: [{ label: '技术新闻', hash: '#news', icon: Newspaper }, { label: '学习路线', hash: '#roadmap', icon: Route }, { label: '技术栈总览与选型', hash: '#technologies', icon: Boxes }] },
    ...buildTechnologyNavigation(frameworkTechnologies).map((group) => ({ title: group.label, items: group.technologies.map((tech) => ({ label: tech.learningName ?? tech.name, hash: `#technology/${tech.slug}`, icon: BookOpen })) })),
    { title: '工程实践', items: [{ label: '工程实践总览', hash: '#patterns', icon: Workflow }, ...engineeringPatternTechnologies.map((practice) => ({ label: practice.name, hash: `#technology/${practice.slug}`, icon: Workflow }))] },
    { title: 'API 与源码证据', items: [{ label: '框架官方 API', hash: '#apis', icon: Braces }, { label: '项目实现 API', hash: '#project-apis', icon: FolderGit2 }, { label: 'HTTP 端点', hash: '#endpoints', icon: ListTree }, { label: '项目证据库', hash: '#projects', icon: FolderGit2 }, { label: '覆盖审计', hash: '#coverage', icon: BarChart3 }] },
    { title: '内容说明', items: [{ label: '资料来源与方法', hash: '#sources', icon: BookMarked }] },
  ]
  return (
    <div className="mobile-menu-layer">
      <div className="mobile-menu-head"><AppLogo /><button className="icon-button" onClick={onClose} aria-label="关闭菜单"><X size={20} /></button></div>
      <div className="mobile-menu-links">
        {sections.map((section) => <section className="mobile-menu-group" key={section.title}><h3>{section.title}</h3>{section.items.map(({ label, hash, icon: Icon }) => <button key={hash} onClick={() => openRoute(hash)}><Icon size={18} /><span>{label}</span><ChevronRight size={16} /></button>)}</section>)}
      </div>
    </div>
  )
}

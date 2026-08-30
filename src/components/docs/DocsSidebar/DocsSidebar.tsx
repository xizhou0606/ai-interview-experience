import { BarChart3, BookMarked, BookOpen, Boxes, Braces, ChevronRight, FolderGit2, ListTree, Newspaper, Route, Workflow } from 'lucide-react'
import { navigateTo } from '../../../app/router'
import { engineeringPatternTechnologies, frameworkTechnologies } from '../../../data/catalog'
import { buildTechnologyNavigation } from '../../../data/technology-navigation'

export function DocsSidebar({ active }: { active: string }) {
  const sections = [
    { title: '开始', items: [{ label: '学习路线', hash: '#roadmap', icon: Route }, { label: '技术栈总览与选型', hash: '#technologies', icon: Boxes }, { label: '技术新闻', hash: '#news', icon: Newspaper }] },
    ...buildTechnologyNavigation(frameworkTechnologies).map((group) => ({ title: group.label, items: group.technologies.map((tech) => ({ label: tech.learningName ?? tech.name, hash: `#technology/${tech.slug}`, icon: BookOpen })) })),
    { title: '工程实践', items: [{ label: '工程实践总览', hash: '#patterns', icon: Workflow }, ...engineeringPatternTechnologies.map((practice) => ({ label: practice.name, hash: `#technology/${practice.slug}`, icon: Workflow }))] },
    { title: 'API 与源码证据', items: [{ label: '框架官方 API', hash: '#apis', icon: Braces }, { label: '项目实现 API', hash: '#project-apis', icon: FolderGit2 }, { label: 'HTTP 端点', hash: '#endpoints', icon: ListTree }, { label: '项目证据库', hash: '#projects', icon: FolderGit2 }, { label: '覆盖审计', hash: '#coverage', icon: BarChart3 }] },
    { title: '内容说明', items: [{ label: '资料来源与方法', hash: '#sources', icon: BookMarked }] },
  ]
  return (
    <aside className="docs-sidebar">
      {sections.map((section) => <div className="sidebar-group" key={section.title}><h3>{section.title}</h3>{section.items.map(({ label, hash, icon: Icon }) => <button key={hash} className={active === hash.slice(1) ? 'active' : ''} onClick={() => navigateTo(hash)}><Icon size={15} /><span>{label}</span>{active === hash.slice(1) && <ChevronRight size={13} />}</button>)}</div>)}
    </aside>
  )
}

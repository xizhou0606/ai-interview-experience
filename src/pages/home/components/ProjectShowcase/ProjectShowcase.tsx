import { Activity, ArrowRight, ArrowUpRight, Command, Network, Workflow } from 'lucide-react'
import { navigateTo } from '../../../../app/router'
import { projects } from '../../../../data/catalog'

export function ProjectShowcase() {
  return (
    <section className="project-showcase"><div className="project-showcase-inner">
      <div className="showcase-copy"><span className="section-kicker mint">IMPLEMENTATION EVIDENCE</span><h2>项目只负责<br />验证如何落地</h2><p>学习目录始终按技术栈和官方 API 组织；项目用于补充真实调用链、失败恢复、测试和固定 commit 证据。</p><button className="text-link light" onClick={() => navigateTo('#projects')}>查看项目证据库 <ArrowRight size={16} /></button></div>
      <div className="featured-projects">{projects.slice(0, 4).map((project, index) => <button key={project.slug} className="featured-project" onClick={() => navigateTo('#projects')}><div className={`project-symbol symbol-${index + 1}`}>{index === 0 ? <Activity /> : index === 1 ? <Workflow /> : index === 2 ? <Network /> : <Command />}</div><div><div className="project-card-top"><span>{project.domain}</span><small>{project.maturity}</small></div><h3>{project.name}</h3><p>{project.summary}</p><div className="tag-row dark">{project.technologies.slice(0, 3).map((tech) => <span key={tech}>{tech}</span>)}</div></div><ArrowUpRight size={18} className="project-arrow" /></button>)}</div>
    </div></section>
  )
}

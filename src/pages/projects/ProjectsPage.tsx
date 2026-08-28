import { ShieldCheck } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { AUDITED_PROJECTS } from './projects.data'

export function ProjectsPage() {
  return (
    <DocsShell active="projects">
      <PageIntro kicker="SOURCE-VERIFIED CASES" title="从项目入口，一路读到生产边界" description="不是作品集，而是源码导读：问题、架构、关键调用链、成功与失败路径、工程决策、成熟度和如果重做会改变什么。" stats={[[String(AUDITED_PROJECTS.length), '审计项目'], ['10', '源码仓库'], ['4', '旗舰案例']]} />
      <div className="truth-note"><ShieldCheck size={19} /><div><strong>成熟度不会被美化</strong><p>“规划中”“骨架”“已实现”“生产验证”分别标注。例如 ai-playlet 当前没有真实模型调用，ai-pm 的 trace 也不是 Langfuse SDK。</p></div></div>
      <div className="project-list">{AUDITED_PROJECTS.map((project, index) => <article key={project.slug}><div className="project-list-index">{String(index + 1).padStart(2, '0')}</div><div><div className="project-list-meta"><span>{project.domain}</span><small>{project.maturity}</small></div><h2>{project.name}</h2><p>{project.summary}</p><div className="tag-row">{project.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div></div></article>)}</div>
    </DocsShell>
  )
}

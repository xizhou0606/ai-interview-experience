import { ArrowRight, BadgeCheck, BookOpen, Clock3, GraduationCap, Workflow } from 'lucide-react'
import { navigateTo } from '../../../app/router'
import type { Technology } from '../../../data/catalog'
import { getFrameworkApiCatalog } from '../../../data/framework-apis/catalogs'
import { getTechnologyLearningGuide } from '../../../data/technology-learning'

export function TechnologyCard({ tech, kind = 'technology' }: { tech: Technology; kind?: 'technology' | 'practice' }) {
  const frameworkCatalog = getFrameworkApiCatalog(tech.slug)
  const guide = getTechnologyLearningGuide(tech.slug)
  const learningName = tech.learningName ?? tech.name
  return (
    <button className="technology-card" onClick={() => navigateTo(`#technology/${tech.slug}`)}>
      <div className="technology-card-top"><span className="tech-monogram" style={{ background: tech.accent }}>{learningName.slice(0, 2).toUpperCase()}</span>{kind === 'practice' ? <span className="verified-badge pending"><Workflow size={13} />工程实践 · 非技术栈</span> : frameworkCatalog ? <span className="verified-badge"><BadgeCheck size={13} />官方 API {frameworkCatalog.expectedCount}/{frameworkCatalog.expectedCount}</span> : <span className="verified-badge pending"><BookOpen size={13} />官方 API 接入中</span>}</div>
      <span className="tech-category">{kind === 'practice' ? '它沉淀什么' : '它解决什么'}</span><h2>{learningName}</h2>{tech.learningName && <small className="technology-card-tool">核心工具：{tech.name}</small>}<p>{guide.plainDefinition}</p>
      <div className="technology-card-decision"><span>适合你的情况</span><strong>{guide.chooseWhen[0]}</strong><small>先做出：{guide.firstResult}</small></div>
      <div className="tech-meta"><span><GraduationCap size={14} />{tech.difficulty}</span><span><Clock3 size={14} />{tech.minutes} 分钟</span></div>
      <div className="tech-version">{tech.version}</div><span className="card-link">{kind === 'practice' ? '阅读实践指南' : '阅读完整章节'} <ArrowRight size={15} /></span>
    </button>
  )
}

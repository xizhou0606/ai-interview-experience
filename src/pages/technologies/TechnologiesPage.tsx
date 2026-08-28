import { useState } from 'react'
import { TechnologyCard } from '../../components/cards/TechnologyCard/TechnologyCard'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { frameworkTechnologies } from '../../data/catalog'
import { frameworkApiCatalogs, frameworkApiReferenceCount } from '../../data/framework-apis/catalogs'
import { groupTechnologies, technologyMenuGroups } from '../../data/technology-menu'

export function TechnologiesPage() {
  const [filter, setFilter] = useState('全部')
  const visible = filter === '全部' ? frameworkTechnologies : frameworkTechnologies.filter((item) => technologyMenuGroups.find((group) => group.slug === filter)?.technologySlugs.includes(item.slug))
  const grouped = groupTechnologies(visible)
  return (
    <DocsShell active="technologies">
      <PageIntro kicker="NEW PROJECT TECHNOLOGY GUIDE" title="先说你想做什么，再选择技术栈" description={`这里只收录有明确产品、版本、安装方式和官方 API 的框架或组件。每个技术栈都与 3 个主流替代方案比较，工程方法则留在独立栏目。目前 ${frameworkApiCatalogs.length} 套官方目录已核验。`} stats={[[String(technologyMenuGroups.length), '新项目问题入口'], [String(frameworkTechnologies.length), '真实技术栈'], [String(frameworkTechnologies.length * 3), '主流方案对比'], [String(frameworkApiReferenceCount), '可查官方 API']]} />
      <div className="filter-row goal-filter"><button className={filter === '全部' ? 'active' : ''} onClick={() => setFilter('全部')}>全部项目目标</button>{technologyMenuGroups.map((group) => <button key={group.slug} className={filter === group.slug ? 'active' : ''} onClick={() => setFilter(group.slug)}>{group.label}</button>)}</div>
      {grouped.map((group) => <section className="technology-family" key={group.slug}><div className="technology-family-head"><span>我要：{group.label}</span><p>{group.question}</p><em>{group.technologies.length} 个候选方案</em></div><div className="technology-family-purpose"><strong>这一组最终要做到</strong><p>{group.outcome}</p></div><div className="technology-decision-rules">{group.decisionRules.map((rule) => <article key={rule.need}><span>如果你要</span><strong>{rule.need}</strong><p>优先看 <b>{rule.choose}</b>：{rule.reason}</p></article>)}</div><div className="technology-grid">{group.technologies.map((tech) => <TechnologyCard key={tech.slug} tech={tech} />)}</div></section>)}
    </DocsShell>
  )
}

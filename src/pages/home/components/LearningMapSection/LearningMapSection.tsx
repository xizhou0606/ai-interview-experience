import { Activity, ArrowUpRight, Boxes, Code2, Database, Network, ShieldCheck } from 'lucide-react'
import { navigateTo } from '../../../../app/router'
import { technologyMenuGroups } from '../../../../data/technology-menu'

export function LearningMapSection() {
  return (
    <section className="section-wrap learning-map-section">
      <div className="section-heading split-heading"><div><span className="section-kicker">START FROM YOUR GOAL</span><h2>六种新项目目标，<br />对应六条选型路线</h2></div><p>先找到最像你当前需求的一组，再比较候选方案。技术名只是答案，不是学习入口。</p></div>
      <div className="learning-map">
        {technologyMenuGroups.map((group, index) => <button key={group.slug} className="stage-card" style={{ '--tone': ['#dff1e7', '#efe9f8', '#e6eef5', '#f8eee4', '#e8e9f8', '#f3eadf'][index] } as React.CSSProperties} onClick={() => navigateTo('#technologies')}><span className="stage-index">{String(index + 1).padStart(2, '0')}</span><div className="stage-icon">{index === 0 ? <Code2 /> : index === 1 ? <Network /> : index === 2 ? <Database /> : index === 3 ? <Boxes /> : index === 4 ? <Activity /> : <ShieldCheck />}</div><h3>{group.label}</h3><p>{group.question}</p><div className="tag-row">{group.decisionRules.slice(0, 2).map((rule) => <span key={rule.choose}>{rule.choose}</span>)}</div><span className="stage-link">比较方案 <ArrowUpRight size={15} /></span></button>)}
      </div>
    </section>
  )
}

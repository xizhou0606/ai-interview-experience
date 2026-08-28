import { ArrowRight, CheckCircle2, GitCompareArrows, ShieldAlert, Target } from 'lucide-react'
import type { Technology } from '../../../../data/catalog'
import { getTechnologyLearningGuide } from '../../../../data/technology-learning'
import { getTechnologyMenuGroup } from '../../../../data/technology-menu'

export function TechnologyMindMap({ tech }: { tech: Technology }) {
  const guide = getTechnologyLearningGuide(tech.slug)
  const group = getTechnologyMenuGroup(tech.slug)
  return (
    <div className="technology-decision-map" role="group" aria-label={`${tech.name} 新项目选型决策图`}>
      <div className="decision-map-question"><span>从项目问题开始</span><strong>{group?.question ?? guide.problem}</strong><p>{group?.description}</p></div>
      <ArrowRight className="decision-map-arrow" size={20} />
      <div className="decision-map-steps">
        <article><Target size={18} /><span>1. 它解决什么</span><strong>{guide.plainDefinition}</strong></article>
        <article><GitCompareArrows size={18} /><span>2. 为什么可能选它</span><strong>{guide.chooseWhen[0]}</strong><p>{tech.comparison}</p></article>
        <article><CheckCircle2 size={18} /><span>3. 原理怎么讲</span><strong>{guide.principle}</strong></article>
        <article><ShieldAlert size={18} /><span>4. 代价和风险</span><strong>{guide.avoidWhen[0]}</strong><p>{tech.pitfalls[0]?.detail}</p></article>
      </div>
      <div className="decision-map-conclusion"><span>选型结论</span><p>如果你的问题与“{guide.problem}”一致，并且能接受“{guide.avoidWhen[0]}”这项约束，可以进入最小实现；否则先看同组的其他方案或更简单的做法。</p></div>
    </div>
  )
}

import { ArrowLeftRight, CheckCircle2, MoveRight } from 'lucide-react'
import type { Technology } from '../../../../data/catalog'
import { getTechnologyComparison } from '../../../../data/technology-comparisons'

const migrationLabel = { low: '迁移成本较低', medium: '迁移成本中等', high: '迁移成本较高' }

export function TechnologyComparison({ tech }: { tech: Technology }) {
  const comparison = getTechnologyComparison(tech.slug)
  if (!comparison) return <div className="comparison-card"><ArrowLeftRight size={21} /><div><strong>替代方案仍在整理</strong><p>{tech.comparison}</p></div></div>
  return (
    <div className="technology-comparison">
      <div className="technology-comparison-summary"><ArrowLeftRight size={20} /><div><span>先看结论</span><strong>{comparison.decisionSummary}</strong></div></div>
      <div className="technology-comparison-grid">
        {comparison.alternatives.map((item) => <article key={item.alternative}>
          <div className="technology-comparison-title"><span>{tech.name}</span><MoveRight size={15} /><strong>{item.alternative}</strong></div>
          <p>{item.difference}</p>
          <div className="technology-comparison-choice current"><CheckCircle2 size={15} /><div><span>继续选 {tech.name}</span><p>{item.chooseCurrentWhen}</p></div></div>
          <div className="technology-comparison-choice alternative"><CheckCircle2 size={15} /><div><span>改选 {item.alternative}</span><p>{item.chooseAlternativeWhen}</p></div></div>
          <div className={`technology-migration-cost cost-${item.migrationCost.level}`}><strong>{migrationLabel[item.migrationCost.level]}</strong><p>{item.migrationCost.reason}</p></div>
        </article>)}
      </div>
    </div>
  )
}

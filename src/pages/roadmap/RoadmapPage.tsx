import { ArrowRight } from 'lucide-react'
import { navigateTo } from '../../app/router'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { frameworkTechnologies } from '../../data/catalog'
import { technologyMenuGroups } from '../../data/technology-menu'

export function RoadmapPage() {
  return (
    <DocsShell active="roadmap">
      <PageIntro kicker="NEW PROJECT DECISION ROADMAP" title="从项目问题出发，形成自己的技术选型方法" description="这里的候选项只统计真实框架和组件。跨框架的组合方法统一放在工程实践栏目。" stats={[[String(technologyMenuGroups.length), '项目目标'], [String(frameworkTechnologies.length), '候选技术栈'], ['4', '选型判断维度']]} />
      <div className="roadmap-list">{technologyMenuGroups.map((group, index) => <article key={group.slug} className="roadmap-item"><div className="roadmap-rail"><span>{String(index + 1).padStart(2, '0')}</span>{index < technologyMenuGroups.length - 1 && <i />}</div><div className="roadmap-content"><div className="roadmap-title"><div><small>PROJECT GOAL</small><h2>我要：{group.label}</h2></div><span>独立路线</span></div><p>{group.question}</p><div className="roadmap-outcome"><strong>完成这条路线后</strong><p>{group.outcome}</p></div><div className="roadmap-choice-list">{group.decisionRules.map((rule) => <div key={rule.need}><span>{rule.need}</span><strong>{rule.choose}</strong><p>{rule.reason}</p></div>)}</div><button className="text-link" onClick={() => navigateTo('#technologies')}>查看这一组方案 <ArrowRight size={15} /></button></div></article>)}</div>
    </DocsShell>
  )
}

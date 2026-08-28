import { ArrowLeft, ArrowRight } from 'lucide-react'
import { navigateTo } from '../../../../app/router'
import { engineeringPatternTechnologies, frameworkTechnologies, isPatternTechnology, type Technology } from '../../../../data/catalog'

export function ArticlePager({ current }: { current: Technology }) {
  const chapters = isPatternTechnology(current.slug) ? engineeringPatternTechnologies : frameworkTechnologies
  const index = chapters.findIndex((item) => item.slug === current.slug)
  const previous = chapters[index - 1]
  const next = chapters[index + 1]
  return (
    <div className="article-pager">
      {previous ? <button onClick={() => navigateTo(`#technology/${previous.slug}`)}><ArrowLeft size={16} /><span><small>上一章</small><strong>{previous.learningName ?? previous.name}</strong></span></button> : <span />}
      {next ? <button onClick={() => navigateTo(`#technology/${next.slug}`)}><span><small>下一章</small><strong>{next.learningName ?? next.name}</strong></span><ArrowRight size={16} /></button> : <button onClick={() => navigateTo(isPatternTechnology(current.slug) ? '#patterns' : '#roadmap')}><span><small>下一步</small><strong>{isPatternTechnology(current.slug) ? '返回工程实践' : '返回学习路线'}</strong></span><ArrowRight size={16} /></button>}
    </div>
  )
}

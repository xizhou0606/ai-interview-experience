import { FolderGit2 } from 'lucide-react'
import { TechnologyCard } from '../../components/cards/TechnologyCard/TechnologyCard'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { engineeringPatternTechnologies } from '../../data/catalog'
import { ALL_PATTERNS } from './patterns.data'

export function PatternsPage() {
  return (
    <DocsShell active="patterns">
      <PageIntro kicker="ENGINEERING PRACTICES" title="工程实践，不是技术栈" description="这里放的是多个框架、API 和工具组合后形成的做法。它们不能直接安装，也没有统一官方 API；每项只讲适用条件、步骤、代价和项目证据。" stats={[[String(engineeringPatternTechnologies.length), '详细实践指南'], [String(ALL_PATTERNS.length), '可复用工程模式']]} />
      <section className="technology-family"><div className="technology-family-head"><span>详细实践指南</span><p>这些内容有完整章节，但会始终标明“非技术栈”。</p><em>{engineeringPatternTechnologies.length} 项</em></div><div className="technology-grid">{engineeringPatternTechnologies.map((practice) => <TechnologyCard key={practice.slug} tech={practice} kind="practice" />)}</div></section>
      <div className="pattern-grid">{ALL_PATTERNS.map((pattern, index) => <article key={pattern.title}><div className="pattern-top"><span>{pattern.tag}</span><strong>{String(index + 1).padStart(2, '0')}</strong></div><h2>{pattern.title}</h2><p>{pattern.description}</p><div><FolderGit2 size={14} />{pattern.projects}</div></article>)}</div>
    </DocsShell>
  )
}

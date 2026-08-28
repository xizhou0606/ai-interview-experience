import { BookOpen, ExternalLink, FileCode2, Sparkles } from 'lucide-react'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { RESEARCH_REFERENCES } from './sources.data'

export function SourcesPage() {
  return (
    <DocsShell active="sources">
      <PageIntro kicker="RESEARCH & TRUST" title="我们如何决定什么值得学" description="学习体验参考成熟站点，技术结论优先使用官方文档，项目结论回到本地代码与 commit。所有推断都显式标注。" />
      <div className="trust-model"><div><FileCode2 size={19} /><strong>源码事实</strong><p>仓库、相对路径、版本与扫描时间。</p></div><div><BookOpen size={19} /><strong>官方文档</strong><p>框架定义、API、版本兼容与迁移。</p></div><div><Sparkles size={19} /><strong>工程经验</strong><p>从故障、权衡和多个项目中归纳，明确适用条件。</p></div></div>
      <h2 className="list-title">高价值案例研究</h2>
      <div className="reference-list">{RESEARCH_REFERENCES.map(([name, role, note, url], index) => <a key={name} href={url} target="_blank" rel="noreferrer"><span>{String(index + 1).padStart(2, '0')}</span><div><small>{role}</small><h3>{name}</h3><p>{note}</p></div><ExternalLink size={17} /></a>)}</div>
    </DocsShell>
  )
}

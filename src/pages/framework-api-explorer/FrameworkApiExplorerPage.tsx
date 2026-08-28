import { ArrowRight, BadgeCheck, BookOpen, FolderGit2, Layers3 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { navigateTo } from '../../app/router'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { PageIntro } from '../../components/docs/PageIntro/PageIntro'
import { frameworkTechnologies } from '../../data/catalog'
import { frameworkApiCatalogs, frameworkApiReferenceCount, getFrameworkApiCatalog } from '../../data/framework-apis/catalogs'
import { groupTechnologies } from '../../data/technology-menu'
import { FrameworkApiReferencePanel } from '../technology/components/FrameworkApiReferencePanel/FrameworkApiReferencePanel'

function readTechnologySlug() {
  const params = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
  const requested = params.get('tech')
  return frameworkTechnologies.some((technology) => technology.slug === requested)
    ? requested!
    : frameworkApiCatalogs[0]?.technologySlug ?? frameworkTechnologies[0].slug
}

export function FrameworkApiExplorerPage() {
  const [selectedSlug, setSelectedSlug] = useState(readTechnologySlug)
  const selectedTechnology = frameworkTechnologies.find((technology) => technology.slug === selectedSlug) ?? frameworkTechnologies[0]
  const selectedCatalog = getFrameworkApiCatalog(selectedTechnology.slug)
  const orderedTechnologies = useMemo(() => [...frameworkTechnologies].sort((left, right) => {
    const leftReady = getFrameworkApiCatalog(left.slug) ? 0 : 1
    const rightReady = getFrameworkApiCatalog(right.slug) ? 0 : 1
    return leftReady - rightReady
  }), [])
  const technologyGroups = useMemo(() => groupTechnologies(orderedTechnologies), [orderedTechnologies])

  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash.startsWith('#apis')) setSelectedSlug(readTechnologySlug())
    }
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  const selectTechnology = (slug: string) => {
    setSelectedSlug(slug)
    window.history.replaceState(null, '', `#apis?tech=${slug}`)
  }

  return (
    <DocsShell active="apis">
      <PageIntro
        kicker="FRAMEWORK OFFICIAL API REFERENCE"
        title="按技术栈逐项学习官方 API"
        description="如果你已经完成技术选型，再到这里查具体 API。还不知道选什么时，请先从“技术栈”页面按新项目问题选择，不需要先记住框架名字。"
        stats={[[String(frameworkApiCatalogs.length), '已有逐项目录的技术栈'], [String(frameworkApiReferenceCount), '本学习口径官方 API'], [String(frameworkTechnologies.length), '真实框架与组件']]}
      />

      <section className="framework-learning-rule" aria-label="框架 API 学习顺序">
        <div><span>01</span><strong>选择技术栈</strong><p>先明确框架解决的问题与边界。</p></div>
        <ArrowRight size={16} />
        <div><span>02</span><strong>先懂核心原理</strong><p>看清输入、状态、数据流与边界。</p></div>
        <ArrowRight size={16} />
        <div><span>03</span><strong>逐项学习 API</strong><p>按目录口径理解签名、案例与风险。</p></div>
        <ArrowRight size={16} />
        <div><span>04</span><strong>用项目验证</strong><p>最后再看真实源码怎样组合这些 API。</p></div>
      </section>

      <section className="framework-stack-picker">
        <div className="framework-stack-picker-head"><div><span className="section-kicker">CHOOSE BY PROJECT GOAL</span><h2>先按项目目标找到技术，再查 API</h2></div><p>这里保留完整 API 参考，但不再把所有框架平铺成一排。</p></div>
        <div className="framework-stack-families">{technologyGroups.map((group) => <section key={group.slug}><div className="framework-family-label"><strong>我要：{group.label}</strong><span>{group.question}</span></div><div className="framework-stack-grid">
          {group.technologies.map((technology) => {
            const catalog = getFrameworkApiCatalog(technology.slug)
            return <button key={technology.slug} className={selectedSlug === technology.slug ? 'active' : ''} aria-pressed={selectedSlug === technology.slug} onClick={() => selectTechnology(technology.slug)}><span className="framework-stack-icon" style={{ background: technology.accent }}>{technology.name.slice(0, 2).toUpperCase()}</span><span><strong>{technology.name}</strong><small>{technology.category}</small></span>{catalog ? <em><BadgeCheck size={12} />{catalog.expectedCount}/{catalog.expectedCount} API</em> : <em className="pending"><BookOpen size={12} />目录待核对</em>}</button>
          })}
        </div></section>)}</div>
      </section>

      <section className="framework-selected-head">
        <div><span><Layers3 size={14} />当前技术栈</span><h2>{selectedTechnology.name}</h2><p>{selectedTechnology.summary}</p></div>
        <div><strong>{selectedCatalog ? `${selectedCatalog.expectedCount} / ${selectedCatalog.expectedCount}` : '待核对'}</strong><span>{selectedCatalog ? '本章公开学习口径已逐项核对' : '官方目录正在逐项整理'}</span><button onClick={() => navigateTo(`#technology/${selectedTechnology.slug}`)}>先读原理与选型说明 <ArrowRight size={14} /></button></div>
      </section>

      <FrameworkApiReferencePanel technologySlug={selectedTechnology.slug} technologyName={selectedTechnology.name} />

      <button className="project-api-evidence-cta" onClick={() => navigateTo(`#project-apis?stack=${selectedTechnology.slug}`)}>
        <FolderGit2 size={20} />
        <span><strong>官方 API 学完后，再看项目如何落地</strong><small>项目实现 API 是补充证据：包含业务封装、错误恢复、测试和固定 commit，不会改变这里的框架学习顺序。</small></span>
        <ArrowRight size={16} />
      </button>
    </DocsShell>
  )
}

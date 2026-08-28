import { Activity, ArrowRight, BadgeCheck, Check, CheckCircle2, ChevronRight, Clock3, ExternalLink, FolderGit2, GraduationCap, ShieldCheck, Target, Zap } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { navigateTo } from '../../app/router'
import { DocsShell } from '../../components/docs/DocsShell/DocsShell'
import { isPatternTechnology, type Technology } from '../../data/catalog'
import { getTechnologyLearningGuide } from '../../data/technology-learning'
import { getTechnologyMenuGroup } from '../../data/technology-menu'
import { useLessonProgress } from '../../features/progress/useLessonProgress'
import { ArticlePager } from './components/ArticlePager/ArticlePager'
import { ArticleSection } from './components/ArticleSection/ArticleSection'
import { CodeBlock } from './components/CodeBlock/CodeBlock'
import { OperationCard } from './components/OperationCard/OperationCard'
import { TechnologyComparison } from './components/TechnologyComparison/TechnologyComparison'

const TechnologyApiIndex = lazy(() => import('./components/TechnologyApiIndex/TechnologyApiIndex').then((module) => ({ default: module.TechnologyApiIndex })))
const TechnologyLearningSections = lazy(() => import('./components/TechnologyLearningSections/TechnologyLearningSections').then((module) => ({ default: module.TechnologyLearningSections })))
const TechnologyReferenceSection = lazy(() => import('./components/TechnologyLearningSections/TechnologyLearningSections').then((module) => ({ default: module.TechnologyReferenceSection })))
const DockerDeploymentLabs = lazy(() => import('./components/DockerDeploymentLabs/DockerDeploymentLabs').then((module) => ({ default: module.DockerDeploymentLabs })))

const TABLE_OF_CONTENTS = ['先判断是否需要', '选型决策图', '面试怎么讲', '定位与边界', '核心原理', '工作过程', '最小验证', '官方 API', '最佳实践', '生产化四维', '常见误区', '替代方案', '检查与练习', '证据与资料', '项目 API 索引', '项目证据']

export function TechnologyDetailPage({ tech }: { tech: Technology }) {
  const isPractice = isPatternTechnology(tech.slug)
  const learningName = tech.learningName ?? tech.name
  const progress = useLessonProgress(tech.slug)
  const guide = getTechnologyLearningGuide(tech.slug)
  const menuGroup = getTechnologyMenuGroup(tech.slug)
  const toc = isPractice ? TABLE_OF_CONTENTS.map((item) => item === '官方 API' ? '方法与检查表' : item) : tech.slug === 'docker' ? TABLE_OF_CONTENTS.slice(0, 14).map((item) => item === '最小验证' ? '三类部署实战' : item === '官方 API' ? 'Docker 指令参考' : item) : tech.slug === 'turborepo' ? TABLE_OF_CONTENTS.map((item) => item === '官方 API' ? 'Monorepo 与官方 API' : item) : TABLE_OF_CONTENTS
  return (
    <DocsShell active={`technology/${tech.slug}`} toc={toc}>
      <article className="article-page">
        <div className="breadcrumbs"><button onClick={() => navigateTo(isPractice ? '#patterns' : '#technologies')}>{isPractice ? '工程实践' : '新项目技术选型'}</button><ChevronRight size={13} /><span>{isPractice ? '组合方法 · 非技术栈' : menuGroup?.label ?? tech.category}</span><ChevronRight size={13} /><span>{learningName}</span></div>
        <header className="article-header">
          <div className="article-title-row"><span className="article-monogram" style={{ background: tech.accent }}>{learningName.slice(0, 2).toUpperCase()}</span><div><span className="section-kicker">{tech.eyebrow}</span><h1>{learningName}</h1>{tech.learningName && <small className="article-tool-name">核心工具：{tech.name}</small>}</div></div>
          <p>{guide.plainDefinition}</p>
          <div className="article-start-here"><span>先回答这个项目问题</span><strong>{guide.problem}</strong></div>
          <div className="article-meta"><span><GraduationCap size={15} />{tech.difficulty}</span><span><Clock3 size={15} />约 {tech.minutes} 分钟</span><span><BadgeCheck size={15} />核验于 {tech.verifiedAt}</span></div>
          <div className="evidence-banner"><BadgeCheck size={18} /><div><strong>{isPractice ? '这是工程实践，不是可安装的技术栈' : '先讲选型与原理，采用后再查 API'}</strong><p>{isPractice ? `组合工具/口径：${tech.version}。本章讲组合步骤、质量标准和真实项目证据，不会虚构统一官方 API。` : `核验版本/口径：${tech.version}。官方资料、工程经验和项目源码分别标注。`}</p></div></div>
        </header>

        <Suspense fallback={<div className="technology-api-empty"><strong>正在加载选型与面试内容…</strong></div>}><TechnologyLearningSections tech={tech} /></Suspense>

        <ArticleSection index={3} title="定位与边界：它负责什么，不负责什么">
          <div className="definition-card"><span>不用术语的一句话</span><p>{guide.plainDefinition}</p></div>
          <div className="two-column-copy"><div><h3>什么时候值得引入</h3><p>{tech.why}</p></div><div><h3>什么问题不要交给它</h3><p>{tech.boundary}</p></div></div>
          <div className="prerequisites"><strong>读代码前需要知道</strong>{tech.prerequisites.map((item) => <span key={item}>{item}</span>)}</div>
        </ArticleSection>

        <ArticleSection index={4} title="核心原理：先理解职责，再记名字">
          <div className="concept-grid">{tech.concepts.map((concept, index) => <article key={concept.name}><span>{String(index + 1).padStart(2, '0')}</span><h3>{concept.name}</h3><p>{concept.detail}</p></article>)}</div>
        </ArticleSection>

        <ArticleSection index={5} title="工作过程：一次任务怎样走完">
          <div className="flow-diagram">{tech.flow.map((step, index) => <div key={step}><span>{index + 1}</span><strong>{step}</strong>{index < tech.flow.length - 1 && <ArrowRight size={16} />}</div>)}</div>
          <p className="caption">先能用自己的话复述这条链路，再进入具体函数。面试官追问 API 时，你也知道它处于哪一步。</p>
        </ArticleSection>

        <ArticleSection index={6} title="最小验证：先证明选型成立">
          <div className="minimum-result"><strong>本章最先做出的结果</strong><p>{guide.firstResult}</p></div>
          <CodeBlock tech={tech} />
          <div className="code-explanation"><strong>代码只需要先看懂这几件事</strong>{tech.example.explanation.map((line) => <p key={line}><span><Check size={13} /></span>{line}</p>)}</div>
          {tech.slug === 'docker' && <Suspense fallback={<div className="technology-api-empty"><strong>正在加载三套部署实验…</strong></div>}><DockerDeploymentLabs /></Suspense>}
        </ArticleSection>

        <Suspense fallback={<div className="technology-api-empty"><strong>正在加载采用后的 API 参考…</strong></div>}><TechnologyReferenceSection tech={tech} /></Suspense>

        <ArticleSection index={8} title="最佳实践"><div className="practice-list">{tech.practices.map((practice, index) => <div key={practice}><span>{index + 1}</span><p>{practice}</p></div>)}</div></ArticleSection>
        <ArticleSection index={9} title="生产化四维"><div className="operations-grid"><OperationCard icon={Target} title="测试与评测" text={tech.operations.testing} /><OperationCard icon={Activity} title="可观测性" text={tech.operations.observability} /><OperationCard icon={ShieldCheck} title="安全与隐私" text={tech.operations.security} /><OperationCard icon={Zap} title="性能与成本" text={tech.operations.performance} /></div></ArticleSection>
        <ArticleSection index={10} title="常见误区与排查"><div className="pitfall-list">{tech.pitfalls.map((item) => <article key={item.title}><span>!</span><div><h3>{item.title}</h3><p>{item.detail}</p></div></article>)}</div></ArticleSection>
        <ArticleSection index={11} title="与主流技术栈横向对比"><TechnologyComparison tech={tech} /></ArticleSection>
        <ArticleSection index={12} title="生产检查与动手练习"><div className="exercise-grid"><div className="checklist-card"><h3><CheckCircle2 size={18} />上线前检查</h3>{tech.checklist.map((item) => <label key={item}><input type="checkbox" /> <span>{item}</span></label>)}</div><div className="exercise-card"><span className="section-kicker">HANDS-ON LAB</span><h3>{tech.exercise.task}</h3><p>完成标准</p>{tech.exercise.done.map((item) => <span key={item}><Check size={13} />{item}</span>)}</div></div></ArticleSection>
        <ArticleSection index={13} title="证据与延伸资料"><div className="source-list">{tech.sources.map((source) => {
          const content = <><span className={`source-label ${source.kind === '源码事实' ? 'source-code' : source.kind === '官方文档' ? 'source-doc' : 'source-exp'}`}>{source.kind}</span><div><strong>{source.label}</strong><p>{source.note}</p></div>{source.url && <ExternalLink size={15} />}</>
          return source.url ? <a className="source-item" key={source.label} href={source.url} target="_blank" rel="noreferrer">{content}</a> : <div className="source-item no-link" key={source.label}>{content}</div>
        })}</div></ArticleSection>
        {tech.slug !== 'docker' && <><ArticleSection index={14} title={`${tech.name} 真实项目 API 索引`}><Suspense fallback={<div className="technology-api-empty"><strong>正在加载 API 索引…</strong></div>}><TechnologyApiIndex technologySlug={tech.slug} /></Suspense></ArticleSection>
        <ArticleSection index={15} title="项目只作为最后的实现证据">{tech.usage.length > 0 ? <div className="usage-list">{tech.usage.map((item) => <article key={`${item.project}-${item.role}`}><div><FolderGit2 size={17} /><strong>{item.project}</strong><span className="source-label source-code">源码证据</span></div><p>{item.role}</p><code>{item.evidence}</code></article>)}</div> : <div className="technology-api-empty"><strong>当前项目群未发现一方使用证据</strong><p>本章仍按官方资料教学，但不会虚构项目案例。</p></div>}</ArticleSection></>}

        <div className="article-complete"><div><strong>{progress.completed ? '本章已完成' : '完成这一章了吗？'}</strong><p>进度只保存在当前浏览器，你可以随时取消或重置。</p></div><button className={`button ${progress.completed ? 'button-complete' : 'button-primary'}`} onClick={progress.toggle}>{progress.completed ? <CheckCircle2 size={16} /> : <Check size={16} />}{progress.completed ? '已完成' : '标记为完成'}</button></div>
        <ArticlePager current={tech} />
      </article>
    </DocsShell>
  )
}

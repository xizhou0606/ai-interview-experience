import { BookOpen, ExternalLink, GraduationCap, RefreshCw, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getFrameworkApiCatalog } from '../../../../data/framework-apis/catalogs'
import { loadFrameworkApis } from '../../../../data/framework-apis/loaders'
import type { FrameworkApiReference } from '../../../../data/framework-apis/types'
import { AiSdkQuickstart } from './AiSdkQuickstart'
import { LangChainQuickstart, LangfuseQuickstart, LiveKitQuickstart } from './AdvancedStackQuickstarts'
import { FrameworkApiDetail } from './FrameworkApiDetail'
import { LangGraphQuickstart } from './LangGraphQuickstart'
import { McpQuickstart } from './McpQuickstart'
import { MonorepoGuide } from './MonorepoGuide'
import { BetterAuthQuickstart, NanobotQuickstart, OpenAiCompatibleQuickstart, OpenAiJavascriptSdkQuickstart } from './RemainingStackQuickstarts'
import { BullMqQuickstart, MastraQuickstart, QdrantQuickstart } from './StackQuickstarts'
import { SolidQuickstart, TanStackQuickstart, TurborepoQuickstart, ViteQuickstart } from './FrontendStackQuickstarts'

export function FrameworkApiReferencePanel({ technologySlug, technologyName }: { technologySlug: string; technologyName: string }) {
  const [allApis, setAllApis] = useState<FrameworkApiReference[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const catalog = getFrameworkApiCatalog(technologySlug)
  const [group, setGroup] = useState('全部')
  const [level, setLevel] = useState('全部')
  const [search, setSearch] = useState('')
  const groups = ['全部', ...new Set(allApis.map((api) => api.group))]
  const hasLearningLevels = allApis.some((api) => api.learningLevel)
  const structuredCount = allApis.filter((api) => api.parameters?.length && api.expectedOutput && api.errorCases?.length && api.relatedApis?.length).length
  const levelOptions = [
    { value: '全部', label: '全部层级' },
    { value: 'core', label: '必学核心' },
    { value: 'advanced', label: '进阶能力' },
    { value: 'reference', label: '按需查阅' },
  ]
  const visible = allApis.filter((api) => (group === '全部' || api.group === group) && (level === '全部' || api.learningLevel === level) && `${api.name} ${api.signature} ${api.beginner} ${api.whenToUse}`.toLowerCase().includes(search.trim().toLowerCase()))

  const navigateToApi = (slug: string) => {
    setSearch('')
    setGroup('全部')
    setLevel('全部')
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      const target = document.getElementById(`framework-api-${slug}`)
      if (!(target instanceof HTMLDetailsElement)) return
      target.open = true
      if (window.location.hash.startsWith('#apis')) window.history.replaceState(null, '', `#apis?tech=${technologySlug}&api=${slug}`)
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }))
  }

  const navigateToApiByName = (name: string) => {
    const target = allApis.find((api) => api.name === name)
    if (target) navigateToApi(target.slug)
  }

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError('')
    setAllApis([])
    setGroup('全部')
    setLevel('全部')
    setSearch('')
    loadFrameworkApis(technologySlug).then((apis) => {
      if (active) setAllApis(apis)
    }).catch(() => {
      if (active) setLoadError(`${technologyName} 官方 API 目录加载失败，请检查网络或重新加载。`)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [reloadKey, technologyName, technologySlug])

  useEffect(() => {
    if (loading || allApis.length === 0) return
    const params = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
    const targetSlug = params.get('api')
    if (!targetSlug) return
    const target = document.getElementById(`framework-api-${targetSlug}`)
    if (!(target instanceof HTMLDetailsElement)) return
    target.open = true
    window.requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }, [allApis, loading])

  if (loading) return <div className="technology-api-empty"><strong>正在按官方目录加载 {technologyName} API…</strong></div>
  if (loadError) return <div className="framework-api-coming framework-api-load-error"><RefreshCw size={20} /><div><strong>{loadError}</strong><p>这里不会回退显示上一个技术栈的数据，以免把不同框架的 API 混在一起。</p><button type="button" onClick={() => setReloadKey((value) => value + 1)}>重新加载</button></div></div>
  if (allApis.length === 0 || !catalog) return <div className="framework-api-coming"><BookOpen size={20} /><div><strong>{technologyName} 暂无单一官方 API 目录</strong><p>如果它是工程模式，本章会以原理、方法、工具链和检查表为主；如果它是框架，官方函数/类/Hook 会在核对完成后逐项接入，不用项目 API 冒充。</p></div></div>

  return (
    <div className="framework-api-reference">
      <div className="framework-api-reference-head"><div><span>OFFICIAL API REFERENCE</span><strong>{allApis.length} / {catalog.expectedCount}</strong><p>{catalog.coverageBasis}已按本章公开学习口径逐项覆盖，核验于 {catalog.verifiedAt}。{structuredCount === allApis.length ? `本目录 ${structuredCount} 项全部具备参数、输出、错误恢复和关联学习路径。` : structuredCount > 0 ? `其中 ${structuredCount} 项已进入深度教学层，其余仍是详细速查卡。` : '当前目录是逐 API 速查层，结构化参数教学仍在继续补齐。'}项目实现只在后续作为落地证据补充。</p></div><a href={catalog.officialIndexUrl} target="_blank" rel="noreferrer">查看官方参考 <ExternalLink size={13} /></a></div>
      {technologySlug === 'turborepo' && <MonorepoGuide />}
      {technologySlug === 'ai-sdk-6' && <AiSdkQuickstart />}
      {technologySlug === 'mcp' && <McpQuickstart />}
      {technologySlug === 'langgraph' && <LangGraphQuickstart />}
      {technologySlug === 'mastra' && <MastraQuickstart />}
      {technologySlug === 'qdrant' && <QdrantQuickstart />}
      {technologySlug === 'bullmq' && <BullMqQuickstart />}
      {technologySlug === 'langchain' && <LangChainQuickstart />}
      {technologySlug === 'livekit-agents' && <LiveKitQuickstart />}
      {technologySlug === 'langfuse' && <LangfuseQuickstart />}
      {technologySlug === 'better-auth' && <BetterAuthQuickstart />}
      {technologySlug === 'nanobot' && <NanobotQuickstart />}
      {technologySlug === 'openai-compatible' && <OpenAiCompatibleQuickstart />}
      {technologySlug === 'openai-javascript-sdk' && <OpenAiJavascriptSdkQuickstart />}
      {technologySlug === 'vite' && <ViteQuickstart />}
      {technologySlug === 'turborepo' && <TurborepoQuickstart />}
      {technologySlug === 'solid-js' && <SolidQuickstart />}
      {technologySlug === 'tanstack' && <TanStackQuickstart />}
      <div className="framework-api-filters"><label><Search size={15} /><span className="sr-only">搜索官方 API</span><input name="framework-api-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索函数、Hook、场景或签名…" /></label>{hasLearningLevels && <div className="framework-api-levels"><span><GraduationCap size={14} />学习顺序</span>{levelOptions.map((item) => <button key={item.value} className={level === item.value ? 'active' : ''} aria-pressed={level === item.value} onClick={() => setLevel(item.value)}>{item.label} {item.value === '全部' ? allApis.length : allApis.filter((api) => api.learningLevel === item.value).length}</button>)}</div>}<div className="framework-api-groups"><span>能力分组</span>{groups.map((item) => <button key={item} className={group === item ? 'active' : ''} aria-pressed={group === item} onClick={() => setGroup(item)}>{item}{item === '全部' ? ` ${allApis.length}` : ` ${allApis.filter((api) => api.group === item).length}`}</button>)}</div></div>
      <p className="framework-api-result">当前显示 <strong>{visible.length}</strong> 项。建议先筛“必学核心”，再进入进阶能力；展开后按参数 → 案例 → 输出 → 错误 → 面试的顺序学习。</p>
      <div className="framework-api-list">
        {visible.map((api, index) => <FrameworkApiDetail key={api.slug} api={api} technologySlug={technologySlug} previous={visible[index - 1]} next={visible[index + 1]} onNavigate={navigateToApi} onNavigateByName={navigateToApiByName} />)}
      </div>
      {visible.length === 0 && <div className="framework-api-empty"><strong>没有匹配的官方 API</strong><p>尝试清空搜索或切换分组。</p></div>}
    </div>
  )
}

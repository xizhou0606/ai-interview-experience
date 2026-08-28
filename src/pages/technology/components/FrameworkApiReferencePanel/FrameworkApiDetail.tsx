import { AlertTriangle, ArrowLeft, ArrowRight, Check, Clipboard, ExternalLink, Link2, MonitorSmartphone, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import type { FrameworkApiReference } from '../../../../data/framework-apis/types'

const maturityLabel = { stable: '稳定 API', experimental: '实验性', 'type-only': '类型/API 合同' }
const learningLabel = { core: '必学核心', advanced: '进阶能力', reference: '按需查阅' }
const runtimeLabel = { server: '可信服务端', client: '客户端 / 浏览器 UI', both: '服务端与客户端均可' }
const kindLabel = { function: '函数/方法', class: '类', interface: '接口', type: '类型', object: '协议对象', hook: 'Hook / 生命周期钩子', transport: '传输层', middleware: '中间件', command: 'CLI 命令', configuration: '配置合同' }

function apiStatus(api: FrameworkApiReference) {
  if (api.lifecycle === 'experimental' && api.maturity === 'type-only') return { label: '实验性 · 类型合同', className: 'experimental' }
  return { label: maturityLabel[api.maturity], className: api.lifecycle ?? api.maturity }
}

function runtimeStatus(runtime: NonNullable<FrameworkApiReference['runtime']>, technologySlug: string) {
  if (technologySlug === 'vite') {
    if (runtime === 'client') return { label: '浏览器 HMR 客户端', copy: '只在开发模式的浏览器模块中使用，并始终放进 import.meta.hot 条件保护；生产构建会移除这条分支。' }
    if (runtime === 'server') return { label: 'Node.js 开发 / 构建进程', copy: '运行在 Vite CLI、配置或插件进程中。这里的“服务端”指构建工具边界，不是业务 API，也不自动具备生产服务能力。' }
    return { label: 'Node.js 与 HMR 客户端通信', copy: '能力跨越开发服务器和浏览器 HMR WebSocket，两端都要验证事件、清理监听并避免传递秘密数据。' }
  }
  if (technologySlug === 'mcp') {
    if (runtime === 'client') return { label: 'MCP Client / Host 发起', copy: '这里的 Client 通常是 AI Host 内的协议客户端，不等于浏览器。它负责发送请求，并执行用户授权与能力过滤。' }
    if (runtime === 'server') return { label: 'MCP Server 发起', copy: '这是 Server 向 Client 发出的反向请求或通知；只有 Client 在 initialize 中声明对应 capability 后才能使用。' }
    return { label: 'MCP 协议两端均可发起', copy: '发送方向取决于当前操作的所有者；双方都要用当前会话的 request id、能力协商和取消规则收口。' }
  }
  return {
    label: runtimeLabel[runtime],
    copy: runtime === 'client'
      ? '只能放在客户端组件或浏览器交互层，密钥和模型调用仍应留在服务端。'
      : runtime === 'server'
        ? '应运行在可信服务端，避免把模型密钥、工具权限或敏感数据暴露给浏览器。'
        : '两端都能使用，但要根据数据与权限边界选择入口，不能因为“可运行”就混淆信任边界。',
  }
}

function interviewScript(api: FrameworkApiReference) {
  return `如果面试官问到 ${api.name}，我会先给出定位：${api.beginner} 适合的场景是：${api.whenToUse} 核心原理和设计重点是：${api.interview} 真正上线时还要主动补充风险：${api.pitfall}`
}

interface FrameworkApiDetailProps {
  api: FrameworkApiReference
  technologySlug: string
  previous?: FrameworkApiReference
  next?: FrameworkApiReference
  onNavigate: (slug: string) => void
  onNavigateByName: (name: string) => void
}

export function FrameworkApiDetail({ api, technologySlug, previous, next, onNavigate, onNavigateByName }: FrameworkApiDetailProps) {
  const [copied, setCopied] = useState('')
  const [hasOpened, setHasOpened] = useState(false)
  const copy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(key)
    window.setTimeout(() => setCopied(''), 1400)
  }
  const shareUrl = window.location.origin + window.location.pathname + `#apis?tech=${technologySlug}&api=${api.slug}`
  const status = apiStatus(api)
  const runtime = api.runtime ? runtimeStatus(api.runtime, technologySlug) : undefined

  return (
    <details id={`framework-api-${api.slug}`} onToggle={(event) => {
      if (event.currentTarget.open) {
        setHasOpened(true)
        if (window.location.hash.startsWith('#apis')) window.history.replaceState(null, '', `#apis?tech=${technologySlug}&api=${api.slug}`)
      }
    }}>
      <summary><span><b>{api.group}</b><strong>{api.name}</strong><code>{api.signature}</code></span><div className="framework-api-badges"><em className="framework-api-kind">{kindLabel[api.kind]}</em><em className={`maturity-${status.className}`}>{status.label}</em>{api.learningLevel && <em className={`learning-${api.learningLevel}`}>{learningLabel[api.learningLevel]}</em>}</div><span className="framework-api-chevron" aria-hidden="true">⌄</span></summary>
      {hasOpened && <div className="framework-api-detail">
        <div className="framework-api-signature"><div><span>完整签名</span><code>{api.signature}</code></div><button type="button" onClick={() => copy(api.signature, 'signature')}>{copied === 'signature' ? <Check size={13} /> : <Clipboard size={13} />}{copied === 'signature' ? '已复制' : '复制签名'}</button></div>

        <div className="framework-api-beginner"><span>先说人话</span><p>{api.beginner}</p></div>

        {(runtime || api.learningLevel) && <div className="framework-api-learning-meta">{api.learningLevel && <div><strong>{learningLabel[api.learningLevel]}</strong><p>{api.learningLevel === 'core' ? '建议第一轮就学会，并能独立写出最小案例。' : api.learningLevel === 'advanced' ? '掌握核心链路后再学，用于复杂交互或生产能力。' : '先知道它解决什么，遇到对应问题时再按需查阅。'}</p></div>}{runtime && <div><MonitorSmartphone size={17} /><strong>运行边界：{runtime.label}</strong><p>{runtime.copy}</p></div>}</div>}

        {api.parameters && api.parameters.length > 0 && <div className="framework-api-parameters"><div><span>参数逐项解释</span><small>必填、默认值和职责一次看清</small></div><div className="framework-api-parameter-table" role="table" aria-label={`${api.name} 参数说明`}><div className="framework-api-parameter-head" role="row"><strong role="columnheader">参数</strong><strong role="columnheader">类型 / 要求</strong><strong role="columnheader">初学者解释</strong></div>{api.parameters.map((parameter) => <div className="framework-api-parameter-row" role="row" key={parameter.name}><code role="cell">{parameter.name}</code><div role="cell"><code>{parameter.type}</code><span className={parameter.required ? 'required' : 'optional'}>{parameter.required ? '必填' : '可选'}</span>{parameter.defaultValue && <small>默认：{parameter.defaultValue}</small>}</div><p role="cell">{parameter.description}</p></div>)}</div></div>}

        <div className="framework-api-steps"><span>初学者四步使用法</span><ol><li><strong>先判断是否该用：</strong>{api.whenToUse}</li><li><strong>准备参数：</strong>对照完整签名准备必需输入；不熟悉的类型先点本卡底部官方文档确认。</li><li><strong>调用并处理结果：</strong>{api.returns}</li><li><strong>上线前做保护：</strong>{api.pitfall}</li></ol></div>

        <div className="framework-api-two-col"><article><span>什么时候用</span><p>{api.whenToUse}</p></article><article><span>会得到什么</span><p>{api.returns}</p></article></div>

        <div className="framework-api-example"><div><span>聚焦当前 API 的最小案例</span><div><code>{api.exampleLanguage}</code><button type="button" onClick={() => copy([api.imports, api.example].filter(Boolean).join('\n\n'), 'example')}>{copied === 'example' ? <Check size={12} /> : <Clipboard size={12} />}{copied === 'example' ? '已复制' : '复制案例'}</button></div></div><pre><code>{api.imports ? `${api.imports}\n\n${api.example}` : api.example}</code></pre>{api.imports && <p className="framework-api-example-note">这段示例只突出当前 API；其中 model、prompt、tools 等占位变量需使用本章“先跑通完整链路”中的 Provider 和业务输入。</p>}</div>

        {api.expectedOutput && <div className="framework-api-output"><Check size={17} /><div><span>预期输出 / 如何判断成功</span><p>{api.expectedOutput}</p></div></div>}

        {api.errorCases && api.errorCases.length > 0 && <div className="framework-api-errors"><div><RotateCcw size={17} /><div><span>错误与恢复</span><p>不要只会成功路径；面试和生产环境都要说明失败后怎么收口。</p></div></div>{api.errorCases.map((errorCase) => <article key={`${errorCase.condition}-${errorCase.handling}`}><strong>{errorCase.condition}</strong><p>{errorCase.handling}</p></article>)}</div>}

        <div className="framework-api-two-col"><article className="interview"><span>核心原理 / 面试要点</span><p>{api.interview}</p></article><article className="pitfall"><span><AlertTriangle size={12} />常见坑</span><p>{api.pitfall}</p></article></div>

        <blockquote className="framework-api-script"><span>面试可直接复述</span><p>“{interviewScript(api)}”</p><small>建议按“定位 → 场景 → 原理 → 风险”记忆，不必逐字背诵。</small></blockquote>

        {api.relatedApis && api.relatedApis.length > 0 && <div className="framework-api-related"><span>相关 API · 建议接着学</span><div>{api.relatedApis.map((name) => <button type="button" key={name} onClick={() => onNavigateByName(name)}>{name}</button>)}</div></div>}

        <div className="framework-api-actions"><a href={api.officialUrl} target="_blank" rel="noreferrer">打开 {api.name} 官方文档 <ExternalLink size={13} /></a><button type="button" onClick={() => copy(shareUrl, 'link')}><Link2 size={13} />{copied === 'link' ? '链接已复制' : '复制 API 深链'}</button></div>

        <nav className="framework-api-adjacent" aria-label="相邻 API">{previous ? <button type="button" onClick={() => onNavigate(previous.slug)}><ArrowLeft size={14} /><span>上一个<small>{previous.name}</small></span></button> : <span />}{next && <button type="button" onClick={() => onNavigate(next.slug)}><span>下一个<small>{next.name}</small></span><ArrowRight size={14} /></button>}</nav>
      </div>}
    </details>
  )
}

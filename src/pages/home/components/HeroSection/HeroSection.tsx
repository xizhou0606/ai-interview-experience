import { ArrowRight, ArrowUpRight, BadgeCheck, CheckCircle2, Play } from 'lucide-react'
import { navigateTo } from '../../../../app/router'
import { frameworkTechnologies } from '../../../../data/catalog'
import { frameworkApiCatalogs, frameworkApiReferenceCount } from '../../../../data/framework-apis/catalogs'

export function HeroSection() {
  const completed = Number(localStorage.getItem('ai-guide-completed-count') || '0')
  return (
    <section className="hero-section">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-copy">
        <div className="eyebrow"><span className="live-dot" /> {frameworkApiCatalogs.length} 个技术栈目录已逐项核对 · {frameworkApiReferenceCount} 个学习口径 API</div>
        <h1>为下一个项目，<br />选对 <em>AI 技术方案</em></h1>
        <p>从“我要做什么”出发，比较候选技术、理解核心原理和工程取舍。决定采用后，再进入官方 API 与真实源码。你不需要先背任何框架名。</p>
        <div className="hero-actions">
          <button className="button button-primary" onClick={() => navigateTo('#technologies')}><Play size={16} fill="currentColor" />按项目目标选技术</button>
          <button className="button button-quiet" onClick={() => navigateTo('#roadmap')}>查看选型路线<ArrowRight size={16} /></button>
        </div>
        <div className="hero-proof"><span><BadgeCheck size={15} />先判断是否需要</span><span><BadgeCheck size={15} />讲清原理与取舍</span><span><BadgeCheck size={15} />最后查看 API 和源码</span></div>
      </div>
      <aside className="continue-card">
        <div className="continue-top"><span>你的学习台</span><span className="status-pill">本地保存</span></div>
        <div className="progress-visual">
          <div className="progress-ring" style={{ '--progress': `${Math.min(100, completed * 10)}deg` } as React.CSSProperties}><strong>{completed}</strong><small>/ {frameworkTechnologies.length}</small></div>
          <div><span className="mini-label">建议从这里开始</span><h2>你准备做什么产品？</h2><p>聊天、Agent、知识库、语音、Web 产品或质量平台，先选问题再选框架。</p></div>
        </div>
        <div className="lesson-preview"><span className="lesson-number">01</span><div><small>第一步 · 不需要懂框架名</small><strong>按六类新项目目标查看候选方案</strong></div><button onClick={() => navigateTo('#technologies')} aria-label="开始选择技术"><ArrowUpRight size={17} /></button></div>
        <div className="continue-foot"><span><CheckCircle2 size={15} />完成章节后手动记录进度</span></div>
      </aside>
    </section>
  )
}

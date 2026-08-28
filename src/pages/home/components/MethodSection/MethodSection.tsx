import { ArrowUpRight, FileCode2, Network, Target } from 'lucide-react'
import { navigateTo } from '../../../../app/router'

const METHODS = [
  { icon: FileCode2, number: '01', title: '先按技术栈学官方 API', body: '以官方 Reference 为分母，逐项讲签名、输入输出、场景、案例与常见坑。' },
  { icon: Network, number: '02', title: '再理解核心原理', body: '用思维导图、完整调用链和边界解释，把零散 API 连接成运行机制。' },
  { icon: Target, number: '03', title: '最后用项目验证', body: '真实项目只用于核对组合方式、失败路径、测试证据和生产最佳实践。' },
]

export function MethodSection() {
  return (
    <section className="section-wrap method-section">
      <div className="section-heading centered"><span className="section-kicker">HOW IT WORKS</span><h2>每一章，都能追溯和验证</h2><p>遵循 Diátaxis 内容方法，把教程、操作指南、原理解释和参考资料分开组织。</p></div>
      <div className="method-grid">{METHODS.map(({ icon: Icon, number, title, body }) => <article key={number}><div className="method-icon"><Icon size={20} /></div><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      <div className="reference-strip"><span>体验参考</span><strong>Vercel Academy</strong><i /><strong>LangChain Docs</strong><i /><strong>roadmap.sh</strong><i /><strong>Full Stack Deep Learning</strong><button onClick={() => navigateTo('#sources')}>查看研究方法 <ArrowUpRight size={14} /></button></div>
    </section>
  )
}

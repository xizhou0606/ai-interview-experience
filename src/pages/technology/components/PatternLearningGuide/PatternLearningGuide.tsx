import { CheckCircle2, GitBranch, Wrench } from 'lucide-react'
import type { Technology } from '../../../../data/catalog'

export function PatternLearningGuide({ tech }: { tech: Technology }) {
  return (
    <div className="pattern-learning-guide">
      <div className="pattern-learning-intro"><Wrench size={20} /><div><strong>{tech.name} 是工程方法，不是单一框架</strong><p>它没有一个可以声称“全部 API”的官方分母。这里改为学习可复用的方法步骤、工具组合和验收标准；具体 API 请回到相关框架章节逐项查看。</p></div></div>
      <div className="pattern-learning-columns">
        <article><div><GitBranch size={16} /><strong>标准实施步骤</strong></div><ol>{tech.flow.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol></article>
        <article><div><CheckCircle2 size={16} /><strong>完成验收标准</strong></div>{tech.checklist.map((item) => <p key={item}>{item}</p>)}</article>
      </div>
      <div className="pattern-learning-practices"><strong>初学者先照着做</strong>{tech.practices.map((item, index) => <p key={item}><span>{index + 1}</span>{item}</p>)}</div>
    </div>
  )
}

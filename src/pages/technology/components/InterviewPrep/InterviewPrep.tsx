import { Check, Clipboard, MessageSquareQuote } from 'lucide-react'
import { useState } from 'react'
import type { Technology } from '../../../../data/catalog'
import { getTechnologyLearningGuide } from '../../../../data/technology-learning'

function buildAnswer(tech: Technology) {
  const guide = getTechnologyLearningGuide(tech.slug)
  return [
    `我是在解决这个问题时考虑 ${tech.name}：${guide.problem}`,
    `它不是一个需要先背 API 的名词。简单说，${guide.plainDefinition}`,
    `它最关键的原理是：${guide.principle}`,
    `我选择它的前提是“${guide.chooseWhen[0]}”；如果“${guide.avoidWhen[0]}”，我会先选更简单或更合适的方案。`,
    `落地时我先做的最小结果是：${guide.firstResult} 然后再验证 ${tech.pitfalls[0]?.title ?? '失败恢复'} 和安全边界。`,
  ]
}

export function InterviewPrep({ tech }: { tech: Technology }) {
  const [copied, setCopied] = useState(false)
  const guide = getTechnologyLearningGuide(tech.slug)
  const answerParts = buildAnswer(tech)
  const longAnswer = answerParts.join('\n\n')
  const copy = async () => {
    await navigator.clipboard.writeText(longAnswer)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  const followups = [
    ['为什么项目需要它？', guide.problem],
    ['最核心的工作原理是什么？', guide.principle],
    ['什么时候不应该选？', guide.avoidWhen.join('；')],
    ['如何证明选型有效？', `${guide.firstResult} ${tech.operations.testing}`],
    ['上线最危险的点是什么？', `${tech.pitfalls[0]?.title}：${tech.pitfalls[0]?.detail}`],
  ]
  return (
    <div className="interview-prep">
      <div className="interview-formula"><MessageSquareQuote size={19} /><div><span>不要背框架介绍</span><strong>项目问题 → 白话定义 → 核心原理 → 选择理由 → 风险与验证</strong><p>这五步能证明你做过技术判断，而不是只读过文档。</p></div></div>
      <div className="interview-plain-answer"><div><span>30 秒白话回答</span><button onClick={copy}>{copied ? <Check size={13} /> : <Clipboard size={13} />}{copied ? '已复制' : '复制回答'}</button></div><p>“{answerParts.slice(0, 3).join(' ')}”</p></div>
      <div className="interview-answer-steps">{answerParts.map((part, index) => <article key={part}><span>{index + 1}</span><div><strong>{['先说项目问题', '再用白话定义', '讲核心原理', '说明选型取舍', '用最小结果证明'][index]}</strong><p>{part}</p></div></article>)}</div>
      <div className="interview-followups"><strong>面试官继续追问时这样答</strong>{followups.map(([question, answer]) => <article key={question}><span>{question}</span><p>{answer}</p></article>)}</div>
      {tech.usage[0] && <div className="interview-evidence"><strong>最后补真实项目，不要从项目名开始</strong><p>“在 {tech.usage[0].project} 中，它用于 {tech.usage[0].role}。我可以继续说明当时的问题、为什么选它，以及代码证据。”</p><code>{tech.usage[0].evidence}</code></div>}
    </div>
  )
}

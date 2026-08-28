import { ArrowRight, CheckCircle2, Lightbulb, XCircle } from 'lucide-react'
import type { Technology } from '../../../../data/catalog'
import { getTechnologyLearningGuide } from '../../../../data/technology-learning'

export function BeginnerPrimer({ tech }: { tech: Technology }) {
  const guide = getTechnologyLearningGuide(tech.slug)
  return (
    <div className="beginner-primer">
      <div className="beginner-first-sentence"><Lightbulb size={20} /><div><span>先不用专业名词</span><strong>{guide.plainDefinition}</strong><p>{guide.analogy}</p></div></div>

      <div className="beginner-problem"><span>你通常会在这个时候遇到它</span><strong>{guide.problem}</strong></div>

      <div className="beginner-choice-grid">
        <article className="beginner-choose"><div><CheckCircle2 size={17} /><strong>适合考虑 {tech.name}</strong></div>{guide.chooseWhen.map((item) => <p key={item}>{item}</p>)}</article>
        <article className="beginner-avoid"><div><XCircle size={17} /><strong>先不要选它</strong></div>{guide.avoidWhen.map((item) => <p key={item}>{item}</p>)}</article>
      </div>

      <div className="beginner-first-result"><span>第一次动手不要做大项目</span><strong>{guide.firstResult}</strong></div>

      <div className="beginner-three-step">
        <article><span>项目问题</span><strong>{tech.flow[0]}</strong><p>先确认这是不是你真正要解决的问题，而不是因为技术流行。</p></article>
        <ArrowRight size={18} />
        <article><span>核心办法</span><strong>{guide.principle}</strong><p>面试和选型都先讲这条原理，再补充具体名词。</p></article>
        <ArrowRight size={18} />
        <article><span>验证结果</span><strong>{tech.flow[tech.flow.length - 1]}</strong><p>必须同时验证正常结果、失败恢复和技术边界。</p></article>
      </div>

      <div className="beginner-concepts"><div><strong>看到专业名词时，把它翻译成“负责什么”</strong></div>{tech.concepts.slice(0, 3).map((concept, index) => <article key={concept.name}><span>{index + 1}</span><div><strong>{concept.name}</strong><p>{concept.detail}</p></div></article>)}</div>
    </div>
  )
}

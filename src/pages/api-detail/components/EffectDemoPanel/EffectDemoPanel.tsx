import { CheckCircle2, LoaderCircle, Play, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ApiEffect } from '../../../../data/apis/types'

export function EffectDemoPanel({ effect }: { effect: ApiEffect }) {
  const [state, setState] = useState<'idle' | 'running' | 'done'>('idle')
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const run = () => {
    setState('running')
    timer.current = window.setTimeout(() => setState('done'), 700)
  }
  return (
    <div className="effect-demo">
      <div className="effect-demo-head"><div><span className="source-label source-code">确定性案例回放</span><h3>{effect.title}</h3><p>{effect.description}</p></div><button onClick={state === 'done' ? () => setState('idle') : run} disabled={state === 'running'}>{state === 'running' ? <LoaderCircle className="spin" size={15} /> : state === 'done' ? <RotateCcw size={15} /> : <Play size={15} />}{state === 'running' ? '执行中' : state === 'done' ? '重置' : '运行案例'}</button></div>
      <div className="effect-metrics">{effect.metrics.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>
      <div className={`effect-output ${state}`} aria-live="polite">{state === 'idle' && <p>点击“运行案例”查看已由源码与测试固定的结果快照。</p>}{state === 'running' && <p><LoaderCircle className="spin" size={16} />按真实调用顺序回放…</p>}{state === 'done' && effect.output.map((item) => <div key={item.label}><span><CheckCircle2 size={14} />{item.label}</span><strong className={item.tone ?? 'neutral'}>{item.value}</strong></div>)}</div>
      <small>安全说明：本站不请求生产密钥；效果来自固定输入、源码契约与测试证据。</small>
    </div>
  )
}

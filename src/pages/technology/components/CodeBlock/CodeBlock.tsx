import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { Technology } from '../../../../data/catalog'

export function CodeBlock({ tech }: { tech: Technology }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => { await navigator.clipboard.writeText(tech.example.code); setCopied(true); window.setTimeout(() => setCopied(false), 1500) }
  return <div className="code-block"><div className="code-head"><span><i className="dot-red" /><i className="dot-yellow" /><i className="dot-green" />{tech.example.filename}</span><button onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? '已复制' : '复制'}</button></div><pre><code>{tech.example.code}</code></pre></div>
}

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import type { ApiEntry } from '../../../../data/apis'

export function ApiCodeBlock({ api }: { api: ApiEntry }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(api.example.code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  return (
    <div className="api-code-block">
      <div><span>{api.example.language}</span><button onClick={copy} aria-live="polite">{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? '已复制' : '复制'}</button></div>
      <pre><code>{api.example.code}</code></pre>
    </div>
  )
}

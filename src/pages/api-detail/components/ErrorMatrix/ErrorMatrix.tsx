import { AlertTriangle, ArrowRight } from 'lucide-react'
import type { ApiEntry } from '../../../../data/apis'

export function ErrorMatrix({ errors }: { errors: ApiEntry['errors'] }) {
  return <div className="error-matrix">{errors.map((item) => <article key={item.condition}><div><AlertTriangle size={16} /><strong>{item.condition}</strong></div><p>{item.behavior}</p><span><ArrowRight size={13} />{item.recovery}</span></article>)}</div>
}

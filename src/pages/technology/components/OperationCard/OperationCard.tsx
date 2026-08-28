import type { LucideIcon } from 'lucide-react'

interface OperationCardProps { icon: LucideIcon; title: string; text: string }

export function OperationCard({ icon: Icon, title, text }: OperationCardProps) {
  return <article><div><Icon size={18} /><h3>{title}</h3></div><p>{text}</p></article>
}

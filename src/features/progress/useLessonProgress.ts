import { useState } from 'react'
import { frameworkTechnologies } from '../../data/catalog'

export function useLessonProgress(slug: string) {
  const [completed, setCompleted] = useState(() => localStorage.getItem(`ai-guide-complete-${slug}`) === '1')
  const toggle = () => {
    const next = !completed
    setCompleted(next)
    localStorage.setItem(`ai-guide-complete-${slug}`, next ? '1' : '0')
    const count = frameworkTechnologies.filter((item) => localStorage.getItem(`ai-guide-complete-${item.slug}`) === '1').length
    localStorage.setItem('ai-guide-completed-count', String(count))
  }
  return { completed, toggle }
}

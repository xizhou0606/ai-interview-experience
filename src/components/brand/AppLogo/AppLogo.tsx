import { TerminalSquare } from 'lucide-react'
import { navigateTo } from '../../../app/router'

export function AppLogo() {
  return (
    <button className="brand" onClick={() => navigateTo('#')}>
      <span className="brand-mark"><TerminalSquare size={17} strokeWidth={2.2} /></span>
      <span>AI 实战手册</span>
      <span className="brand-beta">BETA</span>
    </button>
  )
}

import { Code2, Menu, Search } from 'lucide-react'
import { NAV_ITEMS } from '../../../app/navigation'
import { navigateTo } from '../../../app/router'
import { AppLogo } from '../../brand/AppLogo/AppLogo'

interface HeaderProps {
  onSearch: () => void
  onMenu: () => void
}

export function Header({ onSearch, onMenu }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <AppLogo />
        <nav className="top-nav" aria-label="主导航">
          {NAV_ITEMS.map((item) => <button key={item.hash} onClick={() => navigateTo(item.hash)}>{item.label}</button>)}
        </nav>
        <div className="header-actions">
          <button className="search-trigger" onClick={onSearch} aria-label="搜索技术栈、官方 API 或项目证据 ⌘ K">
            <Search size={15} /><span>搜索技术栈、官方 API 或项目证据</span><kbd>⌘ K</kbd>
          </button>
          <a className="icon-button desktop-only" href="https://github.com/agniwen/ai-interview" target="_blank" rel="noreferrer" aria-label="查看 ai-interview 源码"><Code2 size={18} /></a>
          <button className="icon-button mobile-only" onClick={onMenu} aria-label="打开菜单"><Menu size={19} /></button>
        </div>
      </div>
    </header>
  )
}

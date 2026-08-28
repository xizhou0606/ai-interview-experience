import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { navigateTo } from '../../../app/router'

interface RouteErrorBoundaryProps {
  children: ReactNode
  resetKey: string
}

interface RouteErrorBoundaryState {
  error: Error | null
  isChunkError: boolean
}

const RECOVERY_PREFIX = 'ai-guide:chunk-recovery:'
const RECOVERY_WINDOW_MS = 30_000

function isChunkLoadError(error: Error) {
  return /failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module|chunkloaderror|loading chunk/i.test(error.message)
}

export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { error: null, isChunkError: false }
  private recoveryTimer?: number

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error, isChunkError: isChunkLoadError(error) }
  }

  componentDidMount() {
    this.scheduleRecoveryMarkerCleanup()
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Route rendering failed', error, info.componentStack)
    if (!isChunkLoadError(error)) return
    const key = this.recoveryKey()
    try {
      const lastAttempt = Number(window.sessionStorage.getItem(key) ?? 0)
      if (Date.now() - lastAttempt < RECOVERY_WINDOW_MS) return
      window.sessionStorage.setItem(key, String(Date.now()))
      window.location.reload()
    } catch {
      // Storage may be unavailable in privacy modes; the visible retry UI remains usable.
    }
  }

  componentDidUpdate(previousProps: RouteErrorBoundaryProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null, isChunkError: false })
    }
  }

  componentWillUnmount() {
    if (this.recoveryTimer) window.clearTimeout(this.recoveryTimer)
  }

  private recoveryKey() {
    return `${RECOVERY_PREFIX}${window.location.pathname}${window.location.hash}`
  }

  private scheduleRecoveryMarkerCleanup() {
    const key = this.recoveryKey()
    this.recoveryTimer = window.setTimeout(() => {
      try { window.sessionStorage.removeItem(key) } catch { /* no-op */ }
    }, 10_000)
  }

  private reloadLatest = () => {
    window.location.reload()
  }

  render() {
    const { error, isChunkError } = this.state
    if (!error) return this.props.children
    return (
      <main className="docs-main">
        <div className="route-error" role="alert">
          <span><AlertTriangle size={22} /></span>
          <div>
            <small>{isChunkError ? '页面资源版本已变化' : '本页暂时无法显示'}</small>
            <h1>{isChunkError ? '正在使用的页面版本已经过期' : '加载这一页时发生错误'}</h1>
            <p>{isChunkError ? '这通常发生在网站刚更新后：旧页面仍指向已经替换的脚本。重新加载即可获取最新版本，菜单和其他章节不会丢失。' : '错误已被限制在正文区域。你可以重新加载，或者先返回学习路线继续浏览其他章节。'}</p>
            <div><button type="button" className="button button-primary" onClick={this.reloadLatest}><RefreshCw size={15} />重新加载最新版本</button><button type="button" className="button" onClick={() => navigateTo('#roadmap')}><Home size={15} />返回学习路线</button></div>
            <details><summary>查看技术信息</summary><code>{error.message}</code></details>
          </div>
        </div>
      </main>
    )
  }
}

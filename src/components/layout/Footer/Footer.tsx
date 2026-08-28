import { navigateTo } from '../../../app/router'
import { AppLogo } from '../../brand/AppLogo/AppLogo'

export function Footer() {
  return (
    <footer className="site-footer">
      <div><AppLogo /><p>以技术栈和框架官方 API 为主线、以真实项目为落地证据的中文 AI 工程学习平台。</p></div>
      <div><span>内容</span><button onClick={() => navigateTo('#roadmap')}>学习路线</button><button onClick={() => navigateTo('#technologies')}>技术栈百科</button><button onClick={() => navigateTo('#apis')}>框架官方 API</button><button onClick={() => navigateTo('#projects')}>项目证据</button></div>
      <div><span>方法</span><button onClick={() => navigateTo('#patterns')}>工程模式</button><button onClick={() => navigateTo('#sources')}>资料与可信度</button></div>
      <p className="footer-note">Last verified · 2026.07.16</p>
    </footer>
  )
}

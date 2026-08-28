import { engineeringPatternTechnologies, frameworkTechnologies } from '../../../../data/catalog'
import { frameworkApiReferenceCount } from '../../../../data/framework-apis/catalogs'

export function StatBar() {
  return (
    <div className="stat-bar">
      <div><strong>{frameworkTechnologies.length}</strong><span>真实技术栈</span></div><i /><div><strong>{engineeringPatternTechnologies.length}</strong><span>独立工程实践</span></div><i /><div><strong>{frameworkApiReferenceCount}</strong><span>学习口径 API</span></div><i /><div><strong>480</strong><span>项目实现证据</span></div>
      <p>最近核验：2026.07.16 <span>·</span> 官方 Reference 与固定源码双重对账</p>
    </div>
  )
}

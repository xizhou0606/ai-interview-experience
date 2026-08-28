import { BadgeCheck, CircleDot, Code2, FlaskConical } from 'lucide-react'
import { getApiTechnologyStack, type ApiEntry } from '../../../../data/apis'

export function CoveragePanel({ entries }: { entries: ApiEntry[] }) {
  const tests = entries.reduce((sum, item) => sum + item.tests.length, 0)
  const production = entries.filter((item) => (item.implementationStatus ?? 'production') === 'production').length
  const projects = [...new Set(entries.map((item) => item.project))]
  const stacks = [...new Set(entries.map((item) => getApiTechnologyStack(item).slug))]
  return (
    <section className="coverage-panel" aria-label="API 文档覆盖状态">
      <div><CircleDot size={17} /><span><strong>{entries.length}</strong>已完成精讲</span></div>
      <div><BadgeCheck size={17} /><span><strong>{entries.length}</strong>绑定源码 commit</span></div>
      <div><FlaskConical size={17} /><span><strong>{entries.length}</strong>可见效果案例</span></div>
      <div><Code2 size={17} /><span><strong>{tests}</strong>测试证据</span></div>
      <p>当前按 {stacks.length} 个技术栈组织 {production} 个生产链路与 {entries.length - production} 个未接线、备用或尽力执行能力；{projects.length} 个固定 commit 项目只承担实现证据，不作为学习目录。</p>
    </section>
  )
}

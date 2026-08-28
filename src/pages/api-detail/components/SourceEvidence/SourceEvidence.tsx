import { BadgeCheck, ExternalLink, FileCode2, TestTube2 } from 'lucide-react'
import { sourceUrl, testUrl } from '../../../../data/apis/helpers'
import type { ApiEntry } from '../../../../data/apis'

export function SourceEvidence({ api }: { api: ApiEntry }) {
  const codeUrl = sourceUrl(api)
  return (
    <div className="api-evidence-list">
      {codeUrl ? <a href={codeUrl} target="_blank" rel="noreferrer"><FileCode2 size={17} /><div><span className="source-label source-code">源码事实</span><strong>{api.sourcePath}:{api.sourceLine}</strong><p>固定 commit {api.verifiedCommit}</p></div><ExternalLink size={14} /></a> : <div className="api-evidence-item is-static"><FileCode2 size={17} /><div><span className="source-label source-code">本地源码事实</span><strong>{api.sourcePath}:{api.sourceLine}</strong><p>本地 Git 固定 commit {api.verifiedCommit}，仓库未配置远程链接。</p></div></div>}
      {api.tests.map((test) => {
        const url = testUrl(test.path, api.project, api.verifiedCommit)
        const content = <><TestTube2 size={17} /><div><span className="source-label source-code">测试证据</span><strong>{test.path.split('/').at(-1)}</strong><p>{test.proves}</p></div>{url && <ExternalLink size={14} />}</>
        return url ? <a key={test.path} href={url} target="_blank" rel="noreferrer">{content}</a> : <div key={test.path} className="api-evidence-item is-static">{content}</div>
      })}
      {api.officialSources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><BadgeCheck size={17} /><div><span className="source-label source-doc">官方文档</span><strong>{source.label}</strong><p>用于核验版本 API 与推荐用法。</p></div><ExternalLink size={14} /></a>)}
    </div>
  )
}

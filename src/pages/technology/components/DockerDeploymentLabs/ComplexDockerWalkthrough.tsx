import { ArrowRight, Boxes, Copy, Database, ServerCog } from 'lucide-react'
import { useState } from 'react'
import { getDockerDeploymentGuide } from '../../../../data/docker-deployment-guides'

const complexGuide = getDockerDeploymentGuide('web-worker-postgres-redis')
const dockerfile = complexGuide?.files.find((file) => file.path === 'Dockerfile')
const composeFile = complexGuide?.files.find((file) => file.path === 'compose.yaml')
const annotatedDockerfile = dockerfile?.lines.map((line, index) => {
  if (!line.code) return ''
  if (index === 0 && line.code.startsWith('# syntax=')) return `${line.code}\n# ↑ ${line.explanation}`
  return `# ${line.explanation}\n${line.code}`
}).join('\n') ?? ''
const annotatedCompose = composeFile?.lines.map((line) => line.code ? `${line.code}  # ${line.explanation}` : `# ${line.explanation}`).join('\n') ?? ''
const dockerfileCapabilities = ['BuildKit 下载缓存', '固定运行时版本', '精确复制源码', '构建产物断言', '裁剪开发依赖', '非 root 用户', 'dumb-init 信号处理', 'Web / Worker 双 target']

export function ComplexDockerWalkthrough() {
  const [copied, setCopied] = useState<'dockerfile' | 'compose' | ''>('')
  if (!complexGuide || !dockerfile || !composeFile) return null

  const copy = (target: 'dockerfile' | 'compose', content: string) => navigator.clipboard.writeText(content).then(() => {
    setCopied(target)
    window.setTimeout(() => setCopied(''), 1200)
  })

  return (
    <article className="docker-complex-walkthrough">
      <header className="docker-complex-head">
        <div><span>复杂部署完整拆解</span><h3>Web / SSR + Worker + Redis + PostgreSQL</h3><p>浏览器只访问 Web；Web 与 Worker 共用业务镜像，但作为两个独立进程运行。Redis 承担队列或缓存，PostgreSQL 保存业务数据，两个依赖通过健康检查后才启动应用。</p></div>
        <strong>4 个服务 · 2 个数据卷 · 1 个内部网络</strong>
      </header>

      <div className="docker-architecture-strip" aria-label="复杂 Docker 部署结构">
        <div><Boxes size={17} /><span>浏览器</span></div><ArrowRight size={15} />
        <div><ServerCog size={17} /><span>Web / SSR</span></div><ArrowRight size={15} />
        <div className="docker-architecture-deps"><span><Database size={15} />PostgreSQL</span><span><Boxes size={15} />Redis</span></div>
        <div className="docker-worker-branch"><ArrowRight size={15} /><span><ServerCog size={15} />Worker 消费任务</span></div>
      </div>

      <div className="docker-build-order" aria-label="复杂 Docker 部署文件学习顺序">
        <div><span>1</span><p><strong>Dockerfile</strong>先把源码构建成可重复运行的 Web 与 Worker 镜像。</p></div>
        <ArrowRight size={16} />
        <div><span>2</span><p><strong>compose.yaml</strong>再把两个应用镜像与 Redis、PostgreSQL 连接起来。</p></div>
      </div>

      <div className="dockerfile-capabilities">
        <strong>这不是最小演示：先看它补齐了哪些生产问题</strong>
        <div>{dockerfileCapabilities.map((capability, index) => <span key={capability}><b>{String(index + 1).padStart(2, '0')}</b>{capability}</span>)}</div>
      </div>

      <section className="docker-featured-code">
        <header><div><span>第一份文件 · {annotatedDockerfile.split('\n').length} 行可运行代码</span><strong>Dockerfile</strong><p>每条 Docker 指令前都是以 # 开头的真实中文注释；页面看到什么，复制出来就是什么。</p></div><button type="button" onClick={() => copy('dockerfile', annotatedDockerfile)}><Copy size={13} />{copied === 'dockerfile' ? '已复制带注释文件' : '复制带注释 Dockerfile'}</button></header>
        <pre aria-label="复杂部署带完整中文注释的可运行 Dockerfile">{annotatedDockerfile.split('\n').map((line, index) => <span className={`docker-numbered-source-line${line.trimStart().startsWith('#') ? ' is-comment' : ''}`} key={`${index}-${line}`}><b>{index + 1}</b><code><span>{line || ' '}</span></code></span>)}</pre>
        <p className="docker-code-validity-note"><strong>为什么注释放在指令上一行？</strong> 这是 Dockerfile 的合法整行注释写法，复制后仍能直接构建。把 <code># 中文解释</code> 硬接在 <code>RUN</code>、<code>CMD</code> 末尾，反而可能被解析成命令参数。</p>
      </section>

      <section className="docker-featured-code">
        <header><div><span>第二份文件 · 每一行都带中文注释</span><strong>compose.yaml</strong><p>代码与解释写在同一行；YAML 支持行尾注释，复制后仍可直接保存成 compose.yaml。</p></div><button type="button" onClick={() => copy('compose', annotatedCompose)}><Copy size={13} />{copied === 'compose' ? '已复制' : '复制带注释 compose'}</button></header>
        <pre aria-label="复杂部署 compose.yaml 带逐行注释的完整代码">{composeFile.lines.map((line) => <span className="docker-numbered-source-line" key={line.lineNumber}><b>{line.lineNumber}</b><code><span>{line.code}</span><em>{line.code ? '  # ' : '# '}{line.explanation}</em></code></span>)}</pre>
      </section>

      <div className="docker-complex-takeaways">
        <strong>看完这段代码要能说清楚四件事</strong>
        <p><span className="docker-takeaway-number">1</span><span className="docker-takeaway-copy">容器间为什么使用 <code>postgres</code>、<code>redis</code> 服务名，而不是 localhost。</span></p>
        <p><span className="docker-takeaway-number">2</span><span className="docker-takeaway-copy"><code>depends_on + service_healthy</code> 只解决首次启动顺序，运行期仍需要断线重连。</span></p>
        <p><span className="docker-takeaway-number">3</span><span className="docker-takeaway-copy">Web 和 Worker 为什么共用构建产物，却必须拆成两个可独立重启和扩容的服务。</span></p>
        <p><span className="docker-takeaway-number">4</span><span className="docker-takeaway-copy">命名卷为什么能保留数据，但不能替代 PostgreSQL 备份和恢复演练。</span></p>
      </div>
    </article>
  )
}

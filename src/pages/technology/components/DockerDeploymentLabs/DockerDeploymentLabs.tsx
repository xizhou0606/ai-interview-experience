import { AlertTriangle, CheckCircle2, Copy, FolderTree, Play, ShieldCheck, TerminalSquare } from 'lucide-react'
import { useState } from 'react'
import { dockerDeploymentGuides } from '../../../../data/docker-deployment-guides'
import { ComplexDockerWalkthrough } from './ComplexDockerWalkthrough'

export function DockerDeploymentLabs() {
  const [copied, setCopied] = useState('')
  const copy = (key: string, content: string) => navigator.clipboard.writeText(content).then(() => {
    setCopied(key)
    window.setTimeout(() => setCopied(''), 1200)
  })

  return (
    <div className="docker-labs">
      <ComplexDockerWalkthrough />
      <div className="docker-labs-intro"><strong>继续查看 3 套完整配套文件</strong><p>上面已经把复杂项目的 Dockerfile 与 compose.yaml 按执行顺序铺开；下面继续提供静态站、SSR、含 Worker 复杂项目的全部配套文件、环境变量、启动、验收和排错。</p></div>
      {dockerDeploymentGuides.map((guide, guideIndex) => (
        <details className="docker-guide" key={guide.slug} open={guideIndex === 0}>
          <summary><span>{String(guideIndex + 1).padStart(2, '0')}</span><div><strong>{guide.title}</strong><p>{guide.target}</p></div></summary>
          <div className="docker-guide-body">
            <p className="docker-beginner-summary">{guide.beginnerSummary}</p>
            <div className="docker-preflight"><div><CheckCircle2 size={17} /><strong>开始前确认</strong>{guide.prerequisites.map((item) => <p key={item}>• {item}</p>)}</div><div><FolderTree size={17} /><strong>目录结构</strong><pre>{guide.directoryTree.join('\n')}</pre></div></div>
            {guide.files.map((file) => {
              const key = `${guide.slug}/${file.path}`
              return <section className="docker-file" key={key}><header><div><span>{file.language}</span><strong>{file.path}</strong><p>{file.purpose}</p></div><button type="button" onClick={() => copy(key, file.content)}><Copy size={13} />{copied === key ? '已复制' : '复制完整文件'}</button></header><pre className="docker-source"><code>{file.content}</code></pre><details className="docker-line-guide"><summary>逐行解释：共 {file.lines.length} 行</summary><div>{file.lines.map((line) => <div className="docker-explained-line" key={line.lineNumber}><span>{line.lineNumber}</span><code>{line.code || '（空行）'}</code><p>{line.explanation}</p></div>)}</div></details></section>
            })}
            <section className="docker-runbook"><h4><Play size={16} />构建与启动</h4>{guide.buildAndRun.map((item, index) => <div key={item.title}><span>{index + 1}</span><div><strong>{item.title}</strong><code>{item.command}</code><p>{item.explanation}</p></div></div>)}</section>
            <section className="docker-verify"><h4><TerminalSquare size={16} />怎样确认真的部署成功</h4>{guide.verification.map((item) => <div key={item.title}><strong>{item.title}</strong><code>{item.command}</code><p>预期：{item.expected}</p></div>)}</section>
            <section className="docker-errors"><h4><AlertTriangle size={16} />初学者最常遇到的问题</h4>{guide.commonErrors.map((item) => <article key={item.symptom}><strong>{item.symptom}</strong><p><b>原因：</b>{item.cause}</p><p><b>修复：</b>{item.fix}</p></article>)}</section>
            <section className="docker-production"><h4><ShieldCheck size={16} />上线前必须补上的安全与生产事项</h4>{guide.securityAndProduction.map((item) => <p key={item}>• {item}</p>)}</section>
          </div>
        </details>
      ))}
    </div>
  )
}

const referenceGroups = [
  { title: 'Dockerfile 指令', items: [['FROM', '选择基础镜像并开始一个构建阶段。'], ['WORKDIR', '设置后续命令的工作目录。'], ['COPY', '把构建上下文或前一阶段产物复制进镜像。'], ['RUN', '在构建阶段执行命令并形成镜像层。'], ['ARG / ENV', '分别设置构建期参数与镜像运行环境；都不应保存秘密。'], ['USER', '指定后续构建和默认运行用户。'], ['HEALTHCHECK', '定义 Docker 如何判断容器内应用是否健康。'], ['CMD / ENTRYPOINT', '定义容器启动的程序与默认参数。']] },
  { title: 'Docker CLI', items: [['docker build', '从 Dockerfile 构建镜像。'], ['docker run', '从镜像创建并启动一个容器。'], ['docker ps', '查看正在运行或全部容器。'], ['docker logs', '读取容器标准输出和错误输出。'], ['docker exec', '在运行中的容器里执行诊断命令。'], ['docker inspect', '读取镜像或容器的完整元数据和健康状态。'], ['docker stop', '发送停止信号并等待进程优雅退出。']] },
  { title: 'Compose CLI', items: [['docker compose config', '展开变量并验证最终配置，启动前先执行。'], ['docker compose build', '按 service 的 build/target 构建镜像。'], ['docker compose up -d', '创建网络、卷和服务并在后台启动。'], ['docker compose ps', '检查各服务状态和健康结果。'], ['docker compose logs', '按服务聚合查看日志。'], ['docker compose down', '删除容器和网络；默认保留命名卷。']] },
]

export function DockerCommandReference() {
  return <div className="docker-reference"><div className="docker-labs-intro"><strong>先掌握这 21 个常用指令</strong><p>Docker 没有像前端框架那样的单一函数 API。初学阶段以 Dockerfile、CLI 和 Compose 三套公开合同为主。</p></div>{referenceGroups.map((group) => <section key={group.title}><h3>{group.title}</h3>{group.items.map(([name, description]) => <div key={name}><code>{name}</code><p>{description}</p></div>)}</section>)}</div>
}

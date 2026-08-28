export type DockerDeploymentKind = 'static-spa' | 'node-ssr' | 'web-worker-stack'

export interface ExplainedCodeLine {
  lineNumber: number
  code: string
  explanation: string
}

export interface DeploymentFile {
  path: string
  language: 'dockerfile' | 'nginx' | 'yaml' | 'dotenv' | 'text'
  purpose: string
  content: string
  lines: ExplainedCodeLine[]
}

export interface DeploymentCommand {
  title: string
  command: string
  explanation: string
}

export interface DeploymentVerification {
  title: string
  command: string
  expected: string
}

export interface DeploymentCommonError {
  symptom: string
  cause: string
  fix: string
}

export interface DockerDeploymentGuide {
  slug: string
  kind: DockerDeploymentKind
  title: string
  target: string
  beginnerSummary: string
  prerequisites: string[]
  directoryTree: string[]
  files: DeploymentFile[]
  buildAndRun: DeploymentCommand[]
  verification: DeploymentVerification[]
  commonErrors: DeploymentCommonError[]
  securityAndProduction: string[]
}

type SourceLine = readonly [code: string, explanation: string]

function deploymentFile(
  path: string,
  language: DeploymentFile['language'],
  purpose: string,
  sourceLines: readonly SourceLine[],
): DeploymentFile {
  const lines = sourceLines.map(([code, explanation], index) => ({
    lineNumber: index + 1,
    code,
    explanation,
  }))

  return {
    path,
    language,
    purpose,
    content: lines.map((line) => line.code).join('\n'),
    lines,
  }
}

export const dockerDeploymentGuides: DockerDeploymentGuide[] = [
  {
    slug: 'vite-spa-nginx',
    kind: 'static-spa',
    title: 'Vite / SPA：多阶段构建后交给 Nginx 托管',
    target: '适用于 npm run build 生成 dist/ 的 Vite、React、Vue、Solid 或其他纯静态单页应用。',
    beginnerSummary: '第一阶段使用 Node 安装依赖并编译；第二阶段只复制 dist 和 Nginx 配置。最终镜像不包含源码、npm 和 node_modules，浏览器路由刷新由 try_files 回退到 index.html。',
    prerequisites: [
      '项目根目录存在 package.json 与锁文件 package-lock.json。',
      'npm run build 能在本机生成 dist/。',
      '应用是浏览器 SPA，不需要 Node 在生产环境执行服务端渲染。',
    ],
    directoryTree: [
      'project/',
      '├── src/',
      '├── public/',
      '├── package.json',
      '├── package-lock.json',
      '├── Dockerfile',
      '├── nginx.conf',
      '└── .dockerignore',
    ],
    files: [
      deploymentFile('Dockerfile', 'dockerfile', '先编译 SPA，再创建只包含静态文件和 Nginx 的运行镜像。', [
        ['FROM node:22-alpine AS build', '以 Node 22 Alpine 官方镜像创建名为 build 的构建阶段；这个阶段不会直接发布。'],
        ['WORKDIR /app', '把后续命令的工作目录设置为 /app；目录不存在时 Docker 会创建。'],
        ['COPY package.json package-lock.json ./', '先只复制依赖清单，让依赖未变化时可以复用后续 npm ci 的构建缓存。'],
        ['RUN npm ci', '严格按照 package-lock.json 安装依赖；锁文件与 package.json 不一致时立即失败。'],
        ['COPY . .', '把构建上下文中的项目文件复制到 /app；.dockerignore 会先排除无关或敏感文件。'],
        ['ARG VITE_API_BASE_URL=/api', '声明只在镜像构建阶段使用的公开配置，并提供 /api 默认值；ARG 不应用来保存秘密。'],
        ['ENV VITE_API_BASE_URL=$VITE_API_BASE_URL', '把构建参数提供给 Vite；VITE_ 前缀变量会被写进浏览器产物，因此任何人都能看到。'],
        ['RUN npm run build', '执行项目构建脚本并生成 /app/dist；若项目输出目录不同，需要同步修改复制路径。'],
        ['', '空行只用于分隔构建阶段和运行阶段，提高 Dockerfile 可读性。'],
        ['FROM nginx:alpine AS runtime', '开始全新的 runtime 阶段；最终镜像只以轻量 Nginx 官方镜像为基础。'],
        ['COPY nginx.conf /etc/nginx/conf.d/default.conf', '用项目配置替换 Nginx 默认站点配置。'],
        ['COPY --from=build /app/dist /usr/share/nginx/html', '只从 build 阶段复制编译后的静态文件，不复制源码和 Node 依赖。'],
        ['EXPOSE 80', '记录容器内服务预期监听 80；它是镜像元数据，不会自动把端口发布到宿主机。'],
        ['CMD ["nginx", "-g", "daemon off;"]', '以前台模式启动 Nginx，使主进程留在 PID 1；主进程退出时容器也随之停止。'],
      ]),
      deploymentFile('nginx.conf', 'nginx', '托管静态资源、支持 SPA 刷新，并暴露简单健康检查。', [
        ['server {', '开始一个 Nginx 虚拟主机配置块。'],
        ['  listen 80;', '让该虚拟主机在容器内监听 TCP 80 端口。'],
        ['  server_name _;', '使用兜底主机名匹配；真实域名通常由前置负载均衡器或反向代理处理。'],
        ['  root /usr/share/nginx/html;', '把 Dockerfile 复制静态产物的位置设为站点根目录。'],
        ['  index index.html;', '目录请求默认返回 index.html。'],
        ['', '空行分隔站点基础设置与静态资源规则。'],
        ['  location /assets/ {', '为 Vite 默认的带内容哈希静态资源目录定义独立规则。'],
        ['    try_files $uri =404;', '只返回真实存在的资源；不存在时返回 404，避免错误回退成 HTML。'],
        ['    add_header Cache-Control "public, max-age=31536000, immutable";', '允许带哈希资源长期缓存；文件内容变化时 Vite 会生成新文件名。'],
        ['  }', '结束 /assets/ 规则。'],
        ['', '空行分隔静态资源规则与 SPA 路由规则。'],
        ['  location / {', '匹配页面、根路径以及客户端路由。'],
        ['    try_files $uri $uri/ /index.html;', '先查真实文件或目录，均不存在时回退 index.html，让前端路由接管 URL。'],
        ['  }', '结束根路径规则。'],
        ['', '空行分隔页面规则与健康检查。'],
        ['  location = /healthz {', '精确匹配 /healthz，避免把其他类似路径当健康检查。'],
        ['    access_log off;', '关闭高频健康探测的访问日志，减少无意义日志。'],
        ['    default_type text/plain;', '明确健康检查响应的 Content-Type 是纯文本。'],
        ['    return 200 "ok\\n";', '不读取磁盘，直接返回 HTTP 200 和 ok 文本。'],
        ['  }', '结束健康检查规则。'],
        ['}', '结束 server 配置块。'],
      ]),
      deploymentFile('.dockerignore', 'text', '缩小构建上下文，并避免把本地依赖、产物和配置文件发送给 Docker builder。', [
        ['node_modules', '排除宿主机依赖；容器必须按锁文件自行安装与目标平台匹配的依赖。'],
        ['dist', '排除宿主机构建结果，防止旧文件覆盖容器内的新构建。'],
        ['.git', '排除 Git 对象和历史，缩小构建上下文。'],
        ['.env', '排除本地环境变量文件，避免它被 COPY 进镜像；前端公开配置应使用明确 ARG。'],
        ['.env.*', '排除所有环境变体文件，防止测试或生产配置意外进入镜像。'],
        ['!.env.example', '若仓库有不含秘密的示例文件，则允许它保留在构建上下文中。'],
        ['npm-debug.log*', '排除 npm 调试日志。'],
        ['Dockerfile*', '构建器仍能读取指定 Dockerfile，但不会把它作为 COPY . . 的普通文件加入镜像。'],
        ['compose*.yaml', '排除只供宿主机 Docker Compose 使用的配置。'],
      ]),
    ],
    buildAndRun: [
      { title: '构建镜像', command: 'docker build --build-arg VITE_API_BASE_URL=/api -t learning-spa:local .', explanation: '在项目根目录执行；构建参数会进入浏览器 JS，只能放公开地址或功能开关。' },
      { title: '运行容器', command: 'docker run --rm -p 8080:80 --name learning-spa learning-spa:local', explanation: '把宿主机 8080 映射到容器 80；--rm 会在停止后删除容器但保留镜像。' },
      { title: '后台运行', command: 'docker run -d --rm -p 8080:80 --name learning-spa learning-spa:local', explanation: '需要继续使用终端时增加 -d；用 docker logs learning-spa 查看 Nginx 输出。' },
    ],
    verification: [
      { title: '检查健康端点', command: 'curl --fail http://127.0.0.1:8080/healthz', expected: '命令退出码为 0，响应正文为 ok。' },
      { title: '检查首页', command: 'curl --fail --head http://127.0.0.1:8080/', expected: '返回 HTTP 200，并包含 text/html 类型。' },
      { title: '检查 SPA 深层路由刷新', command: 'curl --fail http://127.0.0.1:8080/users/42', expected: '即使磁盘没有 users/42 文件，也返回 index.html，由浏览器路由继续解析。' },
    ],
    commonErrors: [
      { symptom: 'npm ci 报缺少或不匹配 package-lock.json。', cause: '项目没有提交 npm 锁文件，或 package.json 修改后没有更新锁文件。', fix: '在本机使用匹配的 npm 版本重新执行 npm install，检查并提交 package-lock.json。' },
      { symptom: 'Nginx 返回 404，镜像里没有页面。', cause: '实际构建目录不是 dist，或构建脚本失败但路径配置未同步。', fix: '本机确认 npm run build 输出目录，并修改 COPY --from=build 的源路径。' },
      { symptom: '首页正常，但刷新 /users/42 得到 404。', cause: 'Nginx 没有配置 SPA 的 index.html 回退。', fix: '确认运行镜像使用本教程 nginx.conf，并保留根 location 的 try_files。' },
      { symptom: '运行后 API 地址仍是旧值。', cause: 'Vite 环境变量在构建时写入静态文件，运行容器时再传 -e 不会修改已生成的 JS。', fix: '用正确 --build-arg 重新构建，或设计运行时 config.json 注入方案。' },
    ],
    securityAndProduction: [
      'VITE_ 变量会暴露给浏览器，绝不放数据库密码、服务端 token 或私钥。',
      '生产环境应把 node:22-alpine 与 nginx:alpine 固定到经过测试的具体版本或镜像摘要，并建立自动更新流程。',
      '在 HTTPS 入口配置 HSTS、CSP、X-Content-Type-Options 等响应头；是否由 Nginx、CDN 还是负载均衡器设置必须只有一个清晰责任方。',
      '静态资源可以长期缓存，index.html 不应使用 immutable，否则发布后用户可能长时间拿到旧入口。',
      'CI 中执行依赖审计、镜像漏洞扫描，并用同一 Dockerfile 产生测试和生产镜像。',
    ],
  },
  {
    slug: 'node-ssr-runtime',
    kind: 'node-ssr',
    title: 'Node SSR：多阶段、非 root 与容器健康检查',
    target: '适用于 npm run build 生成 dist/server.js 的 React SSR、同构 Node Web 或其他独立 Node HTTP 服务。',
    beginnerSummary: 'deps 阶段缓存依赖，build 阶段编译并裁剪开发依赖，runtime 阶段只复制运行所需文件。服务以普通用户启动，并由 Docker HEALTHCHECK 请求应用自己的 /healthz。',
    prerequisites: [
      'package.json 的 build 脚本生成 dist/，start 等价于 node dist/server.js。',
      '服务监听 0.0.0.0:3000，而不是只监听 localhost。',
      '应用实现轻量 /healthz，并在就绪时返回 2xx。',
    ],
    directoryTree: [
      'project/',
      '├── src/',
      '│   └── server.ts',
      '├── public/',
      '├── package.json',
      '├── package-lock.json',
      '├── Dockerfile',
      '└── .dockerignore',
    ],
    files: [
      deploymentFile('Dockerfile', 'dockerfile', '构建 Node SSR 服务，并以没有 root 权限的最小运行阶段启动。', [
        ['FROM node:22-alpine AS deps', '创建 deps 阶段，专门安装锁定依赖并提供可复用缓存层。'],
        ['WORKDIR /app', '将依赖阶段的工作目录设为 /app。'],
        ['COPY package.json package-lock.json ./', '只复制依赖清单，业务源码变化时无需重新安装所有依赖。'],
        ['RUN npm ci', '按锁文件安装开发与生产依赖，因为 TypeScript 编译器等构建工具也可能需要。'],
        ['', '空行分隔依赖阶段与构建阶段。'],
        ['FROM node:22-alpine AS build', '创建独立 build 阶段；同一基础镜像降低原生依赖平台不一致的风险。'],
        ['WORKDIR /app', '将构建阶段工作目录设为 /app。'],
        ['COPY --from=deps /app/node_modules ./node_modules', '从 deps 阶段复用已经安装的完整依赖。'],
        ['COPY . .', '复制经过 .dockerignore 过滤的源码和配置。'],
        ['RUN npm run build', '执行 SSR 项目的生产构建，预期生成 dist/server.js 及其资源。'],
        ['RUN npm prune --omit=dev', '删除 devDependencies，使后续复制的 node_modules 只保留生产依赖。'],
        ['', '空行分隔构建阶段与运行阶段。'],
        ['FROM node:22-alpine AS runtime', '创建最终运行阶段，不携带构建缓存和源文件。'],
        ['ENV NODE_ENV=production', '告诉 Node 和依赖库使用生产行为；它不是安全开关，也不替代配置校验。'],
        ['ENV PORT=3000', '为应用提供默认监听端口；应用代码仍必须读取 PORT 并监听 0.0.0.0。'],
        ['WORKDIR /app', '设置运行阶段工作目录。'],
        ['RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 --ingroup nodejs app', '创建固定 UID/GID 的系统组和普通用户，避免应用以 root 运行。'],
        ['COPY --from=build --chown=app:nodejs /app/package.json ./package.json', '复制运行期元数据，并在复制时直接设置所有者，避免额外 chown 镜像层。'],
        ['COPY --from=build --chown=app:nodejs /app/node_modules ./node_modules', '只复制 prune 后的生产依赖，并授予普通用户读取权限。'],
        ['COPY --from=build --chown=app:nodejs /app/dist ./dist', '复制编译产物；源码、测试与 TypeScript 编译器不会进入最终镜像。'],
        ['COPY --from=build --chown=app:nodejs /app/public ./public', '复制运行时静态资源；若项目没有 public 目录，应删除这一行而不是保留一个必然失败的 COPY。'],
        ['USER app', '从此以后默认命令都以普通 app 用户执行。'],
        ['EXPOSE 3000', '记录应用在容器内监听 3000；运行时仍需使用 -p 或编排平台发布端口。'],
        ['HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD ["node", "-e", "fetch(\'http://127.0.0.1:3000/healthz\').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]', '每 30 秒用 Node 内置 fetch 探测容器内健康端点；连续失败达到阈值后容器状态变为 unhealthy。'],
        ['CMD ["node", "dist/server.js"]', '以 exec JSON 形式启动服务器，使 Node 直接接收 Docker 发送的停止信号。'],
      ]),
      deploymentFile('.dockerignore', 'text', '避免把本机依赖、构建结果、秘密和开发缓存加入构建上下文。', [
        ['node_modules', '排除宿主机依赖，避免系统和 CPU 架构不匹配。'],
        ['dist', '排除本机构建产物，确保镜像总是从当前源码重新构建。'],
        ['coverage', '排除测试覆盖率报告。'],
        ['.git', '排除 Git 历史。'],
        ['.env', '排除本地运行配置和潜在秘密。'],
        ['.env.*', '排除各环境配置文件。'],
        ['!.env.example', '允许无秘密的配置模板进入上下文。'],
        ['npm-debug.log*', '排除 npm 错误日志。'],
        ['Dockerfile*', '阻止 COPY . . 把 Dockerfile 放进运行文件系统。'],
        ['compose*.yaml', '排除只供宿主机编排使用的 Compose 文件。'],
      ]),
    ],
    buildAndRun: [
      { title: '构建 SSR 镜像', command: 'docker build -t learning-ssr:local .', explanation: 'Docker 依次执行 deps、build 和 runtime，最终只标记 runtime 镜像。' },
      { title: '以前台方式运行', command: 'docker run --rm --init -p 3000:3000 --name learning-ssr learning-ssr:local', explanation: '--init 帮助正确回收子进程；Ctrl+C 会把停止信号交给 Node。' },
      { title: '查看镜像内身份', command: 'docker run --rm learning-ssr:local id', explanation: '输出应显示 uid=1001(app)，用于证明默认进程不是 root。' },
      { title: '查看健康状态', command: 'docker inspect --format \'{{json .State.Health}}\' learning-ssr', explanation: '容器运行超过 start-period 后可看到 Status、FailingStreak 和最近探测记录。' },
    ],
    verification: [
      { title: '验证 SSR 首页', command: 'curl --fail --head http://127.0.0.1:3000/', expected: '返回 2xx，且 HTML 由 Node 服务产生。' },
      { title: '验证应用健康端点', command: 'curl --fail http://127.0.0.1:3000/healthz', expected: '返回 2xx；端点不应执行昂贵查询或泄露内部版本。' },
      { title: '验证容器用户', command: 'docker exec learning-ssr id', expected: '用户为 app，UID 为 1001，而不是 root。' },
      { title: '验证优雅停止', command: 'docker stop --time 10 learning-ssr', expected: '应用收到 SIGTERM，在 10 秒内停止接受新请求、完成必要清理并退出。' },
    ],
    commonErrors: [
      { symptom: '容器启动后立即报 Cannot find module dist/server.js。', cause: '框架实际输出路径或启动文件与教程假设不同。', fix: '查看构建产物并同步修改 COPY 与 CMD；Next.js standalone 项目通常复制 .next/standalone、.next/static 和 public。' },
      { symptom: '宿主机 curl 连接被拒绝，但日志显示服务器已启动。', cause: '应用只监听 127.0.0.1，容器网络外无法访问。', fix: '让服务器监听 0.0.0.0，并继续通过 PORT 读取端口。' },
      { symptom: 'COPY public 失败。', cause: '项目没有 public 目录，而 Docker COPY 对不存在源路径会失败。', fix: '删除该 COPY，或在项目中提交实际需要的 public 目录。' },
      { symptom: '容器一直 unhealthy，但页面能打开。', cause: '/healthz 不存在、响应非 2xx，或应用启动时间超过 start-period。', fix: '先在容器内执行同一探测命令，再实现轻量端点或调整合理的 start-period。' },
      { symptom: '运行时报原生模块加载错误。', cause: '依赖在不同 libc/CPU 环境编译，或 prune/install 生命周期改变了原生产物。', fix: '构建与运行使用同系列基础镜像，并在目标架构上重新 npm ci 与测试。' },
    ],
    securityAndProduction: [
      '认证、数据库密码和服务 token 只在运行时注入；不要使用 ARG、ENV 或 COPY 把秘密烘焙进镜像层。',
      '普通用户降低进程被利用后的权限，但不能替代只读文件系统、最小 Linux capabilities、网络隔离和应用鉴权。',
      'HEALTHCHECK 只标记健康状态；单独使用 docker run 时 Docker 不会因为 unhealthy 自动重启容器，应由 Compose、Swarm、Kubernetes 或平台策略处理。',
      '健康端点应区分“进程存活”和“可以接流量”；深度依赖检查要有严格超时，避免数据库故障把所有实例同时拖死。',
      'Next.js output: standalone 时应复制框架生成的 standalone 目录，而不是整个 node_modules；仍需复制 public 与 .next/static，并使用生成的 server.js。',
      '生产发布固定基础镜像摘要，生成 SBOM、扫描漏洞，并在升级 Node 或 Alpine 后重新验证原生依赖。',
    ],
  },
  {
    slug: 'web-worker-postgres-redis',
    kind: 'web-worker-stack',
    title: 'Web + Worker + Redis + PostgreSQL：多 target 与 Compose',
    target: '适用于同一 TypeScript 仓库构建 Web 服务和后台 Worker，并使用 Redis 队列/缓存及 PostgreSQL 持久化数据。',
    beginnerSummary: '一个 Dockerfile 共享依赖和构建结果，再通过 web、worker 两个 target 生成不同启动镜像。Compose 创建四个服务、两个命名卷和内部网络，并在数据库健康后再启动应用。',
    prerequisites: [
      'npm run build 生成 dist/web.js 与 dist/worker.js。',
      'Web 提供 /healthz，并监听 0.0.0.0:3000。',
      '应用从 DATABASE_URL 与 REDIS_URL 读取连接地址，并对启动后的瞬时断连继续重试。',
      'Docker Compose 支持 depends_on.condition: service_healthy。',
    ],
    directoryTree: [
      'project/',
      '├── src/',
      '│   ├── web.ts',
      '│   └── worker.ts',
      '├── package.json',
      '├── package-lock.json',
      '├── Dockerfile',
      '├── compose.yaml',
      '├── .env.example',
      '└── .dockerignore',
    ],
    files: [
      deploymentFile('Dockerfile', 'dockerfile', '使用 BuildKit 缓存、构建产物断言、最小运行层、非 root 用户和 dumb-init，再从 runtime-base 派生 web 与 worker 两个独立 target。', [
        ['# syntax=docker/dockerfile:1.7', '声明 Dockerfile frontend 版本，使缓存挂载等 BuildKit 语法在不同构建机上行为一致；这一行必须位于文件最顶部。'],
        ['ARG NODE_VERSION=22.14.0', '集中声明 Node 版本，后面三个阶段复用；生产还应在 CI 中把基础镜像固定到已验证的 digest。'],
        ['FROM node:${NODE_VERSION}-alpine3.21 AS deps', '创建只安装依赖的 deps 阶段，并固定 Node 与 Alpine 版本，避免浮动标签突然改变系统环境。'],
        ['WORKDIR /app', '把依赖安装目录设为 /app，后续相对路径都从这里开始。'],
        ['COPY package.json package-lock.json ./', '先只复制依赖清单；业务源码变化但依赖不变时，可以继续复用 npm ci 层。'],
        ['RUN --mount=type=cache,id=npm-cache,target=/root/.npm,sharing=locked npm ci', '使用 BuildKit 缓存 npm 下载文件；npm ci 仍按锁文件创建全新的 node_modules，缓存不进入最终镜像。'],
        ['', '空行分隔依赖阶段与构建阶段。'],
        ['FROM node:${NODE_VERSION}-alpine3.21 AS build', '创建只负责编译的 build 阶段；编译器和开发依赖不会直接进入最终运行镜像。'],
        ['WORKDIR /app', '设置构建阶段工作目录。'],
        ['COPY package.json package-lock.json ./', '复制包信息，让后续裁剪依赖时仍能依据 package.json 判断生产依赖。'],
        ['COPY --from=deps /app/node_modules ./node_modules', '从 deps 阶段复用已经按锁文件安装好的完整依赖。'],
        ['COPY tsconfig*.json ./', '只复制 TypeScript 配置；若项目还有 Vite、Prisma 等构建配置，也应在这里明确复制。'],
        ['COPY src ./src', '精确复制源码目录，避免使用 COPY . . 把测试报告、本地配置或其他无关文件带入构建层。'],
        ['RUN --mount=type=cache,id=npm-build-cache,target=/root/.npm,sharing=locked npm run build', '执行一次共享构建，生成 Web 与 Worker 产物；单独缓存构建期间需要的 npm 下载。'],
        ['RUN test -f dist/web.js && test -f dist/worker.js', '构建后立即断言两个入口都存在，避免镜像构建成功但启动时才发现缺少文件。'],
        ['RUN npm prune --omit=dev', '删除 TypeScript、测试工具等开发依赖，只保留运行 Web 和 Worker 所需的生产依赖。'],
        ['', '空行分隔构建阶段与共享运行基础。'],
        ['FROM node:${NODE_VERSION}-alpine3.21 AS runtime-base', '创建 Web 与 Worker 共用的最小运行基础；这里不会包含 src、TypeScript 配置和构建工具。'],
        ['ARG BUILD_SHA=local', '接收 CI 传入的 Git 提交号，只用于镜像元数据；它不是秘密。'],
        ['LABEL org.opencontainers.image.title="learning-stack" org.opencontainers.image.revision=$BUILD_SHA', '写入标准 OCI 标签，出问题时可以从镜像追溯到构建它的代码提交。'],
        ['ENV NODE_ENV=production', '启用依赖库的生产模式，关闭只用于开发的额外检查。'],
        ['ENV NODE_OPTIONS=--enable-source-maps', '让 Node 异常堆栈映射回 TypeScript 源位置；发布时仍需安全保存并正确管理 source map。'],
        ['ENV HOME=/home/app', '为非 root 用户设置可写的 HOME，避免依赖误把缓存写到 /root。'],
        ['WORKDIR /app', '设置两个最终 target 的共同运行目录。'],
        ['RUN apk add --no-cache dumb-init && addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 --ingroup nodejs --home /home/app app && mkdir -p /app/tmp && chown -R app:nodejs /app /home/app', '安装轻量 PID 1 代理，创建固定 UID/GID 的低权限用户，并只为应用需要的目录授予写权限。'],
        ['COPY --from=build --chown=app:nodejs /app/package.json ./package.json', '只复制运行期需要的包元数据，并在复制时设置所有者，避免额外 chown 镜像层。'],
        ['COPY --from=build --chown=app:nodejs /app/node_modules ./node_modules', '复制已经裁剪过的生产依赖，不把 npm 缓存和开发依赖带进运行镜像。'],
        ['COPY --from=build --chown=app:nodejs /app/dist ./dist', '只复制编译产物，不复制原始源码和构建配置。'],
        ['USER app:nodejs', '从这里开始使用普通用户和普通用户组运行，降低进程被利用后的系统权限。'],
        ['ENTRYPOINT ["dumb-init", "--"]', '让 dumb-init 成为 PID 1，转发 SIGTERM 并回收僵尸子进程，再启动 CMD 中的 Node 程序。'],
        ['STOPSIGNAL SIGTERM', '明确容器停止时先发送 SIGTERM，让 Web 停止接流量、Worker 停止领取新任务并在超时内收尾。'],
        ['', '空行分隔共享运行基础和 Web target。'],
        ['FROM runtime-base AS web', '从共享运行基础派生 web 最终镜像；Compose 会通过 target: web 选择它。'],
        ['ENV PORT=3000', '提供 Web 默认监听端口；应用必须监听 0.0.0.0，而不是只监听 localhost。'],
        ['EXPOSE 3000', '记录容器内预期端口，真正发布到宿主机仍由 Compose ports 或 docker run -p 完成。'],
        ['HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 CMD ["node", "-e", "fetch(\'http://127.0.0.1:3000/healthz\').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]', '启动宽限期后每 30 秒检查一次应用健康端点；连续失败才标记 unhealthy，避免只判断 Node 进程还在。'],
        ['CMD ["node", "dist/web.js"]', '定义 Web target 的默认进程；dumb-init 会负责信号转发和子进程回收。'],
        ['', '空行分隔 Web target 和 Worker target。'],
        ['FROM runtime-base AS worker', '再次从 runtime-base 派生 Worker，因此不会继承 Web 的端口和 HTTP 健康检查。'],
        ['ENV WORKER_CONCURRENCY=4', '提供保守的默认并发度；生产根据任务 CPU、内存、外部限流和幂等能力压测后调整。'],
        ['CMD ["node", "dist/worker.js"]', '启动队列消费者；Worker 应在 SIGTERM 时停止领取新任务、等待在途任务结束并关闭 Redis/PostgreSQL 连接。'],
      ]),
      deploymentFile('compose.yaml', 'yaml', '构建并连接 Web、Worker、Redis 与 PostgreSQL，同时声明健康检查和持久化卷。', [
        ['name: learning-stack', '设置 Compose 项目名，生成的容器、网络和卷会带此前缀。'],
        ['', '空行分隔项目名与服务定义。'],
        ['services:', '开始定义 Compose 服务。'],
        ['  web:', '定义对外提供 HTTP 的 Web 服务。'],
        ['    build:', '声明 Web 镜像由当前项目构建。'],
        ['      context: .', '把当前目录作为 Docker 构建上下文。'],
        ['      target: web', '只构建 Dockerfile 中名为 web 的 target。'],
        ['    env_file:', '从文件读取普通运行配置；Compose 不会自动把它当作秘密存储。'],
        ['      - .env', '加载用户从 .env.example 复制并修改的本地配置。'],
        ['    environment:', '设置容器内应用真正读取的连接变量，并覆盖同名 env_file 值。'],
        ['      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}', '使用 Compose 替换 .env 中的值，并以服务名 postgres 作为容器网络主机名。'],
        ['      REDIS_URL: redis://redis:6379', '以服务名 redis 连接 Compose 内部 Redis；容器之间不能用 localhost 找其他服务。'],
        ['    ports:', '声明宿主机到 Web 容器的端口映射。'],
        ['      - "${WEB_PORT:-3000}:3000"', '使用 .env 的 WEB_PORT；未设置时把宿主机 3000 映射到容器 3000。'],
        ['    depends_on:', '声明启动顺序和健康条件；它不保证依赖在整个运行期永不掉线。'],
        ['      postgres:', '为 PostgreSQL 设置依赖条件。'],
        ['        condition: service_healthy', '等待 PostgreSQL healthcheck 成功后再启动 Web 服务。'],
        ['      redis:', '为 Redis 设置依赖条件。'],
        ['        condition: service_healthy', '等待 Redis healthcheck 成功后再创建 Web 容器。'],
        ['    restart: unless-stopped', '进程异常退出或 Docker 重启时自动重启，除非用户明确停止。'],
        ['', '空行分隔 Web 与 Worker 服务。'],
        ['  worker:', '定义不发布宿主端口的后台 Worker。'],
        ['    build:', '声明 Worker 也从同一 Dockerfile 构建。'],
        ['      context: .', '复用当前目录构建上下文和前面相同的缓存层。'],
        ['      target: worker', '选择 Dockerfile 的 worker target，因此启动 dist/worker.js。'],
        ['    env_file:', '为 Worker 加载同一份普通配置。'],
        ['      - .env', '读取本地 .env。'],
        ['    environment:', '向 Worker 提供内部服务连接地址。'],
        ['      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}', '让 Worker 使用同一数据库和 Compose DNS 名。'],
        ['      REDIS_URL: redis://redis:6379', '让 Worker 连接 Redis 队列。'],
        ['    depends_on:', 'Worker 也等待两个依赖健康后再启动。'],
        ['      postgres:', '声明 PostgreSQL 依赖。'],
        ['        condition: service_healthy', '等待数据库接受连接。'],
        ['      redis:', '声明 Redis 依赖。'],
        ['        condition: service_healthy', '等待 Redis 能响应 ping。'],
        ['    restart: unless-stopped', 'Worker 崩溃时自动重启；任务仍必须设计成幂等，因为可能至少执行一次。'],
        ['', '空行分隔应用服务和 Redis。'],
        ['  redis:', '定义 Redis 服务。'],
        ['    image: redis:7-alpine', '使用 Redis 7 Alpine 官方镜像；生产应进一步固定补丁版本或摘要。'],
        ['    command: ["redis-server", "--appendonly", "yes"]', '覆盖默认命令并启用 AOF，使已确认写入能持久化到 /data。'],
        ['    volumes:', '声明 Redis 数据目录使用命名卷。'],
        ['      - redis-data:/data', '把 /data 挂载到 Compose 管理的 redis-data 卷。'],
        ['    healthcheck:', '定义 Redis 就绪探测。'],
        ['      test: ["CMD", "redis-cli", "ping"]', '在容器内执行 redis-cli ping；成功时返回 PONG 和退出码 0。'],
        ['      interval: 5s', '每 5 秒探测一次。'],
        ['      timeout: 3s', '单次探测超过 3 秒视为失败。'],
        ['      retries: 10', '连续 10 次失败后标记 unhealthy。'],
        ['    restart: unless-stopped', 'Redis 进程异常退出时重启。'],
        ['', '空行分隔 Redis 和 PostgreSQL。'],
        ['  postgres:', '定义 PostgreSQL 服务。'],
        ['    image: postgres:17-alpine', '使用 PostgreSQL 17 Alpine 官方镜像；升级大版本前必须阅读迁移说明。'],
        ['    environment:', '为官方镜像初始化数据库提供必需变量。'],
        ['      POSTGRES_DB: ${POSTGRES_DB}', '从 .env 读取要创建的数据库名。'],
        ['      POSTGRES_USER: ${POSTGRES_USER}', '从 .env 读取初始数据库用户。'],
        ['      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}', '从 .env 读取初始密码；本地示例可用 .env，生产应改用平台 Secrets。'],
        ['    volumes:', '声明 PostgreSQL 数据目录使用命名卷。'],
        ['      - postgres-data:/var/lib/postgresql/data', '把官方镜像数据目录挂载到 postgres-data 卷，使容器重建后数据仍存在。'],
        ['    healthcheck:', '定义 PostgreSQL 是否已经可以接受连接。'],
        ['      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]', '$$ 阻止 Compose 在宿主机提前替换变量，让容器 shell 使用自身环境变量执行 pg_isready。'],
        ['      interval: 5s', '每 5 秒探测数据库。'],
        ['      timeout: 3s', '单次探测最多等待 3 秒。'],
        ['      retries: 10', '连续 10 次失败后标记 unhealthy。'],
        ['      start_period: 10s', '给首次初始化数据库预留 10 秒宽限期，期间失败不计入 retries。'],
        ['    restart: unless-stopped', 'PostgreSQL 进程异常退出时自动重启。'],
        ['', '空行分隔服务与顶层卷定义。'],
        ['volumes:', '声明本 Compose 项目管理的命名卷。'],
        ['  redis-data:', '创建 Redis 持久化卷，使用默认本地卷驱动。'],
        ['  postgres-data:', '创建 PostgreSQL 持久化卷，使用默认本地卷驱动。'],
      ]),
      deploymentFile('.env.example', 'dotenv', '提供可提交仓库的非秘密本地配置模板；实际运行前复制为 .env。', [
        ['POSTGRES_DB=learning_app', '设置本地示例数据库名；只使用字母、数字和下划线便于连接。'],
        ['POSTGRES_USER=learning_app', '设置本地示例数据库用户。'],
        ['POSTGRES_PASSWORD=change-me-before-running', '提供明显需要替换的教学占位符，不包含任何真实凭据。'],
        ['WEB_PORT=3000', '设置 Web 服务发布到宿主机的端口。'],
      ]),
      deploymentFile('.dockerignore', 'text', '缩小两个应用 target 的共同构建上下文。', [
        ['node_modules', '排除宿主机依赖。'],
        ['dist', '排除宿主机构建产物。'],
        ['coverage', '排除测试覆盖率输出。'],
        ['.git', '排除 Git 历史。'],
        ['.env', '排除实际运行配置，防止 COPY . . 把密码放进应用镜像。'],
        ['.env.*', '默认排除所有环境配置变体。'],
        ['!.env.example', '只允许无秘密的示例配置保留。'],
        ['npm-debug.log*', '排除 npm 日志。'],
        ['Dockerfile*', '避免将构建描述复制进应用文件系统。'],
        ['compose*.yaml', '避免将宿主机编排配置复制进应用文件系统。'],
      ]),
    ],
    buildAndRun: [
      { title: '创建本地环境文件', command: 'cp .env.example .env', explanation: '打开 .env 修改占位密码；.env 必须被 Git 和 Docker 构建上下文排除。' },
      { title: '检查变量替换后的配置', command: 'docker compose config', explanation: '在启动前发现 YAML、变量缺失和 target 拼写错误；输出可能含展开后的密码，不要上传日志。' },
      { title: '构建两个应用 target', command: 'docker compose build web worker', explanation: 'Web 与 Worker 共享 deps/build 缓存，但得到不同的最终 CMD。' },
      { title: '启动完整栈', command: 'docker compose up -d', explanation: '后台启动四个服务，并在 Redis/PostgreSQL 健康后启动 Web 与 Worker。' },
      { title: '查看状态', command: 'docker compose ps', explanation: '确认 postgres 与 redis 为 healthy，web 和 worker 为 running。' },
      { title: '安全停止但保留数据', command: 'docker compose down', explanation: '删除容器和默认网络，但保留两个命名卷。不要随意增加 --volumes。' },
    ],
    verification: [
      { title: '验证 Web 健康', command: 'curl --fail http://127.0.0.1:${WEB_PORT:-3000}/healthz', expected: '返回 2xx；若当前 shell 没有导出 WEB_PORT，命令使用 3000。' },
      { title: '验证 Redis', command: 'docker compose exec redis redis-cli ping', expected: '输出 PONG。' },
      { title: '验证 PostgreSQL', command: 'docker compose exec postgres sh -c \'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"\'', expected: '输出 accepting connections。' },
      { title: '检查 Worker 日志', command: 'docker compose logs --tail=100 worker', expected: 'Worker 已连接 Redis/PostgreSQL，并处于等待任务状态，没有无限快速重连。' },
      { title: '核对运行 target', command: 'docker compose exec web sh -c \'ps -o args= -p 1\' && docker compose exec worker sh -c \'ps -o args= -p 1\'', expected: 'Web 的 PID 1 是 node dist/web.js，Worker 的 PID 1 是 node dist/worker.js。' },
    ],
    commonErrors: [
      { symptom: '应用报 ECONNREFUSED 127.0.0.1:5432 或 6379。', cause: '容器内 localhost 指当前容器，不是 PostgreSQL 或 Redis。', fix: '使用 Compose 服务名 postgres 与 redis；本教程已通过 DATABASE_URL 和 REDIS_URL 设置。' },
      { symptom: 'depends_on 已设置，应用运行一段时间后仍因数据库断连失败。', cause: 'depends_on 只管理启动/重建顺序，不会替代运行期断线重连。', fix: '连接池、队列客户端和启动逻辑实现带上限退避重试，并正确处理 SIGTERM。' },
      { symptom: '修改 POSTGRES_DB/USER/PASSWORD 后容器仍使用旧值。', cause: 'PostgreSQL 官方镜像只在数据目录为空时用这些变量初始化。', fix: '保留数据时执行正式数据库迁移；只有确认可丢弃本地数据时才 docker compose down --volumes 后重建。' },
      { symptom: 'Worker 重启后同一任务执行了两次。', cause: '队列通常提供至少一次执行，进程可能在完成副作用后、确认任务前退出。', fix: '使用稳定 job id、数据库唯一约束和幂等写入，不把 restart 策略当成恰好一次保证。' },
      { symptom: 'Compose 提示 POSTGRES_PASSWORD 未设置或连接串为空。', cause: '.env 不存在、命令不在 compose.yaml 目录执行，或变量名拼写不一致。', fix: '复制 .env.example 为 .env，执行 docker compose config 检查展开结果。' },
      { symptom: '数据库数据在重建容器后丢失。', cause: '删除了命名卷、使用了错误数据目录，或执行 down --volumes。', fix: '确认 volume 挂载到官方镜像数据目录，建立备份，并把删除卷作为显式危险操作。' },
    ],
    securityAndProduction: [
      '.env 只是便利的变量文件，不是 Secrets 管理器；生产使用 Docker/编排平台 Secrets、云密钥服务或运行时凭据注入。',
      '不要把 PostgreSQL 和 Redis ports 发布到公网；本 Compose 没有为它们声明 ports，只允许内部网络访问。',
      '数据库密码出现在 DATABASE_URL 环境变量中，可能被有容器检查权限的人看到；生产平台应限制控制面权限并评估文件式 secret。',
      '命名卷不是备份。对 PostgreSQL 做经过恢复演练的定期备份，并为 Redis 明确它是缓存、队列还是需要持久恢复的数据源。',
      'Web 与 Worker 必须处理 SIGTERM：停止接收新请求/任务，等待有上限的在途工作，然后关闭数据库和 Redis 连接。',
      'Compose 的 service_healthy 只解决初始启动顺序；应用在整个生命周期仍要承受依赖重启、网络抖动和连接过期。',
      '生产固定 Node、Redis、PostgreSQL 镜像版本或摘要；PostgreSQL 大版本升级必须使用官方支持的升级/备份恢复流程，不能只改 tag。',
      '若 Worker 会执行不可信文件解析或模型生成命令，应使用更严格的容器隔离、只读文件系统、资源限制和专用低权限账户。',
    ],
  },
]

const deploymentGuidesBySlug = new Map(
  dockerDeploymentGuides.map((guide) => [guide.slug, guide]),
)

export function getDockerDeploymentGuide(slug: string) {
  return deploymentGuidesBySlug.get(slug)
}

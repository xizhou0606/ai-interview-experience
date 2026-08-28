import { StackQuickstart, type QuickstartConfig } from './StackQuickstarts'

const viteConfig: QuickstartConfig = {
  label: 'Vite 8.1',
  title: '先分清开发按需 ESM 与生产 Rolldown 构建',
  mentalModel: '开发时 Vite 按浏览器请求解析和转换 ESM，并用模块图找到 HMR 边界；生产时 Vite 8 交给 Rolldown 建立完整依赖图、拆分 chunk、压缩并输出可部署资产。',
  install: 'pnpm add -D vite@8.1.5 @vitejs/plugin-react',
  flow: ['读取 mode 与配置', '解析插件', '按需转换 ESM', '模块图驱动 HMR', 'Rolldown 生产构建', 'preview 验证产物'],
  choices: [
    ['配置项目和插件', 'defineConfig', '按 command/mode 返回配置，并保留完整 UserConfig 类型提示。'],
    ['读取构建环境', 'loadEnv / envPrefix', '区分构建进程配置与客户端公开变量，秘密永远不进入 import.meta.env。'],
    ['嵌入开发服务器', 'createServer', 'SSR、测试工具和框架可使用 middlewareMode 接管 HTTP 外壳。'],
    ['扩展文件处理', 'resolveId / load / transform', '插件按解析、加载、转换三步处理虚拟模块或自定义语法。'],
    ['处理生产资产', 'build.manifest / sourcemap', '让后端和监控系统准确定位 hash 资产与压缩源码。'],
    ['自定义热更新', 'import.meta.hot', '仅框架和工具作者通常需要；业务项目优先依赖框架插件自动 HMR。'],
  ],
  exampleTitle: '最小 React + 环境分层 + 代理 + 构建证据',
  exampleNote: 'Vite 8 要求 Node.js 20.19+ 或 22.12+。APP_API_ORIGIN 只用于配置进程，不要通过 define 或客户端前缀暴露内部地址和密钥。',
  example: `import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'APP_')
  return {
    plugins: [react()],
    resolve: { alias: { '@': new URL('./src', import.meta.url).pathname } },
    server: {
      port: 4173,
      strictPort: true,
      proxy: { '/api': { target: env.APP_API_ORIGIN, changeOrigin: true } },
    },
    build: { sourcemap: 'hidden', manifest: true },
  }
})`,
  interview: 'Vite 是开发服务器与构建工具，不是 UI 或全栈框架。开发阶段利用浏览器 ESM 按需转换模块，并通过模块图和 HMR WebSocket 做局部更新；生产阶段 Vite 8 使用 Rolldown 构建完整依赖图。插件用 resolve、load、transform 和 Vite 专属 hooks 连接两条链路，环境变量则必须严格区分客户端公开值和服务端秘密。',
  risks: ['server.proxy 只解决开发联调，不会生成生产网关配置。', 'envPrefix 变量会进入客户端包，不能包含数据库、模型或云服务密钥。', 'Vite 8 从双 bundler 迁移到 Rolldown，复杂旧插件和输出配置必须单独回归。', 'Source Map、manifest 和所有 hash 资产要作为同一次发布原子部署。'],
}

const turborepoConfig: QuickstartConfig = {
  label: 'Turborepo 2.9',
  title: '先读懂截图：三个 filter 是并集，--parallel 已经弃用',
  mentalModel: 'pnpm 管 workspace 与安装，Next.js/Vite/tsdown 执行每个包自己的 dev/build，Turborepo 读取包图和 turbo.json，决定任务选择、先后、并发与缓存。截图是在同时启动三个常驻任务，但新版应使用包级 with 表达“后台 dev 必须带着两个 watcher 一起运行”。',
  install: 'pnpm add -D turbo@2.9.15',
  flow: ['读取 workspace 包图', '展开 tasks 任务图', 'filter 选择目标', '计算输入哈希', '命中缓存或调度', '保存产物与摘要'],
  choices: [
    ['运行任务图', 'turbo run', '调度 package.json scripts；不是替代 pnpm 安装，也不是打包器。'],
    ['只选目标应用和依赖', '--filter / --affected', '三个 filter 是并集；包名后 ... 包含依赖，CI 可按 Git 变更选择。'],
    ['检查而不执行', '--dry=json / --graph', '修改配置后的第一步，核对任务、哈希、输入、输出和依赖。'],
    ['常驻开发进程', 'persistent + cache:false + with', '用包级 with 取代弃用的 --parallel，表达必须共同启动的 watcher。'],
    ['正确复用结果', 'inputs / outputs / env', '输入决定何时失效，输出决定恢复什么，环境变量防止跨环境错误命中。'],
    ['裁剪 Docker 上下文', 'turbo prune --docker', '生成 json/full 两层和精简 lockfile，避免无关包让安装层失效。'],
  ],
  exampleTitle: '把 base-frontend 的 dev:admin:watch 迁移到最新版写法',
  exampleNote: '先保留根 turbo.json 中 dev 的 persistent:true 和 cache:false；然后在 frontend-admin 新增包级 turbo.json。迁移前执行 dry run，确认三项任务都被选择，再真实启动验证 Ctrl+C 能结束完整进程树。',
  example: `// frontend-admin/turbo.json（JSONC 教学写法；真实 JSON 请移除注释）
{
  "extends": ["//"], // 继承根 turbo.json
  "tasks": {
    "dev": {
      "with": [ // 主任务启动时，这两个 watcher 必须陪跑
        "@funhub/platform#dev",
        "@funhub-ugc/comment-sdk#dev"
      ],
      "persistent": true, // dev 不会自然退出
      "cache": false // 不能把旧 dev 进程当作可复用结果
    }
  }
}

// 根 package.json：删除已弃用的 --parallel 与三个手写 filter
"dev:admin:watch": "turbo run dev --filter=@funhub/frontend-admin"

// 第一次只看计划，不启动服务
pnpm turbo run dev --filter=@funhub/frontend-admin --dry=json`,
  interview: 'Turborepo 是 monorepo 任务编排与缓存层，不是 package manager 或 bundler。它从 workspace 依赖构建包图，再用 dependsOn 构建任务图；输入、锁文件和环境变量形成哈希，命中时恢复声明的 outputs。开发常驻任务设 persistent 与 cache:false，必须共同启动的 watcher 用 with；--parallel 会丢弃依赖图且已经弃用。CI 再用 affected、远程缓存和运行摘要做增量验证。',
  risks: ['--parallel 已弃用且会丢弃依赖图；高并发用 --concurrency，持久陪跑关系用 with。', '没有 outputs 只能恢复日志；没有 env/inputs 可能复用错误环境的旧产物。', '.env 不由 Turbo 自动加载；由框架加载时仍要把对应文件或变量纳入哈希。', '远程缓存写权限只给受信 CI，必要时启用 HMAC 签名；PR 不应拿到可污染共享缓存的令牌。', 'turbo prune 依赖真实 workspace 声明，任何未声明的跨包相对导入都会让裁剪镜像失败。'],
}

const solidConfig: QuickstartConfig = {
  label: 'SolidJS',
  title: '先放下“组件反复执行”，建立细粒度依赖图',
  mentalModel: 'Solid 组件通常只运行一次来建立 owner 和 DOM；createSignal 的 getter 在 JSX、Memo 或 Effect 中被读取时登记依赖，setter 只更新真正依赖它的计算和 DOM 节点。',
  install: 'pnpm add solid-js',
  flow: ['组件建立 Owner', 'Signal 保存状态', 'Getter 登记依赖', 'Setter 比较并通知', '精确计算与 DOM 更新'],
  choices: [
    ['保存一个可变值', 'createSignal', '返回 getter/setter；读取必须保留函数调用，不能提前解构成普通值。'],
    ['计算可派生状态', 'createMemo', '缓存纯计算并向下游传播，避免 Effect 写回另一个 Signal。'],
    ['同步外部系统', 'createEffect', '日志、DOM 库或连接等真正副作用；资源释放放进 onCleanup。'],
    ['加载异步数据', 'createResource', '把响应式 source、fetcher、loading/error/refetch 与 Suspense 接起来。'],
    ['管理嵌套对象', 'createStore / setStore', '按属性和路径跟踪更新；服务端快照可用 reconcile 协调。'],
    ['渲染可变列表', '<For> / <Index>', '对象身份稳定用 For；索引固定、值常替换才用 Index。'],
  ],
  exampleTitle: '最小搜索资源 + 清理案例',
  exampleNote: '这个例子同时演示 Signal、Memo、Resource、控制流和 Effect cleanup。真实 API 还要校验 response.ok，并把认证留在服务端。',
  example: `import { createMemo, createResource, createSignal, For, onCleanup, Show } from 'solid-js'

export function UserSearch() {
  const [query, setQuery] = createSignal('')
  const normalized = createMemo(() => query().trim())
  const [users, { refetch }] = createResource(
    () => normalized() || false,
    async (value) => {
      const response = await fetch('/api/users?q=' + encodeURIComponent(value))
      if (!response.ok) throw new Error('搜索失败：' + response.status)
      return response.json() as Promise<Array<{ id: string; name: string }>>
    },
  )

  const onOnline = () => void refetch()
  window.addEventListener('online', onOnline)
  onCleanup(() => window.removeEventListener('online', onOnline))

  return <section>
    <input value={query()} onInput={event => setQuery(event.currentTarget.value)} />
    <Show when={!users.loading} fallback={<p>搜索中…</p>}>
      <For each={users()} fallback={<p>没有结果</p>}>
        {user => <p>{user.name}</p>}
      </For>
    </Show>
  </section>
}`,
  interview: 'Solid 通过编译后的 DOM 表达式和运行时 Signal 建立细粒度依赖图，组件通常只执行一次。Memo 表达纯派生值，Effect 只处理外部副作用，Resource 统一异步状态，Store 处理嵌套更新。生产上要保留 getter 访问、显式 cleanup，并保证 SSR 与 hydrate 的首屏结构一致。',
  risks: ['不要提前解构 props、Resource 或 Store 的响应式属性；需要分组时用 splitProps。', 'onMount 返回函数不会自动注册清理，必须显式 onCleanup。', 'Resource 的错误、刷新和竞态需要界面与测试覆盖，不能只显示 loading。', 'hydrate 必须复用与服务端完全一致的首屏结构，否则会产生错配。'],
}

const tanstackConfig: QuickstartConfig = {
  label: 'TanStack',
  title: '先按状态类型选独立包，再组合成应用栈',
  mentalModel: 'TanStack 不是必须整套安装的框架：Query 管远端缓存，Router 管 URL 与数据加载，Start 定义全栈执行边界，Form 管表单状态，Table 计算行列模型，Virtual 只渲染可视窗口。',
  install: 'pnpm add @tanstack/react-query @tanstack/react-router',
  flow: ['Router 解析 URL', 'loader 预热 Query', '组件订阅缓存', 'Mutation 写入服务端', '缓存失效并收敛'],
  choices: [
    ['远端请求、缓存与刷新', 'Query v5', '用 queryKey 定义数据身份，用 staleTime/失效/变更维护服务端状态。'],
    ['类型安全 URL 与导航', 'Router v1', 'params、search、loader、beforeLoad 和 Link 都从路由树推导类型。'],
    ['SSR 与服务端函数', 'Start v1 RC', '建立 server function、middleware、流式 SSR 和部署边界；它当前仍是 RC。'],
    ['复杂表单与校验', 'Form v1', '字段级状态、异步校验、提交和订阅，不强制具体 DOM 样式。'],
    ['排序过滤分页表格', 'Table v8', '创建无头行列模型，由产品设计系统决定 HTML 和 CSS。'],
    ['万级列表或表格', 'Virtual v3', '根据滚动容器、尺寸估算和 overscan 只挂载可视项。'],
  ],
  exampleTitle: 'Router loader + Query 缓存共用一个合同',
  exampleNote: '关键不是同时安装两个包，而是让路由预取和组件订阅使用完全相同的 queryOptions。SSR 时 QueryClient 必须按请求创建。',
  example: `import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

const postsQuery = queryOptions({
  queryKey: ['posts'],
  queryFn: ({ signal }) => fetch('/api/posts', { signal }).then(async response => {
    if (!response.ok) throw new Error('加载失败：' + response.status)
    return response.json() as Promise<Array<{ id: string; title: string }>>
  }),
  staleTime: 30_000,
})

export const Route = createFileRoute('/posts')({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  component: PostsPage,
})

function PostsPage() {
  const posts = useSuspenseQuery(postsQuery)
  return <ul>{posts.data.map(post => <li key={post.id}>{post.title}</li>)}</ul>
}`,
  interview: 'TanStack 是一组职责独立的无头库。Query 以 queryKey 管远端缓存，Router 以类型化路由树管理 URL，Start 在 Router 上补全 SSR 和服务端边界；Form、Table、Virtual 分别管理表单、行列模型和可视窗口。组合时要保持单一数据源，SSR 每请求隔离缓存，并把鉴权放在真正返回数据的服务端边界。',
  risks: ['Query key 必须包含所有影响结果的参数；staleTime 与 gcTime 解决的是不同问题。', 'Router beforeLoad 只改善导航体验，不能代替 Server Function/API 的身份和租户鉴权。', 'Start 默认同构：loader 在 SSR 运行于服务端，客户端导航时又会在浏览器运行，秘密逻辑必须进入 server-only 边界。', 'Table 和 Virtual 都是无头计算层；稳定 data/columns、准确尺寸测量和可访问 DOM 仍由应用负责。'],
}

export function ViteQuickstart() { return <StackQuickstart config={viteConfig} /> }
export function TurborepoQuickstart() { return <StackQuickstart config={turborepoConfig} /> }
export function SolidQuickstart() { return <StackQuickstart config={solidConfig} /> }
export function TanStackQuickstart() { return <StackQuickstart config={tanstackConfig} /> }

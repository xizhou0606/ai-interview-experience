import type { Technology } from '../catalog'

const verifiedAt = '2026-07-18'

export const engineeringPlatformTechnologies: Technology[] = [
  {
    slug: 'turborepo',
    name: 'Turborepo',
    learningName: 'Monorepo 工程化',
    eyebrow: 'Turborepo 2.9 · 任务图、缓存与增量 CI',
    category: '开发与构建工具',
    version: 'base-frontend turbo@^2.8.3 / 官方稳定版 2.9.15',
    difficulty: '进阶',
    minutes: 420,
    accent: '#e05f4f',
    summary: '读取 workspace 包依赖和 package.json scripts，构建跨包任务图，再通过并发调度、输入哈希、本地/远程缓存和变更筛选减少重复工作。',
    boundary: 'Turborepo 不是包管理器，也不是 Vite、webpack 或 Turbopack 这样的打包器。pnpm 负责安装与 workspace，Vite/Next.js 负责单个应用构建，Turborepo 负责决定哪些包的哪些任务、按什么顺序、是否需要重新运行。',
    why: '当仓库里同时存在 Web、后台、共享包、SDK 和 Worker，并且 build、test、lint、dev 之间已经出现跨包先后关系时，Turborepo 能把隐含的 shell 顺序变成可检查的任务图。它尤其适合希望复用本机与 CI 结果、只构建受影响包、又不想先引入重型构建系统的 TypeScript monorepo。',
    prerequisites: ['package.json scripts 与退出码', 'pnpm/npm/yarn workspace', '有向无环图与依赖关系', '文件哈希、环境变量和可重复构建'],
    concepts: [
      { name: '包图与任务图', detail: 'workspace 依赖形成包图；turbo.json 的 dependsOn 再把 build、test、typecheck 等脚本展开成任务图。^build 表示先构建当前包依赖的包。' },
      { name: '输入哈希与输出缓存', detail: '任务命令、源码 inputs、依赖、锁文件和声明的环境变量共同形成哈希；命中时恢复 outputs 和日志，不再执行脚本。' },
      { name: 'Filter 与 Affected', detail: '--filter 精确选包、依赖或依赖者；--affected 根据 Git 基线选择受变更影响的包，适合增量 CI。' },
      { name: '持久任务与陪跑任务', detail: 'dev/watch 不会退出，应设 persistent:true、cache:false；多个开发进程必须一起启动时，最新版推荐用 with 表达关系。' },
    ],
    flow: ['发现 workspace 包与内部依赖', '读取 turbo.json 和包级配置', '将脚本展开为任务图', '应用 filter/affected 选择范围', '计算任务输入哈希', '恢复缓存或按依赖并发执行', '保存 outputs、日志和运行摘要'],
    usage: [
      { project: 'base-frontend', role: '同时启动平台 i18n watcher、评论 SDK watcher 与 Next.js 后台；build/typecheck 由任务图约束先后', evidence: 'package.json · dev:admin:watch；turbo.json；frontend-admin/package.json；packages/platform/package.json；packages/comment-sdk/package.json' },
      { project: 'base-frontend', role: '当前 turbo.json 已为 dev 设置 cache:false + persistent:true，并为 build 声明 ^build 与 Next/dist 输出', evidence: 'turbo.json · tasks.build / tasks.dev / @funhub/frontend-admin#typecheck' },
    ],
    example: {
      language: 'jsonc',
      filename: 'frontend-admin/turbo.json',
      code: `{
  // 包级配置继承仓库根 turbo.json，避免复制 build/test 规则。
  "extends": ["//"],
  "tasks": {
    "dev": {
      // 启动后台 dev 时，始终同时启动两个依赖包的 watcher。
      "with": [
        "@funhub/platform#dev",
        "@funhub-ugc/comment-sdk#dev"
      ],
      // dev 是常驻进程，不会像 build 一样自然退出。
      "persistent": true,
      // 常驻开发服务不能复用一次旧执行结果。
      "cache": false
    }
  }
}`,
      explanation: ['根脚本可改为 turbo run dev --filter=@funhub/frontend-admin；先用 --dry=json 检查最终任务图。', '截图中的三个 --filter 是并集，确实会选中三个包；但 --parallel 已被官方标为弃用，并会丢弃任务依赖图。', '若只是想提高普通任务并发度，使用 --concurrency=100%，不要用 --parallel 绕过先后关系。'],
    },
    practices: ['先让每个 package.json script 单独可运行、可重复、退出码可信，再交给 Turbo 调度。', 'build 明确 outputs；dev/watch 使用 persistent:true、cache:false，并用 with 表达必须陪跑的进程。', '所有会改变产物的环境变量写入 env/globalEnv；.env 文件需要通过 inputs/globalDependencies 纳入哈希。', 'CI 先执行 turbo run build test --affected --dry=json 检查选择范围，再接远程缓存和真实任务。', '每次修改依赖图、filter 或缓存规则后查看 --graph 与 --summarize，不凭终端看起来“跑过”判断正确。'],
    pitfalls: [
      { title: '继续使用 --parallel', detail: '它会抛弃任务依赖图且已弃用。开发常驻任务用 with；普通高并发使用 --concurrency；确实无依赖的任务也应让任务图明确表达。' },
      { title: '没有声明 outputs', detail: '任务日志可能命中缓存，但 dist、.next 等文件无法恢复，随后部署或测试会读到缺失产物。' },
      { title: '环境变量不进入哈希', detail: 'API 地址、feature flag 或构建模式改变却复用旧缓存，会产生最隐蔽的错误命中；秘密是否影响结果与是否暴露给子进程是两件事。' },
      { title: '把 Turborepo 当包管理器', detail: '安装、workspace 协议和 lockfile 仍由 pnpm/npm/yarn 负责；Turbo 不替代 pnpm --filter 的依赖安装和发布语义。' },
    ],
    operations: {
      testing: '用 --dry=json 断言任务选择、依赖和 outputs；准备改共享包、只改应用、只改文档、改锁文件四组场景，验证 --affected 与缓存命中是否符合预期。',
      observability: '保存 --summarize 运行摘要并在 CI 统计命中率、miss 原因、任务耗时和关键路径；需要可视化时输出 --graph=graph.html 或 Mermaid。',
      security: '远程缓存令牌只放 CI Secret；用 strict envMode 和 allowlist 控制子进程环境；需要防篡改时启用 remoteCache.signature，并妥善保管签名密钥。',
      performance: '先修正 inputs、outputs 和依赖图，再调 concurrency。Docker 构建使用 turbo prune <app> --docker 分离依赖层与源码层，减少无关包导致的安装缓存失效。',
    },
    comparison: 'Turborepo 比只用 pnpm --filter 多了任务图、跨任务缓存和远程缓存；比 Nx 更轻、更贴近已有 package.json scripts，但代码生成、插件与项目图治理较少；比 Bazel 更容易进入 JavaScript 仓库，但跨语言与严格沙箱能力更弱。',
    checklist: ['包依赖在 workspace manifest 中真实声明', 'dependsOn 表达先后而非 shell 串联', 'outputs/inputs/env 完整', 'dev 使用 persistent + cache:false', '不再新增 --parallel', '--dry/graph/summary 可解释', 'CI 远程缓存密钥受控'],
    exercise: { task: '把截图中的 dev:admin:watch 从弃用的 --parallel 迁移为包级 with，并为 build 建立可验证的增量 CI。', done: ['三个 watcher 一条命令启动', 'Ctrl+C 能完整结束进程树', '修改 comment-sdk 会触发正确任务', '第二次 build 命中缓存并恢复产物', '改环境变量不会错误命中旧缓存', 'Docker prune 只保留后台及其依赖'] },
    sources: [
      { label: 'Turborepo run 官方参考', url: 'https://turborepo.dev/docs/reference/run', kind: '官方文档', note: 'filter、affected、dry、graph、summary、concurrency 与 deprecated parallel' },
      { label: 'Turborepo 任务配置', url: 'https://turborepo.dev/docs/crafting-your-repository/configuring-tasks', kind: '官方文档', note: 'dependsOn、outputs、persistent 与 with' },
      { label: 'Turborepo Docker 指南', url: 'https://turborepo.dev/docs/guides/tools/docker', kind: '官方文档', note: 'turbo prune --docker 与分层镜像' },
      { label: 'base-frontend 源码', kind: '源码事实', note: '截图命令、根 turbo.json 与三个包的真实 dev scripts' },
    ],
    verifiedAt,
  },
]

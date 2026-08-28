import { AlertTriangle, ArrowDown, Boxes, CheckCircle2, GitBranch, Layers3, Package, Rocket, ShieldCheck, Workflow } from 'lucide-react'

const responsibilities = [
  ['Monorepo', '仓库组织方式', '把多个应用、服务、SDK 和共享库放进一个 Git 仓库；它本身不安装依赖，也不执行构建。'],
  ['pnpm workspace', '包与依赖管理', '发现 workspace 包、安装依赖、维护唯一锁文件，并用 workspace: 明确连接本地包。'],
  ['Turborepo', '任务编排与缓存', '根据包图和任务图决定 build、test、dev 的选择、顺序、并发与缓存。'],
  ['Vite / Next.js / tsdown', '真正执行构建', '每个包仍由自己的编译器、打包器或框架生成 dist、.next 等产物。'],
  ['Docker / 部署平台', '运行与交付', '只打包目标应用及其运行依赖；生产进程不需要把整个仓库全部启动。'],
]

const packageRoles = [
  { name: '@funhub/frontend-admin', type: '应用 App', detail: 'Next.js 后台，最终运行在 3010 端口。它消费平台包和评论 SDK，不应该被其他基础包反向依赖。' },
  { name: '@funhub-ugc/comment-sdk', type: '领域 SDK', detail: '对外提供评论能力，自己依赖 @funhub/platform；开发运行 tsdown --watch，发布前生成 dist。' },
  { name: '@funhub/platform', type: '共享平台包', detail: '提供组件、主题、国际化和 API 生成能力，位于依赖图更底层，变更会影响多个上层消费者。' },
  { name: 'external/openim-sdk-h5', type: '外部子工作区', detail: '包含 IM engine、UI 和 demo。仍被根 workspace 收录，但应保持清晰所有权与发布边界。' },
]

const dependencyKinds = [
  ['dependencies', '运行当前包必须存在', 'frontend-admin → comment-sdk；打包、部署和 prune 都会沿它建立生产依赖图。'],
  ['devDependencies', '只用于开发和构建', 'TypeScript、Vitest、ESLint、Turbo；库的消费者通常不需要安装这些工具。'],
  ['peerDependencies', '要求最终应用提供同一个实例', 'SDK 对 React、Next.js、TanStack Query 的要求；避免库私自带入第二份 React。'],
  ['optionalDependencies', '能力可选，缺少仍能运行基础功能', '只有代码真的处理“未安装”分支时才使用，不能拿它掩盖必需依赖。'],
  ['workspace:*', '必须解析到当前仓库中的本地包', '比普通 semver 更明确；找不到匹配 workspace 包时安装直接失败，发布时再转换为普通版本。'],
]

const boundaryRules = [
  ['应用不能被共享包依赖', 'apps/admin 可以依赖 packages/ui；packages/ui 反向导入 apps/admin 会让基础层绑死业务层。'],
  ['跨包只能走公开 exports', '不要使用 ../../packages/platform/src/private-file；只从 @funhub/platform 已声明的子路径导入。'],
  ['每个包声明自己直接使用的依赖', '即使根 node_modules 里碰巧存在，也不能省略 package.json 声明，否则 pnpm、prune 和发布都会失真。'],
  ['包图应该尽量无环', 'A → B → A 会让构建顺序、版本发布和职责都无法解释；发现环先抽公共合同包，而不是关闭 warning。'],
  ['共享代码不等于全部抽包', '只有存在多个消费者、边界稳定或需要独立发布时再抽包；单页面辅助函数留在应用内部更清楚。'],
  ['配置可以共享，秘密不能共享', 'tsconfig、ESLint preset 可以成为工具包；生产密钥仍按应用和环境注入，不能写进公共包或缓存。'],
]

const lifecycle = [
  ['本地开发', '从一个目标 App 启动，只拉起它真正依赖的 watcher；不要默认启动仓库全部服务。'],
  ['提交检查', '先格式、lint、typecheck，再跑受影响测试；共享包变化要覆盖所有依赖它的应用。'],
  ['持续集成', '按 Git 变更选择任务，使用干净环境验证缓存能恢复真实产物，并保留任务摘要。'],
  ['版本发布', '内部私有包可统一跟随应用；公共 SDK 应使用 Changesets 等工具记录变更、计算版本并生成 changelog。'],
  ['生产部署', '每个可部署 App 生成独立镜像和发布单元；共享源码在构建期消费，生产不需要“运行 packages 目录”。'],
]

const interviewQuestions = [
  ['Monorepo 和微服务冲突吗？', '不冲突。Monorepo 描述源码放在哪里，微服务描述运行时怎样拆分。一个仓库可以构建并独立部署多个服务，每个服务仍有自己的镜像、扩缩容和故障边界。'],
  ['为什么不把所有代码放一个普通项目？', 'Monorepo 不是“大文件夹”。每个 workspace 包都有独立 package.json、公开 exports、依赖和任务；包边界让共享、影响分析、缓存和独立发布成为可能。'],
  ['为什么一个锁文件既是优点也是风险？', '它让安装结果一致、升级可原子提交；但基础依赖升级可能影响多个项目，所以必须配合受影响测试、依赖审查和自动化更新策略。'],
  ['缓存为什么可能产生错误？', '缓存键遗漏源码、环境变量或配置时，不同输入会得到同一个哈希；outputs 漏写时又只能恢复日志。正确性必须先于命中率。'],
  ['什么时候不该采用 Monorepo？', '团队和产品完全独立、权限隔离要求很强、技术栈没有共同工具链，或仓库规模很小且没有共享/原子变更需求时，多仓库更直接。'],
]

export function MonorepoGuide() {
  return (
    <section className="monorepo-guide" aria-label="Monorepo 从概念到生产落地">
      <div className="monorepo-hero">
        <div><span>MONOREPO FOUNDATION</span><h3>先学 Monorepo，再学 Turborepo</h3><p>Monorepo 的核心不是“把代码都塞进一个仓库”，而是让多个可独立理解、构建、测试和发布的项目，共享一套可验证的依赖关系和工程规则。</p></div>
        <div className="monorepo-definition"><strong>一句话定义</strong><p>一个 Git 仓库，包含多个有明确边界的项目或包；变更可以跨包原子提交，工具可以根据依赖图只处理受影响部分。</p></div>
      </div>

      <div className="monorepo-responsibilities">
        <div className="monorepo-title"><Layers3 size={18} /><div><strong>五层职责不要混</strong><p>先知道每一层负责什么，遇到问题才不会错误地修改 Turbo、pnpm 或打包器。</p></div></div>
        <div>{responsibilities.map(([name, role, detail], index) => <article key={name}><span>{index + 1}</span><div><strong>{name}</strong><small>{role}</small><p>{detail}</p></div>{index < responsibilities.length - 1 && <ArrowDown size={15} />}</article>)}</div>
      </div>

      <div className="monorepo-comparison">
        <article><span>MONOREPO</span><h4>一次提交可以同时修改 App 和共享包</h4><ul><li>一个 PR 能原子更新接口、实现和消费者</li><li>统一锁文件、基础配置和质量门禁</li><li>依赖图支持受影响分析和任务缓存</li><li>代价是仓库治理、权限和 CI 必须更精细</li></ul></article>
        <article><span>POLYREPO</span><h4>每个项目拥有独立仓库和发布节奏</h4><ul><li>权限、历史和流水线天然隔离</li><li>不同团队可选择完全不同工具链</li><li>跨仓变更需要先发布库、再升级消费者</li><li>共享配置容易复制和逐渐漂移</li></ul></article>
      </div>

      <div className="monorepo-anatomy">
        <div className="monorepo-title"><Boxes size={18} /><div><strong>base-frontend 的真实仓库解剖</strong><p>目录只是入口，真正的包身份来自每个目录的 package.json；依赖关系来自 dependencies，而不是目录深浅。</p></div></div>
        <div className="monorepo-anatomy-grid">
          <pre><code>{`base-frontend/
├─ package.json             # 根命令与工具版本
├─ pnpm-workspace.yaml      # 哪些目录属于 workspace
├─ pnpm-lock.yaml           # 全仓唯一安装快照
├─ turbo.json               # build/dev/test 任务合同
├─ frontend-admin/          # @funhub/frontend-admin
├─ packages/
│  ├─ platform/             # @funhub/platform
│  └─ comment-sdk/          # @funhub-ugc/comment-sdk
└─ external/openim-sdk-h5/  # IM 子工作区与应用`}</code></pre>
          <div className="monorepo-package-graph">{packageRoles.map((item, index) => <article key={item.name}><div><span>{index + 1}</span><strong>{item.name}</strong><small>{item.type}</small></div><p>{item.detail}</p></article>)}</div>
        </div>
        <div className="monorepo-graph-line"><code>frontend-admin</code><span>依赖</span><code>comment-sdk</code><span>依赖</span><code>platform</code><p>共享包越靠下，影响范围通常越大；应用位于最上层，负责最终组合和部署。</p></div>
      </div>

      <div className="monorepo-dependencies">
        <div className="monorepo-title"><Package size={18} /><div><strong>package.json 依赖逐类理解</strong><p>依赖类型不是为了“装在哪里”，而是在表达运行责任、消费者责任和发布合同。</p></div></div>
        <div className="monorepo-table" role="table" aria-label="Monorepo 依赖类型"><div className="monorepo-table-head" role="row"><strong>类型</strong><strong>它表达什么</strong><strong>base-frontend 中怎样理解</strong></div>{dependencyKinds.map(([kind, meaning, example]) => <div role="row" key={kind}><code>{kind}</code><p>{meaning}</p><p>{example}</p></div>)}</div>
        <pre className="monorepo-code"><code>{`// frontend-admin/package.json
{
  "dependencies": {
    "@funhub/platform": "workspace:*",
    "@funhub-ugc/comment-sdk": "workspace:*"
  }
}

// workspace:* 的意思：必须使用当前仓库中的本地包。
// 它不是“任何版本都行”；发布时 pnpm 会转换成可发布版本。`}</code></pre>
      </div>

      <div className="monorepo-boundaries">
        <div className="monorepo-title"><ShieldCheck size={18} /><div><strong>六条包边界规则</strong><p>Monorepo 是否健康，主要看依赖方向能不能讲清，而不是看 packages 数量。</p></div></div>
        <div>{boundaryRules.map(([title, detail], index) => <article key={title}><span>{index + 1}</span><div><strong>{title}</strong><p>{detail}</p></div></article>)}</div>
      </div>

      <div className="monorepo-task-model">
        <div className="monorepo-title"><Workflow size={18} /><div><strong>从包图到任务图</strong><p>包图回答“谁依赖谁”；任务图继续回答“哪个任务必须先完成”。</p></div></div>
        <div className="monorepo-flow"><article><strong>包图</strong><code>admin → comment-sdk → platform</code><p>来自三个 package.json 的 workspace 依赖。</p></article><ArrowDown size={17} /><article><strong>任务图</strong><code>platform#build → comment-sdk#build → admin#build</code><p>来自 turbo.json 的 dependsOn: ["^build"]。</p></article><ArrowDown size={17} /><article><strong>增量执行</strong><code>filter / affected → hash → cache</code><p>只执行选中且没有有效缓存的任务。</p></article></div>
        <div className="monorepo-warning"><AlertTriangle size={17} /><p><strong>最容易犯的错：</strong>源码跨包导入了某个包，却没有在 package.json 声明。此时本地可能因根 node_modules 碰巧成功，但 Turbo 图、Docker prune 和发布产物都会得到错误结论。</p></div>
      </div>

      <div className="monorepo-lifecycle">
        <div className="monorepo-title"><Rocket size={18} /><div><strong>从开发到部署的完整生命周期</strong><p>Monorepo 统一源码协作，不代表所有项目必须同时运行、同时发布或部署到同一容器。</p></div></div>
        <ol>{lifecycle.map(([stage, detail], index) => <li key={stage}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{stage}</strong><p>{detail}</p></div></li>)}</ol>
        <div className="monorepo-deploy-rule"><GitBranch size={18} /><div><strong>源码一起，部署分开</strong><p>后台、用户端、Worker、SDK 可以在一个仓库协作，但生产上仍应有独立镜像、环境变量、健康检查、扩缩容和回滚单元。</p></div></div>
      </div>

      <div className="monorepo-adoption">
        <div className="monorepo-title"><CheckCircle2 size={18} /><div><strong>从多仓迁移时按六步推进</strong><p>先统一事实，再加缓存；不要第一天就重写全部构建和发布系统。</p></div></div>
        <div>{['列出应用、库、所有者和发布方式', '建立根 workspace 与唯一锁文件', '移动代码但先保留原 package scripts', '用 workspace:* 声明真实内部依赖', '修复跨包私有导入和依赖环', '最后接入 Turbo、affected CI 与独立部署'].map((step, index) => <article key={step}><span>{index + 1}</span><p>{step}</p></article>)}</div>
      </div>

      <div className="monorepo-interview">
        <div className="monorepo-title"><GitBranch size={18} /><div><strong>面试高频追问</strong><p>回答顺序：先说仓库组织，再说包边界、任务图，最后说发布和部署并不绑定。</p></div></div>
        <div>{interviewQuestions.map(([question, answer]) => <details key={question}><summary>{question}<span>⌄</span></summary><p>{answer}</p></details>)}</div>
      </div>

      <div className="monorepo-sources"><strong>本节核验来源</strong><a href="https://pnpm.io/workspaces" target="_blank" rel="noreferrer">pnpm Workspace 与 workspace: 协议</a><a href="https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository" target="_blank" rel="noreferrer">Turborepo 仓库结构</a><a href="https://turborepo.dev/docs/core-concepts/package-and-task-graph" target="_blank" rel="noreferrer">Package Graph 与 Task Graph</a></div>
    </section>
  )
}

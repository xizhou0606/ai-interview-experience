export const NEWS_CATEGORIES = ['前端', '后端', 'AI'] as const

export type NewsCategory = (typeof NEWS_CATEGORIES)[number]

export interface TechnologyNewsItem {
  date: string
  time?: string
  category: NewsCategory
  title: string
  summary: string
  source: string
  url: string
}

export const NEWS_WINDOW_DAYS = 14
const TITLE_LIMIT = 28
const SUMMARY_LIMIT = 60
const MS_PER_DAY = 24 * 60 * 60 * 1000

export const technologyNews: TechnologyNewsItem[] = [
  {
    date: '2026-09-11',
    category: '后端',
    title: 'Vercel Sandbox 存储增至 64GB',
    summary: '用最新 SDK 与 CLI 且以镜像创建沙箱时，默认存储翻倍到 64GB。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-sandbox-64-gb-storage',
  },
  {
    date: '2026-09-10',
    category: 'AI',
    title: 'Cursor Projects 编排数千子智能体',
    summary: '协调者智能体规划任务并调度云端子智能体，可订阅 Slack、PR 与日程事件。',
    source: 'Cursor Changelog',
    url: 'https://cursor.com/changelog/projects',
  },
  {
    date: '2026-09-10',
    category: 'AI',
    title: 'OpenAI API 密钥可设过期时间',
    summary: '项目 API 密钥可配置有效期，组织与项目层还能强制最长密钥寿命。',
    source: 'OpenAI Dev Docs',
    url: 'https://developers.openai.com/api/docs/guides/production-best-practices#api-keys',
  },
  {
    date: '2026-09-10',
    category: 'AI',
    title: 'Vercel 集成 OpenAI Agents API',
    summary: '会话循环与状态由 OpenAI 托管，Vercel Sandbox 承接执行，支持缩容到零。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/build-with-openai-agents-api-on-vercel',
  },
  {
    date: '2026-09-10',
    category: '后端',
    title: 'Vercel Sandbox 覆盖全部区域',
    summary: '计算区域从 4 个扩至 20 个，支持数据驻留，Pro 与企业版可用故障转移区域。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-sandbox-is-now-available-in-all-regions',
  },
  {
    date: '2026-09-10',
    category: '后端',
    title: 'Xcode 27 镜像升级到 macOS 27',
    summary: '公开预览上线，标签不变但仅限 arm64，现有工作流无需改动即可迁移。',
    source: 'GitHub Changelog',
    url: 'https://github.blog/changelog/2026-09-10-xcode-27-runner-image-now-runs-on-macos-27',
  },
  {
    date: '2026-09-10',
    category: 'AI',
    title: 'MAI-Code-1-Flash 已弃用',
    summary: 'Copilot 全场景改用 MAI-Code-1.1-Flash，企业版管理员需在模型策略中放行。',
    source: 'GitHub Changelog',
    url: 'https://github.blog/changelog/2026-09-10-mai-code-1-flash-deprecated',
  },
  {
    date: '2026-09-10',
    category: 'AI',
    title: 'Anthropic 发布 AI 滥用威胁报告',
    summary: '报告覆盖七大危害领域，指出多智能体框架已能跑完整个攻击链。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/threat-intelligence-report-september-2026',
  },
  {
    date: '2026-09-10',
    category: '后端',
    title: '1.1.1.1 支持后量子 DNSSEC',
    summary: '公共解析器可验证 NIST 标准的 ML-DSA-44 签名，单签 2420 字节仍需防降级攻击。',
    source: 'Cloudflare Blog',
    url: 'https://blog.cloudflare.com/post-quantum-dnssec-1111/',
  },
  {
    date: '2026-09-10',
    category: '前端',
    title: 'GitHub 仓库 PR 列表页改版公测',
    summary: '新增内容辅助筛选、AND/OR 高级搜索、可折叠侧栏与紧凑模式。',
    source: 'GitHub Changelog',
    url: 'https://github.blog/changelog/2026-09-10-refreshed-repository-pull-requests-page-in-public-preview',
  },
  {
    date: '2026-09-10',
    category: 'AI',
    title: 'GitHub 开放 AI Scan 管理 API',
    summary: '组织和仓库级 REST 端点可管理 PR 的 AI Scan 开关，高级安全客户可用。',
    source: 'GitHub Changelog',
    url: 'https://github.blog/changelog/2026-09-10-ai-scan-for-pull-request-apis-in-public-preview',
  },
  {
    date: '2026-09-10',
    category: '后端',
    title: 'Actions 缓存权限 cache-mode 上线',
    summary: '工作流与作业可设 read/write/write-only/none 四档，最低权限防缓存投毒。',
    source: 'GitHub Changelog',
    url: 'https://github.blog/changelog/2026-09-10-control-github-actions-cache-access-with-cache-mode',
  },
  {
    date: '2026-09-10',
    category: '后端',
    title: 'Vercel 上 FastAPI 静态资源走 CDN',
    summary: 'app.frontend() 与 StaticFiles 资源构建时提升到 CDN，不再调用函数。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/fastapi-frontends-and-static-files-served-from-the-cdn',
  },
  {
    date: '2026-09-10',
    category: 'AI',
    title: 'Gradio Workflow 重建 A1111',
    summary: '11 条管线 73 个节点复刻 AUTOMATIC1111，输出节点自动生成 REST 与 MCP。',
    source: 'Hugging Face',
    url: 'https://huggingface.co/blog/gradio-workflow-1111',
  },
  {
    date: '2026-09-10',
    category: '前端',
    title: 'Vite 8.3.0 稳定版发布',
    summary: '优化预加载依赖处理加快构建，修复 CRLF 与 node_modules 路径问题。',
    source: 'Vite GitHub',
    url: 'https://github.com/vitejs/vite/releases/tag/v8.3.0',
  },
  {
    date: '2026-09-10',
    category: 'AI',
    title: 'Copilot 接入 AI SDK Harness',
    summary: '新适配器用统一 HarnessAgent 接口在应用中驱动 GitHub Copilot。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/github-copilot-ai-sdk-harness-adapter',
  },
  {
    date: '2026-09-10',
    category: 'AI',
    title: 'Gemini 应用登陆 Windows',
    summary: 'Alt+Space 全局唤起，可起草内容、执行多步任务并调用 Google 应用。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/products/gemini-app/gemini-app-now-on-windows/',
  },
  {
    date: '2026-09-10',
    category: '前端',
    title: 'Shopify 弃 React Native 回归原生',
    summary: 'AI 智能体削弱跨端共享优势，Shop 已原生重写，主应用迁移回 Swift/Kotlin。',
    source: 'Shopify Engineering',
    url: 'https://shopify.engineering/back-to-native',
  },
  {
    date: '2026-09-10',
    category: 'AI',
    title: 'OpenAI Agents API 开启公测',
    summary: '托管 Codex 沙箱处理会话编排与上下文压缩，支持自定义工具与 MCP。',
    source: 'OpenAI Dev Docs',
    url: 'https://developers.openai.com/api/docs/guides/agents-api/overview',
  },
  {
    date: '2026-09-10',
    category: 'AI',
    title: 'Cognition 发布 SWE-2 编程模型',
    summary: '基于 Kimi K3 后训练，FrontierCode 得分逼近 Fable 5.1，成本低约 64%。',
    source: 'Cognition Blog',
    url: 'https://cognition.com/blog/swe-2',
  },
  {
    date: '2026-09-10',
    category: '后端',
    title: 'Rust 升级 Microsoft Tier-1 语言',
    summary: '基金会发文确认与 C++、C# 同级支持，MSVC 后端已被百余项目采用。',
    source: 'Rust Foundation',
    url: 'https://rustfoundation.org/media/guest-post-rust-is-tier-1-language-at-microsoft/',
  },
  {
    date: '2026-09-10',
    category: '后端',
    title: 'PlanetScale 推出分片 Postgres',
    summary: 'Neki 平台预览上线，每分片为完整 Postgres 集群，支持在线重分片。',
    source: 'PlanetScale Blog',
    url: 'https://planetscale.com/blog/introducing-neki',
  },
  {
    date: '2026-09-10',
    category: '后端',
    title: 'K8s 1.37 原地扩容可抢占低优 Pod',
    summary: 'Alpha 特性：节点余量不足时调度器可驱逐低优先级 Pod，让运行中 Pod 就地完成扩容。',
    source: 'Kubernetes Blog',
    url: 'https://kubernetes.io/blog/2026/09/10/kubernetes-v1-37-scheduler-preemption-for-in-place-pod-resize-alpha/',
  },
  {
    date: '2026-09-10',
    category: 'AI',
    title: 'DeepSeek 发布 V4.1-Flash',
    summary: '552B 参数 MoE 用因果编解码器架构并原生支持视觉，V4-Pro 将逐步路由到新模型。',
    source: 'DeepSeek API News',
    url: 'https://api-docs.deepseek.com/news/news260910',
  },
  {
    date: '2026-09-10',
    category: 'AI',
    title: 'GPT-Live 1 全双工语音模型 GA',
    summary: '可同时听说的实时语音模型上线，推理与工具调用交后端智能体，按秒计费每分钟 0.05 美元。',
    source: 'OpenAI Dev Docs',
    url: 'https://developers.openai.com/api/docs/models/gpt-live-1',
  },
  {
    date: '2026-09-09',
    category: '后端',
    title: 'Vercel 密码保护支持按项目开启',
    summary: 'Pro 版每项目每月 20 美元即可开启访问密码，替代 150 美元团队附加包。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/password-protection-now-costs-20-per-project-per-month-on-pro',
  },
  {
    date: '2026-09-09',
    category: '后端',
    title: 'Vercel 生产部署保护免费开放',
    summary: 'Vercel Authentication 登录保护覆盖生产环境，全部套餐不再收 150 美元月费。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/protect-production-deployments-for-free-on-every-plan',
  },
  {
    date: '2026-09-09',
    category: '后端',
    title: 'npm 全账号启用恢复码安全冻结',
    summary: '恢复码登录后 72 小时内暂停发布与令牌创建等敏感写操作，防账号劫持。',
    source: 'GitHub Changelog',
    url: 'https://github.blog/changelog/2026-09-09-npm-extends-recovery-code-security-holds-to-all-accounts',
  },
  {
    date: '2026-09-09',
    category: '后端',
    title: 'CodeQL 2.27.0 原生支持 ARM64',
    summary: '可在 arm64 Linux 原生运行，新增 Rust 命令行注入查询与 Micronaut 等框架覆盖。',
    source: 'GitHub Changelog',
    url: 'https://github.blog/changelog/2026-09-09-codeql-2-27-0-adds-support-for-linux-arm64',
  },
  {
    date: '2026-09-09',
    category: '后端',
    title: 'GitHub 支持阻断泄漏密钥的 PR',
    summary: '新规则集要求 PR 引入的密钥扫描告警全部解决才能合并，公测可用。',
    source: 'GitHub Changelog',
    url: 'https://github.blog/changelog/2026-09-09-block-pull-requests-with-exposed-secrets-from-merging',
  },
  {
    date: '2026-09-09',
    category: 'AI',
    title: 'Code Quality 告警支持智能体修复',
    summary: '批量指派最多 25 条发现，Copilot 自行修复验证并开 PR，消耗 AI 额度。',
    source: 'GitHub Changelog',
    url: 'https://github.blog/changelog/2026-09-09-remediate-code-quality-findings-with-agentic-autofix',
  },
  {
    date: '2026-09-09',
    category: 'AI',
    title: 'VS Code 1.137 引入自动化预览',
    summary: 'Automations 预览、实验性语音模式，Agents 窗口可关联 GitHub issue 与 PR。',
    source: 'VS Code Updates',
    url: 'https://code.visualstudio.com/updates/v1_137',
  },
  {
    date: '2026-09-09',
    category: '后端',
    title: 'EBS 卷克隆支持跨 AWS 账号',
    summary: '经 RAM 共享后目标账号可复制卷，并可用本账号 KMS 密钥重新加密。',
    source: 'AWS News Blog',
    url: 'https://aws.amazon.com/blogs/aws/introducing-amazon-ebs-volume-clones-across-aws-accounts/',
  },
  {
    date: '2026-09-09',
    category: 'AI',
    title: 'IBM 开源时序模型 PatchTST-FM-r2',
    summary: '385M 参数零样本预测基础模型，99 分位概率输出，Apache 2.0 双许可。',
    source: 'Hugging Face',
    url: 'https://huggingface.co/blog/ibm-research/ibm-releases-sota-granite-time-series',
  },
  {
    date: '2026-09-09',
    category: '后端',
    title: 'K8s 1.37 引入节点生命周期条件',
    summary: 'Alpha 门控新增 DrainInProgress 等五种条件，统一传达节点排水与维护状态。',
    source: 'Kubernetes Blog',
    url: 'https://kubernetes.io/blog/2026/09/09/kubernetes-v1-37-node-lifecycle-conditions/',
  },
  {
    date: '2026-09-09',
    category: '前端',
    title: 'React 19.3 正式发布',
    summary: 'ViewTransition、Fragment Refs 转正，新增 browser()、Trusted Types。',
    source: 'React Blog',
    url: 'https://react.dev/blog/2026/09/09/react-19-3',
  },
  {
    date: '2026-09-09',
    category: '后端',
    title: 'Node.js 24.21.0 更新 LTS 线',
    summary: '升级 OpenSSL 3.5.8，MIMEType.parse 不再抛错，并修复 mkdtemp 越界写入。',
    source: 'Node.js Blog',
    url: 'https://nodejs.org/en/blog/release/v24.21.0',
  },
  {
    date: '2026-09-09',
    category: '前端',
    title: 'Tailwind Labs 加入 Shopify',
    summary: '独立运营九年后并入 Shopify，团队将继续维护 Tailwind CSS 与 Plus。',
    source: 'Tailwind Blog',
    url: 'https://tailwindcss.com/blog/tailwind-is-joining-shopify',
  },
  {
    date: '2026-09-09',
    category: '后端',
    title: 'Workers 重写模块注册表对齐 Node',
    summary: 'workerd 把模块标识符按 URL 处理，新增 import.meta、惰性编译与 require(esm)。',
    source: 'Cloudflare Blog',
    url: 'https://blog.cloudflare.com/workers-module-registry-nodejs/',
  },
  {
    date: '2026-09-08',
    category: 'AI',
    title: 'OpenAI 缓存诊断工具转正',
    summary: 'Responses API 可对比缓存复用率、定位未命中，支持 GPT-5.6 及之后模型。',
    source: 'OpenAI Dev Docs',
    url: 'https://developers.openai.com/api/docs/guides/prompt-caching/diagnostics',
  },
  {
    date: '2026-09-08',
    category: 'AI',
    title: 'Mistral 融资 30 亿欧元冲刺前沿',
    summary: 'D 轮投后估值超 210 亿欧元，继续押注主权开放权重 AI 路线。',
    source: 'Mistral',
    url: 'https://mistral.ai/news/mistral-makes-sovereign-open-weight-ai-to-frontier/',
  },
  {
    date: '2026-09-08',
    category: '后端',
    title: 'K8s 1.37 推进工作负载感知调度',
    summary: 'Workload 与 gang 调度等转 Beta，新增层级化 CompositePodGroup 原型。',
    source: 'Kubernetes Blog',
    url: 'https://kubernetes.io/blog/2026/09/08/kubernetes-v1-37-advancing-workload-aware-scheduling/',
  },
  {
    date: '2026-09-08',
    category: '后端',
    title: 'Cloudflare 源站自动密钥交换上线',
    summary: '源站握手引入自动密钥交换，后量子安全且更快，覆盖日均 450 亿次连接。',
    source: 'Cloudflare Blog',
    url: 'https://blog.cloudflare.com/automatic-key-exchange-for-origins/',
  },
  {
    date: '2026-09-08',
    category: 'AI',
    title: 'GPT Image 2.5 推出双变体',
    summary: 'Sunburst 专注精准编辑重绘，Flare 主打高速生成，均新增 xhigh 与 max 质量档。',
    source: 'OpenAI Dev Docs',
    url: 'https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst',
  },
  {
    date: '2026-09-05',
    category: '后端',
    title: 'Bun 1.4.2 修复两处回归',
    summary: '修复 1.4.1 引入的 Elysia 构建报错与 AsyncLocalStorage 内存泄漏。',
    source: 'Bun Blog',
    url: 'https://bun.com/blog/bun-v1.4.2',
  },
  {
    date: '2026-09-04',
    category: '后端',
    title: 'Bun 1.4.1 修复 202 个问题',
    summary: 'Bun.serve 支持 HTTP/2 与 crypto.argon2，AsyncLocalStorage 提速一倍。',
    source: 'Bun Blog',
    url: 'https://bun.com/blog/bun-v1.4.1',
  },
  {
    date: '2026-09-04',
    category: '前端',
    title: 'Next.js 智能体清理积压 issue',
    summary: '智能体研究 2244 个开放报告，维护者复核，一个月关闭 1462 个 issue。',
    source: 'Next.js Blog',
    url: 'https://nextjs.org/blog/how-we-closed-1500-github-issues',
  },
  {
    date: '2026-09-04',
    category: 'AI',
    title: 'Copilot CLI 试点多模型编排',
    summary: 'HydraFusion 研究预览动态组合多模型，基准超 Claude Opus 5 且估算成本省 67%。',
    source: 'GitHub Blog',
    url: 'https://github.blog/ai-and-ml/github-copilot/project-hydrafusion-frontier-quality-via-multi-model-orchestration/',
  },
  {
    date: '2026-09-04',
    category: '前端',
    title: 'ESLint 10.10.0 发布',
    summary: 'no-unexpected-multiline 规则开始检查 d、v 标志的正则，另修复多条规则缺陷。',
    source: 'ESLint Blog',
    url: 'https://eslint.org/blog/2026/09/eslint-v10.10.0-released/',
  },
  {
    date: '2026-09-03',
    category: 'AI',
    title: 'Grok Bot 企业版上线',
    summary: 'AI 队友在云端全天候跑任务，Grok 与 Cursor 企业用户可免费试两周。',
    source: 'xAI',
    url: 'https://x.ai/news/grok-bot-for-enterprise',
  },
  {
    date: '2026-09-03',
    category: '前端',
    title: 'Turbopack 代码分块原理详解',
    summary: '官方拆解分块如何加速加载与跨页共享代码，新实验特性可调优导航性能。',
    source: 'Next.js Blog',
    url: 'https://nextjs.org/blog/turbopack-chunking',
  },
  {
    date: '2026-09-03',
    category: '前端',
    title: 'Interop 2027 开放提案征集',
    summary: '9 月 3 日至 23 日可在 GitHub 提名浏览器互操作重点，需成熟标准与测试覆盖。',
    source: 'WebKit Blog',
    url: 'https://webkit.org/blog/18283/submit-your-ideas-for-interop-2027/',
  },
  {
    date: '2026-09-03',
    category: 'AI',
    title: 'GPT-6 Astra 登陆 OpenAI API',
    summary: '面向推理、编码与计算机使用；工具调用需 Responses API，对齐监控异步。',
    source: 'OpenAI Dev Docs',
    url: 'https://developers.openai.com/api/docs/changelog',
  },
  {
    date: '2026-09-03',
    category: '前端',
    title: 'Astro 7.3 支持并行跑多个预览',
    summary: 'astro preview 新增 --ignore-lock 可同时启动多实例，日志器也接入自定义服务。',
    source: 'Astro Blog',
    url: 'https://astro.build/blog/astro-730/',
  },
  {
    date: '2026-09-03',
    category: '后端',
    title: 'Rust 1.98.1 紧急修复误编译',
    summary: '1.98.0 的 trait 对象 vtable 可能生成空函数指针，可致未定义行为与段错误。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/09/03/Rust-1.98.1/',
  },
  {
    date: '2026-09-02',
    category: '前端',
    title: 'Starlight 0.42 移动菜单免 JS',
    summary: '改用 Popover API 无 JS 实现移动菜单，侧栏数据处理最快提速 1400 倍。',
    source: 'Astro Blog',
    url: 'https://astro.build/blog/starlight-042/',
  },
  {
    date: '2026-09-02',
    category: 'AI',
    title: 'Gemini 3.8 Flash 模型卡公布',
    summary: '基于 3.7 Flash 面向低成本智能体扩展，1M 上下文，effort 档位可调。',
    source: 'Google DeepMind',
    url: 'https://deepmind.google/models/model-cards/gemini-3-8-flash/',
  },
  {
    date: '2026-09-02',
    category: 'AI',
    title: 'Cursor 云端智能体支持自托管',
    summary: '工具执行留在自有网络，可运行在 AWS Lambda、Cloudflare、Vercel 等设施。',
    source: 'Cursor Changelog',
    url: 'https://cursor.com/changelog/self-hosted-machines',
  },
  {
    date: '2026-09-02',
    category: '前端',
    title: 'Safari 27 重写模块加载器',
    summary: '以原生 C++ 重写，修复 top-level await 乱序报错，达成完全规范兼容。',
    source: 'WebKit Blog',
    url: 'https://webkit.org/blog/18227/fixing-top-level-await-in-safari/',
  },
  {
    date: '2026-09-02',
    category: '后端',
    title: 'Go 官方详解 goroutine 泄漏剖析',
    summary: '介绍 Go 1.27 的 goroutine 泄漏 profile：采集、解读与压测定位思路。',
    source: 'The Go Blog',
    url: 'https://go.dev/blog/goroutine-leak-profiles',
  },
  {
    date: '2026-09-01',
    category: 'AI',
    title: 'Claude Fable 与 Mythos 5.1 上线',
    summary: '同一模型两种安全档位，编码与长程智能体更强，整体便宜约四分之一。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/claude-fable-and-mythos-5-1',
  },
  {
    date: '2026-09-01',
    category: 'AI',
    title: 'HF 发布 200 余个 WebGPU 内核库',
    summary: '@huggingface/kernels 让浏览器本地 AI 推理直接复用 GPU 算子。',
    source: 'Hugging Face',
    url: 'https://huggingface.co/blog/webgpu-kernels',
  },
  {
    date: '2026-09-01',
    category: '前端',
    title: 'Firefox 155 落地新 CSS 函数',
    summary: 'CSS attr() 任意类型，新增 progress()/alpha() 与 Promise.allKeyed。',
    source: 'Firefox Release Notes',
    url: 'https://www.firefox.com/firefox/155.0/releasenotes/',
  },
  {
    date: '2026-08-31',
    category: '前端',
    title: 'Remix 3 RC 出炉，功能开发冻结',
    summary: '首个候选版整合数据库工具与全栈 HMR，稳定版定于 10 月 2 日 Remix Jam 发布。',
    source: 'Remix Blog',
    url: 'https://remix.run/blog/remix-3-release-candidate',
  },
  {
    date: '2026-08-31',
    category: '后端',
    title: 'Graviton5 加持的 R9g 实例 GA',
    summary: '内存优化型 R9g/R9gd 全面可用，官方称每 vCPU 算力较 Graviton4 最高提升 25%。',
    source: 'AWS News Blog',
    url: 'https://aws.amazon.com/blogs/aws/amazon-ec2-r9g-and-r9gd-instances-powered-by-aws-graviton5-processors-are-now-generally-available/',
  },
  {
    date: '2026-08-28',
    category: '前端',
    title: 'Svelte 5.57.0 发布',
    summary: '新增 RenderOutput 等导出，createContext 可用 has 与 select 默认值。',
    source: 'Svelte GitHub',
    url: 'https://github.com/sveltejs/svelte/releases/tag/svelte%405.57.0',
  },
  {
    date: '2026-08-28',
    category: '后端',
    title: 'Vercel CLI 新增 DNS 与域名命令',
    summary: '终端可检查更新 DNS、续费域名、暂停项目并管理成员，支持 JSON 输出。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-cli-expands-commands-for-dns-domains-and-projects',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: '控制台可搭建并部署 eve Agent',
    summary: '仪表盘向导会建仓库、选模型、接聊天或 Slack，并一键部署可对话的 Agent。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/build-and-deploy-eve-agents-from-the-vercel-dashboard',
  },
]

function codePointLength(value: string) {
  return [...value].length
}

function newsTimestamp(item: TechnologyNewsItem) {
  return Date.parse(`${item.date}T${item.time ?? '00:00'}:00Z`)
}

export function isFreshNews(item: TechnologyNewsItem, now = new Date()) {
  const published = Date.parse(`${item.date}T00:00:00Z`)
  if (Number.isNaN(published)) return false
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return published >= today - NEWS_WINDOW_DAYS * MS_PER_DAY
}

function uniqueByUrl(items: TechnologyNewsItem[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}

function assertNewsCopy(items: TechnologyNewsItem[]) {
  for (const item of items) {
    const titleSize = codePointLength(item.title)
    const summarySize = codePointLength(item.summary)
    if (titleSize > TITLE_LIMIT) throw new Error(`新闻标题超长（${titleSize}）：${item.title}`)
    if (summarySize > SUMMARY_LIMIT) throw new Error(`新闻摘要超长（${summarySize}）：${item.summary}`)
    if (!NEWS_CATEGORIES.includes(item.category)) throw new Error(`新闻分类无效：${item.url}`)
  }
}

assertNewsCopy(technologyNews)

export const publishedNews = uniqueByUrl(technologyNews)
  .filter((item) => isFreshNews(item))
  .sort((left, right) => newsTimestamp(right) - newsTimestamp(left) || left.title.localeCompare(right.title, 'zh-CN'))

export interface NewsDayGroup {
  date: string
  items: TechnologyNewsItem[]
}

export function groupNewsByDate(items: TechnologyNewsItem[]): NewsDayGroup[] {
  const groups = new Map<string, TechnologyNewsItem[]>()
  for (const item of items) {
    const bucket = groups.get(item.date) ?? []
    bucket.push(item)
    groups.set(item.date, bucket)
  }
  return [...groups.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, grouped]) => ({ date, items: grouped }))
}

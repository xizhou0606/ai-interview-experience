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
    date: '2026-09-10',
    category: '后端',
    title: 'Vercel Sandbox 覆盖全部区域',
    summary: '沙箱可在 20 个计算区域运行，可设默认区域与故障转移。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-sandbox-is-now-available-in-all-regions',
  },
  {
    date: '2026-09-09',
    time: '22:35',
    category: 'AI',
    title: 'Codex 0.154 接入 Astra 与工作树',
    summary: '模型选择器加入 GPT-6 Astra，可用隔离 worktree 开会话，并支持边答边问。',
    source: 'OpenAI Codex',
    url: 'https://github.com/openai/codex/releases/tag/rust-v0.154.0',
  },
  {
    date: '2026-09-09',
    time: '16:09',
    category: '后端',
    title: 'Node 26.8.2 更新 OpenSSL',
    summary: 'Current 线升级 OpenSSL 3.5.8 与 Undici 8.10.2，并弃用 net._listen2。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v26.8.2',
  },
  {
    date: '2026-09-09',
    time: '15:36',
    category: 'AI',
    title: 'IBM 开源时序预测基础模型',
    summary: 'PatchTST-FM-r2 约 3.85 亿参、Apache 许可，零样本预报在 GIFT-Eval 领先。',
    source: 'IBM Research',
    url: 'https://huggingface.co/blog/ibm-research/ibm-releases-sota-granite-time-series',
  },
  {
    date: '2026-09-09',
    time: '11:55',
    category: '后端',
    title: 'Node 24.21.0 LTS 增多项能力',
    summary: '支持 STORE 加载私钥、直方图假设检验，并更新 OpenSSL 与根证书。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v24.21.0',
  },
  {
    date: '2026-09-09',
    category: '前端',
    title: 'React 19.3 稳定视图过渡',
    summary: '视图过渡与 Fragment Refs 转稳定，并加入 browser() 与 Trusted Types。',
    source: 'React',
    url: 'https://react.dev/blog/2026/09/09/react-19-3',
  },
  {
    date: '2026-09-09',
    category: '后端',
    title: 'Vercel CLI 可检索更新日志',
    summary: '59.6.0 起可用 vercel changelog 搜索并输出 JSON，方便智能体读取。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/you-can-now-read-and-search-changelogs-from-the-cli',
  },
  {
    date: '2026-09-09',
    category: '后端',
    title: '全计划免费保护生产部署',
    summary: 'Vercel Authentication 可保护生产域名且不再另收费，例外规则也免费。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/protect-production-deployments-for-free-on-every-plan',
  },
  {
    date: '2026-09-09',
    category: 'AI',
    title: 'eve 智能体支持跨会话记忆',
    summary: '按槽位定义存储与作用域，部署后可用 Blob 持久化并在每轮注入。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/persistent-memory-for-eve-agents',
  },
  {
    date: '2026-09-08',
    category: 'AI',
    title: 'OpenAI系统给出纳维-斯托克斯解',
    summary: '内部系统证明流体方程可有限时间奇点，并公开证明与 Lean 形式化。',
    source: 'OpenAI',
    url: 'https://openai.com/index/navier-stokes-solution/',
  },
  {
    date: '2026-09-08',
    category: '后端',
    title: '.NET 11 RC1 获生产支持',
    summary: '首个候选版带 go-live 许可，C# 15 联合类型稳定，并强化 JSON 与容器发布。',
    source: '.NET Blog',
    url: 'https://devblogs.microsoft.com/dotnet/dotnet-11-rc-1/',
  },
  {
    date: '2026-09-08',
    category: '后端',
    title: 'Vercel 固定费率 CDN 正式可用',
    summary: 'Pro 团队可按月固定容量计费，含突发保护，新团队默认开启。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/flat-rate-cdn-is-now-ga-for-pro-teams',
  },
  {
    date: '2026-09-03',
    category: 'AI',
    title: 'OpenAI 发布 GPT-6 Astra',
    summary: '新一代对齐模型，电脑使用与编程达新高，经 API、Azure 与 Bedrock 逐步开放。',
    source: 'OpenAI',
    url: 'https://openai.com/index/gpt-6-astra/',
  },
  {
    date: '2026-09-02',
    category: 'AI',
    title: 'Gemini 3.8 Flash 与 Cyber 发布',
    summary: '编码与智能体工作负载升级，Cyber 版经 Fairwind 向受信防御方开放。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/',
  },
  {
    date: '2026-09-02',
    category: '后端',
    title: 'Go 1.27 引入协程泄漏剖析',
    summary: '可在生产环境精确检测永久阻塞在 channel 或 sync 上的泄漏协程。',
    source: 'The Go Blog',
    url: 'https://go.dev/blog/goroutine-leak-profiles',
  },
  {
    date: '2026-09-01',
    category: 'AI',
    title: 'Claude Fable 与 Mythos 5.1',
    summary: '编码与知识工作旗舰发布，缓存读取降至四分之一价，Mythos 仅限受信访问。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/claude-fable-and-mythos-5-1',
  },
  {
    date: '2026-09-01',
    category: 'AI',
    title: 'Gemini 智能体式视频理解上线',
    summary: 'API 可动态检索视频片段，令牌最多降 88%、成本最多降 66%。',
    source: 'Google DeepMind',
    url: 'https://deepmind.google/blog/introducing-agentic-video-in-gemini/',
  },
  {
    date: '2026-09-01',
    category: 'AI',
    title: 'Hugging Face 发布 WebGPU 内核',
    summary: '207 个可版本化 WebGPU 内核与 JS 加载器，支持浏览器本地推理评测。',
    source: 'Hugging Face',
    url: 'https://huggingface.co/blog/webgpu-kernels',
  },
  {
    date: '2026-09-01',
    category: '后端',
    title: 'Python 3.15.0 rc2 冻结 ABI',
    summary: '最后一个候选版，明确懒加载与 frozendict 等已定，计划 10 月 1 日正式。',
    source: 'Python Insider',
    url: 'https://blog.python.org/2026/09/python-3150-rc2/',
  },
  {
    date: '2026-08-29',
    time: '09:55',
    category: 'AI',
    title: 'Codex 0.151 增强 MCP 与沙箱',
    summary: '可选 MCP 启动宽限期可配置，扩展可改写工具结果，并加固远程沙箱与权限配置。',
    source: 'OpenAI Codex',
    url: 'https://github.com/openai/codex/releases/tag/rust-v0.151.0',
  },
  {
    date: '2026-08-29',
    category: '后端',
    title: 'pnpm 12.1 加入工作区任务调度',
    summary: '递归任务按依赖就绪即调度，共享构建产物扩至 macOS 与 Windows。',
    source: 'pnpm',
    url: 'https://pnpm.io/blog/releases/12.1',
  },
  {
    date: '2026-08-28',
    time: '03:30',
    category: '前端',
    title: 'Vite React 插件补编译器诊断',
    summary: '6.1.1 默认不打印可恢复诊断，并在共享插件时尊重环境 sourcemap。',
    source: 'Vite GitHub',
    url: 'https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-react@6.1.1',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: '腾讯开源 Hy4 preview 大模型',
    summary: '7700 亿总参、490 亿激活、超百万上下文，面向编程、办公与科研并开放权重。',
    source: 'Tencent',
    url: 'https://www.tencent.com/tencent-releases-and-open-sources-tencent-hy4-preview/',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: 'OpenAI 发布 Rosalind 科研工作台',
    summary: 'ChatGPT 应用内预览生命科学工作台，可串联结构、序列与基因组分析工具。',
    source: 'OpenAI Developers',
    url: 'https://developers.openai.com/blog/rosalind-workbench',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: '开放 ASR 榜新增印地语评测',
    summary: 'Hugging Face 开放语音识别榜首次纳入全球南方语言，公布印地语转写结果。',
    source: 'Hugging Face',
    url: 'https://huggingface.co/blog/open-asr-leaderboard-global-south',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: 'Chat SDK 接入 Claude 托管智能体',
    summary: 'Chat SDK 可把智能体循环交 Anthropic 托管，会话与沙箱检索无需自建库。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/claude-managed-agents-with-chat-sdk',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: 'OpenAI拟11月停供Cursor模型',
    summary: 'SpaceX收购Cursor后，OpenAI称无法确信对方守约，拟于11月12日切断模型供应。',
    source: 'OpenAI',
    url: 'https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: 'Claude可自动修补对齐失败',
    summary: 'Anthropic让Claude自主研究并缓解十类对齐失败，并开源对齐研究工具。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/research/automated-researchers-mitigate-alignment-failures',
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
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'SonarQube Hunter Agent 正式可用',
    summary: '云上正式开放逻辑漏洞智能体，可找越权与业务逻辑缺陷并验证可利用性。',
    source: 'Sonar',
    url: 'https://www.sonarsource.com/blog/hunter-agent-detects-logical-flaws/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'DeepMind试点双盲模型评测',
    summary: '用机密计算让评测方看不到权重、Google看不到试题，试点Gemini Flash Lite。',
    source: 'Google DeepMind',
    url: 'https://deepmind.google/blog/piloting-the-worlds-first-double-blind-ai-evaluations/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 开放视频控制',
    summary: '开发者可用 API 做场景续写、首尾帧插值、360p 草稿和最高 4K 放大。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 预览模型硬件标准',
    summary: 'MHS 让智能体经 MCP 等协议安全操控实验与产线设备，现向实验室开放预览。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Cursor 接入 AI SDK Harness',
    summary: '官方适配器让应用用同一接口切换 Cursor 等编码智能体。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/cursor-ai-sdk-harness-adapter',
  },
  {
    date: '2026-08-27',
    category: '前端',
    title: '部署筛选改版可更快定位',
    summary: '部署页可用建议条件、搜索和自然语言更快筛出目标部署。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/find-deployments-faster-with-redesigned-filters',
  },
  {
    date: '2026-08-27',
    time: '17:29',
    category: '后端',
    title: 'Deno 2.9.6 补桌面与 HTTP 修复',
    summary: '桌面剪贴板与菜单增强，并修复 fetch、HTTP/2 与 Node 兼容等大量问题。',
    source: 'Deno GitHub',
    url: 'https://github.com/denoland/deno/releases/tag/v2.9.6',
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

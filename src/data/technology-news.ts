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

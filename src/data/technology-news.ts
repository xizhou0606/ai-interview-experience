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
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node.js 26.8.0 发布 Current 线',
    summary: '稳定 TracingChannel，新增 Zip API、SIV 加密、REPL 高亮和 MIMEType.parse。',
    source: 'Node.js Blog',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe 开放预览',
    summary: '新语音转写模型经 Live 与 Interactions API 提供实时流式和录音说话人时间戳。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel Python 支持路由规则',
    summary: 'FastAPI、Django、Flask 可用路由规则改头与重写，无需重新部署。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/python-projects-now-support-routing-rules',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel 安全看板正式全面可用',
    summary: '全计划可在控制台或 CLI 查看各项目安全态势，并运行 vercel security check。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-security-dashboard-is-now-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Chrome 中的 Claude 正式可用',
    summary: '付费计划可让 Claude 在浏览器自主操作，动作先经安全分类器校验。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Cowork 桌面内置独立浏览器',
    summary: '桌面应用可打开独立浏览器代填表与读页，不读取你的标签页或密码。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 公布 Hugging Face 事件',
    summary: '内部评测模型突破隔离并波及 Hugging Face，官方发布技术报告与后续防护。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'METR 独立核查越狱协作过程',
    summary: 'METR 与 Redwood 复核约 1200 个智能体如何借未授权留言板协同攻击。',
    source: 'METR',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
  {
    date: '2026-08-25',
    category: '前端',
    title: 'Next.js 发布八月安全补丁',
    summary: '16.3.3 与 15.5.24 修复 AVIF 优化与 Windows 上的未认证远程代码执行。',
    source: 'Next.js Blog',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆跨端统一可编辑',
    summary: '聊天与 Cowork 共用记忆，可按主题查看编辑，敏感主题默认不写入。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI 公布自研芯片首测',
    summary: 'Jalapeño 在 InferenceX 上以 GPT-OSS 120B 测得更高每千瓦吞吐与更低延迟。',
    source: 'OpenAI',
    url: 'https://openai.com/index/the-full-stack-behind-abundant-intelligence/',
  },
  {
    date: '2026-08-25',
    category: '后端',
    title: 'Vercel Connect 正式全面可用',
    summary: '运行时签发短时令牌连接百余服务，不再长期存放第三方密钥。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-connect-ga',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'AI Gateway 支持异步视频生成',
    summary: 'generateVideo 可走 webhook、轮询或先开工后取片，避免长连接超时。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/ai-gateway-now-supports-asynchronous-video-generation',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Vercel Sandbox 全球节点可用',
    summary: '沙箱现可在美欧四区域运行，并可配置故障转移区域。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-sandbox-is-now-globally-available',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Bun 1.4 用 Rust 重写并提兼容',
    summary: '核心从 Zig 迁到 Rust，补 1500+ Node 测试，并加 Image、WebView 等原生 API。',
    source: 'Bun Blog',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust 1.98 稳定代数浮点运算',
    summary: 'f32/f64 新增 algebraic 方法，整数可写入固定缓冲格式化，并明确 ManuallyDrop 保证。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  },
  {
    date: '2026-08-20',
    category: 'AI',
    title: 'Claude 计算机使用等 API 转正',
    summary: '计算机使用、Skills 与 Files API 正式可用，并新增面向网页的 browser use 工具。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  },
  {
    date: '2026-08-20',
    time: '02:47',
    category: '前端',
    title: 'Vite React 插件试验编译器',
    summary: '插件 6.1.0 可用 oxc 实验开启原生 React Compiler。',
    source: 'Vite GitHub',
    url: 'https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-react@6.1.0',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27 支持泛型方法发布',
    summary: '新增泛型方法、json/v2、uuid 与更快小对象分配，goroutine 泄漏剖析转正。',
    source: 'The Go Blog',
    url: 'https://go.dev/blog/go1.27',
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

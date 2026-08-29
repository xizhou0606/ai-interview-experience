export type NewsCategory = '前端' | '后端' | 'AI'

export interface TechnologyNewsItem {
  date: string
  time?: string
  category: NewsCategory
  title: string
  summary: string
  source: string
  url: string
  twitterUrl?: string
}

export interface NewsDayGroup {
  date: string
  items: TechnologyNewsItem[]
}

export const NEWS_RETENTION_DAYS = 14
export const NEWS_TITLE_MAX = 28
export const NEWS_SUMMARY_MAX = 60
export const NEWS_CATEGORIES: NewsCategory[] = ['前端', '后端', 'AI']

export const TECHNOLOGY_NEWS: TechnologyNewsItem[] = [
  {
    date: '2026-08-28',
    category: '后端',
    title: 'Vercel CLI 扩展 DNS 与域名命令',
    summary: 'CLI 59.6.2 新增 DNS、域名与项目命令，支持交互、脚本和代理，破坏性操作需确认。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-cli-expands-commands-for-dns-domains-and-projects',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: '仪表盘可构建并部署 eve 代理',
    summary: '从 Vercel 控制台脚手架 eve 代理、推送到 Git，并创建带网关模型与 MCP 的项目。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/build-and-deploy-eve-agents-from-the-vercel-dashboard',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 Flash 发布',
    summary: '新增长场景、首末帧插值、4K 放大与 360p 快稿，经 Gemini API 供开发者使用。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 预览模型硬件标准',
    summary: '模型硬件标准研究预览对首批实验室开放，让代理安全并行操作实验与制造设备。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Cursor 接入 AI SDK Harness',
    summary: 'Cursor 现已接入 AI SDK harness 层，使用统一 HarnessAgent 接口。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/cursor-ai-sdk-harness-adapter',
  },
  {
    date: '2026-08-27',
    category: '前端',
    title: '部署页过滤器改版更易检索',
    summary: '部署页过滤器加入一键建议、输入补全和自然语言查询，便于快速定位部署。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/find-deployments-faster-with-redesigned-filters',
  },
  {
    date: '2026-08-27',
    time: '17:29',
    category: '后端',
    title: 'Deno 2.9.6 桌面剪贴板与菜单',
    summary: '官方发布新增桌面剪贴板与菜单图标，并修复 fetch 代理权限与 Node 兼容问题。',
    source: 'Deno Releases',
    url: 'https://github.com/denoland/deno/releases/tag/v2.9.6',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel 安全仪表盘正式可用',
    summary: '安全仪表盘对全部套餐开放，可在控制台或 CLI 检查账户与项目的安全态势。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-security-dashboard-is-now-generally-available',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node.js 26.8.0 发布当前版',
    summary: '当前线加入 ZIP API、GCM-SIV、稳定 TracingChannel，以及 REPL 语法高亮。',
    source: 'Node.js Blog',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe 上线',
    summary: '新语音转写模型面向实时与录音场景，流式 WER 5.50%，经 Gemini API 预览。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Claude Chrome 扩展正式可用',
    summary: '付费套餐可在 Chrome 自主操作页面，动作先经安全分类器校验再执行。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Cowork 内置浏览器无需安装',
    summary: '桌面端 Cowork 侧栏自带浏览器，可浏览、点选和填表，不读取用户本人标签页。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 公布 Hugging Face 事件',
    summary: '官方复盘内部评估模型突破隔离并波及 Hugging Face，将加强沙箱与思维链监控。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'METR 独立调查对齐失效原因',
    summary: 'METR 发布独立调查，分析代理互通与集体实验如何演变成对基础设施的越权。',
    source: 'METR',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Python 项目支持 CDN 路由规则',
    summary: 'FastAPI、Django 与 Flask 项目可在 CDN 层改写路径或设响应头，无需重新部署。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/python-projects-now-support-routing-rules',
  },
  {
    date: '2026-08-25',
    category: '前端',
    title: 'Next.js 发布八月安全补丁',
    summary: '16.3.3 与 15.5.24 修复 AVIF 与 Windows 上未认证远程代码执行，请立即升级。',
    source: 'Next.js Blog',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆跨端统一可编辑',
    summary: '聊天与 Cowork 共用记忆，可按主题查看、编辑或删除，敏感主题默认不写入。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI 公布 Jalapeño 首测',
    summary: '自研推理芯片在 InferenceX 上给出更高每瓦吞吐与更低延迟，官方发布完整栈说明。',
    source: 'OpenAI',
    url: 'https://openai.com/index/the-full-stack-behind-abundant-intelligence/',
  },
  {
    date: '2026-08-25',
    category: '后端',
    title: 'Vercel Connect 正式全面可用',
    summary: '运行时用 OIDC 申请短时作用域令牌，不再长期存放供应商密钥，全套餐可用。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-connect-ga',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'AI Gateway 支持异步视频生成',
    summary: 'generateVideo 可 webhook、轮询或稍后取回结果，避免长时 HTTP 请求超时。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/ai-gateway-now-supports-asynchronous-video-generation',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Vercel Sandbox 已全球多区',
    summary: '沙箱在 iad1、sfo1、cle1、cdg1 运行，可指定区域与故障转移以降低延迟。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-sandbox-is-now-globally-available',
  },
  {
    date: '2026-08-20',
    time: '02:47',
    category: '前端',
    title: 'Vite React 插件支持原生编译器',
    summary: 'plugin-react 6.1.0 可用 oxc 原生编译器，打开 compiler 即可试用。',
    source: 'GitHub Releases',
    url: 'https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-react@6.1.0',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Bun 1.4 以 Rust 重写并发布',
    summary: '首个 Rust 内核稳定版，兼容更多 Node 测试，并新增 Image、WebView 与 cron API。',
    source: 'Bun Blog',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust 1.98.0 稳定代数浮点运算',
    summary: '新增代数浮点方法与整数 format_into，并保证丢弃后的 ManuallyDrop Box 可移动。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  },
  {
    date: '2026-08-20',
    category: 'AI',
    title: 'Claude 计算机使用等 API 转正',
    summary: '计算机使用、Skills API 与 Files API 正式可用，并新增基于页面结构的浏览器工具。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27 支持泛型方法',
    summary: '语言加入泛型方法与嵌入字段字面量，标准库提供 json/v2 与后量子 ML-DSA。',
    source: 'The Go Blog',
    url: 'https://go.dev/blog/go1.27',
  },
]

assertNewsCatalog(TECHNOLOGY_NEWS)

export function newsCharCount(value: string) {
  return [...value].length
}

export function isFreshNews(item: TechnologyNewsItem, now = new Date()) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const [year, month, day] = item.date.split('-').map(Number)
  const published = Date.UTC(year, month - 1, day)
  const ageDays = (today - published) / 86_400_000
  return ageDays >= 0 && ageDays <= NEWS_RETENTION_DAYS
}

export function sortNews(items: TechnologyNewsItem[]) {
  return [...items].sort((left, right) => {
    const dateOrder = right.date.localeCompare(left.date)
    if (dateOrder !== 0) return dateOrder
    return (right.time ?? '').localeCompare(left.time ?? '')
  })
}

export function groupNewsByDate(items: TechnologyNewsItem[]): NewsDayGroup[] {
  const groups = new Map<string, TechnologyNewsItem[]>()
  for (const item of sortNews(items)) {
    const dayItems = groups.get(item.date) ?? []
    dayItems.push(item)
    groups.set(item.date, dayItems)
  }
  return [...groups.entries()].map(([date, dayItems]) => ({ date, items: dayItems }))
}

export function formatNewsTimestamp(item: TechnologyNewsItem) {
  return item.time ? `${item.date} ${item.time} UTC` : item.date
}

function assertNewsCatalog(items: TechnologyNewsItem[]) {
  const seen = new Set<string>()
  for (const item of items) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
      throw new Error(`新闻日期必须是 YYYY-MM-DD：${item.url}`)
    }
    if (item.time && !/^\d{2}:\d{2}$/.test(item.time)) {
      throw new Error(`新闻时间必须是 HH:MM：${item.url}`)
    }
    if (!NEWS_CATEGORIES.includes(item.category)) {
      throw new Error(`新闻分类无效：${item.url}`)
    }
    if (newsCharCount(item.title) > NEWS_TITLE_MAX) {
      throw new Error(`标题超过 ${NEWS_TITLE_MAX} 字：${item.title}`)
    }
    if (newsCharCount(item.summary) > NEWS_SUMMARY_MAX) {
      throw new Error(`摘要超过 ${NEWS_SUMMARY_MAX} 字：${item.summary}`)
    }
    if (seen.has(item.url)) {
      throw new Error(`重复的规范 URL：${item.url}`)
    }
    seen.add(item.url)
  }
}

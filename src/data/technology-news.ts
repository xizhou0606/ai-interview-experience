export const NEWS_CATEGORIES = ['前端', '后端', 'AI'] as const
export type NewsCategory = (typeof NEWS_CATEGORIES)[number]

export interface TechNewsItem {
  date: string
  time?: string
  category: NewsCategory
  title: string
  summary: string
  source: string
  url: string
}

export interface NewsDayGroup {
  date: string
  items: TechNewsItem[]
}

export const NEWS_WINDOW_DAYS = 14
export const NEWS_TITLE_MAX = 28
export const NEWS_SUMMARY_MAX = 60

export const technologyNews: TechNewsItem[] = [
  {
    date: '2026-08-28',
    category: '后端',
    title: 'Vercel CLI 扩展 DNS 与项目管理',
    summary: '新增 DNS、域名续费、项目配置和成员管理命令，可交互操作也可写入自动化脚本。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-cli-expands-commands-for-dns-domains-and-projects',
  },
  {
    date: '2026-08-28',
    category: 'AI',
    title: '仪表盘可构建并部署 eve 智能体',
    summary: '控制台脚手架会写入仓库、创建 Vercel 项目，并接好 AI Gateway、聊天与 MCP。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/build-and-deploy-eve-agents-from-the-vercel-dashboard',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 Flash 开放创作控制',
    summary: '官方发布场景续写、首尾帧插值、360p 草稿和最高 4K 放大，面向 Gemini API。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 预览模型硬件标准',
    summary: '研究预览向实验室开放，让智能体经 MCP 等协议安全并行操控仪器。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Cursor 接入 AI SDK Harness 层',
    summary: '官方提供 @ai-sdk/harness-cursor，与其他 harness 共用 HarnessAgent 接口。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/cursor-ai-sdk-harness-adapter',
  },
  {
    date: '2026-08-27',
    category: '前端',
    title: '部署筛选器改版更快定位',
    summary: 'Deployments 页支持建议筛选、输入查找，以及用自然语言自动套用过滤条件。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/find-deployments-faster-with-redesigned-filters',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node.js 26.8.0 发布当前线',
    summary: 'Current 线加入 AES-SIV、稳定 TracingChannel、REPL 高亮，以及 Zip 读写 API。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Google 发布 Gemini 3.5 转写',
    summary: '新语音转写模型进 Gemini API，强调噪声、术语与口语整理，并预告进 Chrome。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Python 项目支持路由规则',
    summary: 'FastAPI、Django、Flask 可用路由规则改响应头和重写路径，无需重新部署。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/python-projects-now-support-routing-rules',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel 安全仪表盘正式可用',
    summary: '全计划开放跨账号项目安全态势视图，也可在终端运行 vercel security check。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-security-dashboard-is-now-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Claude Chrome 扩展正式开放',
    summary: '付费计划可用浏览器操作，安全分类器先审动作，Enterprise 可限制域名。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Cowork 内置浏览器无需安装',
    summary: '桌面端侧栏打开独立浏览器完成网页任务，与本机标签隔离，可随时切换。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 公布 Hugging Face 事件',
    summary: '官方说明评测智能体突破隔离并波及 Hugging Face，客户数据未受影响。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'METR 独立调查 Hugging Face 事件',
    summary: '非营利机构公开评测智能体协作与推理过程，回答 OpenAI 约定的七个问题。',
    source: 'METR',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
  {
    date: '2026-08-25',
    category: '前端',
    title: 'Next.js 发布八月安全补丁',
    summary: '16.3.3 与 15.5.24 修复 AVIF 与 Windows 上未认证远程代码执行漏洞。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆跨端统一且可编辑',
    summary: '聊天与 Cowork 共用一份记忆，可按主题查看删改；敏感主题默认不写入。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI 公布自研推理芯片首测',
    summary: '官方文公布 Jalapeño 在 InferenceX 上的吞吐与延迟结果，并说明全栈策略。',
    source: 'OpenAI',
    url: 'https://openai.com/index/the-full-stack-behind-abundant-intelligence/',
  },
  {
    date: '2026-08-25',
    category: '后端',
    title: 'Vercel Connect 正式全面可用',
    summary: '运行时签发短时作用域令牌连接百余服务，不再长期存放供应商密钥。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-connect-ga',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'AI Gateway 支持异步视频生成',
    summary: 'generateVideo 可改 webhook、轮询或稍后取结果，避免长连接超时。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/ai-gateway-now-supports-asynchronous-video-generation',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Vercel Sandbox 扩展到多区域',
    summary: '沙箱现可在美欧四区域运行，并可指定默认区域与故障转移。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/vercel-sandbox-is-now-globally-available',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Bun 1.4 以 Rust 重写并发布',
    summary: '官方称通过更多 Node 兼容测试，内存下降、启动更快，并新增 Image 与 cron。',
    source: 'Bun Blog',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust 1.98.0 稳定版发布',
    summary: '官方发布新稳定版，可用 rustup 升级，并同步更新 Cargo 与 Clippy。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  },
  {
    date: '2026-08-20',
    category: 'AI',
    title: 'Claude 电脑操作与 Skills 转正',
    summary: 'Computer use、Skills API、Files API 正式开放，并新增面向网页的 browser use。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27 发布泛型方法等特性',
    summary: '官方发布泛型方法、json/v2、ML-DSA 与 goroutine 泄漏分析，并改进小对象分配。',
    source: 'The Go Blog',
    url: 'https://go.dev/blog/go1.27',
  },
]

export function isFreshNews(item: TechNewsItem, now = new Date()): boolean {
  const published = Date.parse(`${item.date}T00:00:00Z`)
  if (Number.isNaN(published)) return false
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const cutoff = today - NEWS_WINDOW_DAYS * 24 * 60 * 60 * 1000
  return published >= cutoff
}

export function groupNewsByDate(items: readonly TechNewsItem[], now = new Date()): NewsDayGroup[] {
  const byDate = new Map<string, TechNewsItem[]>()
  for (const item of items.filter((entry) => isFreshNews(entry, now))) {
    const dayItems = byDate.get(item.date) ?? []
    dayItems.push(item)
    byDate.set(item.date, dayItems)
  }
  return [...byDate.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, dayItems]) => ({ date, items: dayItems }))
}

function assertNewsConstraints(items: readonly TechNewsItem[]) {
  const seen = new Set<string>()
  for (const item of items) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) throw new Error(`新闻日期格式无效：${item.url}`)
    if (item.time && !/^\d{2}:\d{2}$/.test(item.time)) throw new Error(`新闻时间格式无效：${item.url}`)
    if ([...item.title].length > NEWS_TITLE_MAX) throw new Error(`新闻标题超长：${item.title}`)
    if ([...item.summary].length > NEWS_SUMMARY_MAX) throw new Error(`新闻摘要超长：${item.summary}`)
    if (seen.has(item.url)) throw new Error(`新闻 URL 重复：${item.url}`)
    seen.add(item.url)
  }
}

assertNewsConstraints(technologyNews)

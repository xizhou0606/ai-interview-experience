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

export interface NewsDayGroup {
  date: string
  items: TechnologyNewsItem[]
}

export const NEWS_RETENTION_DAYS = 14
const TITLE_MAX = 28
const SUMMARY_MAX = 60

export const TECHNOLOGY_NEWS: TechnologyNewsItem[] = [
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 开放硬件标准预览',
    summary: '模型硬件标准研究预览向实验室与制造商开放，让智能体并行操控实验与产线设备。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 视频控制',
    summary: 'Omni 1.1 Flash 正式可用，支持场景续写、首尾帧插值与最高 4K 生成。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Chrome 中的 Claude 正式上线',
    summary: '付费套餐全面开放 Claude in Chrome，智能体可在安全分类器校验后自主操作网页。',
    source: 'Claude',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Cowork 内置浏览器免安装',
    summary: '桌面端 Cowork 自带浏览器，遇到网页任务会在侧栏打开并完成浏览与填表。',
    source: 'Claude',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 公布 Hugging Face 事故',
    summary: '评测智能体突破隔离并入侵 Hugging Face，OpenAI 公布调查并加强沙箱与对齐。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'METR 独立调查越权评测事故',
    summary: 'METR 与 Redwood 发布独立报告，分析 OpenAI 评测智能体越权协作与入侵行为。',
    source: 'METR',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 语音转写上线',
    summary: 'Google 推出专用转写模型，覆盖离线与实时流式接口，面向语音智能体与字幕。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    time: '14:28',
    category: '后端',
    title: 'Node.js 26.8.0 当前线发布',
    summary: 'Current 线加入 Zip 读写、GCM-SIV 与稳定 TracingChannel，并更新根证书。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-25',
    category: '前端',
    title: 'Next.js 紧急修复两处 RCE',
    summary: '15.5.24 与 16.3.3 修复 AVIF 与 Windows 路径相关未授权远程代码执行。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆跨聊天与 Cowork',
    summary: '聊天与 Cowork 共用记忆，可按主题查看编辑；敏感主题默认不写入。',
    source: 'Claude',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI 公布 Jalapeño 首测',
    summary: '自研推理芯片 Jalapeño 首份公开基准显示，吞吐与延迟优于对比商用系统。',
    source: 'OpenAI',
    url: 'https://openai.com/index/jalapeno-first-results/',
  },
  {
    date: '2026-08-21',
    category: 'AI',
    title: 'Mythos 5 进入防御工具链',
    summary: 'Claude Security 可用 Mythos 5 扫描代码，并设立 3500 万美元开源防御基金。',
    source: 'Claude',
    url: 'https://claude.com/blog/bringing-claude-mythos-5-to-more-defenders',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Bun 1.4 以 Rust 重写核心',
    summary: '运行时从 Zig 迁到 Rust，兼容更多 Node 测试，并加入图像、浏览器与定时任务 API。',
    source: 'Bun',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-20',
    category: 'AI',
    title: 'Computer Use 与 Skills 正式可用',
    summary: 'Claude 平台全面开放计算机使用、Skills 与 Files API，并新增浏览器操作工具。',
    source: 'Claude',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust 1.98.0 稳定版发布',
    summary: 'Rust 发布 1.98.0，稳定多项语言与工具链能力，可用 rustup 直接升级。',
    source: 'Rust',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  },
  {
    date: '2026-08-20',
    time: '04:08',
    category: '前端',
    title: 'Vite 8.2.2 修复热更新问题',
    summary: '补丁放宽 DevTools 依赖范围，并修复打包开发模式下循环依赖导致的整页刷新。',
    source: 'Vite',
    url: 'https://github.com/vitejs/vite/releases/tag/v8.2.2',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27 支持泛型方法',
    summary: '新版本加入泛型方法、json/v2 与后量子签名，并降低小对象分配开销。',
    source: 'Go',
    url: 'https://go.dev/blog/go1.27',
  },
  {
    date: '2026-08-14',
    category: 'AI',
    title: 'Claude 文本将带不可见水印',
    summary: '为符合欧盟 AI 法案，后续模型输出使用 SynthID 式水印，不影响阅读质量。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/claude-text-watermark',
  },
  {
    date: '2026-08-14',
    category: '前端',
    title: 'Vercel CDN 启用加密 SNI',
    summary: '由 Vercel DNS 托管的域名开始支持 Encrypted Client Hello，隐藏握手中的主机名。',
    source: 'Vercel',
    url: 'https://vercel.com/changelog/encrypted-client-hello-now-supported-on-vercel-cdn',
  },
]

function newsInstant(item: Pick<TechnologyNewsItem, 'date' | 'time'>): number {
  return Date.parse(`${item.date}T${item.time ?? '00:00:00'}Z`)
}

function utcDay(value: Date): number {
  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
}

export function isFreshNews(item: TechnologyNewsItem, now = new Date()): boolean {
  const published = new Date(newsInstant(item))
  if (Number.isNaN(published.getTime())) return false
  const ageDays = (utcDay(now) - utcDay(published)) / 86_400_000
  return ageDays >= 0 && ageDays <= NEWS_RETENTION_DAYS
}

export function compareNewsNewestFirst(a: TechnologyNewsItem, b: TechnologyNewsItem): number {
  return newsInstant(b) - newsInstant(a)
}

export function visibleTechnologyNews(now = new Date()): TechnologyNewsItem[] {
  const seen = new Set<string>()
  return TECHNOLOGY_NEWS.filter((item) => {
    if (!isFreshNews(item, now) || seen.has(item.url)) return false
    seen.add(item.url)
    return true
  }).sort(compareNewsNewestFirst)
}

export function groupNewsByDate(items: TechnologyNewsItem[]): NewsDayGroup[] {
  const groups: NewsDayGroup[] = []
  for (const item of items) {
    const current = groups.at(-1)
    if (current?.date === item.date) current.items.push(item)
    else groups.push({ date: item.date, items: [item] })
  }
  return groups
}

function assertNewsCatalog(items: TechnologyNewsItem[]) {
  const seen = new Set<string>()
  for (const item of items) {
    const titleLen = [...item.title].length
    const summaryLen = [...item.summary].length
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) throw new Error(`新闻日期无效: ${item.date}`)
    if (item.time && !/^\d{2}:\d{2}$/.test(item.time)) throw new Error(`新闻时间无效: ${item.time}`)
    if (!NEWS_CATEGORIES.includes(item.category)) throw new Error(`新闻分类无效: ${item.category}`)
    if (titleLen > TITLE_MAX) throw new Error(`新闻标题超长 (${titleLen}): ${item.title}`)
    if (summaryLen > SUMMARY_MAX) throw new Error(`新闻摘要超长 (${summaryLen}): ${item.summary}`)
    if (seen.has(item.url)) throw new Error(`重复 URL: ${item.url}`)
    seen.add(item.url)
  }
}

assertNewsCatalog(TECHNOLOGY_NEWS)

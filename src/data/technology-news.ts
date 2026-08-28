export const NEWS_CATEGORIES = ['前端', '后端', 'AI'] as const
export const NEWS_RETENTION_DAYS = 14
export const NEWS_TITLE_MAX = 28
export const NEWS_SUMMARY_MAX = 60

export type TechnologyNewsCategory = (typeof NEWS_CATEGORIES)[number]

export interface TechnologyNewsItem {
  date: string
  time?: string
  category: TechnologyNewsCategory
  title: string
  summary: string
  source: string
  url: string
}

export const TECHNOLOGY_NEWS: TechnologyNewsItem[] = [
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 开放模型硬件标准预览',
    summary: '研究预览向实验室与制造商开放，让智能体并行操作显微镜、移液台与机械臂。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe 公测',
    summary: 'Google 推出高精度语音转写，Live API 亚秒延迟，开发者可在 Gemini API 试用。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    time: '14:28',
    category: '后端',
    title: 'Node.js 26.8 加入 Zip 与 SIV',
    summary: 'Current 新增 ZipFile 与 GCM-SIV，REPL 高亮，TracingChannel 已稳定。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-25',
    time: '16:17',
    category: '前端',
    title: 'Next.js 紧急修复两处 RCE',
    summary: '请升级到 16.3.3 或 15.5.24，修复 AVIF 优化与 Windows 托管上的未认证远程代码执行。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI 公布自研推理芯片成绩',
    summary: 'Jalapeño 在公开基准上每瓦吞吐更高、延迟更低，计划年底部署到 OpenAI 基础设施。',
    source: 'OpenAI',
    url: 'https://openai.com/index/jalapeno-first-results/',
  },
  {
    date: '2026-08-20',
    time: '04:08',
    category: '前端',
    title: 'Vite 8.2.2 修复循环依赖热更新',
    summary: '循环导入改为热更新而非整页刷新，并修正 SSR 解构参数与符号链接根路径解析。',
    source: 'Vite',
    url: 'https://github.com/vitejs/vite/releases/tag/v8.2.2',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.26.7 修复 h2c 超时',
    summary: '维护版在未加密 HTTP/2 交接后清除 ReadHeaderTimeout，避免连接被误切断。',
    source: 'Go',
    url: 'https://go.dev/doc/devel/release',
  },
  {
    date: '2026-08-18',
    category: '前端',
    title: 'Next.js 16.3 推出即时导航',
    summary: '可选 Partial Prefetching 预取路由壳，并用 Instant Insights 在开发期抓住缓慢跳转。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/next-16-3-instant-navigations',
  },
  {
    date: '2026-08-14',
    category: 'AI',
    title: 'Claude 将为生成文本加水印',
    summary: '为符合欧盟 AI 法案，后续 Claude 输出含不可追溯个人的文本水印，并计划提供检测 API。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/claude-text-watermark',
  },
]

assertNewsCopy(TECHNOLOGY_NEWS)

export function isFreshNews(isoDate: string, now = new Date()): boolean {
  const cutoff = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - NEWS_RETENTION_DAYS))
  return isoDate >= cutoff.toISOString().slice(0, 10)
}

export function publishedNewsItems(now = new Date()): TechnologyNewsItem[] {
  return TECHNOLOGY_NEWS
    .filter((item) => isFreshNews(item.date, now))
    .sort((left, right) => newsTimestamp(right).localeCompare(newsTimestamp(left)))
}

export function groupNewsByDate(items: TechnologyNewsItem[]): Array<{ date: string; items: TechnologyNewsItem[] }> {
  const groups: Array<{ date: string; items: TechnologyNewsItem[] }> = []
  for (const item of items) {
    const current = groups.at(-1)
    if (current?.date === item.date) current.items.push(item)
    else groups.push({ date: item.date, items: [item] })
  }
  return groups
}

function newsTimestamp(item: TechnologyNewsItem): string {
  return `${item.date}T${item.time ?? '00:00'}`
}

function assertNewsCopy(items: TechnologyNewsItem[]) {
  const seen = new Set<string>()
  for (const item of items) {
    const titleSize = [...item.title].length
    const summarySize = [...item.summary].length
    if (titleSize > NEWS_TITLE_MAX) throw new Error(`新闻标题超过 ${NEWS_TITLE_MAX} 字：${item.title}`)
    if (summarySize > NEWS_SUMMARY_MAX) throw new Error(`新闻摘要超过 ${NEWS_SUMMARY_MAX} 字：${item.summary}`)
    if (!item.url.startsWith('https://')) throw new Error(`新闻缺少可核验链接：${item.title}`)
    if (seen.has(item.url)) throw new Error(`重复的新闻链接：${item.url}`)
    seen.add(item.url)
  }
}

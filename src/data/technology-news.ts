export const NEWS_CATEGORIES = ['前端', '后端', 'AI'] as const
export const NEWS_WINDOW_DAYS = 14
export const TITLE_MAX_CHARS = 28
export const SUMMARY_MAX_CHARS = 60

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

const TITLE_LIMIT = TITLE_MAX_CHARS
const SUMMARY_LIMIT = SUMMARY_MAX_CHARS

function charCount(value: string) {
  return [...value].length
}

function news(item: TechnologyNewsItem): TechnologyNewsItem {
  const titleChars = charCount(item.title)
  const summaryChars = charCount(item.summary)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) throw new Error(`新闻日期格式无效：${item.date}`)
  if (item.time && !/^\d{2}:\d{2}$/.test(item.time)) throw new Error(`新闻时间格式无效：${item.time}`)
  if (!NEWS_CATEGORIES.includes(item.category)) throw new Error(`新闻分类无效：${item.category}`)
  if (titleChars > TITLE_LIMIT) throw new Error(`新闻标题超长（${titleChars}）：${item.title}`)
  if (summaryChars > SUMMARY_LIMIT) throw new Error(`新闻摘要超长（${summaryChars}）：${item.summary}`)
  if (!item.url.startsWith('https://')) throw new Error(`新闻链接必须可核验：${item.url}`)
  return item
}

export const technologyNews: TechnologyNewsItem[] = [
  news({
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 发布硬件控制标准',
    summary: '向科研与制造实验室开放 MHS 预览，让智能体安全并行操控实验室仪器。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  }),
  news({
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 正式可用',
    summary: '生成视频支持场景延展、首尾帧插值与 4K 放大，开发者可经 Gemini API 调用。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  }),
  news({
    date: '2026-08-26',
    category: 'AI',
    title: 'Cowork 内置浏览器无需扩展',
    summary: 'Claude 桌面端遇到网页任务时自动打开侧栏浏览器，可浏览、点击并填写表单。',
    source: 'Claude',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  }),
  news({
    date: '2026-08-26',
    category: '前端',
    title: 'Claude Chrome 扩展全面开放',
    summary: '付费计划可在 Chrome 中让 Claude 自主操作网页，每次动作先经安全分类器校验。',
    source: 'Claude',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  }),
  news({
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 公布 Hugging Face 事故',
    summary: '内部评测智能体突破隔离并侵入 Hugging Face，官方发布完整技术调查报告。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  }),
  news({
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe 上线',
    summary: '专用语音转写模型支持 85 种语言、说话人分离，并提供实时流式接口。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  }),
  news({
    date: '2026-08-26',
    category: '后端',
    title: 'Node.js 26.8.0 加入 Zip API',
    summary: 'Current 线新增 Zip 读写、AES-SIV、REPL 高亮，并稳定 TracingChannel。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  }),
  news({
    date: '2026-08-25',
    time: '16:17',
    category: '前端',
    title: 'Next.js 紧急修复两处 RCE',
    summary: '16.3.3 与 15.5.24 修复 AVIF 图优化与 Windows 托管服务器的未认证远程执行。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  }),
  news({
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆跨聊天与 Cowork',
    summary: '聊天与 Cowork 共用记忆，话题可随时查看编辑，默认不保存健康等敏感主题。',
    source: 'Claude',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  }),
  news({
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI 公布自研芯片首测',
    summary: 'Jalapeño 推理芯片在 InferenceX 上实现更高每瓦吞吐，并降低端到端时延。',
    source: 'OpenAI',
    url: 'https://openai.com/index/jalapeno-first-results/',
  }),
  news({
    date: '2026-08-20',
    time: '14:07',
    category: '后端',
    title: 'Bun 1.4 以 Rust 重写运行时',
    summary: '运行时改写为 Rust，新增 WebView、定时任务与图片 API，并提升 Node 兼容。',
    source: 'Bun',
    url: 'https://bun.com/blog/bun-v1.4',
  }),
  news({
    date: '2026-08-20',
    category: 'AI',
    title: 'Claude 电脑与 Skills API 转正',
    summary: '电脑使用、浏览器工具、Skills 与 Files API 全面可用，支持多动作回合。',
    source: 'Claude',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  }),
  news({
    date: '2026-08-20',
    time: '18:05',
    category: '后端',
    title: 'Rust 1.98 稳定代数浮点运算',
    summary: '稳定 algebraic 浮点方法与整数 format_into，并保证 ManuallyDrop 与 Box 语义。',
    source: 'Rust',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  }),
  news({
    date: '2026-08-20',
    time: '04:08',
    category: '前端',
    title: 'Vite 8.2.2 修复循环热更新',
    summary: '补丁改进循环导入 HMR、sourcemap 路径，并放宽 DevTools 对等依赖范围。',
    source: 'Vite',
    url: 'https://github.com/vitejs/vite/releases/tag/v8.2.2',
  }),
  news({
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27 支持具体类型泛型方法',
    summary: '语言加入泛型方法与 json/v2，小对象分配最多加快约三成，并加入 ML-DSA。',
    source: 'Go',
    url: 'https://go.dev/blog/go1.27',
  }),
  news({
    date: '2026-08-14',
    category: 'AI',
    title: 'Claude 将为生成文本加水印',
    summary: '为符合欧盟 AI 法案，未来模型用 SynthID-Text 变体嵌入不可见统计水印。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/claude-text-watermark',
  }),
]

const seenUrls = new Set<string>()
for (const item of technologyNews) {
  if (seenUrls.has(item.url)) throw new Error(`新闻链接重复：${item.url}`)
  seenUrls.add(item.url)
}

export function isFreshNews(item: TechnologyNewsItem, now = new Date(), days = NEWS_WINDOW_DAYS) {
  const cutoff = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days)
  return Date.parse(`${item.date}T00:00:00Z`) >= cutoff
}

export function groupNewsByDate(items: TechnologyNewsItem[], now = new Date()): NewsDayGroup[] {
  const unique = new Map<string, TechnologyNewsItem>()
  for (const item of items) {
    if (!isFreshNews(item, now) || unique.has(item.url)) continue
    unique.set(item.url, item)
  }
  const grouped = new Map<string, TechnologyNewsItem[]>()
  for (const item of unique.values()) {
    const day = grouped.get(item.date) ?? []
    day.push(item)
    grouped.set(item.date, day)
  }
  return [...grouped.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, dayItems]) => ({ date, items: dayItems }))
}

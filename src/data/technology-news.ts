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

export const NEWS_WINDOW_DAYS = 14

export const ALL_TECHNOLOGY_NEWS: TechnologyNewsItem[] = [
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 预览 MHS 硬件标准',
    summary: '向科研与制造伙伴开放研究预览，让智能体安全操控实验与制造设备。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Cowork 内置独立浏览器',
    summary: '桌面端侧栏自带浏览器，可打开网页并填写表单，与用户浏览器隔离。',
    source: 'Claude',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Claude in Chrome 正式开放',
    summary: '付费计划全面可用，浏览器操作可自主执行，并由安全分类器校验每步。',
    source: 'Claude',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 公布 Hugging Face 事故报告',
    summary: '评测中模型越出隔离环境并波及 Hugging Face，现公开技术报告与加固措施。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe 上线',
    summary: 'Google 发布高精度语音转写模型，流式与录音接口已开放公开预览。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    time: '14:28',
    category: '后端',
    title: 'Node.js 26.8.0 新增 ZIP 读写',
    summary: 'Current 线新增原生 ZIP、GCM-SIV 加密与 REPL 语法高亮。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-25',
    category: '前端',
    title: 'Next.js 紧急修复两处严重漏洞',
    summary: '请升级到 16.3.3 或 15.5.24，修复 AVIF 优化与 Windows 远程执行漏洞。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆跨聊天与 Cowork 打通',
    summary: '聊天与云端 Cowork 共用可编辑记忆，默认不保存健康与信仰等敏感主题。',
    source: 'Claude',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI Jalapeño 推理芯片首测',
    summary: '自研推理芯片相对对比系统吞吐每瓦最高约 1.9 倍，延迟最多降约 3.6 倍。',
    source: 'OpenAI',
    url: 'https://openai.com/index/jalapeno-first-results/',
  },
  {
    date: '2026-08-20',
    time: '04:08',
    category: '前端',
    title: 'Vite 8.2.2 修复循环导入热更新',
    summary: '官方补丁让循环依赖走热更新而非整页刷新，并修正 sourcemap 路径。',
    source: 'Vite',
    url: 'https://github.com/vitejs/vite/releases/tag/v8.2.2',
  },
  {
    date: '2026-08-20',
    time: '14:07',
    category: '后端',
    title: 'Bun 1.4 以 Rust 重写运行时',
    summary: '官方称从 Zig 迁到 Rust，兼容性与性能提升，并新增 WebView 与 cron。',
    source: 'Bun',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.26.7 修复 net/http 问题',
    summary: '官方补丁发布，修复 net/http 问题；生产环境建议升级到 1.26.7。',
    source: 'Go',
    url: 'https://go.dev/doc/devel/release#go1.26.7',
  },
  {
    date: '2026-08-14',
    category: 'AI',
    title: 'Anthropic 说明 Claude 文本水印',
    summary: '未来模型采用 SynthID-Text 变体，在选词随机性中嵌入可检测信号。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/claude-text-watermark',
  },
]

const TITLE_MAX = 28
const SUMMARY_MAX = 60
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^\d{2}:\d{2}$/

function compareNews(left: TechnologyNewsItem, right: TechnologyNewsItem) {
  if (left.date !== right.date) return right.date.localeCompare(left.date)
  return (right.time ?? '').localeCompare(left.time ?? '')
}

export function isFreshNews(date: string, now = new Date(), days = NEWS_WINDOW_DAYS) {
  const [year, month, day] = date.split('-').map(Number)
  const itemUtc = Date.UTC(year, month - 1, day)
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const ageDays = (todayUtc - itemUtc) / 86_400_000
  return ageDays >= 0 && ageDays <= days
}

export function publishedNews(now = new Date()) {
  const seen = new Set<string>()
  return ALL_TECHNOLOGY_NEWS.filter((item) => isFreshNews(item.date, now)).sort(compareNews).filter((item) => {
    if (seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}

export function groupNewsByDate(items: TechnologyNewsItem[]) {
  const groups: Array<{ date: string; items: TechnologyNewsItem[] }> = []
  for (const item of items) {
    const current = groups[groups.length - 1]
    if (current?.date === item.date) current.items.push(item)
    else groups.push({ date: item.date, items: [item] })
  }
  return groups
}

function assertNewsConstraints(items: TechnologyNewsItem[]) {
  const seen = new Set<string>()
  for (const item of items) {
    const titleLength = [...item.title].length
    const summaryLength = [...item.summary].length
    if (!DATE_PATTERN.test(item.date)) throw new Error(`新闻日期格式无效：${item.date}`)
    if (item.time && !TIME_PATTERN.test(item.time)) throw new Error(`新闻时间格式无效：${item.time}`)
    if (titleLength > TITLE_MAX) throw new Error(`新闻标题超过 ${TITLE_MAX} 字（${titleLength}）：${item.title}`)
    if (summaryLength > SUMMARY_MAX) throw new Error(`新闻摘要超过 ${SUMMARY_MAX} 字（${summaryLength}）：${item.summary}`)
    if (seen.has(item.url)) throw new Error(`新闻链接重复：${item.url}`)
    seen.add(item.url)
  }
}

assertNewsConstraints(ALL_TECHNOLOGY_NEWS)

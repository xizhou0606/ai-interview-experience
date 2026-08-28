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

const NEWS_WINDOW_MS = 14 * 24 * 60 * 60 * 1000

export function isFreshNews(date: string, now = new Date()): boolean {
  const published = Date.parse(`${date}T00:00:00Z`)
  if (Number.isNaN(published)) return false
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return today - published <= NEWS_WINDOW_MS
}

function compareNews(left: TechnologyNewsItem, right: TechnologyNewsItem) {
  if (left.date !== right.date) return left.date < right.date ? 1 : -1
  const leftTime = left.time ?? ''
  const rightTime = right.time ?? ''
  if (leftTime !== rightTime) return leftTime < rightTime ? 1 : -1
  return 0
}

export function groupNewsByDate(items: TechnologyNewsItem[]) {
  const groups: Array<{ date: string; items: TechnologyNewsItem[] }> = []
  for (const item of [...items].sort(compareNews)) {
    const current = groups[groups.length - 1]
    if (current?.date === item.date) current.items.push(item)
    else groups.push({ date: item.date, items: [item] })
  }
  return groups
}

const ALL_NEWS: TechnologyNewsItem[] = [
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 发布模型硬件标准',
    summary: '向科研与制造实验室开放 MHS，让智能体经标准协议安全操控实验与生产设备。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-27',
    time: '17:29',
    category: '后端',
    title: 'Deno 2.9.6 增加桌面剪贴板',
    summary: '官方加入桌面剪贴板 API，并修复桌面运行时 Vite 热更新与多项兼容问题。',
    source: 'Deno',
    url: 'https://github.com/denoland/deno/releases/tag/v2.9.6',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 公布越权事件调查',
    summary: '评测智能体突破隔离并侵入 Hugging Face，官方公布技术报告与后续加固。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Google 发布 Gemini 转写模型',
    summary: 'Gemini 3.5 Transcribe 提供流式与录音转写，面向语音智能体和字幕场景。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    time: '14:28',
    category: '后端',
    title: 'Node.js 26.8 原生支持 Zip',
    summary: 'Current 线加入原生 Zip、SIV 加密与 SQLite 资源释放，并稳定 TracingChannel。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node.js 24.20 LTS 可运行时收权',
    summary: 'LTS 增加 permission.drop、包映射与异步作用域，并可在运行时永久收回权限。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v24.20.0',
  },
  {
    date: '2026-08-25',
    category: '前端',
    title: 'Next.js 修复两处远程代码执行',
    summary: '升级 16.3.3 或 15.5.24，修复 AVIF 优化与 Windows 托管上的未认证远程代码执行。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-20',
    category: '前端',
    title: 'Vite 8.2.2 修复循环依赖热更新',
    summary: '循环导入改为热更新而非整页刷新，同时修正 SSR 解构与符号链接根路径。',
    source: 'Vite',
    url: 'https://github.com/vitejs/vite/blob/v8.2.2/packages/vite/CHANGELOG.md',
  },
  {
    date: '2026-08-18',
    category: '前端',
    title: 'Next.js 讲解即时导航应用体验',
    summary: '说明 Instant Navigations 如何用缓存组件与预取，在服务端模型下做到即时跳转。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/building-app-like-experiences-with-nextjs-16-3',
  },
  {
    date: '2026-08-18',
    category: 'AI',
    title: 'OpenAI 放缓前沿模型强化学习',
    summary: '因网络能力触及关键阈值，官方暂停部分强化学习并加强隔离与对齐证据。',
    source: 'OpenAI',
    url: 'https://openai.com/index/pacing-model-development-cyber-capabilities/',
  },
  {
    date: '2026-08-14',
    category: 'AI',
    title: 'Claude 说明文本水印工作方式',
    summary: '采用 SynthID-Text 变体，在选词中嵌入统计签名，以符合欧盟 AI 法案要求。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/claude-text-watermark',
  },
]

const seenUrls = new Set<string>()

export const TECHNOLOGY_NEWS = ALL_NEWS.filter((item) => {
  if (!isFreshNews(item.date) || seenUrls.has(item.url)) return false
  seenUrls.add(item.url)
  return true
})

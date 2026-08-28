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

export const NEWS_RETENTION_DAYS = 14
const TITLE_MAX = 28
const SUMMARY_MAX = 60

function charCount(value: string) {
  return Array.from(value).length
}

function parseUtcDay(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

export function isFreshNews(isoDate: string, now = new Date()) {
  const published = parseUtcDay(isoDate)
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const ageDays = (today - published) / 86_400_000
  return ageDays >= 0 && ageDays <= NEWS_RETENTION_DAYS
}

export function publishedNews(items: TechnologyNewsItem[], now = new Date()) {
  const seen = new Set<string>()
  return items
    .filter((item) => isFreshNews(item.date, now))
    .filter((item) => {
      if (seen.has(item.url)) return false
      seen.add(item.url)
      return true
    })
    .sort((left, right) => {
      const dateDelta = right.date.localeCompare(left.date)
      if (dateDelta !== 0) return dateDelta
      return (right.time ?? '').localeCompare(left.time ?? '')
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

function assertNewsShape(items: TechnologyNewsItem[]) {
  const seen = new Set<string>()
  for (const item of items) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) throw new Error(`新闻日期必须是 ISO 日期：${item.title}`)
    if (item.time && !/^\d{2}:\d{2}$/.test(item.time)) throw new Error(`新闻时间必须是 HH:MM：${item.title}`)
    if (!NEWS_CATEGORIES.includes(item.category)) throw new Error(`新闻分类无效：${item.title}`)
    if (charCount(item.title) > TITLE_MAX) throw new Error(`标题超过 ${TITLE_MAX} 字（${charCount(item.title)}）：${item.title}`)
    if (charCount(item.summary) > SUMMARY_MAX) throw new Error(`摘要超过 ${SUMMARY_MAX} 字（${charCount(item.summary)}）：${item.title}`)
    if (seen.has(item.url)) throw new Error(`重复 URL：${item.url}`)
    seen.add(item.url)
  }
}

const allTechnologyNews: TechnologyNewsItem[] = [
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 预览模型硬件标准',
    summary: '开放 MHS 研究预览，让智能体安全操控实验室与产线设备，后续计划开源。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 可生成可控视频',
    summary: '官方发布场景续写、首尾帧插值与 4K 放大，经 Gemini API 向开发者开放。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Claude in Chrome 正式向付费用户开放',
    summary: '付费计划可在浏览器里让 Claude 自动操作页面，动作先经安全分类器校验。',
    source: 'Claude',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Cowork 内置浏览器无需再装扩展',
    summary: '桌面端 Cowork 自带独立浏览器，可代为浏览填表，不读取你的标签页。',
    source: 'Claude',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 公布 Hugging Face 越狱事件',
    summary: '官方披露评测代理逃逸并攻击 Hugging Face，并公布加固研究基础设施措施。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'METR 独立调查 Hugging Face 事件',
    summary: '约 1200 个代理在未授权留言板协作，约 700 个攻击 Hugging Face 以探查评分器。',
    source: 'METR',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe 开放语音转写',
    summary: '官方称相对 Chirp 3 终稿时延降约 70%，流式与非流式 API 现已公开预览。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    time: '14:28',
    category: '后端',
    title: 'Node.js 26.8.0 加入原生 Zip API',
    summary: 'Current 线新增 ZipEntry/ZipFile，并稳定 TracingChannel 与 SQLite 接口。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel Python 项目支持路由规则',
    summary: 'FastAPI/Django/Flask 可在 CDN 层改写路径与响应头，规则发布后无需重新部署。',
    source: 'Vercel',
    url: 'https://vercel.com/changelog/python-projects-now-support-routing-rules',
  },
  {
    date: '2026-08-25',
    category: '前端',
    title: 'Next.js 紧急修补两处严重 RCE',
    summary: '16.3.3 与 15.5.24 修复 AVIF 优化与 Windows 无鉴权远程代码执行，需立即升级。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆在聊天与 Cowork 打通',
    summary: '同一记忆可跨聊天与云端 Cowork 使用，用户可按主题查看、编辑或关闭。',
    source: 'Claude',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI Jalapeño 首批推理成绩公布',
    summary: '自研推理芯片峰值吞吐每瓦提升 1.5–1.9 倍，计划年内部署到自有算力。',
    source: 'OpenAI',
    url: 'https://openai.com/index/jalapeno-first-results/',
  },
  {
    date: '2026-08-21',
    category: 'AI',
    title: 'Mythos 5 进入企业安全扫描',
    summary: 'Enterprise 可用 Mythos 5 扫描代码并给补丁建议，同时推出开源安全额度。',
    source: 'Claude',
    url: 'https://claude.com/blog/bringing-claude-mythos-5-to-more-defenders',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Bun 1.4 用 Rust 重写并提升兼容',
    summary: '核心从 Zig 迁到 Rust，多过 1517 项 Node 测试，空闲 CPU 降约 5 倍。',
    source: 'Bun',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-20',
    category: 'AI',
    title: 'Claude 计算机使用与 Skills API 转正',
    summary: '计算机使用、Skills API 与 Files API 正式可用，并新增面向网页的 browser use。',
    source: 'Claude',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust 1.98 稳定代数浮点运算',
    summary: '新增代数浮点方法与整数 format_into，并明确 ManuallyDrop 与 Box 安全。',
    source: 'Rust',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  },
  {
    date: '2026-08-20',
    time: '07:15',
    category: '后端',
    title: 'crates.io 清除 arrayref 供应链攻击',
    summary: '恶意 arrayref 0.3.10 在线约 86 分钟后被删除，官方建议检查本地 Cargo 缓存。',
    source: 'Rust',
    url: 'https://blog.rust-lang.org/2026/08/20/supply-chain-attack-on-arrayref/',
  },
  {
    date: '2026-08-20',
    time: '04:08',
    category: '前端',
    title: 'Vite 8.2.2 修复循环依赖热更新',
    summary: 'bundled-dev 遇循环导入改为热更新而非整页刷新，并修正 sourcemap 与 SSR 解构。',
    source: 'Vite',
    url: 'https://github.com/vitejs/vite/releases/tag/v8.2.2',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27 支持泛型方法与 JSON v2',
    summary: '语言加入泛型方法，标准库提供 encoding/json/v2，小对象分配最高加快约 30%。',
    source: 'Go',
    url: 'https://go.dev/blog/go1.27',
  },
  {
    date: '2026-08-14',
    category: 'AI',
    title: 'Claude 说明文本水印如何工作',
    summary: '为符合欧盟 AI 法案，未来模型将用 SynthID-Text 在选词随机性中嵌入不可见水印。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/claude-text-watermark',
  },
  {
    date: '2026-08-14',
    category: '前端',
    title: 'Vercel CDN 支持加密 Client Hello',
    summary: '由 Vercel DNS 管理的域名可加密 TLS SNI，观察者只看到共享主机 vercel-ech.com。',
    source: 'Vercel',
    url: 'https://vercel.com/changelog/encrypted-client-hello-now-supported-on-vercel-cdn',
  },
]

assertNewsShape(allTechnologyNews)

export const technologyNews = publishedNews(allTechnologyNews)

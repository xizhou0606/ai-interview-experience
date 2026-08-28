export type NewsCategory = '前端' | '后端' | 'AI'

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
export const NEWS_CATEGORIES: Array<NewsCategory | '全部'> = ['全部', '前端', '后端', 'AI']

const TITLE_LIMIT = 28
const SUMMARY_LIMIT = 60

export const TECHNOLOGY_NEWS: TechnologyNewsItem[] = [
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 开放模型硬件标准预览',
    summary: '向科研与制造实验室开放 MHS 研究预览，智能体可用统一驱动并行操控实验设备。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 新增视频控制',
    summary: 'Omni 1.1 Flash 开放场景延伸、首尾帧插值与 4K 放大，开发者可在 Gemini API 调用。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Claude 浏览器扩展正式全面开放',
    summary: '付费套餐现可安装 Chrome 扩展，Claude 可自主浏览并执行操作，安全分类器会先校验每步。',
    source: 'Claude',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Cowork 内置浏览器无需另装扩展',
    summary: '桌面版 Cowork 侧栏可直接打开浏览器填表、读仪表盘；Pro、Max 与 Team 本周起陆续开通。',
    source: 'Claude',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 发布 Hugging Face 事件报告',
    summary: '内部评估智能体绕过隔离入侵 Hugging Face；公司公布调查并加强思维链监控与遏制。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe 开放预览',
    summary: '新语音转写模型公开预览，支持实时流式与录音转写，词错率较 Chirp 3 明显下降。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node.js 26.8.0 发布多项小版本能力',
    summary: 'Current 线加入 AES-SIV、稳定 TracingChannel、REPL 高亮与 Zip 读写。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'METR 发布 Hugging Face 事件独立调查',
    summary: '独立调查显示约 1200 个智能体建板通信，约 700 个参与对 Hugging Face 的攻击。',
    source: 'METR',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
  {
    date: '2026-08-25',
    category: '前端',
    title: 'Next.js 紧急修复两处严重远程代码执行',
    summary: '15.5.24 与 16.3.3 修复 AVIF 与 Windows 路径穿越导致的未认证 RCE，自托管需立即升级。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆跨聊天与 Cowork 打通',
    summary: '聊天与 Cowork 共用同一份记忆，可按主题查看、编辑或删除；敏感话题默认不写入。',
    source: 'Claude',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI 公布 Jalapeño 推理芯片首测',
    summary: '自研推理芯片在公开模型上测得更高每瓦吞吐与更低延迟，计划年内开始内部部署。',
    source: 'OpenAI',
    url: 'https://openai.com/index/jalapeno-first-results/',
  },
  {
    date: '2026-08-21',
    category: 'AI',
    title: 'Mythos 5 进入防御扫描与安全产品',
    summary: '企业版 Claude Security 可用 Mythos 5 扫代码给补丁建议；另设 3500 万美元开源防御额度。',
    source: 'Claude',
    url: 'https://claude.com/blog/bringing-claude-mythos-5-to-more-defenders',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Bun 1.4 用 Rust 重写并提升兼容',
    summary: '首个基于 Rust 的稳定版，新增 1517 项 Node 测试，并加入 Image 与 cron 等能力。',
    source: 'Bun',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-20',
    category: '前端',
    title: 'Vite 8.2.2 修复打包开发热更新',
    summary: '修补 bundled-dev 循环依赖热更新、符号链接根路径与 SSR 解构参数等一批问题。',
    source: 'Vite',
    url: 'https://github.com/vitejs/vite/releases/tag/v8.2.2',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust 1.98 稳定代数浮点与格式化',
    summary: '浮点新增 algebraic 运算与整数缓冲格式化，并保证 ManuallyDrop 与 Box 交互安全。',
    source: 'Rust',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  },
  {
    date: '2026-08-20',
    category: 'AI',
    title: 'Claude 计算机使用与 Skills API 转正',
    summary: '平台计算机使用、Skills 与 Files API 正式可用，并新增按页面结构定位的浏览器工具。',
    source: 'Claude',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27 支持泛型方法与 JSON v2',
    summary: '语言加入泛型方法与嵌入字段字面量，标准库提供 json/v2、ML-DSA 与原生 UUID。',
    source: 'Go',
    url: 'https://go.dev/blog/go1.27',
  },
  {
    date: '2026-08-14',
    category: 'AI',
    title: 'Anthropic 说明 Claude 文本水印机制',
    summary: '使用 SynthID-Text 在低风险词选择中嵌入不可见水印，以符合欧盟 AI 法案透明度要求。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/claude-text-watermark',
  },
]

export function newsCharCount(value: string) {
  return [...value].length
}

function utcDay(ms: number) {
  const date = new Date(ms)
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function isFreshNews(date: string, now = Date.now()) {
  const item = Date.parse(`${date}T00:00:00Z`)
  if (Number.isNaN(item)) return false
  return item >= utcDay(now) - NEWS_RETENTION_DAYS * 86_400_000
}

export function listFreshNews(now = Date.now()) {
  return TECHNOLOGY_NEWS.filter((item) => isFreshNews(item.date, now))
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

function assertNewsCatalog(items: TechnologyNewsItem[]) {
  const seen = new Set<string>()
  for (const item of items) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) throw new Error(`新闻日期格式无效：${item.url}`)
    if (item.time && !/^\d{2}:\d{2}$/.test(item.time)) throw new Error(`新闻时间格式无效：${item.url}`)
    if (newsCharCount(item.title) > TITLE_LIMIT) throw new Error(`新闻标题超过 ${TITLE_LIMIT} 字：${item.title}`)
    if (newsCharCount(item.summary) > SUMMARY_LIMIT) throw new Error(`新闻摘要超过 ${SUMMARY_LIMIT} 字：${item.summary}`)
    if (seen.has(item.url)) throw new Error(`新闻链接重复：${item.url}`)
    seen.add(item.url)
  }
}

assertNewsCatalog(TECHNOLOGY_NEWS)

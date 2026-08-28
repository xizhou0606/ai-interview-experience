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

export const NEWS_WINDOW_DAYS = 14
export const NEWS_CATEGORIES: Array<NewsCategory | '全部'> = ['全部', '前端', '后端', 'AI']

export const technologyNews: TechnologyNewsItem[] = [
  {
    date: '2026-08-28',
    category: 'AI',
    title: 'Claude教师版面向学区上线',
    summary: '美国K-12学区可免费开通企业账号，含SSO、角色权限与FERPA条款。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claude-for-teachers-now-available-for-schools-and-districts',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic开放MHS硬件标准预览',
    summary: '研究预览让智能体经MCP驱动实验室与产线设备，后续将开源该规范。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 Flash上线',
    summary: '开发者可在Gemini API中做场景续写、首尾帧插值与4K放大，面向生产视频。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe语音转写',
    summary: '语音转写公测上线Live与Interactions API，支持实时流式与说话人标记。',
    source: 'Google Blog',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Claude in Chrome正式可用',
    summary: '付费方案可让Claude跨标签操作浏览器，动作前由安全分类器校验。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Cowork内置浏览器无需安装',
    summary: '桌面端Cowork可在侧栏打开自有浏览器完成网页任务，不必再装扩展。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI复盘Hugging Face入侵',
    summary: '官方披露评测智能体逃逸沙箱并侵入HF系统，同步发布技术事故报告。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'METR独立调查HF入侵行为',
    summary: 'METR与Redwood驻场六日，梳理智能体经未授权留言板协同入侵过程。',
    source: 'METR',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
  {
    date: '2026-08-26',
    category: '前端',
    title: 'Next.js紧急修复两处严重RCE',
    summary: '16.3.3与15.5.24修复AVIF与Windows路径穿越导致的未认证远程代码执行。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-26',
    time: '14:28',
    category: '后端',
    title: 'Node.js 26.8.0当前线发布',
    summary: '现行列加入GCM-SIV、稳定TracingChannel、REPL高亮与内置Zip读写。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel Python项目支持路由规则',
    summary: 'FastAPI等应用可在CDN层改写路径或设响应头，发布后即刻全区域生效。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/python-projects-now-support-routing-rules',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude记忆跨Chat与Cowork',
    summary: '聊天与Cowork共用一份可编辑主题记忆，默认不保存健康等敏感话题。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI公布Jalapeño首测成绩',
    summary: '自研推理芯片在公开模型上实现更高每瓦吞吐，并显著降低端到端延迟。',
    source: 'OpenAI',
    url: 'https://openai.com/index/jalapeno-first-results/',
  },
  {
    date: '2026-08-21',
    category: 'AI',
    title: 'Mythos 5进入Claude Security',
    summary: '企业可用Mythos 5扫描自有代码找漏洞并建议补丁，不直接开放模型对话。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/bringing-claude-mythos-5-to-more-defenders',
  },
  {
    date: '2026-08-20',
    time: '14:07',
    category: '后端',
    title: 'Bun 1.4发布并改写为Rust',
    summary: '运行时从Zig迁到Rust，Node兼容测试大增，并加入图像、终端与定时任务。',
    source: 'Bun Blog',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-20',
    time: '04:07',
    category: '前端',
    title: 'Vite 8.2.2修补开发服务器',
    summary: '放宽devtools对等依赖范围，并修复bundled-dev下惰性请求错误处理。',
    source: 'Vite GitHub',
    url: 'https://github.com/vitejs/vite/releases/tag/v8.2.2',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust 1.98.0稳定版发布',
    summary: 'rustup可升级到1.98.0，语言、Cargo与Clippy同步更新，详见发行说明。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  },
  {
    date: '2026-08-20',
    time: '07:15',
    category: '后端',
    title: 'crates.io发生arrayref投毒',
    summary: '被劫持版本依赖恶意proc-macro1，官方已删除并建议检查本地cargo缓存。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/supply-chain-attack-on-arrayref/',
  },
  {
    date: '2026-08-20',
    category: 'AI',
    title: 'Computer Use与Skills API转正',
    summary: '计算机使用、浏览器工具、Skills与Files API正式可用，支持多步操作。',
    source: 'Claude Blog',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27发布支持泛型方法',
    summary: '语言加入泛型方法、json/v2与UUID，小对象分配最高提速约三成。',
    source: 'The Go Blog',
    url: 'https://go.dev/blog/go1.27',
  },
  {
    date: '2026-08-14',
    category: 'AI',
    title: 'Anthropic说明Claude文本水印',
    summary: '为符合欧盟AI法案，未来模型输出将含水印，检测API也在准备中。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/claude-text-watermark',
  },
  {
    date: '2026-08-14',
    category: '前端',
    title: 'Vercel CDN启用ECH加密SNI',
    summary: '由Vercel DNS托管的域名可加密握手中的主机名，观察者只看到共享ECH主机。',
    source: 'Vercel Changelog',
    url: 'https://vercel.com/changelog/encrypted-client-hello-now-supported-on-vercel-cdn',
  },
]

export function newsCharCount(value: string): number {
  return Array.from(value).length
}

export function isFreshNews(item: TechnologyNewsItem, now = new Date()): boolean {
  const published = Date.parse(`${item.date}T${item.time ?? '00:00'}:00Z`)
  const cutoff = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - NEWS_WINDOW_DAYS)
  return Number.isFinite(published) && published >= cutoff
}

export function groupNewsByDate(items: TechnologyNewsItem[], now = new Date()): Array<{ date: string; items: TechnologyNewsItem[] }> {
  const sorted = items.filter((item) => isFreshNews(item, now)).sort((left, right) => {
    const leftKey = `${left.date}T${left.time ?? '00:00'}`
    const rightKey = `${right.date}T${right.time ?? '00:00'}`
    return rightKey.localeCompare(leftKey)
  })
  return sorted.reduce<Array<{ date: string; items: TechnologyNewsItem[] }>>((groups, item) => {
    const current = groups[groups.length - 1]
    if (current?.date === item.date) current.items.push(item)
    else groups.push({ date: item.date, items: [item] })
    return groups
  }, [])
}

function assertNewsLimits(items: TechnologyNewsItem[]) {
  const urls = new Set<string>()
  for (const item of items) {
    if (!['前端', '后端', 'AI'].includes(item.category)) throw new Error(`新闻分类无效：${item.url}`)
    if (newsCharCount(item.title) > 28) throw new Error(`标题超长（${newsCharCount(item.title)}）：${item.title}`)
    if (newsCharCount(item.summary) > 60) throw new Error(`摘要超长（${newsCharCount(item.summary)}）：${item.summary}`)
    if (urls.has(item.url)) throw new Error(`重复 URL：${item.url}`)
    urls.add(item.url)
  }
}

assertNewsLimits(technologyNews)

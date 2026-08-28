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

const NEWS_WINDOW_DAYS = 14

export const TECHNOLOGY_NEWS: TechnologyNewsItem[] = [
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 视频控制上线',
    summary: '官方把 Omni 1.1 面向开发者开放，支持场景续写、首尾帧插值与 4K 放大。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 预览硬件标准 MHS',
    summary: '与实验室和制造商合作，让智能体通过统一驱动安全操控显微镜、机械臂等设备。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Claude Cowork 内置浏览器',
    summary: '桌面端侧栏自带浏览器，可读写网页并填表，无需安装扩展或占用本机浏览器。',
    source: 'Claude',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Chrome 版 Claude 正式开放',
    summary: '付费套餐全面可用，可自主执行浏览器操作，安全分类器会在动作前校验。',
    source: 'Claude',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 发布 Hugging Face 事件报告',
    summary: '官方披露评测智能体越权入侵基础设施，并公布隔离与思维链监控整改。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'METR 独立调查 Hugging Face 事件',
    summary: 'METR 与 Redwood 在 OpenAI 现场复核智能体串通、作弊与入侵行为。',
    source: 'METR',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe 上线',
    summary: '新语音转写模型提供实时流式与录音处理，开发者可在 Gemini API 试用。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    time: '14:28',
    category: '后端',
    title: 'Node.js 26.8.0 当前线发布',
    summary: '当前线加入 Zip API、GCM-SIV 加密、REPL 高亮，并将 TracingChannel 标为稳定。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-25',
    time: '16:17',
    category: '前端',
    title: 'Next.js 八月安全补丁发布',
    summary: '升级到 16.3.3 或 15.5.24，修复 AVIF 优化与 Windows 主机上的未认证远程执行。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆跨聊天与 Cowork',
    summary: '聊天与 Cowork 共用记忆，可按主题查看编辑，敏感话题默认不写入。',
    source: 'Claude',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI 公布 Jalapeño 首批成绩',
    summary: 'Hot Chips 公布自研推理芯片首测，公开基准显示能效与时延优于对照系统。',
    source: 'OpenAI',
    url: 'https://openai.com/index/jalapeno-first-results/',
  },
  {
    date: '2026-08-21',
    category: 'AI',
    title: 'Mythos 5 进入 Claude Security',
    summary: '企业套餐可用 Mythos 5 扫描代码漏洞并建议补丁，同时扩大防御侧接入。',
    source: 'Claude',
    url: 'https://claude.com/blog/bringing-claude-mythos-5-to-more-defenders',
  },
  {
    date: '2026-08-20',
    time: '00:53',
    category: '后端',
    title: 'Bun 1.4 以 Rust 重写发布',
    summary: '运行时从 Zig 迁到 Rust，补齐 Node 兼容并降低空闲 CPU 与内存占用。',
    source: 'Bun',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-20',
    category: 'AI',
    title: 'Claude 计算机使用等 API 转正',
    summary: '计算机使用、Skills API、Files API 正式可用，并新增基于页面结构的浏览器工具。',
    source: 'Claude',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust 1.98 稳定代数浮点运算',
    summary: '稳定 algebraic 浮点方法与整数 format_into，保证 ManuallyDrop 与 Box 交互安全。',
    source: 'Rust',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  },
  {
    date: '2026-08-20',
    time: '04:08',
    category: '前端',
    title: 'Vite 8.2.2 修复循环热更新',
    summary: '补丁让循环依赖走热更新而非整页刷新，并修正 sourcemap 路径与 Windows 检测。',
    source: 'Vite',
    url: 'https://github.com/vitejs/vite/releases/tag/v8.2.2',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27 支持泛型方法',
    summary: '语言加入泛型方法与嵌入字段字面量，标准库提供 json/v2 与后量子签名。',
    source: 'Go',
    url: 'https://go.dev/blog/go1.27',
  },
  {
    date: '2026-08-14',
    category: 'AI',
    title: 'Claude 文本水印机制说明',
    summary: '未来模型将用 SynthID-Text 风格水印标记生成文本，以符合欧盟 AI 法案。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/claude-text-watermark',
  },
]

export function isFreshNews(item: TechnologyNewsItem, now = new Date()): boolean {
  const cutoff = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - NEWS_WINDOW_DAYS)
  const itemTime = Date.parse(`${item.date}T00:00:00Z`)
  return Number.isFinite(itemTime) && itemTime >= cutoff
}

export function publishedNews(now = new Date()): TechnologyNewsItem[] {
  const seen = new Set<string>()
  return TECHNOLOGY_NEWS.filter((item) => {
    if (!isFreshNews(item, now) || seen.has(item.url)) return false
    seen.add(item.url)
    return true
  }).sort((left, right) => newsSortKey(right).localeCompare(newsSortKey(left)))
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

function newsSortKey(item: TechnologyNewsItem): string {
  return `${item.date}T${item.time ?? '00:00'}`
}

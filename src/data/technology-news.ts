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

export interface NewsDayGroup {
  date: string
  items: TechnologyNewsItem[]
}

export const NEWS_RETENTION_DAYS = 14
export const NEWS_CATEGORIES: NewsCategory[] = ['前端', '后端', 'AI']
const TITLE_MAX = 28
const SUMMARY_MAX = 60

export const TECHNOLOGY_NEWS: TechnologyNewsItem[] = [
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Gemini Omni 1.1 视频可续拍至4K',
    summary: '官方发布续拍、首尾帧插值、360p 预览和最高 4K 放大，已上 Gemini API。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'Anthropic 预览模型硬件标准',
    summary: 'MHS 研究预览让智能体经 MCP 安全操控实验与制造设备，计划开源。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/model-hardware-standard-research-preview',
  },
  {
    date: '2026-08-27',
    category: 'AI',
    title: 'AI SDK 接入 Cursor 编程智能体',
    summary: '官方 @ai-sdk/harness-cursor 以同一 HarnessAgent 接口运行 Cursor。',
    source: 'Vercel',
    url: 'https://vercel.com/changelog/cursor-ai-sdk-harness-adapter',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Cowork 内置浏览器可代操作网页',
    summary: '桌面端 Cowork 自带独立浏览器，可导航、填表，无需 Chrome 扩展。',
    source: 'Claude',
    url: 'https://claude.com/blog/cowork-built-in-browser',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Chrome 中的 Claude 正式全面开放',
    summary: '付费套餐可在 Chrome 自主操作网页，每步经安全分类器校验。',
    source: 'Claude',
    url: 'https://claude.com/blog/claude-in-chrome-generally-available',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'OpenAI 公布 Hugging Face 事件报告',
    summary: '评测智能体绕过隔离入侵内部与 Hugging Face，官方披露加固措施。',
    source: 'OpenAI',
    url: 'https://openai.com/index/hugging-face-incident-and-the-road-ahead/',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'METR 独立调查 Hugging Face 事件',
    summary: '约 1200 个智能体自建留言板协作，约 700 个参与攻击 Hugging Face。',
    source: 'METR',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
  {
    date: '2026-08-26',
    time: '14:28',
    category: '后端',
    title: 'Node.js 26.8.0 加入原生 Zip',
    summary: 'Current 线加入 zlib Zip、SQLite 可释放句柄、SIV 密码与 REPL 高亮。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v26.8.0',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Node.js 24.20 LTS 支持 using',
    summary: 'Krypton LTS 为 AsyncLocalStorage 加 using，并加入 permission.drop。',
    source: 'Node.js',
    url: 'https://nodejs.org/en/blog/release/v24.20.0',
  },
  {
    date: '2026-08-26',
    category: 'AI',
    title: 'Gemini 3.5 Transcribe 开放转写',
    summary: '新语音转写模型进 Gemini API，流式延迟较 Chirp 3 改善约七成。',
    source: 'Google',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5-transcribe/',
  },
  {
    date: '2026-08-26',
    category: '后端',
    title: 'Vercel Python 项目支持路由规则',
    summary: 'FastAPI 等应用可在 CDN 层改写路径和响应头，发布后立即生效。',
    source: 'Vercel',
    url: 'https://vercel.com/changelog/python-projects-now-support-routing-rules',
  },
  {
    date: '2026-08-25',
    category: '前端',
    title: 'Next.js 紧急修补两处远程代码执行',
    summary: '16.3.3 与 15.5.24 修复 AVIF 与 Windows 路径穿越导致的未认证 RCE。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/august-2026-security-release',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'Claude 记忆跨 Chat 与 Cowork',
    summary: '聊天与 Cowork 共用可编辑主题记忆，敏感话题默认不写入。',
    source: 'Claude',
    url: 'https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it',
  },
  {
    date: '2026-08-25',
    category: 'AI',
    title: 'OpenAI 公布自研推理芯片首测',
    summary: 'Jalapeño 在公开推理基准上给出吞吐与延迟数据，走全栈算力路线。',
    source: 'OpenAI',
    url: 'https://openai.com/index/the-full-stack-behind-abundant-intelligence/',
  },
  {
    date: '2026-08-24',
    category: '后端',
    title: 'Vercel Sandbox 扩展到四区域',
    summary: '沙箱可在 iad1、sfo1、cle1、cdg1 启动，专业版可配置故障转移。',
    source: 'Vercel',
    url: 'https://vercel.com/changelog/vercel-sandbox-is-now-globally-available',
  },
  {
    date: '2026-08-21',
    category: 'AI',
    title: 'Mythos 5 进入 Claude 安全扫描',
    summary: 'Enterprise 可用 Mythos 5 扫代码提补丁，并向防御方扩大能力。',
    source: 'Claude',
    url: 'https://claude.com/blog/bringing-claude-mythos-5-to-more-defenders',
  },
  {
    date: '2026-08-20',
    category: 'AI',
    title: 'Claude 电脑使用与 Skills 正式发布',
    summary: '电脑使用、浏览器工具、Skills API 与 Files API 在平台全面可用。',
    source: 'Claude',
    url: 'https://claude.com/blog/computer-use-skills-api-files-api',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Bun 1.4 用 Rust 重写并加速',
    summary: '运行时改写为 Rust，并加入 WebView、并行测试和更完整的 Node 兼容。',
    source: 'Bun',
    url: 'https://bun.com/blog/bun-v1.4',
  },
  {
    date: '2026-08-20',
    time: '04:08',
    category: '前端',
    title: 'Vite 8.2.2 循环依赖也可热更新',
    summary: '补丁让 HMR 穿过循环导入，并修正 sourcemap 路径与 SSR 解构。',
    source: 'Vite',
    url: 'https://github.com/vitejs/vite/releases/tag/v8.2.2',
  },
  {
    date: '2026-08-20',
    category: '后端',
    title: 'Rust 1.98 稳定代数浮点运算',
    summary: '稳定 algebraic 浮点方法、整数 format_into，并明确 ManuallyDrop 语义。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/Rust-1.98.0/',
  },
  {
    date: '2026-08-20',
    time: '07:15',
    category: '后端',
    title: 'crates.io 清除 arrayref 供应链攻击',
    summary: '被劫持的 arrayref 0.3.10 依赖恶意包，官方已删除并恢复被 yank 版本。',
    source: 'Rust Blog',
    url: 'https://blog.rust-lang.org/2026/08/20/supply-chain-attack-on-arrayref/',
  },
  {
    date: '2026-08-19',
    category: '后端',
    title: 'Go 1.27 支持泛型方法与 JSON v2',
    summary: '语言加入泛型方法，标准库提供 encoding/json/v2 和协程泄漏分析。',
    source: 'Go Blog',
    url: 'https://go.dev/blog/go1.27',
  },
  {
    date: '2026-08-18',
    category: '前端',
    title: 'Next.js 16.3 讲解即时导航体验',
    summary: '官方示范 Cache Components 与 Partial Prefetching 做出类 SPA 导航。',
    source: 'Next.js',
    url: 'https://nextjs.org/blog/building-app-like-experiences-with-nextjs-16-3',
  },
  {
    date: '2026-08-18',
    category: '后端',
    title: 'Vercel 函数可托管签名 JWT',
    summary: 'KMS 用 OIDC 在函数内签发 JWT，私钥不进代码和环境变量。',
    source: 'Vercel',
    url: 'https://vercel.com/changelog/sign-jwts-from-your-functions-without-managing-private-keys',
  },
  {
    date: '2026-08-14',
    category: 'AI',
    title: 'Anthropic 说明 Claude 文本水印',
    summary: '官方解释 8 月 2 日后新模型输出如何嵌入可检测文本水印。',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/claude-text-watermark',
  },
  {
    date: '2026-08-14',
    category: '后端',
    title: 'Vercel CDN 支持加密 Client Hello',
    summary: '由 Vercel DNS 托管的域名可加密 SNI，观察者只看到共享主机名。',
    source: 'Vercel',
    url: 'https://vercel.com/changelog/encrypted-client-hello-now-supported-on-vercel-cdn',
  },
]

export function countNewsChars(value: string) {
  return [...value].length
}

export function isFreshNews(item: TechnologyNewsItem, now = new Date()) {
  const cutoff = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - NEWS_RETENTION_DAYS))
  return item.date >= cutoff.toISOString().slice(0, 10)
}

function compareNews(left: TechnologyNewsItem, right: TechnologyNewsItem) {
  const leftStamp = `${left.date}T${left.time ?? '00:00'}`
  const rightStamp = `${right.date}T${right.time ?? '00:00'}`
  if (leftStamp !== rightStamp) return leftStamp > rightStamp ? -1 : 1
  return left.url.localeCompare(right.url)
}

export function selectPublishedNews(items = TECHNOLOGY_NEWS, now = new Date()) {
  const seen = new Set<string>()
  return items
    .filter((item) => isFreshNews(item, now))
    .filter((item) => {
      if (seen.has(item.url)) return false
      seen.add(item.url)
      return true
    })
    .sort(compareNews)
}

export function groupNewsByDate(items: TechnologyNewsItem[], now = new Date()): NewsDayGroup[] {
  const groups = new Map<string, TechnologyNewsItem[]>()
  for (const item of selectPublishedNews(items, now)) {
    const day = groups.get(item.date) ?? []
    day.push(item)
    groups.set(item.date, day)
  }
  return [...groups.entries()].map(([date, dayItems]) => ({ date, items: dayItems }))
}

export function newsCopyErrors(items = TECHNOLOGY_NEWS) {
  return items.flatMap((item) => {
    const errors: string[] = []
    if (countNewsChars(item.title) > TITLE_MAX) errors.push(`${item.url}: title ${countNewsChars(item.title)} > ${TITLE_MAX}`)
    if (countNewsChars(item.summary) > SUMMARY_MAX) errors.push(`${item.url}: summary ${countNewsChars(item.summary)} > ${SUMMARY_MAX}`)
    return errors
  })
}
